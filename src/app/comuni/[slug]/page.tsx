import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Mail, MapPin, Clock, Calendar } from "lucide-react";

export const revalidate = 60;

export default async function ComunePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const { data: municipality } = await supabase
    .from("municipalities")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!municipality) notFound();

  const [{ data: news }, { data: events }, { data: roles }] = await Promise.all([
    supabase
      .from("news")
      .select("*")
      .eq("municipality_id", municipality.id)
      .order("published_at", { ascending: false })
      .limit(5),
    supabase
      .from("events")
      .select("*")
      .eq("municipality_id", municipality.id)
      .gte("event_date", new Date().toISOString().split("T")[0])
      .order("event_date")
      .limit(5),
    supabase
      .from("roles")
      .select("*")
      .eq("municipality_id", municipality.id)
      .order("display_order"),
  ]);

  const eventTypeLabels: Record<string, string> = {
    banchetto: "Banchetto",
    riunione: "Riunione",
    serata: "Serata",
    altro: "Evento",
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        href="/comuni"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-[#1B3A6B]"
      >
        <ArrowLeft className="h-4 w-4" />
        Tutti i comuni
      </Link>

      <div className="mt-6">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-[#1B3A6B]">
            {municipality.name}
          </h1>
          {municipality.has_sede && (
            <Badge className="bg-[#1B3A6B]">Sede attiva</Badge>
          )}
        </div>
        {(municipality.contact_email || municipality.contact_phone) && (
          <div className="mt-2 flex gap-4 text-sm text-muted-foreground">
            {municipality.contact_email && (
              <a href={`mailto:${municipality.contact_email}`} className="hover:text-[#1B3A6B]">
                {municipality.contact_email}
              </a>
            )}
            {municipality.contact_phone && (
              <span>{municipality.contact_phone}</span>
            )}
          </div>
        )}
      </div>

      {/* Referenti */}
      {roles && roles.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-bold text-[#1B3A6B]">Referenti</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {roles.map((role) => {
              const initials = role.person_name
                .split(" ")
                .map((n: string) => n[0])
                .join("")
                .slice(0, 2);
              return (
                <Card key={role.id}>
                  <CardContent className="flex items-center gap-4 pt-6">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={role.photo_url || undefined} />
                      <AvatarFallback className="bg-[#1B3A6B]/10 text-[#1B3A6B]">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {role.role_title}
                      </p>
                      <p className="font-semibold">{role.person_name}</p>
                      {role.email && (
                        <a
                          href={`mailto:${role.email}`}
                          className="inline-flex items-center gap-1 text-xs text-[#1B3A6B] hover:underline"
                        >
                          <Mail className="h-3 w-3" />
                          {role.email}
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* News locali */}
      <section className="mt-10">
        <h2 className="text-xl font-bold text-[#1B3A6B]">
          News da {municipality.name}
        </h2>
        {news && news.length > 0 ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {news.map((article) => (
              <Link key={article.id} href={`/news/${article.slug}`}>
                <Card className="h-full transition-shadow hover:shadow-md">
                  <CardHeader>
                    <p className="text-xs text-muted-foreground">
                      {new Date(article.published_at).toLocaleDateString("it-IT", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                    <CardTitle className="text-base">{article.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {article.excerpt}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">
            Nessuna news per {municipality.name} al momento.
          </p>
        )}
      </section>

      {/* Eventi locali */}
      <section className="mt-10">
        <h2 className="text-xl font-bold text-[#1B3A6B]">
          Prossimi eventi a {municipality.name}
        </h2>
        {events && events.length > 0 ? (
          <div className="mt-4 space-y-3">
            {events.map((event) => (
              <Card key={event.id}>
                <CardContent className="flex gap-4 pt-6">
                  <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg bg-[#1B3A6B] text-white">
                    <span className="text-base font-bold leading-none">
                      {new Date(event.event_date).getDate()}
                    </span>
                    <span className="text-[9px] uppercase">
                      {new Date(event.event_date).toLocaleDateString("it-IT", {
                        month: "short",
                      })}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold">{event.title}</h3>
                    <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
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
                      <Badge variant="secondary" className="text-[10px]">
                        {eventTypeLabels[event.event_type]}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">
            Nessun evento in programma a {municipality.name}.
          </p>
        )}
      </section>

      {/* CTA se non c'è sede */}
      {!municipality.has_sede && (
        <section className="mt-12 rounded-xl bg-gradient-to-br from-[#1B3A6B] to-[#2d5aa0] p-8 text-center text-white">
          <h2 className="text-2xl font-bold">
            Aiutaci ad aiutare {municipality.name}!
          </h2>
          <p className="mt-2 text-white/80">
            Non c&apos;è ancora una sede PPN a {municipality.name}. Vuoi aprirne
            una? Contattaci!
          </p>
          <p className="mt-4 text-lg font-semibold">info@ppnbrianza.it</p>
        </section>
      )}
    </div>
  );
}
