import { auth } from "@clerk/nextjs/server";
import { and, asc, eq, gte, lte } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { habitCompletions, habits } from "@/db/schema";

function getMonthRange(year: number, month: number) {
  const lastDay = new Date(year, month + 1, 0).getDate();
  const prefix = `${year}-${String(month + 1).padStart(2, "0")}`;
  return { start: `${prefix}-01`, end: `${prefix}-${String(lastDay).padStart(2, "0")}` };
}

export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const now = new Date();
  const year = Number(url.searchParams.get("year")) || now.getFullYear();
  const month = Math.min(11, Math.max(0, Number(url.searchParams.get("month")) || 0));
  const range = getMonthRange(year, month);
  const db = getDb();

  const [habitRows, completionRows] = await Promise.all([
    db.select().from(habits).where(eq(habits.userId, userId)).orderBy(asc(habits.createdAt)),
    db
      .select({ habitId: habitCompletions.habitId, completedOn: habitCompletions.completedOn })
      .from(habitCompletions)
      .where(
        and(
          eq(habitCompletions.userId, userId),
          gte(habitCompletions.completedOn, range.start),
          lte(habitCompletions.completedOn, range.end),
        ),
      ),
  ]);

  return NextResponse.json(
    { habits: habitRows, completions: completionRows },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const name = String(body.name || "").trim().slice(0, 80);
  const goal = Math.min(31, Math.max(1, Number(body.goal) || 20));
  const color = /^#[0-9a-f]{6}$/i.test(String(body.color)) ? String(body.color) : "#97E3B8";
  if (!name) return NextResponse.json({ error: "Nama habit wajib diisi" }, { status: 400 });

  const [created] = await getDb().insert(habits).values({ userId, name, goal, color }).returning();
  return NextResponse.json(created, { status: 201 });
}
