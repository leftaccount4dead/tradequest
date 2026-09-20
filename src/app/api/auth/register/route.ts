import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createSession, hashPassword } from "@/lib/auth";
import { createDefaultGameState, serializeGameState } from "@/lib/game-state";
import { jsonError, readJsonBody } from "@/lib/api-server";

export async function POST(request: Request) {
  try {
    const body = await readJsonBody<{
      email?: string;
      password?: string;
      name?: string;
    }>(request);

    if (!body) {
      return jsonError("Invalid request body.", 400);
    }

    const { email, password, name } = body;

    if (!email?.trim() || !password || !name?.trim()) {
      return jsonError("All fields are required.", 400);
    }

    if (password.length < 6) {
      return jsonError("Password must be at least 6 characters.", 400);
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return jsonError("An account with this email already exists.", 409);
    }

    const passwordHash = await hashPassword(password);
    const defaultState = createDefaultGameState();
    const serialized = serializeGameState(defaultState);

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        name: name.trim(),
        passwordHash,
        gameState: {
          create: serialized,
        },
      },
    });

    await createSession({
      userId: user.id,
      email: user.email,
      name: user.name,
    });

    return NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch {
    return jsonError("Registration failed.", 500);
  }
}
