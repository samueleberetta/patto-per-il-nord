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
}

const emptyForm = {
  last_name: "",
  first_name: "",
  birth_place: "",
  birth_date: "",
  residence: "",
  profession: "",
  membership_date: new Date().toISOString().split("T")[0],
  fee_paid: "0",
  municipality_id: "",
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
      birth_date: m.birth_date || "",
      residence: m.residence || "",
      profession: m.profession || "",
      membership_date: m.membership_date,
      fee_paid: String(m.fee_paid),
      municipality_id: m.municipality_id,
    });
    setEditingId(m.id);
    setOpen(true);
  }

  async function handleSave() {
    const payload = {
      last_name: form.last_name,
      first_name: form.first_name,
      birth_place: form.birth_place || null,
      birth_date: form.birth_date || null,
      residence: form.residence || null,
      profession: form.profession || null,
      membership_date: form.membership_date,
      fee_paid: parseFloat(form.fee_paid) || 0,
      province_id: "a0000000-0000-0000-0000-000000000001",
      municipality_id: form.municipality_id,
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
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Luogo di nascita</Label><Input value={form.birth_place} onChange={(e) => setForm({ ...form, birth_place: e.target.value })} /></div>
                  <div><Label>Data di nascita</Label><Input type="date" value={form.birth_date} onChange={(e) => setForm({ ...form, birth_date: e.target.value })} /></div>
                </div>
                <div><Label>Residenza</Label><Input value={form.residence} onChange={(e) => setForm({ ...form, residence: e.target.value })} /></div>
                <div><Label>Professione</Label><Input value={form.profession} onChange={(e) => setForm({ ...form, profession: e.target.value })} /></div>
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
                <div><Label>Quota pagata (€)</Label><Input type="number" step="0.01" value={form.fee_paid} onChange={(e) => setForm({ ...form, fee_paid: e.target.value })} /></div>
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
