import { supabase } from "@/lib/supabase";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Newspaper } from "lucide-react";
import type { NewsArticle } from "@/lib/types";

export const revalidate = 60;

function getCover(article: NewsArticle): string | null {
  if (article.image_urls && article.image_urls.length > 0)
    return article.image_urls[0];
  return article.image_url ?? null;
}

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
        {news.map((article) => {
          const cover = getCover(article);
          return (
            <Link
              key={article.id}
              href={`/news/${article.slug}`}
              className="group"
            >
              <Card className="h-full overflow-hidden transition-all hover:shadow-md hover:-translate-y-0.5 pt-0">
                {cover ? (
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
                    <Image
                      src={cover}
                      alt={article.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="relative aspect-[16/10] w-full bg-gradient-to-br from-[#1B3A6B]/10 to-[#1B3A6B]/5 flex items-center justify-center">
                    <Newspaper className="h-12 w-12 text-[#1B3A6B]/20" />
                  </div>
                )}
                <CardHeader>
                  <p className="text-xs text-muted-foreground">
                    {new Date(article.published_at).toLocaleDateString("it-IT", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                  <CardTitle className="text-lg leading-snug group-hover:text-[#1B3A6B] transition-colors">
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
          );
        })}
      </div>

      {news.length === 0 && (
        <p className="mt-12 text-center text-muted-foreground">
          Nessuna news pubblicata al momento.
        </p>
      )}
    </div>
  );
}
