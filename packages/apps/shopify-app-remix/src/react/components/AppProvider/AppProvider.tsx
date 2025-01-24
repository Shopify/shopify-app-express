import {
  AppProvider as PolarisAppProvider,
  AppProviderProps as PolarisAppProviderProps,
} from '@shopify/polaris';
import englishI18n from '@shopify/polaris/locales/en.json';

import {APP_BRIDGE_URL} from '../../const';
import {RemixPolarisLink} from '../RemixPolarisLink';

export interface AppProviderProps
  extends Omit<PolarisAppProviderProps, 'linkComponent' | 'i18n'> {
  /**
   * The API key for your Shopify app. This is the `Client ID` from the Partner Dashboard.
   *
   * When using the Shopify CLI, this is the `SHOPIFY_API_KEY` environment variable. If you're using the environment
   * variable, then you need to pass it from the loader to the component.
   */
  apiKey: string;
  /**
   * Whether the app is loaded inside the Shopify Admin. Default is `true`.
   *
   * {@link https://shopify.dev/docs/apps/admin/embedded-app-home}
   */
  isEmbeddedApp?: boolean;
  /**
   * The internationalization (i18n) configuration for your Polaris provider.
   *
   * {@link https://polaris.shopify.com/components/utilities/app-provider}
   */
  i18n?: PolarisAppProviderProps['i18n'];
  /**
   * Used internally by Shopify. You don't need to set this.
   * @private
   */
  __APP_BRIDGE_URL?: string;
}

/**
 * Sets up the Polaris `AppProvider` and injects the App Bridge script.
 *
 * This component extends the [`AppProvider`](https://polaris.shopify.com/components/utilities/app-provider) component
 * from Polaris, and accepts all of its props except for `linkComponent`, which is overridden to use the Remix `Link`
 * component.
 *
 * {@link https://polaris.shopify.com/components/utilities/app-provider}
 * {@link https://shopify.dev/tools/app-bridge}
 *
 * @example
 * <caption>Set up AppProvider.</caption>
 * <description>Wrap your app in the `AppProvider` component and pass in your API key.</description>
 * ```ts
 * // /app/routes/**\/*.ts
 * import {authenticate} from '~/shopify.server';
 * import {AppProvider} from '@shopify/shopify-app-remix/react';
 *
 * export async function loader({ request }) {
 *   await authenticate.admin(request);
 *
 *   return json({ apiKey: process.env.SHOPIFY_API_KEY });
 * }
 *
 * export default function App() {
 *   const { apiKey } = useLoaderData();
 *
 *   return (
 *     <AppProvider isEmbeddedApp apiKey={apiKey}>
 *       <Outlet />
 *     </AppProvider>
 *   );
 * }
 * ```
 *
 * @example
 * <caption>Localize Polaris components.</caption>
 * <description>Pass in a different locale for Polaris to translate its components.</description>
 * ```ts
 * // /app/routes/**\/*.ts
 * import {authenticate} from '~/shopify.server';
 * import {AppProvider} from '@shopify/shopify-app-remix/react';
 *
 * export async function loader({ request }) {
 *   await authenticate.admin(request);
 *
 *   return json({
 *     apiKey: process.env.SHOPIFY_API_KEY,
 *     polarisTranslations: require("@shopify/polaris/locales/fr.json"),
 *   });
 * }
 *
 * export default function App() {
 *   const { apiKey, polarisTranslations } = useLoaderData();
 *
 *   return (
 *     <AppProvider apiKey={apiKey} i18n={polarisTranslations}>
 *       <Outlet />
 *     </AppProvider>
 *   );
 * }
 * ```
 */
export function AppProvider(props: AppProviderProps) {
  const {
    children,
    apiKey,
    i18n,
    isEmbeddedApp = true,
    __APP_BRIDGE_URL = APP_BRIDGE_URL,
    ...polarisProps
  } = props;

  return (
    <>
      {isEmbeddedApp && <script src={__APP_BRIDGE_URL} data-api-key={apiKey} />}
      <PolarisAppProvider
        {...polarisProps}
        linkComponent={RemixPolarisLink}
        i18n={i18n || englishI18n}
      >
        {children}
      </PolarisAppProvider>
    </>
  );
}
