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

const emptyForm = {
  title: "",
  description: "",
  event_type: "altro" as string,
  event_date: "",
  event_time: "",
  location: "",
  municipality_id: "",
};

const typeLabels: Record<string, string> = {
  banchetto: "Banchetto",
  riunione: "Riunione",
  serata: "Serata",
  altro: "Altro",
};

export default function AdminEventiPage() {
  const [events, setEvents] = useState<(Event & { municipality: Municipality | null })[]>([]);
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const supabase = createSupabaseBrowser();

  async function load() {
    const [{ data: ev }, { data: muni }] = await Promise.all([
      supabase.from("events").select("*, municipality:municipalities(*)").order("event_date"),
      supabase.from("municipalities").select("*").order("name"),
    ]);
    setEvents(ev || []);
    setMunicipalities(muni || []);
  }

  useEffect(() => { load(); }, []);

  function openNew() {
    setForm(emptyForm);
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
      municipality_id: event.municipality_id || "",
    });
    setEditingId(event.id);
    setOpen(true);
  }

  async function handleSave() {
    const payload = {
      title: form.title,
      description: form.description || null,
      event_type: form.event_type,
      event_date: form.event_date,
      event_time: form.event_time || null,
      location: form.location || null,
      province_id: "a0000000-0000-0000-0000-000000000001",
      municipality_id: form.municipality_id || null,
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
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="banchetto">Banchetto</SelectItem>
                      <SelectItem value="riunione">Riunione</SelectItem>
                      <SelectItem value="serata">Serata</SelectItem>
                      <SelectItem value="altro">Altro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
                <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
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
