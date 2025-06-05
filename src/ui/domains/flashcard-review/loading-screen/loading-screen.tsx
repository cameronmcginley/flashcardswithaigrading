import { Skeleton } from "@/components/ui/skeleton";

export const LoadingScreen = () => {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-4">
        <div className="w-full space-y-4">
          <Skeleton className="h-12 w-full" />
          <div className="flex items-center space-x-4">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-full" />
          </div>
          <div className="flex items-center space-x-4">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-full" />
          </div>
          <div className="flex items-center space-x-4">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-full" />
          </div>
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </div>
  );
}
