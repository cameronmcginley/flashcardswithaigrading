import { MoveVertical, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuSkeleton,
} from "@/components/ui/sidebar";

interface LoadingSidebarProps {
  numCategories?: number;
  numDecksPerCategory?: number;
  showHeader?: boolean;
}

export function LoadingSidebar({
  numCategories = 3,
  numDecksPerCategory = 2,
  showHeader = true,
}: LoadingSidebarProps) {
  return (
    <Sidebar variant="floating" className="h-full">
      <div className="flex h-full flex-col">
        {showHeader && (
          <SidebarHeader className="border-b shrink-0">
            <div className="flex items-center justify-between p-4">
              <h2 className="font-semibold">Categories</h2>
              <div className="flex">
                <Button variant="ghost" size="icon" className="h-8 w-8" disabled>
                  <MoveVertical className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" disabled>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </SidebarHeader>
        )}
        <SidebarContent>
          <SidebarMenu className="p-2">
            {/* Category skeletons */}
            {Array.from({ length: numCategories }).map((_, i) => (
              <div key={i} className="mb-2">
                <SidebarMenuSkeleton showIcon className="mb-2" />
                {/* Deck skeletons within each category */}
                <div className="ml-6">
                  {Array.from({ length: numDecksPerCategory }).map((_, j) => (
                    <SidebarMenuSkeleton key={j} className="mb-1" />
                  ))}
                </div>
              </div>
            ))}
          </SidebarMenu>
        </SidebarContent>
      </div>
    </Sidebar>
  );
} 