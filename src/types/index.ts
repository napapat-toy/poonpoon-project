/**
 * Shared Type Definitions for PoonPoon Application
 */

export interface Transaction {
  id: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  date: string;
}

export interface SavingGoal {
  id: string;
  user_id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  created_at: string;
}
