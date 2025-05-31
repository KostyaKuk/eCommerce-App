import { useState, useEffect } from "react";
import styles from "./Profile.module.css";
import { useCookieManager } from "../../hooks/useCookieManager";
import { getCurrentCustomer, getCustomerVersion, updateCustomer } from "../../utils/sdkManage";
import { Customer, MyCustomerUpdateAction } from "@commercetools/platform-sdk";
import { EditProfileForm } from "./profileComponents/editProfileForm";
import { EditAddressForm } from "./profileComponents/editAdresses";

export const useCustomer = () => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { cookies } = useCookieManager();

  const fetchCustomer = async () => {
    if (!cookies.access_token) {
      setIsLoading(false);
      return;
    }

    try {
      const customerData = await getCurrentCustomer(cookies.access_token);
      setCustomer(customerData);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch custmer:", err);
      setError("Failed to load user data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomer();
  }, [cookies.access_token]);

  return { customer, isLoading, error, refreshCustomer: fetchCustomer };
};

export const ProfilePage = () => {
  const { customer, isLoading, error, refreshCustomer } = useCustomer();
  const [isEditing, setIsEditing] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const { cookies } = useCookieManager();
  const [isEditingAddresses, setIsEditingAddresses] = useState(false);

  const handleSave = async (actions: MyCustomerUpdateAction[]) => {
    setIsUpdating(true);
    setUpdateError(null);

    try {
      const version = await getCustomerVersion(cookies.access_token);

      await updateCustomer(cookies.access_token, {
        version,
        actions,
      });

      await refreshCustomer();
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update customer:", err);
      setUpdateError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setIsUpdating(false);
    }
  };

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

      {updateError && <div className={styles.error}>{updateError}</div>}

      {isEditing ? (
        <EditProfileForm
          customer={customer}
          onSave={handleSave}
          onCancel={() => {
            setIsEditing(false);
            setUpdateError(null);
          }}
          isUpdating={isUpdating}
        />
      ) : (
        <>
          <div className={styles.infoCard}>
            <div className={styles.sectionHeaderContainer}>
              <h2 className={styles.sectionHeader}>Personal Information</h2>
            </div>
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
              <div className={styles.infoItem}>
                <button className={styles.editButton} onClick={() => setIsEditing(true)} disabled={isUpdating}>
                  Edit Profile
                </button>
              </div>
            </div>
          </div>

          {customer.addresses && customer.addresses.length > 0 && (
            <div className={styles.infoCard}>
              <div className={styles.sectionHeaderContainer}>
                <h2 className={styles.sectionHeader}>Addresses</h2>
                <button className={styles.editButton} onClick={() => setIsEditingAddresses(true)} disabled={isUpdating}>
                  Edit Addresses
                </button>
              </div>

              {isEditingAddresses ? (
                <EditAddressForm
                  customer={customer}
                  onSave={async (actions) => {
                    await handleSave(actions);
                    setIsEditingAddresses(false);
                  }}
                  onCancel={() => setIsEditingAddresses(false)}
                  isUpdating={isUpdating}
                />
              ) : (
                <div className={styles.addressesContainer}>
                  {customer.addresses.map((address) => (
                    <div
                      key={address.id}
                      className={`${styles.addressCard} ${
                        address.id === customer.defaultShippingAddressId ||
                        address.id === customer.defaultBillingAddressId
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
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};
