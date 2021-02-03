import Frame from './Frame';
import AppContext from '../AppContext';
import NotificationStyle from './Notification.styles';
import {ReactComponent as CloseIcon} from '../images/icons/close.svg';
import {ReactComponent as CheckmarkIcon} from '../images/icons/checkmark-fill.svg';
import {ReactComponent as WarningIcon} from '../images/icons/warning-fill.svg';
import NotificationParser, {clearURLParams} from '../utils/notifications';
import {getPortalLink} from '../utils/helpers';
import { useTranslation } from 'react-i18next';

const React = require('react');

const Styles = () => {
    return {
        frame: {
            zIndex: '4000000',
            position: 'fixed',
            top: '0',
            right: '0',
            maxWidth: '415px',
            width: '100%',
            height: '120px',
            animation: '250ms ease 0s 1 normal none running animation-bhegco',
            transition: 'opacity 0.3s ease 0s',
            overflow: 'hidden'
        }
    };
};

const NotificationText = ({type, status, context}) => {
    const { t } = useTranslation();
    const signinPortalLink = getPortalLink({page: 'signin', siteUrl: context.site.url});
    const singupPortalLink = getPortalLink({page: 'signup', siteUrl: context.site.url});

    if (type === 'signin' && status === 'success' && context.member) {
        const firstname = context.member.firstname || '';
        return (
            <p>
                {t(['notification.signin_success_1','Welcome back'])}{(firstname ? ', ' + firstname : '')}!<br />{t(['notification.signin_success_2','You\'ve successfully signed in.'])}
            </p>
        );
    } else if (type === 'signin' && status === 'error') {
        return (
            <p>
                {t(['notification.signin_error','Could not sign in. Login link expired.'])} <a href={signinPortalLink} target="_parent">{t(['notification.click_to_retry','Click here to retry'])}</a>
            </p>
        );
    } else if (type === 'signup' && status === 'success') {
        return (
            <p>
                {t(['notification.signup_success','You\'ve successfully subscribed to'])} <br /><strong>{context.site.title}</strong>
            </p>
        );
    } else if (type === 'updateEmail' && status === 'success') {
        return (
            <p>
                {t(['notification.updateemail_success','Success! Your email is updated.'])}
            </p>
        );
    } else if (type === 'updateEmail' && status === 'error') {
        return (
            <p>
                {t(['notification.updateemail_error','Could not update email! Invalid link.'])}
            </p>
        );
    } else if (type === 'signup' && status === 'error') {
        return (
            <p>
                {t(['notification.signup_error','Signup error: Invalid link'])} <br /><a href={singupPortalLink} target="_parent">{t(['notification.click_to_retry','Click here to retry'])}</a>
            </p>
        );
    } else if (type === 'stripe:checkout' && status === 'success') {
        if (context.member) {
            return (
                <p>
                    {t(['notification.stripe_checkout_success_member','Success! Your account is fully activated, you now have access to all content.'])}
                </p>
            );
        }
        return (
            <p>
                {t(['notification.stripe_checkout_success','Success! Check your email for magic link to sign-in.'])}
            </p>
        );
    } else if (type === 'stripe:checkout' && status === 'warning') {
        // Stripe checkout flow was cancelled
        if (context.member) {
            return (
                <p>
                    {t(['notification.stripe_checkout_warning_member','Plan upgrade was cancelled.'])}
                </p>
            );
        }
        return (
            <p>
                {t(['notification.stripe_checkout_warning','Plan checkout was cancelled.'])}
            </p>
        );
    }
    return (
        <p>
            {status === 'success' ? 'Success' : 'Error'}
        </p>
    );
};

class NotificationContent extends React.Component {
    static contextType = AppContext;

    constructor() {
        super();
        this.state = {
            className: ''
        };
    }

    componentWillUnmount() {
        clearTimeout(this.timeoutId);
    }

    onNotificationClose() {
        this.props.onHideNotification();
    }

    componentDidUpdate() {
        const {showPopup} = this.context;
        if (!this.state.className && showPopup) {
            this.setState({
                className: 'slideout'
            });
        }
    }

    componentDidMount() {
        const {autoHide, duration = 2400} = this.props;
        const {showPopup} = this.context;
        if (showPopup) {
            this.setState({
                className: 'slideout'
            });
        } else if (autoHide) {
            this.timeoutId = setTimeout(() => {
                this.setState({
                    className: 'slideout'
                });
            }, duration);
        }
    }

    onAnimationEnd(e) {
        if (e.animationName === 'notification-slideout' || e.animationName === 'notification-slideout-mobile') {
            this.props.onHideNotification(e);
        }
    }

    render() {
        const {type, status} = this.props;
        const {className = ''} = this.state;
        const statusClass = status ? `  ${status}` : ' neutral';
        const slideClass = className ? ` ${className}` : '';
        return (
            <div className='gh-portal-notification-wrapper'>
                <div className={`gh-portal-notification${statusClass}${slideClass}`} onAnimationEnd={e => this.onAnimationEnd(e)}>
                    {(status === 'error' ? <WarningIcon className='gh-portal-notification-icon error' alt=''/> : <CheckmarkIcon className='gh-portal-notification-icon success' alt=''/>)}
                    <NotificationText type={type} status={status} context={this.context} />
                    <CloseIcon className='gh-portal-notification-closeicon' alt='Close' onClick={e => this.onNotificationClose(e)} />
                </div>
            </div>
        );
    }
}

export default class Notification extends React.Component {
    static contextType = AppContext;

    constructor() {
        super();
        const {type, status, autoHide, duration} = NotificationParser() || {};
        this.state = {
            active: true,
            type,
            status,
            autoHide,
            duration,
            className: ''
        };
    }

    onHideNotification() {
        const type = this.state.type;
        const deleteParams = [];
        if (['signin', 'signup'].includes(type)) {
            deleteParams.push('portal-action', 'success');
        } else if (['stripe:checkout'].includes(type)) {
            deleteParams.push('stripe');
        }
        clearURLParams(deleteParams);
        this.setState({
            active: false
        });
    }

    renderFrameStyles() {
        const styles = `
            :root {
                --brandcolor: ${this.context.brandColor}
            }
        ` + NotificationStyle;
        return (
            <style dangerouslySetInnerHTML={{__html: styles}} />
        );
    }

    render() {
        const Style = Styles({brandColor: this.context.brandColor});
        const frameStyle = {
            ...Style.frame
        };
        if (!this.state.active) {
            return null;
        }
        const {type, status, autoHide, duration} = this.state;
        if (type && status) {
            return (
                <Frame style={frameStyle} title="membersjs-notification" head={this.renderFrameStyles()}>
                    <NotificationContent {...{type, status, autoHide, duration}} onHideNotification={e => this.onHideNotification(e)} />
                </Frame>
            );
        }
        return null;
    }
}
