"use client";

import { useRef } from "react";
import { updateCategorySpendingType } from "@/lib/actions";

export function CategorySpendingTypeSelect({
  categoryId,
  defaultValue,
}: {
  categoryId: string;
  defaultValue: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={updateCategorySpendingType.bind(null, categoryId) as unknown as (fd: FormData) => void}
    >
      <select
        name="spending_type"
        defaultValue={defaultValue}
        onChange={() => formRef.current?.requestSubmit()}
        className="border border-rule bg-white px-2 py-1 text-xs"
      >
        <option value="flexible">Flexible</option>
        <option value="fixed">Fixed</option>
      </select>
    </form>
  );
}
