export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect width="64" height="64" rx="14" fill="#1c2b39" />
      <rect x="14" y="19" width="36" height="3.5" rx="1.75" fill="#f6f1e7" />
      <rect x="14" y="30.25" width="27" height="3.5" rx="1.75" fill="#f6f1e7" opacity="0.82" />
      <rect x="14" y="41.5" width="18" height="3.5" rx="1.75" fill="#b8892b" />
      <circle cx="47" cy="43.25" r="3.75" fill="#b8892b" />
    </svg>
  );
}

export function Logo({
  size = 28,
  wordmarkClassName = "font-display text-xl text-ink",
}: {
  size?: number;
  wordmarkClassName?: string;
}) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark size={size} />
      <span className={wordmarkClassName}>
        Granny May&apos;s <em className="not-italic text-gilt">Ledger</em>
      </span>
    </span>
  );
}
