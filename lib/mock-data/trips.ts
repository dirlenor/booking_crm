import { TourPackage, packages } from './packages';

export interface TripCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  paxCount: number;
  paymentStatus: 'paid' | 'partial' | 'unpaid' | 'refunded';
  bookingId: string;
}

export interface Trip {
  id: string;
  packageId: string;
  packageName: string;
  destination: string;
  date: string; // ISO Date YYYY-MM-DD
  time: string; // HH:mm
  duration: string;
  participants: number;
  maxParticipants: number;
  guide: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'in-progress';
  customers: TripCustomer[];
  package: TourPackage; // Embedded package details for convenience
}

const generateCustomers = (count: number, startIndex: number): TripCustomer[] => {
  const statuses: ('paid' | 'partial' | 'unpaid' | 'refunded')[] = ['paid', 'paid', 'paid', 'partial', 'unpaid'];
  const customers: TripCustomer[] = [];
  
  for (let i = 0; i < count; i++) {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    customers.push({
      id: `CUST-${startIndex + i}`,
      name: `Customer ${startIndex + i}`,
      email: `customer${startIndex + i}@example.com`,
      phone: `081-234-${(startIndex + i).toString().padStart(4, '0')}`,
      paxCount: Math.floor(Math.random() * 3) + 1,
      paymentStatus: status,
      bookingId: `BK-${2000 + startIndex + i}`
    });
  }
  
  return customers;
};

// Helper to find package by ID (fallback to first if not found)
const getPackage = (id: string): TourPackage => {
  return packages.find(p => p.id === id) || packages[0];
};

