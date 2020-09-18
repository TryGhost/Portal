import PropTypes from 'prop-types';
import Frame from './Frame';
import AppContext from '../AppContext';
import NotificationStyle from './Notification.styles';

const React = require('react');

const Styles = ({brandColor, hasText}) => {
    const frame = {
        // ...(!hasText ? {width: '60px'} : {})
    };
    return {
        frame: {
            zIndex: '4000000',
            position: 'fixed',
            top: '0px',
            right: '0',
            left: '0',
            width: '100%',
            height: '58px',
            animation: '250ms ease 0s 1 normal none running animation-bhegco',
            transition: 'opacity 0.3s ease 0s',
            overflow: 'hidden',
            ...frame
        }
    };
};

class NotificationContent extends React.Component {
    render() {
        return (
            <div className='gh-portal-notification'>
                Test notification
            </div>
        );
    }
}

export default class Notification extends React.Component {
    static contextType = AppContext;

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

        return (
            <Frame style={frameStyle} title="membersjs-notification" head={this.renderFrameStyles()}>
                <NotificationContent updateWidth={width => this.onWidthChange(width)} />
            </Frame>
        );
    }
}