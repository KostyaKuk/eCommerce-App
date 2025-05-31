import styles from "./Profile.module.css";
import { useState } from "react";
import { Customer, MyCustomerUpdateAction } from "@commercetools/platform-sdk";

interface EditAddressFormProps {
  customer: Customer;
  onSave: (actions: MyCustomerUpdateAction[]) => Promise<void>;
  onCancel: () => void;
  isUpdating?: boolean;
}

interface Address {
  id?: string;
  streetName: string;
  city: string;
  country: string;
  postalCode: string;
  isDefaultShipping: boolean;
  isDefaultBilling: boolean;
}

export const EditAddressForm = ({ customer, onSave, onCancel, isUpdating = false }: EditAddressFormProps) => {
  const [addresses, setAddresses] = useState<Address[]>(
    customer.addresses?.map((addr) => ({
      id: addr.id,
      streetName: addr.streetName || "",
      city: addr.city || "",
      country: addr.country || "",
      postalCode: addr.postalCode || "",
      isDefaultShipping: customer.defaultShippingAddressId === addr.id,
      isDefaultBilling: customer.defaultBillingAddressId === addr.id,
    })) || []
  );

  const handleAddressChange = (index: number, field: string, value: string | boolean) => {
    setAddresses((prev) => {
      const newAddresses = [...prev];
      newAddresses[index] = { ...newAddresses[index], [field]: value };
      return newAddresses;
    });
  };

  const handleAddAddress = () => {
    setAddresses((prev) => [
      ...prev,
      {
        streetName: "",
        city: "",
        country: "",
        postalCode: "",
        isDefaultShipping: false,
        isDefaultBilling: false,
      },
    ]);
  };

  const handleRemoveAddress = (index: number) => {
    setAddresses((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const actions: MyCustomerUpdateAction[] = [];

    customer.addresses?.forEach((originalAddress) => {
      if (!addresses.some((addr) => addr.id === originalAddress.id)) {
        if (customer.defaultShippingAddressId === originalAddress.id) {
          actions.push({
            action: "setDefaultShippingAddress",
          });
        }
        if (customer.defaultBillingAddressId === originalAddress.id) {
          actions.push({
            action: "setDefaultBillingAddress",
          });
        }
      }
    });

    customer.addresses?.forEach((originalAddress) => {
      if (!addresses.some((addr) => addr.id === originalAddress.id)) {
        actions.push({
          action: "removeAddress",
          addressId: originalAddress.id,
        });
      }
    });

    addresses.forEach((address) => {
      if (address.id) {
        actions.push({
          action: "changeAddress",
          addressId: address.id,
          address: {
            streetName: address.streetName,
            city: address.city,
            country: address.country,
            postalCode: address.postalCode,
          },
        });
      } else {
        actions.push({
          action: "addAddress",
          address: {
            streetName: address.streetName,
            city: address.city,
            country: address.country,
            postalCode: address.postalCode,
          },
        });
      }

      if (address.isDefaultShipping && customer.defaultShippingAddressId !== address.id) {
        actions.push({
          action: "setDefaultShippingAddress",
          addressId: address.id,
        });
      } else if (!address.isDefaultShipping && customer.defaultShippingAddressId === address.id) {
        actions.push({
          action: "setDefaultShippingAddress",
        });
      }

      if (address.isDefaultBilling && customer.defaultBillingAddressId !== address.id) {
        actions.push({
          action: "setDefaultBillingAddress",
          addressId: address.id,
        });
      } else if (!address.isDefaultBilling && customer.defaultBillingAddressId === address.id) {
        actions.push({
          action: "setDefaultBillingAddress",
        });
      }
    });

    try {
      await onSave(actions);
    } catch (error) {
      console.error("Failed to update addresses:", error);
      alert("Failed to update addresses. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.editForm}>
      <div className={styles.formSection}>
        <h2 className={styles.sectionHeader}>Edit Addresses</h2>

        {addresses.map((address, index) => (
          <div key={address.id || `new-${index}`} className={styles.addressForm}>
            <div className={styles.addressHeader}>
              <h3>Address {index + 1}</h3>
              {addresses.length > 1 && (
                <button
                  type="button"
                  className={styles.removeButton}
                  onClick={() => handleRemoveAddress(index)}
                  disabled={isUpdating}
                >
                  Remove
                </button>
              )}
            </div>

            <div className={styles.formGroup}>
              <label>Street</label>
              <input
                type="text"
                value={address.streetName}
                onChange={(e) => handleAddressChange(index, "streetName", e.target.value)}
                disabled={isUpdating}
                required
              />
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>City</label>
                <input
                  type="text"
                  value={address.city}
                  onChange={(e) => handleAddressChange(index, "city", e.target.value)}
                  disabled={isUpdating}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Postal Code</label>
                <input
                  type="text"
                  value={address.postalCode}
                  onChange={(e) => handleAddressChange(index, "postalCode", e.target.value)}
                  disabled={isUpdating}
                  required
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Country</label>
              <input
                type="text"
                value={address.country}
                onChange={(e) => handleAddressChange(index, "country", e.target.value)}
                disabled={isUpdating}
                required
              />
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>
                  <input
                    type="checkbox"
                    checked={address.isDefaultShipping}
                    onChange={(e) => handleAddressChange(index, "isDefaultShipping", e.target.checked)}
                    disabled={isUpdating}
                  />
                  Default Shipping Address
                </label>
              </div>
              <div className={styles.formGroup}>
                <label>
                  <input
                    type="checkbox"
                    checked={address.isDefaultBilling}
                    onChange={(e) => handleAddressChange(index, "isDefaultBilling", e.target.checked)}
                    disabled={isUpdating}
                  />
                  Default Billing Address
                </label>
              </div>
            </div>
          </div>
        ))}

        <button type="button" className={styles.addButton} onClick={handleAddAddress} disabled={isUpdating}>
          Add New Address
        </button>
      </div>

      <div className={styles.formActions}>
        <button type="button" className={styles.cancelButton} onClick={onCancel} disabled={isUpdating}>
          Cancel
        </button>
        <button type="submit" className={styles.saveButton} disabled={isUpdating}>
          {isUpdating ? "Saving..." : "Save Addresses"}
        </button>
      </div>
    </form>
  );
};
