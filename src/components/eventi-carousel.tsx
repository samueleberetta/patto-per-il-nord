"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  MapPin,
  Clock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { Event, Municipality } from "@/lib/types";
import { getEventTypeLabel, getEventTypeColor } from "@/lib/event-types";

interface Props {
  events: (Event & { municipality: Municipality | null })[];
}

const monthShort = ["GEN", "FEB", "MAR", "APR", "MAG", "GIU", "LUG", "AGO", "SET", "OTT", "NOV", "DIC"];

export function EventiCarousel({ events }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  function updateScrollState() {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 5);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 5);
  }

  useEffect(() => {
    updateScrollState();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [events]);

  function scrollBy(direction: "left" | "right") {
    const el = scrollRef.current;
    if (!el) return;
    const amount = Math.min(el.clientWidth * 0.85, 600);
    el.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" });
  }

  if (events.length === 0) {
    return (
      <div className="rounded-xl border bg-muted/30 p-10 text-center">
        <Calendar className="mx-auto h-10 w-10 text-muted-foreground/30" />
        <p className="mt-3 text-muted-foreground">
          Nessun evento in programma al momento.
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Scroll buttons */}
      {canScrollLeft && (
        <Button
          variant="outline"
          size="icon"
          onClick={() => scrollBy("left")}
          className="absolute left-0 top-1/2 z-10 -translate-y-1/2 -translate-x-2 rounded-full bg-white shadow-md h-10 w-10 hidden md:flex"
          aria-label="Eventi precedenti"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
      )}
      {canScrollRight && (
        <Button
          variant="outline"
          size="icon"
          onClick={() => scrollBy("right")}
          className="absolute right-0 top-1/2 z-10 -translate-y-1/2 translate-x-2 rounded-full bg-white shadow-md h-10 w-10 hidden md:flex"
          aria-label="Eventi successivi"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      )}

      {/* Cards scrollable container */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4 -mx-1 px-1 scrollbar-thin"
        style={{ scrollbarWidth: "thin" }}
      >
        {events.map((event) => {
          const date = new Date(event.event_date);
          return (
            <Link
              key={event.id}
              href={`/eventi`}
              className="group flex-shrink-0 w-[280px] sm:w-[320px] snap-start"
            >
              <div className="h-full rounded-xl border-2 border-transparent bg-white p-5 shadow-sm transition-all hover:border-[#1B3A6B]/30 hover:shadow-md hover:-translate-y-0.5">
                {/* Date badge */}
                <div className="flex items-start gap-4">
                  <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-xl bg-gradient-to-br from-[#1B3A6B] to-[#2d5aa0] text-white shadow">
                    <span className="text-2xl font-black leading-none">
                      {date.getDate()}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider mt-0.5">
                      {monthShort[date.getMonth()]}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <Badge
                      variant="secondary"
                      className={`${getEventTypeColor(event.event_type)} text-[10px] mb-1`}
                    >
                      {getEventTypeLabel(event.event_type)}
                    </Badge>
                    <h3 className="font-semibold text-[#1B3A6B] line-clamp-2 leading-tight">
                      {event.title}
                    </h3>
                  </div>
                </div>

                {/* Description */}
                {event.description && (
                  <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
                    {event.description}
                  </p>
                )}

                {/* Meta info */}
                <div className="mt-4 space-y-1.5 border-t pt-3">
                  {event.municipality && (
                    <p className="flex items-center gap-1.5 text-xs text-foreground/70">
                      <MapPin className="h-3 w-3 text-[#1B3A6B] shrink-0" />
                      <span className="font-medium">{event.municipality.name}</span>
                    </p>
                  )}
                  {event.location && (
                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3 shrink-0" />
                      <span className="truncate">{event.location}</span>
                    </p>
                  )}
                  {event.event_time && (
                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 shrink-0" />
                      {event.event_time.slice(0, 5)}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
