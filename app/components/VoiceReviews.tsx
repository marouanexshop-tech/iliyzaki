"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { voiceReviews, type VoiceReview } from "../lib/reviews";
import ChatBackdrop from "./ChatBackdrop";
import Reveal from "./Reveal";

const BARS = 44;

/** Stable pseudo-random bar heights: the same id always draws the same waveform. */
function waveform(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return Array.from({ length: BARS }, (_, i) => {
    hash = (hash * 1103515245 + 12345) >>> 0;
    const base = (hash % 1000) / 1000;
    // Taper the ends so it reads as speech rather than noise.
    const envelope = 0.5 + 0.5 * Math.sin((Math.PI * (i + 1)) / (BARS + 1));
    return Math.round((0.22 + base * 0.78) * envelope * 100) / 100;
  });
}

const clock = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const total = Math.floor(seconds);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
};

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className={`size-[13px] ${filled ? "text-amber-400" : "text-slate-200"}`}
    >
      <path d="M12 2.2l2.95 5.98 6.6.96-4.78 4.66 1.13 6.57L12 17.27l-5.9 3.1 1.13-6.57L2.45 9.14l6.6-.96z" />
    </svg>
  );
}

function VerifiedBadge() {
  return (
    <span className="flex shrink-0 items-center gap-1 rounded-full bg-green-100 px-2 py-[3px] text-[10px] font-bold text-green-700">
      <svg viewBox="0 0 24 24" aria-hidden className="size-3">
        <circle cx="12" cy="12" r="11" className="fill-green-600" />
        <path
          d="M7.5 12.4l3.1 3.1 6-6.4"
          fill="none"
          stroke="#fff"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      موثّق
    </span>
  );
}

function PlayIcon({ playing }: { playing: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="size-[15px]">
      {playing ? <path d="M8 5h3.2v14H8zM12.8 5H16v14h-3.2z" /> : <path d="M8.5 5.2v13.6L19 12z" />}
    </svg>
  );
}

function ReviewCard({
  review,
  isPlaying,
  onToggle,
  onEnded,
  registerAudio,
}: {
  review: VoiceReview;
  isPlaying: boolean;
  onToggle: () => void;
  onEnded: () => void;
  registerAudio: (id: string, el: HTMLAudioElement | null) => void;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const frameRef = useRef<number | undefined>(undefined);
  const [duration, setDuration] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const bars = useMemo(() => waveform(review.id), [review.id]);

  useEffect(() => {
    const audio = audioRef.current;
    registerAudio(review.id, audio);
    if (!audio) return;

    /* Native listeners plus an immediate read: metadata often lands before React attaches. */
    const readDuration = () => {
      if (Number.isFinite(audio.duration) && audio.duration > 0) setDuration(audio.duration);
    };
    readDuration();
    audio.addEventListener("loadedmetadata", readDuration);
    audio.addEventListener("durationchange", readDuration);
    audio.addEventListener("canplay", readDuration);

    return () => {
      audio.removeEventListener("loadedmetadata", readDuration);
      audio.removeEventListener("durationchange", readDuration);
      audio.removeEventListener("canplay", readDuration);
      registerAudio(review.id, null);
    };
  }, [registerAudio, review.id]);

  /*
   * Safari on iOS only honours play() inside the synchronous turn of the tap
   * that triggered it. Going through React state first would push the call
   * into a later task, where iOS rejects it with NotAllowedError and no sound
   * ever comes out. So start the audio here, then let state catch up.
   */
  const handleToggle = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      if (isPlaying) audio.pause();
      else void audio.play().catch(() => undefined);
    }
    onToggle();
  }, [isPlaying, onToggle]);

  /* rAF keeps the waveform smooth; timeupdate only fires ~4x a second. */
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      // Already started by the tap above; this only covers playback begun
      // programmatically, e.g. when another card hands over.
      if (audio.paused) void audio.play().catch(() => undefined);
      const tick = () => {
        setElapsed(audio.currentTime);
        frameRef.current = requestAnimationFrame(tick);
      };
      frameRef.current = requestAnimationFrame(tick);
    } else {
      audio.pause();
      setElapsed(audio.currentTime);
    }

    return () => {
      if (frameRef.current !== undefined) cancelAnimationFrame(frameRef.current);
    };
  }, [isPlaying]);

  const progress = duration > 0 ? Math.min(elapsed / duration, 1) : 0;

  const seek = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const audio = audioRef.current;
      if (!audio || !duration) return;
      const rect = event.currentTarget.getBoundingClientRect();
      // RTL: the track fills from the right edge.
      const ratio = (rect.right - event.clientX) / rect.width;
      audio.currentTime = Math.max(0, Math.min(1, ratio)) * duration;
      setElapsed(audio.currentTime);
    },
    [duration],
  );

  return (
    <article className="flex w-[292px] shrink-0 snap-center flex-col rounded-[20px] bg-white p-4 shadow-[0_2px_12px_rgba(15,23,42,0.07)] transition-shadow duration-300 hover:shadow-[0_10px_28px_rgba(15,23,42,0.12)] sm:w-[330px]">
      <div className="flex items-start gap-3">
        <span className="relative size-12 shrink-0 overflow-hidden rounded-full ring-1 ring-slate-200 ring-inset">
          <Image src={review.photo} alt="" fill sizes="48px" className="object-cover" />
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-extrabold leading-tight text-slate-800">{review.name}</p>
          {review.rating ? (
            <span
              role="img"
              aria-label={`تقييم ${review.rating} من 5`}
              className="mt-1 flex items-center gap-0.5"
            >
              {[1, 2, 3, 4, 5].map((value) => (
                <StarIcon key={value} filled={value <= review.rating!} />
              ))}
            </span>
          ) : null}
        </div>

        {review.verified && <VerifiedBadge />}
      </div>

      {review.quote && (
        <p className="mt-3 line-clamp-2 text-[13px] leading-relaxed text-slate-500">
          {review.quote}
        </p>
      )}

      <div className="mt-3.5 flex items-center gap-2.5 rounded-full bg-blue-50 py-2 pe-3 ps-2">
        <button
          type="button"
          onClick={handleToggle}
          aria-label={`${isPlaying ? "إيقاف" : "تشغيل"} رسالة ${review.name} الصوتية`}
          className="grid size-10 shrink-0 place-items-center rounded-full bg-white text-slate-800 shadow-[0_1px_4px_rgba(15,23,42,0.16)] transition-transform duration-200 hover:scale-105 active:scale-95"
        >
          <PlayIcon playing={isPlaying} />
        </button>

        <div
          onClick={seek}
          role="presentation"
          className="flex h-7 min-w-0 flex-1 cursor-pointer items-center gap-[1.5px]"
        >
          {bars.map((height, index) => {
            const played = (index + 1) / BARS <= progress;
            return (
              <span
                key={index}
                style={{ height: `${Math.round(height * 100)}%` }}
                className={`w-full min-w-[1.5px] rounded-full transition-colors duration-150 ${
                  played ? "bg-blue-500" : "bg-slate-300"
                }`}
              />
            );
          })}
        </div>

        <span dir="ltr" className="shrink-0 text-[11px] font-bold tabular-nums text-slate-500">
          {clock(isPlaying || elapsed > 0 ? elapsed : duration)}
        </span>
      </div>

      {/* playsInline stops iOS from hijacking playback into its fullscreen player. */}
      <audio
        ref={audioRef}
        src={review.audio}
        preload="metadata"
        playsInline
        onEnded={onEnded}
        className="hidden"
      />
    </article>
  );
}

