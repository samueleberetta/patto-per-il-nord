"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, MapPin, Phone, Mail, Star } from "lucide-react";
import type { Municipality } from "@/lib/types";

const emptyForm = {
  name: "",
  slug: "",
  has_sede: false,
  featured: false,
  contact_phone: "",
  contact_email: "",
  lat: "",
  lng: "",
};

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[àáâãäå]/g, "a")
    .replace(/[èéêë]/g, "e")
    .replace(/[ìíîï]/g, "i")
    .replace(/[òóôõö]/g, "o")
    .replace(/[ùúûü]/g, "u")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function AdminComuniPage() {
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const supabase = createSupabaseBrowser();

  async function load() {
    const { data } = await supabase
      .from("municipalities")
      .select("*")
      .order("name");
    setMunicipalities(data || []);
  }

  useEffect(() => {
    load();
  }, []);

  function openNew() {
    setForm(emptyForm);
    setEditingId(null);
    setOpen(true);
  }

  function openEdit(m: Municipality) {
    setForm({
      name: m.name,
      slug: m.slug,
      has_sede: m.has_sede,
      featured: m.featured,
      contact_phone: m.contact_phone || "",
      contact_email: m.contact_email || "",
      lat: m.lat ? String(m.lat) : "",
      lng: m.lng ? String(m.lng) : "",
    });
    setEditingId(m.id);
    setOpen(true);
  }

  async function handleSave() {
    const payload = {
      name: form.name,
      slug: form.slug || slugify(form.name),
      has_sede: form.has_sede,
      featured: form.featured,
      contact_phone: form.contact_phone || null,
      contact_email: form.contact_email || null,
      lat: form.lat ? parseFloat(form.lat) : null,
      lng: form.lng ? parseFloat(form.lng) : null,
      province_id: "a0000000-0000-0000-0000-000000000001",
    };

    if (editingId) {
      await supabase.from("municipalities").update(payload).eq("id", editingId);
    } else {
      await supabase.from("municipalities").insert(payload);
    }
    setOpen(false);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Eliminare questo comune?")) return;
    await supabase.from("municipalities").delete().eq("id", id);
    load();
  }

  function toggleSede(m: Municipality) {
    supabase
      .from("municipalities")
      .update({ has_sede: !m.has_sede })
      .eq("id", m.id)
      .then(() => load());
  }

  function toggleFeatured(m: Municipality) {
    supabase
      .from("municipalities")
      .update({ featured: !m.featured })
      .eq("id", m.id)
      .then(() => load());
  }

  const filtered = municipalities.filter(
    (m) => !search || m.name.toLowerCase().includes(search.toLowerCase())
  );

  const sediCount = municipalities.filter((m) => m.has_sede).length;
  const featuredCount = municipalities.filter((m) => m.featured).length;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1B3A6B]">Comuni</h1>
          <p className="text-sm text-muted-foreground">
            {municipalities.length} comuni — {sediCount} con sede — {featuredCount} in evidenza
          </p>
        </div>
        <Button
          onClick={openNew}
          className="bg-[#1B3A6B] hover:bg-[#2d5aa0]"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nuovo comune
        </Button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Modifica comune" : "Nuovo comune"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Nome</Label>
                <Input
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Slug (auto-generato se vuoto)</Label>
                <Input
                  value={form.slug}
                  onChange={(e) =>
                    setForm({ ...form, slug: e.target.value })
                  }
                  placeholder={slugify(form.name) || "slug"}
                />
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="has_sede"
                    checked={form.has_sede}
                    onChange={(e) =>
                      setForm({ ...form, has_sede: e.target.checked })
                    }
                    className="h-4 w-4"
                  />
                  <Label htmlFor="has_sede">Sede attiva</Label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={form.featured}
                    onChange={(e) =>
                      setForm({ ...form, featured: e.target.checked })
                    }
                    className="h-4 w-4"
                  />
                  <Label htmlFor="featured" className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 text-amber-500" />
                    In evidenza
                  </Label>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Telefono</Label>
                  <Input
                    value={form.contact_phone}
                    onChange={(e) =>
                      setForm({ ...form, contact_phone: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={form.contact_email}
                    onChange={(e) =>
                      setForm({ ...form, contact_email: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Latitudine</Label>
                  <Input
                    type="number"
                    step="any"
                    value={form.lat}
                    onChange={(e) =>
                      setForm({ ...form, lat: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Longitudine</Label>
                  <Input
                    type="number"
                    step="any"
                    value={form.lng}
                    onChange={(e) =>
                      setForm({ ...form, lng: e.target.value })
                    }
                  />
                </div>
              </div>
              <Button
                onClick={handleSave}
                className="w-full bg-[#1B3A6B] hover:bg-[#2d5aa0]"
              >
                {editingId ? "Salva modifiche" : "Crea comune"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mt-6 relative max-w-sm">
        <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Cerca comune..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="mt-4 space-y-2">
        {filtered.map((m) => (
          <Card key={m.id}>
            <CardContent className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{m.name}</p>
                    {m.has_sede && (
                      <Badge className="bg-[#1B3A6B] text-white text-[10px] px-1.5 py-0">
                        Sede
                      </Badge>
                    )}
                    {m.featured && (
                      <Badge className="bg-amber-500 text-white text-[10px] px-1.5 py-0">
                        <Star className="h-2.5 w-2.5 mr-0.5" />
                        In evidenza
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-0.5">
                    {m.contact_phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {m.contact_phone}
                      </span>
                    )}
                    {m.contact_email && (
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {m.contact_email}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 ml-4">
                <Button
                  variant={m.featured ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => toggleFeatured(m)}
                  className={`text-xs h-7 ${m.featured ? "bg-amber-100 text-amber-700 hover:bg-amber-200" : ""}`}
                >
                  <Star className={`h-3 w-3 mr-1 ${m.featured ? "fill-amber-500 text-amber-500" : ""}`} />
                  {m.featured ? "In evidenza" : "Evidenzia"}
                </Button>
                <Button
                  variant={m.has_sede ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => toggleSede(m)}
                  className="text-xs h-7"
                >
                  {m.has_sede ? "Chiudi sede" : "Apri sede"}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openEdit(m)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(m.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
