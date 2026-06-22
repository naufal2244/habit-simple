import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { habitCompletions, habits } from "@/db/schema";

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const habitId = String(body.habitId || "");
  const completedOn = String(body.completedOn || "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(completedOn)) {
    return NextResponse.json({ error: "Tanggal tidak valid" }, { status: 400 });
  }

  const db = getDb();
  const [ownedHabit] = await db
    .select({ id: habits.id })
    .from(habits)
    .where(and(eq(habits.id, habitId), eq(habits.userId, userId)))
    .limit(1);
  if (!ownedHabit) return NextResponse.json({ error: "Habit tidak ditemukan" }, { status: 404 });

  const [existing] = await db
    .select({ id: habitCompletions.id })
    .from(habitCompletions)
    .where(and(eq(habitCompletions.habitId, habitId), eq(habitCompletions.completedOn, completedOn)))
    .limit(1);

  if (existing) {
    await db.delete(habitCompletions).where(eq(habitCompletions.id, existing.id));
    return NextResponse.json({ completed: false });
  }

  await db.insert(habitCompletions).values({ habitId, userId, completedOn });
  return NextResponse.json({ completed: true });
}
