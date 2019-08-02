import React from 'react';
import SupportBreadcrumbs from './breadcrumbs'
import CircularProgress from '@material-ui/core/CircularProgress';
import Helpers from '../../helpers';
import Feedback from './feedback';
import {connect} from 'react-redux';
import Notice from '../notice'
import Authenticator from '../authenticator'
import SystemStatus from '../system_status'
import Tools from '../tools'
import PluginManager from '../plugin_manager'
import StarterContent from '../starter_content'
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
		onSelectedSHArticle: ( article_id, article_content ) => {
			dispatch({ type: 'SELECTED_SELF_HELP_ARTICLE', article_id: article_id, article_content })
		},
		onCategoriesList: ( categories ) => {
			dispatch({ type: 'CATEGORIES_LIST', categories: categories})
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

const style = {
	refresh: {
		display: 'inline-block',
		position: 'fixed',
		right: '25%',
		top: '50%',
		left: 'auto',
		transform: 'none',
		marginRight: '-90px',
		marginTop: '-90px'
	},
};
const base_url = pixassist.apiBase !== null ? pixassist.apiBase : null;

class SupportSelfHelpContainer extends React.Component {

	constructor(props) {
		// this makes the this
		super(props);

		this.createCategoriesList = this.createCategoriesList.bind(this);
		this.listItems = this.listItems.bind(this);
		this.handleErrorNavigation = this.handleErrorNavigation.bind(this);
		this.renderCategories = this.renderCategories.bind(this);
		this.getCategoriesList = this.getCategoriesList.bind(this);
	}

	componentDidMount() {
		if (_.isUndefined(this.props.support.categories_list)) {
            this.createCategoriesList();
		}
	};

	render() {
		let component = this;
		// @todo It is very weird that we rely on this.props.support.error - should this be used just for errors?
		return ( _.isUndefined( this.props.support.error ) || false === this.props.support.error ) && this.props.support.is_support_active ?
			<div className="support-search">
				{ _.isUndefined( this.props.support.selected_sh_article_id ) && this.props.support.is_loading === false ?
					_.size(_.get(pixassist, 'themeConfig.knowledgeBase.selfHelp.blocks.info.fields', [])) ?
						<div className="entry-content">
							{Object.keys(_.get(pixassist, 'themeConfig.knowledgeBase.selfHelp.blocks.info.fields', [])).map(function (field_key) {
									let field = _.get(pixassist, 'themeConfig.knowledgeBase.selfHelp.blocks.info.fields', [])[field_key];

									return component.renderField(field, field_key, component);
								})}
						</div>
						:
						<div className="entry-content">
							<h1>{Helpers.decodeHtml(_.get(pixassist, 'themeConfig.knowledgeBase.selfHelp.blocks.info.fields.title.value',''))}</h1>
							<p dangerouslySetInnerHTML={{__html: Helpers.replaceParams(_.get(pixassist, 'themeConfig.knowledgeBase.selfHelp.blocks.info.fields.content.value', ''))}}></p>
							<h2>{Helpers.decodeHtml(_.get(pixassist, 'themeConfig.knowledgeBase.selfHelp.blocks.info.fields.subheader.value', ''))}</h2>
						</div>
					:
					<div></div>
				}

				<div className="self-help-breadcrumbs">
					{ ! _.isUndefined( this.props.support.breadcrumbs ) ?
						<SupportBreadcrumbs breadcrumbs={this.props.support.breadcrumbs} handleItemClick={this.handleCategoryClick} />
						:
						''
					}
				</div>

				{ this.props.support.is_loading === false ?
					<div>
						{ _.isUndefined( this.props.support.selected_item ) && this.props.support.activeTab === 'self-help' ?
							<ul id="kb-listing">{this.renderCategories()}</ul>
							:
							!_.isUndefined(this.props.support.selected_item) && this.props.support.selected_item.type === 'category' ?
									<ul id="kb-listing">{this.listItems()}</ul>
								:
									<div></div>
						}

						{ ! _.isUndefined( this.props.support.selected_sh_article_content ) ?
							<div className="hkb-article__content entry-content">
								<div className="entry-title">
									<h1 dangerouslySetInnerHTML={{__html: this.props.support.selected_item.post_title}} style={{display: "inline-block"}} /> <a href={this.props.support.selected_sh_article_id.external_url} target="_blank" className="external-link" title="Open link in a new tab" style={{display: "inline-block"}}></a>
								</div>
								<div dangerouslySetInnerHTML={{__html: this.props.support.selected_sh_article_content}} />
								{ this.props.support.activeTab === 'self-help' ?
									<div className="hkb-article__feedback">
										<Feedback />
									</div>
									:
									''
								}
							</div>
							:
							<div></div>
						}
						<div id="articles"></div>
					</div>
					:
					<CircularProgress
						size={180}
						left={0}
						top={10}
						variant='indeterminate'
						color="primary"
						style={style.refresh}
					/>
				}
			</div>
			:
			this.props.support.error == true ?
				<div className="error">
					<p>{Helpers.decodeHtml(_.get(pixassist,'themeConfig.knowledgeBase.l10n.errorGetSelection', '' ))}</p>
					<a href="#" onClick={this.handleErrorNavigation}>{Helpers.decodeHtml(_.get(pixassist,'themeConfig.knowledgeBase.l10n.backToMainSection', '' ))}</a>
				</div>
				:
				<div></div>
	};

	renderField = (field, field_key, component) => {
		let field_output = null,
			field_class = ' ';

		// Bail if this is not applicable to the current theme type.
		if ( !component.isApplicableToCurrentThemeType(field)){
			return;
		}

		// Handle the the case when the block field has has a notconnected behaviour, meaning that Pixelgrade Assistant is not connected (not logged in).
		if (!_.isUndefined(field.notconnected)) {
			if ( !component.props.session.is_logged ) {
				switch (field.notconnected) {
					case 'hidden':
						return null;
						break;

					case 'disabled':
						field_class += ' disabled';
						break;

					case 'notice':
						return <Notice
							key={'block-notice-' + field_key}
							notice_id="component_unavailable"
							type="warning"
							title={Helpers.decodeHtml(_.get(pixassist, 'themeConfig.l10n.componentUnavailableTitle', ''))}
							content={Helpers.replaceParams(Helpers.decodeHtml(_.get(pixassist, 'themeConfig.l10n.componentUnavailableContent', '')))}/>;
						break;
				}
			}

			// If the block field has a notconnected behaviour but it doesn't have an inactive one, we will infer the inactive from notconnected.
			// This is due to the fact that it's obvious that the state is inactive when we are notconnected.
			if ( _.isUndefined(field.inactive) ) {
				field.inactive = field.notconnected;
			}
		}

		// Handle the the case when the block field has an inactive behaviour, meaning that the license is not active.
		if (!_.isUndefined(field.inactive) && ( !component.props.session.is_active || !component.props.session.is_logged ) ) {
			switch (field.inactive) {
				case 'hidden':
					return null;
					break;

				case 'disabled':
					field_class += ' disabled';
					break;

				case 'notice':
					return <Notice
						key={'block-notice-' + field_key}
						notice_id="component_unavailable"
						type="warning"
						title={Helpers.decodeHtml(_.get(pixassist, 'themeConfig.l10n.componentUnavailableTitle', ''))}
						content={Helpers.replaceParams(Helpers.decodeHtml(_.get(pixassist, 'themeConfig.l10n.componentUnavailableContent', '')))}/>;
					break;
			}
		}

		if (!_.isUndefined(field.class)) {
			field_class += field.class
		}

		switch (field.type) {

			case 'text': {
				// @TODO REFACTOR THIS - EITHER FROM THE CONFIG OR THE WHOLE LOGIC
				let value = field.value;

				if ( _.get(component.props, 'support.is_sc_installing', false) ) {
					value = field.value_installing;
				}

				if ( _.get(component.props, 'support.is_sc_done', false) ) {
					value = field.value_installed;
				}

				if (_.isUndefined(value) || !value) {
					value = field.value;
				}

				field_output = <p
					className={field_class}
					dangerouslySetInnerHTML={{__html: Helpers.replaceParams(value)}}
					key={'field-' + field_key}></p>
				break;
			}

			case 'h1': {
				field_output =
					<h1 className={field_class} key={'field-' + field_key}
						dangerouslySetInnerHTML={{__html: Helpers.replaceParams(field.value)}}></h1>
				break;
			}

			case 'h2': {
				// @TODO REFACTOR THIS - EITHER FROM THE CONFIG OR THE WHOLE LOGIC
				let value = field.value;

				if ( _.get(component.props, 'support.is_sc_installing', false) ) {
					value = field.value_installing;
				}

				if ( _.get(component.props, 'support.is_sc_done', false) ) {
					value = field.value_installed;
				}

				if (_.isUndefined(value) || !value) {
					value = field.value;
				}

				field_output =
					<h2 className={field_class} key={'field-' + field_key}
						dangerouslySetInnerHTML={{__html: Helpers.replaceParams(value)}}></h2>
				break;
			}

			case 'h3': {
				field_output =
					<h3 className={field_class} key={'field-' + field_key}
						dangerouslySetInnerHTML={{__html: Helpers.replaceParams(field.value)}}></h3>
				break;
			}

			case 'h4': {
				field_output =
					<h4 className={field_class} key={'field-' + field_key}
						dangerouslySetInnerHTML={{__html: Helpers.replaceParams(field.value)}}></h4>
				break;
			}

			case 'button': {

				let CSSClass = 'btn ';
				if (!_.isUndefined(field.class)) {
					CSSClass += field.class;
				}

				let target = '_blank';
				if (!_.isUndefined(field.target)) {
					target = field.target;
				}

				// replace some pre-defined urls
				field.url = Helpers.replaceUrls(field.url);

				field_output = <a className={CSSClass} target={target}
								  key={'field-' + field_key}
								  href={field.url}>
					{field.label}
				</a>
				break;
			}

			case 'links': {
				if (typeof field.value !== "object") {
					break;
				}

				var links = field.value;

				field_output = <ul key={'field' + field_key}>
					{Object.keys(field.value).map(function (link_key) {
						var link = links[link_key];

						if (_.isUndefined(link.label) || _.isUndefined(link.url)) {
							return;
						}

						return <li key={'link-' + link_key}>
							<a href={link.url}>{link.label}</a>
						</li>
					})}
				</ul>
				break;
			}

			case 'component': {

				switch (field.value) {

					case 'authenticator': {
						field_output =
							<Authenticator
								key={'field-' + field_key}/>
						break
					}

					case 'system-status': {
						field_output = <SystemStatus
							key={'field-' + field_key}/>
						break
					}

					case 'pixassist-tools': {
						field_output =
							<Tools key={'field-' + field_key}/>
						break
					}

					case 'plugin-manager': {
						let control = false;
						if (!_.isUndefined(field.control)) {
							control = field.control;
						}

						field_output = <PluginManager
							key={'field-' + field_key}
							onPluginsReady={component.onPluginsReady}
							onPluginsInstalling={component.onPluginsInstalling}
							enable_actions={control}/>
						break
					}

					case 'starter-content': {
						let control = false;

						if (!_.isUndefined(field.control)) {
							control = field.control;
						}

						field_output = <StarterContent
							key={'field-' + field_key} name={field_key}
							onReady={component.onStarterContentReady}
							onImporting={component.onStarterImporting}
							enable_actions={true}/>;
						break
					}

					default:
						break
				}
				break;
			}
			default:
				break
		}

		return field_output;
	}

	isApplicableToCurrentThemeType = (item) => {
		if ( !_.get(item, 'applicableTypes', false) ) {
			// By default it is applicable.
			return true;
		}

		let applicableTypesConfig = _.castArray(_.get(item, 'applicableTypes', false));

		// Get the current theme type
		let themeType = _.get(pixassist,'themeSupports.theme_type', 'theme');

		if (_.indexOf(applicableTypesConfig, themeType) !== -1) {
			return true;
		}

		return false;
	}

	createCategoriesList = () => {
		let result = [],
			component = this;

		// On click - show the loading icon
		// Dispatch an action to update the loading state
		this.props.onSupportLoading(true);
		// Dispatch an action to update the error state
		this.props.onSupportError(undefined);

        let categoriesList = this.getCategoriesList();

        // check if categories list is a promise
        if (typeof categoriesList.then == 'function') {
            categoriesList.then((result) => {
            	if (!_.isUndefined(result.code) && result.code === 'success') {
                    this.props.onCategoriesList(result.categories);
				} else {
            		this.props.onSupportError(true, Helpers.decodeHtml(_.get(pixassist,'themeConfig.knowledgeBase.l10n.errorFetchCategories', '' )));
				}
            });
		} else { // we have an object of categories
            if (!_.isUndefined(categoriesList.code) && categoriesList.code === 'success') {
                this.props.onCategoriesList(categoriesList.categories);
            } else {
                this.props.onSupportError(true, Helpers.decodeHtml(_.get(pixassist,'themeConfig.knowledgeBase.l10n.errorFetchCategories', '' )));
            }
		}

        // Dispatch an action to update the loading state
        component.props.onSupportLoading(false);
	};

	renderCategories = () => {
		let response = [],
			component = this;

		if (!_.isUndefined(this.props.support.categories_list)) {
		   Object.keys(this.props.support.categories_list).map((key, index) => {
			   let category = this.props.support.categories_list[key];
			   response.push(<li key={category.id}><a href="#" data-capture='true' data-capture-type="category" data-capture-id={category.id} onClick={component.handleCategoryClick.bind(null, category, null)} >{Helpers.decodeHtml(category.name)}</a></li>);
		   });
		} else {
           response.push(<div key="error-div-1" className="error">{Helpers.decodeHtml(_.get(pixassist,'themeConfig.knowledgeBase.l10n.errorFetchArticles', '' ))}</div>)
		}

		return response;
	};

	handleCategoryClick = ( category, breadcrumbsValue ) => {
		// initial variables
		let response = [],
			breadcrumbs = [],
			categories = !_.isUndefined(this.props.support.categories_list) ? this.props.support.categories_list : pixassist.knowledgeBase.categories;

		// Update the breadcrumbs items
		if (breadcrumbsValue !== null) {
			breadcrumbs = breadcrumbsValue;
			category = categories[category.id];
		} else {
			if ( ! _.isUndefined( this.props.support.breadcrumbs ) ) {
				breadcrumbs = this.props.support.breadcrumbs;
			} else {
				breadcrumbs.push({
					id: 0,
					name: Helpers.decodeHtml(_.get(pixassist,'themeConfig.knowledgeBase.l10n.selfHelp', '' )),
					type: 'default'
				});
			}
			breadcrumbs.push({type: category.type, id: category.id, name: category.name});
		}

		// Loop through the articles and render them in the page
		if ( !_.isUndefined(category) && ! _.isUndefined( category.articles ) && _.size(category.articles)) {
			Object.keys(category.articles).map(function(key, index) {
				response.push(category.articles[key]);
			});
		}

		// Loop through the children and add them to the page
		if ( ! _.isUndefined( category.children ) && _.size(category.children) ) {// Loop through the children's articles
			Object.keys(category.children).map(function(key, index){
				let articles = [];
				if( ! _.isUndefined( category.children[key].articles ) && _.size(category.children[key].articles)) {
					Object.keys(category.children[key].articles).map(function (aKey, aIndex) {
						articles.push(category.children[key].articles[aKey]);
					});
				}

				let childArticles = {
					[category.children[key].name]: articles
				}
				response.push(childArticles);
			});
		}

		// Because on this page we can either select an article or a category - we must have a
		// generic onSelectedItem to let us know what it is that we have selected (category or article)
		this.props.onSelectedItem(category);

		// Dispatch an action to update the breadcrumbs
		this.props.onBreadcrumbs(breadcrumbs);
		// Dispatch an action to update the self help dom tree
		this.props.onSelfHelpList(response);

		// Dispatch an action to update the article content
		this.props.onSelectedSHArticle( undefined, undefined );

		// Dispatch an action to update the loader's state
		this.props.onSupportLoading(false);
		// Dispatch an action to update the error state
		this.props.onSupportError(undefined);
	};

	/**
	 * A helper function that renders the Items (categories/articles)
	 * state.items will contain <li>'s with each item
	 */
	listItems = () => {
		if ( this.props.support.selected_item.type === 'category' && ! _.isUndefined( this.props.support.self_help_list ) ) {
			let response = [],
				component = this;

			Object.keys(this.props.support.self_help_list).map((k, i) => {
				let artKey = 'article-' + k,
					scKey = 'scategory-' + k,
					item = this.props.support.self_help_list[k];

				if ( !_.isUndefined( item.ID ) ) {
					response.push(<li key={artKey} onClick={component.displayArticleContent.bind(null, item)}>
						<a href="#" data-capture='true' data-capture-type="article" data-capture-id={item.ID} dangerouslySetInnerHTML={{__html: item.post_title}}></a>
					</li>);
				}

				// If the item in the loop is a sub category - render its title and related articles
				if ( _.isUndefined( item.ID ) ) {
					Object.keys(item).map((k, i) => {
						let childkey = scKey + i,
							articles = [];
						Object.keys(item[k]).map((aKey, idx) => {
							articles.push(<li key={aKey} onClick={component.displayArticleContent.bind(null, item[k][aKey])}>
								<a href="#" data-capture='true' data-capture-type="article" data-capture-id={item[k][aKey].ID} dangerouslySetInnerHTML={{__html: item[k][aKey].post_title }}></a>
							</li>);
						});
						response.push(<li key={childkey} ><span>{k}</span><ul>{articles}</ul></li>);
					})
				}

			});

			return response;
		}
	};

	/**
	 * A helper function that displays an article's content
	 *
	 * @param articleObject
	 */
	displayArticleContent = ( articleObject ) => {
		this.props.onSelectedItem(articleObject);
		this.props.onSelectedSHArticle(articleObject.ID, articleObject.post_content);
		this.props.onSelfHelpList(undefined);
	};

    /**
	 * A helper function that creates a list of categories that are available for a given theme
     */
	getCategoriesList = () => {
		let response = {},
            initialCategories = pixassist.knowledgeBase.categories,
			result = {},
			params = {
				kb_current_product_sku: pixassist.themeSupports.original_slug,
				hash_id: pixassist.themeSupports.theme_id,
				theme_type: pixassist.themeSupports.theme_type
			};

        // Check if we have the list of categories saved into the DB. If not - fall back to fetching them now
        if ( _.isUndefined( pixassist.knowledgeBase.categories ) || null === pixassist.knowledgeBase.categories || !_.size(pixassist.knowledgeBase.categories)) {
            // Build the get categories URL
            let get_categories_url = pixassist.apiEndpoints.pxm.getHTKBCategories.url;
            if ( ! _.isUndefined( pixassist.themeConfig.knowledgeBase.kbCatArtUrl ) ) {
                get_categories_url = pixassist.themeConfig.knowledgeBase.kbCatArtUrl.value;
            }

            // The result needs to be an array of current categories with each item's key being the category id
           return Helpers.restOauth1Request('GET', get_categories_url, params,
                (responseData) => {
					if ( responseData.code === 'success' ) {
                        let responseCategories = responseData.data.htkb_categories;

                        Object.keys(responseCategories).map(function (key, index) {
                            let category = responseCategories[key];
                            category.type = 'category';
                            // Check if the categories are in the old format
                            category.id = category.term_id;

                            if (category.parent == 0) {
                                result[category.id] = category;
                            }
                        });

                        responseData.categories = result;
                    }

                    return responseData;
				}, //callback,
                (error) => {}, // Error Callback
                (responseData) => {
                    // Get the first digit of the status
                    let status = !_.isUndefined(responseData.status) ? parseInt(responseData.status.toString()[0]) : responseData.code;
                    // If the status is not in the 2xx form - throw exception
                    if (status !== 2) {
                        // Check the status is either 4xx or 5xx and throw an exception
                        Helpers.checkHttpStatus(status);
                    }

                    return responseData;
                }, // HTTP Error Callback

            );
        } else if (!_.isEmpty(initialCategories)) {
            Object.keys(initialCategories).map(function(key, index) {
                let category = initialCategories[key];
                category.type = 'category';
                // Check if the categories are in the old format
                if ( _.isUndefined( category.id ) ) {
                    category.id = category.term_id;
                }
                result[category.id] = category;
            });

            response.code = 'success';
            response.categories = result;

            return response;
        }
	};

	/**
	 * A function that sets the error state to undefined, so we can naviagate back to our main section and
	 * try to re-fetch the categories.
	 */
	handleErrorNavigation = () => {
		this.props.onSupportError(undefined);
	};
}

const SupportSelfHelp = connect(mapStateToProps, mapDispatchToProps)(SupportSelfHelpContainer);
export default SupportSelfHelp;
