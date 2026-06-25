(function () {
	'use strict';

	const global = window;

	var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	function getAugmentedNamespace(n) {
		if (n.__esModule) return n;
		var a = Object.defineProperty({}, '__esModule', {value: true});
		Object.keys(n).forEach(function (k) {
			var d = Object.getOwnPropertyDescriptor(n, k);
			Object.defineProperty(a, k, d.get ? d : {
				enumerable: true,
				get: function () {
					return n[k];
				}
			});
		});
		return a;
	}

	var react = {exports: {}};

	var react_production_min = {};

	/*
	object-assign
	(c) Sindre Sorhus
	@license MIT
	*/
	/* eslint-disable no-unused-vars */
	var getOwnPropertySymbols$1 = Object.getOwnPropertySymbols;
	var hasOwnProperty$a = Object.prototype.hasOwnProperty;
	var propIsEnumerable = Object.prototype.propertyIsEnumerable;

	function toObject(val) {
		if (val === null || val === undefined) {
			throw new TypeError('Object.assign cannot be called with null or undefined');
		}

		return Object(val);
	}

	function shouldUseNative() {
		try {
			if (!Object.assign) {
				return false;
			}

			// Detect buggy property enumeration order in older V8 versions.

			// https://bugs.chromium.org/p/v8/issues/detail?id=4118
			var test1 = new String('abc');  // eslint-disable-line no-new-wrappers
			test1[5] = 'de';
			if (Object.getOwnPropertyNames(test1)[0] === '5') {
				return false;
			}

			// https://bugs.chromium.org/p/v8/issues/detail?id=3056
			var test2 = {};
			for (var i = 0; i < 10; i++) {
				test2['_' + String.fromCharCode(i)] = i;
			}
			var order2 = Object.getOwnPropertyNames(test2).map(function (n) {
				return test2[n];
			});
			if (order2.join('') !== '0123456789') {
				return false;
			}

			// https://bugs.chromium.org/p/v8/issues/detail?id=3056
			var test3 = {};
			'abcdefghijklmnopqrst'.split('').forEach(function (letter) {
				test3[letter] = letter;
			});
			if (Object.keys(Object.assign({}, test3)).join('') !==
					'abcdefghijklmnopqrst') {
				return false;
			}

			return true;
		} catch (err) {
			// We don't expect any of the above to throw, but better to be safe.
			return false;
		}
	}

	var objectAssign = shouldUseNative() ? Object.assign : function (target, source) {
		var from;
		var to = toObject(target);
		var symbols;

		for (var s = 1; s < arguments.length; s++) {
			from = Object(arguments[s]);

			for (var key in from) {
				if (hasOwnProperty$a.call(from, key)) {
					to[key] = from[key];
				}
			}

			if (getOwnPropertySymbols$1) {
				symbols = getOwnPropertySymbols$1(from);
				for (var i = 0; i < symbols.length; i++) {
					if (propIsEnumerable.call(from, symbols[i])) {
						to[symbols[i]] = from[symbols[i]];
					}
				}
			}
		}

		return to;
	};

	/** @license React v17.0.2
	 * react.production.min.js
	 *
	 * Copyright (c) Facebook, Inc. and its affiliates.
	 *
	 * This source code is licensed under the MIT license found in the
	 * LICENSE file in the root directory of this source tree.
	 */
	var l$2=objectAssign,n$2=60103,p$2=60106;react_production_min.Fragment=60107;react_production_min.StrictMode=60108;react_production_min.Profiler=60114;var q$2=60109,r$4=60110,t$1=60112;react_production_min.Suspense=60113;var u$1=60115,v$2=60116;
	if("function"===typeof Symbol&&Symbol.for){var w$2=Symbol.for;n$2=w$2("react.element");p$2=w$2("react.portal");react_production_min.Fragment=w$2("react.fragment");react_production_min.StrictMode=w$2("react.strict_mode");react_production_min.Profiler=w$2("react.profiler");q$2=w$2("react.provider");r$4=w$2("react.context");t$1=w$2("react.forward_ref");react_production_min.Suspense=w$2("react.suspense");u$1=w$2("react.memo");v$2=w$2("react.lazy");}var x$2="function"===typeof Symbol&&Symbol.iterator;
	function y$3(a){if(null===a||"object"!==typeof a)return null;a=x$2&&a[x$2]||a["@@iterator"];return "function"===typeof a?a:null}function z$2(a){for(var b="https://reactjs.org/docs/error-decoder.html?invariant="+a,c=1;c<arguments.length;c++)b+="&args[]="+encodeURIComponent(arguments[c]);return "Minified React error #"+a+"; visit "+b+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}
	var A$2={isMounted:function(){return !1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},B$2={};function C$1(a,b,c){this.props=a;this.context=b;this.refs=B$2;this.updater=c||A$2;}C$1.prototype.isReactComponent={};C$1.prototype.setState=function(a,b){if("object"!==typeof a&&"function"!==typeof a&&null!=a)throw Error(z$2(85));this.updater.enqueueSetState(this,a,b,"setState");};C$1.prototype.forceUpdate=function(a){this.updater.enqueueForceUpdate(this,a,"forceUpdate");};
	function D$2(){}D$2.prototype=C$1.prototype;function E$2(a,b,c){this.props=a;this.context=b;this.refs=B$2;this.updater=c||A$2;}var F$2=E$2.prototype=new D$2;F$2.constructor=E$2;l$2(F$2,C$1.prototype);F$2.isPureReactComponent=!0;var G$2={current:null},H$2=Object.prototype.hasOwnProperty,I$2={key:!0,ref:!0,__self:!0,__source:!0};
	function J(a,b,c){var e,d={},k=null,h=null;if(null!=b)for(e in void 0!==b.ref&&(h=b.ref),void 0!==b.key&&(k=""+b.key),b)H$2.call(b,e)&&!I$2.hasOwnProperty(e)&&(d[e]=b[e]);var g=arguments.length-2;if(1===g)d.children=c;else if(1<g){for(var f=Array(g),m=0;m<g;m++)f[m]=arguments[m+2];d.children=f;}if(a&&a.defaultProps)for(e in g=a.defaultProps,g)void 0===d[e]&&(d[e]=g[e]);return {$$typeof:n$2,type:a,key:k,ref:h,props:d,_owner:G$2.current}}
	function K(a,b){return {$$typeof:n$2,type:a.type,key:b,ref:a.ref,props:a.props,_owner:a._owner}}function L(a){return "object"===typeof a&&null!==a&&a.$$typeof===n$2}function escape$2(a){var b={"=":"=0",":":"=2"};return "$"+a.replace(/[=:]/g,function(a){return b[a]})}var M$1=/\/+/g;function N$1(a,b){return "object"===typeof a&&null!==a&&null!=a.key?escape$2(""+a.key):b.toString(36)}
	function O$1(a,b,c,e,d){var k=typeof a;if("undefined"===k||"boolean"===k)a=null;var h=!1;if(null===a)h=!0;else switch(k){case "string":case "number":h=!0;break;case "object":switch(a.$$typeof){case n$2:case p$2:h=!0;}}if(h)return h=a,d=d(h),a=""===e?"."+N$1(h,0):e,Array.isArray(d)?(c="",null!=a&&(c=a.replace(M$1,"$&/")+"/"),O$1(d,b,c,"",function(a){return a})):null!=d&&(L(d)&&(d=K(d,c+(!d.key||h&&h.key===d.key?"":(""+d.key).replace(M$1,"$&/")+"/")+a)),b.push(d)),1;h=0;e=""===e?".":e+":";if(Array.isArray(a))for(var g=
	0;g<a.length;g++){k=a[g];var f=e+N$1(k,g);h+=O$1(k,b,c,f,d);}else if(f=y$3(a),"function"===typeof f)for(a=f.call(a),g=0;!(k=a.next()).done;)k=k.value,f=e+N$1(k,g++),h+=O$1(k,b,c,f,d);else if("object"===k)throw b=""+a,Error(z$2(31,"[object Object]"===b?"object with keys {"+Object.keys(a).join(", ")+"}":b));return h}function P$1(a,b,c){if(null==a)return a;var e=[],d=0;O$1(a,e,"","",function(a){return b.call(c,a,d++)});return e}
	function Q(a){if(-1===a._status){var b=a._result;b=b();a._status=0;a._result=b;b.then(function(b){0===a._status&&(b=b.default,a._status=1,a._result=b);},function(b){0===a._status&&(a._status=2,a._result=b);});}if(1===a._status)return a._result;throw a._result;}var R$1={current:null};function S$1(){var a=R$1.current;if(null===a)throw Error(z$2(321));return a}var T$1={ReactCurrentDispatcher:R$1,ReactCurrentBatchConfig:{transition:0},ReactCurrentOwner:G$2,IsSomeRendererActing:{current:!1},assign:l$2};
	react_production_min.Children={map:P$1,forEach:function(a,b,c){P$1(a,function(){b.apply(this,arguments);},c);},count:function(a){var b=0;P$1(a,function(){b++;});return b},toArray:function(a){return P$1(a,function(a){return a})||[]},only:function(a){if(!L(a))throw Error(z$2(143));return a}};react_production_min.Component=C$1;react_production_min.PureComponent=E$2;react_production_min.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=T$1;
	react_production_min.cloneElement=function(a,b,c){if(null===a||void 0===a)throw Error(z$2(267,a));var e=l$2({},a.props),d=a.key,k=a.ref,h=a._owner;if(null!=b){void 0!==b.ref&&(k=b.ref,h=G$2.current);void 0!==b.key&&(d=""+b.key);if(a.type&&a.type.defaultProps)var g=a.type.defaultProps;for(f in b)H$2.call(b,f)&&!I$2.hasOwnProperty(f)&&(e[f]=void 0===b[f]&&void 0!==g?g[f]:b[f]);}var f=arguments.length-2;if(1===f)e.children=c;else if(1<f){g=Array(f);for(var m=0;m<f;m++)g[m]=arguments[m+2];e.children=g;}return {$$typeof:n$2,type:a.type,
	key:d,ref:k,props:e,_owner:h}};react_production_min.createContext=function(a,b){void 0===b&&(b=null);a={$$typeof:r$4,_calculateChangedBits:b,_currentValue:a,_currentValue2:a,_threadCount:0,Provider:null,Consumer:null};a.Provider={$$typeof:q$2,_context:a};return a.Consumer=a};react_production_min.createElement=J;react_production_min.createFactory=function(a){var b=J.bind(null,a);b.type=a;return b};react_production_min.createRef=function(){return {current:null}};react_production_min.forwardRef=function(a){return {$$typeof:t$1,render:a}};react_production_min.isValidElement=L;
	react_production_min.lazy=function(a){return {$$typeof:v$2,_payload:{_status:-1,_result:a},_init:Q}};react_production_min.memo=function(a,b){return {$$typeof:u$1,type:a,compare:void 0===b?null:b}};react_production_min.useCallback=function(a,b){return S$1().useCallback(a,b)};react_production_min.useContext=function(a,b){return S$1().useContext(a,b)};react_production_min.useDebugValue=function(){};react_production_min.useEffect=function(a,b){return S$1().useEffect(a,b)};react_production_min.useImperativeHandle=function(a,b,c){return S$1().useImperativeHandle(a,b,c)};
	react_production_min.useLayoutEffect=function(a,b){return S$1().useLayoutEffect(a,b)};react_production_min.useMemo=function(a,b){return S$1().useMemo(a,b)};react_production_min.useReducer=function(a,b,c){return S$1().useReducer(a,b,c)};react_production_min.useRef=function(a){return S$1().useRef(a)};react_production_min.useState=function(a){return S$1().useState(a)};react_production_min.version="17.0.2";

	{
	  react.exports = react_production_min;
	}

	var React$1 = react.exports;

	var reactDom = {exports: {}};

	var reactDom_production_min = {};

	var scheduler = {exports: {}};

	var scheduler_production_min = {};

	/** @license React v0.20.2
	 * scheduler.production.min.js
	 *
	 * Copyright (c) Facebook, Inc. and its affiliates.
	 *
	 * This source code is licensed under the MIT license found in the
	 * LICENSE file in the root directory of this source tree.
	 */

	(function (exports) {
	var f,g,h,k;if("object"===typeof performance&&"function"===typeof performance.now){var l=performance;exports.unstable_now=function(){return l.now()};}else {var p=Date,q=p.now();exports.unstable_now=function(){return p.now()-q};}
	if("undefined"===typeof window||"function"!==typeof MessageChannel){var t=null,u=null,w=function(){if(null!==t)try{var a=exports.unstable_now();t(!0,a);t=null;}catch(b){throw setTimeout(w,0),b;}};f=function(a){null!==t?setTimeout(f,0,a):(t=a,setTimeout(w,0));};g=function(a,b){u=setTimeout(a,b);};h=function(){clearTimeout(u);};exports.unstable_shouldYield=function(){return !1};k=exports.unstable_forceFrameRate=function(){};}else {var x=window.setTimeout,y=window.clearTimeout;if("undefined"!==typeof console){var z=
	window.cancelAnimationFrame;"function"!==typeof window.requestAnimationFrame&&console.error("This browser doesn't support requestAnimationFrame. Make sure that you load a polyfill in older browsers. https://reactjs.org/link/react-polyfills");"function"!==typeof z&&console.error("This browser doesn't support cancelAnimationFrame. Make sure that you load a polyfill in older browsers. https://reactjs.org/link/react-polyfills");}var A=!1,B=null,C=-1,D=5,E=0;exports.unstable_shouldYield=function(){return exports.unstable_now()>=
	E};k=function(){};exports.unstable_forceFrameRate=function(a){0>a||125<a?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):D=0<a?Math.floor(1E3/a):5;};var F=new MessageChannel,G=F.port2;F.port1.onmessage=function(){if(null!==B){var a=exports.unstable_now();E=a+D;try{B(!0,a)?G.postMessage(null):(A=!1,B=null);}catch(b){throw G.postMessage(null),b;}}else A=!1;};f=function(a){B=a;A||(A=!0,G.postMessage(null));};g=function(a,b){C=
	x(function(){a(exports.unstable_now());},b);};h=function(){y(C);C=-1;};}function H(a,b){var c=a.length;a.push(b);a:for(;;){var d=c-1>>>1,e=a[d];if(void 0!==e&&0<I(e,b))a[d]=b,a[c]=e,c=d;else break a}}function J(a){a=a[0];return void 0===a?null:a}
	function K(a){var b=a[0];if(void 0!==b){var c=a.pop();if(c!==b){a[0]=c;a:for(var d=0,e=a.length;d<e;){var m=2*(d+1)-1,n=a[m],v=m+1,r=a[v];if(void 0!==n&&0>I(n,c))void 0!==r&&0>I(r,n)?(a[d]=r,a[v]=c,d=v):(a[d]=n,a[m]=c,d=m);else if(void 0!==r&&0>I(r,c))a[d]=r,a[v]=c,d=v;else break a}}return b}return null}function I(a,b){var c=a.sortIndex-b.sortIndex;return 0!==c?c:a.id-b.id}var L=[],M=[],N=1,O=null,P=3,Q=!1,R=!1,S=!1;
	function T(a){for(var b=J(M);null!==b;){if(null===b.callback)K(M);else if(b.startTime<=a)K(M),b.sortIndex=b.expirationTime,H(L,b);else break;b=J(M);}}function U(a){S=!1;T(a);if(!R)if(null!==J(L))R=!0,f(V);else {var b=J(M);null!==b&&g(U,b.startTime-a);}}
	function V(a,b){R=!1;S&&(S=!1,h());Q=!0;var c=P;try{T(b);for(O=J(L);null!==O&&(!(O.expirationTime>b)||a&&!exports.unstable_shouldYield());){var d=O.callback;if("function"===typeof d){O.callback=null;P=O.priorityLevel;var e=d(O.expirationTime<=b);b=exports.unstable_now();"function"===typeof e?O.callback=e:O===J(L)&&K(L);T(b);}else K(L);O=J(L);}if(null!==O)var m=!0;else {var n=J(M);null!==n&&g(U,n.startTime-b);m=!1;}return m}finally{O=null,P=c,Q=!1;}}var W=k;exports.unstable_IdlePriority=5;
	exports.unstable_ImmediatePriority=1;exports.unstable_LowPriority=4;exports.unstable_NormalPriority=3;exports.unstable_Profiling=null;exports.unstable_UserBlockingPriority=2;exports.unstable_cancelCallback=function(a){a.callback=null;};exports.unstable_continueExecution=function(){R||Q||(R=!0,f(V));};exports.unstable_getCurrentPriorityLevel=function(){return P};exports.unstable_getFirstCallbackNode=function(){return J(L)};
	exports.unstable_next=function(a){switch(P){case 1:case 2:case 3:var b=3;break;default:b=P;}var c=P;P=b;try{return a()}finally{P=c;}};exports.unstable_pauseExecution=function(){};exports.unstable_requestPaint=W;exports.unstable_runWithPriority=function(a,b){switch(a){case 1:case 2:case 3:case 4:case 5:break;default:a=3;}var c=P;P=a;try{return b()}finally{P=c;}};
	exports.unstable_scheduleCallback=function(a,b,c){var d=exports.unstable_now();"object"===typeof c&&null!==c?(c=c.delay,c="number"===typeof c&&0<c?d+c:d):c=d;switch(a){case 1:var e=-1;break;case 2:e=250;break;case 5:e=1073741823;break;case 4:e=1E4;break;default:e=5E3;}e=c+e;a={id:N++,callback:b,priorityLevel:a,startTime:c,expirationTime:e,sortIndex:-1};c>d?(a.sortIndex=c,H(M,a),null===J(L)&&a===J(M)&&(S?h():S=!0,g(U,c-d))):(a.sortIndex=e,H(L,a),R||Q||(R=!0,f(V)));return a};
	exports.unstable_wrapCallback=function(a){var b=P;return function(){var c=P;P=b;try{return a.apply(this,arguments)}finally{P=c;}}};
	}(scheduler_production_min));

	{
	  scheduler.exports = scheduler_production_min;
	}

	/** @license React v17.0.2
	 * react-dom.production.min.js
	 *
	 * Copyright (c) Facebook, Inc. and its affiliates.
	 *
	 * This source code is licensed under the MIT license found in the
	 * LICENSE file in the root directory of this source tree.
	 */
	var aa=react.exports,m$2=objectAssign,r$3=scheduler.exports;function y$2(a){for(var b="https://reactjs.org/docs/error-decoder.html?invariant="+a,c=1;c<arguments.length;c++)b+="&args[]="+encodeURIComponent(arguments[c]);return "Minified React error #"+a+"; visit "+b+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}if(!aa)throw Error(y$2(227));var ba=new Set,ca={};function da(a,b){ea(a,b);ea(a+"Capture",b);}
	function ea(a,b){ca[a]=b;for(a=0;a<b.length;a++)ba.add(b[a]);}
	var fa=!("undefined"===typeof window||"undefined"===typeof window.document||"undefined"===typeof window.document.createElement),ha=/^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/,ia=Object.prototype.hasOwnProperty,
	ja={},ka={};function la(a){if(ia.call(ka,a))return !0;if(ia.call(ja,a))return !1;if(ha.test(a))return ka[a]=!0;ja[a]=!0;return !1}function ma(a,b,c,d){if(null!==c&&0===c.type)return !1;switch(typeof b){case "function":case "symbol":return !0;case "boolean":if(d)return !1;if(null!==c)return !c.acceptsBooleans;a=a.toLowerCase().slice(0,5);return "data-"!==a&&"aria-"!==a;default:return !1}}
	function na(a,b,c,d){if(null===b||"undefined"===typeof b||ma(a,b,c,d))return !0;if(d)return !1;if(null!==c)switch(c.type){case 3:return !b;case 4:return !1===b;case 5:return isNaN(b);case 6:return isNaN(b)||1>b}return !1}function B$1(a,b,c,d,e,f,g){this.acceptsBooleans=2===b||3===b||4===b;this.attributeName=d;this.attributeNamespace=e;this.mustUseProperty=c;this.propertyName=a;this.type=b;this.sanitizeURL=f;this.removeEmptyString=g;}var D$1={};
	"children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style".split(" ").forEach(function(a){D$1[a]=new B$1(a,0,!1,a,null,!1,!1);});[["acceptCharset","accept-charset"],["className","class"],["htmlFor","for"],["httpEquiv","http-equiv"]].forEach(function(a){var b=a[0];D$1[b]=new B$1(b,1,!1,a[1],null,!1,!1);});["contentEditable","draggable","spellCheck","value"].forEach(function(a){D$1[a]=new B$1(a,2,!1,a.toLowerCase(),null,!1,!1);});
	["autoReverse","externalResourcesRequired","focusable","preserveAlpha"].forEach(function(a){D$1[a]=new B$1(a,2,!1,a,null,!1,!1);});"allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope".split(" ").forEach(function(a){D$1[a]=new B$1(a,3,!1,a.toLowerCase(),null,!1,!1);});
	["checked","multiple","muted","selected"].forEach(function(a){D$1[a]=new B$1(a,3,!0,a,null,!1,!1);});["capture","download"].forEach(function(a){D$1[a]=new B$1(a,4,!1,a,null,!1,!1);});["cols","rows","size","span"].forEach(function(a){D$1[a]=new B$1(a,6,!1,a,null,!1,!1);});["rowSpan","start"].forEach(function(a){D$1[a]=new B$1(a,5,!1,a.toLowerCase(),null,!1,!1);});var oa=/[\-:]([a-z])/g;function pa(a){return a[1].toUpperCase()}
	"accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height".split(" ").forEach(function(a){var b=a.replace(oa,
	pa);D$1[b]=new B$1(b,1,!1,a,null,!1,!1);});"xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function(a){var b=a.replace(oa,pa);D$1[b]=new B$1(b,1,!1,a,"http://www.w3.org/1999/xlink",!1,!1);});["xml:base","xml:lang","xml:space"].forEach(function(a){var b=a.replace(oa,pa);D$1[b]=new B$1(b,1,!1,a,"http://www.w3.org/XML/1998/namespace",!1,!1);});["tabIndex","crossOrigin"].forEach(function(a){D$1[a]=new B$1(a,1,!1,a.toLowerCase(),null,!1,!1);});
	D$1.xlinkHref=new B$1("xlinkHref",1,!1,"xlink:href","http://www.w3.org/1999/xlink",!0,!1);["src","href","action","formAction"].forEach(function(a){D$1[a]=new B$1(a,1,!1,a.toLowerCase(),null,!0,!0);});
	function qa(a,b,c,d){var e=D$1.hasOwnProperty(b)?D$1[b]:null;var f=null!==e?0===e.type:d?!1:!(2<b.length)||"o"!==b[0]&&"O"!==b[0]||"n"!==b[1]&&"N"!==b[1]?!1:!0;f||(na(b,c,e,d)&&(c=null),d||null===e?la(b)&&(null===c?a.removeAttribute(b):a.setAttribute(b,""+c)):e.mustUseProperty?a[e.propertyName]=null===c?3===e.type?!1:"":c:(b=e.attributeName,d=e.attributeNamespace,null===c?a.removeAttribute(b):(e=e.type,c=3===e||4===e&&!0===c?"":""+c,d?a.setAttributeNS(d,b,c):a.setAttribute(b,c))));}
	var ra=aa.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,sa=60103,ta=60106,ua=60107,wa=60108,xa=60114,ya=60109,za=60110,Aa=60112,Ba=60113,Ca=60120,Da=60115,Ea=60116,Fa=60121,Ga=60128,Ha=60129,Ia=60130,Ja=60131;
	if("function"===typeof Symbol&&Symbol.for){var E$1=Symbol.for;sa=E$1("react.element");ta=E$1("react.portal");ua=E$1("react.fragment");wa=E$1("react.strict_mode");xa=E$1("react.profiler");ya=E$1("react.provider");za=E$1("react.context");Aa=E$1("react.forward_ref");Ba=E$1("react.suspense");Ca=E$1("react.suspense_list");Da=E$1("react.memo");Ea=E$1("react.lazy");Fa=E$1("react.block");E$1("react.scope");Ga=E$1("react.opaque.id");Ha=E$1("react.debug_trace_mode");Ia=E$1("react.offscreen");Ja=E$1("react.legacy_hidden");}
	var Ka="function"===typeof Symbol&&Symbol.iterator;function La(a){if(null===a||"object"!==typeof a)return null;a=Ka&&a[Ka]||a["@@iterator"];return "function"===typeof a?a:null}var Ma;function Na(a){if(void 0===Ma)try{throw Error();}catch(c){var b=c.stack.trim().match(/\n( *(at )?)/);Ma=b&&b[1]||"";}return "\n"+Ma+a}var Oa=!1;
	function Pa(a,b){if(!a||Oa)return "";Oa=!0;var c=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{if(b)if(b=function(){throw Error();},Object.defineProperty(b.prototype,"props",{set:function(){throw Error();}}),"object"===typeof Reflect&&Reflect.construct){try{Reflect.construct(b,[]);}catch(k){var d=k;}Reflect.construct(a,[],b);}else {try{b.call();}catch(k){d=k;}a.call(b.prototype);}else {try{throw Error();}catch(k){d=k;}a();}}catch(k){if(k&&d&&"string"===typeof k.stack){for(var e=k.stack.split("\n"),
	f=d.stack.split("\n"),g=e.length-1,h=f.length-1;1<=g&&0<=h&&e[g]!==f[h];)h--;for(;1<=g&&0<=h;g--,h--)if(e[g]!==f[h]){if(1!==g||1!==h){do if(g--,h--,0>h||e[g]!==f[h])return "\n"+e[g].replace(" at new "," at ");while(1<=g&&0<=h)}break}}}finally{Oa=!1,Error.prepareStackTrace=c;}return (a=a?a.displayName||a.name:"")?Na(a):""}
	function Qa(a){switch(a.tag){case 5:return Na(a.type);case 16:return Na("Lazy");case 13:return Na("Suspense");case 19:return Na("SuspenseList");case 0:case 2:case 15:return a=Pa(a.type,!1),a;case 11:return a=Pa(a.type.render,!1),a;case 22:return a=Pa(a.type._render,!1),a;case 1:return a=Pa(a.type,!0),a;default:return ""}}
	function Ra(a){if(null==a)return null;if("function"===typeof a)return a.displayName||a.name||null;if("string"===typeof a)return a;switch(a){case ua:return "Fragment";case ta:return "Portal";case xa:return "Profiler";case wa:return "StrictMode";case Ba:return "Suspense";case Ca:return "SuspenseList"}if("object"===typeof a)switch(a.$$typeof){case za:return (a.displayName||"Context")+".Consumer";case ya:return (a._context.displayName||"Context")+".Provider";case Aa:var b=a.render;b=b.displayName||b.name||"";
	return a.displayName||(""!==b?"ForwardRef("+b+")":"ForwardRef");case Da:return Ra(a.type);case Fa:return Ra(a._render);case Ea:b=a._payload;a=a._init;try{return Ra(a(b))}catch(c){}}return null}function Sa(a){switch(typeof a){case "boolean":case "number":case "object":case "string":case "undefined":return a;default:return ""}}function Ta(a){var b=a.type;return (a=a.nodeName)&&"input"===a.toLowerCase()&&("checkbox"===b||"radio"===b)}
	function Ua(a){var b=Ta(a)?"checked":"value",c=Object.getOwnPropertyDescriptor(a.constructor.prototype,b),d=""+a[b];if(!a.hasOwnProperty(b)&&"undefined"!==typeof c&&"function"===typeof c.get&&"function"===typeof c.set){var e=c.get,f=c.set;Object.defineProperty(a,b,{configurable:!0,get:function(){return e.call(this)},set:function(a){d=""+a;f.call(this,a);}});Object.defineProperty(a,b,{enumerable:c.enumerable});return {getValue:function(){return d},setValue:function(a){d=""+a;},stopTracking:function(){a._valueTracker=
	null;delete a[b];}}}}function Va(a){a._valueTracker||(a._valueTracker=Ua(a));}function Wa(a){if(!a)return !1;var b=a._valueTracker;if(!b)return !0;var c=b.getValue();var d="";a&&(d=Ta(a)?a.checked?"true":"false":a.value);a=d;return a!==c?(b.setValue(a),!0):!1}function Xa(a){a=a||("undefined"!==typeof document?document:void 0);if("undefined"===typeof a)return null;try{return a.activeElement||a.body}catch(b){return a.body}}
	function Ya(a,b){var c=b.checked;return m$2({},b,{defaultChecked:void 0,defaultValue:void 0,value:void 0,checked:null!=c?c:a._wrapperState.initialChecked})}function Za(a,b){var c=null==b.defaultValue?"":b.defaultValue,d=null!=b.checked?b.checked:b.defaultChecked;c=Sa(null!=b.value?b.value:c);a._wrapperState={initialChecked:d,initialValue:c,controlled:"checkbox"===b.type||"radio"===b.type?null!=b.checked:null!=b.value};}function $a(a,b){b=b.checked;null!=b&&qa(a,"checked",b,!1);}
	function ab(a,b){$a(a,b);var c=Sa(b.value),d=b.type;if(null!=c)if("number"===d){if(0===c&&""===a.value||a.value!=c)a.value=""+c;}else a.value!==""+c&&(a.value=""+c);else if("submit"===d||"reset"===d){a.removeAttribute("value");return}b.hasOwnProperty("value")?bb(a,b.type,c):b.hasOwnProperty("defaultValue")&&bb(a,b.type,Sa(b.defaultValue));null==b.checked&&null!=b.defaultChecked&&(a.defaultChecked=!!b.defaultChecked);}
	function cb(a,b,c){if(b.hasOwnProperty("value")||b.hasOwnProperty("defaultValue")){var d=b.type;if(!("submit"!==d&&"reset"!==d||void 0!==b.value&&null!==b.value))return;b=""+a._wrapperState.initialValue;c||b===a.value||(a.value=b);a.defaultValue=b;}c=a.name;""!==c&&(a.name="");a.defaultChecked=!!a._wrapperState.initialChecked;""!==c&&(a.name=c);}
	function bb(a,b,c){if("number"!==b||Xa(a.ownerDocument)!==a)null==c?a.defaultValue=""+a._wrapperState.initialValue:a.defaultValue!==""+c&&(a.defaultValue=""+c);}function db(a){var b="";aa.Children.forEach(a,function(a){null!=a&&(b+=a);});return b}function eb(a,b){a=m$2({children:void 0},b);if(b=db(b.children))a.children=b;return a}
	function fb(a,b,c,d){a=a.options;if(b){b={};for(var e=0;e<c.length;e++)b["$"+c[e]]=!0;for(c=0;c<a.length;c++)e=b.hasOwnProperty("$"+a[c].value),a[c].selected!==e&&(a[c].selected=e),e&&d&&(a[c].defaultSelected=!0);}else {c=""+Sa(c);b=null;for(e=0;e<a.length;e++){if(a[e].value===c){a[e].selected=!0;d&&(a[e].defaultSelected=!0);return}null!==b||a[e].disabled||(b=a[e]);}null!==b&&(b.selected=!0);}}
	function gb(a,b){if(null!=b.dangerouslySetInnerHTML)throw Error(y$2(91));return m$2({},b,{value:void 0,defaultValue:void 0,children:""+a._wrapperState.initialValue})}function hb(a,b){var c=b.value;if(null==c){c=b.children;b=b.defaultValue;if(null!=c){if(null!=b)throw Error(y$2(92));if(Array.isArray(c)){if(!(1>=c.length))throw Error(y$2(93));c=c[0];}b=c;}null==b&&(b="");c=b;}a._wrapperState={initialValue:Sa(c)};}
	function ib(a,b){var c=Sa(b.value),d=Sa(b.defaultValue);null!=c&&(c=""+c,c!==a.value&&(a.value=c),null==b.defaultValue&&a.defaultValue!==c&&(a.defaultValue=c));null!=d&&(a.defaultValue=""+d);}function jb(a){var b=a.textContent;b===a._wrapperState.initialValue&&""!==b&&null!==b&&(a.value=b);}var kb={html:"http://www.w3.org/1999/xhtml",mathml:"http://www.w3.org/1998/Math/MathML",svg:"http://www.w3.org/2000/svg"};
	function lb(a){switch(a){case "svg":return "http://www.w3.org/2000/svg";case "math":return "http://www.w3.org/1998/Math/MathML";default:return "http://www.w3.org/1999/xhtml"}}function mb(a,b){return null==a||"http://www.w3.org/1999/xhtml"===a?lb(b):"http://www.w3.org/2000/svg"===a&&"foreignObject"===b?"http://www.w3.org/1999/xhtml":a}
	var nb,ob=function(a){return "undefined"!==typeof MSApp&&MSApp.execUnsafeLocalFunction?function(b,c,d,e){MSApp.execUnsafeLocalFunction(function(){return a(b,c,d,e)});}:a}(function(a,b){if(a.namespaceURI!==kb.svg||"innerHTML"in a)a.innerHTML=b;else {nb=nb||document.createElement("div");nb.innerHTML="<svg>"+b.valueOf().toString()+"</svg>";for(b=nb.firstChild;a.firstChild;)a.removeChild(a.firstChild);for(;b.firstChild;)a.appendChild(b.firstChild);}});
	function pb(a,b){if(b){var c=a.firstChild;if(c&&c===a.lastChild&&3===c.nodeType){c.nodeValue=b;return}}a.textContent=b;}
	var qb={animationIterationCount:!0,borderImageOutset:!0,borderImageSlice:!0,borderImageWidth:!0,boxFlex:!0,boxFlexGroup:!0,boxOrdinalGroup:!0,columnCount:!0,columns:!0,flex:!0,flexGrow:!0,flexPositive:!0,flexShrink:!0,flexNegative:!0,flexOrder:!0,gridArea:!0,gridRow:!0,gridRowEnd:!0,gridRowSpan:!0,gridRowStart:!0,gridColumn:!0,gridColumnEnd:!0,gridColumnSpan:!0,gridColumnStart:!0,fontWeight:!0,lineClamp:!0,lineHeight:!0,opacity:!0,order:!0,orphans:!0,tabSize:!0,widows:!0,zIndex:!0,zoom:!0,fillOpacity:!0,
	floodOpacity:!0,stopOpacity:!0,strokeDasharray:!0,strokeDashoffset:!0,strokeMiterlimit:!0,strokeOpacity:!0,strokeWidth:!0},rb=["Webkit","ms","Moz","O"];Object.keys(qb).forEach(function(a){rb.forEach(function(b){b=b+a.charAt(0).toUpperCase()+a.substring(1);qb[b]=qb[a];});});function sb(a,b,c){return null==b||"boolean"===typeof b||""===b?"":c||"number"!==typeof b||0===b||qb.hasOwnProperty(a)&&qb[a]?(""+b).trim():b+"px"}
	function tb(a,b){a=a.style;for(var c in b)if(b.hasOwnProperty(c)){var d=0===c.indexOf("--"),e=sb(c,b[c],d);"float"===c&&(c="cssFloat");d?a.setProperty(c,e):a[c]=e;}}var ub=m$2({menuitem:!0},{area:!0,base:!0,br:!0,col:!0,embed:!0,hr:!0,img:!0,input:!0,keygen:!0,link:!0,meta:!0,param:!0,source:!0,track:!0,wbr:!0});
	function vb(a,b){if(b){if(ub[a]&&(null!=b.children||null!=b.dangerouslySetInnerHTML))throw Error(y$2(137,a));if(null!=b.dangerouslySetInnerHTML){if(null!=b.children)throw Error(y$2(60));if(!("object"===typeof b.dangerouslySetInnerHTML&&"__html"in b.dangerouslySetInnerHTML))throw Error(y$2(61));}if(null!=b.style&&"object"!==typeof b.style)throw Error(y$2(62));}}
	function wb(a,b){if(-1===a.indexOf("-"))return "string"===typeof b.is;switch(a){case "annotation-xml":case "color-profile":case "font-face":case "font-face-src":case "font-face-uri":case "font-face-format":case "font-face-name":case "missing-glyph":return !1;default:return !0}}function xb(a){a=a.target||a.srcElement||window;a.correspondingUseElement&&(a=a.correspondingUseElement);return 3===a.nodeType?a.parentNode:a}var yb=null,zb=null,Ab=null;
	function Bb(a){if(a=Cb(a)){if("function"!==typeof yb)throw Error(y$2(280));var b=a.stateNode;b&&(b=Db(b),yb(a.stateNode,a.type,b));}}function Eb(a){zb?Ab?Ab.push(a):Ab=[a]:zb=a;}function Fb(){if(zb){var a=zb,b=Ab;Ab=zb=null;Bb(a);if(b)for(a=0;a<b.length;a++)Bb(b[a]);}}function Gb(a,b){return a(b)}function Hb(a,b,c,d,e){return a(b,c,d,e)}function Ib(){}var Jb=Gb,Kb=!1,Lb=!1;function Mb(){if(null!==zb||null!==Ab)Ib(),Fb();}
	function Nb(a,b,c){if(Lb)return a(b,c);Lb=!0;try{return Jb(a,b,c)}finally{Lb=!1,Mb();}}
	function Ob(a,b){var c=a.stateNode;if(null===c)return null;var d=Db(c);if(null===d)return null;c=d[b];a:switch(b){case "onClick":case "onClickCapture":case "onDoubleClick":case "onDoubleClickCapture":case "onMouseDown":case "onMouseDownCapture":case "onMouseMove":case "onMouseMoveCapture":case "onMouseUp":case "onMouseUpCapture":case "onMouseEnter":(d=!d.disabled)||(a=a.type,d=!("button"===a||"input"===a||"select"===a||"textarea"===a));a=!d;break a;default:a=!1;}if(a)return null;if(c&&"function"!==
	typeof c)throw Error(y$2(231,b,typeof c));return c}var Pb=!1;if(fa)try{var Qb={};Object.defineProperty(Qb,"passive",{get:function(){Pb=!0;}});window.addEventListener("test",Qb,Qb);window.removeEventListener("test",Qb,Qb);}catch(a){Pb=!1;}function Rb(a,b,c,d,e,f,g,h,k){var l=Array.prototype.slice.call(arguments,3);try{b.apply(c,l);}catch(n){this.onError(n);}}var Sb=!1,Tb=null,Ub=!1,Vb=null,Wb={onError:function(a){Sb=!0;Tb=a;}};function Xb(a,b,c,d,e,f,g,h,k){Sb=!1;Tb=null;Rb.apply(Wb,arguments);}
	function Yb(a,b,c,d,e,f,g,h,k){Xb.apply(this,arguments);if(Sb){if(Sb){var l=Tb;Sb=!1;Tb=null;}else throw Error(y$2(198));Ub||(Ub=!0,Vb=l);}}function Zb(a){var b=a,c=a;if(a.alternate)for(;b.return;)b=b.return;else {a=b;do b=a,0!==(b.flags&1026)&&(c=b.return),a=b.return;while(a)}return 3===b.tag?c:null}function $b(a){if(13===a.tag){var b=a.memoizedState;null===b&&(a=a.alternate,null!==a&&(b=a.memoizedState));if(null!==b)return b.dehydrated}return null}function ac(a){if(Zb(a)!==a)throw Error(y$2(188));}
	function bc(a){var b=a.alternate;if(!b){b=Zb(a);if(null===b)throw Error(y$2(188));return b!==a?null:a}for(var c=a,d=b;;){var e=c.return;if(null===e)break;var f=e.alternate;if(null===f){d=e.return;if(null!==d){c=d;continue}break}if(e.child===f.child){for(f=e.child;f;){if(f===c)return ac(e),a;if(f===d)return ac(e),b;f=f.sibling;}throw Error(y$2(188));}if(c.return!==d.return)c=e,d=f;else {for(var g=!1,h=e.child;h;){if(h===c){g=!0;c=e;d=f;break}if(h===d){g=!0;d=e;c=f;break}h=h.sibling;}if(!g){for(h=f.child;h;){if(h===
	c){g=!0;c=f;d=e;break}if(h===d){g=!0;d=f;c=e;break}h=h.sibling;}if(!g)throw Error(y$2(189));}}if(c.alternate!==d)throw Error(y$2(190));}if(3!==c.tag)throw Error(y$2(188));return c.stateNode.current===c?a:b}function cc(a){a=bc(a);if(!a)return null;for(var b=a;;){if(5===b.tag||6===b.tag)return b;if(b.child)b.child.return=b,b=b.child;else {if(b===a)break;for(;!b.sibling;){if(!b.return||b.return===a)return null;b=b.return;}b.sibling.return=b.return;b=b.sibling;}}return null}
	function dc(a,b){for(var c=a.alternate;null!==b;){if(b===a||b===c)return !0;b=b.return;}return !1}var ec,fc,gc,hc,ic=!1,jc=[],kc=null,lc=null,mc=null,nc=new Map,oc=new Map,pc=[],qc="mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(" ");
	function rc(a,b,c,d,e){return {blockedOn:a,domEventName:b,eventSystemFlags:c|16,nativeEvent:e,targetContainers:[d]}}function sc(a,b){switch(a){case "focusin":case "focusout":kc=null;break;case "dragenter":case "dragleave":lc=null;break;case "mouseover":case "mouseout":mc=null;break;case "pointerover":case "pointerout":nc.delete(b.pointerId);break;case "gotpointercapture":case "lostpointercapture":oc.delete(b.pointerId);}}
	function tc(a,b,c,d,e,f){if(null===a||a.nativeEvent!==f)return a=rc(b,c,d,e,f),null!==b&&(b=Cb(b),null!==b&&fc(b)),a;a.eventSystemFlags|=d;b=a.targetContainers;null!==e&&-1===b.indexOf(e)&&b.push(e);return a}
	function uc(a,b,c,d,e){switch(b){case "focusin":return kc=tc(kc,a,b,c,d,e),!0;case "dragenter":return lc=tc(lc,a,b,c,d,e),!0;case "mouseover":return mc=tc(mc,a,b,c,d,e),!0;case "pointerover":var f=e.pointerId;nc.set(f,tc(nc.get(f)||null,a,b,c,d,e));return !0;case "gotpointercapture":return f=e.pointerId,oc.set(f,tc(oc.get(f)||null,a,b,c,d,e)),!0}return !1}
	function vc(a){var b=wc(a.target);if(null!==b){var c=Zb(b);if(null!==c)if(b=c.tag,13===b){if(b=$b(c),null!==b){a.blockedOn=b;hc(a.lanePriority,function(){r$3.unstable_runWithPriority(a.priority,function(){gc(c);});});return}}else if(3===b&&c.stateNode.hydrate){a.blockedOn=3===c.tag?c.stateNode.containerInfo:null;return}}a.blockedOn=null;}
	function xc(a){if(null!==a.blockedOn)return !1;for(var b=a.targetContainers;0<b.length;){var c=yc(a.domEventName,a.eventSystemFlags,b[0],a.nativeEvent);if(null!==c)return b=Cb(c),null!==b&&fc(b),a.blockedOn=c,!1;b.shift();}return !0}function zc(a,b,c){xc(a)&&c.delete(b);}
	function Ac(){for(ic=!1;0<jc.length;){var a=jc[0];if(null!==a.blockedOn){a=Cb(a.blockedOn);null!==a&&ec(a);break}for(var b=a.targetContainers;0<b.length;){var c=yc(a.domEventName,a.eventSystemFlags,b[0],a.nativeEvent);if(null!==c){a.blockedOn=c;break}b.shift();}null===a.blockedOn&&jc.shift();}null!==kc&&xc(kc)&&(kc=null);null!==lc&&xc(lc)&&(lc=null);null!==mc&&xc(mc)&&(mc=null);nc.forEach(zc);oc.forEach(zc);}
	function Bc(a,b){a.blockedOn===b&&(a.blockedOn=null,ic||(ic=!0,r$3.unstable_scheduleCallback(r$3.unstable_NormalPriority,Ac)));}
	function Cc(a){function b(b){return Bc(b,a)}if(0<jc.length){Bc(jc[0],a);for(var c=1;c<jc.length;c++){var d=jc[c];d.blockedOn===a&&(d.blockedOn=null);}}null!==kc&&Bc(kc,a);null!==lc&&Bc(lc,a);null!==mc&&Bc(mc,a);nc.forEach(b);oc.forEach(b);for(c=0;c<pc.length;c++)d=pc[c],d.blockedOn===a&&(d.blockedOn=null);for(;0<pc.length&&(c=pc[0],null===c.blockedOn);)vc(c),null===c.blockedOn&&pc.shift();}
	function Dc(a,b){var c={};c[a.toLowerCase()]=b.toLowerCase();c["Webkit"+a]="webkit"+b;c["Moz"+a]="moz"+b;return c}var Ec={animationend:Dc("Animation","AnimationEnd"),animationiteration:Dc("Animation","AnimationIteration"),animationstart:Dc("Animation","AnimationStart"),transitionend:Dc("Transition","TransitionEnd")},Fc={},Gc={};
	fa&&(Gc=document.createElement("div").style,"AnimationEvent"in window||(delete Ec.animationend.animation,delete Ec.animationiteration.animation,delete Ec.animationstart.animation),"TransitionEvent"in window||delete Ec.transitionend.transition);function Hc(a){if(Fc[a])return Fc[a];if(!Ec[a])return a;var b=Ec[a],c;for(c in b)if(b.hasOwnProperty(c)&&c in Gc)return Fc[a]=b[c];return a}
	var Ic=Hc("animationend"),Jc=Hc("animationiteration"),Kc=Hc("animationstart"),Lc=Hc("transitionend"),Mc=new Map,Nc=new Map,Oc=["abort","abort",Ic,"animationEnd",Jc,"animationIteration",Kc,"animationStart","canplay","canPlay","canplaythrough","canPlayThrough","durationchange","durationChange","emptied","emptied","encrypted","encrypted","ended","ended","error","error","gotpointercapture","gotPointerCapture","load","load","loadeddata","loadedData","loadedmetadata","loadedMetadata","loadstart","loadStart",
	"lostpointercapture","lostPointerCapture","playing","playing","progress","progress","seeking","seeking","stalled","stalled","suspend","suspend","timeupdate","timeUpdate",Lc,"transitionEnd","waiting","waiting"];function Pc(a,b){for(var c=0;c<a.length;c+=2){var d=a[c],e=a[c+1];e="on"+(e[0].toUpperCase()+e.slice(1));Nc.set(d,b);Mc.set(d,e);da(e,[d]);}}var Qc=r$3.unstable_now;Qc();var F$1=8;
	function Rc(a){if(0!==(1&a))return F$1=15,1;if(0!==(2&a))return F$1=14,2;if(0!==(4&a))return F$1=13,4;var b=24&a;if(0!==b)return F$1=12,b;if(0!==(a&32))return F$1=11,32;b=192&a;if(0!==b)return F$1=10,b;if(0!==(a&256))return F$1=9,256;b=3584&a;if(0!==b)return F$1=8,b;if(0!==(a&4096))return F$1=7,4096;b=4186112&a;if(0!==b)return F$1=6,b;b=62914560&a;if(0!==b)return F$1=5,b;if(a&67108864)return F$1=4,67108864;if(0!==(a&134217728))return F$1=3,134217728;b=805306368&a;if(0!==b)return F$1=2,b;if(0!==(1073741824&a))return F$1=1,1073741824;
	F$1=8;return a}function Sc(a){switch(a){case 99:return 15;case 98:return 10;case 97:case 96:return 8;case 95:return 2;default:return 0}}function Tc(a){switch(a){case 15:case 14:return 99;case 13:case 12:case 11:case 10:return 98;case 9:case 8:case 7:case 6:case 4:case 5:return 97;case 3:case 2:case 1:return 95;case 0:return 90;default:throw Error(y$2(358,a));}}
	function Uc(a,b){var c=a.pendingLanes;if(0===c)return F$1=0;var d=0,e=0,f=a.expiredLanes,g=a.suspendedLanes,h=a.pingedLanes;if(0!==f)d=f,e=F$1=15;else if(f=c&134217727,0!==f){var k=f&~g;0!==k?(d=Rc(k),e=F$1):(h&=f,0!==h&&(d=Rc(h),e=F$1));}else f=c&~g,0!==f?(d=Rc(f),e=F$1):0!==h&&(d=Rc(h),e=F$1);if(0===d)return 0;d=31-Vc(d);d=c&((0>d?0:1<<d)<<1)-1;if(0!==b&&b!==d&&0===(b&g)){Rc(b);if(e<=F$1)return b;F$1=e;}b=a.entangledLanes;if(0!==b)for(a=a.entanglements,b&=d;0<b;)c=31-Vc(b),e=1<<c,d|=a[c],b&=~e;return d}
	function Wc(a){a=a.pendingLanes&-1073741825;return 0!==a?a:a&1073741824?1073741824:0}function Xc(a,b){switch(a){case 15:return 1;case 14:return 2;case 12:return a=Yc(24&~b),0===a?Xc(10,b):a;case 10:return a=Yc(192&~b),0===a?Xc(8,b):a;case 8:return a=Yc(3584&~b),0===a&&(a=Yc(4186112&~b),0===a&&(a=512)),a;case 2:return b=Yc(805306368&~b),0===b&&(b=268435456),b}throw Error(y$2(358,a));}function Yc(a){return a&-a}function Zc(a){for(var b=[],c=0;31>c;c++)b.push(a);return b}
	function $c(a,b,c){a.pendingLanes|=b;var d=b-1;a.suspendedLanes&=d;a.pingedLanes&=d;a=a.eventTimes;b=31-Vc(b);a[b]=c;}var Vc=Math.clz32?Math.clz32:ad,bd=Math.log,cd=Math.LN2;function ad(a){return 0===a?32:31-(bd(a)/cd|0)|0}var dd=r$3.unstable_UserBlockingPriority,ed=r$3.unstable_runWithPriority,fd=!0;function gd(a,b,c,d){Kb||Ib();var e=hd,f=Kb;Kb=!0;try{Hb(e,a,b,c,d);}finally{(Kb=f)||Mb();}}function id(a,b,c,d){ed(dd,hd.bind(null,a,b,c,d));}
	function hd(a,b,c,d){if(fd){var e;if((e=0===(b&4))&&0<jc.length&&-1<qc.indexOf(a))a=rc(null,a,b,c,d),jc.push(a);else {var f=yc(a,b,c,d);if(null===f)e&&sc(a,d);else {if(e){if(-1<qc.indexOf(a)){a=rc(f,a,b,c,d);jc.push(a);return}if(uc(f,a,b,c,d))return;sc(a,d);}jd(a,b,d,null,c);}}}}
	function yc(a,b,c,d){var e=xb(d);e=wc(e);if(null!==e){var f=Zb(e);if(null===f)e=null;else {var g=f.tag;if(13===g){e=$b(f);if(null!==e)return e;e=null;}else if(3===g){if(f.stateNode.hydrate)return 3===f.tag?f.stateNode.containerInfo:null;e=null;}else f!==e&&(e=null);}}jd(a,b,d,e,c);return null}var kd=null,ld=null,md=null;
	function nd(){if(md)return md;var a,b=ld,c=b.length,d,e="value"in kd?kd.value:kd.textContent,f=e.length;for(a=0;a<c&&b[a]===e[a];a++);var g=c-a;for(d=1;d<=g&&b[c-d]===e[f-d];d++);return md=e.slice(a,1<d?1-d:void 0)}function od(a){var b=a.keyCode;"charCode"in a?(a=a.charCode,0===a&&13===b&&(a=13)):a=b;10===a&&(a=13);return 32<=a||13===a?a:0}function pd(){return !0}function qd(){return !1}
	function rd(a){function b(b,d,e,f,g){this._reactName=b;this._targetInst=e;this.type=d;this.nativeEvent=f;this.target=g;this.currentTarget=null;for(var c in a)a.hasOwnProperty(c)&&(b=a[c],this[c]=b?b(f):f[c]);this.isDefaultPrevented=(null!=f.defaultPrevented?f.defaultPrevented:!1===f.returnValue)?pd:qd;this.isPropagationStopped=qd;return this}m$2(b.prototype,{preventDefault:function(){this.defaultPrevented=!0;var a=this.nativeEvent;a&&(a.preventDefault?a.preventDefault():"unknown"!==typeof a.returnValue&&
	(a.returnValue=!1),this.isDefaultPrevented=pd);},stopPropagation:function(){var a=this.nativeEvent;a&&(a.stopPropagation?a.stopPropagation():"unknown"!==typeof a.cancelBubble&&(a.cancelBubble=!0),this.isPropagationStopped=pd);},persist:function(){},isPersistent:pd});return b}
	var sd={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(a){return a.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},td=rd(sd),ud=m$2({},sd,{view:0,detail:0}),vd=rd(ud),wd,xd,yd,Ad=m$2({},ud,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:zd,button:0,buttons:0,relatedTarget:function(a){return void 0===a.relatedTarget?a.fromElement===a.srcElement?a.toElement:a.fromElement:a.relatedTarget},movementX:function(a){if("movementX"in
	a)return a.movementX;a!==yd&&(yd&&"mousemove"===a.type?(wd=a.screenX-yd.screenX,xd=a.screenY-yd.screenY):xd=wd=0,yd=a);return wd},movementY:function(a){return "movementY"in a?a.movementY:xd}}),Bd=rd(Ad),Cd=m$2({},Ad,{dataTransfer:0}),Dd=rd(Cd),Ed=m$2({},ud,{relatedTarget:0}),Fd=rd(Ed),Gd=m$2({},sd,{animationName:0,elapsedTime:0,pseudoElement:0}),Hd=rd(Gd),Id=m$2({},sd,{clipboardData:function(a){return "clipboardData"in a?a.clipboardData:window.clipboardData}}),Jd=rd(Id),Kd=m$2({},sd,{data:0}),Ld=rd(Kd),Md={Esc:"Escape",
	Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},Nd={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",
	119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"},Od={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};function Pd(a){var b=this.nativeEvent;return b.getModifierState?b.getModifierState(a):(a=Od[a])?!!b[a]:!1}function zd(){return Pd}
	var Qd=m$2({},ud,{key:function(a){if(a.key){var b=Md[a.key]||a.key;if("Unidentified"!==b)return b}return "keypress"===a.type?(a=od(a),13===a?"Enter":String.fromCharCode(a)):"keydown"===a.type||"keyup"===a.type?Nd[a.keyCode]||"Unidentified":""},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:zd,charCode:function(a){return "keypress"===a.type?od(a):0},keyCode:function(a){return "keydown"===a.type||"keyup"===a.type?a.keyCode:0},which:function(a){return "keypress"===
	a.type?od(a):"keydown"===a.type||"keyup"===a.type?a.keyCode:0}}),Rd=rd(Qd),Sd=m$2({},Ad,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0}),Td=rd(Sd),Ud=m$2({},ud,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:zd}),Vd=rd(Ud),Wd=m$2({},sd,{propertyName:0,elapsedTime:0,pseudoElement:0}),Xd=rd(Wd),Yd=m$2({},Ad,{deltaX:function(a){return "deltaX"in a?a.deltaX:"wheelDeltaX"in a?-a.wheelDeltaX:0},
	deltaY:function(a){return "deltaY"in a?a.deltaY:"wheelDeltaY"in a?-a.wheelDeltaY:"wheelDelta"in a?-a.wheelDelta:0},deltaZ:0,deltaMode:0}),Zd=rd(Yd),$d=[9,13,27,32],ae=fa&&"CompositionEvent"in window,be=null;fa&&"documentMode"in document&&(be=document.documentMode);var ce=fa&&"TextEvent"in window&&!be,de=fa&&(!ae||be&&8<be&&11>=be),ee=String.fromCharCode(32),fe=!1;
	function ge(a,b){switch(a){case "keyup":return -1!==$d.indexOf(b.keyCode);case "keydown":return 229!==b.keyCode;case "keypress":case "mousedown":case "focusout":return !0;default:return !1}}function he(a){a=a.detail;return "object"===typeof a&&"data"in a?a.data:null}var ie=!1;function je(a,b){switch(a){case "compositionend":return he(b);case "keypress":if(32!==b.which)return null;fe=!0;return ee;case "textInput":return a=b.data,a===ee&&fe?null:a;default:return null}}
	function ke(a,b){if(ie)return "compositionend"===a||!ae&&ge(a,b)?(a=nd(),md=ld=kd=null,ie=!1,a):null;switch(a){case "paste":return null;case "keypress":if(!(b.ctrlKey||b.altKey||b.metaKey)||b.ctrlKey&&b.altKey){if(b.char&&1<b.char.length)return b.char;if(b.which)return String.fromCharCode(b.which)}return null;case "compositionend":return de&&"ko"!==b.locale?null:b.data;default:return null}}
	var le={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function me(a){var b=a&&a.nodeName&&a.nodeName.toLowerCase();return "input"===b?!!le[a.type]:"textarea"===b?!0:!1}function ne(a,b,c,d){Eb(d);b=oe(b,"onChange");0<b.length&&(c=new td("onChange","change",null,c,d),a.push({event:c,listeners:b}));}var pe=null,qe=null;function re(a){se(a,0);}function te(a){var b=ue(a);if(Wa(b))return a}
	function ve(a,b){if("change"===a)return b}var we=!1;if(fa){var xe;if(fa){var ye="oninput"in document;if(!ye){var ze=document.createElement("div");ze.setAttribute("oninput","return;");ye="function"===typeof ze.oninput;}xe=ye;}else xe=!1;we=xe&&(!document.documentMode||9<document.documentMode);}function Ae(){pe&&(pe.detachEvent("onpropertychange",Be),qe=pe=null);}function Be(a){if("value"===a.propertyName&&te(qe)){var b=[];ne(b,qe,a,xb(a));a=re;if(Kb)a(b);else {Kb=!0;try{Gb(a,b);}finally{Kb=!1,Mb();}}}}
	function Ce(a,b,c){"focusin"===a?(Ae(),pe=b,qe=c,pe.attachEvent("onpropertychange",Be)):"focusout"===a&&Ae();}function De(a){if("selectionchange"===a||"keyup"===a||"keydown"===a)return te(qe)}function Ee(a,b){if("click"===a)return te(b)}function Fe(a,b){if("input"===a||"change"===a)return te(b)}function Ge(a,b){return a===b&&(0!==a||1/a===1/b)||a!==a&&b!==b}var He="function"===typeof Object.is?Object.is:Ge,Ie=Object.prototype.hasOwnProperty;
	function Je(a,b){if(He(a,b))return !0;if("object"!==typeof a||null===a||"object"!==typeof b||null===b)return !1;var c=Object.keys(a),d=Object.keys(b);if(c.length!==d.length)return !1;for(d=0;d<c.length;d++)if(!Ie.call(b,c[d])||!He(a[c[d]],b[c[d]]))return !1;return !0}function Ke(a){for(;a&&a.firstChild;)a=a.firstChild;return a}
	function Le(a,b){var c=Ke(a);a=0;for(var d;c;){if(3===c.nodeType){d=a+c.textContent.length;if(a<=b&&d>=b)return {node:c,offset:b-a};a=d;}a:{for(;c;){if(c.nextSibling){c=c.nextSibling;break a}c=c.parentNode;}c=void 0;}c=Ke(c);}}function Me(a,b){return a&&b?a===b?!0:a&&3===a.nodeType?!1:b&&3===b.nodeType?Me(a,b.parentNode):"contains"in a?a.contains(b):a.compareDocumentPosition?!!(a.compareDocumentPosition(b)&16):!1:!1}
	function Ne(){for(var a=window,b=Xa();b instanceof a.HTMLIFrameElement;){try{var c="string"===typeof b.contentWindow.location.href;}catch(d){c=!1;}if(c)a=b.contentWindow;else break;b=Xa(a.document);}return b}function Oe(a){var b=a&&a.nodeName&&a.nodeName.toLowerCase();return b&&("input"===b&&("text"===a.type||"search"===a.type||"tel"===a.type||"url"===a.type||"password"===a.type)||"textarea"===b||"true"===a.contentEditable)}
	var Pe=fa&&"documentMode"in document&&11>=document.documentMode,Qe=null,Re=null,Se=null,Te=!1;
	function Ue(a,b,c){var d=c.window===c?c.document:9===c.nodeType?c:c.ownerDocument;Te||null==Qe||Qe!==Xa(d)||(d=Qe,"selectionStart"in d&&Oe(d)?d={start:d.selectionStart,end:d.selectionEnd}:(d=(d.ownerDocument&&d.ownerDocument.defaultView||window).getSelection(),d={anchorNode:d.anchorNode,anchorOffset:d.anchorOffset,focusNode:d.focusNode,focusOffset:d.focusOffset}),Se&&Je(Se,d)||(Se=d,d=oe(Re,"onSelect"),0<d.length&&(b=new td("onSelect","select",null,b,c),a.push({event:b,listeners:d}),b.target=Qe)));}
	Pc("cancel cancel click click close close contextmenu contextMenu copy copy cut cut auxclick auxClick dblclick doubleClick dragend dragEnd dragstart dragStart drop drop focusin focus focusout blur input input invalid invalid keydown keyDown keypress keyPress keyup keyUp mousedown mouseDown mouseup mouseUp paste paste pause pause play play pointercancel pointerCancel pointerdown pointerDown pointerup pointerUp ratechange rateChange reset reset seeked seeked submit submit touchcancel touchCancel touchend touchEnd touchstart touchStart volumechange volumeChange".split(" "),
	0);Pc("drag drag dragenter dragEnter dragexit dragExit dragleave dragLeave dragover dragOver mousemove mouseMove mouseout mouseOut mouseover mouseOver pointermove pointerMove pointerout pointerOut pointerover pointerOver scroll scroll toggle toggle touchmove touchMove wheel wheel".split(" "),1);Pc(Oc,2);for(var Ve="change selectionchange textInput compositionstart compositionend compositionupdate".split(" "),We=0;We<Ve.length;We++)Nc.set(Ve[We],0);ea("onMouseEnter",["mouseout","mouseover"]);
	ea("onMouseLeave",["mouseout","mouseover"]);ea("onPointerEnter",["pointerout","pointerover"]);ea("onPointerLeave",["pointerout","pointerover"]);da("onChange","change click focusin focusout input keydown keyup selectionchange".split(" "));da("onSelect","focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));da("onBeforeInput",["compositionend","keypress","textInput","paste"]);da("onCompositionEnd","compositionend focusout keydown keypress keyup mousedown".split(" "));
	da("onCompositionStart","compositionstart focusout keydown keypress keyup mousedown".split(" "));da("onCompositionUpdate","compositionupdate focusout keydown keypress keyup mousedown".split(" "));var Xe="abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),Ye=new Set("cancel close invalid load scroll toggle".split(" ").concat(Xe));
	function Ze(a,b,c){var d=a.type||"unknown-event";a.currentTarget=c;Yb(d,b,void 0,a);a.currentTarget=null;}
	function se(a,b){b=0!==(b&4);for(var c=0;c<a.length;c++){var d=a[c],e=d.event;d=d.listeners;a:{var f=void 0;if(b)for(var g=d.length-1;0<=g;g--){var h=d[g],k=h.instance,l=h.currentTarget;h=h.listener;if(k!==f&&e.isPropagationStopped())break a;Ze(e,h,l);f=k;}else for(g=0;g<d.length;g++){h=d[g];k=h.instance;l=h.currentTarget;h=h.listener;if(k!==f&&e.isPropagationStopped())break a;Ze(e,h,l);f=k;}}}if(Ub)throw a=Vb,Ub=!1,Vb=null,a;}
	function G$1(a,b){var c=$e(b),d=a+"__bubble";c.has(d)||(af(b,a,2,!1),c.add(d));}var bf="_reactListening"+Math.random().toString(36).slice(2);function cf(a){a[bf]||(a[bf]=!0,ba.forEach(function(b){Ye.has(b)||df(b,!1,a,null);df(b,!0,a,null);}));}
	function df(a,b,c,d){var e=4<arguments.length&&void 0!==arguments[4]?arguments[4]:0,f=c;"selectionchange"===a&&9!==c.nodeType&&(f=c.ownerDocument);if(null!==d&&!b&&Ye.has(a)){if("scroll"!==a)return;e|=2;f=d;}var g=$e(f),h=a+"__"+(b?"capture":"bubble");g.has(h)||(b&&(e|=4),af(f,a,e,b),g.add(h));}
	function af(a,b,c,d){var e=Nc.get(b);switch(void 0===e?2:e){case 0:e=gd;break;case 1:e=id;break;default:e=hd;}c=e.bind(null,b,c,a);e=void 0;!Pb||"touchstart"!==b&&"touchmove"!==b&&"wheel"!==b||(e=!0);d?void 0!==e?a.addEventListener(b,c,{capture:!0,passive:e}):a.addEventListener(b,c,!0):void 0!==e?a.addEventListener(b,c,{passive:e}):a.addEventListener(b,c,!1);}
	function jd(a,b,c,d,e){var f=d;if(0===(b&1)&&0===(b&2)&&null!==d)a:for(;;){if(null===d)return;var g=d.tag;if(3===g||4===g){var h=d.stateNode.containerInfo;if(h===e||8===h.nodeType&&h.parentNode===e)break;if(4===g)for(g=d.return;null!==g;){var k=g.tag;if(3===k||4===k)if(k=g.stateNode.containerInfo,k===e||8===k.nodeType&&k.parentNode===e)return;g=g.return;}for(;null!==h;){g=wc(h);if(null===g)return;k=g.tag;if(5===k||6===k){d=f=g;continue a}h=h.parentNode;}}d=d.return;}Nb(function(){var d=f,e=xb(c),g=[];
	a:{var h=Mc.get(a);if(void 0!==h){var k=td,x=a;switch(a){case "keypress":if(0===od(c))break a;case "keydown":case "keyup":k=Rd;break;case "focusin":x="focus";k=Fd;break;case "focusout":x="blur";k=Fd;break;case "beforeblur":case "afterblur":k=Fd;break;case "click":if(2===c.button)break a;case "auxclick":case "dblclick":case "mousedown":case "mousemove":case "mouseup":case "mouseout":case "mouseover":case "contextmenu":k=Bd;break;case "drag":case "dragend":case "dragenter":case "dragexit":case "dragleave":case "dragover":case "dragstart":case "drop":k=
	Dd;break;case "touchcancel":case "touchend":case "touchmove":case "touchstart":k=Vd;break;case Ic:case Jc:case Kc:k=Hd;break;case Lc:k=Xd;break;case "scroll":k=vd;break;case "wheel":k=Zd;break;case "copy":case "cut":case "paste":k=Jd;break;case "gotpointercapture":case "lostpointercapture":case "pointercancel":case "pointerdown":case "pointermove":case "pointerout":case "pointerover":case "pointerup":k=Td;}var w=0!==(b&4),z=!w&&"scroll"===a,u=w?null!==h?h+"Capture":null:h;w=[];for(var t=d,q;null!==
	t;){q=t;var v=q.stateNode;5===q.tag&&null!==v&&(q=v,null!==u&&(v=Ob(t,u),null!=v&&w.push(ef(t,v,q))));if(z)break;t=t.return;}0<w.length&&(h=new k(h,x,null,c,e),g.push({event:h,listeners:w}));}}if(0===(b&7)){a:{h="mouseover"===a||"pointerover"===a;k="mouseout"===a||"pointerout"===a;if(h&&0===(b&16)&&(x=c.relatedTarget||c.fromElement)&&(wc(x)||x[ff]))break a;if(k||h){h=e.window===e?e:(h=e.ownerDocument)?h.defaultView||h.parentWindow:window;if(k){if(x=c.relatedTarget||c.toElement,k=d,x=x?wc(x):null,null!==
	x&&(z=Zb(x),x!==z||5!==x.tag&&6!==x.tag))x=null;}else k=null,x=d;if(k!==x){w=Bd;v="onMouseLeave";u="onMouseEnter";t="mouse";if("pointerout"===a||"pointerover"===a)w=Td,v="onPointerLeave",u="onPointerEnter",t="pointer";z=null==k?h:ue(k);q=null==x?h:ue(x);h=new w(v,t+"leave",k,c,e);h.target=z;h.relatedTarget=q;v=null;wc(e)===d&&(w=new w(u,t+"enter",x,c,e),w.target=q,w.relatedTarget=z,v=w);z=v;if(k&&x)b:{w=k;u=x;t=0;for(q=w;q;q=gf(q))t++;q=0;for(v=u;v;v=gf(v))q++;for(;0<t-q;)w=gf(w),t--;for(;0<q-t;)u=
	gf(u),q--;for(;t--;){if(w===u||null!==u&&w===u.alternate)break b;w=gf(w);u=gf(u);}w=null;}else w=null;null!==k&&hf(g,h,k,w,!1);null!==x&&null!==z&&hf(g,z,x,w,!0);}}}a:{h=d?ue(d):window;k=h.nodeName&&h.nodeName.toLowerCase();if("select"===k||"input"===k&&"file"===h.type)var J=ve;else if(me(h))if(we)J=Fe;else {J=De;var K=Ce;}else (k=h.nodeName)&&"input"===k.toLowerCase()&&("checkbox"===h.type||"radio"===h.type)&&(J=Ee);if(J&&(J=J(a,d))){ne(g,J,c,e);break a}K&&K(a,h,d);"focusout"===a&&(K=h._wrapperState)&&
	K.controlled&&"number"===h.type&&bb(h,"number",h.value);}K=d?ue(d):window;switch(a){case "focusin":if(me(K)||"true"===K.contentEditable)Qe=K,Re=d,Se=null;break;case "focusout":Se=Re=Qe=null;break;case "mousedown":Te=!0;break;case "contextmenu":case "mouseup":case "dragend":Te=!1;Ue(g,c,e);break;case "selectionchange":if(Pe)break;case "keydown":case "keyup":Ue(g,c,e);}var Q;if(ae)b:{switch(a){case "compositionstart":var L="onCompositionStart";break b;case "compositionend":L="onCompositionEnd";break b;
	case "compositionupdate":L="onCompositionUpdate";break b}L=void 0;}else ie?ge(a,c)&&(L="onCompositionEnd"):"keydown"===a&&229===c.keyCode&&(L="onCompositionStart");L&&(de&&"ko"!==c.locale&&(ie||"onCompositionStart"!==L?"onCompositionEnd"===L&&ie&&(Q=nd()):(kd=e,ld="value"in kd?kd.value:kd.textContent,ie=!0)),K=oe(d,L),0<K.length&&(L=new Ld(L,a,null,c,e),g.push({event:L,listeners:K}),Q?L.data=Q:(Q=he(c),null!==Q&&(L.data=Q))));if(Q=ce?je(a,c):ke(a,c))d=oe(d,"onBeforeInput"),0<d.length&&(e=new Ld("onBeforeInput",
	"beforeinput",null,c,e),g.push({event:e,listeners:d}),e.data=Q);}se(g,b);});}function ef(a,b,c){return {instance:a,listener:b,currentTarget:c}}function oe(a,b){for(var c=b+"Capture",d=[];null!==a;){var e=a,f=e.stateNode;5===e.tag&&null!==f&&(e=f,f=Ob(a,c),null!=f&&d.unshift(ef(a,f,e)),f=Ob(a,b),null!=f&&d.push(ef(a,f,e)));a=a.return;}return d}function gf(a){if(null===a)return null;do a=a.return;while(a&&5!==a.tag);return a?a:null}
	function hf(a,b,c,d,e){for(var f=b._reactName,g=[];null!==c&&c!==d;){var h=c,k=h.alternate,l=h.stateNode;if(null!==k&&k===d)break;5===h.tag&&null!==l&&(h=l,e?(k=Ob(c,f),null!=k&&g.unshift(ef(c,k,h))):e||(k=Ob(c,f),null!=k&&g.push(ef(c,k,h))));c=c.return;}0!==g.length&&a.push({event:b,listeners:g});}function jf(){}var kf=null,lf=null;function mf(a,b){switch(a){case "button":case "input":case "select":case "textarea":return !!b.autoFocus}return !1}
	function nf(a,b){return "textarea"===a||"option"===a||"noscript"===a||"string"===typeof b.children||"number"===typeof b.children||"object"===typeof b.dangerouslySetInnerHTML&&null!==b.dangerouslySetInnerHTML&&null!=b.dangerouslySetInnerHTML.__html}var of="function"===typeof setTimeout?setTimeout:void 0,pf="function"===typeof clearTimeout?clearTimeout:void 0;function qf(a){1===a.nodeType?a.textContent="":9===a.nodeType&&(a=a.body,null!=a&&(a.textContent=""));}
	function rf(a){for(;null!=a;a=a.nextSibling){var b=a.nodeType;if(1===b||3===b)break}return a}function sf(a){a=a.previousSibling;for(var b=0;a;){if(8===a.nodeType){var c=a.data;if("$"===c||"$!"===c||"$?"===c){if(0===b)return a;b--;}else "/$"===c&&b++;}a=a.previousSibling;}return null}var tf=0;function uf(a){return {$$typeof:Ga,toString:a,valueOf:a}}var vf=Math.random().toString(36).slice(2),wf="__reactFiber$"+vf,xf="__reactProps$"+vf,ff="__reactContainer$"+vf,yf="__reactEvents$"+vf;
	function wc(a){var b=a[wf];if(b)return b;for(var c=a.parentNode;c;){if(b=c[ff]||c[wf]){c=b.alternate;if(null!==b.child||null!==c&&null!==c.child)for(a=sf(a);null!==a;){if(c=a[wf])return c;a=sf(a);}return b}a=c;c=a.parentNode;}return null}function Cb(a){a=a[wf]||a[ff];return !a||5!==a.tag&&6!==a.tag&&13!==a.tag&&3!==a.tag?null:a}function ue(a){if(5===a.tag||6===a.tag)return a.stateNode;throw Error(y$2(33));}function Db(a){return a[xf]||null}
	function $e(a){var b=a[yf];void 0===b&&(b=a[yf]=new Set);return b}var zf=[],Af=-1;function Bf(a){return {current:a}}function H$1(a){0>Af||(a.current=zf[Af],zf[Af]=null,Af--);}function I$1(a,b){Af++;zf[Af]=a.current;a.current=b;}var Cf={},M=Bf(Cf),N=Bf(!1),Df=Cf;
	function Ef(a,b){var c=a.type.contextTypes;if(!c)return Cf;var d=a.stateNode;if(d&&d.__reactInternalMemoizedUnmaskedChildContext===b)return d.__reactInternalMemoizedMaskedChildContext;var e={},f;for(f in c)e[f]=b[f];d&&(a=a.stateNode,a.__reactInternalMemoizedUnmaskedChildContext=b,a.__reactInternalMemoizedMaskedChildContext=e);return e}function Ff(a){a=a.childContextTypes;return null!==a&&void 0!==a}function Gf(){H$1(N);H$1(M);}function Hf(a,b,c){if(M.current!==Cf)throw Error(y$2(168));I$1(M,b);I$1(N,c);}
	function If(a,b,c){var d=a.stateNode;a=b.childContextTypes;if("function"!==typeof d.getChildContext)return c;d=d.getChildContext();for(var e in d)if(!(e in a))throw Error(y$2(108,Ra(b)||"Unknown",e));return m$2({},c,d)}function Jf(a){a=(a=a.stateNode)&&a.__reactInternalMemoizedMergedChildContext||Cf;Df=M.current;I$1(M,a);I$1(N,N.current);return !0}function Kf(a,b,c){var d=a.stateNode;if(!d)throw Error(y$2(169));c?(a=If(a,b,Df),d.__reactInternalMemoizedMergedChildContext=a,H$1(N),H$1(M),I$1(M,a)):H$1(N);I$1(N,c);}
	var Lf=null,Mf=null,Nf=r$3.unstable_runWithPriority,Of=r$3.unstable_scheduleCallback,Pf=r$3.unstable_cancelCallback,Qf=r$3.unstable_shouldYield,Rf=r$3.unstable_requestPaint,Sf=r$3.unstable_now,Tf=r$3.unstable_getCurrentPriorityLevel,Uf=r$3.unstable_ImmediatePriority,Vf=r$3.unstable_UserBlockingPriority,Wf=r$3.unstable_NormalPriority,Xf=r$3.unstable_LowPriority,Yf=r$3.unstable_IdlePriority,Zf={},$f=void 0!==Rf?Rf:function(){},ag=null,bg=null,cg=!1,dg=Sf(),O=1E4>dg?Sf:function(){return Sf()-dg};
	function eg(){switch(Tf()){case Uf:return 99;case Vf:return 98;case Wf:return 97;case Xf:return 96;case Yf:return 95;default:throw Error(y$2(332));}}function fg(a){switch(a){case 99:return Uf;case 98:return Vf;case 97:return Wf;case 96:return Xf;case 95:return Yf;default:throw Error(y$2(332));}}function gg(a,b){a=fg(a);return Nf(a,b)}function hg(a,b,c){a=fg(a);return Of(a,b,c)}function ig(){if(null!==bg){var a=bg;bg=null;Pf(a);}jg();}
	function jg(){if(!cg&&null!==ag){cg=!0;var a=0;try{var b=ag;gg(99,function(){for(;a<b.length;a++){var c=b[a];do c=c(!0);while(null!==c)}});ag=null;}catch(c){throw null!==ag&&(ag=ag.slice(a+1)),Of(Uf,ig),c;}finally{cg=!1;}}}var kg=ra.ReactCurrentBatchConfig;function lg(a,b){if(a&&a.defaultProps){b=m$2({},b);a=a.defaultProps;for(var c in a)void 0===b[c]&&(b[c]=a[c]);return b}return b}var mg=Bf(null),ng=null,og=null,pg=null;function qg(){pg=og=ng=null;}
	function rg(a){var b=mg.current;H$1(mg);a.type._context._currentValue=b;}function sg(a,b){for(;null!==a;){var c=a.alternate;if((a.childLanes&b)===b)if(null===c||(c.childLanes&b)===b)break;else c.childLanes|=b;else a.childLanes|=b,null!==c&&(c.childLanes|=b);a=a.return;}}function tg(a,b){ng=a;pg=og=null;a=a.dependencies;null!==a&&null!==a.firstContext&&(0!==(a.lanes&b)&&(ug=!0),a.firstContext=null);}
	function vg(a,b){if(pg!==a&&!1!==b&&0!==b){if("number"!==typeof b||1073741823===b)pg=a,b=1073741823;b={context:a,observedBits:b,next:null};if(null===og){if(null===ng)throw Error(y$2(308));og=b;ng.dependencies={lanes:0,firstContext:b,responders:null};}else og=og.next=b;}return a._currentValue}var wg=!1;function xg(a){a.updateQueue={baseState:a.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null},effects:null};}
	function yg(a,b){a=a.updateQueue;b.updateQueue===a&&(b.updateQueue={baseState:a.baseState,firstBaseUpdate:a.firstBaseUpdate,lastBaseUpdate:a.lastBaseUpdate,shared:a.shared,effects:a.effects});}function zg(a,b){return {eventTime:a,lane:b,tag:0,payload:null,callback:null,next:null}}function Ag(a,b){a=a.updateQueue;if(null!==a){a=a.shared;var c=a.pending;null===c?b.next=b:(b.next=c.next,c.next=b);a.pending=b;}}
	function Bg(a,b){var c=a.updateQueue,d=a.alternate;if(null!==d&&(d=d.updateQueue,c===d)){var e=null,f=null;c=c.firstBaseUpdate;if(null!==c){do{var g={eventTime:c.eventTime,lane:c.lane,tag:c.tag,payload:c.payload,callback:c.callback,next:null};null===f?e=f=g:f=f.next=g;c=c.next;}while(null!==c);null===f?e=f=b:f=f.next=b;}else e=f=b;c={baseState:d.baseState,firstBaseUpdate:e,lastBaseUpdate:f,shared:d.shared,effects:d.effects};a.updateQueue=c;return}a=c.lastBaseUpdate;null===a?c.firstBaseUpdate=b:a.next=
	b;c.lastBaseUpdate=b;}
	function Cg(a,b,c,d){var e=a.updateQueue;wg=!1;var f=e.firstBaseUpdate,g=e.lastBaseUpdate,h=e.shared.pending;if(null!==h){e.shared.pending=null;var k=h,l=k.next;k.next=null;null===g?f=l:g.next=l;g=k;var n=a.alternate;if(null!==n){n=n.updateQueue;var A=n.lastBaseUpdate;A!==g&&(null===A?n.firstBaseUpdate=l:A.next=l,n.lastBaseUpdate=k);}}if(null!==f){A=e.baseState;g=0;n=l=k=null;do{h=f.lane;var p=f.eventTime;if((d&h)===h){null!==n&&(n=n.next={eventTime:p,lane:0,tag:f.tag,payload:f.payload,callback:f.callback,
	next:null});a:{var C=a,x=f;h=b;p=c;switch(x.tag){case 1:C=x.payload;if("function"===typeof C){A=C.call(p,A,h);break a}A=C;break a;case 3:C.flags=C.flags&-4097|64;case 0:C=x.payload;h="function"===typeof C?C.call(p,A,h):C;if(null===h||void 0===h)break a;A=m$2({},A,h);break a;case 2:wg=!0;}}null!==f.callback&&(a.flags|=32,h=e.effects,null===h?e.effects=[f]:h.push(f));}else p={eventTime:p,lane:h,tag:f.tag,payload:f.payload,callback:f.callback,next:null},null===n?(l=n=p,k=A):n=n.next=p,g|=h;f=f.next;if(null===
	f)if(h=e.shared.pending,null===h)break;else f=h.next,h.next=null,e.lastBaseUpdate=h,e.shared.pending=null;}while(1);null===n&&(k=A);e.baseState=k;e.firstBaseUpdate=l;e.lastBaseUpdate=n;Dg|=g;a.lanes=g;a.memoizedState=A;}}function Eg(a,b,c){a=b.effects;b.effects=null;if(null!==a)for(b=0;b<a.length;b++){var d=a[b],e=d.callback;if(null!==e){d.callback=null;d=c;if("function"!==typeof e)throw Error(y$2(191,e));e.call(d);}}}var Fg=(new aa.Component).refs;
	function Gg(a,b,c,d){b=a.memoizedState;c=c(d,b);c=null===c||void 0===c?b:m$2({},b,c);a.memoizedState=c;0===a.lanes&&(a.updateQueue.baseState=c);}
	var Kg={isMounted:function(a){return (a=a._reactInternals)?Zb(a)===a:!1},enqueueSetState:function(a,b,c){a=a._reactInternals;var d=Hg(),e=Ig(a),f=zg(d,e);f.payload=b;void 0!==c&&null!==c&&(f.callback=c);Ag(a,f);Jg(a,e,d);},enqueueReplaceState:function(a,b,c){a=a._reactInternals;var d=Hg(),e=Ig(a),f=zg(d,e);f.tag=1;f.payload=b;void 0!==c&&null!==c&&(f.callback=c);Ag(a,f);Jg(a,e,d);},enqueueForceUpdate:function(a,b){a=a._reactInternals;var c=Hg(),d=Ig(a),e=zg(c,d);e.tag=2;void 0!==b&&null!==b&&(e.callback=
	b);Ag(a,e);Jg(a,d,c);}};function Lg(a,b,c,d,e,f,g){a=a.stateNode;return "function"===typeof a.shouldComponentUpdate?a.shouldComponentUpdate(d,f,g):b.prototype&&b.prototype.isPureReactComponent?!Je(c,d)||!Je(e,f):!0}
	function Mg(a,b,c){var d=!1,e=Cf;var f=b.contextType;"object"===typeof f&&null!==f?f=vg(f):(e=Ff(b)?Df:M.current,d=b.contextTypes,f=(d=null!==d&&void 0!==d)?Ef(a,e):Cf);b=new b(c,f);a.memoizedState=null!==b.state&&void 0!==b.state?b.state:null;b.updater=Kg;a.stateNode=b;b._reactInternals=a;d&&(a=a.stateNode,a.__reactInternalMemoizedUnmaskedChildContext=e,a.__reactInternalMemoizedMaskedChildContext=f);return b}
	function Ng(a,b,c,d){a=b.state;"function"===typeof b.componentWillReceiveProps&&b.componentWillReceiveProps(c,d);"function"===typeof b.UNSAFE_componentWillReceiveProps&&b.UNSAFE_componentWillReceiveProps(c,d);b.state!==a&&Kg.enqueueReplaceState(b,b.state,null);}
	function Og(a,b,c,d){var e=a.stateNode;e.props=c;e.state=a.memoizedState;e.refs=Fg;xg(a);var f=b.contextType;"object"===typeof f&&null!==f?e.context=vg(f):(f=Ff(b)?Df:M.current,e.context=Ef(a,f));Cg(a,c,e,d);e.state=a.memoizedState;f=b.getDerivedStateFromProps;"function"===typeof f&&(Gg(a,b,f,c),e.state=a.memoizedState);"function"===typeof b.getDerivedStateFromProps||"function"===typeof e.getSnapshotBeforeUpdate||"function"!==typeof e.UNSAFE_componentWillMount&&"function"!==typeof e.componentWillMount||
	(b=e.state,"function"===typeof e.componentWillMount&&e.componentWillMount(),"function"===typeof e.UNSAFE_componentWillMount&&e.UNSAFE_componentWillMount(),b!==e.state&&Kg.enqueueReplaceState(e,e.state,null),Cg(a,c,e,d),e.state=a.memoizedState);"function"===typeof e.componentDidMount&&(a.flags|=4);}var Pg=Array.isArray;
	function Qg(a,b,c){a=c.ref;if(null!==a&&"function"!==typeof a&&"object"!==typeof a){if(c._owner){c=c._owner;if(c){if(1!==c.tag)throw Error(y$2(309));var d=c.stateNode;}if(!d)throw Error(y$2(147,a));var e=""+a;if(null!==b&&null!==b.ref&&"function"===typeof b.ref&&b.ref._stringRef===e)return b.ref;b=function(a){var b=d.refs;b===Fg&&(b=d.refs={});null===a?delete b[e]:b[e]=a;};b._stringRef=e;return b}if("string"!==typeof a)throw Error(y$2(284));if(!c._owner)throw Error(y$2(290,a));}return a}
	function Rg(a,b){if("textarea"!==a.type)throw Error(y$2(31,"[object Object]"===Object.prototype.toString.call(b)?"object with keys {"+Object.keys(b).join(", ")+"}":b));}
	function Sg(a){function b(b,c){if(a){var d=b.lastEffect;null!==d?(d.nextEffect=c,b.lastEffect=c):b.firstEffect=b.lastEffect=c;c.nextEffect=null;c.flags=8;}}function c(c,d){if(!a)return null;for(;null!==d;)b(c,d),d=d.sibling;return null}function d(a,b){for(a=new Map;null!==b;)null!==b.key?a.set(b.key,b):a.set(b.index,b),b=b.sibling;return a}function e(a,b){a=Tg(a,b);a.index=0;a.sibling=null;return a}function f(b,c,d){b.index=d;if(!a)return c;d=b.alternate;if(null!==d)return d=d.index,d<c?(b.flags=2,
	c):d;b.flags=2;return c}function g(b){a&&null===b.alternate&&(b.flags=2);return b}function h(a,b,c,d){if(null===b||6!==b.tag)return b=Ug(c,a.mode,d),b.return=a,b;b=e(b,c);b.return=a;return b}function k(a,b,c,d){if(null!==b&&b.elementType===c.type)return d=e(b,c.props),d.ref=Qg(a,b,c),d.return=a,d;d=Vg(c.type,c.key,c.props,null,a.mode,d);d.ref=Qg(a,b,c);d.return=a;return d}function l(a,b,c,d){if(null===b||4!==b.tag||b.stateNode.containerInfo!==c.containerInfo||b.stateNode.implementation!==c.implementation)return b=
	Wg(c,a.mode,d),b.return=a,b;b=e(b,c.children||[]);b.return=a;return b}function n(a,b,c,d,f){if(null===b||7!==b.tag)return b=Xg(c,a.mode,d,f),b.return=a,b;b=e(b,c);b.return=a;return b}function A(a,b,c){if("string"===typeof b||"number"===typeof b)return b=Ug(""+b,a.mode,c),b.return=a,b;if("object"===typeof b&&null!==b){switch(b.$$typeof){case sa:return c=Vg(b.type,b.key,b.props,null,a.mode,c),c.ref=Qg(a,null,b),c.return=a,c;case ta:return b=Wg(b,a.mode,c),b.return=a,b}if(Pg(b)||La(b))return b=Xg(b,
	a.mode,c,null),b.return=a,b;Rg(a,b);}return null}function p(a,b,c,d){var e=null!==b?b.key:null;if("string"===typeof c||"number"===typeof c)return null!==e?null:h(a,b,""+c,d);if("object"===typeof c&&null!==c){switch(c.$$typeof){case sa:return c.key===e?c.type===ua?n(a,b,c.props.children,d,e):k(a,b,c,d):null;case ta:return c.key===e?l(a,b,c,d):null}if(Pg(c)||La(c))return null!==e?null:n(a,b,c,d,null);Rg(a,c);}return null}function C(a,b,c,d,e){if("string"===typeof d||"number"===typeof d)return a=a.get(c)||
	null,h(b,a,""+d,e);if("object"===typeof d&&null!==d){switch(d.$$typeof){case sa:return a=a.get(null===d.key?c:d.key)||null,d.type===ua?n(b,a,d.props.children,e,d.key):k(b,a,d,e);case ta:return a=a.get(null===d.key?c:d.key)||null,l(b,a,d,e)}if(Pg(d)||La(d))return a=a.get(c)||null,n(b,a,d,e,null);Rg(b,d);}return null}function x(e,g,h,k){for(var l=null,t=null,u=g,z=g=0,q=null;null!==u&&z<h.length;z++){u.index>z?(q=u,u=null):q=u.sibling;var n=p(e,u,h[z],k);if(null===n){null===u&&(u=q);break}a&&u&&null===
	n.alternate&&b(e,u);g=f(n,g,z);null===t?l=n:t.sibling=n;t=n;u=q;}if(z===h.length)return c(e,u),l;if(null===u){for(;z<h.length;z++)u=A(e,h[z],k),null!==u&&(g=f(u,g,z),null===t?l=u:t.sibling=u,t=u);return l}for(u=d(e,u);z<h.length;z++)q=C(u,e,z,h[z],k),null!==q&&(a&&null!==q.alternate&&u.delete(null===q.key?z:q.key),g=f(q,g,z),null===t?l=q:t.sibling=q,t=q);a&&u.forEach(function(a){return b(e,a)});return l}function w(e,g,h,k){var l=La(h);if("function"!==typeof l)throw Error(y$2(150));h=l.call(h);if(null==
	h)throw Error(y$2(151));for(var t=l=null,u=g,z=g=0,q=null,n=h.next();null!==u&&!n.done;z++,n=h.next()){u.index>z?(q=u,u=null):q=u.sibling;var w=p(e,u,n.value,k);if(null===w){null===u&&(u=q);break}a&&u&&null===w.alternate&&b(e,u);g=f(w,g,z);null===t?l=w:t.sibling=w;t=w;u=q;}if(n.done)return c(e,u),l;if(null===u){for(;!n.done;z++,n=h.next())n=A(e,n.value,k),null!==n&&(g=f(n,g,z),null===t?l=n:t.sibling=n,t=n);return l}for(u=d(e,u);!n.done;z++,n=h.next())n=C(u,e,z,n.value,k),null!==n&&(a&&null!==n.alternate&&
	u.delete(null===n.key?z:n.key),g=f(n,g,z),null===t?l=n:t.sibling=n,t=n);a&&u.forEach(function(a){return b(e,a)});return l}return function(a,d,f,h){var k="object"===typeof f&&null!==f&&f.type===ua&&null===f.key;k&&(f=f.props.children);var l="object"===typeof f&&null!==f;if(l)switch(f.$$typeof){case sa:a:{l=f.key;for(k=d;null!==k;){if(k.key===l){switch(k.tag){case 7:if(f.type===ua){c(a,k.sibling);d=e(k,f.props.children);d.return=a;a=d;break a}break;default:if(k.elementType===f.type){c(a,k.sibling);
	d=e(k,f.props);d.ref=Qg(a,k,f);d.return=a;a=d;break a}}c(a,k);break}else b(a,k);k=k.sibling;}f.type===ua?(d=Xg(f.props.children,a.mode,h,f.key),d.return=a,a=d):(h=Vg(f.type,f.key,f.props,null,a.mode,h),h.ref=Qg(a,d,f),h.return=a,a=h);}return g(a);case ta:a:{for(k=f.key;null!==d;){if(d.key===k)if(4===d.tag&&d.stateNode.containerInfo===f.containerInfo&&d.stateNode.implementation===f.implementation){c(a,d.sibling);d=e(d,f.children||[]);d.return=a;a=d;break a}else {c(a,d);break}else b(a,d);d=d.sibling;}d=
	Wg(f,a.mode,h);d.return=a;a=d;}return g(a)}if("string"===typeof f||"number"===typeof f)return f=""+f,null!==d&&6===d.tag?(c(a,d.sibling),d=e(d,f),d.return=a,a=d):(c(a,d),d=Ug(f,a.mode,h),d.return=a,a=d),g(a);if(Pg(f))return x(a,d,f,h);if(La(f))return w(a,d,f,h);l&&Rg(a,f);if("undefined"===typeof f&&!k)switch(a.tag){case 1:case 22:case 0:case 11:case 15:throw Error(y$2(152,Ra(a.type)||"Component"));}return c(a,d)}}var Yg=Sg(!0),Zg=Sg(!1),$g={},ah=Bf($g),bh=Bf($g),ch=Bf($g);
	function dh(a){if(a===$g)throw Error(y$2(174));return a}function eh(a,b){I$1(ch,b);I$1(bh,a);I$1(ah,$g);a=b.nodeType;switch(a){case 9:case 11:b=(b=b.documentElement)?b.namespaceURI:mb(null,"");break;default:a=8===a?b.parentNode:b,b=a.namespaceURI||null,a=a.tagName,b=mb(b,a);}H$1(ah);I$1(ah,b);}function fh(){H$1(ah);H$1(bh);H$1(ch);}function gh(a){dh(ch.current);var b=dh(ah.current);var c=mb(b,a.type);b!==c&&(I$1(bh,a),I$1(ah,c));}function hh(a){bh.current===a&&(H$1(ah),H$1(bh));}var P=Bf(0);
	function ih(a){for(var b=a;null!==b;){if(13===b.tag){var c=b.memoizedState;if(null!==c&&(c=c.dehydrated,null===c||"$?"===c.data||"$!"===c.data))return b}else if(19===b.tag&&void 0!==b.memoizedProps.revealOrder){if(0!==(b.flags&64))return b}else if(null!==b.child){b.child.return=b;b=b.child;continue}if(b===a)break;for(;null===b.sibling;){if(null===b.return||b.return===a)return null;b=b.return;}b.sibling.return=b.return;b=b.sibling;}return null}var jh=null,kh=null,lh=!1;
	function mh(a,b){var c=nh(5,null,null,0);c.elementType="DELETED";c.type="DELETED";c.stateNode=b;c.return=a;c.flags=8;null!==a.lastEffect?(a.lastEffect.nextEffect=c,a.lastEffect=c):a.firstEffect=a.lastEffect=c;}function oh(a,b){switch(a.tag){case 5:var c=a.type;b=1!==b.nodeType||c.toLowerCase()!==b.nodeName.toLowerCase()?null:b;return null!==b?(a.stateNode=b,!0):!1;case 6:return b=""===a.pendingProps||3!==b.nodeType?null:b,null!==b?(a.stateNode=b,!0):!1;case 13:return !1;default:return !1}}
	function ph(a){if(lh){var b=kh;if(b){var c=b;if(!oh(a,b)){b=rf(c.nextSibling);if(!b||!oh(a,b)){a.flags=a.flags&-1025|2;lh=!1;jh=a;return}mh(jh,c);}jh=a;kh=rf(b.firstChild);}else a.flags=a.flags&-1025|2,lh=!1,jh=a;}}function qh(a){for(a=a.return;null!==a&&5!==a.tag&&3!==a.tag&&13!==a.tag;)a=a.return;jh=a;}
	function rh(a){if(a!==jh)return !1;if(!lh)return qh(a),lh=!0,!1;var b=a.type;if(5!==a.tag||"head"!==b&&"body"!==b&&!nf(b,a.memoizedProps))for(b=kh;b;)mh(a,b),b=rf(b.nextSibling);qh(a);if(13===a.tag){a=a.memoizedState;a=null!==a?a.dehydrated:null;if(!a)throw Error(y$2(317));a:{a=a.nextSibling;for(b=0;a;){if(8===a.nodeType){var c=a.data;if("/$"===c){if(0===b){kh=rf(a.nextSibling);break a}b--;}else "$"!==c&&"$!"!==c&&"$?"!==c||b++;}a=a.nextSibling;}kh=null;}}else kh=jh?rf(a.stateNode.nextSibling):null;return !0}
	function sh(){kh=jh=null;lh=!1;}var th=[];function uh(){for(var a=0;a<th.length;a++)th[a]._workInProgressVersionPrimary=null;th.length=0;}var vh=ra.ReactCurrentDispatcher,wh=ra.ReactCurrentBatchConfig,xh=0,R=null,S=null,T=null,yh=!1,zh=!1;function Ah(){throw Error(y$2(321));}function Bh(a,b){if(null===b)return !1;for(var c=0;c<b.length&&c<a.length;c++)if(!He(a[c],b[c]))return !1;return !0}
	function Ch(a,b,c,d,e,f){xh=f;R=b;b.memoizedState=null;b.updateQueue=null;b.lanes=0;vh.current=null===a||null===a.memoizedState?Dh:Eh;a=c(d,e);if(zh){f=0;do{zh=!1;if(!(25>f))throw Error(y$2(301));f+=1;T=S=null;b.updateQueue=null;vh.current=Fh;a=c(d,e);}while(zh)}vh.current=Gh;b=null!==S&&null!==S.next;xh=0;T=S=R=null;yh=!1;if(b)throw Error(y$2(300));return a}function Hh(){var a={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};null===T?R.memoizedState=T=a:T=T.next=a;return T}
	function Ih(){if(null===S){var a=R.alternate;a=null!==a?a.memoizedState:null;}else a=S.next;var b=null===T?R.memoizedState:T.next;if(null!==b)T=b,S=a;else {if(null===a)throw Error(y$2(310));S=a;a={memoizedState:S.memoizedState,baseState:S.baseState,baseQueue:S.baseQueue,queue:S.queue,next:null};null===T?R.memoizedState=T=a:T=T.next=a;}return T}function Jh(a,b){return "function"===typeof b?b(a):b}
	function Kh(a){var b=Ih(),c=b.queue;if(null===c)throw Error(y$2(311));c.lastRenderedReducer=a;var d=S,e=d.baseQueue,f=c.pending;if(null!==f){if(null!==e){var g=e.next;e.next=f.next;f.next=g;}d.baseQueue=e=f;c.pending=null;}if(null!==e){e=e.next;d=d.baseState;var h=g=f=null,k=e;do{var l=k.lane;if((xh&l)===l)null!==h&&(h=h.next={lane:0,action:k.action,eagerReducer:k.eagerReducer,eagerState:k.eagerState,next:null}),d=k.eagerReducer===a?k.eagerState:a(d,k.action);else {var n={lane:l,action:k.action,eagerReducer:k.eagerReducer,
	eagerState:k.eagerState,next:null};null===h?(g=h=n,f=d):h=h.next=n;R.lanes|=l;Dg|=l;}k=k.next;}while(null!==k&&k!==e);null===h?f=d:h.next=g;He(d,b.memoizedState)||(ug=!0);b.memoizedState=d;b.baseState=f;b.baseQueue=h;c.lastRenderedState=d;}return [b.memoizedState,c.dispatch]}
	function Lh(a){var b=Ih(),c=b.queue;if(null===c)throw Error(y$2(311));c.lastRenderedReducer=a;var d=c.dispatch,e=c.pending,f=b.memoizedState;if(null!==e){c.pending=null;var g=e=e.next;do f=a(f,g.action),g=g.next;while(g!==e);He(f,b.memoizedState)||(ug=!0);b.memoizedState=f;null===b.baseQueue&&(b.baseState=f);c.lastRenderedState=f;}return [f,d]}
	function Mh(a,b,c){var d=b._getVersion;d=d(b._source);var e=b._workInProgressVersionPrimary;if(null!==e)a=e===d;else if(a=a.mutableReadLanes,a=(xh&a)===a)b._workInProgressVersionPrimary=d,th.push(b);if(a)return c(b._source);th.push(b);throw Error(y$2(350));}
	function Nh(a,b,c,d){var e=U;if(null===e)throw Error(y$2(349));var f=b._getVersion,g=f(b._source),h=vh.current,k=h.useState(function(){return Mh(e,b,c)}),l=k[1],n=k[0];k=T;var A=a.memoizedState,p=A.refs,C=p.getSnapshot,x=A.source;A=A.subscribe;var w=R;a.memoizedState={refs:p,source:b,subscribe:d};h.useEffect(function(){p.getSnapshot=c;p.setSnapshot=l;var a=f(b._source);if(!He(g,a)){a=c(b._source);He(n,a)||(l(a),a=Ig(w),e.mutableReadLanes|=a&e.pendingLanes);a=e.mutableReadLanes;e.entangledLanes|=a;for(var d=
	e.entanglements,h=a;0<h;){var k=31-Vc(h),v=1<<k;d[k]|=a;h&=~v;}}},[c,b,d]);h.useEffect(function(){return d(b._source,function(){var a=p.getSnapshot,c=p.setSnapshot;try{c(a(b._source));var d=Ig(w);e.mutableReadLanes|=d&e.pendingLanes;}catch(q){c(function(){throw q;});}})},[b,d]);He(C,c)&&He(x,b)&&He(A,d)||(a={pending:null,dispatch:null,lastRenderedReducer:Jh,lastRenderedState:n},a.dispatch=l=Oh.bind(null,R,a),k.queue=a,k.baseQueue=null,n=Mh(e,b,c),k.memoizedState=k.baseState=n);return n}
	function Ph(a,b,c){var d=Ih();return Nh(d,a,b,c)}function Qh(a){var b=Hh();"function"===typeof a&&(a=a());b.memoizedState=b.baseState=a;a=b.queue={pending:null,dispatch:null,lastRenderedReducer:Jh,lastRenderedState:a};a=a.dispatch=Oh.bind(null,R,a);return [b.memoizedState,a]}
	function Rh(a,b,c,d){a={tag:a,create:b,destroy:c,deps:d,next:null};b=R.updateQueue;null===b?(b={lastEffect:null},R.updateQueue=b,b.lastEffect=a.next=a):(c=b.lastEffect,null===c?b.lastEffect=a.next=a:(d=c.next,c.next=a,a.next=d,b.lastEffect=a));return a}function Sh(a){var b=Hh();a={current:a};return b.memoizedState=a}function Th(){return Ih().memoizedState}function Uh(a,b,c,d){var e=Hh();R.flags|=a;e.memoizedState=Rh(1|b,c,void 0,void 0===d?null:d);}
	function Vh(a,b,c,d){var e=Ih();d=void 0===d?null:d;var f=void 0;if(null!==S){var g=S.memoizedState;f=g.destroy;if(null!==d&&Bh(d,g.deps)){Rh(b,c,f,d);return}}R.flags|=a;e.memoizedState=Rh(1|b,c,f,d);}function Wh(a,b){return Uh(516,4,a,b)}function Xh(a,b){return Vh(516,4,a,b)}function Yh(a,b){return Vh(4,2,a,b)}function Zh(a,b){if("function"===typeof b)return a=a(),b(a),function(){b(null);};if(null!==b&&void 0!==b)return a=a(),b.current=a,function(){b.current=null;}}
	function $h(a,b,c){c=null!==c&&void 0!==c?c.concat([a]):null;return Vh(4,2,Zh.bind(null,b,a),c)}function ai(){}function bi(a,b){var c=Ih();b=void 0===b?null:b;var d=c.memoizedState;if(null!==d&&null!==b&&Bh(b,d[1]))return d[0];c.memoizedState=[a,b];return a}function ci(a,b){var c=Ih();b=void 0===b?null:b;var d=c.memoizedState;if(null!==d&&null!==b&&Bh(b,d[1]))return d[0];a=a();c.memoizedState=[a,b];return a}
	function di(a,b){var c=eg();gg(98>c?98:c,function(){a(!0);});gg(97<c?97:c,function(){var c=wh.transition;wh.transition=1;try{a(!1),b();}finally{wh.transition=c;}});}
	function Oh(a,b,c){var d=Hg(),e=Ig(a),f={lane:e,action:c,eagerReducer:null,eagerState:null,next:null},g=b.pending;null===g?f.next=f:(f.next=g.next,g.next=f);b.pending=f;g=a.alternate;if(a===R||null!==g&&g===R)zh=yh=!0;else {if(0===a.lanes&&(null===g||0===g.lanes)&&(g=b.lastRenderedReducer,null!==g))try{var h=b.lastRenderedState,k=g(h,c);f.eagerReducer=g;f.eagerState=k;if(He(k,h))return}catch(l){}finally{}Jg(a,e,d);}}
	var Gh={readContext:vg,useCallback:Ah,useContext:Ah,useEffect:Ah,useImperativeHandle:Ah,useLayoutEffect:Ah,useMemo:Ah,useReducer:Ah,useRef:Ah,useState:Ah,useDebugValue:Ah,useDeferredValue:Ah,useTransition:Ah,useMutableSource:Ah,useOpaqueIdentifier:Ah,unstable_isNewReconciler:!1},Dh={readContext:vg,useCallback:function(a,b){Hh().memoizedState=[a,void 0===b?null:b];return a},useContext:vg,useEffect:Wh,useImperativeHandle:function(a,b,c){c=null!==c&&void 0!==c?c.concat([a]):null;return Uh(4,2,Zh.bind(null,
	b,a),c)},useLayoutEffect:function(a,b){return Uh(4,2,a,b)},useMemo:function(a,b){var c=Hh();b=void 0===b?null:b;a=a();c.memoizedState=[a,b];return a},useReducer:function(a,b,c){var d=Hh();b=void 0!==c?c(b):b;d.memoizedState=d.baseState=b;a=d.queue={pending:null,dispatch:null,lastRenderedReducer:a,lastRenderedState:b};a=a.dispatch=Oh.bind(null,R,a);return [d.memoizedState,a]},useRef:Sh,useState:Qh,useDebugValue:ai,useDeferredValue:function(a){var b=Qh(a),c=b[0],d=b[1];Wh(function(){var b=wh.transition;
	wh.transition=1;try{d(a);}finally{wh.transition=b;}},[a]);return c},useTransition:function(){var a=Qh(!1),b=a[0];a=di.bind(null,a[1]);Sh(a);return [a,b]},useMutableSource:function(a,b,c){var d=Hh();d.memoizedState={refs:{getSnapshot:b,setSnapshot:null},source:a,subscribe:c};return Nh(d,a,b,c)},useOpaqueIdentifier:function(){if(lh){var a=!1,b=uf(function(){a||(a=!0,c("r:"+(tf++).toString(36)));throw Error(y$2(355));}),c=Qh(b)[1];0===(R.mode&2)&&(R.flags|=516,Rh(5,function(){c("r:"+(tf++).toString(36));},
	void 0,null));return b}b="r:"+(tf++).toString(36);Qh(b);return b},unstable_isNewReconciler:!1},Eh={readContext:vg,useCallback:bi,useContext:vg,useEffect:Xh,useImperativeHandle:$h,useLayoutEffect:Yh,useMemo:ci,useReducer:Kh,useRef:Th,useState:function(){return Kh(Jh)},useDebugValue:ai,useDeferredValue:function(a){var b=Kh(Jh),c=b[0],d=b[1];Xh(function(){var b=wh.transition;wh.transition=1;try{d(a);}finally{wh.transition=b;}},[a]);return c},useTransition:function(){var a=Kh(Jh)[0];return [Th().current,
	a]},useMutableSource:Ph,useOpaqueIdentifier:function(){return Kh(Jh)[0]},unstable_isNewReconciler:!1},Fh={readContext:vg,useCallback:bi,useContext:vg,useEffect:Xh,useImperativeHandle:$h,useLayoutEffect:Yh,useMemo:ci,useReducer:Lh,useRef:Th,useState:function(){return Lh(Jh)},useDebugValue:ai,useDeferredValue:function(a){var b=Lh(Jh),c=b[0],d=b[1];Xh(function(){var b=wh.transition;wh.transition=1;try{d(a);}finally{wh.transition=b;}},[a]);return c},useTransition:function(){var a=Lh(Jh)[0];return [Th().current,
	a]},useMutableSource:Ph,useOpaqueIdentifier:function(){return Lh(Jh)[0]},unstable_isNewReconciler:!1},ei=ra.ReactCurrentOwner,ug=!1;function fi(a,b,c,d){b.child=null===a?Zg(b,null,c,d):Yg(b,a.child,c,d);}function gi(a,b,c,d,e){c=c.render;var f=b.ref;tg(b,e);d=Ch(a,b,c,d,f,e);if(null!==a&&!ug)return b.updateQueue=a.updateQueue,b.flags&=-517,a.lanes&=~e,hi(a,b,e);b.flags|=1;fi(a,b,d,e);return b.child}
	function ii(a,b,c,d,e,f){if(null===a){var g=c.type;if("function"===typeof g&&!ji(g)&&void 0===g.defaultProps&&null===c.compare&&void 0===c.defaultProps)return b.tag=15,b.type=g,ki(a,b,g,d,e,f);a=Vg(c.type,null,d,b,b.mode,f);a.ref=b.ref;a.return=b;return b.child=a}g=a.child;if(0===(e&f)&&(e=g.memoizedProps,c=c.compare,c=null!==c?c:Je,c(e,d)&&a.ref===b.ref))return hi(a,b,f);b.flags|=1;a=Tg(g,d);a.ref=b.ref;a.return=b;return b.child=a}
	function ki(a,b,c,d,e,f){if(null!==a&&Je(a.memoizedProps,d)&&a.ref===b.ref)if(ug=!1,0!==(f&e))0!==(a.flags&16384)&&(ug=!0);else return b.lanes=a.lanes,hi(a,b,f);return li(a,b,c,d,f)}
	function mi(a,b,c){var d=b.pendingProps,e=d.children,f=null!==a?a.memoizedState:null;if("hidden"===d.mode||"unstable-defer-without-hiding"===d.mode)if(0===(b.mode&4))b.memoizedState={baseLanes:0},ni(b,c);else if(0!==(c&1073741824))b.memoizedState={baseLanes:0},ni(b,null!==f?f.baseLanes:c);else return a=null!==f?f.baseLanes|c:c,b.lanes=b.childLanes=1073741824,b.memoizedState={baseLanes:a},ni(b,a),null;else null!==f?(d=f.baseLanes|c,b.memoizedState=null):d=c,ni(b,d);fi(a,b,e,c);return b.child}
	function oi(a,b){var c=b.ref;if(null===a&&null!==c||null!==a&&a.ref!==c)b.flags|=128;}function li(a,b,c,d,e){var f=Ff(c)?Df:M.current;f=Ef(b,f);tg(b,e);c=Ch(a,b,c,d,f,e);if(null!==a&&!ug)return b.updateQueue=a.updateQueue,b.flags&=-517,a.lanes&=~e,hi(a,b,e);b.flags|=1;fi(a,b,c,e);return b.child}
	function pi(a,b,c,d,e){if(Ff(c)){var f=!0;Jf(b);}else f=!1;tg(b,e);if(null===b.stateNode)null!==a&&(a.alternate=null,b.alternate=null,b.flags|=2),Mg(b,c,d),Og(b,c,d,e),d=!0;else if(null===a){var g=b.stateNode,h=b.memoizedProps;g.props=h;var k=g.context,l=c.contextType;"object"===typeof l&&null!==l?l=vg(l):(l=Ff(c)?Df:M.current,l=Ef(b,l));var n=c.getDerivedStateFromProps,A="function"===typeof n||"function"===typeof g.getSnapshotBeforeUpdate;A||"function"!==typeof g.UNSAFE_componentWillReceiveProps&&
	"function"!==typeof g.componentWillReceiveProps||(h!==d||k!==l)&&Ng(b,g,d,l);wg=!1;var p=b.memoizedState;g.state=p;Cg(b,d,g,e);k=b.memoizedState;h!==d||p!==k||N.current||wg?("function"===typeof n&&(Gg(b,c,n,d),k=b.memoizedState),(h=wg||Lg(b,c,h,d,p,k,l))?(A||"function"!==typeof g.UNSAFE_componentWillMount&&"function"!==typeof g.componentWillMount||("function"===typeof g.componentWillMount&&g.componentWillMount(),"function"===typeof g.UNSAFE_componentWillMount&&g.UNSAFE_componentWillMount()),"function"===
	typeof g.componentDidMount&&(b.flags|=4)):("function"===typeof g.componentDidMount&&(b.flags|=4),b.memoizedProps=d,b.memoizedState=k),g.props=d,g.state=k,g.context=l,d=h):("function"===typeof g.componentDidMount&&(b.flags|=4),d=!1);}else {g=b.stateNode;yg(a,b);h=b.memoizedProps;l=b.type===b.elementType?h:lg(b.type,h);g.props=l;A=b.pendingProps;p=g.context;k=c.contextType;"object"===typeof k&&null!==k?k=vg(k):(k=Ff(c)?Df:M.current,k=Ef(b,k));var C=c.getDerivedStateFromProps;(n="function"===typeof C||
	"function"===typeof g.getSnapshotBeforeUpdate)||"function"!==typeof g.UNSAFE_componentWillReceiveProps&&"function"!==typeof g.componentWillReceiveProps||(h!==A||p!==k)&&Ng(b,g,d,k);wg=!1;p=b.memoizedState;g.state=p;Cg(b,d,g,e);var x=b.memoizedState;h!==A||p!==x||N.current||wg?("function"===typeof C&&(Gg(b,c,C,d),x=b.memoizedState),(l=wg||Lg(b,c,l,d,p,x,k))?(n||"function"!==typeof g.UNSAFE_componentWillUpdate&&"function"!==typeof g.componentWillUpdate||("function"===typeof g.componentWillUpdate&&g.componentWillUpdate(d,
	x,k),"function"===typeof g.UNSAFE_componentWillUpdate&&g.UNSAFE_componentWillUpdate(d,x,k)),"function"===typeof g.componentDidUpdate&&(b.flags|=4),"function"===typeof g.getSnapshotBeforeUpdate&&(b.flags|=256)):("function"!==typeof g.componentDidUpdate||h===a.memoizedProps&&p===a.memoizedState||(b.flags|=4),"function"!==typeof g.getSnapshotBeforeUpdate||h===a.memoizedProps&&p===a.memoizedState||(b.flags|=256),b.memoizedProps=d,b.memoizedState=x),g.props=d,g.state=x,g.context=k,d=l):("function"!==typeof g.componentDidUpdate||
	h===a.memoizedProps&&p===a.memoizedState||(b.flags|=4),"function"!==typeof g.getSnapshotBeforeUpdate||h===a.memoizedProps&&p===a.memoizedState||(b.flags|=256),d=!1);}return qi(a,b,c,d,f,e)}
	function qi(a,b,c,d,e,f){oi(a,b);var g=0!==(b.flags&64);if(!d&&!g)return e&&Kf(b,c,!1),hi(a,b,f);d=b.stateNode;ei.current=b;var h=g&&"function"!==typeof c.getDerivedStateFromError?null:d.render();b.flags|=1;null!==a&&g?(b.child=Yg(b,a.child,null,f),b.child=Yg(b,null,h,f)):fi(a,b,h,f);b.memoizedState=d.state;e&&Kf(b,c,!0);return b.child}function ri(a){var b=a.stateNode;b.pendingContext?Hf(a,b.pendingContext,b.pendingContext!==b.context):b.context&&Hf(a,b.context,!1);eh(a,b.containerInfo);}
	var si={dehydrated:null,retryLane:0};
	function ti(a,b,c){var d=b.pendingProps,e=P.current,f=!1,g;(g=0!==(b.flags&64))||(g=null!==a&&null===a.memoizedState?!1:0!==(e&2));g?(f=!0,b.flags&=-65):null!==a&&null===a.memoizedState||void 0===d.fallback||!0===d.unstable_avoidThisFallback||(e|=1);I$1(P,e&1);if(null===a){void 0!==d.fallback&&ph(b);a=d.children;e=d.fallback;if(f)return a=ui(b,a,e,c),b.child.memoizedState={baseLanes:c},b.memoizedState=si,a;if("number"===typeof d.unstable_expectedLoadTime)return a=ui(b,a,e,c),b.child.memoizedState={baseLanes:c},
	b.memoizedState=si,b.lanes=33554432,a;c=vi({mode:"visible",children:a},b.mode,c,null);c.return=b;return b.child=c}if(null!==a.memoizedState){if(f)return d=wi(a,b,d.children,d.fallback,c),f=b.child,e=a.child.memoizedState,f.memoizedState=null===e?{baseLanes:c}:{baseLanes:e.baseLanes|c},f.childLanes=a.childLanes&~c,b.memoizedState=si,d;c=xi(a,b,d.children,c);b.memoizedState=null;return c}if(f)return d=wi(a,b,d.children,d.fallback,c),f=b.child,e=a.child.memoizedState,f.memoizedState=null===e?{baseLanes:c}:
	{baseLanes:e.baseLanes|c},f.childLanes=a.childLanes&~c,b.memoizedState=si,d;c=xi(a,b,d.children,c);b.memoizedState=null;return c}function ui(a,b,c,d){var e=a.mode,f=a.child;b={mode:"hidden",children:b};0===(e&2)&&null!==f?(f.childLanes=0,f.pendingProps=b):f=vi(b,e,0,null);c=Xg(c,e,d,null);f.return=a;c.return=a;f.sibling=c;a.child=f;return c}
	function xi(a,b,c,d){var e=a.child;a=e.sibling;c=Tg(e,{mode:"visible",children:c});0===(b.mode&2)&&(c.lanes=d);c.return=b;c.sibling=null;null!==a&&(a.nextEffect=null,a.flags=8,b.firstEffect=b.lastEffect=a);return b.child=c}
	function wi(a,b,c,d,e){var f=b.mode,g=a.child;a=g.sibling;var h={mode:"hidden",children:c};0===(f&2)&&b.child!==g?(c=b.child,c.childLanes=0,c.pendingProps=h,g=c.lastEffect,null!==g?(b.firstEffect=c.firstEffect,b.lastEffect=g,g.nextEffect=null):b.firstEffect=b.lastEffect=null):c=Tg(g,h);null!==a?d=Tg(a,d):(d=Xg(d,f,e,null),d.flags|=2);d.return=b;c.return=b;c.sibling=d;b.child=c;return d}function yi(a,b){a.lanes|=b;var c=a.alternate;null!==c&&(c.lanes|=b);sg(a.return,b);}
	function zi(a,b,c,d,e,f){var g=a.memoizedState;null===g?a.memoizedState={isBackwards:b,rendering:null,renderingStartTime:0,last:d,tail:c,tailMode:e,lastEffect:f}:(g.isBackwards=b,g.rendering=null,g.renderingStartTime=0,g.last=d,g.tail=c,g.tailMode=e,g.lastEffect=f);}
	function Ai(a,b,c){var d=b.pendingProps,e=d.revealOrder,f=d.tail;fi(a,b,d.children,c);d=P.current;if(0!==(d&2))d=d&1|2,b.flags|=64;else {if(null!==a&&0!==(a.flags&64))a:for(a=b.child;null!==a;){if(13===a.tag)null!==a.memoizedState&&yi(a,c);else if(19===a.tag)yi(a,c);else if(null!==a.child){a.child.return=a;a=a.child;continue}if(a===b)break a;for(;null===a.sibling;){if(null===a.return||a.return===b)break a;a=a.return;}a.sibling.return=a.return;a=a.sibling;}d&=1;}I$1(P,d);if(0===(b.mode&2))b.memoizedState=
	null;else switch(e){case "forwards":c=b.child;for(e=null;null!==c;)a=c.alternate,null!==a&&null===ih(a)&&(e=c),c=c.sibling;c=e;null===c?(e=b.child,b.child=null):(e=c.sibling,c.sibling=null);zi(b,!1,e,c,f,b.lastEffect);break;case "backwards":c=null;e=b.child;for(b.child=null;null!==e;){a=e.alternate;if(null!==a&&null===ih(a)){b.child=e;break}a=e.sibling;e.sibling=c;c=e;e=a;}zi(b,!0,c,null,f,b.lastEffect);break;case "together":zi(b,!1,null,null,void 0,b.lastEffect);break;default:b.memoizedState=null;}return b.child}
	function hi(a,b,c){null!==a&&(b.dependencies=a.dependencies);Dg|=b.lanes;if(0!==(c&b.childLanes)){if(null!==a&&b.child!==a.child)throw Error(y$2(153));if(null!==b.child){a=b.child;c=Tg(a,a.pendingProps);b.child=c;for(c.return=b;null!==a.sibling;)a=a.sibling,c=c.sibling=Tg(a,a.pendingProps),c.return=b;c.sibling=null;}return b.child}return null}var Bi,Ci,Di,Ei;
	Bi=function(a,b){for(var c=b.child;null!==c;){if(5===c.tag||6===c.tag)a.appendChild(c.stateNode);else if(4!==c.tag&&null!==c.child){c.child.return=c;c=c.child;continue}if(c===b)break;for(;null===c.sibling;){if(null===c.return||c.return===b)return;c=c.return;}c.sibling.return=c.return;c=c.sibling;}};Ci=function(){};
	Di=function(a,b,c,d){var e=a.memoizedProps;if(e!==d){a=b.stateNode;dh(ah.current);var f=null;switch(c){case "input":e=Ya(a,e);d=Ya(a,d);f=[];break;case "option":e=eb(a,e);d=eb(a,d);f=[];break;case "select":e=m$2({},e,{value:void 0});d=m$2({},d,{value:void 0});f=[];break;case "textarea":e=gb(a,e);d=gb(a,d);f=[];break;default:"function"!==typeof e.onClick&&"function"===typeof d.onClick&&(a.onclick=jf);}vb(c,d);var g;c=null;for(l in e)if(!d.hasOwnProperty(l)&&e.hasOwnProperty(l)&&null!=e[l])if("style"===
	l){var h=e[l];for(g in h)h.hasOwnProperty(g)&&(c||(c={}),c[g]="");}else "dangerouslySetInnerHTML"!==l&&"children"!==l&&"suppressContentEditableWarning"!==l&&"suppressHydrationWarning"!==l&&"autoFocus"!==l&&(ca.hasOwnProperty(l)?f||(f=[]):(f=f||[]).push(l,null));for(l in d){var k=d[l];h=null!=e?e[l]:void 0;if(d.hasOwnProperty(l)&&k!==h&&(null!=k||null!=h))if("style"===l)if(h){for(g in h)!h.hasOwnProperty(g)||k&&k.hasOwnProperty(g)||(c||(c={}),c[g]="");for(g in k)k.hasOwnProperty(g)&&h[g]!==k[g]&&(c||
	(c={}),c[g]=k[g]);}else c||(f||(f=[]),f.push(l,c)),c=k;else "dangerouslySetInnerHTML"===l?(k=k?k.__html:void 0,h=h?h.__html:void 0,null!=k&&h!==k&&(f=f||[]).push(l,k)):"children"===l?"string"!==typeof k&&"number"!==typeof k||(f=f||[]).push(l,""+k):"suppressContentEditableWarning"!==l&&"suppressHydrationWarning"!==l&&(ca.hasOwnProperty(l)?(null!=k&&"onScroll"===l&&G$1("scroll",a),f||h===k||(f=[])):"object"===typeof k&&null!==k&&k.$$typeof===Ga?k.toString():(f=f||[]).push(l,k));}c&&(f=f||[]).push("style",
	c);var l=f;if(b.updateQueue=l)b.flags|=4;}};Ei=function(a,b,c,d){c!==d&&(b.flags|=4);};function Fi(a,b){if(!lh)switch(a.tailMode){case "hidden":b=a.tail;for(var c=null;null!==b;)null!==b.alternate&&(c=b),b=b.sibling;null===c?a.tail=null:c.sibling=null;break;case "collapsed":c=a.tail;for(var d=null;null!==c;)null!==c.alternate&&(d=c),c=c.sibling;null===d?b||null===a.tail?a.tail=null:a.tail.sibling=null:d.sibling=null;}}
	function Gi(a,b,c){var d=b.pendingProps;switch(b.tag){case 2:case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return null;case 1:return Ff(b.type)&&Gf(),null;case 3:fh();H$1(N);H$1(M);uh();d=b.stateNode;d.pendingContext&&(d.context=d.pendingContext,d.pendingContext=null);if(null===a||null===a.child)rh(b)?b.flags|=4:d.hydrate||(b.flags|=256);Ci(b);return null;case 5:hh(b);var e=dh(ch.current);c=b.type;if(null!==a&&null!=b.stateNode)Di(a,b,c,d,e),a.ref!==b.ref&&(b.flags|=128);else {if(!d){if(null===
	b.stateNode)throw Error(y$2(166));return null}a=dh(ah.current);if(rh(b)){d=b.stateNode;c=b.type;var f=b.memoizedProps;d[wf]=b;d[xf]=f;switch(c){case "dialog":G$1("cancel",d);G$1("close",d);break;case "iframe":case "object":case "embed":G$1("load",d);break;case "video":case "audio":for(a=0;a<Xe.length;a++)G$1(Xe[a],d);break;case "source":G$1("error",d);break;case "img":case "image":case "link":G$1("error",d);G$1("load",d);break;case "details":G$1("toggle",d);break;case "input":Za(d,f);G$1("invalid",d);break;case "select":d._wrapperState=
	{wasMultiple:!!f.multiple};G$1("invalid",d);break;case "textarea":hb(d,f),G$1("invalid",d);}vb(c,f);a=null;for(var g in f)f.hasOwnProperty(g)&&(e=f[g],"children"===g?"string"===typeof e?d.textContent!==e&&(a=["children",e]):"number"===typeof e&&d.textContent!==""+e&&(a=["children",""+e]):ca.hasOwnProperty(g)&&null!=e&&"onScroll"===g&&G$1("scroll",d));switch(c){case "input":Va(d);cb(d,f,!0);break;case "textarea":Va(d);jb(d);break;case "select":case "option":break;default:"function"===typeof f.onClick&&(d.onclick=
	jf);}d=a;b.updateQueue=d;null!==d&&(b.flags|=4);}else {g=9===e.nodeType?e:e.ownerDocument;a===kb.html&&(a=lb(c));a===kb.html?"script"===c?(a=g.createElement("div"),a.innerHTML="<script>\x3c/script>",a=a.removeChild(a.firstChild)):"string"===typeof d.is?a=g.createElement(c,{is:d.is}):(a=g.createElement(c),"select"===c&&(g=a,d.multiple?g.multiple=!0:d.size&&(g.size=d.size))):a=g.createElementNS(a,c);a[wf]=b;a[xf]=d;Bi(a,b,!1,!1);b.stateNode=a;g=wb(c,d);switch(c){case "dialog":G$1("cancel",a);G$1("close",a);
	e=d;break;case "iframe":case "object":case "embed":G$1("load",a);e=d;break;case "video":case "audio":for(e=0;e<Xe.length;e++)G$1(Xe[e],a);e=d;break;case "source":G$1("error",a);e=d;break;case "img":case "image":case "link":G$1("error",a);G$1("load",a);e=d;break;case "details":G$1("toggle",a);e=d;break;case "input":Za(a,d);e=Ya(a,d);G$1("invalid",a);break;case "option":e=eb(a,d);break;case "select":a._wrapperState={wasMultiple:!!d.multiple};e=m$2({},d,{value:void 0});G$1("invalid",a);break;case "textarea":hb(a,d);e=
	gb(a,d);G$1("invalid",a);break;default:e=d;}vb(c,e);var h=e;for(f in h)if(h.hasOwnProperty(f)){var k=h[f];"style"===f?tb(a,k):"dangerouslySetInnerHTML"===f?(k=k?k.__html:void 0,null!=k&&ob(a,k)):"children"===f?"string"===typeof k?("textarea"!==c||""!==k)&&pb(a,k):"number"===typeof k&&pb(a,""+k):"suppressContentEditableWarning"!==f&&"suppressHydrationWarning"!==f&&"autoFocus"!==f&&(ca.hasOwnProperty(f)?null!=k&&"onScroll"===f&&G$1("scroll",a):null!=k&&qa(a,f,k,g));}switch(c){case "input":Va(a);cb(a,d,!1);
	break;case "textarea":Va(a);jb(a);break;case "option":null!=d.value&&a.setAttribute("value",""+Sa(d.value));break;case "select":a.multiple=!!d.multiple;f=d.value;null!=f?fb(a,!!d.multiple,f,!1):null!=d.defaultValue&&fb(a,!!d.multiple,d.defaultValue,!0);break;default:"function"===typeof e.onClick&&(a.onclick=jf);}mf(c,d)&&(b.flags|=4);}null!==b.ref&&(b.flags|=128);}return null;case 6:if(a&&null!=b.stateNode)Ei(a,b,a.memoizedProps,d);else {if("string"!==typeof d&&null===b.stateNode)throw Error(y$2(166));
	c=dh(ch.current);dh(ah.current);rh(b)?(d=b.stateNode,c=b.memoizedProps,d[wf]=b,d.nodeValue!==c&&(b.flags|=4)):(d=(9===c.nodeType?c:c.ownerDocument).createTextNode(d),d[wf]=b,b.stateNode=d);}return null;case 13:H$1(P);d=b.memoizedState;if(0!==(b.flags&64))return b.lanes=c,b;d=null!==d;c=!1;null===a?void 0!==b.memoizedProps.fallback&&rh(b):c=null!==a.memoizedState;if(d&&!c&&0!==(b.mode&2))if(null===a&&!0!==b.memoizedProps.unstable_avoidThisFallback||0!==(P.current&1))0===V&&(V=3);else {if(0===V||3===V)V=
	4;null===U||0===(Dg&134217727)&&0===(Hi&134217727)||Ii(U,W);}if(d||c)b.flags|=4;return null;case 4:return fh(),Ci(b),null===a&&cf(b.stateNode.containerInfo),null;case 10:return rg(b),null;case 17:return Ff(b.type)&&Gf(),null;case 19:H$1(P);d=b.memoizedState;if(null===d)return null;f=0!==(b.flags&64);g=d.rendering;if(null===g)if(f)Fi(d,!1);else {if(0!==V||null!==a&&0!==(a.flags&64))for(a=b.child;null!==a;){g=ih(a);if(null!==g){b.flags|=64;Fi(d,!1);f=g.updateQueue;null!==f&&(b.updateQueue=f,b.flags|=4);
	null===d.lastEffect&&(b.firstEffect=null);b.lastEffect=d.lastEffect;d=c;for(c=b.child;null!==c;)f=c,a=d,f.flags&=2,f.nextEffect=null,f.firstEffect=null,f.lastEffect=null,g=f.alternate,null===g?(f.childLanes=0,f.lanes=a,f.child=null,f.memoizedProps=null,f.memoizedState=null,f.updateQueue=null,f.dependencies=null,f.stateNode=null):(f.childLanes=g.childLanes,f.lanes=g.lanes,f.child=g.child,f.memoizedProps=g.memoizedProps,f.memoizedState=g.memoizedState,f.updateQueue=g.updateQueue,f.type=g.type,a=g.dependencies,
	f.dependencies=null===a?null:{lanes:a.lanes,firstContext:a.firstContext}),c=c.sibling;I$1(P,P.current&1|2);return b.child}a=a.sibling;}null!==d.tail&&O()>Ji&&(b.flags|=64,f=!0,Fi(d,!1),b.lanes=33554432);}else {if(!f)if(a=ih(g),null!==a){if(b.flags|=64,f=!0,c=a.updateQueue,null!==c&&(b.updateQueue=c,b.flags|=4),Fi(d,!0),null===d.tail&&"hidden"===d.tailMode&&!g.alternate&&!lh)return b=b.lastEffect=d.lastEffect,null!==b&&(b.nextEffect=null),null}else 2*O()-d.renderingStartTime>Ji&&1073741824!==c&&(b.flags|=
	64,f=!0,Fi(d,!1),b.lanes=33554432);d.isBackwards?(g.sibling=b.child,b.child=g):(c=d.last,null!==c?c.sibling=g:b.child=g,d.last=g);}return null!==d.tail?(c=d.tail,d.rendering=c,d.tail=c.sibling,d.lastEffect=b.lastEffect,d.renderingStartTime=O(),c.sibling=null,b=P.current,I$1(P,f?b&1|2:b&1),c):null;case 23:case 24:return Ki(),null!==a&&null!==a.memoizedState!==(null!==b.memoizedState)&&"unstable-defer-without-hiding"!==d.mode&&(b.flags|=4),null}throw Error(y$2(156,b.tag));}
	function Li(a){switch(a.tag){case 1:Ff(a.type)&&Gf();var b=a.flags;return b&4096?(a.flags=b&-4097|64,a):null;case 3:fh();H$1(N);H$1(M);uh();b=a.flags;if(0!==(b&64))throw Error(y$2(285));a.flags=b&-4097|64;return a;case 5:return hh(a),null;case 13:return H$1(P),b=a.flags,b&4096?(a.flags=b&-4097|64,a):null;case 19:return H$1(P),null;case 4:return fh(),null;case 10:return rg(a),null;case 23:case 24:return Ki(),null;default:return null}}
	function Mi(a,b){try{var c="",d=b;do c+=Qa(d),d=d.return;while(d);var e=c;}catch(f){e="\nError generating stack: "+f.message+"\n"+f.stack;}return {value:a,source:b,stack:e}}function Ni(a,b){try{console.error(b.value);}catch(c){setTimeout(function(){throw c;});}}var Oi="function"===typeof WeakMap?WeakMap:Map;function Pi(a,b,c){c=zg(-1,c);c.tag=3;c.payload={element:null};var d=b.value;c.callback=function(){Qi||(Qi=!0,Ri=d);Ni(a,b);};return c}
	function Si(a,b,c){c=zg(-1,c);c.tag=3;var d=a.type.getDerivedStateFromError;if("function"===typeof d){var e=b.value;c.payload=function(){Ni(a,b);return d(e)};}var f=a.stateNode;null!==f&&"function"===typeof f.componentDidCatch&&(c.callback=function(){"function"!==typeof d&&(null===Ti?Ti=new Set([this]):Ti.add(this),Ni(a,b));var c=b.stack;this.componentDidCatch(b.value,{componentStack:null!==c?c:""});});return c}var Ui="function"===typeof WeakSet?WeakSet:Set;
	function Vi(a){var b=a.ref;if(null!==b)if("function"===typeof b)try{b(null);}catch(c){Wi(a,c);}else b.current=null;}function Xi(a,b){switch(b.tag){case 0:case 11:case 15:case 22:return;case 1:if(b.flags&256&&null!==a){var c=a.memoizedProps,d=a.memoizedState;a=b.stateNode;b=a.getSnapshotBeforeUpdate(b.elementType===b.type?c:lg(b.type,c),d);a.__reactInternalSnapshotBeforeUpdate=b;}return;case 3:b.flags&256&&qf(b.stateNode.containerInfo);return;case 5:case 6:case 4:case 17:return}throw Error(y$2(163));}
	function Yi(a,b,c){switch(c.tag){case 0:case 11:case 15:case 22:b=c.updateQueue;b=null!==b?b.lastEffect:null;if(null!==b){a=b=b.next;do{if(3===(a.tag&3)){var d=a.create;a.destroy=d();}a=a.next;}while(a!==b)}b=c.updateQueue;b=null!==b?b.lastEffect:null;if(null!==b){a=b=b.next;do{var e=a;d=e.next;e=e.tag;0!==(e&4)&&0!==(e&1)&&(Zi(c,a),$i(c,a));a=d;}while(a!==b)}return;case 1:a=c.stateNode;c.flags&4&&(null===b?a.componentDidMount():(d=c.elementType===c.type?b.memoizedProps:lg(c.type,b.memoizedProps),a.componentDidUpdate(d,
	b.memoizedState,a.__reactInternalSnapshotBeforeUpdate)));b=c.updateQueue;null!==b&&Eg(c,b,a);return;case 3:b=c.updateQueue;if(null!==b){a=null;if(null!==c.child)switch(c.child.tag){case 5:a=c.child.stateNode;break;case 1:a=c.child.stateNode;}Eg(c,b,a);}return;case 5:a=c.stateNode;null===b&&c.flags&4&&mf(c.type,c.memoizedProps)&&a.focus();return;case 6:return;case 4:return;case 12:return;case 13:null===c.memoizedState&&(c=c.alternate,null!==c&&(c=c.memoizedState,null!==c&&(c=c.dehydrated,null!==c&&Cc(c))));
	return;case 19:case 17:case 20:case 21:case 23:case 24:return}throw Error(y$2(163));}
	function aj(a,b){for(var c=a;;){if(5===c.tag){var d=c.stateNode;if(b)d=d.style,"function"===typeof d.setProperty?d.setProperty("display","none","important"):d.display="none";else {d=c.stateNode;var e=c.memoizedProps.style;e=void 0!==e&&null!==e&&e.hasOwnProperty("display")?e.display:null;d.style.display=sb("display",e);}}else if(6===c.tag)c.stateNode.nodeValue=b?"":c.memoizedProps;else if((23!==c.tag&&24!==c.tag||null===c.memoizedState||c===a)&&null!==c.child){c.child.return=c;c=c.child;continue}if(c===
	a)break;for(;null===c.sibling;){if(null===c.return||c.return===a)return;c=c.return;}c.sibling.return=c.return;c=c.sibling;}}
	function bj(a,b){if(Mf&&"function"===typeof Mf.onCommitFiberUnmount)try{Mf.onCommitFiberUnmount(Lf,b);}catch(f){}switch(b.tag){case 0:case 11:case 14:case 15:case 22:a=b.updateQueue;if(null!==a&&(a=a.lastEffect,null!==a)){var c=a=a.next;do{var d=c,e=d.destroy;d=d.tag;if(void 0!==e)if(0!==(d&4))Zi(b,c);else {d=b;try{e();}catch(f){Wi(d,f);}}c=c.next;}while(c!==a)}break;case 1:Vi(b);a=b.stateNode;if("function"===typeof a.componentWillUnmount)try{a.props=b.memoizedProps,a.state=b.memoizedState,a.componentWillUnmount();}catch(f){Wi(b,
	f);}break;case 5:Vi(b);break;case 4:cj(a,b);}}function dj(a){a.alternate=null;a.child=null;a.dependencies=null;a.firstEffect=null;a.lastEffect=null;a.memoizedProps=null;a.memoizedState=null;a.pendingProps=null;a.return=null;a.updateQueue=null;}function ej(a){return 5===a.tag||3===a.tag||4===a.tag}
	function fj(a){a:{for(var b=a.return;null!==b;){if(ej(b))break a;b=b.return;}throw Error(y$2(160));}var c=b;b=c.stateNode;switch(c.tag){case 5:var d=!1;break;case 3:b=b.containerInfo;d=!0;break;case 4:b=b.containerInfo;d=!0;break;default:throw Error(y$2(161));}c.flags&16&&(pb(b,""),c.flags&=-17);a:b:for(c=a;;){for(;null===c.sibling;){if(null===c.return||ej(c.return)){c=null;break a}c=c.return;}c.sibling.return=c.return;for(c=c.sibling;5!==c.tag&&6!==c.tag&&18!==c.tag;){if(c.flags&2)continue b;if(null===
	c.child||4===c.tag)continue b;else c.child.return=c,c=c.child;}if(!(c.flags&2)){c=c.stateNode;break a}}d?gj(a,c,b):hj(a,c,b);}
	function gj(a,b,c){var d=a.tag,e=5===d||6===d;if(e)a=e?a.stateNode:a.stateNode.instance,b?8===c.nodeType?c.parentNode.insertBefore(a,b):c.insertBefore(a,b):(8===c.nodeType?(b=c.parentNode,b.insertBefore(a,c)):(b=c,b.appendChild(a)),c=c._reactRootContainer,null!==c&&void 0!==c||null!==b.onclick||(b.onclick=jf));else if(4!==d&&(a=a.child,null!==a))for(gj(a,b,c),a=a.sibling;null!==a;)gj(a,b,c),a=a.sibling;}
	function hj(a,b,c){var d=a.tag,e=5===d||6===d;if(e)a=e?a.stateNode:a.stateNode.instance,b?c.insertBefore(a,b):c.appendChild(a);else if(4!==d&&(a=a.child,null!==a))for(hj(a,b,c),a=a.sibling;null!==a;)hj(a,b,c),a=a.sibling;}
	function cj(a,b){for(var c=b,d=!1,e,f;;){if(!d){d=c.return;a:for(;;){if(null===d)throw Error(y$2(160));e=d.stateNode;switch(d.tag){case 5:f=!1;break a;case 3:e=e.containerInfo;f=!0;break a;case 4:e=e.containerInfo;f=!0;break a}d=d.return;}d=!0;}if(5===c.tag||6===c.tag){a:for(var g=a,h=c,k=h;;)if(bj(g,k),null!==k.child&&4!==k.tag)k.child.return=k,k=k.child;else {if(k===h)break a;for(;null===k.sibling;){if(null===k.return||k.return===h)break a;k=k.return;}k.sibling.return=k.return;k=k.sibling;}f?(g=e,h=c.stateNode,
	8===g.nodeType?g.parentNode.removeChild(h):g.removeChild(h)):e.removeChild(c.stateNode);}else if(4===c.tag){if(null!==c.child){e=c.stateNode.containerInfo;f=!0;c.child.return=c;c=c.child;continue}}else if(bj(a,c),null!==c.child){c.child.return=c;c=c.child;continue}if(c===b)break;for(;null===c.sibling;){if(null===c.return||c.return===b)return;c=c.return;4===c.tag&&(d=!1);}c.sibling.return=c.return;c=c.sibling;}}
	function ij(a,b){switch(b.tag){case 0:case 11:case 14:case 15:case 22:var c=b.updateQueue;c=null!==c?c.lastEffect:null;if(null!==c){var d=c=c.next;do 3===(d.tag&3)&&(a=d.destroy,d.destroy=void 0,void 0!==a&&a()),d=d.next;while(d!==c)}return;case 1:return;case 5:c=b.stateNode;if(null!=c){d=b.memoizedProps;var e=null!==a?a.memoizedProps:d;a=b.type;var f=b.updateQueue;b.updateQueue=null;if(null!==f){c[xf]=d;"input"===a&&"radio"===d.type&&null!=d.name&&$a(c,d);wb(a,e);b=wb(a,d);for(e=0;e<f.length;e+=
	2){var g=f[e],h=f[e+1];"style"===g?tb(c,h):"dangerouslySetInnerHTML"===g?ob(c,h):"children"===g?pb(c,h):qa(c,g,h,b);}switch(a){case "input":ab(c,d);break;case "textarea":ib(c,d);break;case "select":a=c._wrapperState.wasMultiple,c._wrapperState.wasMultiple=!!d.multiple,f=d.value,null!=f?fb(c,!!d.multiple,f,!1):a!==!!d.multiple&&(null!=d.defaultValue?fb(c,!!d.multiple,d.defaultValue,!0):fb(c,!!d.multiple,d.multiple?[]:"",!1));}}}return;case 6:if(null===b.stateNode)throw Error(y$2(162));b.stateNode.nodeValue=
	b.memoizedProps;return;case 3:c=b.stateNode;c.hydrate&&(c.hydrate=!1,Cc(c.containerInfo));return;case 12:return;case 13:null!==b.memoizedState&&(jj=O(),aj(b.child,!0));kj(b);return;case 19:kj(b);return;case 17:return;case 23:case 24:aj(b,null!==b.memoizedState);return}throw Error(y$2(163));}function kj(a){var b=a.updateQueue;if(null!==b){a.updateQueue=null;var c=a.stateNode;null===c&&(c=a.stateNode=new Ui);b.forEach(function(b){var d=lj.bind(null,a,b);c.has(b)||(c.add(b),b.then(d,d));});}}
	function mj(a,b){return null!==a&&(a=a.memoizedState,null===a||null!==a.dehydrated)?(b=b.memoizedState,null!==b&&null===b.dehydrated):!1}var nj=Math.ceil,oj=ra.ReactCurrentDispatcher,pj=ra.ReactCurrentOwner,X=0,U=null,Y=null,W=0,qj=0,rj=Bf(0),V=0,sj=null,tj=0,Dg=0,Hi=0,uj=0,vj=null,jj=0,Ji=Infinity;function wj(){Ji=O()+500;}var Z=null,Qi=!1,Ri=null,Ti=null,xj=!1,yj=null,zj=90,Aj=[],Bj=[],Cj=null,Dj=0,Ej=null,Fj=-1,Gj=0,Hj=0,Ij=null,Jj=!1;function Hg(){return 0!==(X&48)?O():-1!==Fj?Fj:Fj=O()}
	function Ig(a){a=a.mode;if(0===(a&2))return 1;if(0===(a&4))return 99===eg()?1:2;0===Gj&&(Gj=tj);if(0!==kg.transition){0!==Hj&&(Hj=null!==vj?vj.pendingLanes:0);a=Gj;var b=4186112&~Hj;b&=-b;0===b&&(a=4186112&~a,b=a&-a,0===b&&(b=8192));return b}a=eg();0!==(X&4)&&98===a?a=Xc(12,Gj):(a=Sc(a),a=Xc(a,Gj));return a}
	function Jg(a,b,c){if(50<Dj)throw Dj=0,Ej=null,Error(y$2(185));a=Kj(a,b);if(null===a)return null;$c(a,b,c);a===U&&(Hi|=b,4===V&&Ii(a,W));var d=eg();1===b?0!==(X&8)&&0===(X&48)?Lj(a):(Mj(a,c),0===X&&(wj(),ig())):(0===(X&4)||98!==d&&99!==d||(null===Cj?Cj=new Set([a]):Cj.add(a)),Mj(a,c));vj=a;}function Kj(a,b){a.lanes|=b;var c=a.alternate;null!==c&&(c.lanes|=b);c=a;for(a=a.return;null!==a;)a.childLanes|=b,c=a.alternate,null!==c&&(c.childLanes|=b),c=a,a=a.return;return 3===c.tag?c.stateNode:null}
	function Mj(a,b){for(var c=a.callbackNode,d=a.suspendedLanes,e=a.pingedLanes,f=a.expirationTimes,g=a.pendingLanes;0<g;){var h=31-Vc(g),k=1<<h,l=f[h];if(-1===l){if(0===(k&d)||0!==(k&e)){l=b;Rc(k);var n=F$1;f[h]=10<=n?l+250:6<=n?l+5E3:-1;}}else l<=b&&(a.expiredLanes|=k);g&=~k;}d=Uc(a,a===U?W:0);b=F$1;if(0===d)null!==c&&(c!==Zf&&Pf(c),a.callbackNode=null,a.callbackPriority=0);else {if(null!==c){if(a.callbackPriority===b)return;c!==Zf&&Pf(c);}15===b?(c=Lj.bind(null,a),null===ag?(ag=[c],bg=Of(Uf,jg)):ag.push(c),
	c=Zf):14===b?c=hg(99,Lj.bind(null,a)):(c=Tc(b),c=hg(c,Nj.bind(null,a)));a.callbackPriority=b;a.callbackNode=c;}}
	function Nj(a){Fj=-1;Hj=Gj=0;if(0!==(X&48))throw Error(y$2(327));var b=a.callbackNode;if(Oj()&&a.callbackNode!==b)return null;var c=Uc(a,a===U?W:0);if(0===c)return null;var d=c;var e=X;X|=16;var f=Pj();if(U!==a||W!==d)wj(),Qj(a,d);do try{Rj();break}catch(h){Sj(a,h);}while(1);qg();oj.current=f;X=e;null!==Y?d=0:(U=null,W=0,d=V);if(0!==(tj&Hi))Qj(a,0);else if(0!==d){2===d&&(X|=64,a.hydrate&&(a.hydrate=!1,qf(a.containerInfo)),c=Wc(a),0!==c&&(d=Tj(a,c)));if(1===d)throw b=sj,Qj(a,0),Ii(a,c),Mj(a,O()),b;a.finishedWork=
	a.current.alternate;a.finishedLanes=c;switch(d){case 0:case 1:throw Error(y$2(345));case 2:Uj(a);break;case 3:Ii(a,c);if((c&62914560)===c&&(d=jj+500-O(),10<d)){if(0!==Uc(a,0))break;e=a.suspendedLanes;if((e&c)!==c){Hg();a.pingedLanes|=a.suspendedLanes&e;break}a.timeoutHandle=of(Uj.bind(null,a),d);break}Uj(a);break;case 4:Ii(a,c);if((c&4186112)===c)break;d=a.eventTimes;for(e=-1;0<c;){var g=31-Vc(c);f=1<<g;g=d[g];g>e&&(e=g);c&=~f;}c=e;c=O()-c;c=(120>c?120:480>c?480:1080>c?1080:1920>c?1920:3E3>c?3E3:4320>
	c?4320:1960*nj(c/1960))-c;if(10<c){a.timeoutHandle=of(Uj.bind(null,a),c);break}Uj(a);break;case 5:Uj(a);break;default:throw Error(y$2(329));}}Mj(a,O());return a.callbackNode===b?Nj.bind(null,a):null}function Ii(a,b){b&=~uj;b&=~Hi;a.suspendedLanes|=b;a.pingedLanes&=~b;for(a=a.expirationTimes;0<b;){var c=31-Vc(b),d=1<<c;a[c]=-1;b&=~d;}}
	function Lj(a){if(0!==(X&48))throw Error(y$2(327));Oj();if(a===U&&0!==(a.expiredLanes&W)){var b=W;var c=Tj(a,b);0!==(tj&Hi)&&(b=Uc(a,b),c=Tj(a,b));}else b=Uc(a,0),c=Tj(a,b);0!==a.tag&&2===c&&(X|=64,a.hydrate&&(a.hydrate=!1,qf(a.containerInfo)),b=Wc(a),0!==b&&(c=Tj(a,b)));if(1===c)throw c=sj,Qj(a,0),Ii(a,b),Mj(a,O()),c;a.finishedWork=a.current.alternate;a.finishedLanes=b;Uj(a);Mj(a,O());return null}
	function Vj(){if(null!==Cj){var a=Cj;Cj=null;a.forEach(function(a){a.expiredLanes|=24&a.pendingLanes;Mj(a,O());});}ig();}function Wj(a,b){var c=X;X|=1;try{return a(b)}finally{X=c,0===X&&(wj(),ig());}}function Xj(a,b){var c=X;X&=-2;X|=8;try{return a(b)}finally{X=c,0===X&&(wj(),ig());}}function ni(a,b){I$1(rj,qj);qj|=b;tj|=b;}function Ki(){qj=rj.current;H$1(rj);}
	function Qj(a,b){a.finishedWork=null;a.finishedLanes=0;var c=a.timeoutHandle;-1!==c&&(a.timeoutHandle=-1,pf(c));if(null!==Y)for(c=Y.return;null!==c;){var d=c;switch(d.tag){case 1:d=d.type.childContextTypes;null!==d&&void 0!==d&&Gf();break;case 3:fh();H$1(N);H$1(M);uh();break;case 5:hh(d);break;case 4:fh();break;case 13:H$1(P);break;case 19:H$1(P);break;case 10:rg(d);break;case 23:case 24:Ki();}c=c.return;}U=a;Y=Tg(a.current,null);W=qj=tj=b;V=0;sj=null;uj=Hi=Dg=0;}
	function Sj(a,b){do{var c=Y;try{qg();vh.current=Gh;if(yh){for(var d=R.memoizedState;null!==d;){var e=d.queue;null!==e&&(e.pending=null);d=d.next;}yh=!1;}xh=0;T=S=R=null;zh=!1;pj.current=null;if(null===c||null===c.return){V=1;sj=b;Y=null;break}a:{var f=a,g=c.return,h=c,k=b;b=W;h.flags|=2048;h.firstEffect=h.lastEffect=null;if(null!==k&&"object"===typeof k&&"function"===typeof k.then){var l=k;if(0===(h.mode&2)){var n=h.alternate;n?(h.updateQueue=n.updateQueue,h.memoizedState=n.memoizedState,h.lanes=n.lanes):
	(h.updateQueue=null,h.memoizedState=null);}var A=0!==(P.current&1),p=g;do{var C;if(C=13===p.tag){var x=p.memoizedState;if(null!==x)C=null!==x.dehydrated?!0:!1;else {var w=p.memoizedProps;C=void 0===w.fallback?!1:!0!==w.unstable_avoidThisFallback?!0:A?!1:!0;}}if(C){var z=p.updateQueue;if(null===z){var u=new Set;u.add(l);p.updateQueue=u;}else z.add(l);if(0===(p.mode&2)){p.flags|=64;h.flags|=16384;h.flags&=-2981;if(1===h.tag)if(null===h.alternate)h.tag=17;else {var t=zg(-1,1);t.tag=2;Ag(h,t);}h.lanes|=1;break a}k=
	void 0;h=b;var q=f.pingCache;null===q?(q=f.pingCache=new Oi,k=new Set,q.set(l,k)):(k=q.get(l),void 0===k&&(k=new Set,q.set(l,k)));if(!k.has(h)){k.add(h);var v=Yj.bind(null,f,l,h);l.then(v,v);}p.flags|=4096;p.lanes=b;break a}p=p.return;}while(null!==p);k=Error((Ra(h.type)||"A React component")+" suspended while rendering, but no fallback UI was specified.\n\nAdd a <Suspense fallback=...> component higher in the tree to provide a loading indicator or placeholder to display.");}5!==V&&(V=2);k=Mi(k,h);p=
	g;do{switch(p.tag){case 3:f=k;p.flags|=4096;b&=-b;p.lanes|=b;var J=Pi(p,f,b);Bg(p,J);break a;case 1:f=k;var K=p.type,Q=p.stateNode;if(0===(p.flags&64)&&("function"===typeof K.getDerivedStateFromError||null!==Q&&"function"===typeof Q.componentDidCatch&&(null===Ti||!Ti.has(Q)))){p.flags|=4096;b&=-b;p.lanes|=b;var L=Si(p,f,b);Bg(p,L);break a}}p=p.return;}while(null!==p)}Zj(c);}catch(va){b=va;Y===c&&null!==c&&(Y=c=c.return);continue}break}while(1)}
	function Pj(){var a=oj.current;oj.current=Gh;return null===a?Gh:a}function Tj(a,b){var c=X;X|=16;var d=Pj();U===a&&W===b||Qj(a,b);do try{ak();break}catch(e){Sj(a,e);}while(1);qg();X=c;oj.current=d;if(null!==Y)throw Error(y$2(261));U=null;W=0;return V}function ak(){for(;null!==Y;)bk(Y);}function Rj(){for(;null!==Y&&!Qf();)bk(Y);}function bk(a){var b=ck(a.alternate,a,qj);a.memoizedProps=a.pendingProps;null===b?Zj(a):Y=b;pj.current=null;}
	function Zj(a){var b=a;do{var c=b.alternate;a=b.return;if(0===(b.flags&2048)){c=Gi(c,b,qj);if(null!==c){Y=c;return}c=b;if(24!==c.tag&&23!==c.tag||null===c.memoizedState||0!==(qj&1073741824)||0===(c.mode&4)){for(var d=0,e=c.child;null!==e;)d|=e.lanes|e.childLanes,e=e.sibling;c.childLanes=d;}null!==a&&0===(a.flags&2048)&&(null===a.firstEffect&&(a.firstEffect=b.firstEffect),null!==b.lastEffect&&(null!==a.lastEffect&&(a.lastEffect.nextEffect=b.firstEffect),a.lastEffect=b.lastEffect),1<b.flags&&(null!==
	a.lastEffect?a.lastEffect.nextEffect=b:a.firstEffect=b,a.lastEffect=b));}else {c=Li(b);if(null!==c){c.flags&=2047;Y=c;return}null!==a&&(a.firstEffect=a.lastEffect=null,a.flags|=2048);}b=b.sibling;if(null!==b){Y=b;return}Y=b=a;}while(null!==b);0===V&&(V=5);}function Uj(a){var b=eg();gg(99,dk.bind(null,a,b));return null}
	function dk(a,b){do Oj();while(null!==yj);if(0!==(X&48))throw Error(y$2(327));var c=a.finishedWork;if(null===c)return null;a.finishedWork=null;a.finishedLanes=0;if(c===a.current)throw Error(y$2(177));a.callbackNode=null;var d=c.lanes|c.childLanes,e=d,f=a.pendingLanes&~e;a.pendingLanes=e;a.suspendedLanes=0;a.pingedLanes=0;a.expiredLanes&=e;a.mutableReadLanes&=e;a.entangledLanes&=e;e=a.entanglements;for(var g=a.eventTimes,h=a.expirationTimes;0<f;){var k=31-Vc(f),l=1<<k;e[k]=0;g[k]=-1;h[k]=-1;f&=~l;}null!==
	Cj&&0===(d&24)&&Cj.has(a)&&Cj.delete(a);a===U&&(Y=U=null,W=0);1<c.flags?null!==c.lastEffect?(c.lastEffect.nextEffect=c,d=c.firstEffect):d=c:d=c.firstEffect;if(null!==d){e=X;X|=32;pj.current=null;kf=fd;g=Ne();if(Oe(g)){if("selectionStart"in g)h={start:g.selectionStart,end:g.selectionEnd};else a:if(h=(h=g.ownerDocument)&&h.defaultView||window,(l=h.getSelection&&h.getSelection())&&0!==l.rangeCount){h=l.anchorNode;f=l.anchorOffset;k=l.focusNode;l=l.focusOffset;try{h.nodeType,k.nodeType;}catch(va){h=null;
	break a}var n=0,A=-1,p=-1,C=0,x=0,w=g,z=null;b:for(;;){for(var u;;){w!==h||0!==f&&3!==w.nodeType||(A=n+f);w!==k||0!==l&&3!==w.nodeType||(p=n+l);3===w.nodeType&&(n+=w.nodeValue.length);if(null===(u=w.firstChild))break;z=w;w=u;}for(;;){if(w===g)break b;z===h&&++C===f&&(A=n);z===k&&++x===l&&(p=n);if(null!==(u=w.nextSibling))break;w=z;z=w.parentNode;}w=u;}h=-1===A||-1===p?null:{start:A,end:p};}else h=null;h=h||{start:0,end:0};}else h=null;lf={focusedElem:g,selectionRange:h};fd=!1;Ij=null;Jj=!1;Z=d;do try{ek();}catch(va){if(null===
	Z)throw Error(y$2(330));Wi(Z,va);Z=Z.nextEffect;}while(null!==Z);Ij=null;Z=d;do try{for(g=a;null!==Z;){var t=Z.flags;t&16&&pb(Z.stateNode,"");if(t&128){var q=Z.alternate;if(null!==q){var v=q.ref;null!==v&&("function"===typeof v?v(null):v.current=null);}}switch(t&1038){case 2:fj(Z);Z.flags&=-3;break;case 6:fj(Z);Z.flags&=-3;ij(Z.alternate,Z);break;case 1024:Z.flags&=-1025;break;case 1028:Z.flags&=-1025;ij(Z.alternate,Z);break;case 4:ij(Z.alternate,Z);break;case 8:h=Z;cj(g,h);var J=h.alternate;dj(h);null!==
	J&&dj(J);}Z=Z.nextEffect;}}catch(va){if(null===Z)throw Error(y$2(330));Wi(Z,va);Z=Z.nextEffect;}while(null!==Z);v=lf;q=Ne();t=v.focusedElem;g=v.selectionRange;if(q!==t&&t&&t.ownerDocument&&Me(t.ownerDocument.documentElement,t)){null!==g&&Oe(t)&&(q=g.start,v=g.end,void 0===v&&(v=q),"selectionStart"in t?(t.selectionStart=q,t.selectionEnd=Math.min(v,t.value.length)):(v=(q=t.ownerDocument||document)&&q.defaultView||window,v.getSelection&&(v=v.getSelection(),h=t.textContent.length,J=Math.min(g.start,h),g=void 0===
	g.end?J:Math.min(g.end,h),!v.extend&&J>g&&(h=g,g=J,J=h),h=Le(t,J),f=Le(t,g),h&&f&&(1!==v.rangeCount||v.anchorNode!==h.node||v.anchorOffset!==h.offset||v.focusNode!==f.node||v.focusOffset!==f.offset)&&(q=q.createRange(),q.setStart(h.node,h.offset),v.removeAllRanges(),J>g?(v.addRange(q),v.extend(f.node,f.offset)):(q.setEnd(f.node,f.offset),v.addRange(q))))));q=[];for(v=t;v=v.parentNode;)1===v.nodeType&&q.push({element:v,left:v.scrollLeft,top:v.scrollTop});"function"===typeof t.focus&&t.focus();for(t=
	0;t<q.length;t++)v=q[t],v.element.scrollLeft=v.left,v.element.scrollTop=v.top;}fd=!!kf;lf=kf=null;a.current=c;Z=d;do try{for(t=a;null!==Z;){var K=Z.flags;K&36&&Yi(t,Z.alternate,Z);if(K&128){q=void 0;var Q=Z.ref;if(null!==Q){var L=Z.stateNode;switch(Z.tag){case 5:q=L;break;default:q=L;}"function"===typeof Q?Q(q):Q.current=q;}}Z=Z.nextEffect;}}catch(va){if(null===Z)throw Error(y$2(330));Wi(Z,va);Z=Z.nextEffect;}while(null!==Z);Z=null;$f();X=e;}else a.current=c;if(xj)xj=!1,yj=a,zj=b;else for(Z=d;null!==Z;)b=
	Z.nextEffect,Z.nextEffect=null,Z.flags&8&&(K=Z,K.sibling=null,K.stateNode=null),Z=b;d=a.pendingLanes;0===d&&(Ti=null);1===d?a===Ej?Dj++:(Dj=0,Ej=a):Dj=0;c=c.stateNode;if(Mf&&"function"===typeof Mf.onCommitFiberRoot)try{Mf.onCommitFiberRoot(Lf,c,void 0,64===(c.current.flags&64));}catch(va){}Mj(a,O());if(Qi)throw Qi=!1,a=Ri,Ri=null,a;if(0!==(X&8))return null;ig();return null}
	function ek(){for(;null!==Z;){var a=Z.alternate;Jj||null===Ij||(0!==(Z.flags&8)?dc(Z,Ij)&&(Jj=!0):13===Z.tag&&mj(a,Z)&&dc(Z,Ij)&&(Jj=!0));var b=Z.flags;0!==(b&256)&&Xi(a,Z);0===(b&512)||xj||(xj=!0,hg(97,function(){Oj();return null}));Z=Z.nextEffect;}}function Oj(){if(90!==zj){var a=97<zj?97:zj;zj=90;return gg(a,fk)}return !1}function $i(a,b){Aj.push(b,a);xj||(xj=!0,hg(97,function(){Oj();return null}));}function Zi(a,b){Bj.push(b,a);xj||(xj=!0,hg(97,function(){Oj();return null}));}
	function fk(){if(null===yj)return !1;var a=yj;yj=null;if(0!==(X&48))throw Error(y$2(331));var b=X;X|=32;var c=Bj;Bj=[];for(var d=0;d<c.length;d+=2){var e=c[d],f=c[d+1],g=e.destroy;e.destroy=void 0;if("function"===typeof g)try{g();}catch(k){if(null===f)throw Error(y$2(330));Wi(f,k);}}c=Aj;Aj=[];for(d=0;d<c.length;d+=2){e=c[d];f=c[d+1];try{var h=e.create;e.destroy=h();}catch(k){if(null===f)throw Error(y$2(330));Wi(f,k);}}for(h=a.current.firstEffect;null!==h;)a=h.nextEffect,h.nextEffect=null,h.flags&8&&(h.sibling=
	null,h.stateNode=null),h=a;X=b;ig();return !0}function gk(a,b,c){b=Mi(c,b);b=Pi(a,b,1);Ag(a,b);b=Hg();a=Kj(a,1);null!==a&&($c(a,1,b),Mj(a,b));}
	function Wi(a,b){if(3===a.tag)gk(a,a,b);else for(var c=a.return;null!==c;){if(3===c.tag){gk(c,a,b);break}else if(1===c.tag){var d=c.stateNode;if("function"===typeof c.type.getDerivedStateFromError||"function"===typeof d.componentDidCatch&&(null===Ti||!Ti.has(d))){a=Mi(b,a);var e=Si(c,a,1);Ag(c,e);e=Hg();c=Kj(c,1);if(null!==c)$c(c,1,e),Mj(c,e);else if("function"===typeof d.componentDidCatch&&(null===Ti||!Ti.has(d)))try{d.componentDidCatch(b,a);}catch(f){}break}}c=c.return;}}
	function Yj(a,b,c){var d=a.pingCache;null!==d&&d.delete(b);b=Hg();a.pingedLanes|=a.suspendedLanes&c;U===a&&(W&c)===c&&(4===V||3===V&&(W&62914560)===W&&500>O()-jj?Qj(a,0):uj|=c);Mj(a,b);}function lj(a,b){var c=a.stateNode;null!==c&&c.delete(b);b=0;0===b&&(b=a.mode,0===(b&2)?b=1:0===(b&4)?b=99===eg()?1:2:(0===Gj&&(Gj=tj),b=Yc(62914560&~Gj),0===b&&(b=4194304)));c=Hg();a=Kj(a,b);null!==a&&($c(a,b,c),Mj(a,c));}var ck;
	ck=function(a,b,c){var d=b.lanes;if(null!==a)if(a.memoizedProps!==b.pendingProps||N.current)ug=!0;else if(0!==(c&d))ug=0!==(a.flags&16384)?!0:!1;else {ug=!1;switch(b.tag){case 3:ri(b);sh();break;case 5:gh(b);break;case 1:Ff(b.type)&&Jf(b);break;case 4:eh(b,b.stateNode.containerInfo);break;case 10:d=b.memoizedProps.value;var e=b.type._context;I$1(mg,e._currentValue);e._currentValue=d;break;case 13:if(null!==b.memoizedState){if(0!==(c&b.child.childLanes))return ti(a,b,c);I$1(P,P.current&1);b=hi(a,b,c);return null!==
	b?b.sibling:null}I$1(P,P.current&1);break;case 19:d=0!==(c&b.childLanes);if(0!==(a.flags&64)){if(d)return Ai(a,b,c);b.flags|=64;}e=b.memoizedState;null!==e&&(e.rendering=null,e.tail=null,e.lastEffect=null);I$1(P,P.current);if(d)break;else return null;case 23:case 24:return b.lanes=0,mi(a,b,c)}return hi(a,b,c)}else ug=!1;b.lanes=0;switch(b.tag){case 2:d=b.type;null!==a&&(a.alternate=null,b.alternate=null,b.flags|=2);a=b.pendingProps;e=Ef(b,M.current);tg(b,c);e=Ch(null,b,d,a,e,c);b.flags|=1;if("object"===
	typeof e&&null!==e&&"function"===typeof e.render&&void 0===e.$$typeof){b.tag=1;b.memoizedState=null;b.updateQueue=null;if(Ff(d)){var f=!0;Jf(b);}else f=!1;b.memoizedState=null!==e.state&&void 0!==e.state?e.state:null;xg(b);var g=d.getDerivedStateFromProps;"function"===typeof g&&Gg(b,d,g,a);e.updater=Kg;b.stateNode=e;e._reactInternals=b;Og(b,d,a,c);b=qi(null,b,d,!0,f,c);}else b.tag=0,fi(null,b,e,c),b=b.child;return b;case 16:e=b.elementType;a:{null!==a&&(a.alternate=null,b.alternate=null,b.flags|=2);
	a=b.pendingProps;f=e._init;e=f(e._payload);b.type=e;f=b.tag=hk(e);a=lg(e,a);switch(f){case 0:b=li(null,b,e,a,c);break a;case 1:b=pi(null,b,e,a,c);break a;case 11:b=gi(null,b,e,a,c);break a;case 14:b=ii(null,b,e,lg(e.type,a),d,c);break a}throw Error(y$2(306,e,""));}return b;case 0:return d=b.type,e=b.pendingProps,e=b.elementType===d?e:lg(d,e),li(a,b,d,e,c);case 1:return d=b.type,e=b.pendingProps,e=b.elementType===d?e:lg(d,e),pi(a,b,d,e,c);case 3:ri(b);d=b.updateQueue;if(null===a||null===d)throw Error(y$2(282));
	d=b.pendingProps;e=b.memoizedState;e=null!==e?e.element:null;yg(a,b);Cg(b,d,null,c);d=b.memoizedState.element;if(d===e)sh(),b=hi(a,b,c);else {e=b.stateNode;if(f=e.hydrate)kh=rf(b.stateNode.containerInfo.firstChild),jh=b,f=lh=!0;if(f){a=e.mutableSourceEagerHydrationData;if(null!=a)for(e=0;e<a.length;e+=2)f=a[e],f._workInProgressVersionPrimary=a[e+1],th.push(f);c=Zg(b,null,d,c);for(b.child=c;c;)c.flags=c.flags&-3|1024,c=c.sibling;}else fi(a,b,d,c),sh();b=b.child;}return b;case 5:return gh(b),null===a&&
	ph(b),d=b.type,e=b.pendingProps,f=null!==a?a.memoizedProps:null,g=e.children,nf(d,e)?g=null:null!==f&&nf(d,f)&&(b.flags|=16),oi(a,b),fi(a,b,g,c),b.child;case 6:return null===a&&ph(b),null;case 13:return ti(a,b,c);case 4:return eh(b,b.stateNode.containerInfo),d=b.pendingProps,null===a?b.child=Yg(b,null,d,c):fi(a,b,d,c),b.child;case 11:return d=b.type,e=b.pendingProps,e=b.elementType===d?e:lg(d,e),gi(a,b,d,e,c);case 7:return fi(a,b,b.pendingProps,c),b.child;case 8:return fi(a,b,b.pendingProps.children,
	c),b.child;case 12:return fi(a,b,b.pendingProps.children,c),b.child;case 10:a:{d=b.type._context;e=b.pendingProps;g=b.memoizedProps;f=e.value;var h=b.type._context;I$1(mg,h._currentValue);h._currentValue=f;if(null!==g)if(h=g.value,f=He(h,f)?0:("function"===typeof d._calculateChangedBits?d._calculateChangedBits(h,f):1073741823)|0,0===f){if(g.children===e.children&&!N.current){b=hi(a,b,c);break a}}else for(h=b.child,null!==h&&(h.return=b);null!==h;){var k=h.dependencies;if(null!==k){g=h.child;for(var l=
	k.firstContext;null!==l;){if(l.context===d&&0!==(l.observedBits&f)){1===h.tag&&(l=zg(-1,c&-c),l.tag=2,Ag(h,l));h.lanes|=c;l=h.alternate;null!==l&&(l.lanes|=c);sg(h.return,c);k.lanes|=c;break}l=l.next;}}else g=10===h.tag?h.type===b.type?null:h.child:h.child;if(null!==g)g.return=h;else for(g=h;null!==g;){if(g===b){g=null;break}h=g.sibling;if(null!==h){h.return=g.return;g=h;break}g=g.return;}h=g;}fi(a,b,e.children,c);b=b.child;}return b;case 9:return e=b.type,f=b.pendingProps,d=f.children,tg(b,c),e=vg(e,
	f.unstable_observedBits),d=d(e),b.flags|=1,fi(a,b,d,c),b.child;case 14:return e=b.type,f=lg(e,b.pendingProps),f=lg(e.type,f),ii(a,b,e,f,d,c);case 15:return ki(a,b,b.type,b.pendingProps,d,c);case 17:return d=b.type,e=b.pendingProps,e=b.elementType===d?e:lg(d,e),null!==a&&(a.alternate=null,b.alternate=null,b.flags|=2),b.tag=1,Ff(d)?(a=!0,Jf(b)):a=!1,tg(b,c),Mg(b,d,e),Og(b,d,e,c),qi(null,b,d,!0,a,c);case 19:return Ai(a,b,c);case 23:return mi(a,b,c);case 24:return mi(a,b,c)}throw Error(y$2(156,b.tag));
	};function ik(a,b,c,d){this.tag=a;this.key=c;this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null;this.index=0;this.ref=null;this.pendingProps=b;this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null;this.mode=d;this.flags=0;this.lastEffect=this.firstEffect=this.nextEffect=null;this.childLanes=this.lanes=0;this.alternate=null;}function nh(a,b,c,d){return new ik(a,b,c,d)}function ji(a){a=a.prototype;return !(!a||!a.isReactComponent)}
	function hk(a){if("function"===typeof a)return ji(a)?1:0;if(void 0!==a&&null!==a){a=a.$$typeof;if(a===Aa)return 11;if(a===Da)return 14}return 2}
	function Tg(a,b){var c=a.alternate;null===c?(c=nh(a.tag,b,a.key,a.mode),c.elementType=a.elementType,c.type=a.type,c.stateNode=a.stateNode,c.alternate=a,a.alternate=c):(c.pendingProps=b,c.type=a.type,c.flags=0,c.nextEffect=null,c.firstEffect=null,c.lastEffect=null);c.childLanes=a.childLanes;c.lanes=a.lanes;c.child=a.child;c.memoizedProps=a.memoizedProps;c.memoizedState=a.memoizedState;c.updateQueue=a.updateQueue;b=a.dependencies;c.dependencies=null===b?null:{lanes:b.lanes,firstContext:b.firstContext};
	c.sibling=a.sibling;c.index=a.index;c.ref=a.ref;return c}
	function Vg(a,b,c,d,e,f){var g=2;d=a;if("function"===typeof a)ji(a)&&(g=1);else if("string"===typeof a)g=5;else a:switch(a){case ua:return Xg(c.children,e,f,b);case Ha:g=8;e|=16;break;case wa:g=8;e|=1;break;case xa:return a=nh(12,c,b,e|8),a.elementType=xa,a.type=xa,a.lanes=f,a;case Ba:return a=nh(13,c,b,e),a.type=Ba,a.elementType=Ba,a.lanes=f,a;case Ca:return a=nh(19,c,b,e),a.elementType=Ca,a.lanes=f,a;case Ia:return vi(c,e,f,b);case Ja:return a=nh(24,c,b,e),a.elementType=Ja,a.lanes=f,a;default:if("object"===
	typeof a&&null!==a)switch(a.$$typeof){case ya:g=10;break a;case za:g=9;break a;case Aa:g=11;break a;case Da:g=14;break a;case Ea:g=16;d=null;break a;case Fa:g=22;break a}throw Error(y$2(130,null==a?a:typeof a,""));}b=nh(g,c,b,e);b.elementType=a;b.type=d;b.lanes=f;return b}function Xg(a,b,c,d){a=nh(7,a,d,b);a.lanes=c;return a}function vi(a,b,c,d){a=nh(23,a,d,b);a.elementType=Ia;a.lanes=c;return a}function Ug(a,b,c){a=nh(6,a,null,b);a.lanes=c;return a}
	function Wg(a,b,c){b=nh(4,null!==a.children?a.children:[],a.key,b);b.lanes=c;b.stateNode={containerInfo:a.containerInfo,pendingChildren:null,implementation:a.implementation};return b}
	function jk(a,b,c){this.tag=b;this.containerInfo=a;this.finishedWork=this.pingCache=this.current=this.pendingChildren=null;this.timeoutHandle=-1;this.pendingContext=this.context=null;this.hydrate=c;this.callbackNode=null;this.callbackPriority=0;this.eventTimes=Zc(0);this.expirationTimes=Zc(-1);this.entangledLanes=this.finishedLanes=this.mutableReadLanes=this.expiredLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0;this.entanglements=Zc(0);this.mutableSourceEagerHydrationData=null;}
	function kk(a,b,c){var d=3<arguments.length&&void 0!==arguments[3]?arguments[3]:null;return {$$typeof:ta,key:null==d?null:""+d,children:a,containerInfo:b,implementation:c}}
	function lk(a,b,c,d){var e=b.current,f=Hg(),g=Ig(e);a:if(c){c=c._reactInternals;b:{if(Zb(c)!==c||1!==c.tag)throw Error(y$2(170));var h=c;do{switch(h.tag){case 3:h=h.stateNode.context;break b;case 1:if(Ff(h.type)){h=h.stateNode.__reactInternalMemoizedMergedChildContext;break b}}h=h.return;}while(null!==h);throw Error(y$2(171));}if(1===c.tag){var k=c.type;if(Ff(k)){c=If(c,k,h);break a}}c=h;}else c=Cf;null===b.context?b.context=c:b.pendingContext=c;b=zg(f,g);b.payload={element:a};d=void 0===d?null:d;null!==
	d&&(b.callback=d);Ag(e,b);Jg(e,g,f);return g}function mk(a){a=a.current;if(!a.child)return null;switch(a.child.tag){case 5:return a.child.stateNode;default:return a.child.stateNode}}function nk(a,b){a=a.memoizedState;if(null!==a&&null!==a.dehydrated){var c=a.retryLane;a.retryLane=0!==c&&c<b?c:b;}}function ok(a,b){nk(a,b);(a=a.alternate)&&nk(a,b);}function pk(){return null}
	function qk(a,b,c){var d=null!=c&&null!=c.hydrationOptions&&c.hydrationOptions.mutableSources||null;c=new jk(a,b,null!=c&&!0===c.hydrate);b=nh(3,null,null,2===b?7:1===b?3:0);c.current=b;b.stateNode=c;xg(b);a[ff]=c.current;cf(8===a.nodeType?a.parentNode:a);if(d)for(a=0;a<d.length;a++){b=d[a];var e=b._getVersion;e=e(b._source);null==c.mutableSourceEagerHydrationData?c.mutableSourceEagerHydrationData=[b,e]:c.mutableSourceEagerHydrationData.push(b,e);}this._internalRoot=c;}
	qk.prototype.render=function(a){lk(a,this._internalRoot,null,null);};qk.prototype.unmount=function(){var a=this._internalRoot,b=a.containerInfo;lk(null,a,null,function(){b[ff]=null;});};function rk(a){return !(!a||1!==a.nodeType&&9!==a.nodeType&&11!==a.nodeType&&(8!==a.nodeType||" react-mount-point-unstable "!==a.nodeValue))}
	function sk(a,b){b||(b=a?9===a.nodeType?a.documentElement:a.firstChild:null,b=!(!b||1!==b.nodeType||!b.hasAttribute("data-reactroot")));if(!b)for(var c;c=a.lastChild;)a.removeChild(c);return new qk(a,0,b?{hydrate:!0}:void 0)}
	function tk(a,b,c,d,e){var f=c._reactRootContainer;if(f){var g=f._internalRoot;if("function"===typeof e){var h=e;e=function(){var a=mk(g);h.call(a);};}lk(b,g,a,e);}else {f=c._reactRootContainer=sk(c,d);g=f._internalRoot;if("function"===typeof e){var k=e;e=function(){var a=mk(g);k.call(a);};}Xj(function(){lk(b,g,a,e);});}return mk(g)}ec=function(a){if(13===a.tag){var b=Hg();Jg(a,4,b);ok(a,4);}};fc=function(a){if(13===a.tag){var b=Hg();Jg(a,67108864,b);ok(a,67108864);}};
	gc=function(a){if(13===a.tag){var b=Hg(),c=Ig(a);Jg(a,c,b);ok(a,c);}};hc=function(a,b){return b()};
	yb=function(a,b,c){switch(b){case "input":ab(a,c);b=c.name;if("radio"===c.type&&null!=b){for(c=a;c.parentNode;)c=c.parentNode;c=c.querySelectorAll("input[name="+JSON.stringify(""+b)+'][type="radio"]');for(b=0;b<c.length;b++){var d=c[b];if(d!==a&&d.form===a.form){var e=Db(d);if(!e)throw Error(y$2(90));Wa(d);ab(d,e);}}}break;case "textarea":ib(a,c);break;case "select":b=c.value,null!=b&&fb(a,!!c.multiple,b,!1);}};Gb=Wj;
	Hb=function(a,b,c,d,e){var f=X;X|=4;try{return gg(98,a.bind(null,b,c,d,e))}finally{X=f,0===X&&(wj(),ig());}};Ib=function(){0===(X&49)&&(Vj(),Oj());};Jb=function(a,b){var c=X;X|=2;try{return a(b)}finally{X=c,0===X&&(wj(),ig());}};function uk(a,b){var c=2<arguments.length&&void 0!==arguments[2]?arguments[2]:null;if(!rk(b))throw Error(y$2(200));return kk(a,b,null,c)}var vk={Events:[Cb,ue,Db,Eb,Fb,Oj,{current:!1}]},wk={findFiberByHostInstance:wc,bundleType:0,version:"17.0.2",rendererPackageName:"react-dom"};
	var xk={bundleType:wk.bundleType,version:wk.version,rendererPackageName:wk.rendererPackageName,rendererConfig:wk.rendererConfig,overrideHookState:null,overrideHookStateDeletePath:null,overrideHookStateRenamePath:null,overrideProps:null,overridePropsDeletePath:null,overridePropsRenamePath:null,setSuspenseHandler:null,scheduleUpdate:null,currentDispatcherRef:ra.ReactCurrentDispatcher,findHostInstanceByFiber:function(a){a=cc(a);return null===a?null:a.stateNode},findFiberByHostInstance:wk.findFiberByHostInstance||
	pk,findHostInstancesForRefresh:null,scheduleRefresh:null,scheduleRoot:null,setRefreshHandler:null,getCurrentFiber:null};if("undefined"!==typeof __REACT_DEVTOOLS_GLOBAL_HOOK__){var yk=__REACT_DEVTOOLS_GLOBAL_HOOK__;if(!yk.isDisabled&&yk.supportsFiber)try{Lf=yk.inject(xk),Mf=yk;}catch(a){}}reactDom_production_min.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=vk;reactDom_production_min.createPortal=uk;
	reactDom_production_min.findDOMNode=function(a){if(null==a)return null;if(1===a.nodeType)return a;var b=a._reactInternals;if(void 0===b){if("function"===typeof a.render)throw Error(y$2(188));throw Error(y$2(268,Object.keys(a)));}a=cc(b);a=null===a?null:a.stateNode;return a};reactDom_production_min.flushSync=function(a,b){var c=X;if(0!==(c&48))return a(b);X|=1;try{if(a)return gg(99,a.bind(null,b))}finally{X=c,ig();}};reactDom_production_min.hydrate=function(a,b,c){if(!rk(b))throw Error(y$2(200));return tk(null,a,b,!0,c)};
	reactDom_production_min.render=function(a,b,c){if(!rk(b))throw Error(y$2(200));return tk(null,a,b,!1,c)};reactDom_production_min.unmountComponentAtNode=function(a){if(!rk(a))throw Error(y$2(40));return a._reactRootContainer?(Xj(function(){tk(null,null,a,!1,function(){a._reactRootContainer=null;a[ff]=null;});}),!0):!1};reactDom_production_min.unstable_batchedUpdates=Wj;reactDom_production_min.unstable_createPortal=function(a,b){return uk(a,b,2<arguments.length&&void 0!==arguments[2]?arguments[2]:null)};
	reactDom_production_min.unstable_renderSubtreeIntoContainer=function(a,b,c,d){if(!rk(c))throw Error(y$2(200));if(null==a||void 0===a._reactInternals)throw Error(y$2(38));return tk(a,b,c,!1,d)};reactDom_production_min.version="17.0.2";

	function checkDCE() {
	  /* global __REACT_DEVTOOLS_GLOBAL_HOOK__ */
	  if (
	    typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ === 'undefined' ||
	    typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE !== 'function'
	  ) {
	    return;
	  }
	  try {
	    // Verify that the code above has been dead code eliminated (DCE'd).
	    __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(checkDCE);
	  } catch (err) {
	    // DevTools shouldn't crash React, no matter what.
	    // We should still report in case we break this code.
	    console.error(err);
	  }
	}

	{
	  // DCE check should happen before ReactDOM bundle executes so that
	  // DevTools can report bad minification during injection.
	  checkDCE();
	  reactDom.exports = reactDom_production_min;
	}

	var ReactDOM = reactDom.exports;

	function _extends() {
	  return _extends = Object.assign ? Object.assign.bind() : function (n) {
	    for (var e = 1; e < arguments.length; e++) {
	      var t = arguments[e];
	      for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);
	    }
	    return n;
	  }, _extends.apply(null, arguments);
	}

	function _typeof$2(o) {
	  "@babel/helpers - typeof";

	  return _typeof$2 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) {
	    return typeof o;
	  } : function (o) {
	    return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
	  }, _typeof$2(o);
	}

	function isPlainObject$1(item) {
	  return item && _typeof$2(item) === 'object' && item.constructor === Object;
	}
	function deepmerge(target, source) {
	  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {
	    clone: true
	  };
	  var output = options.clone ? _extends({}, target) : target;

	  if (isPlainObject$1(target) && isPlainObject$1(source)) {
	    Object.keys(source).forEach(function (key) {
	      // Avoid prototype pollution
	      if (key === '__proto__') {
	        return;
	      }

	      if (isPlainObject$1(source[key]) && key in target) {
	        output[key] = deepmerge(target[key], source[key], options);
	      } else {
	        output[key] = source[key];
	      }
	    });
	  }

	  return output;
	}

	function toPrimitive(t, r) {
	  if ("object" != _typeof$2(t) || !t) return t;
	  var e = t[Symbol.toPrimitive];
	  if (void 0 !== e) {
	    var i = e.call(t, r || "default");
	    if ("object" != _typeof$2(i)) return i;
	    throw new TypeError("@@toPrimitive must return a primitive value.");
	  }
	  return ("string" === r ? String : Number)(t);
	}

	function toPropertyKey(t) {
	  var i = toPrimitive(t, "string");
	  return "symbol" == _typeof$2(i) ? i : i + "";
	}

	function _defineProperty$2(e, r, t) {
	  return (r = toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
	    value: t,
	    enumerable: !0,
	    configurable: !0,
	    writable: !0
	  }) : e[r] = t, e;
	}

	/**
	 * WARNING: Don't import this directly.
	 * Use `MuiError` from `@material-ui/utils/macros/MuiError.macro` instead.
	 * @param {number} code
	 */
	function formatMuiErrorMessage(code) {
	  // Apply babel-plugin-transform-template-literals in loose mode
	  // loose mode is safe iff we're concatenating primitives
	  // see https://babeljs.io/docs/en/babel-plugin-transform-template-literals#loose

	  /* eslint-disable prefer-template */
	  var url = 'https://mui.com/production-error/?code=' + code;

	  for (var i = 1; i < arguments.length; i += 1) {
	    // rest params over-transpile for this case
	    // eslint-disable-next-line prefer-rest-params
	    url += '&args[]=' + encodeURIComponent(arguments[i]);
	  }

	  return 'Minified Material-UI error #' + code + '; visit ' + url + ' for the full message.';
	  /* eslint-enable prefer-template */
	}

	var reactIs$2 = {exports: {}};

	var reactIs_production_min$1 = {};

	/** @license React v17.0.2
	 * react-is.production.min.js
	 *
	 * Copyright (c) Facebook, Inc. and its affiliates.
	 *
	 * This source code is licensed under the MIT license found in the
	 * LICENSE file in the root directory of this source tree.
	 */
	var b$1=60103,c$1=60106,d$1=60107,e$1=60108,f$1=60114,g$2=60109,h$1=60110,k$1=60112,l$1=60113,m$1=60120,n$1=60115,p$1=60116,q$1=60121,r$2=60122,u=60117,v$1=60129,w$1=60131;
	if("function"===typeof Symbol&&Symbol.for){var x$1=Symbol.for;b$1=x$1("react.element");c$1=x$1("react.portal");d$1=x$1("react.fragment");e$1=x$1("react.strict_mode");f$1=x$1("react.profiler");g$2=x$1("react.provider");h$1=x$1("react.context");k$1=x$1("react.forward_ref");l$1=x$1("react.suspense");m$1=x$1("react.suspense_list");n$1=x$1("react.memo");p$1=x$1("react.lazy");q$1=x$1("react.block");r$2=x$1("react.server.block");u=x$1("react.fundamental");v$1=x$1("react.debug_trace_mode");w$1=x$1("react.legacy_hidden");}
	function y$1(a){if("object"===typeof a&&null!==a){var t=a.$$typeof;switch(t){case b$1:switch(a=a.type,a){case d$1:case f$1:case e$1:case l$1:case m$1:return a;default:switch(a=a&&a.$$typeof,a){case h$1:case k$1:case p$1:case n$1:case g$2:return a;default:return t}}case c$1:return t}}}var z$1=g$2,A$1=b$1,B=k$1,C=d$1,D=p$1,E=n$1,F=c$1,G=f$1,H=e$1,I=l$1;reactIs_production_min$1.ContextConsumer=h$1;reactIs_production_min$1.ContextProvider=z$1;reactIs_production_min$1.Element=A$1;reactIs_production_min$1.ForwardRef=B;reactIs_production_min$1.Fragment=C;reactIs_production_min$1.Lazy=D;reactIs_production_min$1.Memo=E;reactIs_production_min$1.Portal=F;reactIs_production_min$1.Profiler=G;reactIs_production_min$1.StrictMode=H;
	reactIs_production_min$1.Suspense=I;reactIs_production_min$1.isAsyncMode=function(){return !1};reactIs_production_min$1.isConcurrentMode=function(){return !1};reactIs_production_min$1.isContextConsumer=function(a){return y$1(a)===h$1};reactIs_production_min$1.isContextProvider=function(a){return y$1(a)===g$2};reactIs_production_min$1.isElement=function(a){return "object"===typeof a&&null!==a&&a.$$typeof===b$1};reactIs_production_min$1.isForwardRef=function(a){return y$1(a)===k$1};reactIs_production_min$1.isFragment=function(a){return y$1(a)===d$1};reactIs_production_min$1.isLazy=function(a){return y$1(a)===p$1};reactIs_production_min$1.isMemo=function(a){return y$1(a)===n$1};
	reactIs_production_min$1.isPortal=function(a){return y$1(a)===c$1};reactIs_production_min$1.isProfiler=function(a){return y$1(a)===f$1};reactIs_production_min$1.isStrictMode=function(a){return y$1(a)===e$1};reactIs_production_min$1.isSuspense=function(a){return y$1(a)===l$1};reactIs_production_min$1.isValidElementType=function(a){return "string"===typeof a||"function"===typeof a||a===d$1||a===f$1||a===v$1||a===e$1||a===l$1||a===m$1||a===w$1||"object"===typeof a&&null!==a&&(a.$$typeof===p$1||a.$$typeof===n$1||a.$$typeof===g$2||a.$$typeof===h$1||a.$$typeof===k$1||a.$$typeof===u||a.$$typeof===q$1||a[0]===r$2)?!0:!1};
	reactIs_production_min$1.typeOf=y$1;

	{
	  reactIs$2.exports = reactIs_production_min$1;
	}

	var hasSymbol = typeof Symbol === 'function' && Symbol.for;
	var nested = hasSymbol ? Symbol.for('mui.nested') : '__THEME_NESTED__';

	/**
	 * This is the list of the style rule name we use as drop in replacement for the built-in
	 * pseudo classes (:checked, :disabled, :focused, etc.).
	 *
	 * Why do they exist in the first place?
	 * These classes are used at a specificity of 2.
	 * It allows them to override previously definied styles as well as
	 * being untouched by simple user overrides.
	 */

	var pseudoClasses = ['checked', 'disabled', 'error', 'focused', 'focusVisible', 'required', 'expanded', 'selected']; // Returns a function which generates unique class names based on counters.
	// When new generator function is created, rule counter is reset.
	// We need to reset the rule counter for SSR for each request.
	//
	// It's inspired by
	// https://github.com/cssinjs/jss/blob/4e6a05dd3f7b6572fdd3ab216861d9e446c20331/src/utils/createGenerateClassName.js

	function createGenerateClassName() {
	  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	  var _options$disableGloba = options.disableGlobal,
	      disableGlobal = _options$disableGloba === void 0 ? false : _options$disableGloba,
	      _options$productionPr = options.productionPrefix,
	      productionPrefix = _options$productionPr === void 0 ? 'jss' : _options$productionPr,
	      _options$seed = options.seed,
	      seed = _options$seed === void 0 ? '' : _options$seed;
	  var seedPrefix = seed === '' ? '' : "".concat(seed, "-");
	  var ruleCounter = 0;

	  var getNextCounterId = function getNextCounterId() {
	    ruleCounter += 1;

	    return ruleCounter;
	  };

	  return function (rule, styleSheet) {
	    var name = styleSheet.options.name; // Is a global static MUI style?

	    if (name && name.indexOf('Mui') === 0 && !styleSheet.options.link && !disableGlobal) {
	      // We can use a shorthand class name, we never use the keys to style the components.
	      if (pseudoClasses.indexOf(rule.key) !== -1) {
	        return "Mui-".concat(rule.key);
	      }

	      var prefix = "".concat(seedPrefix).concat(name, "-").concat(rule.key);

	      if (!styleSheet.options.theme[nested] || seed !== '') {
	        return prefix;
	      }

	      return "".concat(prefix, "-").concat(getNextCounterId());
	    }

	    {
	      return "".concat(seedPrefix).concat(productionPrefix).concat(getNextCounterId());
	    }
	  };
	}

	/* eslint-disable no-restricted-syntax */
	function getThemeProps(params) {
	  var theme = params.theme,
	      name = params.name,
	      props = params.props;

	  if (!theme || !theme.props || !theme.props[name]) {
	    return props;
	  } // Resolve default props, code borrow from React source.
	  // https://github.com/facebook/react/blob/15a8f031838a553e41c0b66eb1bcf1da8448104d/packages/react/src/ReactElement.js#L221


	  var defaultProps = theme.props[name];
	  var propName;

	  for (propName in defaultProps) {
	    if (props[propName] === undefined) {
	      props[propName] = defaultProps[propName];
	    }
	  }

	  return props;
	}

	var _typeof$1 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

	var isBrowser = (typeof window === "undefined" ? "undefined" : _typeof$1(window)) === "object" && (typeof document === "undefined" ? "undefined" : _typeof$1(document)) === 'object' && document.nodeType === 9;

	function _defineProperties(e, r) {
	  for (var t = 0; t < r.length; t++) {
	    var o = r[t];
	    o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, toPropertyKey(o.key), o);
	  }
	}
	function _createClass(e, r, t) {
	  return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", {
	    writable: !1
	  }), e;
	}

	function _setPrototypeOf(t, e) {
	  return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) {
	    return t.__proto__ = e, t;
	  }, _setPrototypeOf(t, e);
	}

	function _inheritsLoose(t, o) {
	  t.prototype = Object.create(o.prototype), t.prototype.constructor = t, _setPrototypeOf(t, o);
	}

	function _assertThisInitialized(e) {
	  if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
	  return e;
	}

	function _objectWithoutPropertiesLoose(r, e) {
	  if (null == r) return {};
	  var t = {};
	  for (var n in r) if ({}.hasOwnProperty.call(r, n)) {
	    if (-1 !== e.indexOf(n)) continue;
	    t[n] = r[n];
	  }
	  return t;
	}

	var plainObjectConstrurctor = {}.constructor;
	function cloneStyle(style) {
	  if (style == null || typeof style !== 'object') return style;
	  if (Array.isArray(style)) return style.map(cloneStyle);
	  if (style.constructor !== plainObjectConstrurctor) return style;
	  var newStyle = {};

	  for (var name in style) {
	    newStyle[name] = cloneStyle(style[name]);
	  }

	  return newStyle;
	}

	/**
	 * Create a rule instance.
	 */

	function createRule(name, decl, options) {
	  if (name === void 0) {
	    name = 'unnamed';
	  }

	  var jss = options.jss;
	  var declCopy = cloneStyle(decl);
	  var rule = jss.plugins.onCreateRule(name, declCopy, options);
	  if (rule) return rule; // It is an at-rule and it has no instance.

	  if (name[0] === '@') ;

	  return null;
	}

	var join$1 = function join(value, by) {
	  var result = '';

	  for (var i = 0; i < value.length; i++) {
	    // Remove !important from the value, it will be readded later.
	    if (value[i] === '!important') break;
	    if (result) result += by;
	    result += value[i];
	  }

	  return result;
	};
	/**
	 * Converts JSS array value to a CSS string.
	 *
	 * `margin: [['5px', '10px']]` > `margin: 5px 10px;`
	 * `border: ['1px', '2px']` > `border: 1px, 2px;`
	 * `margin: [['5px', '10px'], '!important']` > `margin: 5px 10px !important;`
	 * `color: ['red', !important]` > `color: red !important;`
	 */


	var toCssValue = function toCssValue(value) {
	  if (!Array.isArray(value)) return value;
	  var cssValue = ''; // Support space separated values via `[['5px', '10px']]`.

	  if (Array.isArray(value[0])) {
	    for (var i = 0; i < value.length; i++) {
	      if (value[i] === '!important') break;
	      if (cssValue) cssValue += ', ';
	      cssValue += join$1(value[i], ' ');
	    }
	  } else cssValue = join$1(value, ', '); // Add !important, because it was ignored.


	  if (value[value.length - 1] === '!important') {
	    cssValue += ' !important';
	  }

	  return cssValue;
	};

	function getWhitespaceSymbols(options) {
	  if (options && options.format === false) {
	    return {
	      linebreak: '',
	      space: ''
	    };
	  }

	  return {
	    linebreak: '\n',
	    space: ' '
	  };
	}

	/**
	 * Indent a string.
	 * http://jsperf.com/array-join-vs-for
	 */

	function indentStr(str, indent) {
	  var result = '';

	  for (var index = 0; index < indent; index++) {
	    result += '  ';
	  }

	  return result + str;
	}
	/**
	 * Converts a Rule to CSS string.
	 */


	function toCss(selector, style, options) {
	  if (options === void 0) {
	    options = {};
	  }

	  var result = '';
	  if (!style) return result;
	  var _options = options,
	      _options$indent = _options.indent,
	      indent = _options$indent === void 0 ? 0 : _options$indent;
	  var fallbacks = style.fallbacks;

	  if (options.format === false) {
	    indent = -Infinity;
	  }

	  var _getWhitespaceSymbols = getWhitespaceSymbols(options),
	      linebreak = _getWhitespaceSymbols.linebreak,
	      space = _getWhitespaceSymbols.space;

	  if (selector) indent++; // Apply fallbacks first.

	  if (fallbacks) {
	    // Array syntax {fallbacks: [{prop: value}]}
	    if (Array.isArray(fallbacks)) {
	      for (var index = 0; index < fallbacks.length; index++) {
	        var fallback = fallbacks[index];

	        for (var prop in fallback) {
	          var value = fallback[prop];

	          if (value != null) {
	            if (result) result += linebreak;
	            result += indentStr(prop + ":" + space + toCssValue(value) + ";", indent);
	          }
	        }
	      }
	    } else {
	      // Object syntax {fallbacks: {prop: value}}
	      for (var _prop in fallbacks) {
	        var _value = fallbacks[_prop];

	        if (_value != null) {
	          if (result) result += linebreak;
	          result += indentStr(_prop + ":" + space + toCssValue(_value) + ";", indent);
	        }
	      }
	    }
	  }

	  for (var _prop2 in style) {
	    var _value2 = style[_prop2];

	    if (_value2 != null && _prop2 !== 'fallbacks') {
	      if (result) result += linebreak;
	      result += indentStr(_prop2 + ":" + space + toCssValue(_value2) + ";", indent);
	    }
	  } // Allow empty style in this case, because properties will be added dynamically.


	  if (!result && !options.allowEmpty) return result; // When rule is being stringified before selector was defined.

	  if (!selector) return result;
	  indent--;
	  if (result) result = "" + linebreak + result + linebreak;
	  return indentStr("" + selector + space + "{" + result, indent) + indentStr('}', indent);
	}

	var escapeRegex = /([[\].#*$><+~=|^:(),"'`\s])/g;
	var nativeEscape = typeof CSS !== 'undefined' && CSS.escape;
	var escape$1 = (function (str) {
	  return nativeEscape ? nativeEscape(str) : str.replace(escapeRegex, '\\$1');
	});

	var BaseStyleRule =
	/*#__PURE__*/
	function () {
	  function BaseStyleRule(key, style, options) {
	    this.type = 'style';
	    this.isProcessed = false;
	    var sheet = options.sheet,
	        Renderer = options.Renderer;
	    this.key = key;
	    this.options = options;
	    this.style = style;
	    if (sheet) this.renderer = sheet.renderer;else if (Renderer) this.renderer = new Renderer();
	  }
	  /**
	   * Get or set a style property.
	   */


	  var _proto = BaseStyleRule.prototype;

	  _proto.prop = function prop(name, value, options) {
	    // It's a getter.
	    if (value === undefined) return this.style[name]; // Don't do anything if the value has not changed.

	    var force = options ? options.force : false;
	    if (!force && this.style[name] === value) return this;
	    var newValue = value;

	    if (!options || options.process !== false) {
	      newValue = this.options.jss.plugins.onChangeValue(value, name, this);
	    }

	    var isEmpty = newValue == null || newValue === false;
	    var isDefined = name in this.style; // Value is empty and wasn't defined before.

	    if (isEmpty && !isDefined && !force) return this; // We are going to remove this value.

	    var remove = isEmpty && isDefined;
	    if (remove) delete this.style[name];else this.style[name] = newValue; // Renderable is defined if StyleSheet option `link` is true.

	    if (this.renderable && this.renderer) {
	      if (remove) this.renderer.removeProperty(this.renderable, name);else this.renderer.setProperty(this.renderable, name, newValue);
	      return this;
	    }

	    var sheet = this.options.sheet;

	    if (sheet && sheet.attached) ;

	    return this;
	  };

	  return BaseStyleRule;
	}();
	var StyleRule =
	/*#__PURE__*/
	function (_BaseStyleRule) {
	  _inheritsLoose(StyleRule, _BaseStyleRule);

	  function StyleRule(key, style, options) {
	    var _this;

	    _this = _BaseStyleRule.call(this, key, style, options) || this;
	    var selector = options.selector,
	        scoped = options.scoped,
	        sheet = options.sheet,
	        generateId = options.generateId;

	    if (selector) {
	      _this.selectorText = selector;
	    } else if (scoped !== false) {
	      _this.id = generateId(_assertThisInitialized(_assertThisInitialized(_this)), sheet);
	      _this.selectorText = "." + escape$1(_this.id);
	    }

	    return _this;
	  }
	  /**
	   * Set selector string.
	   * Attention: use this with caution. Most browsers didn't implement
	   * selectorText setter, so this may result in rerendering of entire Style Sheet.
	   */


	  var _proto2 = StyleRule.prototype;

	  /**
	   * Apply rule to an element inline.
	   */
	  _proto2.applyTo = function applyTo(renderable) {
	    var renderer = this.renderer;

	    if (renderer) {
	      var json = this.toJSON();

	      for (var prop in json) {
	        renderer.setProperty(renderable, prop, json[prop]);
	      }
	    }

	    return this;
	  }
	  /**
	   * Returns JSON representation of the rule.
	   * Fallbacks are not supported.
	   * Useful for inline styles.
	   */
	  ;

	  _proto2.toJSON = function toJSON() {
	    var json = {};

	    for (var prop in this.style) {
	      var value = this.style[prop];
	      if (typeof value !== 'object') json[prop] = value;else if (Array.isArray(value)) json[prop] = toCssValue(value);
	    }

	    return json;
	  }
	  /**
	   * Generates a CSS string.
	   */
	  ;

	  _proto2.toString = function toString(options) {
	    var sheet = this.options.sheet;
	    var link = sheet ? sheet.options.link : false;
	    var opts = link ? _extends({}, options, {
	      allowEmpty: true
	    }) : options;
	    return toCss(this.selectorText, this.style, opts);
	  };

	  _createClass(StyleRule, [{
	    key: "selector",
	    set: function set(selector) {
	      if (selector === this.selectorText) return;
	      this.selectorText = selector;
	      var renderer = this.renderer,
	          renderable = this.renderable;
	      if (!renderable || !renderer) return;
	      var hasChanged = renderer.setSelector(renderable, selector); // If selector setter is not implemented, rerender the rule.

	      if (!hasChanged) {
	        renderer.replaceRule(renderable, this);
	      }
	    }
	    /**
	     * Get selector string.
	     */
	    ,
	    get: function get() {
	      return this.selectorText;
	    }
	  }]);

	  return StyleRule;
	}(BaseStyleRule);
	var pluginStyleRule = {
	  onCreateRule: function onCreateRule(key, style, options) {
	    if (key[0] === '@' || options.parent && options.parent.type === 'keyframes') {
	      return null;
	    }

	    return new StyleRule(key, style, options);
	  }
	};

	var defaultToStringOptions = {
	  indent: 1,
	  children: true
	};
	var atRegExp = /@([\w-]+)/;
	/**
	 * Conditional rule for @media, @supports
	 */

	var ConditionalRule =
	/*#__PURE__*/
	function () {
	  function ConditionalRule(key, styles, options) {
	    this.type = 'conditional';
	    this.isProcessed = false;
	    this.key = key;
	    var atMatch = key.match(atRegExp);
	    this.at = atMatch ? atMatch[1] : 'unknown'; // Key might contain a unique suffix in case the `name` passed by user was duplicate.

	    this.query = options.name || "@" + this.at;
	    this.options = options;
	    this.rules = new RuleList(_extends({}, options, {
	      parent: this
	    }));

	    for (var name in styles) {
	      this.rules.add(name, styles[name]);
	    }

	    this.rules.process();
	  }
	  /**
	   * Get a rule.
	   */


	  var _proto = ConditionalRule.prototype;

	  _proto.getRule = function getRule(name) {
	    return this.rules.get(name);
	  }
	  /**
	   * Get index of a rule.
	   */
	  ;

	  _proto.indexOf = function indexOf(rule) {
	    return this.rules.indexOf(rule);
	  }
	  /**
	   * Create and register rule, run plugins.
	   */
	  ;

	  _proto.addRule = function addRule(name, style, options) {
	    var rule = this.rules.add(name, style, options);
	    if (!rule) return null;
	    this.options.jss.plugins.onProcessRule(rule);
	    return rule;
	  }
	  /**
	   * Replace rule, run plugins.
	   */
	  ;

	  _proto.replaceRule = function replaceRule(name, style, options) {
	    var newRule = this.rules.replace(name, style, options);
	    if (newRule) this.options.jss.plugins.onProcessRule(newRule);
	    return newRule;
	  }
	  /**
	   * Generates a CSS string.
	   */
	  ;

	  _proto.toString = function toString(options) {
	    if (options === void 0) {
	      options = defaultToStringOptions;
	    }

	    var _getWhitespaceSymbols = getWhitespaceSymbols(options),
	        linebreak = _getWhitespaceSymbols.linebreak;

	    if (options.indent == null) options.indent = defaultToStringOptions.indent;
	    if (options.children == null) options.children = defaultToStringOptions.children;

	    if (options.children === false) {
	      return this.query + " {}";
	    }

	    var children = this.rules.toString(options);
	    return children ? this.query + " {" + linebreak + children + linebreak + "}" : '';
	  };

	  return ConditionalRule;
	}();
	var keyRegExp = /@container|@media|@supports\s+/;
	var pluginConditionalRule = {
	  onCreateRule: function onCreateRule(key, styles, options) {
	    return keyRegExp.test(key) ? new ConditionalRule(key, styles, options) : null;
	  }
	};

	var defaultToStringOptions$1 = {
	  indent: 1,
	  children: true
	};
	var nameRegExp = /@keyframes\s+([\w-]+)/;
	/**
	 * Rule for @keyframes
	 */

	var KeyframesRule =
	/*#__PURE__*/
	function () {
	  function KeyframesRule(key, frames, options) {
	    this.type = 'keyframes';
	    this.at = '@keyframes';
	    this.isProcessed = false;
	    var nameMatch = key.match(nameRegExp);

	    if (nameMatch && nameMatch[1]) {
	      this.name = nameMatch[1];
	    } else {
	      this.name = 'noname';
	    }

	    this.key = this.type + "-" + this.name;
	    this.options = options;
	    var scoped = options.scoped,
	        sheet = options.sheet,
	        generateId = options.generateId;
	    this.id = scoped === false ? this.name : escape$1(generateId(this, sheet));
	    this.rules = new RuleList(_extends({}, options, {
	      parent: this
	    }));

	    for (var name in frames) {
	      this.rules.add(name, frames[name], _extends({}, options, {
	        parent: this
	      }));
	    }

	    this.rules.process();
	  }
	  /**
	   * Generates a CSS string.
	   */


	  var _proto = KeyframesRule.prototype;

	  _proto.toString = function toString(options) {
	    if (options === void 0) {
	      options = defaultToStringOptions$1;
	    }

	    var _getWhitespaceSymbols = getWhitespaceSymbols(options),
	        linebreak = _getWhitespaceSymbols.linebreak;

	    if (options.indent == null) options.indent = defaultToStringOptions$1.indent;
	    if (options.children == null) options.children = defaultToStringOptions$1.children;

	    if (options.children === false) {
	      return this.at + " " + this.id + " {}";
	    }

	    var children = this.rules.toString(options);
	    if (children) children = "" + linebreak + children + linebreak;
	    return this.at + " " + this.id + " {" + children + "}";
	  };

	  return KeyframesRule;
	}();
	var keyRegExp$1 = /@keyframes\s+/;
	var refRegExp$1 = /\$([\w-]+)/g;

	var findReferencedKeyframe = function findReferencedKeyframe(val, keyframes) {
	  if (typeof val === 'string') {
	    return val.replace(refRegExp$1, function (match, name) {
	      if (name in keyframes) {
	        return keyframes[name];
	      }
	      return match;
	    });
	  }

	  return val;
	};
	/**
	 * Replace the reference for a animation name.
	 */


	var replaceRef = function replaceRef(style, prop, keyframes) {
	  var value = style[prop];
	  var refKeyframe = findReferencedKeyframe(value, keyframes);

	  if (refKeyframe !== value) {
	    style[prop] = refKeyframe;
	  }
	};

	var pluginKeyframesRule = {
	  onCreateRule: function onCreateRule(key, frames, options) {
	    return typeof key === 'string' && keyRegExp$1.test(key) ? new KeyframesRule(key, frames, options) : null;
	  },
	  // Animation name ref replacer.
	  onProcessStyle: function onProcessStyle(style, rule, sheet) {
	    if (rule.type !== 'style' || !sheet) return style;
	    if ('animation-name' in style) replaceRef(style, 'animation-name', sheet.keyframes);
	    if ('animation' in style) replaceRef(style, 'animation', sheet.keyframes);
	    return style;
	  },
	  onChangeValue: function onChangeValue(val, prop, rule) {
	    var sheet = rule.options.sheet;

	    if (!sheet) {
	      return val;
	    }

	    switch (prop) {
	      case 'animation':
	        return findReferencedKeyframe(val, sheet.keyframes);

	      case 'animation-name':
	        return findReferencedKeyframe(val, sheet.keyframes);

	      default:
	        return val;
	    }
	  }
	};

	var KeyframeRule =
	/*#__PURE__*/
	function (_BaseStyleRule) {
	  _inheritsLoose(KeyframeRule, _BaseStyleRule);

	  function KeyframeRule() {
	    return _BaseStyleRule.apply(this, arguments) || this;
	  }

	  var _proto = KeyframeRule.prototype;

	  /**
	   * Generates a CSS string.
	   */
	  _proto.toString = function toString(options) {
	    var sheet = this.options.sheet;
	    var link = sheet ? sheet.options.link : false;
	    var opts = link ? _extends({}, options, {
	      allowEmpty: true
	    }) : options;
	    return toCss(this.key, this.style, opts);
	  };

	  return KeyframeRule;
	}(BaseStyleRule);
	var pluginKeyframeRule = {
	  onCreateRule: function onCreateRule(key, style, options) {
	    if (options.parent && options.parent.type === 'keyframes') {
	      return new KeyframeRule(key, style, options);
	    }

	    return null;
	  }
	};

	var FontFaceRule =
	/*#__PURE__*/
	function () {
	  function FontFaceRule(key, style, options) {
	    this.type = 'font-face';
	    this.at = '@font-face';
	    this.isProcessed = false;
	    this.key = key;
	    this.style = style;
	    this.options = options;
	  }
	  /**
	   * Generates a CSS string.
	   */


	  var _proto = FontFaceRule.prototype;

	  _proto.toString = function toString(options) {
	    var _getWhitespaceSymbols = getWhitespaceSymbols(options),
	        linebreak = _getWhitespaceSymbols.linebreak;

	    if (Array.isArray(this.style)) {
	      var str = '';

	      for (var index = 0; index < this.style.length; index++) {
	        str += toCss(this.at, this.style[index]);
	        if (this.style[index + 1]) str += linebreak;
	      }

	      return str;
	    }

	    return toCss(this.at, this.style, options);
	  };

	  return FontFaceRule;
	}();
	var keyRegExp$2 = /@font-face/;
	var pluginFontFaceRule = {
	  onCreateRule: function onCreateRule(key, style, options) {
	    return keyRegExp$2.test(key) ? new FontFaceRule(key, style, options) : null;
	  }
	};

	var ViewportRule =
	/*#__PURE__*/
	function () {
	  function ViewportRule(key, style, options) {
	    this.type = 'viewport';
	    this.at = '@viewport';
	    this.isProcessed = false;
	    this.key = key;
	    this.style = style;
	    this.options = options;
	  }
	  /**
	   * Generates a CSS string.
	   */


	  var _proto = ViewportRule.prototype;

	  _proto.toString = function toString(options) {
	    return toCss(this.key, this.style, options);
	  };

	  return ViewportRule;
	}();
	var pluginViewportRule = {
	  onCreateRule: function onCreateRule(key, style, options) {
	    return key === '@viewport' || key === '@-ms-viewport' ? new ViewportRule(key, style, options) : null;
	  }
	};

	var SimpleRule =
	/*#__PURE__*/
	function () {
	  function SimpleRule(key, value, options) {
	    this.type = 'simple';
	    this.isProcessed = false;
	    this.key = key;
	    this.value = value;
	    this.options = options;
	  }
	  /**
	   * Generates a CSS string.
	   */
	  // eslint-disable-next-line no-unused-vars


	  var _proto = SimpleRule.prototype;

	  _proto.toString = function toString(options) {
	    if (Array.isArray(this.value)) {
	      var str = '';

	      for (var index = 0; index < this.value.length; index++) {
	        str += this.key + " " + this.value[index] + ";";
	        if (this.value[index + 1]) str += '\n';
	      }

	      return str;
	    }

	    return this.key + " " + this.value + ";";
	  };

	  return SimpleRule;
	}();
	var keysMap = {
	  '@charset': true,
	  '@import': true,
	  '@namespace': true
	};
	var pluginSimpleRule = {
	  onCreateRule: function onCreateRule(key, value, options) {
	    return key in keysMap ? new SimpleRule(key, value, options) : null;
	  }
	};

	var plugins$1 = [pluginStyleRule, pluginConditionalRule, pluginKeyframesRule, pluginKeyframeRule, pluginFontFaceRule, pluginViewportRule, pluginSimpleRule];

	var defaultUpdateOptions = {
	  process: true
	};
	var forceUpdateOptions = {
	  force: true,
	  process: true
	  /**
	   * Contains rules objects and allows adding/removing etc.
	   * Is used for e.g. by `StyleSheet` or `ConditionalRule`.
	   */

	};

	var RuleList =
	/*#__PURE__*/
	function () {
	  // Rules registry for access by .get() method.
	  // It contains the same rule registered by name and by selector.
	  // Original styles object.
	  // Used to ensure correct rules order.
	  function RuleList(options) {
	    this.map = {};
	    this.raw = {};
	    this.index = [];
	    this.counter = 0;
	    this.options = options;
	    this.classes = options.classes;
	    this.keyframes = options.keyframes;
	  }
	  /**
	   * Create and register rule.
	   *
	   * Will not render after Style Sheet was rendered the first time.
	   */


	  var _proto = RuleList.prototype;

	  _proto.add = function add(name, decl, ruleOptions) {
	    var _this$options = this.options,
	        parent = _this$options.parent,
	        sheet = _this$options.sheet,
	        jss = _this$options.jss,
	        Renderer = _this$options.Renderer,
	        generateId = _this$options.generateId,
	        scoped = _this$options.scoped;

	    var options = _extends({
	      classes: this.classes,
	      parent: parent,
	      sheet: sheet,
	      jss: jss,
	      Renderer: Renderer,
	      generateId: generateId,
	      scoped: scoped,
	      name: name,
	      keyframes: this.keyframes,
	      selector: undefined
	    }, ruleOptions); // When user uses .createStyleSheet(), duplicate names are not possible, but
	    // `sheet.addRule()` opens the door for any duplicate rule name. When this happens
	    // we need to make the key unique within this RuleList instance scope.


	    var key = name;

	    if (name in this.raw) {
	      key = name + "-d" + this.counter++;
	    } // We need to save the original decl before creating the rule
	    // because cache plugin needs to use it as a key to return a cached rule.


	    this.raw[key] = decl;

	    if (key in this.classes) {
	      // E.g. rules inside of @media container
	      options.selector = "." + escape$1(this.classes[key]);
	    }

	    var rule = createRule(key, decl, options);
	    if (!rule) return null;
	    this.register(rule);
	    var index = options.index === undefined ? this.index.length : options.index;
	    this.index.splice(index, 0, rule);
	    return rule;
	  }
	  /**
	   * Replace rule.
	   * Create a new rule and remove old one instead of overwriting
	   * because we want to invoke onCreateRule hook to make plugins work.
	   */
	  ;

	  _proto.replace = function replace(name, decl, ruleOptions) {
	    var oldRule = this.get(name);
	    var oldIndex = this.index.indexOf(oldRule);

	    if (oldRule) {
	      this.remove(oldRule);
	    }

	    var options = ruleOptions;
	    if (oldIndex !== -1) options = _extends({}, ruleOptions, {
	      index: oldIndex
	    });
	    return this.add(name, decl, options);
	  }
	  /**
	   * Get a rule by name or selector.
	   */
	  ;

	  _proto.get = function get(nameOrSelector) {
	    return this.map[nameOrSelector];
	  }
	  /**
	   * Delete a rule.
	   */
	  ;

	  _proto.remove = function remove(rule) {
	    this.unregister(rule);
	    delete this.raw[rule.key];
	    this.index.splice(this.index.indexOf(rule), 1);
	  }
	  /**
	   * Get index of a rule.
	   */
	  ;

	  _proto.indexOf = function indexOf(rule) {
	    return this.index.indexOf(rule);
	  }
	  /**
	   * Run `onProcessRule()` plugins on every rule.
	   */
	  ;

	  _proto.process = function process() {
	    var plugins = this.options.jss.plugins; // We need to clone array because if we modify the index somewhere else during a loop
	    // we end up with very hard-to-track-down side effects.

	    this.index.slice(0).forEach(plugins.onProcessRule, plugins);
	  }
	  /**
	   * Register a rule in `.map`, `.classes` and `.keyframes` maps.
	   */
	  ;

	  _proto.register = function register(rule) {
	    this.map[rule.key] = rule;

	    if (rule instanceof StyleRule) {
	      this.map[rule.selector] = rule;
	      if (rule.id) this.classes[rule.key] = rule.id;
	    } else if (rule instanceof KeyframesRule && this.keyframes) {
	      this.keyframes[rule.name] = rule.id;
	    }
	  }
	  /**
	   * Unregister a rule.
	   */
	  ;

	  _proto.unregister = function unregister(rule) {
	    delete this.map[rule.key];

	    if (rule instanceof StyleRule) {
	      delete this.map[rule.selector];
	      delete this.classes[rule.key];
	    } else if (rule instanceof KeyframesRule) {
	      delete this.keyframes[rule.name];
	    }
	  }
	  /**
	   * Update the function values with a new data.
	   */
	  ;

	  _proto.update = function update() {
	    var name;
	    var data;
	    var options;

	    if (typeof (arguments.length <= 0 ? undefined : arguments[0]) === 'string') {
	      name = arguments.length <= 0 ? undefined : arguments[0];
	      data = arguments.length <= 1 ? undefined : arguments[1];
	      options = arguments.length <= 2 ? undefined : arguments[2];
	    } else {
	      data = arguments.length <= 0 ? undefined : arguments[0];
	      options = arguments.length <= 1 ? undefined : arguments[1];
	      name = null;
	    }

	    if (name) {
	      this.updateOne(this.get(name), data, options);
	    } else {
	      for (var index = 0; index < this.index.length; index++) {
	        this.updateOne(this.index[index], data, options);
	      }
	    }
	  }
	  /**
	   * Execute plugins, update rule props.
	   */
	  ;

	  _proto.updateOne = function updateOne(rule, data, options) {
	    if (options === void 0) {
	      options = defaultUpdateOptions;
	    }

	    var _this$options2 = this.options,
	        plugins = _this$options2.jss.plugins,
	        sheet = _this$options2.sheet; // It is a rules container like for e.g. ConditionalRule.

	    if (rule.rules instanceof RuleList) {
	      rule.rules.update(data, options);
	      return;
	    }

	    var style = rule.style;
	    plugins.onUpdate(data, rule, sheet, options); // We rely on a new `style` ref in case it was mutated during onUpdate hook.

	    if (options.process && style && style !== rule.style) {
	      // We need to run the plugins in case new `style` relies on syntax plugins.
	      plugins.onProcessStyle(rule.style, rule, sheet); // Update and add props.

	      for (var prop in rule.style) {
	        var nextValue = rule.style[prop];
	        var prevValue = style[prop]; // We need to use `force: true` because `rule.style` has been updated during onUpdate hook, so `rule.prop()` will not update the CSSOM rule.
	        // We do this comparison to avoid unneeded `rule.prop()` calls, since we have the old `style` object here.

	        if (nextValue !== prevValue) {
	          rule.prop(prop, nextValue, forceUpdateOptions);
	        }
	      } // Remove props.


	      for (var _prop in style) {
	        var _nextValue = rule.style[_prop];
	        var _prevValue = style[_prop]; // We need to use `force: true` because `rule.style` has been updated during onUpdate hook, so `rule.prop()` will not update the CSSOM rule.
	        // We do this comparison to avoid unneeded `rule.prop()` calls, since we have the old `style` object here.

	        if (_nextValue == null && _nextValue !== _prevValue) {
	          rule.prop(_prop, null, forceUpdateOptions);
	        }
	      }
	    }
	  }
	  /**
	   * Convert rules to a CSS string.
	   */
	  ;

	  _proto.toString = function toString(options) {
	    var str = '';
	    var sheet = this.options.sheet;
	    var link = sheet ? sheet.options.link : false;

	    var _getWhitespaceSymbols = getWhitespaceSymbols(options),
	        linebreak = _getWhitespaceSymbols.linebreak;

	    for (var index = 0; index < this.index.length; index++) {
	      var rule = this.index[index];
	      var css = rule.toString(options); // No need to render an empty rule.

	      if (!css && !link) continue;
	      if (str) str += linebreak;
	      str += css;
	    }

	    return str;
	  };

	  return RuleList;
	}();

	var StyleSheet =
	/*#__PURE__*/
	function () {
	  function StyleSheet(styles, options) {
	    this.attached = false;
	    this.deployed = false;
	    this.classes = {};
	    this.keyframes = {};
	    this.options = _extends({}, options, {
	      sheet: this,
	      parent: this,
	      classes: this.classes,
	      keyframes: this.keyframes
	    });

	    if (options.Renderer) {
	      this.renderer = new options.Renderer(this);
	    }

	    this.rules = new RuleList(this.options);

	    for (var name in styles) {
	      this.rules.add(name, styles[name]);
	    }

	    this.rules.process();
	  }
	  /**
	   * Attach renderable to the render tree.
	   */


	  var _proto = StyleSheet.prototype;

	  _proto.attach = function attach() {
	    if (this.attached) return this;
	    if (this.renderer) this.renderer.attach();
	    this.attached = true; // Order is important, because we can't use insertRule API if style element is not attached.

	    if (!this.deployed) this.deploy();
	    return this;
	  }
	  /**
	   * Remove renderable from render tree.
	   */
	  ;

	  _proto.detach = function detach() {
	    if (!this.attached) return this;
	    if (this.renderer) this.renderer.detach();
	    this.attached = false;
	    return this;
	  }
	  /**
	   * Add a rule to the current stylesheet.
	   * Will insert a rule also after the stylesheet has been rendered first time.
	   */
	  ;

	  _proto.addRule = function addRule(name, decl, options) {
	    var queue = this.queue; // Plugins can create rules.
	    // In order to preserve the right order, we need to queue all `.addRule` calls,
	    // which happen after the first `rules.add()` call.

	    if (this.attached && !queue) this.queue = [];
	    var rule = this.rules.add(name, decl, options);
	    if (!rule) return null;
	    this.options.jss.plugins.onProcessRule(rule);

	    if (this.attached) {
	      if (!this.deployed) return rule; // Don't insert rule directly if there is no stringified version yet.
	      // It will be inserted all together when .attach is called.

	      if (queue) queue.push(rule);else {
	        this.insertRule(rule);

	        if (this.queue) {
	          this.queue.forEach(this.insertRule, this);
	          this.queue = undefined;
	        }
	      }
	      return rule;
	    } // We can't add rules to a detached style node.
	    // We will redeploy the sheet once user will attach it.


	    this.deployed = false;
	    return rule;
	  }
	  /**
	   * Replace a rule in the current stylesheet.
	   */
	  ;

	  _proto.replaceRule = function replaceRule(nameOrSelector, decl, options) {
	    var oldRule = this.rules.get(nameOrSelector);
	    if (!oldRule) return this.addRule(nameOrSelector, decl, options);
	    var newRule = this.rules.replace(nameOrSelector, decl, options);

	    if (newRule) {
	      this.options.jss.plugins.onProcessRule(newRule);
	    }

	    if (this.attached) {
	      if (!this.deployed) return newRule; // Don't replace / delete rule directly if there is no stringified version yet.
	      // It will be inserted all together when .attach is called.

	      if (this.renderer) {
	        if (!newRule) {
	          this.renderer.deleteRule(oldRule);
	        } else if (oldRule.renderable) {
	          this.renderer.replaceRule(oldRule.renderable, newRule);
	        }
	      }

	      return newRule;
	    } // We can't replace rules to a detached style node.
	    // We will redeploy the sheet once user will attach it.


	    this.deployed = false;
	    return newRule;
	  }
	  /**
	   * Insert rule into the StyleSheet
	   */
	  ;

	  _proto.insertRule = function insertRule(rule) {
	    if (this.renderer) {
	      this.renderer.insertRule(rule);
	    }
	  }
	  /**
	   * Create and add rules.
	   * Will render also after Style Sheet was rendered the first time.
	   */
	  ;

	  _proto.addRules = function addRules(styles, options) {
	    var added = [];

	    for (var name in styles) {
	      var rule = this.addRule(name, styles[name], options);
	      if (rule) added.push(rule);
	    }

	    return added;
	  }
	  /**
	   * Get a rule by name or selector.
	   */
	  ;

	  _proto.getRule = function getRule(nameOrSelector) {
	    return this.rules.get(nameOrSelector);
	  }
	  /**
	   * Delete a rule by name.
	   * Returns `true`: if rule has been deleted from the DOM.
	   */
	  ;

	  _proto.deleteRule = function deleteRule(name) {
	    var rule = typeof name === 'object' ? name : this.rules.get(name);

	    if (!rule || // Style sheet was created without link: true and attached, in this case we
	    // won't be able to remove the CSS rule from the DOM.
	    this.attached && !rule.renderable) {
	      return false;
	    }

	    this.rules.remove(rule);

	    if (this.attached && rule.renderable && this.renderer) {
	      return this.renderer.deleteRule(rule.renderable);
	    }

	    return true;
	  }
	  /**
	   * Get index of a rule.
	   */
	  ;

	  _proto.indexOf = function indexOf(rule) {
	    return this.rules.indexOf(rule);
	  }
	  /**
	   * Deploy pure CSS string to a renderable.
	   */
	  ;

	  _proto.deploy = function deploy() {
	    if (this.renderer) this.renderer.deploy();
	    this.deployed = true;
	    return this;
	  }
	  /**
	   * Update the function values with a new data.
	   */
	  ;

	  _proto.update = function update() {
	    var _this$rules;

	    (_this$rules = this.rules).update.apply(_this$rules, arguments);

	    return this;
	  }
	  /**
	   * Updates a single rule.
	   */
	  ;

	  _proto.updateOne = function updateOne(rule, data, options) {
	    this.rules.updateOne(rule, data, options);
	    return this;
	  }
	  /**
	   * Convert rules to a CSS string.
	   */
	  ;

	  _proto.toString = function toString(options) {
	    return this.rules.toString(options);
	  };

	  return StyleSheet;
	}();

	var PluginsRegistry =
	/*#__PURE__*/
	function () {
	  function PluginsRegistry() {
	    this.plugins = {
	      internal: [],
	      external: []
	    };
	    this.registry = {};
	  }

	  var _proto = PluginsRegistry.prototype;

	  /**
	   * Call `onCreateRule` hooks and return an object if returned by a hook.
	   */
	  _proto.onCreateRule = function onCreateRule(name, decl, options) {
	    for (var i = 0; i < this.registry.onCreateRule.length; i++) {
	      var rule = this.registry.onCreateRule[i](name, decl, options);
	      if (rule) return rule;
	    }

	    return null;
	  }
	  /**
	   * Call `onProcessRule` hooks.
	   */
	  ;

	  _proto.onProcessRule = function onProcessRule(rule) {
	    if (rule.isProcessed) return;
	    var sheet = rule.options.sheet;

	    for (var i = 0; i < this.registry.onProcessRule.length; i++) {
	      this.registry.onProcessRule[i](rule, sheet);
	    }

	    if (rule.style) this.onProcessStyle(rule.style, rule, sheet);
	    rule.isProcessed = true;
	  }
	  /**
	   * Call `onProcessStyle` hooks.
	   */
	  ;

	  _proto.onProcessStyle = function onProcessStyle(style, rule, sheet) {
	    for (var i = 0; i < this.registry.onProcessStyle.length; i++) {
	      rule.style = this.registry.onProcessStyle[i](rule.style, rule, sheet);
	    }
	  }
	  /**
	   * Call `onProcessSheet` hooks.
	   */
	  ;

	  _proto.onProcessSheet = function onProcessSheet(sheet) {
	    for (var i = 0; i < this.registry.onProcessSheet.length; i++) {
	      this.registry.onProcessSheet[i](sheet);
	    }
	  }
	  /**
	   * Call `onUpdate` hooks.
	   */
	  ;

	  _proto.onUpdate = function onUpdate(data, rule, sheet, options) {
	    for (var i = 0; i < this.registry.onUpdate.length; i++) {
	      this.registry.onUpdate[i](data, rule, sheet, options);
	    }
	  }
	  /**
	   * Call `onChangeValue` hooks.
	   */
	  ;

	  _proto.onChangeValue = function onChangeValue(value, prop, rule) {
	    var processedValue = value;

	    for (var i = 0; i < this.registry.onChangeValue.length; i++) {
	      processedValue = this.registry.onChangeValue[i](processedValue, prop, rule);
	    }

	    return processedValue;
	  }
	  /**
	   * Register a plugin.
	   */
	  ;

	  _proto.use = function use(newPlugin, options) {
	    if (options === void 0) {
	      options = {
	        queue: 'external'
	      };
	    }

	    var plugins = this.plugins[options.queue]; // Avoids applying same plugin twice, at least based on ref.

	    if (plugins.indexOf(newPlugin) !== -1) {
	      return;
	    }

	    plugins.push(newPlugin);
	    this.registry = [].concat(this.plugins.external, this.plugins.internal).reduce(function (registry, plugin) {
	      for (var name in plugin) {
	        if (name in registry) {
	          registry[name].push(plugin[name]);
	        }
	      }

	      return registry;
	    }, {
	      onCreateRule: [],
	      onProcessRule: [],
	      onProcessStyle: [],
	      onProcessSheet: [],
	      onChangeValue: [],
	      onUpdate: []
	    });
	  };

	  return PluginsRegistry;
	}();

	/**
	 * Sheets registry to access all instances in one place.
	 */

	var SheetsRegistry =
	/*#__PURE__*/
	function () {
	  function SheetsRegistry() {
	    this.registry = [];
	  }

	  var _proto = SheetsRegistry.prototype;

	  /**
	   * Register a Style Sheet.
	   */
	  _proto.add = function add(sheet) {
	    var registry = this.registry;
	    var index = sheet.options.index;
	    if (registry.indexOf(sheet) !== -1) return;

	    if (registry.length === 0 || index >= this.index) {
	      registry.push(sheet);
	      return;
	    } // Find a position.


	    for (var i = 0; i < registry.length; i++) {
	      if (registry[i].options.index > index) {
	        registry.splice(i, 0, sheet);
	        return;
	      }
	    }
	  }
	  /**
	   * Reset the registry.
	   */
	  ;

	  _proto.reset = function reset() {
	    this.registry = [];
	  }
	  /**
	   * Remove a Style Sheet.
	   */
	  ;

	  _proto.remove = function remove(sheet) {
	    var index = this.registry.indexOf(sheet);
	    this.registry.splice(index, 1);
	  }
	  /**
	   * Convert all attached sheets to a CSS string.
	   */
	  ;

	  _proto.toString = function toString(_temp) {
	    var _ref = _temp === void 0 ? {} : _temp,
	        attached = _ref.attached,
	        options = _objectWithoutPropertiesLoose(_ref, ["attached"]);

	    var _getWhitespaceSymbols = getWhitespaceSymbols(options),
	        linebreak = _getWhitespaceSymbols.linebreak;

	    var css = '';

	    for (var i = 0; i < this.registry.length; i++) {
	      var sheet = this.registry[i];

	      if (attached != null && sheet.attached !== attached) {
	        continue;
	      }

	      if (css) css += linebreak;
	      css += sheet.toString(options);
	    }

	    return css;
	  };

	  _createClass(SheetsRegistry, [{
	    key: "index",

	    /**
	     * Current highest index number.
	     */
	    get: function get() {
	      return this.registry.length === 0 ? 0 : this.registry[this.registry.length - 1].options.index;
	    }
	  }]);

	  return SheetsRegistry;
	}();

	/**
	 * This is a global sheets registry. Only DomRenderer will add sheets to it.
	 * On the server one should use an own SheetsRegistry instance and add the
	 * sheets to it, because you need to make sure to create a new registry for
	 * each request in order to not leak sheets across requests.
	 */

	var sheets = new SheetsRegistry();

	/* eslint-disable */

	/**
	 * Now that `globalThis` is available on most platforms
	 * (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/globalThis#browser_compatibility)
	 * we check for `globalThis` first. `globalThis` is necessary for jss
	 * to run in Agoric's secure version of JavaScript (SES). Under SES,
	 * `globalThis` exists, but `window`, `self`, and `Function('return
	 * this')()` are all undefined for security reasons.
	 *
	 * https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
	 */
	var globalThis$1 = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' && window.Math === Math ? window : typeof self !== 'undefined' && self.Math === Math ? self : Function('return this')();

	var ns = '2f1acc6c3a606b082e5eef5e54414ffb';
	if (globalThis$1[ns] == null) globalThis$1[ns] = 0; // Bundle may contain multiple JSS versions at the same time. In order to identify
	// the current version with just one short number and use it for classes generation
	// we use a counter. Also it is more accurate, because user can manually reevaluate
	// the module.

	var moduleId = globalThis$1[ns]++;
	/**
	 * Returns a function which generates unique class names based on counters.
	 * When new generator function is created, rule counter is reseted.
	 * We need to reset the rule counter for SSR for each request.
	 */

	var createGenerateId = function createGenerateId(options) {
	  if (options === void 0) {
	    options = {};
	  }

	  var ruleCounter = 0;

	  var generateId = function generateId(rule, sheet) {
	    ruleCounter += 1;

	    var jssId = '';
	    var prefix = '';

	    if (sheet) {
	      if (sheet.options.classNamePrefix) {
	        prefix = sheet.options.classNamePrefix;
	      }

	      if (sheet.options.jss.id != null) {
	        jssId = String(sheet.options.jss.id);
	      }
	    }

	    if (options.minify) {
	      // Using "c" because a number can't be the first char in a class name.
	      return "" + (prefix || 'c') + moduleId + jssId + ruleCounter;
	    }

	    return prefix + rule.key + "-" + moduleId + (jssId ? "-" + jssId : '') + "-" + ruleCounter;
	  };

	  return generateId;
	};

	/**
	 * Cache the value from the first time a function is called.
	 */

	var memoize$2 = function memoize(fn) {
	  var value;
	  return function () {
	    if (!value) value = fn();
	    return value;
	  };
	};
	/**
	 * Get a style property value.
	 */


	var getPropertyValue = function getPropertyValue(cssRule, prop) {
	  try {
	    // Support CSSTOM.
	    if (cssRule.attributeStyleMap) {
	      return cssRule.attributeStyleMap.get(prop);
	    }

	    return cssRule.style.getPropertyValue(prop);
	  } catch (err) {
	    // IE may throw if property is unknown.
	    return '';
	  }
	};
	/**
	 * Set a style property.
	 */


	var setProperty = function setProperty(cssRule, prop, value) {
	  try {
	    var cssValue = value;

	    if (Array.isArray(value)) {
	      cssValue = toCssValue(value);
	    } // Support CSSTOM.


	    if (cssRule.attributeStyleMap) {
	      cssRule.attributeStyleMap.set(prop, cssValue);
	    } else {
	      var indexOfImportantFlag = cssValue ? cssValue.indexOf('!important') : -1;
	      var cssValueWithoutImportantFlag = indexOfImportantFlag > -1 ? cssValue.substr(0, indexOfImportantFlag - 1) : cssValue;
	      cssRule.style.setProperty(prop, cssValueWithoutImportantFlag, indexOfImportantFlag > -1 ? 'important' : '');
	    }
	  } catch (err) {
	    // IE may throw if property is unknown.
	    return false;
	  }

	  return true;
	};
	/**
	 * Remove a style property.
	 */


	var removeProperty = function removeProperty(cssRule, prop) {
	  try {
	    // Support CSSTOM.
	    if (cssRule.attributeStyleMap) {
	      cssRule.attributeStyleMap.delete(prop);
	    } else {
	      cssRule.style.removeProperty(prop);
	    }
	  } catch (err) {
	  }
	};
	/**
	 * Set the selector.
	 */


	var setSelector = function setSelector(cssRule, selectorText) {
	  cssRule.selectorText = selectorText; // Return false if setter was not successful.
	  // Currently works in chrome only.

	  return cssRule.selectorText === selectorText;
	};
	/**
	 * Gets the `head` element upon the first call and caches it.
	 * We assume it can't be null.
	 */


	var getHead = memoize$2(function () {
	  return document.querySelector('head');
	});
	/**
	 * Find attached sheet with an index higher than the passed one.
	 */

	function findHigherSheet(registry, options) {
	  for (var i = 0; i < registry.length; i++) {
	    var sheet = registry[i];

	    if (sheet.attached && sheet.options.index > options.index && sheet.options.insertionPoint === options.insertionPoint) {
	      return sheet;
	    }
	  }

	  return null;
	}
	/**
	 * Find attached sheet with the highest index.
	 */


	function findHighestSheet(registry, options) {
	  for (var i = registry.length - 1; i >= 0; i--) {
	    var sheet = registry[i];

	    if (sheet.attached && sheet.options.insertionPoint === options.insertionPoint) {
	      return sheet;
	    }
	  }

	  return null;
	}
	/**
	 * Find a comment with "jss" inside.
	 */


	function findCommentNode(text) {
	  var head = getHead();

	  for (var i = 0; i < head.childNodes.length; i++) {
	    var node = head.childNodes[i];

	    if (node.nodeType === 8 && node.nodeValue.trim() === text) {
	      return node;
	    }
	  }

	  return null;
	}
	/**
	 * Find a node before which we can insert the sheet.
	 */


	function findPrevNode(options) {
	  var registry = sheets.registry;

	  if (registry.length > 0) {
	    // Try to insert before the next higher sheet.
	    var sheet = findHigherSheet(registry, options);

	    if (sheet && sheet.renderer) {
	      return {
	        parent: sheet.renderer.element.parentNode,
	        node: sheet.renderer.element
	      };
	    } // Otherwise insert after the last attached.


	    sheet = findHighestSheet(registry, options);

	    if (sheet && sheet.renderer) {
	      return {
	        parent: sheet.renderer.element.parentNode,
	        node: sheet.renderer.element.nextSibling
	      };
	    }
	  } // Try to find a comment placeholder if registry is empty.


	  var insertionPoint = options.insertionPoint;

	  if (insertionPoint && typeof insertionPoint === 'string') {
	    var comment = findCommentNode(insertionPoint);

	    if (comment) {
	      return {
	        parent: comment.parentNode,
	        node: comment.nextSibling
	      };
	    } // If user specifies an insertion point and it can't be found in the document -
	  }

	  return false;
	}
	/**
	 * Insert style element into the DOM.
	 */


	function insertStyle(style, options) {
	  var insertionPoint = options.insertionPoint;
	  var nextNode = findPrevNode(options);

	  if (nextNode !== false && nextNode.parent) {
	    nextNode.parent.insertBefore(style, nextNode.node);
	    return;
	  } // Works with iframes and any node types.


	  if (insertionPoint && typeof insertionPoint.nodeType === 'number') {
	    var insertionPointElement = insertionPoint;
	    var parentNode = insertionPointElement.parentNode;
	    if (parentNode) parentNode.insertBefore(style, insertionPointElement.nextSibling);
	    return;
	  }

	  getHead().appendChild(style);
	}
	/**
	 * Read jss nonce setting from the page if the user has set it.
	 */


	var getNonce = memoize$2(function () {
	  var node = document.querySelector('meta[property="csp-nonce"]');
	  return node ? node.getAttribute('content') : null;
	});

	var _insertRule = function insertRule(container, rule, index) {
	  try {
	    if ('insertRule' in container) {
	      container.insertRule(rule, index);
	    } // Keyframes rule.
	    else if ('appendRule' in container) {
	        container.appendRule(rule);
	      }
	  } catch (err) {
	    return false;
	  }

	  return container.cssRules[index];
	};

	var getValidRuleInsertionIndex = function getValidRuleInsertionIndex(container, index) {
	  var maxIndex = container.cssRules.length; // In case previous insertion fails, passed index might be wrong

	  if (index === undefined || index > maxIndex) {
	    // eslint-disable-next-line no-param-reassign
	    return maxIndex;
	  }

	  return index;
	};

	var createStyle = function createStyle() {
	  var el = document.createElement('style'); // Without it, IE will have a broken source order specificity if we
	  // insert rules after we insert the style tag.
	  // It seems to kick-off the source order specificity algorithm.

	  el.textContent = '\n';
	  return el;
	};

	var DomRenderer =
	/*#__PURE__*/
	function () {
	  // Will be empty if link: true option is not set, because
	  // it is only for use together with insertRule API.
	  function DomRenderer(sheet) {
	    this.getPropertyValue = getPropertyValue;
	    this.setProperty = setProperty;
	    this.removeProperty = removeProperty;
	    this.setSelector = setSelector;
	    this.hasInsertedRules = false;
	    this.cssRules = [];
	    // There is no sheet when the renderer is used from a standalone StyleRule.
	    if (sheet) sheets.add(sheet);
	    this.sheet = sheet;

	    var _ref = this.sheet ? this.sheet.options : {},
	        media = _ref.media,
	        meta = _ref.meta,
	        element = _ref.element;

	    this.element = element || createStyle();
	    this.element.setAttribute('data-jss', '');
	    if (media) this.element.setAttribute('media', media);
	    if (meta) this.element.setAttribute('data-meta', meta);
	    var nonce = getNonce();
	    if (nonce) this.element.setAttribute('nonce', nonce);
	  }
	  /**
	   * Insert style element into render tree.
	   */


	  var _proto = DomRenderer.prototype;

	  _proto.attach = function attach() {
	    // In the case the element node is external and it is already in the DOM.
	    if (this.element.parentNode || !this.sheet) return;
	    insertStyle(this.element, this.sheet.options); // When rules are inserted using `insertRule` API, after `sheet.detach().attach()`
	    // most browsers create a new CSSStyleSheet, except of all IEs.

	    var deployed = Boolean(this.sheet && this.sheet.deployed);

	    if (this.hasInsertedRules && deployed) {
	      this.hasInsertedRules = false;
	      this.deploy();
	    }
	  }
	  /**
	   * Remove style element from render tree.
	   */
	  ;

	  _proto.detach = function detach() {
	    if (!this.sheet) return;
	    var parentNode = this.element.parentNode;
	    if (parentNode) parentNode.removeChild(this.element); // In the most browsers, rules inserted using insertRule() API will be lost when style element is removed.
	    // Though IE will keep them and we need a consistent behavior.

	    if (this.sheet.options.link) {
	      this.cssRules = [];
	      this.element.textContent = '\n';
	    }
	  }
	  /**
	   * Inject CSS string into element.
	   */
	  ;

	  _proto.deploy = function deploy() {
	    var sheet = this.sheet;
	    if (!sheet) return;

	    if (sheet.options.link) {
	      this.insertRules(sheet.rules);
	      return;
	    }

	    this.element.textContent = "\n" + sheet.toString() + "\n";
	  }
	  /**
	   * Insert RuleList into an element.
	   */
	  ;

	  _proto.insertRules = function insertRules(rules, nativeParent) {
	    for (var i = 0; i < rules.index.length; i++) {
	      this.insertRule(rules.index[i], i, nativeParent);
	    }
	  }
	  /**
	   * Insert a rule into element.
	   */
	  ;

	  _proto.insertRule = function insertRule(rule, index, nativeParent) {
	    if (nativeParent === void 0) {
	      nativeParent = this.element.sheet;
	    }

	    if (rule.rules) {
	      var parent = rule;
	      var latestNativeParent = nativeParent;

	      if (rule.type === 'conditional' || rule.type === 'keyframes') {
	        var _insertionIndex = getValidRuleInsertionIndex(nativeParent, index); // We need to render the container without children first.


	        latestNativeParent = _insertRule(nativeParent, parent.toString({
	          children: false
	        }), _insertionIndex);

	        if (latestNativeParent === false) {
	          return false;
	        }

	        this.refCssRule(rule, _insertionIndex, latestNativeParent);
	      }

	      this.insertRules(parent.rules, latestNativeParent);
	      return latestNativeParent;
	    }

	    var ruleStr = rule.toString();
	    if (!ruleStr) return false;
	    var insertionIndex = getValidRuleInsertionIndex(nativeParent, index);

	    var nativeRule = _insertRule(nativeParent, ruleStr, insertionIndex);

	    if (nativeRule === false) {
	      return false;
	    }

	    this.hasInsertedRules = true;
	    this.refCssRule(rule, insertionIndex, nativeRule);
	    return nativeRule;
	  };

	  _proto.refCssRule = function refCssRule(rule, index, cssRule) {
	    rule.renderable = cssRule; // We only want to reference the top level rules, deleteRule API doesn't support removing nested rules
	    // like rules inside media queries or keyframes

	    if (rule.options.parent instanceof StyleSheet) {
	      this.cssRules.splice(index, 0, cssRule);
	    }
	  }
	  /**
	   * Delete a rule.
	   */
	  ;

	  _proto.deleteRule = function deleteRule(cssRule) {
	    var sheet = this.element.sheet;
	    var index = this.indexOf(cssRule);
	    if (index === -1) return false;
	    sheet.deleteRule(index);
	    this.cssRules.splice(index, 1);
	    return true;
	  }
	  /**
	   * Get index of a CSS Rule.
	   */
	  ;

	  _proto.indexOf = function indexOf(cssRule) {
	    return this.cssRules.indexOf(cssRule);
	  }
	  /**
	   * Generate a new CSS rule and replace the existing one.
	   */
	  ;

	  _proto.replaceRule = function replaceRule(cssRule, rule) {
	    var index = this.indexOf(cssRule);
	    if (index === -1) return false;
	    this.element.sheet.deleteRule(index);
	    this.cssRules.splice(index, 1);
	    return this.insertRule(rule, index);
	  }
	  /**
	   * Get all rules elements.
	   */
	  ;

	  _proto.getRules = function getRules() {
	    return this.element.sheet.cssRules;
	  };

	  return DomRenderer;
	}();

	var instanceCounter = 0;

	var Jss =
	/*#__PURE__*/
	function () {
	  function Jss(options) {
	    this.id = instanceCounter++;
	    this.version = "10.10.0";
	    this.plugins = new PluginsRegistry();
	    this.options = {
	      id: {
	        minify: false
	      },
	      createGenerateId: createGenerateId,
	      Renderer: isBrowser ? DomRenderer : null,
	      plugins: []
	    };
	    this.generateId = createGenerateId({
	      minify: false
	    });

	    for (var i = 0; i < plugins$1.length; i++) {
	      this.plugins.use(plugins$1[i], {
	        queue: 'internal'
	      });
	    }

	    this.setup(options);
	  }
	  /**
	   * Prepares various options, applies plugins.
	   * Should not be used twice on the same instance, because there is no plugins
	   * deduplication logic.
	   */


	  var _proto = Jss.prototype;

	  _proto.setup = function setup(options) {
	    if (options === void 0) {
	      options = {};
	    }

	    if (options.createGenerateId) {
	      this.options.createGenerateId = options.createGenerateId;
	    }

	    if (options.id) {
	      this.options.id = _extends({}, this.options.id, options.id);
	    }

	    if (options.createGenerateId || options.id) {
	      this.generateId = this.options.createGenerateId(this.options.id);
	    }

	    if (options.insertionPoint != null) this.options.insertionPoint = options.insertionPoint;

	    if ('Renderer' in options) {
	      this.options.Renderer = options.Renderer;
	    } // eslint-disable-next-line prefer-spread


	    if (options.plugins) this.use.apply(this, options.plugins);
	    return this;
	  }
	  /**
	   * Create a Style Sheet.
	   */
	  ;

	  _proto.createStyleSheet = function createStyleSheet(styles, options) {
	    if (options === void 0) {
	      options = {};
	    }

	    var _options = options,
	        index = _options.index;

	    if (typeof index !== 'number') {
	      index = sheets.index === 0 ? 0 : sheets.index + 1;
	    }

	    var sheet = new StyleSheet(styles, _extends({}, options, {
	      jss: this,
	      generateId: options.generateId || this.generateId,
	      insertionPoint: this.options.insertionPoint,
	      Renderer: this.options.Renderer,
	      index: index
	    }));
	    this.plugins.onProcessSheet(sheet);
	    return sheet;
	  }
	  /**
	   * Detach the Style Sheet and remove it from the registry.
	   */
	  ;

	  _proto.removeStyleSheet = function removeStyleSheet(sheet) {
	    sheet.detach();
	    sheets.remove(sheet);
	    return this;
	  }
	  /**
	   * Create a rule without a Style Sheet.
	   * [Deprecated] will be removed in the next major version.
	   */
	  ;

	  _proto.createRule = function createRule$1(name, style, options) {
	    if (style === void 0) {
	      style = {};
	    }

	    if (options === void 0) {
	      options = {};
	    }

	    // Enable rule without name for inline styles.
	    if (typeof name === 'object') {
	      return this.createRule(undefined, name, style);
	    }

	    var ruleOptions = _extends({}, options, {
	      name: name,
	      jss: this,
	      Renderer: this.options.Renderer
	    });

	    if (!ruleOptions.generateId) ruleOptions.generateId = this.generateId;
	    if (!ruleOptions.classes) ruleOptions.classes = {};
	    if (!ruleOptions.keyframes) ruleOptions.keyframes = {};

	    var rule = createRule(name, style, ruleOptions);

	    if (rule) this.plugins.onProcessRule(rule);
	    return rule;
	  }
	  /**
	   * Register plugin. Passed function will be invoked with a rule instance.
	   */
	  ;

	  _proto.use = function use() {
	    var _this = this;

	    for (var _len = arguments.length, plugins = new Array(_len), _key = 0; _key < _len; _key++) {
	      plugins[_key] = arguments[_key];
	    }

	    plugins.forEach(function (plugin) {
	      _this.plugins.use(plugin);
	    });
	    return this;
	  };

	  return Jss;
	}();

	var createJss = function createJss(options) {
	  return new Jss(options);
	};

	/**
	* Export a constant indicating if this browser has CSSTOM support.
	* https://developers.google.com/web/updates/2018/03/cssom
	*/
	var hasCSSTOMSupport = typeof CSS === 'object' && CSS != null && 'number' in CSS;

	/**
	 * Extracts a styles object with only props that contain function values.
	 */
	function getDynamicStyles(styles) {
	  var to = null;

	  for (var key in styles) {
	    var value = styles[key];
	    var type = typeof value;

	    if (type === 'function') {
	      if (!to) to = {};
	      to[key] = value;
	    } else if (type === 'object' && value !== null && !Array.isArray(value)) {
	      var extracted = getDynamicStyles(value);

	      if (extracted) {
	        if (!to) to = {};
	        to[key] = extracted;
	      }
	    }
	  }

	  return to;
	}

	/**
	 * A better abstraction over CSS.
	 *
	 * @copyright Oleg Isonen (Slobodskoi) / Isonen 2014-present
	 * @website https://github.com/cssinjs/jss
	 * @license MIT
	 */
	createJss();

	var now = Date.now();
	var fnValuesNs = "fnValues" + now;
	var fnRuleNs = "fnStyle" + ++now;

	var functionPlugin = function functionPlugin() {
	  return {
	    onCreateRule: function onCreateRule(name, decl, options) {
	      if (typeof decl !== 'function') return null;
	      var rule = createRule(name, {}, options);
	      rule[fnRuleNs] = decl;
	      return rule;
	    },
	    onProcessStyle: function onProcessStyle(style, rule) {
	      // We need to extract function values from the declaration, so that we can keep core unaware of them.
	      // We need to do that only once.
	      // We don't need to extract functions on each style update, since this can happen only once.
	      // We don't support function values inside of function rules.
	      if (fnValuesNs in rule || fnRuleNs in rule) return style;
	      var fnValues = {};

	      for (var prop in style) {
	        var value = style[prop];
	        if (typeof value !== 'function') continue;
	        delete style[prop];
	        fnValues[prop] = value;
	      }

	      rule[fnValuesNs] = fnValues;
	      return style;
	    },
	    onUpdate: function onUpdate(data, rule, sheet, options) {
	      var styleRule = rule;
	      var fnRule = styleRule[fnRuleNs]; // If we have a style function, the entire rule is dynamic and style object
	      // will be returned from that function.

	      if (fnRule) {
	        // Empty object will remove all currently defined props
	        // in case function rule returns a falsy value.
	        styleRule.style = fnRule(data) || {};
	      }

	      var fnValues = styleRule[fnValuesNs]; // If we have a fn values map, it is a rule with function values.

	      if (fnValues) {
	        for (var _prop in fnValues) {
	          styleRule.prop(_prop, fnValues[_prop](data), options);
	        }
	      }
	    }
	  };
	};

	var functions = functionPlugin;

	var at = '@global';
	var atPrefix = '@global ';

	var GlobalContainerRule =
	/*#__PURE__*/
	function () {
	  function GlobalContainerRule(key, styles, options) {
	    this.type = 'global';
	    this.at = at;
	    this.isProcessed = false;
	    this.key = key;
	    this.options = options;
	    this.rules = new RuleList(_extends({}, options, {
	      parent: this
	    }));

	    for (var selector in styles) {
	      this.rules.add(selector, styles[selector]);
	    }

	    this.rules.process();
	  }
	  /**
	   * Get a rule.
	   */


	  var _proto = GlobalContainerRule.prototype;

	  _proto.getRule = function getRule(name) {
	    return this.rules.get(name);
	  }
	  /**
	   * Create and register rule, run plugins.
	   */
	  ;

	  _proto.addRule = function addRule(name, style, options) {
	    var rule = this.rules.add(name, style, options);
	    if (rule) this.options.jss.plugins.onProcessRule(rule);
	    return rule;
	  }
	  /**
	   * Replace rule, run plugins.
	   */
	  ;

	  _proto.replaceRule = function replaceRule(name, style, options) {
	    var newRule = this.rules.replace(name, style, options);
	    if (newRule) this.options.jss.plugins.onProcessRule(newRule);
	    return newRule;
	  }
	  /**
	   * Get index of a rule.
	   */
	  ;

	  _proto.indexOf = function indexOf(rule) {
	    return this.rules.indexOf(rule);
	  }
	  /**
	   * Generates a CSS string.
	   */
	  ;

	  _proto.toString = function toString(options) {
	    return this.rules.toString(options);
	  };

	  return GlobalContainerRule;
	}();

	var GlobalPrefixedRule =
	/*#__PURE__*/
	function () {
	  function GlobalPrefixedRule(key, style, options) {
	    this.type = 'global';
	    this.at = at;
	    this.isProcessed = false;
	    this.key = key;
	    this.options = options;
	    var selector = key.substr(atPrefix.length);
	    this.rule = options.jss.createRule(selector, style, _extends({}, options, {
	      parent: this
	    }));
	  }

	  var _proto2 = GlobalPrefixedRule.prototype;

	  _proto2.toString = function toString(options) {
	    return this.rule ? this.rule.toString(options) : '';
	  };

	  return GlobalPrefixedRule;
	}();

	var separatorRegExp$1 = /\s*,\s*/g;

	function addScope(selector, scope) {
	  var parts = selector.split(separatorRegExp$1);
	  var scoped = '';

	  for (var i = 0; i < parts.length; i++) {
	    scoped += scope + " " + parts[i].trim();
	    if (parts[i + 1]) scoped += ', ';
	  }

	  return scoped;
	}

	function handleNestedGlobalContainerRule(rule, sheet) {
	  var options = rule.options,
	      style = rule.style;
	  var rules = style ? style[at] : null;
	  if (!rules) return;

	  for (var name in rules) {
	    sheet.addRule(name, rules[name], _extends({}, options, {
	      selector: addScope(name, rule.selector)
	    }));
	  }

	  delete style[at];
	}

	function handlePrefixedGlobalRule(rule, sheet) {
	  var options = rule.options,
	      style = rule.style;

	  for (var prop in style) {
	    if (prop[0] !== '@' || prop.substr(0, at.length) !== at) continue;
	    var selector = addScope(prop.substr(at.length), rule.selector);
	    sheet.addRule(selector, style[prop], _extends({}, options, {
	      selector: selector
	    }));
	    delete style[prop];
	  }
	}
	/**
	 * Convert nested rules to separate, remove them from original styles.
	 */


	function jssGlobal() {
	  function onCreateRule(name, styles, options) {
	    if (!name) return null;

	    if (name === at) {
	      return new GlobalContainerRule(name, styles, options);
	    }

	    if (name[0] === '@' && name.substr(0, atPrefix.length) === atPrefix) {
	      return new GlobalPrefixedRule(name, styles, options);
	    }

	    var parent = options.parent;

	    if (parent) {
	      if (parent.type === 'global' || parent.options.parent && parent.options.parent.type === 'global') {
	        options.scoped = false;
	      }
	    }

	    if (!options.selector && options.scoped === false) {
	      options.selector = name;
	    }

	    return null;
	  }

	  function onProcessRule(rule, sheet) {
	    if (rule.type !== 'style' || !sheet) return;
	    handleNestedGlobalContainerRule(rule, sheet);
	    handlePrefixedGlobalRule(rule, sheet);
	  }

	  return {
	    onCreateRule: onCreateRule,
	    onProcessRule: onProcessRule
	  };
	}

	var separatorRegExp = /\s*,\s*/g;
	var parentRegExp = /&/g;
	var refRegExp = /\$([\w-]+)/g;
	/**
	 * Convert nested rules to separate, remove them from original styles.
	 */

	function jssNested() {
	  // Get a function to be used for $ref replacement.
	  function getReplaceRef(container, sheet) {
	    return function (match, key) {
	      var rule = container.getRule(key) || sheet && sheet.getRule(key);

	      if (rule) {
	        return rule.selector;
	      }
	      return key;
	    };
	  }

	  function replaceParentRefs(nestedProp, parentProp) {
	    var parentSelectors = parentProp.split(separatorRegExp);
	    var nestedSelectors = nestedProp.split(separatorRegExp);
	    var result = '';

	    for (var i = 0; i < parentSelectors.length; i++) {
	      var parent = parentSelectors[i];

	      for (var j = 0; j < nestedSelectors.length; j++) {
	        var nested = nestedSelectors[j];
	        if (result) result += ', '; // Replace all & by the parent or prefix & with the parent.

	        result += nested.indexOf('&') !== -1 ? nested.replace(parentRegExp, parent) : parent + " " + nested;
	      }
	    }

	    return result;
	  }

	  function getOptions(rule, container, prevOptions) {
	    // Options has been already created, now we only increase index.
	    if (prevOptions) return _extends({}, prevOptions, {
	      index: prevOptions.index + 1
	    });
	    var nestingLevel = rule.options.nestingLevel;
	    nestingLevel = nestingLevel === undefined ? 1 : nestingLevel + 1;

	    var options = _extends({}, rule.options, {
	      nestingLevel: nestingLevel,
	      index: container.indexOf(rule) + 1 // We don't need the parent name to be set options for chlid.

	    });

	    delete options.name;
	    return options;
	  }

	  function onProcessStyle(style, rule, sheet) {
	    if (rule.type !== 'style') return style;
	    var styleRule = rule;
	    var container = styleRule.options.parent;
	    var options;
	    var replaceRef;

	    for (var prop in style) {
	      var isNested = prop.indexOf('&') !== -1;
	      var isNestedConditional = prop[0] === '@';
	      if (!isNested && !isNestedConditional) continue;
	      options = getOptions(styleRule, container, options);

	      if (isNested) {
	        var selector = replaceParentRefs(prop, styleRule.selector); // Lazily create the ref replacer function just once for
	        // all nested rules within the sheet.

	        if (!replaceRef) replaceRef = getReplaceRef(container, sheet); // Replace all $refs.

	        selector = selector.replace(refRegExp, replaceRef);
	        var name = styleRule.key + "-" + prop;

	        if ('replaceRule' in container) {
	          // for backward compatibility
	          container.replaceRule(name, style[prop], _extends({}, options, {
	            selector: selector
	          }));
	        } else {
	          container.addRule(name, style[prop], _extends({}, options, {
	            selector: selector
	          }));
	        }
	      } else if (isNestedConditional) {
	        // Place conditional right after the parent rule to ensure right ordering.
	        container.addRule(prop, {}, options).addRule(styleRule.key, style[prop], {
	          selector: styleRule.selector
	        });
	      }

	      delete style[prop];
	    }

	    return style;
	  }

	  return {
	    onProcessStyle: onProcessStyle
	  };
	}

	/* eslint-disable no-var, prefer-template */
	var uppercasePattern = /[A-Z]/g;
	var msPattern = /^ms-/;
	var cache$2 = {};

	function toHyphenLower(match) {
	  return '-' + match.toLowerCase()
	}

	function hyphenateStyleName(name) {
	  if (cache$2.hasOwnProperty(name)) {
	    return cache$2[name]
	  }

	  var hName = name.replace(uppercasePattern, toHyphenLower);
	  return (cache$2[name] = msPattern.test(hName) ? '-' + hName : hName)
	}

	/**
	 * Convert camel cased property names to dash separated.
	 */

	function convertCase(style) {
	  var converted = {};

	  for (var prop in style) {
	    var key = prop.indexOf('--') === 0 ? prop : hyphenateStyleName(prop);
	    converted[key] = style[prop];
	  }

	  if (style.fallbacks) {
	    if (Array.isArray(style.fallbacks)) converted.fallbacks = style.fallbacks.map(convertCase);else converted.fallbacks = convertCase(style.fallbacks);
	  }

	  return converted;
	}
	/**
	 * Allow camel cased property names by converting them back to dasherized.
	 */


	function camelCase() {
	  function onProcessStyle(style) {
	    if (Array.isArray(style)) {
	      // Handle rules like @font-face, which can have multiple styles in an array
	      for (var index = 0; index < style.length; index++) {
	        style[index] = convertCase(style[index]);
	      }

	      return style;
	    }

	    return convertCase(style);
	  }

	  function onChangeValue(value, prop, rule) {
	    if (prop.indexOf('--') === 0) {
	      return value;
	    }

	    var hyphenatedProp = hyphenateStyleName(prop); // There was no camel case in place

	    if (prop === hyphenatedProp) return value;
	    rule.prop(hyphenatedProp, value); // Core will ignore that property value we set the proper one above.

	    return null;
	  }

	  return {
	    onProcessStyle: onProcessStyle,
	    onChangeValue: onChangeValue
	  };
	}

	var px = hasCSSTOMSupport && CSS ? CSS.px : 'px';
	var ms = hasCSSTOMSupport && CSS ? CSS.ms : 'ms';
	var percent = hasCSSTOMSupport && CSS ? CSS.percent : '%';
	/**
	 * Generated jss-plugin-default-unit CSS property units
	 */

	var defaultUnits = {
	  // Animation properties
	  'animation-delay': ms,
	  'animation-duration': ms,
	  // Background properties
	  'background-position': px,
	  'background-position-x': px,
	  'background-position-y': px,
	  'background-size': px,
	  // Border Properties
	  border: px,
	  'border-bottom': px,
	  'border-bottom-left-radius': px,
	  'border-bottom-right-radius': px,
	  'border-bottom-width': px,
	  'border-left': px,
	  'border-left-width': px,
	  'border-radius': px,
	  'border-right': px,
	  'border-right-width': px,
	  'border-top': px,
	  'border-top-left-radius': px,
	  'border-top-right-radius': px,
	  'border-top-width': px,
	  'border-width': px,
	  'border-block': px,
	  'border-block-end': px,
	  'border-block-end-width': px,
	  'border-block-start': px,
	  'border-block-start-width': px,
	  'border-block-width': px,
	  'border-inline': px,
	  'border-inline-end': px,
	  'border-inline-end-width': px,
	  'border-inline-start': px,
	  'border-inline-start-width': px,
	  'border-inline-width': px,
	  'border-start-start-radius': px,
	  'border-start-end-radius': px,
	  'border-end-start-radius': px,
	  'border-end-end-radius': px,
	  // Margin properties
	  margin: px,
	  'margin-bottom': px,
	  'margin-left': px,
	  'margin-right': px,
	  'margin-top': px,
	  'margin-block': px,
	  'margin-block-end': px,
	  'margin-block-start': px,
	  'margin-inline': px,
	  'margin-inline-end': px,
	  'margin-inline-start': px,
	  // Padding properties
	  padding: px,
	  'padding-bottom': px,
	  'padding-left': px,
	  'padding-right': px,
	  'padding-top': px,
	  'padding-block': px,
	  'padding-block-end': px,
	  'padding-block-start': px,
	  'padding-inline': px,
	  'padding-inline-end': px,
	  'padding-inline-start': px,
	  // Mask properties
	  'mask-position-x': px,
	  'mask-position-y': px,
	  'mask-size': px,
	  // Width and height properties
	  height: px,
	  width: px,
	  'min-height': px,
	  'max-height': px,
	  'min-width': px,
	  'max-width': px,
	  // Position properties
	  bottom: px,
	  left: px,
	  top: px,
	  right: px,
	  inset: px,
	  'inset-block': px,
	  'inset-block-end': px,
	  'inset-block-start': px,
	  'inset-inline': px,
	  'inset-inline-end': px,
	  'inset-inline-start': px,
	  // Shadow properties
	  'box-shadow': px,
	  'text-shadow': px,
	  // Column properties
	  'column-gap': px,
	  'column-rule': px,
	  'column-rule-width': px,
	  'column-width': px,
	  // Font and text properties
	  'font-size': px,
	  'font-size-delta': px,
	  'letter-spacing': px,
	  'text-decoration-thickness': px,
	  'text-indent': px,
	  'text-stroke': px,
	  'text-stroke-width': px,
	  'word-spacing': px,
	  // Motion properties
	  motion: px,
	  'motion-offset': px,
	  // Outline properties
	  outline: px,
	  'outline-offset': px,
	  'outline-width': px,
	  // Perspective properties
	  perspective: px,
	  'perspective-origin-x': percent,
	  'perspective-origin-y': percent,
	  // Transform properties
	  'transform-origin': percent,
	  'transform-origin-x': percent,
	  'transform-origin-y': percent,
	  'transform-origin-z': percent,
	  // Transition properties
	  'transition-delay': ms,
	  'transition-duration': ms,
	  // Alignment properties
	  'vertical-align': px,
	  'flex-basis': px,
	  // Some random properties
	  'shape-margin': px,
	  size: px,
	  gap: px,
	  // Grid properties
	  grid: px,
	  'grid-gap': px,
	  'row-gap': px,
	  'grid-row-gap': px,
	  'grid-column-gap': px,
	  'grid-template-rows': px,
	  'grid-template-columns': px,
	  'grid-auto-rows': px,
	  'grid-auto-columns': px,
	  // Not existing properties.
	  // Used to avoid issues with jss-plugin-expand integration.
	  'box-shadow-x': px,
	  'box-shadow-y': px,
	  'box-shadow-blur': px,
	  'box-shadow-spread': px,
	  'font-line-height': px,
	  'text-shadow-x': px,
	  'text-shadow-y': px,
	  'text-shadow-blur': px
	};

	/**
	 * Clones the object and adds a camel cased property version.
	 */

	function addCamelCasedVersion(obj) {
	  var regExp = /(-[a-z])/g;

	  var replace = function replace(str) {
	    return str[1].toUpperCase();
	  };

	  var newObj = {};

	  for (var key in obj) {
	    newObj[key] = obj[key];
	    newObj[key.replace(regExp, replace)] = obj[key];
	  }

	  return newObj;
	}

	var units = addCamelCasedVersion(defaultUnits);
	/**
	 * Recursive deep style passing function
	 */

	function iterate(prop, value, options) {
	  if (value == null) return value;

	  if (Array.isArray(value)) {
	    for (var i = 0; i < value.length; i++) {
	      value[i] = iterate(prop, value[i], options);
	    }
	  } else if (typeof value === 'object') {
	    if (prop === 'fallbacks') {
	      for (var innerProp in value) {
	        value[innerProp] = iterate(innerProp, value[innerProp], options);
	      }
	    } else {
	      for (var _innerProp in value) {
	        value[_innerProp] = iterate(prop + "-" + _innerProp, value[_innerProp], options);
	      }
	    } // eslint-disable-next-line no-restricted-globals

	  } else if (typeof value === 'number' && isNaN(value) === false) {
	    var unit = options[prop] || units[prop]; // Add the unit if available, except for the special case of 0px.

	    if (unit && !(value === 0 && unit === px)) {
	      return typeof unit === 'function' ? unit(value).toString() : "" + value + unit;
	    }

	    return value.toString();
	  }

	  return value;
	}
	/**
	 * Add unit to numeric values.
	 */


	function defaultUnit(options) {
	  if (options === void 0) {
	    options = {};
	  }

	  var camelCasedOptions = addCamelCasedVersion(options);

	  function onProcessStyle(style, rule) {
	    if (rule.type !== 'style') return style;

	    for (var prop in style) {
	      style[prop] = iterate(prop, style[prop], camelCasedOptions);
	    }

	    return style;
	  }

	  function onChangeValue(value, prop) {
	    return iterate(prop, value, camelCasedOptions);
	  }

	  return {
	    onProcessStyle: onProcessStyle,
	    onChangeValue: onChangeValue
	  };
	}

	function _arrayLikeToArray(r, a) {
	  (null == a || a > r.length) && (a = r.length);
	  for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
	  return n;
	}

	function _arrayWithoutHoles(r) {
	  if (Array.isArray(r)) return _arrayLikeToArray(r);
	}

	function _iterableToArray(r) {
	  if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r);
	}

	function _unsupportedIterableToArray(r, a) {
	  if (r) {
	    if ("string" == typeof r) return _arrayLikeToArray(r, a);
	    var t = {}.toString.call(r).slice(8, -1);
	    return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0;
	  }
	}

	function _nonIterableSpread() {
	  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
	}

	function _toConsumableArray(r) {
	  return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread();
	}

	// Export javascript style and css style vendor prefixes.
	var js = '';
	var css = '';
	var vendor = '';
	var browser = '';
	var isTouch = isBrowser && 'ontouchstart' in document.documentElement; // We should not do anything if required serverside.

	if (isBrowser) {
	  // Order matters. We need to check Webkit the last one because
	  // other vendors use to add Webkit prefixes to some properties
	  var jsCssMap = {
	    Moz: '-moz-',
	    ms: '-ms-',
	    O: '-o-',
	    Webkit: '-webkit-'
	  };

	  var _document$createEleme = document.createElement('p'),
	      style = _document$createEleme.style;

	  var testProp = 'Transform';

	  for (var key in jsCssMap) {
	    if (key + testProp in style) {
	      js = key;
	      css = jsCssMap[key];
	      break;
	    }
	  } // Correctly detect the Edge browser.


	  if (js === 'Webkit' && 'msHyphens' in style) {
	    js = 'ms';
	    css = jsCssMap.ms;
	    browser = 'edge';
	  } // Correctly detect the Safari browser.


	  if (js === 'Webkit' && '-apple-trailing-word' in style) {
	    vendor = 'apple';
	  }
	}
	/**
	 * Vendor prefix string for the current browser.
	 *
	 * @type {{js: String, css: String, vendor: String, browser: String}}
	 * @api public
	 */


	var prefix = {
	  js: js,
	  css: css,
	  vendor: vendor,
	  browser: browser,
	  isTouch: isTouch
	};

	/**
	 * Test if a keyframe at-rule should be prefixed or not
	 *
	 * @param {String} vendor prefix string for the current browser.
	 * @return {String}
	 * @api public
	 */

	function supportedKeyframes(key) {
	  // Keyframes is already prefixed. e.g. key = '@-webkit-keyframes a'
	  if (key[1] === '-') return key; // No need to prefix IE/Edge. Older browsers will ignore unsupported rules.
	  // https://caniuse.com/#search=keyframes

	  if (prefix.js === 'ms') return key;
	  return "@" + prefix.css + "keyframes" + key.substr(10);
	}

	// https://caniuse.com/#search=appearance

	var appearence = {
	  noPrefill: ['appearance'],
	  supportedProperty: function supportedProperty(prop) {
	    if (prop !== 'appearance') return false;
	    if (prefix.js === 'ms') return "-webkit-" + prop;
	    return prefix.css + prop;
	  }
	};

	// https://caniuse.com/#search=color-adjust

	var colorAdjust = {
	  noPrefill: ['color-adjust'],
	  supportedProperty: function supportedProperty(prop) {
	    if (prop !== 'color-adjust') return false;
	    if (prefix.js === 'Webkit') return prefix.css + "print-" + prop;
	    return prop;
	  }
	};

	var regExp = /[-\s]+(.)?/g;
	/**
	 * Replaces the letter with the capital letter
	 *
	 * @param {String} match
	 * @param {String} c
	 * @return {String}
	 * @api private
	 */

	function toUpper(match, c) {
	  return c ? c.toUpperCase() : '';
	}
	/**
	 * Convert dash separated strings to camel-cased.
	 *
	 * @param {String} str
	 * @return {String}
	 * @api private
	 */


	function camelize(str) {
	  return str.replace(regExp, toUpper);
	}

	/**
	 * Convert dash separated strings to pascal cased.
	 *
	 * @param {String} str
	 * @return {String}
	 * @api private
	 */

	function pascalize(str) {
	  return camelize("-" + str);
	}

	// but we can use a longhand property instead.
	// https://caniuse.com/#search=mask

	var mask = {
	  noPrefill: ['mask'],
	  supportedProperty: function supportedProperty(prop, style) {
	    if (!/^mask/.test(prop)) return false;

	    if (prefix.js === 'Webkit') {
	      var longhand = 'mask-image';

	      if (camelize(longhand) in style) {
	        return prop;
	      }

	      if (prefix.js + pascalize(longhand) in style) {
	        return prefix.css + prop;
	      }
	    }

	    return prop;
	  }
	};

	// https://caniuse.com/#search=text-orientation

	var textOrientation = {
	  noPrefill: ['text-orientation'],
	  supportedProperty: function supportedProperty(prop) {
	    if (prop !== 'text-orientation') return false;

	    if (prefix.vendor === 'apple' && !prefix.isTouch) {
	      return prefix.css + prop;
	    }

	    return prop;
	  }
	};

	// https://caniuse.com/#search=transform

	var transform = {
	  noPrefill: ['transform'],
	  supportedProperty: function supportedProperty(prop, style, options) {
	    if (prop !== 'transform') return false;

	    if (options.transform) {
	      return prop;
	    }

	    return prefix.css + prop;
	  }
	};

	// https://caniuse.com/#search=transition

	var transition = {
	  noPrefill: ['transition'],
	  supportedProperty: function supportedProperty(prop, style, options) {
	    if (prop !== 'transition') return false;

	    if (options.transition) {
	      return prop;
	    }

	    return prefix.css + prop;
	  }
	};

	// https://caniuse.com/#search=writing-mode

	var writingMode = {
	  noPrefill: ['writing-mode'],
	  supportedProperty: function supportedProperty(prop) {
	    if (prop !== 'writing-mode') return false;

	    if (prefix.js === 'Webkit' || prefix.js === 'ms' && prefix.browser !== 'edge') {
	      return prefix.css + prop;
	    }

	    return prop;
	  }
	};

	// https://caniuse.com/#search=user-select

	var userSelect = {
	  noPrefill: ['user-select'],
	  supportedProperty: function supportedProperty(prop) {
	    if (prop !== 'user-select') return false;

	    if (prefix.js === 'Moz' || prefix.js === 'ms' || prefix.vendor === 'apple') {
	      return prefix.css + prop;
	    }

	    return prop;
	  }
	};

	// https://caniuse.com/#search=multicolumn
	// https://github.com/postcss/autoprefixer/issues/491
	// https://github.com/postcss/autoprefixer/issues/177

	var breakPropsOld = {
	  supportedProperty: function supportedProperty(prop, style) {
	    if (!/^break-/.test(prop)) return false;

	    if (prefix.js === 'Webkit') {
	      var jsProp = "WebkitColumn" + pascalize(prop);
	      return jsProp in style ? prefix.css + "column-" + prop : false;
	    }

	    if (prefix.js === 'Moz') {
	      var _jsProp = "page" + pascalize(prop);

	      return _jsProp in style ? "page-" + prop : false;
	    }

	    return false;
	  }
	};

	// See https://github.com/postcss/autoprefixer/issues/324.

	var inlineLogicalOld = {
	  supportedProperty: function supportedProperty(prop, style) {
	    if (!/^(border|margin|padding)-inline/.test(prop)) return false;
	    if (prefix.js === 'Moz') return prop;
	    var newProp = prop.replace('-inline', '');
	    return prefix.js + pascalize(newProp) in style ? prefix.css + newProp : false;
	  }
	};

	// Camelization is required because we can't test using.
	// CSS syntax for e.g. in FF.

	var unprefixed = {
	  supportedProperty: function supportedProperty(prop, style) {
	    return camelize(prop) in style ? prop : false;
	  }
	};

	var prefixed = {
	  supportedProperty: function supportedProperty(prop, style) {
	    var pascalized = pascalize(prop); // Return custom CSS variable without prefixing.

	    if (prop[0] === '-') return prop; // Return already prefixed value without prefixing.

	    if (prop[0] === '-' && prop[1] === '-') return prop;
	    if (prefix.js + pascalized in style) return prefix.css + prop; // Try webkit fallback.

	    if (prefix.js !== 'Webkit' && "Webkit" + pascalized in style) return "-webkit-" + prop;
	    return false;
	  }
	};

	// https://caniuse.com/#search=scroll-snap

	var scrollSnap = {
	  supportedProperty: function supportedProperty(prop) {
	    if (prop.substring(0, 11) !== 'scroll-snap') return false;

	    if (prefix.js === 'ms') {
	      return "" + prefix.css + prop;
	    }

	    return prop;
	  }
	};

	// https://caniuse.com/#search=overscroll-behavior

	var overscrollBehavior = {
	  supportedProperty: function supportedProperty(prop) {
	    if (prop !== 'overscroll-behavior') return false;

	    if (prefix.js === 'ms') {
	      return prefix.css + "scroll-chaining";
	    }

	    return prop;
	  }
	};

	var propMap = {
	  'flex-grow': 'flex-positive',
	  'flex-shrink': 'flex-negative',
	  'flex-basis': 'flex-preferred-size',
	  'justify-content': 'flex-pack',
	  order: 'flex-order',
	  'align-items': 'flex-align',
	  'align-content': 'flex-line-pack' // 'align-self' is handled by 'align-self' plugin.

	}; // Support old flex spec from 2012.

	var flex2012 = {
	  supportedProperty: function supportedProperty(prop, style) {
	    var newProp = propMap[prop];
	    if (!newProp) return false;
	    return prefix.js + pascalize(newProp) in style ? prefix.css + newProp : false;
	  }
	};

	var propMap$1 = {
	  flex: 'box-flex',
	  'flex-grow': 'box-flex',
	  'flex-direction': ['box-orient', 'box-direction'],
	  order: 'box-ordinal-group',
	  'align-items': 'box-align',
	  'flex-flow': ['box-orient', 'box-direction'],
	  'justify-content': 'box-pack'
	};
	var propKeys = Object.keys(propMap$1);

	var prefixCss = function prefixCss(p) {
	  return prefix.css + p;
	}; // Support old flex spec from 2009.


	var flex2009 = {
	  supportedProperty: function supportedProperty(prop, style, _ref) {
	    var multiple = _ref.multiple;

	    if (propKeys.indexOf(prop) > -1) {
	      var newProp = propMap$1[prop];

	      if (!Array.isArray(newProp)) {
	        return prefix.js + pascalize(newProp) in style ? prefix.css + newProp : false;
	      }

	      if (!multiple) return false;

	      for (var i = 0; i < newProp.length; i++) {
	        if (!(prefix.js + pascalize(newProp[0]) in style)) {
	          return false;
	        }
	      }

	      return newProp.map(prefixCss);
	    }

	    return false;
	  }
	};

	// plugins = [
	//   ...plugins,
	//    breakPropsOld,
	//    inlineLogicalOld,
	//    unprefixed,
	//    prefixed,
	//    scrollSnap,
	//    flex2012,
	//    flex2009
	// ]
	// Plugins without 'noPrefill' value, going last.
	// 'flex-*' plugins should be at the bottom.
	// 'flex2009' going after 'flex2012'.
	// 'prefixed' going after 'unprefixed'

	var plugins = [appearence, colorAdjust, mask, textOrientation, transform, transition, writingMode, userSelect, breakPropsOld, inlineLogicalOld, unprefixed, prefixed, scrollSnap, overscrollBehavior, flex2012, flex2009];
	var propertyDetectors = plugins.filter(function (p) {
	  return p.supportedProperty;
	}).map(function (p) {
	  return p.supportedProperty;
	});
	var noPrefill = plugins.filter(function (p) {
	  return p.noPrefill;
	}).reduce(function (a, p) {
	  a.push.apply(a, _toConsumableArray(p.noPrefill));
	  return a;
	}, []);

	var el;
	var cache = {};

	if (isBrowser) {
	  el = document.createElement('p'); // We test every property on vendor prefix requirement.
	  // Once tested, result is cached. It gives us up to 70% perf boost.
	  // http://jsperf.com/element-style-object-access-vs-plain-object
	  //
	  // Prefill cache with known css properties to reduce amount of
	  // properties we need to feature test at runtime.
	  // http://davidwalsh.name/vendor-prefix

	  var computed = window.getComputedStyle(document.documentElement, '');

	  for (var key$1 in computed) {
	    // eslint-disable-next-line no-restricted-globals
	    if (!isNaN(key$1)) cache[computed[key$1]] = computed[key$1];
	  } // Properties that cannot be correctly detected using the
	  // cache prefill method.


	  noPrefill.forEach(function (x) {
	    return delete cache[x];
	  });
	}
	/**
	 * Test if a property is supported, returns supported property with vendor
	 * prefix if required. Returns `false` if not supported.
	 *
	 * @param {String} prop dash separated
	 * @param {Object} [options]
	 * @return {String|Boolean}
	 * @api public
	 */


	function supportedProperty(prop, options) {
	  if (options === void 0) {
	    options = {};
	  }

	  // For server-side rendering.
	  if (!el) return prop; // Remove cache for benchmark tests or return property from the cache.

	  if (cache[prop] != null) {
	    return cache[prop];
	  } // Check if 'transition' or 'transform' natively supported in browser.


	  if (prop === 'transition' || prop === 'transform') {
	    options[prop] = prop in el.style;
	  } // Find a plugin for current prefix property.


	  for (var i = 0; i < propertyDetectors.length; i++) {
	    cache[prop] = propertyDetectors[i](prop, el.style, options); // Break loop, if value found.

	    if (cache[prop]) break;
	  } // Reset styles for current property.
	  // Firefox can even throw an error for invalid properties, e.g., "0".


	  try {
	    el.style[prop] = '';
	  } catch (err) {
	    return false;
	  }

	  return cache[prop];
	}

	var cache$1 = {};
	var transitionProperties = {
	  transition: 1,
	  'transition-property': 1,
	  '-webkit-transition': 1,
	  '-webkit-transition-property': 1
	};
	var transPropsRegExp = /(^\s*[\w-]+)|, (\s*[\w-]+)(?![^()]*\))/g;
	var el$1;
	/**
	 * Returns prefixed value transition/transform if needed.
	 *
	 * @param {String} match
	 * @param {String} p1
	 * @param {String} p2
	 * @return {String}
	 * @api private
	 */

	function prefixTransitionCallback(match, p1, p2) {
	  if (p1 === 'var') return 'var';
	  if (p1 === 'all') return 'all';
	  if (p2 === 'all') return ', all';
	  var prefixedValue = p1 ? supportedProperty(p1) : ", " + supportedProperty(p2);
	  if (!prefixedValue) return p1 || p2;
	  return prefixedValue;
	}

	if (isBrowser) el$1 = document.createElement('p');
	/**
	 * Returns prefixed value if needed. Returns `false` if value is not supported.
	 *
	 * @param {String} property
	 * @param {String} value
	 * @return {String|Boolean}
	 * @api public
	 */

	function supportedValue(property, value) {
	  // For server-side rendering.
	  var prefixedValue = value;
	  if (!el$1 || property === 'content') return value; // It is a string or a number as a string like '1'.
	  // We want only prefixable values here.
	  // eslint-disable-next-line no-restricted-globals

	  if (typeof prefixedValue !== 'string' || !isNaN(parseInt(prefixedValue, 10))) {
	    return prefixedValue;
	  } // Create cache key for current value.


	  var cacheKey = property + prefixedValue; // Remove cache for benchmark tests or return value from cache.

	  if (cache$1[cacheKey] != null) {
	    return cache$1[cacheKey];
	  } // IE can even throw an error in some cases, for e.g. style.content = 'bar'.


	  try {
	    // Test value as it is.
	    el$1.style[property] = prefixedValue;
	  } catch (err) {
	    // Return false if value not supported.
	    cache$1[cacheKey] = false;
	    return false;
	  } // If 'transition' or 'transition-property' property.


	  if (transitionProperties[property]) {
	    prefixedValue = prefixedValue.replace(transPropsRegExp, prefixTransitionCallback);
	  } else if (el$1.style[property] === '') {
	    // Value with a vendor prefix.
	    prefixedValue = prefix.css + prefixedValue; // Hardcode test to convert "flex" to "-ms-flexbox" for IE10.

	    if (prefixedValue === '-ms-flex') el$1.style[property] = '-ms-flexbox'; // Test prefixed value.

	    el$1.style[property] = prefixedValue; // Return false if value not supported.

	    if (el$1.style[property] === '') {
	      cache$1[cacheKey] = false;
	      return false;
	    }
	  } // Reset styles for current property.


	  el$1.style[property] = ''; // Write current value to cache.

	  cache$1[cacheKey] = prefixedValue;
	  return cache$1[cacheKey];
	}

	/**
	 * Add vendor prefix to a property name when needed.
	 */

	function jssVendorPrefixer() {
	  function onProcessRule(rule) {
	    if (rule.type === 'keyframes') {
	      var atRule = rule;
	      atRule.at = supportedKeyframes(atRule.at);
	    }
	  }

	  function prefixStyle(style) {
	    for (var prop in style) {
	      var value = style[prop];

	      if (prop === 'fallbacks' && Array.isArray(value)) {
	        style[prop] = value.map(prefixStyle);
	        continue;
	      }

	      var changeProp = false;
	      var supportedProp = supportedProperty(prop);
	      if (supportedProp && supportedProp !== prop) changeProp = true;
	      var changeValue = false;
	      var supportedValue$1 = supportedValue(supportedProp, toCssValue(value));
	      if (supportedValue$1 && supportedValue$1 !== value) changeValue = true;

	      if (changeProp || changeValue) {
	        if (changeProp) delete style[prop];
	        style[supportedProp || prop] = supportedValue$1 || value;
	      }
	    }

	    return style;
	  }

	  function onProcessStyle(style, rule) {
	    if (rule.type !== 'style') return style;
	    return prefixStyle(style);
	  }

	  function onChangeValue(value, prop) {
	    return supportedValue(prop, toCssValue(value)) || value;
	  }

	  return {
	    onProcessRule: onProcessRule,
	    onProcessStyle: onProcessStyle,
	    onChangeValue: onChangeValue
	  };
	}

	/**
	 * Sort props by length.
	 */
	function jssPropsSort() {
	  var sort = function sort(prop0, prop1) {
	    if (prop0.length === prop1.length) {
	      return prop0 > prop1 ? 1 : -1;
	    }

	    return prop0.length - prop1.length;
	  };

	  return {
	    onProcessStyle: function onProcessStyle(style, rule) {
	      if (rule.type !== 'style') return style;
	      var newStyle = {};
	      var props = Object.keys(style).sort(sort);

	      for (var i = 0; i < props.length; i++) {
	        newStyle[props[i]] = style[props[i]];
	      }

	      return newStyle;
	    }
	  };
	}

	function jssPreset() {
	  return {
	    plugins: [functions(), jssGlobal(), jssNested(), camelCase(), defaultUnit(), // Disable the vendor prefixer server-side, it does nothing.
	    // This way, we can get a performance boost.
	    // In the documentation, we are using `autoprefixer` to solve this problem.
	    typeof window === 'undefined' ? null : jssVendorPrefixer(), jssPropsSort()]
	  };
	}

	function _objectWithoutProperties(e, t) {
	  if (null == e) return {};
	  var o,
	    r,
	    i = _objectWithoutPropertiesLoose(e, t);
	  if (Object.getOwnPropertySymbols) {
	    var n = Object.getOwnPropertySymbols(e);
	    for (r = 0; r < n.length; r++) o = n[r], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]);
	  }
	  return i;
	}

	function mergeClasses() {
	  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	  var baseClasses = options.baseClasses,
	      newClasses = options.newClasses;
	      options.Component;

	  if (!newClasses) {
	    return baseClasses;
	  }

	  var nextClasses = _extends({}, baseClasses);

	  Object.keys(newClasses).forEach(function (key) {

	    if (newClasses[key]) {
	      nextClasses[key] = "".concat(baseClasses[key], " ").concat(newClasses[key]);
	    }
	  });
	  return nextClasses;
	}

	// Used https://github.com/thinkloop/multi-key-cache as inspiration
	var multiKeyStore = {
	  set: function set(cache, key1, key2, value) {
	    var subCache = cache.get(key1);

	    if (!subCache) {
	      subCache = new Map();
	      cache.set(key1, subCache);
	    }

	    subCache.set(key2, value);
	  },
	  get: function get(cache, key1, key2) {
	    var subCache = cache.get(key1);
	    return subCache ? subCache.get(key2) : undefined;
	  },
	  delete: function _delete(cache, key1, key2) {
	    var subCache = cache.get(key1);
	    subCache.delete(key2);
	  }
	};
	var multiKeyStore$1 = multiKeyStore;

	var ThemeContext = React$1.createContext(null);

	var ThemeContext$1 = ThemeContext;

	function useTheme() {
	  var theme = React$1.useContext(ThemeContext$1);

	  return theme;
	}

	var jss = createJss(jssPreset()); // Use a singleton or the provided one by the context.
	//
	// The counter-based approach doesn't tolerate any mistake.
	// It's much safer to use the same counter everywhere.

	var generateClassName = createGenerateClassName(); // Exported for test purposes

	var sheetsManager = new Map();
	var defaultOptions = {
	  disableGeneration: false,
	  generateClassName: generateClassName,
	  jss: jss,
	  sheetsCache: null,
	  sheetsManager: sheetsManager,
	  sheetsRegistry: null
	};
	var StylesContext = React$1.createContext(defaultOptions);

	/* eslint-disable import/prefer-default-export */
	// Global index counter to preserve source order.
	// We create the style sheet during the creation of the component,
	// children are handled after the parents, so the order of style elements would be parent->child.
	// It is a problem though when a parent passes a className
	// which needs to override any child's styles.
	// StyleSheet of the child has a higher specificity, because of the source order.
	// So our solution is to render sheets them in the reverse order child->sheet, so
	// that parent has a higher specificity.
	var indexCounter = -1e9;
	function increment() {
	  indexCounter += 1;

	  return indexCounter;
	}

	// We use the same empty object to ref count the styles that don't need a theme object.
	var noopTheme = {};
	var noopTheme$1 = noopTheme;

	function getStylesCreator(stylesOrCreator) {
	  var themingEnabled = typeof stylesOrCreator === 'function';

	  return {
	    create: function create(theme, name) {
	      var styles;

	      try {
	        styles = themingEnabled ? stylesOrCreator(theme) : stylesOrCreator;
	      } catch (err) {

	        throw err;
	      }

	      if (!name || !theme.overrides || !theme.overrides[name]) {
	        return styles;
	      }

	      var overrides = theme.overrides[name];

	      var stylesWithOverrides = _extends({}, styles);

	      Object.keys(overrides).forEach(function (key) {

	        stylesWithOverrides[key] = deepmerge(stylesWithOverrides[key], overrides[key]);
	      });
	      return stylesWithOverrides;
	    },
	    options: {}
	  };
	}

	function getClasses(_ref, classes, Component) {
	  var state = _ref.state,
	      stylesOptions = _ref.stylesOptions;

	  if (stylesOptions.disableGeneration) {
	    return classes || {};
	  }

	  if (!state.cacheClasses) {
	    state.cacheClasses = {
	      // Cache for the finalized classes value.
	      value: null,
	      // Cache for the last used classes prop pointer.
	      lastProp: null,
	      // Cache for the last used rendered classes pointer.
	      lastJSS: {}
	    };
	  } // Tracks if either the rendered classes or classes prop has changed,
	  // requiring the generation of a new finalized classes object.


	  var generate = false;

	  if (state.classes !== state.cacheClasses.lastJSS) {
	    state.cacheClasses.lastJSS = state.classes;
	    generate = true;
	  }

	  if (classes !== state.cacheClasses.lastProp) {
	    state.cacheClasses.lastProp = classes;
	    generate = true;
	  }

	  if (generate) {
	    state.cacheClasses.value = mergeClasses({
	      baseClasses: state.cacheClasses.lastJSS,
	      newClasses: classes,
	      Component: Component
	    });
	  }

	  return state.cacheClasses.value;
	}

	function attach(_ref2, props) {
	  var state = _ref2.state,
	      theme = _ref2.theme,
	      stylesOptions = _ref2.stylesOptions,
	      stylesCreator = _ref2.stylesCreator,
	      name = _ref2.name;

	  if (stylesOptions.disableGeneration) {
	    return;
	  }

	  var sheetManager = multiKeyStore$1.get(stylesOptions.sheetsManager, stylesCreator, theme);

	  if (!sheetManager) {
	    sheetManager = {
	      refs: 0,
	      staticSheet: null,
	      dynamicStyles: null
	    };
	    multiKeyStore$1.set(stylesOptions.sheetsManager, stylesCreator, theme, sheetManager);
	  }

	  var options = _extends({}, stylesCreator.options, stylesOptions, {
	    theme: theme,
	    flip: typeof stylesOptions.flip === 'boolean' ? stylesOptions.flip : theme.direction === 'rtl'
	  });

	  options.generateId = options.serverGenerateClassName || options.generateClassName;
	  var sheetsRegistry = stylesOptions.sheetsRegistry;

	  if (sheetManager.refs === 0) {
	    var staticSheet;

	    if (stylesOptions.sheetsCache) {
	      staticSheet = multiKeyStore$1.get(stylesOptions.sheetsCache, stylesCreator, theme);
	    }

	    var styles = stylesCreator.create(theme, name);

	    if (!staticSheet) {
	      staticSheet = stylesOptions.jss.createStyleSheet(styles, _extends({
	        link: false
	      }, options));
	      staticSheet.attach();

	      if (stylesOptions.sheetsCache) {
	        multiKeyStore$1.set(stylesOptions.sheetsCache, stylesCreator, theme, staticSheet);
	      }
	    }

	    if (sheetsRegistry) {
	      sheetsRegistry.add(staticSheet);
	    }

	    sheetManager.staticSheet = staticSheet;
	    sheetManager.dynamicStyles = getDynamicStyles(styles);
	  }

	  if (sheetManager.dynamicStyles) {
	    var dynamicSheet = stylesOptions.jss.createStyleSheet(sheetManager.dynamicStyles, _extends({
	      link: true
	    }, options));
	    dynamicSheet.update(props);
	    dynamicSheet.attach();
	    state.dynamicSheet = dynamicSheet;
	    state.classes = mergeClasses({
	      baseClasses: sheetManager.staticSheet.classes,
	      newClasses: dynamicSheet.classes
	    });

	    if (sheetsRegistry) {
	      sheetsRegistry.add(dynamicSheet);
	    }
	  } else {
	    state.classes = sheetManager.staticSheet.classes;
	  }

	  sheetManager.refs += 1;
	}

	function update(_ref3, props) {
	  var state = _ref3.state;

	  if (state.dynamicSheet) {
	    state.dynamicSheet.update(props);
	  }
	}

	function detach(_ref4) {
	  var state = _ref4.state,
	      theme = _ref4.theme,
	      stylesOptions = _ref4.stylesOptions,
	      stylesCreator = _ref4.stylesCreator;

	  if (stylesOptions.disableGeneration) {
	    return;
	  }

	  var sheetManager = multiKeyStore$1.get(stylesOptions.sheetsManager, stylesCreator, theme);
	  sheetManager.refs -= 1;
	  var sheetsRegistry = stylesOptions.sheetsRegistry;

	  if (sheetManager.refs === 0) {
	    multiKeyStore$1.delete(stylesOptions.sheetsManager, stylesCreator, theme);
	    stylesOptions.jss.removeStyleSheet(sheetManager.staticSheet);

	    if (sheetsRegistry) {
	      sheetsRegistry.remove(sheetManager.staticSheet);
	    }
	  }

	  if (state.dynamicSheet) {
	    stylesOptions.jss.removeStyleSheet(state.dynamicSheet);

	    if (sheetsRegistry) {
	      sheetsRegistry.remove(state.dynamicSheet);
	    }
	  }
	}

	function useSynchronousEffect(func, values) {
	  var key = React$1.useRef([]);
	  var output; // Store "generation" key. Just returns a new object every time

	  var currentKey = React$1.useMemo(function () {
	    return {};
	  }, values); // eslint-disable-line react-hooks/exhaustive-deps
	  // "the first render", or "memo dropped the value"

	  if (key.current !== currentKey) {
	    key.current = currentKey;
	    output = func();
	  }

	  React$1.useEffect(function () {
	    return function () {
	      if (output) {
	        output();
	      }
	    };
	  }, [currentKey] // eslint-disable-line react-hooks/exhaustive-deps
	  );
	}

	function makeStyles(stylesOrCreator) {
	  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

	  var name = options.name,
	      classNamePrefixOption = options.classNamePrefix,
	      Component = options.Component,
	      _options$defaultTheme = options.defaultTheme,
	      defaultTheme = _options$defaultTheme === void 0 ? noopTheme$1 : _options$defaultTheme,
	      stylesOptions2 = _objectWithoutProperties(options, ["name", "classNamePrefix", "Component", "defaultTheme"]);

	  var stylesCreator = getStylesCreator(stylesOrCreator);
	  var classNamePrefix = name || classNamePrefixOption || 'makeStyles';
	  stylesCreator.options = {
	    index: increment(),
	    name: name,
	    meta: classNamePrefix,
	    classNamePrefix: classNamePrefix
	  };

	  var useStyles = function useStyles() {
	    var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	    var theme = useTheme() || defaultTheme;

	    var stylesOptions = _extends({}, React$1.useContext(StylesContext), stylesOptions2);

	    var instance = React$1.useRef();
	    var shouldUpdate = React$1.useRef();
	    useSynchronousEffect(function () {
	      var current = {
	        name: name,
	        state: {},
	        stylesCreator: stylesCreator,
	        stylesOptions: stylesOptions,
	        theme: theme
	      };
	      attach(current, props);
	      shouldUpdate.current = false;
	      instance.current = current;
	      return function () {
	        detach(current);
	      };
	    }, [theme, stylesCreator]);
	    React$1.useEffect(function () {
	      if (shouldUpdate.current) {
	        update(instance.current, props);
	      }

	      shouldUpdate.current = true;
	    });
	    var classes = getClasses(instance.current, props.classes, Component);

	    return classes;
	  };

	  return useStyles;
	}

	function r$1(e){var t,f,n="";if("string"==typeof e||"number"==typeof e)n+=e;else if("object"==typeof e)if(Array.isArray(e))for(t=0;t<e.length;t++)e[t]&&(f=r$1(e[t]))&&(n&&(n+=" "),n+=f);else for(t in e)e[t]&&(n&&(n+=" "),n+=t);return n}function clsx(){for(var e,t,f=0,n="";f<arguments.length;)(e=arguments[f++])&&(t=r$1(e))&&(n&&(n+=" "),n+=t);return n}

	var reactIs$1 = {exports: {}};

	var reactIs_production_min = {};

	/** @license React v16.13.1
	 * react-is.production.min.js
	 *
	 * Copyright (c) Facebook, Inc. and its affiliates.
	 *
	 * This source code is licensed under the MIT license found in the
	 * LICENSE file in the root directory of this source tree.
	 */
	var b="function"===typeof Symbol&&Symbol.for,c=b?Symbol.for("react.element"):60103,d=b?Symbol.for("react.portal"):60106,e=b?Symbol.for("react.fragment"):60107,f=b?Symbol.for("react.strict_mode"):60108,g$1=b?Symbol.for("react.profiler"):60114,h=b?Symbol.for("react.provider"):60109,k=b?Symbol.for("react.context"):60110,l=b?Symbol.for("react.async_mode"):60111,m=b?Symbol.for("react.concurrent_mode"):60111,n=b?Symbol.for("react.forward_ref"):60112,p=b?Symbol.for("react.suspense"):60113,q=b?
	Symbol.for("react.suspense_list"):60120,r=b?Symbol.for("react.memo"):60115,t=b?Symbol.for("react.lazy"):60116,v=b?Symbol.for("react.block"):60121,w=b?Symbol.for("react.fundamental"):60117,x=b?Symbol.for("react.responder"):60118,y=b?Symbol.for("react.scope"):60119;
	function z(a){if("object"===typeof a&&null!==a){var u=a.$$typeof;switch(u){case c:switch(a=a.type,a){case l:case m:case e:case g$1:case f:case p:return a;default:switch(a=a&&a.$$typeof,a){case k:case n:case t:case r:case h:return a;default:return u}}case d:return u}}}function A(a){return z(a)===m}reactIs_production_min.AsyncMode=l;reactIs_production_min.ConcurrentMode=m;reactIs_production_min.ContextConsumer=k;reactIs_production_min.ContextProvider=h;reactIs_production_min.Element=c;reactIs_production_min.ForwardRef=n;reactIs_production_min.Fragment=e;reactIs_production_min.Lazy=t;reactIs_production_min.Memo=r;reactIs_production_min.Portal=d;
	reactIs_production_min.Profiler=g$1;reactIs_production_min.StrictMode=f;reactIs_production_min.Suspense=p;reactIs_production_min.isAsyncMode=function(a){return A(a)||z(a)===l};reactIs_production_min.isConcurrentMode=A;reactIs_production_min.isContextConsumer=function(a){return z(a)===k};reactIs_production_min.isContextProvider=function(a){return z(a)===h};reactIs_production_min.isElement=function(a){return "object"===typeof a&&null!==a&&a.$$typeof===c};reactIs_production_min.isForwardRef=function(a){return z(a)===n};reactIs_production_min.isFragment=function(a){return z(a)===e};reactIs_production_min.isLazy=function(a){return z(a)===t};
	reactIs_production_min.isMemo=function(a){return z(a)===r};reactIs_production_min.isPortal=function(a){return z(a)===d};reactIs_production_min.isProfiler=function(a){return z(a)===g$1};reactIs_production_min.isStrictMode=function(a){return z(a)===f};reactIs_production_min.isSuspense=function(a){return z(a)===p};
	reactIs_production_min.isValidElementType=function(a){return "string"===typeof a||"function"===typeof a||a===e||a===m||a===g$1||a===f||a===p||a===q||"object"===typeof a&&null!==a&&(a.$$typeof===t||a.$$typeof===r||a.$$typeof===h||a.$$typeof===k||a.$$typeof===n||a.$$typeof===w||a.$$typeof===x||a.$$typeof===y||a.$$typeof===v)};reactIs_production_min.typeOf=z;

	{
	  reactIs$1.exports = reactIs_production_min;
	}

	var reactIs = reactIs$1.exports;

	/**
	 * Copyright 2015, Yahoo! Inc.
	 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
	 */
	var REACT_STATICS = {
	  childContextTypes: true,
	  contextType: true,
	  contextTypes: true,
	  defaultProps: true,
	  displayName: true,
	  getDefaultProps: true,
	  getDerivedStateFromError: true,
	  getDerivedStateFromProps: true,
	  mixins: true,
	  propTypes: true,
	  type: true
	};
	var KNOWN_STATICS = {
	  name: true,
	  length: true,
	  prototype: true,
	  caller: true,
	  callee: true,
	  arguments: true,
	  arity: true
	};
	var FORWARD_REF_STATICS = {
	  '$$typeof': true,
	  render: true,
	  defaultProps: true,
	  displayName: true,
	  propTypes: true
	};
	var MEMO_STATICS = {
	  '$$typeof': true,
	  compare: true,
	  defaultProps: true,
	  displayName: true,
	  propTypes: true,
	  type: true
	};
	var TYPE_STATICS = {};
	TYPE_STATICS[reactIs.ForwardRef] = FORWARD_REF_STATICS;
	TYPE_STATICS[reactIs.Memo] = MEMO_STATICS;

	function getStatics(component) {
	  // React v16.11 and below
	  if (reactIs.isMemo(component)) {
	    return MEMO_STATICS;
	  } // React v16.12 and above


	  return TYPE_STATICS[component['$$typeof']] || REACT_STATICS;
	}

	var defineProperty$2 = Object.defineProperty;
	var getOwnPropertyNames = Object.getOwnPropertyNames;
	var getOwnPropertySymbols = Object.getOwnPropertySymbols;
	var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
	var getPrototypeOf = Object.getPrototypeOf;
	var objectPrototype = Object.prototype;
	function hoistNonReactStatics(targetComponent, sourceComponent, blacklist) {
	  if (typeof sourceComponent !== 'string') {
	    // don't hoist over string (html) components
	    if (objectPrototype) {
	      var inheritedComponent = getPrototypeOf(sourceComponent);

	      if (inheritedComponent && inheritedComponent !== objectPrototype) {
	        hoistNonReactStatics(targetComponent, inheritedComponent, blacklist);
	      }
	    }

	    var keys = getOwnPropertyNames(sourceComponent);

	    if (getOwnPropertySymbols) {
	      keys = keys.concat(getOwnPropertySymbols(sourceComponent));
	    }

	    var targetStatics = getStatics(targetComponent);
	    var sourceStatics = getStatics(sourceComponent);

	    for (var i = 0; i < keys.length; ++i) {
	      var key = keys[i];

	      if (!KNOWN_STATICS[key] && !(blacklist && blacklist[key]) && !(sourceStatics && sourceStatics[key]) && !(targetStatics && targetStatics[key])) {
	        var descriptor = getOwnPropertyDescriptor(sourceComponent, key);

	        try {
	          // Avoid failures from read-only properties
	          defineProperty$2(targetComponent, key, descriptor);
	        } catch (e) {}
	      }
	    }
	  }

	  return targetComponent;
	}

	var hoistNonReactStatics_cjs = hoistNonReactStatics;

	function mergeOuterLocalTheme(outerTheme, localTheme) {
	  if (typeof localTheme === 'function') {
	    var mergedTheme = localTheme(outerTheme);

	    return mergedTheme;
	  }

	  return _extends({}, outerTheme, localTheme);
	}
	/**
	 * This component takes a `theme` prop.
	 * It makes the `theme` available down the React tree thanks to React context.
	 * This component should preferably be used at **the root of your component tree**.
	 */


	function ThemeProvider(props) {
	  var children = props.children,
	      localTheme = props.theme;
	  var outerTheme = useTheme();

	  var theme = React$1.useMemo(function () {
	    var output = outerTheme === null ? localTheme : mergeOuterLocalTheme(outerTheme, localTheme);

	    if (output != null) {
	      output[nested] = outerTheme !== null;
	    }

	    return output;
	  }, [localTheme, outerTheme]);
	  return /*#__PURE__*/React$1.createElement(ThemeContext$1.Provider, {
	    value: theme
	  }, children);
	}

	// It does not modify the component passed to it;
	// instead, it returns a new component, with a `classes` property.

	var withStyles$1 = function withStyles(stylesOrCreator) {
	  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
	  return function (Component) {
	    var defaultTheme = options.defaultTheme,
	        _options$withTheme = options.withTheme,
	        withTheme = _options$withTheme === void 0 ? false : _options$withTheme,
	        name = options.name,
	        stylesOptions = _objectWithoutProperties(options, ["defaultTheme", "withTheme", "name"]);

	    var classNamePrefix = name;

	    var useStyles = makeStyles(stylesOrCreator, _extends({
	      defaultTheme: defaultTheme,
	      Component: Component,
	      name: name || Component.displayName,
	      classNamePrefix: classNamePrefix
	    }, stylesOptions));
	    var WithStyles = /*#__PURE__*/React$1.forwardRef(function WithStyles(props, ref) {
	      props.classes;
	          var innerRef = props.innerRef,
	          other = _objectWithoutProperties(props, ["classes", "innerRef"]); // The wrapper receives only user supplied props, which could be a subset of
	      // the actual props Component might receive due to merging with defaultProps.
	      // So copying it here would give us the same result in the wrapper as well.


	      var classes = useStyles(_extends({}, Component.defaultProps, props));
	      var theme;
	      var more = other;

	      if (typeof name === 'string' || withTheme) {
	        // name and withTheme are invariant in the outer scope
	        // eslint-disable-next-line react-hooks/rules-of-hooks
	        theme = useTheme() || defaultTheme;

	        if (name) {
	          more = getThemeProps({
	            theme: theme,
	            name: name,
	            props: other
	          });
	        } // Provide the theme to the wrapped component.
	        // So we don't have to use the `withTheme()` Higher-order Component.


	        if (withTheme && !more.theme) {
	          more.theme = theme;
	        }
	      }

	      return /*#__PURE__*/React$1.createElement(Component, _extends({
	        ref: innerRef || ref,
	        classes: classes
	      }, more));
	    });

	    hoistNonReactStatics_cjs(WithStyles, Component);

	    return WithStyles;
	  };
	};

	var withStylesWithoutDefault = withStyles$1;

	/* eslint-disable no-use-before-define */

	/**
	 * Returns a number whose value is limited to the given range.
	 *
	 * @param {number} value The value to be clamped
	 * @param {number} min The lower boundary of the output range
	 * @param {number} max The upper boundary of the output range
	 * @returns {number} A number in the range [min, max]
	 */
	function clamp(value) {
	  var min = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
	  var max = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;

	  return Math.min(Math.max(min, value), max);
	}
	/**
	 * Converts a color from CSS hex format to CSS rgb format.
	 *
	 * @param {string} color - Hex color, i.e. #nnn or #nnnnnn
	 * @returns {string} A CSS rgb color string
	 */


	function hexToRgb(color) {
	  color = color.substr(1);
	  var re = new RegExp(".{1,".concat(color.length >= 6 ? 2 : 1, "}"), 'g');
	  var colors = color.match(re);

	  if (colors && colors[0].length === 1) {
	    colors = colors.map(function (n) {
	      return n + n;
	    });
	  }

	  return colors ? "rgb".concat(colors.length === 4 ? 'a' : '', "(").concat(colors.map(function (n, index) {
	    return index < 3 ? parseInt(n, 16) : Math.round(parseInt(n, 16) / 255 * 1000) / 1000;
	  }).join(', '), ")") : '';
	}
	/**
	 * Converts a color from hsl format to rgb format.
	 *
	 * @param {string} color - HSL color values
	 * @returns {string} rgb color values
	 */

	function hslToRgb(color) {
	  color = decomposeColor(color);
	  var _color = color,
	      values = _color.values;
	  var h = values[0];
	  var s = values[1] / 100;
	  var l = values[2] / 100;
	  var a = s * Math.min(l, 1 - l);

	  var f = function f(n) {
	    var k = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : (n + h / 30) % 12;
	    return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
	  };

	  var type = 'rgb';
	  var rgb = [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)];

	  if (color.type === 'hsla') {
	    type += 'a';
	    rgb.push(values[3]);
	  }

	  return recomposeColor({
	    type: type,
	    values: rgb
	  });
	}
	/**
	 * Returns an object with the type and values of a color.
	 *
	 * Note: Does not support rgb % values.
	 *
	 * @param {string} color - CSS color, i.e. one of: #nnn, #nnnnnn, rgb(), rgba(), hsl(), hsla()
	 * @returns {object} - A MUI color object: {type: string, values: number[]}
	 */

	function decomposeColor(color) {
	  // Idempotent
	  if (color.type) {
	    return color;
	  }

	  if (color.charAt(0) === '#') {
	    return decomposeColor(hexToRgb(color));
	  }

	  var marker = color.indexOf('(');
	  var type = color.substring(0, marker);

	  if (['rgb', 'rgba', 'hsl', 'hsla'].indexOf(type) === -1) {
	    throw new Error(formatMuiErrorMessage(3, color));
	  }

	  var values = color.substring(marker + 1, color.length - 1).split(',');
	  values = values.map(function (value) {
	    return parseFloat(value);
	  });
	  return {
	    type: type,
	    values: values
	  };
	}
	/**
	 * Converts a color object with type and values to a string.
	 *
	 * @param {object} color - Decomposed color
	 * @param {string} color.type - One of: 'rgb', 'rgba', 'hsl', 'hsla'
	 * @param {array} color.values - [n,n,n] or [n,n,n,n]
	 * @returns {string} A CSS color string
	 */

	function recomposeColor(color) {
	  var type = color.type;
	  var values = color.values;

	  if (type.indexOf('rgb') !== -1) {
	    // Only convert the first 3 values to int (i.e. not alpha)
	    values = values.map(function (n, i) {
	      return i < 3 ? parseInt(n, 10) : n;
	    });
	  } else if (type.indexOf('hsl') !== -1) {
	    values[1] = "".concat(values[1], "%");
	    values[2] = "".concat(values[2], "%");
	  }

	  return "".concat(type, "(").concat(values.join(', '), ")");
	}
	/**
	 * Calculates the contrast ratio between two colors.
	 *
	 * Formula: https://www.w3.org/TR/WCAG20-TECHS/G17.html#G17-tests
	 *
	 * @param {string} foreground - CSS color, i.e. one of: #nnn, #nnnnnn, rgb(), rgba(), hsl(), hsla()
	 * @param {string} background - CSS color, i.e. one of: #nnn, #nnnnnn, rgb(), rgba(), hsl(), hsla()
	 * @returns {number} A contrast ratio value in the range 0 - 21.
	 */

	function getContrastRatio(foreground, background) {
	  var lumA = getLuminance(foreground);
	  var lumB = getLuminance(background);
	  return (Math.max(lumA, lumB) + 0.05) / (Math.min(lumA, lumB) + 0.05);
	}
	/**
	 * The relative brightness of any point in a color space,
	 * normalized to 0 for darkest black and 1 for lightest white.
	 *
	 * Formula: https://www.w3.org/TR/WCAG20-TECHS/G17.html#G17-tests
	 *
	 * @param {string} color - CSS color, i.e. one of: #nnn, #nnnnnn, rgb(), rgba(), hsl(), hsla()
	 * @returns {number} The relative brightness of the color in the range 0 - 1
	 */

	function getLuminance(color) {
	  color = decomposeColor(color);
	  var rgb = color.type === 'hsl' ? decomposeColor(hslToRgb(color)).values : color.values;
	  rgb = rgb.map(function (val) {
	    val /= 255; // normalized

	    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
	  }); // Truncate at 3 digits

	  return Number((0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]).toFixed(3));
	}
	/**
	 * Set the absolute transparency of a color.
	 * Any existing alpha value is overwritten.
	 *
	 * @param {string} color - CSS color, i.e. one of: #nnn, #nnnnnn, rgb(), rgba(), hsl(), hsla()
	 * @param {number} value - value to set the alpha channel to in the range 0-1
	 * @returns {string} A CSS color string. Hex input values are returned as rgb
	 */

	function alpha(color, value) {
	  color = decomposeColor(color);
	  value = clamp(value);

	  if (color.type === 'rgb' || color.type === 'hsl') {
	    color.type += 'a';
	  }

	  color.values[3] = value;
	  return recomposeColor(color);
	}
	/**
	 * Darkens a color.
	 *
	 * @param {string} color - CSS color, i.e. one of: #nnn, #nnnnnn, rgb(), rgba(), hsl(), hsla()
	 * @param {number} coefficient - multiplier in the range 0 - 1
	 * @returns {string} A CSS color string. Hex input values are returned as rgb
	 */

	function darken(color, coefficient) {
	  color = decomposeColor(color);
	  coefficient = clamp(coefficient);

	  if (color.type.indexOf('hsl') !== -1) {
	    color.values[2] *= 1 - coefficient;
	  } else if (color.type.indexOf('rgb') !== -1) {
	    for (var i = 0; i < 3; i += 1) {
	      color.values[i] *= 1 - coefficient;
	    }
	  }

	  return recomposeColor(color);
	}
	/**
	 * Lightens a color.
	 *
	 * @param {string} color - CSS color, i.e. one of: #nnn, #nnnnnn, rgb(), rgba(), hsl(), hsla()
	 * @param {number} coefficient - multiplier in the range 0 - 1
	 * @returns {string} A CSS color string. Hex input values are returned as rgb
	 */

	function lighten(color, coefficient) {
	  color = decomposeColor(color);
	  coefficient = clamp(coefficient);

	  if (color.type.indexOf('hsl') !== -1) {
	    color.values[2] += (100 - color.values[2]) * coefficient;
	  } else if (color.type.indexOf('rgb') !== -1) {
	    for (var i = 0; i < 3; i += 1) {
	      color.values[i] += (255 - color.values[i]) * coefficient;
	    }
	  }

	  return recomposeColor(color);
	}

	// Sorted ASC by size. That's important.
	// It can't be configured as it's used statically for propTypes.
	var keys$4 = ['xs', 'sm', 'md', 'lg', 'xl']; // Keep in mind that @media is inclusive by the CSS specification.

	function createBreakpoints(breakpoints) {
	  var _breakpoints$values = breakpoints.values,
	      values = _breakpoints$values === void 0 ? {
	    xs: 0,
	    sm: 600,
	    md: 960,
	    lg: 1280,
	    xl: 1920
	  } : _breakpoints$values,
	      _breakpoints$unit = breakpoints.unit,
	      unit = _breakpoints$unit === void 0 ? 'px' : _breakpoints$unit,
	      _breakpoints$step = breakpoints.step,
	      step = _breakpoints$step === void 0 ? 5 : _breakpoints$step,
	      other = _objectWithoutProperties(breakpoints, ["values", "unit", "step"]);

	  function up(key) {
	    var value = typeof values[key] === 'number' ? values[key] : key;
	    return "@media (min-width:".concat(value).concat(unit, ")");
	  }

	  function down(key) {
	    var endIndex = keys$4.indexOf(key) + 1;
	    var upperbound = values[keys$4[endIndex]];

	    if (endIndex === keys$4.length) {
	      // xl down applies to all sizes
	      return up('xs');
	    }

	    var value = typeof upperbound === 'number' && endIndex > 0 ? upperbound : key;
	    return "@media (max-width:".concat(value - step / 100).concat(unit, ")");
	  }

	  function between(start, end) {
	    var endIndex = keys$4.indexOf(end);

	    if (endIndex === keys$4.length - 1) {
	      return up(start);
	    }

	    return "@media (min-width:".concat(typeof values[start] === 'number' ? values[start] : start).concat(unit, ") and ") + "(max-width:".concat((endIndex !== -1 && typeof values[keys$4[endIndex + 1]] === 'number' ? values[keys$4[endIndex + 1]] : end) - step / 100).concat(unit, ")");
	  }

	  function only(key) {
	    return between(key, key);
	  }

	  function width(key) {

	    return values[key];
	  }

	  return _extends({
	    keys: keys$4,
	    values: values,
	    up: up,
	    down: down,
	    between: between,
	    only: only,
	    width: width
	  }, other);
	}

	function createMixins(breakpoints, spacing, mixins) {
	  var _toolbar;

	  return _extends({
	    gutters: function gutters() {
	      var styles = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	      console.warn(['Material-UI: theme.mixins.gutters() is deprecated.', 'You can use the source of the mixin directly:', "\n      paddingLeft: theme.spacing(2),\n      paddingRight: theme.spacing(2),\n      [theme.breakpoints.up('sm')]: {\n        paddingLeft: theme.spacing(3),\n        paddingRight: theme.spacing(3),\n      },\n      "].join('\n'));
	      return _extends({
	        paddingLeft: spacing(2),
	        paddingRight: spacing(2)
	      }, styles, _defineProperty$2({}, breakpoints.up('sm'), _extends({
	        paddingLeft: spacing(3),
	        paddingRight: spacing(3)
	      }, styles[breakpoints.up('sm')])));
	    },
	    toolbar: (_toolbar = {
	      minHeight: 56
	    }, _defineProperty$2(_toolbar, "".concat(breakpoints.up('xs'), " and (orientation: landscape)"), {
	      minHeight: 48
	    }), _defineProperty$2(_toolbar, breakpoints.up('sm'), {
	      minHeight: 64
	    }), _toolbar)
	  }, mixins);
	}

	var common = {
	  black: '#000',
	  white: '#fff'
	};
	var common$1 = common;

	var grey = {
	  50: '#fafafa',
	  100: '#f5f5f5',
	  200: '#eeeeee',
	  300: '#e0e0e0',
	  400: '#bdbdbd',
	  500: '#9e9e9e',
	  600: '#757575',
	  700: '#616161',
	  800: '#424242',
	  900: '#212121',
	  A100: '#d5d5d5',
	  A200: '#aaaaaa',
	  A400: '#303030',
	  A700: '#616161'
	};
	var grey$1 = grey;

	var indigo = {
	  50: '#e8eaf6',
	  100: '#c5cae9',
	  200: '#9fa8da',
	  300: '#7986cb',
	  400: '#5c6bc0',
	  500: '#3f51b5',
	  600: '#3949ab',
	  700: '#303f9f',
	  800: '#283593',
	  900: '#1a237e',
	  A100: '#8c9eff',
	  A200: '#536dfe',
	  A400: '#3d5afe',
	  A700: '#304ffe'
	};
	var indigo$1 = indigo;

	var pink = {
	  50: '#fce4ec',
	  100: '#f8bbd0',
	  200: '#f48fb1',
	  300: '#f06292',
	  400: '#ec407a',
	  500: '#e91e63',
	  600: '#d81b60',
	  700: '#c2185b',
	  800: '#ad1457',
	  900: '#880e4f',
	  A100: '#ff80ab',
	  A200: '#ff4081',
	  A400: '#f50057',
	  A700: '#c51162'
	};
	var pink$1 = pink;

	var red = {
	  50: '#ffebee',
	  100: '#ffcdd2',
	  200: '#ef9a9a',
	  300: '#e57373',
	  400: '#ef5350',
	  500: '#f44336',
	  600: '#e53935',
	  700: '#d32f2f',
	  800: '#c62828',
	  900: '#b71c1c',
	  A100: '#ff8a80',
	  A200: '#ff5252',
	  A400: '#ff1744',
	  A700: '#d50000'
	};
	var red$1 = red;

	var orange = {
	  50: '#fff3e0',
	  100: '#ffe0b2',
	  200: '#ffcc80',
	  300: '#ffb74d',
	  400: '#ffa726',
	  500: '#ff9800',
	  600: '#fb8c00',
	  700: '#f57c00',
	  800: '#ef6c00',
	  900: '#e65100',
	  A100: '#ffd180',
	  A200: '#ffab40',
	  A400: '#ff9100',
	  A700: '#ff6d00'
	};
	var orange$1 = orange;

	var blue = {
	  50: '#e3f2fd',
	  100: '#bbdefb',
	  200: '#90caf9',
	  300: '#64b5f6',
	  400: '#42a5f5',
	  500: '#2196f3',
	  600: '#1e88e5',
	  700: '#1976d2',
	  800: '#1565c0',
	  900: '#0d47a1',
	  A100: '#82b1ff',
	  A200: '#448aff',
	  A400: '#2979ff',
	  A700: '#2962ff'
	};
	var blue$1 = blue;

	var green = {
	  50: '#e8f5e9',
	  100: '#c8e6c9',
	  200: '#a5d6a7',
	  300: '#81c784',
	  400: '#66bb6a',
	  500: '#4caf50',
	  600: '#43a047',
	  700: '#388e3c',
	  800: '#2e7d32',
	  900: '#1b5e20',
	  A100: '#b9f6ca',
	  A200: '#69f0ae',
	  A400: '#00e676',
	  A700: '#00c853'
	};
	var green$1 = green;

	var light = {
	  // The colors used to style the text.
	  text: {
	    // The most important text.
	    primary: 'rgba(0, 0, 0, 0.87)',
	    // Secondary text.
	    secondary: 'rgba(0, 0, 0, 0.54)',
	    // Disabled text have even lower visual prominence.
	    disabled: 'rgba(0, 0, 0, 0.38)',
	    // Text hints.
	    hint: 'rgba(0, 0, 0, 0.38)'
	  },
	  // The color used to divide different elements.
	  divider: 'rgba(0, 0, 0, 0.12)',
	  // The background colors used to style the surfaces.
	  // Consistency between these values is important.
	  background: {
	    paper: common$1.white,
	    default: grey$1[50]
	  },
	  // The colors used to style the action elements.
	  action: {
	    // The color of an active action like an icon button.
	    active: 'rgba(0, 0, 0, 0.54)',
	    // The color of an hovered action.
	    hover: 'rgba(0, 0, 0, 0.04)',
	    hoverOpacity: 0.04,
	    // The color of a selected action.
	    selected: 'rgba(0, 0, 0, 0.08)',
	    selectedOpacity: 0.08,
	    // The color of a disabled action.
	    disabled: 'rgba(0, 0, 0, 0.26)',
	    // The background color of a disabled action.
	    disabledBackground: 'rgba(0, 0, 0, 0.12)',
	    disabledOpacity: 0.38,
	    focus: 'rgba(0, 0, 0, 0.12)',
	    focusOpacity: 0.12,
	    activatedOpacity: 0.12
	  }
	};
	var dark = {
	  text: {
	    primary: common$1.white,
	    secondary: 'rgba(255, 255, 255, 0.7)',
	    disabled: 'rgba(255, 255, 255, 0.5)',
	    hint: 'rgba(255, 255, 255, 0.5)',
	    icon: 'rgba(255, 255, 255, 0.5)'
	  },
	  divider: 'rgba(255, 255, 255, 0.12)',
	  background: {
	    paper: grey$1[800],
	    default: '#303030'
	  },
	  action: {
	    active: common$1.white,
	    hover: 'rgba(255, 255, 255, 0.08)',
	    hoverOpacity: 0.08,
	    selected: 'rgba(255, 255, 255, 0.16)',
	    selectedOpacity: 0.16,
	    disabled: 'rgba(255, 255, 255, 0.3)',
	    disabledBackground: 'rgba(255, 255, 255, 0.12)',
	    disabledOpacity: 0.38,
	    focus: 'rgba(255, 255, 255, 0.12)',
	    focusOpacity: 0.12,
	    activatedOpacity: 0.24
	  }
	};

	function addLightOrDark(intent, direction, shade, tonalOffset) {
	  var tonalOffsetLight = tonalOffset.light || tonalOffset;
	  var tonalOffsetDark = tonalOffset.dark || tonalOffset * 1.5;

	  if (!intent[direction]) {
	    if (intent.hasOwnProperty(shade)) {
	      intent[direction] = intent[shade];
	    } else if (direction === 'light') {
	      intent.light = lighten(intent.main, tonalOffsetLight);
	    } else if (direction === 'dark') {
	      intent.dark = darken(intent.main, tonalOffsetDark);
	    }
	  }
	}

	function createPalette(palette) {
	  var _palette$primary = palette.primary,
	      primary = _palette$primary === void 0 ? {
	    light: indigo$1[300],
	    main: indigo$1[500],
	    dark: indigo$1[700]
	  } : _palette$primary,
	      _palette$secondary = palette.secondary,
	      secondary = _palette$secondary === void 0 ? {
	    light: pink$1.A200,
	    main: pink$1.A400,
	    dark: pink$1.A700
	  } : _palette$secondary,
	      _palette$error = palette.error,
	      error = _palette$error === void 0 ? {
	    light: red$1[300],
	    main: red$1[500],
	    dark: red$1[700]
	  } : _palette$error,
	      _palette$warning = palette.warning,
	      warning = _palette$warning === void 0 ? {
	    light: orange$1[300],
	    main: orange$1[500],
	    dark: orange$1[700]
	  } : _palette$warning,
	      _palette$info = palette.info,
	      info = _palette$info === void 0 ? {
	    light: blue$1[300],
	    main: blue$1[500],
	    dark: blue$1[700]
	  } : _palette$info,
	      _palette$success = palette.success,
	      success = _palette$success === void 0 ? {
	    light: green$1[300],
	    main: green$1[500],
	    dark: green$1[700]
	  } : _palette$success,
	      _palette$type = palette.type,
	      type = _palette$type === void 0 ? 'light' : _palette$type,
	      _palette$contrastThre = palette.contrastThreshold,
	      contrastThreshold = _palette$contrastThre === void 0 ? 3 : _palette$contrastThre,
	      _palette$tonalOffset = palette.tonalOffset,
	      tonalOffset = _palette$tonalOffset === void 0 ? 0.2 : _palette$tonalOffset,
	      other = _objectWithoutProperties(palette, ["primary", "secondary", "error", "warning", "info", "success", "type", "contrastThreshold", "tonalOffset"]); // Use the same logic as
	  // Bootstrap: https://github.com/twbs/bootstrap/blob/1d6e3710dd447de1a200f29e8fa521f8a0908f70/scss/_functions.scss#L59
	  // and material-components-web https://github.com/material-components/material-components-web/blob/ac46b8863c4dab9fc22c4c662dc6bd1b65dd652f/packages/mdc-theme/_functions.scss#L54


	  function getContrastText(background) {
	    var contrastText = getContrastRatio(background, dark.text.primary) >= contrastThreshold ? dark.text.primary : light.text.primary;

	    return contrastText;
	  }

	  var augmentColor = function augmentColor(color) {
	    var mainShade = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 500;
	    var lightShade = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 300;
	    var darkShade = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 700;
	    color = _extends({}, color);

	    if (!color.main && color[mainShade]) {
	      color.main = color[mainShade];
	    }

	    if (!color.main) {
	      throw new Error(formatMuiErrorMessage(4, mainShade));
	    }

	    if (typeof color.main !== 'string') {
	      throw new Error(formatMuiErrorMessage(5, JSON.stringify(color.main)));
	    }

	    addLightOrDark(color, 'light', lightShade, tonalOffset);
	    addLightOrDark(color, 'dark', darkShade, tonalOffset);

	    if (!color.contrastText) {
	      color.contrastText = getContrastText(color.main);
	    }

	    return color;
	  };

	  var types = {
	    dark: dark,
	    light: light
	  };

	  var paletteOutput = deepmerge(_extends({
	    // A collection of common colors.
	    common: common$1,
	    // The palette type, can be light or dark.
	    type: type,
	    // The colors used to represent primary interface elements for a user.
	    primary: augmentColor(primary),
	    // The colors used to represent secondary interface elements for a user.
	    secondary: augmentColor(secondary, 'A400', 'A200', 'A700'),
	    // The colors used to represent interface elements that the user should be made aware of.
	    error: augmentColor(error),
	    // The colors used to represent potentially dangerous actions or important messages.
	    warning: augmentColor(warning),
	    // The colors used to present information to the user that is neutral and not necessarily important.
	    info: augmentColor(info),
	    // The colors used to indicate the successful completion of an action that user triggered.
	    success: augmentColor(success),
	    // The grey colors.
	    grey: grey$1,
	    // Used by `getContrastText()` to maximize the contrast between
	    // the background and the text.
	    contrastThreshold: contrastThreshold,
	    // Takes a background color and returns the text color that maximizes the contrast.
	    getContrastText: getContrastText,
	    // Generate a rich color object.
	    augmentColor: augmentColor,
	    // Used by the functions below to shift a color's luminance by approximately
	    // two indexes within its tonal palette.
	    // E.g., shift from Red 500 to Red 300 or Red 700.
	    tonalOffset: tonalOffset
	  }, types[type]), other);
	  return paletteOutput;
	}

	function round$2(value) {
	  return Math.round(value * 1e5) / 1e5;
	}

	function roundWithDeprecationWarning(value) {

	  return round$2(value);
	}

	var caseAllCaps = {
	  textTransform: 'uppercase'
	};
	var defaultFontFamily = '"Roboto", "Helvetica", "Arial", sans-serif';
	/**
	 * @see @link{https://material.io/design/typography/the-type-system.html}
	 * @see @link{https://material.io/design/typography/understanding-typography.html}
	 */

	function createTypography(palette, typography) {
	  var _ref = typeof typography === 'function' ? typography(palette) : typography,
	      _ref$fontFamily = _ref.fontFamily,
	      fontFamily = _ref$fontFamily === void 0 ? defaultFontFamily : _ref$fontFamily,
	      _ref$fontSize = _ref.fontSize,
	      fontSize = _ref$fontSize === void 0 ? 14 : _ref$fontSize,
	      _ref$fontWeightLight = _ref.fontWeightLight,
	      fontWeightLight = _ref$fontWeightLight === void 0 ? 300 : _ref$fontWeightLight,
	      _ref$fontWeightRegula = _ref.fontWeightRegular,
	      fontWeightRegular = _ref$fontWeightRegula === void 0 ? 400 : _ref$fontWeightRegula,
	      _ref$fontWeightMedium = _ref.fontWeightMedium,
	      fontWeightMedium = _ref$fontWeightMedium === void 0 ? 500 : _ref$fontWeightMedium,
	      _ref$fontWeightBold = _ref.fontWeightBold,
	      fontWeightBold = _ref$fontWeightBold === void 0 ? 700 : _ref$fontWeightBold,
	      _ref$htmlFontSize = _ref.htmlFontSize,
	      htmlFontSize = _ref$htmlFontSize === void 0 ? 16 : _ref$htmlFontSize,
	      allVariants = _ref.allVariants,
	      pxToRem2 = _ref.pxToRem,
	      other = _objectWithoutProperties(_ref, ["fontFamily", "fontSize", "fontWeightLight", "fontWeightRegular", "fontWeightMedium", "fontWeightBold", "htmlFontSize", "allVariants", "pxToRem"]);

	  var coef = fontSize / 14;

	  var pxToRem = pxToRem2 || function (size) {
	    return "".concat(size / htmlFontSize * coef, "rem");
	  };

	  var buildVariant = function buildVariant(fontWeight, size, lineHeight, letterSpacing, casing) {
	    return _extends({
	      fontFamily: fontFamily,
	      fontWeight: fontWeight,
	      fontSize: pxToRem(size),
	      // Unitless following https://meyerweb.com/eric/thoughts/2006/02/08/unitless-line-heights/
	      lineHeight: lineHeight
	    }, fontFamily === defaultFontFamily ? {
	      letterSpacing: "".concat(round$2(letterSpacing / size), "em")
	    } : {}, casing, allVariants);
	  };

	  var variants = {
	    h1: buildVariant(fontWeightLight, 96, 1.167, -1.5),
	    h2: buildVariant(fontWeightLight, 60, 1.2, -0.5),
	    h3: buildVariant(fontWeightRegular, 48, 1.167, 0),
	    h4: buildVariant(fontWeightRegular, 34, 1.235, 0.25),
	    h5: buildVariant(fontWeightRegular, 24, 1.334, 0),
	    h6: buildVariant(fontWeightMedium, 20, 1.6, 0.15),
	    subtitle1: buildVariant(fontWeightRegular, 16, 1.75, 0.15),
	    subtitle2: buildVariant(fontWeightMedium, 14, 1.57, 0.1),
	    body1: buildVariant(fontWeightRegular, 16, 1.5, 0.15),
	    body2: buildVariant(fontWeightRegular, 14, 1.43, 0.15),
	    button: buildVariant(fontWeightMedium, 14, 1.75, 0.4, caseAllCaps),
	    caption: buildVariant(fontWeightRegular, 12, 1.66, 0.4),
	    overline: buildVariant(fontWeightRegular, 12, 2.66, 1, caseAllCaps)
	  };
	  return deepmerge(_extends({
	    htmlFontSize: htmlFontSize,
	    pxToRem: pxToRem,
	    round: roundWithDeprecationWarning,
	    // TODO v5: remove
	    fontFamily: fontFamily,
	    fontSize: fontSize,
	    fontWeightLight: fontWeightLight,
	    fontWeightRegular: fontWeightRegular,
	    fontWeightMedium: fontWeightMedium,
	    fontWeightBold: fontWeightBold
	  }, variants), other, {
	    clone: false // No need to clone deep

	  });
	}

	var shadowKeyUmbraOpacity = 0.2;
	var shadowKeyPenumbraOpacity = 0.14;
	var shadowAmbientShadowOpacity = 0.12;

	function createShadow() {
	  return ["".concat(arguments.length <= 0 ? undefined : arguments[0], "px ").concat(arguments.length <= 1 ? undefined : arguments[1], "px ").concat(arguments.length <= 2 ? undefined : arguments[2], "px ").concat(arguments.length <= 3 ? undefined : arguments[3], "px rgba(0,0,0,").concat(shadowKeyUmbraOpacity, ")"), "".concat(arguments.length <= 4 ? undefined : arguments[4], "px ").concat(arguments.length <= 5 ? undefined : arguments[5], "px ").concat(arguments.length <= 6 ? undefined : arguments[6], "px ").concat(arguments.length <= 7 ? undefined : arguments[7], "px rgba(0,0,0,").concat(shadowKeyPenumbraOpacity, ")"), "".concat(arguments.length <= 8 ? undefined : arguments[8], "px ").concat(arguments.length <= 9 ? undefined : arguments[9], "px ").concat(arguments.length <= 10 ? undefined : arguments[10], "px ").concat(arguments.length <= 11 ? undefined : arguments[11], "px rgba(0,0,0,").concat(shadowAmbientShadowOpacity, ")")].join(',');
	} // Values from https://github.com/material-components/material-components-web/blob/be8747f94574669cb5e7add1a7c54fa41a89cec7/packages/mdc-elevation/_variables.scss


	var shadows = ['none', createShadow(0, 2, 1, -1, 0, 1, 1, 0, 0, 1, 3, 0), createShadow(0, 3, 1, -2, 0, 2, 2, 0, 0, 1, 5, 0), createShadow(0, 3, 3, -2, 0, 3, 4, 0, 0, 1, 8, 0), createShadow(0, 2, 4, -1, 0, 4, 5, 0, 0, 1, 10, 0), createShadow(0, 3, 5, -1, 0, 5, 8, 0, 0, 1, 14, 0), createShadow(0, 3, 5, -1, 0, 6, 10, 0, 0, 1, 18, 0), createShadow(0, 4, 5, -2, 0, 7, 10, 1, 0, 2, 16, 1), createShadow(0, 5, 5, -3, 0, 8, 10, 1, 0, 3, 14, 2), createShadow(0, 5, 6, -3, 0, 9, 12, 1, 0, 3, 16, 2), createShadow(0, 6, 6, -3, 0, 10, 14, 1, 0, 4, 18, 3), createShadow(0, 6, 7, -4, 0, 11, 15, 1, 0, 4, 20, 3), createShadow(0, 7, 8, -4, 0, 12, 17, 2, 0, 5, 22, 4), createShadow(0, 7, 8, -4, 0, 13, 19, 2, 0, 5, 24, 4), createShadow(0, 7, 9, -4, 0, 14, 21, 2, 0, 5, 26, 4), createShadow(0, 8, 9, -5, 0, 15, 22, 2, 0, 6, 28, 5), createShadow(0, 8, 10, -5, 0, 16, 24, 2, 0, 6, 30, 5), createShadow(0, 8, 11, -5, 0, 17, 26, 2, 0, 6, 32, 5), createShadow(0, 9, 11, -5, 0, 18, 28, 2, 0, 7, 34, 6), createShadow(0, 9, 12, -6, 0, 19, 29, 2, 0, 7, 36, 6), createShadow(0, 10, 13, -6, 0, 20, 31, 3, 0, 8, 38, 7), createShadow(0, 10, 13, -6, 0, 21, 33, 3, 0, 8, 40, 7), createShadow(0, 10, 14, -6, 0, 22, 35, 3, 0, 8, 42, 7), createShadow(0, 11, 14, -7, 0, 23, 36, 3, 0, 9, 44, 8), createShadow(0, 11, 15, -7, 0, 24, 38, 3, 0, 9, 46, 8)];
	var shadows$1 = shadows;

	var shape = {
	  borderRadius: 4
	};
	var shape$1 = shape;

	function _arrayWithHoles(r) {
	  if (Array.isArray(r)) return r;
	}

	function _iterableToArrayLimit(r, l) {
	  var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
	  if (null != t) {
	    var e,
	      n,
	      i,
	      u,
	      a = [],
	      f = !0,
	      o = !1;
	    try {
	      if (i = (t = t.call(r)).next, 0 === l) {
	        if (Object(t) !== t) return;
	        f = !1;
	      } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0);
	    } catch (r) {
	      o = !0, n = r;
	    } finally {
	      try {
	        if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return;
	      } finally {
	        if (o) throw n;
	      }
	    }
	    return a;
	  }
	}

	function _nonIterableRest() {
	  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
	}

	function _slicedToArray(r, e) {
	  return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest();
	}

	function createUnarySpacing(theme) {
	  var themeSpacing = theme.spacing || 8;

	  if (typeof themeSpacing === 'number') {
	    return function (abs) {

	      return themeSpacing * abs;
	    };
	  }

	  if (Array.isArray(themeSpacing)) {
	    return function (abs) {

	      return themeSpacing[abs];
	    };
	  }

	  if (typeof themeSpacing === 'function') {
	    return themeSpacing;
	  }

	  return function () {
	    return undefined;
	  };
	}

	function createSpacing() {
	  var spacingInput = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 8;

	  // Already transformed.
	  if (spacingInput.mui) {
	    return spacingInput;
	  } // Material Design layouts are visually balanced. Most measurements align to an 8dp grid applied, which aligns both spacing and the overall layout.
	  // Smaller components, such as icons and type, can align to a 4dp grid.
	  // https://material.io/design/layout/understanding-layout.html#usage


	  var transform = createUnarySpacing({
	    spacing: spacingInput
	  });

	  var spacing = function spacing() {
	    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
	      args[_key] = arguments[_key];
	    }

	    if (args.length === 0) {
	      return transform(1);
	    }

	    if (args.length === 1) {
	      return transform(args[0]);
	    }

	    return args.map(function (argument) {
	      if (typeof argument === 'string') {
	        return argument;
	      }

	      var output = transform(argument);
	      return typeof output === 'number' ? "".concat(output, "px") : output;
	    }).join(' ');
	  }; // Backward compatibility, to remove in v5.


	  Object.defineProperty(spacing, 'unit', {
	    get: function get() {

	      return spacingInput;
	    }
	  });
	  spacing.mui = true;
	  return spacing;
	}

	// Follow https://material.google.com/motion/duration-easing.html#duration-easing-natural-easing-curves
	// to learn the context in which each easing should be used.
	var easing = {
	  // This is the most common easing curve.
	  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
	  // Objects enter the screen at full velocity from off-screen and
	  // slowly decelerate to a resting point.
	  easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
	  // Objects leave the screen at full velocity. They do not decelerate when off-screen.
	  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
	  // The sharp curve is used by objects that may return to the screen at any time.
	  sharp: 'cubic-bezier(0.4, 0, 0.6, 1)'
	}; // Follow https://material.io/guidelines/motion/duration-easing.html#duration-easing-common-durations
	// to learn when use what timing

	var duration = {
	  shortest: 150,
	  shorter: 200,
	  short: 250,
	  // most basic recommended timing
	  standard: 300,
	  // this is to be used in complex animations
	  complex: 375,
	  // recommended when something is entering screen
	  enteringScreen: 225,
	  // recommended when something is leaving screen
	  leavingScreen: 195
	};

	function formatMs(milliseconds) {
	  return "".concat(Math.round(milliseconds), "ms");
	}
	/**
	 * @param {string|Array} props
	 * @param {object} param
	 * @param {string} param.prop
	 * @param {number} param.duration
	 * @param {string} param.easing
	 * @param {number} param.delay
	 */


	var transitions = {
	  easing: easing,
	  duration: duration,
	  create: function create() {
	    var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : ['all'];
	    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

	    var _options$duration = options.duration,
	        durationOption = _options$duration === void 0 ? duration.standard : _options$duration,
	        _options$easing = options.easing,
	        easingOption = _options$easing === void 0 ? easing.easeInOut : _options$easing,
	        _options$delay = options.delay,
	        delay = _options$delay === void 0 ? 0 : _options$delay;
	        _objectWithoutProperties(options, ["duration", "easing", "delay"]);

	    return (Array.isArray(props) ? props : [props]).map(function (animatedProp) {
	      return "".concat(animatedProp, " ").concat(typeof durationOption === 'string' ? durationOption : formatMs(durationOption), " ").concat(easingOption, " ").concat(typeof delay === 'string' ? delay : formatMs(delay));
	    }).join(',');
	  },
	  getAutoHeightDuration: function getAutoHeightDuration(height) {
	    if (!height) {
	      return 0;
	    }

	    var constant = height / 36; // https://www.wolframalpha.com/input/?i=(4+%2B+15+*+(x+%2F+36+)+**+0.25+%2B+(x+%2F+36)+%2F+5)+*+10

	    return Math.round((4 + 15 * Math.pow(constant, 0.25) + constant / 5) * 10);
	  }
	};

	// We need to centralize the zIndex definitions as they work
	// like global values in the browser.
	var zIndex = {
	  mobileStepper: 1000,
	  speedDial: 1050,
	  appBar: 1100,
	  drawer: 1200,
	  modal: 1300,
	  snackbar: 1400,
	  tooltip: 1500
	};
	var zIndex$1 = zIndex;

	function createTheme() {
	  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

	  var _options$breakpoints = options.breakpoints,
	      breakpointsInput = _options$breakpoints === void 0 ? {} : _options$breakpoints,
	      _options$mixins = options.mixins,
	      mixinsInput = _options$mixins === void 0 ? {} : _options$mixins,
	      _options$palette = options.palette,
	      paletteInput = _options$palette === void 0 ? {} : _options$palette,
	      spacingInput = options.spacing,
	      _options$typography = options.typography,
	      typographyInput = _options$typography === void 0 ? {} : _options$typography,
	      other = _objectWithoutProperties(options, ["breakpoints", "mixins", "palette", "spacing", "typography"]);

	  var palette = createPalette(paletteInput);
	  var breakpoints = createBreakpoints(breakpointsInput);
	  var spacing = createSpacing(spacingInput);
	  var muiTheme = deepmerge({
	    breakpoints: breakpoints,
	    direction: 'ltr',
	    mixins: createMixins(breakpoints, spacing, mixinsInput),
	    overrides: {},
	    // Inject custom styles
	    palette: palette,
	    props: {},
	    // Provide default props
	    shadows: shadows$1,
	    typography: createTypography(palette, typographyInput),
	    spacing: spacing,
	    shape: shape$1,
	    transitions: transitions,
	    zIndex: zIndex$1
	  }, other);

	  for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
	    args[_key - 1] = arguments[_key];
	  }

	  muiTheme = args.reduce(function (acc, argument) {
	    return deepmerge(acc, argument);
	  }, muiTheme);

	  return muiTheme;
	}

	var defaultTheme = createTheme();
	var defaultTheme$1 = defaultTheme;

	function withStyles(stylesOrCreator, options) {
	  return withStylesWithoutDefault(stylesOrCreator, _extends({
	    defaultTheme: defaultTheme$1
	  }, options));
	}

	const ourTheme = createTheme({
	  palette: {
	    type: 'light',
	    primary: {
	      // light: '#B76CED',
	      main: '#8E65C0',
	      // dark: '#252129',
	      contrastText: '#ffffff'
	    },
	    secondary: {
	      // light: '#0066ff',
	      main: '#00A9DE'
	      // dark: will be calculated from palette.secondary.main,
	      // contrastText: '#ffcc00',
	    },
	    text: {
	      primary: '#463850',
	      secondary: '#78717D'
	    }
	    // error: will use the default color
	  },
	  typography: {
	    fontSize: 16,
	    lineHeight: 1.7,
	    fontFamily: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'Oxygen-Sans', 'Ubuntu', 'Cantarell', '"Helvetica Neue"', 'sans-serif', '"Apple Color Emoji"', '"Segoe UI Emoji"', '"Segoe UI Symbol"'].join(',')
	  },
	  // These are only for reference throughout.
	  colors: {
	    dark: '#252129',
	    dark_light: '#473850',
	    accent_blue: '#00A9DE',
	    accent_purple: '#8E65C0',
	    accent_green: '#00CAB6',
	    white: '#ffffff',
	    grey: '#f1f1f1',
	    borders: '#dddddd',
	    borders_alt: '#ebebeb',
	    green: '#3BB371'
	  },
	  MuiButtonBase: {
	    disableRipple: true // No more ripple, on the whole application!
	  },
	  themeName: 'Pixelgrade Care Theme'
	});

	function _defineProperty$1(e, r, t) {
	  return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
	    value: t,
	    enumerable: !0,
	    configurable: !0,
	    writable: !0
	  }) : e[r] = t, e;
	}
	function _toPrimitive(t, r) {
	  if ("object" != typeof t || !t) return t;
	  var e = t[Symbol.toPrimitive];
	  if (void 0 !== e) {
	    var i = e.call(t, r || "default");
	    if ("object" != typeof i) return i;
	    throw new TypeError("@@toPrimitive must return a primitive value.");
	  }
	  return ("string" === r ? String : Number)(t);
	}
	function _toPropertyKey(t) {
	  var i = _toPrimitive(t, "string");
	  return "symbol" == typeof i ? i : i + "";
	}

	/**
	 * Checks if `value` is classified as an `Array` object.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an array, else `false`.
	 * @example
	 *
	 * _.isArray([1, 2, 3]);
	 * // => true
	 *
	 * _.isArray(document.body.children);
	 * // => false
	 *
	 * _.isArray('abc');
	 * // => false
	 *
	 * _.isArray(_.noop);
	 * // => false
	 */

	var isArray$j = Array.isArray;

	var isArray_1 = isArray$j;

	/** Detect free variable `global` from Node.js. */

	var freeGlobal$1 = typeof commonjsGlobal == 'object' && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;

	var _freeGlobal = freeGlobal$1;

	var freeGlobal = _freeGlobal;

	/** Detect free variable `self`. */
	var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

	/** Used as a reference to the global object. */
	var root$8 = freeGlobal || freeSelf || Function('return this')();

	var _root = root$8;

	var root$7 = _root;

	/** Built-in value references. */
	var Symbol$6 = root$7.Symbol;

	var _Symbol = Symbol$6;

	var Symbol$5 = _Symbol;

	/** Used for built-in method references. */
	var objectProto$c = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty$9 = objectProto$c.hasOwnProperty;

	/**
	 * Used to resolve the
	 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var nativeObjectToString$1 = objectProto$c.toString;

	/** Built-in value references. */
	var symToStringTag$1 = Symbol$5 ? Symbol$5.toStringTag : undefined;

	/**
	 * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
	 *
	 * @private
	 * @param {*} value The value to query.
	 * @returns {string} Returns the raw `toStringTag`.
	 */
	function getRawTag$1(value) {
	  var isOwn = hasOwnProperty$9.call(value, symToStringTag$1),
	      tag = value[symToStringTag$1];

	  try {
	    value[symToStringTag$1] = undefined;
	    var unmasked = true;
	  } catch (e) {}

	  var result = nativeObjectToString$1.call(value);
	  if (unmasked) {
	    if (isOwn) {
	      value[symToStringTag$1] = tag;
	    } else {
	      delete value[symToStringTag$1];
	    }
	  }
	  return result;
	}

	var _getRawTag = getRawTag$1;

	/** Used for built-in method references. */

	var objectProto$b = Object.prototype;

	/**
	 * Used to resolve the
	 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var nativeObjectToString = objectProto$b.toString;

	/**
	 * Converts `value` to a string using `Object.prototype.toString`.
	 *
	 * @private
	 * @param {*} value The value to convert.
	 * @returns {string} Returns the converted string.
	 */
	function objectToString$2(value) {
	  return nativeObjectToString.call(value);
	}

	var _objectToString = objectToString$2;

	var Symbol$4 = _Symbol,
	    getRawTag = _getRawTag,
	    objectToString$1 = _objectToString;

	/** `Object#toString` result references. */
	var nullTag = '[object Null]',
	    undefinedTag = '[object Undefined]';

	/** Built-in value references. */
	var symToStringTag = Symbol$4 ? Symbol$4.toStringTag : undefined;

	/**
	 * The base implementation of `getTag` without fallbacks for buggy environments.
	 *
	 * @private
	 * @param {*} value The value to query.
	 * @returns {string} Returns the `toStringTag`.
	 */
	function baseGetTag$6(value) {
	  if (value == null) {
	    return value === undefined ? undefinedTag : nullTag;
	  }
	  return (symToStringTag && symToStringTag in Object(value))
	    ? getRawTag(value)
	    : objectToString$1(value);
	}

	var _baseGetTag = baseGetTag$6;

	/**
	 * Checks if `value` is object-like. A value is object-like if it's not `null`
	 * and has a `typeof` result of "object".
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
	 * @example
	 *
	 * _.isObjectLike({});
	 * // => true
	 *
	 * _.isObjectLike([1, 2, 3]);
	 * // => true
	 *
	 * _.isObjectLike(_.noop);
	 * // => false
	 *
	 * _.isObjectLike(null);
	 * // => false
	 */

	function isObjectLike$6(value) {
	  return value != null && typeof value == 'object';
	}

	var isObjectLike_1 = isObjectLike$6;

	var baseGetTag$5 = _baseGetTag,
	    isObjectLike$5 = isObjectLike_1;

	/** `Object#toString` result references. */
	var symbolTag$1 = '[object Symbol]';

	/**
	 * Checks if `value` is classified as a `Symbol` primitive or object.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
	 * @example
	 *
	 * _.isSymbol(Symbol.iterator);
	 * // => true
	 *
	 * _.isSymbol('abc');
	 * // => false
	 */
	function isSymbol$6(value) {
	  return typeof value == 'symbol' ||
	    (isObjectLike$5(value) && baseGetTag$5(value) == symbolTag$1);
	}

	var isSymbol_1 = isSymbol$6;

	var isArray$i = isArray_1,
	    isSymbol$5 = isSymbol_1;

	/** Used to match property names within property paths. */
	var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,
	    reIsPlainProp = /^\w*$/;

	/**
	 * Checks if `value` is a property name and not a property path.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @param {Object} [object] The object to query keys on.
	 * @returns {boolean} Returns `true` if `value` is a property name, else `false`.
	 */
	function isKey$3(value, object) {
	  if (isArray$i(value)) {
	    return false;
	  }
	  var type = typeof value;
	  if (type == 'number' || type == 'symbol' || type == 'boolean' ||
	      value == null || isSymbol$5(value)) {
	    return true;
	  }
	  return reIsPlainProp.test(value) || !reIsDeepProp.test(value) ||
	    (object != null && value in Object(object));
	}

	var _isKey = isKey$3;

	/**
	 * Checks if `value` is the
	 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
	 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
	 * @example
	 *
	 * _.isObject({});
	 * // => true
	 *
	 * _.isObject([1, 2, 3]);
	 * // => true
	 *
	 * _.isObject(_.noop);
	 * // => true
	 *
	 * _.isObject(null);
	 * // => false
	 */

	function isObject$5(value) {
	  var type = typeof value;
	  return value != null && (type == 'object' || type == 'function');
	}

	var isObject_1 = isObject$5;

	var baseGetTag$4 = _baseGetTag,
	    isObject$4 = isObject_1;

	/** `Object#toString` result references. */
	var asyncTag = '[object AsyncFunction]',
	    funcTag$1 = '[object Function]',
	    genTag = '[object GeneratorFunction]',
	    proxyTag = '[object Proxy]';

	/**
	 * Checks if `value` is classified as a `Function` object.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
	 * @example
	 *
	 * _.isFunction(_);
	 * // => true
	 *
	 * _.isFunction(/abc/);
	 * // => false
	 */
	function isFunction$2(value) {
	  if (!isObject$4(value)) {
	    return false;
	  }
	  // The use of `Object#toString` avoids issues with the `typeof` operator
	  // in Safari 9 which returns 'object' for typed arrays and other constructors.
	  var tag = baseGetTag$4(value);
	  return tag == funcTag$1 || tag == genTag || tag == asyncTag || tag == proxyTag;
	}

	var isFunction_1 = isFunction$2;

	var root$6 = _root;

	/** Used to detect overreaching core-js shims. */
	var coreJsData$1 = root$6['__core-js_shared__'];

	var _coreJsData = coreJsData$1;

	var coreJsData = _coreJsData;

	/** Used to detect methods masquerading as native. */
	var maskSrcKey = (function() {
	  var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
	  return uid ? ('Symbol(src)_1.' + uid) : '';
	}());

	/**
	 * Checks if `func` has its source masked.
	 *
	 * @private
	 * @param {Function} func The function to check.
	 * @returns {boolean} Returns `true` if `func` is masked, else `false`.
	 */
	function isMasked$1(func) {
	  return !!maskSrcKey && (maskSrcKey in func);
	}

	var _isMasked = isMasked$1;

	/** Used for built-in method references. */

	var funcProto$1 = Function.prototype;

	/** Used to resolve the decompiled source of functions. */
	var funcToString$1 = funcProto$1.toString;

	/**
	 * Converts `func` to its source code.
	 *
	 * @private
	 * @param {Function} func The function to convert.
	 * @returns {string} Returns the source code.
	 */
	function toSource$2(func) {
	  if (func != null) {
	    try {
	      return funcToString$1.call(func);
	    } catch (e) {}
	    try {
	      return (func + '');
	    } catch (e) {}
	  }
	  return '';
	}

	var _toSource = toSource$2;

	var isFunction$1 = isFunction_1,
	    isMasked = _isMasked,
	    isObject$3 = isObject_1,
	    toSource$1 = _toSource;

	/**
	 * Used to match `RegExp`
	 * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
	 */
	var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

	/** Used to detect host constructors (Safari). */
	var reIsHostCtor = /^\[object .+?Constructor\]$/;

	/** Used for built-in method references. */
	var funcProto = Function.prototype,
	    objectProto$a = Object.prototype;

	/** Used to resolve the decompiled source of functions. */
	var funcToString = funcProto.toString;

	/** Used to check objects for own properties. */
	var hasOwnProperty$8 = objectProto$a.hasOwnProperty;

	/** Used to detect if a method is native. */
	var reIsNative = RegExp('^' +
	  funcToString.call(hasOwnProperty$8).replace(reRegExpChar, '\\$&')
	  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
	);

	/**
	 * The base implementation of `_.isNative` without bad shim checks.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a native function,
	 *  else `false`.
	 */
	function baseIsNative$1(value) {
	  if (!isObject$3(value) || isMasked(value)) {
	    return false;
	  }
	  var pattern = isFunction$1(value) ? reIsNative : reIsHostCtor;
	  return pattern.test(toSource$1(value));
	}

	var _baseIsNative = baseIsNative$1;

	/**
	 * Gets the value at `key` of `object`.
	 *
	 * @private
	 * @param {Object} [object] The object to query.
	 * @param {string} key The key of the property to get.
	 * @returns {*} Returns the property value.
	 */

	function getValue$1(object, key) {
	  return object == null ? undefined : object[key];
	}

	var _getValue = getValue$1;

	var baseIsNative = _baseIsNative,
	    getValue = _getValue;

	/**
	 * Gets the native function at `key` of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {string} key The key of the method to get.
	 * @returns {*} Returns the function if it's native, else `undefined`.
	 */
	function getNative$7(object, key) {
	  var value = getValue(object, key);
	  return baseIsNative(value) ? value : undefined;
	}

	var _getNative = getNative$7;

	var getNative$6 = _getNative;

	/* Built-in method references that are verified to be native. */
	var nativeCreate$4 = getNative$6(Object, 'create');

	var _nativeCreate = nativeCreate$4;

	var nativeCreate$3 = _nativeCreate;

	/**
	 * Removes all key-value entries from the hash.
	 *
	 * @private
	 * @name clear
	 * @memberOf Hash
	 */
	function hashClear$1() {
	  this.__data__ = nativeCreate$3 ? nativeCreate$3(null) : {};
	  this.size = 0;
	}

	var _hashClear = hashClear$1;

	/**
	 * Removes `key` and its value from the hash.
	 *
	 * @private
	 * @name delete
	 * @memberOf Hash
	 * @param {Object} hash The hash to modify.
	 * @param {string} key The key of the value to remove.
	 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
	 */

	function hashDelete$1(key) {
	  var result = this.has(key) && delete this.__data__[key];
	  this.size -= result ? 1 : 0;
	  return result;
	}

	var _hashDelete = hashDelete$1;

	var nativeCreate$2 = _nativeCreate;

	/** Used to stand-in for `undefined` hash values. */
	var HASH_UNDEFINED$2 = '__lodash_hash_undefined__';

	/** Used for built-in method references. */
	var objectProto$9 = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty$7 = objectProto$9.hasOwnProperty;

	/**
	 * Gets the hash value for `key`.
	 *
	 * @private
	 * @name get
	 * @memberOf Hash
	 * @param {string} key The key of the value to get.
	 * @returns {*} Returns the entry value.
	 */
	function hashGet$1(key) {
	  var data = this.__data__;
	  if (nativeCreate$2) {
	    var result = data[key];
	    return result === HASH_UNDEFINED$2 ? undefined : result;
	  }
	  return hasOwnProperty$7.call(data, key) ? data[key] : undefined;
	}

	var _hashGet = hashGet$1;

	var nativeCreate$1 = _nativeCreate;

	/** Used for built-in method references. */
	var objectProto$8 = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty$6 = objectProto$8.hasOwnProperty;

	/**
	 * Checks if a hash value for `key` exists.
	 *
	 * @private
	 * @name has
	 * @memberOf Hash
	 * @param {string} key The key of the entry to check.
	 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	 */
	function hashHas$1(key) {
	  var data = this.__data__;
	  return nativeCreate$1 ? (data[key] !== undefined) : hasOwnProperty$6.call(data, key);
	}

	var _hashHas = hashHas$1;

	var nativeCreate = _nativeCreate;

	/** Used to stand-in for `undefined` hash values. */
	var HASH_UNDEFINED$1 = '__lodash_hash_undefined__';

	/**
	 * Sets the hash `key` to `value`.
	 *
	 * @private
	 * @name set
	 * @memberOf Hash
	 * @param {string} key The key of the value to set.
	 * @param {*} value The value to set.
	 * @returns {Object} Returns the hash instance.
	 */
	function hashSet$1(key, value) {
	  var data = this.__data__;
	  this.size += this.has(key) ? 0 : 1;
	  data[key] = (nativeCreate && value === undefined) ? HASH_UNDEFINED$1 : value;
	  return this;
	}

	var _hashSet = hashSet$1;

	var hashClear = _hashClear,
	    hashDelete = _hashDelete,
	    hashGet = _hashGet,
	    hashHas = _hashHas,
	    hashSet = _hashSet;

	/**
	 * Creates a hash object.
	 *
	 * @private
	 * @constructor
	 * @param {Array} [entries] The key-value pairs to cache.
	 */
	function Hash$1(entries) {
	  var index = -1,
	      length = entries == null ? 0 : entries.length;

	  this.clear();
	  while (++index < length) {
	    var entry = entries[index];
	    this.set(entry[0], entry[1]);
	  }
	}

	// Add methods to `Hash`.
	Hash$1.prototype.clear = hashClear;
	Hash$1.prototype['delete'] = hashDelete;
	Hash$1.prototype.get = hashGet;
	Hash$1.prototype.has = hashHas;
	Hash$1.prototype.set = hashSet;

	var _Hash = Hash$1;

	/**
	 * Removes all key-value entries from the list cache.
	 *
	 * @private
	 * @name clear
	 * @memberOf ListCache
	 */

	function listCacheClear$1() {
	  this.__data__ = [];
	  this.size = 0;
	}

	var _listCacheClear = listCacheClear$1;

	/**
	 * Performs a
	 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
	 * comparison between two values to determine if they are equivalent.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to compare.
	 * @param {*} other The other value to compare.
	 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
	 * @example
	 *
	 * var object = { 'a': 1 };
	 * var other = { 'a': 1 };
	 *
	 * _.eq(object, object);
	 * // => true
	 *
	 * _.eq(object, other);
	 * // => false
	 *
	 * _.eq('a', 'a');
	 * // => true
	 *
	 * _.eq('a', Object('a'));
	 * // => false
	 *
	 * _.eq(NaN, NaN);
	 * // => true
	 */

	function eq$3(value, other) {
	  return value === other || (value !== value && other !== other);
	}

	var eq_1 = eq$3;

	var eq$2 = eq_1;

	/**
	 * Gets the index at which the `key` is found in `array` of key-value pairs.
	 *
	 * @private
	 * @param {Array} array The array to inspect.
	 * @param {*} key The key to search for.
	 * @returns {number} Returns the index of the matched value, else `-1`.
	 */
	function assocIndexOf$4(array, key) {
	  var length = array.length;
	  while (length--) {
	    if (eq$2(array[length][0], key)) {
	      return length;
	    }
	  }
	  return -1;
	}

	var _assocIndexOf = assocIndexOf$4;

	var assocIndexOf$3 = _assocIndexOf;

	/** Used for built-in method references. */
	var arrayProto$1 = Array.prototype;

	/** Built-in value references. */
	var splice = arrayProto$1.splice;

	/**
	 * Removes `key` and its value from the list cache.
	 *
	 * @private
	 * @name delete
	 * @memberOf ListCache
	 * @param {string} key The key of the value to remove.
	 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
	 */
	function listCacheDelete$1(key) {
	  var data = this.__data__,
	      index = assocIndexOf$3(data, key);

	  if (index < 0) {
	    return false;
	  }
	  var lastIndex = data.length - 1;
	  if (index == lastIndex) {
	    data.pop();
	  } else {
	    splice.call(data, index, 1);
	  }
	  --this.size;
	  return true;
	}

	var _listCacheDelete = listCacheDelete$1;

	var assocIndexOf$2 = _assocIndexOf;

	/**
	 * Gets the list cache value for `key`.
	 *
	 * @private
	 * @name get
	 * @memberOf ListCache
	 * @param {string} key The key of the value to get.
	 * @returns {*} Returns the entry value.
	 */
	function listCacheGet$1(key) {
	  var data = this.__data__,
	      index = assocIndexOf$2(data, key);

	  return index < 0 ? undefined : data[index][1];
	}

	var _listCacheGet = listCacheGet$1;

	var assocIndexOf$1 = _assocIndexOf;

	/**
	 * Checks if a list cache value for `key` exists.
	 *
	 * @private
	 * @name has
	 * @memberOf ListCache
	 * @param {string} key The key of the entry to check.
	 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	 */
	function listCacheHas$1(key) {
	  return assocIndexOf$1(this.__data__, key) > -1;
	}

	var _listCacheHas = listCacheHas$1;

	var assocIndexOf = _assocIndexOf;

	/**
	 * Sets the list cache `key` to `value`.
	 *
	 * @private
	 * @name set
	 * @memberOf ListCache
	 * @param {string} key The key of the value to set.
	 * @param {*} value The value to set.
	 * @returns {Object} Returns the list cache instance.
	 */
	function listCacheSet$1(key, value) {
	  var data = this.__data__,
	      index = assocIndexOf(data, key);

	  if (index < 0) {
	    ++this.size;
	    data.push([key, value]);
	  } else {
	    data[index][1] = value;
	  }
	  return this;
	}

	var _listCacheSet = listCacheSet$1;

	var listCacheClear = _listCacheClear,
	    listCacheDelete = _listCacheDelete,
	    listCacheGet = _listCacheGet,
	    listCacheHas = _listCacheHas,
	    listCacheSet = _listCacheSet;

	/**
	 * Creates an list cache object.
	 *
	 * @private
	 * @constructor
	 * @param {Array} [entries] The key-value pairs to cache.
	 */
	function ListCache$4(entries) {
	  var index = -1,
	      length = entries == null ? 0 : entries.length;

	  this.clear();
	  while (++index < length) {
	    var entry = entries[index];
	    this.set(entry[0], entry[1]);
	  }
	}

	// Add methods to `ListCache`.
	ListCache$4.prototype.clear = listCacheClear;
	ListCache$4.prototype['delete'] = listCacheDelete;
	ListCache$4.prototype.get = listCacheGet;
	ListCache$4.prototype.has = listCacheHas;
	ListCache$4.prototype.set = listCacheSet;

	var _ListCache = ListCache$4;

	var getNative$5 = _getNative,
	    root$5 = _root;

	/* Built-in method references that are verified to be native. */
	var Map$4 = getNative$5(root$5, 'Map');

	var _Map = Map$4;

	var Hash = _Hash,
	    ListCache$3 = _ListCache,
	    Map$3 = _Map;

	/**
	 * Removes all key-value entries from the map.
	 *
	 * @private
	 * @name clear
	 * @memberOf MapCache
	 */
	function mapCacheClear$1() {
	  this.size = 0;
	  this.__data__ = {
	    'hash': new Hash,
	    'map': new (Map$3 || ListCache$3),
	    'string': new Hash
	  };
	}

	var _mapCacheClear = mapCacheClear$1;

	/**
	 * Checks if `value` is suitable for use as unique object key.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
	 */

	function isKeyable$1(value) {
	  var type = typeof value;
	  return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
	    ? (value !== '__proto__')
	    : (value === null);
	}

	var _isKeyable = isKeyable$1;

	var isKeyable = _isKeyable;

	/**
	 * Gets the data for `map`.
	 *
	 * @private
	 * @param {Object} map The map to query.
	 * @param {string} key The reference key.
	 * @returns {*} Returns the map data.
	 */
	function getMapData$4(map, key) {
	  var data = map.__data__;
	  return isKeyable(key)
	    ? data[typeof key == 'string' ? 'string' : 'hash']
	    : data.map;
	}

	var _getMapData = getMapData$4;

	var getMapData$3 = _getMapData;

	/**
	 * Removes `key` and its value from the map.
	 *
	 * @private
	 * @name delete
	 * @memberOf MapCache
	 * @param {string} key The key of the value to remove.
	 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
	 */
	function mapCacheDelete$1(key) {
	  var result = getMapData$3(this, key)['delete'](key);
	  this.size -= result ? 1 : 0;
	  return result;
	}

	var _mapCacheDelete = mapCacheDelete$1;

	var getMapData$2 = _getMapData;

	/**
	 * Gets the map value for `key`.
	 *
	 * @private
	 * @name get
	 * @memberOf MapCache
	 * @param {string} key The key of the value to get.
	 * @returns {*} Returns the entry value.
	 */
	function mapCacheGet$1(key) {
	  return getMapData$2(this, key).get(key);
	}

	var _mapCacheGet = mapCacheGet$1;

	var getMapData$1 = _getMapData;

	/**
	 * Checks if a map value for `key` exists.
	 *
	 * @private
	 * @name has
	 * @memberOf MapCache
	 * @param {string} key The key of the entry to check.
	 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	 */
	function mapCacheHas$1(key) {
	  return getMapData$1(this, key).has(key);
	}

	var _mapCacheHas = mapCacheHas$1;

	var getMapData = _getMapData;

	/**
	 * Sets the map `key` to `value`.
	 *
	 * @private
	 * @name set
	 * @memberOf MapCache
	 * @param {string} key The key of the value to set.
	 * @param {*} value The value to set.
	 * @returns {Object} Returns the map cache instance.
	 */
	function mapCacheSet$1(key, value) {
	  var data = getMapData(this, key),
	      size = data.size;

	  data.set(key, value);
	  this.size += data.size == size ? 0 : 1;
	  return this;
	}

	var _mapCacheSet = mapCacheSet$1;

	var mapCacheClear = _mapCacheClear,
	    mapCacheDelete = _mapCacheDelete,
	    mapCacheGet = _mapCacheGet,
	    mapCacheHas = _mapCacheHas,
	    mapCacheSet = _mapCacheSet;

	/**
	 * Creates a map cache object to store key-value pairs.
	 *
	 * @private
	 * @constructor
	 * @param {Array} [entries] The key-value pairs to cache.
	 */
	function MapCache$3(entries) {
	  var index = -1,
	      length = entries == null ? 0 : entries.length;

	  this.clear();
	  while (++index < length) {
	    var entry = entries[index];
	    this.set(entry[0], entry[1]);
	  }
	}

	// Add methods to `MapCache`.
	MapCache$3.prototype.clear = mapCacheClear;
	MapCache$3.prototype['delete'] = mapCacheDelete;
	MapCache$3.prototype.get = mapCacheGet;
	MapCache$3.prototype.has = mapCacheHas;
	MapCache$3.prototype.set = mapCacheSet;

	var _MapCache = MapCache$3;

	var MapCache$2 = _MapCache;

	/** Error message constants. */
	var FUNC_ERROR_TEXT = 'Expected a function';

	/**
	 * Creates a function that memoizes the result of `func`. If `resolver` is
	 * provided, it determines the cache key for storing the result based on the
	 * arguments provided to the memoized function. By default, the first argument
	 * provided to the memoized function is used as the map cache key. The `func`
	 * is invoked with the `this` binding of the memoized function.
	 *
	 * **Note:** The cache is exposed as the `cache` property on the memoized
	 * function. Its creation may be customized by replacing the `_.memoize.Cache`
	 * constructor with one whose instances implement the
	 * [`Map`](http://ecma-international.org/ecma-262/7.0/#sec-properties-of-the-map-prototype-object)
	 * method interface of `clear`, `delete`, `get`, `has`, and `set`.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Function
	 * @param {Function} func The function to have its output memoized.
	 * @param {Function} [resolver] The function to resolve the cache key.
	 * @returns {Function} Returns the new memoized function.
	 * @example
	 *
	 * var object = { 'a': 1, 'b': 2 };
	 * var other = { 'c': 3, 'd': 4 };
	 *
	 * var values = _.memoize(_.values);
	 * values(object);
	 * // => [1, 2]
	 *
	 * values(other);
	 * // => [3, 4]
	 *
	 * object.a = 2;
	 * values(object);
	 * // => [1, 2]
	 *
	 * // Modify the result cache.
	 * values.cache.set(object, ['a', 'b']);
	 * values(object);
	 * // => ['a', 'b']
	 *
	 * // Replace `_.memoize.Cache`.
	 * _.memoize.Cache = WeakMap;
	 */
	function memoize$1(func, resolver) {
	  if (typeof func != 'function' || (resolver != null && typeof resolver != 'function')) {
	    throw new TypeError(FUNC_ERROR_TEXT);
	  }
	  var memoized = function() {
	    var args = arguments,
	        key = resolver ? resolver.apply(this, args) : args[0],
	        cache = memoized.cache;

	    if (cache.has(key)) {
	      return cache.get(key);
	    }
	    var result = func.apply(this, args);
	    memoized.cache = cache.set(key, result) || cache;
	    return result;
	  };
	  memoized.cache = new (memoize$1.Cache || MapCache$2);
	  return memoized;
	}

	// Expose `MapCache`.
	memoize$1.Cache = MapCache$2;

	var memoize_1 = memoize$1;

	var memoize = memoize_1;

	/** Used as the maximum memoize cache size. */
	var MAX_MEMOIZE_SIZE = 500;

	/**
	 * A specialized version of `_.memoize` which clears the memoized function's
	 * cache when it exceeds `MAX_MEMOIZE_SIZE`.
	 *
	 * @private
	 * @param {Function} func The function to have its output memoized.
	 * @returns {Function} Returns the new memoized function.
	 */
	function memoizeCapped$1(func) {
	  var result = memoize(func, function(key) {
	    if (cache.size === MAX_MEMOIZE_SIZE) {
	      cache.clear();
	    }
	    return key;
	  });

	  var cache = result.cache;
	  return result;
	}

	var _memoizeCapped = memoizeCapped$1;

	var memoizeCapped = _memoizeCapped;

	/** Used to match property names within property paths. */
	var rePropName$1 = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;

	/** Used to match backslashes in property paths. */
	var reEscapeChar$1 = /\\(\\)?/g;

	/**
	 * Converts `string` to a property path array.
	 *
	 * @private
	 * @param {string} string The string to convert.
	 * @returns {Array} Returns the property path array.
	 */
	var stringToPath$2 = memoizeCapped(function(string) {
	  var result = [];
	  if (string.charCodeAt(0) === 46 /* . */) {
	    result.push('');
	  }
	  string.replace(rePropName$1, function(match, number, quote, subString) {
	    result.push(quote ? subString.replace(reEscapeChar$1, '$1') : (number || match));
	  });
	  return result;
	});

	var _stringToPath = stringToPath$2;

	/**
	 * A specialized version of `_.map` for arrays without support for iteratee
	 * shorthands.
	 *
	 * @private
	 * @param {Array} [array] The array to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @returns {Array} Returns the new mapped array.
	 */

	function arrayMap$3(array, iteratee) {
	  var index = -1,
	      length = array == null ? 0 : array.length,
	      result = Array(length);

	  while (++index < length) {
	    result[index] = iteratee(array[index], index, array);
	  }
	  return result;
	}

	var _arrayMap = arrayMap$3;

	var Symbol$3 = _Symbol,
	    arrayMap$2 = _arrayMap,
	    isArray$h = isArray_1,
	    isSymbol$4 = isSymbol_1;

	/** Used as references for various `Number` constants. */
	var INFINITY$2 = 1 / 0;

	/** Used to convert symbols to primitives and strings. */
	var symbolProto$1 = Symbol$3 ? Symbol$3.prototype : undefined,
	    symbolToString = symbolProto$1 ? symbolProto$1.toString : undefined;

	/**
	 * The base implementation of `_.toString` which doesn't convert nullish
	 * values to empty strings.
	 *
	 * @private
	 * @param {*} value The value to process.
	 * @returns {string} Returns the string.
	 */
	function baseToString$1(value) {
	  // Exit early for strings to avoid a performance hit in some environments.
	  if (typeof value == 'string') {
	    return value;
	  }
	  if (isArray$h(value)) {
	    // Recursively convert values (susceptible to call stack limits).
	    return arrayMap$2(value, baseToString$1) + '';
	  }
	  if (isSymbol$4(value)) {
	    return symbolToString ? symbolToString.call(value) : '';
	  }
	  var result = (value + '');
	  return (result == '0' && (1 / value) == -INFINITY$2) ? '-0' : result;
	}

	var _baseToString = baseToString$1;

	var baseToString = _baseToString;

	/**
	 * Converts `value` to a string. An empty string is returned for `null`
	 * and `undefined` values. The sign of `-0` is preserved.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to convert.
	 * @returns {string} Returns the converted string.
	 * @example
	 *
	 * _.toString(null);
	 * // => ''
	 *
	 * _.toString(-0);
	 * // => '-0'
	 *
	 * _.toString([1, 2, 3]);
	 * // => '1,2,3'
	 */
	function toString$1(value) {
	  return value == null ? '' : baseToString(value);
	}

	var toString_1 = toString$1;

	var isArray$g = isArray_1,
	    isKey$2 = _isKey,
	    stringToPath$1 = _stringToPath,
	    toString = toString_1;

	/**
	 * Casts `value` to a path array if it's not one.
	 *
	 * @private
	 * @param {*} value The value to inspect.
	 * @param {Object} [object] The object to query keys on.
	 * @returns {Array} Returns the cast property path array.
	 */
	function castPath$2(value, object) {
	  if (isArray$g(value)) {
	    return value;
	  }
	  return isKey$2(value, object) ? [value] : stringToPath$1(toString(value));
	}

	var _castPath = castPath$2;

	var isSymbol$3 = isSymbol_1;

	/** Used as references for various `Number` constants. */
	var INFINITY$1 = 1 / 0;

	/**
	 * Converts `value` to a string key if it's not a string or symbol.
	 *
	 * @private
	 * @param {*} value The value to inspect.
	 * @returns {string|symbol} Returns the key.
	 */
	function toKey$4(value) {
	  if (typeof value == 'string' || isSymbol$3(value)) {
	    return value;
	  }
	  var result = (value + '');
	  return (result == '0' && (1 / value) == -INFINITY$1) ? '-0' : result;
	}

	var _toKey = toKey$4;

	var castPath$1 = _castPath,
	    toKey$3 = _toKey;

	/**
	 * The base implementation of `_.get` without support for default values.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {Array|string} path The path of the property to get.
	 * @returns {*} Returns the resolved value.
	 */
	function baseGet$3(object, path) {
	  path = castPath$1(path, object);

	  var index = 0,
	      length = path.length;

	  while (object != null && index < length) {
	    object = object[toKey$3(path[index++])];
	  }
	  return (index && index == length) ? object : undefined;
	}

	var _baseGet = baseGet$3;

	var baseGet$2 = _baseGet;

	/**
	 * Gets the value at `path` of `object`. If the resolved value is
	 * `undefined`, the `defaultValue` is returned in its place.
	 *
	 * @static
	 * @memberOf _
	 * @since 3.7.0
	 * @category Object
	 * @param {Object} object The object to query.
	 * @param {Array|string} path The path of the property to get.
	 * @param {*} [defaultValue] The value returned for `undefined` resolved values.
	 * @returns {*} Returns the resolved value.
	 * @example
	 *
	 * var object = { 'a': [{ 'b': { 'c': 3 } }] };
	 *
	 * _.get(object, 'a[0].b.c');
	 * // => 3
	 *
	 * _.get(object, ['a', '0', 'b', 'c']);
	 * // => 3
	 *
	 * _.get(object, 'a.b.c', 'default');
	 * // => 'default'
	 */
	function get$2(object, path, defaultValue) {
	  var result = object == null ? undefined : baseGet$2(object, path);
	  return result === undefined ? defaultValue : result;
	}

	var get_1 = get$2;

	/**
	 * Checks if `value` is `undefined`.
	 *
	 * @static
	 * @since 0.1.0
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is `undefined`, else `false`.
	 * @example
	 *
	 * _.isUndefined(void 0);
	 * // => true
	 *
	 * _.isUndefined(null);
	 * // => false
	 */

	function isUndefined(value) {
	  return value === undefined;
	}

	var isUndefined_1 = isUndefined;

	/**
	 * Adapted from React: https://github.com/facebook/react/blob/master/packages/shared/formatProdErrorMessage.js
	 *
	 * Do not require this module directly! Use normal throw error calls. These messages will be replaced with error codes
	 * during build.
	 * @param {number} code
	 */
	function formatProdErrorMessage(code) {
	  return "Minified Redux error #" + code + "; visit https://redux.js.org/Errors?code=" + code + " for the full message or " + 'use the non-minified dev environment for full errors. ';
	}

	// Inlined version of the `symbol-observable` polyfill
	var $$observable = (function () {
	  return typeof Symbol === 'function' && Symbol.observable || '@@observable';
	})();

	/**
	 * These are private action types reserved by Redux.
	 * For any unknown actions, you must return the current state.
	 * If the current state is undefined, you must return the initial state.
	 * Do not reference these action types directly in your code.
	 */
	var randomString = function randomString() {
	  return Math.random().toString(36).substring(7).split('').join('.');
	};

	var ActionTypes = {
	  INIT: "@@redux/INIT" + randomString(),
	  REPLACE: "@@redux/REPLACE" + randomString(),
	  PROBE_UNKNOWN_ACTION: function PROBE_UNKNOWN_ACTION() {
	    return "@@redux/PROBE_UNKNOWN_ACTION" + randomString();
	  }
	};

	/**
	 * @param {any} obj The object to inspect.
	 * @returns {boolean} True if the argument appears to be a plain object.
	 */
	function isPlainObject(obj) {
	  if (typeof obj !== 'object' || obj === null) return false;
	  var proto = obj;

	  while (Object.getPrototypeOf(proto) !== null) {
	    proto = Object.getPrototypeOf(proto);
	  }

	  return Object.getPrototypeOf(obj) === proto;
	}

	/**
	 * @deprecated
	 *
	 * **We recommend using the `configureStore` method
	 * of the `@reduxjs/toolkit` package**, which replaces `createStore`.
	 *
	 * Redux Toolkit is our recommended approach for writing Redux logic today,
	 * including store setup, reducers, data fetching, and more.
	 *
	 * **For more details, please read this Redux docs page:**
	 * **https://redux.js.org/introduction/why-rtk-is-redux-today**
	 *
	 * `configureStore` from Redux Toolkit is an improved version of `createStore` that
	 * simplifies setup and helps avoid common bugs.
	 *
	 * You should not be using the `redux` core package by itself today, except for learning purposes.
	 * The `createStore` method from the core `redux` package will not be removed, but we encourage
	 * all users to migrate to using Redux Toolkit for all Redux code.
	 *
	 * If you want to use `createStore` without this visual deprecation warning, use
	 * the `legacy_createStore` import instead:
	 *
	 * `import { legacy_createStore as createStore} from 'redux'`
	 *
	 */

	function createStore(reducer, preloadedState, enhancer) {
	  var _ref2;

	  if (typeof preloadedState === 'function' && typeof enhancer === 'function' || typeof enhancer === 'function' && typeof arguments[3] === 'function') {
	    throw new Error(formatProdErrorMessage(0) );
	  }

	  if (typeof preloadedState === 'function' && typeof enhancer === 'undefined') {
	    enhancer = preloadedState;
	    preloadedState = undefined;
	  }

	  if (typeof enhancer !== 'undefined') {
	    if (typeof enhancer !== 'function') {
	      throw new Error(formatProdErrorMessage(1) );
	    }

	    return enhancer(createStore)(reducer, preloadedState);
	  }

	  if (typeof reducer !== 'function') {
	    throw new Error(formatProdErrorMessage(2) );
	  }

	  var currentReducer = reducer;
	  var currentState = preloadedState;
	  var currentListeners = [];
	  var nextListeners = currentListeners;
	  var isDispatching = false;
	  /**
	   * This makes a shallow copy of currentListeners so we can use
	   * nextListeners as a temporary list while dispatching.
	   *
	   * This prevents any bugs around consumers calling
	   * subscribe/unsubscribe in the middle of a dispatch.
	   */

	  function ensureCanMutateNextListeners() {
	    if (nextListeners === currentListeners) {
	      nextListeners = currentListeners.slice();
	    }
	  }
	  /**
	   * Reads the state tree managed by the store.
	   *
	   * @returns {any} The current state tree of your application.
	   */


	  function getState() {
	    if (isDispatching) {
	      throw new Error(formatProdErrorMessage(3) );
	    }

	    return currentState;
	  }
	  /**
	   * Adds a change listener. It will be called any time an action is dispatched,
	   * and some part of the state tree may potentially have changed. You may then
	   * call `getState()` to read the current state tree inside the callback.
	   *
	   * You may call `dispatch()` from a change listener, with the following
	   * caveats:
	   *
	   * 1. The subscriptions are snapshotted just before every `dispatch()` call.
	   * If you subscribe or unsubscribe while the listeners are being invoked, this
	   * will not have any effect on the `dispatch()` that is currently in progress.
	   * However, the next `dispatch()` call, whether nested or not, will use a more
	   * recent snapshot of the subscription list.
	   *
	   * 2. The listener should not expect to see all state changes, as the state
	   * might have been updated multiple times during a nested `dispatch()` before
	   * the listener is called. It is, however, guaranteed that all subscribers
	   * registered before the `dispatch()` started will be called with the latest
	   * state by the time it exits.
	   *
	   * @param {Function} listener A callback to be invoked on every dispatch.
	   * @returns {Function} A function to remove this change listener.
	   */


	  function subscribe(listener) {
	    if (typeof listener !== 'function') {
	      throw new Error(formatProdErrorMessage(4) );
	    }

	    if (isDispatching) {
	      throw new Error(formatProdErrorMessage(5) );
	    }

	    var isSubscribed = true;
	    ensureCanMutateNextListeners();
	    nextListeners.push(listener);
	    return function unsubscribe() {
	      if (!isSubscribed) {
	        return;
	      }

	      if (isDispatching) {
	        throw new Error(formatProdErrorMessage(6) );
	      }

	      isSubscribed = false;
	      ensureCanMutateNextListeners();
	      var index = nextListeners.indexOf(listener);
	      nextListeners.splice(index, 1);
	      currentListeners = null;
	    };
	  }
	  /**
	   * Dispatches an action. It is the only way to trigger a state change.
	   *
	   * The `reducer` function, used to create the store, will be called with the
	   * current state tree and the given `action`. Its return value will
	   * be considered the **next** state of the tree, and the change listeners
	   * will be notified.
	   *
	   * The base implementation only supports plain object actions. If you want to
	   * dispatch a Promise, an Observable, a thunk, or something else, you need to
	   * wrap your store creating function into the corresponding middleware. For
	   * example, see the documentation for the `redux-thunk` package. Even the
	   * middleware will eventually dispatch plain object actions using this method.
	   *
	   * @param {Object} action A plain object representing “what changed”. It is
	   * a good idea to keep actions serializable so you can record and replay user
	   * sessions, or use the time travelling `redux-devtools`. An action must have
	   * a `type` property which may not be `undefined`. It is a good idea to use
	   * string constants for action types.
	   *
	   * @returns {Object} For convenience, the same action object you dispatched.
	   *
	   * Note that, if you use a custom middleware, it may wrap `dispatch()` to
	   * return something else (for example, a Promise you can await).
	   */


	  function dispatch(action) {
	    if (!isPlainObject(action)) {
	      throw new Error(formatProdErrorMessage(7) );
	    }

	    if (typeof action.type === 'undefined') {
	      throw new Error(formatProdErrorMessage(8) );
	    }

	    if (isDispatching) {
	      throw new Error(formatProdErrorMessage(9) );
	    }

	    try {
	      isDispatching = true;
	      currentState = currentReducer(currentState, action);
	    } finally {
	      isDispatching = false;
	    }

	    var listeners = currentListeners = nextListeners;

	    for (var i = 0; i < listeners.length; i++) {
	      var listener = listeners[i];
	      listener();
	    }

	    return action;
	  }
	  /**
	   * Replaces the reducer currently used by the store to calculate the state.
	   *
	   * You might need this if your app implements code splitting and you want to
	   * load some of the reducers dynamically. You might also need this if you
	   * implement a hot reloading mechanism for Redux.
	   *
	   * @param {Function} nextReducer The reducer for the store to use instead.
	   * @returns {void}
	   */


	  function replaceReducer(nextReducer) {
	    if (typeof nextReducer !== 'function') {
	      throw new Error(formatProdErrorMessage(10) );
	    }

	    currentReducer = nextReducer; // This action has a similiar effect to ActionTypes.INIT.
	    // Any reducers that existed in both the new and old rootReducer
	    // will receive the previous state. This effectively populates
	    // the new state tree with any relevant data from the old one.

	    dispatch({
	      type: ActionTypes.REPLACE
	    });
	  }
	  /**
	   * Interoperability point for observable/reactive libraries.
	   * @returns {observable} A minimal observable of state changes.
	   * For more information, see the observable proposal:
	   * https://github.com/tc39/proposal-observable
	   */


	  function observable() {
	    var _ref;

	    var outerSubscribe = subscribe;
	    return _ref = {
	      /**
	       * The minimal observable subscription method.
	       * @param {Object} observer Any object that can be used as an observer.
	       * The observer object should have a `next` method.
	       * @returns {subscription} An object with an `unsubscribe` method that can
	       * be used to unsubscribe the observable from the store, and prevent further
	       * emission of values from the observable.
	       */
	      subscribe: function subscribe(observer) {
	        if (typeof observer !== 'object' || observer === null) {
	          throw new Error(formatProdErrorMessage(11) );
	        }

	        function observeState() {
	          if (observer.next) {
	            observer.next(getState());
	          }
	        }

	        observeState();
	        var unsubscribe = outerSubscribe(observeState);
	        return {
	          unsubscribe: unsubscribe
	        };
	      }
	    }, _ref[$$observable] = function () {
	      return this;
	    }, _ref;
	  } // When a store is created, an "INIT" action is dispatched so that every
	  // reducer returns their initial state. This effectively populates
	  // the initial state tree.


	  dispatch({
	    type: ActionTypes.INIT
	  });
	  return _ref2 = {
	    dispatch: dispatch,
	    subscribe: subscribe,
	    getState: getState,
	    replaceReducer: replaceReducer
	  }, _ref2[$$observable] = observable, _ref2;
	}

	// Initiate the default state
	const getDefaultState = () => {
	  let state = {
	    is_logged: false,
	    has_license: false,
	    is_active: false,
	    is_expired: false,
	    is_wizard_next: true,
	    is_wizard_skip: true,
	    is_support_active: false,
	    is_pixelgrade_theme: false,
	    is_next_button_disabled: false,
	    hasOriginalDirName: false,
	    hasOriginalStyleName: false,
	    hasPxgTheme: get_1(pixassist, 'themeSupports.hasPxgTheme', false),
	    // this means that there is a Pixelgrade theme installed, not necessarily active
	    themeName: get_1(pixassist, 'themeSupports.theme_name', 'pixelgrade'),
	    themeTitle: get_1(pixassist, 'themeSupports.theme_title', 'pixelgrade'),
	    themeId: get_1(pixassist, 'themeSupports.theme_id', ''),
	    themeType: get_1(pixassist, 'themeSupports.theme_type', 'theme')
	  };
	  state.hasOriginalDirName = get_1(pixassist, 'themeSupports.theme_integrity.has_original_directory', false);
	  state.hasOriginalStyleName = get_1(pixassist, 'themeSupports.theme_integrity.has_original_name', false);
	  if (!isUndefined_1(pixassist.themeSupports.original_slug)) {
	    state.originalSlug = pixassist.themeSupports.original_slug;
	  }

	  // Account connection is owned by Pixelgrade Plus (M2 R4); Assistant never reports a connected account.
	  state.is_logged = false;

	  // The setup wizard must never require a Pixelgrade account to proceed; the Connect step is optional.
	  state.is_wizard_next = true;

	  // License & entitlement are owned by Pixelgrade Plus (M2 R3); Assistant never reports a license.
	  state.has_license = false;
	  if (!isUndefined_1(pixassist.themeMod.licenseType)) {
	    state.license_type = pixassist.themeMod.licenseType;
	  }
	  if (!!get_1(pixassist, 'themeMod.licenseExpiryDate', '')) {
	    let mlist = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
	    let expiry_date = new Date(pixassist.themeMod.licenseExpiryDate);
	    state.license_expiry = mlist[expiry_date.getMonth()] + ' ' + expiry_date.getDate() + ', ' + expiry_date.getFullYear();
	  }
	  state.is_active = false; // Active-license/entitlement state is owned by Pixelgrade Plus (M2 R3).

	  // if the user already has the oauth tokens, get them
	  if (!isUndefined_1(pixassist.user)) {
	    state.user = pixassist.user;
	  }

	  // if the user already has the oauth tokens, get them
	  if (!isUndefined_1(pixassist.themeMod)) {
	    state.themeMod = pixassist.themeMod;
	  }
	  if (!isUndefined_1(pixassist.themeConfig)) {
	    state.themeConfig = pixassist.themeConfig;
	  }
	  state.is_pixelgrade_theme = !!get_1(pixassist, 'themeSupports.is_pixelgrade_theme', false);
	  return state;
	};

	// Reducer that manages the state update
	const session = (state = getDefaultState(), action) => {
	  switch (action.type) {
	    // LOADERS
	    case 'LOADING':
	      return {
	        ...state,
	        ...{
	          loading: true
	        }
	      };
	    case 'LOADING_DONE':
	      return {
	        ...state,
	        ...{
	          loading: false
	        }
	      };
	    // SETUP WIZARD
	    case 'IS_SETUP_WIZARD':
	      return {
	        ...state,
	        ...{
	          is_wizard: true
	        }
	      };
	    case 'NEXT_BUTTON_AVAILABLE':
	      return {
	        ...state,
	        ...{
	          is_wizard_next: true
	        }
	      };
	    case 'NEXT_BUTTON_UNAVAILABLE':
	      return {
	        ...state,
	        ...{
	          is_wizard_next: false
	        }
	      };
	    case 'NEXT_BUTTON_DISABLED':
	      return {
	        ...state,
	        ...{
	          is_next_button_disabled: action.value
	        }
	      };
	    case 'SKIP_BUTTON_AVAILABLE':
	      return {
	        ...state,
	        ...{
	          is_wizard_skip: true
	        }
	      };
	    case 'SKIP_BUTTON_UNAVAILABLE':
	      return {
	        ...state,
	        ...{
	          is_wizard_skip: false
	        }
	      };
	    // WIZARD -> Theme Selector
	    case 'ON_SELECTED_THEME':
	      return {
	        ...state,
	        ...{
	          is_theme_selected: true,
	          selected_theme: action.theme_name
	        }
	      };
	    case 'ON_INSTALLED_THEME':
	      return {
	        ...state,
	        ...{
	          is_theme_installed: true,
	          selected_theme: action.theme_name
	        }
	      };
	    case 'ON_ACTIVATED_THEME':
	      return {
	        ...state,
	        ...{
	          is_theme_activated: true,
	          selected_theme: action.newState.themeName,
	          // now the general info that is likely to change on theme activation
	          has_license: action.newState.has_license,
	          is_active: action.newState.is_active,
	          is_support_active: action.newState.is_support_active,
	          is_pixelgrade_theme: action.newState.is_pixelgrade_theme,
	          hasOriginalDirName: action.newState.hasOriginalDirName,
	          hasOriginalStyleName: action.newState.hasOriginalStyleName,
	          hasPxgTheme: action.newState.hasPxgTheme,
	          themeName: action.newState.themeName,
	          themeTitle: action.newState.themeTitle,
	          themeId: action.newState.themeId,
	          themeType: action.newState.themeType
	        }
	      };
	    case 'ON_UPDATED_THEME_MOD':
	      return {
	        ...state,
	        ...getDefaultState()
	      };
	    case 'ON_UPDATED_LOCALIZED':
	      return {
	        ...state,
	        ...getDefaultState()
	      };
	    // WIZARD -> Plugins
	    case 'ON_PLUGINS_INSTALLING':
	      return {
	        ...state,
	        ...{
	          did_plugins_install: true,
	          are_plugins_installing: true,
	          are_plugins_installed: false
	        }
	      };
	    case 'ON_PLUGINS_INSTALLED':
	      return {
	        ...state,
	        ...{
	          are_plugins_installing: false,
	          are_plugins_installed: true
	        }
	      };
	    case 'ON_PLUGINS_READY':
	      return {
	        ...state,
	        ...{
	          are_plugins_installing: false,
	          are_plugins_installed: true,
	          are_plugins_ready: true
	        }
	      };
	    // WIZARD -> STARTER CONTENT
	    case 'STARTER_CONTENT_INSTALLING':
	      return {
	        ...state,
	        ...{
	          is_sc_installing: true,
	          is_sc_done: false,
	          is_sc_errored: false,
	          is_sc_stopped: false
	        }
	      };
	    case 'STARTER_CONTENT_DONE':
	      return {
	        ...state,
	        ...{
	          is_sc_installing: false,
	          is_sc_done: true,
	          is_sc_errored: false
	        }
	      };
	    case 'STARTER_CONTENT_ERRORED':
	      return {
	        ...state,
	        ...{
	          is_sc_installing: false,
	          is_sc_done: true,
	          is_sc_errored: true
	        }
	      };
	    case 'STARTER_CONTENT_STOP':
	      return {
	        ...state,
	        ...{
	          is_sc_stopped: true
	        }
	      };
	    case 'STARTER_CONTENT_RESUME':
	      return {
	        ...state,
	        ...{
	          is_sc_stopped: false
	        }
	      };
	    default:
	      return state;
	  }
	};

	// Create the redux store for the app
	const sessionStore = createStore(session);
	sessionStore.subscribe(() => {
	  let currentState = sessionStore.getState();

	  // Change the license's state
	  if (currentState.user) {
	    // Trigger a custom event to force the support component update
	    let licenseStateChangeEvent = new CustomEvent('licenseStateChange', {
	      detail: currentState
	    });

	    // Dispatch the license change event
	    window.dispatchEvent(licenseStateChangeEvent);
	  }
	});

	var ReactReduxContext = /*#__PURE__*/React$1.createContext(null);

	// Default to a dummy "batch" implementation that just runs the callback
	function defaultNoopBatch(callback) {
	  callback();
	}

	var batch = defaultNoopBatch; // Allow injecting another batching function later

	var setBatch = function setBatch(newBatch) {
	  return batch = newBatch;
	}; // Supply a getter just to skip dealing with ESM bindings

	var getBatch = function getBatch() {
	  return batch;
	};

	// well as nesting subscriptions of descendant components, so that we can ensure the
	// ancestor components re-render before descendants

	function createListenerCollection() {
	  var batch = getBatch();
	  var first = null;
	  var last = null;
	  return {
	    clear: function clear() {
	      first = null;
	      last = null;
	    },
	    notify: function notify() {
	      batch(function () {
	        var listener = first;

	        while (listener) {
	          listener.callback();
	          listener = listener.next;
	        }
	      });
	    },
	    get: function get() {
	      var listeners = [];
	      var listener = first;

	      while (listener) {
	        listeners.push(listener);
	        listener = listener.next;
	      }

	      return listeners;
	    },
	    subscribe: function subscribe(callback) {
	      var isSubscribed = true;
	      var listener = last = {
	        callback: callback,
	        next: null,
	        prev: last
	      };

	      if (listener.prev) {
	        listener.prev.next = listener;
	      } else {
	        first = listener;
	      }

	      return function unsubscribe() {
	        if (!isSubscribed || first === null) return;
	        isSubscribed = false;

	        if (listener.next) {
	          listener.next.prev = listener.prev;
	        } else {
	          last = listener.prev;
	        }

	        if (listener.prev) {
	          listener.prev.next = listener.next;
	        } else {
	          first = listener.next;
	        }
	      };
	    }
	  };
	}

	var nullListeners = {
	  notify: function notify() {},
	  get: function get() {
	    return [];
	  }
	};
	function createSubscription(store, parentSub) {
	  var unsubscribe;
	  var listeners = nullListeners;

	  function addNestedSub(listener) {
	    trySubscribe();
	    return listeners.subscribe(listener);
	  }

	  function notifyNestedSubs() {
	    listeners.notify();
	  }

	  function handleChangeWrapper() {
	    if (subscription.onStateChange) {
	      subscription.onStateChange();
	    }
	  }

	  function isSubscribed() {
	    return Boolean(unsubscribe);
	  }

	  function trySubscribe() {
	    if (!unsubscribe) {
	      unsubscribe = parentSub ? parentSub.addNestedSub(handleChangeWrapper) : store.subscribe(handleChangeWrapper);
	      listeners = createListenerCollection();
	    }
	  }

	  function tryUnsubscribe() {
	    if (unsubscribe) {
	      unsubscribe();
	      unsubscribe = undefined;
	      listeners.clear();
	      listeners = nullListeners;
	    }
	  }

	  var subscription = {
	    addNestedSub: addNestedSub,
	    notifyNestedSubs: notifyNestedSubs,
	    handleChangeWrapper: handleChangeWrapper,
	    isSubscribed: isSubscribed,
	    trySubscribe: trySubscribe,
	    tryUnsubscribe: tryUnsubscribe,
	    getListeners: function getListeners() {
	      return listeners;
	    }
	  };
	  return subscription;
	}

	// To get around it, we can conditionally useEffect on the server (no-op) and
	// useLayoutEffect in the browser. We need useLayoutEffect to ensure the store
	// subscription callback always has the selector from the latest render commit
	// available, otherwise a store update may happen between render and the effect,
	// which may cause missed updates; we also must ensure the store subscription
	// is created synchronously, otherwise a store update may occur before the
	// subscription is created and an inconsistent state may be observed

	var useIsomorphicLayoutEffect = typeof window !== 'undefined' && typeof window.document !== 'undefined' && typeof window.document.createElement !== 'undefined' ? react.exports.useLayoutEffect : react.exports.useEffect;

	function Provider(_ref) {
	  var store = _ref.store,
	      context = _ref.context,
	      children = _ref.children;
	  var contextValue = react.exports.useMemo(function () {
	    var subscription = createSubscription(store);
	    return {
	      store: store,
	      subscription: subscription
	    };
	  }, [store]);
	  var previousState = react.exports.useMemo(function () {
	    return store.getState();
	  }, [store]);
	  useIsomorphicLayoutEffect(function () {
	    var subscription = contextValue.subscription;
	    subscription.onStateChange = subscription.notifyNestedSubs;
	    subscription.trySubscribe();

	    if (previousState !== store.getState()) {
	      subscription.notifyNestedSubs();
	    }

	    return function () {
	      subscription.tryUnsubscribe();
	      subscription.onStateChange = null;
	    };
	  }, [contextValue, previousState]);
	  var Context = context || ReactReduxContext;
	  return /*#__PURE__*/React$1.createElement(Context.Provider, {
	    value: contextValue
	  }, children);
	}

	var _excluded$2 = ["getDisplayName", "methodName", "renderCountProp", "shouldHandleStateChanges", "storeKey", "withRef", "forwardRef", "context"],
	    _excluded2 = ["reactReduxForwardedRef"];

	var EMPTY_ARRAY = [];
	var NO_SUBSCRIPTION_ARRAY = [null, null];

	function storeStateUpdatesReducer(state, action) {
	  var updateCount = state[1];
	  return [action.payload, updateCount + 1];
	}

	function useIsomorphicLayoutEffectWithArgs(effectFunc, effectArgs, dependencies) {
	  useIsomorphicLayoutEffect(function () {
	    return effectFunc.apply(void 0, effectArgs);
	  }, dependencies);
	}

	function captureWrapperProps(lastWrapperProps, lastChildProps, renderIsScheduled, wrapperProps, actualChildProps, childPropsFromStoreUpdate, notifyNestedSubs) {
	  // We want to capture the wrapper props and child props we used for later comparisons
	  lastWrapperProps.current = wrapperProps;
	  lastChildProps.current = actualChildProps;
	  renderIsScheduled.current = false; // If the render was from a store update, clear out that reference and cascade the subscriber update

	  if (childPropsFromStoreUpdate.current) {
	    childPropsFromStoreUpdate.current = null;
	    notifyNestedSubs();
	  }
	}

	function subscribeUpdates(shouldHandleStateChanges, store, subscription, childPropsSelector, lastWrapperProps, lastChildProps, renderIsScheduled, childPropsFromStoreUpdate, notifyNestedSubs, forceComponentUpdateDispatch) {
	  // If we're not subscribed to the store, nothing to do here
	  if (!shouldHandleStateChanges) return; // Capture values for checking if and when this component unmounts

	  var didUnsubscribe = false;
	  var lastThrownError = null; // We'll run this callback every time a store subscription update propagates to this component

	  var checkForUpdates = function checkForUpdates() {
	    if (didUnsubscribe) {
	      // Don't run stale listeners.
	      // Redux doesn't guarantee unsubscriptions happen until next dispatch.
	      return;
	    }

	    var latestStoreState = store.getState();
	    var newChildProps, error;

	    try {
	      // Actually run the selector with the most recent store state and wrapper props
	      // to determine what the child props should be
	      newChildProps = childPropsSelector(latestStoreState, lastWrapperProps.current);
	    } catch (e) {
	      error = e;
	      lastThrownError = e;
	    }

	    if (!error) {
	      lastThrownError = null;
	    } // If the child props haven't changed, nothing to do here - cascade the subscription update


	    if (newChildProps === lastChildProps.current) {
	      if (!renderIsScheduled.current) {
	        notifyNestedSubs();
	      }
	    } else {
	      // Save references to the new child props.  Note that we track the "child props from store update"
	      // as a ref instead of a useState/useReducer because we need a way to determine if that value has
	      // been processed.  If this went into useState/useReducer, we couldn't clear out the value without
	      // forcing another re-render, which we don't want.
	      lastChildProps.current = newChildProps;
	      childPropsFromStoreUpdate.current = newChildProps;
	      renderIsScheduled.current = true; // If the child props _did_ change (or we caught an error), this wrapper component needs to re-render

	      forceComponentUpdateDispatch({
	        type: 'STORE_UPDATED',
	        payload: {
	          error: error
	        }
	      });
	    }
	  }; // Actually subscribe to the nearest connected ancestor (or store)


	  subscription.onStateChange = checkForUpdates;
	  subscription.trySubscribe(); // Pull data from the store after first render in case the store has
	  // changed since we began.

	  checkForUpdates();

	  var unsubscribeWrapper = function unsubscribeWrapper() {
	    didUnsubscribe = true;
	    subscription.tryUnsubscribe();
	    subscription.onStateChange = null;

	    if (lastThrownError) {
	      // It's possible that we caught an error due to a bad mapState function, but the
	      // parent re-rendered without this component and we're about to unmount.
	      // This shouldn't happen as long as we do top-down subscriptions correctly, but
	      // if we ever do those wrong, this throw will surface the error in our tests.
	      // In that case, throw the error from here so it doesn't get lost.
	      throw lastThrownError;
	    }
	  };

	  return unsubscribeWrapper;
	}

	var initStateUpdates = function initStateUpdates() {
	  return [null, 0];
	};

	function connectAdvanced(
	/*
	  selectorFactory is a func that is responsible for returning the selector function used to
	  compute new props from state, props, and dispatch. For example:
	      export default connectAdvanced((dispatch, options) => (state, props) => ({
	      thing: state.things[props.thingId],
	      saveThing: fields => dispatch(actionCreators.saveThing(props.thingId, fields)),
	    }))(YourComponent)
	    Access to dispatch is provided to the factory so selectorFactories can bind actionCreators
	  outside of their selector as an optimization. Options passed to connectAdvanced are passed to
	  the selectorFactory, along with displayName and WrappedComponent, as the second argument.
	    Note that selectorFactory is responsible for all caching/memoization of inbound and outbound
	  props. Do not use connectAdvanced directly without memoizing results between calls to your
	  selector, otherwise the Connect component will re-render on every state or props change.
	*/
	selectorFactory, // options object:
	_ref) {
	  if (_ref === void 0) {
	    _ref = {};
	  }

	  var _ref2 = _ref,
	      _ref2$getDisplayName = _ref2.getDisplayName,
	      getDisplayName = _ref2$getDisplayName === void 0 ? function (name) {
	    return "ConnectAdvanced(" + name + ")";
	  } : _ref2$getDisplayName,
	      _ref2$methodName = _ref2.methodName,
	      methodName = _ref2$methodName === void 0 ? 'connectAdvanced' : _ref2$methodName,
	      _ref2$renderCountProp = _ref2.renderCountProp,
	      renderCountProp = _ref2$renderCountProp === void 0 ? undefined : _ref2$renderCountProp,
	      _ref2$shouldHandleSta = _ref2.shouldHandleStateChanges,
	      shouldHandleStateChanges = _ref2$shouldHandleSta === void 0 ? true : _ref2$shouldHandleSta,
	      _ref2$storeKey = _ref2.storeKey,
	      storeKey = _ref2$storeKey === void 0 ? 'store' : _ref2$storeKey;
	      _ref2.withRef;
	      var _ref2$forwardRef = _ref2.forwardRef,
	      forwardRef = _ref2$forwardRef === void 0 ? false : _ref2$forwardRef,
	      _ref2$context = _ref2.context,
	      context = _ref2$context === void 0 ? ReactReduxContext : _ref2$context,
	      connectOptions = _objectWithoutPropertiesLoose(_ref2, _excluded$2);

	  var Context = context;
	  return function wrapWithConnect(WrappedComponent) {

	    var wrappedComponentName = WrappedComponent.displayName || WrappedComponent.name || 'Component';
	    var displayName = getDisplayName(wrappedComponentName);

	    var selectorFactoryOptions = _extends({}, connectOptions, {
	      getDisplayName: getDisplayName,
	      methodName: methodName,
	      renderCountProp: renderCountProp,
	      shouldHandleStateChanges: shouldHandleStateChanges,
	      storeKey: storeKey,
	      displayName: displayName,
	      wrappedComponentName: wrappedComponentName,
	      WrappedComponent: WrappedComponent
	    });

	    var pure = connectOptions.pure;

	    function createChildSelector(store) {
	      return selectorFactory(store.dispatch, selectorFactoryOptions);
	    } // If we aren't running in "pure" mode, we don't want to memoize values.
	    // To avoid conditionally calling hooks, we fall back to a tiny wrapper
	    // that just executes the given callback immediately.


	    var usePureOnlyMemo = pure ? react.exports.useMemo : function (callback) {
	      return callback();
	    };

	    function ConnectFunction(props) {
	      var _useMemo = react.exports.useMemo(function () {
	        // Distinguish between actual "data" props that were passed to the wrapper component,
	        // and values needed to control behavior (forwarded refs, alternate context instances).
	        // To maintain the wrapperProps object reference, memoize this destructuring.
	        var reactReduxForwardedRef = props.reactReduxForwardedRef,
	            wrapperProps = _objectWithoutPropertiesLoose(props, _excluded2);

	        return [props.context, reactReduxForwardedRef, wrapperProps];
	      }, [props]),
	          propsContext = _useMemo[0],
	          reactReduxForwardedRef = _useMemo[1],
	          wrapperProps = _useMemo[2];

	      var ContextToUse = react.exports.useMemo(function () {
	        // Users may optionally pass in a custom context instance to use instead of our ReactReduxContext.
	        // Memoize the check that determines which context instance we should use.
	        return propsContext && propsContext.Consumer && reactIs$2.exports.isContextConsumer( /*#__PURE__*/React$1.createElement(propsContext.Consumer, null)) ? propsContext : Context;
	      }, [propsContext, Context]); // Retrieve the store and ancestor subscription via context, if available

	      var contextValue = react.exports.useContext(ContextToUse); // The store _must_ exist as either a prop or in context.
	      // We'll check to see if it _looks_ like a Redux store first.
	      // This allows us to pass through a `store` prop that is just a plain value.

	      var didStoreComeFromProps = Boolean(props.store) && Boolean(props.store.getState) && Boolean(props.store.dispatch);
	      Boolean(contextValue) && Boolean(contextValue.store);


	      var store = didStoreComeFromProps ? props.store : contextValue.store;
	      var childPropsSelector = react.exports.useMemo(function () {
	        // The child props selector needs the store reference as an input.
	        // Re-create this selector whenever the store changes.
	        return createChildSelector(store);
	      }, [store]);

	      var _useMemo2 = react.exports.useMemo(function () {
	        if (!shouldHandleStateChanges) return NO_SUBSCRIPTION_ARRAY; // This Subscription's source should match where store came from: props vs. context. A component
	        // connected to the store via props shouldn't use subscription from context, or vice versa.

	        // This Subscription's source should match where store came from: props vs. context. A component
	        // connected to the store via props shouldn't use subscription from context, or vice versa.
	        var subscription = createSubscription(store, didStoreComeFromProps ? null : contextValue.subscription); // `notifyNestedSubs` is duplicated to handle the case where the component is unmounted in
	        // the middle of the notification loop, where `subscription` will then be null. This can
	        // probably be avoided if Subscription's listeners logic is changed to not call listeners
	        // that have been unsubscribed in the  middle of the notification loop.

	        // `notifyNestedSubs` is duplicated to handle the case where the component is unmounted in
	        // the middle of the notification loop, where `subscription` will then be null. This can
	        // probably be avoided if Subscription's listeners logic is changed to not call listeners
	        // that have been unsubscribed in the  middle of the notification loop.
	        var notifyNestedSubs = subscription.notifyNestedSubs.bind(subscription);
	        return [subscription, notifyNestedSubs];
	      }, [store, didStoreComeFromProps, contextValue]),
	          subscription = _useMemo2[0],
	          notifyNestedSubs = _useMemo2[1]; // Determine what {store, subscription} value should be put into nested context, if necessary,
	      // and memoize that value to avoid unnecessary context updates.


	      var overriddenContextValue = react.exports.useMemo(function () {
	        if (didStoreComeFromProps) {
	          // This component is directly subscribed to a store from props.
	          // We don't want descendants reading from this store - pass down whatever
	          // the existing context value is from the nearest connected ancestor.
	          return contextValue;
	        } // Otherwise, put this component's subscription instance into context, so that
	        // connected descendants won't update until after this component is done


	        return _extends({}, contextValue, {
	          subscription: subscription
	        });
	      }, [didStoreComeFromProps, contextValue, subscription]); // We need to force this wrapper component to re-render whenever a Redux store update
	      // causes a change to the calculated child component props (or we caught an error in mapState)

	      var _useReducer = react.exports.useReducer(storeStateUpdatesReducer, EMPTY_ARRAY, initStateUpdates),
	          _useReducer$ = _useReducer[0],
	          previousStateUpdateResult = _useReducer$[0],
	          forceComponentUpdateDispatch = _useReducer[1]; // Propagate any mapState/mapDispatch errors upwards


	      if (previousStateUpdateResult && previousStateUpdateResult.error) {
	        throw previousStateUpdateResult.error;
	      } // Set up refs to coordinate values between the subscription effect and the render logic


	      var lastChildProps = react.exports.useRef();
	      var lastWrapperProps = react.exports.useRef(wrapperProps);
	      var childPropsFromStoreUpdate = react.exports.useRef();
	      var renderIsScheduled = react.exports.useRef(false);
	      var actualChildProps = usePureOnlyMemo(function () {
	        // Tricky logic here:
	        // - This render may have been triggered by a Redux store update that produced new child props
	        // - However, we may have gotten new wrapper props after that
	        // If we have new child props, and the same wrapper props, we know we should use the new child props as-is.
	        // But, if we have new wrapper props, those might change the child props, so we have to recalculate things.
	        // So, we'll use the child props from store update only if the wrapper props are the same as last time.
	        if (childPropsFromStoreUpdate.current && wrapperProps === lastWrapperProps.current) {
	          return childPropsFromStoreUpdate.current;
	        } // TODO We're reading the store directly in render() here. Bad idea?
	        // This will likely cause Bad Things (TM) to happen in Concurrent Mode.
	        // Note that we do this because on renders _not_ caused by store updates, we need the latest store state
	        // to determine what the child props should be.


	        return childPropsSelector(store.getState(), wrapperProps);
	      }, [store, previousStateUpdateResult, wrapperProps]); // We need this to execute synchronously every time we re-render. However, React warns
	      // about useLayoutEffect in SSR, so we try to detect environment and fall back to
	      // just useEffect instead to avoid the warning, since neither will run anyway.

	      useIsomorphicLayoutEffectWithArgs(captureWrapperProps, [lastWrapperProps, lastChildProps, renderIsScheduled, wrapperProps, actualChildProps, childPropsFromStoreUpdate, notifyNestedSubs]); // Our re-subscribe logic only runs when the store/subscription setup changes

	      useIsomorphicLayoutEffectWithArgs(subscribeUpdates, [shouldHandleStateChanges, store, subscription, childPropsSelector, lastWrapperProps, lastChildProps, renderIsScheduled, childPropsFromStoreUpdate, notifyNestedSubs, forceComponentUpdateDispatch], [store, subscription, childPropsSelector]); // Now that all that's done, we can finally try to actually render the child component.
	      // We memoize the elements for the rendered child component as an optimization.

	      var renderedWrappedComponent = react.exports.useMemo(function () {
	        return /*#__PURE__*/React$1.createElement(WrappedComponent, _extends({}, actualChildProps, {
	          ref: reactReduxForwardedRef
	        }));
	      }, [reactReduxForwardedRef, WrappedComponent, actualChildProps]); // If React sees the exact same element reference as last time, it bails out of re-rendering
	      // that child, same as if it was wrapped in React.memo() or returned false from shouldComponentUpdate.

	      var renderedChild = react.exports.useMemo(function () {
	        if (shouldHandleStateChanges) {
	          // If this component is subscribed to store updates, we need to pass its own
	          // subscription instance down to our descendants. That means rendering the same
	          // Context instance, and putting a different value into the context.
	          return /*#__PURE__*/React$1.createElement(ContextToUse.Provider, {
	            value: overriddenContextValue
	          }, renderedWrappedComponent);
	        }

	        return renderedWrappedComponent;
	      }, [ContextToUse, renderedWrappedComponent, overriddenContextValue]);
	      return renderedChild;
	    } // If we're in "pure" mode, ensure our wrapper component only re-renders when incoming props have changed.


	    var Connect = pure ? React$1.memo(ConnectFunction) : ConnectFunction;
	    Connect.WrappedComponent = WrappedComponent;
	    Connect.displayName = ConnectFunction.displayName = displayName;

	    if (forwardRef) {
	      var forwarded = React$1.forwardRef(function forwardConnectRef(props, ref) {
	        return /*#__PURE__*/React$1.createElement(Connect, _extends({}, props, {
	          reactReduxForwardedRef: ref
	        }));
	      });
	      forwarded.displayName = displayName;
	      forwarded.WrappedComponent = WrappedComponent;
	      return hoistNonReactStatics_cjs(forwarded, WrappedComponent);
	    }

	    return hoistNonReactStatics_cjs(Connect, WrappedComponent);
	  };
	}

	function is(x, y) {
	  if (x === y) {
	    return x !== 0 || y !== 0 || 1 / x === 1 / y;
	  } else {
	    return x !== x && y !== y;
	  }
	}

	function shallowEqual(objA, objB) {
	  if (is(objA, objB)) return true;

	  if (typeof objA !== 'object' || objA === null || typeof objB !== 'object' || objB === null) {
	    return false;
	  }

	  var keysA = Object.keys(objA);
	  var keysB = Object.keys(objB);
	  if (keysA.length !== keysB.length) return false;

	  for (var i = 0; i < keysA.length; i++) {
	    if (!Object.prototype.hasOwnProperty.call(objB, keysA[i]) || !is(objA[keysA[i]], objB[keysA[i]])) {
	      return false;
	    }
	  }

	  return true;
	}

	function bindActionCreators(actionCreators, dispatch) {
	  var boundActionCreators = {};

	  var _loop = function _loop(key) {
	    var actionCreator = actionCreators[key];

	    if (typeof actionCreator === 'function') {
	      boundActionCreators[key] = function () {
	        return dispatch(actionCreator.apply(void 0, arguments));
	      };
	    }
	  };

	  for (var key in actionCreators) {
	    _loop(key);
	  }

	  return boundActionCreators;
	}

	function wrapMapToPropsConstant(getConstant) {
	  return function initConstantSelector(dispatch, options) {
	    var constant = getConstant(dispatch, options);

	    function constantSelector() {
	      return constant;
	    }

	    constantSelector.dependsOnOwnProps = false;
	    return constantSelector;
	  };
	} // dependsOnOwnProps is used by createMapToPropsProxy to determine whether to pass props as args
	// to the mapToProps function being wrapped. It is also used by makePurePropsSelector to determine
	// whether mapToProps needs to be invoked when props have changed.
	//
	// A length of one signals that mapToProps does not depend on props from the parent component.
	// A length of zero is assumed to mean mapToProps is getting args via arguments or ...args and
	// therefore not reporting its length accurately..

	function getDependsOnOwnProps(mapToProps) {
	  return mapToProps.dependsOnOwnProps !== null && mapToProps.dependsOnOwnProps !== undefined ? Boolean(mapToProps.dependsOnOwnProps) : mapToProps.length !== 1;
	} // Used by whenMapStateToPropsIsFunction and whenMapDispatchToPropsIsFunction,
	// this function wraps mapToProps in a proxy function which does several things:
	//
	//  * Detects whether the mapToProps function being called depends on props, which
	//    is used by selectorFactory to decide if it should reinvoke on props changes.
	//
	//  * On first call, handles mapToProps if returns another function, and treats that
	//    new function as the true mapToProps for subsequent calls.
	//
	//  * On first call, verifies the first result is a plain object, in order to warn
	//    the developer that their mapToProps function is not returning a valid result.
	//

	function wrapMapToPropsFunc(mapToProps, methodName) {
	  return function initProxySelector(dispatch, _ref) {
	    _ref.displayName;

	    var proxy = function mapToPropsProxy(stateOrDispatch, ownProps) {
	      return proxy.dependsOnOwnProps ? proxy.mapToProps(stateOrDispatch, ownProps) : proxy.mapToProps(stateOrDispatch);
	    }; // allow detectFactoryAndVerify to get ownProps


	    proxy.dependsOnOwnProps = true;

	    proxy.mapToProps = function detectFactoryAndVerify(stateOrDispatch, ownProps) {
	      proxy.mapToProps = mapToProps;
	      proxy.dependsOnOwnProps = getDependsOnOwnProps(mapToProps);
	      var props = proxy(stateOrDispatch, ownProps);

	      if (typeof props === 'function') {
	        proxy.mapToProps = props;
	        proxy.dependsOnOwnProps = getDependsOnOwnProps(props);
	        props = proxy(stateOrDispatch, ownProps);
	      }
	      return props;
	    };

	    return proxy;
	  };
	}

	function whenMapDispatchToPropsIsFunction(mapDispatchToProps) {
	  return typeof mapDispatchToProps === 'function' ? wrapMapToPropsFunc(mapDispatchToProps) : undefined;
	}
	function whenMapDispatchToPropsIsMissing(mapDispatchToProps) {
	  return !mapDispatchToProps ? wrapMapToPropsConstant(function (dispatch) {
	    return {
	      dispatch: dispatch
	    };
	  }) : undefined;
	}
	function whenMapDispatchToPropsIsObject(mapDispatchToProps) {
	  return mapDispatchToProps && typeof mapDispatchToProps === 'object' ? wrapMapToPropsConstant(function (dispatch) {
	    return bindActionCreators(mapDispatchToProps, dispatch);
	  }) : undefined;
	}
	var defaultMapDispatchToPropsFactories = [whenMapDispatchToPropsIsFunction, whenMapDispatchToPropsIsMissing, whenMapDispatchToPropsIsObject];

	function whenMapStateToPropsIsFunction(mapStateToProps) {
	  return typeof mapStateToProps === 'function' ? wrapMapToPropsFunc(mapStateToProps) : undefined;
	}
	function whenMapStateToPropsIsMissing(mapStateToProps) {
	  return !mapStateToProps ? wrapMapToPropsConstant(function () {
	    return {};
	  }) : undefined;
	}
	var defaultMapStateToPropsFactories = [whenMapStateToPropsIsFunction, whenMapStateToPropsIsMissing];

	function defaultMergeProps(stateProps, dispatchProps, ownProps) {
	  return _extends({}, ownProps, stateProps, dispatchProps);
	}
	function wrapMergePropsFunc(mergeProps) {
	  return function initMergePropsProxy(dispatch, _ref) {
	    _ref.displayName;
	        var pure = _ref.pure,
	        areMergedPropsEqual = _ref.areMergedPropsEqual;
	    var hasRunOnce = false;
	    var mergedProps;
	    return function mergePropsProxy(stateProps, dispatchProps, ownProps) {
	      var nextMergedProps = mergeProps(stateProps, dispatchProps, ownProps);

	      if (hasRunOnce) {
	        if (!pure || !areMergedPropsEqual(nextMergedProps, mergedProps)) mergedProps = nextMergedProps;
	      } else {
	        hasRunOnce = true;
	        mergedProps = nextMergedProps;
	      }

	      return mergedProps;
	    };
	  };
	}
	function whenMergePropsIsFunction(mergeProps) {
	  return typeof mergeProps === 'function' ? wrapMergePropsFunc(mergeProps) : undefined;
	}
	function whenMergePropsIsOmitted(mergeProps) {
	  return !mergeProps ? function () {
	    return defaultMergeProps;
	  } : undefined;
	}
	var defaultMergePropsFactories = [whenMergePropsIsFunction, whenMergePropsIsOmitted];

	var _excluded$1 = ["initMapStateToProps", "initMapDispatchToProps", "initMergeProps"];
	function impureFinalPropsSelectorFactory(mapStateToProps, mapDispatchToProps, mergeProps, dispatch) {
	  return function impureFinalPropsSelector(state, ownProps) {
	    return mergeProps(mapStateToProps(state, ownProps), mapDispatchToProps(dispatch, ownProps), ownProps);
	  };
	}
	function pureFinalPropsSelectorFactory(mapStateToProps, mapDispatchToProps, mergeProps, dispatch, _ref) {
	  var areStatesEqual = _ref.areStatesEqual,
	      areOwnPropsEqual = _ref.areOwnPropsEqual,
	      areStatePropsEqual = _ref.areStatePropsEqual;
	  var hasRunAtLeastOnce = false;
	  var state;
	  var ownProps;
	  var stateProps;
	  var dispatchProps;
	  var mergedProps;

	  function handleFirstCall(firstState, firstOwnProps) {
	    state = firstState;
	    ownProps = firstOwnProps;
	    stateProps = mapStateToProps(state, ownProps);
	    dispatchProps = mapDispatchToProps(dispatch, ownProps);
	    mergedProps = mergeProps(stateProps, dispatchProps, ownProps);
	    hasRunAtLeastOnce = true;
	    return mergedProps;
	  }

	  function handleNewPropsAndNewState() {
	    stateProps = mapStateToProps(state, ownProps);
	    if (mapDispatchToProps.dependsOnOwnProps) dispatchProps = mapDispatchToProps(dispatch, ownProps);
	    mergedProps = mergeProps(stateProps, dispatchProps, ownProps);
	    return mergedProps;
	  }

	  function handleNewProps() {
	    if (mapStateToProps.dependsOnOwnProps) stateProps = mapStateToProps(state, ownProps);
	    if (mapDispatchToProps.dependsOnOwnProps) dispatchProps = mapDispatchToProps(dispatch, ownProps);
	    mergedProps = mergeProps(stateProps, dispatchProps, ownProps);
	    return mergedProps;
	  }

	  function handleNewState() {
	    var nextStateProps = mapStateToProps(state, ownProps);
	    var statePropsChanged = !areStatePropsEqual(nextStateProps, stateProps);
	    stateProps = nextStateProps;
	    if (statePropsChanged) mergedProps = mergeProps(stateProps, dispatchProps, ownProps);
	    return mergedProps;
	  }

	  function handleSubsequentCalls(nextState, nextOwnProps) {
	    var propsChanged = !areOwnPropsEqual(nextOwnProps, ownProps);
	    var stateChanged = !areStatesEqual(nextState, state, nextOwnProps, ownProps);
	    state = nextState;
	    ownProps = nextOwnProps;
	    if (propsChanged && stateChanged) return handleNewPropsAndNewState();
	    if (propsChanged) return handleNewProps();
	    if (stateChanged) return handleNewState();
	    return mergedProps;
	  }

	  return function pureFinalPropsSelector(nextState, nextOwnProps) {
	    return hasRunAtLeastOnce ? handleSubsequentCalls(nextState, nextOwnProps) : handleFirstCall(nextState, nextOwnProps);
	  };
	} // TODO: Add more comments
	// If pure is true, the selector returned by selectorFactory will memoize its results,
	// allowing connectAdvanced's shouldComponentUpdate to return false if final
	// props have not changed. If false, the selector will always return a new
	// object and shouldComponentUpdate will always return true.

	function finalPropsSelectorFactory(dispatch, _ref2) {
	  var initMapStateToProps = _ref2.initMapStateToProps,
	      initMapDispatchToProps = _ref2.initMapDispatchToProps,
	      initMergeProps = _ref2.initMergeProps,
	      options = _objectWithoutPropertiesLoose(_ref2, _excluded$1);

	  var mapStateToProps = initMapStateToProps(dispatch, options);
	  var mapDispatchToProps = initMapDispatchToProps(dispatch, options);
	  var mergeProps = initMergeProps(dispatch, options);

	  var selectorFactory = options.pure ? pureFinalPropsSelectorFactory : impureFinalPropsSelectorFactory;
	  return selectorFactory(mapStateToProps, mapDispatchToProps, mergeProps, dispatch, options);
	}

	var _excluded = ["pure", "areStatesEqual", "areOwnPropsEqual", "areStatePropsEqual", "areMergedPropsEqual"];
	/*
	  connect is a facade over connectAdvanced. It turns its args into a compatible
	  selectorFactory, which has the signature:

	    (dispatch, options) => (nextState, nextOwnProps) => nextFinalProps
	  
	  connect passes its args to connectAdvanced as options, which will in turn pass them to
	  selectorFactory each time a Connect component instance is instantiated or hot reloaded.

	  selectorFactory returns a final props selector from its mapStateToProps,
	  mapStateToPropsFactories, mapDispatchToProps, mapDispatchToPropsFactories, mergeProps,
	  mergePropsFactories, and pure args.

	  The resulting final props selector is called by the Connect component instance whenever
	  it receives new props or store state.
	 */

	function match(arg, factories, name) {
	  for (var i = factories.length - 1; i >= 0; i--) {
	    var result = factories[i](arg);
	    if (result) return result;
	  }

	  return function (dispatch, options) {
	    throw new Error("Invalid value of type " + typeof arg + " for " + name + " argument when connecting component " + options.wrappedComponentName + ".");
	  };
	}

	function strictEqual(a, b) {
	  return a === b;
	} // createConnect with default args builds the 'official' connect behavior. Calling it with
	// different options opens up some testing and extensibility scenarios


	function createConnect(_temp) {
	  var _ref = _temp === void 0 ? {} : _temp,
	      _ref$connectHOC = _ref.connectHOC,
	      connectHOC = _ref$connectHOC === void 0 ? connectAdvanced : _ref$connectHOC,
	      _ref$mapStateToPropsF = _ref.mapStateToPropsFactories,
	      mapStateToPropsFactories = _ref$mapStateToPropsF === void 0 ? defaultMapStateToPropsFactories : _ref$mapStateToPropsF,
	      _ref$mapDispatchToPro = _ref.mapDispatchToPropsFactories,
	      mapDispatchToPropsFactories = _ref$mapDispatchToPro === void 0 ? defaultMapDispatchToPropsFactories : _ref$mapDispatchToPro,
	      _ref$mergePropsFactor = _ref.mergePropsFactories,
	      mergePropsFactories = _ref$mergePropsFactor === void 0 ? defaultMergePropsFactories : _ref$mergePropsFactor,
	      _ref$selectorFactory = _ref.selectorFactory,
	      selectorFactory = _ref$selectorFactory === void 0 ? finalPropsSelectorFactory : _ref$selectorFactory;

	  return function connect(mapStateToProps, mapDispatchToProps, mergeProps, _ref2) {
	    if (_ref2 === void 0) {
	      _ref2 = {};
	    }

	    var _ref3 = _ref2,
	        _ref3$pure = _ref3.pure,
	        pure = _ref3$pure === void 0 ? true : _ref3$pure,
	        _ref3$areStatesEqual = _ref3.areStatesEqual,
	        areStatesEqual = _ref3$areStatesEqual === void 0 ? strictEqual : _ref3$areStatesEqual,
	        _ref3$areOwnPropsEqua = _ref3.areOwnPropsEqual,
	        areOwnPropsEqual = _ref3$areOwnPropsEqua === void 0 ? shallowEqual : _ref3$areOwnPropsEqua,
	        _ref3$areStatePropsEq = _ref3.areStatePropsEqual,
	        areStatePropsEqual = _ref3$areStatePropsEq === void 0 ? shallowEqual : _ref3$areStatePropsEq,
	        _ref3$areMergedPropsE = _ref3.areMergedPropsEqual,
	        areMergedPropsEqual = _ref3$areMergedPropsE === void 0 ? shallowEqual : _ref3$areMergedPropsE,
	        extraOptions = _objectWithoutPropertiesLoose(_ref3, _excluded);

	    var initMapStateToProps = match(mapStateToProps, mapStateToPropsFactories, 'mapStateToProps');
	    var initMapDispatchToProps = match(mapDispatchToProps, mapDispatchToPropsFactories, 'mapDispatchToProps');
	    var initMergeProps = match(mergeProps, mergePropsFactories, 'mergeProps');
	    return connectHOC(selectorFactory, _extends({
	      // used in error messages
	      methodName: 'connect',
	      // used to compute Connect's displayName from the wrapped component's displayName.
	      getDisplayName: function getDisplayName(name) {
	        return "Connect(" + name + ")";
	      },
	      // if mapStateToProps is falsy, the Connect component doesn't subscribe to store state changes
	      shouldHandleStateChanges: Boolean(mapStateToProps),
	      // passed through to selectorFactory
	      initMapStateToProps: initMapStateToProps,
	      initMapDispatchToProps: initMapDispatchToProps,
	      initMergeProps: initMergeProps,
	      pure: pure,
	      areStatesEqual: areStatesEqual,
	      areOwnPropsEqual: areOwnPropsEqual,
	      areStatePropsEqual: areStatePropsEqual,
	      areMergedPropsEqual: areMergedPropsEqual
	    }, extraOptions));
	  };
	}
	var connect = /*#__PURE__*/createConnect();

	// with standard React renderers (ReactDOM, React Native)

	setBatch(reactDom.exports.unstable_batchedUpdates);

	/** Used for built-in method references. */

	var arrayProto = Array.prototype;

	/* Built-in method references for those with the same name as other `lodash` methods. */
	var nativeJoin = arrayProto.join;

	/**
	 * Converts all elements in `array` into a string separated by `separator`.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Array
	 * @param {Array} array The array to convert.
	 * @param {string} [separator=','] The element separator.
	 * @returns {string} Returns the joined string.
	 * @example
	 *
	 * _.join(['a', 'b', 'c'], '~');
	 * // => 'a~b~c'
	 */
	function join(array, separator) {
	  return array == null ? '' : nativeJoin.call(array, separator);
	}

	var join_1 = join;

	/**
	 * The base implementation of `_.findIndex` and `_.findLastIndex` without
	 * support for iteratee shorthands.
	 *
	 * @private
	 * @param {Array} array The array to inspect.
	 * @param {Function} predicate The function invoked per iteration.
	 * @param {number} fromIndex The index to search from.
	 * @param {boolean} [fromRight] Specify iterating from right to left.
	 * @returns {number} Returns the index of the matched value, else `-1`.
	 */

	function baseFindIndex$1(array, predicate, fromIndex, fromRight) {
	  var length = array.length,
	      index = fromIndex + (fromRight ? 1 : -1);

	  while ((fromRight ? index-- : ++index < length)) {
	    if (predicate(array[index], index, array)) {
	      return index;
	    }
	  }
	  return -1;
	}

	var _baseFindIndex = baseFindIndex$1;

	/**
	 * The base implementation of `_.isNaN` without support for number objects.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is `NaN`, else `false`.
	 */

	function baseIsNaN$1(value) {
	  return value !== value;
	}

	var _baseIsNaN = baseIsNaN$1;

	/**
	 * A specialized version of `_.indexOf` which performs strict equality
	 * comparisons of values, i.e. `===`.
	 *
	 * @private
	 * @param {Array} array The array to inspect.
	 * @param {*} value The value to search for.
	 * @param {number} fromIndex The index to search from.
	 * @returns {number} Returns the index of the matched value, else `-1`.
	 */

	function strictIndexOf$1(array, value, fromIndex) {
	  var index = fromIndex - 1,
	      length = array.length;

	  while (++index < length) {
	    if (array[index] === value) {
	      return index;
	    }
	  }
	  return -1;
	}

	var _strictIndexOf = strictIndexOf$1;

	var baseFindIndex = _baseFindIndex,
	    baseIsNaN = _baseIsNaN,
	    strictIndexOf = _strictIndexOf;

	/**
	 * The base implementation of `_.indexOf` without `fromIndex` bounds checks.
	 *
	 * @private
	 * @param {Array} array The array to inspect.
	 * @param {*} value The value to search for.
	 * @param {number} fromIndex The index to search from.
	 * @returns {number} Returns the index of the matched value, else `-1`.
	 */
	function baseIndexOf$1(array, value, fromIndex) {
	  return value === value
	    ? strictIndexOf(array, value, fromIndex)
	    : baseFindIndex(array, baseIsNaN, fromIndex);
	}

	var _baseIndexOf = baseIndexOf$1;

	/** Used to match a single whitespace character. */

	var reWhitespace = /\s/;

	/**
	 * Used by `_.trim` and `_.trimEnd` to get the index of the last non-whitespace
	 * character of `string`.
	 *
	 * @private
	 * @param {string} string The string to inspect.
	 * @returns {number} Returns the index of the last non-whitespace character.
	 */
	function trimmedEndIndex$1(string) {
	  var index = string.length;

	  while (index-- && reWhitespace.test(string.charAt(index))) {}
	  return index;
	}

	var _trimmedEndIndex = trimmedEndIndex$1;

	var trimmedEndIndex = _trimmedEndIndex;

	/** Used to match leading whitespace. */
	var reTrimStart = /^\s+/;

	/**
	 * The base implementation of `_.trim`.
	 *
	 * @private
	 * @param {string} string The string to trim.
	 * @returns {string} Returns the trimmed string.
	 */
	function baseTrim$1(string) {
	  return string
	    ? string.slice(0, trimmedEndIndex(string) + 1).replace(reTrimStart, '')
	    : string;
	}

	var _baseTrim = baseTrim$1;

	var baseTrim = _baseTrim,
	    isObject$2 = isObject_1,
	    isSymbol$2 = isSymbol_1;

	/** Used as references for various `Number` constants. */
	var NAN = 0 / 0;

	/** Used to detect bad signed hexadecimal string values. */
	var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;

	/** Used to detect binary string values. */
	var reIsBinary = /^0b[01]+$/i;

	/** Used to detect octal string values. */
	var reIsOctal = /^0o[0-7]+$/i;

	/** Built-in method references without a dependency on `root`. */
	var freeParseInt = parseInt;

	/**
	 * Converts `value` to a number.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to process.
	 * @returns {number} Returns the number.
	 * @example
	 *
	 * _.toNumber(3.2);
	 * // => 3.2
	 *
	 * _.toNumber(Number.MIN_VALUE);
	 * // => 5e-324
	 *
	 * _.toNumber(Infinity);
	 * // => Infinity
	 *
	 * _.toNumber('3.2');
	 * // => 3.2
	 */
	function toNumber$1(value) {
	  if (typeof value == 'number') {
	    return value;
	  }
	  if (isSymbol$2(value)) {
	    return NAN;
	  }
	  if (isObject$2(value)) {
	    var other = typeof value.valueOf == 'function' ? value.valueOf() : value;
	    value = isObject$2(other) ? (other + '') : other;
	  }
	  if (typeof value != 'string') {
	    return value === 0 ? value : +value;
	  }
	  value = baseTrim(value);
	  var isBinary = reIsBinary.test(value);
	  return (isBinary || reIsOctal.test(value))
	    ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
	    : (reIsBadHex.test(value) ? NAN : +value);
	}

	var toNumber_1 = toNumber$1;

	var toNumber = toNumber_1;

	/** Used as references for various `Number` constants. */
	var INFINITY = 1 / 0,
	    MAX_INTEGER = 1.7976931348623157e+308;

	/**
	 * Converts `value` to a finite number.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.12.0
	 * @category Lang
	 * @param {*} value The value to convert.
	 * @returns {number} Returns the converted number.
	 * @example
	 *
	 * _.toFinite(3.2);
	 * // => 3.2
	 *
	 * _.toFinite(Number.MIN_VALUE);
	 * // => 5e-324
	 *
	 * _.toFinite(Infinity);
	 * // => 1.7976931348623157e+308
	 *
	 * _.toFinite('3.2');
	 * // => 3.2
	 */
	function toFinite$1(value) {
	  if (!value) {
	    return value === 0 ? value : 0;
	  }
	  value = toNumber(value);
	  if (value === INFINITY || value === -INFINITY) {
	    var sign = (value < 0 ? -1 : 1);
	    return sign * MAX_INTEGER;
	  }
	  return value === value ? value : 0;
	}

	var toFinite_1 = toFinite$1;

	var toFinite = toFinite_1;

	/**
	 * Converts `value` to an integer.
	 *
	 * **Note:** This method is loosely based on
	 * [`ToInteger`](http://www.ecma-international.org/ecma-262/7.0/#sec-tointeger).
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to convert.
	 * @returns {number} Returns the converted integer.
	 * @example
	 *
	 * _.toInteger(3.2);
	 * // => 3
	 *
	 * _.toInteger(Number.MIN_VALUE);
	 * // => 0
	 *
	 * _.toInteger(Infinity);
	 * // => 1.7976931348623157e+308
	 *
	 * _.toInteger('3.2');
	 * // => 3
	 */
	function toInteger$1(value) {
	  var result = toFinite(value),
	      remainder = result % 1;

	  return result === result ? (remainder ? result - remainder : result) : 0;
	}

	var toInteger_1 = toInteger$1;

	var baseIndexOf = _baseIndexOf,
	    toInteger = toInteger_1;

	/* Built-in method references for those with the same name as other `lodash` methods. */
	var nativeMax$1 = Math.max;

	/**
	 * Gets the index at which the first occurrence of `value` is found in `array`
	 * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
	 * for equality comparisons. If `fromIndex` is negative, it's used as the
	 * offset from the end of `array`.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Array
	 * @param {Array} array The array to inspect.
	 * @param {*} value The value to search for.
	 * @param {number} [fromIndex=0] The index to search from.
	 * @returns {number} Returns the index of the matched value, else `-1`.
	 * @example
	 *
	 * _.indexOf([1, 2, 1, 2], 2);
	 * // => 1
	 *
	 * // Search from the `fromIndex`.
	 * _.indexOf([1, 2, 1, 2], 2, 2);
	 * // => 3
	 */
	function indexOf$1(array, value, fromIndex) {
	  var length = array == null ? 0 : array.length;
	  if (!length) {
	    return -1;
	  }
	  var index = fromIndex == null ? 0 : toInteger(fromIndex);
	  if (index < 0) {
	    index = nativeMax$1(length + index, 0);
	  }
	  return baseIndexOf(array, value, index);
	}

	var indexOf_1 = indexOf$1;

	var isArray$f = isArray_1;

	/**
	 * Casts `value` as an array if it's not one.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.4.0
	 * @category Lang
	 * @param {*} value The value to inspect.
	 * @returns {Array} Returns the cast array.
	 * @example
	 *
	 * _.castArray(1);
	 * // => [1]
	 *
	 * _.castArray({ 'a': 1 });
	 * // => [{ 'a': 1 }]
	 *
	 * _.castArray('abc');
	 * // => ['abc']
	 *
	 * _.castArray(null);
	 * // => [null]
	 *
	 * _.castArray(undefined);
	 * // => [undefined]
	 *
	 * _.castArray();
	 * // => []
	 *
	 * var array = [1, 2, 3];
	 * console.log(_.castArray(array) === array);
	 * // => true
	 */
	function castArray() {
	  if (!arguments.length) {
	    return [];
	  }
	  var value = arguments[0];
	  return isArray$f(value) ? value : [value];
	}

	var castArray_1 = castArray;

	/**
	 * A specialized version of `_.filter` for arrays without support for
	 * iteratee shorthands.
	 *
	 * @private
	 * @param {Array} [array] The array to iterate over.
	 * @param {Function} predicate The function invoked per iteration.
	 * @returns {Array} Returns the new filtered array.
	 */

	function arrayFilter$2(array, predicate) {
	  var index = -1,
	      length = array == null ? 0 : array.length,
	      resIndex = 0,
	      result = [];

	  while (++index < length) {
	    var value = array[index];
	    if (predicate(value, index, array)) {
	      result[resIndex++] = value;
	    }
	  }
	  return result;
	}

	var _arrayFilter = arrayFilter$2;

	/**
	 * Creates a base function for methods like `_.forIn` and `_.forOwn`.
	 *
	 * @private
	 * @param {boolean} [fromRight] Specify iterating from right to left.
	 * @returns {Function} Returns the new base function.
	 */

	function createBaseFor$1(fromRight) {
	  return function(object, iteratee, keysFunc) {
	    var index = -1,
	        iterable = Object(object),
	        props = keysFunc(object),
	        length = props.length;

	    while (length--) {
	      var key = props[fromRight ? length : ++index];
	      if (iteratee(iterable[key], key, iterable) === false) {
	        break;
	      }
	    }
	    return object;
	  };
	}

	var _createBaseFor = createBaseFor$1;

	var createBaseFor = _createBaseFor;

	/**
	 * The base implementation of `baseForOwn` which iterates over `object`
	 * properties returned by `keysFunc` and invokes `iteratee` for each property.
	 * Iteratee functions may exit iteration early by explicitly returning `false`.
	 *
	 * @private
	 * @param {Object} object The object to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @param {Function} keysFunc The function to get the keys of `object`.
	 * @returns {Object} Returns `object`.
	 */
	var baseFor$1 = createBaseFor();

	var _baseFor = baseFor$1;

	/**
	 * The base implementation of `_.times` without support for iteratee shorthands
	 * or max array length checks.
	 *
	 * @private
	 * @param {number} n The number of times to invoke `iteratee`.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @returns {Array} Returns the array of results.
	 */

	function baseTimes$1(n, iteratee) {
	  var index = -1,
	      result = Array(n);

	  while (++index < n) {
	    result[index] = iteratee(index);
	  }
	  return result;
	}

	var _baseTimes = baseTimes$1;

	var baseGetTag$3 = _baseGetTag,
	    isObjectLike$4 = isObjectLike_1;

	/** `Object#toString` result references. */
	var argsTag$2 = '[object Arguments]';

	/**
	 * The base implementation of `_.isArguments`.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
	 */
	function baseIsArguments$1(value) {
	  return isObjectLike$4(value) && baseGetTag$3(value) == argsTag$2;
	}

	var _baseIsArguments = baseIsArguments$1;

	var baseIsArguments = _baseIsArguments,
	    isObjectLike$3 = isObjectLike_1;

	/** Used for built-in method references. */
	var objectProto$7 = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty$5 = objectProto$7.hasOwnProperty;

	/** Built-in value references. */
	var propertyIsEnumerable$1 = objectProto$7.propertyIsEnumerable;

	/**
	 * Checks if `value` is likely an `arguments` object.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
	 *  else `false`.
	 * @example
	 *
	 * _.isArguments(function() { return arguments; }());
	 * // => true
	 *
	 * _.isArguments([1, 2, 3]);
	 * // => false
	 */
	var isArguments$4 = baseIsArguments(function() { return arguments; }()) ? baseIsArguments : function(value) {
	  return isObjectLike$3(value) && hasOwnProperty$5.call(value, 'callee') &&
	    !propertyIsEnumerable$1.call(value, 'callee');
	};

	var isArguments_1 = isArguments$4;

	var isBuffer$4 = {exports: {}};

	/**
	 * This method returns `false`.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.13.0
	 * @category Util
	 * @returns {boolean} Returns `false`.
	 * @example
	 *
	 * _.times(2, _.stubFalse);
	 * // => [false, false]
	 */

	function stubFalse() {
	  return false;
	}

	var stubFalse_1 = stubFalse;

	(function (module, exports) {
	var root = _root,
	    stubFalse = stubFalse_1;

	/** Detect free variable `exports`. */
	var freeExports = exports && !exports.nodeType && exports;

	/** Detect free variable `module`. */
	var freeModule = freeExports && 'object' == 'object' && module && !module.nodeType && module;

	/** Detect the popular CommonJS extension `module.exports`. */
	var moduleExports = freeModule && freeModule.exports === freeExports;

	/** Built-in value references. */
	var Buffer = moduleExports ? root.Buffer : undefined;

	/* Built-in method references for those with the same name as other `lodash` methods. */
	var nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined;

	/**
	 * Checks if `value` is a buffer.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.3.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
	 * @example
	 *
	 * _.isBuffer(new Buffer(2));
	 * // => true
	 *
	 * _.isBuffer(new Uint8Array(2));
	 * // => false
	 */
	var isBuffer = nativeIsBuffer || stubFalse;

	module.exports = isBuffer;
	}(isBuffer$4, isBuffer$4.exports));

	/** Used as references for various `Number` constants. */

	var MAX_SAFE_INTEGER$1 = 9007199254740991;

	/** Used to detect unsigned integer values. */
	var reIsUint = /^(?:0|[1-9]\d*)$/;

	/**
	 * Checks if `value` is a valid array-like index.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
	 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
	 */
	function isIndex$3(value, length) {
	  var type = typeof value;
	  length = length == null ? MAX_SAFE_INTEGER$1 : length;

	  return !!length &&
	    (type == 'number' ||
	      (type != 'symbol' && reIsUint.test(value))) &&
	        (value > -1 && value % 1 == 0 && value < length);
	}

	var _isIndex = isIndex$3;

	/** Used as references for various `Number` constants. */

	var MAX_SAFE_INTEGER = 9007199254740991;

	/**
	 * Checks if `value` is a valid array-like length.
	 *
	 * **Note:** This method is loosely based on
	 * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
	 * @example
	 *
	 * _.isLength(3);
	 * // => true
	 *
	 * _.isLength(Number.MIN_VALUE);
	 * // => false
	 *
	 * _.isLength(Infinity);
	 * // => false
	 *
	 * _.isLength('3');
	 * // => false
	 */
	function isLength$3(value) {
	  return typeof value == 'number' &&
	    value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
	}

	var isLength_1 = isLength$3;

	var baseGetTag$2 = _baseGetTag,
	    isLength$2 = isLength_1,
	    isObjectLike$2 = isObjectLike_1;

	/** `Object#toString` result references. */
	var argsTag$1 = '[object Arguments]',
	    arrayTag$1 = '[object Array]',
	    boolTag$1 = '[object Boolean]',
	    dateTag$1 = '[object Date]',
	    errorTag$1 = '[object Error]',
	    funcTag = '[object Function]',
	    mapTag$4 = '[object Map]',
	    numberTag$1 = '[object Number]',
	    objectTag$2 = '[object Object]',
	    regexpTag$1 = '[object RegExp]',
	    setTag$4 = '[object Set]',
	    stringTag$2 = '[object String]',
	    weakMapTag$1 = '[object WeakMap]';

	var arrayBufferTag$1 = '[object ArrayBuffer]',
	    dataViewTag$2 = '[object DataView]',
	    float32Tag = '[object Float32Array]',
	    float64Tag = '[object Float64Array]',
	    int8Tag = '[object Int8Array]',
	    int16Tag = '[object Int16Array]',
	    int32Tag = '[object Int32Array]',
	    uint8Tag = '[object Uint8Array]',
	    uint8ClampedTag = '[object Uint8ClampedArray]',
	    uint16Tag = '[object Uint16Array]',
	    uint32Tag = '[object Uint32Array]';

	/** Used to identify `toStringTag` values of typed arrays. */
	var typedArrayTags = {};
	typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
	typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
	typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
	typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
	typedArrayTags[uint32Tag] = true;
	typedArrayTags[argsTag$1] = typedArrayTags[arrayTag$1] =
	typedArrayTags[arrayBufferTag$1] = typedArrayTags[boolTag$1] =
	typedArrayTags[dataViewTag$2] = typedArrayTags[dateTag$1] =
	typedArrayTags[errorTag$1] = typedArrayTags[funcTag] =
	typedArrayTags[mapTag$4] = typedArrayTags[numberTag$1] =
	typedArrayTags[objectTag$2] = typedArrayTags[regexpTag$1] =
	typedArrayTags[setTag$4] = typedArrayTags[stringTag$2] =
	typedArrayTags[weakMapTag$1] = false;

	/**
	 * The base implementation of `_.isTypedArray` without Node.js optimizations.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
	 */
	function baseIsTypedArray$1(value) {
	  return isObjectLike$2(value) &&
	    isLength$2(value.length) && !!typedArrayTags[baseGetTag$2(value)];
	}

	var _baseIsTypedArray = baseIsTypedArray$1;

	/**
	 * The base implementation of `_.unary` without support for storing metadata.
	 *
	 * @private
	 * @param {Function} func The function to cap arguments for.
	 * @returns {Function} Returns the new capped function.
	 */

	function baseUnary$2(func) {
	  return function(value) {
	    return func(value);
	  };
	}

	var _baseUnary = baseUnary$2;

	var _nodeUtil = {exports: {}};

	(function (module, exports) {
	var freeGlobal = _freeGlobal;

	/** Detect free variable `exports`. */
	var freeExports = exports && !exports.nodeType && exports;

	/** Detect free variable `module`. */
	var freeModule = freeExports && 'object' == 'object' && module && !module.nodeType && module;

	/** Detect the popular CommonJS extension `module.exports`. */
	var moduleExports = freeModule && freeModule.exports === freeExports;

	/** Detect free variable `process` from Node.js. */
	var freeProcess = moduleExports && freeGlobal.process;

	/** Used to access faster Node.js helpers. */
	var nodeUtil = (function() {
	  try {
	    // Use `util.types` for Node.js 10+.
	    var types = freeModule && freeModule.require && freeModule.require('util').types;

	    if (types) {
	      return types;
	    }

	    // Legacy `process.binding('util')` for Node.js < 10.
	    return freeProcess && freeProcess.binding && freeProcess.binding('util');
	  } catch (e) {}
	}());

	module.exports = nodeUtil;
	}(_nodeUtil, _nodeUtil.exports));

	var baseIsTypedArray = _baseIsTypedArray,
	    baseUnary$1 = _baseUnary,
	    nodeUtil = _nodeUtil.exports;

	/* Node.js helper references. */
	var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;

	/**
	 * Checks if `value` is classified as a typed array.
	 *
	 * @static
	 * @memberOf _
	 * @since 3.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
	 * @example
	 *
	 * _.isTypedArray(new Uint8Array);
	 * // => true
	 *
	 * _.isTypedArray([]);
	 * // => false
	 */
	var isTypedArray$3 = nodeIsTypedArray ? baseUnary$1(nodeIsTypedArray) : baseIsTypedArray;

	var isTypedArray_1 = isTypedArray$3;

	var baseTimes = _baseTimes,
	    isArguments$3 = isArguments_1,
	    isArray$e = isArray_1,
	    isBuffer$3 = isBuffer$4.exports,
	    isIndex$2 = _isIndex,
	    isTypedArray$2 = isTypedArray_1;

	/** Used for built-in method references. */
	var objectProto$6 = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty$4 = objectProto$6.hasOwnProperty;

	/**
	 * Creates an array of the enumerable property names of the array-like `value`.
	 *
	 * @private
	 * @param {*} value The value to query.
	 * @param {boolean} inherited Specify returning inherited property names.
	 * @returns {Array} Returns the array of property names.
	 */
	function arrayLikeKeys$1(value, inherited) {
	  var isArr = isArray$e(value),
	      isArg = !isArr && isArguments$3(value),
	      isBuff = !isArr && !isArg && isBuffer$3(value),
	      isType = !isArr && !isArg && !isBuff && isTypedArray$2(value),
	      skipIndexes = isArr || isArg || isBuff || isType,
	      result = skipIndexes ? baseTimes(value.length, String) : [],
	      length = result.length;

	  for (var key in value) {
	    if ((inherited || hasOwnProperty$4.call(value, key)) &&
	        !(skipIndexes && (
	           // Safari 9 has enumerable `arguments.length` in strict mode.
	           key == 'length' ||
	           // Node.js 0.10 has enumerable non-index properties on buffers.
	           (isBuff && (key == 'offset' || key == 'parent')) ||
	           // PhantomJS 2 has enumerable non-index properties on typed arrays.
	           (isType && (key == 'buffer' || key == 'byteLength' || key == 'byteOffset')) ||
	           // Skip index properties.
	           isIndex$2(key, length)
	        ))) {
	      result.push(key);
	    }
	  }
	  return result;
	}

	var _arrayLikeKeys = arrayLikeKeys$1;

	/** Used for built-in method references. */

	var objectProto$5 = Object.prototype;

	/**
	 * Checks if `value` is likely a prototype object.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
	 */
	function isPrototype$2(value) {
	  var Ctor = value && value.constructor,
	      proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto$5;

	  return value === proto;
	}

	var _isPrototype = isPrototype$2;

	/**
	 * Creates a unary function that invokes `func` with its argument transformed.
	 *
	 * @private
	 * @param {Function} func The function to wrap.
	 * @param {Function} transform The argument transform.
	 * @returns {Function} Returns the new function.
	 */

	function overArg$1(func, transform) {
	  return function(arg) {
	    return func(transform(arg));
	  };
	}

	var _overArg = overArg$1;

	var overArg = _overArg;

	/* Built-in method references for those with the same name as other `lodash` methods. */
	var nativeKeys$1 = overArg(Object.keys, Object);

	var _nativeKeys = nativeKeys$1;

	var isPrototype$1 = _isPrototype,
	    nativeKeys = _nativeKeys;

	/** Used for built-in method references. */
	var objectProto$4 = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty$3 = objectProto$4.hasOwnProperty;

	/**
	 * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property names.
	 */
	function baseKeys$3(object) {
	  if (!isPrototype$1(object)) {
	    return nativeKeys(object);
	  }
	  var result = [];
	  for (var key in Object(object)) {
	    if (hasOwnProperty$3.call(object, key) && key != 'constructor') {
	      result.push(key);
	    }
	  }
	  return result;
	}

	var _baseKeys = baseKeys$3;

	var isFunction = isFunction_1,
	    isLength$1 = isLength_1;

	/**
	 * Checks if `value` is array-like. A value is considered array-like if it's
	 * not a function and has a `value.length` that's an integer greater than or
	 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
	 * @example
	 *
	 * _.isArrayLike([1, 2, 3]);
	 * // => true
	 *
	 * _.isArrayLike(document.body.children);
	 * // => true
	 *
	 * _.isArrayLike('abc');
	 * // => true
	 *
	 * _.isArrayLike(_.noop);
	 * // => false
	 */
	function isArrayLike$6(value) {
	  return value != null && isLength$1(value.length) && !isFunction(value);
	}

	var isArrayLike_1 = isArrayLike$6;

	var arrayLikeKeys = _arrayLikeKeys,
	    baseKeys$2 = _baseKeys,
	    isArrayLike$5 = isArrayLike_1;

	/**
	 * Creates an array of the own enumerable property names of `object`.
	 *
	 * **Note:** Non-object values are coerced to objects. See the
	 * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
	 * for more details.
	 *
	 * @static
	 * @since 0.1.0
	 * @memberOf _
	 * @category Object
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property names.
	 * @example
	 *
	 * function Foo() {
	 *   this.a = 1;
	 *   this.b = 2;
	 * }
	 *
	 * Foo.prototype.c = 3;
	 *
	 * _.keys(new Foo);
	 * // => ['a', 'b'] (iteration order is not guaranteed)
	 *
	 * _.keys('hi');
	 * // => ['0', '1']
	 */
	function keys$3(object) {
	  return isArrayLike$5(object) ? arrayLikeKeys(object) : baseKeys$2(object);
	}

	var keys_1 = keys$3;

	var baseFor = _baseFor,
	    keys$2 = keys_1;

	/**
	 * The base implementation of `_.forOwn` without support for iteratee shorthands.
	 *
	 * @private
	 * @param {Object} object The object to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @returns {Object} Returns `object`.
	 */
	function baseForOwn$1(object, iteratee) {
	  return object && baseFor(object, iteratee, keys$2);
	}

	var _baseForOwn = baseForOwn$1;

	var isArrayLike$4 = isArrayLike_1;

	/**
	 * Creates a `baseEach` or `baseEachRight` function.
	 *
	 * @private
	 * @param {Function} eachFunc The function to iterate over a collection.
	 * @param {boolean} [fromRight] Specify iterating from right to left.
	 * @returns {Function} Returns the new base function.
	 */
	function createBaseEach$1(eachFunc, fromRight) {
	  return function(collection, iteratee) {
	    if (collection == null) {
	      return collection;
	    }
	    if (!isArrayLike$4(collection)) {
	      return eachFunc(collection, iteratee);
	    }
	    var length = collection.length,
	        index = fromRight ? length : -1,
	        iterable = Object(collection);

	    while ((fromRight ? index-- : ++index < length)) {
	      if (iteratee(iterable[index], index, iterable) === false) {
	        break;
	      }
	    }
	    return collection;
	  };
	}

	var _createBaseEach = createBaseEach$1;

	var baseForOwn = _baseForOwn,
	    createBaseEach = _createBaseEach;

	/**
	 * The base implementation of `_.forEach` without support for iteratee shorthands.
	 *
	 * @private
	 * @param {Array|Object} collection The collection to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @returns {Array|Object} Returns `collection`.
	 */
	var baseEach$2 = createBaseEach(baseForOwn);

	var _baseEach = baseEach$2;

	var baseEach$1 = _baseEach;

	/**
	 * The base implementation of `_.filter` without support for iteratee shorthands.
	 *
	 * @private
	 * @param {Array|Object} collection The collection to iterate over.
	 * @param {Function} predicate The function invoked per iteration.
	 * @returns {Array} Returns the new filtered array.
	 */
	function baseFilter$1(collection, predicate) {
	  var result = [];
	  baseEach$1(collection, function(value, index, collection) {
	    if (predicate(value, index, collection)) {
	      result.push(value);
	    }
	  });
	  return result;
	}

	var _baseFilter = baseFilter$1;

	var ListCache$2 = _ListCache;

	/**
	 * Removes all key-value entries from the stack.
	 *
	 * @private
	 * @name clear
	 * @memberOf Stack
	 */
	function stackClear$1() {
	  this.__data__ = new ListCache$2;
	  this.size = 0;
	}

	var _stackClear = stackClear$1;

	/**
	 * Removes `key` and its value from the stack.
	 *
	 * @private
	 * @name delete
	 * @memberOf Stack
	 * @param {string} key The key of the value to remove.
	 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
	 */

	function stackDelete$1(key) {
	  var data = this.__data__,
	      result = data['delete'](key);

	  this.size = data.size;
	  return result;
	}

	var _stackDelete = stackDelete$1;

	/**
	 * Gets the stack value for `key`.
	 *
	 * @private
	 * @name get
	 * @memberOf Stack
	 * @param {string} key The key of the value to get.
	 * @returns {*} Returns the entry value.
	 */

	function stackGet$1(key) {
	  return this.__data__.get(key);
	}

	var _stackGet = stackGet$1;

	/**
	 * Checks if a stack value for `key` exists.
	 *
	 * @private
	 * @name has
	 * @memberOf Stack
	 * @param {string} key The key of the entry to check.
	 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	 */

	function stackHas$1(key) {
	  return this.__data__.has(key);
	}

	var _stackHas = stackHas$1;

	var ListCache$1 = _ListCache,
	    Map$2 = _Map,
	    MapCache$1 = _MapCache;

	/** Used as the size to enable large array optimizations. */
	var LARGE_ARRAY_SIZE = 200;

	/**
	 * Sets the stack `key` to `value`.
	 *
	 * @private
	 * @name set
	 * @memberOf Stack
	 * @param {string} key The key of the value to set.
	 * @param {*} value The value to set.
	 * @returns {Object} Returns the stack cache instance.
	 */
	function stackSet$1(key, value) {
	  var data = this.__data__;
	  if (data instanceof ListCache$1) {
	    var pairs = data.__data__;
	    if (!Map$2 || (pairs.length < LARGE_ARRAY_SIZE - 1)) {
	      pairs.push([key, value]);
	      this.size = ++data.size;
	      return this;
	    }
	    data = this.__data__ = new MapCache$1(pairs);
	  }
	  data.set(key, value);
	  this.size = data.size;
	  return this;
	}

	var _stackSet = stackSet$1;

	var ListCache = _ListCache,
	    stackClear = _stackClear,
	    stackDelete = _stackDelete,
	    stackGet = _stackGet,
	    stackHas = _stackHas,
	    stackSet = _stackSet;

	/**
	 * Creates a stack cache object to store key-value pairs.
	 *
	 * @private
	 * @constructor
	 * @param {Array} [entries] The key-value pairs to cache.
	 */
	function Stack$2(entries) {
	  var data = this.__data__ = new ListCache(entries);
	  this.size = data.size;
	}

	// Add methods to `Stack`.
	Stack$2.prototype.clear = stackClear;
	Stack$2.prototype['delete'] = stackDelete;
	Stack$2.prototype.get = stackGet;
	Stack$2.prototype.has = stackHas;
	Stack$2.prototype.set = stackSet;

	var _Stack = Stack$2;

	/** Used to stand-in for `undefined` hash values. */

	var HASH_UNDEFINED = '__lodash_hash_undefined__';

	/**
	 * Adds `value` to the array cache.
	 *
	 * @private
	 * @name add
	 * @memberOf SetCache
	 * @alias push
	 * @param {*} value The value to cache.
	 * @returns {Object} Returns the cache instance.
	 */
	function setCacheAdd$1(value) {
	  this.__data__.set(value, HASH_UNDEFINED);
	  return this;
	}

	var _setCacheAdd = setCacheAdd$1;

	/**
	 * Checks if `value` is in the array cache.
	 *
	 * @private
	 * @name has
	 * @memberOf SetCache
	 * @param {*} value The value to search for.
	 * @returns {boolean} Returns `true` if `value` is found, else `false`.
	 */

	function setCacheHas$1(value) {
	  return this.__data__.has(value);
	}

	var _setCacheHas = setCacheHas$1;

	var MapCache = _MapCache,
	    setCacheAdd = _setCacheAdd,
	    setCacheHas = _setCacheHas;

	/**
	 *
	 * Creates an array cache object to store unique values.
	 *
	 * @private
	 * @constructor
	 * @param {Array} [values] The values to cache.
	 */
	function SetCache$1(values) {
	  var index = -1,
	      length = values == null ? 0 : values.length;

	  this.__data__ = new MapCache;
	  while (++index < length) {
	    this.add(values[index]);
	  }
	}

	// Add methods to `SetCache`.
	SetCache$1.prototype.add = SetCache$1.prototype.push = setCacheAdd;
	SetCache$1.prototype.has = setCacheHas;

	var _SetCache = SetCache$1;

	/**
	 * A specialized version of `_.some` for arrays without support for iteratee
	 * shorthands.
	 *
	 * @private
	 * @param {Array} [array] The array to iterate over.
	 * @param {Function} predicate The function invoked per iteration.
	 * @returns {boolean} Returns `true` if any element passes the predicate check,
	 *  else `false`.
	 */

	function arraySome$1(array, predicate) {
	  var index = -1,
	      length = array == null ? 0 : array.length;

	  while (++index < length) {
	    if (predicate(array[index], index, array)) {
	      return true;
	    }
	  }
	  return false;
	}

	var _arraySome = arraySome$1;

	/**
	 * Checks if a `cache` value for `key` exists.
	 *
	 * @private
	 * @param {Object} cache The cache to query.
	 * @param {string} key The key of the entry to check.
	 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	 */

	function cacheHas$1(cache, key) {
	  return cache.has(key);
	}

	var _cacheHas = cacheHas$1;

	var SetCache = _SetCache,
	    arraySome = _arraySome,
	    cacheHas = _cacheHas;

	/** Used to compose bitmasks for value comparisons. */
	var COMPARE_PARTIAL_FLAG$5 = 1,
	    COMPARE_UNORDERED_FLAG$3 = 2;

	/**
	 * A specialized version of `baseIsEqualDeep` for arrays with support for
	 * partial deep comparisons.
	 *
	 * @private
	 * @param {Array} array The array to compare.
	 * @param {Array} other The other array to compare.
	 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
	 * @param {Function} customizer The function to customize comparisons.
	 * @param {Function} equalFunc The function to determine equivalents of values.
	 * @param {Object} stack Tracks traversed `array` and `other` objects.
	 * @returns {boolean} Returns `true` if the arrays are equivalent, else `false`.
	 */
	function equalArrays$2(array, other, bitmask, customizer, equalFunc, stack) {
	  var isPartial = bitmask & COMPARE_PARTIAL_FLAG$5,
	      arrLength = array.length,
	      othLength = other.length;

	  if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
	    return false;
	  }
	  // Check that cyclic values are equal.
	  var arrStacked = stack.get(array);
	  var othStacked = stack.get(other);
	  if (arrStacked && othStacked) {
	    return arrStacked == other && othStacked == array;
	  }
	  var index = -1,
	      result = true,
	      seen = (bitmask & COMPARE_UNORDERED_FLAG$3) ? new SetCache : undefined;

	  stack.set(array, other);
	  stack.set(other, array);

	  // Ignore non-index properties.
	  while (++index < arrLength) {
	    var arrValue = array[index],
	        othValue = other[index];

	    if (customizer) {
	      var compared = isPartial
	        ? customizer(othValue, arrValue, index, other, array, stack)
	        : customizer(arrValue, othValue, index, array, other, stack);
	    }
	    if (compared !== undefined) {
	      if (compared) {
	        continue;
	      }
	      result = false;
	      break;
	    }
	    // Recursively compare arrays (susceptible to call stack limits).
	    if (seen) {
	      if (!arraySome(other, function(othValue, othIndex) {
	            if (!cacheHas(seen, othIndex) &&
	                (arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) {
	              return seen.push(othIndex);
	            }
	          })) {
	        result = false;
	        break;
	      }
	    } else if (!(
	          arrValue === othValue ||
	            equalFunc(arrValue, othValue, bitmask, customizer, stack)
	        )) {
	      result = false;
	      break;
	    }
	  }
	  stack['delete'](array);
	  stack['delete'](other);
	  return result;
	}

	var _equalArrays = equalArrays$2;

	var root$4 = _root;

	/** Built-in value references. */
	var Uint8Array$2 = root$4.Uint8Array;

	var _Uint8Array = Uint8Array$2;

	/**
	 * Converts `map` to its key-value pairs.
	 *
	 * @private
	 * @param {Object} map The map to convert.
	 * @returns {Array} Returns the key-value pairs.
	 */

	function mapToArray$1(map) {
	  var index = -1,
	      result = Array(map.size);

	  map.forEach(function(value, key) {
	    result[++index] = [key, value];
	  });
	  return result;
	}

	var _mapToArray = mapToArray$1;

	/**
	 * Converts `set` to an array of its values.
	 *
	 * @private
	 * @param {Object} set The set to convert.
	 * @returns {Array} Returns the values.
	 */

	function setToArray$1(set) {
	  var index = -1,
	      result = Array(set.size);

	  set.forEach(function(value) {
	    result[++index] = value;
	  });
	  return result;
	}

	var _setToArray = setToArray$1;

	var Symbol$2 = _Symbol,
	    Uint8Array$1 = _Uint8Array,
	    eq$1 = eq_1,
	    equalArrays$1 = _equalArrays,
	    mapToArray = _mapToArray,
	    setToArray = _setToArray;

	/** Used to compose bitmasks for value comparisons. */
	var COMPARE_PARTIAL_FLAG$4 = 1,
	    COMPARE_UNORDERED_FLAG$2 = 2;

	/** `Object#toString` result references. */
	var boolTag = '[object Boolean]',
	    dateTag = '[object Date]',
	    errorTag = '[object Error]',
	    mapTag$3 = '[object Map]',
	    numberTag = '[object Number]',
	    regexpTag = '[object RegExp]',
	    setTag$3 = '[object Set]',
	    stringTag$1 = '[object String]',
	    symbolTag = '[object Symbol]';

	var arrayBufferTag = '[object ArrayBuffer]',
	    dataViewTag$1 = '[object DataView]';

	/** Used to convert symbols to primitives and strings. */
	var symbolProto = Symbol$2 ? Symbol$2.prototype : undefined,
	    symbolValueOf = symbolProto ? symbolProto.valueOf : undefined;

	/**
	 * A specialized version of `baseIsEqualDeep` for comparing objects of
	 * the same `toStringTag`.
	 *
	 * **Note:** This function only supports comparing values with tags of
	 * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
	 *
	 * @private
	 * @param {Object} object The object to compare.
	 * @param {Object} other The other object to compare.
	 * @param {string} tag The `toStringTag` of the objects to compare.
	 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
	 * @param {Function} customizer The function to customize comparisons.
	 * @param {Function} equalFunc The function to determine equivalents of values.
	 * @param {Object} stack Tracks traversed `object` and `other` objects.
	 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
	 */
	function equalByTag$1(object, other, tag, bitmask, customizer, equalFunc, stack) {
	  switch (tag) {
	    case dataViewTag$1:
	      if ((object.byteLength != other.byteLength) ||
	          (object.byteOffset != other.byteOffset)) {
	        return false;
	      }
	      object = object.buffer;
	      other = other.buffer;

	    case arrayBufferTag:
	      if ((object.byteLength != other.byteLength) ||
	          !equalFunc(new Uint8Array$1(object), new Uint8Array$1(other))) {
	        return false;
	      }
	      return true;

	    case boolTag:
	    case dateTag:
	    case numberTag:
	      // Coerce booleans to `1` or `0` and dates to milliseconds.
	      // Invalid dates are coerced to `NaN`.
	      return eq$1(+object, +other);

	    case errorTag:
	      return object.name == other.name && object.message == other.message;

	    case regexpTag:
	    case stringTag$1:
	      // Coerce regexes to strings and treat strings, primitives and objects,
	      // as equal. See http://www.ecma-international.org/ecma-262/7.0/#sec-regexp.prototype.tostring
	      // for more details.
	      return object == (other + '');

	    case mapTag$3:
	      var convert = mapToArray;

	    case setTag$3:
	      var isPartial = bitmask & COMPARE_PARTIAL_FLAG$4;
	      convert || (convert = setToArray);

	      if (object.size != other.size && !isPartial) {
	        return false;
	      }
	      // Assume cyclic values are equal.
	      var stacked = stack.get(object);
	      if (stacked) {
	        return stacked == other;
	      }
	      bitmask |= COMPARE_UNORDERED_FLAG$2;

	      // Recursively compare objects (susceptible to call stack limits).
	      stack.set(object, other);
	      var result = equalArrays$1(convert(object), convert(other), bitmask, customizer, equalFunc, stack);
	      stack['delete'](object);
	      return result;

	    case symbolTag:
	      if (symbolValueOf) {
	        return symbolValueOf.call(object) == symbolValueOf.call(other);
	      }
	  }
	  return false;
	}

	var _equalByTag = equalByTag$1;

	/**
	 * Appends the elements of `values` to `array`.
	 *
	 * @private
	 * @param {Array} array The array to modify.
	 * @param {Array} values The values to append.
	 * @returns {Array} Returns `array`.
	 */

	function arrayPush$2(array, values) {
	  var index = -1,
	      length = values.length,
	      offset = array.length;

	  while (++index < length) {
	    array[offset + index] = values[index];
	  }
	  return array;
	}

	var _arrayPush = arrayPush$2;

	var arrayPush$1 = _arrayPush,
	    isArray$d = isArray_1;

	/**
	 * The base implementation of `getAllKeys` and `getAllKeysIn` which uses
	 * `keysFunc` and `symbolsFunc` to get the enumerable property names and
	 * symbols of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {Function} keysFunc The function to get the keys of `object`.
	 * @param {Function} symbolsFunc The function to get the symbols of `object`.
	 * @returns {Array} Returns the array of property names and symbols.
	 */
	function baseGetAllKeys$1(object, keysFunc, symbolsFunc) {
	  var result = keysFunc(object);
	  return isArray$d(object) ? result : arrayPush$1(result, symbolsFunc(object));
	}

	var _baseGetAllKeys = baseGetAllKeys$1;

	/**
	 * This method returns a new empty array.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.13.0
	 * @category Util
	 * @returns {Array} Returns the new empty array.
	 * @example
	 *
	 * var arrays = _.times(2, _.stubArray);
	 *
	 * console.log(arrays);
	 * // => [[], []]
	 *
	 * console.log(arrays[0] === arrays[1]);
	 * // => false
	 */

	function stubArray$1() {
	  return [];
	}

	var stubArray_1 = stubArray$1;

	var arrayFilter$1 = _arrayFilter,
	    stubArray = stubArray_1;

	/** Used for built-in method references. */
	var objectProto$3 = Object.prototype;

	/** Built-in value references. */
	var propertyIsEnumerable = objectProto$3.propertyIsEnumerable;

	/* Built-in method references for those with the same name as other `lodash` methods. */
	var nativeGetSymbols = Object.getOwnPropertySymbols;

	/**
	 * Creates an array of the own enumerable symbols of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of symbols.
	 */
	var getSymbols$1 = !nativeGetSymbols ? stubArray : function(object) {
	  if (object == null) {
	    return [];
	  }
	  object = Object(object);
	  return arrayFilter$1(nativeGetSymbols(object), function(symbol) {
	    return propertyIsEnumerable.call(object, symbol);
	  });
	};

	var _getSymbols = getSymbols$1;

	var baseGetAllKeys = _baseGetAllKeys,
	    getSymbols = _getSymbols,
	    keys$1 = keys_1;

	/**
	 * Creates an array of own enumerable property names and symbols of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property names and symbols.
	 */
	function getAllKeys$1(object) {
	  return baseGetAllKeys(object, keys$1, getSymbols);
	}

	var _getAllKeys = getAllKeys$1;

	var getAllKeys = _getAllKeys;

	/** Used to compose bitmasks for value comparisons. */
	var COMPARE_PARTIAL_FLAG$3 = 1;

	/** Used for built-in method references. */
	var objectProto$2 = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty$2 = objectProto$2.hasOwnProperty;

	/**
	 * A specialized version of `baseIsEqualDeep` for objects with support for
	 * partial deep comparisons.
	 *
	 * @private
	 * @param {Object} object The object to compare.
	 * @param {Object} other The other object to compare.
	 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
	 * @param {Function} customizer The function to customize comparisons.
	 * @param {Function} equalFunc The function to determine equivalents of values.
	 * @param {Object} stack Tracks traversed `object` and `other` objects.
	 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
	 */
	function equalObjects$1(object, other, bitmask, customizer, equalFunc, stack) {
	  var isPartial = bitmask & COMPARE_PARTIAL_FLAG$3,
	      objProps = getAllKeys(object),
	      objLength = objProps.length,
	      othProps = getAllKeys(other),
	      othLength = othProps.length;

	  if (objLength != othLength && !isPartial) {
	    return false;
	  }
	  var index = objLength;
	  while (index--) {
	    var key = objProps[index];
	    if (!(isPartial ? key in other : hasOwnProperty$2.call(other, key))) {
	      return false;
	    }
	  }
	  // Check that cyclic values are equal.
	  var objStacked = stack.get(object);
	  var othStacked = stack.get(other);
	  if (objStacked && othStacked) {
	    return objStacked == other && othStacked == object;
	  }
	  var result = true;
	  stack.set(object, other);
	  stack.set(other, object);

	  var skipCtor = isPartial;
	  while (++index < objLength) {
	    key = objProps[index];
	    var objValue = object[key],
	        othValue = other[key];

	    if (customizer) {
	      var compared = isPartial
	        ? customizer(othValue, objValue, key, other, object, stack)
	        : customizer(objValue, othValue, key, object, other, stack);
	    }
	    // Recursively compare objects (susceptible to call stack limits).
	    if (!(compared === undefined
	          ? (objValue === othValue || equalFunc(objValue, othValue, bitmask, customizer, stack))
	          : compared
	        )) {
	      result = false;
	      break;
	    }
	    skipCtor || (skipCtor = key == 'constructor');
	  }
	  if (result && !skipCtor) {
	    var objCtor = object.constructor,
	        othCtor = other.constructor;

	    // Non `Object` object instances with different constructors are not equal.
	    if (objCtor != othCtor &&
	        ('constructor' in object && 'constructor' in other) &&
	        !(typeof objCtor == 'function' && objCtor instanceof objCtor &&
	          typeof othCtor == 'function' && othCtor instanceof othCtor)) {
	      result = false;
	    }
	  }
	  stack['delete'](object);
	  stack['delete'](other);
	  return result;
	}

	var _equalObjects = equalObjects$1;

	var getNative$4 = _getNative,
	    root$3 = _root;

	/* Built-in method references that are verified to be native. */
	var DataView$2 = getNative$4(root$3, 'DataView');

	var _DataView = DataView$2;

	var getNative$3 = _getNative,
	    root$2 = _root;

	/* Built-in method references that are verified to be native. */
	var Promise$2 = getNative$3(root$2, 'Promise');

	var _Promise = Promise$2;

	var getNative$2 = _getNative,
	    root$1 = _root;

	/* Built-in method references that are verified to be native. */
	var Set$2 = getNative$2(root$1, 'Set');

	var _Set = Set$2;

	var getNative$1 = _getNative,
	    root = _root;

	/* Built-in method references that are verified to be native. */
	var WeakMap$2 = getNative$1(root, 'WeakMap');

	var _WeakMap = WeakMap$2;

	var DataView$1 = _DataView,
	    Map$1 = _Map,
	    Promise$1 = _Promise,
	    Set$1 = _Set,
	    WeakMap$1 = _WeakMap,
	    baseGetTag$1 = _baseGetTag,
	    toSource = _toSource;

	/** `Object#toString` result references. */
	var mapTag$2 = '[object Map]',
	    objectTag$1 = '[object Object]',
	    promiseTag = '[object Promise]',
	    setTag$2 = '[object Set]',
	    weakMapTag = '[object WeakMap]';

	var dataViewTag = '[object DataView]';

	/** Used to detect maps, sets, and weakmaps. */
	var dataViewCtorString = toSource(DataView$1),
	    mapCtorString = toSource(Map$1),
	    promiseCtorString = toSource(Promise$1),
	    setCtorString = toSource(Set$1),
	    weakMapCtorString = toSource(WeakMap$1);

	/**
	 * Gets the `toStringTag` of `value`.
	 *
	 * @private
	 * @param {*} value The value to query.
	 * @returns {string} Returns the `toStringTag`.
	 */
	var getTag$3 = baseGetTag$1;

	// Fallback for data views, maps, sets, and weak maps in IE 11 and promises in Node.js < 6.
	if ((DataView$1 && getTag$3(new DataView$1(new ArrayBuffer(1))) != dataViewTag) ||
	    (Map$1 && getTag$3(new Map$1) != mapTag$2) ||
	    (Promise$1 && getTag$3(Promise$1.resolve()) != promiseTag) ||
	    (Set$1 && getTag$3(new Set$1) != setTag$2) ||
	    (WeakMap$1 && getTag$3(new WeakMap$1) != weakMapTag)) {
	  getTag$3 = function(value) {
	    var result = baseGetTag$1(value),
	        Ctor = result == objectTag$1 ? value.constructor : undefined,
	        ctorString = Ctor ? toSource(Ctor) : '';

	    if (ctorString) {
	      switch (ctorString) {
	        case dataViewCtorString: return dataViewTag;
	        case mapCtorString: return mapTag$2;
	        case promiseCtorString: return promiseTag;
	        case setCtorString: return setTag$2;
	        case weakMapCtorString: return weakMapTag;
	      }
	    }
	    return result;
	  };
	}

	var _getTag = getTag$3;

	var Stack$1 = _Stack,
	    equalArrays = _equalArrays,
	    equalByTag = _equalByTag,
	    equalObjects = _equalObjects,
	    getTag$2 = _getTag,
	    isArray$c = isArray_1,
	    isBuffer$2 = isBuffer$4.exports,
	    isTypedArray$1 = isTypedArray_1;

	/** Used to compose bitmasks for value comparisons. */
	var COMPARE_PARTIAL_FLAG$2 = 1;

	/** `Object#toString` result references. */
	var argsTag = '[object Arguments]',
	    arrayTag = '[object Array]',
	    objectTag = '[object Object]';

	/** Used for built-in method references. */
	var objectProto$1 = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty$1 = objectProto$1.hasOwnProperty;

	/**
	 * A specialized version of `baseIsEqual` for arrays and objects which performs
	 * deep comparisons and tracks traversed objects enabling objects with circular
	 * references to be compared.
	 *
	 * @private
	 * @param {Object} object The object to compare.
	 * @param {Object} other The other object to compare.
	 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
	 * @param {Function} customizer The function to customize comparisons.
	 * @param {Function} equalFunc The function to determine equivalents of values.
	 * @param {Object} [stack] Tracks traversed `object` and `other` objects.
	 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
	 */
	function baseIsEqualDeep$1(object, other, bitmask, customizer, equalFunc, stack) {
	  var objIsArr = isArray$c(object),
	      othIsArr = isArray$c(other),
	      objTag = objIsArr ? arrayTag : getTag$2(object),
	      othTag = othIsArr ? arrayTag : getTag$2(other);

	  objTag = objTag == argsTag ? objectTag : objTag;
	  othTag = othTag == argsTag ? objectTag : othTag;

	  var objIsObj = objTag == objectTag,
	      othIsObj = othTag == objectTag,
	      isSameTag = objTag == othTag;

	  if (isSameTag && isBuffer$2(object)) {
	    if (!isBuffer$2(other)) {
	      return false;
	    }
	    objIsArr = true;
	    objIsObj = false;
	  }
	  if (isSameTag && !objIsObj) {
	    stack || (stack = new Stack$1);
	    return (objIsArr || isTypedArray$1(object))
	      ? equalArrays(object, other, bitmask, customizer, equalFunc, stack)
	      : equalByTag(object, other, objTag, bitmask, customizer, equalFunc, stack);
	  }
	  if (!(bitmask & COMPARE_PARTIAL_FLAG$2)) {
	    var objIsWrapped = objIsObj && hasOwnProperty$1.call(object, '__wrapped__'),
	        othIsWrapped = othIsObj && hasOwnProperty$1.call(other, '__wrapped__');

	    if (objIsWrapped || othIsWrapped) {
	      var objUnwrapped = objIsWrapped ? object.value() : object,
	          othUnwrapped = othIsWrapped ? other.value() : other;

	      stack || (stack = new Stack$1);
	      return equalFunc(objUnwrapped, othUnwrapped, bitmask, customizer, stack);
	    }
	  }
	  if (!isSameTag) {
	    return false;
	  }
	  stack || (stack = new Stack$1);
	  return equalObjects(object, other, bitmask, customizer, equalFunc, stack);
	}

	var _baseIsEqualDeep = baseIsEqualDeep$1;

	var baseIsEqualDeep = _baseIsEqualDeep,
	    isObjectLike$1 = isObjectLike_1;

	/**
	 * The base implementation of `_.isEqual` which supports partial comparisons
	 * and tracks traversed objects.
	 *
	 * @private
	 * @param {*} value The value to compare.
	 * @param {*} other The other value to compare.
	 * @param {boolean} bitmask The bitmask flags.
	 *  1 - Unordered comparison
	 *  2 - Partial comparison
	 * @param {Function} [customizer] The function to customize comparisons.
	 * @param {Object} [stack] Tracks traversed `value` and `other` objects.
	 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
	 */
	function baseIsEqual$2(value, other, bitmask, customizer, stack) {
	  if (value === other) {
	    return true;
	  }
	  if (value == null || other == null || (!isObjectLike$1(value) && !isObjectLike$1(other))) {
	    return value !== value && other !== other;
	  }
	  return baseIsEqualDeep(value, other, bitmask, customizer, baseIsEqual$2, stack);
	}

	var _baseIsEqual = baseIsEqual$2;

	var Stack = _Stack,
	    baseIsEqual$1 = _baseIsEqual;

	/** Used to compose bitmasks for value comparisons. */
	var COMPARE_PARTIAL_FLAG$1 = 1,
	    COMPARE_UNORDERED_FLAG$1 = 2;

	/**
	 * The base implementation of `_.isMatch` without support for iteratee shorthands.
	 *
	 * @private
	 * @param {Object} object The object to inspect.
	 * @param {Object} source The object of property values to match.
	 * @param {Array} matchData The property names, values, and compare flags to match.
	 * @param {Function} [customizer] The function to customize comparisons.
	 * @returns {boolean} Returns `true` if `object` is a match, else `false`.
	 */
	function baseIsMatch$1(object, source, matchData, customizer) {
	  var index = matchData.length,
	      length = index,
	      noCustomizer = !customizer;

	  if (object == null) {
	    return !length;
	  }
	  object = Object(object);
	  while (index--) {
	    var data = matchData[index];
	    if ((noCustomizer && data[2])
	          ? data[1] !== object[data[0]]
	          : !(data[0] in object)
	        ) {
	      return false;
	    }
	  }
	  while (++index < length) {
	    data = matchData[index];
	    var key = data[0],
	        objValue = object[key],
	        srcValue = data[1];

	    if (noCustomizer && data[2]) {
	      if (objValue === undefined && !(key in object)) {
	        return false;
	      }
	    } else {
	      var stack = new Stack;
	      if (customizer) {
	        var result = customizer(objValue, srcValue, key, object, source, stack);
	      }
	      if (!(result === undefined
	            ? baseIsEqual$1(srcValue, objValue, COMPARE_PARTIAL_FLAG$1 | COMPARE_UNORDERED_FLAG$1, customizer, stack)
	            : result
	          )) {
	        return false;
	      }
	    }
	  }
	  return true;
	}

	var _baseIsMatch = baseIsMatch$1;

	var isObject$1 = isObject_1;

	/**
	 * Checks if `value` is suitable for strict equality comparisons, i.e. `===`.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` if suitable for strict
	 *  equality comparisons, else `false`.
	 */
	function isStrictComparable$2(value) {
	  return value === value && !isObject$1(value);
	}

	var _isStrictComparable = isStrictComparable$2;

	var isStrictComparable$1 = _isStrictComparable,
	    keys = keys_1;

	/**
	 * Gets the property names, values, and compare flags of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the match data of `object`.
	 */
	function getMatchData$1(object) {
	  var result = keys(object),
	      length = result.length;

	  while (length--) {
	    var key = result[length],
	        value = object[key];

	    result[length] = [key, value, isStrictComparable$1(value)];
	  }
	  return result;
	}

	var _getMatchData = getMatchData$1;

	/**
	 * A specialized version of `matchesProperty` for source values suitable
	 * for strict equality comparisons, i.e. `===`.
	 *
	 * @private
	 * @param {string} key The key of the property to get.
	 * @param {*} srcValue The value to match.
	 * @returns {Function} Returns the new spec function.
	 */

	function matchesStrictComparable$2(key, srcValue) {
	  return function(object) {
	    if (object == null) {
	      return false;
	    }
	    return object[key] === srcValue &&
	      (srcValue !== undefined || (key in Object(object)));
	  };
	}

	var _matchesStrictComparable = matchesStrictComparable$2;

	var baseIsMatch = _baseIsMatch,
	    getMatchData = _getMatchData,
	    matchesStrictComparable$1 = _matchesStrictComparable;

	/**
	 * The base implementation of `_.matches` which doesn't clone `source`.
	 *
	 * @private
	 * @param {Object} source The object of property values to match.
	 * @returns {Function} Returns the new spec function.
	 */
	function baseMatches$1(source) {
	  var matchData = getMatchData(source);
	  if (matchData.length == 1 && matchData[0][2]) {
	    return matchesStrictComparable$1(matchData[0][0], matchData[0][1]);
	  }
	  return function(object) {
	    return object === source || baseIsMatch(object, source, matchData);
	  };
	}

	var _baseMatches = baseMatches$1;

	/**
	 * The base implementation of `_.hasIn` without support for deep paths.
	 *
	 * @private
	 * @param {Object} [object] The object to query.
	 * @param {Array|string} key The key to check.
	 * @returns {boolean} Returns `true` if `key` exists, else `false`.
	 */

	function baseHasIn$1(object, key) {
	  return object != null && key in Object(object);
	}

	var _baseHasIn = baseHasIn$1;

	var castPath = _castPath,
	    isArguments$2 = isArguments_1,
	    isArray$b = isArray_1,
	    isIndex$1 = _isIndex,
	    isLength = isLength_1,
	    toKey$2 = _toKey;

	/**
	 * Checks if `path` exists on `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {Array|string} path The path to check.
	 * @param {Function} hasFunc The function to check properties.
	 * @returns {boolean} Returns `true` if `path` exists, else `false`.
	 */
	function hasPath$1(object, path, hasFunc) {
	  path = castPath(path, object);

	  var index = -1,
	      length = path.length,
	      result = false;

	  while (++index < length) {
	    var key = toKey$2(path[index]);
	    if (!(result = object != null && hasFunc(object, key))) {
	      break;
	    }
	    object = object[key];
	  }
	  if (result || ++index != length) {
	    return result;
	  }
	  length = object == null ? 0 : object.length;
	  return !!length && isLength(length) && isIndex$1(key, length) &&
	    (isArray$b(object) || isArguments$2(object));
	}

	var _hasPath = hasPath$1;

	var baseHasIn = _baseHasIn,
	    hasPath = _hasPath;

	/**
	 * Checks if `path` is a direct or inherited property of `object`.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Object
	 * @param {Object} object The object to query.
	 * @param {Array|string} path The path to check.
	 * @returns {boolean} Returns `true` if `path` exists, else `false`.
	 * @example
	 *
	 * var object = _.create({ 'a': _.create({ 'b': 2 }) });
	 *
	 * _.hasIn(object, 'a');
	 * // => true
	 *
	 * _.hasIn(object, 'a.b');
	 * // => true
	 *
	 * _.hasIn(object, ['a', 'b']);
	 * // => true
	 *
	 * _.hasIn(object, 'b');
	 * // => false
	 */
	function hasIn$1(object, path) {
	  return object != null && hasPath(object, path, baseHasIn);
	}

	var hasIn_1 = hasIn$1;

	var baseIsEqual = _baseIsEqual,
	    get$1 = get_1,
	    hasIn = hasIn_1,
	    isKey$1 = _isKey,
	    isStrictComparable = _isStrictComparable,
	    matchesStrictComparable = _matchesStrictComparable,
	    toKey$1 = _toKey;

	/** Used to compose bitmasks for value comparisons. */
	var COMPARE_PARTIAL_FLAG = 1,
	    COMPARE_UNORDERED_FLAG = 2;

	/**
	 * The base implementation of `_.matchesProperty` which doesn't clone `srcValue`.
	 *
	 * @private
	 * @param {string} path The path of the property to get.
	 * @param {*} srcValue The value to match.
	 * @returns {Function} Returns the new spec function.
	 */
	function baseMatchesProperty$1(path, srcValue) {
	  if (isKey$1(path) && isStrictComparable(srcValue)) {
	    return matchesStrictComparable(toKey$1(path), srcValue);
	  }
	  return function(object) {
	    var objValue = get$1(object, path);
	    return (objValue === undefined && objValue === srcValue)
	      ? hasIn(object, path)
	      : baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG | COMPARE_UNORDERED_FLAG);
	  };
	}

	var _baseMatchesProperty = baseMatchesProperty$1;

	/**
	 * This method returns the first argument it receives.
	 *
	 * @static
	 * @since 0.1.0
	 * @memberOf _
	 * @category Util
	 * @param {*} value Any value.
	 * @returns {*} Returns `value`.
	 * @example
	 *
	 * var object = { 'a': 1 };
	 *
	 * console.log(_.identity(object) === object);
	 * // => true
	 */

	function identity$4(value) {
	  return value;
	}

	var identity_1 = identity$4;

	/**
	 * The base implementation of `_.property` without support for deep paths.
	 *
	 * @private
	 * @param {string} key The key of the property to get.
	 * @returns {Function} Returns the new accessor function.
	 */

	function baseProperty$2(key) {
	  return function(object) {
	    return object == null ? undefined : object[key];
	  };
	}

	var _baseProperty = baseProperty$2;

	var baseGet$1 = _baseGet;

	/**
	 * A specialized version of `baseProperty` which supports deep paths.
	 *
	 * @private
	 * @param {Array|string} path The path of the property to get.
	 * @returns {Function} Returns the new accessor function.
	 */
	function basePropertyDeep$1(path) {
	  return function(object) {
	    return baseGet$1(object, path);
	  };
	}

	var _basePropertyDeep = basePropertyDeep$1;

	var baseProperty$1 = _baseProperty,
	    basePropertyDeep = _basePropertyDeep,
	    isKey = _isKey,
	    toKey = _toKey;

	/**
	 * Creates a function that returns the value at `path` of a given object.
	 *
	 * @static
	 * @memberOf _
	 * @since 2.4.0
	 * @category Util
	 * @param {Array|string} path The path of the property to get.
	 * @returns {Function} Returns the new accessor function.
	 * @example
	 *
	 * var objects = [
	 *   { 'a': { 'b': 2 } },
	 *   { 'a': { 'b': 1 } }
	 * ];
	 *
	 * _.map(objects, _.property('a.b'));
	 * // => [2, 1]
	 *
	 * _.map(_.sortBy(objects, _.property(['a', 'b'])), 'a.b');
	 * // => [1, 2]
	 */
	function property$1(path) {
	  return isKey(path) ? baseProperty$1(toKey(path)) : basePropertyDeep(path);
	}

	var property_1 = property$1;

	var baseMatches = _baseMatches,
	    baseMatchesProperty = _baseMatchesProperty,
	    identity$3 = identity_1,
	    isArray$a = isArray_1,
	    property = property_1;

	/**
	 * The base implementation of `_.iteratee`.
	 *
	 * @private
	 * @param {*} [value=_.identity] The value to convert to an iteratee.
	 * @returns {Function} Returns the iteratee.
	 */
	function baseIteratee$3(value) {
	  // Don't store the `typeof` result in a variable to avoid a JIT bug in Safari 9.
	  // See https://bugs.webkit.org/show_bug.cgi?id=156034 for more details.
	  if (typeof value == 'function') {
	    return value;
	  }
	  if (value == null) {
	    return identity$3;
	  }
	  if (typeof value == 'object') {
	    return isArray$a(value)
	      ? baseMatchesProperty(value[0], value[1])
	      : baseMatches(value);
	  }
	  return property(value);
	}

	var _baseIteratee = baseIteratee$3;

	var arrayFilter = _arrayFilter,
	    baseFilter = _baseFilter,
	    baseIteratee$2 = _baseIteratee,
	    isArray$9 = isArray_1;

	/**
	 * Iterates over elements of `collection`, returning an array of all elements
	 * `predicate` returns truthy for. The predicate is invoked with three
	 * arguments: (value, index|key, collection).
	 *
	 * **Note:** Unlike `_.remove`, this method returns a new array.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Collection
	 * @param {Array|Object} collection The collection to iterate over.
	 * @param {Function} [predicate=_.identity] The function invoked per iteration.
	 * @returns {Array} Returns the new filtered array.
	 * @see _.reject
	 * @example
	 *
	 * var users = [
	 *   { 'user': 'barney', 'age': 36, 'active': true },
	 *   { 'user': 'fred',   'age': 40, 'active': false }
	 * ];
	 *
	 * _.filter(users, function(o) { return !o.active; });
	 * // => objects for ['fred']
	 *
	 * // The `_.matches` iteratee shorthand.
	 * _.filter(users, { 'age': 36, 'active': true });
	 * // => objects for ['barney']
	 *
	 * // The `_.matchesProperty` iteratee shorthand.
	 * _.filter(users, ['active', false]);
	 * // => objects for ['fred']
	 *
	 * // The `_.property` iteratee shorthand.
	 * _.filter(users, 'active');
	 * // => objects for ['barney']
	 *
	 * // Combining several predicates using `_.overEvery` or `_.overSome`.
	 * _.filter(users, _.overSome([{ 'age': 36 }, ['age', 40]]));
	 * // => objects for ['fred', 'barney']
	 */
	function filter(collection, predicate) {
	  var func = isArray$9(collection) ? arrayFilter : baseFilter;
	  return func(collection, baseIteratee$2(predicate));
	}

	var filter_1 = filter;

	var baseGetTag = _baseGetTag,
	    isArray$8 = isArray_1,
	    isObjectLike = isObjectLike_1;

	/** `Object#toString` result references. */
	var stringTag = '[object String]';

	/**
	 * Checks if `value` is classified as a `String` primitive or object.
	 *
	 * @static
	 * @since 0.1.0
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a string, else `false`.
	 * @example
	 *
	 * _.isString('abc');
	 * // => true
	 *
	 * _.isString(1);
	 * // => false
	 */
	function isString$2(value) {
	  return typeof value == 'string' ||
	    (!isArray$8(value) && isObjectLike(value) && baseGetTag(value) == stringTag);
	}

	var isString_1 = isString$2;

	var baseProperty = _baseProperty;

	/**
	 * Gets the size of an ASCII `string`.
	 *
	 * @private
	 * @param {string} string The string inspect.
	 * @returns {number} Returns the string size.
	 */
	var asciiSize$1 = baseProperty('length');

	var _asciiSize = asciiSize$1;

	/** Used to compose unicode character classes. */

	var rsAstralRange$1 = '\\ud800-\\udfff',
	    rsComboMarksRange$1 = '\\u0300-\\u036f',
	    reComboHalfMarksRange$1 = '\\ufe20-\\ufe2f',
	    rsComboSymbolsRange$1 = '\\u20d0-\\u20ff',
	    rsComboRange$1 = rsComboMarksRange$1 + reComboHalfMarksRange$1 + rsComboSymbolsRange$1,
	    rsVarRange$1 = '\\ufe0e\\ufe0f';

	/** Used to compose unicode capture groups. */
	var rsZWJ$1 = '\\u200d';

	/** Used to detect strings with [zero-width joiners or code points from the astral planes](http://eev.ee/blog/2015/09/12/dark-corners-of-unicode/). */
	var reHasUnicode = RegExp('[' + rsZWJ$1 + rsAstralRange$1  + rsComboRange$1 + rsVarRange$1 + ']');

	/**
	 * Checks if `string` contains Unicode symbols.
	 *
	 * @private
	 * @param {string} string The string to inspect.
	 * @returns {boolean} Returns `true` if a symbol is found, else `false`.
	 */
	function hasUnicode$1(string) {
	  return reHasUnicode.test(string);
	}

	var _hasUnicode = hasUnicode$1;

	/** Used to compose unicode character classes. */

	var rsAstralRange = '\\ud800-\\udfff',
	    rsComboMarksRange = '\\u0300-\\u036f',
	    reComboHalfMarksRange = '\\ufe20-\\ufe2f',
	    rsComboSymbolsRange = '\\u20d0-\\u20ff',
	    rsComboRange = rsComboMarksRange + reComboHalfMarksRange + rsComboSymbolsRange,
	    rsVarRange = '\\ufe0e\\ufe0f';

	/** Used to compose unicode capture groups. */
	var rsAstral = '[' + rsAstralRange + ']',
	    rsCombo = '[' + rsComboRange + ']',
	    rsFitz = '\\ud83c[\\udffb-\\udfff]',
	    rsModifier = '(?:' + rsCombo + '|' + rsFitz + ')',
	    rsNonAstral = '[^' + rsAstralRange + ']',
	    rsRegional = '(?:\\ud83c[\\udde6-\\uddff]){2}',
	    rsSurrPair = '[\\ud800-\\udbff][\\udc00-\\udfff]',
	    rsZWJ = '\\u200d';

	/** Used to compose unicode regexes. */
	var reOptMod = rsModifier + '?',
	    rsOptVar = '[' + rsVarRange + ']?',
	    rsOptJoin = '(?:' + rsZWJ + '(?:' + [rsNonAstral, rsRegional, rsSurrPair].join('|') + ')' + rsOptVar + reOptMod + ')*',
	    rsSeq = rsOptVar + reOptMod + rsOptJoin,
	    rsSymbol = '(?:' + [rsNonAstral + rsCombo + '?', rsCombo, rsRegional, rsSurrPair, rsAstral].join('|') + ')';

	/** Used to match [string symbols](https://mathiasbynens.be/notes/javascript-unicode). */
	var reUnicode = RegExp(rsFitz + '(?=' + rsFitz + ')|' + rsSymbol + rsSeq, 'g');

	/**
	 * Gets the size of a Unicode `string`.
	 *
	 * @private
	 * @param {string} string The string inspect.
	 * @returns {number} Returns the string size.
	 */
	function unicodeSize$1(string) {
	  var result = reUnicode.lastIndex = 0;
	  while (reUnicode.test(string)) {
	    ++result;
	  }
	  return result;
	}

	var _unicodeSize = unicodeSize$1;

	var asciiSize = _asciiSize,
	    hasUnicode = _hasUnicode,
	    unicodeSize = _unicodeSize;

	/**
	 * Gets the number of symbols in `string`.
	 *
	 * @private
	 * @param {string} string The string to inspect.
	 * @returns {number} Returns the string size.
	 */
	function stringSize$1(string) {
	  return hasUnicode(string)
	    ? unicodeSize(string)
	    : asciiSize(string);
	}

	var _stringSize = stringSize$1;

	var baseKeys$1 = _baseKeys,
	    getTag$1 = _getTag,
	    isArrayLike$3 = isArrayLike_1,
	    isString$1 = isString_1,
	    stringSize = _stringSize;

	/** `Object#toString` result references. */
	var mapTag$1 = '[object Map]',
	    setTag$1 = '[object Set]';

	/**
	 * Gets the size of `collection` by returning its length for array-like
	 * values or the number of own enumerable string keyed properties for objects.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Collection
	 * @param {Array|Object|string} collection The collection to inspect.
	 * @returns {number} Returns the collection size.
	 * @example
	 *
	 * _.size([1, 2, 3]);
	 * // => 3
	 *
	 * _.size({ 'a': 1, 'b': 2 });
	 * // => 2
	 *
	 * _.size('pebbles');
	 * // => 7
	 */
	function size(collection) {
	  if (collection == null) {
	    return 0;
	  }
	  if (isArrayLike$3(collection)) {
	    return isString$1(collection) ? stringSize(collection) : collection.length;
	  }
	  var tag = getTag$1(collection);
	  if (tag == mapTag$1 || tag == setTag$1) {
	    return collection.size;
	  }
	  return baseKeys$1(collection).length;
	}

	var size_1 = size;

	var styles$f = {
	  /* Styles applied to the root element. */
	  root: {},

	  /* Styles applied to the root element if `orientation="horizontal"`. */
	  horizontal: {
	    paddingLeft: 8,
	    paddingRight: 8
	  },

	  /* Styles applied to the root element if `orientation="vertical"`. */
	  vertical: {},

	  /* Styles applied to the root element if `alternativeLabel={true}`. */
	  alternativeLabel: {
	    flex: 1,
	    position: 'relative'
	  },

	  /* Pseudo-class applied to the root element if `completed={true}`. */
	  completed: {}
	};
	var Step = /*#__PURE__*/react.exports.forwardRef(function Step(props, ref) {
	  var _props$active = props.active,
	      active = _props$active === void 0 ? false : _props$active,
	      alternativeLabel = props.alternativeLabel,
	      children = props.children,
	      classes = props.classes,
	      className = props.className,
	      _props$completed = props.completed,
	      completed = _props$completed === void 0 ? false : _props$completed,
	      connectorProp = props.connector,
	      _props$disabled = props.disabled,
	      disabled = _props$disabled === void 0 ? false : _props$disabled,
	      _props$expanded = props.expanded,
	      expanded = _props$expanded === void 0 ? false : _props$expanded,
	      index = props.index,
	      last = props.last,
	      orientation = props.orientation,
	      other = _objectWithoutProperties(props, ["active", "alternativeLabel", "children", "classes", "className", "completed", "connector", "disabled", "expanded", "index", "last", "orientation"]);

	  var connector = connectorProp ? /*#__PURE__*/react.exports.cloneElement(connectorProp, {
	    orientation: orientation,
	    alternativeLabel: alternativeLabel,
	    index: index,
	    active: active,
	    completed: completed,
	    disabled: disabled
	  }) : null;
	  var newChildren = /*#__PURE__*/react.exports.createElement("div", _extends({
	    className: clsx(classes.root, classes[orientation], className, alternativeLabel && classes.alternativeLabel, completed && classes.completed),
	    ref: ref
	  }, other), connector && alternativeLabel && index !== 0 ? connector : null, react.exports.Children.map(children, function (child) {
	    if (! /*#__PURE__*/react.exports.isValidElement(child)) {
	      return null;
	    }

	    return /*#__PURE__*/react.exports.cloneElement(child, _extends({
	      active: active,
	      alternativeLabel: alternativeLabel,
	      completed: completed,
	      disabled: disabled,
	      expanded: expanded,
	      last: last,
	      icon: index + 1,
	      orientation: orientation
	    }, child.props));
	  }));

	  if (connector && !alternativeLabel && index !== 0) {
	    return /*#__PURE__*/react.exports.createElement(react.exports.Fragment, null, connector, newChildren);
	  }

	  return newChildren;
	});
	var Step$1 = withStyles(styles$f, {
	  name: 'MuiStep'
	})(Step);

	var styles$e = function styles(theme) {
	  var elevations = {};
	  theme.shadows.forEach(function (shadow, index) {
	    elevations["elevation".concat(index)] = {
	      boxShadow: shadow
	    };
	  });
	  return _extends({
	    /* Styles applied to the root element. */
	    root: {
	      backgroundColor: theme.palette.background.paper,
	      color: theme.palette.text.primary,
	      transition: theme.transitions.create('box-shadow')
	    },

	    /* Styles applied to the root element if `square={false}`. */
	    rounded: {
	      borderRadius: theme.shape.borderRadius
	    },

	    /* Styles applied to the root element if `variant="outlined"`. */
	    outlined: {
	      border: "1px solid ".concat(theme.palette.divider)
	    }
	  }, elevations);
	};
	var Paper = /*#__PURE__*/react.exports.forwardRef(function Paper(props, ref) {
	  var classes = props.classes,
	      className = props.className,
	      _props$component = props.component,
	      Component = _props$component === void 0 ? 'div' : _props$component,
	      _props$square = props.square,
	      square = _props$square === void 0 ? false : _props$square,
	      _props$elevation = props.elevation,
	      elevation = _props$elevation === void 0 ? 1 : _props$elevation,
	      _props$variant = props.variant,
	      variant = _props$variant === void 0 ? 'elevation' : _props$variant,
	      other = _objectWithoutProperties(props, ["classes", "className", "component", "square", "elevation", "variant"]);

	  return /*#__PURE__*/react.exports.createElement(Component, _extends({
	    className: clsx(classes.root, className, variant === 'outlined' ? classes.outlined : classes["elevation".concat(elevation)], !square && classes.rounded),
	    ref: ref
	  }, other));
	});
	var Paper$1 = withStyles(styles$e, {
	  name: 'MuiPaper'
	})(Paper);

	var styles$d = function styles(theme) {
	  return {
	    /* Styles applied to the root element. */
	    root: {
	      flex: '1 1 auto'
	    },

	    /* Styles applied to the root element if `orientation="horizontal"`. */
	    horizontal: {},

	    /* Styles applied to the root element if `orientation="vertical"`. */
	    vertical: {
	      marginLeft: 12,
	      // half icon
	      padding: '0 0 8px'
	    },

	    /* Styles applied to the root element if `alternativeLabel={true}`. */
	    alternativeLabel: {
	      position: 'absolute',
	      top: 8 + 4,
	      left: 'calc(-50% + 20px)',
	      right: 'calc(50% + 20px)'
	    },

	    /* Pseudo-class applied to the root element if `active={true}`. */
	    active: {},

	    /* Pseudo-class applied to the root element if `completed={true}`. */
	    completed: {},

	    /* Pseudo-class applied to the root element if `disabled={true}`. */
	    disabled: {},

	    /* Styles applied to the line element. */
	    line: {
	      display: 'block',
	      borderColor: theme.palette.type === 'light' ? theme.palette.grey[400] : theme.palette.grey[600]
	    },

	    /* Styles applied to the root element if `orientation="horizontal"`. */
	    lineHorizontal: {
	      borderTopStyle: 'solid',
	      borderTopWidth: 1
	    },

	    /* Styles applied to the root element if `orientation="vertical"`. */
	    lineVertical: {
	      borderLeftStyle: 'solid',
	      borderLeftWidth: 1,
	      minHeight: 24
	    }
	  };
	};
	var StepConnector = /*#__PURE__*/react.exports.forwardRef(function StepConnector(props, ref) {
	  var active = props.active,
	      _props$alternativeLab = props.alternativeLabel,
	      alternativeLabel = _props$alternativeLab === void 0 ? false : _props$alternativeLab,
	      classes = props.classes,
	      className = props.className,
	      completed = props.completed,
	      disabled = props.disabled;
	      props.index;
	      var _props$orientation = props.orientation,
	      orientation = _props$orientation === void 0 ? 'horizontal' : _props$orientation,
	      other = _objectWithoutProperties(props, ["active", "alternativeLabel", "classes", "className", "completed", "disabled", "index", "orientation"]);

	  return /*#__PURE__*/react.exports.createElement("div", _extends({
	    className: clsx(classes.root, classes[orientation], className, alternativeLabel && classes.alternativeLabel, active && classes.active, completed && classes.completed, disabled && classes.disabled),
	    ref: ref
	  }, other), /*#__PURE__*/react.exports.createElement("span", {
	    className: clsx(classes.line, {
	      'horizontal': classes.lineHorizontal,
	      'vertical': classes.lineVertical
	    }[orientation])
	  }));
	});
	var StepConnector$1 = withStyles(styles$d, {
	  name: 'MuiStepConnector'
	})(StepConnector);

	var styles$c = {
	  /* Styles applied to the root element. */
	  root: {
	    display: 'flex',
	    padding: 24
	  },

	  /* Styles applied to the root element if `orientation="horizontal"`. */
	  horizontal: {
	    flexDirection: 'row',
	    alignItems: 'center'
	  },

	  /* Styles applied to the root element if `orientation="vertical"`. */
	  vertical: {
	    flexDirection: 'column'
	  },

	  /* Styles applied to the root element if `alternativeLabel={true}`. */
	  alternativeLabel: {
	    alignItems: 'flex-start'
	  }
	};
	var defaultConnector = /*#__PURE__*/react.exports.createElement(StepConnector$1, null);
	var Stepper = /*#__PURE__*/react.exports.forwardRef(function Stepper(props, ref) {
	  var _props$activeStep = props.activeStep,
	      activeStep = _props$activeStep === void 0 ? 0 : _props$activeStep,
	      _props$alternativeLab = props.alternativeLabel,
	      alternativeLabel = _props$alternativeLab === void 0 ? false : _props$alternativeLab,
	      children = props.children,
	      classes = props.classes,
	      className = props.className,
	      _props$connector = props.connector,
	      connectorProp = _props$connector === void 0 ? defaultConnector : _props$connector,
	      _props$nonLinear = props.nonLinear,
	      nonLinear = _props$nonLinear === void 0 ? false : _props$nonLinear,
	      _props$orientation = props.orientation,
	      orientation = _props$orientation === void 0 ? 'horizontal' : _props$orientation,
	      other = _objectWithoutProperties(props, ["activeStep", "alternativeLabel", "children", "classes", "className", "connector", "nonLinear", "orientation"]);

	  var connector = /*#__PURE__*/react.exports.isValidElement(connectorProp) ? /*#__PURE__*/react.exports.cloneElement(connectorProp, {
	    orientation: orientation
	  }) : null;
	  var childrenArray = react.exports.Children.toArray(children);
	  var steps = childrenArray.map(function (step, index) {
	    var state = {
	      index: index,
	      active: false,
	      completed: false,
	      disabled: false
	    };

	    if (activeStep === index) {
	      state.active = true;
	    } else if (!nonLinear && activeStep > index) {
	      state.completed = true;
	    } else if (!nonLinear && activeStep < index) {
	      state.disabled = true;
	    }

	    return /*#__PURE__*/react.exports.cloneElement(step, _extends({
	      alternativeLabel: alternativeLabel,
	      connector: connector,
	      last: index + 1 === childrenArray.length,
	      orientation: orientation
	    }, state, step.props));
	  });
	  return /*#__PURE__*/react.exports.createElement(Paper$1, _extends({
	    square: true,
	    elevation: 0,
	    className: clsx(classes.root, classes[orientation], className, alternativeLabel && classes.alternativeLabel),
	    ref: ref
	  }, other), steps);
	});
	var Stepper$1 = withStyles(styles$c, {
	  name: 'MuiStepper'
	})(Stepper);

	// It should to be noted that this function isn't equivalent to `text-transform: capitalize`.
	//
	// A strict capitalization should uppercase the first letter of each word a the sentence.
	// We only handle the first word.
	function capitalize(string) {
	  if (typeof string !== 'string') {
	    throw new Error(formatMuiErrorMessage(7));
	  }

	  return string.charAt(0).toUpperCase() + string.slice(1);
	}

	var styles$b = function styles(theme) {
	  return {
	    /* Styles applied to the root element. */
	    root: {
	      margin: 0
	    },

	    /* Styles applied to the root element if `variant="body2"`. */
	    body2: theme.typography.body2,

	    /* Styles applied to the root element if `variant="body1"`. */
	    body1: theme.typography.body1,

	    /* Styles applied to the root element if `variant="caption"`. */
	    caption: theme.typography.caption,

	    /* Styles applied to the root element if `variant="button"`. */
	    button: theme.typography.button,

	    /* Styles applied to the root element if `variant="h1"`. */
	    h1: theme.typography.h1,

	    /* Styles applied to the root element if `variant="h2"`. */
	    h2: theme.typography.h2,

	    /* Styles applied to the root element if `variant="h3"`. */
	    h3: theme.typography.h3,

	    /* Styles applied to the root element if `variant="h4"`. */
	    h4: theme.typography.h4,

	    /* Styles applied to the root element if `variant="h5"`. */
	    h5: theme.typography.h5,

	    /* Styles applied to the root element if `variant="h6"`. */
	    h6: theme.typography.h6,

	    /* Styles applied to the root element if `variant="subtitle1"`. */
	    subtitle1: theme.typography.subtitle1,

	    /* Styles applied to the root element if `variant="subtitle2"`. */
	    subtitle2: theme.typography.subtitle2,

	    /* Styles applied to the root element if `variant="overline"`. */
	    overline: theme.typography.overline,

	    /* Styles applied to the root element if `variant="srOnly"`. Only accessible to screen readers. */
	    srOnly: {
	      position: 'absolute',
	      height: 1,
	      width: 1,
	      overflow: 'hidden'
	    },

	    /* Styles applied to the root element if `align="left"`. */
	    alignLeft: {
	      textAlign: 'left'
	    },

	    /* Styles applied to the root element if `align="center"`. */
	    alignCenter: {
	      textAlign: 'center'
	    },

	    /* Styles applied to the root element if `align="right"`. */
	    alignRight: {
	      textAlign: 'right'
	    },

	    /* Styles applied to the root element if `align="justify"`. */
	    alignJustify: {
	      textAlign: 'justify'
	    },

	    /* Styles applied to the root element if `nowrap={true}`. */
	    noWrap: {
	      overflow: 'hidden',
	      textOverflow: 'ellipsis',
	      whiteSpace: 'nowrap'
	    },

	    /* Styles applied to the root element if `gutterBottom={true}`. */
	    gutterBottom: {
	      marginBottom: '0.35em'
	    },

	    /* Styles applied to the root element if `paragraph={true}`. */
	    paragraph: {
	      marginBottom: 16
	    },

	    /* Styles applied to the root element if `color="inherit"`. */
	    colorInherit: {
	      color: 'inherit'
	    },

	    /* Styles applied to the root element if `color="primary"`. */
	    colorPrimary: {
	      color: theme.palette.primary.main
	    },

	    /* Styles applied to the root element if `color="secondary"`. */
	    colorSecondary: {
	      color: theme.palette.secondary.main
	    },

	    /* Styles applied to the root element if `color="textPrimary"`. */
	    colorTextPrimary: {
	      color: theme.palette.text.primary
	    },

	    /* Styles applied to the root element if `color="textSecondary"`. */
	    colorTextSecondary: {
	      color: theme.palette.text.secondary
	    },

	    /* Styles applied to the root element if `color="error"`. */
	    colorError: {
	      color: theme.palette.error.main
	    },

	    /* Styles applied to the root element if `display="inline"`. */
	    displayInline: {
	      display: 'inline'
	    },

	    /* Styles applied to the root element if `display="block"`. */
	    displayBlock: {
	      display: 'block'
	    }
	  };
	};
	var defaultVariantMapping = {
	  h1: 'h1',
	  h2: 'h2',
	  h3: 'h3',
	  h4: 'h4',
	  h5: 'h5',
	  h6: 'h6',
	  subtitle1: 'h6',
	  subtitle2: 'h6',
	  body1: 'p',
	  body2: 'p'
	};
	var Typography = /*#__PURE__*/react.exports.forwardRef(function Typography(props, ref) {
	  var _props$align = props.align,
	      align = _props$align === void 0 ? 'inherit' : _props$align,
	      classes = props.classes,
	      className = props.className,
	      _props$color = props.color,
	      color = _props$color === void 0 ? 'initial' : _props$color,
	      component = props.component,
	      _props$display = props.display,
	      display = _props$display === void 0 ? 'initial' : _props$display,
	      _props$gutterBottom = props.gutterBottom,
	      gutterBottom = _props$gutterBottom === void 0 ? false : _props$gutterBottom,
	      _props$noWrap = props.noWrap,
	      noWrap = _props$noWrap === void 0 ? false : _props$noWrap,
	      _props$paragraph = props.paragraph,
	      paragraph = _props$paragraph === void 0 ? false : _props$paragraph,
	      _props$variant = props.variant,
	      variant = _props$variant === void 0 ? 'body1' : _props$variant,
	      _props$variantMapping = props.variantMapping,
	      variantMapping = _props$variantMapping === void 0 ? defaultVariantMapping : _props$variantMapping,
	      other = _objectWithoutProperties(props, ["align", "classes", "className", "color", "component", "display", "gutterBottom", "noWrap", "paragraph", "variant", "variantMapping"]);

	  var Component = component || (paragraph ? 'p' : variantMapping[variant] || defaultVariantMapping[variant]) || 'span';
	  return /*#__PURE__*/react.exports.createElement(Component, _extends({
	    className: clsx(classes.root, className, variant !== 'inherit' && classes[variant], color !== 'initial' && classes["color".concat(capitalize(color))], noWrap && classes.noWrap, gutterBottom && classes.gutterBottom, paragraph && classes.paragraph, align !== 'inherit' && classes["align".concat(capitalize(align))], display !== 'initial' && classes["display".concat(capitalize(display))]),
	    ref: ref
	  }, other));
	});
	var Typography$1 = withStyles(styles$b, {
	  name: 'MuiTypography'
	})(Typography);

	var styles$a = function styles(theme) {
	  return {
	    /* Styles applied to the root element. */
	    root: {
	      userSelect: 'none',
	      width: '1em',
	      height: '1em',
	      display: 'inline-block',
	      fill: 'currentColor',
	      flexShrink: 0,
	      fontSize: theme.typography.pxToRem(24),
	      transition: theme.transitions.create('fill', {
	        duration: theme.transitions.duration.shorter
	      })
	    },

	    /* Styles applied to the root element if `color="primary"`. */
	    colorPrimary: {
	      color: theme.palette.primary.main
	    },

	    /* Styles applied to the root element if `color="secondary"`. */
	    colorSecondary: {
	      color: theme.palette.secondary.main
	    },

	    /* Styles applied to the root element if `color="action"`. */
	    colorAction: {
	      color: theme.palette.action.active
	    },

	    /* Styles applied to the root element if `color="error"`. */
	    colorError: {
	      color: theme.palette.error.main
	    },

	    /* Styles applied to the root element if `color="disabled"`. */
	    colorDisabled: {
	      color: theme.palette.action.disabled
	    },

	    /* Styles applied to the root element if `fontSize="inherit"`. */
	    fontSizeInherit: {
	      fontSize: 'inherit'
	    },

	    /* Styles applied to the root element if `fontSize="small"`. */
	    fontSizeSmall: {
	      fontSize: theme.typography.pxToRem(20)
	    },

	    /* Styles applied to the root element if `fontSize="large"`. */
	    fontSizeLarge: {
	      fontSize: theme.typography.pxToRem(35)
	    }
	  };
	};
	var SvgIcon = /*#__PURE__*/react.exports.forwardRef(function SvgIcon(props, ref) {
	  var children = props.children,
	      classes = props.classes,
	      className = props.className,
	      _props$color = props.color,
	      color = _props$color === void 0 ? 'inherit' : _props$color,
	      _props$component = props.component,
	      Component = _props$component === void 0 ? 'svg' : _props$component,
	      _props$fontSize = props.fontSize,
	      fontSize = _props$fontSize === void 0 ? 'medium' : _props$fontSize,
	      htmlColor = props.htmlColor,
	      titleAccess = props.titleAccess,
	      _props$viewBox = props.viewBox,
	      viewBox = _props$viewBox === void 0 ? '0 0 24 24' : _props$viewBox,
	      other = _objectWithoutProperties(props, ["children", "classes", "className", "color", "component", "fontSize", "htmlColor", "titleAccess", "viewBox"]);

	  return /*#__PURE__*/react.exports.createElement(Component, _extends({
	    className: clsx(classes.root, className, color !== 'inherit' && classes["color".concat(capitalize(color))], fontSize !== 'default' && fontSize !== 'medium' && classes["fontSize".concat(capitalize(fontSize))]),
	    focusable: "false",
	    viewBox: viewBox,
	    color: htmlColor,
	    "aria-hidden": titleAccess ? undefined : true,
	    role: titleAccess ? 'img' : undefined,
	    ref: ref
	  }, other), children, titleAccess ? /*#__PURE__*/react.exports.createElement("title", null, titleAccess) : null);
	});
	SvgIcon.muiName = 'SvgIcon';
	var SvgIcon$1 = withStyles(styles$a, {
	  name: 'MuiSvgIcon'
	})(SvgIcon);

	/**
	 * Private module reserved for @material-ui/x packages.
	 */

	function createSvgIcon$1(path, displayName) {
	  var Component = function Component(props, ref) {
	    return /*#__PURE__*/React$1.createElement(SvgIcon$1, _extends({
	      ref: ref
	    }, props), path);
	  };

	  Component.muiName = SvgIcon$1.muiName;
	  return /*#__PURE__*/React$1.memo( /*#__PURE__*/React$1.forwardRef(Component));
	}

	/**
	 * @ignore - internal component.
	 */

	var CheckCircle$1 = createSvgIcon$1( /*#__PURE__*/react.exports.createElement("path", {
	  d: "M12 0a12 12 0 1 0 0 24 12 12 0 0 0 0-24zm-2 17l-5-5 1.4-1.4 3.6 3.6 7.6-7.6L19 8l-9 9z"
	}));

	/**
	 * @ignore - internal component.
	 */

	var Warning = createSvgIcon$1( /*#__PURE__*/react.exports.createElement("path", {
	  d: "M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"
	}));

	var styles$9 = function styles(theme) {
	  return {
	    /* Styles applied to the root element. */
	    root: {
	      display: 'block',
	      color: theme.palette.text.disabled,
	      '&$completed': {
	        color: theme.palette.primary.main
	      },
	      '&$active': {
	        color: theme.palette.primary.main
	      },
	      '&$error': {
	        color: theme.palette.error.main
	      }
	    },

	    /* Styles applied to the SVG text element. */
	    text: {
	      fill: theme.palette.primary.contrastText,
	      fontSize: theme.typography.caption.fontSize,
	      fontFamily: theme.typography.fontFamily
	    },

	    /* Pseudo-class applied to the root element if `active={true}`. */
	    active: {},

	    /* Pseudo-class applied to the root element if `completed={true}`. */
	    completed: {},

	    /* Pseudo-class applied to the root element if `error={true}`. */
	    error: {}
	  };
	};

	var _ref = /*#__PURE__*/react.exports.createElement("circle", {
	  cx: "12",
	  cy: "12",
	  r: "12"
	});

	var StepIcon = /*#__PURE__*/react.exports.forwardRef(function StepIcon(props, ref) {
	  var _props$completed = props.completed,
	      completed = _props$completed === void 0 ? false : _props$completed,
	      icon = props.icon,
	      _props$active = props.active,
	      active = _props$active === void 0 ? false : _props$active,
	      _props$error = props.error,
	      error = _props$error === void 0 ? false : _props$error,
	      classes = props.classes;

	  if (typeof icon === 'number' || typeof icon === 'string') {
	    var className = clsx(classes.root, active && classes.active, error && classes.error, completed && classes.completed);

	    if (error) {
	      return /*#__PURE__*/react.exports.createElement(Warning, {
	        className: className,
	        ref: ref
	      });
	    }

	    if (completed) {
	      return /*#__PURE__*/react.exports.createElement(CheckCircle$1, {
	        className: className,
	        ref: ref
	      });
	    }

	    return /*#__PURE__*/react.exports.createElement(SvgIcon$1, {
	      className: className,
	      ref: ref
	    }, _ref, /*#__PURE__*/react.exports.createElement("text", {
	      className: classes.text,
	      x: "12",
	      y: "16",
	      textAnchor: "middle"
	    }, icon));
	  }

	  return icon;
	});
	var StepIcon$1 = withStyles(styles$9, {
	  name: 'MuiStepIcon'
	})(StepIcon);

	var styles$8 = function styles(theme) {
	  return {
	    /* Styles applied to the root element. */
	    root: {
	      display: 'flex',
	      alignItems: 'center',
	      '&$alternativeLabel': {
	        flexDirection: 'column'
	      },
	      '&$disabled': {
	        cursor: 'default'
	      }
	    },

	    /* Styles applied to the root element if `orientation="horizontal"`. */
	    horizontal: {},

	    /* Styles applied to the root element if `orientation="vertical"`. */
	    vertical: {},

	    /* Styles applied to the `Typography` component which wraps `children`. */
	    label: {
	      color: theme.palette.text.secondary,
	      '&$active': {
	        color: theme.palette.text.primary,
	        fontWeight: 500
	      },
	      '&$completed': {
	        color: theme.palette.text.primary,
	        fontWeight: 500
	      },
	      '&$alternativeLabel': {
	        textAlign: 'center',
	        marginTop: 16
	      },
	      '&$error': {
	        color: theme.palette.error.main
	      }
	    },

	    /* Pseudo-class applied to the `Typography` component if `active={true}`. */
	    active: {},

	    /* Pseudo-class applied to the `Typography` component if `completed={true}`. */
	    completed: {},

	    /* Pseudo-class applied to the root element and `Typography` component if `error={true}`. */
	    error: {},

	    /* Pseudo-class applied to the root element and `Typography` component if `disabled={true}`. */
	    disabled: {},

	    /* Styles applied to the `icon` container element. */
	    iconContainer: {
	      flexShrink: 0,
	      // Fix IE 11 issue
	      display: 'flex',
	      paddingRight: 8,
	      '&$alternativeLabel': {
	        paddingRight: 0
	      }
	    },

	    /* Pseudo-class applied to the root and icon container and `Typography` if `alternativeLabel={true}`. */
	    alternativeLabel: {},

	    /* Styles applied to the container element which wraps `Typography` and `optional`. */
	    labelContainer: {
	      width: '100%'
	    }
	  };
	};
	var StepLabel = /*#__PURE__*/react.exports.forwardRef(function StepLabel(props, ref) {
	  var _props$active = props.active,
	      active = _props$active === void 0 ? false : _props$active,
	      _props$alternativeLab = props.alternativeLabel,
	      alternativeLabel = _props$alternativeLab === void 0 ? false : _props$alternativeLab,
	      children = props.children,
	      classes = props.classes,
	      className = props.className,
	      _props$completed = props.completed,
	      completed = _props$completed === void 0 ? false : _props$completed,
	      _props$disabled = props.disabled,
	      disabled = _props$disabled === void 0 ? false : _props$disabled,
	      _props$error = props.error,
	      error = _props$error === void 0 ? false : _props$error;
	      props.expanded;
	      var icon = props.icon;
	      props.last;
	      var optional = props.optional,
	      _props$orientation = props.orientation,
	      orientation = _props$orientation === void 0 ? 'horizontal' : _props$orientation,
	      StepIconComponentProp = props.StepIconComponent,
	      StepIconProps = props.StepIconProps,
	      other = _objectWithoutProperties(props, ["active", "alternativeLabel", "children", "classes", "className", "completed", "disabled", "error", "expanded", "icon", "last", "optional", "orientation", "StepIconComponent", "StepIconProps"]);

	  var StepIconComponent = StepIconComponentProp;

	  if (icon && !StepIconComponent) {
	    StepIconComponent = StepIcon$1;
	  }

	  return /*#__PURE__*/react.exports.createElement("span", _extends({
	    className: clsx(classes.root, classes[orientation], className, disabled && classes.disabled, alternativeLabel && classes.alternativeLabel, error && classes.error),
	    ref: ref
	  }, other), icon || StepIconComponent ? /*#__PURE__*/react.exports.createElement("span", {
	    className: clsx(classes.iconContainer, alternativeLabel && classes.alternativeLabel)
	  }, /*#__PURE__*/react.exports.createElement(StepIconComponent, _extends({
	    completed: completed,
	    active: active,
	    error: error,
	    icon: icon
	  }, StepIconProps))) : null, /*#__PURE__*/react.exports.createElement("span", {
	    className: classes.labelContainer
	  }, children ? /*#__PURE__*/react.exports.createElement(Typography$1, {
	    variant: "body2",
	    component: "span",
	    display: "block",
	    className: clsx(classes.label, alternativeLabel && classes.alternativeLabel, completed && classes.completed, active && classes.active, error && classes.error)
	  }, children) : null, optional));
	});
	StepLabel.muiName = 'StepLabel';
	var StepLabel$1 = withStyles(styles$8, {
	  name: 'MuiStepLabel'
	})(StepLabel);

	var CheckCircle = {};

	var interopRequireDefault = {exports: {}};

	(function (module) {
	function _interopRequireDefault(e) {
	  return e && e.__esModule ? e : {
	    "default": e
	  };
	}
	module.exports = _interopRequireDefault, module.exports.__esModule = true, module.exports["default"] = module.exports;
	}(interopRequireDefault));

	var interopRequireWildcard = {exports: {}};

	var _typeof = {exports: {}};

	(function (module) {
	function _typeof(o) {
	  "@babel/helpers - typeof";

	  return module.exports = _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) {
	    return typeof o;
	  } : function (o) {
	    return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
	  }, module.exports.__esModule = true, module.exports["default"] = module.exports, _typeof(o);
	}
	module.exports = _typeof, module.exports.__esModule = true, module.exports["default"] = module.exports;
	}(_typeof));

	(function (module) {
	var _typeof$1 = _typeof.exports["default"];
	function _interopRequireWildcard(e, t) {
	  if ("function" == typeof WeakMap) var r = new WeakMap(),
	    n = new WeakMap();
	  return (module.exports = _interopRequireWildcard = function _interopRequireWildcard(e, t) {
	    if (!t && e && e.__esModule) return e;
	    var o,
	      i,
	      f = {
	        __proto__: null,
	        "default": e
	      };
	    if (null === e || "object" != _typeof$1(e) && "function" != typeof e) return f;
	    if (o = t ? n : r) {
	      if (o.has(e)) return o.get(e);
	      o.set(e, f);
	    }
	    for (var _t in e) "default" !== _t && {}.hasOwnProperty.call(e, _t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, _t)) && (i.get || i.set) ? o(f, _t, i) : f[_t] = e[_t]);
	    return f;
	  }, module.exports.__esModule = true, module.exports["default"] = module.exports)(e, t);
	}
	module.exports = _interopRequireWildcard, module.exports.__esModule = true, module.exports["default"] = module.exports;
	}(interopRequireWildcard));

	var createSvgIcon = {};

	/**
	 * Safe chained function
	 *
	 * Will only create a new function if needed,
	 * otherwise will pass back existing functions or null.
	 *
	 * @param {function} functions to chain
	 * @returns {function|null}
	 */
	function createChainedFunction() {
	  for (var _len = arguments.length, funcs = new Array(_len), _key = 0; _key < _len; _key++) {
	    funcs[_key] = arguments[_key];
	  }

	  return funcs.reduce(function (acc, func) {
	    if (func == null) {
	      return acc;
	    }

	    return function chainedFunction() {
	      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
	        args[_key2] = arguments[_key2];
	      }

	      acc.apply(this, args);
	      func.apply(this, args);
	    };
	  }, function () {});
	}

	// Corresponds to 10 frames at 60 Hz.
	// A few bytes payload overhead when lodash/debounce is ~3 kB and debounce ~300 B.
	function debounce(func) {
	  var wait = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 166;
	  var timeout;

	  function debounced() {
	    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
	      args[_key] = arguments[_key];
	    }

	    // eslint-disable-next-line consistent-this
	    var that = this;

	    var later = function later() {
	      func.apply(that, args);
	    };

	    clearTimeout(timeout);
	    timeout = setTimeout(later, wait);
	  }

	  debounced.clear = function () {
	    clearTimeout(timeout);
	  };

	  return debounced;
	}

	function deprecatedPropType(validator, reason) {
	  {
	    return function () {
	      return null;
	    };
	  }
	}

	function isMuiElement(element, muiNames) {
	  return /*#__PURE__*/react.exports.isValidElement(element) && muiNames.indexOf(element.type.muiName) !== -1;
	}

	function ownerDocument(node) {
	  return node && node.ownerDocument || document;
	}

	function ownerWindow(node) {
	  var doc = ownerDocument(node);
	  return doc.defaultView || window;
	}

	function requirePropFactory(componentNameInError) {
	  {
	    return function () {
	      return null;
	    };
	  }
	}

	// TODO v5: consider to make it private
	function setRef(ref, value) {
	  if (typeof ref === 'function') {
	    ref(value);
	  } else if (ref) {
	    ref.current = value;
	  }
	}

	function unsupportedProp(props, propName, componentName, location, propFullName) {
	  {
	    return null;
	  }
	}

	/* eslint-disable react-hooks/rules-of-hooks, react-hooks/exhaustive-deps */
	function useControlled(_ref) {
	  var controlled = _ref.controlled,
	      defaultProp = _ref.default;
	      _ref.name;
	      _ref.state;

	  var _React$useRef = react.exports.useRef(controlled !== undefined),
	      isControlled = _React$useRef.current;

	  var _React$useState = react.exports.useState(defaultProp),
	      valueState = _React$useState[0],
	      setValue = _React$useState[1];

	  var value = isControlled ? controlled : valueState;

	  var setValueIfUncontrolled = react.exports.useCallback(function (newValue) {
	    if (!isControlled) {
	      setValue(newValue);
	    }
	  }, []);
	  return [value, setValueIfUncontrolled];
	}

	var useEnhancedEffect$1 = typeof window !== 'undefined' ? react.exports.useLayoutEffect : react.exports.useEffect;
	/**
	 * https://github.com/facebook/react/issues/14099#issuecomment-440013892
	 *
	 * @param {function} fn
	 */

	function useEventCallback(fn) {
	  var ref = react.exports.useRef(fn);
	  useEnhancedEffect$1(function () {
	    ref.current = fn;
	  });
	  return react.exports.useCallback(function () {
	    return (ref.current).apply(void 0, arguments);
	  }, []);
	}

	function useForkRef(refA, refB) {
	  /**
	   * This will create a new function if the ref props change and are defined.
	   * This means react will call the old forkRef with `null` and the new forkRef
	   * with the ref. Cleanup naturally emerges from this behavior
	   */
	  return react.exports.useMemo(function () {
	    if (refA == null && refB == null) {
	      return null;
	    }

	    return function (refValue) {
	      setRef(refA, refValue);
	      setRef(refB, refValue);
	    };
	  }, [refA, refB]);
	}

	/**
	 * Private module reserved for @material-ui/x packages.
	 */

	function useId(idOverride) {
	  var _React$useState = react.exports.useState(idOverride),
	      defaultId = _React$useState[0],
	      setDefaultId = _React$useState[1];

	  var id = idOverride || defaultId;
	  react.exports.useEffect(function () {
	    if (defaultId == null) {
	      // Fallback to this default id when possible.
	      // Use the random value for client-side rendering only.
	      // We can't use it server-side.
	      setDefaultId("mui-".concat(Math.round(Math.random() * 1e5)));
	    }
	  }, [defaultId]);
	  return id;
	}

	// based on https://github.com/WICG/focus-visible/blob/v4.1.5/src/focus-visible.js
	var hadKeyboardEvent = true;
	var hadFocusVisibleRecently = false;
	var hadFocusVisibleRecentlyTimeout = null;
	var inputTypesWhitelist = {
	  text: true,
	  search: true,
	  url: true,
	  tel: true,
	  email: true,
	  password: true,
	  number: true,
	  date: true,
	  month: true,
	  week: true,
	  time: true,
	  datetime: true,
	  'datetime-local': true
	};
	/**
	 * Computes whether the given element should automatically trigger the
	 * `focus-visible` class being added, i.e. whether it should always match
	 * `:focus-visible` when focused.
	 * @param {Element} node
	 * @return {boolean}
	 */

	function focusTriggersKeyboardModality(node) {
	  var type = node.type,
	      tagName = node.tagName;

	  if (tagName === 'INPUT' && inputTypesWhitelist[type] && !node.readOnly) {
	    return true;
	  }

	  if (tagName === 'TEXTAREA' && !node.readOnly) {
	    return true;
	  }

	  if (node.isContentEditable) {
	    return true;
	  }

	  return false;
	}
	/**
	 * Keep track of our keyboard modality state with `hadKeyboardEvent`.
	 * If the most recent user interaction was via the keyboard;
	 * and the key press did not include a meta, alt/option, or control key;
	 * then the modality is keyboard. Otherwise, the modality is not keyboard.
	 * @param {KeyboardEvent} event
	 */


	function handleKeyDown(event) {
	  if (event.metaKey || event.altKey || event.ctrlKey) {
	    return;
	  }

	  hadKeyboardEvent = true;
	}
	/**
	 * If at any point a user clicks with a pointing device, ensure that we change
	 * the modality away from keyboard.
	 * This avoids the situation where a user presses a key on an already focused
	 * element, and then clicks on a different element, focusing it with a
	 * pointing device, while we still think we're in keyboard modality.
	 */


	function handlePointerDown() {
	  hadKeyboardEvent = false;
	}

	function handleVisibilityChange() {
	  if (this.visibilityState === 'hidden') {
	    // If the tab becomes active again, the browser will handle calling focus
	    // on the element (Safari actually calls it twice).
	    // If this tab change caused a blur on an element with focus-visible,
	    // re-apply the class when the user switches back to the tab.
	    if (hadFocusVisibleRecently) {
	      hadKeyboardEvent = true;
	    }
	  }
	}

	function prepare(doc) {
	  doc.addEventListener('keydown', handleKeyDown, true);
	  doc.addEventListener('mousedown', handlePointerDown, true);
	  doc.addEventListener('pointerdown', handlePointerDown, true);
	  doc.addEventListener('touchstart', handlePointerDown, true);
	  doc.addEventListener('visibilitychange', handleVisibilityChange, true);
	}

	function isFocusVisible(event) {
	  var target = event.target;

	  try {
	    return target.matches(':focus-visible');
	  } catch (error) {} // browsers not implementing :focus-visible will throw a SyntaxError
	  // we use our own heuristic for those browsers
	  // rethrow might be better if it's not the expected error but do we really
	  // want to crash if focus-visible malfunctioned?
	  // no need for validFocusTarget check. the user does that by attaching it to
	  // focusable events only


	  return hadKeyboardEvent || focusTriggersKeyboardModality(target);
	}
	/**
	 * Should be called if a blur event is fired on a focus-visible element
	 */


	function handleBlurVisible() {
	  // To detect a tab/window switch, we look for a blur event followed
	  // rapidly by a visibility change.
	  // If we don't see a visibility change within 100ms, it's probably a
	  // regular focus change.
	  hadFocusVisibleRecently = true;
	  window.clearTimeout(hadFocusVisibleRecentlyTimeout);
	  hadFocusVisibleRecentlyTimeout = window.setTimeout(function () {
	    hadFocusVisibleRecently = false;
	  }, 100);
	}

	function useIsFocusVisible() {
	  var ref = react.exports.useCallback(function (instance) {
	    var node = reactDom.exports.findDOMNode(instance);

	    if (node != null) {
	      prepare(node.ownerDocument);
	    }
	  }, []);

	  return {
	    isFocusVisible: isFocusVisible,
	    onBlurVisible: handleBlurVisible,
	    ref: ref
	  };
	}

	var utils$3 = /*#__PURE__*/Object.freeze({
		__proto__: null,
		capitalize: capitalize,
		createChainedFunction: createChainedFunction,
		createSvgIcon: createSvgIcon$1,
		debounce: debounce,
		deprecatedPropType: deprecatedPropType,
		isMuiElement: isMuiElement,
		ownerDocument: ownerDocument,
		ownerWindow: ownerWindow,
		requirePropFactory: requirePropFactory,
		setRef: setRef,
		unsupportedProp: unsupportedProp,
		useControlled: useControlled,
		useEventCallback: useEventCallback,
		useForkRef: useForkRef,
		unstable_useId: useId,
		useIsFocusVisible: useIsFocusVisible
	});

	var require$$0$1 = /*@__PURE__*/getAugmentedNamespace(utils$3);

	(function (exports) {

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	Object.defineProperty(exports, "default", {
	  enumerable: true,
	  get: function get() {
	    return _utils.createSvgIcon;
	  }
	});

	var _utils = require$$0$1;
	}(createSvgIcon));

	var _interopRequireDefault = interopRequireDefault.exports;

	var _interopRequireWildcard = interopRequireWildcard.exports;

	Object.defineProperty(CheckCircle, "__esModule", {
	  value: true
	});
	var default_1 = CheckCircle.default = void 0;

	var React = _interopRequireWildcard(react.exports);

	var _createSvgIcon = _interopRequireDefault(createSvgIcon);

	var _default = (0, _createSvgIcon.default)( /*#__PURE__*/React.createElement("path", {
	  d: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
	}), 'CheckCircle');

	default_1 = CheckCircle.default = _default;

	var SIZE = 44;
	var styles$7 = function styles(theme) {
	  return {
	    /* Styles applied to the root element. */
	    root: {
	      display: 'inline-block'
	    },

	    /* Styles applied to the root element if `variant="static"`. */
	    static: {
	      transition: theme.transitions.create('transform')
	    },

	    /* Styles applied to the root element if `variant="indeterminate"`. */
	    indeterminate: {
	      animation: '$circular-rotate 1.4s linear infinite'
	    },

	    /* Styles applied to the root element if `variant="determinate"`. */
	    determinate: {
	      transition: theme.transitions.create('transform')
	    },

	    /* Styles applied to the root element if `color="primary"`. */
	    colorPrimary: {
	      color: theme.palette.primary.main
	    },

	    /* Styles applied to the root element if `color="secondary"`. */
	    colorSecondary: {
	      color: theme.palette.secondary.main
	    },

	    /* Styles applied to the `svg` element. */
	    svg: {
	      display: 'block' // Keeps the progress centered

	    },

	    /* Styles applied to the `circle` svg path. */
	    circle: {
	      stroke: 'currentColor' // Use butt to follow the specification, by chance, it's already the default CSS value.
	      // strokeLinecap: 'butt',

	    },

	    /* Styles applied to the `circle` svg path if `variant="static"`. */
	    circleStatic: {
	      transition: theme.transitions.create('stroke-dashoffset')
	    },

	    /* Styles applied to the `circle` svg path if `variant="indeterminate"`. */
	    circleIndeterminate: {
	      animation: '$circular-dash 1.4s ease-in-out infinite',
	      // Some default value that looks fine waiting for the animation to kicks in.
	      strokeDasharray: '80px, 200px',
	      strokeDashoffset: '0px' // Add the unit to fix a Edge 16 and below bug.

	    },

	    /* Styles applied to the `circle` svg path if `variant="determinate"`. */
	    circleDeterminate: {
	      transition: theme.transitions.create('stroke-dashoffset')
	    },
	    '@keyframes circular-rotate': {
	      '0%': {
	        // Fix IE 11 wobbly
	        transformOrigin: '50% 50%'
	      },
	      '100%': {
	        transform: 'rotate(360deg)'
	      }
	    },
	    '@keyframes circular-dash': {
	      '0%': {
	        strokeDasharray: '1px, 200px',
	        strokeDashoffset: '0px'
	      },
	      '50%': {
	        strokeDasharray: '100px, 200px',
	        strokeDashoffset: '-15px'
	      },
	      '100%': {
	        strokeDasharray: '100px, 200px',
	        strokeDashoffset: '-125px'
	      }
	    },

	    /* Styles applied to the `circle` svg path if `disableShrink={true}`. */
	    circleDisableShrink: {
	      animation: 'none'
	    }
	  };
	};
	/**
	 * ## ARIA
	 *
	 * If the progress bar is describing the loading progress of a particular region of a page,
	 * you should use `aria-describedby` to point to the progress bar, and set the `aria-busy`
	 * attribute to `true` on that region until it has finished loading.
	 */

	var CircularProgress = /*#__PURE__*/react.exports.forwardRef(function CircularProgress(props, ref) {
	  var classes = props.classes,
	      className = props.className,
	      _props$color = props.color,
	      color = _props$color === void 0 ? 'primary' : _props$color,
	      _props$disableShrink = props.disableShrink,
	      disableShrink = _props$disableShrink === void 0 ? false : _props$disableShrink,
	      _props$size = props.size,
	      size = _props$size === void 0 ? 40 : _props$size,
	      style = props.style,
	      _props$thickness = props.thickness,
	      thickness = _props$thickness === void 0 ? 3.6 : _props$thickness,
	      _props$value = props.value,
	      value = _props$value === void 0 ? 0 : _props$value,
	      _props$variant = props.variant,
	      variant = _props$variant === void 0 ? 'indeterminate' : _props$variant,
	      other = _objectWithoutProperties(props, ["classes", "className", "color", "disableShrink", "size", "style", "thickness", "value", "variant"]);

	  var circleStyle = {};
	  var rootStyle = {};
	  var rootProps = {};

	  if (variant === 'determinate' || variant === 'static') {
	    var circumference = 2 * Math.PI * ((SIZE - thickness) / 2);
	    circleStyle.strokeDasharray = circumference.toFixed(3);
	    rootProps['aria-valuenow'] = Math.round(value);
	    circleStyle.strokeDashoffset = "".concat(((100 - value) / 100 * circumference).toFixed(3), "px");
	    rootStyle.transform = 'rotate(-90deg)';
	  }

	  return /*#__PURE__*/react.exports.createElement("div", _extends({
	    className: clsx(classes.root, className, color !== 'inherit' && classes["color".concat(capitalize(color))], {
	      'determinate': classes.determinate,
	      'indeterminate': classes.indeterminate,
	      'static': classes.static
	    }[variant]),
	    style: _extends({
	      width: size,
	      height: size
	    }, rootStyle, style),
	    ref: ref,
	    role: "progressbar"
	  }, rootProps, other), /*#__PURE__*/react.exports.createElement("svg", {
	    className: classes.svg,
	    viewBox: "".concat(SIZE / 2, " ").concat(SIZE / 2, " ").concat(SIZE, " ").concat(SIZE)
	  }, /*#__PURE__*/react.exports.createElement("circle", {
	    className: clsx(classes.circle, disableShrink && classes.circleDisableShrink, {
	      'determinate': classes.circleDeterminate,
	      'indeterminate': classes.circleIndeterminate,
	      'static': classes.circleStatic
	    }[variant]),
	    style: circleStyle,
	    cx: SIZE,
	    cy: SIZE,
	    r: (SIZE - thickness) / 2,
	    fill: "none",
	    strokeWidth: thickness
	  })));
	});
	var CircularProgress$1 = withStyles(styles$7, {
	  name: 'MuiCircularProgress',
	  flip: false
	})(CircularProgress);

	/**
	 * Gets the first element of `array`.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @alias first
	 * @category Array
	 * @param {Array} array The array to query.
	 * @returns {*} Returns the first element of `array`.
	 * @example
	 *
	 * _.head([1, 2, 3]);
	 * // => 1
	 *
	 * _.head([]);
	 * // => undefined
	 */

	function head(array) {
	  return (array && array.length) ? array[0] : undefined;
	}

	var head_1 = head;

	var first = head_1;

	var baseEach = _baseEach,
	    isArrayLike$2 = isArrayLike_1;

	/**
	 * The base implementation of `_.map` without support for iteratee shorthands.
	 *
	 * @private
	 * @param {Array|Object} collection The collection to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @returns {Array} Returns the new mapped array.
	 */
	function baseMap$2(collection, iteratee) {
	  var index = -1,
	      result = isArrayLike$2(collection) ? Array(collection.length) : [];

	  baseEach(collection, function(value, key, collection) {
	    result[++index] = iteratee(value, key, collection);
	  });
	  return result;
	}

	var _baseMap = baseMap$2;

	var arrayMap$1 = _arrayMap,
	    baseIteratee$1 = _baseIteratee,
	    baseMap$1 = _baseMap,
	    isArray$7 = isArray_1;

	/**
	 * Creates an array of values by running each element in `collection` thru
	 * `iteratee`. The iteratee is invoked with three arguments:
	 * (value, index|key, collection).
	 *
	 * Many lodash methods are guarded to work as iteratees for methods like
	 * `_.every`, `_.filter`, `_.map`, `_.mapValues`, `_.reject`, and `_.some`.
	 *
	 * The guarded methods are:
	 * `ary`, `chunk`, `curry`, `curryRight`, `drop`, `dropRight`, `every`,
	 * `fill`, `invert`, `parseInt`, `random`, `range`, `rangeRight`, `repeat`,
	 * `sampleSize`, `slice`, `some`, `sortBy`, `split`, `take`, `takeRight`,
	 * `template`, `trim`, `trimEnd`, `trimStart`, and `words`
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Collection
	 * @param {Array|Object} collection The collection to iterate over.
	 * @param {Function} [iteratee=_.identity] The function invoked per iteration.
	 * @returns {Array} Returns the new mapped array.
	 * @example
	 *
	 * function square(n) {
	 *   return n * n;
	 * }
	 *
	 * _.map([4, 8], square);
	 * // => [16, 64]
	 *
	 * _.map({ 'a': 4, 'b': 8 }, square);
	 * // => [16, 64] (iteration order is not guaranteed)
	 *
	 * var users = [
	 *   { 'user': 'barney' },
	 *   { 'user': 'fred' }
	 * ];
	 *
	 * // The `_.property` iteratee shorthand.
	 * _.map(users, 'user');
	 * // => ['barney', 'fred']
	 */
	function map(collection, iteratee) {
	  var func = isArray$7(collection) ? arrayMap$1 : baseMap$1;
	  return func(collection, baseIteratee$1(iteratee));
	}

	var map_1 = map;

	var baseKeys = _baseKeys,
	    getTag = _getTag,
	    isArguments$1 = isArguments_1,
	    isArray$6 = isArray_1,
	    isArrayLike$1 = isArrayLike_1,
	    isBuffer$1 = isBuffer$4.exports,
	    isPrototype = _isPrototype,
	    isTypedArray = isTypedArray_1;

	/** `Object#toString` result references. */
	var mapTag = '[object Map]',
	    setTag = '[object Set]';

	/** Used for built-in method references. */
	var objectProto = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;

	/**
	 * Checks if `value` is an empty object, collection, map, or set.
	 *
	 * Objects are considered empty if they have no own enumerable string keyed
	 * properties.
	 *
	 * Array-like values such as `arguments` objects, arrays, buffers, strings, or
	 * jQuery-like collections are considered empty if they have a `length` of `0`.
	 * Similarly, maps and sets are considered empty if they have a `size` of `0`.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is empty, else `false`.
	 * @example
	 *
	 * _.isEmpty(null);
	 * // => true
	 *
	 * _.isEmpty(true);
	 * // => true
	 *
	 * _.isEmpty(1);
	 * // => true
	 *
	 * _.isEmpty([1, 2, 3]);
	 * // => false
	 *
	 * _.isEmpty({ 'a': 1 });
	 * // => false
	 */
	function isEmpty(value) {
	  if (value == null) {
	    return true;
	  }
	  if (isArrayLike$1(value) &&
	      (isArray$6(value) || typeof value == 'string' || typeof value.splice == 'function' ||
	        isBuffer$1(value) || isTypedArray(value) || isArguments$1(value))) {
	    return !value.length;
	  }
	  var tag = getTag(value);
	  if (tag == mapTag || tag == setTag) {
	    return !value.size;
	  }
	  if (isPrototype(value)) {
	    return !baseKeys(value).length;
	  }
	  for (var key in value) {
	    if (hasOwnProperty.call(value, key)) {
	      return false;
	    }
	  }
	  return true;
	}

	var isEmpty_1 = isEmpty;

	/** @type {import('./type')} */
	var type = TypeError;

	var _nodeResolve_empty = {};

	var _nodeResolve_empty$1 = /*#__PURE__*/Object.freeze({
		__proto__: null,
		'default': _nodeResolve_empty
	});

	var require$$0 = /*@__PURE__*/getAugmentedNamespace(_nodeResolve_empty$1);

	var hasMap = typeof Map === 'function' && Map.prototype;
	var mapSizeDescriptor = Object.getOwnPropertyDescriptor && hasMap ? Object.getOwnPropertyDescriptor(Map.prototype, 'size') : null;
	var mapSize = hasMap && mapSizeDescriptor && typeof mapSizeDescriptor.get === 'function' ? mapSizeDescriptor.get : null;
	var mapForEach = hasMap && Map.prototype.forEach;
	var hasSet = typeof Set === 'function' && Set.prototype;
	var setSizeDescriptor = Object.getOwnPropertyDescriptor && hasSet ? Object.getOwnPropertyDescriptor(Set.prototype, 'size') : null;
	var setSize = hasSet && setSizeDescriptor && typeof setSizeDescriptor.get === 'function' ? setSizeDescriptor.get : null;
	var setForEach = hasSet && Set.prototype.forEach;
	var hasWeakMap = typeof WeakMap === 'function' && WeakMap.prototype;
	var weakMapHas = hasWeakMap ? WeakMap.prototype.has : null;
	var hasWeakSet = typeof WeakSet === 'function' && WeakSet.prototype;
	var weakSetHas = hasWeakSet ? WeakSet.prototype.has : null;
	var hasWeakRef = typeof WeakRef === 'function' && WeakRef.prototype;
	var weakRefDeref = hasWeakRef ? WeakRef.prototype.deref : null;
	var booleanValueOf = Boolean.prototype.valueOf;
	var objectToString = Object.prototype.toString;
	var functionToString = Function.prototype.toString;
	var $match = String.prototype.match;
	var $slice = String.prototype.slice;
	var $replace$1 = String.prototype.replace;
	var $toUpperCase = String.prototype.toUpperCase;
	var $toLowerCase = String.prototype.toLowerCase;
	var $test = RegExp.prototype.test;
	var $concat$1 = Array.prototype.concat;
	var $join = Array.prototype.join;
	var $arrSlice = Array.prototype.slice;
	var $floor = Math.floor;
	var bigIntValueOf = typeof BigInt === 'function' ? BigInt.prototype.valueOf : null;
	var gOPS = Object.getOwnPropertySymbols;
	var symToString = typeof Symbol === 'function' && typeof Symbol.iterator === 'symbol' ? Symbol.prototype.toString : null;
	var hasShammedSymbols = typeof Symbol === 'function' && typeof Symbol.iterator === 'object';
	// ie, `has-tostringtag/shams
	var toStringTag = typeof Symbol === 'function' && Symbol.toStringTag && (typeof Symbol.toStringTag === hasShammedSymbols ? 'object' : 'symbol')
	    ? Symbol.toStringTag
	    : null;
	var isEnumerable = Object.prototype.propertyIsEnumerable;

	var gPO = (typeof Reflect === 'function' ? Reflect.getPrototypeOf : Object.getPrototypeOf) || (
	    [].__proto__ === Array.prototype // eslint-disable-line no-proto
	        ? function (O) {
	            return O.__proto__; // eslint-disable-line no-proto
	        }
	        : null
	);

	function addNumericSeparator(num, str) {
	    if (
	        num === Infinity
	        || num === -Infinity
	        || num !== num
	        || (num && num > -1000 && num < 1000)
	        || $test.call(/e/, str)
	    ) {
	        return str;
	    }
	    var sepRegex = /[0-9](?=(?:[0-9]{3})+(?![0-9]))/g;
	    if (typeof num === 'number') {
	        var int = num < 0 ? -$floor(-num) : $floor(num); // trunc(num)
	        if (int !== num) {
	            var intStr = String(int);
	            var dec = $slice.call(str, intStr.length + 1);
	            return $replace$1.call(intStr, sepRegex, '$&_') + '.' + $replace$1.call($replace$1.call(dec, /([0-9]{3})/g, '$&_'), /_$/, '');
	        }
	    }
	    return $replace$1.call(str, sepRegex, '$&_');
	}

	var utilInspect = require$$0;
	var inspectCustom = utilInspect.custom;
	var inspectSymbol = isSymbol$1(inspectCustom) ? inspectCustom : null;

	var quotes = {
	    __proto__: null,
	    'double': '"',
	    single: "'"
	};
	var quoteREs = {
	    __proto__: null,
	    'double': /(["\\])/g,
	    single: /(['\\])/g
	};

	var objectInspect = function inspect_(obj, options, depth, seen) {
	    var opts = options || {};

	    if (has$3(opts, 'quoteStyle') && !has$3(quotes, opts.quoteStyle)) {
	        throw new TypeError('option "quoteStyle" must be "single" or "double"');
	    }
	    if (
	        has$3(opts, 'maxStringLength') && (typeof opts.maxStringLength === 'number'
	            ? opts.maxStringLength < 0 && opts.maxStringLength !== Infinity
	            : opts.maxStringLength !== null
	        )
	    ) {
	        throw new TypeError('option "maxStringLength", if provided, must be a positive integer, Infinity, or `null`');
	    }
	    var customInspect = has$3(opts, 'customInspect') ? opts.customInspect : true;
	    if (typeof customInspect !== 'boolean' && customInspect !== 'symbol') {
	        throw new TypeError('option "customInspect", if provided, must be `true`, `false`, or `\'symbol\'`');
	    }

	    if (
	        has$3(opts, 'indent')
	        && opts.indent !== null
	        && opts.indent !== '\t'
	        && !(parseInt(opts.indent, 10) === opts.indent && opts.indent > 0)
	    ) {
	        throw new TypeError('option "indent" must be "\\t", an integer > 0, or `null`');
	    }
	    if (has$3(opts, 'numericSeparator') && typeof opts.numericSeparator !== 'boolean') {
	        throw new TypeError('option "numericSeparator", if provided, must be `true` or `false`');
	    }
	    var numericSeparator = opts.numericSeparator;

	    if (typeof obj === 'undefined') {
	        return 'undefined';
	    }
	    if (obj === null) {
	        return 'null';
	    }
	    if (typeof obj === 'boolean') {
	        return obj ? 'true' : 'false';
	    }

	    if (typeof obj === 'string') {
	        return inspectString(obj, opts);
	    }
	    if (typeof obj === 'number') {
	        if (obj === 0) {
	            return Infinity / obj > 0 ? '0' : '-0';
	        }
	        var str = String(obj);
	        return numericSeparator ? addNumericSeparator(obj, str) : str;
	    }
	    if (typeof obj === 'bigint') {
	        var bigIntStr = String(obj) + 'n';
	        return numericSeparator ? addNumericSeparator(obj, bigIntStr) : bigIntStr;
	    }

	    var maxDepth = typeof opts.depth === 'undefined' ? 5 : opts.depth;
	    if (typeof depth === 'undefined') { depth = 0; }
	    if (depth >= maxDepth && maxDepth > 0 && typeof obj === 'object') {
	        return isArray$5(obj) ? '[Array]' : '[Object]';
	    }

	    var indent = getIndent(opts, depth);

	    if (typeof seen === 'undefined') {
	        seen = [];
	    } else if (indexOf(seen, obj) >= 0) {
	        return '[Circular]';
	    }

	    function inspect(value, from, noIndent) {
	        if (from) {
	            seen = $arrSlice.call(seen);
	            seen.push(from);
	        }
	        if (noIndent) {
	            var newOpts = {
	                depth: opts.depth
	            };
	            if (has$3(opts, 'quoteStyle')) {
	                newOpts.quoteStyle = opts.quoteStyle;
	            }
	            return inspect_(value, newOpts, depth + 1, seen);
	        }
	        return inspect_(value, opts, depth + 1, seen);
	    }

	    if (typeof obj === 'function' && !isRegExp$1(obj)) { // in older engines, regexes are callable
	        var name = nameOf(obj);
	        var keys = arrObjKeys(obj, inspect);
	        return '[Function' + (name ? ': ' + name : ' (anonymous)') + ']' + (keys.length > 0 ? ' { ' + $join.call(keys, ', ') + ' }' : '');
	    }
	    if (isSymbol$1(obj)) {
	        var symString = hasShammedSymbols ? $replace$1.call(String(obj), /^(Symbol\(.*\))_[^)]*$/, '$1') : symToString.call(obj);
	        return typeof obj === 'object' && !hasShammedSymbols ? markBoxed(symString) : symString;
	    }
	    if (isElement(obj)) {
	        var s = '<' + $toLowerCase.call(String(obj.nodeName));
	        var attrs = obj.attributes || [];
	        for (var i = 0; i < attrs.length; i++) {
	            s += ' ' + attrs[i].name + '=' + wrapQuotes(quote(attrs[i].value), 'double', opts);
	        }
	        s += '>';
	        if (obj.childNodes && obj.childNodes.length) { s += '...'; }
	        s += '</' + $toLowerCase.call(String(obj.nodeName)) + '>';
	        return s;
	    }
	    if (isArray$5(obj)) {
	        if (obj.length === 0) { return '[]'; }
	        var xs = arrObjKeys(obj, inspect);
	        if (indent && !singleLineValues(xs)) {
	            return '[' + indentedJoin(xs, indent) + ']';
	        }
	        return '[ ' + $join.call(xs, ', ') + ' ]';
	    }
	    if (isError(obj)) {
	        var parts = arrObjKeys(obj, inspect);
	        if (!('cause' in Error.prototype) && 'cause' in obj && !isEnumerable.call(obj, 'cause')) {
	            return '{ [' + String(obj) + '] ' + $join.call($concat$1.call('[cause]: ' + inspect(obj.cause), parts), ', ') + ' }';
	        }
	        if (parts.length === 0) { return '[' + String(obj) + ']'; }
	        return '{ [' + String(obj) + '] ' + $join.call(parts, ', ') + ' }';
	    }
	    if (typeof obj === 'object' && customInspect) {
	        if (inspectSymbol && typeof obj[inspectSymbol] === 'function' && utilInspect) {
	            return utilInspect(obj, { depth: maxDepth - depth });
	        } else if (customInspect !== 'symbol' && typeof obj.inspect === 'function') {
	            return obj.inspect();
	        }
	    }
	    if (isMap(obj)) {
	        var mapParts = [];
	        if (mapForEach) {
	            mapForEach.call(obj, function (value, key) {
	                mapParts.push(inspect(key, obj, true) + ' => ' + inspect(value, obj));
	            });
	        }
	        return collectionOf('Map', mapSize.call(obj), mapParts, indent);
	    }
	    if (isSet(obj)) {
	        var setParts = [];
	        if (setForEach) {
	            setForEach.call(obj, function (value) {
	                setParts.push(inspect(value, obj));
	            });
	        }
	        return collectionOf('Set', setSize.call(obj), setParts, indent);
	    }
	    if (isWeakMap(obj)) {
	        return weakCollectionOf('WeakMap');
	    }
	    if (isWeakSet(obj)) {
	        return weakCollectionOf('WeakSet');
	    }
	    if (isWeakRef(obj)) {
	        return weakCollectionOf('WeakRef');
	    }
	    if (isNumber$1(obj)) {
	        return markBoxed(inspect(Number(obj)));
	    }
	    if (isBigInt(obj)) {
	        return markBoxed(inspect(bigIntValueOf.call(obj)));
	    }
	    if (isBoolean(obj)) {
	        return markBoxed(booleanValueOf.call(obj));
	    }
	    if (isString(obj)) {
	        return markBoxed(inspect(String(obj)));
	    }
	    // note: in IE 8, sometimes `global !== window` but both are the prototypes of each other
	    /* eslint-env browser */
	    if (typeof window !== 'undefined' && obj === window) {
	        return '{ [object Window] }';
	    }
	    if (
	        (typeof globalThis !== 'undefined' && obj === globalThis)
	        || (typeof commonjsGlobal !== 'undefined' && obj === commonjsGlobal)
	    ) {
	        return '{ [object globalThis] }';
	    }
	    if (!isDate(obj) && !isRegExp$1(obj)) {
	        var ys = arrObjKeys(obj, inspect);
	        var isPlainObject = gPO ? gPO(obj) === Object.prototype : obj instanceof Object || obj.constructor === Object;
	        var protoTag = obj instanceof Object ? '' : 'null prototype';
	        var stringTag = !isPlainObject && toStringTag && Object(obj) === obj && toStringTag in obj ? $slice.call(toStr$1(obj), 8, -1) : protoTag ? 'Object' : '';
	        var constructorTag = isPlainObject || typeof obj.constructor !== 'function' ? '' : obj.constructor.name ? obj.constructor.name + ' ' : '';
	        var tag = constructorTag + (stringTag || protoTag ? '[' + $join.call($concat$1.call([], stringTag || [], protoTag || []), ': ') + '] ' : '');
	        if (ys.length === 0) { return tag + '{}'; }
	        if (indent) {
	            return tag + '{' + indentedJoin(ys, indent) + '}';
	        }
	        return tag + '{ ' + $join.call(ys, ', ') + ' }';
	    }
	    return String(obj);
	};

	function wrapQuotes(s, defaultStyle, opts) {
	    var style = opts.quoteStyle || defaultStyle;
	    var quoteChar = quotes[style];
	    return quoteChar + s + quoteChar;
	}

	function quote(s) {
	    return $replace$1.call(String(s), /"/g, '&quot;');
	}

	function canTrustToString(obj) {
	    return !toStringTag || !(typeof obj === 'object' && (toStringTag in obj || typeof obj[toStringTag] !== 'undefined'));
	}
	function isArray$5(obj) { return toStr$1(obj) === '[object Array]' && canTrustToString(obj); }
	function isDate(obj) { return toStr$1(obj) === '[object Date]' && canTrustToString(obj); }
	function isRegExp$1(obj) { return toStr$1(obj) === '[object RegExp]' && canTrustToString(obj); }
	function isError(obj) { return toStr$1(obj) === '[object Error]' && canTrustToString(obj); }
	function isString(obj) { return toStr$1(obj) === '[object String]' && canTrustToString(obj); }
	function isNumber$1(obj) { return toStr$1(obj) === '[object Number]' && canTrustToString(obj); }
	function isBoolean(obj) { return toStr$1(obj) === '[object Boolean]' && canTrustToString(obj); }

	// Symbol and BigInt do have Symbol.toStringTag by spec, so that can't be used to eliminate false positives
	function isSymbol$1(obj) {
	    if (hasShammedSymbols) {
	        return obj && typeof obj === 'object' && obj instanceof Symbol;
	    }
	    if (typeof obj === 'symbol') {
	        return true;
	    }
	    if (!obj || typeof obj !== 'object' || !symToString) {
	        return false;
	    }
	    try {
	        symToString.call(obj);
	        return true;
	    } catch (e) {}
	    return false;
	}

	function isBigInt(obj) {
	    if (!obj || typeof obj !== 'object' || !bigIntValueOf) {
	        return false;
	    }
	    try {
	        bigIntValueOf.call(obj);
	        return true;
	    } catch (e) {}
	    return false;
	}

	var hasOwn$1 = Object.prototype.hasOwnProperty || function (key) { return key in this; };
	function has$3(obj, key) {
	    return hasOwn$1.call(obj, key);
	}

	function toStr$1(obj) {
	    return objectToString.call(obj);
	}

	function nameOf(f) {
	    if (f.name) { return f.name; }
	    var m = $match.call(functionToString.call(f), /^function\s*([\w$]+)/);
	    if (m) { return m[1]; }
	    return null;
	}

	function indexOf(xs, x) {
	    if (xs.indexOf) { return xs.indexOf(x); }
	    for (var i = 0, l = xs.length; i < l; i++) {
	        if (xs[i] === x) { return i; }
	    }
	    return -1;
	}

	function isMap(x) {
	    if (!mapSize || !x || typeof x !== 'object') {
	        return false;
	    }
	    try {
	        mapSize.call(x);
	        try {
	            setSize.call(x);
	        } catch (s) {
	            return true;
	        }
	        return x instanceof Map; // core-js workaround, pre-v2.5.0
	    } catch (e) {}
	    return false;
	}

	function isWeakMap(x) {
	    if (!weakMapHas || !x || typeof x !== 'object') {
	        return false;
	    }
	    try {
	        weakMapHas.call(x, weakMapHas);
	        try {
	            weakSetHas.call(x, weakSetHas);
	        } catch (s) {
	            return true;
	        }
	        return x instanceof WeakMap; // core-js workaround, pre-v2.5.0
	    } catch (e) {}
	    return false;
	}

	function isWeakRef(x) {
	    if (!weakRefDeref || !x || typeof x !== 'object') {
	        return false;
	    }
	    try {
	        weakRefDeref.call(x);
	        return true;
	    } catch (e) {}
	    return false;
	}

	function isSet(x) {
	    if (!setSize || !x || typeof x !== 'object') {
	        return false;
	    }
	    try {
	        setSize.call(x);
	        try {
	            mapSize.call(x);
	        } catch (m) {
	            return true;
	        }
	        return x instanceof Set; // core-js workaround, pre-v2.5.0
	    } catch (e) {}
	    return false;
	}

	function isWeakSet(x) {
	    if (!weakSetHas || !x || typeof x !== 'object') {
	        return false;
	    }
	    try {
	        weakSetHas.call(x, weakSetHas);
	        try {
	            weakMapHas.call(x, weakMapHas);
	        } catch (s) {
	            return true;
	        }
	        return x instanceof WeakSet; // core-js workaround, pre-v2.5.0
	    } catch (e) {}
	    return false;
	}

	function isElement(x) {
	    if (!x || typeof x !== 'object') { return false; }
	    if (typeof HTMLElement !== 'undefined' && x instanceof HTMLElement) {
	        return true;
	    }
	    return typeof x.nodeName === 'string' && typeof x.getAttribute === 'function';
	}

	function inspectString(str, opts) {
	    if (str.length > opts.maxStringLength) {
	        var remaining = str.length - opts.maxStringLength;
	        var trailer = '... ' + remaining + ' more character' + (remaining > 1 ? 's' : '');
	        return inspectString($slice.call(str, 0, opts.maxStringLength), opts) + trailer;
	    }
	    var quoteRE = quoteREs[opts.quoteStyle || 'single'];
	    quoteRE.lastIndex = 0;
	    // eslint-disable-next-line no-control-regex
	    var s = $replace$1.call($replace$1.call(str, quoteRE, '\\$1'), /[\x00-\x1f]/g, lowbyte);
	    return wrapQuotes(s, 'single', opts);
	}

	function lowbyte(c) {
	    var n = c.charCodeAt(0);
	    var x = {
	        8: 'b',
	        9: 't',
	        10: 'n',
	        12: 'f',
	        13: 'r'
	    }[n];
	    if (x) { return '\\' + x; }
	    return '\\x' + (n < 0x10 ? '0' : '') + $toUpperCase.call(n.toString(16));
	}

	function markBoxed(str) {
	    return 'Object(' + str + ')';
	}

	function weakCollectionOf(type) {
	    return type + ' { ? }';
	}

	function collectionOf(type, size, entries, indent) {
	    var joinedEntries = indent ? indentedJoin(entries, indent) : $join.call(entries, ', ');
	    return type + ' (' + size + ') {' + joinedEntries + '}';
	}

	function singleLineValues(xs) {
	    for (var i = 0; i < xs.length; i++) {
	        if (indexOf(xs[i], '\n') >= 0) {
	            return false;
	        }
	    }
	    return true;
	}

	function getIndent(opts, depth) {
	    var baseIndent;
	    if (opts.indent === '\t') {
	        baseIndent = '\t';
	    } else if (typeof opts.indent === 'number' && opts.indent > 0) {
	        baseIndent = $join.call(Array(opts.indent + 1), ' ');
	    } else {
	        return null;
	    }
	    return {
	        base: baseIndent,
	        prev: $join.call(Array(depth + 1), baseIndent)
	    };
	}

	function indentedJoin(xs, indent) {
	    if (xs.length === 0) { return ''; }
	    var lineJoiner = '\n' + indent.prev + indent.base;
	    return lineJoiner + $join.call(xs, ',' + lineJoiner) + '\n' + indent.prev;
	}

	function arrObjKeys(obj, inspect) {
	    var isArr = isArray$5(obj);
	    var xs = [];
	    if (isArr) {
	        xs.length = obj.length;
	        for (var i = 0; i < obj.length; i++) {
	            xs[i] = has$3(obj, i) ? inspect(obj[i], obj) : '';
	        }
	    }
	    var syms = typeof gOPS === 'function' ? gOPS(obj) : [];
	    var symMap;
	    if (hasShammedSymbols) {
	        symMap = {};
	        for (var k = 0; k < syms.length; k++) {
	            symMap['$' + syms[k]] = syms[k];
	        }
	    }

	    for (var key in obj) { // eslint-disable-line no-restricted-syntax
	        if (!has$3(obj, key)) { continue; } // eslint-disable-line no-restricted-syntax, no-continue
	        if (isArr && String(Number(key)) === key && key < obj.length) { continue; } // eslint-disable-line no-restricted-syntax, no-continue
	        if (hasShammedSymbols && symMap['$' + key] instanceof Symbol) {
	            // this is to prevent shammed Symbols, which are stored as strings, from being included in the string key section
	            continue; // eslint-disable-line no-restricted-syntax, no-continue
	        } else if ($test.call(/[^\w$]/, key)) {
	            xs.push(inspect(key, obj) + ': ' + inspect(obj[key], obj));
	        } else {
	            xs.push(key + ': ' + inspect(obj[key], obj));
	        }
	    }
	    if (typeof gOPS === 'function') {
	        for (var j = 0; j < syms.length; j++) {
	            if (isEnumerable.call(obj, syms[j])) {
	                xs.push('[' + inspect(syms[j]) + ']: ' + inspect(obj[syms[j]], obj));
	            }
	        }
	    }
	    return xs;
	}

	var inspect$3 = objectInspect;

	var $TypeError$5 = type;

	/*
	* This function traverses the list returning the node corresponding to the given key.
	*
	* That node is also moved to the head of the list, so that if it's accessed again we don't need to traverse the whole list.
	* By doing so, all the recently used nodes can be accessed relatively quickly.
	*/
	/** @type {import('./list.d.ts').listGetNode} */
	// eslint-disable-next-line consistent-return
	var listGetNode = function (list, key, isDelete) {
		/** @type {typeof list | NonNullable<(typeof list)['next']>} */
		var prev = list;
		/** @type {(typeof list)['next']} */
		var curr;
		// eslint-disable-next-line eqeqeq
		for (; (curr = prev.next) != null; prev = curr) {
			if (curr.key === key) {
				prev.next = curr.next;
				if (!isDelete) {
					// eslint-disable-next-line no-extra-parens
					curr.next = /** @type {NonNullable<typeof list.next>} */ (list.next);
					list.next = curr; // eslint-disable-line no-param-reassign
				}
				return curr;
			}
		}
	};

	/** @type {import('./list.d.ts').listGet} */
	var listGet = function (objects, key) {
		if (!objects) {
			return void undefined;
		}
		var node = listGetNode(objects, key);
		return node && node.value;
	};
	/** @type {import('./list.d.ts').listSet} */
	var listSet = function (objects, key, value) {
		var node = listGetNode(objects, key);
		if (node) {
			node.value = value;
		} else {
			// Prepend the new node to the beginning of the list
			objects.next = /** @type {import('./list.d.ts').ListNode<typeof value, typeof key>} */ ({ // eslint-disable-line no-param-reassign, no-extra-parens
				key: key,
				next: objects.next,
				value: value
			});
		}
	};
	/** @type {import('./list.d.ts').listHas} */
	var listHas = function (objects, key) {
		if (!objects) {
			return false;
		}
		return !!listGetNode(objects, key);
	};
	/** @type {import('./list.d.ts').listDelete} */
	// eslint-disable-next-line consistent-return
	var listDelete = function (objects, key) {
		if (objects) {
			return listGetNode(objects, key, true);
		}
	};

	/** @type {import('.')} */
	var sideChannelList = function getSideChannelList() {
		/** @typedef {ReturnType<typeof getSideChannelList>} Channel */
		/** @typedef {Parameters<Channel['get']>[0]} K */
		/** @typedef {Parameters<Channel['set']>[1]} V */

		/** @type {import('./list.d.ts').RootNode<V, K> | undefined} */ var $o;

		/** @type {Channel} */
		var channel = {
			assert: function (key) {
				if (!channel.has(key)) {
					throw new $TypeError$5('Side channel does not contain ' + inspect$3(key));
				}
			},
			'delete': function (key) {
				var deletedNode = listDelete($o, key);
				if (deletedNode && $o && !$o.next) {
					$o = void undefined;
				}
				return !!deletedNode;
			},
			get: function (key) {
				return listGet($o, key);
			},
			has: function (key) {
				return listHas($o, key);
			},
			set: function (key, value) {
				if (!$o) {
					// Initialize the linked list as an empty node, so that we don't have to special-case handling of the first node: we can always refer to it as (previous node).next, instead of something like (list).head
					$o = {
						next: void undefined
					};
				}
				// eslint-disable-next-line no-extra-parens
				listSet(/** @type {NonNullable<typeof $o>} */ ($o), key, value);
			}
		};
		return channel;
	};

	/** @type {import('.')} */
	var esObjectAtoms = Object;

	/** @type {import('.')} */
	var esErrors = Error;

	/** @type {import('./eval')} */
	var _eval = EvalError;

	/** @type {import('./range')} */
	var range = RangeError;

	/** @type {import('./ref')} */
	var ref = ReferenceError;

	/** @type {import('./syntax')} */
	var syntax = SyntaxError;

	/** @type {import('./uri')} */
	var uri = URIError;

	/** @type {import('./abs')} */
	var abs$1 = Math.abs;

	/** @type {import('./floor')} */
	var floor$1 = Math.floor;

	/** @type {import('./max')} */
	var max$2 = Math.max;

	/** @type {import('./min')} */
	var min$1 = Math.min;

	/** @type {import('./pow')} */
	var pow$1 = Math.pow;

	/** @type {import('./round')} */
	var round$1 = Math.round;

	/** @type {import('./isNaN')} */
	var _isNaN = Number.isNaN || function isNaN(a) {
		return a !== a;
	};

	var $isNaN = _isNaN;

	/** @type {import('./sign')} */
	var sign$1 = function sign(number) {
		if ($isNaN(number) || number === 0) {
			return number;
		}
		return number < 0 ? -1 : +1;
	};

	/** @type {import('./gOPD')} */
	var gOPD$1 = Object.getOwnPropertyDescriptor;

	/** @type {import('.')} */
	var $gOPD$1 = gOPD$1;

	if ($gOPD$1) {
		try {
			$gOPD$1([], 'length');
		} catch (e) {
			// IE 8 has a broken gOPD
			$gOPD$1 = null;
		}
	}

	var gopd = $gOPD$1;

	/** @type {import('.')} */
	var $defineProperty$1 = Object.defineProperty || false;
	if ($defineProperty$1) {
		try {
			$defineProperty$1({}, 'a', { value: 1 });
		} catch (e) {
			// IE 8 has a broken defineProperty
			$defineProperty$1 = false;
		}
	}

	var esDefineProperty = $defineProperty$1;

	/** @type {import('./shams')} */
	/* eslint complexity: [2, 18], max-statements: [2, 33] */
	var shams = function hasSymbols() {
		if (typeof Symbol !== 'function' || typeof Object.getOwnPropertySymbols !== 'function') { return false; }
		if (typeof Symbol.iterator === 'symbol') { return true; }

		/** @type {{ [k in symbol]?: unknown }} */
		var obj = {};
		var sym = Symbol('test');
		var symObj = Object(sym);
		if (typeof sym === 'string') { return false; }

		if (Object.prototype.toString.call(sym) !== '[object Symbol]') { return false; }
		if (Object.prototype.toString.call(symObj) !== '[object Symbol]') { return false; }

		// temp disabled per https://github.com/ljharb/object.assign/issues/17
		// if (sym instanceof Symbol) { return false; }
		// temp disabled per https://github.com/WebReflection/get-own-property-symbols/issues/4
		// if (!(symObj instanceof Symbol)) { return false; }

		// if (typeof Symbol.prototype.toString !== 'function') { return false; }
		// if (String(sym) !== Symbol.prototype.toString.call(sym)) { return false; }

		var symVal = 42;
		obj[sym] = symVal;
		for (var _ in obj) { return false; } // eslint-disable-line no-restricted-syntax, no-unreachable-loop
		if (typeof Object.keys === 'function' && Object.keys(obj).length !== 0) { return false; }

		if (typeof Object.getOwnPropertyNames === 'function' && Object.getOwnPropertyNames(obj).length !== 0) { return false; }

		var syms = Object.getOwnPropertySymbols(obj);
		if (syms.length !== 1 || syms[0] !== sym) { return false; }

		if (!Object.prototype.propertyIsEnumerable.call(obj, sym)) { return false; }

		if (typeof Object.getOwnPropertyDescriptor === 'function') {
			// eslint-disable-next-line no-extra-parens
			var descriptor = /** @type {PropertyDescriptor} */ (Object.getOwnPropertyDescriptor(obj, sym));
			if (descriptor.value !== symVal || descriptor.enumerable !== true) { return false; }
		}

		return true;
	};

	var origSymbol = typeof Symbol !== 'undefined' && Symbol;
	var hasSymbolSham = shams;

	/** @type {import('.')} */
	var hasSymbols$1 = function hasNativeSymbols() {
		if (typeof origSymbol !== 'function') { return false; }
		if (typeof Symbol !== 'function') { return false; }
		if (typeof origSymbol('foo') !== 'symbol') { return false; }
		if (typeof Symbol('bar') !== 'symbol') { return false; }

		return hasSymbolSham();
	};

	/** @type {import('./Reflect.getPrototypeOf')} */
	var Reflect_getPrototypeOf = (typeof Reflect !== 'undefined' && Reflect.getPrototypeOf) || null;

	var $Object$2 = esObjectAtoms;

	/** @type {import('./Object.getPrototypeOf')} */
	var Object_getPrototypeOf = $Object$2.getPrototypeOf || null;

	/* eslint no-invalid-this: 1 */

	var ERROR_MESSAGE = 'Function.prototype.bind called on incompatible ';
	var toStr = Object.prototype.toString;
	var max$1 = Math.max;
	var funcType = '[object Function]';

	var concatty = function concatty(a, b) {
	    var arr = [];

	    for (var i = 0; i < a.length; i += 1) {
	        arr[i] = a[i];
	    }
	    for (var j = 0; j < b.length; j += 1) {
	        arr[j + a.length] = b[j];
	    }

	    return arr;
	};

	var slicy = function slicy(arrLike, offset) {
	    var arr = [];
	    for (var i = offset || 0, j = 0; i < arrLike.length; i += 1, j += 1) {
	        arr[j] = arrLike[i];
	    }
	    return arr;
	};

	var joiny = function (arr, joiner) {
	    var str = '';
	    for (var i = 0; i < arr.length; i += 1) {
	        str += arr[i];
	        if (i + 1 < arr.length) {
	            str += joiner;
	        }
	    }
	    return str;
	};

	var implementation$1 = function bind(that) {
	    var target = this;
	    if (typeof target !== 'function' || toStr.apply(target) !== funcType) {
	        throw new TypeError(ERROR_MESSAGE + target);
	    }
	    var args = slicy(arguments, 1);

	    var bound;
	    var binder = function () {
	        if (this instanceof bound) {
	            var result = target.apply(
	                this,
	                concatty(args, arguments)
	            );
	            if (Object(result) === result) {
	                return result;
	            }
	            return this;
	        }
	        return target.apply(
	            that,
	            concatty(args, arguments)
	        );

	    };

	    var boundLength = max$1(0, target.length - args.length);
	    var boundArgs = [];
	    for (var i = 0; i < boundLength; i++) {
	        boundArgs[i] = '$' + i;
	    }

	    bound = Function('binder', 'return function (' + joiny(boundArgs, ',') + '){ return binder.apply(this,arguments); }')(binder);

	    if (target.prototype) {
	        var Empty = function Empty() {};
	        Empty.prototype = target.prototype;
	        bound.prototype = new Empty();
	        Empty.prototype = null;
	    }

	    return bound;
	};

	var implementation = implementation$1;

	var functionBind = Function.prototype.bind || implementation;

	/** @type {import('./functionCall')} */
	var functionCall = Function.prototype.call;

	/** @type {import('./functionApply')} */
	var functionApply = Function.prototype.apply;

	/** @type {import('./reflectApply')} */
	var reflectApply = typeof Reflect !== 'undefined' && Reflect && Reflect.apply;

	var bind$3 = functionBind;

	var $apply$1 = functionApply;
	var $call$2 = functionCall;
	var $reflectApply = reflectApply;

	/** @type {import('./actualApply')} */
	var actualApply = $reflectApply || bind$3.call($call$2, $apply$1);

	var bind$2 = functionBind;
	var $TypeError$4 = type;

	var $call$1 = functionCall;
	var $actualApply = actualApply;

	/** @type {(args: [Function, thisArg?: unknown, ...args: unknown[]]) => Function} TODO FIXME, find a way to use import('.') */
	var callBindApplyHelpers = function callBindBasic(args) {
		if (args.length < 1 || typeof args[0] !== 'function') {
			throw new $TypeError$4('a function is required');
		}
		return $actualApply(bind$2, $call$1, args);
	};

	var callBind = callBindApplyHelpers;
	var gOPD = gopd;

	var hasProtoAccessor;
	try {
		// eslint-disable-next-line no-extra-parens, no-proto
		hasProtoAccessor = /** @type {{ __proto__?: typeof Array.prototype }} */ ([]).__proto__ === Array.prototype;
	} catch (e) {
		if (!e || typeof e !== 'object' || !('code' in e) || e.code !== 'ERR_PROTO_ACCESS') {
			throw e;
		}
	}

	// eslint-disable-next-line no-extra-parens
	var desc = !!hasProtoAccessor && gOPD && gOPD(Object.prototype, /** @type {keyof typeof Object.prototype} */ ('__proto__'));

	var $Object$1 = Object;
	var $getPrototypeOf = $Object$1.getPrototypeOf;

	/** @type {import('./get')} */
	var get = desc && typeof desc.get === 'function'
		? callBind([desc.get])
		: typeof $getPrototypeOf === 'function'
			? /** @type {import('./get')} */ function getDunder(value) {
				// eslint-disable-next-line eqeqeq
				return $getPrototypeOf(value == null ? value : $Object$1(value));
			}
			: false;

	var reflectGetProto = Reflect_getPrototypeOf;
	var originalGetProto = Object_getPrototypeOf;

	var getDunderProto = get;

	/** @type {import('.')} */
	var getProto$1 = reflectGetProto
		? function getProto(O) {
			// @ts-expect-error TS can't narrow inside a closure, for some reason
			return reflectGetProto(O);
		}
		: originalGetProto
			? function getProto(O) {
				if (!O || (typeof O !== 'object' && typeof O !== 'function')) {
					throw new TypeError('getProto: not an object');
				}
				// @ts-expect-error TS can't narrow inside a closure, for some reason
				return originalGetProto(O);
			}
			: getDunderProto
				? function getProto(O) {
					// @ts-expect-error TS can't narrow inside a closure, for some reason
					return getDunderProto(O);
				}
				: null;

	var call = Function.prototype.call;
	var $hasOwn = Object.prototype.hasOwnProperty;
	var bind$1 = functionBind;

	/** @type {import('.')} */
	var hasown = bind$1.call(call, $hasOwn);

	var undefined$1;

	var $Object = esObjectAtoms;

	var $Error = esErrors;
	var $EvalError = _eval;
	var $RangeError = range;
	var $ReferenceError = ref;
	var $SyntaxError = syntax;
	var $TypeError$3 = type;
	var $URIError = uri;

	var abs = abs$1;
	var floor = floor$1;
	var max = max$2;
	var min = min$1;
	var pow = pow$1;
	var round = round$1;
	var sign = sign$1;

	var $Function = Function;

	// eslint-disable-next-line consistent-return
	var getEvalledConstructor = function (expressionSyntax) {
		try {
			return $Function('"use strict"; return (' + expressionSyntax + ').constructor;')();
		} catch (e) {}
	};

	var $gOPD = gopd;
	var $defineProperty = esDefineProperty;

	var throwTypeError = function () {
		throw new $TypeError$3();
	};
	var ThrowTypeError = $gOPD
		? (function () {
			try {
				// eslint-disable-next-line no-unused-expressions, no-caller, no-restricted-properties
				arguments.callee; // IE 8 does not throw here
				return throwTypeError;
			} catch (calleeThrows) {
				try {
					// IE 8 throws on Object.getOwnPropertyDescriptor(arguments, '')
					return $gOPD(arguments, 'callee').get;
				} catch (gOPDthrows) {
					return throwTypeError;
				}
			}
		}())
		: throwTypeError;

	var hasSymbols = hasSymbols$1();

	var getProto = getProto$1;
	var $ObjectGPO = Object_getPrototypeOf;
	var $ReflectGPO = Reflect_getPrototypeOf;

	var $apply = functionApply;
	var $call = functionCall;

	var needsEval = {};

	var TypedArray = typeof Uint8Array === 'undefined' || !getProto ? undefined$1 : getProto(Uint8Array);

	var INTRINSICS = {
		__proto__: null,
		'%AggregateError%': typeof AggregateError === 'undefined' ? undefined$1 : AggregateError,
		'%Array%': Array,
		'%ArrayBuffer%': typeof ArrayBuffer === 'undefined' ? undefined$1 : ArrayBuffer,
		'%ArrayIteratorPrototype%': hasSymbols && getProto ? getProto([][Symbol.iterator]()) : undefined$1,
		'%AsyncFromSyncIteratorPrototype%': undefined$1,
		'%AsyncFunction%': needsEval,
		'%AsyncGenerator%': needsEval,
		'%AsyncGeneratorFunction%': needsEval,
		'%AsyncIteratorPrototype%': needsEval,
		'%Atomics%': typeof Atomics === 'undefined' ? undefined$1 : Atomics,
		'%BigInt%': typeof BigInt === 'undefined' ? undefined$1 : BigInt,
		'%BigInt64Array%': typeof BigInt64Array === 'undefined' ? undefined$1 : BigInt64Array,
		'%BigUint64Array%': typeof BigUint64Array === 'undefined' ? undefined$1 : BigUint64Array,
		'%Boolean%': Boolean,
		'%DataView%': typeof DataView === 'undefined' ? undefined$1 : DataView,
		'%Date%': Date,
		'%decodeURI%': decodeURI,
		'%decodeURIComponent%': decodeURIComponent,
		'%encodeURI%': encodeURI,
		'%encodeURIComponent%': encodeURIComponent,
		'%Error%': $Error,
		'%eval%': eval, // eslint-disable-line no-eval
		'%EvalError%': $EvalError,
		'%Float16Array%': typeof Float16Array === 'undefined' ? undefined$1 : Float16Array,
		'%Float32Array%': typeof Float32Array === 'undefined' ? undefined$1 : Float32Array,
		'%Float64Array%': typeof Float64Array === 'undefined' ? undefined$1 : Float64Array,
		'%FinalizationRegistry%': typeof FinalizationRegistry === 'undefined' ? undefined$1 : FinalizationRegistry,
		'%Function%': $Function,
		'%GeneratorFunction%': needsEval,
		'%Int8Array%': typeof Int8Array === 'undefined' ? undefined$1 : Int8Array,
		'%Int16Array%': typeof Int16Array === 'undefined' ? undefined$1 : Int16Array,
		'%Int32Array%': typeof Int32Array === 'undefined' ? undefined$1 : Int32Array,
		'%isFinite%': isFinite,
		'%isNaN%': isNaN,
		'%IteratorPrototype%': hasSymbols && getProto ? getProto(getProto([][Symbol.iterator]())) : undefined$1,
		'%JSON%': typeof JSON === 'object' ? JSON : undefined$1,
		'%Map%': typeof Map === 'undefined' ? undefined$1 : Map,
		'%MapIteratorPrototype%': typeof Map === 'undefined' || !hasSymbols || !getProto ? undefined$1 : getProto(new Map()[Symbol.iterator]()),
		'%Math%': Math,
		'%Number%': Number,
		'%Object%': $Object,
		'%Object.getOwnPropertyDescriptor%': $gOPD,
		'%parseFloat%': parseFloat,
		'%parseInt%': parseInt,
		'%Promise%': typeof Promise === 'undefined' ? undefined$1 : Promise,
		'%Proxy%': typeof Proxy === 'undefined' ? undefined$1 : Proxy,
		'%RangeError%': $RangeError,
		'%ReferenceError%': $ReferenceError,
		'%Reflect%': typeof Reflect === 'undefined' ? undefined$1 : Reflect,
		'%RegExp%': RegExp,
		'%Set%': typeof Set === 'undefined' ? undefined$1 : Set,
		'%SetIteratorPrototype%': typeof Set === 'undefined' || !hasSymbols || !getProto ? undefined$1 : getProto(new Set()[Symbol.iterator]()),
		'%SharedArrayBuffer%': typeof SharedArrayBuffer === 'undefined' ? undefined$1 : SharedArrayBuffer,
		'%String%': String,
		'%StringIteratorPrototype%': hasSymbols && getProto ? getProto(''[Symbol.iterator]()) : undefined$1,
		'%Symbol%': hasSymbols ? Symbol : undefined$1,
		'%SyntaxError%': $SyntaxError,
		'%ThrowTypeError%': ThrowTypeError,
		'%TypedArray%': TypedArray,
		'%TypeError%': $TypeError$3,
		'%Uint8Array%': typeof Uint8Array === 'undefined' ? undefined$1 : Uint8Array,
		'%Uint8ClampedArray%': typeof Uint8ClampedArray === 'undefined' ? undefined$1 : Uint8ClampedArray,
		'%Uint16Array%': typeof Uint16Array === 'undefined' ? undefined$1 : Uint16Array,
		'%Uint32Array%': typeof Uint32Array === 'undefined' ? undefined$1 : Uint32Array,
		'%URIError%': $URIError,
		'%WeakMap%': typeof WeakMap === 'undefined' ? undefined$1 : WeakMap,
		'%WeakRef%': typeof WeakRef === 'undefined' ? undefined$1 : WeakRef,
		'%WeakSet%': typeof WeakSet === 'undefined' ? undefined$1 : WeakSet,

		'%Function.prototype.call%': $call,
		'%Function.prototype.apply%': $apply,
		'%Object.defineProperty%': $defineProperty,
		'%Object.getPrototypeOf%': $ObjectGPO,
		'%Math.abs%': abs,
		'%Math.floor%': floor,
		'%Math.max%': max,
		'%Math.min%': min,
		'%Math.pow%': pow,
		'%Math.round%': round,
		'%Math.sign%': sign,
		'%Reflect.getPrototypeOf%': $ReflectGPO
	};

	if (getProto) {
		try {
			null.error; // eslint-disable-line no-unused-expressions
		} catch (e) {
			// https://github.com/tc39/proposal-shadowrealm/pull/384#issuecomment-1364264229
			var errorProto = getProto(getProto(e));
			INTRINSICS['%Error.prototype%'] = errorProto;
		}
	}

	var doEval = function doEval(name) {
		var value;
		if (name === '%AsyncFunction%') {
			value = getEvalledConstructor('async function () {}');
		} else if (name === '%GeneratorFunction%') {
			value = getEvalledConstructor('function* () {}');
		} else if (name === '%AsyncGeneratorFunction%') {
			value = getEvalledConstructor('async function* () {}');
		} else if (name === '%AsyncGenerator%') {
			var fn = doEval('%AsyncGeneratorFunction%');
			if (fn) {
				value = fn.prototype;
			}
		} else if (name === '%AsyncIteratorPrototype%') {
			var gen = doEval('%AsyncGenerator%');
			if (gen && getProto) {
				value = getProto(gen.prototype);
			}
		}

		INTRINSICS[name] = value;

		return value;
	};

	var LEGACY_ALIASES = {
		__proto__: null,
		'%ArrayBufferPrototype%': ['ArrayBuffer', 'prototype'],
		'%ArrayPrototype%': ['Array', 'prototype'],
		'%ArrayProto_entries%': ['Array', 'prototype', 'entries'],
		'%ArrayProto_forEach%': ['Array', 'prototype', 'forEach'],
		'%ArrayProto_keys%': ['Array', 'prototype', 'keys'],
		'%ArrayProto_values%': ['Array', 'prototype', 'values'],
		'%AsyncFunctionPrototype%': ['AsyncFunction', 'prototype'],
		'%AsyncGenerator%': ['AsyncGeneratorFunction', 'prototype'],
		'%AsyncGeneratorPrototype%': ['AsyncGeneratorFunction', 'prototype', 'prototype'],
		'%BooleanPrototype%': ['Boolean', 'prototype'],
		'%DataViewPrototype%': ['DataView', 'prototype'],
		'%DatePrototype%': ['Date', 'prototype'],
		'%ErrorPrototype%': ['Error', 'prototype'],
		'%EvalErrorPrototype%': ['EvalError', 'prototype'],
		'%Float32ArrayPrototype%': ['Float32Array', 'prototype'],
		'%Float64ArrayPrototype%': ['Float64Array', 'prototype'],
		'%FunctionPrototype%': ['Function', 'prototype'],
		'%Generator%': ['GeneratorFunction', 'prototype'],
		'%GeneratorPrototype%': ['GeneratorFunction', 'prototype', 'prototype'],
		'%Int8ArrayPrototype%': ['Int8Array', 'prototype'],
		'%Int16ArrayPrototype%': ['Int16Array', 'prototype'],
		'%Int32ArrayPrototype%': ['Int32Array', 'prototype'],
		'%JSONParse%': ['JSON', 'parse'],
		'%JSONStringify%': ['JSON', 'stringify'],
		'%MapPrototype%': ['Map', 'prototype'],
		'%NumberPrototype%': ['Number', 'prototype'],
		'%ObjectPrototype%': ['Object', 'prototype'],
		'%ObjProto_toString%': ['Object', 'prototype', 'toString'],
		'%ObjProto_valueOf%': ['Object', 'prototype', 'valueOf'],
		'%PromisePrototype%': ['Promise', 'prototype'],
		'%PromiseProto_then%': ['Promise', 'prototype', 'then'],
		'%Promise_all%': ['Promise', 'all'],
		'%Promise_reject%': ['Promise', 'reject'],
		'%Promise_resolve%': ['Promise', 'resolve'],
		'%RangeErrorPrototype%': ['RangeError', 'prototype'],
		'%ReferenceErrorPrototype%': ['ReferenceError', 'prototype'],
		'%RegExpPrototype%': ['RegExp', 'prototype'],
		'%SetPrototype%': ['Set', 'prototype'],
		'%SharedArrayBufferPrototype%': ['SharedArrayBuffer', 'prototype'],
		'%StringPrototype%': ['String', 'prototype'],
		'%SymbolPrototype%': ['Symbol', 'prototype'],
		'%SyntaxErrorPrototype%': ['SyntaxError', 'prototype'],
		'%TypedArrayPrototype%': ['TypedArray', 'prototype'],
		'%TypeErrorPrototype%': ['TypeError', 'prototype'],
		'%Uint8ArrayPrototype%': ['Uint8Array', 'prototype'],
		'%Uint8ClampedArrayPrototype%': ['Uint8ClampedArray', 'prototype'],
		'%Uint16ArrayPrototype%': ['Uint16Array', 'prototype'],
		'%Uint32ArrayPrototype%': ['Uint32Array', 'prototype'],
		'%URIErrorPrototype%': ['URIError', 'prototype'],
		'%WeakMapPrototype%': ['WeakMap', 'prototype'],
		'%WeakSetPrototype%': ['WeakSet', 'prototype']
	};

	var bind = functionBind;
	var hasOwn = hasown;
	var $concat = bind.call($call, Array.prototype.concat);
	var $spliceApply = bind.call($apply, Array.prototype.splice);
	var $replace = bind.call($call, String.prototype.replace);
	var $strSlice = bind.call($call, String.prototype.slice);
	var $exec = bind.call($call, RegExp.prototype.exec);

	/* adapted from https://github.com/lodash/lodash/blob/4.17.15/dist/lodash.js#L6735-L6744 */
	var rePropName = /[^%.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|%$))/g;
	var reEscapeChar = /\\(\\)?/g; /** Used to match backslashes in property paths. */
	var stringToPath = function stringToPath(string) {
		var first = $strSlice(string, 0, 1);
		var last = $strSlice(string, -1);
		if (first === '%' && last !== '%') {
			throw new $SyntaxError('invalid intrinsic syntax, expected closing `%`');
		} else if (last === '%' && first !== '%') {
			throw new $SyntaxError('invalid intrinsic syntax, expected opening `%`');
		}
		var result = [];
		$replace(string, rePropName, function (match, number, quote, subString) {
			result[result.length] = quote ? $replace(subString, reEscapeChar, '$1') : number || match;
		});
		return result;
	};
	/* end adaptation */

	var getBaseIntrinsic = function getBaseIntrinsic(name, allowMissing) {
		var intrinsicName = name;
		var alias;
		if (hasOwn(LEGACY_ALIASES, intrinsicName)) {
			alias = LEGACY_ALIASES[intrinsicName];
			intrinsicName = '%' + alias[0] + '%';
		}

		if (hasOwn(INTRINSICS, intrinsicName)) {
			var value = INTRINSICS[intrinsicName];
			if (value === needsEval) {
				value = doEval(intrinsicName);
			}
			if (typeof value === 'undefined' && !allowMissing) {
				throw new $TypeError$3('intrinsic ' + name + ' exists, but is not available. Please file an issue!');
			}

			return {
				alias: alias,
				name: intrinsicName,
				value: value
			};
		}

		throw new $SyntaxError('intrinsic ' + name + ' does not exist!');
	};

	var getIntrinsic = function GetIntrinsic(name, allowMissing) {
		if (typeof name !== 'string' || name.length === 0) {
			throw new $TypeError$3('intrinsic name must be a non-empty string');
		}
		if (arguments.length > 1 && typeof allowMissing !== 'boolean') {
			throw new $TypeError$3('"allowMissing" argument must be a boolean');
		}

		if ($exec(/^%?[^%]*%?$/, name) === null) {
			throw new $SyntaxError('`%` may not be present anywhere but at the beginning and end of the intrinsic name');
		}
		var parts = stringToPath(name);
		var intrinsicBaseName = parts.length > 0 ? parts[0] : '';

		var intrinsic = getBaseIntrinsic('%' + intrinsicBaseName + '%', allowMissing);
		var intrinsicRealName = intrinsic.name;
		var value = intrinsic.value;
		var skipFurtherCaching = false;

		var alias = intrinsic.alias;
		if (alias) {
			intrinsicBaseName = alias[0];
			$spliceApply(parts, $concat([0, 1], alias));
		}

		for (var i = 1, isOwn = true; i < parts.length; i += 1) {
			var part = parts[i];
			var first = $strSlice(part, 0, 1);
			var last = $strSlice(part, -1);
			if (
				(
					(first === '"' || first === "'" || first === '`')
					|| (last === '"' || last === "'" || last === '`')
				)
				&& first !== last
			) {
				throw new $SyntaxError('property names with quotes must have matching quotes');
			}
			if (part === 'constructor' || !isOwn) {
				skipFurtherCaching = true;
			}

			intrinsicBaseName += '.' + part;
			intrinsicRealName = '%' + intrinsicBaseName + '%';

			if (hasOwn(INTRINSICS, intrinsicRealName)) {
				value = INTRINSICS[intrinsicRealName];
			} else if (value != null) {
				if (!(part in value)) {
					if (!allowMissing) {
						throw new $TypeError$3('base intrinsic for ' + name + ' exists, but the property is not available.');
					}
					return void undefined$1;
				}
				if ($gOPD && (i + 1) >= parts.length) {
					var desc = $gOPD(value, part);
					isOwn = !!desc;

					// By convention, when a data property is converted to an accessor
					// property to emulate a data property that does not suffer from
					// the override mistake, that accessor's getter is marked with
					// an `originalValue` property. Here, when we detect this, we
					// uphold the illusion by pretending to see that original data
					// property, i.e., returning the value rather than the getter
					// itself.
					if (isOwn && 'get' in desc && !('originalValue' in desc.get)) {
						value = desc.get;
					} else {
						value = value[part];
					}
				} else {
					isOwn = hasOwn(value, part);
					value = value[part];
				}

				if (isOwn && !skipFurtherCaching) {
					INTRINSICS[intrinsicRealName] = value;
				}
			}
		}
		return value;
	};

	var GetIntrinsic$2 = getIntrinsic;

	var callBindBasic = callBindApplyHelpers;

	/** @type {(thisArg: string, searchString: string, position?: number) => number} */
	var $indexOf = callBindBasic([GetIntrinsic$2('%String.prototype.indexOf%')]);

	/** @type {import('.')} */
	var callBound$2 = function callBoundIntrinsic(name, allowMissing) {
		/* eslint no-extra-parens: 0 */

		var intrinsic = /** @type {(this: unknown, ...args: unknown[]) => unknown} */ (GetIntrinsic$2(name, !!allowMissing));
		if (typeof intrinsic === 'function' && $indexOf(name, '.prototype.') > -1) {
			return callBindBasic(/** @type {const} */ ([intrinsic]));
		}
		return intrinsic;
	};

	var GetIntrinsic$1 = getIntrinsic;
	var callBound$1 = callBound$2;
	var inspect$2 = objectInspect;

	var $TypeError$2 = type;
	var $Map = GetIntrinsic$1('%Map%', true);

	/** @type {<K, V>(thisArg: Map<K, V>, key: K) => V} */
	var $mapGet = callBound$1('Map.prototype.get', true);
	/** @type {<K, V>(thisArg: Map<K, V>, key: K, value: V) => void} */
	var $mapSet = callBound$1('Map.prototype.set', true);
	/** @type {<K, V>(thisArg: Map<K, V>, key: K) => boolean} */
	var $mapHas = callBound$1('Map.prototype.has', true);
	/** @type {<K, V>(thisArg: Map<K, V>, key: K) => boolean} */
	var $mapDelete = callBound$1('Map.prototype.delete', true);
	/** @type {<K, V>(thisArg: Map<K, V>) => number} */
	var $mapSize = callBound$1('Map.prototype.size', true);

	/** @type {import('.')} */
	var sideChannelMap = !!$Map && /** @type {Exclude<import('.'), false>} */ function getSideChannelMap() {
		/** @typedef {ReturnType<typeof getSideChannelMap>} Channel */
		/** @typedef {Parameters<Channel['get']>[0]} K */
		/** @typedef {Parameters<Channel['set']>[1]} V */

		/** @type {Map<K, V> | undefined} */ var $m;

		/** @type {Channel} */
		var channel = {
			assert: function (key) {
				if (!channel.has(key)) {
					throw new $TypeError$2('Side channel does not contain ' + inspect$2(key));
				}
			},
			'delete': function (key) {
				if ($m) {
					var result = $mapDelete($m, key);
					if ($mapSize($m) === 0) {
						$m = void undefined;
					}
					return result;
				}
				return false;
			},
			get: function (key) { // eslint-disable-line consistent-return
				if ($m) {
					return $mapGet($m, key);
				}
			},
			has: function (key) {
				if ($m) {
					return $mapHas($m, key);
				}
				return false;
			},
			set: function (key, value) {
				if (!$m) {
					// @ts-expect-error TS can't handle narrowing a variable inside a closure
					$m = new $Map();
				}
				$mapSet($m, key, value);
			}
		};

		// @ts-expect-error TODO: figure out why TS is erroring here
		return channel;
	};

	var GetIntrinsic = getIntrinsic;
	var callBound = callBound$2;
	var inspect$1 = objectInspect;
	var getSideChannelMap$1 = sideChannelMap;

	var $TypeError$1 = type;
	var $WeakMap = GetIntrinsic('%WeakMap%', true);

	/** @type {<K extends object, V>(thisArg: WeakMap<K, V>, key: K) => V} */
	var $weakMapGet = callBound('WeakMap.prototype.get', true);
	/** @type {<K extends object, V>(thisArg: WeakMap<K, V>, key: K, value: V) => void} */
	var $weakMapSet = callBound('WeakMap.prototype.set', true);
	/** @type {<K extends object, V>(thisArg: WeakMap<K, V>, key: K) => boolean} */
	var $weakMapHas = callBound('WeakMap.prototype.has', true);
	/** @type {<K extends object, V>(thisArg: WeakMap<K, V>, key: K) => boolean} */
	var $weakMapDelete = callBound('WeakMap.prototype.delete', true);

	/** @type {import('.')} */
	var sideChannelWeakmap = $WeakMap
		? /** @type {Exclude<import('.'), false>} */ function getSideChannelWeakMap() {
			/** @typedef {ReturnType<typeof getSideChannelWeakMap>} Channel */
			/** @typedef {Parameters<Channel['get']>[0]} K */
			/** @typedef {Parameters<Channel['set']>[1]} V */

			/** @type {WeakMap<K & object, V> | undefined} */ var $wm;
			/** @type {Channel | undefined} */ var $m;

			/** @type {Channel} */
			var channel = {
				assert: function (key) {
					if (!channel.has(key)) {
						throw new $TypeError$1('Side channel does not contain ' + inspect$1(key));
					}
				},
				'delete': function (key) {
					if ($WeakMap && key && (typeof key === 'object' || typeof key === 'function')) {
						if ($wm) {
							return $weakMapDelete($wm, key);
						}
					} else if (getSideChannelMap$1) {
						if ($m) {
							return $m['delete'](key);
						}
					}
					return false;
				},
				get: function (key) {
					if ($WeakMap && key && (typeof key === 'object' || typeof key === 'function')) {
						if ($wm) {
							return $weakMapGet($wm, key);
						}
					}
					return $m && $m.get(key);
				},
				has: function (key) {
					if ($WeakMap && key && (typeof key === 'object' || typeof key === 'function')) {
						if ($wm) {
							return $weakMapHas($wm, key);
						}
					}
					return !!$m && $m.has(key);
				},
				set: function (key, value) {
					if ($WeakMap && key && (typeof key === 'object' || typeof key === 'function')) {
						if (!$wm) {
							$wm = new $WeakMap();
						}
						$weakMapSet($wm, key, value);
					} else if (getSideChannelMap$1) {
						if (!$m) {
							$m = getSideChannelMap$1();
						}
						// eslint-disable-next-line no-extra-parens
						/** @type {NonNullable<typeof $m>} */ ($m).set(key, value);
					}
				}
			};

			// @ts-expect-error TODO: figure out why this is erroring
			return channel;
		}
		: getSideChannelMap$1;

	var $TypeError = type;
	var inspect = objectInspect;
	var getSideChannelList = sideChannelList;
	var getSideChannelMap = sideChannelMap;
	var getSideChannelWeakMap = sideChannelWeakmap;

	var makeChannel = getSideChannelWeakMap || getSideChannelMap || getSideChannelList;

	/** @type {import('.')} */
	var sideChannel = function getSideChannel() {
		/** @typedef {ReturnType<typeof getSideChannel>} Channel */

		/** @type {Channel | undefined} */ var $channelData;

		/** @type {Channel} */
		var channel = {
			assert: function (key) {
				if (!channel.has(key)) {
					var keyDesc = key && Object(key) === key
						? 'the given object key'
						: inspect(key);
					throw new $TypeError('Side channel does not contain ' + keyDesc);
				}
			},
			'delete': function (key) {
				return !!$channelData && $channelData['delete'](key);
			},
			get: function (key) {
				return $channelData && $channelData.get(key);
			},
			has: function (key) {
				return !!$channelData && $channelData.has(key);
			},
			set: function (key, value) {
				if (!$channelData) {
					$channelData = makeChannel();
				}

				$channelData.set(key, value);
			}
		};

		return channel;
	};

	var replace = String.prototype.replace;
	var percentTwenties = /%20/g;

	var Format = {
	    RFC1738: 'RFC1738',
	    RFC3986: 'RFC3986'
	};

	var formats$3 = {
	    'default': Format.RFC3986,
	    formatters: {
	        RFC1738: function (value) {
	            return replace.call(value, percentTwenties, '+');
	        },
	        RFC3986: function (value) {
	            return String(value);
	        }
	    },
	    RFC1738: Format.RFC1738,
	    RFC3986: Format.RFC3986
	};

	var formats$2 = formats$3;
	var getSideChannel$1 = sideChannel;

	var has$2 = Object.prototype.hasOwnProperty;
	var isArray$4 = Array.isArray;

	// Track objects created from arrayLimit overflow using side-channel
	// Stores the current max numeric index for O(1) lookup
	var overflowChannel = getSideChannel$1();

	var markOverflow = function markOverflow(obj, maxIndex) {
	    overflowChannel.set(obj, maxIndex);
	    return obj;
	};

	var isOverflow = function isOverflow(obj) {
	    return overflowChannel.has(obj);
	};

	var getMaxIndex = function getMaxIndex(obj) {
	    return overflowChannel.get(obj);
	};

	var setMaxIndex = function setMaxIndex(obj, maxIndex) {
	    overflowChannel.set(obj, maxIndex);
	};

	var hexTable = (function () {
	    var array = [];
	    for (var i = 0; i < 256; ++i) {
	        array[array.length] = '%' + ((i < 16 ? '0' : '') + i.toString(16)).toUpperCase();
	    }

	    return array;
	}());

	var compactQueue = function compactQueue(queue) {
	    while (queue.length > 1) {
	        var item = queue.pop();
	        var obj = item.obj[item.prop];

	        if (isArray$4(obj)) {
	            var compacted = [];

	            for (var j = 0; j < obj.length; ++j) {
	                if (typeof obj[j] !== 'undefined') {
	                    compacted[compacted.length] = obj[j];
	                }
	            }

	            item.obj[item.prop] = compacted;
	        }
	    }
	};

	var arrayToObject = function arrayToObject(source, options) {
	    var obj = options && options.plainObjects ? { __proto__: null } : {};
	    for (var i = 0; i < source.length; ++i) {
	        if (typeof source[i] !== 'undefined') {
	            obj[i] = source[i];
	        }
	    }

	    return obj;
	};

	var merge = function merge(target, source, options) {
	    /* eslint no-param-reassign: 0 */
	    if (!source) {
	        return target;
	    }

	    if (typeof source !== 'object' && typeof source !== 'function') {
	        if (isArray$4(target)) {
	            var nextIndex = target.length;
	            if (options && typeof options.arrayLimit === 'number' && nextIndex > options.arrayLimit) {
	                return markOverflow(arrayToObject(target.concat(source), options), nextIndex);
	            }
	            target[nextIndex] = source;
	        } else if (target && typeof target === 'object') {
	            if (isOverflow(target)) {
	                // Add at next numeric index for overflow objects
	                var newIndex = getMaxIndex(target) + 1;
	                target[newIndex] = source;
	                setMaxIndex(target, newIndex);
	            } else if (options && options.strictMerge) {
	                return [target, source];
	            } else if (
	                (options && (options.plainObjects || options.allowPrototypes))
	                || !has$2.call(Object.prototype, source)
	            ) {
	                target[source] = true;
	            }
	        } else {
	            return [target, source];
	        }

	        return target;
	    }

	    if (!target || typeof target !== 'object') {
	        if (isOverflow(source)) {
	            // Create new object with target at 0, source values shifted by 1
	            var sourceKeys = Object.keys(source);
	            var result = options && options.plainObjects
	                ? { __proto__: null, 0: target }
	                : { 0: target };
	            for (var m = 0; m < sourceKeys.length; m++) {
	                var oldKey = parseInt(sourceKeys[m], 10);
	                result[oldKey + 1] = source[sourceKeys[m]];
	            }
	            return markOverflow(result, getMaxIndex(source) + 1);
	        }
	        var combined = [target].concat(source);
	        if (options && typeof options.arrayLimit === 'number' && combined.length > options.arrayLimit) {
	            return markOverflow(arrayToObject(combined, options), combined.length - 1);
	        }
	        return combined;
	    }

	    var mergeTarget = target;
	    if (isArray$4(target) && !isArray$4(source)) {
	        mergeTarget = arrayToObject(target, options);
	    }

	    if (isArray$4(target) && isArray$4(source)) {
	        source.forEach(function (item, i) {
	            if (has$2.call(target, i)) {
	                var targetItem = target[i];
	                if (targetItem && typeof targetItem === 'object' && item && typeof item === 'object') {
	                    target[i] = merge(targetItem, item, options);
	                } else {
	                    target[target.length] = item;
	                }
	            } else {
	                target[i] = item;
	            }
	        });
	        return target;
	    }

	    return Object.keys(source).reduce(function (acc, key) {
	        var value = source[key];

	        if (has$2.call(acc, key)) {
	            acc[key] = merge(acc[key], value, options);
	        } else {
	            acc[key] = value;
	        }

	        if (isOverflow(source) && !isOverflow(acc)) {
	            markOverflow(acc, getMaxIndex(source));
	        }
	        if (isOverflow(acc)) {
	            var keyNum = parseInt(key, 10);
	            if (String(keyNum) === key && keyNum >= 0 && keyNum > getMaxIndex(acc)) {
	                setMaxIndex(acc, keyNum);
	            }
	        }

	        return acc;
	    }, mergeTarget);
	};

	var assign = function assignSingleSource(target, source) {
	    return Object.keys(source).reduce(function (acc, key) {
	        acc[key] = source[key];
	        return acc;
	    }, target);
	};

	var decode$2 = function (str, defaultDecoder, charset) {
	    var strWithoutPlus = str.replace(/\+/g, ' ');
	    if (charset === 'iso-8859-1') {
	        // unescape never throws, no try...catch needed:
	        return strWithoutPlus.replace(/%[0-9a-f]{2}/gi, unescape);
	    }
	    // utf-8
	    try {
	        return decodeURIComponent(strWithoutPlus);
	    } catch (e) {
	        return strWithoutPlus;
	    }
	};

	var limit = 1024;

	/* eslint operator-linebreak: [2, "before"] */

	var encode = function encode(str, defaultEncoder, charset, kind, format) {
	    // This code was originally written by Brian White (mscdex) for the io.js core querystring library.
	    // It has been adapted here for stricter adherence to RFC 3986
	    if (str.length === 0) {
	        return str;
	    }

	    var string = str;
	    if (typeof str === 'symbol') {
	        string = Symbol.prototype.toString.call(str);
	    } else if (typeof str !== 'string') {
	        string = String(str);
	    }

	    if (charset === 'iso-8859-1') {
	        return escape(string).replace(/%u[0-9a-f]{4}/gi, function ($0) {
	            return '%26%23' + parseInt($0.slice(2), 16) + '%3B';
	        });
	    }

	    var out = '';
	    for (var j = 0; j < string.length; j += limit) {
	        var segment = string.length >= limit ? string.slice(j, j + limit) : string;
	        var arr = [];

	        for (var i = 0; i < segment.length; ++i) {
	            var c = segment.charCodeAt(i);
	            if (
	                c === 0x2D // -
	                || c === 0x2E // .
	                || c === 0x5F // _
	                || c === 0x7E // ~
	                || (c >= 0x30 && c <= 0x39) // 0-9
	                || (c >= 0x41 && c <= 0x5A) // a-z
	                || (c >= 0x61 && c <= 0x7A) // A-Z
	                || (format === formats$2.RFC1738 && (c === 0x28 || c === 0x29)) // ( )
	            ) {
	                arr[arr.length] = segment.charAt(i);
	                continue;
	            }

	            if (c < 0x80) {
	                arr[arr.length] = hexTable[c];
	                continue;
	            }

	            if (c < 0x800) {
	                arr[arr.length] = hexTable[0xC0 | (c >> 6)]
	                    + hexTable[0x80 | (c & 0x3F)];
	                continue;
	            }

	            if (c < 0xD800 || c >= 0xE000) {
	                arr[arr.length] = hexTable[0xE0 | (c >> 12)]
	                    + hexTable[0x80 | ((c >> 6) & 0x3F)]
	                    + hexTable[0x80 | (c & 0x3F)];
	                continue;
	            }

	            i += 1;
	            c = 0x10000 + (((c & 0x3FF) << 10) | (segment.charCodeAt(i) & 0x3FF));

	            arr[arr.length] = hexTable[0xF0 | (c >> 18)]
	                + hexTable[0x80 | ((c >> 12) & 0x3F)]
	                + hexTable[0x80 | ((c >> 6) & 0x3F)]
	                + hexTable[0x80 | (c & 0x3F)];
	        }

	        out += arr.join('');
	    }

	    return out;
	};

	var compact = function compact(value) {
	    var queue = [{ obj: { o: value }, prop: 'o' }];
	    var refs = [];

	    for (var i = 0; i < queue.length; ++i) {
	        var item = queue[i];
	        var obj = item.obj[item.prop];

	        var keys = Object.keys(obj);
	        for (var j = 0; j < keys.length; ++j) {
	            var key = keys[j];
	            var val = obj[key];
	            if (typeof val === 'object' && val !== null && refs.indexOf(val) === -1) {
	                queue[queue.length] = { obj: obj, prop: key };
	                refs[refs.length] = val;
	            }
	        }
	    }

	    compactQueue(queue);

	    return value;
	};

	var isRegExp = function isRegExp(obj) {
	    return Object.prototype.toString.call(obj) === '[object RegExp]';
	};

	var isBuffer = function isBuffer(obj) {
	    if (!obj || typeof obj !== 'object') {
	        return false;
	    }

	    return !!(obj.constructor && obj.constructor.isBuffer && obj.constructor.isBuffer(obj));
	};

	var combine = function combine(a, b, arrayLimit, plainObjects) {
	    // If 'a' is already an overflow object, add to it
	    if (isOverflow(a)) {
	        var newIndex = getMaxIndex(a) + 1;
	        a[newIndex] = b;
	        setMaxIndex(a, newIndex);
	        return a;
	    }

	    var result = [].concat(a, b);
	    if (result.length > arrayLimit) {
	        return markOverflow(arrayToObject(result, { plainObjects: plainObjects }), result.length - 1);
	    }
	    return result;
	};

	var maybeMap = function maybeMap(val, fn) {
	    if (isArray$4(val)) {
	        var mapped = [];
	        for (var i = 0; i < val.length; i += 1) {
	            mapped[mapped.length] = fn(val[i]);
	        }
	        return mapped;
	    }
	    return fn(val);
	};

	var utils$2 = {
	    arrayToObject: arrayToObject,
	    assign: assign,
	    combine: combine,
	    compact: compact,
	    decode: decode$2,
	    encode: encode,
	    isBuffer: isBuffer,
	    isOverflow: isOverflow,
	    isRegExp: isRegExp,
	    markOverflow: markOverflow,
	    maybeMap: maybeMap,
	    merge: merge
	};

	var getSideChannel = sideChannel;
	var utils$1 = utils$2;
	var formats$1 = formats$3;
	var has$1 = Object.prototype.hasOwnProperty;

	var arrayPrefixGenerators = {
	    brackets: function brackets(prefix) {
	        return prefix + '[]';
	    },
	    comma: 'comma',
	    indices: function indices(prefix, key) {
	        return prefix + '[' + key + ']';
	    },
	    repeat: function repeat(prefix) {
	        return prefix;
	    }
	};

	var isArray$3 = Array.isArray;
	var push = Array.prototype.push;
	var pushToArray = function (arr, valueOrArray) {
	    push.apply(arr, isArray$3(valueOrArray) ? valueOrArray : [valueOrArray]);
	};

	var toISO = Date.prototype.toISOString;

	var defaultFormat = formats$1['default'];
	var defaults$1 = {
	    addQueryPrefix: false,
	    allowDots: false,
	    allowEmptyArrays: false,
	    arrayFormat: 'indices',
	    charset: 'utf-8',
	    charsetSentinel: false,
	    commaRoundTrip: false,
	    delimiter: '&',
	    encode: true,
	    encodeDotInKeys: false,
	    encoder: utils$1.encode,
	    encodeValuesOnly: false,
	    filter: void undefined,
	    format: defaultFormat,
	    formatter: formats$1.formatters[defaultFormat],
	    // deprecated
	    indices: false,
	    serializeDate: function serializeDate(date) {
	        return toISO.call(date);
	    },
	    skipNulls: false,
	    strictNullHandling: false
	};

	var isNonNullishPrimitive = function isNonNullishPrimitive(v) {
	    return typeof v === 'string'
	        || typeof v === 'number'
	        || typeof v === 'boolean'
	        || typeof v === 'symbol'
	        || typeof v === 'bigint';
	};

	var sentinel = {};

	var stringify$1 = function stringify(
	    object,
	    prefix,
	    generateArrayPrefix,
	    commaRoundTrip,
	    allowEmptyArrays,
	    strictNullHandling,
	    skipNulls,
	    encodeDotInKeys,
	    encoder,
	    filter,
	    sort,
	    allowDots,
	    serializeDate,
	    format,
	    formatter,
	    encodeValuesOnly,
	    charset,
	    sideChannel
	) {
	    var obj = object;

	    var tmpSc = sideChannel;
	    var step = 0;
	    var findFlag = false;
	    while ((tmpSc = tmpSc.get(sentinel)) !== void undefined && !findFlag) {
	        // Where object last appeared in the ref tree
	        var pos = tmpSc.get(object);
	        step += 1;
	        if (typeof pos !== 'undefined') {
	            if (pos === step) {
	                throw new RangeError('Cyclic object value');
	            } else {
	                findFlag = true; // Break while
	            }
	        }
	        if (typeof tmpSc.get(sentinel) === 'undefined') {
	            step = 0;
	        }
	    }

	    if (typeof filter === 'function') {
	        obj = filter(prefix, obj);
	    } else if (obj instanceof Date) {
	        obj = serializeDate(obj);
	    } else if (generateArrayPrefix === 'comma' && isArray$3(obj)) {
	        obj = utils$1.maybeMap(obj, function (value) {
	            if (value instanceof Date) {
	                return serializeDate(value);
	            }
	            return value;
	        });
	    }

	    if (obj === null) {
	        if (strictNullHandling) {
	            return formatter(encoder && !encodeValuesOnly ? encoder(prefix, defaults$1.encoder, charset, 'key', format) : prefix);
	        }

	        obj = '';
	    }

	    if (isNonNullishPrimitive(obj) || utils$1.isBuffer(obj)) {
	        if (encoder) {
	            var keyValue = encodeValuesOnly ? prefix : encoder(prefix, defaults$1.encoder, charset, 'key', format);
	            return [formatter(keyValue) + '=' + formatter(encoder(obj, defaults$1.encoder, charset, 'value', format))];
	        }
	        return [formatter(prefix) + '=' + formatter(String(obj))];
	    }

	    var values = [];

	    if (typeof obj === 'undefined') {
	        return values;
	    }

	    var objKeys;
	    if (generateArrayPrefix === 'comma' && isArray$3(obj)) {
	        // we need to join elements in
	        if (encodeValuesOnly && encoder) {
	            obj = utils$1.maybeMap(obj, function (v) {
	                return v == null ? v : encoder(v);
	            });
	        }
	        objKeys = [{ value: obj.length > 0 ? obj.join(',') || null : void undefined }];
	    } else if (isArray$3(filter)) {
	        objKeys = filter;
	    } else {
	        var keys = Object.keys(obj);
	        objKeys = sort ? keys.sort(sort) : keys;
	    }

	    var encodedPrefix = encodeDotInKeys ? String(prefix).replace(/\./g, '%2E') : String(prefix);

	    var adjustedPrefix = commaRoundTrip && isArray$3(obj) && obj.length === 1 ? encodedPrefix + '[]' : encodedPrefix;

	    if (allowEmptyArrays && isArray$3(obj) && obj.length === 0) {
	        return adjustedPrefix + '[]';
	    }

	    for (var j = 0; j < objKeys.length; ++j) {
	        var key = objKeys[j];
	        var value = typeof key === 'object' && key && typeof key.value !== 'undefined'
	            ? key.value
	            : obj[key];

	        if (skipNulls && value === null) {
	            continue;
	        }

	        var encodedKey = allowDots && encodeDotInKeys ? String(key).replace(/\./g, '%2E') : String(key);
	        var keyPrefix = isArray$3(obj)
	            ? typeof generateArrayPrefix === 'function' ? generateArrayPrefix(adjustedPrefix, encodedKey) : adjustedPrefix
	            : adjustedPrefix + (allowDots ? '.' + encodedKey : '[' + encodedKey + ']');

	        sideChannel.set(object, step);
	        var valueSideChannel = getSideChannel();
	        valueSideChannel.set(sentinel, sideChannel);
	        pushToArray(values, stringify(
	            value,
	            keyPrefix,
	            generateArrayPrefix,
	            commaRoundTrip,
	            allowEmptyArrays,
	            strictNullHandling,
	            skipNulls,
	            encodeDotInKeys,
	            generateArrayPrefix === 'comma' && encodeValuesOnly && isArray$3(obj) ? null : encoder,
	            filter,
	            sort,
	            allowDots,
	            serializeDate,
	            format,
	            formatter,
	            encodeValuesOnly,
	            charset,
	            valueSideChannel
	        ));
	    }

	    return values;
	};

	var normalizeStringifyOptions = function normalizeStringifyOptions(opts) {
	    if (!opts) {
	        return defaults$1;
	    }

	    if (typeof opts.allowEmptyArrays !== 'undefined' && typeof opts.allowEmptyArrays !== 'boolean') {
	        throw new TypeError('`allowEmptyArrays` option can only be `true` or `false`, when provided');
	    }

	    if (typeof opts.encodeDotInKeys !== 'undefined' && typeof opts.encodeDotInKeys !== 'boolean') {
	        throw new TypeError('`encodeDotInKeys` option can only be `true` or `false`, when provided');
	    }

	    if (opts.encoder !== null && typeof opts.encoder !== 'undefined' && typeof opts.encoder !== 'function') {
	        throw new TypeError('Encoder has to be a function.');
	    }

	    var charset = opts.charset || defaults$1.charset;
	    if (typeof opts.charset !== 'undefined' && opts.charset !== 'utf-8' && opts.charset !== 'iso-8859-1') {
	        throw new TypeError('The charset option must be either utf-8, iso-8859-1, or undefined');
	    }

	    var format = formats$1['default'];
	    if (typeof opts.format !== 'undefined') {
	        if (!has$1.call(formats$1.formatters, opts.format)) {
	            throw new TypeError('Unknown format option provided.');
	        }
	        format = opts.format;
	    }
	    var formatter = formats$1.formatters[format];

	    var filter = defaults$1.filter;
	    if (typeof opts.filter === 'function' || isArray$3(opts.filter)) {
	        filter = opts.filter;
	    }

	    var arrayFormat;
	    if (opts.arrayFormat in arrayPrefixGenerators) {
	        arrayFormat = opts.arrayFormat;
	    } else if ('indices' in opts) {
	        arrayFormat = opts.indices ? 'indices' : 'repeat';
	    } else {
	        arrayFormat = defaults$1.arrayFormat;
	    }

	    if ('commaRoundTrip' in opts && typeof opts.commaRoundTrip !== 'boolean') {
	        throw new TypeError('`commaRoundTrip` must be a boolean, or absent');
	    }

	    var allowDots = typeof opts.allowDots === 'undefined' ? opts.encodeDotInKeys === true ? true : defaults$1.allowDots : !!opts.allowDots;

	    return {
	        addQueryPrefix: typeof opts.addQueryPrefix === 'boolean' ? opts.addQueryPrefix : defaults$1.addQueryPrefix,
	        allowDots: allowDots,
	        allowEmptyArrays: typeof opts.allowEmptyArrays === 'boolean' ? !!opts.allowEmptyArrays : defaults$1.allowEmptyArrays,
	        arrayFormat: arrayFormat,
	        charset: charset,
	        charsetSentinel: typeof opts.charsetSentinel === 'boolean' ? opts.charsetSentinel : defaults$1.charsetSentinel,
	        commaRoundTrip: !!opts.commaRoundTrip,
	        delimiter: typeof opts.delimiter === 'undefined' ? defaults$1.delimiter : opts.delimiter,
	        encode: typeof opts.encode === 'boolean' ? opts.encode : defaults$1.encode,
	        encodeDotInKeys: typeof opts.encodeDotInKeys === 'boolean' ? opts.encodeDotInKeys : defaults$1.encodeDotInKeys,
	        encoder: typeof opts.encoder === 'function' ? opts.encoder : defaults$1.encoder,
	        encodeValuesOnly: typeof opts.encodeValuesOnly === 'boolean' ? opts.encodeValuesOnly : defaults$1.encodeValuesOnly,
	        filter: filter,
	        format: format,
	        formatter: formatter,
	        serializeDate: typeof opts.serializeDate === 'function' ? opts.serializeDate : defaults$1.serializeDate,
	        skipNulls: typeof opts.skipNulls === 'boolean' ? opts.skipNulls : defaults$1.skipNulls,
	        sort: typeof opts.sort === 'function' ? opts.sort : null,
	        strictNullHandling: typeof opts.strictNullHandling === 'boolean' ? opts.strictNullHandling : defaults$1.strictNullHandling
	    };
	};

	var stringify_1 = function (object, opts) {
	    var obj = object;
	    var options = normalizeStringifyOptions(opts);

	    var objKeys;
	    var filter;

	    if (typeof options.filter === 'function') {
	        filter = options.filter;
	        obj = filter('', obj);
	    } else if (isArray$3(options.filter)) {
	        filter = options.filter;
	        objKeys = filter;
	    }

	    var keys = [];

	    if (typeof obj !== 'object' || obj === null) {
	        return '';
	    }

	    var generateArrayPrefix = arrayPrefixGenerators[options.arrayFormat];
	    var commaRoundTrip = generateArrayPrefix === 'comma' && options.commaRoundTrip;

	    if (!objKeys) {
	        objKeys = Object.keys(obj);
	    }

	    if (options.sort) {
	        objKeys.sort(options.sort);
	    }

	    var sideChannel = getSideChannel();
	    for (var i = 0; i < objKeys.length; ++i) {
	        var key = objKeys[i];

	        if (typeof key === 'undefined' || key === null) {
	            continue;
	        }

	        var value = obj[key];

	        if (options.skipNulls && value === null) {
	            continue;
	        }
	        pushToArray(keys, stringify$1(
	            value,
	            key,
	            generateArrayPrefix,
	            commaRoundTrip,
	            options.allowEmptyArrays,
	            options.strictNullHandling,
	            options.skipNulls,
	            options.encodeDotInKeys,
	            options.encode ? options.encoder : null,
	            options.filter,
	            options.sort,
	            options.allowDots,
	            options.serializeDate,
	            options.format,
	            options.formatter,
	            options.encodeValuesOnly,
	            options.charset,
	            sideChannel
	        ));
	    }

	    var joined = keys.join(options.delimiter);
	    var prefix = options.addQueryPrefix === true ? '?' : '';

	    if (options.charsetSentinel) {
	        if (options.charset === 'iso-8859-1') {
	            // encodeURIComponent('&#10003;'), the "numeric entity" representation of a checkmark
	            prefix += 'utf8=%26%2310003%3B' + options.delimiter;
	        } else {
	            // encodeURIComponent('✓')
	            prefix += 'utf8=%E2%9C%93' + options.delimiter;
	        }
	    }

	    return joined.length > 0 ? prefix + joined : '';
	};

	var utils = utils$2;

	var has = Object.prototype.hasOwnProperty;
	var isArray$2 = Array.isArray;

	var defaults = {
	    allowDots: false,
	    allowEmptyArrays: false,
	    allowPrototypes: false,
	    allowSparse: false,
	    arrayLimit: 20,
	    charset: 'utf-8',
	    charsetSentinel: false,
	    comma: false,
	    decodeDotInKeys: false,
	    decoder: utils.decode,
	    delimiter: '&',
	    depth: 5,
	    duplicates: 'combine',
	    ignoreQueryPrefix: false,
	    interpretNumericEntities: false,
	    parameterLimit: 1000,
	    parseArrays: true,
	    plainObjects: false,
	    strictDepth: false,
	    strictMerge: true,
	    strictNullHandling: false,
	    throwOnLimitExceeded: false
	};

	var interpretNumericEntities = function (str) {
	    return str.replace(/&#(\d+);/g, function ($0, numberStr) {
	        return String.fromCharCode(parseInt(numberStr, 10));
	    });
	};

	var parseArrayValue = function (val, options, currentArrayLength) {
	    if (val && typeof val === 'string' && options.comma && val.indexOf(',') > -1) {
	        return val.split(',');
	    }

	    if (options.throwOnLimitExceeded && currentArrayLength >= options.arrayLimit) {
	        throw new RangeError('Array limit exceeded. Only ' + options.arrayLimit + ' element' + (options.arrayLimit === 1 ? '' : 's') + ' allowed in an array.');
	    }

	    return val;
	};

	// This is what browsers will submit when the ✓ character occurs in an
	// application/x-www-form-urlencoded body and the encoding of the page containing
	// the form is iso-8859-1, or when the submitted form has an accept-charset
	// attribute of iso-8859-1. Presumably also with other charsets that do not contain
	// the ✓ character, such as us-ascii.
	var isoSentinel = 'utf8=%26%2310003%3B'; // encodeURIComponent('&#10003;')

	// These are the percent-encoded utf-8 octets representing a checkmark, indicating that the request actually is utf-8 encoded.
	var charsetSentinel = 'utf8=%E2%9C%93'; // encodeURIComponent('✓')

	var parseValues = function parseQueryStringValues(str, options) {
	    var obj = { __proto__: null };

	    var cleanStr = options.ignoreQueryPrefix ? str.replace(/^\?/, '') : str;
	    cleanStr = cleanStr.replace(/%5B/gi, '[').replace(/%5D/gi, ']');

	    var limit = options.parameterLimit === Infinity ? void undefined : options.parameterLimit;
	    var parts = cleanStr.split(
	        options.delimiter,
	        options.throwOnLimitExceeded && typeof limit !== 'undefined' ? limit + 1 : limit
	    );

	    if (options.throwOnLimitExceeded && typeof limit !== 'undefined' && parts.length > limit) {
	        throw new RangeError('Parameter limit exceeded. Only ' + limit + ' parameter' + (limit === 1 ? '' : 's') + ' allowed.');
	    }

	    var skipIndex = -1; // Keep track of where the utf8 sentinel was found
	    var i;

	    var charset = options.charset;
	    if (options.charsetSentinel) {
	        for (i = 0; i < parts.length; ++i) {
	            if (parts[i].indexOf('utf8=') === 0) {
	                if (parts[i] === charsetSentinel) {
	                    charset = 'utf-8';
	                } else if (parts[i] === isoSentinel) {
	                    charset = 'iso-8859-1';
	                }
	                skipIndex = i;
	                i = parts.length; // The eslint settings do not allow break;
	            }
	        }
	    }

	    for (i = 0; i < parts.length; ++i) {
	        if (i === skipIndex) {
	            continue;
	        }
	        var part = parts[i];

	        var bracketEqualsPos = part.indexOf(']=');
	        var pos = bracketEqualsPos === -1 ? part.indexOf('=') : bracketEqualsPos + 1;

	        var key;
	        var val;
	        if (pos === -1) {
	            key = options.decoder(part, defaults.decoder, charset, 'key');
	            val = options.strictNullHandling ? null : '';
	        } else {
	            key = options.decoder(part.slice(0, pos), defaults.decoder, charset, 'key');

	            if (key !== null) {
	                val = utils.maybeMap(
	                    parseArrayValue(
	                        part.slice(pos + 1),
	                        options,
	                        isArray$2(obj[key]) ? obj[key].length : 0
	                    ),
	                    function (encodedVal) {
	                        return options.decoder(encodedVal, defaults.decoder, charset, 'value');
	                    }
	                );
	            }
	        }

	        if (val && options.interpretNumericEntities && charset === 'iso-8859-1') {
	            val = interpretNumericEntities(String(val));
	        }

	        if (part.indexOf('[]=') > -1) {
	            val = isArray$2(val) ? [val] : val;
	        }

	        if (options.comma && isArray$2(val) && val.length > options.arrayLimit) {
	            if (options.throwOnLimitExceeded) {
	                throw new RangeError('Array limit exceeded. Only ' + options.arrayLimit + ' element' + (options.arrayLimit === 1 ? '' : 's') + ' allowed in an array.');
	            }
	            val = utils.combine([], val, options.arrayLimit, options.plainObjects);
	        }

	        if (key !== null) {
	            var existing = has.call(obj, key);
	            if (existing && (options.duplicates === 'combine' || part.indexOf('[]=') > -1)) {
	                obj[key] = utils.combine(
	                    obj[key],
	                    val,
	                    options.arrayLimit,
	                    options.plainObjects
	                );
	            } else if (!existing || options.duplicates === 'last') {
	                obj[key] = val;
	            }
	        }
	    }

	    return obj;
	};

	var parseObject = function (chain, val, options, valuesParsed) {
	    var currentArrayLength = 0;
	    if (chain.length > 0 && chain[chain.length - 1] === '[]') {
	        var parentKey = chain.slice(0, -1).join('');
	        currentArrayLength = Array.isArray(val) && val[parentKey] ? val[parentKey].length : 0;
	    }

	    var leaf = valuesParsed ? val : parseArrayValue(val, options, currentArrayLength);

	    for (var i = chain.length - 1; i >= 0; --i) {
	        var obj;
	        var root = chain[i];

	        if (root === '[]' && options.parseArrays) {
	            if (utils.isOverflow(leaf)) {
	                // leaf is already an overflow object, preserve it
	                obj = leaf;
	            } else {
	                obj = options.allowEmptyArrays && (leaf === '' || (options.strictNullHandling && leaf === null))
	                    ? []
	                    : utils.combine(
	                        [],
	                        leaf,
	                        options.arrayLimit,
	                        options.plainObjects
	                    );
	            }
	        } else {
	            obj = options.plainObjects ? { __proto__: null } : {};
	            var cleanRoot = root.charAt(0) === '[' && root.charAt(root.length - 1) === ']' ? root.slice(1, -1) : root;
	            var decodedRoot = options.decodeDotInKeys ? cleanRoot.replace(/%2E/g, '.') : cleanRoot;
	            var index = parseInt(decodedRoot, 10);
	            var isValidArrayIndex = !isNaN(index)
	                && root !== decodedRoot
	                && String(index) === decodedRoot
	                && index >= 0
	                && options.parseArrays;
	            if (!options.parseArrays && decodedRoot === '') {
	                obj = { 0: leaf };
	            } else if (isValidArrayIndex && index < options.arrayLimit) {
	                obj = [];
	                obj[index] = leaf;
	            } else if (isValidArrayIndex && options.throwOnLimitExceeded) {
	                throw new RangeError('Array limit exceeded. Only ' + options.arrayLimit + ' element' + (options.arrayLimit === 1 ? '' : 's') + ' allowed in an array.');
	            } else if (isValidArrayIndex) {
	                obj[index] = leaf;
	                utils.markOverflow(obj, index);
	            } else if (decodedRoot !== '__proto__') {
	                obj[decodedRoot] = leaf;
	            }
	        }

	        leaf = obj;
	    }

	    return leaf;
	};

	// Split a key like "a[b][c[]]" into ['a', '[b]', '[c[]]'] while preserving
	// qs parse semantics for depth/prototype guards.
	var splitKeyIntoSegments = function splitKeyIntoSegments(originalKey, options) {
	    var key = options.allowDots ? originalKey.replace(/\.([^.[]+)/g, '[$1]') : originalKey;

	    // depth <= 0 keeps the whole key as one segment
	    if (options.depth <= 0) {
	        if (!options.plainObjects && has.call(Object.prototype, key)) {
	            if (!options.allowPrototypes) {
	                return;
	            }
	        }

	        return [key];
	    }

	    var segments = [];

	    // parent before the first '[' (may be empty if key starts with '[')
	    var first = key.indexOf('[');
	    var parent = first >= 0 ? key.slice(0, first) : key;
	    if (parent) {
	        if (!options.plainObjects && has.call(Object.prototype, parent)) {
	            if (!options.allowPrototypes) {
	                return;
	            }
	        }

	        segments[segments.length] = parent;
	    }

	    var n = key.length;
	    var open = first;
	    var collected = 0;

	    while (open >= 0 && collected < options.depth) {
	        var level = 1;
	        var i = open + 1;
	        var close = -1;

	        // balance nested '[' and ']' inside this bracket group using a nesting level counter
	        while (i < n && close < 0) {
	            var cu = key.charCodeAt(i);
	            if (cu === 0x5B) { // '['
	                level += 1;
	            } else if (cu === 0x5D) { // ']'
	                level -= 1;
	                if (level === 0) {
	                    close = i; // found matching close; loop will exit by condition
	                }
	            }
	            i += 1;
	        }

	        if (close < 0) {
	            // Unterminated group: wrap the raw remainder in one bracket pair so it stays
	            // a single literal segment (e.g. "[[]b" -> "[[]b]"); we do not infer missing ']'.
	            segments[segments.length] = '[' + key.slice(open) + ']';
	            return segments;
	        }

	        var seg = key.slice(open, close + 1);
	        // prototype guard for the content of this group
	        var content = seg.slice(1, -1);
	        if (!options.plainObjects && has.call(Object.prototype, content) && !options.allowPrototypes) {
	            return;
	        }

	        segments[segments.length] = seg;
	        collected += 1;

	        // find the next '[' after this balanced group
	        open = key.indexOf('[', close + 1);
	    }

	    if (open >= 0) {
	        if (options.strictDepth === true) {
	            throw new RangeError('Input depth exceeded depth option of ' + options.depth + ' and strictDepth is true');
	        }

	        segments[segments.length] = '[' + key.slice(open) + ']';
	    }

	    return segments;
	};

	var parseKeys = function parseQueryStringKeys(givenKey, val, options, valuesParsed) {
	    if (!givenKey) {
	        return;
	    }

	    var keys = splitKeyIntoSegments(givenKey, options);

	    if (!keys) {
	        return;
	    }

	    return parseObject(keys, val, options, valuesParsed);
	};

	var normalizeParseOptions = function normalizeParseOptions(opts) {
	    if (!opts) {
	        return defaults;
	    }

	    if (typeof opts.allowEmptyArrays !== 'undefined' && typeof opts.allowEmptyArrays !== 'boolean') {
	        throw new TypeError('`allowEmptyArrays` option can only be `true` or `false`, when provided');
	    }

	    if (typeof opts.decodeDotInKeys !== 'undefined' && typeof opts.decodeDotInKeys !== 'boolean') {
	        throw new TypeError('`decodeDotInKeys` option can only be `true` or `false`, when provided');
	    }

	    if (opts.decoder !== null && typeof opts.decoder !== 'undefined' && typeof opts.decoder !== 'function') {
	        throw new TypeError('Decoder has to be a function.');
	    }

	    if (typeof opts.charset !== 'undefined' && opts.charset !== 'utf-8' && opts.charset !== 'iso-8859-1') {
	        throw new TypeError('The charset option must be either utf-8, iso-8859-1, or undefined');
	    }

	    if (typeof opts.throwOnLimitExceeded !== 'undefined' && typeof opts.throwOnLimitExceeded !== 'boolean') {
	        throw new TypeError('`throwOnLimitExceeded` option must be a boolean');
	    }

	    var charset = typeof opts.charset === 'undefined' ? defaults.charset : opts.charset;

	    var duplicates = typeof opts.duplicates === 'undefined' ? defaults.duplicates : opts.duplicates;

	    if (duplicates !== 'combine' && duplicates !== 'first' && duplicates !== 'last') {
	        throw new TypeError('The duplicates option must be either combine, first, or last');
	    }

	    var allowDots = typeof opts.allowDots === 'undefined' ? opts.decodeDotInKeys === true ? true : defaults.allowDots : !!opts.allowDots;

	    return {
	        allowDots: allowDots,
	        allowEmptyArrays: typeof opts.allowEmptyArrays === 'boolean' ? !!opts.allowEmptyArrays : defaults.allowEmptyArrays,
	        allowPrototypes: typeof opts.allowPrototypes === 'boolean' ? opts.allowPrototypes : defaults.allowPrototypes,
	        allowSparse: typeof opts.allowSparse === 'boolean' ? opts.allowSparse : defaults.allowSparse,
	        arrayLimit: typeof opts.arrayLimit === 'number' ? opts.arrayLimit : defaults.arrayLimit,
	        charset: charset,
	        charsetSentinel: typeof opts.charsetSentinel === 'boolean' ? opts.charsetSentinel : defaults.charsetSentinel,
	        comma: typeof opts.comma === 'boolean' ? opts.comma : defaults.comma,
	        decodeDotInKeys: typeof opts.decodeDotInKeys === 'boolean' ? opts.decodeDotInKeys : defaults.decodeDotInKeys,
	        decoder: typeof opts.decoder === 'function' ? opts.decoder : defaults.decoder,
	        delimiter: typeof opts.delimiter === 'string' || utils.isRegExp(opts.delimiter) ? opts.delimiter : defaults.delimiter,
	        // eslint-disable-next-line no-implicit-coercion, no-extra-parens
	        depth: (typeof opts.depth === 'number' || opts.depth === false) ? +opts.depth : defaults.depth,
	        duplicates: duplicates,
	        ignoreQueryPrefix: opts.ignoreQueryPrefix === true,
	        interpretNumericEntities: typeof opts.interpretNumericEntities === 'boolean' ? opts.interpretNumericEntities : defaults.interpretNumericEntities,
	        parameterLimit: typeof opts.parameterLimit === 'number' ? opts.parameterLimit : defaults.parameterLimit,
	        parseArrays: opts.parseArrays !== false,
	        plainObjects: typeof opts.plainObjects === 'boolean' ? opts.plainObjects : defaults.plainObjects,
	        strictDepth: typeof opts.strictDepth === 'boolean' ? !!opts.strictDepth : defaults.strictDepth,
	        strictMerge: typeof opts.strictMerge === 'boolean' ? !!opts.strictMerge : defaults.strictMerge,
	        strictNullHandling: typeof opts.strictNullHandling === 'boolean' ? opts.strictNullHandling : defaults.strictNullHandling,
	        throwOnLimitExceeded: typeof opts.throwOnLimitExceeded === 'boolean' ? opts.throwOnLimitExceeded : false
	    };
	};

	var parse$1 = function (str, opts) {
	    var options = normalizeParseOptions(opts);

	    if (str === '' || str === null || typeof str === 'undefined') {
	        return options.plainObjects ? { __proto__: null } : {};
	    }

	    var tempObj = typeof str === 'string' ? parseValues(str, options) : str;
	    var obj = options.plainObjects ? { __proto__: null } : {};

	    // Iterate over the keys and setup the new object

	    var keys = Object.keys(tempObj);
	    for (var i = 0; i < keys.length; ++i) {
	        var key = keys[i];
	        var newObj = parseKeys(key, tempObj[key], options, typeof str === 'string');
	        obj = utils.merge(obj, newObj, options);
	    }

	    if (options.allowSparse === true) {
	        return obj;
	    }

	    return utils.compact(obj);
	};

	var stringify = stringify_1;
	var parse = parse$1;
	var formats = formats$3;

	var lib = {
	    formats: formats,
	    parse: parse,
	    stringify: stringify
	};

	var qs = lib;

	/* eslint-disable no-prototype-builtins */
	var g =
	  (typeof globalThis !== 'undefined' && globalThis) ||
	  (typeof self !== 'undefined' && self) ||
	  // eslint-disable-next-line no-undef
	  (typeof global !== 'undefined' && global) ||
	  {};

	var support = {
	  searchParams: 'URLSearchParams' in g,
	  iterable: 'Symbol' in g && 'iterator' in Symbol,
	  blob:
	    'FileReader' in g &&
	    'Blob' in g &&
	    (function() {
	      try {
	        new Blob();
	        return true
	      } catch (e) {
	        return false
	      }
	    })(),
	  formData: 'FormData' in g,
	  arrayBuffer: 'ArrayBuffer' in g
	};

	function isDataView(obj) {
	  return obj && DataView.prototype.isPrototypeOf(obj)
	}

	if (support.arrayBuffer) {
	  var viewClasses = [
	    '[object Int8Array]',
	    '[object Uint8Array]',
	    '[object Uint8ClampedArray]',
	    '[object Int16Array]',
	    '[object Uint16Array]',
	    '[object Int32Array]',
	    '[object Uint32Array]',
	    '[object Float32Array]',
	    '[object Float64Array]'
	  ];

	  var isArrayBufferView =
	    ArrayBuffer.isView ||
	    function(obj) {
	      return obj && viewClasses.indexOf(Object.prototype.toString.call(obj)) > -1
	    };
	}

	function normalizeName(name) {
	  if (typeof name !== 'string') {
	    name = String(name);
	  }
	  if (/[^a-z0-9\-#$%&'*+.^_`|~!]/i.test(name) || name === '') {
	    throw new TypeError('Invalid character in header field name: "' + name + '"')
	  }
	  return name.toLowerCase()
	}

	function normalizeValue(value) {
	  if (typeof value !== 'string') {
	    value = String(value);
	  }
	  return value
	}

	// Build a destructive iterator for the value list
	function iteratorFor(items) {
	  var iterator = {
	    next: function() {
	      var value = items.shift();
	      return {done: value === undefined, value: value}
	    }
	  };

	  if (support.iterable) {
	    iterator[Symbol.iterator] = function() {
	      return iterator
	    };
	  }

	  return iterator
	}

	function Headers(headers) {
	  this.map = {};

	  if (headers instanceof Headers) {
	    headers.forEach(function(value, name) {
	      this.append(name, value);
	    }, this);
	  } else if (Array.isArray(headers)) {
	    headers.forEach(function(header) {
	      if (header.length != 2) {
	        throw new TypeError('Headers constructor: expected name/value pair to be length 2, found' + header.length)
	      }
	      this.append(header[0], header[1]);
	    }, this);
	  } else if (headers) {
	    Object.getOwnPropertyNames(headers).forEach(function(name) {
	      this.append(name, headers[name]);
	    }, this);
	  }
	}

	Headers.prototype.append = function(name, value) {
	  name = normalizeName(name);
	  value = normalizeValue(value);
	  var oldValue = this.map[name];
	  this.map[name] = oldValue ? oldValue + ', ' + value : value;
	};

	Headers.prototype['delete'] = function(name) {
	  delete this.map[normalizeName(name)];
	};

	Headers.prototype.get = function(name) {
	  name = normalizeName(name);
	  return this.has(name) ? this.map[name] : null
	};

	Headers.prototype.has = function(name) {
	  return this.map.hasOwnProperty(normalizeName(name))
	};

	Headers.prototype.set = function(name, value) {
	  this.map[normalizeName(name)] = normalizeValue(value);
	};

	Headers.prototype.forEach = function(callback, thisArg) {
	  for (var name in this.map) {
	    if (this.map.hasOwnProperty(name)) {
	      callback.call(thisArg, this.map[name], name, this);
	    }
	  }
	};

	Headers.prototype.keys = function() {
	  var items = [];
	  this.forEach(function(value, name) {
	    items.push(name);
	  });
	  return iteratorFor(items)
	};

	Headers.prototype.values = function() {
	  var items = [];
	  this.forEach(function(value) {
	    items.push(value);
	  });
	  return iteratorFor(items)
	};

	Headers.prototype.entries = function() {
	  var items = [];
	  this.forEach(function(value, name) {
	    items.push([name, value]);
	  });
	  return iteratorFor(items)
	};

	if (support.iterable) {
	  Headers.prototype[Symbol.iterator] = Headers.prototype.entries;
	}

	function consumed(body) {
	  if (body._noBody) return
	  if (body.bodyUsed) {
	    return Promise.reject(new TypeError('Already read'))
	  }
	  body.bodyUsed = true;
	}

	function fileReaderReady(reader) {
	  return new Promise(function(resolve, reject) {
	    reader.onload = function() {
	      resolve(reader.result);
	    };
	    reader.onerror = function() {
	      reject(reader.error);
	    };
	  })
	}

	function readBlobAsArrayBuffer(blob) {
	  var reader = new FileReader();
	  var promise = fileReaderReady(reader);
	  reader.readAsArrayBuffer(blob);
	  return promise
	}

	function readBlobAsText(blob) {
	  var reader = new FileReader();
	  var promise = fileReaderReady(reader);
	  var match = /charset=([A-Za-z0-9_-]+)/.exec(blob.type);
	  var encoding = match ? match[1] : 'utf-8';
	  reader.readAsText(blob, encoding);
	  return promise
	}

	function readArrayBufferAsText(buf) {
	  var view = new Uint8Array(buf);
	  var chars = new Array(view.length);

	  for (var i = 0; i < view.length; i++) {
	    chars[i] = String.fromCharCode(view[i]);
	  }
	  return chars.join('')
	}

	function bufferClone(buf) {
	  if (buf.slice) {
	    return buf.slice(0)
	  } else {
	    var view = new Uint8Array(buf.byteLength);
	    view.set(new Uint8Array(buf));
	    return view.buffer
	  }
	}

	function Body() {
	  this.bodyUsed = false;

	  this._initBody = function(body) {
	    /*
	      fetch-mock wraps the Response object in an ES6 Proxy to
	      provide useful test harness features such as flush. However, on
	      ES5 browsers without fetch or Proxy support pollyfills must be used;
	      the proxy-pollyfill is unable to proxy an attribute unless it exists
	      on the object before the Proxy is created. This change ensures
	      Response.bodyUsed exists on the instance, while maintaining the
	      semantic of setting Request.bodyUsed in the constructor before
	      _initBody is called.
	    */
	    // eslint-disable-next-line no-self-assign
	    this.bodyUsed = this.bodyUsed;
	    this._bodyInit = body;
	    if (!body) {
	      this._noBody = true;
	      this._bodyText = '';
	    } else if (typeof body === 'string') {
	      this._bodyText = body;
	    } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
	      this._bodyBlob = body;
	    } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
	      this._bodyFormData = body;
	    } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
	      this._bodyText = body.toString();
	    } else if (support.arrayBuffer && support.blob && isDataView(body)) {
	      this._bodyArrayBuffer = bufferClone(body.buffer);
	      // IE 10-11 can't handle a DataView body.
	      this._bodyInit = new Blob([this._bodyArrayBuffer]);
	    } else if (support.arrayBuffer && (ArrayBuffer.prototype.isPrototypeOf(body) || isArrayBufferView(body))) {
	      this._bodyArrayBuffer = bufferClone(body);
	    } else {
	      this._bodyText = body = Object.prototype.toString.call(body);
	    }

	    if (!this.headers.get('content-type')) {
	      if (typeof body === 'string') {
	        this.headers.set('content-type', 'text/plain;charset=UTF-8');
	      } else if (this._bodyBlob && this._bodyBlob.type) {
	        this.headers.set('content-type', this._bodyBlob.type);
	      } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
	        this.headers.set('content-type', 'application/x-www-form-urlencoded;charset=UTF-8');
	      }
	    }
	  };

	  if (support.blob) {
	    this.blob = function() {
	      var rejected = consumed(this);
	      if (rejected) {
	        return rejected
	      }

	      if (this._bodyBlob) {
	        return Promise.resolve(this._bodyBlob)
	      } else if (this._bodyArrayBuffer) {
	        return Promise.resolve(new Blob([this._bodyArrayBuffer]))
	      } else if (this._bodyFormData) {
	        throw new Error('could not read FormData body as blob')
	      } else {
	        return Promise.resolve(new Blob([this._bodyText]))
	      }
	    };
	  }

	  this.arrayBuffer = function() {
	    if (this._bodyArrayBuffer) {
	      var isConsumed = consumed(this);
	      if (isConsumed) {
	        return isConsumed
	      } else if (ArrayBuffer.isView(this._bodyArrayBuffer)) {
	        return Promise.resolve(
	          this._bodyArrayBuffer.buffer.slice(
	            this._bodyArrayBuffer.byteOffset,
	            this._bodyArrayBuffer.byteOffset + this._bodyArrayBuffer.byteLength
	          )
	        )
	      } else {
	        return Promise.resolve(this._bodyArrayBuffer)
	      }
	    } else if (support.blob) {
	      return this.blob().then(readBlobAsArrayBuffer)
	    } else {
	      throw new Error('could not read as ArrayBuffer')
	    }
	  };

	  this.text = function() {
	    var rejected = consumed(this);
	    if (rejected) {
	      return rejected
	    }

	    if (this._bodyBlob) {
	      return readBlobAsText(this._bodyBlob)
	    } else if (this._bodyArrayBuffer) {
	      return Promise.resolve(readArrayBufferAsText(this._bodyArrayBuffer))
	    } else if (this._bodyFormData) {
	      throw new Error('could not read FormData body as text')
	    } else {
	      return Promise.resolve(this._bodyText)
	    }
	  };

	  if (support.formData) {
	    this.formData = function() {
	      return this.text().then(decode$1)
	    };
	  }

	  this.json = function() {
	    return this.text().then(JSON.parse)
	  };

	  return this
	}

	// HTTP methods whose capitalization should be normalized
	var methods = ['CONNECT', 'DELETE', 'GET', 'HEAD', 'OPTIONS', 'PATCH', 'POST', 'PUT', 'TRACE'];

	function normalizeMethod(method) {
	  var upcased = method.toUpperCase();
	  return methods.indexOf(upcased) > -1 ? upcased : method
	}

	function Request(input, options) {
	  if (!(this instanceof Request)) {
	    throw new TypeError('Please use the "new" operator, this DOM object constructor cannot be called as a function.')
	  }

	  options = options || {};
	  var body = options.body;

	  if (input instanceof Request) {
	    if (input.bodyUsed) {
	      throw new TypeError('Already read')
	    }
	    this.url = input.url;
	    this.credentials = input.credentials;
	    if (!options.headers) {
	      this.headers = new Headers(input.headers);
	    }
	    this.method = input.method;
	    this.mode = input.mode;
	    this.signal = input.signal;
	    if (!body && input._bodyInit != null) {
	      body = input._bodyInit;
	      input.bodyUsed = true;
	    }
	  } else {
	    this.url = String(input);
	  }

	  this.credentials = options.credentials || this.credentials || 'same-origin';
	  if (options.headers || !this.headers) {
	    this.headers = new Headers(options.headers);
	  }
	  this.method = normalizeMethod(options.method || this.method || 'GET');
	  this.mode = options.mode || this.mode || null;
	  this.signal = options.signal || this.signal || (function () {
	    if ('AbortController' in g) {
	      var ctrl = new AbortController();
	      return ctrl.signal;
	    }
	  }());
	  this.referrer = null;

	  if ((this.method === 'GET' || this.method === 'HEAD') && body) {
	    throw new TypeError('Body not allowed for GET or HEAD requests')
	  }
	  this._initBody(body);

	  if (this.method === 'GET' || this.method === 'HEAD') {
	    if (options.cache === 'no-store' || options.cache === 'no-cache') {
	      // Search for a '_' parameter in the query string
	      var reParamSearch = /([?&])_=[^&]*/;
	      if (reParamSearch.test(this.url)) {
	        // If it already exists then set the value with the current time
	        this.url = this.url.replace(reParamSearch, '$1_=' + new Date().getTime());
	      } else {
	        // Otherwise add a new '_' parameter to the end with the current time
	        var reQueryString = /\?/;
	        this.url += (reQueryString.test(this.url) ? '&' : '?') + '_=' + new Date().getTime();
	      }
	    }
	  }
	}

	Request.prototype.clone = function() {
	  return new Request(this, {body: this._bodyInit})
	};

	function decode$1(body) {
	  var form = new FormData();
	  body
	    .trim()
	    .split('&')
	    .forEach(function(bytes) {
	      if (bytes) {
	        var split = bytes.split('=');
	        var name = split.shift().replace(/\+/g, ' ');
	        var value = split.join('=').replace(/\+/g, ' ');
	        form.append(decodeURIComponent(name), decodeURIComponent(value));
	      }
	    });
	  return form
	}

	function parseHeaders(rawHeaders) {
	  var headers = new Headers();
	  // Replace instances of \r\n and \n followed by at least one space or horizontal tab with a space
	  // https://tools.ietf.org/html/rfc7230#section-3.2
	  var preProcessedHeaders = rawHeaders.replace(/\r?\n[\t ]+/g, ' ');
	  // Avoiding split via regex to work around a common IE11 bug with the core-js 3.6.0 regex polyfill
	  // https://github.com/github/fetch/issues/748
	  // https://github.com/zloirock/core-js/issues/751
	  preProcessedHeaders
	    .split('\r')
	    .map(function(header) {
	      return header.indexOf('\n') === 0 ? header.substr(1, header.length) : header
	    })
	    .forEach(function(line) {
	      var parts = line.split(':');
	      var key = parts.shift().trim();
	      if (key) {
	        var value = parts.join(':').trim();
	        try {
	          headers.append(key, value);
	        } catch (error) {
	          console.warn('Response ' + error.message);
	        }
	      }
	    });
	  return headers
	}

	Body.call(Request.prototype);

	function Response(bodyInit, options) {
	  if (!(this instanceof Response)) {
	    throw new TypeError('Please use the "new" operator, this DOM object constructor cannot be called as a function.')
	  }
	  if (!options) {
	    options = {};
	  }

	  this.type = 'default';
	  this.status = options.status === undefined ? 200 : options.status;
	  if (this.status < 200 || this.status > 599) {
	    throw new RangeError("Failed to construct 'Response': The status provided (0) is outside the range [200, 599].")
	  }
	  this.ok = this.status >= 200 && this.status < 300;
	  this.statusText = options.statusText === undefined ? '' : '' + options.statusText;
	  this.headers = new Headers(options.headers);
	  this.url = options.url || '';
	  this._initBody(bodyInit);
	}

	Body.call(Response.prototype);

	Response.prototype.clone = function() {
	  return new Response(this._bodyInit, {
	    status: this.status,
	    statusText: this.statusText,
	    headers: new Headers(this.headers),
	    url: this.url
	  })
	};

	Response.error = function() {
	  var response = new Response(null, {status: 200, statusText: ''});
	  response.ok = false;
	  response.status = 0;
	  response.type = 'error';
	  return response
	};

	var redirectStatuses = [301, 302, 303, 307, 308];

	Response.redirect = function(url, status) {
	  if (redirectStatuses.indexOf(status) === -1) {
	    throw new RangeError('Invalid status code')
	  }

	  return new Response(null, {status: status, headers: {location: url}})
	};

	var DOMException = g.DOMException;
	try {
	  new DOMException();
	} catch (err) {
	  DOMException = function(message, name) {
	    this.message = message;
	    this.name = name;
	    var error = Error(message);
	    this.stack = error.stack;
	  };
	  DOMException.prototype = Object.create(Error.prototype);
	  DOMException.prototype.constructor = DOMException;
	}

	function fetch$1(input, init) {
	  return new Promise(function(resolve, reject) {
	    var request = new Request(input, init);

	    if (request.signal && request.signal.aborted) {
	      return reject(new DOMException('Aborted', 'AbortError'))
	    }

	    var xhr = new XMLHttpRequest();

	    function abortXhr() {
	      xhr.abort();
	    }

	    xhr.onload = function() {
	      var options = {
	        statusText: xhr.statusText,
	        headers: parseHeaders(xhr.getAllResponseHeaders() || '')
	      };
	      // This check if specifically for when a user fetches a file locally from the file system
	      // Only if the status is out of a normal range
	      if (request.url.indexOf('file://') === 0 && (xhr.status < 200 || xhr.status > 599)) {
	        options.status = 200;
	      } else {
	        options.status = xhr.status;
	      }
	      options.url = 'responseURL' in xhr ? xhr.responseURL : options.headers.get('X-Request-URL');
	      var body = 'response' in xhr ? xhr.response : xhr.responseText;
	      setTimeout(function() {
	        resolve(new Response(body, options));
	      }, 0);
	    };

	    xhr.onerror = function() {
	      setTimeout(function() {
	        reject(new TypeError('Network request failed'));
	      }, 0);
	    };

	    xhr.ontimeout = function() {
	      setTimeout(function() {
	        reject(new TypeError('Network request timed out'));
	      }, 0);
	    };

	    xhr.onabort = function() {
	      setTimeout(function() {
	        reject(new DOMException('Aborted', 'AbortError'));
	      }, 0);
	    };

	    function fixUrl(url) {
	      try {
	        return url === '' && g.location.href ? g.location.href : url
	      } catch (e) {
	        return url
	      }
	    }

	    xhr.open(request.method, fixUrl(request.url), true);

	    if (request.credentials === 'include') {
	      xhr.withCredentials = true;
	    } else if (request.credentials === 'omit') {
	      xhr.withCredentials = false;
	    }

	    if ('responseType' in xhr) {
	      if (support.blob) {
	        xhr.responseType = 'blob';
	      } else if (
	        support.arrayBuffer
	      ) {
	        xhr.responseType = 'arraybuffer';
	      }
	    }

	    if (init && typeof init.headers === 'object' && !(init.headers instanceof Headers || (g.Headers && init.headers instanceof g.Headers))) {
	      var names = [];
	      Object.getOwnPropertyNames(init.headers).forEach(function(name) {
	        names.push(normalizeName(name));
	        xhr.setRequestHeader(name, normalizeValue(init.headers[name]));
	      });
	      request.headers.forEach(function(value, name) {
	        if (names.indexOf(name) === -1) {
	          xhr.setRequestHeader(name, value);
	        }
	      });
	    } else {
	      request.headers.forEach(function(value, name) {
	        xhr.setRequestHeader(name, value);
	      });
	    }

	    if (request.signal) {
	      request.signal.addEventListener('abort', abortXhr);

	      xhr.onreadystatechange = function() {
	        // DONE (success or failure)
	        if (xhr.readyState === 4) {
	          request.signal.removeEventListener('abort', abortXhr);
	        }
	      };
	    }

	    xhr.send(typeof request._bodyInit === 'undefined' ? null : request._bodyInit);
	  })
	}

	fetch$1.polyfill = true;

	if (!g.fetch) {
	  g.fetch = fetch$1;
	  g.Headers = Headers;
	  g.Request = Request;
	  g.Response = Response;
	}

	// Generated using scripts/write-decode-map.ts
	var htmlDecodeTree = new Uint16Array(
	// prettier-ignore
	"\u1d41<\xd5\u0131\u028a\u049d\u057b\u05d0\u0675\u06de\u07a2\u07d6\u080f\u0a4a\u0a91\u0da1\u0e6d\u0f09\u0f26\u10ca\u1228\u12e1\u1415\u149d\u14c3\u14df\u1525\0\0\0\0\0\0\u156b\u16cd\u198d\u1c12\u1ddd\u1f7e\u2060\u21b0\u228d\u23c0\u23fb\u2442\u2824\u2912\u2d08\u2e48\u2fce\u3016\u32ba\u3639\u37ac\u38fe\u3a28\u3a71\u3ae0\u3b2e\u0800EMabcfglmnoprstu\\bfms\x7f\x84\x8b\x90\x95\x98\xa6\xb3\xb9\xc8\xcflig\u803b\xc6\u40c6P\u803b&\u4026cute\u803b\xc1\u40c1reve;\u4102\u0100iyx}rc\u803b\xc2\u40c2;\u4410r;\uc000\ud835\udd04rave\u803b\xc0\u40c0pha;\u4391acr;\u4100d;\u6a53\u0100gp\x9d\xa1on;\u4104f;\uc000\ud835\udd38plyFunction;\u6061ing\u803b\xc5\u40c5\u0100cs\xbe\xc3r;\uc000\ud835\udc9cign;\u6254ilde\u803b\xc3\u40c3ml\u803b\xc4\u40c4\u0400aceforsu\xe5\xfb\xfe\u0117\u011c\u0122\u0127\u012a\u0100cr\xea\xf2kslash;\u6216\u0176\xf6\xf8;\u6ae7ed;\u6306y;\u4411\u0180crt\u0105\u010b\u0114ause;\u6235noullis;\u612ca;\u4392r;\uc000\ud835\udd05pf;\uc000\ud835\udd39eve;\u42d8c\xf2\u0113mpeq;\u624e\u0700HOacdefhilorsu\u014d\u0151\u0156\u0180\u019e\u01a2\u01b5\u01b7\u01ba\u01dc\u0215\u0273\u0278\u027ecy;\u4427PY\u803b\xa9\u40a9\u0180cpy\u015d\u0162\u017aute;\u4106\u0100;i\u0167\u0168\u62d2talDifferentialD;\u6145leys;\u612d\u0200aeio\u0189\u018e\u0194\u0198ron;\u410cdil\u803b\xc7\u40c7rc;\u4108nint;\u6230ot;\u410a\u0100dn\u01a7\u01adilla;\u40b8terDot;\u40b7\xf2\u017fi;\u43a7rcle\u0200DMPT\u01c7\u01cb\u01d1\u01d6ot;\u6299inus;\u6296lus;\u6295imes;\u6297o\u0100cs\u01e2\u01f8kwiseContourIntegral;\u6232eCurly\u0100DQ\u0203\u020foubleQuote;\u601duote;\u6019\u0200lnpu\u021e\u0228\u0247\u0255on\u0100;e\u0225\u0226\u6237;\u6a74\u0180git\u022f\u0236\u023aruent;\u6261nt;\u622fourIntegral;\u622e\u0100fr\u024c\u024e;\u6102oduct;\u6210nterClockwiseContourIntegral;\u6233oss;\u6a2fcr;\uc000\ud835\udc9ep\u0100;C\u0284\u0285\u62d3ap;\u624d\u0580DJSZacefios\u02a0\u02ac\u02b0\u02b4\u02b8\u02cb\u02d7\u02e1\u02e6\u0333\u048d\u0100;o\u0179\u02a5trahd;\u6911cy;\u4402cy;\u4405cy;\u440f\u0180grs\u02bf\u02c4\u02c7ger;\u6021r;\u61a1hv;\u6ae4\u0100ay\u02d0\u02d5ron;\u410e;\u4414l\u0100;t\u02dd\u02de\u6207a;\u4394r;\uc000\ud835\udd07\u0100af\u02eb\u0327\u0100cm\u02f0\u0322ritical\u0200ADGT\u0300\u0306\u0316\u031ccute;\u40b4o\u0174\u030b\u030d;\u42d9bleAcute;\u42ddrave;\u4060ilde;\u42dcond;\u62c4ferentialD;\u6146\u0470\u033d\0\0\0\u0342\u0354\0\u0405f;\uc000\ud835\udd3b\u0180;DE\u0348\u0349\u034d\u40a8ot;\u60dcqual;\u6250ble\u0300CDLRUV\u0363\u0372\u0382\u03cf\u03e2\u03f8ontourIntegra\xec\u0239o\u0274\u0379\0\0\u037b\xbb\u0349nArrow;\u61d3\u0100eo\u0387\u03a4ft\u0180ART\u0390\u0396\u03a1rrow;\u61d0ightArrow;\u61d4e\xe5\u02cang\u0100LR\u03ab\u03c4eft\u0100AR\u03b3\u03b9rrow;\u67f8ightArrow;\u67faightArrow;\u67f9ight\u0100AT\u03d8\u03derrow;\u61d2ee;\u62a8p\u0241\u03e9\0\0\u03efrrow;\u61d1ownArrow;\u61d5erticalBar;\u6225n\u0300ABLRTa\u0412\u042a\u0430\u045e\u047f\u037crrow\u0180;BU\u041d\u041e\u0422\u6193ar;\u6913pArrow;\u61f5reve;\u4311eft\u02d2\u043a\0\u0446\0\u0450ightVector;\u6950eeVector;\u695eector\u0100;B\u0459\u045a\u61bdar;\u6956ight\u01d4\u0467\0\u0471eeVector;\u695fector\u0100;B\u047a\u047b\u61c1ar;\u6957ee\u0100;A\u0486\u0487\u62a4rrow;\u61a7\u0100ct\u0492\u0497r;\uc000\ud835\udc9frok;\u4110\u0800NTacdfglmopqstux\u04bd\u04c0\u04c4\u04cb\u04de\u04e2\u04e7\u04ee\u04f5\u0521\u052f\u0536\u0552\u055d\u0560\u0565G;\u414aH\u803b\xd0\u40d0cute\u803b\xc9\u40c9\u0180aiy\u04d2\u04d7\u04dcron;\u411arc\u803b\xca\u40ca;\u442dot;\u4116r;\uc000\ud835\udd08rave\u803b\xc8\u40c8ement;\u6208\u0100ap\u04fa\u04fecr;\u4112ty\u0253\u0506\0\0\u0512mallSquare;\u65fberySmallSquare;\u65ab\u0100gp\u0526\u052aon;\u4118f;\uc000\ud835\udd3csilon;\u4395u\u0100ai\u053c\u0549l\u0100;T\u0542\u0543\u6a75ilde;\u6242librium;\u61cc\u0100ci\u0557\u055ar;\u6130m;\u6a73a;\u4397ml\u803b\xcb\u40cb\u0100ip\u056a\u056fsts;\u6203onentialE;\u6147\u0280cfios\u0585\u0588\u058d\u05b2\u05ccy;\u4424r;\uc000\ud835\udd09lled\u0253\u0597\0\0\u05a3mallSquare;\u65fcerySmallSquare;\u65aa\u0370\u05ba\0\u05bf\0\0\u05c4f;\uc000\ud835\udd3dAll;\u6200riertrf;\u6131c\xf2\u05cb\u0600JTabcdfgorst\u05e8\u05ec\u05ef\u05fa\u0600\u0612\u0616\u061b\u061d\u0623\u066c\u0672cy;\u4403\u803b>\u403emma\u0100;d\u05f7\u05f8\u4393;\u43dcreve;\u411e\u0180eiy\u0607\u060c\u0610dil;\u4122rc;\u411c;\u4413ot;\u4120r;\uc000\ud835\udd0a;\u62d9pf;\uc000\ud835\udd3eeater\u0300EFGLST\u0635\u0644\u064e\u0656\u065b\u0666qual\u0100;L\u063e\u063f\u6265ess;\u62dbullEqual;\u6267reater;\u6aa2ess;\u6277lantEqual;\u6a7eilde;\u6273cr;\uc000\ud835\udca2;\u626b\u0400Aacfiosu\u0685\u068b\u0696\u069b\u069e\u06aa\u06be\u06caRDcy;\u442a\u0100ct\u0690\u0694ek;\u42c7;\u405eirc;\u4124r;\u610clbertSpace;\u610b\u01f0\u06af\0\u06b2f;\u610dizontalLine;\u6500\u0100ct\u06c3\u06c5\xf2\u06a9rok;\u4126mp\u0144\u06d0\u06d8ownHum\xf0\u012fqual;\u624f\u0700EJOacdfgmnostu\u06fa\u06fe\u0703\u0707\u070e\u071a\u071e\u0721\u0728\u0744\u0778\u078b\u078f\u0795cy;\u4415lig;\u4132cy;\u4401cute\u803b\xcd\u40cd\u0100iy\u0713\u0718rc\u803b\xce\u40ce;\u4418ot;\u4130r;\u6111rave\u803b\xcc\u40cc\u0180;ap\u0720\u072f\u073f\u0100cg\u0734\u0737r;\u412ainaryI;\u6148lie\xf3\u03dd\u01f4\u0749\0\u0762\u0100;e\u074d\u074e\u622c\u0100gr\u0753\u0758ral;\u622bsection;\u62c2isible\u0100CT\u076c\u0772omma;\u6063imes;\u6062\u0180gpt\u077f\u0783\u0788on;\u412ef;\uc000\ud835\udd40a;\u4399cr;\u6110ilde;\u4128\u01eb\u079a\0\u079ecy;\u4406l\u803b\xcf\u40cf\u0280cfosu\u07ac\u07b7\u07bc\u07c2\u07d0\u0100iy\u07b1\u07b5rc;\u4134;\u4419r;\uc000\ud835\udd0dpf;\uc000\ud835\udd41\u01e3\u07c7\0\u07ccr;\uc000\ud835\udca5rcy;\u4408kcy;\u4404\u0380HJacfos\u07e4\u07e8\u07ec\u07f1\u07fd\u0802\u0808cy;\u4425cy;\u440cppa;\u439a\u0100ey\u07f6\u07fbdil;\u4136;\u441ar;\uc000\ud835\udd0epf;\uc000\ud835\udd42cr;\uc000\ud835\udca6\u0580JTaceflmost\u0825\u0829\u082c\u0850\u0863\u09b3\u09b8\u09c7\u09cd\u0a37\u0a47cy;\u4409\u803b<\u403c\u0280cmnpr\u0837\u083c\u0841\u0844\u084dute;\u4139bda;\u439bg;\u67ealacetrf;\u6112r;\u619e\u0180aey\u0857\u085c\u0861ron;\u413ddil;\u413b;\u441b\u0100fs\u0868\u0970t\u0500ACDFRTUVar\u087e\u08a9\u08b1\u08e0\u08e6\u08fc\u092f\u095b\u0390\u096a\u0100nr\u0883\u088fgleBracket;\u67e8row\u0180;BR\u0899\u089a\u089e\u6190ar;\u61e4ightArrow;\u61c6eiling;\u6308o\u01f5\u08b7\0\u08c3bleBracket;\u67e6n\u01d4\u08c8\0\u08d2eeVector;\u6961ector\u0100;B\u08db\u08dc\u61c3ar;\u6959loor;\u630aight\u0100AV\u08ef\u08f5rrow;\u6194ector;\u694e\u0100er\u0901\u0917e\u0180;AV\u0909\u090a\u0910\u62a3rrow;\u61a4ector;\u695aiangle\u0180;BE\u0924\u0925\u0929\u62b2ar;\u69cfqual;\u62b4p\u0180DTV\u0937\u0942\u094cownVector;\u6951eeVector;\u6960ector\u0100;B\u0956\u0957\u61bfar;\u6958ector\u0100;B\u0965\u0966\u61bcar;\u6952ight\xe1\u039cs\u0300EFGLST\u097e\u098b\u0995\u099d\u09a2\u09adqualGreater;\u62daullEqual;\u6266reater;\u6276ess;\u6aa1lantEqual;\u6a7dilde;\u6272r;\uc000\ud835\udd0f\u0100;e\u09bd\u09be\u62d8ftarrow;\u61daidot;\u413f\u0180npw\u09d4\u0a16\u0a1bg\u0200LRlr\u09de\u09f7\u0a02\u0a10eft\u0100AR\u09e6\u09ecrrow;\u67f5ightArrow;\u67f7ightArrow;\u67f6eft\u0100ar\u03b3\u0a0aight\xe1\u03bfight\xe1\u03caf;\uc000\ud835\udd43er\u0100LR\u0a22\u0a2ceftArrow;\u6199ightArrow;\u6198\u0180cht\u0a3e\u0a40\u0a42\xf2\u084c;\u61b0rok;\u4141;\u626a\u0400acefiosu\u0a5a\u0a5d\u0a60\u0a77\u0a7c\u0a85\u0a8b\u0a8ep;\u6905y;\u441c\u0100dl\u0a65\u0a6fiumSpace;\u605flintrf;\u6133r;\uc000\ud835\udd10nusPlus;\u6213pf;\uc000\ud835\udd44c\xf2\u0a76;\u439c\u0480Jacefostu\u0aa3\u0aa7\u0aad\u0ac0\u0b14\u0b19\u0d91\u0d97\u0d9ecy;\u440acute;\u4143\u0180aey\u0ab4\u0ab9\u0aberon;\u4147dil;\u4145;\u441d\u0180gsw\u0ac7\u0af0\u0b0eative\u0180MTV\u0ad3\u0adf\u0ae8ediumSpace;\u600bhi\u0100cn\u0ae6\u0ad8\xeb\u0ad9eryThi\xee\u0ad9ted\u0100GL\u0af8\u0b06reaterGreate\xf2\u0673essLes\xf3\u0a48Line;\u400ar;\uc000\ud835\udd11\u0200Bnpt\u0b22\u0b28\u0b37\u0b3areak;\u6060BreakingSpace;\u40a0f;\u6115\u0680;CDEGHLNPRSTV\u0b55\u0b56\u0b6a\u0b7c\u0ba1\u0beb\u0c04\u0c5e\u0c84\u0ca6\u0cd8\u0d61\u0d85\u6aec\u0100ou\u0b5b\u0b64ngruent;\u6262pCap;\u626doubleVerticalBar;\u6226\u0180lqx\u0b83\u0b8a\u0b9bement;\u6209ual\u0100;T\u0b92\u0b93\u6260ilde;\uc000\u2242\u0338ists;\u6204reater\u0380;EFGLST\u0bb6\u0bb7\u0bbd\u0bc9\u0bd3\u0bd8\u0be5\u626fqual;\u6271ullEqual;\uc000\u2267\u0338reater;\uc000\u226b\u0338ess;\u6279lantEqual;\uc000\u2a7e\u0338ilde;\u6275ump\u0144\u0bf2\u0bfdownHump;\uc000\u224e\u0338qual;\uc000\u224f\u0338e\u0100fs\u0c0a\u0c27tTriangle\u0180;BE\u0c1a\u0c1b\u0c21\u62eaar;\uc000\u29cf\u0338qual;\u62ecs\u0300;EGLST\u0c35\u0c36\u0c3c\u0c44\u0c4b\u0c58\u626equal;\u6270reater;\u6278ess;\uc000\u226a\u0338lantEqual;\uc000\u2a7d\u0338ilde;\u6274ested\u0100GL\u0c68\u0c79reaterGreater;\uc000\u2aa2\u0338essLess;\uc000\u2aa1\u0338recedes\u0180;ES\u0c92\u0c93\u0c9b\u6280qual;\uc000\u2aaf\u0338lantEqual;\u62e0\u0100ei\u0cab\u0cb9verseElement;\u620cghtTriangle\u0180;BE\u0ccb\u0ccc\u0cd2\u62ebar;\uc000\u29d0\u0338qual;\u62ed\u0100qu\u0cdd\u0d0cuareSu\u0100bp\u0ce8\u0cf9set\u0100;E\u0cf0\u0cf3\uc000\u228f\u0338qual;\u62e2erset\u0100;E\u0d03\u0d06\uc000\u2290\u0338qual;\u62e3\u0180bcp\u0d13\u0d24\u0d4eset\u0100;E\u0d1b\u0d1e\uc000\u2282\u20d2qual;\u6288ceeds\u0200;EST\u0d32\u0d33\u0d3b\u0d46\u6281qual;\uc000\u2ab0\u0338lantEqual;\u62e1ilde;\uc000\u227f\u0338erset\u0100;E\u0d58\u0d5b\uc000\u2283\u20d2qual;\u6289ilde\u0200;EFT\u0d6e\u0d6f\u0d75\u0d7f\u6241qual;\u6244ullEqual;\u6247ilde;\u6249erticalBar;\u6224cr;\uc000\ud835\udca9ilde\u803b\xd1\u40d1;\u439d\u0700Eacdfgmoprstuv\u0dbd\u0dc2\u0dc9\u0dd5\u0ddb\u0de0\u0de7\u0dfc\u0e02\u0e20\u0e22\u0e32\u0e3f\u0e44lig;\u4152cute\u803b\xd3\u40d3\u0100iy\u0dce\u0dd3rc\u803b\xd4\u40d4;\u441eblac;\u4150r;\uc000\ud835\udd12rave\u803b\xd2\u40d2\u0180aei\u0dee\u0df2\u0df6cr;\u414cga;\u43a9cron;\u439fpf;\uc000\ud835\udd46enCurly\u0100DQ\u0e0e\u0e1aoubleQuote;\u601cuote;\u6018;\u6a54\u0100cl\u0e27\u0e2cr;\uc000\ud835\udcaaash\u803b\xd8\u40d8i\u016c\u0e37\u0e3cde\u803b\xd5\u40d5es;\u6a37ml\u803b\xd6\u40d6er\u0100BP\u0e4b\u0e60\u0100ar\u0e50\u0e53r;\u603eac\u0100ek\u0e5a\u0e5c;\u63deet;\u63b4arenthesis;\u63dc\u0480acfhilors\u0e7f\u0e87\u0e8a\u0e8f\u0e92\u0e94\u0e9d\u0eb0\u0efcrtialD;\u6202y;\u441fr;\uc000\ud835\udd13i;\u43a6;\u43a0usMinus;\u40b1\u0100ip\u0ea2\u0eadncareplan\xe5\u069df;\u6119\u0200;eio\u0eb9\u0eba\u0ee0\u0ee4\u6abbcedes\u0200;EST\u0ec8\u0ec9\u0ecf\u0eda\u627aqual;\u6aaflantEqual;\u627cilde;\u627eme;\u6033\u0100dp\u0ee9\u0eeeuct;\u620fortion\u0100;a\u0225\u0ef9l;\u621d\u0100ci\u0f01\u0f06r;\uc000\ud835\udcab;\u43a8\u0200Ufos\u0f11\u0f16\u0f1b\u0f1fOT\u803b\"\u4022r;\uc000\ud835\udd14pf;\u611acr;\uc000\ud835\udcac\u0600BEacefhiorsu\u0f3e\u0f43\u0f47\u0f60\u0f73\u0fa7\u0faa\u0fad\u1096\u10a9\u10b4\u10bearr;\u6910G\u803b\xae\u40ae\u0180cnr\u0f4e\u0f53\u0f56ute;\u4154g;\u67ebr\u0100;t\u0f5c\u0f5d\u61a0l;\u6916\u0180aey\u0f67\u0f6c\u0f71ron;\u4158dil;\u4156;\u4420\u0100;v\u0f78\u0f79\u611cerse\u0100EU\u0f82\u0f99\u0100lq\u0f87\u0f8eement;\u620builibrium;\u61cbpEquilibrium;\u696fr\xbb\u0f79o;\u43a1ght\u0400ACDFTUVa\u0fc1\u0feb\u0ff3\u1022\u1028\u105b\u1087\u03d8\u0100nr\u0fc6\u0fd2gleBracket;\u67e9row\u0180;BL\u0fdc\u0fdd\u0fe1\u6192ar;\u61e5eftArrow;\u61c4eiling;\u6309o\u01f5\u0ff9\0\u1005bleBracket;\u67e7n\u01d4\u100a\0\u1014eeVector;\u695dector\u0100;B\u101d\u101e\u61c2ar;\u6955loor;\u630b\u0100er\u102d\u1043e\u0180;AV\u1035\u1036\u103c\u62a2rrow;\u61a6ector;\u695biangle\u0180;BE\u1050\u1051\u1055\u62b3ar;\u69d0qual;\u62b5p\u0180DTV\u1063\u106e\u1078ownVector;\u694feeVector;\u695cector\u0100;B\u1082\u1083\u61bear;\u6954ector\u0100;B\u1091\u1092\u61c0ar;\u6953\u0100pu\u109b\u109ef;\u611dndImplies;\u6970ightarrow;\u61db\u0100ch\u10b9\u10bcr;\u611b;\u61b1leDelayed;\u69f4\u0680HOacfhimoqstu\u10e4\u10f1\u10f7\u10fd\u1119\u111e\u1151\u1156\u1161\u1167\u11b5\u11bb\u11bf\u0100Cc\u10e9\u10eeHcy;\u4429y;\u4428FTcy;\u442ccute;\u415a\u0280;aeiy\u1108\u1109\u110e\u1113\u1117\u6abcron;\u4160dil;\u415erc;\u415c;\u4421r;\uc000\ud835\udd16ort\u0200DLRU\u112a\u1134\u113e\u1149ownArrow\xbb\u041eeftArrow\xbb\u089aightArrow\xbb\u0fddpArrow;\u6191gma;\u43a3allCircle;\u6218pf;\uc000\ud835\udd4a\u0272\u116d\0\0\u1170t;\u621aare\u0200;ISU\u117b\u117c\u1189\u11af\u65a1ntersection;\u6293u\u0100bp\u118f\u119eset\u0100;E\u1197\u1198\u628fqual;\u6291erset\u0100;E\u11a8\u11a9\u6290qual;\u6292nion;\u6294cr;\uc000\ud835\udcaear;\u62c6\u0200bcmp\u11c8\u11db\u1209\u120b\u0100;s\u11cd\u11ce\u62d0et\u0100;E\u11cd\u11d5qual;\u6286\u0100ch\u11e0\u1205eeds\u0200;EST\u11ed\u11ee\u11f4\u11ff\u627bqual;\u6ab0lantEqual;\u627dilde;\u627fTh\xe1\u0f8c;\u6211\u0180;es\u1212\u1213\u1223\u62d1rset\u0100;E\u121c\u121d\u6283qual;\u6287et\xbb\u1213\u0580HRSacfhiors\u123e\u1244\u1249\u1255\u125e\u1271\u1276\u129f\u12c2\u12c8\u12d1ORN\u803b\xde\u40deADE;\u6122\u0100Hc\u124e\u1252cy;\u440by;\u4426\u0100bu\u125a\u125c;\u4009;\u43a4\u0180aey\u1265\u126a\u126fron;\u4164dil;\u4162;\u4422r;\uc000\ud835\udd17\u0100ei\u127b\u1289\u01f2\u1280\0\u1287efore;\u6234a;\u4398\u0100cn\u128e\u1298kSpace;\uc000\u205f\u200aSpace;\u6009lde\u0200;EFT\u12ab\u12ac\u12b2\u12bc\u623cqual;\u6243ullEqual;\u6245ilde;\u6248pf;\uc000\ud835\udd4bipleDot;\u60db\u0100ct\u12d6\u12dbr;\uc000\ud835\udcafrok;\u4166\u0ae1\u12f7\u130e\u131a\u1326\0\u132c\u1331\0\0\0\0\0\u1338\u133d\u1377\u1385\0\u13ff\u1404\u140a\u1410\u0100cr\u12fb\u1301ute\u803b\xda\u40dar\u0100;o\u1307\u1308\u619fcir;\u6949r\u01e3\u1313\0\u1316y;\u440eve;\u416c\u0100iy\u131e\u1323rc\u803b\xdb\u40db;\u4423blac;\u4170r;\uc000\ud835\udd18rave\u803b\xd9\u40d9acr;\u416a\u0100di\u1341\u1369er\u0100BP\u1348\u135d\u0100ar\u134d\u1350r;\u405fac\u0100ek\u1357\u1359;\u63dfet;\u63b5arenthesis;\u63ddon\u0100;P\u1370\u1371\u62c3lus;\u628e\u0100gp\u137b\u137fon;\u4172f;\uc000\ud835\udd4c\u0400ADETadps\u1395\u13ae\u13b8\u13c4\u03e8\u13d2\u13d7\u13f3rrow\u0180;BD\u1150\u13a0\u13a4ar;\u6912ownArrow;\u61c5ownArrow;\u6195quilibrium;\u696eee\u0100;A\u13cb\u13cc\u62a5rrow;\u61a5own\xe1\u03f3er\u0100LR\u13de\u13e8eftArrow;\u6196ightArrow;\u6197i\u0100;l\u13f9\u13fa\u43d2on;\u43a5ing;\u416ecr;\uc000\ud835\udcb0ilde;\u4168ml\u803b\xdc\u40dc\u0480Dbcdefosv\u1427\u142c\u1430\u1433\u143e\u1485\u148a\u1490\u1496ash;\u62abar;\u6aeby;\u4412ash\u0100;l\u143b\u143c\u62a9;\u6ae6\u0100er\u1443\u1445;\u62c1\u0180bty\u144c\u1450\u147aar;\u6016\u0100;i\u144f\u1455cal\u0200BLST\u1461\u1465\u146a\u1474ar;\u6223ine;\u407ceparator;\u6758ilde;\u6240ThinSpace;\u600ar;\uc000\ud835\udd19pf;\uc000\ud835\udd4dcr;\uc000\ud835\udcb1dash;\u62aa\u0280cefos\u14a7\u14ac\u14b1\u14b6\u14bcirc;\u4174dge;\u62c0r;\uc000\ud835\udd1apf;\uc000\ud835\udd4ecr;\uc000\ud835\udcb2\u0200fios\u14cb\u14d0\u14d2\u14d8r;\uc000\ud835\udd1b;\u439epf;\uc000\ud835\udd4fcr;\uc000\ud835\udcb3\u0480AIUacfosu\u14f1\u14f5\u14f9\u14fd\u1504\u150f\u1514\u151a\u1520cy;\u442fcy;\u4407cy;\u442ecute\u803b\xdd\u40dd\u0100iy\u1509\u150drc;\u4176;\u442br;\uc000\ud835\udd1cpf;\uc000\ud835\udd50cr;\uc000\ud835\udcb4ml;\u4178\u0400Hacdefos\u1535\u1539\u153f\u154b\u154f\u155d\u1560\u1564cy;\u4416cute;\u4179\u0100ay\u1544\u1549ron;\u417d;\u4417ot;\u417b\u01f2\u1554\0\u155boWidt\xe8\u0ad9a;\u4396r;\u6128pf;\u6124cr;\uc000\ud835\udcb5\u0be1\u1583\u158a\u1590\0\u15b0\u15b6\u15bf\0\0\0\0\u15c6\u15db\u15eb\u165f\u166d\0\u1695\u169b\u16b2\u16b9\0\u16becute\u803b\xe1\u40e1reve;\u4103\u0300;Ediuy\u159c\u159d\u15a1\u15a3\u15a8\u15ad\u623e;\uc000\u223e\u0333;\u623frc\u803b\xe2\u40e2te\u80bb\xb4\u0306;\u4430lig\u803b\xe6\u40e6\u0100;r\xb2\u15ba;\uc000\ud835\udd1erave\u803b\xe0\u40e0\u0100ep\u15ca\u15d6\u0100fp\u15cf\u15d4sym;\u6135\xe8\u15d3ha;\u43b1\u0100ap\u15dfc\u0100cl\u15e4\u15e7r;\u4101g;\u6a3f\u0264\u15f0\0\0\u160a\u0280;adsv\u15fa\u15fb\u15ff\u1601\u1607\u6227nd;\u6a55;\u6a5clope;\u6a58;\u6a5a\u0380;elmrsz\u1618\u1619\u161b\u161e\u163f\u164f\u1659\u6220;\u69a4e\xbb\u1619sd\u0100;a\u1625\u1626\u6221\u0461\u1630\u1632\u1634\u1636\u1638\u163a\u163c\u163e;\u69a8;\u69a9;\u69aa;\u69ab;\u69ac;\u69ad;\u69ae;\u69aft\u0100;v\u1645\u1646\u621fb\u0100;d\u164c\u164d\u62be;\u699d\u0100pt\u1654\u1657h;\u6222\xbb\xb9arr;\u637c\u0100gp\u1663\u1667on;\u4105f;\uc000\ud835\udd52\u0380;Eaeiop\u12c1\u167b\u167d\u1682\u1684\u1687\u168a;\u6a70cir;\u6a6f;\u624ad;\u624bs;\u4027rox\u0100;e\u12c1\u1692\xf1\u1683ing\u803b\xe5\u40e5\u0180cty\u16a1\u16a6\u16a8r;\uc000\ud835\udcb6;\u402amp\u0100;e\u12c1\u16af\xf1\u0288ilde\u803b\xe3\u40e3ml\u803b\xe4\u40e4\u0100ci\u16c2\u16c8onin\xf4\u0272nt;\u6a11\u0800Nabcdefiklnoprsu\u16ed\u16f1\u1730\u173c\u1743\u1748\u1778\u177d\u17e0\u17e6\u1839\u1850\u170d\u193d\u1948\u1970ot;\u6aed\u0100cr\u16f6\u171ek\u0200ceps\u1700\u1705\u170d\u1713ong;\u624cpsilon;\u43f6rime;\u6035im\u0100;e\u171a\u171b\u623dq;\u62cd\u0176\u1722\u1726ee;\u62bded\u0100;g\u172c\u172d\u6305e\xbb\u172drk\u0100;t\u135c\u1737brk;\u63b6\u0100oy\u1701\u1741;\u4431quo;\u601e\u0280cmprt\u1753\u175b\u1761\u1764\u1768aus\u0100;e\u010a\u0109ptyv;\u69b0s\xe9\u170cno\xf5\u0113\u0180ahw\u176f\u1771\u1773;\u43b2;\u6136een;\u626cr;\uc000\ud835\udd1fg\u0380costuvw\u178d\u179d\u17b3\u17c1\u17d5\u17db\u17de\u0180aiu\u1794\u1796\u179a\xf0\u0760rc;\u65efp\xbb\u1371\u0180dpt\u17a4\u17a8\u17adot;\u6a00lus;\u6a01imes;\u6a02\u0271\u17b9\0\0\u17becup;\u6a06ar;\u6605riangle\u0100du\u17cd\u17d2own;\u65bdp;\u65b3plus;\u6a04e\xe5\u1444\xe5\u14adarow;\u690d\u0180ako\u17ed\u1826\u1835\u0100cn\u17f2\u1823k\u0180lst\u17fa\u05ab\u1802ozenge;\u69ebriangle\u0200;dlr\u1812\u1813\u1818\u181d\u65b4own;\u65beeft;\u65c2ight;\u65b8k;\u6423\u01b1\u182b\0\u1833\u01b2\u182f\0\u1831;\u6592;\u65914;\u6593ck;\u6588\u0100eo\u183e\u184d\u0100;q\u1843\u1846\uc000=\u20e5uiv;\uc000\u2261\u20e5t;\u6310\u0200ptwx\u1859\u185e\u1867\u186cf;\uc000\ud835\udd53\u0100;t\u13cb\u1863om\xbb\u13cctie;\u62c8\u0600DHUVbdhmptuv\u1885\u1896\u18aa\u18bb\u18d7\u18db\u18ec\u18ff\u1905\u190a\u1910\u1921\u0200LRlr\u188e\u1890\u1892\u1894;\u6557;\u6554;\u6556;\u6553\u0280;DUdu\u18a1\u18a2\u18a4\u18a6\u18a8\u6550;\u6566;\u6569;\u6564;\u6567\u0200LRlr\u18b3\u18b5\u18b7\u18b9;\u655d;\u655a;\u655c;\u6559\u0380;HLRhlr\u18ca\u18cb\u18cd\u18cf\u18d1\u18d3\u18d5\u6551;\u656c;\u6563;\u6560;\u656b;\u6562;\u655fox;\u69c9\u0200LRlr\u18e4\u18e6\u18e8\u18ea;\u6555;\u6552;\u6510;\u650c\u0280;DUdu\u06bd\u18f7\u18f9\u18fb\u18fd;\u6565;\u6568;\u652c;\u6534inus;\u629flus;\u629eimes;\u62a0\u0200LRlr\u1919\u191b\u191d\u191f;\u655b;\u6558;\u6518;\u6514\u0380;HLRhlr\u1930\u1931\u1933\u1935\u1937\u1939\u193b\u6502;\u656a;\u6561;\u655e;\u653c;\u6524;\u651c\u0100ev\u0123\u1942bar\u803b\xa6\u40a6\u0200ceio\u1951\u1956\u195a\u1960r;\uc000\ud835\udcb7mi;\u604fm\u0100;e\u171a\u171cl\u0180;bh\u1968\u1969\u196b\u405c;\u69c5sub;\u67c8\u016c\u1974\u197el\u0100;e\u1979\u197a\u6022t\xbb\u197ap\u0180;Ee\u012f\u1985\u1987;\u6aae\u0100;q\u06dc\u06db\u0ce1\u19a7\0\u19e8\u1a11\u1a15\u1a32\0\u1a37\u1a50\0\0\u1ab4\0\0\u1ac1\0\0\u1b21\u1b2e\u1b4d\u1b52\0\u1bfd\0\u1c0c\u0180cpr\u19ad\u19b2\u19ddute;\u4107\u0300;abcds\u19bf\u19c0\u19c4\u19ca\u19d5\u19d9\u6229nd;\u6a44rcup;\u6a49\u0100au\u19cf\u19d2p;\u6a4bp;\u6a47ot;\u6a40;\uc000\u2229\ufe00\u0100eo\u19e2\u19e5t;\u6041\xee\u0693\u0200aeiu\u19f0\u19fb\u1a01\u1a05\u01f0\u19f5\0\u19f8s;\u6a4don;\u410ddil\u803b\xe7\u40e7rc;\u4109ps\u0100;s\u1a0c\u1a0d\u6a4cm;\u6a50ot;\u410b\u0180dmn\u1a1b\u1a20\u1a26il\u80bb\xb8\u01adptyv;\u69b2t\u8100\xa2;e\u1a2d\u1a2e\u40a2r\xe4\u01b2r;\uc000\ud835\udd20\u0180cei\u1a3d\u1a40\u1a4dy;\u4447ck\u0100;m\u1a47\u1a48\u6713ark\xbb\u1a48;\u43c7r\u0380;Ecefms\u1a5f\u1a60\u1a62\u1a6b\u1aa4\u1aaa\u1aae\u65cb;\u69c3\u0180;el\u1a69\u1a6a\u1a6d\u42c6q;\u6257e\u0261\u1a74\0\0\u1a88rrow\u0100lr\u1a7c\u1a81eft;\u61baight;\u61bb\u0280RSacd\u1a92\u1a94\u1a96\u1a9a\u1a9f\xbb\u0f47;\u64c8st;\u629birc;\u629aash;\u629dnint;\u6a10id;\u6aefcir;\u69c2ubs\u0100;u\u1abb\u1abc\u6663it\xbb\u1abc\u02ec\u1ac7\u1ad4\u1afa\0\u1b0aon\u0100;e\u1acd\u1ace\u403a\u0100;q\xc7\xc6\u026d\u1ad9\0\0\u1ae2a\u0100;t\u1ade\u1adf\u402c;\u4040\u0180;fl\u1ae8\u1ae9\u1aeb\u6201\xee\u1160e\u0100mx\u1af1\u1af6ent\xbb\u1ae9e\xf3\u024d\u01e7\u1afe\0\u1b07\u0100;d\u12bb\u1b02ot;\u6a6dn\xf4\u0246\u0180fry\u1b10\u1b14\u1b17;\uc000\ud835\udd54o\xe4\u0254\u8100\xa9;s\u0155\u1b1dr;\u6117\u0100ao\u1b25\u1b29rr;\u61b5ss;\u6717\u0100cu\u1b32\u1b37r;\uc000\ud835\udcb8\u0100bp\u1b3c\u1b44\u0100;e\u1b41\u1b42\u6acf;\u6ad1\u0100;e\u1b49\u1b4a\u6ad0;\u6ad2dot;\u62ef\u0380delprvw\u1b60\u1b6c\u1b77\u1b82\u1bac\u1bd4\u1bf9arr\u0100lr\u1b68\u1b6a;\u6938;\u6935\u0270\u1b72\0\0\u1b75r;\u62dec;\u62dfarr\u0100;p\u1b7f\u1b80\u61b6;\u693d\u0300;bcdos\u1b8f\u1b90\u1b96\u1ba1\u1ba5\u1ba8\u622arcap;\u6a48\u0100au\u1b9b\u1b9ep;\u6a46p;\u6a4aot;\u628dr;\u6a45;\uc000\u222a\ufe00\u0200alrv\u1bb5\u1bbf\u1bde\u1be3rr\u0100;m\u1bbc\u1bbd\u61b7;\u693cy\u0180evw\u1bc7\u1bd4\u1bd8q\u0270\u1bce\0\0\u1bd2re\xe3\u1b73u\xe3\u1b75ee;\u62ceedge;\u62cfen\u803b\xa4\u40a4earrow\u0100lr\u1bee\u1bf3eft\xbb\u1b80ight\xbb\u1bbde\xe4\u1bdd\u0100ci\u1c01\u1c07onin\xf4\u01f7nt;\u6231lcty;\u632d\u0980AHabcdefhijlorstuwz\u1c38\u1c3b\u1c3f\u1c5d\u1c69\u1c75\u1c8a\u1c9e\u1cac\u1cb7\u1cfb\u1cff\u1d0d\u1d7b\u1d91\u1dab\u1dbb\u1dc6\u1dcdr\xf2\u0381ar;\u6965\u0200glrs\u1c48\u1c4d\u1c52\u1c54ger;\u6020eth;\u6138\xf2\u1133h\u0100;v\u1c5a\u1c5b\u6010\xbb\u090a\u016b\u1c61\u1c67arow;\u690fa\xe3\u0315\u0100ay\u1c6e\u1c73ron;\u410f;\u4434\u0180;ao\u0332\u1c7c\u1c84\u0100gr\u02bf\u1c81r;\u61catseq;\u6a77\u0180glm\u1c91\u1c94\u1c98\u803b\xb0\u40b0ta;\u43b4ptyv;\u69b1\u0100ir\u1ca3\u1ca8sht;\u697f;\uc000\ud835\udd21ar\u0100lr\u1cb3\u1cb5\xbb\u08dc\xbb\u101e\u0280aegsv\u1cc2\u0378\u1cd6\u1cdc\u1ce0m\u0180;os\u0326\u1cca\u1cd4nd\u0100;s\u0326\u1cd1uit;\u6666amma;\u43ddin;\u62f2\u0180;io\u1ce7\u1ce8\u1cf8\u40f7de\u8100\xf7;o\u1ce7\u1cf0ntimes;\u62c7n\xf8\u1cf7cy;\u4452c\u026f\u1d06\0\0\u1d0arn;\u631eop;\u630d\u0280lptuw\u1d18\u1d1d\u1d22\u1d49\u1d55lar;\u4024f;\uc000\ud835\udd55\u0280;emps\u030b\u1d2d\u1d37\u1d3d\u1d42q\u0100;d\u0352\u1d33ot;\u6251inus;\u6238lus;\u6214quare;\u62a1blebarwedg\xe5\xfan\u0180adh\u112e\u1d5d\u1d67ownarrow\xf3\u1c83arpoon\u0100lr\u1d72\u1d76ef\xf4\u1cb4igh\xf4\u1cb6\u0162\u1d7f\u1d85karo\xf7\u0f42\u026f\u1d8a\0\0\u1d8ern;\u631fop;\u630c\u0180cot\u1d98\u1da3\u1da6\u0100ry\u1d9d\u1da1;\uc000\ud835\udcb9;\u4455l;\u69f6rok;\u4111\u0100dr\u1db0\u1db4ot;\u62f1i\u0100;f\u1dba\u1816\u65bf\u0100ah\u1dc0\u1dc3r\xf2\u0429a\xf2\u0fa6angle;\u69a6\u0100ci\u1dd2\u1dd5y;\u445fgrarr;\u67ff\u0900Dacdefglmnopqrstux\u1e01\u1e09\u1e19\u1e38\u0578\u1e3c\u1e49\u1e61\u1e7e\u1ea5\u1eaf\u1ebd\u1ee1\u1f2a\u1f37\u1f44\u1f4e\u1f5a\u0100Do\u1e06\u1d34o\xf4\u1c89\u0100cs\u1e0e\u1e14ute\u803b\xe9\u40e9ter;\u6a6e\u0200aioy\u1e22\u1e27\u1e31\u1e36ron;\u411br\u0100;c\u1e2d\u1e2e\u6256\u803b\xea\u40ealon;\u6255;\u444dot;\u4117\u0100Dr\u1e41\u1e45ot;\u6252;\uc000\ud835\udd22\u0180;rs\u1e50\u1e51\u1e57\u6a9aave\u803b\xe8\u40e8\u0100;d\u1e5c\u1e5d\u6a96ot;\u6a98\u0200;ils\u1e6a\u1e6b\u1e72\u1e74\u6a99nters;\u63e7;\u6113\u0100;d\u1e79\u1e7a\u6a95ot;\u6a97\u0180aps\u1e85\u1e89\u1e97cr;\u4113ty\u0180;sv\u1e92\u1e93\u1e95\u6205et\xbb\u1e93p\u01001;\u1e9d\u1ea4\u0133\u1ea1\u1ea3;\u6004;\u6005\u6003\u0100gs\u1eaa\u1eac;\u414bp;\u6002\u0100gp\u1eb4\u1eb8on;\u4119f;\uc000\ud835\udd56\u0180als\u1ec4\u1ece\u1ed2r\u0100;s\u1eca\u1ecb\u62d5l;\u69e3us;\u6a71i\u0180;lv\u1eda\u1edb\u1edf\u43b5on\xbb\u1edb;\u43f5\u0200csuv\u1eea\u1ef3\u1f0b\u1f23\u0100io\u1eef\u1e31rc\xbb\u1e2e\u0269\u1ef9\0\0\u1efb\xed\u0548ant\u0100gl\u1f02\u1f06tr\xbb\u1e5dess\xbb\u1e7a\u0180aei\u1f12\u1f16\u1f1als;\u403dst;\u625fv\u0100;D\u0235\u1f20D;\u6a78parsl;\u69e5\u0100Da\u1f2f\u1f33ot;\u6253rr;\u6971\u0180cdi\u1f3e\u1f41\u1ef8r;\u612fo\xf4\u0352\u0100ah\u1f49\u1f4b;\u43b7\u803b\xf0\u40f0\u0100mr\u1f53\u1f57l\u803b\xeb\u40ebo;\u60ac\u0180cip\u1f61\u1f64\u1f67l;\u4021s\xf4\u056e\u0100eo\u1f6c\u1f74ctatio\xee\u0559nential\xe5\u0579\u09e1\u1f92\0\u1f9e\0\u1fa1\u1fa7\0\0\u1fc6\u1fcc\0\u1fd3\0\u1fe6\u1fea\u2000\0\u2008\u205allingdotse\xf1\u1e44y;\u4444male;\u6640\u0180ilr\u1fad\u1fb3\u1fc1lig;\u8000\ufb03\u0269\u1fb9\0\0\u1fbdg;\u8000\ufb00ig;\u8000\ufb04;\uc000\ud835\udd23lig;\u8000\ufb01lig;\uc000fj\u0180alt\u1fd9\u1fdc\u1fe1t;\u666dig;\u8000\ufb02ns;\u65b1of;\u4192\u01f0\u1fee\0\u1ff3f;\uc000\ud835\udd57\u0100ak\u05bf\u1ff7\u0100;v\u1ffc\u1ffd\u62d4;\u6ad9artint;\u6a0d\u0100ao\u200c\u2055\u0100cs\u2011\u2052\u03b1\u201a\u2030\u2038\u2045\u2048\0\u2050\u03b2\u2022\u2025\u2027\u202a\u202c\0\u202e\u803b\xbd\u40bd;\u6153\u803b\xbc\u40bc;\u6155;\u6159;\u615b\u01b3\u2034\0\u2036;\u6154;\u6156\u02b4\u203e\u2041\0\0\u2043\u803b\xbe\u40be;\u6157;\u615c5;\u6158\u01b6\u204c\0\u204e;\u615a;\u615d8;\u615el;\u6044wn;\u6322cr;\uc000\ud835\udcbb\u0880Eabcdefgijlnorstv\u2082\u2089\u209f\u20a5\u20b0\u20b4\u20f0\u20f5\u20fa\u20ff\u2103\u2112\u2138\u0317\u213e\u2152\u219e\u0100;l\u064d\u2087;\u6a8c\u0180cmp\u2090\u2095\u209dute;\u41f5ma\u0100;d\u209c\u1cda\u43b3;\u6a86reve;\u411f\u0100iy\u20aa\u20aerc;\u411d;\u4433ot;\u4121\u0200;lqs\u063e\u0642\u20bd\u20c9\u0180;qs\u063e\u064c\u20c4lan\xf4\u0665\u0200;cdl\u0665\u20d2\u20d5\u20e5c;\u6aa9ot\u0100;o\u20dc\u20dd\u6a80\u0100;l\u20e2\u20e3\u6a82;\u6a84\u0100;e\u20ea\u20ed\uc000\u22db\ufe00s;\u6a94r;\uc000\ud835\udd24\u0100;g\u0673\u061bmel;\u6137cy;\u4453\u0200;Eaj\u065a\u210c\u210e\u2110;\u6a92;\u6aa5;\u6aa4\u0200Eaes\u211b\u211d\u2129\u2134;\u6269p\u0100;p\u2123\u2124\u6a8arox\xbb\u2124\u0100;q\u212e\u212f\u6a88\u0100;q\u212e\u211bim;\u62e7pf;\uc000\ud835\udd58\u0100ci\u2143\u2146r;\u610am\u0180;el\u066b\u214e\u2150;\u6a8e;\u6a90\u8300>;cdlqr\u05ee\u2160\u216a\u216e\u2173\u2179\u0100ci\u2165\u2167;\u6aa7r;\u6a7aot;\u62d7Par;\u6995uest;\u6a7c\u0280adels\u2184\u216a\u2190\u0656\u219b\u01f0\u2189\0\u218epro\xf8\u209er;\u6978q\u0100lq\u063f\u2196les\xf3\u2088i\xed\u066b\u0100en\u21a3\u21adrtneqq;\uc000\u2269\ufe00\xc5\u21aa\u0500Aabcefkosy\u21c4\u21c7\u21f1\u21f5\u21fa\u2218\u221d\u222f\u2268\u227dr\xf2\u03a0\u0200ilmr\u21d0\u21d4\u21d7\u21dbrs\xf0\u1484f\xbb\u2024il\xf4\u06a9\u0100dr\u21e0\u21e4cy;\u444a\u0180;cw\u08f4\u21eb\u21efir;\u6948;\u61adar;\u610firc;\u4125\u0180alr\u2201\u220e\u2213rts\u0100;u\u2209\u220a\u6665it\xbb\u220alip;\u6026con;\u62b9r;\uc000\ud835\udd25s\u0100ew\u2223\u2229arow;\u6925arow;\u6926\u0280amopr\u223a\u223e\u2243\u225e\u2263rr;\u61fftht;\u623bk\u0100lr\u2249\u2253eftarrow;\u61a9ightarrow;\u61aaf;\uc000\ud835\udd59bar;\u6015\u0180clt\u226f\u2274\u2278r;\uc000\ud835\udcbdas\xe8\u21f4rok;\u4127\u0100bp\u2282\u2287ull;\u6043hen\xbb\u1c5b\u0ae1\u22a3\0\u22aa\0\u22b8\u22c5\u22ce\0\u22d5\u22f3\0\0\u22f8\u2322\u2367\u2362\u237f\0\u2386\u23aa\u23b4cute\u803b\xed\u40ed\u0180;iy\u0771\u22b0\u22b5rc\u803b\xee\u40ee;\u4438\u0100cx\u22bc\u22bfy;\u4435cl\u803b\xa1\u40a1\u0100fr\u039f\u22c9;\uc000\ud835\udd26rave\u803b\xec\u40ec\u0200;ino\u073e\u22dd\u22e9\u22ee\u0100in\u22e2\u22e6nt;\u6a0ct;\u622dfin;\u69dcta;\u6129lig;\u4133\u0180aop\u22fe\u231a\u231d\u0180cgt\u2305\u2308\u2317r;\u412b\u0180elp\u071f\u230f\u2313in\xe5\u078ear\xf4\u0720h;\u4131f;\u62b7ed;\u41b5\u0280;cfot\u04f4\u232c\u2331\u233d\u2341are;\u6105in\u0100;t\u2338\u2339\u621eie;\u69dddo\xf4\u2319\u0280;celp\u0757\u234c\u2350\u235b\u2361al;\u62ba\u0100gr\u2355\u2359er\xf3\u1563\xe3\u234darhk;\u6a17rod;\u6a3c\u0200cgpt\u236f\u2372\u2376\u237by;\u4451on;\u412ff;\uc000\ud835\udd5aa;\u43b9uest\u803b\xbf\u40bf\u0100ci\u238a\u238fr;\uc000\ud835\udcben\u0280;Edsv\u04f4\u239b\u239d\u23a1\u04f3;\u62f9ot;\u62f5\u0100;v\u23a6\u23a7\u62f4;\u62f3\u0100;i\u0777\u23aelde;\u4129\u01eb\u23b8\0\u23bccy;\u4456l\u803b\xef\u40ef\u0300cfmosu\u23cc\u23d7\u23dc\u23e1\u23e7\u23f5\u0100iy\u23d1\u23d5rc;\u4135;\u4439r;\uc000\ud835\udd27ath;\u4237pf;\uc000\ud835\udd5b\u01e3\u23ec\0\u23f1r;\uc000\ud835\udcbfrcy;\u4458kcy;\u4454\u0400acfghjos\u240b\u2416\u2422\u2427\u242d\u2431\u2435\u243bppa\u0100;v\u2413\u2414\u43ba;\u43f0\u0100ey\u241b\u2420dil;\u4137;\u443ar;\uc000\ud835\udd28reen;\u4138cy;\u4445cy;\u445cpf;\uc000\ud835\udd5ccr;\uc000\ud835\udcc0\u0b80ABEHabcdefghjlmnoprstuv\u2470\u2481\u2486\u248d\u2491\u250e\u253d\u255a\u2580\u264e\u265e\u2665\u2679\u267d\u269a\u26b2\u26d8\u275d\u2768\u278b\u27c0\u2801\u2812\u0180art\u2477\u247a\u247cr\xf2\u09c6\xf2\u0395ail;\u691barr;\u690e\u0100;g\u0994\u248b;\u6a8bar;\u6962\u0963\u24a5\0\u24aa\0\u24b1\0\0\0\0\0\u24b5\u24ba\0\u24c6\u24c8\u24cd\0\u24f9ute;\u413amptyv;\u69b4ra\xee\u084cbda;\u43bbg\u0180;dl\u088e\u24c1\u24c3;\u6991\xe5\u088e;\u6a85uo\u803b\xab\u40abr\u0400;bfhlpst\u0899\u24de\u24e6\u24e9\u24eb\u24ee\u24f1\u24f5\u0100;f\u089d\u24e3s;\u691fs;\u691d\xeb\u2252p;\u61abl;\u6939im;\u6973l;\u61a2\u0180;ae\u24ff\u2500\u2504\u6aabil;\u6919\u0100;s\u2509\u250a\u6aad;\uc000\u2aad\ufe00\u0180abr\u2515\u2519\u251drr;\u690crk;\u6772\u0100ak\u2522\u252cc\u0100ek\u2528\u252a;\u407b;\u405b\u0100es\u2531\u2533;\u698bl\u0100du\u2539\u253b;\u698f;\u698d\u0200aeuy\u2546\u254b\u2556\u2558ron;\u413e\u0100di\u2550\u2554il;\u413c\xec\u08b0\xe2\u2529;\u443b\u0200cqrs\u2563\u2566\u256d\u257da;\u6936uo\u0100;r\u0e19\u1746\u0100du\u2572\u2577har;\u6967shar;\u694bh;\u61b2\u0280;fgqs\u258b\u258c\u0989\u25f3\u25ff\u6264t\u0280ahlrt\u2598\u25a4\u25b7\u25c2\u25e8rrow\u0100;t\u0899\u25a1a\xe9\u24f6arpoon\u0100du\u25af\u25b4own\xbb\u045ap\xbb\u0966eftarrows;\u61c7ight\u0180ahs\u25cd\u25d6\u25derrow\u0100;s\u08f4\u08a7arpoon\xf3\u0f98quigarro\xf7\u21f0hreetimes;\u62cb\u0180;qs\u258b\u0993\u25falan\xf4\u09ac\u0280;cdgs\u09ac\u260a\u260d\u261d\u2628c;\u6aa8ot\u0100;o\u2614\u2615\u6a7f\u0100;r\u261a\u261b\u6a81;\u6a83\u0100;e\u2622\u2625\uc000\u22da\ufe00s;\u6a93\u0280adegs\u2633\u2639\u263d\u2649\u264bppro\xf8\u24c6ot;\u62d6q\u0100gq\u2643\u2645\xf4\u0989gt\xf2\u248c\xf4\u099bi\xed\u09b2\u0180ilr\u2655\u08e1\u265asht;\u697c;\uc000\ud835\udd29\u0100;E\u099c\u2663;\u6a91\u0161\u2669\u2676r\u0100du\u25b2\u266e\u0100;l\u0965\u2673;\u696alk;\u6584cy;\u4459\u0280;acht\u0a48\u2688\u268b\u2691\u2696r\xf2\u25c1orne\xf2\u1d08ard;\u696bri;\u65fa\u0100io\u269f\u26a4dot;\u4140ust\u0100;a\u26ac\u26ad\u63b0che\xbb\u26ad\u0200Eaes\u26bb\u26bd\u26c9\u26d4;\u6268p\u0100;p\u26c3\u26c4\u6a89rox\xbb\u26c4\u0100;q\u26ce\u26cf\u6a87\u0100;q\u26ce\u26bbim;\u62e6\u0400abnoptwz\u26e9\u26f4\u26f7\u271a\u272f\u2741\u2747\u2750\u0100nr\u26ee\u26f1g;\u67ecr;\u61fdr\xeb\u08c1g\u0180lmr\u26ff\u270d\u2714eft\u0100ar\u09e6\u2707ight\xe1\u09f2apsto;\u67fcight\xe1\u09fdparrow\u0100lr\u2725\u2729ef\xf4\u24edight;\u61ac\u0180afl\u2736\u2739\u273dr;\u6985;\uc000\ud835\udd5dus;\u6a2dimes;\u6a34\u0161\u274b\u274fst;\u6217\xe1\u134e\u0180;ef\u2757\u2758\u1800\u65cange\xbb\u2758ar\u0100;l\u2764\u2765\u4028t;\u6993\u0280achmt\u2773\u2776\u277c\u2785\u2787r\xf2\u08a8orne\xf2\u1d8car\u0100;d\u0f98\u2783;\u696d;\u600eri;\u62bf\u0300achiqt\u2798\u279d\u0a40\u27a2\u27ae\u27bbquo;\u6039r;\uc000\ud835\udcc1m\u0180;eg\u09b2\u27aa\u27ac;\u6a8d;\u6a8f\u0100bu\u252a\u27b3o\u0100;r\u0e1f\u27b9;\u601arok;\u4142\u8400<;cdhilqr\u082b\u27d2\u2639\u27dc\u27e0\u27e5\u27ea\u27f0\u0100ci\u27d7\u27d9;\u6aa6r;\u6a79re\xe5\u25f2mes;\u62c9arr;\u6976uest;\u6a7b\u0100Pi\u27f5\u27f9ar;\u6996\u0180;ef\u2800\u092d\u181b\u65c3r\u0100du\u2807\u280dshar;\u694ahar;\u6966\u0100en\u2817\u2821rtneqq;\uc000\u2268\ufe00\xc5\u281e\u0700Dacdefhilnopsu\u2840\u2845\u2882\u288e\u2893\u28a0\u28a5\u28a8\u28da\u28e2\u28e4\u0a83\u28f3\u2902Dot;\u623a\u0200clpr\u284e\u2852\u2863\u287dr\u803b\xaf\u40af\u0100et\u2857\u2859;\u6642\u0100;e\u285e\u285f\u6720se\xbb\u285f\u0100;s\u103b\u2868to\u0200;dlu\u103b\u2873\u2877\u287bow\xee\u048cef\xf4\u090f\xf0\u13d1ker;\u65ae\u0100oy\u2887\u288cmma;\u6a29;\u443cash;\u6014asuredangle\xbb\u1626r;\uc000\ud835\udd2ao;\u6127\u0180cdn\u28af\u28b4\u28c9ro\u803b\xb5\u40b5\u0200;acd\u1464\u28bd\u28c0\u28c4s\xf4\u16a7ir;\u6af0ot\u80bb\xb7\u01b5us\u0180;bd\u28d2\u1903\u28d3\u6212\u0100;u\u1d3c\u28d8;\u6a2a\u0163\u28de\u28e1p;\u6adb\xf2\u2212\xf0\u0a81\u0100dp\u28e9\u28eeels;\u62a7f;\uc000\ud835\udd5e\u0100ct\u28f8\u28fdr;\uc000\ud835\udcc2pos\xbb\u159d\u0180;lm\u2909\u290a\u290d\u43bctimap;\u62b8\u0c00GLRVabcdefghijlmoprstuvw\u2942\u2953\u297e\u2989\u2998\u29da\u29e9\u2a15\u2a1a\u2a58\u2a5d\u2a83\u2a95\u2aa4\u2aa8\u2b04\u2b07\u2b44\u2b7f\u2bae\u2c34\u2c67\u2c7c\u2ce9\u0100gt\u2947\u294b;\uc000\u22d9\u0338\u0100;v\u2950\u0bcf\uc000\u226b\u20d2\u0180elt\u295a\u2972\u2976ft\u0100ar\u2961\u2967rrow;\u61cdightarrow;\u61ce;\uc000\u22d8\u0338\u0100;v\u297b\u0c47\uc000\u226a\u20d2ightarrow;\u61cf\u0100Dd\u298e\u2993ash;\u62afash;\u62ae\u0280bcnpt\u29a3\u29a7\u29ac\u29b1\u29ccla\xbb\u02deute;\u4144g;\uc000\u2220\u20d2\u0280;Eiop\u0d84\u29bc\u29c0\u29c5\u29c8;\uc000\u2a70\u0338d;\uc000\u224b\u0338s;\u4149ro\xf8\u0d84ur\u0100;a\u29d3\u29d4\u666el\u0100;s\u29d3\u0b38\u01f3\u29df\0\u29e3p\u80bb\xa0\u0b37mp\u0100;e\u0bf9\u0c00\u0280aeouy\u29f4\u29fe\u2a03\u2a10\u2a13\u01f0\u29f9\0\u29fb;\u6a43on;\u4148dil;\u4146ng\u0100;d\u0d7e\u2a0aot;\uc000\u2a6d\u0338p;\u6a42;\u443dash;\u6013\u0380;Aadqsx\u0b92\u2a29\u2a2d\u2a3b\u2a41\u2a45\u2a50rr;\u61d7r\u0100hr\u2a33\u2a36k;\u6924\u0100;o\u13f2\u13f0ot;\uc000\u2250\u0338ui\xf6\u0b63\u0100ei\u2a4a\u2a4ear;\u6928\xed\u0b98ist\u0100;s\u0ba0\u0b9fr;\uc000\ud835\udd2b\u0200Eest\u0bc5\u2a66\u2a79\u2a7c\u0180;qs\u0bbc\u2a6d\u0be1\u0180;qs\u0bbc\u0bc5\u2a74lan\xf4\u0be2i\xed\u0bea\u0100;r\u0bb6\u2a81\xbb\u0bb7\u0180Aap\u2a8a\u2a8d\u2a91r\xf2\u2971rr;\u61aear;\u6af2\u0180;sv\u0f8d\u2a9c\u0f8c\u0100;d\u2aa1\u2aa2\u62fc;\u62facy;\u445a\u0380AEadest\u2ab7\u2aba\u2abe\u2ac2\u2ac5\u2af6\u2af9r\xf2\u2966;\uc000\u2266\u0338rr;\u619ar;\u6025\u0200;fqs\u0c3b\u2ace\u2ae3\u2aeft\u0100ar\u2ad4\u2ad9rro\xf7\u2ac1ightarro\xf7\u2a90\u0180;qs\u0c3b\u2aba\u2aealan\xf4\u0c55\u0100;s\u0c55\u2af4\xbb\u0c36i\xed\u0c5d\u0100;r\u0c35\u2afei\u0100;e\u0c1a\u0c25i\xe4\u0d90\u0100pt\u2b0c\u2b11f;\uc000\ud835\udd5f\u8180\xac;in\u2b19\u2b1a\u2b36\u40acn\u0200;Edv\u0b89\u2b24\u2b28\u2b2e;\uc000\u22f9\u0338ot;\uc000\u22f5\u0338\u01e1\u0b89\u2b33\u2b35;\u62f7;\u62f6i\u0100;v\u0cb8\u2b3c\u01e1\u0cb8\u2b41\u2b43;\u62fe;\u62fd\u0180aor\u2b4b\u2b63\u2b69r\u0200;ast\u0b7b\u2b55\u2b5a\u2b5flle\xec\u0b7bl;\uc000\u2afd\u20e5;\uc000\u2202\u0338lint;\u6a14\u0180;ce\u0c92\u2b70\u2b73u\xe5\u0ca5\u0100;c\u0c98\u2b78\u0100;e\u0c92\u2b7d\xf1\u0c98\u0200Aait\u2b88\u2b8b\u2b9d\u2ba7r\xf2\u2988rr\u0180;cw\u2b94\u2b95\u2b99\u619b;\uc000\u2933\u0338;\uc000\u219d\u0338ghtarrow\xbb\u2b95ri\u0100;e\u0ccb\u0cd6\u0380chimpqu\u2bbd\u2bcd\u2bd9\u2b04\u0b78\u2be4\u2bef\u0200;cer\u0d32\u2bc6\u0d37\u2bc9u\xe5\u0d45;\uc000\ud835\udcc3ort\u026d\u2b05\0\0\u2bd6ar\xe1\u2b56m\u0100;e\u0d6e\u2bdf\u0100;q\u0d74\u0d73su\u0100bp\u2beb\u2bed\xe5\u0cf8\xe5\u0d0b\u0180bcp\u2bf6\u2c11\u2c19\u0200;Ees\u2bff\u2c00\u0d22\u2c04\u6284;\uc000\u2ac5\u0338et\u0100;e\u0d1b\u2c0bq\u0100;q\u0d23\u2c00c\u0100;e\u0d32\u2c17\xf1\u0d38\u0200;Ees\u2c22\u2c23\u0d5f\u2c27\u6285;\uc000\u2ac6\u0338et\u0100;e\u0d58\u2c2eq\u0100;q\u0d60\u2c23\u0200gilr\u2c3d\u2c3f\u2c45\u2c47\xec\u0bd7lde\u803b\xf1\u40f1\xe7\u0c43iangle\u0100lr\u2c52\u2c5ceft\u0100;e\u0c1a\u2c5a\xf1\u0c26ight\u0100;e\u0ccb\u2c65\xf1\u0cd7\u0100;m\u2c6c\u2c6d\u43bd\u0180;es\u2c74\u2c75\u2c79\u4023ro;\u6116p;\u6007\u0480DHadgilrs\u2c8f\u2c94\u2c99\u2c9e\u2ca3\u2cb0\u2cb6\u2cd3\u2ce3ash;\u62adarr;\u6904p;\uc000\u224d\u20d2ash;\u62ac\u0100et\u2ca8\u2cac;\uc000\u2265\u20d2;\uc000>\u20d2nfin;\u69de\u0180Aet\u2cbd\u2cc1\u2cc5rr;\u6902;\uc000\u2264\u20d2\u0100;r\u2cca\u2ccd\uc000<\u20d2ie;\uc000\u22b4\u20d2\u0100At\u2cd8\u2cdcrr;\u6903rie;\uc000\u22b5\u20d2im;\uc000\u223c\u20d2\u0180Aan\u2cf0\u2cf4\u2d02rr;\u61d6r\u0100hr\u2cfa\u2cfdk;\u6923\u0100;o\u13e7\u13e5ear;\u6927\u1253\u1a95\0\0\0\0\0\0\0\0\0\0\0\0\0\u2d2d\0\u2d38\u2d48\u2d60\u2d65\u2d72\u2d84\u1b07\0\0\u2d8d\u2dab\0\u2dc8\u2dce\0\u2ddc\u2e19\u2e2b\u2e3e\u2e43\u0100cs\u2d31\u1a97ute\u803b\xf3\u40f3\u0100iy\u2d3c\u2d45r\u0100;c\u1a9e\u2d42\u803b\xf4\u40f4;\u443e\u0280abios\u1aa0\u2d52\u2d57\u01c8\u2d5alac;\u4151v;\u6a38old;\u69bclig;\u4153\u0100cr\u2d69\u2d6dir;\u69bf;\uc000\ud835\udd2c\u036f\u2d79\0\0\u2d7c\0\u2d82n;\u42dbave\u803b\xf2\u40f2;\u69c1\u0100bm\u2d88\u0df4ar;\u69b5\u0200acit\u2d95\u2d98\u2da5\u2da8r\xf2\u1a80\u0100ir\u2d9d\u2da0r;\u69beoss;\u69bbn\xe5\u0e52;\u69c0\u0180aei\u2db1\u2db5\u2db9cr;\u414dga;\u43c9\u0180cdn\u2dc0\u2dc5\u01cdron;\u43bf;\u69b6pf;\uc000\ud835\udd60\u0180ael\u2dd4\u2dd7\u01d2r;\u69b7rp;\u69b9\u0380;adiosv\u2dea\u2deb\u2dee\u2e08\u2e0d\u2e10\u2e16\u6228r\xf2\u1a86\u0200;efm\u2df7\u2df8\u2e02\u2e05\u6a5dr\u0100;o\u2dfe\u2dff\u6134f\xbb\u2dff\u803b\xaa\u40aa\u803b\xba\u40bagof;\u62b6r;\u6a56lope;\u6a57;\u6a5b\u0180clo\u2e1f\u2e21\u2e27\xf2\u2e01ash\u803b\xf8\u40f8l;\u6298i\u016c\u2e2f\u2e34de\u803b\xf5\u40f5es\u0100;a\u01db\u2e3as;\u6a36ml\u803b\xf6\u40f6bar;\u633d\u0ae1\u2e5e\0\u2e7d\0\u2e80\u2e9d\0\u2ea2\u2eb9\0\0\u2ecb\u0e9c\0\u2f13\0\0\u2f2b\u2fbc\0\u2fc8r\u0200;ast\u0403\u2e67\u2e72\u0e85\u8100\xb6;l\u2e6d\u2e6e\u40b6le\xec\u0403\u0269\u2e78\0\0\u2e7bm;\u6af3;\u6afdy;\u443fr\u0280cimpt\u2e8b\u2e8f\u2e93\u1865\u2e97nt;\u4025od;\u402eil;\u6030enk;\u6031r;\uc000\ud835\udd2d\u0180imo\u2ea8\u2eb0\u2eb4\u0100;v\u2ead\u2eae\u43c6;\u43d5ma\xf4\u0a76ne;\u660e\u0180;tv\u2ebf\u2ec0\u2ec8\u43c0chfork\xbb\u1ffd;\u43d6\u0100au\u2ecf\u2edfn\u0100ck\u2ed5\u2eddk\u0100;h\u21f4\u2edb;\u610e\xf6\u21f4s\u0480;abcdemst\u2ef3\u2ef4\u1908\u2ef9\u2efd\u2f04\u2f06\u2f0a\u2f0e\u402bcir;\u6a23ir;\u6a22\u0100ou\u1d40\u2f02;\u6a25;\u6a72n\u80bb\xb1\u0e9dim;\u6a26wo;\u6a27\u0180ipu\u2f19\u2f20\u2f25ntint;\u6a15f;\uc000\ud835\udd61nd\u803b\xa3\u40a3\u0500;Eaceinosu\u0ec8\u2f3f\u2f41\u2f44\u2f47\u2f81\u2f89\u2f92\u2f7e\u2fb6;\u6ab3p;\u6ab7u\xe5\u0ed9\u0100;c\u0ece\u2f4c\u0300;acens\u0ec8\u2f59\u2f5f\u2f66\u2f68\u2f7eppro\xf8\u2f43urlye\xf1\u0ed9\xf1\u0ece\u0180aes\u2f6f\u2f76\u2f7approx;\u6ab9qq;\u6ab5im;\u62e8i\xed\u0edfme\u0100;s\u2f88\u0eae\u6032\u0180Eas\u2f78\u2f90\u2f7a\xf0\u2f75\u0180dfp\u0eec\u2f99\u2faf\u0180als\u2fa0\u2fa5\u2faalar;\u632eine;\u6312urf;\u6313\u0100;t\u0efb\u2fb4\xef\u0efbrel;\u62b0\u0100ci\u2fc0\u2fc5r;\uc000\ud835\udcc5;\u43c8ncsp;\u6008\u0300fiopsu\u2fda\u22e2\u2fdf\u2fe5\u2feb\u2ff1r;\uc000\ud835\udd2epf;\uc000\ud835\udd62rime;\u6057cr;\uc000\ud835\udcc6\u0180aeo\u2ff8\u3009\u3013t\u0100ei\u2ffe\u3005rnion\xf3\u06b0nt;\u6a16st\u0100;e\u3010\u3011\u403f\xf1\u1f19\xf4\u0f14\u0a80ABHabcdefhilmnoprstux\u3040\u3051\u3055\u3059\u30e0\u310e\u312b\u3147\u3162\u3172\u318e\u3206\u3215\u3224\u3229\u3258\u326e\u3272\u3290\u32b0\u32b7\u0180art\u3047\u304a\u304cr\xf2\u10b3\xf2\u03ddail;\u691car\xf2\u1c65ar;\u6964\u0380cdenqrt\u3068\u3075\u3078\u307f\u308f\u3094\u30cc\u0100eu\u306d\u3071;\uc000\u223d\u0331te;\u4155i\xe3\u116emptyv;\u69b3g\u0200;del\u0fd1\u3089\u308b\u308d;\u6992;\u69a5\xe5\u0fd1uo\u803b\xbb\u40bbr\u0580;abcfhlpstw\u0fdc\u30ac\u30af\u30b7\u30b9\u30bc\u30be\u30c0\u30c3\u30c7\u30cap;\u6975\u0100;f\u0fe0\u30b4s;\u6920;\u6933s;\u691e\xeb\u225d\xf0\u272el;\u6945im;\u6974l;\u61a3;\u619d\u0100ai\u30d1\u30d5il;\u691ao\u0100;n\u30db\u30dc\u6236al\xf3\u0f1e\u0180abr\u30e7\u30ea\u30eer\xf2\u17e5rk;\u6773\u0100ak\u30f3\u30fdc\u0100ek\u30f9\u30fb;\u407d;\u405d\u0100es\u3102\u3104;\u698cl\u0100du\u310a\u310c;\u698e;\u6990\u0200aeuy\u3117\u311c\u3127\u3129ron;\u4159\u0100di\u3121\u3125il;\u4157\xec\u0ff2\xe2\u30fa;\u4440\u0200clqs\u3134\u3137\u313d\u3144a;\u6937dhar;\u6969uo\u0100;r\u020e\u020dh;\u61b3\u0180acg\u314e\u315f\u0f44l\u0200;ips\u0f78\u3158\u315b\u109cn\xe5\u10bbar\xf4\u0fa9t;\u65ad\u0180ilr\u3169\u1023\u316esht;\u697d;\uc000\ud835\udd2f\u0100ao\u3177\u3186r\u0100du\u317d\u317f\xbb\u047b\u0100;l\u1091\u3184;\u696c\u0100;v\u318b\u318c\u43c1;\u43f1\u0180gns\u3195\u31f9\u31fcht\u0300ahlrst\u31a4\u31b0\u31c2\u31d8\u31e4\u31eerrow\u0100;t\u0fdc\u31ada\xe9\u30c8arpoon\u0100du\u31bb\u31bfow\xee\u317ep\xbb\u1092eft\u0100ah\u31ca\u31d0rrow\xf3\u0feaarpoon\xf3\u0551ightarrows;\u61c9quigarro\xf7\u30cbhreetimes;\u62ccg;\u42daingdotse\xf1\u1f32\u0180ahm\u320d\u3210\u3213r\xf2\u0feaa\xf2\u0551;\u600foust\u0100;a\u321e\u321f\u63b1che\xbb\u321fmid;\u6aee\u0200abpt\u3232\u323d\u3240\u3252\u0100nr\u3237\u323ag;\u67edr;\u61fer\xeb\u1003\u0180afl\u3247\u324a\u324er;\u6986;\uc000\ud835\udd63us;\u6a2eimes;\u6a35\u0100ap\u325d\u3267r\u0100;g\u3263\u3264\u4029t;\u6994olint;\u6a12ar\xf2\u31e3\u0200achq\u327b\u3280\u10bc\u3285quo;\u603ar;\uc000\ud835\udcc7\u0100bu\u30fb\u328ao\u0100;r\u0214\u0213\u0180hir\u3297\u329b\u32a0re\xe5\u31f8mes;\u62cai\u0200;efl\u32aa\u1059\u1821\u32ab\u65b9tri;\u69celuhar;\u6968;\u611e\u0d61\u32d5\u32db\u32df\u332c\u3338\u3371\0\u337a\u33a4\0\0\u33ec\u33f0\0\u3428\u3448\u345a\u34ad\u34b1\u34ca\u34f1\0\u3616\0\0\u3633cute;\u415bqu\xef\u27ba\u0500;Eaceinpsy\u11ed\u32f3\u32f5\u32ff\u3302\u330b\u330f\u331f\u3326\u3329;\u6ab4\u01f0\u32fa\0\u32fc;\u6ab8on;\u4161u\xe5\u11fe\u0100;d\u11f3\u3307il;\u415frc;\u415d\u0180Eas\u3316\u3318\u331b;\u6ab6p;\u6abaim;\u62e9olint;\u6a13i\xed\u1204;\u4441ot\u0180;be\u3334\u1d47\u3335\u62c5;\u6a66\u0380Aacmstx\u3346\u334a\u3357\u335b\u335e\u3363\u336drr;\u61d8r\u0100hr\u3350\u3352\xeb\u2228\u0100;o\u0a36\u0a34t\u803b\xa7\u40a7i;\u403bwar;\u6929m\u0100in\u3369\xf0nu\xf3\xf1t;\u6736r\u0100;o\u3376\u2055\uc000\ud835\udd30\u0200acoy\u3382\u3386\u3391\u33a0rp;\u666f\u0100hy\u338b\u338fcy;\u4449;\u4448rt\u026d\u3399\0\0\u339ci\xe4\u1464ara\xec\u2e6f\u803b\xad\u40ad\u0100gm\u33a8\u33b4ma\u0180;fv\u33b1\u33b2\u33b2\u43c3;\u43c2\u0400;deglnpr\u12ab\u33c5\u33c9\u33ce\u33d6\u33de\u33e1\u33e6ot;\u6a6a\u0100;q\u12b1\u12b0\u0100;E\u33d3\u33d4\u6a9e;\u6aa0\u0100;E\u33db\u33dc\u6a9d;\u6a9fe;\u6246lus;\u6a24arr;\u6972ar\xf2\u113d\u0200aeit\u33f8\u3408\u340f\u3417\u0100ls\u33fd\u3404lsetm\xe9\u336ahp;\u6a33parsl;\u69e4\u0100dl\u1463\u3414e;\u6323\u0100;e\u341c\u341d\u6aaa\u0100;s\u3422\u3423\u6aac;\uc000\u2aac\ufe00\u0180flp\u342e\u3433\u3442tcy;\u444c\u0100;b\u3438\u3439\u402f\u0100;a\u343e\u343f\u69c4r;\u633ff;\uc000\ud835\udd64a\u0100dr\u344d\u0402es\u0100;u\u3454\u3455\u6660it\xbb\u3455\u0180csu\u3460\u3479\u349f\u0100au\u3465\u346fp\u0100;s\u1188\u346b;\uc000\u2293\ufe00p\u0100;s\u11b4\u3475;\uc000\u2294\ufe00u\u0100bp\u347f\u348f\u0180;es\u1197\u119c\u3486et\u0100;e\u1197\u348d\xf1\u119d\u0180;es\u11a8\u11ad\u3496et\u0100;e\u11a8\u349d\xf1\u11ae\u0180;af\u117b\u34a6\u05b0r\u0165\u34ab\u05b1\xbb\u117car\xf2\u1148\u0200cemt\u34b9\u34be\u34c2\u34c5r;\uc000\ud835\udcc8tm\xee\xf1i\xec\u3415ar\xe6\u11be\u0100ar\u34ce\u34d5r\u0100;f\u34d4\u17bf\u6606\u0100an\u34da\u34edight\u0100ep\u34e3\u34eapsilo\xee\u1ee0h\xe9\u2eafs\xbb\u2852\u0280bcmnp\u34fb\u355e\u1209\u358b\u358e\u0480;Edemnprs\u350e\u350f\u3511\u3515\u351e\u3523\u352c\u3531\u3536\u6282;\u6ac5ot;\u6abd\u0100;d\u11da\u351aot;\u6ac3ult;\u6ac1\u0100Ee\u3528\u352a;\u6acb;\u628alus;\u6abfarr;\u6979\u0180eiu\u353d\u3552\u3555t\u0180;en\u350e\u3545\u354bq\u0100;q\u11da\u350feq\u0100;q\u352b\u3528m;\u6ac7\u0100bp\u355a\u355c;\u6ad5;\u6ad3c\u0300;acens\u11ed\u356c\u3572\u3579\u357b\u3326ppro\xf8\u32faurlye\xf1\u11fe\xf1\u11f3\u0180aes\u3582\u3588\u331bppro\xf8\u331aq\xf1\u3317g;\u666a\u0680123;Edehlmnps\u35a9\u35ac\u35af\u121c\u35b2\u35b4\u35c0\u35c9\u35d5\u35da\u35df\u35e8\u35ed\u803b\xb9\u40b9\u803b\xb2\u40b2\u803b\xb3\u40b3;\u6ac6\u0100os\u35b9\u35bct;\u6abeub;\u6ad8\u0100;d\u1222\u35c5ot;\u6ac4s\u0100ou\u35cf\u35d2l;\u67c9b;\u6ad7arr;\u697bult;\u6ac2\u0100Ee\u35e4\u35e6;\u6acc;\u628blus;\u6ac0\u0180eiu\u35f4\u3609\u360ct\u0180;en\u121c\u35fc\u3602q\u0100;q\u1222\u35b2eq\u0100;q\u35e7\u35e4m;\u6ac8\u0100bp\u3611\u3613;\u6ad4;\u6ad6\u0180Aan\u361c\u3620\u362drr;\u61d9r\u0100hr\u3626\u3628\xeb\u222e\u0100;o\u0a2b\u0a29war;\u692alig\u803b\xdf\u40df\u0be1\u3651\u365d\u3660\u12ce\u3673\u3679\0\u367e\u36c2\0\0\0\0\0\u36db\u3703\0\u3709\u376c\0\0\0\u3787\u0272\u3656\0\0\u365bget;\u6316;\u43c4r\xeb\u0e5f\u0180aey\u3666\u366b\u3670ron;\u4165dil;\u4163;\u4442lrec;\u6315r;\uc000\ud835\udd31\u0200eiko\u3686\u369d\u36b5\u36bc\u01f2\u368b\0\u3691e\u01004f\u1284\u1281a\u0180;sv\u3698\u3699\u369b\u43b8ym;\u43d1\u0100cn\u36a2\u36b2k\u0100as\u36a8\u36aeppro\xf8\u12c1im\xbb\u12acs\xf0\u129e\u0100as\u36ba\u36ae\xf0\u12c1rn\u803b\xfe\u40fe\u01ec\u031f\u36c6\u22e7es\u8180\xd7;bd\u36cf\u36d0\u36d8\u40d7\u0100;a\u190f\u36d5r;\u6a31;\u6a30\u0180eps\u36e1\u36e3\u3700\xe1\u2a4d\u0200;bcf\u0486\u36ec\u36f0\u36f4ot;\u6336ir;\u6af1\u0100;o\u36f9\u36fc\uc000\ud835\udd65rk;\u6ada\xe1\u3362rime;\u6034\u0180aip\u370f\u3712\u3764d\xe5\u1248\u0380adempst\u3721\u374d\u3740\u3751\u3757\u375c\u375fngle\u0280;dlqr\u3730\u3731\u3736\u3740\u3742\u65b5own\xbb\u1dbbeft\u0100;e\u2800\u373e\xf1\u092e;\u625cight\u0100;e\u32aa\u374b\xf1\u105aot;\u65ecinus;\u6a3alus;\u6a39b;\u69cdime;\u6a3bezium;\u63e2\u0180cht\u3772\u377d\u3781\u0100ry\u3777\u377b;\uc000\ud835\udcc9;\u4446cy;\u445brok;\u4167\u0100io\u378b\u378ex\xf4\u1777head\u0100lr\u3797\u37a0eftarro\xf7\u084fightarrow\xbb\u0f5d\u0900AHabcdfghlmoprstuw\u37d0\u37d3\u37d7\u37e4\u37f0\u37fc\u380e\u381c\u3823\u3834\u3851\u385d\u386b\u38a9\u38cc\u38d2\u38ea\u38f6r\xf2\u03edar;\u6963\u0100cr\u37dc\u37e2ute\u803b\xfa\u40fa\xf2\u1150r\u01e3\u37ea\0\u37edy;\u445eve;\u416d\u0100iy\u37f5\u37farc\u803b\xfb\u40fb;\u4443\u0180abh\u3803\u3806\u380br\xf2\u13adlac;\u4171a\xf2\u13c3\u0100ir\u3813\u3818sht;\u697e;\uc000\ud835\udd32rave\u803b\xf9\u40f9\u0161\u3827\u3831r\u0100lr\u382c\u382e\xbb\u0957\xbb\u1083lk;\u6580\u0100ct\u3839\u384d\u026f\u383f\0\0\u384arn\u0100;e\u3845\u3846\u631cr\xbb\u3846op;\u630fri;\u65f8\u0100al\u3856\u385acr;\u416b\u80bb\xa8\u0349\u0100gp\u3862\u3866on;\u4173f;\uc000\ud835\udd66\u0300adhlsu\u114b\u3878\u387d\u1372\u3891\u38a0own\xe1\u13b3arpoon\u0100lr\u3888\u388cef\xf4\u382digh\xf4\u382fi\u0180;hl\u3899\u389a\u389c\u43c5\xbb\u13faon\xbb\u389aparrows;\u61c8\u0180cit\u38b0\u38c4\u38c8\u026f\u38b6\0\0\u38c1rn\u0100;e\u38bc\u38bd\u631dr\xbb\u38bdop;\u630eng;\u416fri;\u65f9cr;\uc000\ud835\udcca\u0180dir\u38d9\u38dd\u38e2ot;\u62f0lde;\u4169i\u0100;f\u3730\u38e8\xbb\u1813\u0100am\u38ef\u38f2r\xf2\u38a8l\u803b\xfc\u40fcangle;\u69a7\u0780ABDacdeflnoprsz\u391c\u391f\u3929\u392d\u39b5\u39b8\u39bd\u39df\u39e4\u39e8\u39f3\u39f9\u39fd\u3a01\u3a20r\xf2\u03f7ar\u0100;v\u3926\u3927\u6ae8;\u6ae9as\xe8\u03e1\u0100nr\u3932\u3937grt;\u699c\u0380eknprst\u34e3\u3946\u394b\u3952\u395d\u3964\u3996app\xe1\u2415othin\xe7\u1e96\u0180hir\u34eb\u2ec8\u3959op\xf4\u2fb5\u0100;h\u13b7\u3962\xef\u318d\u0100iu\u3969\u396dgm\xe1\u33b3\u0100bp\u3972\u3984setneq\u0100;q\u397d\u3980\uc000\u228a\ufe00;\uc000\u2acb\ufe00setneq\u0100;q\u398f\u3992\uc000\u228b\ufe00;\uc000\u2acc\ufe00\u0100hr\u399b\u399fet\xe1\u369ciangle\u0100lr\u39aa\u39afeft\xbb\u0925ight\xbb\u1051y;\u4432ash\xbb\u1036\u0180elr\u39c4\u39d2\u39d7\u0180;be\u2dea\u39cb\u39cfar;\u62bbq;\u625alip;\u62ee\u0100bt\u39dc\u1468a\xf2\u1469r;\uc000\ud835\udd33tr\xe9\u39aesu\u0100bp\u39ef\u39f1\xbb\u0d1c\xbb\u0d59pf;\uc000\ud835\udd67ro\xf0\u0efbtr\xe9\u39b4\u0100cu\u3a06\u3a0br;\uc000\ud835\udccb\u0100bp\u3a10\u3a18n\u0100Ee\u3980\u3a16\xbb\u397en\u0100Ee\u3992\u3a1e\xbb\u3990igzag;\u699a\u0380cefoprs\u3a36\u3a3b\u3a56\u3a5b\u3a54\u3a61\u3a6airc;\u4175\u0100di\u3a40\u3a51\u0100bg\u3a45\u3a49ar;\u6a5fe\u0100;q\u15fa\u3a4f;\u6259erp;\u6118r;\uc000\ud835\udd34pf;\uc000\ud835\udd68\u0100;e\u1479\u3a66at\xe8\u1479cr;\uc000\ud835\udccc\u0ae3\u178e\u3a87\0\u3a8b\0\u3a90\u3a9b\0\0\u3a9d\u3aa8\u3aab\u3aaf\0\0\u3ac3\u3ace\0\u3ad8\u17dc\u17dftr\xe9\u17d1r;\uc000\ud835\udd35\u0100Aa\u3a94\u3a97r\xf2\u03c3r\xf2\u09f6;\u43be\u0100Aa\u3aa1\u3aa4r\xf2\u03b8r\xf2\u09eba\xf0\u2713is;\u62fb\u0180dpt\u17a4\u3ab5\u3abe\u0100fl\u3aba\u17a9;\uc000\ud835\udd69im\xe5\u17b2\u0100Aa\u3ac7\u3acar\xf2\u03cer\xf2\u0a01\u0100cq\u3ad2\u17b8r;\uc000\ud835\udccd\u0100pt\u17d6\u3adcr\xe9\u17d4\u0400acefiosu\u3af0\u3afd\u3b08\u3b0c\u3b11\u3b15\u3b1b\u3b21c\u0100uy\u3af6\u3afbte\u803b\xfd\u40fd;\u444f\u0100iy\u3b02\u3b06rc;\u4177;\u444bn\u803b\xa5\u40a5r;\uc000\ud835\udd36cy;\u4457pf;\uc000\ud835\udd6acr;\uc000\ud835\udcce\u0100cm\u3b26\u3b29y;\u444el\u803b\xff\u40ff\u0500acdefhiosw\u3b42\u3b48\u3b54\u3b58\u3b64\u3b69\u3b6d\u3b74\u3b7a\u3b80cute;\u417a\u0100ay\u3b4d\u3b52ron;\u417e;\u4437ot;\u417c\u0100et\u3b5d\u3b61tr\xe6\u155fa;\u43b6r;\uc000\ud835\udd37cy;\u4436grarr;\u61ddpf;\uc000\ud835\udd6bcr;\uc000\ud835\udccf\u0100jn\u3b85\u3b87;\u600dj;\u600c"
	    .split("")
	    .map((c) => c.charCodeAt(0)));

	// Generated using scripts/write-decode-map.ts
	var xmlDecodeTree = new Uint16Array(
	// prettier-ignore
	"\u0200aglq\t\x15\x18\x1b\u026d\x0f\0\0\x12p;\u4026os;\u4027t;\u403et;\u403cuot;\u4022"
	    .split("")
	    .map((c) => c.charCodeAt(0)));

	// Adapted from https://github.com/mathiasbynens/he/blob/36afe179392226cf1b6ccdb16ebbb7a5a844d93a/src/he.js#L106-L134
	var _a;
	const decodeMap = new Map([
	    [0, 65533],
	    // C1 Unicode control character reference replacements
	    [128, 8364],
	    [130, 8218],
	    [131, 402],
	    [132, 8222],
	    [133, 8230],
	    [134, 8224],
	    [135, 8225],
	    [136, 710],
	    [137, 8240],
	    [138, 352],
	    [139, 8249],
	    [140, 338],
	    [142, 381],
	    [145, 8216],
	    [146, 8217],
	    [147, 8220],
	    [148, 8221],
	    [149, 8226],
	    [150, 8211],
	    [151, 8212],
	    [152, 732],
	    [153, 8482],
	    [154, 353],
	    [155, 8250],
	    [156, 339],
	    [158, 382],
	    [159, 376],
	]);
	/**
	 * Polyfill for `String.fromCodePoint`. It is used to create a string from a Unicode code point.
	 */
	const fromCodePoint = 
	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, node/no-unsupported-features/es-builtins
	(_a = String.fromCodePoint) !== null && _a !== void 0 ? _a : function (codePoint) {
	    let output = "";
	    if (codePoint > 0xffff) {
	        codePoint -= 0x10000;
	        output += String.fromCharCode(((codePoint >>> 10) & 0x3ff) | 0xd800);
	        codePoint = 0xdc00 | (codePoint & 0x3ff);
	    }
	    output += String.fromCharCode(codePoint);
	    return output;
	};
	/**
	 * Replace the given code point with a replacement character if it is a
	 * surrogate or is outside the valid range. Otherwise return the code
	 * point unchanged.
	 */
	function replaceCodePoint(codePoint) {
	    var _a;
	    if ((codePoint >= 0xd800 && codePoint <= 0xdfff) || codePoint > 0x10ffff) {
	        return 0xfffd;
	    }
	    return (_a = decodeMap.get(codePoint)) !== null && _a !== void 0 ? _a : codePoint;
	}

	var CharCodes;
	(function (CharCodes) {
	    CharCodes[CharCodes["NUM"] = 35] = "NUM";
	    CharCodes[CharCodes["SEMI"] = 59] = "SEMI";
	    CharCodes[CharCodes["EQUALS"] = 61] = "EQUALS";
	    CharCodes[CharCodes["ZERO"] = 48] = "ZERO";
	    CharCodes[CharCodes["NINE"] = 57] = "NINE";
	    CharCodes[CharCodes["LOWER_A"] = 97] = "LOWER_A";
	    CharCodes[CharCodes["LOWER_F"] = 102] = "LOWER_F";
	    CharCodes[CharCodes["LOWER_X"] = 120] = "LOWER_X";
	    CharCodes[CharCodes["LOWER_Z"] = 122] = "LOWER_Z";
	    CharCodes[CharCodes["UPPER_A"] = 65] = "UPPER_A";
	    CharCodes[CharCodes["UPPER_F"] = 70] = "UPPER_F";
	    CharCodes[CharCodes["UPPER_Z"] = 90] = "UPPER_Z";
	})(CharCodes || (CharCodes = {}));
	/** Bit that needs to be set to convert an upper case ASCII character to lower case */
	const TO_LOWER_BIT = 0b100000;
	var BinTrieFlags;
	(function (BinTrieFlags) {
	    BinTrieFlags[BinTrieFlags["VALUE_LENGTH"] = 49152] = "VALUE_LENGTH";
	    BinTrieFlags[BinTrieFlags["BRANCH_LENGTH"] = 16256] = "BRANCH_LENGTH";
	    BinTrieFlags[BinTrieFlags["JUMP_TABLE"] = 127] = "JUMP_TABLE";
	})(BinTrieFlags || (BinTrieFlags = {}));
	function isNumber(code) {
	    return code >= CharCodes.ZERO && code <= CharCodes.NINE;
	}
	function isHexadecimalCharacter(code) {
	    return ((code >= CharCodes.UPPER_A && code <= CharCodes.UPPER_F) ||
	        (code >= CharCodes.LOWER_A && code <= CharCodes.LOWER_F));
	}
	function isAsciiAlphaNumeric(code) {
	    return ((code >= CharCodes.UPPER_A && code <= CharCodes.UPPER_Z) ||
	        (code >= CharCodes.LOWER_A && code <= CharCodes.LOWER_Z) ||
	        isNumber(code));
	}
	/**
	 * Checks if the given character is a valid end character for an entity in an attribute.
	 *
	 * Attribute values that aren't terminated properly aren't parsed, and shouldn't lead to a parser error.
	 * See the example in https://html.spec.whatwg.org/multipage/parsing.html#named-character-reference-state
	 */
	function isEntityInAttributeInvalidEnd(code) {
	    return code === CharCodes.EQUALS || isAsciiAlphaNumeric(code);
	}
	var EntityDecoderState;
	(function (EntityDecoderState) {
	    EntityDecoderState[EntityDecoderState["EntityStart"] = 0] = "EntityStart";
	    EntityDecoderState[EntityDecoderState["NumericStart"] = 1] = "NumericStart";
	    EntityDecoderState[EntityDecoderState["NumericDecimal"] = 2] = "NumericDecimal";
	    EntityDecoderState[EntityDecoderState["NumericHex"] = 3] = "NumericHex";
	    EntityDecoderState[EntityDecoderState["NamedEntity"] = 4] = "NamedEntity";
	})(EntityDecoderState || (EntityDecoderState = {}));
	var DecodingMode;
	(function (DecodingMode) {
	    /** Entities in text nodes that can end with any character. */
	    DecodingMode[DecodingMode["Legacy"] = 0] = "Legacy";
	    /** Only allow entities terminated with a semicolon. */
	    DecodingMode[DecodingMode["Strict"] = 1] = "Strict";
	    /** Entities in attributes have limitations on ending characters. */
	    DecodingMode[DecodingMode["Attribute"] = 2] = "Attribute";
	})(DecodingMode || (DecodingMode = {}));
	/**
	 * Token decoder with support of writing partial entities.
	 */
	class EntityDecoder {
	    constructor(
	    /** The tree used to decode entities. */
	    decodeTree, 
	    /**
	     * The function that is called when a codepoint is decoded.
	     *
	     * For multi-byte named entities, this will be called multiple times,
	     * with the second codepoint, and the same `consumed` value.
	     *
	     * @param codepoint The decoded codepoint.
	     * @param consumed The number of bytes consumed by the decoder.
	     */
	    emitCodePoint, 
	    /** An object that is used to produce errors. */
	    errors) {
	        this.decodeTree = decodeTree;
	        this.emitCodePoint = emitCodePoint;
	        this.errors = errors;
	        /** The current state of the decoder. */
	        this.state = EntityDecoderState.EntityStart;
	        /** Characters that were consumed while parsing an entity. */
	        this.consumed = 1;
	        /**
	         * The result of the entity.
	         *
	         * Either the result index of a numeric entity, or the codepoint of a
	         * numeric entity.
	         */
	        this.result = 0;
	        /** The current index in the decode tree. */
	        this.treeIndex = 0;
	        /** The number of characters that were consumed in excess. */
	        this.excess = 1;
	        /** The mode in which the decoder is operating. */
	        this.decodeMode = DecodingMode.Strict;
	    }
	    /** Resets the instance to make it reusable. */
	    startEntity(decodeMode) {
	        this.decodeMode = decodeMode;
	        this.state = EntityDecoderState.EntityStart;
	        this.result = 0;
	        this.treeIndex = 0;
	        this.excess = 1;
	        this.consumed = 1;
	    }
	    /**
	     * Write an entity to the decoder. This can be called multiple times with partial entities.
	     * If the entity is incomplete, the decoder will return -1.
	     *
	     * Mirrors the implementation of `getDecoder`, but with the ability to stop decoding if the
	     * entity is incomplete, and resume when the next string is written.
	     *
	     * @param string The string containing the entity (or a continuation of the entity).
	     * @param offset The offset at which the entity begins. Should be 0 if this is not the first call.
	     * @returns The number of characters that were consumed, or -1 if the entity is incomplete.
	     */
	    write(str, offset) {
	        switch (this.state) {
	            case EntityDecoderState.EntityStart: {
	                if (str.charCodeAt(offset) === CharCodes.NUM) {
	                    this.state = EntityDecoderState.NumericStart;
	                    this.consumed += 1;
	                    return this.stateNumericStart(str, offset + 1);
	                }
	                this.state = EntityDecoderState.NamedEntity;
	                return this.stateNamedEntity(str, offset);
	            }
	            case EntityDecoderState.NumericStart: {
	                return this.stateNumericStart(str, offset);
	            }
	            case EntityDecoderState.NumericDecimal: {
	                return this.stateNumericDecimal(str, offset);
	            }
	            case EntityDecoderState.NumericHex: {
	                return this.stateNumericHex(str, offset);
	            }
	            case EntityDecoderState.NamedEntity: {
	                return this.stateNamedEntity(str, offset);
	            }
	        }
	    }
	    /**
	     * Switches between the numeric decimal and hexadecimal states.
	     *
	     * Equivalent to the `Numeric character reference state` in the HTML spec.
	     *
	     * @param str The string containing the entity (or a continuation of the entity).
	     * @param offset The current offset.
	     * @returns The number of characters that were consumed, or -1 if the entity is incomplete.
	     */
	    stateNumericStart(str, offset) {
	        if (offset >= str.length) {
	            return -1;
	        }
	        if ((str.charCodeAt(offset) | TO_LOWER_BIT) === CharCodes.LOWER_X) {
	            this.state = EntityDecoderState.NumericHex;
	            this.consumed += 1;
	            return this.stateNumericHex(str, offset + 1);
	        }
	        this.state = EntityDecoderState.NumericDecimal;
	        return this.stateNumericDecimal(str, offset);
	    }
	    addToNumericResult(str, start, end, base) {
	        if (start !== end) {
	            const digitCount = end - start;
	            this.result =
	                this.result * Math.pow(base, digitCount) +
	                    parseInt(str.substr(start, digitCount), base);
	            this.consumed += digitCount;
	        }
	    }
	    /**
	     * Parses a hexadecimal numeric entity.
	     *
	     * Equivalent to the `Hexademical character reference state` in the HTML spec.
	     *
	     * @param str The string containing the entity (or a continuation of the entity).
	     * @param offset The current offset.
	     * @returns The number of characters that were consumed, or -1 if the entity is incomplete.
	     */
	    stateNumericHex(str, offset) {
	        const startIdx = offset;
	        while (offset < str.length) {
	            const char = str.charCodeAt(offset);
	            if (isNumber(char) || isHexadecimalCharacter(char)) {
	                offset += 1;
	            }
	            else {
	                this.addToNumericResult(str, startIdx, offset, 16);
	                return this.emitNumericEntity(char, 3);
	            }
	        }
	        this.addToNumericResult(str, startIdx, offset, 16);
	        return -1;
	    }
	    /**
	     * Parses a decimal numeric entity.
	     *
	     * Equivalent to the `Decimal character reference state` in the HTML spec.
	     *
	     * @param str The string containing the entity (or a continuation of the entity).
	     * @param offset The current offset.
	     * @returns The number of characters that were consumed, or -1 if the entity is incomplete.
	     */
	    stateNumericDecimal(str, offset) {
	        const startIdx = offset;
	        while (offset < str.length) {
	            const char = str.charCodeAt(offset);
	            if (isNumber(char)) {
	                offset += 1;
	            }
	            else {
	                this.addToNumericResult(str, startIdx, offset, 10);
	                return this.emitNumericEntity(char, 2);
	            }
	        }
	        this.addToNumericResult(str, startIdx, offset, 10);
	        return -1;
	    }
	    /**
	     * Validate and emit a numeric entity.
	     *
	     * Implements the logic from the `Hexademical character reference start
	     * state` and `Numeric character reference end state` in the HTML spec.
	     *
	     * @param lastCp The last code point of the entity. Used to see if the
	     *               entity was terminated with a semicolon.
	     * @param expectedLength The minimum number of characters that should be
	     *                       consumed. Used to validate that at least one digit
	     *                       was consumed.
	     * @returns The number of characters that were consumed.
	     */
	    emitNumericEntity(lastCp, expectedLength) {
	        var _a;
	        // Ensure we consumed at least one digit.
	        if (this.consumed <= expectedLength) {
	            (_a = this.errors) === null || _a === void 0 ? void 0 : _a.absenceOfDigitsInNumericCharacterReference(this.consumed);
	            return 0;
	        }
	        // Figure out if this is a legit end of the entity
	        if (lastCp === CharCodes.SEMI) {
	            this.consumed += 1;
	        }
	        else if (this.decodeMode === DecodingMode.Strict) {
	            return 0;
	        }
	        this.emitCodePoint(replaceCodePoint(this.result), this.consumed);
	        if (this.errors) {
	            if (lastCp !== CharCodes.SEMI) {
	                this.errors.missingSemicolonAfterCharacterReference();
	            }
	            this.errors.validateNumericCharacterReference(this.result);
	        }
	        return this.consumed;
	    }
	    /**
	     * Parses a named entity.
	     *
	     * Equivalent to the `Named character reference state` in the HTML spec.
	     *
	     * @param str The string containing the entity (or a continuation of the entity).
	     * @param offset The current offset.
	     * @returns The number of characters that were consumed, or -1 if the entity is incomplete.
	     */
	    stateNamedEntity(str, offset) {
	        const { decodeTree } = this;
	        let current = decodeTree[this.treeIndex];
	        // The mask is the number of bytes of the value, including the current byte.
	        let valueLength = (current & BinTrieFlags.VALUE_LENGTH) >> 14;
	        for (; offset < str.length; offset++, this.excess++) {
	            const char = str.charCodeAt(offset);
	            this.treeIndex = determineBranch(decodeTree, current, this.treeIndex + Math.max(1, valueLength), char);
	            if (this.treeIndex < 0) {
	                return this.result === 0 ||
	                    // If we are parsing an attribute
	                    (this.decodeMode === DecodingMode.Attribute &&
	                        // We shouldn't have consumed any characters after the entity,
	                        (valueLength === 0 ||
	                            // And there should be no invalid characters.
	                            isEntityInAttributeInvalidEnd(char)))
	                    ? 0
	                    : this.emitNotTerminatedNamedEntity();
	            }
	            current = decodeTree[this.treeIndex];
	            valueLength = (current & BinTrieFlags.VALUE_LENGTH) >> 14;
	            // If the branch is a value, store it and continue
	            if (valueLength !== 0) {
	                // If the entity is terminated by a semicolon, we are done.
	                if (char === CharCodes.SEMI) {
	                    return this.emitNamedEntityData(this.treeIndex, valueLength, this.consumed + this.excess);
	                }
	                // If we encounter a non-terminated (legacy) entity while parsing strictly, then ignore it.
	                if (this.decodeMode !== DecodingMode.Strict) {
	                    this.result = this.treeIndex;
	                    this.consumed += this.excess;
	                    this.excess = 0;
	                }
	            }
	        }
	        return -1;
	    }
	    /**
	     * Emit a named entity that was not terminated with a semicolon.
	     *
	     * @returns The number of characters consumed.
	     */
	    emitNotTerminatedNamedEntity() {
	        var _a;
	        const { result, decodeTree } = this;
	        const valueLength = (decodeTree[result] & BinTrieFlags.VALUE_LENGTH) >> 14;
	        this.emitNamedEntityData(result, valueLength, this.consumed);
	        (_a = this.errors) === null || _a === void 0 ? void 0 : _a.missingSemicolonAfterCharacterReference();
	        return this.consumed;
	    }
	    /**
	     * Emit a named entity.
	     *
	     * @param result The index of the entity in the decode tree.
	     * @param valueLength The number of bytes in the entity.
	     * @param consumed The number of characters consumed.
	     *
	     * @returns The number of characters consumed.
	     */
	    emitNamedEntityData(result, valueLength, consumed) {
	        const { decodeTree } = this;
	        this.emitCodePoint(valueLength === 1
	            ? decodeTree[result] & ~BinTrieFlags.VALUE_LENGTH
	            : decodeTree[result + 1], consumed);
	        if (valueLength === 3) {
	            // For multi-byte values, we need to emit the second byte.
	            this.emitCodePoint(decodeTree[result + 2], consumed);
	        }
	        return consumed;
	    }
	    /**
	     * Signal to the parser that the end of the input was reached.
	     *
	     * Remaining data will be emitted and relevant errors will be produced.
	     *
	     * @returns The number of characters consumed.
	     */
	    end() {
	        var _a;
	        switch (this.state) {
	            case EntityDecoderState.NamedEntity: {
	                // Emit a named entity if we have one.
	                return this.result !== 0 &&
	                    (this.decodeMode !== DecodingMode.Attribute ||
	                        this.result === this.treeIndex)
	                    ? this.emitNotTerminatedNamedEntity()
	                    : 0;
	            }
	            // Otherwise, emit a numeric entity if we have one.
	            case EntityDecoderState.NumericDecimal: {
	                return this.emitNumericEntity(0, 2);
	            }
	            case EntityDecoderState.NumericHex: {
	                return this.emitNumericEntity(0, 3);
	            }
	            case EntityDecoderState.NumericStart: {
	                (_a = this.errors) === null || _a === void 0 ? void 0 : _a.absenceOfDigitsInNumericCharacterReference(this.consumed);
	                return 0;
	            }
	            case EntityDecoderState.EntityStart: {
	                // Return 0 if we have no entity.
	                return 0;
	            }
	        }
	    }
	}
	/**
	 * Creates a function that decodes entities in a string.
	 *
	 * @param decodeTree The decode tree.
	 * @returns A function that decodes entities in a string.
	 */
	function getDecoder(decodeTree) {
	    let ret = "";
	    const decoder = new EntityDecoder(decodeTree, (str) => (ret += fromCodePoint(str)));
	    return function decodeWithTrie(str, decodeMode) {
	        let lastIndex = 0;
	        let offset = 0;
	        while ((offset = str.indexOf("&", offset)) >= 0) {
	            ret += str.slice(lastIndex, offset);
	            decoder.startEntity(decodeMode);
	            const len = decoder.write(str, 
	            // Skip the "&"
	            offset + 1);
	            if (len < 0) {
	                lastIndex = offset + decoder.end();
	                break;
	            }
	            lastIndex = offset + len;
	            // If `len` is 0, skip the current `&` and continue.
	            offset = len === 0 ? lastIndex + 1 : lastIndex;
	        }
	        const result = ret + str.slice(lastIndex);
	        // Make sure we don't keep a reference to the final string.
	        ret = "";
	        return result;
	    };
	}
	/**
	 * Determines the branch of the current node that is taken given the current
	 * character. This function is used to traverse the trie.
	 *
	 * @param decodeTree The trie.
	 * @param current The current node.
	 * @param nodeIdx The index right after the current node and its value.
	 * @param char The current character.
	 * @returns The index of the next node, or -1 if no branch is taken.
	 */
	function determineBranch(decodeTree, current, nodeIdx, char) {
	    const branchCount = (current & BinTrieFlags.BRANCH_LENGTH) >> 7;
	    const jumpOffset = current & BinTrieFlags.JUMP_TABLE;
	    // Case 1: Single branch encoded in jump offset
	    if (branchCount === 0) {
	        return jumpOffset !== 0 && char === jumpOffset ? nodeIdx : -1;
	    }
	    // Case 2: Multiple branches encoded in jump table
	    if (jumpOffset) {
	        const value = char - jumpOffset;
	        return value < 0 || value >= branchCount
	            ? -1
	            : decodeTree[nodeIdx + value] - 1;
	    }
	    // Case 3: Multiple branches encoded in dictionary
	    // Binary search for the character.
	    let lo = nodeIdx;
	    let hi = lo + branchCount - 1;
	    while (lo <= hi) {
	        const mid = (lo + hi) >>> 1;
	        const midVal = decodeTree[mid];
	        if (midVal < char) {
	            lo = mid + 1;
	        }
	        else if (midVal > char) {
	            hi = mid - 1;
	        }
	        else {
	            return decodeTree[mid + branchCount];
	        }
	    }
	    return -1;
	}
	const htmlDecoder = getDecoder(htmlDecodeTree);
	const xmlDecoder = getDecoder(xmlDecodeTree);
	/**
	 * Decodes an HTML string.
	 *
	 * @param str The string to decode.
	 * @param mode The decoding mode.
	 * @returns The decoded string.
	 */
	function decodeHTML(str, mode = DecodingMode.Legacy) {
	    return htmlDecoder(str, mode);
	}
	/**
	 * Decodes an XML string, requiring all entities to be terminated by a semicolon.
	 *
	 * @param str The string to decode.
	 * @returns The decoded string.
	 */
	function decodeXML(str) {
	    return xmlDecoder(str, DecodingMode.Strict);
	}

	/** The level of entities to support. */
	var EntityLevel;
	(function (EntityLevel) {
	    /** Support only XML entities. */
	    EntityLevel[EntityLevel["XML"] = 0] = "XML";
	    /** Support HTML entities, which are a superset of XML entities. */
	    EntityLevel[EntityLevel["HTML"] = 1] = "HTML";
	})(EntityLevel || (EntityLevel = {}));
	var EncodingMode;
	(function (EncodingMode) {
	    /**
	     * The output is UTF-8 encoded. Only characters that need escaping within
	     * XML will be escaped.
	     */
	    EncodingMode[EncodingMode["UTF8"] = 0] = "UTF8";
	    /**
	     * The output consists only of ASCII characters. Characters that need
	     * escaping within HTML, and characters that aren't ASCII characters will
	     * be escaped.
	     */
	    EncodingMode[EncodingMode["ASCII"] = 1] = "ASCII";
	    /**
	     * Encode all characters that have an equivalent entity, as well as all
	     * characters that are not ASCII characters.
	     */
	    EncodingMode[EncodingMode["Extensive"] = 2] = "Extensive";
	    /**
	     * Encode all characters that have to be escaped in HTML attributes,
	     * following {@link https://html.spec.whatwg.org/multipage/parsing.html#escapingString}.
	     */
	    EncodingMode[EncodingMode["Attribute"] = 3] = "Attribute";
	    /**
	     * Encode all characters that have to be escaped in HTML text,
	     * following {@link https://html.spec.whatwg.org/multipage/parsing.html#escapingString}.
	     */
	    EncodingMode[EncodingMode["Text"] = 4] = "Text";
	})(EncodingMode || (EncodingMode = {}));
	/**
	 * Decodes a string with entities.
	 *
	 * @param data String to decode.
	 * @param options Decoding options.
	 */
	function decode(data, options = EntityLevel.XML) {
	    const level = typeof options === "number" ? options : options.level;
	    if (level === EntityLevel.HTML) {
	        const mode = typeof options === "object" ? options.mode : undefined;
	        return decodeHTML(data, mode);
	    }
	    return decodeXML(data);
	}

	const Helpers = function (window) {
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
	      event = new CustomEvent('pixassist:notice:add', {
	        detail: {
	          data: data
	        }
	      });
	    } else {
	      event = document.createEvent('CustomEvent');
	      event.initCustomEvent('pixassist:notice:add', true, true, {
	        data: data
	      });
	    }
	    window.dispatchEvent(event);
	  };
	  const updateNotification = function (data) {
	    let event;
	    if (window.CustomEvent) {
	      event = new CustomEvent('pixassist:notice:update', {
	        detail: {
	          data: data
	        }
	      });
	    } else {
	      event = document.createEvent('CustomEvent');
	      event.initCustomEvent('pixassist:notice:update', true, true, {
	        data: data
	      });
	    }
	    window.dispatchEvent(event);
	  };
	  const removeNotification = function (data) {
	    let event;
	    if (window.CustomEvent) {
	      event = new CustomEvent('pixassist:notice:remove', {
	        detail: {
	          data: data
	        }
	      });
	    } else {
	      event = document.createEvent('CustomEvent');
	      event.initCustomEvent('pixassist:notice:remove', true, true, {
	        data: data
	      });
	    }
	    window.dispatchEvent(event);
	  };

	  /**
	   * This is an error callback for 5xx status codes
	   * It pushes an user friendly notification which promotes a documentation article about this matter.
	   * @param e
	   */
	  const notify500Error = function (e) {
	    let link = get_1(pixassist, 'themeConfig.l10n.Error500Link', '');
	    if (typeof e.status === "number") {
	      link += '#error_' + e.status;
	    } else {
	      link += '#error_5xx';
	    }
	    pushNotification({
	      notice_id: '500_error',
	      title: 'We encountered a server problem',
	      content: get_1(pixassist, 'themeConfig.l10n.Error500Text', ''),
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
	    let link = get_1(pixassist, 'themeConfig.l10n.Error400Link', '');
	    if (typeof e.status === "number") {
	      link += '#error_' + e.status;
	    } else {
	      link += '#error_4xx';
	    }
	    pushNotification({
	      notice_id: '400_error',
	      title: 'We encountered a server problem',
	      content: get_1(pixassist, 'themeConfig.l10n.Error400Text', ''),
	      type: 'error',
	      ctaLabel: 'Find Solutions',
	      ctaLink: link
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
	      };
	    }
	    if (null === successCallback) {
	      // a default success callback
	      successCallback = function (response) {
	        // console.debug(response);
	      };
	    }
	    if (null === errorCallback) {
	      // a default error callback ... just a log
	      errorCallback = function (err) {
	        console.debug(url);
	        console.debug(err);
	      };
	    }

	    // always add our nonce
	    data = {
	      ...data,
	      ...{
	        'pixassist_nonce': pixassist.wpRest.pixassist_nonce
	      }
	    };
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
	        503: notify500Error
	      },
	      data: data
	    }).done(successCallback).error(errorCallback);
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
	    if (httpMethod === 'GET' && !isEmpty_1(data)) {
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
	      body: ['GET', 'HEAD'].indexOf(httpMethod) > -1 ? null : qs.stringify(data)
	    }).then(response => {
	      if (response.headers.get('Content-Type') && response.headers.get('Content-Type').indexOf('x-www-form-urlencoded') > -1) {
	        return response.text().then(text => {
	          let parsed = qs.parse(text);
	          callback(parsed);
	          return parsed;
	        });
	      }
	      return response.text().then(text => {
	        try {
	          var json = JSON.parse(text);
	        } catch (e) {
	          errorCallback({
	            message: text,
	            code: response.status
	          });
	          throw {
	            message: text,
	            code: response.status
	          };
	        }
	        if (response.status >= 300) {
	          httpErrorCallback(response);
	          throw json;
	        } else {
	          callback(json);
	          return json;
	        }
	      });
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
	    if (get_1(pixassist, 'themeSupports.template', false)) {
	      slug = get_1(pixassist, 'themeSupports.template', false);
	    } else if (get_1(pixassist, 'themeSupports.theme_name', false)) {
	      slug = get_1(pixassist, 'themeSupports.theme_name', false);
	      slug = slug.toLowerCase();
	    }
	    if (!slug) {
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
	          content: Helpers.parseL10n("All things look great! Enjoy crafting your site with {{theme_name}}."),
	          type: 'success',
	          ctaLabel: false,
	          secondaryCtaLabel: false,
	          loading: false
	        });

	        // push event that the theme has been successfully updated
	        let updatedEvent = new CustomEvent('updatedTheme', {
	          detail: {
	            isUpdated: true,
	            update: 'theme',
	            slug: response.slug,
	            oldVersion: response.oldVersion,
	            newVersion: response.newVersion
	          },
	          bubbles: true,
	          cancelable: true
	        });
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
	  const getLicense = customerOrders => {
	    let license = null,
	      active_license = null,
	      valid_license = null,
	      expired_license = null;

	    // Check if we have at least one order
	    if (typeof customerOrders === "object" && size_1(customerOrders)) {
	      // If we have at least one order - loop through its licences to get the best one
	      map_1(customerOrders, function (order, key) {
	        if (!isUndefined_1(order.licenses)) {
	          map_1(order.licenses, function (license, lkey) {
	            if (!isUndefined_1(license.license_status_code) && parseInt(license.license_status_code) === 1) {
	              // License is valid
	              valid_license = license;
	            } else if (parseInt(license.license_status_code) === 2) {
	              // license is active
	              active_license = license;
	            } else if (parseInt(license.license_status_code) === 3 || parseInt(license.license_status_code) === 4) {
	              // license is either expired or overused
	              expired_license = license;
	            }
	          });
	        }
	      });
	    }

	    // check to see what licenses we found
	    if (null !== valid_license) {
	      license = valid_license;
	    } else if (null !== active_license) {
	      license = active_license;
	    } else if (null !== expired_license) {
	      license = expired_license;
	    }
	    if (null === license) {
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

	  /**
	   * This is the js-queue npm https://github.com/RIAEvangelist/js-queue
	   * The only difference is that we added a 200 ms delay to each call.
	   * @param e
	   * @constructor
	   */
	  const Queue = function (e) {
	    function t() {
	      return i = [];
	    }
	    function n() {
	      return i;
	    }
	    function u(e) {
	      return i = e;
	    }
	    function r() {
	      for (var e in arguments) i.push(arguments[e]);
	      l || this.stop || !this.autoRun || this.next();
	    }
	    function a() {
	      if (l = !0, i.length < 1 || this.stop) return void (l = !1);
	      var e = this;
	      setTimeout(function () {
	        i.shift().bind(e)();
	      }, 200);
	    }
	    Object.defineProperties(this, {
	      add: {
	        enumerable: !0,
	        writable: !1,
	        value: r
	      },
	      next: {
	        enumerable: !0,
	        writable: !1,
	        value: a
	      },
	      clear: {
	        enumerable: !0,
	        writable: !1,
	        value: t
	      },
	      contents: {
	        enumerable: !1,
	        get: n,
	        set: u
	      },
	      autoRun: {
	        enumerable: !0,
	        writable: !0,
	        value: !0
	      },
	      stop: {
	        enumerable: !0,
	        writable: !0,
	        value: !1
	      }
	    });
	    var i = [],
	      l = !1;
	  };
	  const compareVersion = function (v1, v2) {
	    if (typeof v1 !== 'string') return false;
	    if (typeof v2 !== 'string') return false;
	    v1 = v1.split('.');
	    v2 = v2.split('.');
	    const k = Math.min(v1.length, v2.length);
	    for (let i = 0; i < k; ++i) {
	      v1[i] = parseInt(v1[i], 10);
	      v2[i] = parseInt(v2[i], 10);
	      if (v1[i] > v2[i]) return 1;
	      if (v1[i] < v2[i]) return -1;
	    }
	    return v1.length == v2.length ? 0 : v1.length < v2.length ? -1 : 1;
	  };
	  const getFirstItem = function (collection) {
	    if (!size_1(collection)) {
	      return null;
	    }
	    if (isArrayLike_1(collection)) {
	      return first(collection);
	    }
	    if (isObjectLike_1(collection)) {
	      return get_1(collection, first(Object.keys(collection)));
	    }
	    return null;
	  };

	  /**
	   * Replaces variables like theme_name or username in a string.
	   *
	   * @param string
	   * @returns {*}
	   */
	  const replaceVariables = function (string) {
	    const replacers = {
	      '{{themeName}}': get_1(pixassist, 'themeSupports.theme_name', 'Theme'),
	      '{{theme_name}}': get_1(pixassist, 'themeSupports.theme_name', 'Theme'),
	      '{{stylecssThemeName}}': get_1(pixassist, 'themeSupports.stylecss_theme_name', ''),
	      '{{stylecss_theme_name}}': get_1(pixassist, 'themeSupports.stylecss_theme_name', ''),
	      '{{themeVersion}}': get_1(pixassist, 'themeSupports.theme_version', '0.0.1'),
	      '{{theme_version}}': get_1(pixassist, 'themeSupports.theme_version', '0.0.1'),
	      '{{themeId}}': get_1(pixassist, 'themeSupports.theme_id', ''),
	      '{{theme_id}}': get_1(pixassist, 'themeSupports.theme_id', ''),
	      '{{template}}': get_1(pixassist, 'themeSupports.template', ''),
	      '{{originalSlug}}': get_1(pixassist, 'themeSupports.original_slug', ''),
	      '{{original_slug}}': get_1(pixassist, 'themeSupports.original_slug', ''),
	      '{{mainProductSku}}': get_1(pixassist, 'themeSupports.main_product_sku', get_1(pixassist, 'themeSupports.original_slug', '')),
	      '{{main_product_sku}}': get_1(pixassist, 'themeSupports.main_product_sku', get_1(pixassist, 'themeSupports.original_slug', '')),
	      '{{username}}': get_1(pixassist, 'user.name', 'Name'),
	      // This is the name of the current user, in this installation

	      '{{shopBase}}': pixassist.shopBase,
	      '{{shopbase}}': pixassist.shopBase,
	      '{{shopDomain}}': pixassist.shopBaseDomain,
	      '{{shopdomain}}': pixassist.shopBaseDomain,
	      '{{supportEmailAddress}}': pixassist.supportEmail,
	      '{{support_email_address}}': pixassist.supportEmail,
	      '{{supportEmailAddressLink}}': '<a href="mailto:' + pixassist.supportEmail + '" target="_blank">' + pixassist.supportEmail + '</a>',
	      '{{support_email_address_link}}': '<a href="mailto:' + pixassist.supportEmail + '" target="_blank">' + pixassist.supportEmail + '</a>',
	      '{{dashboardUrl}}': pixassist.dashboardUrl,
	      '{{dashboard_url}}': pixassist.dashboardUrl,
	      '{{customizerUrl}}': pixassist.customizerUrl,
	      '{{customizer_url}}': pixassist.customizerUrl
	    };

	    // Let's see if we have the display name of the customer from our shop
	    if (!isUndefined_1(pixassist.user.pixelgrade_display_name)) {
	      replacers['{{username}}'] = get_1(pixassist, 'user.pixelgrade_display_name', 'Name');
	    }
	    const re = new RegExp(Object.keys(replacers).join('|'), 'gi');
	    if (!isUndefined_1(string) || !!string) {
	      string = string.replace(re, function (matched) {
	        // We should first search for the matched, as it is.
	        if (!isUndefined_1(replacers[matched])) {
	          return replacers[matched];
	        }

	        // But also give the full lowercase match a change.
	        if (!isUndefined_1(replacers[matched.toLowerCase()])) {
	          return replacers[matched.toLowerCase()];
	        }
	        return matched;
	      });
	    }
	    return string;
	  };
	  const decodeHtml = function (encodedHtmlText) {
	    return decode(encodedHtmlText);
	  };
	  const parseL10n = function (l10nText) {
	    var _context;
	    return (_context = self, decodeHtml).call(_context, (_context = self, replaceVariables).call(_context, l10nText));
	  };
	  const trailingslashit = function (url) {
	    return url + (url.endsWith("/") ? "" : "/");
	  };
	  return {
	    // notifications
	    pushNotification: pushNotification,
	    updateNotification: updateNotification,
	    removeNotification: removeNotification,
	    notify500Error: notify500Error,
	    notify400Error: notify400Error,
	    // HTML and replacers
	    decodeHtml: decodeHtml,
	    replaceVariables: replaceVariables,
	    parseL10n: parseL10n,
	    //helpers
	    extend: extend,
	    // requests
	    restRequest: restRequest,
	    $ajax: $ajax,
	    checkHttpStatus: checkHttpStatus,
	    // others
	    Queue: Queue,
	    clickUpdateTheme: clickUpdateTheme,
	    // licensing
	    getLicense: getLicense,
	    compareVersion: compareVersion,
	    getFirstItem: getFirstItem,
	    trailingslashit: trailingslashit
	  };
	}(window);

	/**
	 * Component responsible to display a notification
	 * It can also display a CTA button which can be a link (for cases like a documentation link)
	 * or it can be a callback for cases like a theme update
	 */
	class Notice extends React$1.Component {
	  static get defaultProps() {
	    return {
	      type: 'info',
	      isDismissable: false,
	      onDismiss: null,
	      ctaLabel: null,
	      ctaLink: null,
	      ctaAction: null,
	      secondaryCtaLabel: null,
	      secondaryCtaLink: null,
	      loading: false
	    };
	  }
	  constructor(props) {
	    // this makes the this
	    super(props);

	    // get the current state localized by wordpress
	    this.onDismiss = this.onDismiss.bind(this);
	  }
	  render() {
	    var divClass = 'box box--' + this.props.type;

	    // init the possible CTA link
	    let link = null === this.props.ctaLink ? '#' : this.props.ctaLink;
	    return /*#__PURE__*/React$1.createElement("div", {
	      className: divClass
	    }, this.props.isDismissable ? /*#__PURE__*/React$1.createElement("a", {
	      href: "#",
	      onClick: this.onDismiss,
	      className: "box__close-icon"
	    }, /*#__PURE__*/React$1.createElement("i", {
	      className: "dashicons dashicons-no"
	    })) : null, /*#__PURE__*/React$1.createElement("div", {
	      className: "box__body"
	    }, /*#__PURE__*/React$1.createElement("h5", {
	      className: "box__title"
	    }, Helpers.replaceVariables(this.props.title)), /*#__PURE__*/React$1.createElement("p", {
	      className: "box__text",
	      dangerouslySetInnerHTML: {
	        __html: Helpers.replaceVariables(this.props.content)
	      }
	    })), this.props.secondaryCtaLabel && this.props.secondaryCtaLink ? /*#__PURE__*/React$1.createElement("div", {
	      className: "box__cta box__cta-secondary"
	    }, /*#__PURE__*/React$1.createElement("a", {
	      className: "btn  btn--text",
	      href: this.props.secondaryCtaLink,
	      target: "_blank"
	    }, this.props.secondaryCtaLabel)) : null, this.props.ctaLabel ? /*#__PURE__*/React$1.createElement("div", {
	      className: "box__cta"
	    }, null === this.props.ctaLink // it could be a link or a button with callback
	    ? /*#__PURE__*/React$1.createElement("a", {
	      className: "btn  btn--small",
	      id: "pgc-update-button",
	      onClick: this.props.ctaAction
	    }, this.props.ctaLabel) : /*#__PURE__*/React$1.createElement("a", {
	      className: "btn  btn--small",
	      id: "pgc-update-button",
	      href: link,
	      target: "_blank"
	    }, this.props.ctaLabel)) : null, this.props.loading ? /*#__PURE__*/React$1.createElement("div", {
	      className: "box__cta box__cta--loader"
	    }, /*#__PURE__*/React$1.createElement(CircularProgress$1, {
	      size: 40,
	      variant: "indeterminate",
	      color: "primary",
	      style: {
	        loader: {
	          position: "relative"
	        }
	      }
	    })) : null);
	  }
	  onDismiss(e) {
	    var comp = this;

	    // in case we have a custom dismiss action, we call that
	    if (this.props.onDismiss !== null) {
	      this.props.onDismiss();
	    } else {
	      if (window.CustomEvent) {
	        var event = new CustomEvent('pixassist:notice:dismiss', {
	          detail: {
	            data: {
	              notice_id: comp.props.notice_id
	            }
	          }
	        });
	      } else {
	        var event = document.createEvent('CustomEvent');
	        event.initCustomEvent('pixassist:notice:dismiss', true, true, {
	          data: {
	            notice_id: comp.props.notice_id
	          }
	        });
	      }
	      window.dispatchEvent(event);
	    }
	  }
	}

	/**
	 * Checks if `value` is `null` or `undefined`.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is nullish, else `false`.
	 * @example
	 *
	 * _.isNil(null);
	 * // => true
	 *
	 * _.isNil(void 0);
	 * // => true
	 *
	 * _.isNil(NaN);
	 * // => false
	 */

	function isNil(value) {
	  return value == null;
	}

	var isNil_1 = isNil;

	/**
	 * @ignore - internal component.
	 */

	var FormControlContext = react.exports.createContext();
	var FormControlContext$1 = FormControlContext;

	function useFormControl() {
	  return react.exports.useContext(FormControlContext$1);
	}

	var TransitionGroupContext = React$1.createContext(null);

	/**
	 * Given `this.props.children`, return an object mapping key to child.
	 *
	 * @param {*} children `this.props.children`
	 * @return {object} Mapping of key to child
	 */

	function getChildMapping(children, mapFn) {
	  var mapper = function mapper(child) {
	    return mapFn && react.exports.isValidElement(child) ? mapFn(child) : child;
	  };

	  var result = Object.create(null);
	  if (children) react.exports.Children.map(children, function (c) {
	    return c;
	  }).forEach(function (child) {
	    // run the map function here instead so that the key is the computed one
	    result[child.key] = mapper(child);
	  });
	  return result;
	}
	/**
	 * When you're adding or removing children some may be added or removed in the
	 * same render pass. We want to show *both* since we want to simultaneously
	 * animate elements in and out. This function takes a previous set of keys
	 * and a new set of keys and merges them with its best guess of the correct
	 * ordering. In the future we may expose some of the utilities in
	 * ReactMultiChild to make this easy, but for now React itself does not
	 * directly have this concept of the union of prevChildren and nextChildren
	 * so we implement it here.
	 *
	 * @param {object} prev prev children as returned from
	 * `ReactTransitionChildMapping.getChildMapping()`.
	 * @param {object} next next children as returned from
	 * `ReactTransitionChildMapping.getChildMapping()`.
	 * @return {object} a key set that contains all keys in `prev` and all keys
	 * in `next` in a reasonable order.
	 */

	function mergeChildMappings(prev, next) {
	  prev = prev || {};
	  next = next || {};

	  function getValueForKey(key) {
	    return key in next ? next[key] : prev[key];
	  } // For each key of `next`, the list of keys to insert before that key in
	  // the combined list


	  var nextKeysPending = Object.create(null);
	  var pendingKeys = [];

	  for (var prevKey in prev) {
	    if (prevKey in next) {
	      if (pendingKeys.length) {
	        nextKeysPending[prevKey] = pendingKeys;
	        pendingKeys = [];
	      }
	    } else {
	      pendingKeys.push(prevKey);
	    }
	  }

	  var i;
	  var childMapping = {};

	  for (var nextKey in next) {
	    if (nextKeysPending[nextKey]) {
	      for (i = 0; i < nextKeysPending[nextKey].length; i++) {
	        var pendingNextKey = nextKeysPending[nextKey][i];
	        childMapping[nextKeysPending[nextKey][i]] = getValueForKey(pendingNextKey);
	      }
	    }

	    childMapping[nextKey] = getValueForKey(nextKey);
	  } // Finally, add the keys which didn't appear before any key in `next`


	  for (i = 0; i < pendingKeys.length; i++) {
	    childMapping[pendingKeys[i]] = getValueForKey(pendingKeys[i]);
	  }

	  return childMapping;
	}

	function getProp(child, prop, props) {
	  return props[prop] != null ? props[prop] : child.props[prop];
	}

	function getInitialChildMapping(props, onExited) {
	  return getChildMapping(props.children, function (child) {
	    return react.exports.cloneElement(child, {
	      onExited: onExited.bind(null, child),
	      in: true,
	      appear: getProp(child, 'appear', props),
	      enter: getProp(child, 'enter', props),
	      exit: getProp(child, 'exit', props)
	    });
	  });
	}
	function getNextChildMapping(nextProps, prevChildMapping, onExited) {
	  var nextChildMapping = getChildMapping(nextProps.children);
	  var children = mergeChildMappings(prevChildMapping, nextChildMapping);
	  Object.keys(children).forEach(function (key) {
	    var child = children[key];
	    if (!react.exports.isValidElement(child)) return;
	    var hasPrev = (key in prevChildMapping);
	    var hasNext = (key in nextChildMapping);
	    var prevChild = prevChildMapping[key];
	    var isLeaving = react.exports.isValidElement(prevChild) && !prevChild.props.in; // item is new (entering)

	    if (hasNext && (!hasPrev || isLeaving)) {
	      // console.log('entering', key)
	      children[key] = react.exports.cloneElement(child, {
	        onExited: onExited.bind(null, child),
	        in: true,
	        exit: getProp(child, 'exit', nextProps),
	        enter: getProp(child, 'enter', nextProps)
	      });
	    } else if (!hasNext && hasPrev && !isLeaving) {
	      // item is old (exiting)
	      // console.log('leaving', key)
	      children[key] = react.exports.cloneElement(child, {
	        in: false
	      });
	    } else if (hasNext && hasPrev && react.exports.isValidElement(prevChild)) {
	      // item hasn't changed transition states
	      // copy over the last transition props;
	      // console.log('unchanged', key)
	      children[key] = react.exports.cloneElement(child, {
	        onExited: onExited.bind(null, child),
	        in: prevChild.props.in,
	        exit: getProp(child, 'exit', nextProps),
	        enter: getProp(child, 'enter', nextProps)
	      });
	    }
	  });
	  return children;
	}

	var values = Object.values || function (obj) {
	  return Object.keys(obj).map(function (k) {
	    return obj[k];
	  });
	};

	var defaultProps = {
	  component: 'div',
	  childFactory: function childFactory(child) {
	    return child;
	  }
	};
	/**
	 * The `<TransitionGroup>` component manages a set of transition components
	 * (`<Transition>` and `<CSSTransition>`) in a list. Like with the transition
	 * components, `<TransitionGroup>` is a state machine for managing the mounting
	 * and unmounting of components over time.
	 *
	 * Consider the example below. As items are removed or added to the TodoList the
	 * `in` prop is toggled automatically by the `<TransitionGroup>`.
	 *
	 * Note that `<TransitionGroup>`  does not define any animation behavior!
	 * Exactly _how_ a list item animates is up to the individual transition
	 * component. This means you can mix and match animations across different list
	 * items.
	 */

	var TransitionGroup = /*#__PURE__*/function (_React$Component) {
	  _inheritsLoose(TransitionGroup, _React$Component);

	  function TransitionGroup(props, context) {
	    var _this;

	    _this = _React$Component.call(this, props, context) || this;

	    var handleExited = _this.handleExited.bind(_assertThisInitialized(_this)); // Initial children should all be entering, dependent on appear


	    _this.state = {
	      contextValue: {
	        isMounting: true
	      },
	      handleExited: handleExited,
	      firstRender: true
	    };
	    return _this;
	  }

	  var _proto = TransitionGroup.prototype;

	  _proto.componentDidMount = function componentDidMount() {
	    this.mounted = true;
	    this.setState({
	      contextValue: {
	        isMounting: false
	      }
	    });
	  };

	  _proto.componentWillUnmount = function componentWillUnmount() {
	    this.mounted = false;
	  };

	  TransitionGroup.getDerivedStateFromProps = function getDerivedStateFromProps(nextProps, _ref) {
	    var prevChildMapping = _ref.children,
	        handleExited = _ref.handleExited,
	        firstRender = _ref.firstRender;
	    return {
	      children: firstRender ? getInitialChildMapping(nextProps, handleExited) : getNextChildMapping(nextProps, prevChildMapping, handleExited),
	      firstRender: false
	    };
	  } // node is `undefined` when user provided `nodeRef` prop
	  ;

	  _proto.handleExited = function handleExited(child, node) {
	    var currentChildMapping = getChildMapping(this.props.children);
	    if (child.key in currentChildMapping) return;

	    if (child.props.onExited) {
	      child.props.onExited(node);
	    }

	    if (this.mounted) {
	      this.setState(function (state) {
	        var children = _extends({}, state.children);

	        delete children[child.key];
	        return {
	          children: children
	        };
	      });
	    }
	  };

	  _proto.render = function render() {
	    var _this$props = this.props,
	        Component = _this$props.component,
	        childFactory = _this$props.childFactory,
	        props = _objectWithoutPropertiesLoose(_this$props, ["component", "childFactory"]);

	    var contextValue = this.state.contextValue;
	    var children = values(this.state.children).map(childFactory);
	    delete props.appear;
	    delete props.enter;
	    delete props.exit;

	    if (Component === null) {
	      return /*#__PURE__*/React$1.createElement(TransitionGroupContext.Provider, {
	        value: contextValue
	      }, children);
	    }

	    return /*#__PURE__*/React$1.createElement(TransitionGroupContext.Provider, {
	      value: contextValue
	    }, /*#__PURE__*/React$1.createElement(Component, props, children));
	  };

	  return TransitionGroup;
	}(React$1.Component);

	TransitionGroup.propTypes = {};
	TransitionGroup.defaultProps = defaultProps;
	var TransitionGroup$1 = TransitionGroup;

	var useEnhancedEffect = typeof window === 'undefined' ? react.exports.useEffect : react.exports.useLayoutEffect;
	/**
	 * @ignore - internal component.
	 */

	function Ripple(props) {
	  var classes = props.classes,
	      _props$pulsate = props.pulsate,
	      pulsate = _props$pulsate === void 0 ? false : _props$pulsate,
	      rippleX = props.rippleX,
	      rippleY = props.rippleY,
	      rippleSize = props.rippleSize,
	      inProp = props.in,
	      _props$onExited = props.onExited,
	      onExited = _props$onExited === void 0 ? function () {} : _props$onExited,
	      timeout = props.timeout;

	  var _React$useState = react.exports.useState(false),
	      leaving = _React$useState[0],
	      setLeaving = _React$useState[1];

	  var rippleClassName = clsx(classes.ripple, classes.rippleVisible, pulsate && classes.ripplePulsate);
	  var rippleStyles = {
	    width: rippleSize,
	    height: rippleSize,
	    top: -(rippleSize / 2) + rippleY,
	    left: -(rippleSize / 2) + rippleX
	  };
	  var childClassName = clsx(classes.child, leaving && classes.childLeaving, pulsate && classes.childPulsate);
	  var handleExited = useEventCallback(onExited); // Ripple is used for user feedback (e.g. click or press) so we want to apply styles with the highest priority

	  useEnhancedEffect(function () {
	    if (!inProp) {
	      // react-transition-group#onExit
	      setLeaving(true); // react-transition-group#onExited

	      var timeoutId = setTimeout(handleExited, timeout);
	      return function () {
	        clearTimeout(timeoutId);
	      };
	    }

	    return undefined;
	  }, [handleExited, inProp, timeout]);
	  return /*#__PURE__*/react.exports.createElement("span", {
	    className: rippleClassName,
	    style: rippleStyles
	  }, /*#__PURE__*/react.exports.createElement("span", {
	    className: childClassName
	  }));
	}

	var DURATION = 550;
	var DELAY_RIPPLE = 80;
	var styles$6 = function styles(theme) {
	  return {
	    /* Styles applied to the root element. */
	    root: {
	      overflow: 'hidden',
	      pointerEvents: 'none',
	      position: 'absolute',
	      zIndex: 0,
	      top: 0,
	      right: 0,
	      bottom: 0,
	      left: 0,
	      borderRadius: 'inherit'
	    },

	    /* Styles applied to the internal `Ripple` components `ripple` class. */
	    ripple: {
	      opacity: 0,
	      position: 'absolute'
	    },

	    /* Styles applied to the internal `Ripple` components `rippleVisible` class. */
	    rippleVisible: {
	      opacity: 0.3,
	      transform: 'scale(1)',
	      animation: "$enter ".concat(DURATION, "ms ").concat(theme.transitions.easing.easeInOut)
	    },

	    /* Styles applied to the internal `Ripple` components `ripplePulsate` class. */
	    ripplePulsate: {
	      animationDuration: "".concat(theme.transitions.duration.shorter, "ms")
	    },

	    /* Styles applied to the internal `Ripple` components `child` class. */
	    child: {
	      opacity: 1,
	      display: 'block',
	      width: '100%',
	      height: '100%',
	      borderRadius: '50%',
	      backgroundColor: 'currentColor'
	    },

	    /* Styles applied to the internal `Ripple` components `childLeaving` class. */
	    childLeaving: {
	      opacity: 0,
	      animation: "$exit ".concat(DURATION, "ms ").concat(theme.transitions.easing.easeInOut)
	    },

	    /* Styles applied to the internal `Ripple` components `childPulsate` class. */
	    childPulsate: {
	      position: 'absolute',
	      left: 0,
	      top: 0,
	      animation: "$pulsate 2500ms ".concat(theme.transitions.easing.easeInOut, " 200ms infinite")
	    },
	    '@keyframes enter': {
	      '0%': {
	        transform: 'scale(0)',
	        opacity: 0.1
	      },
	      '100%': {
	        transform: 'scale(1)',
	        opacity: 0.3
	      }
	    },
	    '@keyframes exit': {
	      '0%': {
	        opacity: 1
	      },
	      '100%': {
	        opacity: 0
	      }
	    },
	    '@keyframes pulsate': {
	      '0%': {
	        transform: 'scale(1)'
	      },
	      '50%': {
	        transform: 'scale(0.92)'
	      },
	      '100%': {
	        transform: 'scale(1)'
	      }
	    }
	  };
	};
	/**
	 * @ignore - internal component.
	 *
	 * TODO v5: Make private
	 */

	var TouchRipple = /*#__PURE__*/react.exports.forwardRef(function TouchRipple(props, ref) {
	  var _props$center = props.center,
	      centerProp = _props$center === void 0 ? false : _props$center,
	      classes = props.classes,
	      className = props.className,
	      other = _objectWithoutProperties(props, ["center", "classes", "className"]);

	  var _React$useState = react.exports.useState([]),
	      ripples = _React$useState[0],
	      setRipples = _React$useState[1];

	  var nextKey = react.exports.useRef(0);
	  var rippleCallback = react.exports.useRef(null);
	  react.exports.useEffect(function () {
	    if (rippleCallback.current) {
	      rippleCallback.current();
	      rippleCallback.current = null;
	    }
	  }, [ripples]); // Used to filter out mouse emulated events on mobile.

	  var ignoringMouseDown = react.exports.useRef(false); // We use a timer in order to only show the ripples for touch "click" like events.
	  // We don't want to display the ripple for touch scroll events.

	  var startTimer = react.exports.useRef(null); // This is the hook called once the previous timeout is ready.

	  var startTimerCommit = react.exports.useRef(null);
	  var container = react.exports.useRef(null);
	  react.exports.useEffect(function () {
	    return function () {
	      clearTimeout(startTimer.current);
	    };
	  }, []);
	  var startCommit = react.exports.useCallback(function (params) {
	    var pulsate = params.pulsate,
	        rippleX = params.rippleX,
	        rippleY = params.rippleY,
	        rippleSize = params.rippleSize,
	        cb = params.cb;
	    setRipples(function (oldRipples) {
	      return [].concat(_toConsumableArray(oldRipples), [/*#__PURE__*/react.exports.createElement(Ripple, {
	        key: nextKey.current,
	        classes: classes,
	        timeout: DURATION,
	        pulsate: pulsate,
	        rippleX: rippleX,
	        rippleY: rippleY,
	        rippleSize: rippleSize
	      })]);
	    });
	    nextKey.current += 1;
	    rippleCallback.current = cb;
	  }, [classes]);
	  var start = react.exports.useCallback(function () {
	    var event = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
	    var cb = arguments.length > 2 ? arguments[2] : undefined;
	    var _options$pulsate = options.pulsate,
	        pulsate = _options$pulsate === void 0 ? false : _options$pulsate,
	        _options$center = options.center,
	        center = _options$center === void 0 ? centerProp || options.pulsate : _options$center,
	        _options$fakeElement = options.fakeElement,
	        fakeElement = _options$fakeElement === void 0 ? false : _options$fakeElement;

	    if (event.type === 'mousedown' && ignoringMouseDown.current) {
	      ignoringMouseDown.current = false;
	      return;
	    }

	    if (event.type === 'touchstart') {
	      ignoringMouseDown.current = true;
	    }

	    var element = fakeElement ? null : container.current;
	    var rect = element ? element.getBoundingClientRect() : {
	      width: 0,
	      height: 0,
	      left: 0,
	      top: 0
	    }; // Get the size of the ripple

	    var rippleX;
	    var rippleY;
	    var rippleSize;

	    if (center || event.clientX === 0 && event.clientY === 0 || !event.clientX && !event.touches) {
	      rippleX = Math.round(rect.width / 2);
	      rippleY = Math.round(rect.height / 2);
	    } else {
	      var _ref = event.touches ? event.touches[0] : event,
	          clientX = _ref.clientX,
	          clientY = _ref.clientY;

	      rippleX = Math.round(clientX - rect.left);
	      rippleY = Math.round(clientY - rect.top);
	    }

	    if (center) {
	      rippleSize = Math.sqrt((2 * Math.pow(rect.width, 2) + Math.pow(rect.height, 2)) / 3); // For some reason the animation is broken on Mobile Chrome if the size if even.

	      if (rippleSize % 2 === 0) {
	        rippleSize += 1;
	      }
	    } else {
	      var sizeX = Math.max(Math.abs((element ? element.clientWidth : 0) - rippleX), rippleX) * 2 + 2;
	      var sizeY = Math.max(Math.abs((element ? element.clientHeight : 0) - rippleY), rippleY) * 2 + 2;
	      rippleSize = Math.sqrt(Math.pow(sizeX, 2) + Math.pow(sizeY, 2));
	    } // Touche devices


	    if (event.touches) {
	      // check that this isn't another touchstart due to multitouch
	      // otherwise we will only clear a single timer when unmounting while two
	      // are running
	      if (startTimerCommit.current === null) {
	        // Prepare the ripple effect.
	        startTimerCommit.current = function () {
	          startCommit({
	            pulsate: pulsate,
	            rippleX: rippleX,
	            rippleY: rippleY,
	            rippleSize: rippleSize,
	            cb: cb
	          });
	        }; // Delay the execution of the ripple effect.


	        startTimer.current = setTimeout(function () {
	          if (startTimerCommit.current) {
	            startTimerCommit.current();
	            startTimerCommit.current = null;
	          }
	        }, DELAY_RIPPLE); // We have to make a tradeoff with this value.
	      }
	    } else {
	      startCommit({
	        pulsate: pulsate,
	        rippleX: rippleX,
	        rippleY: rippleY,
	        rippleSize: rippleSize,
	        cb: cb
	      });
	    }
	  }, [centerProp, startCommit]);
	  var pulsate = react.exports.useCallback(function () {
	    start({}, {
	      pulsate: true
	    });
	  }, [start]);
	  var stop = react.exports.useCallback(function (event, cb) {
	    clearTimeout(startTimer.current); // The touch interaction occurs too quickly.
	    // We still want to show ripple effect.

	    if (event.type === 'touchend' && startTimerCommit.current) {
	      event.persist();
	      startTimerCommit.current();
	      startTimerCommit.current = null;
	      startTimer.current = setTimeout(function () {
	        stop(event, cb);
	      });
	      return;
	    }

	    startTimerCommit.current = null;
	    setRipples(function (oldRipples) {
	      if (oldRipples.length > 0) {
	        return oldRipples.slice(1);
	      }

	      return oldRipples;
	    });
	    rippleCallback.current = cb;
	  }, []);
	  react.exports.useImperativeHandle(ref, function () {
	    return {
	      pulsate: pulsate,
	      start: start,
	      stop: stop
	    };
	  }, [pulsate, start, stop]);
	  return /*#__PURE__*/react.exports.createElement("span", _extends({
	    className: clsx(classes.root, className),
	    ref: container
	  }, other), /*#__PURE__*/react.exports.createElement(TransitionGroup$1, {
	    component: null,
	    exit: true
	  }, ripples));
	});
	var TouchRipple$1 = withStyles(styles$6, {
	  flip: false,
	  name: 'MuiTouchRipple'
	})( /*#__PURE__*/react.exports.memo(TouchRipple));

	var styles$5 = {
	  /* Styles applied to the root element. */
	  root: {
	    display: 'inline-flex',
	    alignItems: 'center',
	    justifyContent: 'center',
	    position: 'relative',
	    WebkitTapHighlightColor: 'transparent',
	    backgroundColor: 'transparent',
	    // Reset default value
	    // We disable the focus ring for mouse, touch and keyboard users.
	    outline: 0,
	    border: 0,
	    margin: 0,
	    // Remove the margin in Safari
	    borderRadius: 0,
	    padding: 0,
	    // Remove the padding in Firefox
	    cursor: 'pointer',
	    userSelect: 'none',
	    verticalAlign: 'middle',
	    '-moz-appearance': 'none',
	    // Reset
	    '-webkit-appearance': 'none',
	    // Reset
	    textDecoration: 'none',
	    // So we take precedent over the style of a native <a /> element.
	    color: 'inherit',
	    '&::-moz-focus-inner': {
	      borderStyle: 'none' // Remove Firefox dotted outline.

	    },
	    '&$disabled': {
	      pointerEvents: 'none',
	      // Disable link interactions
	      cursor: 'default'
	    },
	    '@media print': {
	      colorAdjust: 'exact'
	    }
	  },

	  /* Pseudo-class applied to the root element if `disabled={true}`. */
	  disabled: {},

	  /* Pseudo-class applied to the root element if keyboard focused. */
	  focusVisible: {}
	};
	/**
	 * `ButtonBase` contains as few styles as possible.
	 * It aims to be a simple building block for creating a button.
	 * It contains a load of style reset and some focus/ripple logic.
	 */

	var ButtonBase = /*#__PURE__*/react.exports.forwardRef(function ButtonBase(props, ref) {
	  var action = props.action,
	      buttonRefProp = props.buttonRef,
	      _props$centerRipple = props.centerRipple,
	      centerRipple = _props$centerRipple === void 0 ? false : _props$centerRipple,
	      children = props.children,
	      classes = props.classes,
	      className = props.className,
	      _props$component = props.component,
	      component = _props$component === void 0 ? 'button' : _props$component,
	      _props$disabled = props.disabled,
	      disabled = _props$disabled === void 0 ? false : _props$disabled,
	      _props$disableRipple = props.disableRipple,
	      disableRipple = _props$disableRipple === void 0 ? false : _props$disableRipple,
	      _props$disableTouchRi = props.disableTouchRipple,
	      disableTouchRipple = _props$disableTouchRi === void 0 ? false : _props$disableTouchRi,
	      _props$focusRipple = props.focusRipple,
	      focusRipple = _props$focusRipple === void 0 ? false : _props$focusRipple,
	      focusVisibleClassName = props.focusVisibleClassName,
	      onBlur = props.onBlur,
	      onClick = props.onClick,
	      onFocus = props.onFocus,
	      onFocusVisible = props.onFocusVisible,
	      onKeyDown = props.onKeyDown,
	      onKeyUp = props.onKeyUp,
	      onMouseDown = props.onMouseDown,
	      onMouseLeave = props.onMouseLeave,
	      onMouseUp = props.onMouseUp,
	      onTouchEnd = props.onTouchEnd,
	      onTouchMove = props.onTouchMove,
	      onTouchStart = props.onTouchStart,
	      onDragLeave = props.onDragLeave,
	      _props$tabIndex = props.tabIndex,
	      tabIndex = _props$tabIndex === void 0 ? 0 : _props$tabIndex,
	      TouchRippleProps = props.TouchRippleProps,
	      _props$type = props.type,
	      type = _props$type === void 0 ? 'button' : _props$type,
	      other = _objectWithoutProperties(props, ["action", "buttonRef", "centerRipple", "children", "classes", "className", "component", "disabled", "disableRipple", "disableTouchRipple", "focusRipple", "focusVisibleClassName", "onBlur", "onClick", "onFocus", "onFocusVisible", "onKeyDown", "onKeyUp", "onMouseDown", "onMouseLeave", "onMouseUp", "onTouchEnd", "onTouchMove", "onTouchStart", "onDragLeave", "tabIndex", "TouchRippleProps", "type"]);

	  var buttonRef = react.exports.useRef(null);

	  function getButtonNode() {
	    // #StrictMode ready
	    return reactDom.exports.findDOMNode(buttonRef.current);
	  }

	  var rippleRef = react.exports.useRef(null);

	  var _React$useState = react.exports.useState(false),
	      focusVisible = _React$useState[0],
	      setFocusVisible = _React$useState[1];

	  if (disabled && focusVisible) {
	    setFocusVisible(false);
	  }

	  var _useIsFocusVisible = useIsFocusVisible(),
	      isFocusVisible = _useIsFocusVisible.isFocusVisible,
	      onBlurVisible = _useIsFocusVisible.onBlurVisible,
	      focusVisibleRef = _useIsFocusVisible.ref;

	  react.exports.useImperativeHandle(action, function () {
	    return {
	      focusVisible: function focusVisible() {
	        setFocusVisible(true);
	        buttonRef.current.focus();
	      }
	    };
	  }, []);
	  react.exports.useEffect(function () {
	    if (focusVisible && focusRipple && !disableRipple) {
	      rippleRef.current.pulsate();
	    }
	  }, [disableRipple, focusRipple, focusVisible]);

	  function useRippleHandler(rippleAction, eventCallback) {
	    var skipRippleAction = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : disableTouchRipple;
	    return useEventCallback(function (event) {
	      if (eventCallback) {
	        eventCallback(event);
	      }

	      var ignore = skipRippleAction;

	      if (!ignore && rippleRef.current) {
	        rippleRef.current[rippleAction](event);
	      }

	      return true;
	    });
	  }

	  var handleMouseDown = useRippleHandler('start', onMouseDown);
	  var handleDragLeave = useRippleHandler('stop', onDragLeave);
	  var handleMouseUp = useRippleHandler('stop', onMouseUp);
	  var handleMouseLeave = useRippleHandler('stop', function (event) {
	    if (focusVisible) {
	      event.preventDefault();
	    }

	    if (onMouseLeave) {
	      onMouseLeave(event);
	    }
	  });
	  var handleTouchStart = useRippleHandler('start', onTouchStart);
	  var handleTouchEnd = useRippleHandler('stop', onTouchEnd);
	  var handleTouchMove = useRippleHandler('stop', onTouchMove);
	  var handleBlur = useRippleHandler('stop', function (event) {
	    if (focusVisible) {
	      onBlurVisible(event);
	      setFocusVisible(false);
	    }

	    if (onBlur) {
	      onBlur(event);
	    }
	  }, false);
	  var handleFocus = useEventCallback(function (event) {
	    // Fix for https://github.com/facebook/react/issues/7769
	    if (!buttonRef.current) {
	      buttonRef.current = event.currentTarget;
	    }

	    if (isFocusVisible(event)) {
	      setFocusVisible(true);

	      if (onFocusVisible) {
	        onFocusVisible(event);
	      }
	    }

	    if (onFocus) {
	      onFocus(event);
	    }
	  });

	  var isNonNativeButton = function isNonNativeButton() {
	    var button = getButtonNode();
	    return component && component !== 'button' && !(button.tagName === 'A' && button.href);
	  };
	  /**
	   * IE 11 shim for https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/repeat
	   */


	  var keydownRef = react.exports.useRef(false);
	  var handleKeyDown = useEventCallback(function (event) {
	    // Check if key is already down to avoid repeats being counted as multiple activations
	    if (focusRipple && !keydownRef.current && focusVisible && rippleRef.current && event.key === ' ') {
	      keydownRef.current = true;
	      event.persist();
	      rippleRef.current.stop(event, function () {
	        rippleRef.current.start(event);
	      });
	    }

	    if (event.target === event.currentTarget && isNonNativeButton() && event.key === ' ') {
	      event.preventDefault();
	    }

	    if (onKeyDown) {
	      onKeyDown(event);
	    } // Keyboard accessibility for non interactive elements


	    if (event.target === event.currentTarget && isNonNativeButton() && event.key === 'Enter' && !disabled) {
	      event.preventDefault();

	      if (onClick) {
	        onClick(event);
	      }
	    }
	  });
	  var handleKeyUp = useEventCallback(function (event) {
	    // calling preventDefault in keyUp on a <button> will not dispatch a click event if Space is pressed
	    // https://codesandbox.io/s/button-keyup-preventdefault-dn7f0
	    if (focusRipple && event.key === ' ' && rippleRef.current && focusVisible && !event.defaultPrevented) {
	      keydownRef.current = false;
	      event.persist();
	      rippleRef.current.stop(event, function () {
	        rippleRef.current.pulsate(event);
	      });
	    }

	    if (onKeyUp) {
	      onKeyUp(event);
	    } // Keyboard accessibility for non interactive elements


	    if (onClick && event.target === event.currentTarget && isNonNativeButton() && event.key === ' ' && !event.defaultPrevented) {
	      onClick(event);
	    }
	  });
	  var ComponentProp = component;

	  if (ComponentProp === 'button' && other.href) {
	    ComponentProp = 'a';
	  }

	  var buttonProps = {};

	  if (ComponentProp === 'button') {
	    buttonProps.type = type;
	    buttonProps.disabled = disabled;
	  } else {
	    if (ComponentProp !== 'a' || !other.href) {
	      buttonProps.role = 'button';
	    }

	    buttonProps['aria-disabled'] = disabled;
	  }

	  var handleUserRef = useForkRef(buttonRefProp, ref);
	  var handleOwnRef = useForkRef(focusVisibleRef, buttonRef);
	  var handleRef = useForkRef(handleUserRef, handleOwnRef);

	  var _React$useState2 = react.exports.useState(false),
	      mountedState = _React$useState2[0],
	      setMountedState = _React$useState2[1];

	  react.exports.useEffect(function () {
	    setMountedState(true);
	  }, []);
	  var enableTouchRipple = mountedState && !disableRipple && !disabled;

	  return /*#__PURE__*/react.exports.createElement(ComponentProp, _extends({
	    className: clsx(classes.root, className, focusVisible && [classes.focusVisible, focusVisibleClassName], disabled && classes.disabled),
	    onBlur: handleBlur,
	    onClick: onClick,
	    onFocus: handleFocus,
	    onKeyDown: handleKeyDown,
	    onKeyUp: handleKeyUp,
	    onMouseDown: handleMouseDown,
	    onMouseLeave: handleMouseLeave,
	    onMouseUp: handleMouseUp,
	    onDragLeave: handleDragLeave,
	    onTouchEnd: handleTouchEnd,
	    onTouchMove: handleTouchMove,
	    onTouchStart: handleTouchStart,
	    ref: handleRef,
	    tabIndex: disabled ? -1 : tabIndex
	  }, buttonProps, other), children, enableTouchRipple ?
	  /*#__PURE__*/

	  /* TouchRipple is only needed client-side, x2 boost on the server. */
	  react.exports.createElement(TouchRipple$1, _extends({
	    ref: rippleRef,
	    center: centerRipple
	  }, TouchRippleProps)) : null);
	});
	var ButtonBase$1 = withStyles(styles$5, {
	  name: 'MuiButtonBase'
	})(ButtonBase);

	var styles$4 = function styles(theme) {
	  return {
	    /* Styles applied to the root element. */
	    root: {
	      textAlign: 'center',
	      flex: '0 0 auto',
	      fontSize: theme.typography.pxToRem(24),
	      padding: 12,
	      borderRadius: '50%',
	      overflow: 'visible',
	      // Explicitly set the default value to solve a bug on IE 11.
	      color: theme.palette.action.active,
	      transition: theme.transitions.create('background-color', {
	        duration: theme.transitions.duration.shortest
	      }),
	      '&:hover': {
	        backgroundColor: alpha(theme.palette.action.active, theme.palette.action.hoverOpacity),
	        // Reset on touch devices, it doesn't add specificity
	        '@media (hover: none)': {
	          backgroundColor: 'transparent'
	        }
	      },
	      '&$disabled': {
	        backgroundColor: 'transparent',
	        color: theme.palette.action.disabled
	      }
	    },

	    /* Styles applied to the root element if `edge="start"`. */
	    edgeStart: {
	      marginLeft: -12,
	      '$sizeSmall&': {
	        marginLeft: -3
	      }
	    },

	    /* Styles applied to the root element if `edge="end"`. */
	    edgeEnd: {
	      marginRight: -12,
	      '$sizeSmall&': {
	        marginRight: -3
	      }
	    },

	    /* Styles applied to the root element if `color="inherit"`. */
	    colorInherit: {
	      color: 'inherit'
	    },

	    /* Styles applied to the root element if `color="primary"`. */
	    colorPrimary: {
	      color: theme.palette.primary.main,
	      '&:hover': {
	        backgroundColor: alpha(theme.palette.primary.main, theme.palette.action.hoverOpacity),
	        // Reset on touch devices, it doesn't add specificity
	        '@media (hover: none)': {
	          backgroundColor: 'transparent'
	        }
	      }
	    },

	    /* Styles applied to the root element if `color="secondary"`. */
	    colorSecondary: {
	      color: theme.palette.secondary.main,
	      '&:hover': {
	        backgroundColor: alpha(theme.palette.secondary.main, theme.palette.action.hoverOpacity),
	        // Reset on touch devices, it doesn't add specificity
	        '@media (hover: none)': {
	          backgroundColor: 'transparent'
	        }
	      }
	    },

	    /* Pseudo-class applied to the root element if `disabled={true}`. */
	    disabled: {},

	    /* Styles applied to the root element if `size="small"`. */
	    sizeSmall: {
	      padding: 3,
	      fontSize: theme.typography.pxToRem(18)
	    },

	    /* Styles applied to the children container element. */
	    label: {
	      width: '100%',
	      display: 'flex',
	      alignItems: 'inherit',
	      justifyContent: 'inherit'
	    }
	  };
	};
	/**
	 * Refer to the [Icons](/components/icons/) section of the documentation
	 * regarding the available icon options.
	 */

	var IconButton = /*#__PURE__*/react.exports.forwardRef(function IconButton(props, ref) {
	  var _props$edge = props.edge,
	      edge = _props$edge === void 0 ? false : _props$edge,
	      children = props.children,
	      classes = props.classes,
	      className = props.className,
	      _props$color = props.color,
	      color = _props$color === void 0 ? 'default' : _props$color,
	      _props$disabled = props.disabled,
	      disabled = _props$disabled === void 0 ? false : _props$disabled,
	      _props$disableFocusRi = props.disableFocusRipple,
	      disableFocusRipple = _props$disableFocusRi === void 0 ? false : _props$disableFocusRi,
	      _props$size = props.size,
	      size = _props$size === void 0 ? 'medium' : _props$size,
	      other = _objectWithoutProperties(props, ["edge", "children", "classes", "className", "color", "disabled", "disableFocusRipple", "size"]);

	  return /*#__PURE__*/react.exports.createElement(ButtonBase$1, _extends({
	    className: clsx(classes.root, className, color !== 'default' && classes["color".concat(capitalize(color))], disabled && classes.disabled, size === "small" && classes["size".concat(capitalize(size))], {
	      'start': classes.edgeStart,
	      'end': classes.edgeEnd
	    }[edge]),
	    centerRipple: true,
	    focusRipple: !disableFocusRipple,
	    disabled: disabled,
	    ref: ref
	  }, other), /*#__PURE__*/react.exports.createElement("span", {
	    className: classes.label
	  }, children));
	});
	var IconButton$1 = withStyles(styles$4, {
	  name: 'MuiIconButton'
	})(IconButton);

	var styles$3 = {
	  root: {
	    padding: 9
	  },
	  checked: {},
	  disabled: {},
	  input: {
	    cursor: 'inherit',
	    position: 'absolute',
	    opacity: 0,
	    width: '100%',
	    height: '100%',
	    top: 0,
	    left: 0,
	    margin: 0,
	    padding: 0,
	    zIndex: 1
	  }
	};
	/**
	 * @ignore - internal component.
	 */

	var SwitchBase = /*#__PURE__*/react.exports.forwardRef(function SwitchBase(props, ref) {
	  var autoFocus = props.autoFocus,
	      checkedProp = props.checked,
	      checkedIcon = props.checkedIcon,
	      classes = props.classes,
	      className = props.className,
	      defaultChecked = props.defaultChecked,
	      disabledProp = props.disabled,
	      icon = props.icon,
	      id = props.id,
	      inputProps = props.inputProps,
	      inputRef = props.inputRef,
	      name = props.name,
	      onBlur = props.onBlur,
	      onChange = props.onChange,
	      onFocus = props.onFocus,
	      readOnly = props.readOnly,
	      required = props.required,
	      tabIndex = props.tabIndex,
	      type = props.type,
	      value = props.value,
	      other = _objectWithoutProperties(props, ["autoFocus", "checked", "checkedIcon", "classes", "className", "defaultChecked", "disabled", "icon", "id", "inputProps", "inputRef", "name", "onBlur", "onChange", "onFocus", "readOnly", "required", "tabIndex", "type", "value"]);

	  var _useControlled = useControlled({
	    controlled: checkedProp,
	    default: Boolean(defaultChecked),
	    name: 'SwitchBase',
	    state: 'checked'
	  }),
	      _useControlled2 = _slicedToArray(_useControlled, 2),
	      checked = _useControlled2[0],
	      setCheckedState = _useControlled2[1];

	  var muiFormControl = useFormControl();

	  var handleFocus = function handleFocus(event) {
	    if (onFocus) {
	      onFocus(event);
	    }

	    if (muiFormControl && muiFormControl.onFocus) {
	      muiFormControl.onFocus(event);
	    }
	  };

	  var handleBlur = function handleBlur(event) {
	    if (onBlur) {
	      onBlur(event);
	    }

	    if (muiFormControl && muiFormControl.onBlur) {
	      muiFormControl.onBlur(event);
	    }
	  };

	  var handleInputChange = function handleInputChange(event) {
	    var newChecked = event.target.checked;
	    setCheckedState(newChecked);

	    if (onChange) {
	      // TODO v5: remove the second argument.
	      onChange(event, newChecked);
	    }
	  };

	  var disabled = disabledProp;

	  if (muiFormControl) {
	    if (typeof disabled === 'undefined') {
	      disabled = muiFormControl.disabled;
	    }
	  }

	  var hasLabelFor = type === 'checkbox' || type === 'radio';
	  return /*#__PURE__*/react.exports.createElement(IconButton$1, _extends({
	    component: "span",
	    className: clsx(classes.root, className, checked && classes.checked, disabled && classes.disabled),
	    disabled: disabled,
	    tabIndex: null,
	    role: undefined,
	    onFocus: handleFocus,
	    onBlur: handleBlur,
	    ref: ref
	  }, other), /*#__PURE__*/react.exports.createElement("input", _extends({
	    autoFocus: autoFocus,
	    checked: checkedProp,
	    defaultChecked: defaultChecked,
	    className: classes.input,
	    disabled: disabled,
	    id: hasLabelFor && id,
	    name: name,
	    onChange: handleInputChange,
	    readOnly: readOnly,
	    ref: inputRef,
	    required: required,
	    tabIndex: tabIndex,
	    type: type,
	    value: value
	  }, inputProps)), checked ? checkedIcon : icon);
	}); // NB: If changed, please update Checkbox, Switch and Radio
	var SwitchBase$1 = withStyles(styles$3, {
	  name: 'PrivateSwitchBase'
	})(SwitchBase);

	/**
	 * @ignore - internal component.
	 */

	var CheckBoxOutlineBlankIcon = createSvgIcon$1( /*#__PURE__*/react.exports.createElement("path", {
	  d: "M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"
	}));

	/**
	 * @ignore - internal component.
	 */

	var CheckBoxIcon = createSvgIcon$1( /*#__PURE__*/react.exports.createElement("path", {
	  d: "M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.11 0 2-.9 2-2V5c0-1.1-.89-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
	}));

	/**
	 * @ignore - internal component.
	 */

	var IndeterminateCheckBoxIcon = createSvgIcon$1( /*#__PURE__*/react.exports.createElement("path", {
	  d: "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10H7v-2h10v2z"
	}));

	var styles$2 = function styles(theme) {
	  return {
	    /* Styles applied to the root element. */
	    root: {
	      color: theme.palette.text.secondary
	    },

	    /* Pseudo-class applied to the root element if `checked={true}`. */
	    checked: {},

	    /* Pseudo-class applied to the root element if `disabled={true}`. */
	    disabled: {},

	    /* Pseudo-class applied to the root element if `indeterminate={true}`. */
	    indeterminate: {},

	    /* Styles applied to the root element if `color="primary"`. */
	    colorPrimary: {
	      '&$checked': {
	        color: theme.palette.primary.main,
	        '&:hover': {
	          backgroundColor: alpha(theme.palette.primary.main, theme.palette.action.hoverOpacity),
	          // Reset on touch devices, it doesn't add specificity
	          '@media (hover: none)': {
	            backgroundColor: 'transparent'
	          }
	        }
	      },
	      '&$disabled': {
	        color: theme.palette.action.disabled
	      }
	    },

	    /* Styles applied to the root element if `color="secondary"`. */
	    colorSecondary: {
	      '&$checked': {
	        color: theme.palette.secondary.main,
	        '&:hover': {
	          backgroundColor: alpha(theme.palette.secondary.main, theme.palette.action.hoverOpacity),
	          // Reset on touch devices, it doesn't add specificity
	          '@media (hover: none)': {
	            backgroundColor: 'transparent'
	          }
	        }
	      },
	      '&$disabled': {
	        color: theme.palette.action.disabled
	      }
	    }
	  };
	};
	var defaultCheckedIcon$1 = /*#__PURE__*/react.exports.createElement(CheckBoxIcon, null);
	var defaultIcon$1 = /*#__PURE__*/react.exports.createElement(CheckBoxOutlineBlankIcon, null);
	var defaultIndeterminateIcon = /*#__PURE__*/react.exports.createElement(IndeterminateCheckBoxIcon, null);
	var Checkbox = /*#__PURE__*/react.exports.forwardRef(function Checkbox(props, ref) {
	  var _props$checkedIcon = props.checkedIcon,
	      checkedIcon = _props$checkedIcon === void 0 ? defaultCheckedIcon$1 : _props$checkedIcon,
	      classes = props.classes,
	      _props$color = props.color,
	      color = _props$color === void 0 ? 'secondary' : _props$color,
	      _props$icon = props.icon,
	      iconProp = _props$icon === void 0 ? defaultIcon$1 : _props$icon,
	      _props$indeterminate = props.indeterminate,
	      indeterminate = _props$indeterminate === void 0 ? false : _props$indeterminate,
	      _props$indeterminateI = props.indeterminateIcon,
	      indeterminateIconProp = _props$indeterminateI === void 0 ? defaultIndeterminateIcon : _props$indeterminateI,
	      inputProps = props.inputProps,
	      _props$size = props.size,
	      size = _props$size === void 0 ? 'medium' : _props$size,
	      other = _objectWithoutProperties(props, ["checkedIcon", "classes", "color", "icon", "indeterminate", "indeterminateIcon", "inputProps", "size"]);

	  var icon = indeterminate ? indeterminateIconProp : iconProp;
	  var indeterminateIcon = indeterminate ? indeterminateIconProp : checkedIcon;
	  return /*#__PURE__*/react.exports.createElement(SwitchBase$1, _extends({
	    type: "checkbox",
	    classes: {
	      root: clsx(classes.root, classes["color".concat(capitalize(color))], indeterminate && classes.indeterminate),
	      checked: classes.checked,
	      disabled: classes.disabled
	    },
	    color: color,
	    inputProps: _extends({
	      'data-indeterminate': indeterminate
	    }, inputProps),
	    icon: /*#__PURE__*/react.exports.cloneElement(icon, {
	      fontSize: icon.props.fontSize === undefined && size === "small" ? size : icon.props.fontSize
	    }),
	    checkedIcon: /*#__PURE__*/react.exports.cloneElement(indeterminateIcon, {
	      fontSize: indeterminateIcon.props.fontSize === undefined && size === "small" ? size : indeterminateIcon.props.fontSize
	    }),
	    ref: ref
	  }, other));
	});
	var Checkbox$1 = withStyles(styles$2, {
	  name: 'MuiCheckbox'
	})(Checkbox);

	const mapStateToProps$2 = state => {
	  return {
	    session: state
	  };
	};
	const mapDispatchToProps$2 = dispatch => {
	  return {
	    onLoading: () => {
	      dispatch({
	        type: 'LOADING'
	      });
	    },
	    onLoadingFinished: () => {
	      dispatch({
	        type: 'LOADING_DONE'
	      });
	    },
	    onWizard: () => {
	      dispatch({
	        type: 'IS_SETUP_WIZARD'
	      });
	    },
	    onAvailableNextButton: () => {
	      dispatch({
	        type: 'NEXT_BUTTON_AVAILABLE'
	      });
	    },
	    onUnAvailableNextButton: () => {
	      dispatch({
	        type: 'NEXT_BUTTON_UNAVAILABLE'
	      });
	    },
	    onAvailableSkipButton: () => {
	      dispatch({
	        type: 'SKIP_BUTTON_AVAILABLE'
	      });
	    },
	    onUnAvailableSkipButton: () => {
	      dispatch({
	        type: 'SKIP_BUTTON_UNAVAILABLE'
	      });
	    },
	    onPluginsInstalling: () => {
	      dispatch({
	        type: 'ON_PLUGINS_INSTALLING'
	      });
	    },
	    onPluginsInstalled: () => {
	      dispatch({
	        type: 'ON_PLUGINS_INSTALLED'
	      });
	    }
	  };
	};
	class PluginManagerContainer extends React$1.Component {
	  constructor(props) {
	    // this makes the this
	    super(props);
	    _defineProperty$1(this, "timer", null);
	    _defineProperty$1(this, "interval", null);
	    _defineProperty$1(this, "handlePluginSelect", plugin_slug => event => {
	      let component = this,
	        plugins = component.state.plugins;
	      plugins[plugin_slug].selected = event.target.checked;
	      component.setState({
	        plugins: plugins
	      });

	      // We need to rerender the entire plugins components, so the step button will update.
	      if (component.props.onRender && window.location.search.indexOf('setup-wizard') > -1) {
	        component.props.onRender(plugins);
	      }
	    });
	    this.state = {
	      plugins: this.standardizePlugins(get_1(pixassist, 'themeConfig.pluginManager.tgmpaPlugins', {})),
	      enableIndividualActions: true,
	      groupByRequired: false,
	      ready: false
	    };

	    // we need a callback queue system in order to execute the plugin actions in order.
	    this.queue = new Helpers.Queue();
	    if (!isUndefined_1(this.props.enableIndividualActions)) {
	      this.state.enableIndividualActions = this.props.enableIndividualActions;
	    }
	    if (!isUndefined_1(this.props.groupByRequired)) {
	      this.state.groupByRequired = this.props.groupByRequired;
	    }
	    this.getPluginStatus = this.getPluginStatus.bind(this);
	    this.handlePluginTrigger = this.handlePluginTrigger.bind(this);
	    this.activatePlugin = this.activatePlugin.bind(this);
	    this.eventInstallPlugin = this.eventInstallPlugin.bind(this);
	    this.eventActivatePlugin = this.eventActivatePlugin.bind(this);
	    this.eventUpdatePlugin = this.eventUpdatePlugin.bind(this);
	    this.createPseudoUpdateElement = this.createPseudoUpdateElement.bind(this);
	    this.markPluginAsActive = this.markPluginAsActive.bind(this);
	    this.updatePluginsList = this.updatePluginsList.bind(this);
	    this.handlePluginSelect = this.handlePluginSelect.bind(this);
	  }
	  render() {
	    let component = this,
	      sortedPluginSlugs = [];
	    if (!isUndefined_1(this.state.plugins) && !isEmpty_1(this.state.plugins)) {
	      sortedPluginSlugs = Object.keys(this.state.plugins);
	      // First, we want to sort plugins by their order, ascending.
	      sortedPluginSlugs.sort(function (a, b) {
	        if (isNil_1(component.state.plugins[a].order)) {
	          component.state.plugins[a].order = 10;
	        } else {
	          component.state.plugins[a].order = toNumber_1(component.state.plugins[a].order);
	        }
	        if (isNil_1(component.state.plugins[b].order)) {
	          component.state.plugins[b].order = 10;
	        } else {
	          component.state.plugins[b].order = toNumber_1(component.state.plugins[b].order);
	        }
	        if (component.state.plugins[a].order < component.state.plugins[b].order) {
	          return -1;
	        }
	        if (component.state.plugins[a].order > component.state.plugins[b].order) {
	          return 1;
	        }
	        return 0;
	      });

	      // Second, we want to sort plugins by their required status. First the required ones, and then the recommended ones.
	      sortedPluginSlugs.sort(function (a, b) {
	        if (component.state.plugins[a].required && !component.state.plugins[b].required) {
	          return -1;
	        }
	        if (!component.state.plugins[a].required && component.state.plugins[b].required) {
	          return 1;
	        }
	        return 0;
	      });
	    }
	    let containerClasses = "plugins";
	    if (!component.state.enableIndividualActions) {
	      containerClasses += "  no-individual-actions no-status-icons";
	    }
	    let currentRequiredGroup = false;
	    return /*#__PURE__*/React$1.createElement("div", {
	      className: containerClasses
	    }, !isEmpty_1(sortedPluginSlugs) ? sortedPluginSlugs.map(function (plugin_slug, j) {
	      if ('pixelgrade-care' === plugin_slug) {
	        // we should not reinstall or change the Pixelgrade Care plugin
	        return true;
	      }
	      let plugin = component.state.plugins[plugin_slug],
	        status = component.getPluginStatus(plugin),
	        boxClasses = "plugin  box",
	        action = '';
	      switch (status) {
	        case 'active':
	          boxClasses += "  box--plugin-validated";
	          break;
	        case 'outdated':
	          // We will not mark plugins as invalid when they have an update available and individual actions are not enabled.
	          if (!component.state.enableIndividualActions) {
	            boxClasses += "  box--plugin-validated";
	            break;
	          }
	          if (plugin.required) {
	            boxClasses += "  box--plugin-invalidated";
	            if (component.state.enableIndividualActions) {
	              boxClasses += "  box--warning";
	            } else {
	              boxClasses += "  box--neutral";
	            }
	          } else {
	            boxClasses += "  box--neutral";
	          }

	          /** For each plugin we need a <tr> element to trick shiny the updates system **/
	          let action_available = component.createPseudoUpdateElement(plugin.slug);
	          action = /*#__PURE__*/React$1.createElement("button", {
	            onClick: component.eventUpdatePlugin,
	            className: "btn  btn--action  btn--small",
	            "data-available": action_available
	          }, Helpers.decodeHtml(get_1(pixassist, 'themeConfig.pluginManager.l10n.updateButton', '')));
	          break;
	        case 'inactive':
	          if (plugin.required) {
	            boxClasses += "  box--plugin-invalidated";
	            if (component.state.enableIndividualActions) {
	              boxClasses += "  box--warning";
	            } else {
	              boxClasses += "  box--neutral";
	            }
	          } else {
	            boxClasses += "  box--neutral";
	          }
	          action = /*#__PURE__*/React$1.createElement("button", {
	            onClick: component.eventActivatePlugin,
	            className: "btn  btn--action  btn--small"
	          }, Helpers.decodeHtml(get_1(pixassist, 'themeConfig.l10n.pluginActivateLabel', '')));
	          break;
	        case 'missing':
	          if (plugin.required) {
	            if (component.state.enableIndividualActions) {
	              boxClasses += "  box--warning";
	            } else {
	              boxClasses += "  box--neutral";
	            }
	            boxClasses += "  box--plugin-invalidated";
	          } else {
	            boxClasses += "  box--neutral";
	          }
	          action = /*#__PURE__*/React$1.createElement("button", {
	            onClick: component.eventInstallPlugin,
	            className: "btn  btn--action  btn--small"
	          }, Helpers.decodeHtml(get_1(pixassist, 'themeConfig.l10n.pluginInstallLabel', '')));
	          break;
	      }
	      let data_activate_url = '',
	        data_install_url = '',
	        data_source_type = 'repo',
	        // By default we assume plugins are from the WordPress.org repo.
	        plugin_author = '';
	      if (!isNil_1(plugin.install_url)) {
	        data_install_url = plugin.install_url.replace(/&amp;/g, '&');
	      }
	      if (!isNil_1(plugin.activate_url)) {
	        data_activate_url = plugin.activate_url.replace(/&amp;/g, '&');
	      }
	      if (!!plugin.author) {
	        plugin_author = /*#__PURE__*/React$1.createElement("span", {
	          className: "plugin-author"
	        }, " by ", plugin.author);
	      }
	      let checkbox = '',
	        cta = '';
	      // If the individual actions are not enabled, then it means we treat the plugins as a list, so we need to add checkboxes to each.
	      if (!component.state.enableIndividualActions) {
	        let checkboxDisabled = false;
	        if (plugin.required) {
	          // If this is a required plugin, disable the checkbox.
	          checkboxDisabled = true;
	        } else if ('active' === status || 'outdated' === status) {
	          // If this plugin is already active, or is outdated (still active), disable the checkbox as we will do nothing to it.
	          checkboxDisabled = true;
	        }
	        checkbox = /*#__PURE__*/React$1.createElement("div", {
	          className: "box__checkbox"
	        }, /*#__PURE__*/React$1.createElement(Checkbox$1, {
	          disabled: checkboxDisabled,
	          checked: plugin.selected,
	          onChange: component.handlePluginSelect(plugin_slug),
	          value: plugin_slug,
	          color: "primary"
	        }));
	      } else {
	        cta = /*#__PURE__*/React$1.createElement("div", {
	          className: "box__cta"
	        }, action);
	      }
	      let groupLabel = '';
	      if (component.state.groupByRequired) {
	        const pluginGroup = plugin.required ? 'required' : 'recommended';

	        // We start a new group and output the label.
	        if (currentRequiredGroup !== pluginGroup) {
	          currentRequiredGroup = pluginGroup;
	          groupLabel = /*#__PURE__*/React$1.createElement("p", {
	            className: "required-group__label  required-group--" + pluginGroup
	          }, Helpers.decodeHtml(get_1(pixassist, 'themeConfig.pluginManager.l10n.groupByRequiredLabels.' + currentRequiredGroup, '')));
	        }
	      }
	      return /*#__PURE__*/React$1.createElement(React$1.Fragment, {
	        key: plugin_slug
	      }, groupLabel, /*#__PURE__*/React$1.createElement("div", {
	        className: boxClasses,
	        "data-status": status,
	        "data-source_type": data_source_type,
	        "data-slug": plugin.slug,
	        "data-real_slug": plugin.file_path,
	        "data-activate_url": data_activate_url,
	        "data-install_url": data_install_url
	      }, checkbox, /*#__PURE__*/React$1.createElement("div", {
	        className: "box__body"
	      }, /*#__PURE__*/React$1.createElement("h5", {
	        className: "box__title"
	      }, plugin.name, plugin_author), /*#__PURE__*/React$1.createElement("p", {
	        className: "box__text",
	        dangerouslySetInnerHTML: {
	          __html: plugin.description
	        }
	      })), cta));
	    }) : /*#__PURE__*/React$1.createElement("div", {
	      className: "plugin-manager__empty box box--neutral"
	    }, /*#__PURE__*/React$1.createElement("div", {
	      className: "box__body"
	    }, /*#__PURE__*/React$1.createElement("h5", {
	      className: "box__title"
	    }, Helpers.decodeHtml(get_1(pixassist, 'themeConfig.pluginManager.l10n.noPluginsTitle', 'You are all set'))), /*#__PURE__*/React$1.createElement("p", {
	      className: "box__text"
	    }, Helpers.decodeHtml(get_1(pixassist, 'themeConfig.pluginManager.l10n.noPlugins', 'There are no recommended plugins for this theme right now.'))))));
	  }
	  componentDidMount() {
	    let component = this;
	    let componentNode = ReactDOM.findDOMNode(this),
	      plugins = componentNode.getElementsByClassName('plugin');
	    if (plugins.length > 0) {
	      // Listen for the event to start the action for each plugin.
	      for (var i = 0; i < plugins.length; i++) {
	        plugins[i].addEventListener('handle_plugin', component.handlePluginTrigger);
	      }
	    }

	    // add an event listener for the localized pixassist data change
	    window.addEventListener('localizedChanged', component.updatePluginsList);
	  }
	  UNSAFE_componentWillMount() {
	    let component = this;
	    if (component.props.onRender) {
	      component.props.onRender(get_1(this.state, 'plugins', {}));
	    }
	    component.checkPluginsReady();
	  }
	  componentWillUnmount() {
	    let component = this;

	    // Make sure to remove the DOM listener when the component is unmounted
	    let componentNode = ReactDOM.findDOMNode(this),
	      plugins = componentNode.getElementsByClassName('plugin');
	    if (size_1(plugins)) {
	      for (var i = 0; i < size_1(plugins); i++) {
	        plugins[i].removeEventListener('handle_plugin', component.handlePluginTrigger);
	      }
	    }
	    window.removeEventListener('localizedChanged', component.updatePluginsList);
	  }
	  componentDidUpdate(nextProps, nextState, nextContext) {
	    this.checkPluginsReady();
	  }
	  standardizePlugins(plugins) {
	    if (isEmpty_1(plugins)) {
	      return plugins;
	    }

	    // Regardless if have individual actions, we treat plugins as a list to choose from (i.e. with checkboxes) and all need to be selected or not.
	    let pluginSlugs = Object.keys(plugins);
	    for (let idx = 0; idx < pluginSlugs.length; idx++) {
	      // If we are in the dashboard, all are selected because they have individual controls.
	      if (!(window.location.search.indexOf('setup-wizard') > -1)) {
	        plugins[pluginSlugs[idx]].selected = true;
	        continue;
	      }

	      // Required plugins are always selected.
	      if (plugins[pluginSlugs[idx]].required) {
	        plugins[pluginSlugs[idx]].selected = true;
	      } else if (typeof plugins[pluginSlugs[idx]].selected === "undefined") {
	        // Recommended plugins are not selected by default, unless they come with the selected state already.
	        plugins[pluginSlugs[idx]].selected = false;
	      }

	      // Regardless of selected initial state, we have a few cases when a plugin is selected no matter what. Like when it is active.
	      let status = this.getPluginStatus(plugins[pluginSlugs[idx]]);
	      if ('active' === status || 'outdated' === status) {
	        plugins[pluginSlugs[idx]].selected = true;
	      }
	    }
	    return plugins;
	  }
	  updatePluginsList(event) {
	    let component = this;
	    component.setState({
	      plugins: component.standardizePlugins(get_1(pixassist, 'themeConfig.pluginManager.tgmpaPlugins', {}))
	    });
	    component.checkPluginsReady();
	  }
	  checkPluginsReady() {
	    let plugins_ready = true,
	      component = this;
	    if (!size_1(this.state.plugins)) {
	      plugins_ready = false;
	    }
	    if (!isUndefined_1(this.state.plugins)) {
	      Object.keys(this.state.plugins).map(function (i, j) {
	        var plugin = component.state.plugins[i];
	        if (!get_1(plugin, 'is_active', false) && plugin.selected) {
	          plugins_ready = false;
	        }

	        // In case of failure we will mark the plugin as ready, but only in the setup wizard so the continue button becomes available.
	        if (window.location.search.indexOf('setup-wizard') > -1) {
	          if (!!get_1(plugin, 'is_failed', false) && plugin.selected) {
	            plugins_ready = true;
	          }
	        }
	      });
	    }
	    if (isUndefined_1(this.state.plugins) || isEmpty_1(this.state.plugins)) {
	      plugins_ready = true;
	    }
	    if (plugins_ready === true && !this.state.ready) {
	      this.setState({
	        ready: true
	      });
	      this.props.onReady();
	    }
	    if (plugins_ready === false && this.state.ready) {
	      this.setState({
	        ready: false
	      });
	    }
	  }

	  /**
	   * @param ev
	   * @returns {boolean}
	   */
	  handlePluginTrigger(ev) {
	    let component = this,
	      plugin_el = ev.target,
	      $plugin = jQuery(ev.target),
	      slug = $plugin.data('slug'),
	      status = component.getPluginStatus(component.state.plugins[slug]),
	      activate_url = $plugin.data('activate_url');

	    // Even if we don't show checkboxes (enableIndividualActions is true), plugins should still pe selected.
	    if (!component.state.plugins[slug].selected) {
	      return false;
	    }
	    if (status === 'missing') {
	      this.installPlugin(plugin_el);
	      return false;
	    }
	    if (status === 'outdated' && !(window.location.search.indexOf('setup-wizard') > -1)) {
	      this.updatePlugin(plugin_el, activate_url);
	      return false;
	    }
	    if (!(status === 'active' || status === 'outdated')) {
	      this.activatePlugin(plugin_el, activate_url);
	    } else {
	      this.markPluginAsActive($plugin.data('slug'));
	    }
	    return true;
	  }

	  /**
	   * @param plugin_el
	   */
	  installPlugin(plugin_el) {
	    var component = this,
	      $plugin = jQuery(plugin_el),
	      $text = $plugin.find('.box__text');
	    $plugin.addClass('box--plugin-invalidated box--plugin-missing').removeClass('box--warning box--neutral');
	    setTimeout(function () {
	      $text.text(Helpers.decodeHtml(get_1(pixassist, 'themeConfig.pluginManager.l10n.pluginInstallingMessage', '')));
	      $plugin.addClass('box--plugin-installing');
	    }, 200);
	    let cb = function () {
	      var self = this;
	      wp.updates.installPlugin({
	        slug: $plugin.data('slug'),
	        pixassist_plugin_install: true,
	        // We need a bulletproof way of detecting the AJAX request, server-side.
	        plugin_source_type: $plugin.data('source_type'),
	        force_tgmpa: 'load',
	        // We need to put this flag so the TGMPA will be loaded - see PixelgradeAssistant_Admin::force_load_tgmpa()

	        success: function (response) {
	          $plugin.removeClass('box--plugin-installing');
	          $plugin.addClass('box--plugin-installed');
	          component.markPluginAsInstalled($plugin.data('slug'));
	          $plugin.data('status', 'inactive');
	          if (response.activateUrl) {
	            // The plugin needs to be activated
	            component.activatePlugin(plugin_el, $plugin.data('activate_url'));
	          } else {
	            // The plugin is already active.
	            $plugin.removeClass('box--plugin-invalidated').addClass('box--plugin-validated');
	            $text.text(Helpers.decodeHtml(get_1(pixassist, 'themeConfig.pluginManager.l10n.pluginReady', '')));
	            component.markPluginAsActive($plugin.data('slug'));
	            $plugin.data('status', 'active');
	          }
	          self.next();
	        },
	        error: function (error) {
	          $plugin.removeClass('box--plugin-installing');
	          $plugin.addClass('box--error');
	          $plugin.removeClass('box--plugin-validated').addClass('box--plugin-invalidated');
	          $text.text(Helpers.decodeHtml(get_1(pixassist, 'themeConfig.pluginManager.l10n.installFailedMessage', '')));
	          component.markPluginAsFailed($plugin.data('slug'));
	          self.next();
	        }
	      });
	    };
	    component.queue.add(cb);
	  }

	  /**
	   * @param plugin_el
	   * @param url
	   */
	  activatePlugin(plugin_el, url) {
	    var component = this,
	      $plugin = jQuery(plugin_el),
	      temp = wp.ajax.settings.url,
	      $text = $plugin.find('.box__text');
	    $plugin.addClass('box--plugin-invalidated box--plugin-installed').removeClass('box--warning box--neutral');
	    setTimeout(function () {
	      $text.text(Helpers.decodeHtml(get_1(pixassist, 'themeConfig.pluginManager.l10n.pluginActivatingMessage', '')));
	      $plugin.addClass('box--plugin-activating');
	    }, 200);
	    let cb = function () {
	      var self = this;
	      wp.ajax.settings.url = url;
	      wp.ajax.send({
	        type: 'GET',
	        cache: false
	      }).always(function (response) {
	        $plugin.removeClass('box--plugin-activating');

	        // Sometimes res can be an object.
	        if (!isNil_1(response.responseText)) {
	          response = response.responseText;
	        }

	        // If we get the `Sorry, you are not allowed to access this page.` message it means that the plugin is already OK.
	        if (response.indexOf('<div id="message" class="updated"><p>') > -1 || response.indexOf('<p>' + get_1(pixassist, 'themeConfig.pluginManager.l10n.tgmpActivatedSuccessfully', '')) > -1 || response.indexOf('<p>' + get_1(pixassist, 'themeConfig.pluginManager.l10n.tgmpPluginActivated', '')) > -1 || response.indexOf('<p>' + get_1(pixassist, 'themeConfig.pluginManager.l10n.tgmpPluginAlreadyActive', '')) > -1 || response.indexOf(get_1(pixassist, 'themeConfig.pluginManager.l10n.tgmpNotAllowed', '')) > -1) {
	          $plugin.removeClass('box--plugin-invalidated').addClass('box--plugin-validated');
	          $text.text(Helpers.decodeHtml(get_1(pixassist, 'themeConfig.pluginManager.l10n.pluginReady', '')));
	          $plugin.data('status', 'active');
	          component.markPluginAsActive($plugin.data('slug'));
	        } else {
	          $plugin.addClass('box--error');
	          $plugin.removeClass('box--plugin-validated').removeClass('box--plugin-installed').addClass('box--plugin-invalidated');
	          $text.text(Helpers.decodeHtml(get_1(pixassist, 'themeConfig.pluginManager.l10n.activateFailedMessage', '')));
	          component.markPluginAsFailed($plugin.data('slug'));
	        }
	        self.next();
	      });
	      wp.ajax.settings.url = temp;
	    };
	    component.queue.add(cb);
	  }
	  updatePlugin(plugin_el, url) {
	    var component = this,
	      $plugin = jQuery(plugin_el),
	      slug = $plugin.data('slug'),
	      realPluginSlug = $plugin.data('real_slug'),
	      $text = $plugin.find('.box__text');
	    $plugin.addClass('box--plugin-invalidated box--plugin-installed').removeClass('box--warning box--neutral');
	    setTimeout(function () {
	      $text.text(Helpers.decodeHtml(get_1(pixassist, 'themeConfig.pluginManager.l10n.pluginUpdatingMessage', '')));
	      $plugin.addClass('box--plugin-updating');
	    }, 200);
	    let cb = function () {
	      var self = this;
	      let args = {
	        slug: slug,
	        plugin: realPluginSlug,
	        abort_if_destination_exists: false,
	        pixassist_plugin_update: true,
	        // We need a bulletproof way of detecting the AJAX request, server-side.
	        plugin_source_type: $plugin.data('source_type'),
	        force_tgmpa: 'load',
	        // We need to put this flag so the TGMPA will be loaded - see PixelgradeAssistant_Admin::force_load_tgmpa()
	        success: function (response) {
	          $plugin.removeClass('box--plugin-updating');
	          $plugin.removeClass('box--plugin-invalidated').addClass('box--plugin-validated');
	          $text.text(Helpers.decodeHtml(get_1(pixassist, 'themeConfig.pluginManager.l10n.pluginUpToDate', '')));
	          component.markPluginAsUpdated($plugin.data('slug'));

	          // We will always attempt to activate since we don't know if it needs to, based on the response.
	          component.activatePlugin(plugin_el, $plugin.data('activate_url'));
	          self.next();
	        },
	        error: function (e) {
	          $text.text(e.errorMessage);
	          $plugin.addClass('box--error');
	          $plugin.removeClass('box--plugin-validated').addClass('box--plugin-invalidated');
	          $plugin.removeClass('box--plugin-updating');
	          component.markPluginAsFailed(slug);
	          self.next();
	        }
	      };
	      jQuery(document).trigger('wp-plugin-updating', args);
	      wp.updates.ajax('update-plugin', args);
	    };
	    component.queue.add(cb);
	  }
	  markPluginAsInstalled(plugin) {
	    let currentPluginsState = this.state.plugins;
	    if (!isUndefined_1(currentPluginsState[plugin])) {
	      currentPluginsState[plugin].is_installed = true;
	      this.setState({
	        plugins: currentPluginsState,
	        ready: false
	      });
	    }
	  }
	  markPluginAsActive(plugin) {
	    let currentPluginsState = this.state.plugins;
	    if (!isUndefined_1(currentPluginsState[plugin])) {
	      currentPluginsState[plugin].is_active = true;
	      this.setState({
	        plugins: currentPluginsState,
	        ready: false
	      });
	    }
	  }
	  markPluginAsUpdated(plugin) {
	    let currentPluginsState = this.state.plugins;
	    if (!isUndefined_1(currentPluginsState[plugin])) {
	      currentPluginsState[plugin].is_up_to_date = true;
	      this.setState({
	        plugins: currentPluginsState,
	        ready: false
	      });
	    }
	  }
	  markPluginAsFailed(plugin) {
	    let currentPluginsState = this.state.plugins;
	    if (!isUndefined_1(currentPluginsState[plugin])) {
	      currentPluginsState[plugin].is_failed = true;
	      this.setState({
	        plugins: currentPluginsState,
	        ready: false
	      });
	    }
	  }

	  /**
	   * @param e
	   * @private
	   */
	  eventInstallPlugin(e) {
	    let $target = jQuery(e.target),
	      plugin = $target.parents('.box'),
	      event;
	    wp.updates.maybeRequestFilesystemCredentials(e);

	    // Hide the button
	    if ($target.is('button')) {
	      $target.fadeOut();
	    }
	    if (window.CustomEvent) {
	      event = new CustomEvent('handle_plugin', {
	        detail: {
	          action: 'install'
	        }
	      });
	    } else {
	      event = document.createEvent('CustomEvent');
	      event.initCustomEvent('handle_plugin', true, true, {
	        action: 'install'
	      });
	    }
	    if (size_1(plugin)) {
	      plugin = Helpers.getFirstItem(plugin);
	      // debugger;
	      plugin.dispatchEvent(event);
	    }
	  }

	  /**
	   * @param e
	   * @private
	   */
	  eventActivatePlugin(e) {
	    let $target = jQuery(e.target),
	      plugin = $target.parents('.box'),
	      event;

	    // Hide the button
	    if ($target.is('button')) {
	      $target.fadeOut();
	    }
	    if (window.CustomEvent) {
	      event = new CustomEvent('handle_plugin', {
	        detail: {
	          action: 'activate'
	        }
	      });
	    } else {
	      event = document.createEvent('CustomEvent');
	      event.initCustomEvent('handle_plugin', true, true, {
	        action: 'activate'
	      });
	    }
	    if (size_1(plugin)) {
	      plugin = Helpers.getFirstItem(plugin);
	      // debugger;
	      plugin.dispatchEvent(event);
	    }
	  }

	  /**
	   * @param e
	   * @private
	   */
	  eventUpdatePlugin(e) {
	    let $target = jQuery(e.target),
	      plugin = $target.parents('.box'),
	      event;
	    wp.updates.maybeRequestFilesystemCredentials(e);

	    // Hide the button
	    if ($target.is('button')) {
	      $target.fadeOut();
	    }
	    if (window.CustomEvent) {
	      event = new CustomEvent('handle_plugin', {
	        detail: {
	          action: 'update'
	        }
	      });
	    } else {
	      event = document.createEvent('CustomEvent');
	      event.initCustomEvent('handle_plugin', true, true, {
	        action: 'update'
	      });
	    }
	    if (size_1(plugin)) {
	      plugin = Helpers.getFirstItem(plugin);
	      // debugger;
	      plugin.dispatchEvent(event);
	    }
	  }

	  /**
	   * Shiny updates v3 will need some data from the plugin row so we recreate the item-update-row template on our page also.
	   * @param slug
	   */
	  createPseudoUpdateElement(slug) {
	    if (jQuery('#tmpl-item-update-row').length === 0) {
	      return false;
	    }

	    // create a pseudo tr which offers necessary data for the plugin update
	    var tmpl_update_plugin = wp.template('item-update-row'),
	      table = document.createElement('table'),
	      html = tmpl_update_plugin({
	        slug: slug,
	        plugin: slug,
	        colspan: '1',
	        content: ''
	      });
	    if (typeof html === 'undefined') {
	      return false;
	    }
	    tmpl_update_plugin = jQuery.trim(html);
	    table.innerHTML = tmpl_update_plugin;
	    table.hidden = true;

	    //this element can stay at the end of the body
	    jQuery(document).find('body').append(table);
	    return true;
	  }
	  getPluginStatus(plugin) {
	    if (plugin.is_active && !plugin.is_up_to_date) {
	      return 'outdated';
	    }
	    if (plugin.is_active) {
	      return 'active';
	    }
	    if (plugin.is_installed) {
	      return 'inactive';
	    }
	    return 'missing';
	  }
	}
	const PluginManager = connect(mapStateToProps$2, mapDispatchToProps$2)(PluginManagerContainer);

	var Symbol$1 = _Symbol,
	    isArguments = isArguments_1,
	    isArray$1 = isArray_1;

	/** Built-in value references. */
	var spreadableSymbol = Symbol$1 ? Symbol$1.isConcatSpreadable : undefined;

	/**
	 * Checks if `value` is a flattenable `arguments` object or array.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is flattenable, else `false`.
	 */
	function isFlattenable$1(value) {
	  return isArray$1(value) || isArguments(value) ||
	    !!(spreadableSymbol && value && value[spreadableSymbol]);
	}

	var _isFlattenable = isFlattenable$1;

	var arrayPush = _arrayPush,
	    isFlattenable = _isFlattenable;

	/**
	 * The base implementation of `_.flatten` with support for restricting flattening.
	 *
	 * @private
	 * @param {Array} array The array to flatten.
	 * @param {number} depth The maximum recursion depth.
	 * @param {boolean} [predicate=isFlattenable] The function invoked per iteration.
	 * @param {boolean} [isStrict] Restrict to values that pass `predicate` checks.
	 * @param {Array} [result=[]] The initial result value.
	 * @returns {Array} Returns the new flattened array.
	 */
	function baseFlatten$1(array, depth, predicate, isStrict, result) {
	  var index = -1,
	      length = array.length;

	  predicate || (predicate = isFlattenable);
	  result || (result = []);

	  while (++index < length) {
	    var value = array[index];
	    if (depth > 0 && predicate(value)) {
	      if (depth > 1) {
	        // Recursively flatten arrays (susceptible to call stack limits).
	        baseFlatten$1(value, depth - 1, predicate, isStrict, result);
	      } else {
	        arrayPush(result, value);
	      }
	    } else if (!isStrict) {
	      result[result.length] = value;
	    }
	  }
	  return result;
	}

	var _baseFlatten = baseFlatten$1;

	/**
	 * The base implementation of `_.sortBy` which uses `comparer` to define the
	 * sort order of `array` and replaces criteria objects with their corresponding
	 * values.
	 *
	 * @private
	 * @param {Array} array The array to sort.
	 * @param {Function} comparer The function to define sort order.
	 * @returns {Array} Returns `array`.
	 */

	function baseSortBy$1(array, comparer) {
	  var length = array.length;

	  array.sort(comparer);
	  while (length--) {
	    array[length] = array[length].value;
	  }
	  return array;
	}

	var _baseSortBy = baseSortBy$1;

	var isSymbol = isSymbol_1;

	/**
	 * Compares values to sort them in ascending order.
	 *
	 * @private
	 * @param {*} value The value to compare.
	 * @param {*} other The other value to compare.
	 * @returns {number} Returns the sort order indicator for `value`.
	 */
	function compareAscending$1(value, other) {
	  if (value !== other) {
	    var valIsDefined = value !== undefined,
	        valIsNull = value === null,
	        valIsReflexive = value === value,
	        valIsSymbol = isSymbol(value);

	    var othIsDefined = other !== undefined,
	        othIsNull = other === null,
	        othIsReflexive = other === other,
	        othIsSymbol = isSymbol(other);

	    if ((!othIsNull && !othIsSymbol && !valIsSymbol && value > other) ||
	        (valIsSymbol && othIsDefined && othIsReflexive && !othIsNull && !othIsSymbol) ||
	        (valIsNull && othIsDefined && othIsReflexive) ||
	        (!valIsDefined && othIsReflexive) ||
	        !valIsReflexive) {
	      return 1;
	    }
	    if ((!valIsNull && !valIsSymbol && !othIsSymbol && value < other) ||
	        (othIsSymbol && valIsDefined && valIsReflexive && !valIsNull && !valIsSymbol) ||
	        (othIsNull && valIsDefined && valIsReflexive) ||
	        (!othIsDefined && valIsReflexive) ||
	        !othIsReflexive) {
	      return -1;
	    }
	  }
	  return 0;
	}

	var _compareAscending = compareAscending$1;

	var compareAscending = _compareAscending;

	/**
	 * Used by `_.orderBy` to compare multiple properties of a value to another
	 * and stable sort them.
	 *
	 * If `orders` is unspecified, all values are sorted in ascending order. Otherwise,
	 * specify an order of "desc" for descending or "asc" for ascending sort order
	 * of corresponding values.
	 *
	 * @private
	 * @param {Object} object The object to compare.
	 * @param {Object} other The other object to compare.
	 * @param {boolean[]|string[]} orders The order to sort by for each property.
	 * @returns {number} Returns the sort order indicator for `object`.
	 */
	function compareMultiple$1(object, other, orders) {
	  var index = -1,
	      objCriteria = object.criteria,
	      othCriteria = other.criteria,
	      length = objCriteria.length,
	      ordersLength = orders.length;

	  while (++index < length) {
	    var result = compareAscending(objCriteria[index], othCriteria[index]);
	    if (result) {
	      if (index >= ordersLength) {
	        return result;
	      }
	      var order = orders[index];
	      return result * (order == 'desc' ? -1 : 1);
	    }
	  }
	  // Fixes an `Array#sort` bug in the JS engine embedded in Adobe applications
	  // that causes it, under certain circumstances, to provide the same value for
	  // `object` and `other`. See https://github.com/jashkenas/underscore/pull/1247
	  // for more details.
	  //
	  // This also ensures a stable sort in V8 and other engines.
	  // See https://bugs.chromium.org/p/v8/issues/detail?id=90 for more details.
	  return object.index - other.index;
	}

	var _compareMultiple = compareMultiple$1;

	var arrayMap = _arrayMap,
	    baseGet = _baseGet,
	    baseIteratee = _baseIteratee,
	    baseMap = _baseMap,
	    baseSortBy = _baseSortBy,
	    baseUnary = _baseUnary,
	    compareMultiple = _compareMultiple,
	    identity$2 = identity_1,
	    isArray = isArray_1;

	/**
	 * The base implementation of `_.orderBy` without param guards.
	 *
	 * @private
	 * @param {Array|Object} collection The collection to iterate over.
	 * @param {Function[]|Object[]|string[]} iteratees The iteratees to sort by.
	 * @param {string[]} orders The sort orders of `iteratees`.
	 * @returns {Array} Returns the new sorted array.
	 */
	function baseOrderBy$1(collection, iteratees, orders) {
	  if (iteratees.length) {
	    iteratees = arrayMap(iteratees, function(iteratee) {
	      if (isArray(iteratee)) {
	        return function(value) {
	          return baseGet(value, iteratee.length === 1 ? iteratee[0] : iteratee);
	        };
	      }
	      return iteratee;
	    });
	  } else {
	    iteratees = [identity$2];
	  }

	  var index = -1;
	  iteratees = arrayMap(iteratees, baseUnary(baseIteratee));

	  var result = baseMap(collection, function(value, key, collection) {
	    var criteria = arrayMap(iteratees, function(iteratee) {
	      return iteratee(value);
	    });
	    return { 'criteria': criteria, 'index': ++index, 'value': value };
	  });

	  return baseSortBy(result, function(object, other) {
	    return compareMultiple(object, other, orders);
	  });
	}

	var _baseOrderBy = baseOrderBy$1;

	/**
	 * A faster alternative to `Function#apply`, this function invokes `func`
	 * with the `this` binding of `thisArg` and the arguments of `args`.
	 *
	 * @private
	 * @param {Function} func The function to invoke.
	 * @param {*} thisArg The `this` binding of `func`.
	 * @param {Array} args The arguments to invoke `func` with.
	 * @returns {*} Returns the result of `func`.
	 */

	function apply$1(func, thisArg, args) {
	  switch (args.length) {
	    case 0: return func.call(thisArg);
	    case 1: return func.call(thisArg, args[0]);
	    case 2: return func.call(thisArg, args[0], args[1]);
	    case 3: return func.call(thisArg, args[0], args[1], args[2]);
	  }
	  return func.apply(thisArg, args);
	}

	var _apply = apply$1;

	var apply = _apply;

	/* Built-in method references for those with the same name as other `lodash` methods. */
	var nativeMax = Math.max;

	/**
	 * A specialized version of `baseRest` which transforms the rest array.
	 *
	 * @private
	 * @param {Function} func The function to apply a rest parameter to.
	 * @param {number} [start=func.length-1] The start position of the rest parameter.
	 * @param {Function} transform The rest array transform.
	 * @returns {Function} Returns the new function.
	 */
	function overRest$1(func, start, transform) {
	  start = nativeMax(start === undefined ? (func.length - 1) : start, 0);
	  return function() {
	    var args = arguments,
	        index = -1,
	        length = nativeMax(args.length - start, 0),
	        array = Array(length);

	    while (++index < length) {
	      array[index] = args[start + index];
	    }
	    index = -1;
	    var otherArgs = Array(start + 1);
	    while (++index < start) {
	      otherArgs[index] = args[index];
	    }
	    otherArgs[start] = transform(array);
	    return apply(func, this, otherArgs);
	  };
	}

	var _overRest = overRest$1;

	/**
	 * Creates a function that returns `value`.
	 *
	 * @static
	 * @memberOf _
	 * @since 2.4.0
	 * @category Util
	 * @param {*} value The value to return from the new function.
	 * @returns {Function} Returns the new constant function.
	 * @example
	 *
	 * var objects = _.times(2, _.constant({ 'a': 1 }));
	 *
	 * console.log(objects);
	 * // => [{ 'a': 1 }, { 'a': 1 }]
	 *
	 * console.log(objects[0] === objects[1]);
	 * // => true
	 */

	function constant$1(value) {
	  return function() {
	    return value;
	  };
	}

	var constant_1 = constant$1;

	var getNative = _getNative;

	var defineProperty$1 = (function() {
	  try {
	    var func = getNative(Object, 'defineProperty');
	    func({}, '', {});
	    return func;
	  } catch (e) {}
	}());

	var _defineProperty = defineProperty$1;

	var constant = constant_1,
	    defineProperty = _defineProperty,
	    identity$1 = identity_1;

	/**
	 * The base implementation of `setToString` without support for hot loop shorting.
	 *
	 * @private
	 * @param {Function} func The function to modify.
	 * @param {Function} string The `toString` result.
	 * @returns {Function} Returns `func`.
	 */
	var baseSetToString$1 = !defineProperty ? identity$1 : function(func, string) {
	  return defineProperty(func, 'toString', {
	    'configurable': true,
	    'enumerable': false,
	    'value': constant(string),
	    'writable': true
	  });
	};

	var _baseSetToString = baseSetToString$1;

	/** Used to detect hot functions by number of calls within a span of milliseconds. */

	var HOT_COUNT = 800,
	    HOT_SPAN = 16;

	/* Built-in method references for those with the same name as other `lodash` methods. */
	var nativeNow = Date.now;

	/**
	 * Creates a function that'll short out and invoke `identity` instead
	 * of `func` when it's called `HOT_COUNT` or more times in `HOT_SPAN`
	 * milliseconds.
	 *
	 * @private
	 * @param {Function} func The function to restrict.
	 * @returns {Function} Returns the new shortable function.
	 */
	function shortOut$1(func) {
	  var count = 0,
	      lastCalled = 0;

	  return function() {
	    var stamp = nativeNow(),
	        remaining = HOT_SPAN - (stamp - lastCalled);

	    lastCalled = stamp;
	    if (remaining > 0) {
	      if (++count >= HOT_COUNT) {
	        return arguments[0];
	      }
	    } else {
	      count = 0;
	    }
	    return func.apply(undefined, arguments);
	  };
	}

	var _shortOut = shortOut$1;

	var baseSetToString = _baseSetToString,
	    shortOut = _shortOut;

	/**
	 * Sets the `toString` method of `func` to return `string`.
	 *
	 * @private
	 * @param {Function} func The function to modify.
	 * @param {Function} string The `toString` result.
	 * @returns {Function} Returns `func`.
	 */
	var setToString$1 = shortOut(baseSetToString);

	var _setToString = setToString$1;

	var identity = identity_1,
	    overRest = _overRest,
	    setToString = _setToString;

	/**
	 * The base implementation of `_.rest` which doesn't validate or coerce arguments.
	 *
	 * @private
	 * @param {Function} func The function to apply a rest parameter to.
	 * @param {number} [start=func.length-1] The start position of the rest parameter.
	 * @returns {Function} Returns the new function.
	 */
	function baseRest$1(func, start) {
	  return setToString(overRest(func, start, identity), func + '');
	}

	var _baseRest = baseRest$1;

	var eq = eq_1,
	    isArrayLike = isArrayLike_1,
	    isIndex = _isIndex,
	    isObject = isObject_1;

	/**
	 * Checks if the given arguments are from an iteratee call.
	 *
	 * @private
	 * @param {*} value The potential iteratee value argument.
	 * @param {*} index The potential iteratee index or key argument.
	 * @param {*} object The potential iteratee object argument.
	 * @returns {boolean} Returns `true` if the arguments are from an iteratee call,
	 *  else `false`.
	 */
	function isIterateeCall$1(value, index, object) {
	  if (!isObject(object)) {
	    return false;
	  }
	  var type = typeof index;
	  if (type == 'number'
	        ? (isArrayLike(object) && isIndex(index, object.length))
	        : (type == 'string' && index in object)
	      ) {
	    return eq(object[index], value);
	  }
	  return false;
	}

	var _isIterateeCall = isIterateeCall$1;

	var baseFlatten = _baseFlatten,
	    baseOrderBy = _baseOrderBy,
	    baseRest = _baseRest,
	    isIterateeCall = _isIterateeCall;

	/**
	 * Creates an array of elements, sorted in ascending order by the results of
	 * running each element in a collection thru each iteratee. This method
	 * performs a stable sort, that is, it preserves the original sort order of
	 * equal elements. The iteratees are invoked with one argument: (value).
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Collection
	 * @param {Array|Object} collection The collection to iterate over.
	 * @param {...(Function|Function[])} [iteratees=[_.identity]]
	 *  The iteratees to sort by.
	 * @returns {Array} Returns the new sorted array.
	 * @example
	 *
	 * var users = [
	 *   { 'user': 'fred',   'age': 48 },
	 *   { 'user': 'barney', 'age': 36 },
	 *   { 'user': 'fred',   'age': 30 },
	 *   { 'user': 'barney', 'age': 34 }
	 * ];
	 *
	 * _.sortBy(users, [function(o) { return o.user; }]);
	 * // => objects for [['barney', 36], ['barney', 34], ['fred', 48], ['fred', 30]]
	 *
	 * _.sortBy(users, ['user', 'age']);
	 * // => objects for [['barney', 34], ['barney', 36], ['fred', 30], ['fred', 48]]
	 */
	var sortBy = baseRest(function(collection, iteratees) {
	  if (collection == null) {
	    return [];
	  }
	  var length = iteratees.length;
	  if (length > 1 && isIterateeCall(collection, iteratees[0], iteratees[1])) {
	    iteratees = [];
	  } else if (length > 2 && isIterateeCall(iteratees[0], iteratees[1], iteratees[2])) {
	    iteratees = [iteratees[0]];
	  }
	  return baseOrderBy(collection, baseFlatten(iteratees, 1), []);
	});

	var sortBy_1 = sortBy;

	class ProgressBar extends react.exports.Component {
	  constructor(props) {
	    super(props);
	  }
	  formatElapsed(ms) {
	    let seconds = Math.max(0, Math.floor(ms / 1000));
	    if (seconds < 60) {
	      return seconds + 's';
	    }
	    return Math.floor(seconds / 60) + 'm ' + seconds % 60 + 's';
	  }
	  renderProgress(progress) {
	    if (!progress || 'idle' === progress.status) {
	      return null;
	    }
	    let total = progress.total || 0,
	      current = progress.current || 0,
	      ratio = total > 0 ? Math.max(0, Math.min(1, current / total)) : 'done' === progress.status ? 1 : 0,
	      percent = Math.round(ratio * 100),
	      elapsed = progress.startedAt ? this.formatElapsed(Date.now() - progress.startedAt) : '',
	      liveMessage = progress.heartbeat || progress.details || '',
	      statusLabel = 'done' === progress.status ? 'Complete' : 'paused' === progress.status ? 'Paused' : 'error' === progress.status ? 'Needs attention' : 'Working';
	    return /*#__PURE__*/React$1.createElement("div", {
	      className: "progress",
	      "aria-live": "polite",
	      "aria-atomic": "false",
	      style: {
	        marginTop: '10px',
	        width: '100%'
	      }
	    }, /*#__PURE__*/React$1.createElement("div", {
	      className: "progress__bar",
	      role: "progressbar",
	      "aria-valuemin": "0",
	      "aria-valuemax": total || 100,
	      "aria-valuenow": total ? current : percent,
	      style: {
	        background: 'rgba(255,255,255,0.35)',
	        borderRadius: '999px',
	        height: '7px',
	        overflow: 'hidden',
	        width: '100%'
	      }
	    }, /*#__PURE__*/React$1.createElement("div", {
	      className: "progress__bar-fill",
	      style: {
	        background: '#ffffff',
	        height: '100%',
	        transition: 'width 180ms ease',
	        width: percent + '%'
	      }
	    })), /*#__PURE__*/React$1.createElement("div", {
	      className: "progress__meta",
	      style: {
	        alignItems: 'center',
	        display: 'flex',
	        flexWrap: 'wrap',
	        fontSize: '12px',
	        gap: '8px 12px',
	        justifyContent: 'space-between',
	        marginTop: '7px',
	        opacity: 0.94
	      }
	    }, /*#__PURE__*/React$1.createElement("span", null, statusLabel), /*#__PURE__*/React$1.createElement("span", null, total ? current + ' of ' + total + ' steps' : percent + '%'), elapsed ? /*#__PURE__*/React$1.createElement("span", null, elapsed) : null), liveMessage ? /*#__PURE__*/React$1.createElement("div", {
	      className: "progress__detail",
	      style: {
	        fontSize: '12px',
	        lineHeight: 1.5,
	        marginTop: '6px',
	        opacity: 0.92
	      }
	    }, liveMessage) : null, progress.log && progress.log.length ? /*#__PURE__*/React$1.createElement("div", {
	      className: "progress__log",
	      style: {
	        background: 'rgba(255,255,255,0.16)',
	        border: '1px solid rgba(255,255,255,0.28)',
	        borderRadius: '3px',
	        fontSize: '12px',
	        lineHeight: 1.45,
	        marginTop: '8px',
	        maxHeight: '116px',
	        overflowY: 'auto',
	        padding: '7px 9px'
	      }
	    }, progress.log.map(function (entry, index) {
	      return /*#__PURE__*/React$1.createElement("div", {
	        className: 'progress__log-entry progress__log-entry--' + (entry.type || 'info'),
	        key: index,
	        style: {
	          opacity: 'error' === entry.type ? 1 : 0.92
	        }
	      }, 'error' === entry.type ? 'Error: ' : '- ', entry.message);
	    })) : null);
	  }
	  render() {
	    let progress = this.props.progress || {},
	      description = progress && progress.message ? progress.message : this.props.description;
	    return /*#__PURE__*/React$1.createElement("div", {
	      className: this.props.installingClass
	    }, /*#__PURE__*/React$1.createElement("div", {
	      className: "bullet"
	    }), /*#__PURE__*/React$1.createElement("div", {
	      style: {
	        flex: '1 1 auto',
	        minWidth: 0
	      }
	    }, /*#__PURE__*/React$1.createElement("h5", {
	      className: "box__title"
	    }, this.props.title), /*#__PURE__*/React$1.createElement("div", {
	      className: "box__text"
	    }, description), this.renderProgress(progress)));
	  }
	}

	/**
	 * @ignore - internal component.
	 */

	var RadioButtonUncheckedIcon = createSvgIcon$1( /*#__PURE__*/react.exports.createElement("path", {
	  d: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"
	}));

	/**
	 * @ignore - internal component.
	 */

	var RadioButtonCheckedIcon = createSvgIcon$1( /*#__PURE__*/react.exports.createElement("path", {
	  d: "M8.465 8.465C9.37 7.56 10.62 7 12 7C14.76 7 17 9.24 17 12C17 13.38 16.44 14.63 15.535 15.535C14.63 16.44 13.38 17 12 17C9.24 17 7 14.76 7 12C7 10.62 7.56 9.37 8.465 8.465Z"
	}));

	var styles$1 = function styles(theme) {
	  return {
	    root: {
	      position: 'relative',
	      display: 'flex',
	      '&$checked $layer': {
	        transform: 'scale(1)',
	        transition: theme.transitions.create('transform', {
	          easing: theme.transitions.easing.easeOut,
	          duration: theme.transitions.duration.shortest
	        })
	      }
	    },
	    layer: {
	      left: 0,
	      position: 'absolute',
	      transform: 'scale(0)',
	      transition: theme.transitions.create('transform', {
	        easing: theme.transitions.easing.easeIn,
	        duration: theme.transitions.duration.shortest
	      })
	    },
	    checked: {}
	  };
	};
	/**
	 * @ignore - internal component.
	 */

	function RadioButtonIcon(props) {
	  var checked = props.checked,
	      classes = props.classes,
	      fontSize = props.fontSize;
	  return /*#__PURE__*/react.exports.createElement("div", {
	    className: clsx(classes.root, checked && classes.checked)
	  }, /*#__PURE__*/react.exports.createElement(RadioButtonUncheckedIcon, {
	    fontSize: fontSize
	  }), /*#__PURE__*/react.exports.createElement(RadioButtonCheckedIcon, {
	    fontSize: fontSize,
	    className: classes.layer
	  }));
	}
	var RadioButtonIcon$1 = withStyles(styles$1, {
	  name: 'PrivateRadioButtonIcon'
	})(RadioButtonIcon);

	/**
	 * @ignore - internal component.
	 */

	var RadioGroupContext = react.exports.createContext();

	var RadioGroupContext$1 = RadioGroupContext;

	function useRadioGroup() {
	  return react.exports.useContext(RadioGroupContext$1);
	}

	var styles = function styles(theme) {
	  return {
	    /* Styles applied to the root element. */
	    root: {
	      color: theme.palette.text.secondary
	    },

	    /* Pseudo-class applied to the root element if `checked={true}`. */
	    checked: {},

	    /* Pseudo-class applied to the root element if `disabled={true}`. */
	    disabled: {},

	    /* Styles applied to the root element if `color="primary"`. */
	    colorPrimary: {
	      '&$checked': {
	        color: theme.palette.primary.main,
	        '&:hover': {
	          backgroundColor: alpha(theme.palette.primary.main, theme.palette.action.hoverOpacity),
	          // Reset on touch devices, it doesn't add specificity
	          '@media (hover: none)': {
	            backgroundColor: 'transparent'
	          }
	        }
	      },
	      '&$disabled': {
	        color: theme.palette.action.disabled
	      }
	    },

	    /* Styles applied to the root element if `color="secondary"`. */
	    colorSecondary: {
	      '&$checked': {
	        color: theme.palette.secondary.main,
	        '&:hover': {
	          backgroundColor: alpha(theme.palette.secondary.main, theme.palette.action.hoverOpacity),
	          // Reset on touch devices, it doesn't add specificity
	          '@media (hover: none)': {
	            backgroundColor: 'transparent'
	          }
	        }
	      },
	      '&$disabled': {
	        color: theme.palette.action.disabled
	      }
	    }
	  };
	};
	var defaultCheckedIcon = /*#__PURE__*/react.exports.createElement(RadioButtonIcon$1, {
	  checked: true
	});
	var defaultIcon = /*#__PURE__*/react.exports.createElement(RadioButtonIcon$1, null);
	var Radio = /*#__PURE__*/react.exports.forwardRef(function Radio(props, ref) {
	  var checkedProp = props.checked,
	      classes = props.classes,
	      _props$color = props.color,
	      color = _props$color === void 0 ? 'secondary' : _props$color,
	      nameProp = props.name,
	      onChangeProp = props.onChange,
	      _props$size = props.size,
	      size = _props$size === void 0 ? 'medium' : _props$size,
	      other = _objectWithoutProperties(props, ["checked", "classes", "color", "name", "onChange", "size"]);

	  var radioGroup = useRadioGroup();
	  var checked = checkedProp;
	  var onChange = createChainedFunction(onChangeProp, radioGroup && radioGroup.onChange);
	  var name = nameProp;

	  if (radioGroup) {
	    if (typeof checked === 'undefined') {
	      checked = radioGroup.value === props.value;
	    }

	    if (typeof name === 'undefined') {
	      name = radioGroup.name;
	    }
	  }

	  return /*#__PURE__*/react.exports.createElement(SwitchBase$1, _extends({
	    color: color,
	    type: "radio",
	    icon: /*#__PURE__*/react.exports.cloneElement(defaultIcon, {
	      fontSize: size === 'small' ? 'small' : 'medium'
	    }),
	    checkedIcon: /*#__PURE__*/react.exports.cloneElement(defaultCheckedIcon, {
	      fontSize: size === 'small' ? 'small' : 'medium'
	    }),
	    classes: {
	      root: clsx(classes.root, classes["color".concat(capitalize(color))]),
	      checked: classes.checked,
	      disabled: classes.disabled
	    },
	    name: name,
	    checked: checked,
	    onChange: onChange,
	    ref: ref
	  }, other));
	});
	var Radio$1 = withStyles(styles, {
	  name: 'MuiRadio'
	})(Radio);

	const mapStateToProps$1 = state => {
	  return {
	    session: state
	  };
	};
	const mapDispatchToProps$1 = dispatch => {
	  return {
	    onLoading: () => {
	      dispatch({
	        type: 'LOADING'
	      });
	    },
	    onLoadingFinished: () => {
	      dispatch({
	        type: 'LOADING_DONE'
	      });
	    },
	    onWizard: () => {
	      dispatch({
	        type: 'IS_SETUP_WIZARD'
	      });
	    },
	    onAvailableNextButton: () => {
	      dispatch({
	        type: 'NEXT_BUTTON_AVAILABLE'
	      });
	    },
	    onUnAvailableNextButton: () => {
	      dispatch({
	        type: 'NEXT_BUTTON_UNAVAILABLE'
	      });
	    },
	    onAvailableSkipButton: () => {
	      dispatch({
	        type: 'SKIP_BUTTON_AVAILABLE'
	      });
	    },
	    onUnAvailableSkipButton: () => {
	      dispatch({
	        type: 'SKIP_BUTTON_UNAVAILABLE'
	      });
	    },
	    onStarterContentInstalling: () => {
	      dispatch({
	        type: 'STARTER_CONTENT_INSTALLING'
	      });
	    },
	    onStarterContentFinished: () => {
	      dispatch({
	        type: 'STARTER_CONTENT_DONE'
	      });
	    },
	    onStarterContentErrored: () => {
	      dispatch({
	        type: 'STARTER_CONTENT_ERRORED'
	      });
	    },
	    onStarterContentStop: () => {
	      dispatch({
	        type: 'STARTER_CONTENT_STOP'
	      });
	    },
	    onStarterContentResume: () => {
	      dispatch({
	        type: 'STARTER_CONTENT_RESUME'
	      });
	    }
	  };
	};

	/**
	 * This is a React Component which handles the Demo Data import from a specified server
	 */
	class StarterContentContainer extends React$1.Component {
	  static get defaultProps() {
	    return {
	      onMove: function () {},
	      onReady: function () {},
	      onRender: function () {}
	    };
	  }
	  constructor(props) {
	    // this makes the this
	    super(props);

	    // @todo We need an error state here
	    _defineProperty$1(this, "handleDemoSelect", demoKey => event => {
	      let component = this;
	      if (!isNil_1(demoKey)) {
	        component.setState({
	          selectedDemoKey: demoKey
	        });
	      } else {
	        component.setState({
	          selectedDemoKey: event.target.value
	        });
	      }
	    });
	    if (isUndefined_1(pixassist.themeConfig.starterContent)) {
	      return;
	    }

	    // we need a callback queue system in order to execute the import in subsequent steps
	    this.queue = new Helpers.Queue();
	    this.state = {
	      demos: this.standardizeDemos(get_1(pixassist, 'themeConfig.starterContent.demos', [])),
	      importing: false,
	      demoClass: 'box--neutral',
	      log: [],
	      progress: this.getInitialProgressState()
	    };
	    if (size_1(this.state.demos)) {
	      // First, we want to sort demos by their order, ascending.
	      let sortedDemoKeys = this.sortDemoKeys(Object.keys(this.state.demos));

	      // By default, the first demo is selected.
	      this.state.selectedDemoKey = sortedDemoKeys[0];
	    }
	    this.handleDemoSelect = this.handleDemoSelect.bind(this);
	    this.sortDemoKeys = this.sortDemoKeys.bind(this);
	    this.onImportClick = this.onImportClick.bind(this);
	    this.onImportStopClick = this.onImportStopClick.bind(this);
	    this.addLogEntry = this.addLogEntry.bind(this);
	    this.handleFetchErrors = this.handleFetchErrors.bind(this);
	    this.updateProgress = this.updateProgress.bind(this);
	    this.advanceProgress = this.advanceProgress.bind(this);
	    this.startProgressHeartbeat = this.startProgressHeartbeat.bind(this);
	    this.stopProgressHeartbeat = this.stopProgressHeartbeat.bind(this);
	    this.estimateTotalWork = this.estimateTotalWork.bind(this);
	    this.importMedia = this.importMedia.bind(this);
	    this.importPosts = this.importPosts.bind(this);
	    this.importTaxonomies = this.importTaxonomies.bind(this);
	    this.importWidgets = this.importWidgets.bind(this);
	    this.importPreSettings = this.importPreSettings.bind(this);
	    this.importPostSettings = this.importPostSettings.bind(this);
	    this.setupDemosFromLocalized = this.setupDemosFromLocalized.bind(this);

	    // A reference to the DOM element of the log.
	    this.logInput = /*#__PURE__*/React$1.createRef();
	    this.progressHeartbeat = null;
	  }
	  render() {
	    let component = this,
	      demos = component.state.demos;
	    if (!size_1(demos)) {
	      return /*#__PURE__*/React$1.createElement("div", {
	        className: "box demo box--neutral"
	      }, Helpers.decodeHtml(get_1(pixassist, 'themeConfig.starterContent.l10n.noSources', '')));
	    }
	    let sortedDemoKeys = component.sortDemoKeys(Object.keys(demos));

	    // If we have only one demo, are importing, or have finished importing, we will only show the selected demo, not the whole list.
	    if (size_1(demos) === 1 || component.props.session.is_sc_installing || component.props.session.is_sc_done) {
	      let installingClass = 'box demo',
	        progressTitle = demos[component.state.selectedDemoKey].title,
	        description = component.state.description || demos[component.state.selectedDemoKey].description;
	      installingClass += '  ' + component.state.demoClass;
	      return /*#__PURE__*/React$1.createElement("div", {
	        className: "demos starter_content single-item"
	      }, /*#__PURE__*/React$1.createElement(ProgressBar, {
	        installingClass: installingClass,
	        title: progressTitle,
	        description: description,
	        progress: component.state.progress
	      }), component.props.enable_actions && !(component.props.session.is_sc_errored || component.props.session.is_sc_installing || component.props.session.is_sc_done) ? /*#__PURE__*/React$1.createElement("a", {
	        className: "btn btn--action import--action ",
	        href: "#",
	        disabled: component.props.session.is_sc_installing || component.props.session.is_sc_done,
	        onClick: this.onImportClick
	      }, component.props.session.is_sc_done ? Helpers.decodeHtml(get_1(pixassist, 'themeConfig.starterContent.l10n.imported', '')) : Helpers.decodeHtml(get_1(pixassist, 'themeConfig.starterContent.l10n.import', ''))) : /*#__PURE__*/React$1.createElement("a", {
	        className: "btn btn--action import--action",
	        style: {
	          display: 'none'
	        },
	        onClick: this.onImportClick
	      }), component.props.enable_actions && component.props.session.is_sc_installing ? /*#__PURE__*/React$1.createElement("a", {
	        className: "btn btn--action btn--action-secondary import-stop--action",
	        href: "#",
	        onClick: this.onImportStopClick
	      }, component.props.session.is_sc_stopped ? Helpers.decodeHtml(get_1(pixassist, 'themeConfig.starterContent.l10n.resume', '')) : Helpers.decodeHtml(get_1(pixassist, 'themeConfig.starterContent.l10n.stop', ''))) : '');
	    }

	    // By default, we show a list of radio button with all the available demos.
	    return /*#__PURE__*/React$1.createElement("div", {
	      className: "demos starter_content"
	    }, sortedDemoKeys.map(function (demoKey) {
	      let demo = demos[demoKey],
	        is_selected = demoKey === component.state.selectedDemoKey,
	        boxClasses = "demo  box box--neutral";
	      return /*#__PURE__*/React$1.createElement("div", {
	        className: boxClasses,
	        key: demoKey,
	        onClick: component.handleDemoSelect(demoKey)
	      }, /*#__PURE__*/React$1.createElement(Radio$1, {
	        checked: is_selected,
	        onChange: component.handleDemoSelect,
	        value: demoKey,
	        name: component.props.name,
	        disabled: !is_selected,
	        color: "primary"
	      }), /*#__PURE__*/React$1.createElement("div", {
	        className: "box__body"
	      }, /*#__PURE__*/React$1.createElement("h5", {
	        className: "box__title"
	      }, demo.title), /*#__PURE__*/React$1.createElement("div", {
	        className: "box__text"
	      }, is_selected ? component.state.description || demo.description : demo.description)), /*#__PURE__*/React$1.createElement("a", {
	        href: demo.url,
	        className: "external-link",
	        title: "Go to source site",
	        target: "_blank"
	      }, /*#__PURE__*/React$1.createElement("span", {
	        className: "dashicons dashicons-external"
	      })));
	    }), component.props.enable_actions ? /*#__PURE__*/React$1.createElement("a", {
	      className: "btn btn--action import--action ",
	      href: "#",
	      onClick: this.onImportClick
	    }, Helpers.decodeHtml(get_1(pixassist, 'themeConfig.starterContent.l10n.importSelected', ''))) : /*#__PURE__*/React$1.createElement("a", {
	      className: "btn btn--action import--action",
	      style: {
	        display: 'none'
	      },
	      onClick: this.onImportClick
	    }));
	  }
	  standardizeDemos(demos) {
	    Object.keys(demos).map(function (key) {
	      if (isNil_1(demos[key].url)) {
	        // We need to have a URL.
	        demos.splice(key, 1);
	      } else {
	        // We want the URL to be trailingslashed
	        demos[key].url = Helpers.trailingslashit(demos[key].url);
	      }
	      if (isNil_1(demos[key].baseRestUrl)) {
	        demos[key].baseRestUrl = demos[key].url + get_1(pixassist, 'themeConfig.starterContent.defaultSceRestPath', 'wp-json/sce/v2');
	      }
	      if (isNil_1(demos[key].order)) {
	        demos[key].order = 10;
	      } else {
	        demos[key].order = toNumber_1(demos[key].order);
	      }
	      if (isNil_1(demos[key].title)) {
	        demos[key].title = get_1(pixassist, 'themeSupports.theme_name', '') + ' Demo Content';
	      }
	      if (isNil_1(demos[key].description)) {
	        demos[key].description = Helpers.decodeHtml(get_1(pixassist, 'themeConfig.starterContent.l10n.importContentDescription', ''));
	      }
	    });
	    return demos;
	  }
	  sortDemoKeys(demoKeys) {
	    let component = this;
	    demoKeys.sort(function (a, b) {
	      if (component.state.demos[a].order < component.state.demos[b].order) {
	        return -1;
	      }
	      if (component.state.demos[a].order > component.state.demos[b].order) {
	        return 1;
	      }
	      return 0;
	    });
	    return demoKeys;
	  }

	  // @todo This is a deprecated component function and we should find a way to not use it.
	  UNSAFE_componentWillMount() {
	    // Others may pass this prop to the component and expect us to fire it.
	    if (this.props.onRender) {
	      this.props.onRender();
	    }
	  }
	  componentDidMount() {
	    let component = this;

	    // add an event listener for the localized pixassist data change
	    window.addEventListener('localizedChanged', component.setupDemosFromLocalized);
	  }
	  componentWillUnmount() {
	    let component = this;
	    component.stopProgressHeartbeat();
	    window.removeEventListener('localizedChanged', component.setupDemosFromLocalized);
	  }
	  componentDidUpdate() {
	    let component = this;
	    if (!isNil_1(component.logInput.current)) {
	      // Make sure that the log textarea field is always scrolled to the bottom.
	      component.logInput.current.scrollTop = component.logInput.current.scrollHeight;
	    }
	  }
	  setupDemosFromLocalized(event) {
	    let component = this,
	      demos = component.standardizeDemos(get_1(pixassist, 'themeConfig.starterContent.demos', []));
	    if (size_1(demos)) {
	      // First, we want to sort demos by their order, ascending.
	      let sortedDemoKeys = component.sortDemoKeys(Object.keys(demos));
	      component.setState({
	        demos: demos,
	        selectedDemoKey: sortedDemoKeys[0],
	        demoClass: 'box--neutral'
	      });
	    }
	  }
	  handleFetchErrors(response) {
	    if (response.ok) {
	      return response;
	    } else {
	      let error = new Error(response.status);
	      error.response = response;
	      error.message = 'status ' + response.status + '; type ' + response.type;
	      throw error;
	    }
	  }
	  getInitialProgressState() {
	    return {
	      status: 'idle',
	      phase: '',
	      message: '',
	      details: '',
	      current: 0,
	      total: 0,
	      log: [],
	      startedAt: null,
	      lastEventAt: null,
	      heartbeat: ''
	    };
	  }
	  updateProgress(update, options = {}) {
	    let component = this,
	      now = Date.now();
	    component.setState(function (prevState) {
	      let progress = Object.assign({}, prevState.progress || component.getInitialProgressState(), update || {});
	      if ('working' === progress.status && !progress.startedAt) {
	        progress.startedAt = now;
	      }
	      if (!options.keepLastEventAt) {
	        progress.lastEventAt = now;
	        progress.heartbeat = '';
	      }
	      return {
	        progress: progress
	      };
	    });
	  }
	  advanceProgress(message, details = '') {
	    let component = this;
	    component.setState(function (prevState) {
	      let progress = Object.assign({}, prevState.progress || component.getInitialProgressState()),
	        total = toNumber_1(progress.total) || 0,
	        current = (toNumber_1(progress.current) || 0) + 1;
	      if (total > 0) {
	        current = Math.min(current, total);
	      }
	      progress.status = 'working';
	      progress.current = current;
	      progress.message = message || progress.message;
	      progress.details = details;
	      progress.lastEventAt = Date.now();
	      progress.heartbeat = '';
	      return {
	        description: progress.message,
	        progress: progress
	      };
	    });
	  }
	  startProgressHeartbeat() {
	    let component = this;
	    component.stopProgressHeartbeat();
	    component.progressHeartbeat = setInterval(function () {
	      let progress = component.state.progress || {};
	      if ('working' !== progress.status || component.props.session.is_sc_stopped) {
	        return;
	      }

	      // More than 3 seconds without progress should never feel idle.
	      if (progress.lastEventAt && Date.now() - progress.lastEventAt < 2500) {
	        return;
	      }
	      component.updateProgress({
	        heartbeat: component.getProgressHeartbeatMessage(progress)
	      }, {
	        keepLastEventAt: true
	      });
	    }, 2500);
	  }
	  stopProgressHeartbeat() {
	    if (this.progressHeartbeat) {
	      clearInterval(this.progressHeartbeat);
	      this.progressHeartbeat = null;
	    }
	  }
	  getProgressHeartbeatMessage(progress) {
	    let messages = {
	      data: 'Still reading the starter manifest.',
	      media: 'Still processing images and local attachment metadata.',
	      taxonomies: 'Still creating categories, tags, and menu groups.',
	      posts: 'Still importing content. Larger post batches can take a little longer.',
	      widgets: 'Still arranging widgets and sidebars.',
	      settings: 'Still applying site settings and theme options.',
	      finish: 'Still wrapping up the import.'
	    };
	    return messages[progress.phase] || 'Still working. No action needed.';
	  }
	  estimateTotalWork(data) {
	    let total = 1;
	    if (!isUndefined_1(data.pre_settings) && !isEmpty_1(data.pre_settings)) {
	      total += 1;
	    }
	    if (!isUndefined_1(data.media) && !isEmpty_1(data.media.placeholders)) {
	      Object.keys(data.media).map(function (group_i) {
	        if ('source_urls' === group_i || isEmpty_1(data.media[group_i])) {
	          return;
	        }
	        total += size_1(data.media[group_i]) * 2;
	      });
	    }
	    if (!isUndefined_1(data.taxonomies) && !isEmpty_1(data.taxonomies)) {
	      total += size_1(data.taxonomies);
	    }
	    if (!isUndefined_1(data.post_types) && !isEmpty_1(data.post_types)) {
	      total += size_1(data.post_types);
	    }
	    if (!isUndefined_1(data.widgets) && !isEmpty_1(data.widgets)) {
	      total += 1;
	    }
	    if (!isUndefined_1(data.post_settings) && !isEmpty_1(data.post_settings)) {
	      total += 2;
	    }
	    return Math.max(total, 1);
	  }
	  addLogEntry(message, type = 'info') {
	    let component = this;
	    if (!message) {
	      return;
	    }
	    component.setState(function (prevState) {
	      let progress = Object.assign({}, prevState.progress || component.getInitialProgressState()),
	        progressLog = progress.log || [];
	      progressLog = progressLog.concat({
	        message: message,
	        type: type
	      }).slice(-8);
	      progress.log = progressLog;
	      progress.lastEventAt = Date.now();
	      progress.heartbeat = '';
	      return {
	        log: prevState.log.concat(message),
	        progress: progress
	      };
	    });
	  }
	  onImportClick(e) {
	    let component = this;
	    e.preventDefault();
	    if (component.props.session.is_sc_installing || component.props.session.is_sc_done) {
	      return false;
	    }
	    component.props.onMove();

	    // Trigger a starter_content_installing action
	    component.props.onStarterContentInstalling();
	    if (component.sceKeyExists(component.state.selectedDemoKey, 'pre_settings')) {
	      var sure = confirm(Helpers.decodeHtml(get_1(pixassist, 'themeConfig.starterContent.l10n.alreadyImportedConfirm', '')));
	      if (!sure) {
	        component.props.onReady();
	        component.setState({
	          demoClass: 'box--plugin-validated',
	          description: Helpers.decodeHtml(get_1(pixassist, 'themeConfig.starterContent.l10n.alreadyImportedDenied', ''))
	        });
	        // Trigger a finished importing starter content action
	        component.props.onStarterContentFinished();
	        return false;
	      }
	    }

	    // Enable the import animation
	    component.setState({
	      demoClass: 'box--plugin-invalidated box--plugin-installing',
	      description: Helpers.decodeHtml(get_1(pixassist, 'themeConfig.starterContent.l10n.importingData', ''))
	    });
	    component.updateProgress({
	      status: 'working',
	      phase: 'data',
	      message: Helpers.decodeHtml(get_1(pixassist, 'themeConfig.starterContent.l10n.importingData', '')),
	      details: 'Contacting the starter source.',
	      current: 0,
	      total: 1,
	      log: [],
	      startedAt: Date.now()
	    });
	    component.startProgressHeartbeat();

	    // Log
	    component.addLogEntry('Starting the import of starter content from: ' + component.state.demos[component.state.selectedDemoKey].url);

	    // First we need to get the available data from the remote server
	    let dataUrl = Helpers.trailingslashit(component.state.demos[component.state.selectedDemoKey].baseRestUrl) + 'data';
	    // @todo Should use a more standard helper for this one
	    fetch(dataUrl, {
	      method: 'GET'
	    }).then(component.handleFetchErrors).then(response => {
	      return response.json();
	    }).then(config => {
	      if (config.code !== 'success') {
	        component.setState({
	          demoClass: 'box--error',
	          description: Helpers.decodeHtml(get_1(pixassist, 'themeConfig.starterContent.l10n.somethingWrong', '')) + "\n" + config.message
	        });
	        component.updateProgress({
	          status: 'error',
	          message: Helpers.decodeHtml(get_1(pixassist, 'themeConfig.starterContent.l10n.somethingWrong', '')),
	          details: config.message
	        });
	        component.stopProgressHeartbeat();
	        component.props.onStarterContentErrored();
	        component.props.onReady();
	      } else {
	        component.updateProgress({
	          phase: 'data',
	          total: component.estimateTotalWork(config.data)
	        });
	        component.advanceProgress('Content manifest received.', 'Preparing the import queue.');
	        component.addLogEntry('Found available starter content. Preparing import steps.');
	        /**
	         * Now that we have the available data, let's import it in a few steps
	         * the Queue will be managed inside these methods
	         */

	        if (!isUndefined_1(config.data.pre_settings)) {
	          component.importPreSettings(config.data.pre_settings);
	        }

	        /**
	         * Images first since we will need their new ids to replace the original ones.
	         */
	        if (!isUndefined_1(config.data.media)) {
	          component.importMedia(config.data.media);
	        }
	        if (!isUndefined_1(config.data.taxonomies)) {
	          component.importTaxonomies(config.data.taxonomies);
	        }
	        if (!isUndefined_1(config.data.post_types)) {
	          component.importPosts(config.data.post_types);
	        }
	        if (!isUndefined_1(config.data.widgets)) {
	          component.importWidgets(config.data.widgets);
	        }

	        /**
	         * We have all the data .. let's end
	         */
	        if (!isUndefined_1(config.data.post_settings)) {
	          component.importPostSettings(config.data.post_settings);
	        }
	      }
	    }).catch(function (ex) {
	      console.log(ex);
	      component.addLogEntry('Error: ' + ex.message, 'error');
	      component.setState({
	        demoClass: 'box--error',
	        description: Helpers.decodeHtml(get_1(pixassist, 'themeConfig.starterContent.l10n.errorMessage', ''))
	      });
	      component.updateProgress({
	        status: 'error',
	        message: Helpers.decodeHtml(get_1(pixassist, 'themeConfig.starterContent.l10n.errorMessage', '')),
	        details: ex.message
	      });
	      component.stopProgressHeartbeat();
	      component.props.onStarterContentErrored();
	      component.props.onReady();
	    });
	  }
	  onImportStopClick(e) {
	    let component = this;
	    e.preventDefault();
	    if (component.props.session.is_sc_stopped) {
	      component.queue.stop = false;
	      component.queue.next();
	      component.addLogEntry('Import resumed.');
	      component.updateProgress({
	        status: 'working',
	        message: 'Import resumed.',
	        details: 'Continuing with the next queued step.'
	      });
	      component.startProgressHeartbeat();

	      // Trigger a starter_content_resume action
	      component.props.onStarterContentResume();
	    } else {
	      component.queue.stop = true;
	      component.setState({
	        description: Helpers.decodeHtml(get_1(pixassist, 'themeConfig.starterContent.l10n.stoppedMessage', ''))
	      });
	      component.addLogEntry('Import stopped.');
	      component.updateProgress({
	        status: 'paused',
	        message: Helpers.decodeHtml(get_1(pixassist, 'themeConfig.starterContent.l10n.stoppedMessage', '')),
	        details: 'The import queue is paused.'
	      });
	      component.stopProgressHeartbeat();

	      // Trigger a starter_content_stop action
	      component.props.onStarterContentStop();
	    }
	  }
	  importMedia(data) {
	    let component = this;

	    // no placeholders, no fun
	    if (isEmpty_1(data.placeholders)) {
	      component.addLogEntry('Missing media placeholders data. Skipping media import...');
	      return;
	    }
	    let mediaUrl = Helpers.trailingslashit(component.state.demos[component.state.selectedDemoKey].baseRestUrl) + 'media',
	      mediaTotal = 0,
	      mediaIndex = 0;
	    Object.keys(data).map(function (group_i) {
	      if ('source_urls' === group_i || isEmpty_1(data[group_i])) {
	        return;
	      }
	      mediaTotal += size_1(data[group_i]);
	    });
	    {
	      Object.keys(data).map(function (group_i) {
	        var group = data[group_i];
	        if ('source_urls' === group_i || isEmpty_1(group)) {
	          return;
	        }
	        {
	          Object.keys(group).map(function (i) {
	            component.queue.add(function () {
	              var attach_id = group[i],
	                currentMediaIndex = ++mediaIndex;
	              component.updateProgress({
	                phase: 'media',
	                message: 'Downloading media ' + currentMediaIndex + ' of ' + mediaTotal + '.',
	                details: 'Remote attachment #' + attach_id
	              });
	              fetch(mediaUrl + "?id=" + attach_id, {
	                method: 'GET'
	              }).then(component.handleFetchErrors).then(response => {
	                return response.json();
	              }).then(attachment => {
	                if (attachment.code !== 'success') {
	                  component.addLogEntry('Failed to get media with id ' + attach_id + ' (error message: ' + attachment.message + '). Continuing...', 'error');
	                  component.advanceProgress('Skipped media ' + currentMediaIndex + ' of ' + mediaTotal + '.', attachment.message);
	                  component.advanceProgress('Skipped media upload ' + currentMediaIndex + ' of ' + mediaTotal + '.', 'No file was returned by the starter source.');
	                  component.queue.next();
	                } else {
	                  if (!attachment.data.media.title || !attachment.data.media.ext || !attachment.data.media.mime_type) {
	                    component.addLogEntry('Got back malformed data for media with id ' + attach_id + '. Continuing...', 'error');
	                    component.advanceProgress('Skipped media ' + currentMediaIndex + ' of ' + mediaTotal + '.', 'Malformed media response.');
	                    component.advanceProgress('Skipped media upload ' + currentMediaIndex + ' of ' + mediaTotal + '.', 'No valid file metadata was returned.');
	                    component.queue.next();
	                    return;
	                  }
	                  component.advanceProgress('Downloaded media ' + currentMediaIndex + ' of ' + mediaTotal + '.', attachment.data.media.title + '.' + attachment.data.media.ext);
	                  Helpers.$ajax(pixassist.wpRest.endpoint.uploadMedia.url, pixassist.wpRest.endpoint.uploadMedia.method, {
	                    demo_key: component.state.selectedDemoKey,
	                    title: attachment.data.media.title,
	                    remote_id: attach_id,
	                    file_data: attachment.data.media.data,
	                    ext: attachment.data.media.ext,
	                    group: group_i
	                  }, function (response) {
	                    if (!isUndefined_1(response.code) && 'success' === response.code) {
	                      component.addLogEntry('Imported media "' + attachment.data.media.title + '.' + attachment.data.media.ext + '" (#' + response.data.attachmentID + ').');
	                      component.advanceProgress('Uploaded media ' + currentMediaIndex + ' of ' + mediaTotal + '.', attachment.data.media.title + '.' + attachment.data.media.ext);
	                    } else {
	                      component.addLogEntry('Failed to import media "' + attachment.data.media.title + '.' + attachment.data.media.ext + '". Response: ' + response.responseText, 'error');
	                      component.advanceProgress('Media upload failed ' + currentMediaIndex + ' of ' + mediaTotal + '.', attachment.data.media.title + '.' + attachment.data.media.ext);
	                      console.log(response);
	                    }
	                    component.queue.next();
	                  }, function (err) {
	                    component.addLogEntry('Failed to import media "' + attachment.data.media.title + '.' + attachment.data.media.ext + '". Response: ' + err.responseText, 'error');
	                    component.advanceProgress('Media upload failed ' + currentMediaIndex + ' of ' + mediaTotal + '.', attachment.data.media.title + '.' + attachment.data.media.ext);
	                    console.log(err);
	                    component.queue.next();
	                  }, function (xhr) {
	                    let uploadMessage = 'Uploading media ' + currentMediaIndex + ' of ' + mediaTotal + '.';
	                    component.setState({
	                      description: uploadMessage
	                    });
	                    component.updateProgress({
	                      phase: 'media',
	                      message: uploadMessage,
	                      details: attachment.data.media.title + '.' + attachment.data.media.ext
	                    });
	                    xhr.setRequestHeader('X-WP-Nonce', pixassist.wpRest.nonce);
	                  });
	                }
	              }).catch(function (ex) {
	                component.addLogEntry('Failed to download media with id ' + attach_id + '. Response: ' + ex.message, 'error');
	                component.advanceProgress('Skipped media ' + currentMediaIndex + ' of ' + mediaTotal + '.', ex.message);
	                component.advanceProgress('Skipped media upload ' + currentMediaIndex + ' of ' + mediaTotal + '.', 'Download failed.');
	                component.queue.next();
	              });
	            });
	          });
	        }
	      });
	    }
	  }
	  importPosts(data, debug_post_type = null) {
	    var component = this;
	    if (isEmpty_1(data)) {
	      component.addLogEntry('No data for posts. Continuing...');
	      return;
	    }
	    if (component.sceKeyExists(component.state.selectedDemoKey, 'posts')) {
	      component.addLogEntry('Posts already imported. Continuing...');
	      return;
	    }

	    // We order the post types by priority ascending
	    data = sortBy_1(data, 'priority');
	    let baseUrl = Helpers.trailingslashit(component.state.demos[component.state.selectedDemoKey].baseRestUrl);
	    map_1(data, function (entry, key) {
	      var post_type = entry.name,
	        args = {
	          post_type: entry.name,
	          ids: entry.ids
	        };
	      if (debug_post_type !== null && debug_post_type !== post_type) {
	        return;
	      }
	      component.queue.add(function () {
	        Helpers.$ajax(pixassist.wpRest.endpoint.import.url, pixassist.wpRest.endpoint.import.method, {
	          demo_key: component.state.selectedDemoKey,
	          type: 'post_type',
	          url: baseUrl,
	          args: args
	        }, function (response) {
	          // success callback
	          console.log(response);
	          component.addLogEntry('Imported post type "' + entry.name + '" (' + size_1(entry.ids) + ' posts).');
	          component.advanceProgress('Imported ' + post_type + '.', size_1(entry.ids) + ' posts processed.');
	          // @todo we should properly handle the response code
	          component.queue.next();
	        }, function (err) {
	          // error callback
	          console.log(err);
	          component.addLogEntry('Failed to import post type "' + entry.name + '". Response: ' + err.responseText, 'error');
	          component.advanceProgress('Post type import failed: ' + post_type + '.', err.responseText);
	          component.queue.next();
	        }, function (xhr) {
	          // beforeSendCallback
	          let message = Helpers.decodeHtml(get_1(pixassist, 'themeConfig.starterContent.l10n.postImporting', '')) + post_type + '...';
	          component.setState({
	            description: message
	          });
	          component.updateProgress({
	            phase: 'posts',
	            message: message,
	            details: size_1(entry.ids) + ' posts in this batch.'
	          });
	          xhr.setRequestHeader('X-WP-Nonce', pixassist.wpRest.nonce);
	        });
	      });
	    });
	  }
	  importTaxonomies(data, debug_tax = null) {
	    var component = this;
	    if (isEmpty_1(data)) {
	      component.addLogEntry('No data for taxonomies. Continuing...');
	      return;
	    }
	    if (component.sceKeyExists(component.state.selectedDemoKey, 'terms')) {
	      component.addLogEntry('Taxonomies terms already imported. Continuing...');
	      return;
	    }

	    // We order the taxonomies by priority ascending
	    data = sortBy_1(data, 'priority');
	    let baseUrl = Helpers.trailingslashit(component.state.demos[component.state.selectedDemoKey].baseRestUrl);
	    map_1(data, function (entry, key) {
	      var tax = entry.name,
	        args = {
	          tax: tax,
	          ids: entry.ids
	        };
	      if (debug_tax !== null && debug_tax !== tax) {
	        return;
	      }
	      component.queue.add(function () {
	        Helpers.$ajax(pixassist.wpRest.endpoint.import.url, pixassist.wpRest.endpoint.import.method, {
	          demo_key: component.state.selectedDemoKey,
	          type: 'taxonomy',
	          url: baseUrl,
	          args: args
	        }, function (response) {
	          console.log(response);
	          component.addLogEntry('Imported taxonomy "' + tax + '" (' + size_1(entry.ids) + ' terms).');
	          component.advanceProgress('Imported taxonomy: ' + tax + '.', size_1(entry.ids) + ' terms processed.');
	          component.queue.next();
	        }, function (err) {
	          console.log(err);
	          component.addLogEntry('Failed to import taxonomy "' + tax + '". Response: ' + err.responseText, 'error');
	          component.advanceProgress('Taxonomy import failed: ' + tax + '.', err.responseText);
	          component.queue.next();
	        }, function (xhr) {
	          xhr.setRequestHeader('X-WP-Nonce', pixassist.wpRest.nonce);
	          let message = Helpers.decodeHtml(get_1(pixassist, 'themeConfig.starterContent.l10n.taxonomyImporting', '')) + tax + '...';
	          component.setState({
	            description: message
	          });
	          component.updateProgress({
	            phase: 'taxonomies',
	            message: message,
	            details: size_1(entry.ids) + ' terms in this batch.'
	          });
	        });
	      });
	    });
	  }
	  importWidgets(show_label = true) {
	    var component = this;

	    /*
	     * We do not use the data provided from the server call in onImportClick().
	     * We use the "parsed_type" import that will request the widgets from the demo
	     */

	    if (component.sceKeyExists(component.state.selectedDemoKey, 'widgets')) {
	      component.addLogEntry('Widgets already imported. Continuing...');
	      return;
	    }
	    let baseUrl = Helpers.trailingslashit(component.state.demos[component.state.selectedDemoKey].baseRestUrl);
	    component.queue.add(function () {
	      Helpers.$ajax(pixassist.wpRest.endpoint.import.url, pixassist.wpRest.endpoint.import.method, {
	        demo_key: component.state.selectedDemoKey,
	        type: 'parsed_widgets',
	        url: baseUrl,
	        args: {
	          data: 'ok'
	        }
	      }, function (response) {
	        console.log(response);
	        component.addLogEntry('Imported widgets.');
	        component.advanceProgress('Imported widgets.', 'Sidebars and widget areas were updated.');
	        component.queue.next();
	      }, function (err) {
	        console.log(err);
	        component.addLogEntry('Failed to import widgets. Response: ' + err.responseText, 'error');
	        component.advanceProgress('Widget import failed.', err.responseText);
	        component.queue.next();
	      }, function (xhr) {
	        if (show_label) {
	          let message = Helpers.decodeHtml(get_1(pixassist, 'themeConfig.starterContent.l10n.widgetsImporting', ''));
	          component.setState({
	            description: message
	          });
	          component.updateProgress({
	            phase: 'widgets',
	            message: message,
	            details: 'Arranging widget areas.'
	          });
	        }
	        xhr.setRequestHeader('X-WP-Nonce', pixassist.wpRest.nonce);
	      });
	    });
	  }
	  importPreSettings(data) {
	    let component = this;
	    if (isEmpty_1(data)) {
	      component.addLogEntry('No data in pre_settings. Continuing...');
	      return;
	    }
	    if (component.sceKeyExists(component.state.selectedDemoKey, 'pre_settings')) {
	      component.addLogEntry('pre_settings already imported, but we will overwrite them.');
	    }
	    let baseUrl = Helpers.trailingslashit(component.state.demos[component.state.selectedDemoKey].baseRestUrl);
	    component.queue.add(function () {
	      Helpers.$ajax(pixassist.wpRest.endpoint.import.url, pixassist.wpRest.endpoint.import.method, {
	        demo_key: component.state.selectedDemoKey,
	        type: "pre_settings",
	        url: baseUrl,
	        args: {
	          data: data
	        }
	      }, function (response) {
	        console.log(response);
	        component.addLogEntry('Imported pre_settings.');
	        component.advanceProgress('Prepared theme settings.', 'Initial theme settings were applied.');
	        component.queue.next();
	      }, function (err) {
	        console.log(err);
	        component.addLogEntry('Failed to import pre_settings. Response: ' + err.responseText, 'error');
	        component.advanceProgress('Preparing theme settings failed.', err.responseText);
	        component.queue.next();
	      }, function (xhr) {
	        let message = Helpers.decodeHtml(get_1(pixassist, 'themeConfig.starterContent.l10n.importingPreSettings', ''));
	        component.setState({
	          description: message
	        });
	        component.updateProgress({
	          phase: 'settings',
	          message: message,
	          details: 'Applying initial theme settings.'
	        });
	        xhr.setRequestHeader('X-WP-Nonce', pixassist.wpRest.nonce);
	      });
	    });
	  }
	  importPostSettings(data) {
	    var component = this;
	    if (isEmpty_1(data)) {
	      component.addLogEntry('No data in post_settings. Continuing...');
	      return;
	    }
	    if (component.sceKeyExists(component.state.selectedDemoKey, 'post_settings')) {
	      console.log('post_settings already imported, but we will overwrite them.');
	    }
	    component.queue.add(function () {
	      // just a widget recall ... meh
	      // @todo Some very weird logic in here: fetching the admin page and then reimporting the widgets?!
	      Helpers.$ajax(pixassist.adminUrl, 'GET', {}, function (response) {
	        // console.log(response);
	        setTimeout(function () {
	          component.importWidgets(false);
	        }, 1000);
	        component.advanceProgress('Refreshed the WordPress admin context.', 'Preparing the final settings pass.');
	        component.queue.next();
	      }, null, function (xhr) {
	        let message = Helpers.decodeHtml(get_1(pixassist, 'themeConfig.starterContent.l10n.importingPostSettings', ''));
	        component.setState({
	          description: message
	        });
	        component.updateProgress({
	          phase: 'finish',
	          message: message,
	          details: 'Refreshing WordPress before the final settings pass.'
	        });
	        xhr.setRequestHeader('X-WP-Nonce', pixassist.wpRest.nonce);
	      });
	    });
	    let baseUrl = Helpers.trailingslashit(component.state.demos[component.state.selectedDemoKey].baseRestUrl);

	    // This is the LAST STEP IN THE QUEUE!!!
	    // @todo We need to do a better job in handling when exactly the import was successful and when it wasn't
	    component.queue.add(function () {
	      Helpers.$ajax(pixassist.wpRest.endpoint.import.url, pixassist.wpRest.endpoint.import.method, {
	        demo_key: component.state.selectedDemoKey,
	        type: 'post_settings',
	        url: baseUrl,
	        args: {
	          data: data
	        }
	      }, function (response) {
	        console.log(response);
	        component.addLogEntry('Imported post_settings.');
	        component.advanceProgress('Applied final settings.', 'Menus, homepage, and theme options are in place.');
	        component.queue.next();
	        component.props.onReady();
	        component.setState({
	          demoClass: 'box--plugin-validated',
	          description: Helpers.decodeHtml(get_1(pixassist, 'themeConfig.starterContent.l10n.importSuccessful', ''))
	        });
	        component.updateProgress({
	          status: 'done',
	          phase: 'done',
	          message: Helpers.decodeHtml(get_1(pixassist, 'themeConfig.starterContent.l10n.importSuccessful', '')),
	          details: 'The starter content import is complete.',
	          current: component.state.progress.total || component.state.progress.current,
	          heartbeat: ''
	        });
	        component.stopProgressHeartbeat();
	        component.addLogEntry('Finished!');
	        // Trigger a finished importing starter content action
	        component.props.onStarterContentFinished();
	      }, function (err) {
	        console.log(err);
	        component.addLogEntry('Failed to post_settings. Response: ' + err.responseText, 'error');
	        component.setState({
	          demoClass: 'box--warning',
	          description: 'error'
	        });
	        component.updateProgress({
	          status: 'error',
	          phase: 'finish',
	          message: 'The final settings step failed.',
	          details: err.responseText
	        });
	        component.stopProgressHeartbeat();
	        component.props.onStarterContentErrored();
	        component.props.onReady();
	        component.queue.next();
	      }, function (xhr) {
	        component.updateProgress({
	          phase: 'finish',
	          message: Helpers.decodeHtml(get_1(pixassist, 'themeConfig.starterContent.l10n.importingPostSettings', '')),
	          details: 'Saving final starter settings.'
	        });
	        xhr.setRequestHeader('X-WP-Nonce', pixassist.wpRest.nonce);
	      });
	    });
	  }
	  hasPlaceholders(demoKey) {
	    return !isEmpty_1(get_1(pixassist, 'themeMod.starterContent[' + demoKey + '].media.placeholders', []));
	  }
	  sceKeyExists(demoKey, key) {
	    return !!get_1(pixassist, 'themeMod.starterContent[' + demoKey + '][' + key + ']', null);
	  }
	}
	const StarterContent = connect(mapStateToProps$1, mapDispatchToProps$1)(StarterContentContainer);

	class WizardNextButton extends react.exports.Component {
	  static get defaultProps() {
	    return {
	      label: pixassist.themeConfig.l10n.nextButton,
	      classname: 'btn  btn--action',
	      href: null,
	      onclick: null,
	      disabled: false
	    };
	  }
	  constructor(props) {
	    // this makes the this
	    super(props);
	  }
	  render() {
	    var classname = this.props.classname;
	    if (this.props.disabled) {
	      classname += ' btn--disabled';
	    }
	    if (this.props.href) {
	      return /*#__PURE__*/React$1.createElement("a", {
	        className: classname,
	        href: this.props.href,
	        disabled: this.props.disabled
	      }, this.props.label);
	    }
	    if (this.props.onclick) {
	      return /*#__PURE__*/React$1.createElement("a", {
	        className: classname,
	        onClick: this.props.onclick,
	        disabled: this.props.disabled
	      }, this.props.label);
	    }
	    return /*#__PURE__*/React$1.createElement("a", {
	      href: "#"
	    });
	  }
	}

	class WizardSkipButton extends react.exports.Component {
	  static get defaultProps() {
	    return {
	      label: get_1(pixassist, 'themeConfig.l10n.skipButton', 'Skip'),
	      classname: 'btn  btn--text  btn--slim',
	      href: null,
	      onclick: null,
	      disabled: false
	    };
	  }
	  constructor(props) {
	    // this makes the this
	    super(props);
	  }
	  render() {
	    var classname = this.props.classname;
	    if (this.props.disabled) {
	      classname += ' btn--disabled';
	    }
	    if (this.props.href) {
	      return /*#__PURE__*/React$1.createElement("a", {
	        className: classname,
	        href: this.props.href,
	        disabled: this.props.disabled
	      }, this.props.label || get_1(pixassist, 'themeConfig.l10n.skipButton', 'Skip'));
	    }
	    if (this.props.onclick) {
	      return /*#__PURE__*/React$1.createElement("a", {
	        className: classname,
	        onClick: this.props.onclick,
	        disabled: this.props.disabled
	      }, this.props.label || get_1(pixassist, 'themeConfig.l10n.skipButton', 'Skip'));
	    }
	    return /*#__PURE__*/React$1.createElement("a", {
	      href: "#"
	    });
	  }
	}

	var $ = jQuery;
	const mapStateToProps = state => {
	  return {
	    session: state
	  };
	};
	const mapDispatchToProps = dispatch => {
	  return {
	    onLoading: () => {
	      dispatch({
	        type: 'LOADING'
	      });
	    },
	    onAvailableNextButton: () => {
	      dispatch({
	        type: 'NEXT_BUTTON_AVAILABLE'
	      });
	    },
	    onUnAvailableNextButton: () => {
	      dispatch({
	        type: 'NEXT_BUTTON_UNAVAILABLE'
	      });
	    },
	    onAvailableSkipButton: () => {
	      dispatch({
	        type: 'SKIP_BUTTON_AVAILABLE'
	      });
	    },
	    onUnAvailableSkipButton: () => {
	      dispatch({
	        type: 'SKIP_BUTTON_UNAVAILABLE'
	      });
	    },
	    onPluginsInstalling: () => {
	      dispatch({
	        type: 'ON_PLUGINS_INSTALLING'
	      });
	    },
	    onPluginsInstalled: () => {
	      dispatch({
	        type: 'ON_PLUGINS_INSTALLED'
	      });
	    }
	  };
	};
	class StepsContainer extends react.exports.Component {
	  constructor(props) {
	    // this makes the this
	    super(props);

	    // // This binding is necessary to make `this` work in the callback
	    _defineProperty$1(this, "isApplicableToCurrentThemeType", item => {
	      if (!get_1(item, 'applicableTypes', false)) {
	        // By default it is applicable.
	        return true;
	      }
	      let applicableTypesConfig = castArray_1(get_1(item, 'applicableTypes', false));

	      // Get the current theme type
	      let themeType = get_1(pixassist, 'themeSupports.theme_type', 'theme');
	      if (indexOf_1(applicableTypesConfig, themeType) !== -1) {
	        return true;
	      }
	      return false;
	    });
	    _defineProperty$1(this, "dummyAsync", cb => {
	      this.setState({
	        loading: true
	      }, () => {
	        $('.stepper__content').addClass('is--hidden');
	        this.asyncTimer = setTimeout(cb, 500);
	      });
	    });
	    /**
	     * Handles the stepper index when the user presses the Next Button
	     *
	     * This is the default behaviour of the `next` button.
	     *
	     * Note that child components like the plugin-manager will overwrite this
	     * @param e event
	     */
	    _defineProperty$1(this, "defaultNextButtonCallback", e => {
	      let {
	        step_index,
	        steps_done
	      } = this.state;
	      if (!this.state.loading) {
	        this.dummyAsync(() => {
	          steps_done.push(step_index);
	          this.setState({
	            loading: false,
	            step_index: step_index + 1,
	            steps_done: steps_done
	          });
	          $('.stepper__content').removeClass('is--hidden');
	        });
	      }
	    });
	    /**
	     * Handles the stepper index when the user presses the Skip Button
	     *
	     * This is the default behaviour of the `skip` button.
	     *
	     * Note that child components like the plugin-manager can overwrite this
	     */
	    _defineProperty$1(this, "defaultSkipButtonCallback", () => {
	      let {
	        step_index
	      } = this.state;
	      if (!this.state.loading) {
	        this.dummyAsync(() => {
	          this.setState({
	            loading: false,
	            step_index: step_index + 1
	          });
	          $('.stepper__content').removeClass('is--hidden');
	        });
	      }
	    });
	    /**
	     * Stepper set action
	     * @param step The index of the step
	     */
	    _defineProperty$1(this, "setStep", step => {
	      if (!this.state.loading) {
	        this.dummyAsync(() => {
	          this.setState({
	            loading: false,
	            step_index: parseInt(step)
	          });
	          $('.stepper__content').removeClass('is--hidden');
	        });
	      }
	    });
	    /**
	     * Trigger the plugins manager installing (or activating) events
	     *
	     * Note: this function takes place in the `next` button callback
	     */
	    _defineProperty$1(this, "startPluginsInstall", () => {
	      let component = ReactDOM.findDOMNode(this),
	        plugins = component.getElementsByClassName('plugin'),
	        event = null;
	      if (!!this.state.nextButtonDisable) {
	        return;
	      }
	      if (window.CustomEvent) {
	        event = new CustomEvent('handle_plugin', {
	          detail: {
	            action: 'activate'
	          }
	        });
	      } else {
	        event = document.createEvent('CustomEvent');
	        event.initCustomEvent('handle_plugin', true, true, {
	          action: 'activate'
	        });
	      }
	      if (size_1(plugins)) {
	        for (let i = 0; i < size_1(plugins); i++) {
	          plugins[i].dispatchEvent(event);
	        }
	      }
	      this.onPluginsInstalling();
	    });
	    this.onState = this.onState.bind(this);
	    this.defaultNextButtonCallback = this.defaultNextButtonCallback.bind(this);
	    this.defaultSkipButtonCallback = this.defaultSkipButtonCallback.bind(this);
	    this.startPluginsInstall = this.startPluginsInstall.bind(this);
	    this.onPluginsReady = this.onPluginsReady.bind(this);
	    this.onPluginsInstalling = this.onPluginsInstalling.bind(this);
	    this.onPluginsRender = this.onPluginsRender.bind(this);
	    this.onStarterContentReady = this.onStarterContentReady.bind(this);
	    this.onStarterImporting = this.onStarterImporting.bind(this);
	    this.startContentImport = this.startContentImport.bind(this);
	    this.onStarterContentRender = this.onStarterContentRender.bind(this);
	    this.state = this.initialState = {
	      loading: false,
	      is_active: false,
	      is_expired: false,
	      step_index: 0,
	      plugins_status: 'waiting',
	      steps_done: [],
	      nextButtonLabel: null,
	      nextButtonDisable: false,
	      nextButtonCallback: null,
	      skipButtonLabel: null,
	      skipButtonDisable: null,
	      skipButtonCallback: null
	    };
	    if (!isUndefined_1(pixassist.user.pixassist_user_ID)) {
	      this.state.is_logged = true;
	    }
	    if (!isUndefined_1(pixassist.themeMod.licenseHash)) {
	      this.state.has_license = true;
	    }
	    if (!isUndefined_1(pixassist.themeMod.licenseStatus) && pixassist.themeMod.licenseStatus === "active") {
	      this.state.is_active = true;
	    }
	  }
	  render() {
	    let component = this,
	      {
	        loading,
	        step_index
	      } = this.state;

	    // Remove the Starter Content step if we have no sources.
	    if (!size_1(get_1(pixassist, 'themeConfig.starterContent.demos', []))) {
	      pixassist.themeConfig.setupWizard = filter_1(pixassist.themeConfig.setupWizard, function (value, key) {
	        return key !== 'support'; // I know... this key is just what the doctor ordered :(
	      });
	    }
	    let step_key = Object.keys(pixassist.themeConfig.setupWizard)[step_index],
	      step_config = pixassist.themeConfig.setupWizard[step_key],
	      blocks = step_config.blocks,
	      first_step = null,
	      last_step = null;
	    if (step_index === 0) {
	      first_step = true;
	    } else if (step_index === size_1(pixassist.themeConfig.setupWizard) - 1) {
	      last_step = true;
	    }
	    return /*#__PURE__*/React$1.createElement("div", null, get_1(pixassist, 'themeSupports.theme_name', false) && get_1(pixassist, 'themeSupports.is_pixelgrade_theme', false) ? /*#__PURE__*/React$1.createElement("h1", {
	      className: "setup-wizard-theme-name  u-text-center"
	    }, Helpers.decodeHtml(pixassist.themeConfig.l10n.setupWizardTitle)) : /*#__PURE__*/React$1.createElement("div", {
	      className: "crown"
	    }), /*#__PURE__*/React$1.createElement("div", {
	      className: "stepper"
	    }, /*#__PURE__*/React$1.createElement(Stepper$1, {
	      activeStep: step_index,
	      nonLinear: true,
	      className: "no-background stepper-container"
	    }, Object.keys(pixassist.themeConfig.setupWizard).map(function (key, int_key) {
	      // Bail if this is not applicable to the current theme type.
	      if (!component.isApplicableToCurrentThemeType(pixassist.themeConfig.setupWizard[key])) {
	        return;
	      }

	      // For some steps there are extra cases when we should bail
	      // Do not display anything if there are no Starter Content sources.
	      if (key === 'support' && !size_1(get_1(pixassist, 'themeConfig.starterContent.demos', []))) {
	        return;
	      }
	      let step_class = 'stepper__step';

	      // this tab is the current one
	      if (component.state.step_index === int_key) {
	        step_class += ' current';
	      }

	      // mark the tabs passed by
	      if (component.state.step_index >= int_key) {
	        step_class += ' passed';
	      }

	      // mark the tabs completed
	      if (component.state.steps_done.indexOf(int_key) !== -1) {
	        step_class += ' done';
	      }
	      return /*#__PURE__*/React$1.createElement(Step$1, {
	        className: step_class,
	        onClick: () => component.setStep(int_key),
	        key: 'step_head' + int_key
	      }, /*#__PURE__*/React$1.createElement(StepLabel$1, {
	        icon: /*#__PURE__*/React$1.createElement(default_1, {
	          color: "primary"
	        }),
	        className: "stepper__label",
	        classes: {
	          iconContainer: "stepper__label-icon",
	          labelContainer: "stepper__label-name"
	        }
	      }, Helpers.decodeHtml(pixassist.themeConfig.setupWizard[key].stepName)));
	    })), /*#__PURE__*/React$1.createElement("div", {
	      className: "stepper__content"
	    }, /*#__PURE__*/React$1.createElement("div", {
	      className: "section  section--informative entry-content block"
	    }, /*#__PURE__*/React$1.createElement("div", {
	      className: "section__content"
	    }, Object.keys(blocks).map(function (block_key) {
	      var block = blocks[block_key],
	        block_class = 'block ';

	      // Bail if this is not applicable to the current theme type.
	      if (!component.isApplicableToCurrentThemeType(block)) {
	        return;
	      }

	      // For some steps there are extra cases when we should bail
	      // Do not display anything if there are no Starter Content sources.
	      if (block_key === 'support' && !size_1(get_1(pixassist, 'themeConfig.starterContent.demos', []))) {
	        return;
	      }

	      // Handle the the case when the block has a notconnected behaviour, meaning that Pixelgrade Assistant is not connected (not logged in).
	      if (!isUndefined_1(block.notconnected)) {
	        if (!get_1(component.props, 'session.is_logged', false)) {
	          switch (block.notconnected) {
	            case 'hidden':
	              return null;
	            case 'disabled':
	              block_class += ' disabled';
	              break;
	            case 'notice':
	              return /*#__PURE__*/React$1.createElement(Notice, {
	                key: 'block-notice-' + block_key,
	                notice_id: "component_unavailable",
	                type: "warning",
	                title: Helpers.decodeHtml(get_1(pixassist, 'themeConfig.l10n.componentUnavailableTitle', '')),
	                content: Helpers.parseL10n(get_1(pixassist, 'themeConfig.l10n.componentUnavailableContent', ''))
	              });
	          }
	        }
	      }

	      // Handle the the case when the block has an inactive behaviour, meaning that the license is not active.
	      if (!isUndefined_1(block.inactive) && (!get_1(component.props, 'session.is_active', false) || !get_1(component.props, 'session.is_logged', false))) {
	        switch (block.inactive) {
	          case 'hidden':
	            return null;
	          case 'disabled':
	            block_class += ' disabled';
	            break;
	          case 'notice':
	            return /*#__PURE__*/React$1.createElement(Notice, {
	              key: 'block-notice-' + block_key,
	              notice_id: "component_unavailable",
	              type: "warning",
	              title: Helpers.decodeHtml(get_1(pixassist, 'themeConfig.l10n.componentUnavailableTitle', '')),
	              content: Helpers.parseL10n(get_1(pixassist, 'themeConfig.l10n.componentUnavailableContent', ''))
	            });
	        }
	      }
	      if (!isUndefined_1(block.class)) {
	        block_class += block.class;
	      }
	      return /*#__PURE__*/React$1.createElement("div", {
	        key: 'block-' + block_key,
	        className: block_class
	      }, Object.keys(block.fields).map(function (field_key) {
	        let field = block.fields[field_key],
	          field_output = null,
	          field_class = ' ';

	        // Bail if this is not applicable to the current theme type.
	        if (!component.isApplicableToCurrentThemeType(field)) {
	          return;
	        }

	        // Handle the the case when the block has a notconnected behaviour, meaning that Pixelgrade Assistant is not connected (not logged in).
	        if (!isUndefined_1(field.notconnected)) {
	          if (!get_1(component.props, 'session.is_logged', false)) {
	            switch (field.notconnected) {
	              case 'hidden':
	                return null;
	              case 'disabled':
	                field_class += ' disabled';
	                break;
	              case 'notice':
	                return /*#__PURE__*/React$1.createElement(Notice, {
	                  key: 'block-notice-' + field_key,
	                  notice_id: "component_unavailable",
	                  type: "warning",
	                  title: Helpers.decodeHtml(get_1(pixassist, 'themeConfig.l10n.componentUnavailableTitle', '')),
	                  content: Helpers.parseL10n(get_1(pixassist, 'themeConfig.l10n.componentUnavailableContent', ''))
	                });
	            }
	          }
	        }

	        // Handle the the case when the block field has an inactive behaviour, meaning that the license is not active.
	        if (!isUndefined_1(field.inactive) && (!get_1(component.props, 'session.is_active', false) || !get_1(component.props, 'session.is_logged', false))) {
	          switch (field.inactive) {
	            case 'hidden':
	              return null;
	            case 'disabled':
	              field_class += ' disabled';
	              break;
	            case 'notice':
	              return /*#__PURE__*/React$1.createElement(Notice, {
	                key: 'block-notice-' + field_key,
	                notice_id: "component_unavailable",
	                type: "warning",
	                title: Helpers.decodeHtml(get_1(pixassist, 'themeConfig.l10n.componentUnavailableTitle', '')),
	                content: Helpers.parseL10n(get_1(pixassist, 'themeConfig.l10n.componentUnavailableContent', ''))
	              });
	          }
	        }
	        if (!isUndefined_1(field.class)) {
	          field_class += field.class;
	        }
	        switch (field.type) {
	          case 'text':
	            {
	              // @TODO REFACTOR THIS - EITHER FROM THE CONFIG OR THE WHOLE LOGIC
	              let value = field.value;
	              if (step_config.stepName === 'Plugins') {
	                if (component.props.session.are_plugins_installing) {
	                  value = field.value_installing;
	                }
	                if (component.props.session.are_plugins_installed && component.props.session.did_plugins_install) {
	                  value = field.value_installed;
	                }
	              }
	              if (step_config.stepName === 'Starter content') {
	                if (component.props.session.is_sc_installing) {
	                  value = field.value_installing;
	                }
	                if (component.props.session.is_sc_done) {
	                  value = field.value_installed;
	                }
	                if (component.props.session.is_sc_errored) {
	                  value = field.value_errored;
	                }
	              }
	              if (!value) {
	                value = field.value;
	              }
	              field_output = /*#__PURE__*/React$1.createElement("p", {
	                className: field_class,
	                dangerouslySetInnerHTML: {
	                  __html: Helpers.replaceVariables(value)
	                },
	                key: 'field' + field_key
	              });
	              break;
	            }
	          case 'h1':
	            {
	              field_output = /*#__PURE__*/React$1.createElement("h1", {
	                className: field_class,
	                key: 'field' + field_key,
	                dangerouslySetInnerHTML: {
	                  __html: Helpers.replaceVariables(field.value)
	                }
	              });
	              break;
	            }
	          case 'h2':
	            {
	              // @TODO REFACTOR THIS - EITHER FROM THE CONFIG OR THE WHOLE LOGIC
	              let value = field.value;
	              if (step_config.stepName === 'Plugins') {
	                if (component.props.session.are_plugins_installing) {
	                  value = field.value_installing;
	                }
	                if (component.props.session.are_plugins_installed && component.props.session.did_plugins_install) {
	                  value = field.value_installed;
	                }
	              }
	              if (step_config.stepName === 'Starter content') {
	                if (component.props.session.is_sc_installing) {
	                  value = field.value_installing;
	                }
	                if (component.props.session.is_sc_done) {
	                  value = field.value_installed;
	                }
	                if (component.props.session.is_sc_errored) {
	                  value = field.value_errored;
	                }
	              }
	              if (!value) {
	                value = field.value;
	              }
	              field_output = /*#__PURE__*/React$1.createElement("h2", {
	                className: field_class,
	                key: 'field' + field_key,
	                dangerouslySetInnerHTML: {
	                  __html: Helpers.replaceVariables(value)
	                }
	              });
	              break;
	            }
	          case 'h3':
	            {
	              field_output = /*#__PURE__*/React$1.createElement("h3", {
	                className: field_class,
	                key: 'field' + field_key,
	                dangerouslySetInnerHTML: {
	                  __html: Helpers.replaceVariables(field.value)
	                }
	              });
	              break;
	            }
	          case 'h4':
	            {
	              field_output = /*#__PURE__*/React$1.createElement("h4", {
	                className: field_class,
	                key: 'field' + field_key,
	                dangerouslySetInnerHTML: {
	                  __html: Helpers.replaceVariables(field.value)
	                }
	              });
	              break;
	            }
	          case 'button':
	            {
	              var CSSClass = 'btn  btn--action ';
	              if (!isUndefined_1(field.class)) {
	                CSSClass += field.class;
	              }

	              // replace some pre-defined urls
	              field.url = Helpers.replaceVariables(field.url);
	              field_output = /*#__PURE__*/React$1.createElement("a", {
	                className: CSSClass,
	                key: 'field' + field_key,
	                href: field.url
	              }, field.label);
	              break;
	            }
	          case 'links':
	            {
	              if (typeof field.value !== "object") {
	                break;
	              }
	              var links = field.value;
	              field_output = /*#__PURE__*/React$1.createElement("ul", {
	                key: 'field' + field_key
	              }, Object.keys(field.value).map(function (link_key) {
	                var link = links[link_key];
	                if (isUndefined_1(link.label) || isUndefined_1(link.url)) {
	                  return;
	                }
	                return /*#__PURE__*/React$1.createElement("li", {
	                  key: 'link-' + link_key
	                }, /*#__PURE__*/React$1.createElement("a", {
	                  href: link.url,
	                  target: "_blank"
	                }, link.label));
	              }));
	              break;
	            }
	          case 'component':
	            {
	              switch (field.value) {
	                case 'plugin-manager':
	                  {
	                    field_output = /*#__PURE__*/React$1.createElement(PluginManager, {
	                      key: 'field' + field_key,
	                      onReady: component.onPluginsReady,
	                      onRender: component.onPluginsRender,
	                      onMove: component.onPluginsInstalling,
	                      defaultNextButtonCallback: component.defaultNextButtonCallback,
	                      enableIndividualActions: false,
	                      groupByRequired: true
	                    });
	                    break;
	                  }
	                case 'starter-content':
	                  {
	                    // Do not display anything if there are no Starter Content sources.
	                    if (!size_1(get_1(pixassist, 'themeConfig.starterContent.demos', []))) {
	                      break;
	                    }
	                    field_output = /*#__PURE__*/React$1.createElement(StarterContent, {
	                      key: 'field-' + field_key,
	                      name: field_key,
	                      onReady: component.onStarterContentReady,
	                      onRender: component.onStarterContentRender,
	                      onMove: component.onStarterImporting,
	                      enable_actions: false
	                    });
	                    break;
	                  }
	              }
	              break;
	            }
	        }
	        return field_output;
	      }));
	    })), /*#__PURE__*/React$1.createElement("div", {
	      className: "stepper__navigator"
	    }, last_step !== true // this button will not appear on the last step
	    ? this.props.session.is_wizard_skip ? /*#__PURE__*/React$1.createElement(WizardSkipButton, {
	      label: first_step === true ? get_1(pixassist, 'themeConfig.l10n.notRightNow', 'Not right now') : component.state.skipButtonLabel || step_config.skipButton,
	      href: first_step === true ? pixassist.dashboardUrl : null,
	      onclick: null !== component.state.skipButtonCallback ? component.state.skipButtonCallback : component.defaultSkipButtonCallback,
	      disabled: this.state.skipButtonDisable
	    }) : '' : null, last_step !== true && true !== component.state.onThemeSelector ? this.props.session.is_wizard_next ? /*#__PURE__*/React$1.createElement(WizardNextButton, {
	      label: component.state.nextButtonLabel || step_config.nextButton,
	      onclick: null !== component.state.nextButtonCallback ? component.state.nextButtonCallback : component.defaultNextButtonCallback,
	      disabled: this.state.nextButtonDisable
	    }) : '' : null)), last_step === true ? /*#__PURE__*/React$1.createElement("a", {
	      className: "btn  btn--text  btn--return-to-dashboard",
	      href: pixassist.dashboardUrl
	    }, Helpers.decodeHtml(get_1(pixassist, 'themeConfig.l10n.returnToDashboard', 'Return to dashboard'))) : /*#__PURE__*/React$1.createElement("span", {
	      className: "logo-pixelgrade"
	    }))));
	  }
	  /**
	   * Inform the wizard when the current step is the plugin manager component
	   *
	   * This way we can switch the `Next` button with `Install Plugins`
	   */
	  onPluginsRender(plugins = {}) {
	    // Dispatch an action to make the skip button available
	    this.props.onAvailableSkipButton();

	    // If the plugins step is the first one we need to let it's button show
	    if (0 === this.state.step_index) {
	      this.props.onAvailableNextButton();
	    }

	    // Decide on the label and callback of "next" button.
	    let nextButtonLabel,
	      nextButtonCallback = this.startPluginsInstall,
	      pluginsActionLabels = [],
	      mustInstallPlugins = false,
	      mustActivatePlugins = false,
	      mustUpdatePlugins = false;
	    Object.keys(plugins).map(function (i, j) {
	      var plugin = plugins[i];
	      if (!get_1(plugin, 'is_installed', false) && plugin.selected) {
	        mustInstallPlugins = true;
	      } else if (!get_1(plugin, 'is_active', false) && plugin.selected) {
	        mustActivatePlugins = true;
	      }
	      if (get_1(plugin, 'is_update_required', false) && plugin.selected) {
	        mustUpdatePlugins = true;
	      }
	    });
	    if (true === mustInstallPlugins) {
	      pluginsActionLabels.push(Helpers.decodeHtml(get_1(pixassist, 'themeConfig.l10n.pluginInstallLabel', '')));
	    }
	    if (true === mustActivatePlugins) {
	      pluginsActionLabels.push(Helpers.decodeHtml(get_1(pixassist, 'themeConfig.l10n.pluginActivateLabel', '')));
	    }
	    if (true === mustUpdatePlugins) {
	      pluginsActionLabels.push(Helpers.decodeHtml(get_1(pixassist, 'themeConfig.l10n.pluginUpdateLabel', '')));
	    }
	    nextButtonLabel = join_1(pluginsActionLabels, '&') + ' ' + Helpers.decodeHtml(get_1(pixassist, 'themeConfig.l10n.pluginsPlural', ''));
	    this.setState({
	      nextButtonLabel: nextButtonLabel
	    });
	    this.setState({
	      nextButtonCallback: nextButtonCallback
	    });
	  }

	  /**
	   * This method is passed to the <PluginManager /> component which should use it while installing
	   */
	  onPluginsInstalling() {
	    // Dispatch an action to make the skip button unavailable
	    this.props.onUnAvailableSkipButton();
	    this.setState({
	      nextButtonDisable: true,
	      skipButtonDisable: true
	    });

	    // @TODO - replace the state above with this action
	    // DISPATCH A PLUGINS INSTALLING ACTION
	    this.props.onPluginsInstalling();
	  }

	  /**
	   * This method is passed to the <PluginManager /> component which should use it when all the plugins are active
	   */
	  onPluginsReady() {
	    this.setState({
	      onThemeSelector: false,
	      nextButtonDisable: false,
	      skipButtonDisable: false,
	      nextButtonLabel: pixassist.themeConfig.l10n.nextButton,
	      nextButtonCallback: this.defaultNextButtonCallback
	    });

	    // @TODO - replace the state above with this action
	    // DISPATCH A PLUGINS INSTALLED ACTION
	    this.props.onPluginsInstalled();
	  }

	  /**
	   * Trigger the starter content import action
	   */
	  startContentImport() {
	    this.onStarterImporting();
	    let component = ReactDOM.findDOMNode(this),
	      import_button = component.getElementsByClassName('import--action');
	    if (!isUndefined_1(import_button[0])) {
	      // force an import action by triggering the click
	      import_button[0].click();
	    } else {
	      this.onStarterContentReady();
	    }
	  }

	  /**
	   * While the starter content is visible, the `next` button should have a custom label and a custom callback
	   * See `startContentImport` method
	   */
	  onStarterContentRender() {
	    // Dispatch an action to make the skip button available
	    this.props.onAvailableSkipButton();
	    if (size_1(get_1(this.props.session, 'themeConfig.starterContent.demos', []))) {
	      if (size_1(get_1(this.props.session, 'themeConfig.starterContent.demos', [])) > 1) {
	        this.setState({
	          nextButtonLabel: Helpers.decodeHtml(get_1(pixassist, 'themeConfig.l10n.starterContentImportSelectedLabel', ''))
	        });
	      } else {
	        this.setState({
	          nextButtonLabel: Helpers.decodeHtml(get_1(pixassist, 'themeConfig.l10n.starterContentImportLabel', ''))
	        });
	      }
	      this.setState({
	        nextButtonCallback: this.startContentImport
	      });
	    }
	  }

	  /**
	   * While the Starter Content is importing data, we need to disable the navigation buttons
	   */
	  onStarterImporting() {
	    // Dispatch an action to make the skip button unavailable
	    this.props.onUnAvailableSkipButton();
	    this.setState({
	      nextButtonDisable: true,
	      skipButtonDisable: true
	    });
	  }

	  /**
	   * This method is passed to the <StarterContent /> component and triggered when the import is done
	   */
	  onStarterContentReady() {
	    this.setState({
	      nextButtonDisable: false,
	      skipButtonDisable: false,
	      nextButtonLabel: get_1(pixassist, 'themeConfig.l10n.nextButton', 'Next'),
	      nextButtonCallback: this.defaultNextButtonCallback
	    });
	  }

	  /**
	   * Function passed to child components to be able to update the state remotely
	   * @param state
	   */
	  onState(state) {
	    this.update_local_state(state);
	  }

	  /**
	   * Helper function which updates the component state but also sends these modifications to the local server
	   * @param $state
	   */
	  update_local_state($state) {

	    // force the step_index to 0 so the wizard always starts at the first step
	    $state = {
	      ...$state,
	      ...{
	        loading: false,
	        step_index: 0
	      }
	    };
	    this.setState($state, function () {
	      Helpers.$ajax(pixassist.wpRest.endpoint.globalState.set.url, pixassist.wpRest.endpoint.globalState.set.method, {
	        state: this.state
	      });
	    });
	  }
	}

	// Reflect back and forth navigation in the stepper in the timeline
	window.requestAnimationFrame(function () {
	  $('.stepper__step').on('click', function () {
	    var $this = $(this);
	    $('.stepper__step').removeClass('current  passed');
	    $this.addClass('current').prevAll('.stepper__step').addClass('passed');
	    if ($this.is('.stepper__step:last-of-type')) {
	      $this.addClass('passed');
	    }
	  });
	});
	const Steps = connect(mapStateToProps, mapDispatchToProps)(StepsContainer);

	const SetupWizard$1 = () => /*#__PURE__*/React$1.createElement(ThemeProvider, {
	  theme: ourTheme
	}, /*#__PURE__*/React$1.createElement(Steps, null));
	class SetupWizardWelcome extends React$1.Component {
	  constructor(props) {
	    // this makes the this
	    super(props);
	    _defineProperty$1(this, "beginSetupWizard", () => {
	      ReactDOM.render(/*#__PURE__*/React$1.createElement(Provider, {
	        store: sessionStore
	      }, /*#__PURE__*/React$1.createElement(SetupWizard$1, null)), document.getElementById('pixelgrade_assistant_setup_wizard'));
	    });
	    this.state = {};
	    this.beginSetupWizard = this.beginSetupWizard.bind(this);
	  }
	  render() {
	    return /*#__PURE__*/React$1.createElement("div", {
	      className: "pixlgrade-care-welcome"
	    }, /*#__PURE__*/React$1.createElement("div", {
	      className: "crown"
	    }), /*#__PURE__*/React$1.createElement("div", {
	      className: "section section--informative entry-content block"
	    }, /*#__PURE__*/React$1.createElement("div", null, /*#__PURE__*/React$1.createElement("h1", {
	      className: "section__title"
	    }, Helpers.decodeHtml(get_1(pixassist, 'themeConfig.l10n.setupWizardWelcomeTitle', ''))), /*#__PURE__*/React$1.createElement("p", {
	      className: "section__content"
	    }, Helpers.decodeHtml(get_1(pixassist, 'themeConfig.l10n.setupWizardWelcomeContent', ''))), /*#__PURE__*/React$1.createElement("button", {
	      className: "btn  btn--action  btn--large  btn--full",
	      onClick: this.beginSetupWizard
	    }, Helpers.decodeHtml(get_1(pixassist, 'themeConfig.l10n.setupWizardStartButtonLabel', ''))))), /*#__PURE__*/React$1.createElement("div", {
	      className: "logo-pixelgrade"
	    }));
	  }
	}

	const SetupWizard = () => {
	  return /*#__PURE__*/React$1.createElement(ThemeProvider, {
	    theme: ourTheme
	  }, /*#__PURE__*/React$1.createElement(SetupWizardWelcome, null));
	};
	ReactDOM.render(/*#__PURE__*/React$1.createElement(SetupWizard, null), document.getElementById('pixelgrade_assistant_setup_wizard'));

})();
//# sourceMappingURL=setup_wizard.js.map
