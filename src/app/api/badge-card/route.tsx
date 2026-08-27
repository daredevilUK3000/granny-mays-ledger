import { ImageResponse } from "next/og";
import { getBadgeById } from "@/lib/badges";

export const size = { width: 1080, height: 1080 };
export const contentType = "image/png";

async function loadFont(family: string, weight: number, text: string): Promise<ArrayBuffer> {
  const cssUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(
    family,
  )}:wght@${weight}&text=${encodeURIComponent(text)}`;
  const css = await fetch(cssUrl).then((r) => r.text());
  const match = css.match(/src: url\(([^)]+)\)/);
  if (!match) throw new Error(`Could not resolve a font file for ${family}`);
  const fontRes = await fetch(match[1]);
  return fontRes.arrayBuffer();
}

/**
 * Generates the shareable badge card as a PNG — a fixed, self-contained
 * image, not a themed page. Deliberately excludes Granny Score, £
 * amounts, and stat bars: only the badge travels, never the numbers.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const badge = getBadgeById(searchParams.get("id") ?? "");

  if (!badge) {
    return new Response("Unknown badge.", { status: 404 });
  }

  const accent = badge.kind === "score" ? "#b8892b" : "#e6432a";
  const accentSoft = badge.kind === "score" ? "#f3e9d2" : "#fce0d9";
  const seal = badge.kind === "score" ? "🎖️" : "🔥";

  type LoadedFont = { name: string; data: ArrayBuffer; weight: 400 | 500 | 600; style: "normal" };
  let fonts: LoadedFont[];
  try {
    const [fraunces, publicSans, mono] = await Promise.all([
      loadFont("Fraunces", 600, `${badge.name}Granny May's Ledger`),
      loadFont("Public Sans", 400, badge.description),
      loadFont("JetBrains Mono", 500, "GRANNY'S MONEY CORNERgrannymays.app"),
    ]);
    fonts = [
      { name: "Fraunces", data: fraunces, weight: 600, style: "normal" },
      { name: "Public Sans", data: publicSans, weight: 400, style: "normal" },
      { name: "JetBrains Mono", data: mono, weight: 500, style: "normal" },
    ];
  } catch {
    // satori has no built-in default — it requires at least one real
    // font to lay out any text. If the full trio fails (e.g. a Google
    // Fonts hiccup), fall back to a single font for everything rather
    // than fail the whole image.
    try {
      const fallback = await loadFont(
        "Public Sans",
        400,
        `${badge.name}${badge.description}Granny May's LedgerGRANNY'S MONEY CORNERgrannymays.app`,
      );
      fonts = [{ name: "Public Sans", data: fallback, weight: 400, style: "normal" }];
    } catch {
      return new Response("Could not generate badge image right now — try again shortly.", {
        status: 502,
      });
    }
  }

  const hasFont = (name: string) => fonts.some((f) => f.name === name);
  const frauncesFamily = hasFont("Fraunces") ? "Fraunces" : "Public Sans";
  const monoFamily = hasFont("JetBrains Mono") ? "JetBrains Mono" : "Public Sans";
  const sansFamily = "Public Sans";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          background: "#fffdf8",
          padding: "90px 80px 64px",
          fontFamily: sansFamily,
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 28,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "#0e9d63",
            fontFamily: monoFamily,
          }}
        >
          GRANNY&apos;S MONEY CORNER
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 28 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 220,
              height: 220,
              borderRadius: "50%",
              borderWidth: 6,
              borderStyle: "solid",
              borderColor: accent,
              background: accentSoft,
              fontSize: 96,
            }}
          >
            {seal}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 72,
              fontWeight: 600,
              color: "#1c2b39",
              fontFamily: frauncesFamily,
              textAlign: "center",
            }}
          >
            {badge.name}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 30,
              color: "#4a5a68",
              textAlign: "center",
              maxWidth: 640,
              lineHeight: 1.5,
            }}
          >
            {badge.description}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            borderTopWidth: 2,
            borderTopStyle: "solid",
            borderTopColor: "#ded0ac",
            paddingTop: 32,
            width: "100%",
            justifyContent: "center",
          }}
        >
          <div style={{ display: "flex", fontSize: 30, fontFamily: frauncesFamily, color: "#1c2b39" }}>
            Granny May&apos;s
          </div>
          <div style={{ display: "flex", fontSize: 30, fontFamily: frauncesFamily, color: accent }}>
            Ledger
          </div>
          <div style={{ display: "flex", color: "#ded0ac", fontSize: 28 }}>&middot;</div>
          <div style={{ display: "flex", fontSize: 24, color: "#6b7280", fontFamily: monoFamily }}>
            grannymays.app
          </div>
        </div>
      </div>
    ),
    { width: size.width, height: size.height, fonts },
  );
}
