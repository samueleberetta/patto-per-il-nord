"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2, MapPin, Clock } from "lucide-react";
import type { Event, Municipality } from "@/lib/types";
import { useAdminContext } from "@/lib/admin-context";
import { EVENT_TYPES, eventTypeLabels } from "@/lib/event-types";
import { AddressAutocomplete } from "@/components/address-autocomplete";

const emptyForm = {
  title: "",
  description: "",
  event_type: "incontro_pubblico" as string,
  event_date: "",
  event_time: "",
  location: "",
  location_lat: null as number | null,
  location_lng: null as number | null,
  municipality_id: "",
  contact_email: "",
  contact_phone: "",
};

const typeLabels = eventTypeLabels;

export default function AdminEventiPage() {
  const { role, municipalityId } = useAdminContext();
  const isCommunal = role === "resp_comunale";

  const [events, setEvents] = useState<(Event & { municipality: Municipality | null })[]>([]);
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const supabase = createSupabaseBrowser();

  async function load() {
    let eventsQuery = supabase.from("events").select("*, municipality:municipalities(*)").order("event_date");
    if (isCommunal && municipalityId) {
      eventsQuery = eventsQuery.eq("municipality_id", municipalityId);
    }
    const [{ data: ev }, { data: muni }] = await Promise.all([
      eventsQuery,
      supabase.from("municipalities").select("*").order("name"),
    ]);
    setEvents(ev || []);
    setMunicipalities(muni || []);
  }

  useEffect(() => {
    if (role !== null) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, municipalityId]);

  function openNew() {
    setForm({
      ...emptyForm,
      municipality_id: isCommunal && municipalityId ? municipalityId : "",
    });
    setEditingId(null);
    setOpen(true);
  }

  function openEdit(event: Event) {
    setForm({
      title: event.title,
      description: event.description || "",
      event_type: event.event_type,
      event_date: event.event_date,
      event_time: event.event_time || "",
      location: event.location || "",
      location_lat: event.location_lat ?? null,
      location_lng: event.location_lng ?? null,
      municipality_id: event.municipality_id || "",
      contact_email: event.contact_email || "",
      contact_phone: event.contact_phone || "",
    });
    setEditingId(event.id);
    setOpen(true);
  }

  async function handleSave() {
    const finalMunicipalityId = isCommunal && municipalityId ? municipalityId : (form.municipality_id || null);
    const payload = {
      title: form.title,
      description: form.description || null,
      event_type: form.event_type,
      event_date: form.event_date,
      event_time: form.event_time || null,
      location: form.location || null,
      location_lat: form.location_lat,
      location_lng: form.location_lng,
      province_id: "a0000000-0000-0000-0000-000000000001",
      municipality_id: finalMunicipalityId,
      contact_email: form.contact_email || null,
      contact_phone: form.contact_phone || null,
    };

    if (editingId) {
      await supabase.from("events").update(payload).eq("id", editingId);
    } else {
      await supabase.from("events").insert(payload);
    }
    setOpen(false);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Eliminare questo evento?")) return;
    await supabase.from("events").delete().eq("id", id);
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1B3A6B]">Eventi</h1>
          <p className="text-sm text-muted-foreground">
            Gestisci banchetti, riunioni e serate
          </p>
        </div>
        <Button onClick={openNew} className="bg-[#1B3A6B] hover:bg-[#2d5aa0]">
          <Plus className="mr-2 h-4 w-4" />
          Nuovo evento
        </Button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingId ? "Modifica evento" : "Nuovo evento"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Titolo</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div>
                <Label>Descrizione</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tipo</Label>
                  <Select value={form.event_type} onValueChange={(v) => v && setForm({ ...form, event_type: v })}>
                    <SelectTrigger className="w-full">
                      <SelectValue>{eventTypeLabels[form.event_type as keyof typeof eventTypeLabels] || form.event_type}</SelectValue>
                    </SelectTrigger>
                    <SelectContent className="min-w-[var(--trigger-width)]">
                      {EVENT_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {eventTypeLabels[t]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {!isCommunal && (
                  <div>
                    <Label>Comune</Label>
                    <Select value={form.municipality_id} onValueChange={(v) => setForm({ ...form, municipality_id: v === "none" ? "" : v ?? "" })}>
                      <SelectTrigger className="w-full"><SelectValue placeholder="Provinciale" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Provinciale</SelectItem>
                        {municipalities.map((m) => (<SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {isCommunal && (
                  <div className="rounded-md bg-orange-50 border border-orange-200 px-3 py-2 text-xs text-orange-800 self-end">
                    Evento per <strong>{municipalities.find((m) => m.id === municipalityId)?.name}</strong>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Data</Label>
                  <Input type="date" value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} />
                </div>
                <div>
                  <Label>Ora</Label>
                  <Input type="time" value={form.event_time} onChange={(e) => setForm({ ...form, event_time: e.target.value })} />
                </div>
              </div>
              <div>
                <Label>Luogo</Label>
                <AddressAutocomplete
                  value={form.location}
                  onChange={(value, lat, lng) =>
                    setForm({
                      ...form,
                      location: value,
                      location_lat: lat ?? null,
                      location_lng: lng ?? null,
                    })
                  }
                  municipalityName={
                    form.municipality_id
                      ? municipalities.find((m) => m.id === form.municipality_id)?.name
                      : undefined
                  }
                />
                {form.location_lat && form.location_lng && (
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    📍 {form.location_lat.toFixed(5)}, {form.location_lng.toFixed(5)}
                  </p>
                )}
              </div>

              {/* Sezione Contatti */}
              <div className="rounded-lg border bg-muted/30 p-3 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Contatti
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Email</Label>
                    <Input
                      type="email"
                      placeholder="email@esempio.com"
                      value={form.contact_email}
                      onChange={(e) =>
                        setForm({ ...form, contact_email: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Telefono</Label>
                    <Input
                      type="tel"
                      placeholder="039 1234567"
                      value={form.contact_phone}
                      onChange={(e) =>
                        setForm({ ...form, contact_phone: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>

              <Button onClick={handleSave} className="w-full bg-[#1B3A6B] hover:bg-[#2d5aa0]">
                {editingId ? "Salva modifiche" : "Crea evento"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mt-6 space-y-3">
        {events.map((event) => (
          <Card key={event.id}>
            <CardContent className="flex items-center justify-between py-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold truncate">{event.title}</h3>
                  <Badge variant="secondary">{typeLabels[event.event_type]}</Badge>
                </div>
                <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <span>{new Date(event.event_date).toLocaleDateString("it-IT")}</span>
                  {event.event_time && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{event.event_time.slice(0, 5)}</span>}
                  {event.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{event.location}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <Button variant="ghost" size="icon" onClick={() => openEdit(event)}><Pencil className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(event.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {events.length === 0 && <p className="text-center text-muted-foreground py-8">Nessun evento.</p>}
      </div>
    </div>
  );
}
