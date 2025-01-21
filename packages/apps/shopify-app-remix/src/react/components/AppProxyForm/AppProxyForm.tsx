import {useContext} from 'react';
import {Form, type FormProps} from '@remix-run/react';

import {AppProxyProviderContext} from '../AppProxyProvider';

export interface AppProxyFormProps extends FormProps {
  action: string;
}

/**
 * Sets up a Remix `<Form>` component that works when rendered on an app proxy page.
 *
 * Supports any properties accepted by the `<Form>` component.
 *
 * Because Remix doesn't support URL rewriting, any route using this component should <b>match the pathname of the proxy
 * URL exactly</b>, and <b>end in a trailing slash</b> (e.g., `https://<shop>/apps/proxy/`), or set the Remix Form prop
 * `navigate` to `false`.
 *
 * @example
 * <caption>Render a form element in a proxied route.</caption>
 * <description>Use an `AppProxyForm` within an `AppProxy` to create a form.</description>
 * ```ts
 * // /app/routes/apps/appProxy.ts
 * import {
 *   AppProxyProvider,
 *   AppProxyForm,
 * } from "@shopify/shopify-app-remix/react";
 * import { authenticate } from "~/shopify.server";
 *
 * export async function loader({ request }) {
 *   await authenticate.public.appProxy(request);
 *
 *   return json({ appUrl: process.env.SHOPIFY_APP_URL });
 * }
 *
 * export async function action({ request }) {
 *   await authenticate.public.appProxy(request);
 *
 *   const formData = await request.formData();
 *   const field = formData.get("field")?.toString();
 *
 *   // Perform actions
 *   if (field) {
 *     console.log("Field:", field);
 *   }
 *
 *   // Return JSON to the client
 *   return json({ message: "Success!" });
 * }
 *
 * export default function App() {
 *   const { appUrl } = useLoaderData();
 *
 *   return (
 *     <AppProxyProvider appUrl={appUrl}>
 *       <AppProxyForm action="/apps/appProxy" method="post">
 *         <input type="text" name="field" />
 *
 *         <input type="submit" name="Submit" />
 *       </AppProxyForm>
 *     </AppProxyProvider>
 *   );
 * }
 * ```
 */
export function AppProxyForm(props: AppProxyFormProps) {
  const context = useContext(AppProxyProviderContext);

  if (!context) {
    throw new Error(
      'AppProxyForm must be used within an AppProxyProvider component',
    );
  }

  const {children, action, ...otherProps} = props;

  return (
    <Form action={context.formatUrl(action, false)} {...otherProps}>
      {children}
    </Form>
  );
}
