"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import {
  Newspaper,
  Calendar,
  Users,
  UserCircle,
  MapPin,
  Mail,
  LayoutDashboard,
  LogOut,
  Loader2,
  ShieldCheck,
  Eye,
  X,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type AdminRole =
  | "superadmin"
  | "segretario_provinciale"
  | "resp_comunicazione"
  | "resp_tesseramento";

const allNavItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, roles: ["superadmin", "segretario_provinciale", "resp_comunicazione", "resp_tesseramento"] },
  { href: "/admin/news", label: "News", icon: Newspaper, roles: ["superadmin", "segretario_provinciale", "resp_comunicazione"] },
  { href: "/admin/eventi", label: "Eventi", icon: Calendar, roles: ["superadmin", "segretario_provinciale", "resp_comunicazione"] },
  { href: "/admin/tesseramento", label: "Tesseramento", icon: Users, roles: ["superadmin", "segretario_provinciale", "resp_tesseramento"] },
  { href: "/admin/organigramma", label: "Organigramma", icon: UserCircle, roles: ["superadmin", "segretario_provinciale"] },
  { href: "/admin/comuni", label: "Comuni", icon: MapPin, roles: ["superadmin", "segretario_provinciale"] },
  { href: "/admin/messaggi", label: "Messaggi", icon: Mail, roles: ["superadmin", "segretario_provinciale", "resp_comunicazione"] },
  { href: "/admin/utenti", label: "Utenti", icon: ShieldCheck, roles: ["superadmin"] },
];

