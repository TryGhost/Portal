import { withTranslation } from 'react-i18next';

const React = require('react');


export default withTranslation() (class LoadingPage extends React.Component {
    render() {
        const { t } = this.props;
        return (
            <div style={{display: 'flex', flexDirection: 'column', color: '#313131'}}>
                <div style={{paddingLeft: '16px', paddingRight: '16px', paddingTop: '12px'}}>
                    {t(['loading', 'Loading'])}...
                </div>
            </div>
        );
    }
})
