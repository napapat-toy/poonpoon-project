/**
 * Shared Type Definitions for PoonPoon Application
 */

export interface Transaction {
  id: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  date: string;
  description?: string | null;
  deleted_at?: string | null;
}
