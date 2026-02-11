export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalBookings: number;
  totalSpent: number;
  lastBookingDate: string;
  status: 'active' | 'inactive';
  tier: 'Standard' | 'VIP' | 'Platinum';
  avatarInitials: string;
}

export interface BookingHistory {
  id: string;
  bookingRef: string;
  packageName: string;
  tripDate: string;
  amount: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  paymentStatus: 'paid' | 'unpaid' | 'partial';
  pax: number;
}

export const customers: Customer[] = [
  {
    id: 'CUST-001',
    name: 'Somchai Jaidee',
    email: 'somchai.j@example.com',
    phone: '081-234-5678',
    totalBookings: 5,
    totalSpent: 125000,
    lastBookingDate: '2024-01-15',
    status: 'active',
    tier: 'VIP',
    avatarInitials: 'SJ'
  },
  {
    id: 'CUST-002',
    name: 'Nattaporn Srisuk',
    email: 'nattaporn.s@example.com',
    phone: '089-876-5432',
    totalBookings: 2,
    totalSpent: 45000,
    lastBookingDate: '2023-12-10',
    status: 'active',
    tier: 'Standard',
    avatarInitials: 'NS'
  },
  {
    id: 'CUST-003',
    name: 'David Smith',
    email: 'david.smith@email.com',
    phone: '090-111-2222',
    totalBookings: 8,
    totalSpent: 350000,
    lastBookingDate: '2024-02-01',
    status: 'active',
    tier: 'Platinum',
    avatarInitials: 'DS'
  },
  {
    id: 'CUST-004',
    name: 'Araya Wong',
    email: 'araya.w@example.com',
    phone: '086-555-4444',
    totalBookings: 1,
    totalSpent: 15000,
    lastBookingDate: '2023-11-20',
    status: 'inactive',
    tier: 'Standard',
    avatarInitials: 'AW'
  },
  {
    id: 'CUST-005',
    name: 'Thongchai Meesuk',
    email: 'thongchai.m@example.com',
    phone: '081-999-8888',
    totalBookings: 12,
    totalSpent: 500000,
    lastBookingDate: '2024-01-25',
    status: 'active',
    tier: 'Platinum',
    avatarInitials: 'TM'
  },
  {
    id: 'CUST-006',
    name: 'Sarah Johnson',
    email: 'sarah.j@email.com',
    phone: '092-333-4444',
    totalBookings: 3,
    totalSpent: 75000,
    lastBookingDate: '2024-01-05',
    status: 'active',
    tier: 'Standard',
    avatarInitials: 'SJ'
  },
  {
    id: 'CUST-007',
    name: 'Pichai Raksa',
    email: 'pichai.r@example.com',
    phone: '087-777-6666',
    totalBookings: 0,
    totalSpent: 0,
    lastBookingDate: '-',
    status: 'inactive',
    tier: 'Standard',
    avatarInitials: 'PR'
  },
  {
    id: 'CUST-008',
    name: 'Wipawee Sorn',
    email: 'wipawee.s@example.com',
    phone: '084-222-3333',
    totalBookings: 6,
    totalSpent: 180000,
    lastBookingDate: '2024-01-30',
    status: 'active',
    tier: 'VIP',
    avatarInitials: 'WS'
  }
];

export const customerBookings: Record<string, BookingHistory[]> = {
  'CUST-001': [
    {
      id: 'BK-2024-001',
      bookingRef: 'REF-88392',
      packageName: 'Grand Palace & Emerald Buddha Tour',
      tripDate: '2024-02-15',
      amount: 25000,
      status: 'confirmed',
      paymentStatus: 'paid',
      pax: 2
    },
    {
      id: 'BK-2023-128',
      bookingRef: 'REF-77291',
      packageName: 'Ayutthaya Historical Park Day Trip',
      tripDate: '2024-01-15',
      amount: 18000,
      status: 'completed',
      paymentStatus: 'paid',
      pax: 4
    },
    {
      id: 'BK-2023-095',
      bookingRef: 'REF-66382',
      packageName: 'Floating Market Weekend Tour',
      tripDate: '2023-12-05',
      amount: 12000,
      status: 'completed',
      paymentStatus: 'paid',
      pax: 3
    }
  ],
  'CUST-002': [
    {
      id: 'BK-2023-150',
      bookingRef: 'REF-99281',
      packageName: 'Chiang Mai Elephant Sanctuary',
      tripDate: '2023-12-10',
      amount: 35000,
      status: 'completed',
      paymentStatus: 'paid',
      pax: 2
    },
    {
      id: 'BK-2023-050',
      bookingRef: 'REF-55192',
      packageName: 'Bangkok Food Tour',
      tripDate: '2023-08-20',
      amount: 10000,
      status: 'completed',
      paymentStatus: 'paid',
      pax: 2
    }
  ],
  'CUST-003': [
    {
      id: 'BK-2024-020',
      bookingRef: 'REF-11223',
      packageName: 'Phuket Island Hopping Luxury Yacht',
      tripDate: '2024-03-10',
      amount: 120000,
      status: 'confirmed',
      paymentStatus: 'partial',
      pax: 6
    },
    {
      id: 'BK-2024-005',
      bookingRef: 'REF-22334',
      packageName: 'Private Helicopter Tour Bangkok',
      tripDate: '2024-02-01',
      amount: 85000,
      status: 'completed',
      paymentStatus: 'paid',
      pax: 2
    }
  ]
};

