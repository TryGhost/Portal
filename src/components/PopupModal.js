import Frame from './Frame';
import {hasMode} from '../utils/check-mode';
import AppContext from '../AppContext';
import FrameStyle from './Frame.styles';
import Pages, {getActivePage} from '../pages';
import PopupNotification from './common/PopupNotification';
import {isCookiesDisabled} from '../utils/helpers';
import {ReactComponent as PoweredIcon} from '../images/powered-icon.svg';
import { withTranslation } from 'react-i18next';

const React = require('react');

const StylesWrapper = ({member}) => {
    return {
        modalContainer: {
            zIndex: '3999999',
            position: 'fixed',
            left: '0',
            top: '0',
            width: '100%',
            height: '100%',
            overflow: 'hidden'
        },
        frame: {
            common: {
                margin: 'auto',
                position: 'relative',
                padding: '0',
                outline: '0',
                width: '100%',
                opacity: '1',
                overflow: 'hidden',
                height: '100%'
            }
        },
        page: {
            links: {
                width: '600px'
            }
        }
    };
};

function CookieDisabledBanner({message}) {
    const cookieDisabled = isCookiesDisabled();
    if (cookieDisabled) {
        return (
            <div className='gh-portal-cookiebanner'>{message}</div>
        );
    }
    return null;
}

class PopupContentWithoutTranslation extends  React.Component {
    static contextType = AppContext;

    componentDidMount() {
        // Handle Esc to close popup
        if (this.node && !hasMode(['preview'])) {
            this.node.focus();
            this.keyUphandler = (event) => {
                const eventTargetTag = (event.target && event.target.tagName);
                if (event.key === 'Escape' && eventTargetTag !== 'INPUT') {
                    this.context.onAction('closePopup');
                }
            };
            this.node.ownerDocument.removeEventListener('keyup', this.keyUphandler);
            this.node.ownerDocument.addEventListener('keyup', this.keyUphandler);
        }
    }

    componentWillUnmount() {
        if (this.node) {
            this.node.ownerDocument.removeEventListener('keyup', this.keyUphandler);
        }
    }

    handlePopupClose(e) {
        e.preventDefault();
        if (e.target === e.currentTarget) {
            this.context.onAction('closePopup');
        }
    }

    renderActivePage() {
        const {page} = this.context;
        getActivePage({page});
        const PageComponent = Pages[page];

        return (
            <PageComponent />
        );
    }

    renderPopupNotification() {
        const {popupNotification} = this.context;
        if (!popupNotification || !popupNotification.type) {
            return null;
        }
        return (
            <PopupNotification />
        );
    }

    render() {
        const { t } = this.props;
        const {page, site} = this.context;
        const {portal_plans: portalPlans} = site;
        const {is_stripe_configured: isStripeConfigured,
            allow_self_signup: allowSelfSignup} = site;

        getActivePage({page});
        const Styles = StylesWrapper({page});
        const pageStyle = {
            ...Styles.page[page]
        };
        let popupWidthStyle = '';
        if (page === 'signup' || page === 'signin') {
            if (allowSelfSignup && portalPlans.length === 3 && (page === 'signup' || page === 'signin')) {
                popupWidthStyle = 'gh-portal-container-wide';
            }
            if (portalPlans.length <= 1 || (!allowSelfSignup && portalPlans.length > 1 && portalPlans.indexOf('free') !== -1) || !isStripeConfigured) {
                popupWidthStyle = 'gh-portal-container-narrow';
            }
        }
        let cookieBannerText = '';
        let pageClass = page;
        switch (page) {
        case 'signup':
            // cookieBannerText = 'Cookies must be enabled in your browser to sign up.';
            cookieBannerText = t(['popupmodal.signup_cookie_banner_text', 'Cookies must be enabled in your browser to sign up.']);
            break;
        case 'signin':
            // cookieBannerText = 'Cookies must be enabled in your browser to sign in.';
            cookieBannerText = t(['popupmodal.signin_cookie_banner_text', 'Cookies must be enabled in your browser to sign in.']);
            break;
        case 'accountHome':
            pageClass = 'account-home';
            break;
        case 'accountProfile':
            pageClass = 'account-profile';
            break;
        case 'accountPlan':
            pageClass = 'account-plan';
            break;
        default:
            // cookieBannerText = 'Cookies must be enabled in your browser.';
            cookieBannerText = t(['popupmodal.default_cookie_banner_text', 'Cookies must be enabled in your browser.']);
            pageClass = page;
            break;
        }

        return (
            <div className={'gh-portal-popup-wrapper ' + pageClass} onClick={e => this.handlePopupClose(e)}>
                <div className={(hasMode(['preview', 'dev']) ? 'gh-portal-popup-container preview' : 'gh-portal-popup-container') + ' ' + popupWidthStyle + ' ' + pageClass} style={pageStyle} ref={node => (this.node = node)} tabIndex="-1">
                    <CookieDisabledBanner message={cookieBannerText} />
                    {this.renderPopupNotification()}
                    {this.renderActivePage()}
                </div>
                <div className={'gh-portal-powered' + (hasMode(['preview']) ? ' hidden' : '')}>
                    <a href='https://ghost.org' target='_blank' rel='noopener noreferrer' onClick={() => {
                        window.open('https://ghost.org', '_blank');
                    }}>
                        <PoweredIcon /> <span>Publish with Ghost</span>
                    </a>
                </div>
            </div>
        );
    }
}
const PopupContent = withTranslation()(PopupContentWithoutTranslation);

export default class PopupModal extends React.Component {
    static contextType = AppContext;

    constructor(props) {
        super(props);
        this.state = {
            height: null
        };
    }

    renderCurrentPage(page) {
        const PageComponent = Pages[page];

        return (
            <PageComponent />
        );
    }

    onHeightChange(height) {
        this.setState({height});
    }

    handlePopupClose(e) {
        e.preventDefault();
        if (e.target === e.currentTarget) {
            this.context.onAction('closePopup');
        }
    }

    renderFrameStyles() {
        const styles = `
            :root {
                --brandcolor: ${this.context.brandColor}
            }
        ` + FrameStyle;
        return (
            <style dangerouslySetInnerHTML={{__html: styles}} />
        );
    }

    renderFrameContainer() {
        const {member} = this.context;
        const Styles = StylesWrapper({member});
        const frameStyle = {
            ...Styles.frame.common
        };
        if (hasMode(['preview'])) {
            Styles.modalContainer.zIndex = '3999997';
        }
        return (
            <div style={Styles.modalContainer}>
                <Frame style={frameStyle} title="membersjs-popup" head={this.renderFrameStyles()}>
                    <div className={hasMode(['preview', 'dev']) ? 'gh-portal-popup-background preview' : 'gh-portal-popup-background'} onClick = {e => this.handlePopupClose(e)}></div>
                    <PopupContent />
                </Frame>
            </div>
        );
    }

    render() {
        const {showPopup} = this.context;
        if (showPopup) {
            return this.renderFrameContainer();
        }
        return null;
    }
}
