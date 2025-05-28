import { useEffect, useState } from "react";
import styles from "./Profile.module.css";
import { useCookieManager } from "../../hooks/useCookieManager";
import { getCurrentCustomer } from "../../utils/sdkManage";
import { Customer } from "@commercetools/platform-sdk";

export const useCustomer = () => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { cookies } = useCookieManager();

  useEffect(() => {
    const fetchCustomer = async () => {
      if (!cookies.access_token) {
        setIsLoading(false);
        return;
      }

      try {
        const customerData = await getCurrentCustomer(cookies.access_token);
        setCustomer(customerData);
      } catch (err) {
        console.error("Failed to fetch customer:", err);
        setError("Failed to load user data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomer();
  }, [cookies.access_token]);

  return { customer, isLoading, error };
};

export const ProfilePage = () => {
  const { customer, isLoading, error } = useCustomer();

  if (isLoading) {
    return <div className={styles.loading}>Loading user data...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  if (!customer) {
    return <div className={styles.error}>No user data available. Please log in.</div>;
  }

  return (
    <div className={styles.profileContainer}>
      <h1 className={styles.profileHeader}>
        Welcome, {customer.firstName} {customer.lastName}
      </h1>

      <div className={styles.infoCard}>
        <h2 className={styles.sectionHeader}>Personal Information</h2>
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>First Name:</span>
            <span className={styles.infoValue}>{customer.firstName}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Last Name:</span>
            <span className={styles.infoValue}>{customer.lastName}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Email:</span>
            <span className={styles.infoValue}>{customer.email}</span>
          </div>
          {customer.dateOfBirth && (
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Date of Birth:</span>
              <span className={styles.infoValue}>{new Date(customer.dateOfBirth).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </div>

      {customer.addresses && customer.addresses.length > 0 && (
        <div className={styles.infoCard}>
          <h2 className={styles.sectionHeader}>Addresses:</h2>
          <div className={styles.addressesContainer}>
            {customer.addresses.map((address) => (
              <div
                key={address.id}
                className={`${styles.addressCard} ${
                  address.id === customer.defaultShippingAddressId || address.id === customer.defaultBillingAddressId
                    ? styles.defaultAddress
                    : ""
                }`}
              >
                <div className={styles.addressHeader}>
                  <h3 className={styles.addressTitle}>
                    {address.id === customer.defaultShippingAddressId && "Shipping Address"}
                    {address.id === customer.defaultBillingAddressId && "Billing Address"}
                    {address.id !== customer.defaultShippingAddressId &&
                      address.id !== customer.defaultBillingAddressId &&
                      "Address"}
                  </h3>
                  {(address.id === customer.defaultShippingAddressId ||
                    address.id === customer.defaultBillingAddressId) && (
                    <span className={styles.defaultBadge}>Default</span>
                  )}
                </div>

                <div className={styles.addressDetails}>
                  {address.streetName && <p>{address.streetName}</p>}
                  <p>{[address.city, address.postalCode].filter(Boolean).join(", ")}</p>
                  {address.country && <p>{address.country}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