export default function VoiceReviews() {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audios = useRef(new Map<string, HTMLAudioElement>());
  const trackRef = useRef<HTMLDivElement>(null);

  const registerAudio = useCallback((id: string, el: HTMLAudioElement | null) => {
    if (el) audios.current.set(id, el);
    else audios.current.delete(id);
  }, []);

  /* Only one voice note is ever audible. */
  const toggle = useCallback((id: string) => {
    setPlayingId((current) => {
      if (current === id) return null;
      const previous = current ? audios.current.get(current) : null;
      if (previous) {
        previous.pause();
        previous.currentTime = 0;
      }
      return id;
    });
  }, []);

  const scrollByCard = useCallback((direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector("article");
    const step = card ? card.getBoundingClientRect().width + 16 : 320;
    // scrollLeft runs negative in an RTL container, so "next" means scrolling left.
    const rtl = getComputedStyle(track).direction === "rtl";
    track.scrollBy({ left: (rtl ? -1 : 1) * direction * step, behavior: "smooth" });
  }, []);

  if (voiceReviews.length === 0) return null;

  return (
    <section
      id="reviews"
      aria-label="آراء زبنائنا الصوتية"
      className="relative isolate scroll-mt-4 overflow-x-clip bg-slate-50 px-5 py-9 md:px-8 md:py-11"
    >
      <ChatBackdrop />

      <Reveal>
        <h2 className="text-center text-[25px] font-extrabold tracking-tight text-slate-800 sm:text-[30px]">
          سمع رأي زبنائنا
        </h2>
        <p className="mt-2 text-center text-[13px] text-slate-500 sm:text-[14px]">
          رسائل صوتية حقيقية من زبناء جرّبوا منتجاتنا.
        </p>
      </Reveal>

      <Reveal delay={120}>
        <div className="relative mx-auto mt-8 max-w-6xl">
          <div
            ref={trackRef}
            className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {voiceReviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                isPlaying={playingId === review.id}
                onToggle={() => toggle(review.id)}
                onEnded={() => setPlayingId(null)}
                registerAudio={registerAudio}
              />
            ))}
          </div>

          {voiceReviews.length > 1 && (
            <div className="mt-5 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => scrollByCard(1)}
                aria-label="التالي"
                className="grid size-10 place-items-center rounded-full border border-slate-200 bg-white text-slate-700 transition-colors duration-200 hover:border-slate-400"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                  className="size-5"
                >
                  <path d="M15 5l-7 7 7 7" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => scrollByCard(-1)}
                aria-label="السابق"
                className="grid size-10 place-items-center rounded-full border border-slate-200 bg-white text-slate-700 transition-colors duration-200 hover:border-slate-400"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                  className="size-5"
                >
                  <path d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </Reveal>
    </section>
  );
}
