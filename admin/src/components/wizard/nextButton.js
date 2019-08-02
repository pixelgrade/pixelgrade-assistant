import React, {Component} from 'react';
import PropTypes from 'prop-types';

export default class WizardNextButton extends Component {

	static get defaultProps() {
		return {
			label: pixassist.themeConfig.l10n.nextButton,
			classname: 'btn  btn--action',
			href: null,
			onclick: null,
			disabled: false
		}
	}

	constructor(props) {
		// this makes the this
		super(props);
	}

	render() {
		var classname = this.props.classname;

		if ( this.props.disabled ) {
			classname += ' btn--disabled'
		}

		if ( this.props.href ) {
			return <a
				className={classname}
				href={this.props.href}
				disabled={this.props.disabled}
			>{this.props.label}</a>
		}

		if ( this.props.onclick ) {
			return <a
				className={classname}
				onClick={this.props.onclick}
				disabled={this.props.disabled}
			>{this.props.label}</a>
		}

		return <a href="#"></a>
	};
}

WizardNextButton.propTypes = {
	label: PropTypes.string,
	classname: PropTypes.string,
	href: PropTypes.string,
	onclick: PropTypes.func,
	disabled: PropTypes.bool
}
