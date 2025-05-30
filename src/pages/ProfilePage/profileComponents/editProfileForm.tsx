import styles from "./Profile.module.css";
import { useState } from "react";
import { Customer, MyCustomerUpdateAction } from "@commercetools/platform-sdk";

interface EditProfileFormProps {
  customer: Customer;
  onSave: (actions: MyCustomerUpdateAction[]) => Promise<void>;
  onCancel: () => void;
  isUpdating?: boolean;
}

export const EditProfileForm = ({ customer, onSave, onCancel, isUpdating = false }: EditProfileFormProps) => {
  const [formData, setFormData] = useState({
    firstName: customer.firstName || "",
    lastName: customer.lastName || "",
    email: customer.email,
    dateOfBirth: customer.dateOfBirth || "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const actions: MyCustomerUpdateAction[] = [
      {
        action: "setFirstName",
        firstName: formData.firstName,
      },
      {
        action: "setLastName",
        lastName: formData.lastName,
      },
      {
        action: "changeEmail",
        email: formData.email,
      },
    ];

    if (formData.dateOfBirth) {
      actions.push({
        action: "setDateOfBirth",
        dateOfBirth: formData.dateOfBirth,
      } as MyCustomerUpdateAction);
    }

    await onSave(actions);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.editForm}>
      <div className={styles.formSection}>
        <h2 className={styles.sectionHeader}>Personal Information</h2>
        <div className={styles.formGroup}>
          <label>First Name</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            required
            disabled={isUpdating}
          />
        </div>
        <div className={styles.formGroup}>
          <label>Last Name</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            required
            disabled={isUpdating}
          />
        </div>
        <div className={styles.formGroup}>
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            disabled={isUpdating}
          />
        </div>
        <div className={styles.formGroup}>
          <label>Date of Birth</label>
          <input
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleInputChange}
            disabled={isUpdating}
          />
        </div>
      </div>

      <div className={styles.formActions}>
        <button type="button" className={styles.cancelButton} onClick={onCancel} disabled={isUpdating}>
          Cancel
        </button>
        <button type="submit" className={styles.saveButton} disabled={isUpdating}>
          {isUpdating ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
};
