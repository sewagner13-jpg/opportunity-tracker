export type Status =
  | 'New'
  | 'In Review'
  | 'Sourcing'
  | 'Waiting on Supplier'
  | 'Quoted'
  | 'Awaiting Customer Response'
  | 'Won'
  | 'Lost'
  | 'On Hold'
  | 'Completed';

export type Priority = 'High' | 'Medium' | 'Low';

export type UserRole = 'Admin' | 'Sales' | 'Viewer';

export interface Opportunity {
  id: string;
  salesPersonName: string;
  dateEntered: string;       // ISO date string
  dateNeeded: string;        // ISO date string
  targetPrice: number | null;
  annualVolume: number | null;
  quickNote: string;
  customerName: string;
  productName: string;
  productCategory: string;
  status: Status;
  priority: Priority;
  completionPercent: number;
  assignedOwner: string;
  supplierName: string;
  lastUpdated: string;       // ISO datetime string
  nextAction: string;
  followUpDate: string;      // ISO date string
  estimatedMargin: number | null;  // percentage
  actualQuotedPrice: number | null;
  outcomeReason: string;
  internalComments: string;
  isCompleted: boolean;
  dateCompleted: string;     // ISO date string
  includeInTodaysFocus: boolean;
  todaysFocusRank: number;
}

export const STATUSES: Status[] = [
  'New',
  'In Review',
  'Sourcing',
  'Waiting on Supplier',
  'Quoted',
  'Awaiting Customer Response',
  'Won',
  'Lost',
  'On Hold',
  'Completed',
];

export const PRIORITIES: Priority[] = ['High', 'Medium', 'Low'];

export const STATUS_COLORS: Record<Status, { bg: string; text: string; dot: string }> = {
  'New':                       { bg: 'bg-blue-100',   text: 'text-blue-800',   dot: 'bg-blue-500' },
  'In Review':                 { bg: 'bg-indigo-100', text: 'text-indigo-800', dot: 'bg-indigo-500' },
  'Sourcing':                  { bg: 'bg-purple-100', text: 'text-purple-800', dot: 'bg-purple-500' },
  'Waiting on Supplier':       { bg: 'bg-orange-100', text: 'text-orange-800', dot: 'bg-orange-500' },
  'Quoted':                    { bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-500' },
  'Awaiting Customer Response':{ bg: 'bg-cyan-100',   text: 'text-cyan-800',   dot: 'bg-cyan-500' },
  'Won':                       { bg: 'bg-green-100',  text: 'text-green-800',  dot: 'bg-green-500' },
  'Lost':                      { bg: 'bg-red-100',    text: 'text-red-800',    dot: 'bg-red-500' },
  'On Hold':                   { bg: 'bg-gray-100',   text: 'text-gray-700',   dot: 'bg-gray-400' },
  'Completed':                 { bg: 'bg-teal-100',   text: 'text-teal-800',   dot: 'bg-teal-500' },
};

export const STATUS_COLORS_DARK: Record<Status, { bg: string; text: string }> = {
  'New':                       { bg: 'bg-blue-900/50',   text: 'text-blue-300' },
  'In Review':                 { bg: 'bg-indigo-900/50', text: 'text-indigo-300' },
  'Sourcing':                  { bg: 'bg-purple-900/50', text: 'text-purple-300' },
  'Waiting on Supplier':       { bg: 'bg-orange-900/50', text: 'text-orange-300' },
  'Quoted':                    { bg: 'bg-yellow-900/50', text: 'text-yellow-300' },
  'Awaiting Customer Response':{ bg: 'bg-cyan-900/50',   text: 'text-cyan-300' },
  'Won':                       { bg: 'bg-green-900/50',  text: 'text-green-300' },
  'Lost':                      { bg: 'bg-red-900/50',    text: 'text-red-300' },
  'On Hold':                   { bg: 'bg-gray-700/50',   text: 'text-gray-300' },
  'Completed':                 { bg: 'bg-teal-900/50',   text: 'text-teal-300' },
};

export const PRIORITY_COLORS: Record<Priority, { bg: string; text: string; border: string }> = {
  'High':   { bg: 'bg-red-100',    text: 'text-red-700',    border: 'border-red-300' },
  'Medium': { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300' },
  'Low':    { bg: 'bg-green-100',  text: 'text-green-700',  border: 'border-green-300' },
};

export interface FilterState {
  search: string;
  salesperson: string;
  status: string;
  priority: string;
  dueDateFrom: string;
  dueDateTo: string;
  overdueOnly: boolean;
  openOnly: boolean;
  completedOnly: boolean;
}

export interface SortState {
  field: keyof Opportunity | '';
  direction: 'asc' | 'desc';
}

export const OPEN_STATUSES: Status[] = [
  'New', 'In Review', 'Sourcing', 'Waiting on Supplier',
  'Quoted', 'Awaiting Customer Response', 'On Hold'
];

export const CLOSED_STATUSES: Status[] = ['Won', 'Lost', 'Completed'];

export const PRODUCT_CATEGORIES = [
  'Metals',
  'Plastics',
  'Electronics',
  'Fasteners',
  'Chemicals',
  'Packaging',
  'Raw Materials',
  'Components',
  'Assemblies',
  'Other',
];
