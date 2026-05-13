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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, KeyRound, Shield, MapPin } from "lucide-react";
import type { Municipality } from "@/lib/types";

interface AdminUser {
  id: string;
  email: string;
  created_at: string;
  role: string;
  province_id: string;
  municipality_id: string | null;
}

const roleLabels: Record<string, string> = {
  superadmin: "Super Admin",
  segretario_provinciale: "Segretario Provinciale",
  resp_comunicazione: "Resp. Comunicazione",
  resp_tesseramento: "Resp. Tesseramento",
  resp_comunale: "Resp. Comunale",
};

const roleBadgeColors: Record<string, string> = {
  superadmin: "bg-red-600 text-white",
  segretario_provinciale: "bg-[#1B3A6B] text-white",
  resp_comunicazione: "bg-blue-500 text-white",
  resp_tesseramento: "bg-green-600 text-white",
  resp_comunale: "bg-orange-500 text-white",
};

const emptyForm = {
  email: "",
  password: "",
  role: "resp_comunicazione",
  municipality_id: "",
};

export default function AdminUtentiPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingRole, setEditingRole] = useState("");
  const [editingMunicipality, setEditingMunicipality] = useState("");
  const [passwordForm, setPasswordForm] = useState({ id: "", password: "" });
  const [openNew, setOpenNew] = useState(false);
  const [openEditRole, setOpenEditRole] = useState(false);
  const [openPassword, setOpenPassword] = useState(false);
  const [error, setError] = useState("");
  const supabase = createSupabaseBrowser();

  async function load() {
    const [{ data: usersData, error: usersError }, { data: muniData }] = await Promise.all([
      supabase.rpc("admin_list_users"),
      supabase.from("municipalities").select("*").order("name"),
    ]);
    if (!usersError && usersData) {
      setUsers(usersData as AdminUser[]);
    }
    if (muniData) {
      setMunicipalities(muniData);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate() {
    setError("");
    if (!form.email || !form.password) {
      setError("Email e password obbligatori.");
      return;
    }
    if (form.password.length < 6) {
      setError("La password deve avere almeno 6 caratteri.");
      return;
    }
    if (form.role === "resp_comunale" && !form.municipality_id) {
      setError("Seleziona il comune di riferimento per il responsabile comunale.");
      return;
    }

    const { error: rpcError } = await supabase.rpc("admin_create_user", {
      p_email: form.email,
      p_password: form.password,
      p_role: form.role,
      p_municipality_id: form.role === "resp_comunale" ? form.municipality_id : null,
    });

    if (rpcError) {
      setError(rpcError.message.includes("duplicate")
        ? "Questa email esiste gia."
        : rpcError.message);
      return;
    }

    setOpenNew(false);
    setForm(emptyForm);
    load();
  }

  async function handleUpdateRole() {
    if (!editingId) return;
    if (editingRole === "resp_comunale" && !editingMunicipality) {
      setError("Seleziona il comune di riferimento.");
      return;
    }
    await supabase.rpc("admin_update_user_role", {
      p_user_id: editingId,
      p_role: editingRole,
      p_municipality_id: editingRole === "resp_comunale" ? editingMunicipality : null,
    });
    setOpenEditRole(false);
    setError("");
    load();
  }

  async function handleUpdatePassword() {
    setError("");
    if (passwordForm.password.length < 6) {
      setError("La password deve avere almeno 6 caratteri.");
      return;
    }
    await supabase.rpc("admin_update_user_password", {
      p_user_id: passwordForm.id,
      p_password: passwordForm.password,
    });
    setOpenPassword(false);
    setPasswordForm({ id: "", password: "" });
    load();
  }

  async function handleDelete(id: string, email: string) {
    if (!confirm(`Eliminare l'utente ${email}?`)) return;
    const { error: rpcError } = await supabase.rpc("admin_delete_user", {
      p_user_id: id,
    });
    if (rpcError) {
      alert(rpcError.message.includes("yourself")
        ? "Non puoi eliminare te stesso."
        : rpcError.message);
      return;
    }
    load();
  }

  function openEditRoleDialog(user: AdminUser) {
    setEditingId(user.id);
    setEditingRole(user.role);
    setEditingMunicipality(user.municipality_id || "");
    setError("");
    setOpenEditRole(true);
  }

  function openPasswordDialog(user: AdminUser) {
    setPasswordForm({ id: user.id, password: "" });
    setError("");
    setOpenPassword(true);
  }

  function getMunicipalityName(id: string | null) {
    if (!id) return null;
    return municipalities.find((m) => m.id === id)?.name || null;
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1B3A6B]">Utenti admin</h1>
          <p className="text-sm text-muted-foreground">
            Gestisci gli accessi all&apos;area riservata
          </p>
        </div>
        <Button
          onClick={() => {
            setForm(emptyForm);
            setError("");
            setOpenNew(true);
          }}
          className="bg-[#1B3A6B] hover:bg-[#2d5aa0]"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nuovo utente
        </Button>
      </div>

      {/* New user dialog */}
      <Dialog open={openNew} onOpenChange={setOpenNew}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nuovo utente admin</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
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
              <Label>Password</Label>
              <Input
                type="text"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Minimo 6 caratteri"
              />
            </div>
            <div>
              <Label>Ruolo</Label>
              <Select
                value={form.role}
                onValueChange={(v) => v && setForm({ ...form, role: v, municipality_id: v === "resp_comunale" ? form.municipality_id : "" })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue>{roleLabels[form.role] || form.role}</SelectValue>
                </SelectTrigger>
                <SelectContent className="min-w-[var(--trigger-width)]">
                  <SelectItem value="superadmin">Super Admin</SelectItem>
                  <SelectItem value="segretario_provinciale">Segretario Provinciale</SelectItem>
                  <SelectItem value="resp_comunicazione">Resp. Comunicazione</SelectItem>
                  <SelectItem value="resp_tesseramento">Resp. Tesseramento</SelectItem>
                  <SelectItem value="resp_comunale">Resp. Comunale</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {form.role === "resp_comunale" && (
              <div>
                <Label>Comune di riferimento</Label>
                <Select
                  value={form.municipality_id}
                  onValueChange={(v) => v && setForm({ ...form, municipality_id: v })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleziona un comune">
                      {getMunicipalityName(form.municipality_id) || "Seleziona un comune"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="min-w-[var(--trigger-width)] max-h-72">
                    {municipalities.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <Button
              onClick={handleCreate}
              className="w-full bg-[#1B3A6B] hover:bg-[#2d5aa0]"
            >
              Crea utente
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit role dialog */}
      <Dialog open={openEditRole} onOpenChange={setOpenEditRole}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Modifica ruolo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Ruolo</Label>
              <Select
                value={editingRole}
                onValueChange={(v) => {
                  if (v) {
                    setEditingRole(v);
                    if (v !== "resp_comunale") setEditingMunicipality("");
                  }
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue>{roleLabels[editingRole] || editingRole}</SelectValue>
                </SelectTrigger>
                <SelectContent className="min-w-[var(--trigger-width)]">
                  <SelectItem value="superadmin">Super Admin</SelectItem>
                  <SelectItem value="segretario_provinciale">Segretario Provinciale</SelectItem>
                  <SelectItem value="resp_comunicazione">Resp. Comunicazione</SelectItem>
                  <SelectItem value="resp_tesseramento">Resp. Tesseramento</SelectItem>
                  <SelectItem value="resp_comunale">Resp. Comunale</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {editingRole === "resp_comunale" && (
              <div>
                <Label>Comune di riferimento</Label>
                <Select
                  value={editingMunicipality}
                  onValueChange={(v) => v && setEditingMunicipality(v)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleziona un comune">
                      {getMunicipalityName(editingMunicipality) || "Seleziona un comune"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="min-w-[var(--trigger-width)] max-h-72">
                    {municipalities.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <Button
              onClick={handleUpdateRole}
              className="w-full bg-[#1B3A6B] hover:bg-[#2d5aa0]"
            >
              Salva ruolo
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Change password dialog */}
      <Dialog open={openPassword} onOpenChange={setOpenPassword}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Cambia password</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nuova password</Label>
              <Input
                type="text"
                value={passwordForm.password}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, password: e.target.value })
                }
                placeholder="Minimo 6 caratteri"
              />
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <Button
              onClick={handleUpdatePassword}
              className="w-full bg-[#1B3A6B] hover:bg-[#2d5aa0]"
            >
              Salva password
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Users list */}
      <div className="mt-6 space-y-3">
        {users.map((user) => (
          <Card key={user.id}>
            <CardContent className="flex items-center justify-between py-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold">{user.email}</p>
                  <Badge className={`text-[10px] px-1.5 py-0 ${roleBadgeColors[user.role] || "bg-gray-500 text-white"}`}>
                    {roleLabels[user.role] || user.role}
                  </Badge>
                  {user.role === "resp_comunale" && user.municipality_id && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 gap-1">
                      <MapPin className="h-2.5 w-2.5" />
                      {getMunicipalityName(user.municipality_id)}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Creato: {new Date(user.created_at).toLocaleDateString("it-IT")}
                </p>
              </div>
              <div className="flex items-center gap-1 ml-4">
                <Button
                  variant="ghost"
                  size="icon"
                  title="Modifica ruolo"
                  onClick={() => openEditRoleDialog(user)}
                >
                  <Shield className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  title="Cambia password"
                  onClick={() => openPasswordDialog(user)}
                >
                  <KeyRound className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  title="Elimina utente"
                  onClick={() => handleDelete(user.id, user.email)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {users.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            Nessun utente trovato.
          </p>
        )}
      </div>
    </div>
  );
}