const roleLabels: Record<AdminRole, string> = {
  superadmin: "Super Admin",
  segretario_provinciale: "Segretario Provinciale",
  resp_comunicazione: "Resp. Comunicazione",
  resp_tesseramento: "Resp. Tesseramento",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [realRole, setRealRole] = useState<AdminRole | null>(null);
  const [viewAsRole, setViewAsRole] = useState<AdminRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // The effective role: impersonated role if set, otherwise real role
  const role = viewAsRole || realRole;

  useEffect(() => {
    async function loadProfile() {
      const supabase = createSupabaseBrowser();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setUserEmail(user.email || "");

      const { data: profile } = await supabase
        .from("user_profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile) {
        setRealRole(profile.role as AdminRole);
      } else {
        router.push("/login");
        return;
      }

      setLoading(false);
    }
    loadProfile();
  }, [router]);

  async function handleLogout() {
    const supabase = createSupabaseBrowser();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#1B3A6B]" />
      </div>
    );
  }

  const navItems = allNavItems.filter(
    (item) => role && item.roles.includes(role)
  );

  // Check if current page is allowed for this role
  const isPageAllowed = navItems.some(
    (item) =>
      item.href === "/admin"
        ? pathname === "/admin"
        : pathname.startsWith(item.href)
  );

  if (!isPageAllowed && pathname !== "/admin") {
    router.push("/admin");
    return null;
  }

  const isSuperadmin = realRole === "superadmin";
  const isImpersonating = viewAsRole !== null;

  return (
    <div className="flex min-h-[calc(100vh-8rem)]">
      {/* Impersonation banner */}
      {isImpersonating && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-white px-4 py-2 flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            <span>
              Stai vedendo come:{" "}
              <strong>{roleLabels[viewAsRole]}</strong>
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setViewAsRole(null);
              router.push("/admin");
            }}
            className="text-white hover:bg-amber-600 h-7 px-2"
          >
            <X className="h-4 w-4 mr-1" />
            Esci dalla vista
          </Button>
        </div>
      )}

      <aside
        className={`hidden w-56 shrink-0 border-r bg-muted/30 md:block ${
          isImpersonating ? "pt-10" : ""
        }`}
      >
        <nav className="flex flex-col gap-1 p-4">
          {/* User info */}
          <div className="mb-3 rounded-md bg-[#1B3A6B]/5 px-3 py-2">
            <p className="text-xs font-medium text-[#1B3A6B] truncate">
              {userEmail}
            </p>
            <p className="text-[10px] text-muted-foreground">
              {role && roleLabels[role]}
            </p>
          </div>

          {/* Impersonation selector - only for superadmin */}
          {isSuperadmin && (
            <div className="mb-3">
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5 px-1 font-medium">
                Visualizza come
              </p>
              <Select
                value={viewAsRole || "superadmin"}
                onValueChange={(v) => {
                  if (v === "superadmin") {
                    setViewAsRole(null);
                  } else {
                    setViewAsRole(v as AdminRole);
                  }
                  router.push("/admin");
                }}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="min-w-[220px]">
                  <SelectItem value="superadmin" className="text-sm py-2">
                    <span className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-red-600" />
                      Super Admin (me)
                    </span>
                  </SelectItem>
                  <SelectItem value="segretario_provinciale" className="text-sm py-2">
                    <span className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-[#1B3A6B]" />
                      Segretario Provinciale
                    </span>
                  </SelectItem>
                  <SelectItem value="resp_comunicazione" className="text-sm py-2">
                    <span className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-blue-500" />
                      Resp. Comunicazione
                    </span>
                  </SelectItem>
                  <SelectItem value="resp_tesseramento" className="text-sm py-2">
                    <span className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-green-600" />
                      Resp. Tesseramento
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {navItems.map((item) => {
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-[#1B3A6B] text-white"
                    : "text-foreground/70 hover:bg-accent hover:text-foreground"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
          <div className="mt-4 border-t pt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="w-full justify-start gap-2 text-muted-foreground"
            >
              <LogOut className="h-4 w-4" />
              Esci
            </Button>
          </div>
        </nav>
      </aside>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 rounded-t-2xl bg-white p-4 pb-8 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#1B3A6B]">{userEmail}</p>
                <p className="text-xs text-muted-foreground">
                  {role && roleLabels[role]}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Impersonation on mobile */}
            {isSuperadmin && (
              <div className="mb-4 rounded-md border p-3">
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2 font-medium">
                  Visualizza come
                </p>
                <Select
                  value={viewAsRole || "superadmin"}
                  onValueChange={(v) => {
                    if (v === "superadmin") {
                      setViewAsRole(null);
                    } else {
                      setViewAsRole(v as AdminRole);
                    }
                    setMobileMenuOpen(false);
                    router.push("/admin");
                  }}
                >
                  <SelectTrigger className="h-10 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="min-w-[240px]">
                    <SelectItem value="superadmin" className="text-sm py-2.5">
                      <span className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-red-600" />
                        Super Admin (me)
                      </span>
                    </SelectItem>
                    <SelectItem value="segretario_provinciale" className="text-sm py-2.5">
                      <span className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-[#1B3A6B]" />
                        Segretario Provinciale
                      </span>
                    </SelectItem>
                    <SelectItem value="resp_comunicazione" className="text-sm py-2.5">
                      <span className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-blue-500" />
                        Resp. Comunicazione
                      </span>
                    </SelectItem>
                    <SelectItem value="resp_tesseramento" className="text-sm py-2.5">
                      <span className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-green-600" />
                        Resp. Tesseramento
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-4 gap-2">
              {navItems.map((item) => {
                const active =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex flex-col items-center gap-1 rounded-lg p-3 text-[11px] ${
                      active
                        ? "bg-[#1B3A6B] text-white"
                        : "bg-muted/50 text-foreground/70"
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogout();
              }}
              className="mt-4 w-full justify-center gap-2 text-muted-foreground"
            >
              <LogOut className="h-4 w-4" />
              Esci
            </Button>
          </div>
        </div>
      )}

      {/* Mobile bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-white md:hidden">
        <nav className="flex justify-around p-2">
          {navItems.slice(0, 4).map((item) => {
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-0.5 rounded-md px-2 py-1 text-[10px] ${
                  active
                    ? "text-[#1B3A6B] font-semibold"
                    : "text-muted-foreground"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="flex flex-col items-center gap-0.5 rounded-md px-2 py-1 text-[10px] text-muted-foreground"
          >
            <MoreHorizontal className="h-4 w-4" />
            Altro
          </button>
        </nav>
      </div>

      <div
        className={`flex-1 overflow-auto pb-20 md:pb-0 ${
          isImpersonating ? "pt-10" : ""
        }`}
      >
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">{children}</div>
      </div>
    </div>
  );
}
