"use client";

import { useEffect, useRef, useState } from "react";

const CLIPS = [
  "/hero/hero-1.mp4",
  "/hero/hero-2.mp4",
  "/hero/hero-3.mp4",
  "/hero/hero-4.mp4",
  "/hero/hero-5.mp4",
  "/hero/hero-6.mp4",
  "/hero/hero-7.mp4",
  "/hero/hero-8.mp4",
  "/hero/hero-9.mp4",
];

export function HeroVideoBackground() {
  const [front, setFront] = useState<0 | 1>(0);
  const clipIndexRef = useRef(0); // index of the clip currently showing on the front layer
  const videoRefA = useRef<HTMLVideoElement>(null);
  const videoRefB = useRef<HTMLVideoElement>(null);
  const refs = [videoRefA, videoRefB] as const;

  useEffect(() => {
    // Preload the second clip into the back layer once, on mount
    const back = refs[1].current;
    if (back && CLIPS.length > 1) {
      back.src = CLIPS[1];
      back.load();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleEnded(layer: 0 | 1) {
    const nextIndex = (clipIndexRef.current + 1) % CLIPS.length;
    const nextNextIndex = (clipIndexRef.current + 2) % CLIPS.length;
    const backLayer: 0 | 1 = layer === 0 ? 1 : 0;

    clipIndexRef.current = nextIndex;

    const incoming = refs[backLayer].current;
    if (incoming) {
      incoming.currentTime = 0;
      incoming.play().catch(() => {
        // Autoplay can be blocked in rare contexts; safe to ignore since
        // this is a muted background element, not user-facing media.
      });
    }

    setFront(backLayer);

    // Wait for the crossfade to fully finish before repurposing the
    // retiring layer for the clip-after-next — swapping its src while
    // it's still fading out (visible) is exactly what caused the
    // flash of unrelated content mid-transition.
    const retiring = refs[layer].current;
    setTimeout(() => {
      if (retiring) {
        retiring.pause();
        retiring.src = CLIPS[nextNextIndex];
        retiring.load();
      }
    }, 1300);
  }

  return (
    <>
      <video
        ref={videoRefA}
        muted
        playsInline
        preload="auto"
        autoPlay
        poster="/hero/hero-poster.jpg"
        onEnded={() => handleEnded(0)}
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-[1200ms] ease-in-out"
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
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-[1200ms] ease-in-out"
        style={{ opacity: front === 1 ? 1 : 0, zIndex: front === 1 ? 1 : 0 }}
      />
    </>
  );
}
