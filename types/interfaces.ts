// src/types/interfaces.ts

export type Operator = 'equals' | 'contains' | 'greaterThan' | 'lessThan' | 'between' | 'in';

export interface QueryCondition {
  field: string;
  operator: Operator; // Make operator required
  value: string | number | boolean;
  valueTo?: string | number | boolean;
}
