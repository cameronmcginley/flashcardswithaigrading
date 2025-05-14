import type { ReactNode } from "react";
import Topbar from "@/components/topbar";
import { ProtectedRoute } from "@/components/protected-route";

interface LayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: LayoutProps) {
  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="flex-none">
        <Topbar />
      </div>
      <div className="flex-1 relative">
        <ProtectedRoute>{children}</ProtectedRoute>
      </div>
    </div>
  );
}
