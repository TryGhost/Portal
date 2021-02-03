import React from 'react';
import AppContext from '../../AppContext';
import {ReactComponent as CloseIcon} from '../../images/icons/close.svg';
import { withTranslation } from 'react-i18next';

export default withTranslation() (class CloseButton extends React.Component {
    static contextType = AppContext;

    render() {
        const { t } = this.props;
        return (
            <div className='gh-portal-closeicon-container'>
                <CloseIcon className='gh-portal-closeicon' alt={t(['close', 'Close'])} onClick = {() => this.context.onAction('closePopup')} />
            </div>
        );
    }
})
