import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
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

class SupportBreadcrumbsContainer extends React.Component {

	constructor(props) {
		// this makes the this
		super(props);

		this.renderBreadcrumbs = this.renderBreadcrumbs.bind(this);
	};

	render() {
		return <div>{this.renderBreadcrumbs()}</div>
	};

	renderBreadcrumbs = () => {
		let component = this;

		if ( _.isUndefined( this.props.support.breadcrumbs ) ) {
			return false;
		}
		let breadcrumbs = this.props.support.breadcrumbs;
		let response = [];

		Object.keys(breadcrumbs).map(function(key, index) {
			response.push(<span key={index}><a href="#" onClick={component.handleBcClick.bind(null, breadcrumbs[key])} title={Helpers.decodeHtml(_.get(pixassist,'themeConfig.knowledgeBase.l10n.backTo', '' )) + breadcrumbs[key].name}>{breadcrumbs[key].name}</a> <i className="dashicons dashicons-arrow-right-alt2"></i> </span>);
		});

		return response;
	};


	handleBcClick = ( object ) => {
		//Get category index
		let index = this.props.support.breadcrumbs.indexOf(object);
		let breadcrumbs = this.props.support.breadcrumbs;
		breadcrumbs = breadcrumbs.slice(0, index + 1);

		switch(object.type){
			case 'default':
				this.props.onBreadcrumbs(undefined);
				this.props.onSelectedItem(undefined);
				this.props.onSelectedSHArticle(undefined, undefined);
				this.props.onSupportLoading(false);
				this.props.onElasticSearchEmpty();

				break;
			case 'searchResults':
                this.props.onSelectedItem(undefined);
                this.props.onSelectedSHArticle(undefined, undefined);
				break;
			default:
				this.props.handleItemClick( object, breadcrumbs );
				break;

		}
	};
}

SupportBreadcrumbsContainer.propTypes = {
	handleItemClick: PropTypes.func,
};

const SupportBreadcrumbs = connect(mapStateToProps, mapDispatchToProps)(SupportBreadcrumbsContainer);

export default SupportBreadcrumbs;
