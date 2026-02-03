"use server";

import { createClient } from "@/utils/supabase/server";

export interface BuddyStats {
  resolved_count: number;
  level: number;
  level_name: string;
  next_level_at: number;
  progress_percent: number;
  rank: number;
  total_buddies: number;
}

export interface LeaderboardEntry {
  buddy_id: string;
  full_name: string;
  resolved_count: number;
  level: number;
  level_name: string;
  is_current_user: boolean;
}

const LEVELS = [
  { min: 0, name: "Newcomer", emoji: "🌱" },
  { min: 5, name: "Helper", emoji: "🤝" },
  { min: 15, name: "Guardian", emoji: "🛡️" },
  { min: 30, name: "Protector", emoji: "⭐" },
  { min: 50, name: "Hero", emoji: "🦸" },
  { min: 100, name: "Guardian Angel", emoji: "👼" },
  { min: 200, name: "Legend", emoji: "🏆" },
];

function getLevelInfo(resolvedCount: number) {
  let currentLevel = LEVELS[0];
  let nextLevel = LEVELS[1];

  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (resolvedCount >= LEVELS[i].min) {
      currentLevel = LEVELS[i];
      nextLevel = LEVELS[i + 1] || null;
      break;
    }
  }

  const progress = nextLevel
    ? Math.min(
        100,
        ((resolvedCount - currentLevel.min) / (nextLevel.min - currentLevel.min)) * 100
      )
    : 100;

  return {
    level: LEVELS.indexOf(currentLevel) + 1,
    level_name: `${currentLevel.emoji} ${currentLevel.name}`,
    next_level_at: nextLevel?.min || currentLevel.min,
    progress_percent: Math.round(progress),
  };
}

export async function getBuddyStats(): Promise<BuddyStats> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return {
      resolved_count: 0,
      level: 1,
      level_name: "🌱 Newcomer",
      next_level_at: 5,
      progress_percent: 0,
      rank: 0,
      total_buddies: 0,
    };
  }

  // Get buddy's resolved count
  const { count: resolvedCount } = await supabase
    .from("help_requests")
    .select("*", { count: "exact", head: true })
    .eq("buddy_id", user.id)
    .eq("status", "resolved");

  const resolved = resolvedCount || 0;
  const levelInfo = getLevelInfo(resolved);

  // Get all buddies' resolved counts for ranking
  const { data: allBuddies } = await supabase
    .from("profiles")
    .select("id")
    .eq("role", "buddy");

  const buddyIds = allBuddies?.map((b: { id: string }) => b.id) || [];
  
  // Count resolved requests per buddy
  const { data: allResolved } = await supabase
    .from("help_requests")
    .select("buddy_id")
    .eq("status", "resolved")
    .in("buddy_id", buddyIds);

  // Calculate counts per buddy
  const buddyCounts: Record<string, number> = {};
  allResolved?.forEach((r: { buddy_id: string | null }) => {
    if (r.buddy_id) {
      buddyCounts[r.buddy_id] = (buddyCounts[r.buddy_id] || 0) + 1;
    }
  });

  // Calculate rank
  const sortedCounts = Object.values(buddyCounts).sort((a, b) => b - a);
  const rank = sortedCounts.indexOf(resolved) + 1 || sortedCounts.length + 1;

  return {
    resolved_count: resolved,
    ...levelInfo,
    rank,
    total_buddies: buddyIds.length || 1,
  };
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  const currentUserId = user?.id;

  // Get all buddies
  const { data: buddies } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("role", "buddy");

  if (!buddies || buddies.length === 0) {
    return [];
  }

  // Get resolved counts
  const { data: allResolved } = await supabase
    .from("help_requests")
    .select("buddy_id")
    .eq("status", "resolved")
    .in("buddy_id", buddies.map((b: { id: string; full_name: string | null }) => b.id));

  // Calculate counts per buddy
  const buddyCounts: Record<string, number> = {};
  allResolved?.forEach((r: { buddy_id: string | null }) => {
    if (r.buddy_id) {
      buddyCounts[r.buddy_id] = (buddyCounts[r.buddy_id] || 0) + 1;
    }
  });

  // Build leaderboard entries
  const leaderboard: LeaderboardEntry[] = buddies.map((buddy: { id: string; full_name: string | null }) => {
    const count = buddyCounts[buddy.id] || 0;
    const levelInfo = getLevelInfo(count);
    return {
      buddy_id: buddy.id,
      full_name: buddy.full_name || "Anonymous Buddy",
      resolved_count: count,
      level: levelInfo.level,
      level_name: levelInfo.level_name,
      is_current_user: buddy.id === currentUserId,
    };
  });

  // Sort by resolved count (descending)
  leaderboard.sort((a, b) => b.resolved_count - a.resolved_count);

  return leaderboard.slice(0, 10); // Top 10
}
