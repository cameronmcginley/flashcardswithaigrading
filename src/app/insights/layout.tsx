import type { ReactNode } from "react";
import Topbar from "@/components/topbar";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="flex-none">
        <Topbar />
      </div>
      <div className="flex-1 relative">{children}</div>
    </div>
  );
}
