interface User {
  id: string;
  email: string;
  name: string | null;
  isAdmin: boolean;
}

export interface Address {
  address1: string;
  address2: string;
  city: string;
  country: string;
  postalCode: string;
  state: string;
}