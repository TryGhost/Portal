import {GlobalStyles} from './Global.styles';

const NotificationStyles = `
    .gh-portal-notification-wrapper {
        display: flex;
        flex-direction: column;
        align-items: stretch;
        padding: 12px;
        overflow: hidden;
    }

    .gh-portal-notification {
        position: relative;
        width: 100%;
        padding: 10px 44px 12px 20px;
        max-width: 360px;
        min-height: 66px;
        font-size: 1.3rem;
        letter-spacing: 0.2px;
        background: rgba(33,33,33,0.95);
        backdrop-filter: blur(8px);
        color: var(--white);
        border-radius: 5px;
        box-shadow: 0 3.2px 3.6px rgba(0, 0, 0, 0.024), 0 8.8px 10px -5px rgba(0, 0, 0, 0.08);
        animation: notification-slidein 0.7s ease-in-out;
    }

    .gh-portal-notification.slideout {
        animation: notification-slideout 0.6s ease-in-out;
    }

    .gh-portal-notification.hide {
        display: none;
    }

    .gh-portal-notification p {
        flex-grow: 1;
        font-size: 1.4rem;
        text-align: left;
        margin: 0;
        padding: 0 0 0 40px;
        color: var(--grey13);
    }

    .gh-portal-notification p strong {
        color: var(--white);
    }

    .gh-portal-notification a {
        color: var(--white);
        text-decoration: underline;
        transition: all 0.2s ease-in-out;
        outline: none;
    }

    .gh-portal-notification a:hover {
        opacity: 0.8;
    }

    .gh-portal-notification-icon {
        position: absolute;
        top: 17px;
        left: 17px;
        width: 28px;
        height: 28px;
    }

    .gh-portal-notification-icon.success {
        color: var(--green);
    }

    .gh-portal-notification-icon.error {
        color: #FF2828;
    }

    .gh-portal-notification-closeicon {
        position: absolute;
        top: 5px;
        bottom: 0;
        right: 5px;
        color: var(--white);
        cursor: pointer;
        width: 12px;
        height: 12px;
        padding: 10px;
        transition: all 0.2s ease-in-out forwards;
        opacity: 0.8;
    }

    .gh-portal-notification-closeicon:hover {
        opacity: 1.0;
    }

    @keyframes notification-slidein {
        0% { transform: translateX(380px); }
        75% { transform: translateX(-8px); }
        100% { transform: translateX(0); }
    }

    @keyframes notification-slideout {
        0% { transform: translateX(0); }
        25% { transform: translateX(-8px); }
        100% { transform: translateX(380px); }
    }
`;

const NotificationStyle =
    GlobalStyles +
    NotificationStyles;

export default NotificationStyle;