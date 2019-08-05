import React, {Component} from 'react';
import Notice from './notice';
import PropTypes from 'prop-types';
import _ from 'lodash';

class Notificator extends Component {

	static get defaultProps() {
		return {
			localKey: 'pixassist_notifications'
		}
	}

	constructor(props) {
		super(props)

		this.state = {
			notes: this.getNotes()
		}

		if ( _.isUndefined( this.state.notes ) || !this.state.notes ) {
			this.setNotes( {}, true )
		}

		this.addNotice = this.addNotice.bind(this);
		this.dismissNotice = this.dismissNotice.bind(this);
		this.setNotes = this.setNotes.bind(this);
		this.bindEvents = this.bindEvents.bind(this);

		this.bindEvents();
	}

	render() {
		let component = this;

		return <div className="notify-container">
			{Object.keys(component.state.notes).map(function (id, i) {
				var note = component.state.notes[id],
					loading = false;

				if ( note.dismissed ) {
					return null
				}

				if ( note.loading ) {
					loading = note.loading
				}

				return <Notice
					key={i}
					notice_id={id}
					type={note.type}
					title={note.title}
					content={note.content}
					loading={loading}
					ctaLabel={note.ctaLabel}
					ctaAction={note.ctaAction}
					ctaLink={note.ctaLink}
				/>
			})}
		</div>
	}

	/**
	 * Publish a small push notificaiton API based on events
	 */
	bindEvents() {
		var comp = this;

		window.addEventListener("pixassist:notice:add", function (e, params) {
			var data = e.detail.data
			if ( _.isUndefined( data.notice_id )
				|| _.isUndefined( data.type )
				|| _.isUndefined( data.title )
				|| _.isUndefined( data.content ) ) {
				console.error('PixAssist: invalid data')
				return false
			}

			if ( ! _.isUndefined( comp.state.notes[ data.notice_id ] ) ) {
				// Notice already exists.
				return false
			}

			var note_params = {
					type: data.type,
					title: data.title,
					content: data.content,
				},
				new_notes = comp.state.notes

			if ( ! _.isUndefined( data.ctaLabel ) ) {
				note_params.ctaLabel = data.ctaLabel
			}

			if ( ! _.isUndefined( data.ctaAction ) ) {
				note_params.ctaAction = data.ctaAction
			}

			if ( ! _.isUndefined( data.ctaLink ) ) {
				note_params.ctaLink = data.ctaLink
			}

			new_notes[data.notice_id] = note_params
			comp.setNotes( new_notes );
		}, false);

		window.addEventListener("pixassist:notice:update", function (e, params) {
			var data = e.detail.data

			if ( _.isUndefined( data.notice_id )
				|| _.isUndefined( data.type )
				|| _.isUndefined( data.title )
				|| _.isUndefined( data.content ) ) {
				console.error('PixAssist: invalid notice data')
				return false
			}

			console.log( 'PixAssist: try to udate' + data.notice_id )

			if ( _.isUndefined( comp.state.notes[ data.notice_id ] ) ) {
				console.log( 'PixAssist: notice doesn\'t exists, we are going to create it' )
			}

			var note_params = {
					type: data.type,
					title: data.title,
					content: data.content,
				},
				new_notes = comp.state.notes

			if ( ! _.isUndefined( data.ctaLabel ) ) {
				note_params.ctaLabel = data.ctaLabel
			}

			if ( ! _.isUndefined( data.ctaAction ) ) {
				note_params.ctaAction = data.ctaAction
			}

			if ( ! _.isUndefined( data.ctaLink ) ) {
				note_params.ctaLink = data.ctaLink
			}

			new_notes[data.notice_id] = note_params
			comp.setNotes( new_notes );
		}, false);

		/**
		 * This event handles the dismiss action of a notice
		 * It requires the notice id
		 */
		window.addEventListener("pixassist:notice:dismiss", function (e, params) {
			var data = e.detail.data
			console.log(data)
			if ( _.isUndefined( data.notice_id ) ) {
				return false
			}

			comp.dismissNotice( data.notice_id )
		}, false);

		/**
		 * This event handles the remove action of a notice
		 * It requires the notice id
		 */
		window.addEventListener("pixassist:notice:remove", function (e, params) {
			var data = e.detail.data
			if ( _.isUndefined( data.notice_id ) ) {
				return false
			}
			comp.removeNotice( data.notice_id )
		}, false);
	}

	/**
	 * Adds a new notice in the state and in localStorage
	 *
	 * @param notice_id
	 * @param title
	 * @param content
	 * @param type
	 * @param dismissed
	 * @param delay
	 */
	addNotice( notice_id, title, content, type = 'info', dismissed = false, delay = 300 ){
		var data = {
				type: type,
				title: title,
				dismissed: dismissed,
				delay: delay,
			},
			new_notes = this.state.notes

		new_notes[notice_id] = data

		this.setNotes( new_notes );
	}

	/**
	 * Dismisses a notice from the current state but also from the local storage
	 * @param key
	 */
	dismissNotice( key ) {
		if ( ! _.isUndefined( this.state.notes[key] ) ){
			this.state.notes[key].dismissed = true;
			this.setNotes(this.state.notes);
		}
	}

	/**
	 * Removes a notice from the current state but also from the local storage
	 * @param key
	 */
	removeNotice( key ) {
		if ( ! _.isUndefined( this.state.notes[key] ) ){
			delete this.state.notes[key];
			this.setNotes(this.state.notes);
		}
	}

	/**
	 * Retrieves all the notes stored in localStorage
	 * @returns {{}}
	 */
	getNotes() {
		var notes = {}

		try {
			var local = localStorage.getItem( this.props.localKey );
			if ( !!local ) {
				notes = JSON.parse( local )
				return notes
			}
		} catch (err) {
			console.log(err);
		}

		return notes
	}

	/**
	 * Sets a new list of notifications in the current state but also in the localStorage
	 * @param notes
	 * @param saveToLocal
	 */
	setNotes( notes, saveToLocal = false ) {
		this.setState(function(prevState, props) {

			if ( saveToLocal ) {
				localStorage.setItem( this.props.localKey, JSON.stringify( notes ))
			}

			return {
				notes: notes
			};
		});
	}
}

Notificator.propTypes = {
	localKey: PropTypes.string
}

export default Notificator;
