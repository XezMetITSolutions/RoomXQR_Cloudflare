export interface Room {
  id: string;
  number: string;
  floor: number;
  type: 'standard' | 'deluxe' | 'suite';
  status: 'occupied' | 'vacant' | 'maintenance' | 'cleaning';
  guestName?: string;
  checkIn?: Date;
  checkOut?: Date;
  qrCode: string;
}

export interface Guest {
  id: string;
  name: string;
  email: string;
  phone: string;
  roomId: string;
  language: string;
  checkIn: Date;
  checkOut: Date;
}

export interface Request {
  id: string;
  roomId: string;
  guestId: string;
  type: 'housekeeping' | 'maintenance' | 'concierge' | 'room_service';
  category: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: Date;
  assignedTo?: string;
  completedAt?: Date;
  notes?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'appetizer' | 'main' | 'dessert' | 'beverage' | 'breakfast' | 'popular' | 'fit';
  image?: string;
  available: boolean;
  preparationTime: number; // in minutes
  allergens?: string[];
  isNew?: boolean;
  isPopular?: boolean;
  likes?: number;
  badges?: string[];
  dietaryInfo?: string[];
}

export interface Order {
  id: string;
  roomId: string;
  guestId: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  createdAt: Date;
  deliveryTime?: Date;
  paymentStatus: 'pending' | 'paid' | 'failed';
  paymentMethod?: 'cash' | 'card' | 'pos' | 'room_charge';
  specialInstructions?: string;
}

export interface OrderItem {
  menuItemId: string;
  quantity: number;
  price: number;
  specialRequests?: string;
  menuItem?: MenuItem; // For easier access to item details
}

export interface CartItem {
  id: string;
  menuItem: MenuItem;
  quantity: number;
  specialRequests?: string;
  totalPrice: number;
}

export interface Cart {
  items: CartItem[];
  totalAmount: number;
  specialInstructions?: string;
}

export interface HotelInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  wifiPassword: string;
  checkInTime: string;
  checkOutTime: string;
  breakfastTime: string;
  lunchTime: string;
  dinnerTime: string;
  poolHours: string;
  gymHours: string;
  spaHours: string;
  rules: string[];
  emergencyContacts: {
    reception: string;
    security: string;
    medical: string;
  };
}

export interface Notification {
  id: string;
  type: 'request' | 'order' | 'alert' | 'info';
  title: string;
  message: string;
  roomId?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  read: boolean;
  createdAt: Date;
  actionRequired?: boolean;
}

export interface Staff {
  id: string;
  name: string;
  role: 'reception' | 'housekeeping' | 'kitchen' | 'maintenance' | 'concierge' | 'manager';
  email: string;
  phone: string;
  shift: 'morning' | 'afternoon' | 'night';
  active: boolean;
}

export type Language = 'tr' | 'en' | 'de' | 'fr' | 'es' | 'it' | 'ru' | 'ar' | 'zh';

export interface Package {
  id: string;
  name: string;
  type: 'premium' | 'kurumsal';
  price: number;
  features: string[];
  maxRooms: number;
  maxStaff: number;
  includes: {
    qrMenu: boolean;
    analytics: boolean;
    multiLanguage: boolean;
    customBranding: boolean;
    apiAccess: boolean;
    prioritySupport: boolean;
    customIntegrations: boolean;
  };
}

export interface Business {
  id: string;
  name: string;
  type: 'hotel' | 'resort' | 'pension' | 'apartment';
  package: Package;
  rooms: Room[];
  staff: Staff[];
  settings: {
    currency: string;
    timezone: string;
    language: Language;
    branding: {
      logo?: string;
      primaryColor: string;
      secondaryColor: string;
    };
  };
  subscription: {
    startDate: Date;
    endDate: Date;
    status: 'active' | 'expired' | 'suspended';
    autoRenew: boolean;
  };
}

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  method: 'cash' | 'card' | 'room_charge' | 'online';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  createdAt: Date;
  processedAt?: Date;
  transactionId?: string;
  notes?: string;
}
