export type Role = 'CLIENT' | 'COURIER' | 'ADMIN';
export type OrderStatus = 'PENDING' | 'ASSIGNED' | 'ON_THE_WAY' | 'DELIVERED' | 'CANCELLED';
export type PaymentType = 'CASH' | 'CREDIT';

export interface AuthUser {
  userId: number;
  role: Role;
  accessToken: string;
  phone?: string;
}

export interface Region {
  id: number;
  name: string;
}

export interface District {
  id: number;
  name: string;
  regionId: number;
}

export interface Organization {
  id: number;
  name: string;
  regionId: number;
  districtId: number;
}

export interface Product {
  id: number;
  name: string;
  volume: number;
  isActive: boolean;
}

export interface OrgProduct {
  id: number;
  organizationId: number;
  productId: number;
  price: string; // Decimal as string from Prisma
  isAvailable: boolean;
  product: { id: number; name: string; volume: number };
}

export interface Courier {
  id: number;
  userId: number;
  organizationId: number;
  isOnline: boolean;
  capacity: number;
  lastLat?: number | null;
  lastLng?: number | null;
  user?: { firstName: string; lastName: string; phone: string; isActive?: boolean };
  organization?: { id: number; name: string };
}

/** GET /users/me */
export interface UserMe {
  id: number;
  role: Role;
  firstName: string;
  lastName: string;
  phone: string;
  regionId: number | null;
  districtId: number | null;
  defaultOrganizationId: number | null;
  addressLine: string | null;
  addressLat: number | null;
  addressLng: number | null;
  defaultOrganization?: { id: number; name: string } | null;
  region?: { id: number; name: string };
  district?: { id: number; name: string };
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  phone: string;
  password: string;
  regionId: number;
  districtId: number;
  organizationId: number;
  addressLine: string;
  lat: number;
  lng: number;
}

export interface CreateOrderPayload {
  items: { productId: number; quantity: number }[];
  paymentType: PaymentType;
  note?: string;
}

export interface OrderItem {
  id: number;
  productId: number;
  quantity: number;
  priceAtOrder: string;
  product?: { name: string; volume: number };
}

export interface Order {
  id: number;
  clientId: number;
  courierId: number | null;
  organizationId: number;
  addressLine: string;
  addressLat: number;
  addressLng: number;
  status: OrderStatus;
  paymentType: PaymentType;
  totalPrice: string;
  note?: string | null;
  createdAt: string;
  items: OrderItem[];
  courier?: {
    id: number;
    user: { firstName: string; lastName: string; phone: string };
  } | null;
  client?: { id: number; firstName: string; lastName: string; phone: string };
  organization?: { id: number; name: string };
}

export interface LocationUpdate {
  courierId: number;
  organizationId: number;
  lat: number;
  lng: number;
  at: number;
}
