import { supabase } from "@/lib/supabase";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  MapPin,
  ExternalLink,
  FileText,
  Shield,
  BookOpen,
  Scale,
  ArrowRight,
  Clock,
} from "lucide-react";
import { BrianzaMap } from "@/components/map/BrianzaMap";
import { ComuniList } from "@/components/comuni-list";
import { getEventTypeLabel, getEventTypeColor } from "@/lib/event-types";
import type { NewsArticle, Event, Municipality } from "@/lib/types";

export const revalidate = 60;

async function getFeaturedNews(): Promise<NewsArticle | null> {
  const { data } = await supabase
    .from("news")
    .select("*")
    .eq("featured", true)
    .order("published_at", { ascending: false })
    .limit(1)
    .single();
  return data;
}

async function getRecentNews(): Promise<NewsArticle[]> {
  const { data } = await supabase
    .from("news")
    .select("*")
    .eq("featured", false)
    .order("published_at", { ascending: false })
    .limit(3);
  return data || [];
}

async function getMunicipalities(): Promise<Municipality[]> {
  const { data } = await supabase
    .from("municipalities")
    .select("*")
    .order("name");
  return data || [];
}

async function getUpcomingEvents(): Promise<(Event & { municipality: Municipality | null })[]> {
  const { data } = await supabase
    .from("events")
    .select("*, municipality:municipalities(*)")
    .gte("event_date", new Date().toISOString().split("T")[0])
    .order("event_date");
  return data || [];
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function Home() {
  const [featuredNews, recentNews, municipalities, events] = await Promise.all([
    getFeaturedNews(),
    getRecentNews(),
    getMunicipalities(),
    getUpcomingEvents(),
  ]);

  // Build map of municipality_id -> count of upcoming events for tooltip
  const upcomingEventsByMunicipality: Record<string, number> = {};
  for (const ev of events) {
    if (ev.municipality_id) {
      upcomingEventsByMunicipality[ev.municipality_id] =
        (upcomingEventsByMunicipality[ev.municipality_id] ?? 0) + 1;
    }
  }

  return (
    <div>
      {/* Hero — Impactful with logo */}
      <section className="relative overflow-hidden bg-[#0a1d3d] text-white min-h-[75vh] flex items-center">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a1d3d] via-[#1B3A6B] to-[#0a1d3d]" />

        {/* Blurred landscape silhouette (Brianza/Lombardia hills) */}
        <div className="absolute inset-0 opacity-50">
          <svg
            className="absolute bottom-0 w-full h-full"
            viewBox="0 0 1440 600"
            preserveAspectRatio="xMidYMax slice"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <filter id="hero-blur" x="-10%" y="-10%" width="120%" height="120%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="25" />
              </filter>
              <linearGradient id="hill-gradient-1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6b9dd8" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#1B3A6B" stopOpacity="0.95" />
              </linearGradient>
              <linearGradient id="hill-gradient-2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7badd8" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#1B3A6B" stopOpacity="0.8" />
              </linearGradient>
            </defs>
            {/* Distant alps - very blurred */}
            <path
              d="M0,380 L100,260 L180,310 L260,220 L340,290 L420,240 L520,300 L620,250 L720,310 L820,260 L920,290 L1020,230 L1120,280 L1220,250 L1320,300 L1440,270 L1440,600 L0,600 Z"
              fill="url(#hill-gradient-2)"
              filter="url(#hero-blur)"
            />
            {/* Mid hills */}
            <path
              d="M0,450 Q200,360 380,400 T720,380 Q900,340 1080,390 T1440,380 L1440,600 L0,600 Z"
              fill="url(#hill-gradient-1)"
              filter="url(#hero-blur)"
            />
            {/* Foreground hills */}
            <path
              d="M0,520 Q180,470 360,490 T720,480 Q900,450 1080,480 T1440,490 L1440,600 L0,600 Z"
              fill="#0a1d3d"
              opacity="0.8"
              filter="url(#hero-blur)"
            />
          </svg>
        </div>

        {/* Decorative blurred circles for depth */}
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-[#4a7bb8] opacity-25 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-[#2d5aa0] opacity-25 blur-3xl" />

        {/* Decorative keywords - background text */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 hidden lg:flex items-center justify-between overflow-hidden select-none"
        >
          <div className="flex flex-col gap-8 text-7xl font-black tracking-tight text-white/5 -ml-8">
            <span>TRADIZIONE</span>
            <span>TERRITORIO</span>
            <span>LIBERTÀ</span>
          </div>
          <div className="flex flex-col gap-8 text-7xl font-black tracking-tight text-white/5 -mr-8 text-right">
            <span>IDENTITÀ</span>
            <span>FUTURO</span>
            <span>NORD</span>
          </div>
        </div>

        {/* Vignette overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a1d3d]/70 via-transparent to-[#0a1d3d]/20" />

        {/* Content - 2 column layout */}
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24 w-full">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            {/* Logo - left side */}
            <div className="flex justify-center lg:justify-start order-1">
              <div className="relative flex h-56 w-56 items-center justify-center sm:h-72 sm:w-72 lg:h-96 lg:w-96">
                {/* Glow effect */}
                <div className="absolute inset-0 rounded-full bg-white/20 blur-2xl" />
                <div className="absolute inset-4 rounded-full bg-blue-400/20 blur-xl" />
                {/* Logo container */}
                <div className="relative flex h-full w-full items-center justify-center rounded-full bg-white shadow-2xl ring-4 ring-white/30">
                  <Image
                    src="/logo-ppn.png"
                    alt="Patto per il Nord"
                    width={400}
                    height={400}
                    className="h-full w-full object-contain p-3"
                    priority
                  />
                </div>
              </div>
            </div>

            {/* Text - right side */}
            <div className="text-center lg:text-left order-2">
              {/* Title */}
              <h1 className="text-5xl font-black tracking-tight sm:text-6xl lg:text-7xl xl:text-8xl">
                <span className="block">PATTO PER</span>
                <span className="block bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
                  IL NORD
                </span>
              </h1>

              {/* Subtitle */}
              <div className="mt-6 flex items-center justify-center gap-3 lg:justify-start">
                <div className="h-px w-12 bg-white/40" />
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/80 sm:text-base">
                  Provincia di Monza e Brianza
                </p>
                <div className="h-px w-12 bg-white/40 lg:hidden" />
              </div>

              {/* Tagline */}
              <p className="mt-8 max-w-xl text-lg text-white/80 sm:text-xl mx-auto lg:mx-0">
                Per l&apos;autonomia, l&apos;identità regionale e la sovranità
                delle terre del Nord. Il movimento confederale dei popoli
                lombardi e padani.
              </p>

              {/* CTAs */}
              <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:gap-4 lg:items-start lg:justify-start justify-center">
                <Link
                  href="/comuni"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-[#1B3A6B] shadow-lg transition-all hover:bg-white/90 hover:shadow-xl hover:scale-105"
                >
                  Scopri i nostri comuni
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/organigramma"
                  className="inline-flex items-center gap-2 rounded-full border-2 border-white/40 bg-white/5 px-8 py-3.5 text-sm font-semibold text-white backdrop-blur transition-all hover:bg-white/10 hover:border-white/60"
                >
                  Conosci la squadra
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#0a1d3d] to-transparent pointer-events-none" />
      </section>

      {/* Featured News - moved below hero */}
      {featuredNews && (
        <section className="bg-gradient-to-br from-[#1B3A6B] to-[#0f2444] text-white">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px flex-1 max-w-12 bg-white/40" />
              <Badge className="bg-white/20 text-white hover:bg-white/30 uppercase tracking-wider text-xs">
                Le news della Provincia di Monza e Brianza
              </Badge>
              <div className="h-px flex-1 bg-white/40" />
            </div>
            <h2 className="max-w-3xl text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
              {featuredNews.title}
            </h2>
            <p className="mt-4 max-w-2xl text-base text-white/80 sm:text-lg">
              {featuredNews.excerpt}
            </p>
            <div className="mt-6 flex items-center gap-4">
              <span className="text-sm text-white/60">
                {formatDate(featuredNews.published_at)}
              </span>
              <Link
                href={`/news/${featuredNews.slug}`}
                className="inline-flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-medium text-[#1B3A6B] transition-colors hover:bg-white/90"
              >
                Leggi di più
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Recent News */}
      {recentNews.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-[#1B3A6B]">Ultime notizie</h2>
            <Link
              href="/news"
              className="text-sm font-medium text-[#1B3A6B] hover:underline"
            >
              Tutte le news →
            </Link>
          </div>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recentNews.map((article) => (
              <Link key={article.id} href={`/news/${article.slug}`}>
                <Card className="h-full transition-shadow hover:shadow-md">
                  <CardHeader>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(article.published_at)}
                    </p>
                    <CardTitle className="text-lg leading-snug">
                      {article.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {article.excerpt}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Institutional Links */}
      <section className="bg-muted/50">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold text-[#1B3A6B]">
            Documenti e Trasparenza
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Scale,
                title: "Statuto",
                desc: "Atto costitutivo del 31 luglio 2024",
                href: "/statuto-ppn.pdf",
              },
              {
                icon: FileText,
                title: "Regolamenti",
                desc: "I regolamenti del movimento",
                href: "https://www.pattoperilnord.it",
              },
              {
                icon: Shield,
                title: "Trasparenza",
                desc: "Sezione trasparenza",
                href: "https://www.pattoperilnord.it",
              },
              {
                icon: BookOpen,
                title: "Linee Programmatiche",
                desc: "Il nostro programma",
                href: "https://www.pattoperilnord.it",
              },
            ].map((item) => (
              <a
                key={item.title}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group"
              >
                <Card className="h-full transition-all group-hover:shadow-md group-hover:border-[#1B3A6B]/30">
                  <CardContent className="flex items-start gap-4 pt-6">
                    <div className="rounded-lg bg-[#1B3A6B]/10 p-2.5">
                      <item.icon className="h-5 w-5 text-[#1B3A6B]" />
                    </div>
                    <div>
                      <p className="font-semibold text-[#1B3A6B] group-hover:underline">
                        {item.title}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {item.desc}
                      </p>
                    </div>
                    <ExternalLink className="ml-auto h-4 w-4 shrink-0 text-muted-foreground/50" />
                  </CardContent>
                </Card>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Map */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="text-center text-2xl font-bold text-[#1B3A6B]">
          Il territorio
        </h2>
        <p className="mt-2 text-center text-muted-foreground">
          Clicca su un comune per scoprire la sezione locale
        </p>
        <div className="mt-8">
          <BrianzaMap
            municipalities={municipalities}
            upcomingEventsByMunicipality={upcomingEventsByMunicipality}
          />
        </div>
      </section>

      {/* Comuni List */}
      <section className="bg-muted/50">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-[#1B3A6B]">Tutti i comuni</h2>
          <p className="mt-2 text-muted-foreground">
            Cerca un comune della provincia di Monza e Brianza
          </p>
          <div className="mt-6">
            <ComuniList municipalities={municipalities} />
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-[#1B3A6B]">Prossimi eventi</h2>
          <Link
            href="/eventi"
            className="text-sm font-medium text-[#1B3A6B] hover:underline"
          >
            Tutti gli eventi →
          </Link>
        </div>
        {events.length > 0 ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {events.map((event) => (
              <Card key={event.id} className="transition-shadow hover:shadow-md">
                <CardContent className="flex gap-4 pt-6">
                  <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-lg bg-[#1B3A6B] text-white">
                    <span className="text-lg font-bold leading-none">
                      {new Date(event.event_date).getDate()}
                    </span>
                    <span className="text-[10px] uppercase">
                      {new Date(event.event_date).toLocaleDateString("it-IT", {
                        month: "short",
                      })}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold truncate">{event.title}</h3>
                      <Badge
                        variant="secondary"
                        className={getEventTypeColor(event.event_type)}
                      >
                        {getEventTypeLabel(event.event_type)}
                      </Badge>
                    </div>
                    {event.description && (
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                        {event.description}
                      </p>
                    )}
                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                      {event.location && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {event.location}
                        </span>
                      )}
                      {event.event_time && (
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {event.event_time.slice(0, 5)}
                        </span>
                      )}
                      {event.municipality && (
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {event.municipality.name}
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="mt-6 text-center text-muted-foreground">
            Nessun evento in programma al momento.
          </p>
        )}
      </section>
    </div>
  );
}
