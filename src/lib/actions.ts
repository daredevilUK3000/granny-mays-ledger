"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireUserId } from "@/lib/auth";
import { requirePremiumUserId } from "@/lib/premium";
import { createAdminClient } from "@/lib/supabase/admin";
import { GOAL_LIMIT } from "@/lib/data/goals";
import { SINKING_FUND_LIMIT } from "@/lib/data/sinkingfunds";
import { getProfile } from "@/lib/data/profile";

// ---------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------
export async function createCategory(formData: FormData) {
  const userId = await requireUserId();
  const supabase = createAdminClient();

  const name = String(formData.get("name") ?? "").trim();
  const type = String(formData.get("type") ?? "expense");

  if (!name) throw new Error("A category name is required.");

  const { error } = await supabase
    .from("categories")
    .insert({ user_id: userId, name, type });

  if (error) throw error;
  revalidatePath("/dashboard/budget");
}

export async function deleteCategory(categoryId: string) {
  const userId = await requireUserId();
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", categoryId)
    .eq("user_id", userId); // never deletes shared defaults (user_id null)

  if (error) throw error;
  revalidatePath("/dashboard/budget");
}

// ---------------------------------------------------------------------
// Transactions
// ---------------------------------------------------------------------
export async function createTransaction(formData: FormData) {
  const userId = await requireUserId();
  const supabase = createAdminClient();

  const type = String(formData.get("type") ?? "expense");
  const amount = Number(formData.get("amount"));
  const categoryId = String(formData.get("category_id") ?? "") || null;
  const txDate = String(formData.get("tx_date") ?? "");
  const note = String(formData.get("note") ?? "") || null;

  if (!amount || amount <= 0 || !txDate) {
    throw new Error("Amount and date are required.");
  }

  const { error } = await supabase.from("transactions").insert({
    user_id: userId,
    type,
    amount,
    category_id: categoryId,
    tx_date: txDate,
    note,
  });

  if (error) throw error;
  revalidatePath("/dashboard/overview");
  revalidatePath("/dashboard/budget");
}

export async function deleteTransaction(transactionId: string) {
  const userId = await requireUserId();
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", transactionId)
    .eq("user_id", userId);

  if (error) throw error;
  revalidatePath("/dashboard/overview");
  revalidatePath("/dashboard/budget");
}

export async function resetTransactions() {
  const userId = await requireUserId();
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("user_id", userId);

  if (error) throw error;
  revalidatePath("/dashboard/overview");
  revalidatePath("/dashboard/budget");
}

// ---------------------------------------------------------------------
// Budget plan
// ---------------------------------------------------------------------
export async function saveBudgetPlan(formData: FormData) {
  const userId = await requireUserId();
  const supabase = createAdminClient();

  const categoryId = String(formData.get("category_id") ?? "");
  const month = String(formData.get("month") ?? "");
  const plannedAmount = Math.max(0, Number(formData.get("planned_amount")) || 0);

  if (!categoryId || !month) throw new Error("Category and month are required.");

  const { error } = await supabase
    .from("budget_plans")
    .upsert(
      { user_id: userId, category_id: categoryId, month, planned_amount: plannedAmount },
      { onConflict: "user_id,category_id,month" }
    );

  if (error) throw error;
  revalidatePath("/dashboard/budget");
}

// ---------------------------------------------------------------------
// Goals
// ---------------------------------------------------------------------
export async function createGoal(formData: FormData) {
  const userId = await requireUserId();
  const supabase = createAdminClient();

  const profile = await getProfile(userId);
  const isPremium = profile.plan === "premium";
  const limit = isPremium ? GOAL_LIMIT.premium : GOAL_LIMIT.free;

  const { count, error: countError } = await supabase
    .from("goals")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  if (countError) throw countError;
  if ((count ?? 0) >= limit) {
    throw new Error(
      isPremium
        ? `You've reached the maximum of ${limit} goals.`
        : `Free includes up to ${limit} goals. Upgrade for more.`
    );
  }

  const name = String(formData.get("name") ?? "").trim();
  const goalType = String(formData.get("goal_type") ?? "custom");
  const targetAmount = Number(formData.get("target_amount"));
  const targetDate = String(formData.get("target_date") ?? "") || null;
  let startingAmount = Number(formData.get("starting_amount")) || 0;

  if (!name || !targetAmount || targetAmount <= 0) {
    throw new Error("A name and a target amount (> 0) are required.");
  }
  if (startingAmount < 0) startingAmount = 0;
  if (startingAmount > targetAmount) startingAmount = targetAmount;

  const { error } = await supabase.from("goals").insert({
    user_id: userId,
    name,
    goal_type: goalType,
    target_amount: targetAmount,
    target_date: targetDate,
    starting_amount: startingAmount,
    current_amount: startingAmount,
  });

  if (error) throw error;
  revalidatePath("/dashboard/goals");
}

