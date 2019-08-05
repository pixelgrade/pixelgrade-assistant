import React from 'react';
import SupportTicket from './ticket';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import _ from 'lodash';
import Helpers from '../../../helpers'

// Map state to props
const mapStateToProps = (state) => {
	return { support: state };
};

const mapDispatchToProps = (dispatch) => {
	return {
		onSupportLoading: ( is_loading ) => {
			dispatch({ type: 'SUPPORT_LOADING', is_loading: is_loading })
		},
		onSupportActive: () => {
			dispatch({ type: 'SUPPORT_ON' });
		},
		onSupportClosed: () => {
			dispatch({ type: 'SUPPORT_OFF' });
		},
		onElasticSearchResults: ( es_data ) => {
			dispatch({ type: 'ELASTICSEARCH_RESULTS', es_data: es_data });
		},
		onElasticSearchEmpty: () => {
			dispatch({ type: 'ELASTICSEARCH_EMPTY' });
		},
		onSupportError: ( error, error_text ) => {
			dispatch({ type: 'SUPPORT_ERROR', error: error, error_text: error_text});
		},
		onSticky: ( value ) => {
			dispatch({ type: 'STICKY', value: value });
		},
		onSelectedSHArticle: ( article_id, article_content ) => {
			dispatch({ type: 'SELECTED_SELF_HELP_ARTICLE', article_id: article_id, article_content })
		},
		onSelfHelpList: ( value ) => {
			dispatch({ type: 'SELF_HELP_LIST', value})
		},
		onBreadcrumbs: ( breadcrumbs ) => {
			dispatch({ type: 'BREADCRUMBS', breadcrumbs })
		},
		onSelectedItem: ( item ) => {
			dispatch({ type: 'SELECTED_SH_ITEM', item });
		},
		onTopicSelect: ( topic ) => {
			dispatch({ type: 'TOPIC_SELECT', topic })
		},
		onTagSelect: ( tag ) => {
			dispatch({ type: 'TAG_SELECT', tag })
		},
	}
};

class SupportTopicsContainer extends React.Component {

	constructor(props) {
		// this makes the this
		super(props);
		this.state = {};

		this.onTopicsState = this.onTopicsState.bind(this);
		this.updateLocalState = this.updateLocalState.bind(this);
	}


	render() {
		return <div className="support-ticket-wrapper">
				{ _.isUndefined( this.props.support.selectedTopic ) ?
					<div>
						<h1>{Helpers.decodeHtml(_.get(pixassist, 'themeConfig.knowledgeBase.openTicket.blocks.topics.fields.title.value', ''))}</h1>
						<ul className="topics-list">
							{this.renderTopics()}
						</ul>
					</div> :
					<SupportTicket />
				}
			</div>
	};

	onTopicsState = (state) => {
		this.updateLocalState(state);
	};

	updateLocalState = ($state) => {
		this.setState($state);
	};

	// Render the topics
	renderTopics = () => {
		let response = [];
		let component = this;

		// Create the topics lists. They are defined in Pixcare Manager.
		if (_.get(pixassist, 'themeConfig.knowledgeBase.openTicket', false)) {
			let topics = _.get(pixassist, 'themeConfig.knowledgeBase.openTicket.blocks.topics.fields.topics.fields', {});
			Object.keys(topics).map(function(key, index){
				response.push(<li key={index} onClick={component.handleTopicClick.bind(null, topics[key].value, key)}><a href="#">{Helpers.decodeHtml(topics[key].value)}</a></li>);
			});
		}

		return response;
	};

	// Handle the Topic Click - render the suggestions
	handleTopicClick = ( topic, tag ) => {
		// Dispatch an action to save the selected topic in the redux store
		this.props.onTopicSelect(topic);
		this.props.onTagSelect(tag);
	};
}

SupportTopicsContainer.propTypes = {
	onSupportState: PropTypes.func,
	onModalState: PropTypes.func
}

const SupportTopics = connect(mapStateToProps, mapDispatchToProps)(SupportTopicsContainer);

export default SupportTopics;
