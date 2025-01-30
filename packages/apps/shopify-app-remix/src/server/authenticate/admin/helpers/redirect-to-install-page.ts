import {redirect as remixRedirect} from '@remix-run/server-runtime';

import type {BasicParams} from '../../../types';

import {
  redirectWithAppBridgeHeaders,
  redirectWithResponseWithAppBridgeHeaders,
} from './redirect-with-app-bridge-headers';

export async function redirectToInstallPage(
  params: BasicParams,
  shop: string,
  optionalScopes: string[] = [],
): Promise<never> {
  const installUrl = buildInstallUrl(params, shop, optionalScopes);
  if (params.config.isEmbeddedApp) {
    if (params.config.future.remixSingleFetch) {
      throw redirectWithAppBridgeHeaders(installUrl);
    } else {
      throw redirectWithResponseWithAppBridgeHeaders(installUrl);
    }
  } else {
    throw remixRedirect(installUrl);
  }
}

function buildInstallUrl(
  params: BasicParams,
  shop: string,
  optionalScopes: string[] = [],
) {
  const baseInstallUrl = buildBaseInstallUrl(params, shop);
  baseInstallUrl.search = buildParamsInstallUrl(
    params,
    optionalScopes,
  ).toString();
  return baseInstallUrl.href;
}

function buildBaseInstallUrl({api}: BasicParams, shop: string) {
  const cleanShop = api.utils.sanitizeShop(shop, true);
  return new URL(`https://${cleanShop}/admin/oauth/install`);
}

function buildParamsInstallUrl(
  {config}: BasicParams,
  optionalScopes: string[] = [],
) {
  const optionalScopesParam =
    optionalScopes && optionalScopes.length > 0
      ? {optional_scopes: optionalScopes.join(',')}
      : undefined;

  const query = {
    client_id: config.apiKey,
    scope: config.scopes?.toString() || '',
    ...optionalScopesParam,
  };
  return new URLSearchParams(query);
}
