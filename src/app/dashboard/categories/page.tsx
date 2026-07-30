import { requireUserId } from "@/lib/auth";
import { getCategories } from "@/lib/data/categories";
import { createCategory, deleteCategory } from "@/lib/actions";
import { ConfirmDeleteForm } from "@/components/ConfirmDeleteForm";

export default async function CategoriesPage() {
  const userId = await requireUserId();
  const categories = await getCategories(userId);

  return (
    <div>
      <h1 className="font-display text-3xl text-ink mb-2">Categories</h1>
      <div className="gilt-flourish mb-8" />

      <section className="mb-10">
        <h2 className="font-display text-xl text-ink mb-4">New category</h2>
        <form action={createCategory} className="flex gap-3 mb-4 items-end">
          <div>
            <label className="block text-xs text-ink-soft mb-1">Name</label>
            <input
              name="name"
              type="text"
              required
              className="border border-rule bg-white px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-ink-soft mb-1">Type</label>
            <select
              name="type"
              className="border border-rule bg-white px-3 py-2 text-sm"
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
              <option value="both">Both</option>
            </select>
          </div>
          <button
            type="submit"
            className="border border-ink px-4 py-2 text-sm hover:bg-ink hover:text-parchment transition-colors"
          >
            Add category
          </button>
        </form>
      </section>

      <section>
        <div>
          {categories.map((c) => (
            <div
              key={c.id}
              className="ledger-rule py-3 flex items-center justify-between"
            >
              <span className="text-sm text-ink">
                {c.name} <span className="text-ink-soft text-xs">({c.type})</span>
              </span>
              {c.user_id ? (
                // user_id-null defaults have no delete action server-side,
                // so only render Delete for the user's own custom categories
                <ConfirmDeleteForm
                  action={deleteCategory.bind(null, c.id) as unknown as (fd: FormData) => void}
                  confirmMessage={`Delete category "${c.name}"?`}
                >
                  <button type="submit" className="text-xs text-ink-soft hover:text-rust">
                    Delete
                  </button>
                </ConfirmDeleteForm>
              ) : (
                <span className="text-xs text-ink-soft">Default</span>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
