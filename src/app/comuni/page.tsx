import { supabase } from "@/lib/supabase";
import { ComuniList } from "@/components/comuni-list";
import { BrianzaMap } from "@/components/map/BrianzaMap";
import type { Municipality } from "@/lib/types";

export const revalidate = 60;

export default async function ComuniPage() {
  const { data } = await supabase
    .from("municipalities")
    .select("*")
    .order("name");

  const municipalities: Municipality[] = data || [];
  const sediCount = municipalities.filter((m) => m.has_sede).length;

  return (
    <div>
      {/* Hero */}
      <section className="bg-[#1B3A6B] text-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold sm:text-4xl">
            I nostri comuni
          </h1>
          <p className="mt-3 text-lg text-white/80 max-w-2xl">
            Il Patto per il Nord è presente nella provincia di Monza e Brianza con {sediCount} {sediCount === 1 ? "sede" : "sedi"} su {municipalities.length} comuni.
          </p>
        </div>
      </section>

      {/* Mappa */}
      <section className="bg-white border-b">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <BrianzaMap municipalities={municipalities} />
        </div>
      </section>

      {/* Lista comuni */}
      <section className="bg-muted/50">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <ComuniList municipalities={municipalities} />
        </div>
      </section>
    </div>
  );
}
