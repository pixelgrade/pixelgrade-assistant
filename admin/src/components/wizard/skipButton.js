import React, {Component} from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

export default class WizardSkipButton extends Component {

	static get defaultProps() {
		return {
			label: _.get(pixassist, 'themeConfig.l10n.skipButton', 'Skip'),
			classname: 'btn  btn--text  btn--slim',
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
			>{this.props.label || _.get(pixassist, 'themeConfig.l10n.skipButton', 'Skip')}</a>
		}

		if ( this.props.onclick ) {
			return <a
				className={classname}
				onClick={this.props.onclick}
				disabled={this.props.disabled}
			>{this.props.label || _.get(pixassist, 'themeConfig.l10n.skipButton', 'Skip')}</a>
		}

		return <a href="#"></a>
	};
}

WizardSkipButton.propTypes = {
	label: PropTypes.string,
	classname: PropTypes.string,
	href: PropTypes.string,
	onclick: PropTypes.func,
	disabled: PropTypes.bool
}
