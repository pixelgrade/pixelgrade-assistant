import React from 'react';
import {connect} from 'react-redux';
import Helpers from '../../helpers';
import _ from 'lodash';

// Map state to props
const mapStateToProps = (state) => {
    return { support: state };
};

const mapDispatchToProps = (dispatch) => {
    return {
        onSubmitVoteError: ( message ) => {
         dispatch({ type: 'VOTING_ERROR', message });
        },
        onSuccessfulFeedback: ( message ) => {
            dispatch({ type: 'SUCCESSFUL_FEEDBACK', message });
        },

    }
};

class FeedbackSendButtonContainer extends React.Component {

    constructor(props) {
        // this makes the this
        super(props);

        this.handleClick = this.handleClick.bind(this);
    }

    componentDidMount() {
    }

    render() {
        return <div className="ticket-submit-wrapper" onClick={this.handleClick}>
            <button className="btn btn--action" disabled={!_.isUndefined(this.props.support.feedbackText) && this.props.support.feedbackText.length > 0 ? '' : 'disabled'} >{Helpers.decodeHtml(_.get(pixassist,'themeConfig.knowledgeBase.l10n.sendFeedbackLabel', '' ))}</button>
        </div>
    };

    handleClick = () => {
        let self = this;

        // Send the feedback
        if (!_.isUndefined(self.props.support.feedbackVoteKey) && !_.isUndefined(self.props.support.feedbackText)){
            Helpers.restOauth1Request(
				pixassist.apiEndpoints.pxm.htVotingFeedback.method,
				pixassist.apiEndpoints.pxm.htVotingFeedback.url,
                {
                    license_hash: pixassist.themeMod.licenseHash,
                    key: self.props.support.feedbackVoteKey,
                    comment: self.props.support.feedbackText,
                    post_id: self.props.support.selected_sh_article_id,
                },
                (voteResponse) => {
					if (voteResponse.code === 'success' && !_.isUndefined(voteResponse.message)) {
						this.props.onSuccessfulFeedback(voteResponse.message);
					} else if (voteResponse.code !== 'success') {
						// Dispatch a Voting Error action
						this.props.onSubmitVoteError(voteResponse.message);
					}
                },  // callback
                (error) => {}, // error callback
                (response) => {
                    return response;
                }, // HTTP ERROR CALLBACK
            );
        }
    };
}


const FeedbackSendButton = connect(mapStateToProps, mapDispatchToProps)(FeedbackSendButtonContainer);

export default FeedbackSendButton;
