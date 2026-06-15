import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

const mapStateToProps = (state) => {
	return {
		session: state
	}
};

class DashboardHeaderContainer extends React.Component {

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
		</div>
	}
}

DashboardHeaderContainer.propTypes = {
	status: PropTypes.string,
	msg: PropTypes.string,
}

const DashboardHeader = connect(
	mapStateToProps
)(DashboardHeaderContainer);

export default DashboardHeader;
