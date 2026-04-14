export type ID = number;

export type Timestamp = string; // ISO 8601

export type OrderStatus = 'pending' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled';

export type PaymentStatus = 'unpaid' | 'paid';

export type PaymentMethod = 'cod' | 'bank_transfer';

export type UserRole = 'customer' | 'admin';
