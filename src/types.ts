/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum BookingStatus {
  PENDING = 'PENDING',
  UPCOMING = 'UPCOMING',
  CHECKED_IN = 'CHECKED_IN',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface VisitorInfo {
  name: string;
  idNumber?: string; // 證件號 (選填)
  email?: string; // 郵箱
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
  visitorType?: 'SINGLE' | 'MULTI' | 'MULTI_SHARED' | 'MULTI_INDIVIDUAL' | 'TEAM';
  totalVisitorsCount?: number;
  company?: string;
  visitDateTime: string;
  visitMode?: 'SINGLE_VISIT' | 'MULTI_PASS';
  startDateTime?: string;
  endDateTime?: string;
  licensePlate?: string;
  licensePlates?: string[];
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
  hostEmployeeId?: string;
  hostEmployeeName?: string;
  hostEmployeeDept?: string;
  contactPerson?: string;
  responsibleDept?: string;
  contactPhone?: string;
  clientTier?: 'NORMAL' | 'VIP';
  visitorIdCard?: string; // 門禁放行登記之證件號碼 (HKID / Passport / Mainland Travel Permit)
  visitors?: VisitorInfo[];
}

// APP Navigation Tabs
export type AppBottomTab = 'NEWS' | 'BENEFITS' | 'DAILY_WORK' | 'EVENTS' | 'RESOURCES';
export type DailyWorkSubModule = 'WORKBENCH' | 'CALENDAR' | 'CANTEEN' | 'BUS' | 'VISITOR' | 'CLOCK_IN' | 'CLOCK_RECORD' | 'VOTING';

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

// ==================== TVB GO 互動投票系統 (Voting Campaign Module) ====================

export type VoteResultVisibility = 'AFTER_VOTE' | 'ALWAYS_PUBLIC' | 'ADMIN_ONLY' | 'AFTER_CAMPAIGN_END';
export type VoteCampaignStatus = 'UPCOMING' | 'ACTIVE' | 'ENDED';
export type VoteSelectionMode = 'SINGLE' | 'MULTIPLE';
export type VoteFrequencyLimit = 'ONCE_TOTAL' | 'ONCE_DAILY';

export interface VoteOption {
  id: string;
  name: string; // 選項名稱 (如：01號 - 張學友)
  avatar: string; // 1:1 縮圖/頭像
  description: string; // 100字內簡介
  initialVotes: number; // 初始票數基數
  votes: number; // 累計實時票數
}

export interface VotePhase {
  id: string;
  name: string; // 階段名稱 (如：40進20 淘汰賽)
  status: VoteCampaignStatus; // 未開始 / 進行中 / 已結束
  startTime: string; // YYYY-MM-DD HH:mm:ss
  endTime: string; // YYYY-MM-DD HH:mm:ss
  mode: VoteSelectionMode; // 單選 / 多選
  maxSelections: number; // 多選時最多可選數量 (如: 3)
  frequencyLimit: VoteFrequencyLimit; // 活動期間每人限投1次 / 每人每天限投1次
  requireAuth: boolean; // 強制 TVB GO 會員實名投票
  advanceRuleEnabled?: boolean; // 🌟 是否啟用「前X名自動晉級下個階段」規則
  advanceTopCount?: number; // 🌟 晉級名額：前 X 名 (如 20 或 7)
  advanceTargetPhaseId?: string; // 🌟 晉級之目標階段 ID
  advanceSourcePhaseId?: string; // 🌟 來源階段 ID (從哪個階段導入)
  advanceSourceTopCount?: number; // 🌟 導入上一階段的前 X 名
  options: VoteOption[]; // 該階段之候選選項
}

export interface VoteItem {
  id: string; // 投票項目 ID (如 ITEM-01, BEST-ACTOR, BEST-DRAMA)
  title: string; // 投票項目名稱 (如：最佳女演員、最佳男演員、最佳劇集)
  name?: string; // 投票項目名稱 (兼容別名)
  description?: string; // 投票項目說明
  coverImage?: string; // 投票項目專屬封面圖 (可選，留空則默認繼承活動封面)
  phases: VotePhase[]; // 該投票項目的階段賽制 (單階段或多階段淘汰賽)
  currentPhaseId: string; // 當前進行中階段 ID
  status: VoteCampaignStatus; // 該投票項目狀態 (ACTIVE / UPCOMING / ENDED)
  totalParticipants?: number;
  totalVotes?: number;
}

export interface VotingCampaign {
  id: string; // 活動 ID (如 CAMP-2026-001)
  title: string; // 活動名稱
  coverImage: string; // 16:9 封面圖
  description: string; // 活動簡介
  resultVisibility: VoteResultVisibility; // 結果公開規則
  status: VoteCampaignStatus; // 當前整體狀態
  voteItems?: VoteItem[]; // 🌟 活動下的多個投票項目 (一個活動可以創建多個投票項目)
  phases: VotePhase[]; // 分階段賽制配置 (解決 40進20、20進7，兼容單一投票賽制)
  currentPhaseId: string; // 當前進行中階段 ID
  totalParticipants: number; // 總參與人數
  totalVotes: number; // 總票數
  startTime: string; // 活動整體開始時間
  endTime: string; // 活動整體結束時間
  creator: string; // 創建人
  createdAt: string; // 創建時間
  updatedAt: string; // 更新時間
}

export interface VoteLogRecord {
  id: string; // 投票紀錄單號 (如 VLOG-8921471)
  campaignId: string; // 所屬活動 ID
  campaignTitle: string; // 所屬活動名稱
  phaseId: string; // 投票階段 ID
  phaseName: string; // 投票階段名稱
  voterId: string; // 投票人 ID (如 USR-82910)
  voterName: string; // 投票人姓名 / 暱稱
  voterPhone?: string; // 投票人綁定手機號碼 (去敏)
  voterDevice: string; // 投票終端設備 (iOS App / Android App / Web)
  voterIp: string; // 投票 IP 地址
  authType: 'TVB_GO_MEMBER' | 'SMS_VERIFIED' | 'STAFF_SSO' | 'GUEST_DEVICE'; // 認證方式
  selectedOptionIds: string[]; // 所選選項 ID 列表
  selectedOptionNames: string[]; // 所選選項名稱列表
  votedAt: string; // 投票時間 (YYYY-MM-DD HH:mm:ss)
  status: 'VALID' | 'ABNORMAL_INTERCEPTED' | 'REVOKED'; // 投票審計狀態
}

export interface VoteArticle {
  id: string; // 文章 ID (如 ART-2026-001)
  title: string; // 文章標題
  category: string; // 分類標籤
  author: string; // 發布人 / 編輯
  coverImage: string; // 文章封面
  summary: string; // 文章摘要
  content: string; // 文章正文，包含 [VOTE_ID: CAMP-2026-001] 等短碼
  linkedCampaignIds: string[]; // 關聯之投票活動 ID 列表
  status: 'PUBLISHED' | 'DRAFT'; // 發布狀態
  publishDate: string; // 發布日期
  viewCount: number; // 瀏覽量
}

