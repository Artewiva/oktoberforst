import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent } from "react";
import { cn } from "@/utils/cn";

export type FestivalPoster = {
  act: string;
  detail: string;
  time: string;
  weekday: string;
  date: string;
  dayIndex: number;
  src: string;
  alt: string;
  highlight?: boolean;
};

type PosterCarouselProps = {
  posters: FestivalPoster[];
  /** Durata di ogni locandina in millisecondi. */
  slideDuration?: number;
  /** Chamata quando si vuole aprire il giorno corrispondente nel programma. */
  onOpenProgram: (dayIndex: number) => void;
};

const SWIPE_MIN = 42;

function ChevronIcon({ dir = "right" }: { dir?: "left" | "right" }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none">
      <path
        d={dir === "left" ? "M14.5 4.5 7 12l7.5 7.5" : "M9.5 4.5 17 12l-7.5 7.5"}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8.5 5.6 18 12l-9.5 6.4V5.6Z" fill="currentColor" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none">
      <path d="M9.4 5.5v13M14.6 5.5v13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function ExpandIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none">
      <path d="M14.5 4.5H19.5V9.5M9.5 19.5H4.5V14.5M19.5 4.5l-6.2 6.2M4.5 19.5l6.2-6.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none">
      <path d="m6.5 6.5 11 11M17.5 6.5l-11 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

/**
 * true solo se l'elemento ha ricevuto focus da tastiera: cosi' la rotazione si
 * ferma mentre si naviga il carosello con Tab, ma non si blocca dopo un click.
 */
function isKeyboardFocus(target: EventTarget | null) {
  const element = target as HTMLElement | null;
  if (!element || typeof element.matches !== "function") return false;
  try {
    return element.matches(":focus-visible");
  } catch {
    return false;
  }
}

export function PosterCarousel({ posters, slideDuration = 5200, onOpenProgram }: PosterCarouselProps) {
  const count = posters.length;
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [pageVisible, setPageVisible] = useState(() => typeof document === "undefined" || document.visibilityState !== "hidden");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [runId, setRunId] = useState(0);
  const [dragX, setDragX] = useState(0);
  const pointerStart = useRef<{ id: number; x: number } | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const lastTrigger = useRef<HTMLElement | null>(null);

  const goTo = useCallback(
    (next: number) => setIndex(((next % count) + count) % count),
    [count],
  );
  const advance = useCallback(() => setIndex((current) => (current + 1) % count), [count]);
  const rewind = useCallback(() => setIndex((current) => (current - 1 + count) % count), [count]);

  const frozen = count < 2 || hovered || focused || lightboxOpen || !pageVisible;

  // Il contatore riparte da zero ogni volta che la sfilata torna a scorrere,
  // così barra di avanzamento e timer restano sincronizzati.
  useEffect(() => {
    if (!frozen && playing) setRunId((value) => value + 1);
  }, [frozen, playing]);

  useEffect(() => {
    if (!playing || frozen) return;
    const timer = window.setTimeout(advance, slideDuration);
    return () => window.clearTimeout(timer);
  }, [advance, frozen, index, playing, runId, slideDuration]);

  useEffect(() => {
    const onVisibilityChange = () => setPageVisible(document.visibilityState !== "hidden");
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, []);

  useEffect(() => {
    if (!lightboxOpen) return;
    const previous = lastTrigger.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setLightboxOpen(false);
        return;
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        advance();
        return;
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        rewind();
        return;
      }
      if (event.key === "Tab") {
        const focusable = dialogRef.current?.querySelectorAll<HTMLElement>("button");
        if (!focusable || focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previous?.focus();
    };
  }, [advance, lightboxOpen, rewind]);

  const openLightbox = useCallback((trigger: HTMLElement) => {
    lastTrigger.current = trigger;
    setLightboxOpen(true);
  }, []);

  const onRegionKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      advance();
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      rewind();
    } else if (event.key === "Home") {
      event.preventDefault();
      goTo(0);
    } else if (event.key === "End") {
      event.preventDefault();
      goTo(count - 1);
    }
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" || count < 2) return;
    pointerStart.current = { id: event.pointerId, x: event.clientX };
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const start = pointerStart.current;
    if (!start || start.id !== event.pointerId) return;
    setDragX(Math.max(-90, Math.min(90, event.clientX - start.x)));
  };

  const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const start = pointerStart.current;
    pointerStart.current = null;
    setDragX(0);
    if (!start || start.id !== event.pointerId) return;
    const delta = event.clientX - start.x;
    if (Math.abs(delta) < SWIPE_MIN) return;
    if (delta < 0) advance();
    else rewind();
  };

  const status = useMemo(
    () => posters.map((poster) => `${poster.act} — ${poster.weekday} ${poster.date} ottobre, ore ${poster.time}`),
    [posters],
  );

  if (count === 0) return null;
  const current = posters[index];

  return (
    <div
      className="carousel"
      role="region"
      aria-roledescription="carosello"
      aria-label={`Locandine ufficiali delle serate: ${count} immagini in rotazione automatica`}
      style={{ "--carousel-slide-ms": `${slideDuration}ms` } as CSSProperties}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={(event) => {
        if (isKeyboardFocus(event.target)) setFocused(true);
      }}
      onBlurCapture={() => setFocused(false)}
      onKeyDown={onRegionKeyDown}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={() => {
        pointerStart.current = null;
        setDragX(0);
      }}
    >
      <div className="carousel-stage">
        <div className="carousel-frames" style={{ transform: dragX ? `translateX(${dragX}px)` : undefined }}>
          {posters.map((poster, posterIndex) => (
            <div
              className={cn("carousel-frame", posterIndex === index && "carousel-frame--active")}
              key={poster.src}
              role="group"
              aria-roledescription="diapositiva"
              aria-label={`${posterIndex + 1} di ${count}: locandina ${poster.act}`}
              inert={posterIndex !== index}
            >
              <button
                type="button"
                className="carousel-zoom"
                onClick={(event) => openLightbox(event.currentTarget)}
                tabIndex={posterIndex === index ? 0 : -1}
                aria-label={`Ingrandisci la locandina di ${poster.act}`}
              >
                <img src={poster.src} alt={poster.alt} loading={posterIndex === 0 ? "eager" : "lazy"} decoding="async" />
              </button>
              <span className="carousel-frame-corner" aria-hidden="true">
                <ExpandIcon />
              </span>
            </div>
          ))}
        </div>

        <div className="carousel-side">
          <div className="carousel-copy" key={index}>
            <p className="carousel-kicker">
              {current.weekday} {current.date} ottobre · ore {current.time}
              {current.highlight ? " · headliner" : ""}
            </p>
            <h3 className="carousel-title">{current.act}</h3>
            <p className="carousel-detail">{current.detail}</p>
          </div>

          <div className="carousel-actions">
            <button type="button" className="carousel-button carousel-button--amber" onClick={(event) => openLightbox(event.currentTarget)}>
              Ingrandisci <ExpandIcon />
            </button>
            <button type="button" className="carousel-button carousel-button--ghost" onClick={() => onOpenProgram(current.dayIndex)}>
              Vedi in programma <ChevronIcon />
            </button>
          </div>

          <div className="carousel-controls">
            <div className="carousel-arrows">
              <button type="button" className="carousel-arrow" onClick={rewind} aria-label="Locandina precedente">
                <ChevronIcon dir="left" />
              </button>
              <span className="carousel-counter" aria-hidden="true">
                <strong>{String(index + 1).padStart(2, "0")}</strong>
                <i>/</i>
                {String(count).padStart(2, "0")}
              </span>
              <button type="button" className="carousel-arrow" onClick={advance} aria-label="Locandina successiva">
                <ChevronIcon />
              </button>
            </div>
            <button
              type="button"
              className={cn("carousel-toggle", playing && !frozen ? "carousel-toggle--running" : "carousel-toggle--paused")}
              onClick={() => setPlaying((value) => !value)}
              aria-pressed={playing}
              aria-label={playing ? "Metti in pausa la rotazione delle locandine" : "Riprendi la rotazione delle locandine"}
            >
              {playing ? <PauseIcon /> : <PlayIcon />}
              <span>{playing ? "Pausa" : "Riproduci"}</span>
            </button>
          </div>

          <div className="carousel-timer" key={`${index}-${runId}`}>
            <span
              className="carousel-timer-bar"
              style={{
                animationDuration: `${slideDuration}ms`,
                animationPlayState: playing && !frozen ? "running" : "paused",
              }}
            />
          </div>
        </div>
      </div>

      <ul className="carousel-thumbs">
        {posters.map((poster, posterIndex) => (
          <li key={poster.src}>
            <button
              type="button"
              className={cn("carousel-thumb", posterIndex === index && "carousel-thumb--active")}
              onClick={() => goTo(posterIndex)}
              aria-label={`Mostra la locandina di ${poster.act}, ${poster.weekday} ${poster.date} ottobre`}
              aria-current={posterIndex === index ? "true" : undefined}
              title={`${poster.act} — ${poster.weekday} ${poster.date} ottobre`}
            >
              <img src={poster.src} alt="" loading="lazy" decoding="async" />
              <span>{poster.act}</span>
            </button>
          </li>
        ))}
      </ul>

      <p className="carousel-sr-status" aria-live={playing ? "off" : "polite"}>
        {status[index]}
      </p>

      {lightboxOpen && (
        <div className="carousel-lightbox" role="dialog" aria-modal="true" aria-label={`Locandina ${current.act}, ${current.weekday} ${current.date} ottobre`} ref={dialogRef}>
          <div className="carousel-lightbox-backdrop" onClick={() => setLightboxOpen(false)} />
          <div className="carousel-lightbox-body">
            <button type="button" className="carousel-lightbox-close" onClick={() => setLightboxOpen(false)} aria-label="Chiudi la locandina" ref={closeRef}>
              <CloseIcon />
            </button>
            <button type="button" className="carousel-lightbox-arrow carousel-lightbox-arrow--left" onClick={rewind} aria-label="Locandina precedente">
              <ChevronIcon dir="left" />
            </button>
            <figure className="carousel-lightbox-figure">
              {posters.map((poster, posterIndex) => (
                <img
                  key={poster.src}
                  className={cn("carousel-lightbox-img", posterIndex === index && "carousel-lightbox-img--active")}
                  src={poster.src}
                  alt={posterIndex === index ? poster.alt : ""}
                  aria-hidden={posterIndex !== index}
                  draggable={false}
                />
              ))}
              <figcaption>
                <strong>{current.act}</strong>
                <span>{current.detail}</span>
                <span>
                  {current.weekday} {current.date} ottobre 2026 · Parco Villa Filippina, Palermo · ore {current.time}
                </span>
              </figcaption>
            </figure>
            <button type="button" className="carousel-lightbox-arrow carousel-lightbox-arrow--right" onClick={advance} aria-label="Locandina successiva">
              <ChevronIcon />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PosterCarousel;
