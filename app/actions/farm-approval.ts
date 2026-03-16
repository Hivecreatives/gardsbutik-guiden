"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function approveFarm(farmId: string) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("approve_farm", { farm_id: farmId });
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/admin");
}

export async function rejectFarm(farmId: string, reason: string) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("reject_farm", {
    farm_id: farmId,
    reason,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/admin");
}