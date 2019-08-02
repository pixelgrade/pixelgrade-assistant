'use strict';

/**
 * A connection handler for Amazon ES.
 *
 * Uses the aws-sdk to make signed requests to an Amazon ES endpoint.
 *
 * @param client {Client} - The Client that this class belongs to
 * @param config {Object} - Configuration options
 * @param [config.protocol=http:] {String} - The HTTP protocol that this connection will use, can be set to https:
 * @class XhrConnector
 */

const AWS = require('aws-sdk/global');
import AWSSignersv4 from 'aws-sdk/lib/signers/v4';
const Host = require('elasticsearch/src/lib/host');
const qs = require('querystring');
const XhrConnector = require('elasticsearch/src/lib/connectors/xhr');
const HttpClient = require('./src/xhr');

class HttpAmazonESConnector extends XhrConnector {
	constructor(host, config) {
		super(new Host(host), config);
		const protocol = host.protocol;
		const port = host.port;
		const endpoint = new AWS.Endpoint(host.host);

		if (protocol) endpoint.protocol = protocol.replace(/:?$/, ":");
		if (port) endpoint.port = port;

		this.awsConfig = config.awsConfig || AWS.config;
		this.endpoint = endpoint;
		this.httpOptions = config.httpOptions || this.awsConfig.httpOptions;
		this.httpClient = new HttpClient();
	}

	request(params, cb) {
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

	makeReqParams(params) {
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

	getAWSCredentials() {
		return new Promise((resolve, reject) => {
			this.awsConfig.getCredentials((err, creds) => {
				if (err) return reject(err);
				return resolve(creds);
			});
		});
	}

	createRequest(params, reqParams) {
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

	signRequest(request, creds) {
		const signer = new AWSSignersv4(request, 'es');
		signer.addAuthorization(creds, new Date());
	}
}

module.exports = HttpAmazonESConnector;
