import React from 'react';
import AppContext from '../../AppContext';

export default class CloseButton extends React.Component {
    static contextType = AppContext;
    
    render() {
        const {site} = this.context;
        return (
            <>
                <button className='gh-portal-btn' onClick = {() => this.context.onAction('closePopup')}>{site.title}</button>
            </>
        );
    }
}