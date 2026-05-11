"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2, Mail } from "lucide-react";
import type { Role, Municipality } from "@/lib/types";

const emptyForm = {
  role_title: "",
  person_name: "",
  bio: "",
  email: "",
  municipality_id: "",
  display_order: "0",
};

export default function AdminOrganigrammaPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const supabase = createSupabaseBrowser();

  async function load() {
    const [{ data: r }, { data: m }] = await Promise.all([
      supabase.from("roles").select("*").order("display_order"),
      supabase.from("municipalities").select("*").order("name"),
    ]);
    setRoles(r || []);
    setMunicipalities(m || []);
  }

  useEffect(() => { load(); }, []);

  function openNew() { setForm(emptyForm); setEditingId(null); setOpen(true); }

  function openEdit(role: Role) {
    setForm({
      role_title: role.role_title,
      person_name: role.person_name,
      bio: role.bio || "",
      email: role.email || "",
      municipality_id: role.municipality_id || "",
      display_order: String(role.display_order),
    });
    setEditingId(role.id);
    setOpen(true);
  }

  async function handleSave() {
    const payload = {
      role_title: form.role_title,
      person_name: form.person_name,
      bio: form.bio || null,
      email: form.email || null,
      province_id: "a0000000-0000-0000-0000-000000000001",
      municipality_id: form.municipality_id || null,
      display_order: parseInt(form.display_order) || 0,
    };
    if (editingId) {
      await supabase.from("roles").update(payload).eq("id", editingId);
    } else {
      await supabase.from("roles").insert(payload);
    }
    setOpen(false);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Eliminare questo ruolo?")) return;
    await supabase.from("roles").delete().eq("id", id);
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1B3A6B]">Organigramma</h1>
          <p className="text-sm text-muted-foreground">Gestisci ruoli e referenti</p>
        </div>
        <Button onClick={openNew} className="bg-[#1B3A6B] hover:bg-[#2d5aa0]">
          <Plus className="mr-2 h-4 w-4" />Nuovo ruolo
        </Button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>{editingId ? "Modifica ruolo" : "Nuovo ruolo"}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Ruolo</Label><Input value={form.role_title} onChange={(e) => setForm({ ...form, role_title: e.target.value })} /></div>
              <div><Label>Nome e Cognome</Label><Input value={form.person_name} onChange={(e) => setForm({ ...form, person_name: e.target.value })} /></div>
              <div><Label>Curriculum politico</Label><Textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3} /></div>
              <div><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Livello</Label>
                  <Select value={form.municipality_id} onValueChange={(v) => setForm({ ...form, municipality_id: v === "none" ? "" : v ?? "" })}>
                    <SelectTrigger className="w-full"><SelectValue placeholder="Provinciale" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Provinciale</SelectItem>
                      {municipalities.map((m) => (<SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Ordine</Label><Input type="number" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: e.target.value })} /></div>
              </div>
              <Button onClick={handleSave} className="w-full bg-[#1B3A6B] hover:bg-[#2d5aa0]">{editingId ? "Salva" : "Crea"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mt-6 space-y-3">
        {roles.map((role) => {
          const initials = role.person_name.split(" ").map((n) => n[0]).join("").slice(0, 2);
          return (
            <Card key={role.id}>
              <CardContent className="flex items-center gap-4 py-4">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-[#1B3A6B]/10 text-[#1B3A6B] text-sm font-bold">{initials}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground">{role.role_title}</p>
                  <p className="font-semibold">{role.person_name}</p>
                  {role.email && <p className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="h-3 w-3" />{role.email}</p>}
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(role)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(role.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
