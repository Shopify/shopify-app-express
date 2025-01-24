import {redirect} from '@remix-run/server-runtime';

import {REAUTH_URL_HEADER} from '../../const';

export function redirectWithAppBridgeHeaders(redirectUri: string): never {
  throw redirect(redirectUri, {
    headers: getAppBridgeHeaders(redirectUri),
  });
}

export function getAppBridgeHeaders(url: string) {
  return new Headers({[REAUTH_URL_HEADER]: url});
}
