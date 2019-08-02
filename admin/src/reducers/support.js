import {createStore} from 'redux';
import { loadState, saveState } from '../localStorage';
import { getDefaultState } from './session';
import _ from 'lodash';

// Initial Support State
const getDefaultSupportState = () => {
	return {
        is_loading: false,
		is_support_active: false,
		es_data: undefined,
		selectedTopic: undefined,
		selectedTag: undefined,
		activeTab: 'self-help',
		session: getDefaultState(),
	};
};

const support = ( supportState = getDefaultSupportState(), action ) => {
	switch ( action.type ) {
		// Support
		case 'SESSION_CHANGE':
            return {...supportState, ...{
                session: action.session
            }};
		case 'ON_UPDATED_LOCALIZED':
			return {...supportState, ...{
					session: getDefaultState(),
				}};
		case 'SUPPORT_LOADING':
			return {...supportState, ...{
				is_loading: action.is_loading
			}};
		case 'SUPPORT_LOADING_TEXT':
            return {...supportState, ...{
                loadingText: action.loadingText
            }};
		case 'SUPPORT_ERROR':
			return {...supportState, ...{
				error: action.error,
				error_text: action.error_text
			}};
		case 'SUPPORT_ON':
			return {...supportState, ...{
				is_support_active: true
			}};
		case 'SUPPORT_OFF':
			return {...supportState, ...{
				is_support_active: false
			}};
		case 'ELASTICSEARCH_RESULTS':
			return {...supportState, ...{
					es_data: action.es_data,
					es_error: false
				}};
		case 'ELASTICSEARCH_EMPTY':
			return {...supportState, ...{
					es_data: undefined,
					es_error: false,
			}};
		case 'ELASTICSEARCH_ERROR':
			return {...supportState, ...{
					es_data: undefined,
					es_error: true
				}};
		case 'STICKY':
			return {...supportState, ...{
				is_sticky: action.value
			}};
		case 'STICKY_VALUE':
			return {...supportState, ...{
				sticky_answered: action.value
			}};
		case 'SUGGESTED_KB_ARTICLE':
			return {...supportState, ...{
				active_article_id: action.article_id
			}};
		case 'SELECTED_SELF_HELP_ARTICLE':
			return {...supportState, ...{
				selected_sh_article_id: action.article_id,
				selected_sh_article_content: action.article_content
			}};
		case 'CATEGORIES_LIST':
			return {...supportState, ...{
				categories_list: action.categories
			}};
		case 'SELF_HELP_LIST':
			return {...supportState, ...{
				self_help_list: action.value
			}};
		case 'BREADCRUMBS':
			return {...supportState, ...{
				breadcrumbs: action.breadcrumbs
			}};
		case 'SELECTED_SH_ITEM':
			return {...supportState, ...{
				selected_item: action.item
			}};
		case 'TOPIC_SELECT':
			return {...supportState, ...{
				selectedTopic: action.topic
			}};
		case 'TAG_SELECT':
			return {...supportState, ...{
				selectedTag: action.tag
			}};
		case 'TICKET_DESCRIPTION':
			return {...supportState, ...{
				ticketDescription: action.description
			}};
		case 'TICKET_DETAILS':
			return {...supportState, ...{
				ticketDetails: action.details
			}};
		case 'TICKET_SUGGESTIONS':
			return {...supportState, ...{
				ticketSuggestions: action.suggestions,
				ticketSuggestionsTitle: action.title,
			}};
		case 'TICKET_TITLE':
			return {...supportState, ...{
				ticketTitle: action.title,
			}};
		case 'FEEDBACK_TYPE':
            return {...supportState, ...{
                vote: action.value,
            }};
		case 'FEEDBACK_TEXT':
            return {...supportState, ...{
                feedbackText: action.value,
            }};
        case 'FEEDBACK_VOTE_KEY':
            return {...supportState, ...{
                feedbackVoteKey: action.key,
            }};
        case 'VOTING_ERROR':
            return {...supportState, ...{
                votingErrorMessage: action.message,
            }};
		case 'TAB_CHANGE':
            return {...supportState, ...{
                activeTab: action.value,
            }};
        case 'SUCCESSFUL_FEEDBACK':
            return {...supportState, ...{
                successfulFeedbackMessage: action.message,
            }};
		case 'TICKET_SUBMIT_ERROR':
            return {...supportState, ...{
                ticketError: action.error,
            }};
		default:
			return supportState;
	}
};

// Check for persisted state
const persistedState = loadState();

// Create the redux store for the Support Component
export const supportStore = createStore(support, persistedState);

// Whenever the state changes persist the state to local storage
supportStore.subscribe(_.throttle(() => {
	saveState(supportStore.getState())
}, 1000));
