import { createApiBuilderFromCtpClient } from "@commercetools/platform-sdk";
import { ctpClient } from "./BuildClient";

const projectKey = import.meta.env.VITE_COMMERCETOOLS_PROJECT_KEY;
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
