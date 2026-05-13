import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { ComuniList } from "@/components/comuni-list";
import { BrianzaMap } from "@/components/map/BrianzaMap";
import { EventiCarousel } from "@/components/eventi-carousel";
import type { Municipality, Event } from "@/lib/types";
import { Calendar, ArrowRight } from "lucide-react";

export const revalidate = 60;

export default async function ComuniPage() {
  const today = new Date().toISOString().split("T")[0];

  const [{ data: muniData }, { data: eventsData }] = await Promise.all([
    supabase.from("municipalities").select("*").order("name"),
    supabase
      .from("events")
      .select("*, municipality:municipalities(*)")
      .gte("event_date", today)
      .order("event_date"),
  ]);

  const municipalities: Municipality[] = muniData || [];
  const events: (Event & { municipality: Municipality | null })[] =
    (eventsData as (Event & { municipality: Municipality | null })[]) || [];
  const sediCount = municipalities.filter((m) => m.has_sede).length;

  // Build map of municipality_id -> count of upcoming events
  const upcomingEventsByMunicipality: Record<string, number> = {};
  for (const ev of events) {
    if (ev.municipality_id) {
      upcomingEventsByMunicipality[ev.municipality_id] =
        (upcomingEventsByMunicipality[ev.municipality_id] ?? 0) + 1;
    }
  }

  return (
    <div>
      {/* Hero */}
      <section className="bg-[#1B3A6B] text-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold sm:text-4xl">
            I nostri comuni
          </h1>
          <p className="mt-3 text-lg text-white/80 max-w-2xl">
            Il Patto per il Nord è presente nella provincia di Monza e Brianza con {sediCount} {sediCount === 1 ? "sede" : "sedi"} su {municipalities.length} comuni.
          </p>
        </div>
      </section>

      {/* Mappa */}
      <section className="bg-white border-b">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <BrianzaMap
            municipalities={municipalities}
            upcomingEventsByMunicipality={upcomingEventsByMunicipality}
          />
        </div>
      </section>

      {/* Eventi della provincia - carosello */}
      <section className="bg-gradient-to-b from-white to-muted/30 border-b">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-[#1B3A6B]" />
                <h2 className="text-2xl font-bold text-[#1B3A6B]">
                  Eventi della provincia
                </h2>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Tutti gli eventi in programma nei comuni di Monza e Brianza
              </p>
            </div>
            <Link
              href="/eventi"
              className="inline-flex items-center gap-1 text-sm font-medium text-[#1B3A6B] hover:underline"
            >
              Tutti gli eventi
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <EventiCarousel events={events} />
        </div>
      </section>

      {/* Lista comuni */}
      <section className="bg-muted/50">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <ComuniList municipalities={municipalities} />
        </div>
      </section>
    </div>
  );
}
