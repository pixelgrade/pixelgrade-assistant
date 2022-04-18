/* requires AWS creds to be updated.
 * if they aren't, update using AWS.config.update() method before instantiating the client.
 *
 * import this module where you instantiate the client, and simply pass this module as the connection class.
 *
 * eg:
 * const client = new Client({
 *   node,
 *   Connection: AwsConnector
 * });
 */

// import Host from './host'

class XHRClient {
	constructor() {
		this.client = new AWS.XHRClient();
	}

	handleRequest(request, httpOptions, cb) {
		let xhr, response, body, status, headers;
		delete request.headers['presigned-expires'];

		const done = err => {
			if (err instanceof Error) return cb(err);

			cb(null, body, status, headers);
		}

		this.client.handleRequest(request, httpOptions, res => {
			response = res;
			body = '';

			response.on('headers', (statusCode, _headers) => {
				status = statusCode;
				headers = _headers;
			});

			response.on('data', data => {
				body += data;
			});

			response.on('end', done);
		}, done);

		xhr = request.stream;
		return xhr;
	}
}

/* global AWS */
function inherits(ctor, superCtor) {
	ctor.super_ = superCtor
	ctor.prototype = Object.create(superCtor.prototype, {
		constructor: {
			value: ctor,
			enumerable: false,
			writable: true,
			configurable: true
		}
	});
};
function AwsConnector(host, config) {
	// We had to modify the bundle to expose elasticsearch.Host!!!
	elasticsearch.ConnectionPool.connectionClasses.xhr.call(this, new elasticsearch.Host(host), config);

	const protocol = host.protocol;
	const port = host.port;
	const endpoint = new AWS.Endpoint(host.host);

	if (protocol) endpoint.protocol = protocol.replace(/:?$/, ":");
	if (port) endpoint.port = port;

	this.awsConfig = config.awsConfig || AWS.config;
	this.endpoint = endpoint;
	this.httpOptions = config.httpOptions || this.awsConfig.httpOptions;
	this.httpClient = new XHRClient();
}
inherits( AwsConnector, elasticsearch.ConnectionPool.connectionClasses.xhr);

AwsConnector.prototype.request = function(params, cb) {
	const reqParams = this.makeReqParams(params);
	let req;
	let cancelled;

	const cancel = () => {
		cancelled = true;
		req && req.abort();
	};

	const done = (err, response, status, headers) => {
		cb(err, response, status, headers);
	};

	// load creds
	this.getAWSCredentials()
		.catch(e => {
			if (e && e.message) e.message = `AWS Credentials error: ${e.message}`;
			throw e;
		})
		.then(creds => {
			if (cancelled) {
				return;
			}

			const request = this.createRequest(params, reqParams);
			// Sign the request (Sigv4)
			this.signRequest(request, creds);
			req = this.httpClient.handleRequest(request, this.httpOptions, done);
		})
		.catch(done);

	return cancel;
}

AwsConnector.prototype.makeReqParams = function(params) {
	params = params || {};
	var host = this.host;

	var reqParams = {
		method: params.method || 'GET',
		protocol: host.protocol + ':',
		hostname: host.host,
		port: host.port,
		path: (host.path || '') + (params.path || ''),
		headers: host.getHeaders(params.headers),
		agent: this.agent
	};

	if (!reqParams.path) {
		reqParams.path = '/';
	}

	var query = host.getQuery(params.query);
	if (query) {
		reqParams.path = reqParams.path + '?' + qs.stringify(query);
	}

	return reqParams;
}

AwsConnector.prototype.createRequest = function (params, reqParams) {
	const request = new AWS.HttpRequest(this.endpoint);

	Object.assign(request, reqParams);

	request.region = this.awsConfig.region;
	if (!request.headers) request.headers = {};
	let body = params.body;

	if (body) {
		request.headers['Content-Length'] = body.length;
		request.body = body;
	}

	request.headers['Host'] = this.endpoint.host;

	return request;
}

AwsConnector.prototype.getAWSCredentials = function() {
	return new Promise((resolve, reject) => {
		this.awsConfig.getCredentials((err, creds) => {
			if (err) return reject(err);
			return resolve(creds);
		});
	});
}

AwsConnector.prototype.signRequest = function (request, creds) {
	const signer = new AWS.Signers.V4(request, 'es');
	signer.addAuthorization(creds, new Date());
}

export default AwsConnector;
