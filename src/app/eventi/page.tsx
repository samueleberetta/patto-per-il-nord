"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Clock, Calendar } from "lucide-react";
import type { Event, Municipality } from "@/lib/types";

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

type EventWithMunicipality = Event & { municipality: Municipality | null };

export default function EventiPage() {
  const [events, setEvents] = useState<EventWithMunicipality[]>([]);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("events")
        .select("*, municipality:municipalities(*)")
        .gte("event_date", new Date().toISOString().split("T")[0])
        .order("event_date");
      setEvents(data || []);
    }
    load();
  }, []);

  const filtered = events.filter((e) => {
    const matchSearch =
      !search ||
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.location?.toLowerCase().includes(search.toLowerCase()) ||
      e.municipality?.name.toLowerCase().includes(search.toLowerCase());
    const matchDate = !dateFilter || e.event_date === dateFilter;
    return matchSearch && matchDate;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-[#1B3A6B]">Eventi</h1>
      <p className="mt-2 text-muted-foreground">
        Banchetti, riunioni e serate sul territorio
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cerca per comune o luogo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="w-auto"
        />
      </div>

      <div className="mt-8 space-y-4">
        {filtered.map((event) => (
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
                  <h3 className="font-semibold">{event.title}</h3>
                  <Badge
                    variant="secondary"
                    className={eventTypeColors[event.event_type]}
                  >
                    {eventTypeLabels[event.event_type]}
                  </Badge>
                </div>
                {event.description && (
                  <p className="mt-1 text-sm text-muted-foreground">
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

      {filtered.length === 0 && (
        <p className="mt-12 text-center text-muted-foreground">
          Nessun evento trovato.
        </p>
      )}
    </div>
  );
}
