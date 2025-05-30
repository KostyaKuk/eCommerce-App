export type SetFirstNameAction = {
  action: "setFirstName";
  firstName: string;
};

export type SetLastNameAction = {
  action: "setLastName";
  lastName: string;
};

export type ChangeEmailAction = {
  action: "changeEmail";
  email: string;
};

export type SetDateOfBirthAction = {
  action: "setDateOfBirth";
  dateOfBirth: string;
};

export type ChangeAddressAction = {
  action: "changeAddress";
  addressId: string;
  address: {
    streetName?: string;
    city?: string;
    country?: string;
    postalCode?: string;
  };
};

export type CustomerUpdateAction =
  | SetFirstNameAction
  | SetLastNameAction
  | ChangeEmailAction
  | SetDateOfBirthAction
  | ChangeAddressAction;
