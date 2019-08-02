import React from 'react';
import {connect} from 'react-redux';
import FeedbackButton from './feedback-button';
import Helpers from '../../helpers'
import _ from 'lodash'

// Map state to props
const mapStateToProps = (state) => {
    return { support: state };
};

const mapDispatchToProps = (dispatch) => {
    return {

    }
};

class FeedbackTypeContainer extends React.Component {

    constructor(props) {
        // this makes the this
        super(props);
    }

    componentDidMount() {
    }

    render() {
        return <div className="notification__actions">
            <FeedbackButton value={Helpers.decodeHtml(_.get(pixassist,'themeConfig.knowledgeBase.l10n.articleHelpfulYesLabel', 'Y' ))} selectValue={1} />
            <FeedbackButton value={Helpers.decodeHtml(_.get(pixassist,'themeConfig.knowledgeBase.l10n.articleHelpfulNoLabel', 'N' ))}  selectValue={0} />
        </div>
    };
}

const FeedbackType = connect(mapStateToProps, mapDispatchToProps)(FeedbackTypeContainer);

export default FeedbackType;
