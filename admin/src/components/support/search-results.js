import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import SupportBreadcrumbs from './breadcrumbs'
import Feedback from './feedback';
import _ from 'lodash';
import Helpers from '../../helpers';

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
		// onCategoriesList: ( categories ) => {
		// 	dispatch({ type: 'CATEGORIES_LIST', categories: categories})
		// },
		onSelfHelpList: ( value ) => {
			dispatch({ type: 'SELF_HELP_LIST', value})
		},
		onBreadcrumbs: ( breadcrumbs ) => {
			dispatch({ type: 'BREADCRUMBS', breadcrumbs })
		},
		onSelectedItem: ( item ) => {
			dispatch({ type: 'SELECTED_SH_ITEM', item });
		}
	}
};

class SupportSearchResultsContainer extends React.Component {

	constructor(props) {
		// this makes the this
		super(props);
		this.state = {};

		this.renderSearchResults = this.renderSearchResults.bind(this);
		this.renderArticle = this.renderArticle.bind(this);
	};

	componentDidMount() {
		// If the search has results - we should also add a breadcrumb with back to search results
		if ( !_.isUndefined( this.props.searchResults ) && _.size(this.props.searchResults)) {
			let breadcrumbs = [
				{
					type: 'default',
					id: 0,
					name: Helpers.decodeHtml(_.get(pixassist,'themeConfig.knowledgeBase.l10n.selfHelp', '' ))
				},
				{
					type: 'searchResults',
					id: 999,
					name: Helpers.decodeHtml(_.get(pixassist,'themeConfig.knowledgeBase.l10n.searchResults', '' ))
				}
			];

			this.props.onBreadcrumbs(breadcrumbs);
		}
	};

	render() {
		return <div id="pixassist-search-results">
				{ ! _.isUndefined( this.props.support.selected_item ) ?
					<div className="self-help-breadcrumbs">
						{ ! _.isUndefined( this.props.support.breadcrumbs ) ?
							<SupportBreadcrumbs />
							:
							''
						}
                        {this.renderArticle()}
					</div>
					:
					<div>
						{ ! _.isUndefined( this.props.support.breadcrumbs ) ?
							<div className="self-help-breadcrumbs">
								<SupportBreadcrumbs />
							</div>
							:
							''
						}
						{ ! _.isUndefined( this.props.searchResults ) && _.size(this.props.searchResults) ?
							<ul className="topics-list">
								{this.renderSearchResults()}
							</ul>
							:
							<p>{Helpers.decodeHtml(_.get(pixassist,'themeConfig.knowledgeBase.l10n.searchNoResultsMessage', '' ))}</p>
						}
					</div>
				}
			</div>
	};

	renderSearchResults = () => {
		let response = [];
		let component = this;

		Object.keys(component.props.searchResults).map(function(k,i) {
			response.push(<li key={component.props.searchResults[k].id}><a href="#" data-capture='true' data-capture-type='article' data-capture-searched='true' data-capture-id={component.props.searchResults[k].id}
			                                                               onClick={component.handleClick.bind(null, component.props.searchResults[k])} dangerouslySetInnerHTML={{__html: component.props.searchResults[k].title}}></a></li>)
		});

		return response;
	};

	handleClick = ( article ) => {
		this.props.onSelectedItem(article);
		this.props.onSelectedSHArticle(parseInt(article.id), article.content);

	};

	renderArticle = () => {
		let content = this.props.support.selected_item.content;
		let title = this.props.support.selected_item.title;

		return <div className="entry-content">
			<div className="entry-title search-result-title">
				<h1 style={{display: "inline-block"}} dangerouslySetInnerHTML={{__html: title}}></h1><a href={this.props.support.selected_item.external_url} target="_blank" className="external-link" style={{display: "inline-block"}}></a></div>
			<div dangerouslySetInnerHTML={{__html: content}}></div>

			{ this.props.support.activeTab === 'self-help' ?
				<div className="hkb-article__feedback">
					<Feedback />
				</div>
				:
				''
			}
		</div>;
	};
}

SupportSearchResultsContainer.propTypes = {
	onSupportState: PropTypes.func
};

const SupportSearchResults = connect(mapStateToProps, mapDispatchToProps)(SupportSearchResultsContainer);

export default SupportSearchResults;
