import React from 'react';
import Button from '@material-ui/core/Button';
import {connect} from 'react-redux';
import _ from 'lodash';
import Helpers from '../../helpers';

const styles = ({
  themeHelp: {
    boxShadow: 'none',
  }
});

const mapStateToProps = (state) => {
	return {
		support: state
	};
};
const mapDispatchToProps = (dispatch) => {
	return {
		onSupportActive: () => {
			dispatch({ type: 'SUPPORT_ON' });
		},
		onSupportClosed: () => {
			dispatch({ type: 'SUPPORT_OFF' });
		},
	};
};

class SupportButtonContainer extends React.Component {

	constructor(props) {
		// this makes the this
		super(props);
	};


	render() {
		return <Button variant="contained" style={styles.themeHelp} color="primary" id="pixassist-support-button" onClick={this.props.onSupportActive} data-capture='true' data-capture-type="ticket" >
				{Helpers.decodeHtml(_.get(pixassist, 'themeConfig.l10n.kbButton', ''))}
			</Button>;
	};
}

const SupportButton = connect(
	mapStateToProps,
	mapDispatchToProps
)(SupportButtonContainer);

export default SupportButton;
