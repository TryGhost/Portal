import ActionButton from '../common/ActionButton';
import CloseButton from '../common/CloseButton';
import AppContext from '../../AppContext';
import {ReactComponent as EnvelopeIcon} from '../../images/icons/envelope.svg';
import { withTranslation } from 'react-i18next';

const React = require('react');

export const MagicLinkStyles = `
    .gh-portal-icon-envelope {
        width: 44px;
        margin: 0 0 2px;
    }

    .gh-portal-inbox-notification {
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .gh-portal-inbox-notification p {
        text-align: center;
        margin-bottom: 30px;
    }
`;

export default withTranslation() (class MagicLinkPage extends React.Component {
    static contextType = AppContext;

    renderFormHeader() {
        const { t } = this.props;
        return (
            <section className='gh-portal-inbox-notification'>
                <header className='gh-portal-header'>
                    <EnvelopeIcon className='gh-portal-icon gh-portal-icon-envelope' />
                    <h2>{t(['magiclinkpage.renderformheader_1', 'We\'ve sent you a login link!'])}</h2>
                </header>
                <p>{t(['magiclinkpage.renderformheader_2', 'If the email doesn\'t arrive in 3 minutes, be sure to check your spam folder!'])}</p>
            </section>
        );
    }

    renderLoginMessage() {
        const { t } = this.props;
        return (
            <>
                <div
                    style={{color: '#1d1d1d', fontWeight: 'bold', cursor: 'pointer'}}
                    onClick={() => this.context.onAction('switchPage', {page: 'signin'})}
                >
                    {t(['magiclinkpage.back_to_login', 'Back to Log in'])}
                </div>
            </>
        );
    }

    handleClose(e) {
        this.context.onAction('closePopup');
    }

    renderCloseButton() {
        const label = 'Close';
        return (
            <ActionButton
                style={{width: '100%'}}
                onClick={e => this.handleClose(e)}
                brandColor={this.context.brandColor}
                label={label}
            />
        );
    }

    render() {
        return (
            <div className='gh-portal-content'>
                <CloseButton />
                {this.renderFormHeader()}
                {this.renderCloseButton()}
            </div>
        );
    }
})
