import React from 'react';
import {connect} from 'react-redux';
import Helpers from '../helpers';
import PluginManager from './plugin_manager'
import _ from 'lodash';

const mapStateToProps = (state) => {
	return {
		session: state
	}
};

const mapDispatchToProps = (dispatch) => {
	return {
		onPluginsReady: () => {
			dispatch({ type: 'ON_PLUGINS_READY' });
		}
	}
};

/**
 * This component displays the whole box dealing with recommended plugins (now used on dashboard)
 */
class RecommendedPluginsContainer extends React.Component {
	constructor(props) {
		// this makes the this
		super(props);

		this.state = {};
	}

	render() {
		let component = this;

		let title = Helpers.parseL10n(_.get(pixassist, 'themeConfig.recommendedPlugins.title', '')),
			content = Helpers.parseL10n(_.get(pixassist, 'themeConfig.recommendedPlugins.content', ''));

		if (component.props.session.are_plugins_ready) {
			title = Helpers.parseL10n(_.get(pixassist, 'themeConfig.recommendedPlugins.validatedTitle', ''));
			content = Helpers.parseL10n(_.get(pixassist, 'themeConfig.recommendedPlugins.validatedContent', ''));
		}

		return (
			<div>
				<h2 className="section__title" dangerouslySetInnerHTML={{__html: title}}></h2>
				<p className="section__content" dangerouslySetInnerHTML={{__html: content}} />

				<PluginManager
					onReady={component.props.onPluginsReady}
					enableIndividualActions={true}
					groupByRequired={true}
				/>
			</div>
		);
	}
}

const RecommendedPlugins = connect(
	mapStateToProps,
	mapDispatchToProps
)(RecommendedPluginsContainer);

export default RecommendedPlugins;
