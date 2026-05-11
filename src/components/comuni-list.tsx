"use client";

import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, ChevronDown, ChevronUp, Building2, Star } from "lucide-react";
import type { Municipality } from "@/lib/types";

interface Props {
  municipalities: Municipality[];
}

export function ComuniList({ municipalities }: Props) {
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);

  const featured = municipalities.filter((m) => m.featured);
  const others = municipalities.filter((m) => !m.featured);

  const isSearching = search.length > 0;

  const filteredFeatured = featured.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );
  const filteredOthers = others.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  const visibleOthers = isSearching || showAll ? filteredOthers : [];

  return (
    <div>
      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Cerca un comune..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Comuni in evidenza */}
      {filteredFeatured.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-4">
            <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
            <h3 className="text-lg font-semibold text-[#1B3A6B]">
              Comuni in evidenza
            </h3>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredFeatured.map((m) => (
              <Link
                key={m.id}
                href={`/comuni/${m.slug}`}
                className="group flex items-center gap-3 rounded-xl border-2 border-[#1B3A6B]/20 bg-white p-4 transition-all hover:shadow-md hover:border-[#1B3A6B]/50 hover:-translate-y-0.5"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1B3A6B]/10 group-hover:bg-[#1B3A6B]/20 transition-colors">
                  <MapPin className="h-5 w-5 text-[#1B3A6B]" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-[#1B3A6B]">{m.name}</p>
                  {m.has_sede && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      Sede attiva
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Bottone per mostrare tutti */}
      {!isSearching && !showAll && others.length > 0 && (
        <div className="mt-8">
          <div className="rounded-xl border bg-white/60 p-6 text-center">
            <MapPin className="mx-auto h-8 w-8 text-muted-foreground/30" />
            <p className="mt-2 text-sm text-muted-foreground">
              Altri {others.length} comuni della provincia
            </p>
            <p className="mt-1 text-xs text-muted-foreground/70">
              Cerca un comune o visualizza l&apos;elenco completo
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => setShowAll(true)}
            >
              <ChevronDown className="mr-1.5 h-4 w-4" />
              Mostra tutti i comuni
            </Button>
          </div>
        </div>
      )}

      {/* Lista altri comuni */}
      {visibleOthers.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              {isSearching ? "Risultati" : "Tutti i comuni"} ({filteredOthers.length})
            </h3>
            {showAll && !isSearching && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground"
                onClick={() => setShowAll(false)}
              >
                <ChevronUp className="mr-1 h-3 w-3" />
                Nascondi
              </Button>
            )}
          </div>
          <div className="grid gap-1.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {visibleOthers.map((m) => (
              <Link
                key={m.id}
                href={`/comuni/${m.slug}`}
                className="flex items-center gap-2 rounded-lg border bg-white px-3 py-2.5 text-sm transition-all hover:shadow-sm hover:border-[#1B3A6B]/30"
              >
                <MapPin className={`h-3.5 w-3.5 shrink-0 ${m.has_sede ? "text-[#1B3A6B]" : "text-muted-foreground/30"}`} />
                <span>{m.name}</span>
                {m.has_sede && (
                  <Badge variant="secondary" className="ml-auto text-[10px] bg-[#1B3A6B]/10 text-[#1B3A6B] px-1.5 py-0">
                    Sede
                  </Badge>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

      {isSearching && filteredFeatured.length === 0 && filteredOthers.length === 0 && (
        <p className="mt-8 text-center text-sm text-muted-foreground">
          Nessun comune trovato per &ldquo;{search}&rdquo;
        </p>
      )}
    </div>
  );
}
