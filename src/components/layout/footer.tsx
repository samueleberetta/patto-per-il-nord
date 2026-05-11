import Link from "next/link";
import { ExternalLink } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-[#1B3A6B] text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider">
              Patto per il Nord
            </h3>
            <p className="mt-3 text-sm text-white/70">
              Provincia di Monza e Brianza
            </p>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider">
              Navigazione
            </h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link href="/news" className="text-sm text-white/70 hover:text-white">
                  News
                </Link>
              </li>
              <li>
                <Link href="/organigramma" className="text-sm text-white/70 hover:text-white">
                  Organigramma
                </Link>
              </li>
              <li>
                <Link href="/eventi" className="text-sm text-white/70 hover:text-white">
                  Eventi
                </Link>
              </li>
              <li>
                <Link href="/comuni" className="text-sm text-white/70 hover:text-white">
                  Comuni
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider">
              Documenti
            </h3>
            <ul className="mt-3 space-y-2">
              <li>
                <a
                  href="https://www.pattoperilnord.it"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-white/70 hover:text-white"
                >
                  Statuto e Regolamenti
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.pattoperilnord.it"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-white/70 hover:text-white"
                >
                  Trasparenza
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.pattoperilnord.it"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-white/70 hover:text-white"
                >
                  Linee Programmatiche
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider">
              Contatti
            </h3>
            <ul className="mt-3 space-y-2">
              <li className="text-sm text-white/70">info@ppnbrianza.it</li>
              <li>
                <a
                  href="https://www.pattoperilnord.it"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-white/70 hover:text-white"
                >
                  Sito Federale
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider">
              Area riservata
            </h3>
            <p className="mt-3 text-sm text-white/70">
              Accesso riservato ai responsabili provinciali e comunali.
            </p>
            <Link
              href="/login"
              className="mt-3 inline-block rounded-md border border-white/30 px-4 py-2 text-sm font-medium text-white hover:bg-white/10 transition-colors"
            >
              Accedi all&apos;area riservata
            </Link>
          </div>
        </div>

        <div className="mt-10 border-t border-white/20 pt-6 text-center text-xs text-white/50">
          &copy; {new Date().getFullYear()} Patto per il Nord — Provincia di Monza e Brianza. Tutti i diritti riservati.
        </div>
      </div>
    </footer>
  );
}
