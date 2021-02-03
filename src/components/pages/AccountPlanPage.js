import {useState} from 'react';
import AppContext from '../../AppContext';
import ActionButton from '../common/ActionButton';
import CloseButton from '../common/CloseButton';
import BackButton from '../common/BackButton';
import PlansSection from '../common/PlansSection';
import {getDateString} from '../../utils/date-time';
import {getMemberActivePlan, getMemberSubscription, getPlanFromSubscription, getSitePlans, getSubscriptionFromId, isPaidMember} from '../../utils/helpers';
import { useTranslation } from 'react-i18next';

export const AccountPlanPageStyles = `
    .gh-portal-accountplans-main {
        margin-top: 24px;
        margin-bottom: 0;
    }

    .gh-portal-expire-container {
        margin: 24px 0 0;
    }

    .gh-portal-cancellation-form p {
        margin-bottom: 12px;
    }

    .gh-portal-cancellation-form .gh-portal-input-section {
        margin-bottom: 20px;
    }

    .gh-portal-cancellation-form .gh-portal-input {
        resize: none;
        width: 100%;
        height: 62px;
        padding: 6px 12px;
    }
`;

const React = require('react');

function getConfirmationPageTitle({confirmationType}) {
    //const { t } = useTranslation();
    if (confirmationType === 'changePlan') {
        return 'Confirm subscription';
        // return t(['confirm_subscription', 'Confirm subscription']);
    } else if (confirmationType === 'cancel') {
        return 'Cancel subscription';
        // return t(['cancel_subscription', 'Cancel subscription']);
    } else if (confirmationType === 'subscribe') {
        return 'Subscribe';
        // return t(['subscribe', 'Subscribe']);
    }
}

const Header = ({member, lastPage, brandColor, onBack, showConfirmation, confirmationType}) => {
    const { t } = useTranslation();
    let title = isPaidMember({member}) ? t(['plan.change', 'Change plan']) : t(['plan.choose', 'Choose a plan']);
    if (showConfirmation) {
        title = getConfirmationPageTitle({confirmationType});
    }
    return (
        <header className='gh-portal-detail-header'>
            <BackButton brandColor={brandColor} onClick={e => onBack(e)} hidden={!lastPage && !showConfirmation} />
            <h3 className='gh-portal-main-title'>{title}</h3>
        </header>
    );
};

const CancelContinueSubscription = ({member, onCancelContinueSubscription, action, brandColor, showOnlyContinue = false}) => {
    const { t } = useTranslation();
    if (!member.paid) {
        return null;
    }
    const subscription = getMemberSubscription({member});
    if (!subscription) {
        return null;
    }

    // To show only continue button and not cancellation
    if (showOnlyContinue && !subscription.cancel_at_period_end) {
        return null;
    }

    // Hide the button if subscription is due cancellation
    if (subscription.cancel_at_period_end) {
        return null;
    }
    const label = subscription.cancel_at_period_end ? t(['continue_subscription', 'Continue subscription']) : t(['cancel_subscription', 'Cancel subscription']);
    const isRunning = ['cancelSubscription:running'].includes(action);
    const disabled = (isRunning) ? true : false;
    const isPrimary = !!subscription.cancel_at_period_end;
    const isDestructive = !subscription.cancelAtPeriodEnd;

    const CancelNotice = () => {
        if (!subscription.cancel_at_period_end) {
            return null;
        }
        const currentPeriodEnd = subscription.current_period_end;
        return (
            <p className="gh-portal-expire-warning">
                {t(['subscription_expire', 'Your subscription will expire on'])} {getDateString(currentPeriodEnd)}.
            </p>
        );
    };

    return (
        <div className="gh-portal-expire-container">
            <CancelNotice />
            <ActionButton
                onClick={(e) => {
                    onCancelContinueSubscription({
                        subscriptionId: subscription.id,
                        cancelAtPeriodEnd: !subscription.cancel_at_period_end
                    });
                }}
                isRunning={isRunning}
                disabled={disabled}
                isPrimary={isPrimary}
                isDestructive={isDestructive}
                brandColor={brandColor}
                label={label}
                style={{
                    width: '100%'
                }}
            />
        </div>
    );
};