export async function deleteGoal(goalId: string) {
  const userId = await requireUserId();
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("goals")
    .delete()
    .eq("id", goalId)
    .eq("user_id", userId);

  if (error) throw error;
  revalidatePath("/dashboard/goals");
}

export async function addGoalContribution(formData: FormData) {
  const userId = await requireUserId();
  const supabase = createAdminClient();

  const goalId = String(formData.get("goal_id") ?? "");
  const amount = Number(formData.get("amount"));
  const contribDate = String(formData.get("contrib_date") ?? "");
  const note = String(formData.get("note") ?? "") || null;

  if (!goalId || !amount || !contribDate) {
    throw new Error("Amount and date are required.");
  }

  // Confirm the goal belongs to this user before attaching a contribution
  const { data: goal, error: goalError } = await supabase
    .from("goals")
    .select("id")
    .eq("id", goalId)
    .eq("user_id", userId)
    .single();

  if (goalError || !goal) throw new Error("Goal not found.");

  const { error } = await supabase.from("goal_contributions").insert({
    goal_id: goalId,
    user_id: userId,
    amount,
    contrib_date: contribDate,
    note,
  });

  if (error) throw error;
  revalidatePath("/dashboard/goals");
}

// ---------------------------------------------------------------------
// Investment scenarios (Premium)
// ---------------------------------------------------------------------
export async function saveInvestmentScenario(formData: FormData) {
  const userId = await requirePremiumUserId();
  const supabase = createAdminClient();

  const name = String(formData.get("name") ?? "").trim();
  const inputs = {
    initialAmount: Number(formData.get("initial_amount")) || 0,
    monthlyContribution: Number(formData.get("monthly_contribution")) || 0,
    years: Number(formData.get("years")) || 0,
    annualReturnPct: Number(formData.get("annual_return_pct")) || 0,
    annualInflationPct: Number(formData.get("annual_inflation_pct")) || 0,
    annualFeesPct: Number(formData.get("annual_fees_pct")) || 0,
  };

  if (!name) throw new Error("Give this scenario a name.");

  const { error } = await supabase
    .from("investment_scenarios")
    .insert({ user_id: userId, name, inputs });

  if (error) throw error;
  revalidatePath("/dashboard/investments");
}

export async function deleteInvestmentScenario(scenarioId: string) {
  const userId = await requirePremiumUserId();
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("investment_scenarios")
    .delete()
    .eq("id", scenarioId)
    .eq("user_id", userId);

  if (error) throw error;
  revalidatePath("/dashboard/investments");
}

// ---------------------------------------------------------------------
// Debts (Premium)
// ---------------------------------------------------------------------
export async function createDebt(formData: FormData) {
  const userId = await requirePremiumUserId();
  const supabase = createAdminClient();

  const name = String(formData.get("name") ?? "").trim();
  const balance = Number(formData.get("balance"));
  const apr = Number(formData.get("apr")) || 0;
  const minPayment = Number(formData.get("min_payment"));

  if (!name || !balance || balance <= 0 || !minPayment || minPayment <= 0) {
    throw new Error("Name, balance, and minimum payment are required.");
  }

  const { error } = await supabase.from("debts").insert({
    user_id: userId,
    name,
    balance,
    apr,
    min_payment: minPayment,
  });

  if (error) throw error;
  revalidatePath("/dashboard/debt");
}

export async function deleteDebt(debtId: string) {
  const userId = await requirePremiumUserId();
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("debts")
    .delete()
    .eq("id", debtId)
    .eq("user_id", userId);

  if (error) throw error;
  revalidatePath("/dashboard/debt");
}

