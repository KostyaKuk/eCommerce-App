import { createApiBuilderFromCtpClient } from "@commercetools/platform-sdk";
import { ctpClient } from "./BuildClient";
import { ClientBuilder, createAuthForPasswordFlow, TokenCache, TokenStore } from "@commercetools/sdk-client-v2";

const projectKey = import.meta.env.VITE_CTP_PROJECT_KEY;
const apiRoot = createApiBuilderFromCtpClient(ctpClient).withProjectKey({ projectKey });

export const getCategories = async () => {
  try {
    const response = await apiRoot.categories().get().execute();
    return response.body;
  } catch (error) {
    console.error("API error:", error);
    throw error;
  }
};

export const loginUser = async (email: string, password: string) => {
  try {
    let store: TokenStore | undefined = undefined;
    const tokenCache: TokenCache = {
      set(cache: TokenStore) {
        store = cache;
      },
      get() {
        return store ?? { token: "", refreshToken: "", expirationTime: 0 };
      },
    };

    const passwordClient = new ClientBuilder()
      .withProjectKey(projectKey)
      .withMiddleware(
        createAuthForPasswordFlow({
          host: import.meta.env.VITE_CTP_AUTH_URL,
          projectKey,
          credentials: {
            clientId: import.meta.env.VITE_CTP_CLIENT_ID,
            clientSecret: import.meta.env.VITE_CTP_CLIENT_SECRET,
            user: { username: email, password },
          },
          scopes: [import.meta.env.VITE_CTP_SCOPES],
          tokenCache,
          fetch,
        })
      )
      .withHttpMiddleware({ host: import.meta.env.VITE_CTP_API_URL, fetch })
      .withUserAgentMiddleware()
      .build();

    const apiRootPassword = createApiBuilderFromCtpClient(passwordClient).withProjectKey({ projectKey });

    const response = await apiRootPassword.me().get().execute();

    const tokens = tokenCache.get();

    return {
      customer: response.body,
      accessToken: tokens?.token,
      refreshToken: tokens?.refreshToken,
    };
  } catch (error) {
    console.error("Login error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    if (errorMessage.includes("Customer account with the given credentials not found")) {
      throw new Error("InvalidCredentials: Неверный email или пароль.");
    }
    throw new Error("General: Произошла ошибка. Попробуйте позже.");
  }
};
