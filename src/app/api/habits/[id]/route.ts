import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { habits } from "@/db/schema";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await request.json();
  const name = String(body.name || "").trim().slice(0, 80);
  const goal = Math.min(31, Math.max(1, Number(body.goal) || 1));
  const color = /^#[0-9a-f]{6}$/i.test(String(body.color)) ? String(body.color) : "#97E3B8";
  if (!name) return NextResponse.json({ error: "Nama habit wajib diisi" }, { status: 400 });

  const [updated] = await getDb()
    .update(habits)
    .set({ name, goal, color, updatedAt: new Date() })
    .where(and(eq(habits.id, id), eq(habits.userId, userId)))
    .returning();
  if (!updated) return NextResponse.json({ error: "Habit tidak ditemukan" }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const [deleted] = await getDb()
    .delete(habits)
    .where(and(eq(habits.id, id), eq(habits.userId, userId)))
    .returning({ id: habits.id });
  if (!deleted) return NextResponse.json({ error: "Habit tidak ditemukan" }, { status: 404 });
  return NextResponse.json(deleted);
}
