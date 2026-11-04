export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface Medicine {
  id: string;
  name: string;
  dosage?: string | null;
  instructions?: string | null;
  boxNumber: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Schedule {
  id: string;
  medicineId: string;
  deviceId: string;
  startTime: string;
  endTime: string;
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
  boxNumber: number;
  enabled: boolean;
  medicine?: Medicine;
  device?: {
    id: string;
    deviceId: string;
    name: string;
    status: string;
  };
}

export interface MedicationEvent {
  id: string;
  scheduleId?: string | null;
  medicineId?: string | null;
  deviceId: string;
  boxNumber: number;
  eventType: 'MEDICINE_REMINDER' | 'MEDICINE_TAKEN' | 'MEDICINE_MISSED' | 'BOX_OPENED';
  status: 'TAKEN' | 'MISSED' | 'PENDING';
  timestamp: string;
  medicine?: Medicine | null;
  schedule?: Schedule | null;
}

export interface DeviceStatus {
  id: string;
  deviceId: string;
  name: string;
  status: 'ONLINE' | 'OFFLINE';
  isOnline: boolean;
  lastSeen?: string | null;
  firmwareVersion: string;
  wifiSignal: number;
  wifiSsid?: string | null;
  ipAddress?: string | null;
}

export interface NotificationItem {
  id: string;
  type: 'REMINDER' | 'TAKEN' | 'MISSED' | 'OFFLINE' | 'ONLINE' | 'SYSTEM';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface AnalyticsSummary {
  todayDoses: number;
  takenToday: number;
  missedToday: number;
  pendingToday: number;
  todayAdherence: number;
  overallAdherence: number;
  totalEventsCount: number;
  mostUsedBox: number;
}

export interface AdherenceTrend {
  date: string;
  rawDate: string;
  taken: number;
  missed: number;
  total: number;
  adherence: number;
}
