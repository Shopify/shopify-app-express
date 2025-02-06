import {BasicParams} from '../../../types';
import {authenticateExtensionFactory} from '../extension/authenticate';

import type {AuthenticatePOS} from './types';

export function authenticatePOSFactory(params: BasicParams): AuthenticatePOS {
  return authenticateExtensionFactory(params, 'pos') as AuthenticatePOS;
}