// For confirmation flows
const PlanConfirmationSection = ({action, member, plan, type, brandColor, onConfirm}) => {
    const { t } = useTranslation();
    const [reason, setReason] = useState('');
    const subscription = getMemberSubscription({member});
    const isRunning = ['updateSubscription:running', 'checkoutPlan:running', 'cancelSubscription:running'].includes(action);
    const label = t(['confirm','Confirm']);
    let planStartDate = getDateString(subscription.current_period_end);
    const currentActivePlan = getMemberActivePlan({member});
    if (currentActivePlan.type !== plan.type) {
        planStartDate = 'today';
    }
    const planStartMessage = `${plan.currency}${plan.price}/${plan.type} – Starting ${planStartDate}`;
    if (type === 'changePlan') {
        return (
            <>
                <div className='gh-portal-list outline mb6'>
                    <section>
                        <div className='gh-portal-list-detail'>
                            <h3>{t(['account','Account'])}</h3>
                            <p>{member.email}</p>
                        </div>
                    </section>
                    <section>
                        <div className='gh-portal-list-detail'>
                            <h3>{t(['price','Price'])}</h3>
                            <p>{planStartMessage}</p>
                        </div>
                    </section>
                </div>
                <ActionButton
                    onClick={e => onConfirm(e, plan)}
                    isRunning={isRunning}
                    isPrimary={true}
                    brandColor={brandColor}
                    label={label}
                    style={{
                        width: '100%',
                        height: '40px'
                    }}
                />
            </>
        );
    } else {
        return (
            <div className="gh-portal-cancellation-form">
                <p>{t(['planconfirmationsection.if_you_cancel', 'If you cancel your subscription now, you will continue to have access until'])} <strong>{getDateString(subscription.current_period_end)}</strong>.</p>
                <section className='gh-portal-input-section'>
                    <div className='gh-portal-input-labelcontainer'>
                        <label className='gh-portal-input-label'>{t(['planconfirmationsection.cancellation_reason', 'Cancellation reason'])}</label>
                    </div>
                    <textarea
                        className='gh-portal-input'
                        key='cancellation_reason'
                        label={t(['planconfirmationsection.cancellation_reason', 'Cancellation reason'])}
                        type='text'
                        name='cancellation_reason'
                        placeholder=''
                        value={reason}
                        onChange={e => setReason(e.target.value)}
                        rows="2"
                        maxlength="500"
                    />
                </section>
                <ActionButton
                    onClick={e => onConfirm(e, reason)}
                    isRunning={isRunning}
                    isPrimary={true}
                    brandColor={brandColor}
                    label={label + ' cancellation'}
                    style={{
                        width: '100%',
                        height: '40px'
                    }}
                />
            </div>
        );
    }
};

// For paid members
const ChangePlanSection = ({plans, selectedPlan, member, action, brandColor, onPlanSelect, onCancelContinueSubscription}) => {
    return (
        <section>
            <div className='gh-portal-section gh-portal-accountplans-main'>
                <PlansSection
                    showLabel={false}
                    plans={plans}
                    selectedPlan={selectedPlan}
                    onPlanSelect={(e, name) => onPlanSelect(e, name)}
                    changePlan={true}
                />
            </div>
            <CancelContinueSubscription {...{member, onCancelContinueSubscription, action, brandColor}} />
        </section>
    );
};

// For free members
const UpgradePlanSection = ({
    plans, selectedPlan, action, brandColor, onPlanSelect, onPlanCheckout
}) => {
    const { t } = useTranslation();
    const isRunning = ['checkoutPlan:running'].includes(action);
    let singlePlanClass = '';
    if (plans.length === 1) {
        singlePlanClass = 'singleplan';
    }
    return (
        <section>
            <div className={`gh-portal-section gh-portal-accountplans-main ${singlePlanClass}`}>
                <PlansSection
                    showLabel={false}
                    plans={plans}
                    selectedPlan={selectedPlan}
                    onPlanSelect={(e, name) => onPlanSelect(e, name)}
                />
            </div>
            <ActionButton
                onClick={e => onPlanCheckout(e)}
                isRunning={isRunning}
                isPrimary={true}
                brandColor={brandColor}
                label={t(['continue', 'Continue'])}
                style={{height: '40px', width: '100%', marginTop: '24px'}}
            />
        </section>
    );
};

const PlansContainer = ({
    plans, selectedPlan, confirmationPlan, confirmationType,
    member, onAction, action, brandColor,showConfirmation = false,
    onPlanSelect, onPlanCheckout, onConfirm, onCancelContinueSubscription
}) => {
    // Plan upgrade flow for free member
    if (!isPaidMember({member})) {
        return (
            <UpgradePlanSection
                {...{plans, selectedPlan, member, onAction, action, brandColor, onPlanSelect, onPlanCheckout}}
            />
        );
    }

    // Plan change flow for a paid member
    if (!showConfirmation) {
        return (
            <ChangePlanSection
                {...{plans, selectedPlan, member, action, brandColor,
                    onCancelContinueSubscription, onPlanSelect}}
            />
        );
    }

    // Plan confirmation flow for cancel/update flows
    return (
        <PlanConfirmationSection
            {...{action, member, plan: confirmationPlan, type: confirmationType, onConfirm, brandColor}}
        />
    );
};
export default class AccountPlanPage extends React.Component {
    static contextType = AppContext;

    constructor(props, context) {
        super(props, context);
        this.state = this.getInitialState();
    }

    componentDidMount() {
        const {member} = this.context;
        if (!member) {
            this.context.onAction('switchPage', {
                page: 'signup'
            });
        }
    }

