import { createApiBuilderFromCtpClient, Cart } from "@commercetools/platform-sdk";
import { ctpClient, createExistingTokenClient } from "./BuildClient";
import {
  ClientBuilder,
  createAuthForPasswordFlow,
  createAuthForAnonymousSessionFlow,
  TokenCache,
  TokenStore,
} from "@commercetools/sdk-client-v2";

const projectKey = import.meta.env.VITE_CTP_PROJECT_KEY;
const apiRoot = createApiBuilderFromCtpClient(ctpClient).withProjectKey({ projectKey });

export const getCategoryByLocalizedName = async (name: string, locale: string) => {
  try {
    const response = await apiRoot
      .categories()
      .get({ queryArgs: { where: `name(${locale}="${name}")` } })
      .execute();
    return response.body.results[0];
  } catch (error) {
    console.error("API error:", error);
    throw error;
  }
};

export const getProductsByCategory = async (categoryId: string, filters: string[] = [], sort?: string) => {
  try {
    const response = await apiRoot
      .productProjections()
      .search()
      .get({
        queryArgs: {
          "filter.query": [`categories.id:"${categoryId}"`, ...filters],
          ...(sort ? { sort } : {}),
        },
      })
      .execute();
    return response.body;
  } catch (error) {
    console.error("API error:", error);
    throw error;
  }
};
export const getSubcategories = async (parentId: string) => {
  try {
    const response = await apiRoot
      .categories()
      .get({
        queryArgs: {
          where: `parent(id="${parentId}")`,
        },
      })
      .execute();
    return response.body.results;
  } catch (error) {
    console.error("API error (subcategories):", error);
    throw error;
  }
};

export const getProductByKey = async (key: string) => {
  try {
    const response = await apiRoot.products().withKey({ key }).get().execute();

    return response.body;
  } catch (error) {
    console.error("Error fetching product by key:", error);
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
  } catch {
    throw new Error("General: An error occurred. Please try again later.");
  }
};

let anonymousTokenStore: TokenStore | undefined = undefined;
const anonymousTokenCache: TokenCache = {
  set(cache: TokenStore) {
    anonymousTokenStore = cache;
    console.log("Anonymous token cached:", cache);
  },
  get() {
    return anonymousTokenStore ?? { token: "", refreshToken: "", expirationTime: 0 };
  },
};

const anonymousClient = new ClientBuilder()
  .withMiddleware(
    createAuthForAnonymousSessionFlow({
      host: import.meta.env.VITE_CTP_AUTH_URL,
      projectKey,
      credentials: {
        clientId: import.meta.env.VITE_CTP_CLIENT_ID,
        clientSecret: import.meta.env.VITE_CTP_CLIENT_SECRET,
      },
      scopes: import.meta.env.VITE_CTP_SCOPES.split(" "),
      tokenCache: anonymousTokenCache,
      fetch,
    })
  )
  .withHttpMiddleware({ host: import.meta.env.VITE_CTP_API_URL, fetch })
  .withUserAgentMiddleware()
  .build();

const apiRootAnonymous = createApiBuilderFromCtpClient(anonymousClient).withProjectKey({ projectKey });

export const getOrCreateCustomerCart = async (accessToken: string): Promise<Cart> => {
  if (!accessToken || typeof accessToken !== "string") {
    console.error("getOrCreateCustomerCart: Invalid accessToken:", accessToken);
    throw new Error("Access token must be a non-empty string");
  }

  try {
    console.log("getOrCreateCustomerCart: Creating customer client with token:", accessToken);
    const customerClient = createExistingTokenClient(accessToken);

    const apiRootCustomer = createApiBuilderFromCtpClient(customerClient).withProjectKey({ projectKey });

    console.log("getOrCreateCustomerCart: Fetching active cart...");
    const cartResponse = await apiRootCustomer
      .me()
      .carts()
      .get({
        queryArgs: {
          where: ['cartState="Active"'],
          expand: ["lineItems[*].product"],
        },
      })
      .execute();

    console.log("getOrCreateCustomerCart: Cart response:", cartResponse.body.results);

    let cart: Cart | undefined = cartResponse.body.results[0];

    if (!cart) {
      console.log("getOrCreateCustomerCart: No active cart found, creating new cart...");
      const createCartResponse = await apiRootCustomer
        .me()
        .carts()
        .post({
          body: {
            currency: "GBP",
            country: "GB",
            inventoryMode: "None",
            shippingMode: "Single",
          },
        })
        .execute();

      cart = createCartResponse.body;
      console.log("getOrCreateCustomerCart: Customer cart created:", cart);
    }

    return cart;
  } catch (error) {
    console.error("getOrCreateCustomerCart: Error fetching or creating cart:", error);
    throw new Error("Failed to fetch or create customer cart");
  }
};

