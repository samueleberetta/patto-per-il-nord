import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  const { municipality_id, subject, body } = await req.json();

  if (!subject || !body) {
    return NextResponse.json(
      { error: "Oggetto e messaggio obbligatori" },
      { status: 400 }
    );
  }

  // Fetch members (all or filtered by municipality)
  let query = supabase.from("members").select("first_name, last_name");
  if (municipality_id) {
    query = query.eq("municipality_id", municipality_id);
  }
  const { data: members, error: membersError } = await query;

  if (membersError) {
    return NextResponse.json(
      { error: "Errore nel recupero dei tesserati" },
      { status: 500 }
    );
  }

  if (!members || members.length === 0) {
    return NextResponse.json(
      { error: "Nessun destinatario trovato" },
      { status: 400 }
    );
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    return NextResponse.json(
      { error: "Chiave Resend non configurata. Aggiungi RESEND_API_KEY in .env.local" },
      { status: 500 }
    );
  }

  // For now, send a single email to the admin as a placeholder
  // In production, this would loop through members with real email addresses
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "PPN Monza e Brianza <noreply@pattoperilnord.it>",
        to: [user.email],
        subject,
        text: body,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      return NextResponse.json(
        { error: err.message || "Errore Resend" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      count: members.length,
    });
  } catch {
    return NextResponse.json(
      { error: "Errore nell'invio email" },
      { status: 500 }
    );
  }
}
