import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent } from "react";
import { cn } from "@/utils/cn";

export type FestivalPhoto = {
  src: string;
  alt: string;
};

type PhotoSlideshowProps = {
  photos: FestivalPhoto[];
  /** Durata di ogni foto in millisecondi. */
  slideDuration?: number;
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

function CameraIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none">
      <path d="M4 8.5A1.5 1.5 0 0 1 5.5 7h1.7l1.2-2h7.2l1.2 2h1.7A1.5 1.5 0 0 1 20 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5v-9Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="12" cy="13" r="3.4" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

/**
 * true solo se l'elemento ha ricevuto focus da tastiera: cosi' la rotazione si
 * ferma mentre si naviga la galleria con Tab, ma non si blocca dopo un click.
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

export function PhotoSlideshow({ photos, slideDuration = 4600 }: PhotoSlideshowProps) {
  // Le foto che non si caricano vengono escluse dalla rotazione: la galleria
  // resta elegante anche se qualche file manca o non e' ancora stato caricato.
  const [failed, setFailed] = useState<ReadonlySet<string>>(() => new Set());
  const visiblePhotos = useMemo(() => photos.filter((photo) => !failed.has(photo.src)), [failed, photos]);
  const count = visiblePhotos.length;

  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [pageVisible, setPageVisible] = useState(() => typeof document === "undefined" || document.visibilityState !== "hidden");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [runId, setRunId] = useState(0);
  const [dragX, setDragX] = useState(0);
  const pointerStart = useRef<{ id: number; x: number } | null>(null);
  const suppressClick = useRef(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const lastTrigger = useRef<HTMLElement | null>(null);
  const thumbsRef = useRef<HTMLUListElement>(null);

  const safeIndex = count > 0 ? ((index % count) + count) % count : 0;

  const markFailed = useCallback((src: string) => {
    setFailed((previous) => {
      if (previous.has(src)) return previous;
      const next = new Set(previous);
      next.add(src);
      return next;
    });
  }, []);

  const goTo = useCallback(
    (next: number) => {
      if (count === 0) return;
      setIndex(((next % count) + count) % count);
    },
    [count],
  );
  const advance = useCallback(() => {
    if (count < 2) return;
    setIndex((current) => (current + 1) % count);
  }, [count]);
  const rewind = useCallback(() => {
    if (count < 2) return;
    setIndex((current) => (current - 1 + count) % count);
  }, [count]);

  const frozen = count < 2 || hovered || focused || lightboxOpen || !pageVisible;

  // Il contatore riparte da zero ogni volta che lo slideshow torna a scorrere,
  // cosi' segmento di avanzamento e timer restano sincronizzati.
  useEffect(() => {
    if (!frozen && playing) setRunId((value) => value + 1);
  }, [frozen, playing]);

  useEffect(() => {
    if (!playing || frozen) return;
    const timer = window.setTimeout(advance, slideDuration);
    return () => window.clearTimeout(timer);
  }, [advance, frozen, safeIndex, playing, runId, slideDuration]);

  useEffect(() => {
    const onVisibilityChange = () => setPageVisible(document.visibilityState !== "hidden");
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, []);

  // Precarica le due foto successive: la dissolvenza resta fluida anche con
  // file grandi, senza scaricare tutta la galleria in anticipo.
  useEffect(() => {
    if (count < 2) return;
    [1, 2].forEach((offset) => {
      const photo = visiblePhotos[(safeIndex + offset) % count];
      if (photo) {
        const preload = new Image();
        preload.src = photo.src;
      }
    });
  }, [count, safeIndex, visiblePhotos]);

  // La miniatura attiva resta sempre visibile al centro della striscia.
  useEffect(() => {
    const list = thumbsRef.current;
    if (!list) return;
    const active = list.querySelector<HTMLElement>(".slideshow-thumb--active");
    if (!active) return;
    const listRect = list.getBoundingClientRect();
    const rect = active.getBoundingClientRect();
    const target = list.scrollLeft + (rect.left - listRect.left) - list.clientWidth / 2 + rect.width / 2;
    list.scrollTo({ left: target, behavior: "smooth" });
  }, [safeIndex]);

  useEffect(() => {
    if (count === 0) setLightboxOpen(false);
  }, [count]);

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
    // Evita che il click generato alla fine dello swipe apra la lightbox.
    suppressClick.current = true;
    window.setTimeout(() => {
      suppressClick.current = false;
    }, 60);
    if (delta < 0) advance();
    else rewind();
  };

  // Sul palco teniamo montate solo la foto attiva e le due vicine: con decine
  // di scatti la pagina resta leggera e la dissolvenza sempre pronta.
  const windowIndices = useMemo(() => {
    if (count === 0) return [] as number[];
    return [...new Set([safeIndex, (safeIndex - 1 + count) % count, (safeIndex + 1) % count])];
  }, [count, safeIndex]);

  if (photos.length === 0) return null;

  if (count === 0) {
    return (
      <div className="slideshow-empty">
        <span className="slideshow-empty-icon" aria-hidden="true">
          <CameraIcon />
        </span>
        <strong>Le foto stanno arrivando</strong>
        <p>Stiamo selezionando gli scatti più belli della Festa Della Birra 2026: la galleria sarà presto online.</p>
      </div>
    );
  }

  const current = visiblePhotos[safeIndex];
  const position = String(safeIndex + 1).padStart(2, "0");
  const total = String(count).padStart(2, "0");

  return (
    <div
      className="slideshow"
      role="region"
      aria-roledescription="carosello"
      aria-label={`Foto della Festa Della Birra 2026: ${count} immagini in scorrimento automatico`}
      style={{ "--slideshow-slide-ms": `${slideDuration}ms` } as CSSProperties}
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
      <div className="slideshow-stage">
        <div className="slideshow-frames" style={{ transform: dragX ? `translateX(${dragX}px)` : undefined }}>
          {windowIndices.map((photoIndex) => {
            const photo = visiblePhotos[photoIndex];
            const isActive = photoIndex === safeIndex;
            return (
              <div
                className={cn("slideshow-slide", isActive && "slideshow-slide--active", photoIndex % 2 === 1 && "slideshow-slide--alt")}
                key={photo.src}
                role="group"
                aria-roledescription="diapositiva"
                aria-label={`${photoIndex + 1} di ${count}`}
                inert={!isActive}
              >
                <button
                  type="button"
                  className="slideshow-zoom"
                  onClick={(event) => {
                    if (suppressClick.current) return;
                    openLightbox(event.currentTarget);
                  }}
                  tabIndex={isActive ? 0 : -1}
                  aria-label={`Ingrandisci la foto ${photoIndex + 1} di ${count}`}
                >
                  <img
                    src={photo.src}
                    alt={photo.alt}
                    loading={photoIndex === 0 ? "eager" : "lazy"}
                    decoding="async"
                    draggable={false}
                    onError={() => markFailed(photo.src)}
                  />
                </button>
              </div>
            );
          })}
        </div>

        <div className="slideshow-shade" aria-hidden="true" />

        <div className="slideshow-segments" aria-label="Avanzamento della galleria">
          {visiblePhotos.map((photo, photoIndex) => (
            <button
              type="button"
              key={photo.src}
              className={cn(
                "slideshow-segment",
                photoIndex === safeIndex && "slideshow-segment--active",
                photoIndex < safeIndex && "slideshow-segment--done",
              )}
              onClick={() => goTo(photoIndex)}
              aria-label={`Vai alla foto ${photoIndex + 1} di ${count}`}
              aria-current={photoIndex === safeIndex ? "true" : undefined}
            >
              <span className="slideshow-segment-track">
                <span
                  className="slideshow-segment-fill"
                  key={photoIndex === safeIndex ? `${safeIndex}-${runId}` : undefined}
                  style={
                    photoIndex === safeIndex
                      ? {
                          animationDuration: `${slideDuration}ms`,
                          animationPlayState: playing && !frozen ? "running" : "paused",
                        }
                      : undefined
                  }
                />
              </span>
            </button>
          ))}
        </div>

        {count > 1 && (
          <>
            <button type="button" className="slideshow-arrow slideshow-arrow--prev" onClick={rewind} aria-label="Foto precedente">
              <ChevronIcon dir="left" />
            </button>
            <button type="button" className="slideshow-arrow slideshow-arrow--next" onClick={advance} aria-label="Foto successiva">
              <ChevronIcon />
            </button>
          </>
        )}

        <span className="slideshow-counter-chip" aria-hidden="true">
          <strong>{position}</strong>
          <i>/</i>
          {total}
        </span>
        <span className="slideshow-expand-hint" aria-hidden="true">
          <ExpandIcon />
          <span>Ingrandisci</span>
        </span>
      </div>

      <div className="slideshow-bar">
        <p className="slideshow-caption">
          Festa Della Birra 2026 <span>· Parco Villa Filippina, Palermo</span>
        </p>
        {count > 1 && (
          <button
            type="button"
            className={cn("slideshow-toggle", playing && !frozen ? "slideshow-toggle--running" : "slideshow-toggle--paused")}
            onClick={() => setPlaying((value) => !value)}
            aria-pressed={playing}
            aria-label={playing ? "Metti in pausa lo scorrimento delle foto" : "Riprendi lo scorrimento delle foto"}
          >
            {playing ? <PauseIcon /> : <PlayIcon />}
            <span>{playing ? "Pausa" : "Riproduci"}</span>
          </button>
        )}
      </div>

      <ul className="slideshow-thumbs" ref={thumbsRef} aria-label="Miniature della galleria fotografica">
        {visiblePhotos.map((photo, photoIndex) => (
          <li key={photo.src}>
            <button
              type="button"
              className={cn("slideshow-thumb", photoIndex === safeIndex && "slideshow-thumb--active")}
              onClick={() => goTo(photoIndex)}
              aria-label={`Mostra la foto ${photoIndex + 1} di ${count}`}
              aria-current={photoIndex === safeIndex ? "true" : undefined}
            >
              <img src={photo.src} alt="" loading="lazy" decoding="async" draggable={false} onError={() => markFailed(photo.src)} />
              <span aria-hidden="true">{String(photoIndex + 1).padStart(2, "0")}</span>
            </button>
          </li>
        ))}
      </ul>

      <p className="slideshow-sr-status" aria-live={playing ? "off" : "polite"}>
        Foto {safeIndex + 1} di {count} — Festa Della Birra 2026, Parco Villa Filippina
      </p>

      {lightboxOpen && (
        <div className="slideshow-lightbox" role="dialog" aria-modal="true" aria-label={`Foto ${safeIndex + 1} di ${count} — Festa Della Birra 2026`} ref={dialogRef}>
          <div className="slideshow-lightbox-backdrop" onClick={() => setLightboxOpen(false)} />
          <div className="slideshow-lightbox-body">
            <button type="button" className="slideshow-lightbox-close" onClick={() => setLightboxOpen(false)} aria-label="Chiudi la foto" ref={closeRef}>
              <CloseIcon />
            </button>
            {count > 1 && (
              <button type="button" className="slideshow-lightbox-arrow slideshow-lightbox-arrow--left" onClick={rewind} aria-label="Foto precedente">
                <ChevronIcon dir="left" />
              </button>
            )}
            <figure className="slideshow-lightbox-figure">
              <img
                key={current.src}
                className="slideshow-lightbox-img"
                src={current.src}
                alt={current.alt}
                draggable={false}
                onError={() => markFailed(current.src)}
              />
              <figcaption>
                <strong>
                  Foto {position} <span>/ {total}</span>
                </strong>
                <span>Festa Della Birra 2026 · Parco Villa Filippina, Palermo</span>
              </figcaption>
            </figure>
            {count > 1 && (
              <button type="button" className="slideshow-lightbox-arrow slideshow-lightbox-arrow--right" onClick={advance} aria-label="Foto successiva">
                <ChevronIcon />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default PhotoSlideshow;
