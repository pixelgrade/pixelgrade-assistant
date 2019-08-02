import React from 'react';
import {connect} from 'react-redux';
import Helpers from '../../helpers'
import _ from 'lodash'

// Map state to props
const mapStateToProps = (state) => {
    return { support: state };
};

const mapDispatchToProps = (dispatch) => {
    return {
        onFeedbackText: ( value ) => {
            dispatch({ type: 'FEEDBACK_TEXT', value });
        }
    }
};

class FeedbackTextContainer extends React.Component {

    constructor(props) {
        // this makes the this
        super(props);

        this.handleChange = this.handleChange.bind(this);
    };

    componentWillUnmount() {
        this.props.onFeedbackText(undefined);
    };

    render() {
        return <textarea value={this.props.support.feedbackText} onChange={this.handleChange} rows="7" placeholder={Helpers.decodeHtml(_.get(pixassist,'themeConfig.knowledgeBase.l10n.sendFeedbackPlaceholder', '' ))}></textarea>
    };

    handleChange = (event) => {
        this.props.onFeedbackText(event.target.value);
    };
}


const FeedbackText = connect(mapStateToProps, mapDispatchToProps)(FeedbackTextContainer);

export default FeedbackText;
