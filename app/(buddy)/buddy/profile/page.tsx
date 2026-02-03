import { redirect } from "next/navigation";
import {
  Phone,
  Star,
  Users,
  CheckCircle2,
  Clock,
  Mail,
  Calendar,
  Shield,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { createClient } from "@/utils/supabase/server";
import { VerifyButton } from "./verify-button";

export const dynamic = "force-dynamic";

// Type definitions for profile data
interface ProfileStats {
  calls_taken: number;
  rating: number;
  seniors_helped: number;
}

interface ProfileContextData {
  verified?: boolean;
  stats?: ProfileStats;
}

interface Profile {
  id: string;
  full_name: string | null;
  role: string;
  context_data: ProfileContextData | null;
  created_at: string;
}

export default async function BuddyProfilePage() {
  // Server Component: No hooks needed - all data fetching is async/await
  const supabase = await createClient();
  
  // 1. Get authenticated user (Server Side) - MUST be first
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    redirect("/login");
  }

  // 2. Fetch Profile from DB with proper typing
  const { data, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  
  const profile = data as Profile | null;

  if (profileError || !profile) {
    return (
      <div className="p-8 text-center">
        <Shield className="h-12 w-12 mx-auto text-slate-400 mb-4" />
        <h2 className="text-xl font-semibold text-slate-700">Profile not found</h2>
        <p className="text-slate-500 mt-2">Please contact support if this issue persists.</p>
      </div>
    );
  }

  // 3. Extract data with safe defaults (no hooks - just data transformation)
  const isVerified = profile.context_data?.verified === true;
  const stats: ProfileStats = profile.context_data?.stats || { 
    calls_taken: 0, 
    rating: 0, 
    seniors_helped: 0 
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      
      {/* Profile Header Card */}
      <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <CardContent className="p-8 relative">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <Avatar className="h-32 w-32 border-4 border-slate-700 shadow-xl">
              <AvatarFallback className="bg-blue-600 text-4xl font-bold text-white">
                {profile.full_name?.charAt(0).toUpperCase() || "B"}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 text-center md:text-left space-y-2">
              <div className="flex flex-col md:flex-row items-center gap-3">
                <h1 className="text-3xl font-bold text-white tracking-tight">
                  {profile.full_name || "Buddy"}
                </h1>
                {isVerified ? (
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 px-3 py-1">
                    <CheckCircle2 className="h-4 w-4 mr-1.5" />
                    Verified Buddy
                  </Badge>
                ) : (
                  <div className="flex items-center gap-2">
                    <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 px-3 py-1">
                      <Clock className="h-4 w-4 mr-1.5" />
                      Pending Verification
                    </Badge>
                    <VerifyButton buddyId={user.id} />
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-center md:justify-start gap-2 text-slate-400">
                <Mail className="w-4 h-4" />
                <span>{user.email}</span>
              </div>

               <div className="flex items-center justify-center md:justify-start gap-2 text-slate-400">
                <Calendar className="w-4 h-4" />
                <span>Joined {new Date(user.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Calls</CardTitle>
            <Phone className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">{stats.calls_taken}</div>
            <p className="text-xs text-slate-400">Lifetime calls completed</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Seniors Helped</CardTitle>
            <Users className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">{stats.seniors_helped}</div>
            <p className="text-xs text-slate-400">Unique individuals</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Rating</CardTitle>
            <Star className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">{stats.rating.toFixed(1)}</div>
            <p className="text-xs text-slate-400">Average star rating</p>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
