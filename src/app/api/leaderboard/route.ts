import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { parseGameState } from "@/lib/game-state";
import { getLeaderboardValue, type LeaderboardEntry } from "@/lib/leaderboard";
import { jsonError } from "@/lib/api-server";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return jsonError("Unauthorized", 401);
  }

  try {
    const rows = await prisma.gameState.findMany({
      include: { user: { select: { name: true } } },
      orderBy: { updatedAt: "desc" },
      take: 200,
    });

    const scored = rows.map((row) => {
      const { state } = parseGameState(
        row.portfolioJson,
        row.coachJson,
        row.readGuidesJson,
        row.selectedSymbol,
      );
      const portfolio = state.portfolio;
      const totalValue = getLeaderboardValue(portfolio);
      const starting = portfolio.startingBalance || 1;
      const returnPercent = ((totalValue - starting) / starting) * 100;

      return {
        userId: row.userId,
        name: row.user.name,
        totalValue,
        returnPercent,
        isYou: row.userId === session.userId,
      };
    });

    scored.sort((a, b) => b.returnPercent - a.returnPercent);

    const entries: LeaderboardEntry[] = scored.slice(0, 25).map((row, index) => ({
      rank: index + 1,
      name: row.name,
      totalValue: row.totalValue,
      returnPercent: row.returnPercent,
      isYou: row.isYou,
    }));

    return NextResponse.json({ entries });
  } catch {
    return jsonError("Failed to load leaderboard.", 500);
  }
}
