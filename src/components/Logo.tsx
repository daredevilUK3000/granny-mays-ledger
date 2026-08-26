import Image from "next/image";

const MARK_ASPECT = 300 / 368; // width / height of /public/logo-mark.png

export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <Image
      src="/logo-mark.png"
      alt=""
      width={Math.round(size * MARK_ASPECT)}
      height={size}
      className="shrink-0"
      priority
    />
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
