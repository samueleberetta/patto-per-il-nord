"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Newspaper, Calendar, Users, MapPin } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ news: 0, events: 0, members: 0, comuni: 0 });

  useEffect(() => {
    async function load() {
      const supabase = createSupabaseBrowser();
      const [n, e, m, c] = await Promise.all([
        supabase.from("news").select("id", { count: "exact", head: true }),
        supabase.from("events").select("id", { count: "exact", head: true }),
        supabase.from("members").select("id", { count: "exact", head: true }),
        supabase.from("municipalities").select("id", { count: "exact", head: true }),
      ]);
      setStats({
        news: n.count || 0,
        events: e.count || 0,
        members: m.count || 0,
        comuni: c.count || 0,
      });
    }
    load();
  }, []);

  const cards = [
    { label: "News pubblicate", value: stats.news, icon: Newspaper },
    { label: "Eventi in programma", value: stats.events, icon: Calendar },
    { label: "Tesserati", value: stats.members, icon: Users },
    { label: "Comuni", value: stats.comuni, icon: MapPin },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1B3A6B]">Dashboard</h1>
      <p className="mt-1 text-muted-foreground">
        Pannello di gestione — Provincia di Monza e Brianza
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.label}
              </CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-[#1B3A6B]">{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
