import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { NewsArticle } from "@/lib/types";

export const revalidate = 60;

export default async function NewsPage() {
  const { data: articles } = await supabase
    .from("news")
    .select("*")
    .order("published_at", { ascending: false });

  const news: NewsArticle[] = articles || [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-[#1B3A6B]">News</h1>
      <p className="mt-2 text-muted-foreground">
        Tutte le notizie dal Patto per il Nord — Monza e Brianza
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {news.map((article) => (
          <Link key={article.id} href={`/news/${article.slug}`}>
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardHeader>
                <p className="text-xs text-muted-foreground">
                  {new Date(article.published_at).toLocaleDateString("it-IT", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
                <CardTitle className="text-lg leading-snug">
                  {article.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {article.excerpt}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {news.length === 0 && (
        <p className="mt-12 text-center text-muted-foreground">
          Nessuna news pubblicata al momento.
        </p>
      )}
    </div>
  );
}
