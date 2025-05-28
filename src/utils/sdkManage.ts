import { Customer } from "@commercetools/platform-sdk";
import { createApiBuilderFromCtpClient } from "@commercetools/platform-sdk";
import { createExistingTokenClient } from "./BuildClient";

const projectKey = import.meta.env.VITE_CTP_PROJECT_KEY;

export const getCurrentCustomer = async (accessToken: string): Promise<Customer> => {
  const client = createExistingTokenClient(accessToken);
  const apiRoot = createApiBuilderFromCtpClient(client).withProjectKey({ projectKey });

  const response = await apiRoot.me().get().execute();
  return response.body;
};
