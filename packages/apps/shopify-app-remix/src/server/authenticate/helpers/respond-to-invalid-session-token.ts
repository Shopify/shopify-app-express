import {redirect} from '@remix-run/server-runtime';

import {redirectToBouncePage} from '../admin/helpers/redirect-to-bounce-page';
import {RETRY_INVALID_SESSION_HEADER} from '../const';
import {BasicParams} from '../../types';

interface RespondToInvalidSessionTokenParams {
  params: BasicParams;
  request: Request;
  retryRequest?: boolean;
}

export function respondToInvalidSessionToken({
  params,
  request,
  retryRequest = false,
}: RespondToInvalidSessionTokenParams) {
  const {api, logger, config} = params;

  const isDocumentRequest = !request.headers.get('authorization');
  if (isDocumentRequest) {
    return redirectToBouncePage({api, logger, config}, new URL(request.url));
  }

  if (retryRequest) {
    logger.debug('Retrying request after invalid session token', {
      requestUrl: request.url,
    });
    throw redirect(request.url, {
      headers: RETRY_INVALID_SESSION_HEADER,
    });
  }

  throw new Response(undefined, {
    status: 401,
    statusText: 'Unauthorized',
    headers: {},
  });
}
