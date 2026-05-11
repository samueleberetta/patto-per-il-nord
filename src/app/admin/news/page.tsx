"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Star } from "lucide-react";
import type { NewsArticle, Municipality } from "@/lib/types";

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

const emptyForm = {
  title: "",
  excerpt: "",
  content: "",
  municipality_id: "",
  featured: false,
};

export default function AdminNewsPage() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const supabase = createSupabaseBrowser();

  async function load() {
    const [{ data: news }, { data: muni }] = await Promise.all([
      supabase.from("news").select("*").order("published_at", { ascending: false }),
      supabase.from("municipalities").select("*").order("name"),
    ]);
    setArticles(news || []);
    setMunicipalities(muni || []);
  }

  useEffect(() => { load(); }, []);

  function openNew() {
    setForm(emptyForm);
    setEditingId(null);
    setOpen(true);
  }

  function openEdit(article: NewsArticle) {
    setForm({
      title: article.title,
      excerpt: article.excerpt,
      content: article.content,
      municipality_id: article.municipality_id || "",
      featured: article.featured,
    });
    setEditingId(article.id);
    setOpen(true);
  }

  async function handleSave() {
    const slug = slugify(form.title);
    const payload = {
      title: form.title,
      slug,
      excerpt: form.excerpt,
      content: form.content,
      province_id: "a0000000-0000-0000-0000-000000000001",
      municipality_id: form.municipality_id || null,
      featured: form.featured,
      published_at: new Date().toISOString(),
    };

    if (editingId) {
      await supabase.from("news").update(payload).eq("id", editingId);
    } else {
      await supabase.from("news").insert(payload);
    }

    setOpen(false);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Eliminare questa news?")) return;
    await supabase.from("news").delete().eq("id", id);
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1B3A6B]">News</h1>
          <p className="text-sm text-muted-foreground">
            Gestisci le notizie del portale
          </p>
        </div>
        <Button
          onClick={openNew}
          className="bg-[#1B3A6B] hover:bg-[#2d5aa0]"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nuova news
        </Button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Modifica news" : "Nuova news"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Titolo</Label>
                <Input
                  value={form.title}
                  onChange={(e) =>
                    setForm({ ...form, title: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Estratto</Label>
                <Textarea
                  value={form.excerpt}
                  onChange={(e) =>
                    setForm({ ...form, excerpt: e.target.value })
                  }
                  rows={2}
                />
              </div>
              <div>
                <Label>Contenuto</Label>
                <Textarea
                  value={form.content}
                  onChange={(e) =>
                    setForm({ ...form, content: e.target.value })
                  }
                  rows={8}
                />
              </div>
              <div>
                <Label>Comune (opzionale)</Label>
                <Select
                  value={form.municipality_id}
                  onValueChange={(v) =>
                    setForm({ ...form, municipality_id: v === "none" ? "" : v ?? "" })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Provinciale" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Provinciale</SelectItem>
                    {municipalities.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                <Label htmlFor="featured">In evidenza</Label>
              </div>
              <Button
                onClick={handleSave}
                className="w-full bg-[#1B3A6B] hover:bg-[#2d5aa0]"
              >
                {editingId ? "Salva modifiche" : "Pubblica"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mt-6 space-y-3">
        {articles.map((article) => (
          <Card key={article.id}>
            <CardContent className="flex items-center justify-between py-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold truncate">{article.title}</h3>
                  {article.featured && (
                    <Star className="h-4 w-4 shrink-0 fill-amber-400 text-amber-400" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(article.published_at).toLocaleDateString("it-IT")}
                </p>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openEdit(article)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(article.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {articles.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            Nessuna news. Crea la prima!
          </p>
        )}
      </div>
    </div>
  );
}
