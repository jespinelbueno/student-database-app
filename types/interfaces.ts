// src/types/interfaces.ts

export type Operator = 'equals' | 'contains' | 'greaterThan' | 'lessThan' | 'between' | 'in';

export interface QueryCondition {
  field: string;
  operator: Operator; // Make operator required
  value: string | number | boolean;
  valueTo?: string | number | boolean;
}

export interface ColumnVisibility {
  select: boolean;
  firstName: boolean;
  lastName: boolean;
  graduationYear: boolean;
  email: boolean;
  phoneNumber: boolean;
  state: boolean;
  schoolOrg: boolean;
  promisingStudent: boolean;
  actions: boolean;
}

export const DEFAULT_COLUMN_VISIBILITY: ColumnVisibility = {
  select: true,
  firstName: true,
  lastName: true,
  graduationYear: true,
  email: true,
  phoneNumber: true,
  state: true,
  schoolOrg: true,
  promisingStudent: true,
  actions: true,
};
