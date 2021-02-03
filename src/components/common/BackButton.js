import React from 'react';
import {ReactComponent as LeftArrowIcon} from '../../images/icons/arrow-left.svg';
import { useTranslation } from 'react-i18next';

export const BackButtonStyles = `
    .gh-portal-btn-back,
    .gh-portal-btn-back:hover {
        box-shadow: none;
        position: relative;
        height: unset;
        min-width: unset;
        position: absolute;
        top: -3px;
        left: -16px;
        background: none;
        padding: 8px;
        margin: 0;
        box-shadow: none;
        color: var(--grey3);
        border: none;
    }

    .gh-portal-btn-back:hover {
        color: var(--grey1);
        transform: translateX(-4px);
    }

    .gh-portal-btn-back svg {
        width: 17px;
        height: 17px;
        margin-top: 1px;
        margin-right: 2px;
    }
`;

function ActionButton({label = 'Back', brandColor = '#3eb0ef', hidden = false, onClick}) {
    const { t } = useTranslation();
    if (label === 'Back') {
        label = t(['back', 'Back']);
    }
    if (hidden) {
        return null;
    }

    return (
        <button className='gh-portal-btn gh-portal-btn-back' onClick={e => onClick(e)}>
            <LeftArrowIcon /> {label}
        </button>
    );
}

export default ActionButton;
