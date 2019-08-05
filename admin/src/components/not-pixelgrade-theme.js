import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

/**
 * This component takes care about connecting to the Pixelgrade Shop and read data like license
 */
class NotPixelgradeTheme extends React.Component {

	constructor(props) {
		// this makes the this
		super(props);

		// init a default state
		this.state = {
			is_pixassist_dashboard: false
		};
		if ( ! _.isUndefined( window.location.search ) && window.location.search.indexOf('pixelgrade_assistant') !== -1 ) {//on pixassist dashboard
			this.state.is_pixassist_dashboard = true;
		}

		this.handleDashboardRedirect = this.handleDashboardRedirect.bind(this);
	}

	componentDidMount = () => {
		if ( ! _.isUndefined( window.location.search ) && window.location.search.indexOf('pixelgrade_assistant') !== -1 ) {//on pixassist dashboard
			this.setState({
				is_pixassist_dashboard: true
			});
		}
	};

	render() {
		let shopDomain = pixassist.shopBaseDomain;
		let themesUrl = shopDomain + '/themes/' + '?utm_source=pixelgrade_assistant&utm_medium=buy&utm_campaign=' + pixassist.themeSupports.theme_name;

		var output = <div className="entry-content">
						<div>
							{/* LOGGED IN BUT WITH A THEME THAT IS NOT OURS */}
							<h1 className="section__title"><span className="c-icon  c-icon--large  c-icon--warning" ></span>This is kind of sad 😭</h1>
							<p className="section__content">Your <strong>active theme</strong> doesn't seem to be one of our <a href={themesUrl} target="_blank">awesome themes</a> 🤩.</p>
							<p className="section__content">This is not necessarily a bad thing for you, but if you aim for blissful experiences 🦄 ... all modesty aside, you should really use a <strong>Pixelgrade theme</strong> 🎁️️️</p>
							<p className="section__content"> </p>
							<p className="section__content">I'll give you some space to think about it 🤐 🙌</p>
						</div>
					</div>;

		return(output);
	}

	handleDashboardRedirect = () => {
		window.location.href = pixassist.dashboardUrl;
	}
}

NotPixelgradeTheme.propTypes = {
	retryValidation: PropTypes.func,
	modalClose: PropTypes.func
}

export default NotPixelgradeTheme;