export async function saveDebtPlan(formData: FormData) {
  const userId = await requirePremiumUserId();
  const supabase = createAdminClient();

  const strategy = String(formData.get("strategy") ?? "avalanche");
  const extraMonthlyPayment = Math.max(
    0,
    Number(formData.get("extra_monthly_payment")) || 0
  );

  const { error } = await supabase
    .from("debt_plans")
    .upsert(
      { user_id: userId, strategy, extra_monthly_payment: extraMonthlyPayment },
      { onConflict: "user_id" }
    );

  if (error) throw error;
  revalidatePath("/dashboard/debt");
}

// ---------------------------------------------------------------------
// Net worth (Premium)
// ---------------------------------------------------------------------
export async function createSnapshot(formData: FormData) {
  const userId = await requirePremiumUserId();
  const supabase = createAdminClient();

  const snapshotDate = String(formData.get("snapshot_date") ?? "");
  const note = String(formData.get("note") ?? "") || null;

  if (!snapshotDate) throw new Error("A date is required.");

  const { error } = await supabase
    .from("net_worth_snapshots")
    .upsert(
      { user_id: userId, snapshot_date: snapshotDate, note },
      { onConflict: "user_id,snapshot_date" }
    );

  if (error) throw error;
  revalidatePath("/dashboard/net-worth");
}

export async function deleteSnapshot(snapshotId: string) {
  const userId = await requirePremiumUserId();
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("net_worth_snapshots")
    .delete()
    .eq("id", snapshotId)
    .eq("user_id", userId);

  if (error) throw error;
  revalidatePath("/dashboard/net-worth");
}

export async function addNetWorthItem(formData: FormData) {
  const userId = await requirePremiumUserId();
  const supabase = createAdminClient();

  const snapshotId = String(formData.get("snapshot_id") ?? "");
  const kind = String(formData.get("kind") ?? "asset");
  const category = String(formData.get("category") ?? "").trim();
  const label = String(formData.get("label") ?? "").trim();
  const value = Number(formData.get("value"));

  if (!snapshotId || !category || !label || !value || value <= 0) {
    throw new Error("Category, label, and a value are required.");
  }

  // Confirm the snapshot belongs to this user
  const { data: snapshot, error: snapshotError } = await supabase
    .from("net_worth_snapshots")
    .select("id")
    .eq("id", snapshotId)
    .eq("user_id", userId)
    .single();

  if (snapshotError || !snapshot) throw new Error("Snapshot not found.");

  const { error } = await supabase.from("net_worth_items").insert({
    snapshot_id: snapshotId,
    kind,
    category,
    label,
    value,
  });

  if (error) throw error;
  revalidatePath("/dashboard/net-worth");
}

export async function deleteNetWorthItem(itemId: string) {
  const userId = await requirePremiumUserId();
  const supabase = createAdminClient();

  const { data: item, error: fetchError } = await supabase
    .from("net_worth_items")
    .select("id, snapshot_id")
    .eq("id", itemId)
    .single();

  if (fetchError || !item) throw new Error("Item not found.");

  const { data: snapshot, error: snapshotError } = await supabase
    .from("net_worth_snapshots")
    .select("id")
    .eq("id", item.snapshot_id)
    .eq("user_id", userId)
    .single();

  if (snapshotError || !snapshot) throw new Error("Item not found.");

  const { error } = await supabase.from("net_worth_items").delete().eq("id", itemId);
  if (error) throw error;
  revalidatePath("/dashboard/net-worth");
}

// ---------------------------------------------------------------------
// CSV import (Premium)
// ---------------------------------------------------------------------
type ImportRow = {
  type: "income" | "expense";
  amount: number;
  txDate: string;
  categoryName: string | null;
  note: string | null;
};

