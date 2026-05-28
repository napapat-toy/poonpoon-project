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

export interface SavingGoal {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date?: string | null;
  created_at: string;
  updated_at: string;
}