    componentWillUnmount() {
        clearTimeout(this.timeoutId);
    }

    getInitialState() {
        const {member, site} = this.context;
        this.plans = getSitePlans({site, includeFree: false});
        let activePlan = getMemberActivePlan({member});
        let selectedPlan = activePlan ? this.plans.find((d) => {
            return (d.name === activePlan.name && d.price === activePlan.price && d.currency === activePlan.currency);
        }) : null;
        // Select first plan as default for free member
        if (!isPaidMember({member}) && this.plans.length > 0) {
            selectedPlan = this.plans[0];
        }
        const selectedPlanName = selectedPlan ? selectedPlan.name : null;
        return {
            selectedPlan: selectedPlanName
        };
    }

    handleSignout(e) {
        e.preventDefault();
        this.context.onAction('signout');
    }

    onBack(e) {
        if (this.state.showConfirmation) {
            this.cancelConfirmPage();
        } else {
            this.context.onAction('back');
        }
    }

    cancelConfirmPage() {
        this.setState({
            showConfirmation: false,
            confirmationPlan: null,
            confirmationType: null
        });
    }

    onPlanCheckout(e, name) {
        const {onAction, member} = this.context;
        const {confirmationPlan, selectedPlan} = this.state;
        if (isPaidMember({member})) {
            const subscription = getMemberSubscription({member});
            const subscriptionId = subscription ? subscription.id : '';
            if (subscriptionId) {
                onAction('updateSubscription', {plan: confirmationPlan.name, subscriptionId, cancelAtPeriodEnd: false});
            }
        } else {
            onAction('checkoutPlan', {plan: selectedPlan});
        }
    }

    onPlanSelect(e, name) {
        e.preventDefault();

        const {member} = this.context;

        // Work as checkboxes for free member plan selection and button for paid members
        if (!isPaidMember({member})) {
            // Hack: React checkbox gets out of sync with dom state with instant update
            this.timeoutId = setTimeout(() => {
                this.setState((state) => {
                    return {
                        selectedPlan: name
                    };
                });
            }, 5);
        } else {
            const confirmationPlan = this.plans.find(d => d.name === name);
            const activePlan = this.getActivePlanName({member});
            const confirmationType = activePlan ? 'changePlan' : 'subscribe';
            if (name !== this.state.selectedPlan) {
                this.setState({
                    confirmationPlan,
                    confirmationType,
                    showConfirmation: true
                });
            }
        }
    }

    onCancelContinueSubscription({subscriptionId, cancelAtPeriodEnd}) {
        const {member} = this.context;
        const subscription = getSubscriptionFromId({subscriptionId, member});
        const subscriptionPlan = getPlanFromSubscription({subscription});
        if (!cancelAtPeriodEnd) {
            this.context.onAction('cancelSubscription', {
                subscriptionId,
                cancelAtPeriodEnd
            });
        } else {
            this.setState({
                showConfirmation: true,
                confirmationPlan: subscriptionPlan,
                confirmationType: 'cancel'
            });
        }
    }

    onCancelSubscriptionConfirmation(reason) {
        const {member} = this.context;
        const subscription = getMemberSubscription({member});
        if (!subscription) {
            return null;
        }
        this.context.onAction('cancelSubscription', {
            subscriptionId: subscription.id,
            cancelAtPeriodEnd: true,
            cancellationReason: reason
        });
    }

    getActivePlanName({member}) {
        const activePlan = getMemberActivePlan({member});
        if (activePlan) {
            return activePlan.name;
        }
        return null;
    }

    onConfirm(e, data) {
        const {confirmationType} = this.state;
        if (confirmationType === 'cancel') {
            return this.onCancelSubscriptionConfirmation(data);
        } else if (['changePlan', 'subscribe'].includes(confirmationType)) {
            return this.onPlanCheckout(data);
        }
    }

    render() {
        const {member, brandColor, lastPage} = this.context;
        const plans = this.plans;
        const {selectedPlan, showConfirmation, confirmationPlan, confirmationType} = this.state;
        return (
            <>
                <div className='gh-portal-content'>
                    <CloseButton />
                    <Header
                        lastPage={lastPage}
                        member={member} brandColor={brandColor} onBack={e => this.onBack(e)}
                        confirmationType={confirmationType}
                        showConfirmation={showConfirmation}
                    />
                    <PlansContainer
                        {...this.context}
                        {...{plans, selectedPlan, showConfirmation, confirmationPlan, confirmationType}}
                        onConfirm={(...args) => this.onConfirm(...args)}
                        onCancelContinueSubscription = {data => this.onCancelContinueSubscription(data)}
                        onPlanSelect = {(e, name) => this.onPlanSelect(e, name)}
                        onPlanCheckout = {(e, name) => this.onPlanCheckout(e, name)}
                    />
                </div>
            </>
        );
    }
}
