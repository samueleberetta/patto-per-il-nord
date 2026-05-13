"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2, Search, Download } from "lucide-react";
import type { Municipality } from "@/lib/types";
import {
  PlaceAutocomplete,
  CountryAutocomplete,
} from "@/components/place-autocomplete";
import { AddressAutocomplete } from "@/components/address-autocomplete";

interface Member {
  id: string;
  last_name: string;
  first_name: string;
  birth_place: string | null;
  birth_date: string | null;
  residence: string | null;
  profession: string | null;
  membership_date: string;
  fee_paid: number;
  municipality_id: string;
  municipality?: Municipality;
  document_type: string | null;
  document_number: string | null;
  fiscal_code: string | null;
  born_abroad: boolean;
  birth_country: string | null;
  education_level: string | null;
  card_number: string | null;
  email: string | null;
  phone: string | null;
}

const EDUCATION_LEVELS = [
  { value: "nessuno", label: "Nessuno" },
  { value: "licenza_elementare", label: "Licenza elementare" },
  { value: "licenza_media", label: "Licenza media" },
  { value: "diploma", label: "Diploma di scuola superiore" },
  { value: "laurea_triennale", label: "Laurea triennale" },
  { value: "laurea_magistrale", label: "Laurea magistrale" },
  { value: "master", label: "Master" },
  { value: "dottorato", label: "Dottorato" },
];

const DOCUMENT_TYPES = [
  { value: "carta_identita", label: "Carta d'identità" },
  { value: "patente", label: "Patente di guida" },
  { value: "passaporto", label: "Passaporto" },
  { value: "altro", label: "Altro" },
];

const emptyForm = {
  last_name: "",
  first_name: "",
  birth_place: "",
  birth_country: "",
  born_abroad: false,
  birth_date: "",
  residence: "",
  profession: "",
  membership_date: new Date().toISOString().split("T")[0],
  fee_paid: "0",
  municipality_id: "",
  document_type: "carta_identita",
  document_number: "",
  fiscal_code: "",
  education_level: "",
  card_number: "",
  email: "",
  phone: "",
};

