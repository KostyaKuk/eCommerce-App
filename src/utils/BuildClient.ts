import {
  ClientBuilder,
  createAuthForClientCredentialsFlow,
  createHttpClient,
  type AuthMiddlewareOptions,
  type HttpMiddlewareOptions,
} from "@commercetools/sdk-client-v2";

const projectKey = import.meta.env.VITE_COMMERCETOOLS_PROJECT_KEY;

const scopes = [
  `manage_my_shopping_lists:${projectKey}`,
  `manage_my_quote_requests:${projectKey}`,
  `manage_my_orders:${projectKey}`,
  `manage_my_payments:${projectKey}`,
  `view_categories:${projectKey}`,
  `manage_my_business_units:${projectKey}`,
  `view_published_products:${projectKey}`,
  `manage_my_profile:${projectKey}`,
  `create_anonymous_token:${projectKey}`,
  `manage_my_quotes:${projectKey}`,
];

const authMiddlewareOptions: AuthMiddlewareOptions = {
  host: import.meta.env.VITE_COMMERCETOOLS_AUTH_URL,
  projectKey,
  credentials: {
    clientId: import.meta.env.VITE_COMMERCETOOLS_CLIENT_ID,
    clientSecret: import.meta.env.VITE_COMMERCETOOLS_CLIENT_SECRET,
  },
  oauthUri: import.meta.env.VITE_COMMERCETOOLS_OAUTH_URI,
  scopes,
  fetch,
};

const httpMiddlewareOptions: HttpMiddlewareOptions = {
  host: import.meta.env.VITE_COMMERCETOOLS_API_URL,
  fetch,
};

export const ctpClient = new ClientBuilder()
  .withProjectKey(projectKey)
  .withMiddleware(createAuthForClientCredentialsFlow(authMiddlewareOptions))
  .withMiddleware(createHttpClient(httpMiddlewareOptions))
  .withUserAgentMiddleware()
  .build();
