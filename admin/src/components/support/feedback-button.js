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
        onFeedbackTypeSelect: ( value ) => {
            dispatch({ type: 'FEEDBACK_TYPE', value});
        },
        onFeedbackVoteKey: ( key ) => {
            dispatch({ type: 'FEEDBACK_VOTE_KEY', key});
        },
        onSubmitVoteError: ( message ) => {
            dispatch({ type: 'VOTING_ERROR', message });
        }
    }
};

class FeedbackButtonContainer extends React.Component {

    constructor(props) {
        // this makes the this
        super(props);

        this.handleClick = this.handleClick.bind(this);
    }

    render() {
        return <a className="btn  btn--action  btn--feedback  btn--inverted  btn--fee" data-selectvalue={this.props.selectValue} onClick={this.handleClick}>{Helpers.decodeHtml(this.props.value)}</a>
    };

    handleClick = (event) => {
        let vote = '',
            self = this;

        if (event.target.dataset.selectvalue == 1) {
            vote = 'up';
        } else if ( event.target.dataset.selectvalue == 0 ) {
            vote = 'down';
        }

        this.props.onFeedbackTypeSelect(vote);

        // Send the feedback
        Helpers.restOauth1Request(
			pixassist.apiEndpoints.pxm.htVoting.method,
			pixassist.apiEndpoints.pxm.htVoting.url,
            {
                license_hash: pixassist.themeMod.licenseHash,
                direction: vote,
                post_id: self.props.support.selected_sh_article_id
            },
            (voteResponse) => {
				if (voteResponse.code === 'success' && !_.isUndefined(voteResponse.data) && !_.isUndefined(voteResponse.data.key)) {
					self.props.onFeedbackVoteKey(voteResponse.data.key);
				} else if (voteResponse.code !== 'success') {
					// Dispatch a Voting Error action
					this.props.onSubmitVoteError(voteResponse.message);
				}
            },  // callback
            (error) => {}, // error callback
            (response) => {
                return response;
            }, // HTTP ERROR CALLBACK..
         );
    };
}

const FeedbackButton = connect(mapStateToProps, mapDispatchToProps)(FeedbackButtonContainer);

export default FeedbackButton;
