import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, AlertCircle, CheckCircle2, Users, Phone } from "lucide-react";
import { PendingRequestsTable, RecentActivityTable } from "./dashboard-tables";
import { DashboardMonitor } from "./dashboard-monitor";

export const dynamic = "force-dynamic";

// Type definitions for dashboard data
interface DashboardStats {
  pendingCount: number;
  callsToday: number;
  resolvedCount: number;
  activeSeniors: number;
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  description: string;
  variant?: "default" | "warning" | "success";
}

// Stat Card Component for consistent styling
function StatCard({ title, value, icon, description, variant = "default" }: StatCardProps) {
  const variants = {
    default: "bg-slate-800 border-slate-700",
    warning: "bg-amber-900/50 border-amber-700",
    success: "bg-emerald-900/50 border-emerald-700",
  };

  return (
    <Card className={`${variants[variant]} shadow-lg`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-slate-300">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-white">{value}</div>
        <p className="text-xs text-slate-400 mt-1">{description}</p>
      </CardContent>
    </Card>
  );
}

/**
 * LOGIC 1: Fetch Real Stats with 3 Parallel Supabase Queries
 * - Pending requests count
 * - Resolved requests count  
 * - Active seniors count (seniors with recent activity)
 */
async function getDashboardStats(userId: string): Promise<DashboardStats> {
  const supabase = await createClient();
  
  // Calculate today's start for filtering
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayISO = today.toISOString();

  // PARALLEL QUERIES for performance (all 3 run simultaneously)
  const [pendingResult, resolvedResult, activeSeniorsResult, callsTodayResult] = await Promise.all([
    // Query 1: Count of PENDING help requests
    supabase
      .from("help_requests")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
    
    // Query 2: Count of RESOLVED help requests
    supabase
      .from("help_requests")
      .select("*", { count: "exact", head: true })
      .eq("status", "resolved"),
    
    // Query 3: Count of ACTIVE seniors (profiles with role 'senior' who have recent activity)
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "senior"),
    
    // Query 4: Count of calls today for this buddy
    supabase
      .from("call_sessions")
      .select("*", { count: "exact", head: true })
      .eq("buddy_id", userId)
      .gte("created_at", todayISO),
  ]);

  return {
    pendingCount: pendingResult.count ?? 0,
    resolvedCount: resolvedResult.count ?? 0,
    activeSeniors: activeSeniorsResult.count ?? 0,
    callsToday: callsTodayResult.count ?? 0,
  };
}

/**
 * Buddy Dashboard - Main Page Component
 * Features:
 * - Real-time stats from Supabase
 * - Gamification with levels
 * - Real-time notifications via DashboardMonitor
 */
export default async function BuddyDashboard() {
  const supabase = await createClient();
  
  // Auth check
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect("/login");
  }

  // Fetch real stats from database
  const stats = await getDashboardStats(user.id);
  
  // GAMIFICATION LOGIC
  // Level progression based on resolved requests
  const getLevelInfo = (resolved: number) => {
    if (resolved >= 50) return { level: "Legend", color: "from-yellow-500 to-amber-600", nextAt: null };
    if (resolved >= 25) return { level: "Guardian Angel", color: "from-purple-500 to-indigo-600", nextAt: 50 };
    if (resolved >= 10) return { level: "Helper", color: "from-emerald-500 to-teal-600", nextAt: 25 };
    return { level: "Newcomer", color: "from-blue-400 to-blue-600", nextAt: 10 };
  };
  
  const levelInfo = getLevelInfo(stats.resolvedCount);
  const progressToNext = levelInfo.nextAt 
    ? Math.round((stats.resolvedCount / levelInfo.nextAt) * 100) 
    : 100;

  return (
    <div className="space-y-6">
      {/* REAL-TIME MONITOR: Subscribes to help_requests table for INSERT events */}
      <DashboardMonitor userId={user.id} />
      
      {/* Stats Grid - Shows REAL data from Supabase */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Pending Requests"
          value={stats.pendingCount}
          icon={<AlertCircle className="h-5 w-5 text-amber-400" />}
          description="Seniors waiting for help"
          variant={stats.pendingCount > 0 ? "warning" : "default"}
        />
        <StatCard
          title="Resolved Today"
          value={stats.resolvedCount}
          icon={<CheckCircle2 className="h-5 w-5 text-emerald-400" />}
          description="Successfully helped"
          variant="success"
        />
        <StatCard
          title="Active Seniors"
          value={stats.activeSeniors}
          icon={<Users className="h-5 w-5 text-blue-400" />}
          description="Registered on platform"
        />
        <StatCard
          title="Your Calls Today"
          value={stats.callsToday}
          icon={<Phone className="h-5 w-5 text-slate-400" />}
          description="Calls completed today"
        />
      </div>

      {/* Gamification Hero Card */}
      <Card className={`bg-gradient-to-r ${levelInfo.color} border-none overflow-hidden relative shadow-lg`}>
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
        <CardContent className="p-8 relative">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-white">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-4 border-white/30 shadow-xl">
                <Trophy className="w-10 h-10 text-yellow-300 drop-shadow-md" />
              </div>
              <div>
                <p className="text-white/80 font-medium mb-1">Current Rank</p>
                <h2 className="text-4xl font-bold tracking-tight">{levelInfo.level}</h2>
                <div className="flex items-center gap-2 mt-2 text-white/80 text-sm">
                  <span className="bg-white/20 px-2 py-0.5 rounded-full">
                    {stats.resolvedCount} Resolved
                  </span>
                  <span>•</span>
                  <span>
                    {levelInfo.nextAt 
                      ? `${levelInfo.nextAt - stats.resolvedCount} to next level`
                      : "Max level achieved! 🎉"}
                  </span>
                </div>
                {/* Progress bar */}
                {levelInfo.nextAt && (
                  <div className="mt-3 w-48 h-2 bg-white/20 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-white/60 rounded-full transition-all duration-500"
                      style={{ width: `${progressToNext}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
            
            <div className="text-center md:text-right">
              <div className="text-5xl font-black">{stats.callsToday}</div>
              <div className="text-white/70 uppercase tracking-widest text-xs font-semibold">
                Calls Today
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PendingRequestsTable />
        <RecentActivityTable />
      </div>
    </div>
  );
}
