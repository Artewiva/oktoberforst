import { useEffect, useState } from "react";

type Act = {
  time: string;
  name: string;
  detail: string;
  accent?: boolean;
  image?: string;
  imageAlt?: string;
};

type ProgramDay = {
  date: string;
  weekday: string;
  short: string;
  title: string;
  mood: string;
  acts: Act[];
};

const LOGO_SRC = "/images/LOGO%20FESTA%20DELLA%20BIRRA%202026.png";
const LOGO_ALT = "Logo ufficiale Festa Della Birra — Parco Villa Filippina, Palermo";
const VILLA_LOGO_SRC = "/images/logo-villa-filippina.png";
const VILLA_LOGO_ALT = "Logo Parco Villa Filippina — location ufficiale Festa Della Birra Palermo";
const ARTEWIVA_LOGO_SRC = "/images/ARTEWIVA%205-01.%20linee%20Bianche.png";
const ARTEWIVA_LOGO_ALT = "Logo Artewiva Palermo — organizzazione eventi Festa Della Birra";
const FORST_LOGO_SRC = "/images/forst-logo.png";
const FORST_LOGO_ALT = "Logo Birra Forst — birra italiana dal 1857, in collaborazione con Festa Della Birra Palermo";

const beers = ["Forst Kronen", "Forst Felsenkeller", "Forst Sixtus", "Forst VIP Pils", "Forst Hellerbock", "Forst Puro Malto"];

const program: ProgramDay[] = [
  {
    date: "15",
    weekday: "Giovedì",
    short: "GIO",
    title: "L’inaugurazione",
    mood: "Si apre il festival: apertura dei fusti, musica dal vivo e il primo brindisi sotto le luci del parco.",
    acts: [
      { time: "18:00", name: "Inaugurazione", detail: "Apertura dei fusti e musica dal vivo" },
      { time: "19:00", name: "Two Of Us", detail: "Concerto dal vivo", image: "/images/two-of-us.png", imageAlt: "Locandina Two Of Us — Massimo Intorre e Irene Cangemi, live alla Festa Della Birra" },
      { time: "21:30", name: "Babajaga", detail: "Concerto dal vivo", accent: true },
    ],
  },
  {
    date: "16",
    weekday: "Venerdì",
    short: "VEN",
    title: "La piazza prende ritmo",
    mood: "Si parte con la musica tradizionale irlandese dei South Island, poi il folk della Allen Folk Band e il live dei Seattle Candles fino a tardi.",
    acts: [
      { time: "17:00", name: "South Island", detail: "Musica tradizionale irlandese", image: "/images/south-island.png", imageAlt: "Locandina South Island — Traditional Irish Music alla Festa Della Birra" },
      { time: "20:30", name: "Allen Folk Band", detail: "Folk dal vivo", accent: true, image: "/images/allen-folk-band.png", imageAlt: "Locandina Allen Folk Band — folk dal vivo alla Festa Della Birra" },
      { time: "22:30", name: "Seattle Candles", detail: "Concerto dal vivo", image: "/images/seattle-candles.png", imageAlt: "Locandina Seattle Candles Unplugged — live alla Festa Della Birra" },
    ],
  },
  {
    date: "17",
    weekday: "Sabato",
    short: "SAB",
    title: "La serata dei Beatles",
    mood: "La serata dedicata ai Beatles: l’omaggio ai Fab Four dei The Fab Experience e, a seguire, lo show dal vivo di Carlo Poddighe.",
    acts: [
      { time: "21:00", name: "The Fab Experience", detail: "Spettacolo omaggio ai Fab Four", accent: true, image: "/images/the-fab-experience.png", imageAlt: "Locandina The Fab Experience — Beatles tribute band dal vivo" },
      { time: "22:00", name: "Carlo Poddighe", detail: "Show dal vivo", image: "/images/carlo-poddighe.png", imageAlt: "Locandina Carlo Poddighe — show dal vivo alla Festa Della Birra" },
    ],
  },
  {
    date: "18",
    weekday: "Domenica",
    short: "DOM",
    title: "Un finale da cantare",
    mood: "Il tributo ai Doors e il DJ set finale: l’ultimo brindisi di questa edizione.",
    acts: [
      { time: "19:00", name: "American Players", detail: "The Doors Tribute", accent: true },
      { time: "a seguire", name: "DJ set finale", detail: "L’ultimo brindisi di questa edizione" },
    ],
  },
];