export async function importCsvRows(rows: ImportRow[]) {
  const userId = await requirePremiumUserId();
  const supabase = createAdminClient();

  const { data: categories, error: catError } = await supabase
    .from("categories")
    .select("id, name")
    .or(`user_id.eq.${userId},user_id.is.null`);

  if (catError) throw catError;

  const categoryByName = new Map(
    (categories ?? []).map((c) => [c.name.toLowerCase(), c.id])
  );

  let importedCount = 0;
  let skippedCount = 0;
  const errors: { row: number; reason: string }[] = [];

  const toInsert: {
    user_id: string;
    type: "income" | "expense";
    amount: number;
    tx_date: string;
    category_id: string | null;
    note: string | null;
  }[] = [];

  for (const [i, row] of rows.entries()) {
    // Re-validate server-side — never trust the client's parse alone
    const dateOk = /^\d{4}-\d{2}-\d{2}$/.test(row.txDate);
    const amountOk = typeof row.amount === "number" && row.amount > 0;
    const typeOk = row.type === "income" || row.type === "expense";

    if (!dateOk || !amountOk || !typeOk) {
      skippedCount++;
      errors.push({ row: i + 1, reason: "Invalid date, amount, or type." });
      continue;
    }

    let categoryId: string | null = null;
    if (row.categoryName) {
      const key = row.categoryName.toLowerCase();
      categoryId = categoryByName.get(key) ?? null;

      if (!categoryId) {
        // Unmatched category name — create it for this user rather than
        // silently dropping it, so the CSV's own categorization survives
        const { data: newCategory, error: newCatError } = await supabase
          .from("categories")
          .insert({ user_id: userId, name: row.categoryName, type: row.type })
          .select("id")
          .single();

        if (!newCatError && newCategory) {
          categoryId = newCategory.id;
          categoryByName.set(key, categoryId);
        }
      }
    }

    toInsert.push({
      user_id: userId,
      type: row.type,
      amount: row.amount,
      tx_date: row.txDate,
      category_id: categoryId,
      note: row.note,
    });
  }

  if (toInsert.length > 0) {
    const { error: insertError } = await supabase.from("transactions").insert(toInsert);
    if (insertError) throw insertError;
    importedCount = toInsert.length;
  }

  const { error: jobError } = await supabase.from("csv_import_jobs").insert({
    user_id: userId,
    status: "done",
    row_count: rows.length,
    imported_count: importedCount,
    skipped_count: skippedCount,
    errors: errors.length > 0 ? errors : null,
  });
  if (jobError) throw jobError;

  revalidatePath("/dashboard/import");
  revalidatePath("/dashboard/overview");
  revalidatePath("/dashboard/budget");

  return { importedCount, skippedCount };
}

// ---------------------------------------------------------------------
// Sinking funds (Free, capped at 1; Premium, capped at 20)
// ---------------------------------------------------------------------
export async function createSinkingFund(formData: FormData) {
  const userId = await requireUserId();
  const supabase = createAdminClient();

  const profile = await getProfile(userId);
  const isPremium = profile.plan === "premium";
  const limit = isPremium ? SINKING_FUND_LIMIT.premium : SINKING_FUND_LIMIT.free;

  const { count, error: countError } = await supabase
    .from("sinking_funds")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  if (countError) throw countError;
  if ((count ?? 0) >= limit) {
    throw new Error(
      isPremium
        ? `You've reached the maximum of ${limit} sinking funds.`
        : `Free includes 1 sinking fund. Upgrade for up to ${SINKING_FUND_LIMIT.premium}.`
    );
  }

  const name = String(formData.get("name") ?? "").trim();
  const targetAmount = Number(formData.get("target_amount"));
  const targetDate = String(formData.get("target_date") ?? "") || null;
  let startingAmount = Number(formData.get("starting_amount")) || 0;

  if (!name || !targetAmount || targetAmount <= 0) {
    throw new Error("A name and a target amount (> 0) are required.");
  }
  if (startingAmount < 0) startingAmount = 0;
  if (startingAmount > targetAmount) startingAmount = targetAmount;

  const { error } = await supabase.from("sinking_funds").insert({
    user_id: userId,
    name,
    target_amount: targetAmount,
    target_date: targetDate,
    starting_amount: startingAmount,
    current_amount: startingAmount,
  });

  if (error) throw error;
  revalidatePath("/dashboard/budget");
}

export async function deleteSinkingFund(fundId: string) {
  const userId = await requireUserId();
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("sinking_funds")
    .delete()
    .eq("id", fundId)
    .eq("user_id", userId);

  if (error) throw error;
  revalidatePath("/dashboard/budget");
}

