"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Send, Users, Mail } from "lucide-react";
import type { Municipality } from "@/lib/types";

interface Member {
  id: string;
  first_name: string;
  last_name: string;
  municipality_id: string;
  municipality?: Municipality;
}

export default function AdminMessaggiPage() {
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [filterMunicipality, setFilterMunicipality] = useState("all");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const supabase = createSupabaseBrowser();

  useEffect(() => {
    async function load() {
      const [{ data: mem }, { data: muni }] = await Promise.all([
        supabase
          .from("members")
          .select("id, first_name, last_name, municipality_id, municipality:municipalities(*)")
          .order("last_name"),
        supabase.from("municipalities").select("*").order("name"),
      ]);
      setMembers((mem || []).map((m: any) => ({ ...m, municipality: Array.isArray(m.municipality) ? m.municipality[0] : m.municipality })) as Member[]);
      setMunicipalities(muni || []);
    }
    load();
  }, []);

  const filteredMembers =
    filterMunicipality === "all"
      ? members
      : members.filter((m) => m.municipality_id === filterMunicipality);

  async function handleSend() {
    if (!subject.trim() || !body.trim()) {
      setResult({ type: "error", message: "Compila oggetto e messaggio." });
      return;
    }
    if (filteredMembers.length === 0) {
      setResult({
        type: "error",
        message: "Nessun destinatario selezionato.",
      });
      return;
    }

    setSending(true);
    setResult(null);

    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          municipality_id:
            filterMunicipality === "all" ? null : filterMunicipality,
          subject,
          body,
        }),
      });

      if (res.ok) {
        setResult({
          type: "success",
          message: `Email inviata a ${filteredMembers.length} destinatari.`,
        });
        setSubject("");
        setBody("");
      } else {
        const data = await res.json();
        setResult({
          type: "error",
          message: data.error || "Errore nell'invio.",
        });
      }
    } catch {
      setResult({ type: "error", message: "Errore di connessione." });
    } finally {
      setSending(false);
    }
  }

  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold text-[#1B3A6B]">Messaggi</h1>
        <p className="text-sm text-muted-foreground">
          Invia comunicazioni ai tesserati via email
        </p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Componi messaggio</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Destinatari</Label>
                <Select
                  value={filterMunicipality}
                  onValueChange={(v) => setFilterMunicipality(v ?? "all")}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      Tutti i tesserati ({members.length})
                    </SelectItem>
                    {municipalities.map((m) => {
                      const count = members.filter(
                        (mem) => mem.municipality_id === m.id
                      ).length;
                      return (
                        <SelectItem key={m.id} value={m.id}>
                          {m.name} ({count})
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Oggetto</Label>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Oggetto dell'email..."
                />
              </div>
              <div>
                <Label>Messaggio</Label>
                <Textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={10}
                  placeholder="Scrivi il messaggio..."
                />
              </div>
              {result && (
                <div
                  className={`p-3 rounded-md text-sm ${
                    result.type === "success"
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}
                >
                  {result.message}
                </div>
              )}
              <Button
                onClick={handleSend}
                disabled={sending}
                className="w-full bg-[#1B3A6B] hover:bg-[#2d5aa0]"
              >
                <Send className="mr-2 h-4 w-4" />
                {sending ? "Invio in corso..." : "Invia email"}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4" />
                Destinatari ({filteredMembers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredMembers.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center gap-2 text-sm py-1 border-b last:border-0"
                  >
                    <Mail className="h-3 w-3 text-muted-foreground shrink-0" />
                    <span className="truncate">
                      {m.last_name} {m.first_name}
                    </span>
                    {m.municipality && (
                      <Badge variant="outline" className="text-[10px] ml-auto shrink-0">
                        {m.municipality.name}
                      </Badge>
                    )}
                  </div>
                ))}
                {filteredMembers.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nessun tesserato.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