const faqs = [
  {
    question: "L’ingresso è gratuito?",
    answer:
      "Sì: l’ingresso al Parco Villa Filippina è libero e gratuito per tutte e quattro le giornate. Puoi accedere agli stand gastronomici, all’area fusti Forst e alle aree relax attrezzate con tavoli e sedute.",
  },
  {
    question: "Devo prenotare un tavolo?",
    answer:
      "No: tavoli e sedute sono ad accesso libero, senza prenotazione. Se arrivi in gruppo o hai esigenze particolari scrivici a parcovillafilippinaticket@gmail.com oppure contattaci su Facebook, Instagram o TikTok: ti aiutiamo a organizzarvi al meglio.",
  },
  {
    question: "Quali birre e quali piatti trovo al festival?",
    answer:
      "Alla spina trovi la selezione del gruppo Forst — Kronen, Felsenkeller, Sixtus, VIP Pils, Hellerbock e Puro Malto — servita freschissima. In cucina: salsicce e bratwurst con crauti e senape, pretzel artigianali, stinco di maiale, ma anche pani ca meusa, arancine, sfincione e cannoli caldi.",
  },
  {
    question: "Si può venire con i bambini?",
    answer:
      "Certo: il festival è pensato anche per le famiglie. Nel weekend ci sono laboratori creativi con animatori qualificati e mercatini artigianali, mentre l’area verde attrezzata offre tavoli e sedute per tutti. I minori devono essere accompagnati da un adulto e non possono consumare alcolici.",
  },
  {
    question: "Quali metodi di pagamento sono accettati?",
    answer:
      "Alle casse e negli stand puoi pagare con carta, contactless e contanti.",
  },
  {
    question: "Cosa succede in caso di pioggia?",
    answer:
      "L’evento si svolge anche con condizioni meteo variabili: il parco dispone di ampi spazi coperti con tavoli in legno e il programma potrebbe subire piccoli cambiamenti per garantire a tutti una serata piacevole e sicura.",
  },
];

function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <span className={`brand-lockup ${compact ? "brand-lockup--compact" : ""}`}>
      <span className="brand-logo-badge" aria-hidden="false">
        <img src={LOGO_SRC} alt={LOGO_ALT} width={compact ? 44 : 56} height={compact ? 44 : 56} loading="eager" decoding="async" />
      </span>
      <span className="brand-type">
        <strong>FESTA DELLA</strong>
        <em>BIRRA</em>
      </span>
    </span>
  );
}

