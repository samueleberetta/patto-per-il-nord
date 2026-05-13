export const EVENT_TYPES = [
  "banchetto",
  "incontro_pubblico",
  "manifestazione",
  "cena",
  "cultura",
  "sport",
  "sociale",
  "intervento_tv",
  "associazionismo",
] as const;

export type EventType = (typeof EVENT_TYPES)[number];

export const eventTypeLabels: Record<EventType, string> = {
  banchetto: "Banchetto",
  incontro_pubblico: "Incontro pubblico",
  manifestazione: "Manifestazione",
  cena: "Cena",
  cultura: "Cultura",
  sport: "Sport",
  sociale: "Sociale",
  intervento_tv: "Intervento in TV",
  associazionismo: "Associazionismo",
};

export const eventTypeColors: Record<EventType, string> = {
  banchetto: "bg-blue-100 text-blue-800",
  incontro_pubblico: "bg-amber-100 text-amber-800",
  manifestazione: "bg-red-100 text-red-800",
  cena: "bg-orange-100 text-orange-800",
  cultura: "bg-purple-100 text-purple-800",
  sport: "bg-emerald-100 text-emerald-800",
  sociale: "bg-pink-100 text-pink-800",
  intervento_tv: "bg-indigo-100 text-indigo-800",
  associazionismo: "bg-teal-100 text-teal-800",
};

export function getEventTypeLabel(type: string): string {
  return eventTypeLabels[type as EventType] || type;
}

export function getEventTypeColor(type: string): string {
  return eventTypeColors[type as EventType] || "bg-gray-100 text-gray-800";
}
