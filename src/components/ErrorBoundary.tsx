"use client";

import { Component, ErrorInfo, ReactNode } from "react";
import { Card } from "@/components/ui/card";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <Card className="text-center space-y-3 border border-dashed border-[#FFCDD2] rounded-3xl bg-[#FFEBEE]/30 p-6 select-none">
          <span className="text-3xl block animate-bounce">⚠️</span>
          <h4 className="text-base font-bold text-[#C62828]">
            ไม่สามารถโหลดข้อมูลได้นะพูน
          </h4>
          <p className="text-xs text-[#E53935]/80 max-w-xs mx-auto">
            เกิดข้อผิดพลาดในการดึงข้อมูลจากฐานข้อมูล
            หรือการเชื่อมต่อเครือข่ายมีปัญหา กรุณาลองใหม่อีกครั้งนะพูน!
          </p>
          <button
            type="button"
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            className="text-xs font-bold text-white bg-[#D32F2F] hover:bg-[#C62828] px-4 py-2 rounded-xl transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#FFCDD2]"
          >
            รีโหลดเพื่อลองใหม่
          </button>
        </Card>
      );
    }

    return this.props.children;
  }
}
