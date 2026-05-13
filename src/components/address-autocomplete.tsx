"use client";

import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { MapPin, Loader2, Search } from "lucide-react";

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    road?: string;
    house_number?: string;
    city?: string;
    town?: string;
    village?: string;
    postcode?: string;
  };
}

interface Props {
  value: string;
  onChange: (value: string, lat?: number, lng?: number) => void;
  municipalityName?: string;
  placeholder?: string;
}

export function AddressAutocomplete({
  value,
  onChange,
  municipalityName,
  placeholder,
}: Props) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Keep input value in sync if parent changes
  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Close dropdown on outside click
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  // Search Nominatim with debounce
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query || query.trim().length < 3) {
      setResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        // Build search: query + comune (if selected) to bias results
        const searchText = municipalityName
          ? `${query}, ${municipalityName}, Lombardia, Italia`
          : `${query}, Brianza, Lombardia, Italia`;
        const params = new URLSearchParams({
          q: searchText,
          format: "json",
          addressdetails: "1",
          limit: "6",
          countrycodes: "it",
        });
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?${params.toString()}`,
          {
            headers: {
              "Accept-Language": "it",
            },
          }
        );
        if (res.ok) {
          const data: NominatimResult[] = await res.json();
          setResults(data);
        }
      } catch (err) {
        console.error("Address search failed", err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, municipalityName]);

  function selectResult(r: NominatimResult) {
    // Build a clean readable address
    const addr = r.address || {};
    const street = [addr.road, addr.house_number].filter(Boolean).join(" ");
    const city = addr.city || addr.town || addr.village || "";
    const formatted = street && city ? `${street}, ${city}` : r.display_name;

    setQuery(formatted);
    onChange(formatted, parseFloat(r.lat), parseFloat(r.lon));
    setOpen(false);
    setResults([]);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newValue = e.target.value;
    setQuery(newValue);
    onChange(newValue);
    setOpen(true);
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <Input
          value={query}
          onChange={handleInputChange}
          onFocus={() => setOpen(true)}
          placeholder={
            placeholder ||
            (municipalityName
              ? `Cerca via, piazza, luogo in ${municipalityName}...`
              : "Cerca un indirizzo...")
          }
          className="pl-8 pr-8"
          autoComplete="off"
        />
        {loading && (
          <Loader2 className="absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
      </div>

      {open && (results.length > 0 || query.length >= 3) && (
        <div className="absolute z-50 mt-1 w-full max-h-72 overflow-y-auto rounded-md border bg-white shadow-lg">
          {results.length === 0 && !loading && (
            <div className="px-3 py-2.5 text-xs text-muted-foreground">
              Nessun risultato. Continua a digitare...
            </div>
          )}
          {results.map((r) => {
            const addr = r.address || {};
            const street = [addr.road, addr.house_number]
              .filter(Boolean)
              .join(" ");
            const city = addr.city || addr.town || addr.village || "";
            const primary = street || r.display_name.split(",")[0];
            const secondary = [city, addr.postcode]
              .filter(Boolean)
              .join(" • ");
            return (
              <button
                key={r.place_id}
                type="button"
                onClick={() => selectResult(r)}
                className="flex w-full items-start gap-2 px-3 py-2 text-left hover:bg-muted/60 border-b last:border-b-0"
              >
                <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0 text-[#1B3A6B]" />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{primary}</p>
                  {secondary && (
                    <p className="text-xs text-muted-foreground truncate">
                      {secondary}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
          <div className="px-3 py-1.5 text-[10px] text-muted-foreground bg-muted/30 border-t">
            Risultati da OpenStreetMap
          </div>
        </div>
      )}
    </div>
  );
}