export default function AdminTesseramentoPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const supabase = createSupabaseBrowser();

  async function load() {
    const [{ data: mem }, { data: muni }] = await Promise.all([
      supabase.from("members").select("*, municipality:municipalities(*)").order("last_name"),
      supabase.from("municipalities").select("*").order("name"),
    ]);
    setMembers(mem || []);
    setMunicipalities(muni || []);
  }

  useEffect(() => { load(); }, []);

  function openNew() {
    setForm(emptyForm);
    setEditingId(null);
    setOpen(true);
  }

  function openEdit(m: Member) {
    setForm({
      last_name: m.last_name,
      first_name: m.first_name,
      birth_place: m.birth_place || "",
      birth_country: m.birth_country || "",
      born_abroad: m.born_abroad ?? false,
      birth_date: m.birth_date || "",
      residence: m.residence || "",
      profession: m.profession || "",
      membership_date: m.membership_date,
      fee_paid: String(m.fee_paid),
      municipality_id: m.municipality_id,
      document_type: m.document_type || "carta_identita",
      document_number: m.document_number || "",
      fiscal_code: m.fiscal_code || "",
      education_level: m.education_level || "",
      card_number: m.card_number || "",
      email: m.email || "",
      phone: m.phone || "",
    });
    setEditingId(m.id);
    setOpen(true);
  }

  async function handleSave() {
    const payload = {
      last_name: form.last_name,
      first_name: form.first_name,
      // If born abroad, save the country in birth_place (or use birth_country)
      birth_place: form.born_abroad
        ? null
        : form.birth_place || null,
      birth_country: form.born_abroad ? form.birth_country || null : null,
      born_abroad: form.born_abroad,
      birth_date: form.birth_date || null,
      residence: form.residence || null,
      profession: form.profession || null,
      membership_date: form.membership_date,
      fee_paid: parseFloat(form.fee_paid) || 0,
      province_id: "a0000000-0000-0000-0000-000000000001",
      municipality_id: form.municipality_id,
      document_type: form.document_type || null,
      document_number: form.document_number || null,
      fiscal_code: form.fiscal_code ? form.fiscal_code.toUpperCase() : null,
      education_level: form.education_level || null,
      card_number: form.card_number || null,
      email: form.email || null,
      phone: form.phone || null,
    };

    if (editingId) {
      await supabase.from("members").update(payload).eq("id", editingId);
    } else {
      await supabase.from("members").insert(payload);
    }
    setOpen(false);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Eliminare questo tesserato?")) return;
    await supabase.from("members").delete().eq("id", id);
    load();
  }

  function exportCSV() {
    const headers = ["Cognome", "Nome", "Luogo nascita", "Data nascita", "Residenza", "Professione", "Comune tesseramento", "Data tesseramento", "Quota"];
    const rows = filtered.map((m) => [
      m.last_name, m.first_name, m.birth_place || "", m.birth_date || "",
      m.residence || "", m.profession || "", m.municipality?.name || "",
      m.membership_date, m.fee_paid,
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${c}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tesserati.csv";
    a.click();
  }

  const filtered = members.filter(
    (m) =>
      !search ||
      `${m.last_name} ${m.first_name}`.toLowerCase().includes(search.toLowerCase()) ||
      m.municipality?.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1B3A6B]">Tesseramento</h1>
          <p className="text-sm text-muted-foreground">{members.length} tesserati</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCSV}>
            <Download className="mr-2 h-4 w-4" />CSV
          </Button>
          <Button onClick={openNew} className="bg-[#1B3A6B] hover:bg-[#2d5aa0]">
            <Plus className="mr-2 h-4 w-4" />Nuova tessera
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingId ? "Modifica tesserato" : "Nuova tessera"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Cognome</Label><Input value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} /></div>
                  <div><Label>Nome</Label><Input value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} /></div>
                </div>
                {/* Born abroad checkbox */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="born_abroad"
                    checked={form.born_abroad}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        born_abroad: e.target.checked,
                        birth_place: e.target.checked ? "" : form.birth_place,
                        birth_country: e.target.checked ? form.birth_country : "",
                      })
                    }
                    className="h-4 w-4"
                  />
                  <Label htmlFor="born_abroad">Nato all&apos;estero</Label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    {form.born_abroad ? (
                      <>
                        <Label>Stato di nascita</Label>
                        <CountryAutocomplete
                          value={form.birth_country}
                          onChange={(v) => setForm({ ...form, birth_country: v })}
                        />
                      </>
                    ) : (
                      <>
                        <Label>Luogo di nascita (comune)</Label>
                        <PlaceAutocomplete
                          value={form.birth_place}
                          onChange={(v) => setForm({ ...form, birth_place: v })}
                          scope="italy"
                          placeholder="Cerca un comune italiano..."
                        />
                      </>
                    )}
                  </div>
                  <div>
                    <Label>Data di nascita</Label>
                    <Input
                      type="date"
                      value={form.birth_date}
                      onChange={(e) => setForm({ ...form, birth_date: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label>Residenza</Label>
                  <AddressAutocomplete
                    value={form.residence}
                    onChange={(value) => setForm({ ...form, residence: value })}
                    placeholder="Cerca via, civico e comune..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="email@esempio.com"
                    />
                  </div>
                  <div>
                    <Label>Telefono</Label>
                    <Input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="333 1234567"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Professione</Label>
                    <Input
                      value={form.profession}
                      onChange={(e) => setForm({ ...form, profession: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Titolo di studio</Label>
                    <Select
                      value={form.education_level || "none"}
                      onValueChange={(v) =>
                        setForm({ ...form, education_level: v === "none" ? "" : v ?? "" })
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleziona">
                          {form.education_level
                            ? EDUCATION_LEVELS.find((e) => e.value === form.education_level)?.label
                            : "Seleziona"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="min-w-[var(--trigger-width)]">
                        <SelectItem value="none">— Non specificato —</SelectItem>
                        {EDUCATION_LEVELS.map((e) => (
                          <SelectItem key={e.value} value={e.value}>
                            {e.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Documento di identità */}
                <div className="rounded-lg border bg-muted/30 p-3 space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Documento d&apos;identità
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Tipo di documento</Label>
                      <Select
                        value={form.document_type}
                        onValueChange={(v) => v && setForm({ ...form, document_type: v })}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue>
                            {DOCUMENT_TYPES.find((d) => d.value === form.document_type)?.label ||
                              form.document_type}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="min-w-[var(--trigger-width)]">
                          {DOCUMENT_TYPES.map((d) => (
                            <SelectItem key={d.value} value={d.value}>
                              {d.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Numero documento</Label>
                      <Input
                        value={form.document_number}
                        onChange={(e) =>
                          setForm({ ...form, document_number: e.target.value })
                        }
                        placeholder="Es. AY1234567"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">Codice fiscale</Label>
                    <Input
                      value={form.fiscal_code}
                      onChange={(e) =>
                        setForm({ ...form, fiscal_code: e.target.value.toUpperCase() })
                      }
                      placeholder="RSSMRA80A01H501Z"
                      maxLength={16}
                      className="font-mono uppercase"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Comune di tesseramento</Label>
                    <Select value={form.municipality_id} onValueChange={(v) => setForm({ ...form, municipality_id: v ?? "" })}>
                      <SelectTrigger className="w-full"><SelectValue placeholder="Seleziona" /></SelectTrigger>
                      <SelectContent>
                        {municipalities.map((m) => (<SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label>Data tesseramento</Label><Input type="date" value={form.membership_date} onChange={(e) => setForm({ ...form, membership_date: e.target.value })} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Numero tessera</Label>
                    <Input
                      value={form.card_number}
                      onChange={(e) => setForm({ ...form, card_number: e.target.value })}
                      placeholder="Es. 2026-0001"
                      className="font-mono"
                    />
                  </div>
                  <div>
                    <Label>Quota pagata (€)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={form.fee_paid}
                      onChange={(e) => setForm({ ...form, fee_paid: e.target.value })}
                    />
                  </div>
                </div>
                <Button onClick={handleSave} className="w-full bg-[#1B3A6B] hover:bg-[#2d5aa0]">
                  {editingId ? "Salva modifiche" : "Inserisci tessera"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="mt-6 relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Cerca per nome o comune..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="mt-4 overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cognome</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead className="hidden sm:table-cell">Comune</TableHead>
              <TableHead className="hidden md:table-cell">Data</TableHead>
              <TableHead className="hidden md:table-cell">Quota</TableHead>
              <TableHead className="w-20"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((m) => (
              <TableRow key={m.id}>
                <TableCell className="font-medium">{m.last_name}</TableCell>
                <TableCell>{m.first_name}</TableCell>
                <TableCell className="hidden sm:table-cell">{m.municipality?.name}</TableCell>
                <TableCell className="hidden md:table-cell">{new Date(m.membership_date).toLocaleDateString("it-IT")}</TableCell>
                <TableCell className="hidden md:table-cell">€{m.fee_paid}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(m)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(m.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filtered.length === 0 && <p className="text-center text-muted-foreground py-8">Nessun tesserato trovato.</p>}
      </div>
    </div>
  );
}