export const createAnonymousCart = async (): Promise<Cart> => {
  try {
    anonymousTokenStore = undefined;
    console.log("createAnonymousCart: Creating anonymous cart...");
    const response = await apiRootAnonymous
      .carts()
      .post({
        body: {
          currency: "GBP",
          country: "GB",
          inventoryMode: "None",
          shippingMode: "Single",
          anonymousId: `anon-${Math.random().toString(36).substring(2)}`,
        },
      })
      .execute();
    console.log("createAnonymousCart: Anonymous cart created:", response.body);
    return response.body;
  } catch (error) {
    console.error("createAnonymousCart: Error creating anonymous cart:", error);
    throw new Error("Failed to create anonymous cart");
  }
};

export const getAnonymousCart = async (cartId: string): Promise<Cart | null> => {
  try {
    console.log("getAnonymousCart: Fetching anonymous cart...");
    const response = await apiRootAnonymous
      .carts()
      .withId({ ID: cartId })
      .get({
        queryArgs: {
          expand: ["lineItems[*].product"],
        },
      })
      .execute();
    console.log("getAnonymousCart: Fetched anonymous cart:", response.body);
    return response.body;
  } catch (error) {
    console.error("getAnonymousCart: Error fetching anonymous cart:", error);
    return null;
  }
};

export const deleteAnonymousCart = async (cartId: string): Promise<void> => {
  console.log("deleteAnonymousCart: Starting with cartId:", cartId);
  try {
    let attempt = 0;
    const maxRetries = 2;

    while (attempt < maxRetries) {
      try {
        console.log("deleteAnonymousCart: Fetching current cart version...");
        const response = await apiRootAnonymous.carts().withId({ ID: cartId }).get().execute();

        const version = response.body.version;

        console.log("deleteAnonymousCart: Deleting anonymous cart...");
        await apiRootAnonymous.carts().withId({ ID: cartId }).delete({ queryArgs: { version } }).execute();

        console.log("deleteAnonymousCart: Anonymous cart deleted");
        return;
      } catch (error) {
        if (error.statusCode === 409 && attempt < maxRetries - 1) {
          console.warn("deleteAnonymousCart: Version conflict, retrying...");
          attempt++;
        } else {
          throw error;
        }
      }
    }
  } catch (error) {
    console.warn("deleteAnonymousCart: Failed to delete cart:", error);
  }
};
export const addProductToCart = async (
  cartId: string,
  productId: string,
  variantId: number,
  quantity: number = 1,
  accessToken?: string
): Promise<Cart> => {
  try {
    const apiRoot = accessToken
      ? createApiBuilderFromCtpClient(createExistingTokenClient(accessToken)).withProjectKey({ projectKey })
      : apiRootAnonymous;

    console.log("addProductToCart: Fetching current cart version...");
    const cartResponse = await apiRoot.carts().withId({ ID: cartId }).get().execute();
    const cartVersion = cartResponse.body.version;

    console.log("addProductToCart: Adding product to cart...");
    const response = await apiRoot
      .carts()
      .withId({ ID: cartId })
      .post({
        queryArgs: {
          expand: ["lineItems[*].product"],
        },
        body: {
          version: cartVersion,
          actions: [
            {
              action: "addLineItem",
              productId,
              variantId,
              quantity,
            },
          ],
        },
      })
      .execute();

    return response.body;
  } catch (error) {
    console.error("addProductToCart: Error adding product to cart:", error);
    throw new Error("Failed to add product to cart");
  }
};

export const changeLineItemQuantity = async (
  cartId: string,
  lineItemId: string,
  quantity: number,
  accessToken?: string
): Promise<Cart> => {
  try {
    const apiRoot = accessToken
      ? createApiBuilderFromCtpClient(createExistingTokenClient(accessToken)).withProjectKey({ projectKey })
      : apiRootAnonymous;

    console.log("changeLineItemQuantity: Fetching current cart version...");
    const cartResponse = await apiRoot.carts().withId({ ID: cartId }).get().execute();
    const cartVersion = cartResponse.body.version;

    console.log("changeLineItemQuantity: Updating line item quantity...");
    const response = await apiRoot
      .carts()
      .withId({ ID: cartId })
      .post({
        queryArgs: {
          expand: ["lineItems[*].product"],
        },
        body: {
          version: cartVersion,
          actions: [
            {
              action: "changeLineItemQuantity",
              lineItemId,
              quantity,
            },
          ],
        },
      })
      .execute();

    return response.body;
  } catch (error) {
    console.error("changeLineItemQuantity: Error updating line item quantity:", error);
    throw new Error("Failed to update line item quantity");
  }
};
export async function applyDiscountCode(cartId: string, cartVersion: number, code: string): Promise<Cart> {
  try {
    const response = await apiRoot
      .carts()
      .withId({ ID: cartId })
      .post({
        queryArgs: {
          expand: ["lineItems[*].product.custom"],
        },
        body: {
          version: cartVersion,
          actions: [{ action: "addDiscountCode", code: code.trim() }],
        },
      })
      .execute();
    return response.body;
  } catch (error) {
    throw new Error(error.message || "Invalid promo code");
  }
}
