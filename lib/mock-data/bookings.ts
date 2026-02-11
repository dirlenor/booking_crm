import { Customer, customers } from './customers';
import { TourPackage, packages } from './packages';

export interface BookingPassenger {
  id: string;
  name: string;
  type: 'Adult' | 'Child' | 'Infant';
  age?: number;
  passportNumber?: string;
  specialRequests?: string;
}

export interface BookingPayment {
  id: string;
  bookingId: string;
  amount: number;
  date: string;
  method: 'Credit Card' | 'Bank Transfer' | 'Cash' | 'PromptPay';
  status: 'completed' | 'pending' | 'failed';
  proofUrl?: string;
}

export interface Booking {
  id: string;
  bookingRef: string;
  customerId: string;
  customer?: Customer; // Populated for UI convenience
  packageId: string;
  package?: TourPackage; // Populated for UI convenience
  bookingDate: string;
  tripDate: string;
  pax: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  paymentStatus: 'unpaid' | 'partial' | 'paid' | 'refunded';
  passengers: BookingPassenger[];
  payments: BookingPayment[];
  notes?: string;
}

// Helper to find customer and package
const getCustomer = (id: string) => customers.find(c => c.id === id);
const getPackage = (id: string) => packages.find(p => p.id === id);

export const bookings: Booking[] = [
  {
    id: 'BK-2024-001',
    bookingRef: 'REF-88392',
    customerId: 'CUST-001',
    customer: getCustomer('CUST-001'),
    packageId: 'PKG-001',
    package: getPackage('PKG-001'),
    bookingDate: '2024-01-15T10:30:00Z',
    tripDate: '2024-02-15',
    pax: 2,
    totalAmount: 5000, // 2500 * 2
    status: 'confirmed',
    paymentStatus: 'paid',
    passengers: [
      { id: 'PAX-001', name: 'Somchai Jaidee', type: 'Adult', age: 45 },
      { id: 'PAX-002', name: 'Somsri Jaidee', type: 'Adult', age: 42 }
    ],
    payments: [
      {
        id: 'PAY-001',
        bookingId: 'BK-2024-001',
        amount: 5000,
        date: '2024-01-15T10:45:00Z',
        method: 'Credit Card',
        status: 'completed'
      }
    ]
  },
  {
    id: 'BK-2023-128',
    bookingRef: 'REF-77291',
    customerId: 'CUST-001',
    customer: getCustomer('CUST-001'),
    packageId: 'PKG-002',
    package: getPackage('PKG-002'),
    bookingDate: '2023-12-20T14:20:00Z',
    tripDate: '2024-01-15',
    pax: 4,
    totalAmount: 7200, // 1800 * 4
    status: 'completed',
    paymentStatus: 'paid',
    passengers: [
      { id: 'PAX-003', name: 'Somchai Jaidee', type: 'Adult', age: 45 },
      { id: 'PAX-004', name: 'Somsri Jaidee', type: 'Adult', age: 42 },
      { id: 'PAX-005', name: 'Somchai Jr.', type: 'Child', age: 12 },
      { id: 'PAX-006', name: 'Somsri Jr.', type: 'Child', age: 10 }
    ],
    payments: [
      {
        id: 'PAY-002',
        bookingId: 'BK-2023-128',
        amount: 7200,
        date: '2023-12-20T14:30:00Z',
        method: 'Bank Transfer',
        status: 'completed'
      }
    ]
  },
  {
    id: 'BK-2024-020',
    bookingRef: 'REF-11223',
    customerId: 'CUST-003',
    customer: getCustomer('CUST-003'),
    packageId: 'PKG-004',
    package: getPackage('PKG-004'),
    bookingDate: '2024-02-10T09:00:00Z',
    tripDate: '2024-03-10',
    pax: 6,
    totalAmount: 51000, // 8500 * 6
    status: 'confirmed',
    paymentStatus: 'partial',
    passengers: [
      { id: 'PAX-007', name: 'David Smith', type: 'Adult', age: 35 },
      { id: 'PAX-008', name: 'Jennifer Smith', type: 'Adult', age: 32 },
      { id: 'PAX-009', name: 'John Doe', type: 'Adult', age: 36 },
      { id: 'PAX-010', name: 'Jane Doe', type: 'Adult', age: 34 },
      { id: 'PAX-011', name: 'Michael Brown', type: 'Adult', age: 38 },
      { id: 'PAX-012', name: 'Sarah Brown', type: 'Adult', age: 35 }
    ],
    payments: [
      {
        id: 'PAY-003',
        bookingId: 'BK-2024-020',
        amount: 25500, // 50% deposit
        date: '2024-02-10T09:15:00Z',
        method: 'Credit Card',
        status: 'completed'
      }
    ]
  },
  {
    id: 'BK-2024-035',
    bookingRef: 'REF-33445',
    customerId: 'CUST-005',
    customer: getCustomer('CUST-005'),
    packageId: 'PKG-006',
    package: getPackage('PKG-006'),
    bookingDate: '2024-02-25T11:00:00Z',
    tripDate: '2024-04-15',
    pax: 2,
    totalAmount: 5600, // 2800 * 2
    status: 'pending',
    paymentStatus: 'unpaid',
    passengers: [
      { id: 'PAX-013', name: 'Thongchai Meesuk', type: 'Adult', age: 28 },
      { id: 'PAX-014', name: 'Friend of Thongchai', type: 'Adult', age: 29 }
    ],
    payments: []
  },
  {
    id: 'BK-2024-040',
    bookingRef: 'REF-55667',
    customerId: 'CUST-008',
    customer: getCustomer('CUST-008'),
    packageId: 'PKG-003',
    package: getPackage('PKG-003'),
    bookingDate: '2024-03-01T16:00:00Z',
    tripDate: '2024-04-05',
    pax: 3,
    totalAmount: 13500, // 4500 * 3
    status: 'confirmed',
    paymentStatus: 'paid',
    passengers: [
      { id: 'PAX-015', name: 'Wipawee Sorn', type: 'Adult', age: 50 },
      { id: 'PAX-016', name: 'Daughter 1', type: 'Adult', age: 22 },
      { id: 'PAX-017', name: 'Daughter 2', type: 'Adult', age: 20 }
    ],
    payments: [
      {
        id: 'PAY-004',
        bookingId: 'BK-2024-040',
        amount: 13500,
        date: '2024-03-01T16:15:00Z',
        method: 'PromptPay',
        status: 'completed'
      }
    ]
  },
  {
    id: 'BK-2024-055',
    bookingRef: 'REF-77889',
    customerId: 'CUST-002',
    customer: getCustomer('CUST-002'),
    packageId: 'PKG-007',
    package: getPackage('PKG-007'),
    bookingDate: '2024-03-05T13:30:00Z',
    tripDate: '2024-03-18',
    pax: 4,
    totalAmount: 4800, // 1200 * 4
    status: 'cancelled',
    paymentStatus: 'refunded',
    passengers: [
      { id: 'PAX-018', name: 'Nattaporn Srisuk', type: 'Adult', age: 30 },
      { id: 'PAX-019', name: 'Friend 1', type: 'Adult', age: 30 },
      { id: 'PAX-020', name: 'Friend 2', type: 'Adult', age: 30 },
      { id: 'PAX-021', name: 'Friend 3', type: 'Adult', age: 30 }
    ],
    payments: [
      {
        id: 'PAY-005',
        bookingId: 'BK-2024-055',
        amount: 4800,
        date: '2024-03-05T13:40:00Z',
        method: 'Credit Card',
        status: 'completed'
      },
      {
        id: 'PAY-006',
        bookingId: 'BK-2024-055',
        amount: -4800,
        date: '2024-03-10T10:00:00Z',
        method: 'Credit Card',
        status: 'completed'
      }
    ]
  },
  {
    id: 'BK-2024-060',
    bookingRef: 'REF-99001',
    customerId: 'CUST-006',
    customer: getCustomer('CUST-006'),
    packageId: 'PKG-001',
    package: getPackage('PKG-001'),
    bookingDate: '2024-03-12T08:00:00Z',
    tripDate: '2024-04-01',
    pax: 2,
    totalAmount: 5000,
    status: 'pending',
    paymentStatus: 'unpaid',
    passengers: [
      { id: 'PAX-022', name: 'Sarah Johnson', type: 'Adult', age: 29 },
      { id: 'PAX-023', name: 'Partner', type: 'Adult', age: 30 }
    ],
    payments: []
  },
  {
    id: 'BK-2024-065',
    bookingRef: 'REF-12345',
    customerId: 'CUST-004',
    customer: getCustomer('CUST-004'),
    packageId: 'PKG-005',
    package: getPackage('PKG-005'),
    bookingDate: '2023-11-15T15:00:00Z',
    tripDate: '2023-11-20',
    pax: 1,
    totalAmount: 3200,
    status: 'completed',
    paymentStatus: 'paid',
    passengers: [
      { id: 'PAX-024', name: 'Araya Wong', type: 'Adult', age: 26 }
    ],
    payments: [
      {
        id: 'PAY-007',
        bookingId: 'BK-2024-065',
        amount: 3200,
        date: '2023-11-15T15:10:00Z',
        method: 'PromptPay',
        status: 'completed'
      }
    ]
  }
];
