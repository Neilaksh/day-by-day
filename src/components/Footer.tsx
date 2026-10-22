import { Link } from "@tanstack/react-router";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-card/60 py-8 px-4 print:hidden">
      <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div>
          <p className="font-display text-sm font-bold italic tracking-tight text-foreground">
            Getting 1% Better Each Day
          </p>
          <p className="font-mono text-[11px] text-muted-foreground mt-0.5">
            Small daily wins compound. © {currentYear} All rights reserved.
          </p>
        </div>

        <nav aria-label="Legal and policy links">
          <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-mono text-xs">
            <li>
              <Link
                to="/privacy"
                className="text-muted-foreground hover:text-foreground transition-colors underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-ring rounded-sm px-1 py-0.5"
              >
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link
                to="/terms"
                className="text-muted-foreground hover:text-foreground transition-colors underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-ring rounded-sm px-1 py-0.5"
              >
                Terms of Service
              </Link>
            </li>
            <li>
              <Link
                to="/cookies"
                className="text-muted-foreground hover:text-foreground transition-colors underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-ring rounded-sm px-1 py-0.5"
              >
                Cookie & Storage Policy
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
