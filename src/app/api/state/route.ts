import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  createDefaultGameState,
  parseGameState,
  serializeGameState,
} from "@/lib/game-state";
import { jsonError, readJsonBody } from "@/lib/api-server";
import type { UserGameState } from "@/lib/types";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return jsonError("Unauthorized", 401);
    }

    const gameState = await prisma.gameState.findUnique({
      where: { userId: session.userId },
    });

    if (!gameState) {
      const defaultState = createDefaultGameState();
      const serialized = serializeGameState(defaultState);
      await prisma.gameState.create({
        data: { userId: session.userId, ...serialized },
      });
      return NextResponse.json(defaultState);
    }

    const { state, migrated } = parseGameState(
      gameState.portfolioJson,
      gameState.coachJson,
      gameState.readGuidesJson,
      gameState.selectedSymbol,
    );

    if (migrated) {
      const serialized = serializeGameState(state);
      await prisma.gameState.update({
        where: { userId: session.userId },
        data: serialized,
      });
    }

    return NextResponse.json(state);
  } catch {
    return jsonError("Failed to load state.", 500);
  }
}

export async function PUT(request: Request) {
  const session = await getSession();
  if (!session) {
    return jsonError("Unauthorized", 401);
  }

  const body = await readJsonBody<Partial<UserGameState>>(request);
  if (!body) {
    return jsonError("Invalid or empty JSON body.", 400);
  }

  try {
    const existing = await prisma.gameState.findUnique({
      where: { userId: session.userId },
    });

    const current = existing
      ? parseGameState(
          existing.portfolioJson,
          existing.coachJson,
          existing.readGuidesJson,
          existing.selectedSymbol,
        ).state
      : createDefaultGameState();

    const merged: UserGameState = {
      portfolio: body.portfolio ?? current.portfolio,
      coachMessages: body.coachMessages ?? current.coachMessages,
      readGuideIds: body.readGuideIds ?? current.readGuideIds,
      selectedSymbol: body.selectedSymbol ?? current.selectedSymbol,
    };

    const serialized = serializeGameState(merged);

    await prisma.gameState.upsert({
      where: { userId: session.userId },
      create: { userId: session.userId, ...serialized },
      update: serialized,
    });

    return NextResponse.json(merged);
  } catch {
    return jsonError("Failed to save state.", 500);
  }
}
