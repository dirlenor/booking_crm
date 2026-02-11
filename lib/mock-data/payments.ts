export interface Payment {
  id: string;
  bookingId: string;
  bookingRef: string;
  customerName: string;
  packageName: string;
  amount: number;
  date: string;
  method: 'Credit Card' | 'Bank Transfer' | 'Cash' | 'PromptPay';
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  note?: string;
  slipUrl?: string;
}


export const payments: Payment[] = [
  {
    id: 'PAY-001',
    bookingId: 'BK-2024-001',
    bookingRef: 'REF-88392',
    customerName: 'Somchai Jaidee',
    packageName: 'Grand Palace & Emerald Buddha Tour',
    amount: 5000,
    date: '2024-01-15T10:45:00Z',
    method: 'Credit Card',
    status: 'completed',
    note: 'Full payment'
  },
  {
    id: 'PAY-002',
    bookingId: 'BK-2023-128',
    bookingRef: 'REF-77291',
    customerName: 'Somchai Jaidee',
    packageName: 'Ayutthaya Historical Park Day Trip',
    amount: 7200,
    date: '2023-12-20T14:30:00Z',
    method: 'Bank Transfer',
    status: 'completed',
    note: 'Early bird discount applied'
  },
  {
    id: 'PAY-003',
    bookingId: 'BK-2024-020',
    bookingRef: 'REF-11223',
    customerName: 'David Smith',
    packageName: 'Phuket Island Hopping Luxury Yacht',
    amount: 25500,
    date: '2024-02-10T09:15:00Z',
    method: 'Credit Card',
    status: 'completed',
    note: '50% Deposit'
  },
  {
    id: 'PAY-004',
    bookingId: 'BK-2024-040',
    bookingRef: 'REF-55667',
    customerName: 'Wipawee Sorn',
    packageName: 'Chiang Mai Elephant Sanctuary',
    amount: 13500,
    date: '2024-03-01T16:15:00Z',
    method: 'PromptPay',
    status: 'completed'
  },
  {
    id: 'PAY-005',
    bookingId: 'BK-2024-055',
    bookingRef: 'REF-77889',
    customerName: 'Nattaporn Srisuk',
    packageName: 'Bangkok Street Food Walking Tour',
    amount: 4800,
    date: '2024-03-05T13:40:00Z',
    method: 'Credit Card',
    status: 'completed'
  },
  {
    id: 'PAY-006',
    bookingId: 'BK-2024-055',
    bookingRef: 'REF-77889',
    customerName: 'Nattaporn Srisuk',
    packageName: 'Bangkok Street Food Walking Tour',
    amount: 4800,
    date: '2024-03-10T10:00:00Z',
    method: 'Credit Card',
    status: 'refunded',
    note: 'Customer cancelled due to emergency'
  },
  {
    id: 'PAY-007',
    bookingId: 'BK-2024-065',
    bookingRef: 'REF-12345',
    customerName: 'Araya Wong',
    packageName: 'Kanchanaburi & River Kwai History',
    amount: 3200,
    date: '2023-11-15T15:10:00Z',
    method: 'PromptPay',
    status: 'completed'
  },
  {
    id: 'PAY-008',
    bookingId: 'BK-2024-099',
    bookingRef: 'REF-99881',
    customerName: 'John Wick',
    packageName: 'Krabi Rock Climbing Adventure',
    amount: 15000,
    date: '2024-03-14T11:20:00Z',
    method: 'Cash',
    status: 'pending',
    note: 'Waiting for cash collection'
  },
  {
    id: 'PAY-009',
    bookingId: 'BK-2024-100',
    bookingRef: 'REF-44556',
    customerName: 'Sarah Conner',
    packageName: 'Kanchanaburi & River Kwai History',
    amount: 4500,
    date: '2024-03-15T09:00:00Z',
    method: 'Bank Transfer',
    status: 'failed',
    note: 'Slip verification failed'
  }
];