export async function addSinkingFundContribution(formData: FormData) {
  const userId = await requireUserId();
  const supabase = createAdminClient();

  const fundId = String(formData.get("fund_id") ?? "");
  const amount = Number(formData.get("amount"));
  const contribDate = String(formData.get("contrib_date") ?? "");

  if (!fundId || !amount || !contribDate) {
    throw new Error("Amount and date are required.");
  }

  const { data: fund, error: fundError } = await supabase
    .from("sinking_funds")
    .select("id")
    .eq("id", fundId)
    .eq("user_id", userId)
    .single();

  if (fundError || !fund) throw new Error("Sinking fund not found.");

  const { error } = await supabase.from("sinking_fund_contributions").insert({
    fund_id: fundId,
    user_id: userId,
    amount,
    contrib_date: contribDate,
  });

  if (error) throw error;
  revalidatePath("/dashboard/budget");
}

// ---------------------------------------------------------------------
// Decision journal (Free — logging; insights are Premium, gated at the page level)
// ---------------------------------------------------------------------
export async function createDecision(formData: FormData) {
  const userId = await requireUserId();
  const supabase = createAdminClient();

  const title = String(formData.get("title") ?? "").trim();
  const reasoning = String(formData.get("reasoning") ?? "").trim() || null;
  const expectedOutcome = String(formData.get("expected_outcome") ?? "").trim() || null;
  const estimatedAmountRaw = formData.get("estimated_amount");
  const estimatedAmount =
    estimatedAmountRaw && String(estimatedAmountRaw).trim() !== ""
      ? Number(estimatedAmountRaw)
      : null;
  const decisionDate = String(formData.get("decision_date") ?? "");
  const reviewDate = String(formData.get("review_date") ?? "") || null;

  if (!title || !decisionDate) {
    throw new Error("A title and decision date are required.");
  }

  const { error } = await supabase.from("financial_decisions").insert({
    user_id: userId,
    title,
    reasoning,
    expected_outcome: expectedOutcome,
    estimated_amount: estimatedAmount,
    decision_date: decisionDate,
    review_date: reviewDate,
  });

  if (error) throw error;
  revalidatePath("/dashboard/decisions");
}

export async function recordDecisionOutcome(formData: FormData) {
  const userId = await requireUserId();
  const supabase = createAdminClient();

  const decisionId = String(formData.get("decision_id") ?? "");
  const outcome = String(formData.get("outcome") ?? "");

  if (!decisionId || (outcome !== "worked" && outcome !== "did_not_work")) {
    throw new Error("Invalid outcome.");
  }

  const { error } = await supabase
    .from("financial_decisions")
    .update({ outcome, outcome_recorded_at: new Date().toISOString() })
    .eq("id", decisionId)
    .eq("user_id", userId);

  if (error) throw error;
  revalidatePath("/dashboard/decisions");
}

export async function deleteDecision(decisionId: string) {
  const userId = await requireUserId();
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("financial_decisions")
    .delete()
    .eq("id", decisionId)
    .eq("user_id", userId);

  if (error) throw error;
  revalidatePath("/dashboard/decisions");
}

// ---------------------------------------------------------------------
// Onboarding
// ---------------------------------------------------------------------
export async function markOnboarded() {
  const userId = await requireUserId();
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("profiles")
    .update({ onboarded_at: new Date().toISOString() })
    .eq("id", userId);

  if (error) throw error;
  redirect("/dashboard/overview");
}

// ---------------------------------------------------------------------
// Profile / settings
// ---------------------------------------------------------------------
export async function updateProfile(formData: FormData) {
  const userId = await requireUserId();
  const supabase = createAdminClient();

  const currency = String(formData.get("currency") ?? "USD");
  const dateFormat = String(formData.get("date_format") ?? "YYYY-MM-DD");
  const startOfWeek = Number(formData.get("start_of_week") ?? 1);

  const { error } = await supabase
    .from("profiles")
    .update({ currency, date_format: dateFormat, start_of_week: startOfWeek })
    .eq("id", userId);

  if (error) throw error;
  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard/overview");
}

// ---------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------
export async function signOut() {
  const { createServerSupabaseClient } = await import("@/lib/supabase/server");
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
}
