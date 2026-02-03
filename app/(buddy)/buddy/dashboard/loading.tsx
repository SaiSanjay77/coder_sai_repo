import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function BuddyDashboardLoading() {
  return (
    <div className="space-y-6">
      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border-slate-700 bg-slate-800/50">
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24 bg-slate-700" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-10 w-16 bg-slate-700" />
              <Skeleton className="h-3 w-20 mt-2 bg-slate-700" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pending Requests Skeleton */}
      <Card className="border-slate-700 bg-slate-800/50">
        <CardHeader>
          <Skeleton className="h-6 w-48 bg-slate-700" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg"
            >
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full bg-slate-600" />
                <div>
                  <Skeleton className="h-5 w-32 mb-2 bg-slate-600" />
                  <Skeleton className="h-4 w-24 bg-slate-600" />
                </div>
              </div>
              <Skeleton className="h-10 w-24 bg-slate-600" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recent Activity Skeleton */}
      <Card className="border-slate-700 bg-slate-800/50">
        <CardHeader>
          <Skeleton className="h-6 w-36 bg-slate-700" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4 p-3">
                <Skeleton className="h-10 w-10 rounded-full bg-slate-700" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-48 mb-1 bg-slate-700" />
                  <Skeleton className="h-3 w-32 bg-slate-700" />
                </div>
                <Skeleton className="h-6 w-16 bg-slate-700" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
