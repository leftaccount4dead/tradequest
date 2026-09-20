import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createSession, verifyPassword } from "@/lib/auth";
import { jsonError, readJsonBody } from "@/lib/api-server";

export async function POST(request: Request) {
  try {
    const body = await readJsonBody<{ email?: string; password?: string }>(request);
    if (!body) {
      return jsonError("Invalid request body.", 400);
    }

    const { email, password } = body;

    if (!email?.trim() || !password) {
      return jsonError("Email and password are required.", 400);
    }

    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return jsonError("Invalid email or password.", 401);
    }

    await createSession({
      userId: user.id,
      email: user.email,
      name: user.name,
    });

    return NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch {
    return jsonError("Login failed.", 500);
  }
}
