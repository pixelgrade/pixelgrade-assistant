import React from 'react';
import {connect} from 'react-redux';
import FeedbackType from './feedback-type';
import FeedbackText from './feedback-text';
import FeedbackSendButton from './feedback-send-button';
import Paper from '@material-ui/core/Paper';
import _ from 'lodash';
import Helpers from '../../helpers'

// Map state to props
const mapStateToProps = ( state ) => {
	return {support: state};
};
const mapDispatchToProps = ( dispatch ) => {
	return {
		onSupportLoading: ( is_loading ) => {
			dispatch( {type: 'SUPPORT_LOADING', is_loading: is_loading} )
		},
		onSupportActive: () => {
			dispatch( {type: 'SUPPORT_ON'} );
		},
		onSupportClosed: () => {
			dispatch( {type: 'SUPPORT_OFF'} );
		},
		onElasticSearchResults: ( es_data ) => {
			dispatch( {type: 'ELASTICSEARCH_RESULTS', es_data: es_data} );
		},
		onFeedbackTypeSelect: ( value ) => {
			dispatch( {type: 'FEEDBACK_TYPE', value} );
		},
		onElasticSearchEmpty: () => {
			dispatch( {type: 'ELASTICSEARCH_EMPTY'} );
		},
		onSupportError: ( error, error_text ) => {
			dispatch( {type: 'SUPPORT_ERROR', error: error, error_text: error_text} );
		},
		onSticky: ( value ) => {
			dispatch( {type: 'STICKY', value: value} );
		},
		onSuggestedArticle: ( article_id ) => {
			dispatch( {type: 'SUGGESTED_KB_ARTICLE', article_id: article_id} );
		},
		onSubmitVoteError: ( message ) => {
			dispatch( {type: 'VOTING_ERROR', message} );
		},
		onSuccessfulFeedback: ( message ) => {
			dispatch( {type: 'SUCCESSFUL_FEEDBACK', message} );
		},
	}
};

class FeedbackContainer extends React.Component {

	constructor( props ) {
		// this makes the this
		super( props );
	}

	componentWillUnmount() {
		this.props.onFeedbackTypeSelect( undefined );
		this.props.onSubmitVoteError( undefined );
		this.props.onSuccessfulFeedback( undefined );
	}

	render() {
		return <div>
			<div className="article__feedback_error">{this.props.support.votingErrorMessage}</div>
			{_.isUndefined( this.props.support.vote ) ?
				/* USER HAS NOT VOTED YET */
				<Paper zdepth={1}>
					<div className="notification notification__blue dark sticky clear">
						<div className="notification__message">{Helpers.decodeHtml(_.get(pixassist,'themeConfig.knowledgeBase.l10n.articleHelpfulQuestion', '' ))}</div>
						<FeedbackType/>
					</div>
				</Paper>
				:
				! _.isUndefined( this.props.support.vote ) ?
					this.props.support.vote === 'down' ?
						/* USER VOTED NO (ARTICLE WAS NOT HELPFUL) */
						_.isUndefined( this.props.support.successfulFeedbackMessage ) ?
							/* THE USER HAS NOT SUBMITTED A FEEDBACK YET. PROMPT THE FEEDBACK COMPONENT */
							<div className="feedback">
								<Paper zdepth={1}>
									<div className="notification notification__blue dark sticky clear feedback-message-form">
										<h3 className="notification__message">😕 {Helpers.decodeHtml(_.get(pixassist,'themeConfig.knowledgeBase.l10n.articleNotHelpful', '' ))}</h3>
										<FeedbackText/>
										<div className="notification__actions">
											<FeedbackSendButton/>
										</div>
									</div>
								</Paper>
							</div>
							:
							! _.isUndefined( this.props.support.successfulFeedbackMessage ) ?
								/* FEEDBACK WAS SUCCESSFULLY TRANSMITTED */
								<Paper zdepth={1}>
									<div className="notification notification__blue dark sticky clear">
										<div className="notification__message">{Helpers.decodeHtml(this.props.support.successfulFeedbackMessage)}</div>
									</div>
								</Paper> : ''

					:
				this.props.support.vote === 'up' ?
					/* USER VOTED YES (ARTICLE WAS HELPFUL) */
					<div className="notification notification__green sticky">😊 {Helpers.decodeHtml(_.get(pixassist,'themeConfig.knowledgeBase.l10n.articleHelpful', '' ))}</div>:''
				:''}

		</div>
	};
}

const Feedback = connect( mapStateToProps, mapDispatchToProps )( FeedbackContainer );

export default Feedback;
