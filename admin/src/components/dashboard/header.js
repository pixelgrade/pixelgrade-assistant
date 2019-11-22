import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import Helpers from '../../helpers';
import _ from 'lodash';

const mapStateToProps = (state) => {
	return {
		session: state
	}
};

const mapDispatchToProps = (dispatch) => {
	return {
		onConnected: () => {
			dispatch({
				type: 'CONNECTED'
			});
		},
		onLoading: () => {
			dispatch({
				type: 'LOADING'
			})
		},
		onDisconnect: () => {
			dispatch({
				type: 'DISCONNECTED'
			})
		},
		onLicenseFound: () => {
			dispatch({ type: 'HAS_LICENSE' });
		},
	}
};

class DashboardHeaderContainer extends React.Component {

	static get defaultProps() {
		return {
			ctaLabel: Helpers.decodeHtml(_.get(pixassist, 'themeConfig.l10n.disconnectLabel', 'Disconnect')),
			onClick: null,
			myAccountLabel: Helpers.decodeHtml(_.get(pixassist, 'themeConfig.l10n.myAccountBtn', 'My account')),
			myAccountLink: pixassist.shopBase + 'my-account',
			helpLabel: Helpers.decodeHtml(_.get(pixassist, 'themeConfig.l10n.needHelpBtn', 'Help')),
			helpDesc: pixassist.themeSupports.support_url,
		}
	}

	constructor(props) {
		// this makes the this
		super(props);

		this.state = {};
	}

	render(){
		let classname = 'theme__status  theme__status--' + this.props.status;

		return <div className="header-toolbar">
			<div className="header-toolbar__wing  header-toolbar__wing--left">
				<h1 className="theme__name" dangerouslySetInnerHTML={{__html: this.props.session.themeTitle }}></h1>
				<div className={classname} dangerouslySetInnerHTML={{__html: this.props.msg }}></div>
			</div>
			<div className="header-toolbar__wing  header-toolbar__wing--right">
				<a className="btn  btn--text" href={this.props.myAccountLink} target="_blank">{this.props.myAccountLabel}</a>
				{ ( !_.isUndefined( this.props.ctaOnClick ) )
					? <a className="btn  btn--text" onClick={this.props.ctaOnClick}>{this.props.ctaLabel}</a>
					:'' }

			</div>
		</div>
	}
}

DashboardHeaderContainer.propTypes = {
	status: PropTypes.string,
	msg: PropTypes.string,
	ctaLabel: PropTypes.string,
	ctaOnClick: PropTypes.func,
	myAccountLabel: PropTypes.string,
	myAccountLink: PropTypes.string,
	helpLabel: PropTypes.string,
	helpLink: PropTypes.string,
}

const DashboardHeader = connect(
	mapStateToProps,
	mapDispatchToProps
)(DashboardHeaderContainer);

export default DashboardHeader;
