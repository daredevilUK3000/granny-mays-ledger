"use client";

import { useRef, useState } from "react";

/**
 * Two clips of the same illustrated character (confused, then content),
 * crossfading into each other on an endless loop. Simplified version of
 * HeroVideoBackground's dual-layer technique — with only two fixed
 * clips there's no "next up" queue to manage, each layer always plays
 * the same source and the two just swap which is on top.
 */
const CLIPS = ["/granny-money-corner.mp4", "/granny-money-corner-2.mp4"] as const;

export function GrannyMoneyCornerVideo() {
  const [front, setFront] = useState<0 | 1>(0);
  const videoRefA = useRef<HTMLVideoElement>(null);
  const videoRefB = useRef<HTMLVideoElement>(null);
  const refs = [videoRefA, videoRefB] as const;

  function handleEnded(layer: 0 | 1) {
    const nextLayer: 0 | 1 = layer === 0 ? 1 : 0;
    const incoming = refs[nextLayer].current;
    if (incoming) {
      incoming.currentTime = 0;
      incoming.play().catch(() => {
        // Autoplay can be blocked in rare contexts; safe to ignore since
        // this is a muted background element, not user-facing media.
      });
    }
    setFront(nextLayer);

    // Rewind the retiring layer once its crossfade-out has finished, so
    // it's ready from the start next time it comes back around.
    const retiring = refs[layer].current;
    setTimeout(() => {
      if (retiring) retiring.currentTime = 0;
    }, 900);
  }

  return (
    <div
      className="relative w-full h-full"
      role="img"
      aria-label="Granny May, weighing up a decision while writing in her ledger"
    >
      <video
        ref={videoRefA}
        muted
        playsInline
        preload="auto"
        autoPlay
        poster="/granny-money-corner-poster.jpg"
        onEnded={() => handleEnded(0)}
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-[900ms] ease-in-out"
        style={{ opacity: front === 0 ? 1 : 0, zIndex: front === 0 ? 1 : 0 }}
      >
        <source src={CLIPS[0]} type="video/mp4" />
      </video>
      <video
        ref={videoRefB}
        muted
        playsInline
        preload="auto"
        onEnded={() => handleEnded(1)}
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-[900ms] ease-in-out"
        style={{ opacity: front === 1 ? 1 : 0, zIndex: front === 1 ? 1 : 0 }}
      >
        <source src={CLIPS[1]} type="video/mp4" />
      </video>
    </div>
  );
}
