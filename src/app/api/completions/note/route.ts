import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { habitCompletions, habits } from "@/db/schema";

export async function PATCH(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const habitId = String(body.habitId || "");
  const completedOn = String(body.completedOn || "");
  const note = String(body.note || "").trim().slice(0, 500);
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
    .select({
      id: habitCompletions.id,
      completed: habitCompletions.completed,
    })
    .from(habitCompletions)
    .where(
      and(
        eq(habitCompletions.habitId, habitId),
        eq(habitCompletions.userId, userId),
        eq(habitCompletions.completedOn, completedOn),
      ),
    )
    .limit(1);

  if (existing) {
    if (!note && !existing.completed) {
      await db.delete(habitCompletions).where(eq(habitCompletions.id, existing.id));
      return NextResponse.json({ completion: null });
    }

    const [updated] = await db
      .update(habitCompletions)
      .set({ note })
      .where(eq(habitCompletions.id, existing.id))
      .returning({
        habitId: habitCompletions.habitId,
        completedOn: habitCompletions.completedOn,
        completed: habitCompletions.completed,
        note: habitCompletions.note,
      });
    return NextResponse.json({ completion: updated });
  }

  if (!note) return NextResponse.json({ completion: null });

  const [created] = await db
    .insert(habitCompletions)
    .values({ habitId, userId, completedOn, completed: false, note })
    .returning({
      habitId: habitCompletions.habitId,
      completedOn: habitCompletions.completedOn,
      completed: habitCompletions.completed,
      note: habitCompletions.note,
    });

  return NextResponse.json({ completion: created }, { status: 201 });
}
