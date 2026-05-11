import { supabase } from "@/lib/supabase";
import Link from "next/link";
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
    .order("event_date")
    .limit(4);
  return data || [];
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const eventTypeLabels: Record<string, string> = {
  banchetto: "Banchetto",
  riunione: "Riunione",
  serata: "Serata",
  altro: "Evento",
};

const eventTypeColors: Record<string, string> = {
  banchetto: "bg-blue-100 text-blue-800",
  riunione: "bg-amber-100 text-amber-800",
  serata: "bg-purple-100 text-purple-800",
  altro: "bg-gray-100 text-gray-800",
};

export default async function Home() {
  const [featuredNews, recentNews, municipalities, events] = await Promise.all([
    getFeaturedNews(),
    getRecentNews(),
    getMunicipalities(),
    getUpcomingEvents(),
  ]);

  return (
    <div>
      {/* Hero — Featured News */}
      {featuredNews && (
        <section className="bg-gradient-to-br from-[#1B3A6B] to-[#0f2444] text-white">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
            <Badge className="mb-4 bg-white/20 text-white hover:bg-white/30">
              In evidenza
            </Badge>
            <h1 className="max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              {featuredNews.title}
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-white/80">
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
                desc: "Lo statuto del Patto per il Nord",
                href: "https://www.pattoperilnord.it",
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
          <BrianzaMap municipalities={municipalities} />
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
                        className={eventTypeColors[event.event_type]}
                      >
                        {eventTypeLabels[event.event_type]}
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
