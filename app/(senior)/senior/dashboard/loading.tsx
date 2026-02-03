import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function SeniorLoading() {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Greeting Skeleton */}
      <div className="text-center mb-8">
        <Skeleton className="h-10 w-48 mx-auto mb-2 bg-stone-200" />
        <Skeleton className="h-6 w-64 mx-auto bg-stone-200" />
      </div>

      {/* 2x2 Grid of Card Skeletons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="h-[300px] border-none shadow-xl overflow-hidden">
            <CardContent className="h-full p-0">
              <Skeleton className="h-full w-full bg-stone-200" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
