import {
  ClientBuilder,
  createAuthForClientCredentialsFlow,
  createHttpClient,
  type AuthMiddlewareOptions,
  type HttpMiddlewareOptions,
} from "@commercetools/sdk-client-v2";

const projectKey = import.meta.env.VITE_CTP_PROJECT_KEY;

const scopes = [import.meta.env.VITE_CTP_SCOPES];

const authMiddlewareOptions: AuthMiddlewareOptions = {
  host: import.meta.env.VITE_CTP_AUTH_URL,
  projectKey,
  credentials: {
    clientId: import.meta.env.VITE_CTP_CLIENT_ID,
    clientSecret: import.meta.env.VITE_CTP_CLIENT_SECRET,
  },
  oauthUri: import.meta.env.VITE_CTP_OAUTH_URI,
  scopes,
  fetch,
};

const httpMiddlewareOptions: HttpMiddlewareOptions = {
  host: import.meta.env.VITE_CTP_API_URL,
  fetch,
};

export const ctpClient = new ClientBuilder()
  .withProjectKey(projectKey)
  .withMiddleware(createAuthForClientCredentialsFlow(authMiddlewareOptions))
  .withMiddleware(createHttpClient(httpMiddlewareOptions))
  .withUserAgentMiddleware()
  .build();
