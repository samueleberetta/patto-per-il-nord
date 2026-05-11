import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const revalidate = 60;

export default async function NewsArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { data: article } = await supabase
    .from("news")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!article) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        href="/news"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-[#1B3A6B]"
      >
        <ArrowLeft className="h-4 w-4" />
        Torna alle news
      </Link>

      <article className="mt-8">
        <p className="text-sm text-muted-foreground">
          {new Date(article.published_at).toLocaleDateString("it-IT", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
        <h1 className="mt-2 text-3xl font-bold text-[#1B3A6B] sm:text-4xl">
          {article.title}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">{article.excerpt}</p>
        <div className="mt-8 prose prose-slate max-w-none">
          {article.content.split("\n\n").map((paragraph: string, i: number) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      </article>
    </div>
  );
}
