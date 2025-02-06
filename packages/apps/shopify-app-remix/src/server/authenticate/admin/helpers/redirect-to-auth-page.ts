import type {BasicParams} from '../../../types';

import {beginAuth} from './begin-auth';
import {redirectWithExitIframe} from './redirect-with-exitiframe';
import {
  redirectWithAppBridgeHeaders,
  redirectWithResponseWithAppBridgeHeaders,
} from './redirect-with-app-bridge-headers';

export async function redirectToAuthPage(
  params: BasicParams,
  request: Request,
  shop: string,
  isOnline = false,
): Promise<never> {
  const {config} = params;

  const url = new URL(request.url);
  const isEmbeddedRequest = url.searchParams.get('embedded') === '1';
  const isXhrRequest = request.headers.get('authorization');

  if (isXhrRequest) {
    const redirectUri = new URL(config.auth.path, config.appUrl);
    redirectUri.searchParams.set('shop', shop);
    if (config.future.remixSingleFetch) {
      redirectWithAppBridgeHeaders(redirectUri.toString());
    } else {
      redirectWithResponseWithAppBridgeHeaders(redirectUri.toString());
    }
  } else if (isEmbeddedRequest) {
    redirectWithExitIframe(params, request, shop);
  } else {
    throw await beginAuth(params, request, isOnline, shop);
  }
}
