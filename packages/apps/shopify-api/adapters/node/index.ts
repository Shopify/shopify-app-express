import crypto from 'crypto';

import fetch from 'node-fetch';

import {
  setAbstractFetchFunc,
  setAbstractConvertRequestFunc,
  setAbstractConvertIncomingResponseFunc,
  setAbstractConvertResponseFunc,
  setAbstractConvertHeadersFunc,
  setAbstractRuntimeString,
  setCrypto,
  AbstractFetchFunc,
} from '../../runtime';

import {
  nodeConvertRequest,
  nodeConvertIncomingResponse,
  nodeConvertAndSendResponse,
  nodeConvertAndSetHeaders,
  nodeRuntimeString,
} from './adapter';

// node-fetch redirects post requests as get requests on 301, 302 or 303 status codes
// this does not work for graphql requests, so we need to manually handle redirects
const fetchWithRedirect: AbstractFetchFunc = async (url, init) => {
  const fetchOptions = {
    ...init,
    redirect: 'manual',
  } satisfies RequestInit;

  const response = await (fetch as any as AbstractFetchFunc)(url, fetchOptions);

  if (
    (response.status === 301 || response.status === 302) &&
    response.headers.has('location')
  ) {
    const location = response.headers.get('location')!;
    return fetchWithRedirect(location, init);
  }

  return response;
};

setAbstractFetchFunc(fetchWithRedirect);
setAbstractConvertRequestFunc(nodeConvertRequest);
setAbstractConvertIncomingResponseFunc(nodeConvertIncomingResponse);
setAbstractConvertResponseFunc(nodeConvertAndSendResponse);
setAbstractConvertHeadersFunc(nodeConvertAndSetHeaders);
setAbstractRuntimeString(nodeRuntimeString);
setCrypto(crypto as any);
