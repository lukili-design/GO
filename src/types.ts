/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum BookingStatus {
  UPCOMING = 'UPCOMING',
  CHECKED_IN = 'CHECKED_IN',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface VisitorInfo {
  name: string;
  idNumber: string; // 證件號
}

export type PurposeCode = 'C' | 'D' | 'F' | 'I' | 'M' | 'N' | 'S' | 'V';

export interface PurposeOption {
  code: PurposeCode;
  label: string;
  color: string; // Tailwind color class for badges
  bgColor: string; // Tailwind background color class for badges
}

export interface Booking {
  id: string;
  visitorName: string;
  company?: string;
  visitDateTime: string;
  licensePlate?: string;
  purpose: PurposeCode;
  destination: string;
  notes?: string;
  contactEmail?: string;
  status: BookingStatus;
  createdAt: string;
  checkedInAt?: string;
  checkedOutAt?: string;
  invitationCode: string; // Unique alphanumeric code for QR
  isPendingApproval?: boolean;
  approvalNotes?: string;
  isWalkIn?: boolean;
  associatedBookingId?: string;
  hostEmployeeName?: string;
  hostEmployeeDept?: string;
  contactPerson?: string;
  responsibleDept?: string;
  contactPhone?: string;
  visitors?: VisitorInfo[];
}

// APP Navigation Tabs
export type AppBottomTab = 'NEWS' | 'BENEFITS' | 'DAILY_WORK' | 'EVENTS' | 'RESOURCES';
export type DailyWorkSubModule = 'WORKBENCH' | 'CALENDAR' | 'CANTEEN' | 'BUS' | 'VISITOR' | 'CLOCK_IN' | 'CLOCK_RECORD';

// Clock-In / Attendance Types
export type ClockInType = 'IN' | 'OUT';
export type LocationMethod = 'BEACON' | 'WIFI' | 'GPS';
export type ClockInStatus = 'NORMAL' | 'LATE' | 'EARLY_LEAVE' | 'MISSING';

export interface ClockInLog {
  id: string;
  employeeId: string;
  employeeNameZh: string;
  employeeNameEn: string;
  employeeName?: string;
  employeeType: string; // 全職員工 / 兼職員工 / 合約員工 / 外判人員
  dept: string;
  deviceId?: string; // 設備號 SN / Device ID
  timestamp: string; // format: "YYYY-MM-DD HH:mm:ss"
  clockType: 'CLOCK IN' | 'CLOCK OUT' | 'IN' | 'OUT';
  method: LocationMethod;
  locationDetail: string;
  status: 'NORMAL' | 'ABNORMAL' | ClockInStatus;
  notes?: string;
  isCorrection?: boolean;
}

export interface BeaconRule {
  id: string;
  name: string;
  uuid: string;
  major: string | number;
  minor?: string | number;
  rssiThreshold?: number;
  locationNote?: string;
  isEnabled: boolean;
}

export interface WifiRule {
  id: string;
  ssid: string;
  mac: string;
  locationNote?: string;
  isEnabled: boolean;
}

export interface GpsFenceRule {
  id: string;
  locationName: string;
  address?: string;
  centerLat: number;
  centerLng: number;
  radiusMeters: number;
  isEnabled: boolean;
}

export interface GpsConfig {
  centerLat: number;
  centerLng: number;
  radiusMeters: number;
  locationName: string;
  isEnabled: boolean;
}

export interface MonthlyReportSummary {
  month: string; // e.g. "2026-07"
  monthName: string; // e.g. "2026年7月"
  employeeCount: number; // 考勤僱員數
  totalPunches: number; // 總有效打卡數
  abnormalCount: number; // 異常打卡人次
  generatedAt: string;
}

export interface MonthlyReportDetail {
  id: string;
  employeeId: string;
  employeeNameZh: string;
  employeeNameEn: string;
  employeeName?: string;
  employeeType: string;
  dept: string;
  month: string;
  normalDays: number;
  abnormalDays: number;
  missingPunches: number;
  totalHours: number;
}

