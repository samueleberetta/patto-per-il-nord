"use client";

import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { MapPin, Loader2, Search } from "lucide-react";

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type?: string;
  class?: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    county?: string;
    state?: string;
    country?: string;
    country_code?: string;
  };
}

interface Props {
  value: string;
  onChange: (placeName: string) => void;
  /**
   * If "italy" only Italian cities. If "world" any country.
   */
  scope?: "italy" | "world";
  placeholder?: string;
}

export function PlaceAutocomplete({
  value,
  onChange,
  scope = "italy",
  placeholder,
}: Props) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

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

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query || query.trim().length < 2) {
      setResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          q: query,
          format: "json",
          addressdetails: "1",
          limit: "8",
          featuretype: "settlement",
        });
        if (scope === "italy") {
          params.set("countrycodes", "it");
        }
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?${params.toString()}`,
          { headers: { "Accept-Language": "it" } }
        );
        if (res.ok) {
          const data: NominatimResult[] = await res.json();
          // Keep only cities/towns/villages/municipalities
          const filtered = data.filter((r) => {
            const a = r.address || {};
            return a.city || a.town || a.village || a.municipality;
          });
          setResults(filtered);
        }
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, scope]);

  function selectResult(r: NominatimResult) {
    const a = r.address || {};
    const city = a.city || a.town || a.village || a.municipality || "";
    const province = a.county || a.state || "";
    const country =
      a.country_code?.toUpperCase() === "IT" ? "" : a.country || "";
    // Build display: "Lissone (MB)" for italian, "Paris (Île-de-France, France)" for foreign
    let formatted = city;
    if (province && a.country_code?.toUpperCase() === "IT") {
      formatted = `${city} (${province})`;
    } else if (country) {
      formatted = `${city}${province ? `, ${province}` : ""}, ${country}`;
    }
    setQuery(formatted);
    onChange(formatted);
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
            (scope === "italy" ? "Cerca un comune..." : "Cerca uno stato...")
          }
          className="pl-8 pr-8"
          autoComplete="off"
        />
        {loading && (
          <Loader2 className="absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
      </div>

      {open && (results.length > 0 || query.length >= 2) && (
        <div className="absolute z-50 mt-1 w-full max-h-60 overflow-y-auto rounded-md border bg-white shadow-lg">
          {results.length === 0 && !loading && (
            <div className="px-3 py-2 text-xs text-muted-foreground">
              Continua a digitare...
            </div>
          )}
          {results.map((r) => {
            const a = r.address || {};
            const city =
              a.city || a.town || a.village || a.municipality || "";
            const subtitle = [a.county || a.state, a.country]
              .filter(Boolean)
              .join(", ");
            return (
              <button
                key={r.place_id}
                type="button"
                onClick={() => selectResult(r)}
                className="flex w-full items-start gap-2 px-3 py-2 text-left hover:bg-muted/60 border-b last:border-b-0"
              >
                <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0 text-[#1B3A6B]" />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{city}</p>
                  {subtitle && (
                    <p className="text-xs text-muted-foreground truncate">
                      {subtitle}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface CountryProps {
  value: string;
  onChange: (countryName: string) => void;
}

export function CountryAutocomplete({ value, onChange }: CountryProps) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

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

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query || query.trim().length < 2) {
      setResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          q: query,
          format: "json",
          addressdetails: "1",
          limit: "8",
          featuretype: "country",
        });
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?${params.toString()}`,
          { headers: { "Accept-Language": "it" } }
        );
        if (res.ok) {
          const data: NominatimResult[] = await res.json();
          const filtered = data.filter(
            (r) => r.address?.country && !r.address?.city
          );
          setResults(filtered);
        }
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  function selectResult(r: NominatimResult) {
    const country = r.address?.country || r.display_name;
    setQuery(country);
    onChange(country);
    setOpen(false);
    setResults([]);
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            onChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Cerca uno stato (es. Francia, Romania...)"
          className="pl-8 pr-8"
          autoComplete="off"
        />
        {loading && (
          <Loader2 className="absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
      </div>

      {open && results.length > 0 && (
        <div className="absolute z-50 mt-1 w-full max-h-60 overflow-y-auto rounded-md border bg-white shadow-lg">
          {results.map((r) => (
            <button
              key={r.place_id}
              type="button"
              onClick={() => selectResult(r)}
              className="flex w-full items-start gap-2 px-3 py-2 text-left hover:bg-muted/60 border-b last:border-b-0"
            >
              <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0 text-[#1B3A6B]" />
              <p className="text-sm font-medium truncate">
                {r.address?.country}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
