import React from 'react';
import PropTypes from 'prop-types';
import CircularProgress from '@material-ui/core/CircularProgress';

/**
 * Component responsible to display a notification
 * It can also display a CTA button which can be a link (for cases like a documentation link)
 * or it can be a callback for cases like a theme update
 */
class Notice extends React.Component {

	static get defaultProps() {
		return {
			type: 'info',
			isDismissable: false,
			onDismiss: null,
			ctaLabel: null,
			ctaLink: null,
			loading: false
		}
	}

	constructor(props) {
		// this makes the this
		super(props);

		// get the current state localized by wordpress
		this.onDismiss = this.onDismiss.bind(this);
	}

	render() {
		var divClass = 'box box--' + this.props.type

		// init the possible CTA link
		let link = ( null === this.props.ctaLink ) ? '#' : this.props.ctaLink

		return <div className={divClass}>
			{ this.props.isDismissable ? <a href="#" onClick={this.onDismiss} className="box__close-icon"><i className="dashicons dashicons-no"></i></a> : null }
			<div className="box__body">
				<h5 className="box__title">{this.props.title}</h5>
				<p className="box__text">{this.props.content}</p>
			</div>
			{ this.props.ctaLabel
				? <div className="box__cta">
					{ ( null === this.props.ctaLink ) // it could be a link or a button with callback
						? <a className="btn  btn--small" id="pgc-update-button" onClick={this.props.ctaAction}>{this.props.ctaLabel}</a>
						: <a className="btn  btn--small" id="pgc-update-button" href={link} target="_blank">{this.props.ctaLabel}</a> }
				</div> : null }
			{ this.props.loading
				? <div className="box__cta">
					<CircularProgress
						size={40}
						left={-20}
						top={10}
						variant='indeterminate'
						color='primary'
						style={{loader: {position: "relative"}}}
					/></div>
				: null
			}
		</div>;
	}

	onDismiss (e) {
		var comp = this

		// in case we have a custom dismiss action, we call that
		if ( this.props.onDismiss !== null ) {
			this.props.onDismiss()
		} else {
			if ( window.CustomEvent ) {
				var event = new CustomEvent('pixassist:notice:dismiss', {detail: {data: { notice_id: comp.props.notice_id }}});
			} else {
				var event = document.createEvent('CustomEvent');
				event.initCustomEvent('pixassist:notice:dismiss', true, true, {data: { notice_id: comp.props.notice_id }});
			}
			window.dispatchEvent(event);
		}
	}

}

Notice.propTypes = {
	notice_id: PropTypes.string.isRequired,
		type: PropTypes.string,
		title: PropTypes.string,
		content: PropTypes.string,
		loading: PropTypes.bool,
		isDismissable: PropTypes.bool,
		onDismiss: PropTypes.func,
		ctaLabel: PropTypes.string,
		ctaAction: PropTypes.func,
		ctaLink: PropTypes.string,
}

export default Notice;
