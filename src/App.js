import TriggerButton from './components/TriggerButton';
import PopupModal from './components/PopupModal';
import setupGhostApi from './utils/api';
import AppContext from './AppContext';
import * as Fixtures from './utils/fixtures';
import './App.css';

const React = require('react');

export default class App extends React.Component {
    constructor(props) {
        super(props);
        // Setup custom trigger button handling
        this.setupCustomTriggerButton();

        // testState is used by App.test to pass custom default state for testing
        this.state = props.testState || {
            site: null,
            member: null,
            page: 'loading',
            showPopup: false,
            action: 'init:running',
            initStatus: 'running',
            lastPage: null
        };
    }

    componentDidMount() {
        this.initSetup();
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.showPopup !== this.state.showPopup) {
            this.handleCustomTriggerClassUpdate();
        }
    }

    componentWillUnmount() {
        this.customTriggerButtons.forEach((customTriggerButton) => {
            customTriggerButton.addEventListener('click', this.clickHandler);
        });
    }

    handleCustomTriggerClassUpdate() {
        const popupOpenClass = 'gh-members-popup-open';
        const popupCloseClass = 'gh-members-popup-close';
        this.customTriggerButtons.forEach((customButton) => {
            const elAddClass = this.state.showPopup ? popupOpenClass : popupCloseClass;
            const elRemoveClass = this.state.showPopup ? popupCloseClass : popupOpenClass;
            customButton.classList.add(elAddClass);
            customButton.classList.remove(elRemoveClass);
        });
    }

    getStripeUrlParam() {
        const url = new URL(window.location);
        return url.searchParams.get('stripe');
    }

    getDefaultPage({member = this.state.member, stripeParam} = {}) {
        // Loads default page and popup state for local UI testing
        if (process.env.NODE_ENV === 'development') {
            return {
                page: 'signup',
                showPopup: true
            };
        }
        if (!member && stripeParam === 'success') {
            return {page: 'magiclink', showPopup: true};
        }
        if (member) {
            return {
                page: 'accountHome'
            };
        }
        return {
            page: 'signup'
        };
    }

    updateStateForPreview() {
        const {site: previewSite, ...restPreview} = this.getPreviewState();
        this.setState({
            site: {
                ...this.state.site,
                ...(previewSite || {})
            },
            ...restPreview
        });
    }

    isPreviewMode() {
        const [path, qs] = window.location.hash.substr(1).split('?');
        return (path === '/portal' && qs);
    }

    getPreviewState() {
        const [path, qs] = window.location.hash.substr(1).split('?');
        if (path === '/portal' && qs) {
            const previewSettings = {
                site: {}
            };
            const allowedPlans = [];
            const qsParams = new URLSearchParams(qs);
            // Display the key/value pairs
            for (let pair of qsParams.entries()) {
                const key = pair[0];
                const value = pair[1];
                if (key === 'button') {
                    previewSettings.site.portal_button = JSON.parse(value);
                } else if (key === 'name') {
                    previewSettings.site.portal_name = JSON.parse(value);
                } else if (key === 'isFree' && JSON.parse(value)) {
                    allowedPlans.push('free');
                } else if (key === 'isMonthly' && JSON.parse(value)) {
                    allowedPlans.push('monthly');
                } else if (key === 'isYearly' && JSON.parse(value)) {
                    allowedPlans.push('yearly');
                } else if (key === 'page') {
                    previewSettings.page = value;
                }
            }
            previewSettings.site.portal_plans = allowedPlans;
            previewSettings.showPopup = true;
            return previewSettings;
        }
        return {};
    }

    async initSetup() {
        const {site, member} = await this.fetchData() || {};
        if (!site) {
            this.setState({
                action: 'init:failed',
                initStatus: 'failed'
            });
        } else {
            const stripeParam = this.getStripeUrlParam();
            const {page, showPopup = false} = this.getDefaultPage({member, stripeParam});
            const {site: previewSite, ...restPreview} = this.getPreviewState();
            const initState = {
                site: {
                    ...site,
                    ...(previewSite || {})
                },
                member: member || (this.isPreviewMode() ? Fixtures.member.free : null),
                page,
                showPopup,
                action: 'init:success',
                initStatus: 'success',
                ...restPreview
            };
            this.setState(initState);
            this.hashHandler = () => {
                this.updateStateForPreview();
            };
            window.addEventListener('hashchange', this.hashHandler, false);
        }
    }

    // Fetch site and member session data with Ghost Apis
    async fetchData() {
        const {siteUrl} = this.props;
        try {
            this.GhostApi = setupGhostApi({siteUrl});
            const {site, member} = await this.GhostApi.init();
            return {site, member};
        } catch (e) {
            /* eslint-disable no-console */
            console.error(`[Members.js] Failed to initialize`);
            /* eslint-enable no-console */
            return null;
        }
    }

    setupCustomTriggerButton() {
        // Handler for custom buttons
        this.clickHandler = (event) => {
            const target = event.currentTarget;
            const {page: defaultPage} = this.getDefaultPage();
            const page = (target && target.dataset.membersTriggerButton) || defaultPage;

            event.preventDefault();
            this.onAction('openPopup', {page});
        };
        const customTriggerSelector = '[data-members-trigger-button]';
        const popupCloseClass = 'gh-members-popup-close';
        this.customTriggerButtons = document.querySelectorAll(customTriggerSelector) || [];
        this.customTriggerButtons.forEach((customTriggerButton) => {
            customTriggerButton.classList.add(popupCloseClass);
            customTriggerButton.addEventListener('click', this.clickHandler);
        });
    }

    getActionData(action) {
        const [type, status, reason] = action.split(':');
        return {type, status, reason};
    }

    getBrandColor() {
        return (this.state.site && this.state.site.brand && this.state.site.brand.primaryColor) || '#3db0ef';
    }

    async onAction(action, data) {
        this.setState({
            action: `${action}:running`
        });
        try {
            if (action === 'switchPage') {
                this.setState({
                    page: data.page,
                    lastPage: data.lastPage || null
                });
            } else if (action === 'togglePopup') {
                this.setState({
                    showPopup: !this.state.showPopup
                });
            } else if (action === 'openPopup') {
                this.setState({
                    showPopup: true,
                    page: data.page
                });
            } else if (action === 'back') {
                if (this.state.lastPage) {
                    this.setState({
                        page: this.state.lastPage
                    });
                }
            } else if (action === 'closePopup') {
                const {page: defaultPage} = this.getDefaultPage();
                this.setState({
                    showPopup: false,
                    page: this.state.page === 'magiclink' ? defaultPage : this.state.page
                });
            } else if (action === 'signout') {
                await this.GhostApi.member.signout();
                this.setState({
                    action: 'signout:success'
                });
            } else if (action === 'signin') {
                await this.GhostApi.member.sendMagicLink(data);
                this.setState({
                    action: 'signin:success',
                    page: 'magiclink'
                });
            } else if (action === 'signup') {
                const {plan, email, name} = data;
                if (plan.toLowerCase() === 'free') {
                    await this.GhostApi.member.sendMagicLink(data);
                } else {
                    await this.GhostApi.member.checkoutPlan({plan, email, name});
                }
                this.setState({
                    action: 'signup:success',
                    page: 'magiclink'
                });
            } else if (action === 'updateEmail') {
                await this.GhostApi.member.sendMagicLink(data);
                this.setState({
                    action: 'updateEmail:success'
                });
            } else if (action === 'checkoutPlan') {
                const {plan} = data;
                await this.GhostApi.member.checkoutPlan({
                    plan
                });
            } else if (action === 'updateSubscription') {
                const {plan, subscriptionId, cancelAtPeriodEnd} = data;
                await this.GhostApi.member.updateSubscription({
                    planName: plan, subscriptionId, cancelAtPeriodEnd
                });
                const member = await this.GhostApi.member.sessionData();
                this.setState({
                    action: 'updateSubscription:success',
                    page: 'accountHome',
                    member: member
                });
            } else if (action === 'editBilling') {
                await this.GhostApi.member.editBilling();
            } else if (action === 'updateMember') {
                const {name, subscribed} = data;
                const member = await this.GhostApi.member.update({name, subscribed});
                if (!member) {
                    this.setState({
                        action: 'updateMember:failed'
                    });
                } else {
                    this.setState({
                        action: 'updateMember:success',
                        member: member
                    });
                }
            }
            setTimeout(() => {
                this.setState({
                    action: ''
                });
            }, 5000);
        } catch (e) {
            this.setState({
                action: `${action}:failed`
            });
        }
    }

    renderPopup() {
        if (this.state.showPopup) {
            return (
                <PopupModal />
            );
        }
        return null;
    }

    renderTriggerButton() {
        const {portal_button: portalButton} = this.state.site;
        if (portalButton === undefined || portalButton) {
            return (
                <TriggerButton
                    isPopupOpen={this.state.showPopup}
                />
            );
        }

        return null;
    }

    render() {
        if (this.state.initStatus === 'success') {
            const {site, member, action, page, lastPage} = this.state;

            return (
                <AppContext.Provider value={{
                    site,
                    member,
                    action,
                    brandColor: this.getBrandColor(),
                    page,
                    lastPage,
                    onAction: (_action, data) => this.onAction(_action, data)
                }}>
                    {this.renderPopup()}
                    {this.renderTriggerButton()}
                </AppContext.Provider>
            );
        }
        return null;
    }
}