function SponsorLogo() {
  const [imageAvailable, setImageAvailable] = useState(true);

  if (!imageAvailable) {
    return <strong>FORST</strong>;
  }

  return (
    <img
      className="sponsor-logo"
      src={FORST_LOGO_SRC}
      alt={FORST_LOGO_ALT}
      width={107}
      height={60}
      loading="lazy"
      decoding="async"
      onError={() => setImageAvailable(false)}
    />
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 18 18" aria-hidden="true" fill="none">
      <path d="M3 9h11M9.5 3.5 15 9l-5.5 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none">
      <rect x="3.5" y="5.5" width="17" height="15" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7.5 3.5v4M16.5 3.5v4M3.5 10h17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none">
      <path d="M19 10.25c0 5.25-7 10.25-7 10.25s-7-5-7-10.25a7 7 0 1 1 14 0Z" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="10" r="2.25" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none">
      <rect x="3.5" y="5.5" width="17" height="13" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="m4.5 7.5 7.5 5.5 7.5-5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M13.4 21v-7.2h2.4l.4-2.8h-2.8V9.2c0-.8.2-1.3 1.3-1.3h1.5V5.4c-.3 0-1.1-.1-2.1-.1-2.1 0-3.5 1.3-3.5 3.6v2.1H8.2v2.8h2.4V21h2.8Z" fill="currentColor" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none">
      <rect x="4" y="4" width="16" height="16" rx="4.5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="3.6" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="16.9" cy="7.1" r="1.05" fill="currentColor" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none">
      <path d="M14.2 3.6v10.5a3.1 3.1 0 1 1-3.1-3.1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M14.2 3.6c.5 2.6 2.2 4.2 4.8 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3.5 12h17M12 3.5c2.4 2.3 3.6 5.2 3.6 8.5S14.4 18.2 12 20.5c-2.4-2.3-3.6-5.2-3.6-8.5S9.6 5.8 12 3.5Z" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function LeafIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none">
      <path d="M20 4c0 8-4.6 12-10 12H5.5C5.5 9.5 10.5 4 20 4Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M5 20c1.4-4 3.6-7 7-9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function Countdown() {
  const eventDate = new Date("2026-10-15T18:00:00+02:00").getTime();
  const getTimeLeft = () => {
    const difference = Math.max(0, eventDate - Date.now());
    return {
      days: Math.floor(difference / 86400000),
      hours: Math.floor((difference / 3600000) % 24),
      minutes: Math.floor((difference / 60000) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  };
  const [timeLeft, setTimeLeft] = useState(getTimeLeft);

  useEffect(() => {
    const timer = window.setInterval(() => setTimeLeft(getTimeLeft()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const units = [
    [timeLeft.days, "giorni"],
    [timeLeft.hours, "ore"],
    [timeLeft.minutes, "min"],
    [timeLeft.seconds, "sec"],
  ];

  return (
    <div className="countdown" aria-label="Conto alla rovescia per l’apertura del festival">
      <span className="countdown-label">Mancano all’apertura</span>
      <div className="countdown-values">
        {units.map(([value, label]) => (
          <span className="countdown-unit" key={label}>
            <strong>{String(value).padStart(2, "0")}</strong>
            <small>{label}</small>
          </span>
        ))}
      </div>
    </div>
  );
}

function App() {
  const [activeDay, setActiveDay] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [navScrolled, setNavScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    const elements = document.querySelectorAll(".reveal");
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileMenuOpen(false);
  };

  return (
    <div className="site-shell">
      <header className={`site-nav ${navScrolled ? "site-nav--scrolled" : ""}`}>
        <div className="nav-inner">
          <a className="nav-brand" href="#top" aria-label="Festa Della Birra, torna in cima"><BrandMark compact /></a>
          <nav className={`nav-links ${mobileMenuOpen ? "nav-links--open" : ""}`} aria-label="Navigazione principale">
            <a href="#programma" onClick={() => setMobileMenuOpen(false)}>Programma</a>
            <a href="#location" onClick={() => setMobileMenuOpen(false)}>Location</a>
            <a href="#esperienza" onClick={() => setMobileMenuOpen(false)}>Birra &amp; food</a>
            <a href="#faq" onClick={() => setMobileMenuOpen(false)}>FAQ</a>
            <button className="nav-book mobile-only" onClick={() => scrollTo("contatti")}>Contatti <ArrowIcon /></button>
          </nav>
          <a className="nav-book desktop-only" href="#contatti">Contatti <ArrowIcon /></a>
          <button className={`menu-toggle ${mobileMenuOpen ? "menu-toggle--open" : ""}`} onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label={mobileMenuOpen ? "Chiudi menu" : "Apri menu"} aria-expanded={mobileMenuOpen}><span /><span /></button>
        </div>
      </header>

      <main>
        <section className="hero" id="top">
          <div className="hero-shade" /><div className="hero-grain" />
          <div className="hero-content page-wrap">
            <div className="hero-grid">
              <div className="hero-copy">
                <div className="hero-badge-pill reveal reveal--up">
                  <span className="hero-pill-logo">
                    <img src={LOGO_SRC} alt="" aria-hidden="true" width={34} height={34} loading="eager" decoding="async" />
                  </span>
                  <span>Festa della Birra — Palermo 2026</span>
                </div>
                <p className="eyebrow reveal reveal--up reveal-delay-1">15 — 18 OTTOBRE 2026 • PARCO VILLA FILIPPINA</p>
                <h1 className="reveal reveal--up reveal-delay-2">Quattro giorni.<br /><span>Una sola grande sete.</span></h1>
                <p className="hero-intro reveal reveal--up reveal-delay-3">La grande festa della birra torna nel cuore di Palermo: quattro giornate tra Forst alla spina, concerti, tribute band e DJ set, con la cucina bavarese che incontra i sapori palermitani.</p>
                <div className="hero-actions reveal reveal--up reveal-delay-4"><button className="button button--amber" onClick={() => scrollTo("contatti")}>Contatti <ArrowIcon /></button><button className="text-link text-link--light" onClick={() => scrollTo("programma")}>Scopri il programma <ArrowIcon /></button></div>
                <Countdown />
              </div>
              <div className="hero-visual reveal reveal--fade reveal-delay-2">
                <div className="hero-logo-wrap">
                  <div className="hero-logo-glow" aria-hidden="true" />
                  <div className="hero-logo-ring" aria-hidden="true" />
                  <img className="hero-logo" src={LOGO_SRC} alt={LOGO_ALT} width={520} height={520} loading="eager" decoding="async" fetchPriority="high" />
                  <div className="hero-logo-ribbon" aria-hidden="true">
                    <span>15 — 18 Ottobre</span>
                    <i />
                    <span>Villa Filippina</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="hero-foot reveal reveal--fade reveal-delay-4"><span>Palermo, Sicilia</span><span className="hero-foot-line" /><span>Ingresso gratuito</span></div>
          </div>
          <a href="#highlights" className="scroll-cue" aria-label="Scorri per scoprire l’evento"><span>Scorri per scoprire</span><span className="scroll-cue-arrow">&#8595;</span></a>
        </section>

        <section className="highlights" id="highlights" aria-label="Punti forti del festival">
          <div className="page-wrap highlights-grid">
            <div className="highlight-item reveal reveal--up"><span className="highlight-number">04</span><span><strong>Giorni</strong><small>di festa</small></span></div>
            <div className="highlight-item reveal reveal--up reveal-delay-1"><span className="highlight-icon">&#9835;</span><span><strong>Live + DJ set</strong><small>ogni sera</small></span></div>
            <div className="highlight-item reveal reveal--up reveal-delay-2"><span className="highlight-icon highlight-icon--beer">&#9679;</span><span><strong>Forst alla spina</strong><small>sei specialità</small></span></div>
            <div className="highlight-item reveal reveal--up reveal-delay-3"><span className="highlight-icon">&#10022;</span><span><strong>Gastronomia</strong><small>bavarese &amp; palermitana</small></span></div>
            <div className="highlight-item reveal reveal--up reveal-delay-4"><span className="highlight-number">€ 0</span><span><strong>Ingresso</strong><small>libero</small></span></div>
          </div>
        </section>

        <section className="program-section section-dark" id="programma">
          <div className="page-wrap">
            <div className="section-intro section-intro--split reveal reveal--up"><div><p className="eyebrow eyebrow--amber">Il programma</p><h2>Ogni sera<br /><span>ha il suo ritmo.</span></h2></div><p className="section-lead">Quattro giorni di musica live: un calendario di appuntamenti che accompagna il pubblico dal primo brindisi fino alla chiusura del festival. Scegli la tua serata e preparati a cantare.</p></div>
            <div className="program-layout reveal reveal--up reveal-delay-1">
              <div className="day-tabs" role="tablist" aria-label="Giorni del programma">
                {program.map((day, index) => <button className={`day-tab ${activeDay === index ? "day-tab--active" : ""}`} key={day.date} onClick={() => setActiveDay(index)} role="tab" aria-selected={activeDay === index} aria-controls={`day-panel-${day.date}`}><span>{day.short}</span><strong>{day.date}</strong></button>)}
              </div>
              <div className="program-panel" id={`day-panel-${program[activeDay].date}`} role="tabpanel">
                <div className="program-panel-heading"><div><p className="panel-day">{program[activeDay].weekday} {program[activeDay].date} ottobre</p><h3>{program[activeDay].title}</h3></div><p>{program[activeDay].mood}</p></div>
                <div className="act-list">{program[activeDay].acts.map((act) => <div className={`act-row ${act.accent ? "act-row--accent" : ""} ${act.image ? "act-row--with-image" : ""}`} key={act.name}>{/^\d{2}:\d{2}$/.test(act.time) ? <time>{act.time}</time> : <span className="act-time">{act.time}</span>}<div className="act-line" /><div className="act-body"><div className="act-name"><strong>{act.name}</strong><span>{act.detail}</span></div>{act.accent && <span className="live-tag">Live</span>}</div>{act.image && <span className="act-poster" role="img" aria-label={act.imageAlt || `Locandina ${act.name}`}><img src={act.image} alt={act.imageAlt || `Locandina ${act.name}`} loading="lazy" decoding="async" /></span>}</div>)}</div>
                <div className="program-panel-foot"><span>Orari indicativi: il programma può subire variazioni</span><button className="text-link text-link--amber" onClick={() => scrollTo("contatti")}>Contattaci <ArrowIcon /></button></div>
              </div>
            </div>
          </div>
        </section>

        <section className="experience-section" id="esperienza">
          <div className="page-wrap experience-grid">
            <div className="experience-image reveal reveal--left"><img src="/images/food-festival.jpg" alt="Birre Forst e specialità bavaresi e palermitane su una tavola del festival" loading="lazy" decoding="async" /><span className="image-caption">Sapori da condividere</span></div>
            <div className="experience-copy reveal reveal--right"><p className="eyebrow">L’esperienza</p><h2>Il gusto di<br /><span>stare insieme.</span></h2><p className="section-lead">Una tavola lunga, una birra Forst freschissima e il verde di Villa Filippina: l’incontro tra la tradizione brassicola altoatesina e la convivialità palermitana.</p><div className="experience-details"><div className="detail-row"><span className="detail-index">01</span><div><strong>Forst alla spina</strong><p>Sei specialità del gruppo Forst, dalla Kronen alla Sixtus, servite freschissime.</p></div></div><div className="detail-row"><span className="detail-index">02</span><div><strong>Baviera incontra Palermo</strong><p>Salsicce e bratwurst con crauti e senape dolce, pretzel artigianali, stinco, pani ca meusa, arancine, sfincione e cannoli.</p></div></div><div className="detail-row"><span className="detail-index">03</span><div><strong>Un parco in città</strong><p>Oltre 10.000 metri quadrati di parco storico nel centro di Palermo, tra prato centrale e Planetario.</p></div></div><div className="detail-row"><span className="detail-index">04</span><div><strong>Un weekend per le famiglie</strong><p>Laboratori creativi con animatori qualificati, mercatini artigianali e aree relax con tavoli in legno.</p></div></div></div><div className="beer-tags"><span className="beer-tags-title">Alla spina</span><ul>{beers.map((beer) => <li key={beer}>{beer}</li>)}</ul></div><button className="text-link text-link--dark" onClick={() => scrollTo("location")}>Scopri la location <ArrowIcon /></button></div>
          </div>
        </section>

        <section className="crest-section section-cream" aria-label="Lo stemma ufficiale">
          <div className="page-wrap crest-grid">
            <div className="crest-visual reveal reveal--left">
              <img src={LOGO_SRC} alt={LOGO_ALT} width={420} height={420} loading="lazy" decoding="async" />
            </div>
            <div className="crest-copy reveal reveal--right">
              <p className="eyebrow">Lo stemma ufficiale</p>
              <h2>Tradizione bavarese,<br /><span>cuore palermitano.</span></h2>
              <p>Lo stemma della Festa Della Birra unisce i simboli della festa — luppolo, spighe, boccale schiumoso e le Alpi — con Parco Villa Filippina. Lo trovi all’ingresso, sui boccali e sul palco: è la garanzia della vera Festa della Birra.</p>
              <div className="crest-badges">
                <span>Dal 1857 — Birra Forst</span>
                <span>Festa della Birra</span>
                <span>Villa Filippina • Palermo</span>
              </div>
            </div>
          </div>
        </section>

        <section className="location-section section-cream" id="location">
          <div className="page-wrap">
            <div className="section-intro section-intro--split reveal reveal--up"><div><p className="eyebrow">La location</p><h2>Un giardino<br /><span>nel cuore di Palermo.</span></h2></div><p className="section-lead">Dimora storica del XVIII secolo trasformata in grande parco urbano: il nostro punto di ritrovo, facile da raggiungere e impossibile da dimenticare.</p></div>
            <div className="location-grid reveal reveal--up reveal-delay-1">
              <div className="map-panel" aria-label="Mappa stilizzata di Parco Villa Filippina"><div className="map-lines map-lines--one" /><div className="map-lines map-lines--two" /><div className="map-lines map-lines--three" /><div className="map-park"><span>Parco<br />Villa Filippina</span></div><div className="map-pin"><PinIcon /></div><span className="map-label map-label--top">Via Dante</span><span className="map-label map-label--side">Via Villa Filippina</span><span className="map-label map-label--bottom">Piazza San Francesco di Paola</span><a className="map-open" href="https://www.google.com/maps/search/?api=1&query=Parco+Villa+Filippina+Palermo" target="_blank" rel="noreferrer">Apri in Google Maps <ArrowIcon /></a></div>
              <div className="location-info"><div className="location-block"><span className="location-icon"><PinIcon /></span><div><small>Indirizzo</small><strong>Parco Villa Filippina</strong><p>Piazza San Francesco di Paola, 18<br />90138 Palermo PA</p></div></div><div className="location-block"><span className="location-icon"><CalendarIcon /></span><div><small>Orari festival</small><strong>15 — 18 ottobre 2026</strong><p>Si parte giovedì 15 alle 18:00 con l’inaugurazione<br />Musica dal vivo e DJ set ogni sera</p></div></div><div className="location-block"><span className="location-icon"><LeafIcon /></span><div><small>Nel parco</small><strong>10.000 m² di verde</strong><p>Prato centrale, Planetario e aree relax con tavoli in legno e spazi coperti.</p></div></div><div className="arrival-note"><strong>Come arrivare</strong><p>Raggiungici a piedi dal centro o con gli autobus AMAT. Per chi arriva in auto, consigliamo il parcheggio di Piazza Castello e le aree blu in zona.</p></div></div>
            </div>
          </div>
        </section>

        <section className="faq-section" id="faq">
          <div className="page-wrap faq-layout"><div className="faq-intro reveal reveal--up"><p className="eyebrow eyebrow--amber">Le domande frequenti</p><h2>Tutto quello<br /><span>che vuoi sapere.</span></h2><p>Hai ancora un dubbio? Scrivici e ti risponderemo prima del prossimo brindisi.</p><button className="text-link text-link--amber" onClick={() => scrollTo("contatti")}>Contattaci <ArrowIcon /></button></div><div className="faq-list reveal reveal--up reveal-delay-1">{faqs.map((faq, index) => { const isOpen = openFaq === index; return <div className={`faq-item ${isOpen ? "faq-item--open" : ""}`} key={faq.question}><button className="faq-question" onClick={() => setOpenFaq(isOpen ? null : index)} aria-expanded={isOpen} aria-controls={`faq-answer-${index}`}><span>{faq.question}</span><span className="faq-plus" aria-hidden="true" /></button><div className="faq-answer" id={`faq-answer-${index}`} hidden={!isOpen}><p>{faq.answer}</p></div></div>; })}</div></div>
        </section>

        <section className="contacts-section section-cream" id="contatti">
          <div className="page-wrap">
            <div className="section-intro section-intro--split reveal reveal--up"><div><p className="eyebrow">Contatti</p><h2>Parla<br /><span>con noi.</span></h2></div><p className="section-lead">Per prenotare un tavolo o per qualsiasi informazione: scrivici una mail, seguici sui social o vieni a trovarci direttamente al parco.</p></div>
            <div className="contacts-venue reveal reveal--up reveal-delay-1">
              <img className="contacts-venue-logo" src={VILLA_LOGO_SRC} alt={VILLA_LOGO_ALT} width={280} height={280} loading="lazy" decoding="async" />
              <div className="contacts-venue-body">
                <small>Location ufficiale</small>
                <strong>Parco Villa Filippina</strong>
                <p>Il cuore verde di Palermo che ospita la Festa Della Birra: quattro serate tra alberi, luci calde e musica dal vivo.</p>
              </div>
            </div>
            <div className="contacts-grid reveal reveal--up reveal-delay-1">
              <a className="contact-card contact-card--wide" href="https://www.google.com/maps/search/?api=1&query=Piazza+San+Francesco+di+Paola+18+Palermo" target="_blank" rel="noreferrer">
                <span className="contact-icon"><PinIcon /></span>
                <div className="contact-body"><small>Indirizzo</small><strong>Piazza San Francesco di Paola, 18 — Palermo</strong><p>Parco Villa Filippina. Apri in Google Maps per le indicazioni.</p></div>
              </a>
              <a className="contact-card contact-card--email" href="mailto:parcovillafilippinaticket@gmail.com">
                <span className="contact-icon"><MailIcon /></span>
                <div className="contact-body"><small>Mail</small><strong>parcovillafilippinaticket@gmail.com</strong><p>Scrivici per informazioni, gruppi numerosi o esigenze particolari.</p></div>
              </a>
              <a className="contact-card" href="https://oktoberforst.vercel.app" target="_blank" rel="noreferrer">
                <span className="contact-icon"><GlobeIcon /></span>
                <div className="contact-body"><small>Sito ufficiale</small><strong>Festa Della Birra Palermo</strong><p>Programma completo, aggiornamenti e informazioni sul festival.</p></div>
              </a>
              <a className="contact-card" href="https://www.facebook.com/parcovillafilippina" target="_blank" rel="noreferrer">
                <span className="contact-icon"><FacebookIcon /></span>
                <div className="contact-body"><small>Facebook</small><strong>Parcovillafilippina</strong><p>Segui la pagina ufficiale per aggiornamenti, orari e novità.</p></div>
              </a>
              <a className="contact-card" href="https://www.instagram.com/parcovillafilippinapalermo" target="_blank" rel="noreferrer">
                <span className="contact-icon"><InstagramIcon /></span>
                <div className="contact-body"><small>Instagram</small><strong>Parcovillafilippinapalermo</strong><p>Foto, serate e momenti dal cuore del festival.</p></div>
              </a>
              <a className="contact-card" href="https://www.tiktok.com/@artewiva" target="_blank" rel="noreferrer">
                <span className="contact-icon"><TikTokIcon /></span>
                <div className="contact-body"><small>Tik Tok</small><strong>@artewiva</strong><p>Video, replay e sorprese in diretta dal parco.</p></div>
              </a>
            </div>
          </div>
        </section>

        <section className="closing-section"><div className="closing-pattern" /><div className="page-wrap closing-content reveal reveal--up"><img className="closing-logo" src={LOGO_SRC} alt={LOGO_ALT} width={148} height={148} loading="lazy" decoding="async" /><p className="eyebrow eyebrow--amber">Segna le date</p><h2>Palermo, ci vediamo<br /><span>al prossimo brindisi.</span></h2><p>Quattro giornate di concerti, tribute band e DJ set, con la Forst alla spina e la cucina bavarese che incontra Palermo.</p><button className="button button--amber" onClick={() => scrollTo("contatti")}>Contatti <ArrowIcon /></button><small>Ingresso gratuito • 15 — 18 ottobre 2026</small></div></section>
      </main>

      <footer className="site-footer"><div className="page-wrap"><div className="footer-top"><div className="footer-brand"><div className="footer-logo-block"><img src={LOGO_SRC} alt={LOGO_ALT} width={104} height={104} loading="lazy" decoding="async" /><div><strong>FESTA DELLA BIRRA</strong><span>Palermo • 2026</span></div></div><p>La festa della birra<br />nel cuore di Palermo.<br />15 — 18 ottobre 2026, Parco Villa Filippina.</p></div><div className="footer-links"><span className="footer-heading">Esplora</span><a href="#programma">Programma</a><a href="#location">Location</a><a href="#esperienza">Birra &amp; food</a><a href="#faq">FAQ</a><a href="#contatti">Contatti</a></div><div className="footer-links"><span className="footer-heading">Seguici</span><a href="https://www.instagram.com/parcovillafilippinapalermo" target="_blank" rel="noreferrer">Instagram <span>&#8599;</span></a><a href="https://www.facebook.com/parcovillafilippina" target="_blank" rel="noreferrer">Facebook <span>&#8599;</span></a><a href="https://www.tiktok.com/@artewiva" target="_blank" rel="noreferrer">TikTok <span>&#8599;</span></a><a href="mailto:parcovillafilippinaticket@gmail.com">Email <span>&#8599;</span></a><a href="https://oktoberforst.vercel.app" target="_blank" rel="noreferrer">Sito ufficiale <span>&#8599;</span></a></div><div className="sponsor-lockup"><span>In collaborazione con</span><SponsorLogo /><small>BIRRA ITALIANA DAL 1857</small></div></div><div className="footer-bottom"><div className="footer-bottom-text"><span>© 2026 Festa Della Birra Palermo</span><span>Privacy policy &nbsp; / &nbsp; Cookie policy</span><span>Bevi responsabilmente. Vietato ai minori di 18 anni.</span></div><img className="footer-credit-logo" src={ARTEWIVA_LOGO_SRC} alt={ARTEWIVA_LOGO_ALT} width={120} height={120} loading="lazy" decoding="async" /></div></div></footer>

    </div>
  );
}

export default App;
