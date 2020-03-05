import OAuth from 'oauth-1.0a';
import CryptoJS_HmacSHA1 from 'crypto-js/hmac-sha1';
import CryptoJS_Enc_Base64 from 'crypto-js/enc-base64';
import qs from 'qs';
import 'whatwg-fetch'; // Required for browser compatibility.
import { clearState } from './localStorage';
import _ from 'lodash';
import {decode} from 'entities';

const Helpers = (function (window) {
	/**
	 * A utility which adds notifications.
	 * @param data | object
	 * notice_id: '500_error',
	 * title: 'We encountered a server problem',
	 * content: pixassist.themeConfig.l10n.Error500Text,
	 * type: 'error',
	 * ctaLabel: 'Find Solutions',
	 * ctaLink: link
	 */
	const pushNotification = function (data) {
		let event;
		if (window.CustomEvent) {
			event = new CustomEvent('pixassist:notice:add', {detail: {data: data}});
		} else {
			event = document.createEvent('CustomEvent');
			event.initCustomEvent('pixassist:notice:add', true, true, {data: data});
		}
		window.dispatchEvent(event);
	};

	const updateNotification = function (data) {
		let event;
		if (window.CustomEvent) {
			event = new CustomEvent('pixassist:notice:update', {detail: {data: data}});
		} else {
			event = document.createEvent('CustomEvent');
			event.initCustomEvent('pixassist:notice:update', true, true, {data: data});
		}
		window.dispatchEvent(event);
	};

	const removeNotification = function (data) {
		let event;
		if (window.CustomEvent) {
			event = new CustomEvent('pixassist:notice:remove', {detail: {data: data}});
		} else {
			event = document.createEvent('CustomEvent');
			event.initCustomEvent('pixassist:notice:remove', true, true, {data: data});
		}
		window.dispatchEvent(event);
	};

	/**
	 * This is an error callback for 5xx status codes
	 * It pushes an user friendly notification which promotes a documentation article about this matter.
	 * @param e
	 */
	const notify500Error = function (e) {
		let link = _.get(pixassist, 'themeConfig.l10n.Error500Link', '');

		if (typeof e.status === "number") {
			link += '#error_' + e.status
		} else {
			link += '#error_5xx'
		}

		pushNotification({
			notice_id: '500_error',
			title: 'We encountered a server problem',
			content: _.get(pixassist, 'themeConfig.l10n.Error500Text', ''),
			type: 'error',
			ctaLabel: 'Find Solutions',
			ctaLink: link
		});
	};

	/**
	 * This is an error callback for 4xx status codes
	 * It pushes an user friendly notification which promotes a documentation article about this matter.
	 * @param e
	 */
	const notify400Error = function (e) {
		let link = _.get(pixassist, 'themeConfig.l10n.Error400Link', '');

		if (typeof e.status === "number") {
			link += '#error_' + e.status
		} else {
			link += '#error_4xx'
		}

		pushNotification({
			notice_id: '400_error',
			title: 'We encountered a server problem',
			content: _.get(pixassist, 'themeConfig.l10n.Error400Text', ''),
			type: 'error',
			ctaLabel: 'Find Solutions',
			ctaLink: link,
		});
	};

	/**
	 * A wrapper function for jQuery.ajax()
	 * Internally it handles the WP-nonce and the pixassist-nonce so it will auto-auth with the wp rest api
	 * Also, it triggers user friendly notifications on errors
	 *
	 * @param url
	 * @param method
	 * @param data
	 * @param successCallback
	 * @param errorCallback
	 * @param beforeSendCallback
	 * @param async
	 */
	const $ajax = function (url, method = 'GET', data = {}, successCallback = null, errorCallback = null, beforeSendCallback = null, async = true) {
		if (null === beforeSendCallback) {
			// add this nonce to auth with wp rest api https://developer.wordpress.org/rest-api/using-the-rest-api/authentication/
			beforeSendCallback = function (xhr) {
				xhr.setRequestHeader('X-WP-Nonce', pixassist.wpRest.nonce);
			}
		}

		if (null === successCallback) {
			// a default success callback
			successCallback = function (response) {
				// console.debug(response);
			}
		}

		if (null === errorCallback) {
			// a default error callback ... just a log
			errorCallback = function (err) {
				console.debug(url);
				console.debug(err);
			}
		}

		// always add our nonce
		data = {...data, ...{'pixassist_nonce': pixassist.wpRest.pixassist_nonce}};

		jQuery.ajax({
			async: async,
			url: url,
			method: method,
			beforeSend: beforeSendCallback,
			statusCode: {
				301: notify400Error,
				302: notify400Error,
				303: notify400Error,
				400: notify400Error,
				401: notify400Error,
				402: notify400Error,
				403: notify400Error,
				404: notify400Error,
				500: notify500Error,
				501: notify500Error,
				502: notify500Error,
				503: notify500Error,
			},
			data: data
		})
		.done(successCallback)
		.error(errorCallback);

	};

	/**
	 * Replaces variables like theme_name or user name in a string
	 *
	 * @param string
	 * @returns {*}
	 */
	const replaceParams = function (string) {

		var replacers = {
			"{{theme_name}}": _.get(pixassist, 'themeSupports.theme_name', 'Theme'),
			"{{stylecss_theme_name}}": _.get(pixassist, 'themeSupports.stylecss_theme_name', ''),
			"{{theme_version}}": _.get(pixassist, 'themeSupports.theme_version', '0.0.1'),
			"{{theme_id}}": _.get(pixassist, 'themeSupports.theme_id', ''),
			"{{template}}": _.get(pixassist, 'themeSupports.template', ''),
			"{{original_slug}}": _.get(pixassist, 'themeSupports.original_slug', ''),
			"{{username}}": _.get(pixassist, 'user.name', 'Name'), // This is the name of the current user, in this installation
			"{{shopdomain}}": pixassist.shopBaseDomain,
		};

		// Let's see if we have the display name of the customer from our shop
		if ( ! _.isUndefined( pixassist.user.pixelgrade_display_name ) ) {
			replacers["{{username}}"] = _.get(pixassist, 'user.pixelgrade_display_name', 'Name');
		}

		var re = new RegExp(Object.keys(replacers).join("|"), "gi");

		if ( !_.isUndefined(string) || !!string ) {
			string = string.replace(re, function (matched) {
				return replacers[matched];
			});
		}

		return string
	};

	const replaceUrls = function (string) {

		var replacers = {
			"{{dashboard_url}}": pixassist.dashboardUrl,
			"{{customizer_url}}": pixassist.customizerUrl
		};

		var re = new RegExp(Object.keys(replacers).join("|"), "gi");

		string = string.replace(re, function (matched) {
			return replacers[matched];
		});

		return string
	};

	const extend = function (target, source) {
		target = target || {};
		for (var prop in source) {
			if (typeof source[prop] === 'object') {
				target[prop] = extend(target[prop], source[prop]);
			} else {
				target[prop] = source[prop];
			}
		}
		return target;
	};

	/**
	 * This method makes a request with OAuth1 authentication based on a HMAC SHA1 signature
	 *
	 * @param httpMethod
	 * @param url
	 * @param data
	 * @param callback
	 * @param errorCallback
	 * @param httpErrorCallback
	 * @returns {*}
	 */
	const restOauth1Request = function (httpMethod, url, data, callback, errorCallback, httpErrorCallback) {
		// We will me modifying data so will clone it just to be safe - shallow copy is fine
		var requestData = _.clone(data);

		// Instantiate the oauth client controller. if ocs isn't defined - revert to fallback
		// In the wizard ocs won't be defined yet - so we'll need to have a fallback
		if (!pixassist.themeSupports.ocs) {
			pixassist.themeSupports.ock = 'Lm12n034gL19';
			pixassist.themeSupports.ocs = '6AU8WKBK1yZRDerL57ObzDPM7SGWRp21Csi5Ti5LdVNG9MbP';
		}

		var oauthController = new OAuth({
			consumer: {
				key: pixassist.themeSupports.ock,
				secret: pixassist.themeSupports.ocs,
			},
			signature_method: 'HMAC-SHA1',
			hash_function: function (base_string, key) {
				return CryptoJS_HmacSHA1(base_string, key).toString(CryptoJS_Enc_Base64);
			}
		});

		var token = null;

		// If we are given the token through the data, we respect that
		if (!_.isEmpty(requestData) && typeof requestData.oauth_token !== 'undefined' && !!requestData.oauth_token && typeof requestData.oauth_token_secret !== 'undefined' && !!requestData.oauth_token_secret) {
			token = {
				key: requestData.oauth_token,
				secret: requestData.oauth_token_secret,
			};
		} else if (typeof pixassist.user.oauth_token !== 'undefined' && typeof pixassist.user.oauth_token_secret !== 'undefined') {
			token = {
				key: pixassist.user.oauth_token,
				secret: pixassist.user.oauth_token_secret,
			};
		}

		// Make sure that data doesn't have any stray oauth keys
		// The oauth data will all be in the headers
		if (!_.isEmpty(requestData)) {
			requestData = _.omit(requestData, ['oauth_token', 'oauth_token_secret', 'oauth_signature_method', 'oauth_timestamp', 'oauth_version', 'oauth_consumer_key', 'oauth_nonce']);
		}

		if (httpMethod === 'GET' && !_.isEmpty(requestData)) {
			// must be decoded before being passed to oauth
			url += `?${decodeURIComponent(qs.stringify(requestData))}`;
			requestData = null;
		}

		var oauthData = null;

		if (!_.isEmpty(requestData)) {
			oauthData = {};
			Object.keys(requestData).forEach(key => {
				var value = requestData[key];
				// Make sure that we prevent undefined being used as a 'undefined' string
				if (typeof value === 'undefined') {
					oauthData[key] = '';
					// We also need to make sure that the original data is standardized
					requestData[key] = '';
				} else if (_.isString(value) || _.isNumber(value)) {
					oauthData[key] = value;
				} else {
					_.forEach(value, (subvalue, subkey) => {
						// We will go one more level deep.
						if (_.isString(subvalue) || _.isNumber(subvalue)) {
							oauthData[`${key}[${subkey}]`] = subvalue;
						} else {
							_.forEach(subvalue, (subsubvalue, subsubkey) => (oauthData[`${key}[${subkey}][${subsubkey}]`] = subsubvalue));
						}
					})
				}
			});
		}

		// Generate the signature mainly and everything else that is needed for authentication
		oauthData = oauthController.authorize(
			{
				url: url,
				method: httpMethod,
				data: oauthData,
			},
			token
		);

		var headers = {
			'Accept': 'application/json',
			'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
		};

		const requestUrls = [
			`${pixassist.apiBase}oauth1/request`
		];

		/**
		 * Only attach the oauth headers if we have a request token, or it is a request to the `oauth/request` endpoint.
		 */
		if (!_.isEmpty(oauthController) && !_.isEmpty(token) || requestUrls.indexOf(url) > -1) {
			headers = {...headers, ...oauthController.toHeader(oauthData)};
		}

		return fetch(url, {
			method: httpMethod,
			headers: headers,
			mode: 'cors',
			referrerPolicy: 'unsafe-url', // We will send the full request URL since we are secured with OAuth1
			// credentials: 'include',
			body: ['GET', 'HEAD'].indexOf(httpMethod) > -1 ? null : qs.stringify(requestData)
		}).then(response => {
			if (response.headers.get('Content-Type') && response.headers.get('Content-Type').indexOf('x-www-form-urlencoded') > -1) {
				return response.text().then(text => {
					let parsed = qs.parse(text);
					callback(parsed);
					return parsed;
				})
			}
			return response.text().then(text => {

				try {
					var json = JSON.parse(text)
				} catch (e) {
					errorCallback({message: text, code: response.status});
					throw {message: text, code: response.status}
				}

				if (response.status >= 300) {
					// We will handle some special cases that concern the OAuth logic
					// Like invalid tokens or empty token (for some reason the user doesn't have the token details)
					let invalid_codes = [ 'json_oauth1_consumer_mismatch', 'json_oauth1_invalid_token', 'json_oauth1_expired_token', 'json_oauth1_invalid_user' ];
					if (response.status >= 400 && response.status < 500 && ( _.includes( invalid_codes, json.code ) || _.isNil( token ) ) ) {
						// In these cases the current token is unusable so we need to disconnect and let the user reconnect

						// Clear The local Storage as well
						clearState();

						Helpers.$ajax(
							pixassist.wpRest.endpoint.disconnectUser.url,
							pixassist.wpRest.endpoint.disconnectUser.method,
							{
								'user_id': pixassist.user.id,
								'force_disconnected': true
							},
							function (response) {
								if ( response.code === 'success' ) {
									// after disconnecting we need to rebuild the pixassist variable - so we reload the page
									window.location.reload();
								}
							}
						)
					}

					httpErrorCallback(response);
					throw json;
				} else {
					callback(json);
					return json
				}
			})
		}).catch(error => {
			console.log(error);
		});
	};

	/**
	 * A helper function to handle regular (non-oauth) HTTP requests
	 *
	 * @param url
	 * @param httpMethod
	 * @param data
	 * @param callback
	 * @param errorCallback
	 * @param httpErrorCallback
	 * @returns {*}
	 */
	const restRequest = function (httpMethod, url, data, callback, errorCallback, httpErrorCallback) {
		if (httpMethod === 'GET' && !_.isEmpty(data)) {
			url += `?${decodeURIComponent(qs.stringify(data))}`;
			data = null;
		}

		var headers = {
			'Accept': 'application/json',
			'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
		};

		return fetch(url, {
			method: httpMethod,
			headers: headers,
			credentials: 'include',
			body: ['GET','HEAD'].indexOf( httpMethod ) > -1 ? null : qs.stringify( data )
		}).then( response => {
			if ( response.headers.get( 'Content-Type' ) && response.headers.get( 'Content-Type' ).indexOf( 'x-www-form-urlencoded' ) > -1 ) {
				return response.text().then( text => {
					let parsed = qs.parse( text );
					callback(parsed);
					return parsed;
				})
			}
			return response.text().then( text => {

				try {
					var json = JSON.parse( text )
				} catch( e ) {
					errorCallback({ message: text, code: response.status });
					throw { message: text, code: response.status }
				}

				if ( response.status >= 300) {
					httpErrorCallback(response);
					throw json;
				} else {
					callback(json);
					return json
				}
			})
		}).catch(error => {
			console.log(error);
		});
	};

	/**
	 * This action is bound to the `outdated_theme` notification and it will try to update the theme
	 * @param event
	 */
	const clickUpdateTheme = function (event) {
		event.preventDefault();
		var slug = '';

		if (_.get(pixassist, 'themeSupports.template', false)) {
			slug = _.get(pixassist, 'themeSupports.template', false);
		} else if (_.get(pixassist, 'themeSupports.theme_name', false)) {
			slug = _.get(pixassist, 'themeSupports.theme_name', false );
			slug = slug.toLowerCase();
		}

		if ( ! slug ) {
			return;
		}

		wp.updates.updateTheme({
			slug: slug,
			xhr: function (response) {
				Helpers.updateNotification({
					notice_id: 'outdated_theme',
					title: "Updating your theme...",
					content: "Please wait until we finish with the update.",
					type: 'info',
					ctaLabel: false,
					secondaryCtaLabel: false,
					loading: true
				});
			},
			success: function (response) {
				Helpers.updateNotification({
					notice_id: 'outdated_theme',
					title: "Theme updated successfully!",
					content: Helpers.replaceParams("All things look great! Enjoy crafting your site with {{theme_name}}."),
					type: 'success',
					ctaLabel: false,
					secondaryCtaLabel: false,
					loading: false
				});

				// push event that the theme has been successfully updated
				let updatedEvent = new CustomEvent(
					'updatedTheme',
					{
						detail: {
							isUpdated: true,
							update: 'theme',
							slug: response.slug,
							oldVersion: response.oldVersion,
							newVersion: response.newVersion,
						},
						bubbles: true,
						cancelable: true,
					}
				);
				window.dispatchEvent(updatedEvent);
			},
			error: function (response) {
				if (response.errorMessage.length > 1) {
					Helpers.updateNotification({
						notice_id: 'outdated_theme',
						title: "Something went wrong while trying to update your theme: ",
						content: response.errorMessage,
						type: 'error',
						ctaLabel: false,
						loading: false
					});
				}
			}
		});
	};

	 /**
	 * Returns the best (first) license (valid -> Active -> Expired -> Overused) found in the user's account
	 */
	const getLicense = ( customerOrders ) => {
		let license = null,
			active_license = null,
			valid_license = null,
			expired_license = null;

		// Check if we have at least one order
		if (typeof customerOrders === "object" && _.size(customerOrders)) {
			// If we have at least one order - loop through its licences to get the best one
			_.map(customerOrders, function (order, key) {
				if ( ! _.isUndefined( order.licenses ) ) {
					_.map(order.licenses, function (license, lkey) {
						if ( ! _.isUndefined( license.license_status_code ) && parseInt(license.license_status_code) === 1 ) { // License is valid
							valid_license = license;
						} else if ( parseInt(license.license_status_code) === 2 ) { // license is active
							active_license = license;
						} else if ( parseInt(license.license_status_code) === 3 || parseInt(license.license_status_code) === 4 ) { // license is either expired or overused
							expired_license = license;
						}
					})
				}
			});
		}

		// check to see what licenses we found
		if ( null !== valid_license ) {
			license = valid_license;
		} else if ( null !== active_license ) {
			license = active_license;
		} else if ( null !== expired_license ) {
			license = expired_license;
		}

		if ( null === license ){
			return null;
		}

		return license;
	};

	const checkHttpStatus = function (status) {
		if (status == 4) {
			// Throw client error
			throw 'A 4xx error occurred';
		} else {
			if (status == 5) {
				// Throw server error
				throw 'A 5xx error occurred';
			}
		}
	};

	// We would only like to display the most relevant ES results.
	const esTrimHits = function (hits, maxScore) {
		let relevant_hits = [];

		Object.keys(hits).map(function (key, index) {
			if (hits[key]._score > 0.3 * maxScore) {
				relevant_hits.push(hits[key]);
			}
		});

		return relevant_hits;
	};

	const getESIndex = function () {
		return pixassist.themeConfig.eskb.index;
	};

	/**
	 * This is the js-queue npm https://github.com/RIAEvangelist/js-queue
	 * The only difference is that we added a 200 ms delay to each call.
	 * @param e
	 * @constructor
	 */
	const Queue = function (e) {
		function t() {
			return i = []
		}

		function n() {
			return i
		}

		function u(e) {
			return i = e
		}

		function r() {
			for (var e in arguments)i.push(arguments[e]);
			l || this.stop || !this.autoRun || this.next()
		}

		function a() {
			if (l = !0, i.length < 1 || this.stop)return void(l = !1);
			var e = this;
			setTimeout(function () {
				i.shift().bind(e)()
			}, 200)
		}

		Object.defineProperties(this, {
			add: {enumerable: !0, writable: !1, value: r},
			next: {enumerable: !0, writable: !1, value: a},
			clear: {enumerable: !0, writable: !1, value: t},
			contents: {enumerable: !1, get: n, set: u},
			autoRun: {enumerable: !0, writable: !0, value: !0},
			stop: {enumerable: !0, writable: !0, value: !1}
		});
		var i = [], l = !1
	};

	const compareVersion = function(v1, v2) {
		if (typeof v1 !== 'string') return false;
		if (typeof v2 !== 'string') return false;
		v1 = v1.split('.');
		v2 = v2.split('.');
		const k = Math.min(v1.length, v2.length);
		for (let i = 0; i < k; ++ i) {
			v1[i] = parseInt(v1[i], 10);
			v2[i] = parseInt(v2[i], 10);
			if (v1[i] > v2[i]) return 1;
			if (v1[i] < v2[i]) return -1;
		}
		return v1.length == v2.length ? 0: (v1.length < v2.length ? -1 : 1);
	}

	const getFirstItem = function(collection) {
		if (!_.size(collection)) {
			return null;
		}

		if (_.isArrayLike(collection)) {
			return _.first(collection);
		}

		if (_.isObjectLike(collection)){
			return _.get(collection, _.first(Object.keys(collection)))
		}

		return null;
	}

	const decodeHtml = function(encodedHtmlText) {
		return decode(encodedHtmlText);
	}

	const trailingslashit = function(url) {
		return url + ( url.endsWith("/") ? "" : "/" );
	}

	return {
		// notifications
		pushNotification: pushNotification,
		updateNotification: updateNotification,
		removeNotification: removeNotification,
		notify500Error: notify500Error,
		notify400Error: notify400Error,
		// replacers
		replaceParams: replaceParams,
		replaceUrls: replaceUrls,
		//helpers
		extend: extend,
		// auth & requests
		restOauth1Request: restOauth1Request,
		restRequest: restRequest,
		$ajax: $ajax,
		checkHttpStatus: checkHttpStatus,
		// elastic search
		esTrimHits: esTrimHits,
		getESIndex: getESIndex,
		// others
		Queue: Queue,
		clickUpdateTheme: clickUpdateTheme,
		// licensing
		getLicense: getLicense,
		compareVersion: compareVersion,
		getFirstItem: getFirstItem,
		decodeHtml: decodeHtml,
		trailingslashit: trailingslashit,
	};

})(window);

export default Helpers;
