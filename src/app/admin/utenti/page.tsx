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
import { Plus, Pencil, Trash2, KeyRound, Shield } from "lucide-react";

interface AdminUser {
  id: string;
  email: string;
  created_at: string;
  role: string;
  province_id: string;
}

const roleLabels: Record<string, string> = {
  superadmin: "Super Admin",
  segretario_provinciale: "Segretario Provinciale",
  resp_comunicazione: "Resp. Comunicazione",
  resp_tesseramento: "Resp. Tesseramento",
};

const roleBadgeColors: Record<string, string> = {
  superadmin: "bg-red-600 text-white",
  segretario_provinciale: "bg-[#1B3A6B] text-white",
  resp_comunicazione: "bg-blue-500 text-white",
  resp_tesseramento: "bg-green-600 text-white",
};

const emptyForm = {
  email: "",
  password: "",
  role: "resp_comunicazione",
};

export default function AdminUtentiPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingRole, setEditingRole] = useState("");
  const [passwordForm, setPasswordForm] = useState({ id: "", password: "" });
  const [openNew, setOpenNew] = useState(false);
  const [openEditRole, setOpenEditRole] = useState(false);
  const [openPassword, setOpenPassword] = useState(false);
  const [error, setError] = useState("");
  const supabase = createSupabaseBrowser();

  async function load() {
    const { data, error } = await supabase.rpc("admin_list_users");
    if (!error && data) {
      setUsers(data as AdminUser[]);
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

    const { error: rpcError } = await supabase.rpc("admin_create_user", {
      p_email: form.email,
      p_password: form.password,
      p_role: form.role,
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
    await supabase.rpc("admin_update_user_role", {
      p_user_id: editingId,
      p_role: editingRole,
    });
    setOpenEditRole(false);
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
    setOpenEditRole(true);
  }

  function openPasswordDialog(user: AdminUser) {
    setPasswordForm({ id: user.id, password: "" });
    setError("");
    setOpenPassword(true);
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
                onValueChange={(v) => v && setForm({ ...form, role: v })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue>{roleLabels[form.role] || form.role}</SelectValue>
                </SelectTrigger>
                <SelectContent className="min-w-[var(--trigger-width)]">
                  <SelectItem value="superadmin">Super Admin</SelectItem>
                  <SelectItem value="segretario_provinciale">Segretario Provinciale</SelectItem>
                  <SelectItem value="resp_comunicazione">Resp. Comunicazione</SelectItem>
                  <SelectItem value="resp_tesseramento">Resp. Tesseramento</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
              <Select value={editingRole} onValueChange={(v) => v && setEditingRole(v)}>
                <SelectTrigger className="w-full">
                  <SelectValue>{roleLabels[editingRole] || editingRole}</SelectValue>
                </SelectTrigger>
                <SelectContent className="min-w-[var(--trigger-width)]">
                  <SelectItem value="superadmin">Super Admin</SelectItem>
                  <SelectItem value="segretario_provinciale">Segretario Provinciale</SelectItem>
                  <SelectItem value="resp_comunicazione">Resp. Comunicazione</SelectItem>
                  <SelectItem value="resp_tesseramento">Resp. Tesseramento</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
