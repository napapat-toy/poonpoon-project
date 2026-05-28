"use client";

import { use, Suspense } from "react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { TransactionHistory, TransactionHistorySkeleton } from "@/components/TransactionHistory";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { BalanceCard } from "@/components/ui/BalanceCard";
import { CategoryChart } from "@/components/ui/CategoryChart";
import { TransactionForm } from "@/components/ui/TransactionForm";
import { Transaction, SavingGoal } from "@/types";
import { SavingGoalsCard, SavingGoalsSkeleton } from "@/components/SavingGoalsCard";
import { useDashboard } from "@/hooks/useDashboard";

interface DashboardClientProps {
  transactionsPromise: Promise<Transaction[]>;
  savingGoalsPromise: Promise<{
    success: boolean;
    data?: SavingGoal[];
    error?: string;
  }>;
}

export function DashboardClient({
  transactionsPromise,
  savingGoalsPromise,
}: DashboardClientProps) {
  // ดึงค่าสถานะและฟังก์ชันจัดการทั้งหมดออกมาจาก Custom Hook เพื่อแยกตรรกะออกจาก UI
  const {
    userProfile,
    isLoading,
    isGoalsLoading,
    optimisticTransactions,
    optimisticGoals,
    totalIncome,
    totalExpense,
    balance,
    handleAddTransaction,
    handleDeleteTransaction,
    handleCreateGoal,
    handleUpdateGoalAmount,
    handleDeleteGoal,
  } = useDashboard({ transactionsPromise, savingGoalsPromise });

  return (
    <div className="space-y-6">
      {/* 1. Header ทักทาย */}
      <DashboardHeader
        displayName={userProfile.displayName}
        avatarUrl={userProfile.avatarUrl}
        email={userProfile.email}
      />

      {/* 2. Card สรุปยอดเงินคงเหลือ / รายรับ / รายจ่าย */}
      <BalanceCard
        balance={balance}
        totalIncome={totalIncome}
        totalExpense={totalExpense}
      />

      {/* 2.5. ระบบตั้งเป้าหมายเงินออม (ห่อหุ้มด้วย ErrorBoundary และ Suspense แยกอิสระ) */}
      <ErrorBoundary>
        <Suspense fallback={<SavingGoalsSkeleton />}>
          <GoalsSuspenseWrapper
            savingGoalsPromise={savingGoalsPromise}
            optimisticGoals={optimisticGoals}
            onUpdateGoalAmount={handleUpdateGoalAmount}
            onCreateGoal={handleCreateGoal}
            onDeleteGoal={handleDeleteGoal}
            isLoading={isGoalsLoading}
          />
        </Suspense>
      </ErrorBoundary>

      {/* 3. กราฟวิเคราะห์แบ่งตามหมวดหมู่สีพาสเทลแฮนด์เมด */}
      <CategoryChart transactions={optimisticTransactions} />

      {/* 4. ฟอร์มบันทึกรายรับ-รายจ่ายด่วน */}
      <TransactionForm onAddTransaction={handleAddTransaction} />

      {/* 5. ตารางประวัติความเคลื่อนไหวล่าสุด (ห่อหุ้มด้วย ErrorBoundary และ Suspense ครอบไว้จุดเดียว) */}
      <ErrorBoundary>
        <Suspense fallback={<TransactionHistorySkeleton />}>
          <HistorySuspenseWrapper
            transactionsPromise={transactionsPromise}
            optimisticTransactions={optimisticTransactions}
            onDeleteTransaction={handleDeleteTransaction}
            isLoading={isLoading}
          />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}

// คอมโพเนนต์ห่อหุ้มรายการประวัติเพื่อรองรับการระงับการเรนเดอร์ (Suspense) ขณะรอสัญญากลางอากาศ
function HistorySuspenseWrapper({
  transactionsPromise,
  optimisticTransactions,
  onDeleteTransaction,
  isLoading,
}: {
  transactionsPromise: Promise<Transaction[]>;
  optimisticTransactions: Transaction[];
  onDeleteTransaction: (id: string) => void;
  isLoading: boolean;
}) {
  // หากยังอยู่ระหว่างโหลด ให้เรียกใช้ use() เพื่อดีดการทำงานส่งผ่านไปหา Suspense fallback
  if (isLoading) {
    use(transactionsPromise);
  }

  return (
    <TransactionHistory
      transactions={optimisticTransactions}
      onDeleteTransaction={onDeleteTransaction}
      limit={5}
    />
  );
}

// คอมโพเนนต์ห่อหุ้มเป้าหมายการเงินเพื่อรองรับการระงับการเรนเดอร์ (Suspense) ขณะรอสัญญากลางอากาศ
function GoalsSuspenseWrapper({
  savingGoalsPromise,
  optimisticGoals,
  onUpdateGoalAmount,
  onCreateGoal,
  onDeleteGoal,
  isLoading,
}: {
  savingGoalsPromise: Promise<{ success: boolean; data?: SavingGoal[]; error?: string }>;
  optimisticGoals: SavingGoal[];
  onUpdateGoalAmount: (id: string, amount: number) => Promise<{ success: boolean; error?: string }>;
  onCreateGoal: (data: { name: string; target_amount: number; target_date?: string | null }) => Promise<{ success: boolean; error?: string }>;
  onDeleteGoal: (id: string) => Promise<{ success: boolean; error?: string }>;
  isLoading: boolean;
}) {
  if (isLoading) {
    use(savingGoalsPromise);
  }

  return (
    <SavingGoalsCard
      goals={optimisticGoals}
      onUpdateGoalAmount={onUpdateGoalAmount}
      onCreateGoal={onCreateGoal}
      onDeleteGoal={onDeleteGoal}
    />
  );
}
