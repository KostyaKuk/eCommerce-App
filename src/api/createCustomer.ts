import { getAccessToken } from "./getAccessToken";

const projectKey = import.meta.env.VITE_CTP_PROJECT_KEY;
const apiUrl = import.meta.env.VITE_CTP_API_URL;

export async function createCustomer() {
  const token = await getAccessToken();
  const customerDraft = {
    email: "user@example.com",
    password: "securePassword123!",
    firstName: "Иван",
    lastName: "Петров",
    addresses: [
      {
        country: "RU",
        city: "Москва",
        streetName: "Тверская",
        postalCode: "125009",
      },
    ],
    defaultShippingAddress: 0,
  };

  const response = await fetch(`${apiUrl}/${projectKey}/customers`, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(customerDraft),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error("Failed to create customer: " + JSON.stringify(error));
  }
  return await response.json();
}