export const trips: Trip[] = [
  {
    id: 'TR-2026-001',
    packageId: 'PKG-001',
    packageName: 'Grand Palace & Emerald Buddha Tour',
    destination: 'Bangkok',
    date: '2026-02-02',
    time: '08:00',
    duration: '1 Day',
    participants: 12,
    maxParticipants: 15,
    guide: 'Somsak Jai-dee',
    status: 'completed',
    package: getPackage('PKG-001'),
    customers: generateCustomers(5, 100)
  },
  {
    id: 'TR-2026-002',
    packageId: 'PKG-002',
    packageName: 'Ayutthaya Historical Park',
    destination: 'Ayutthaya',
    date: '2026-02-05',
    time: '07:30',
    duration: '1 Day',
    participants: 8,
    maxParticipants: 20,
    guide: 'Malee Sriprai',
    status: 'completed',
    package: getPackage('PKG-002'),
    customers: generateCustomers(3, 105)
  },
  {
    id: 'TR-2026-003',
    packageId: 'PKG-007',
    packageName: 'Bangkok Street Food Walking Tour',
    destination: 'Bangkok',
    date: '2026-02-06',
    time: '17:00',
    duration: '4 Hours',
    participants: 10,
    maxParticipants: 10,
    guide: 'Nopadol Aroi',
    status: 'completed',
    package: getPackage('PKG-007'),
    customers: generateCustomers(4, 108)
  },
  {
    id: 'TR-2026-004',
    packageId: 'PKG-004',
    packageName: 'Phuket Island Hopping',
    destination: 'Phuket',
    date: '2026-02-10',
    time: '09:00',
    duration: '1 Day',
    participants: 12,
    maxParticipants: 12,
    guide: 'Captain Jack',
    status: 'in-progress',
    package: getPackage('PKG-004'),
    customers: generateCustomers(6, 112)
  },
  {
    id: 'TR-2026-005',
    packageId: 'PKG-006',
    packageName: 'Krabi Rock Climbing',
    destination: 'Krabi',
    date: '2026-02-12',
    time: '08:30',
    duration: '1 Day',
    participants: 4,
    maxParticipants: 8,
    guide: 'Spider Man',
    status: 'scheduled',
    package: getPackage('PKG-006'),
    customers: generateCustomers(2, 118)
  },
  {
    id: 'TR-2026-006',
    packageId: 'PKG-003',
    packageName: 'Chiang Mai Elephant Sanctuary',
    destination: 'Chiang Mai',
    date: '2026-02-15',
    time: '08:00',
    duration: '2 Days 1 Night',
    participants: 6,
    maxParticipants: 10,
    guide: 'Chang Noi',
    status: 'scheduled',
    package: getPackage('PKG-003'),
    customers: generateCustomers(3, 120)
  },
  {
    id: 'TR-2026-007',
    packageId: 'PKG-001',
    packageName: 'Grand Palace & Emerald Buddha Tour',
    destination: 'Bangkok',
    date: '2026-02-18',
    time: '08:00',
    duration: '1 Day',
    participants: 5,
    maxParticipants: 15,
    guide: 'Somsak Jai-dee',
    status: 'scheduled',
    package: getPackage('PKG-001'),
    customers: generateCustomers(2, 123)
  },
  {
    id: 'TR-2026-008',
    packageId: 'PKG-007',
    packageName: 'Bangkok Street Food Walking Tour',
    destination: 'Bangkok',
    date: '2026-02-20',
    time: '17:00',
    duration: '4 Hours',
    participants: 8,
    maxParticipants: 10,
    guide: 'Nopadol Aroi',
    status: 'scheduled',
    package: getPackage('PKG-007'),
    customers: generateCustomers(4, 125)
  },
  {
    id: 'TR-2026-009',
    packageId: 'PKG-005',
    packageName: 'Kanchanaburi & River Kwai',
    destination: 'Kanchanaburi',
    date: '2026-02-22',
    time: '07:00',
    duration: '2 Days 1 Night',
    participants: 15,
    maxParticipants: 20,
    guide: 'History Buff',
    status: 'scheduled',
    package: getPackage('PKG-005'),
    customers: generateCustomers(8, 129)
  },
  {
    id: 'TR-2026-010',
    packageId: 'PKG-002',
    packageName: 'Ayutthaya Historical Park',
    destination: 'Ayutthaya',
    date: '2026-02-25',
    time: '07:30',
    duration: '1 Day',
    participants: 10,
    maxParticipants: 20,
    guide: 'Malee Sriprai',
    status: 'scheduled',
    package: getPackage('PKG-002'),
    customers: generateCustomers(4, 137)
  },
  
  {
    id: 'TR-2026-011',
    packageId: 'PKG-004',
    packageName: 'Phuket Island Hopping',
    destination: 'Phuket',
    date: '2026-03-01',
    time: '09:00',
    duration: '1 Day',
    participants: 12,
    maxParticipants: 12,
    guide: 'Captain Jack',
    status: 'scheduled',
    package: getPackage('PKG-004'),
    customers: generateCustomers(5, 141)
  },
  {
    id: 'TR-2026-012',
    packageId: 'PKG-001',
    packageName: 'Grand Palace & Emerald Buddha Tour',
    destination: 'Bangkok',
    date: '2026-03-03',
    time: '08:00',
    duration: '1 Day',
    participants: 0,
    maxParticipants: 15,
    guide: 'Somsak Jai-dee',
    status: 'scheduled',
    package: getPackage('PKG-001'),
    customers: []
  },
  {
    id: 'TR-2026-013',
    packageId: 'PKG-006',
    packageName: 'Krabi Rock Climbing',
    destination: 'Krabi',
    date: '2026-03-05',
    time: '08:30',
    duration: '1 Day',
    participants: 6,
    maxParticipants: 8,
    guide: 'Spider Man',
    status: 'scheduled',
    package: getPackage('PKG-006'),
    customers: generateCustomers(3, 146)
  },
  {
    id: 'TR-2026-014',
    packageId: 'PKG-007',
    packageName: 'Bangkok Street Food Walking Tour',
    destination: 'Bangkok',
    date: '2026-03-08',
    time: '17:00',
    duration: '4 Hours',
    participants: 4,
    maxParticipants: 10,
    guide: 'Nopadol Aroi',
    status: 'scheduled',
    package: getPackage('PKG-007'),
    customers: generateCustomers(2, 149)
  },
  {
    id: 'TR-2026-015',
    packageId: 'PKG-003',
    packageName: 'Chiang Mai Elephant Sanctuary',
    destination: 'Chiang Mai',
    date: '2026-03-12',
    time: '08:00',
    duration: '2 Days 1 Night',
    participants: 8,
    maxParticipants: 10,
    guide: 'Chang Noi',
    status: 'scheduled',
    package: getPackage('PKG-003'),
    customers: generateCustomers(4, 151)
  },
  
  {
    id: 'TR-2026-016',
    packageId: 'PKG-002',
    packageName: 'Ayutthaya Historical Park',
    destination: 'Ayutthaya',
    date: '2026-02-15',
    time: '07:30',
    duration: '1 Day',
    participants: 15,
    maxParticipants: 20,
    guide: 'Malee Sriprai',
    status: 'scheduled',
    package: getPackage('PKG-002'),
    customers: generateCustomers(6, 155)
  },
   {
    id: 'TR-2026-017',
    packageId: 'PKG-001',
    packageName: 'Grand Palace & Emerald Buddha Tour',
    destination: 'Bangkok',
    date: '2026-02-15',
    time: '09:00',
    duration: '1 Day',
    participants: 10,
    maxParticipants: 15,
    guide: 'Somsak Jai-dee',
    status: 'scheduled',
    package: getPackage('PKG-001'),
    customers: generateCustomers(4, 161)
  }
];
