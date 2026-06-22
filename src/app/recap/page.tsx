import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { HabitTracker } from "@/components/habit-tracker";

export default async function RecapPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  return <><AppHeader active="recap" /><HabitTracker readOnly /></>;
}
