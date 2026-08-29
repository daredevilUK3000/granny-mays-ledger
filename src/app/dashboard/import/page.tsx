import Link from "next/link";
import { requireUserId } from "@/lib/auth";
import { getProfile } from "@/lib/data/profile";
import { getCategories } from "@/lib/data/categories";
import { getImportHistory } from "@/lib/data/csvimport";
import { PremiumLockedCard } from "@/components/PremiumLockedCard";
import { CsvImporter } from "@/components/CsvImporter";

export default async function ImportPage() {
  const userId = await requireUserId();
  const profile = await getProfile(userId);
  const isPremium = profile.plan === "premium";
  const freeImportUsed = !isPremium && !!profile.free_csv_import_used_at;

  if (freeImportUsed) {
    return (
      <PremiumLockedCard
        title="Import"
        description="You've used your one free import. Upgrade to Premium for unlimited, ongoing CSV import \u2014 upload, preview, and import with a full validation report, any time."
      />
    );
  }

  const [categories, history] = await Promise.all([
    getCategories(userId),
    getImportHistory(userId),
  ]);

  return (
    <div>
      <h1 className="font-display text-3xl text-ink mb-2">Import</h1>
      <div className="gilt-flourish mb-6" />
      <p className="text-ink-soft text-sm mb-6 max-w-lg leading-relaxed">
        If you've already got months of spending tracked somewhere else &mdash; a
        spreadsheet, an export from another app &mdash; this brings all of it in at
        once as regular transactions, instead of typing each one in by hand. Once
        imported, they behave exactly like anything you'd entered manually: they
        count toward your monthly budgets, show up in your category breakdown on{" "}
        <Link href="/dashboard/overview" className="underline">
          Overview
        </Link>
        , and feed your{" "}
        <Link href="/dashboard/budget" className="underline">
          Budget
        </Link>{" "}
        page.
      </p>

      <div className="ledger-rule pt-4 mb-8 max-w-lg">
        <p className="text-sm text-ink-soft leading-relaxed mb-2">
          Your file needs a <code className="tabular text-xs">date</code> column
          and an <code className="tabular text-xs">amount</code> column. Three more
          are optional: <code className="tabular text-xs">type</code> (income or
          expense &mdash; if you leave this out, a negative amount is treated as an
          expense and a positive one as income),{" "}
          <code className="tabular text-xs">category</code> (matched to your
          existing categories by name, or created fresh if it's new), and{" "}
          <code className="tabular text-xs">note</code>.
        </p>
        <a href="/sample-transactions.csv" download className="text-sm text-ink underline">
          Download a sample CSV in the right format &rarr;
        </a>
      </div>

      {!isPremium && (
        <p className="text-sm text-plum bg-plum-soft rounded-md px-4 py-3 mb-6 max-w-lg leading-relaxed">
          You get one free import to try the app with your real numbers &mdash; make it
          count, or upgrade for ongoing imports.
        </p>
      )}

      <CsvImporter
        categoryNames={categories.map((c) => c.name)}
        currency={profile.currency}
      />

      {history.length > 0 && (
        <section className="mt-12">
          <h2 className="font-display text-xl text-ink mb-4">Import history</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="ledger-rule text-left text-xs text-ink-soft uppercase tracking-wide">
                <th className="py-2 font-normal">Date</th>
                <th className="py-2 font-normal text-right">Rows</th>
                <th className="py-2 font-normal text-right">Imported</th>
                <th className="py-2 font-normal text-right">Skipped</th>
              </tr>
            </thead>
            <tbody>
              {history.map((job) => (
                <tr key={job.id} className="ledger-rule">
                  <td className="py-1.5 tabular">{new Date(job.created_at).toISOString().slice(0, 10)}</td>
                  <td className="py-1.5 tabular text-right">{job.row_count}</td>
                  <td className="py-1.5 tabular text-right text-sage">{job.imported_count}</td>
                  <td className="py-1.5 tabular text-right text-rust">{job.skipped_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}
