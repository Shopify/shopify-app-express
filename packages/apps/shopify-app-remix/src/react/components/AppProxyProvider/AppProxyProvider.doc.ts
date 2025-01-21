import {ReferenceEntityTemplateSchema} from '@shopify/generate-docs';

const data: ReferenceEntityTemplateSchema = {
  name: 'AppProxyProvider',
  descriptionType: 'AppProxyProviderGeneratedType',
  description: '',
  category: 'Entrypoints',
  type: 'component',
  isVisualComponent: false,
  definitions: [
    {
      title: 'AppProxyProviderProps',
      description: 'Props for the `AppProxyProvider` component.',
      type: 'AppProxyProviderProps',
    },
  ],
  jsDocTypeExamples: ['AppProxyProviderGeneratedType'],
  related: [
    {
      name: 'authenticate.public.appProxy',
      subtitle: 'Authenticate app proxy requests.',
      url: '/docs/api/shopify-app-remix/authenticate/public/app-proxy',
      type: 'remix',
    },
    {
      name: 'AppProxyForm',
      subtitle: 'Render form elements in proxies.',
      url: '/docs/api/shopify-app-remix/app-proxy-components/appproxyform',
      type: 'remix',
    },
    {
      name: 'AppProxyLink',
      subtitle: 'Render link elements in proxies.',
      url: '/docs/api/shopify-app-remix/app-proxy-components/appproxylink',
      type: 'remix',
    },
  ],
};

export default data;
