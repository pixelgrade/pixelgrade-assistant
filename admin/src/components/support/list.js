import React from 'react';
import {connect} from 'react-redux';
import _ from 'lodash';

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
		onSuggestedArticle: ( article_id ) => {
			dispatch({ type: 'SUGGESTED_KB_ARTICLE', article_id: article_id });
		}
	}
};

class SupportListContainer extends React.Component {

	constructor(props) {
		// this makes the this
		super(props);
		this.state = {};

		if ( _.isEmpty(this.props.support.ticketSuggestions) ) {
			this.state.answered = false;
		}

		if ( _.isUndefined( this.state.ticketSubmitText ) ) {
			this.state.ticketSubmitText = 'Submit a ticket';
		}

		this.renderListItems = this.renderListItems.bind(this);
		this.handleArticleClick = this.handleArticleClick.bind(this);
	};

	componentDidMount() {
		// Set the global state of the suggestions list as rendered
		this.props.onSticky(true);
	};

	render() {
		return <div>
					<ul className="accordion-list">
						{this.renderListItems()}
					</ul>
				</div>
	};

	renderListItems = () => {
		let data = this.props.listItems;
		let response = [];
		let component = this;

		Object.keys(data).map(function (key, i) {
			response.push(<li key={data[key]._id}>
				<a href="#" data-capture='true' data-capture-type='article' data-capture-searched='true' data-capture-id={data[key]._id}
				   data-capture-is-open={component.props.support.active_article_id !== data[key]._id.toString() ? 'false' : 'true' }
				   className={component.props.support.active_article_id !== data[key]._id.toString() ? 'related-article-title' : 'related-article-title open-nav' }
				   onClick={component.handleArticleClick} id={data[key]._id} dangerouslySetInnerHTML={{__html: data[key]._source.post_title}}></a>
				<a href={data[key]._source.external_url} target="_blank" className="external-link"></a>
				<div
					className={component.props.support.active_article_id !== data[key]._id.toString() ? 'hidden' : 'related-article-rendered entry-content' } dangerouslySetInnerHTML={{__html: data[key]._source.post_content}}></div>
			</li>);
		});

		return response;
	};

	handleArticleClick = (event) => {
		let id = '';

		// Get the id of the article from the target element
		if ( ! _.isUndefined( event.target.id ) ) {
			id += event.target.id;
		}

		if ( ! _.isUndefined( this.props.support.active_article_id ) && id == this.props.support.active_article_id ) {
			// Dispatch an action to set the article id to undefined and minimize the accordion
			this.props.onSuggestedArticle( undefined );
		} else {
			// Dispatch an action to set the new active article id
			this.props.onSuggestedArticle(id);
		}

	};

}

const SupportList = connect(mapStateToProps, mapDispatchToProps)(SupportListContainer);

export default SupportList;
