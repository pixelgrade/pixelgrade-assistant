/* requires AWS creds to be updated.
 * if they aren't, update using AWS.config.update() method before instatiing the client.
 *
 * import this module where you instantiate the client, and simply pass this module as the connection class.
 *
 * eg:
 * const client = new Client({
 *   node,
 *   Connection: AwsConnector
 * });
 */

const AWS = require('aws-sdk/global');
import AWSSignersv4 from 'aws-sdk/lib/signers/v4';
import { Connection } from '@elastic/elasticsearch';

class AwsConnector extends Connection {
  async request(params, callback) {
    try {
      const creds = await this.getAWSCredentials();
      const req = this.createRequest(params);

      const { request: signedRequest } = this.signRequest(req, creds);
      super.request(signedRequest, callback);
    } catch (error) {
      throw error;
    }
  }

  createRequest(params) {
    const endpoint = new AWS.Endpoint(this.url.href);
    let req = new AWS.HttpRequest(endpoint);

    Object.assign(req, params);
    req.region = AWS.config.region;

    if (!req.headers) {
      req.headers = {};
    }

    let body = params.body;

    if (body) {
      let contentLength = Buffer.isBuffer(body)
        ? body.length
        : Buffer.byteLength(body);
      req.headers['Content-Length'] = contentLength;
      req.body = body;
    }
    req.headers['Host'] = endpoint.host;

    return req;
  }

  getAWSCredentials() {
    return new Promise((resolve, reject) => {
      AWS.config.getCredentials((err, creds) => {
        if (err) {
          if (err && err.message) {
            err.message = `AWS Credentials error: ${e.message}`;
          }

          reject(err);
        }

        resolve(creds);
      });
    });
  }

  signRequest(request, creds) {
    const signer = new AWSSignersv4(request, 'es');
    signer.addAuthorization(creds, new Date());
    return signer;
  }
}

export { AwsConnector };
