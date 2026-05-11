import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail } from "lucide-react";
import type { Role } from "@/lib/types";

export const revalidate = 60;

export default async function OrganigrammaPage() {
  const { data } = await supabase
    .from("roles")
    .select("*")
    .is("municipality_id", null)
    .order("display_order");

  const roles: Role[] = data || [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-[#1B3A6B]">Organigramma</h1>
      <p className="mt-2 text-muted-foreground">
        I responsabili provinciali del Patto per il Nord — Monza e Brianza
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {roles.map((role) => {
          const initials = role.person_name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2);

          return (
            <Card key={role.id} className="overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-[#1B3A6B] to-[#2d5aa0]" />
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16 border-2 border-[#1B3A6B]/20">
                    <AvatarImage src={role.photo_url || undefined} />
                    <AvatarFallback className="bg-[#1B3A6B]/10 text-[#1B3A6B] text-lg font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-[#1B3A6B]">
                      {role.role_title}
                    </p>
                    <p className="mt-1 text-lg font-bold">{role.person_name}</p>
                  </div>
                </div>
                {role.bio && (
                  <p className="mt-4 text-sm text-muted-foreground">
                    {role.bio}
                  </p>
                )}
                {role.email && (
                  <a
                    href={`mailto:${role.email}`}
                    className="mt-3 inline-flex items-center gap-1.5 text-sm text-[#1B3A6B] hover:underline"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    {role.email}
                  </a>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
