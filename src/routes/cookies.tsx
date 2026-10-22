import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout } from "@/components/LegalLayout";
import { LEGAL_CONFIG, VERIFIED_STORAGE_ITEMS } from "@/lib/legal-config";

export const Route = createFileRoute("/cookies")({
  head: () => ({
    meta: [
      { title: `Cookie & Storage Policy | ${LEGAL_CONFIG.APP_NAME}` },
      {
        name: "description",
        content: `Detailed Cookie & Local Storage Disclosure for ${LEGAL_CONFIG.APP_NAME}. Zero tracking cookies; strictly necessary client storage only.`,
      },
    ],
  }),
  component: CookiesPage,
});

function CookiesPage() {
  return (
    <LegalLayout
      title="Cookie & Local Storage Policy"
      version={LEGAL_CONFIG.COOKIE_POLICY_VERSION}
      lastUpdated={LEGAL_CONFIG.COOKIE_POLICY_LAST_UPDATED}
    >
      <section>
        <h2 className="font-display text-xl font-bold italic tracking-tight text-foreground">
          1. Our Zero-Cookie Architecture
        </h2>
        <p className="mt-2">
          {LEGAL_CONFIG.APP_NAME} does <strong>not</strong> set or read any advertising, tracking, or marketing cookies. We do not track you across other websites, and we do not use third-party behavioral profiling tools.
        </p>
        <p className="mt-2">
          Instead, we use modern client-side storage technologies (<code>localStorage</code> and the browser <code>Cache API</code>) strictly to provide core features you request, such as keeping you logged in and remembering your visual paper theme.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-bold italic tracking-tight text-foreground">
          2. Complete Inventory of Client-Side Storage
        </h2>
        <p className="mt-2">
          Below is a complete, audited list of all items stored on your device:
        </p>
        <div className="mt-4 overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-left font-mono text-xs">
            <thead className="border-b border-border bg-muted/60 text-foreground font-semibold">
              <tr>
                <th scope="col" className="p-3">Key / Identifier</th>
                <th scope="col" className="p-3">Storage Type</th>
                <th scope="col" className="p-3">Category</th>
                <th scope="col" className="p-3">Duration</th>
                <th scope="col" className="p-3">Purpose</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {VERIFIED_STORAGE_ITEMS.map((item) => (
                <tr key={item.key} className="hover:bg-muted/20">
                  <td className="p-3 font-bold text-foreground">
                    <code>{item.key}</code>
                  </td>
                  <td className="p-3 text-muted-foreground">{item.type}</td>
                  <td className="p-3">
                    <span
                      className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                        item.category === "Strictly Necessary"
                          ? "bg-primary/10 text-primary"
                          : "bg-secondary text-secondary-foreground"
                      }`}
                    >
                      {item.category}
                    </span>
                  </td>
                  <td className="p-3 text-muted-foreground">{item.duration}</td>
                  <td className="p-3 text-foreground/90 font-sans text-xs">{item.purpose}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="font-display text-xl font-bold italic tracking-tight text-foreground">
          3. Legal Justification under ePrivacy Directive (Art. 5(3))
        </h2>
        <p className="mt-2">
          Under European Union ePrivacy Directive (Directive 2002/58/EC as amended) and UK PECR regulations, storage that is <em>strictly necessary</em> to deliver a service explicitly requested by the user does not require prior opt-in consent banners.
        </p>
        <p className="mt-2">
          Because our storage is limited to your authenticated session token, user-chosen visual theme, and offline service worker assets, we do not present an intrusive blocking cookie barrier. We provide this disclosure page and transparency notice in the interest of complete openness.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-bold italic tracking-tight text-foreground">
          4. How to Clear or Block Local Storage
        </h2>
        <p className="mt-2">
          You can clear all stored items at any time through your browser settings:
        </p>
        <ul className="mt-2 list-disc pl-5 space-y-1">
          <li>
            <strong>Chrome / Chromium:</strong> Settings → Privacy and Security → Site settings → View permissions and data stored across sites → Search for this domain → "Clear data".
          </li>
          <li>
            <strong>Firefox:</strong> Settings → Privacy & Security → Cookies and Site Data → Manage Data → Remove selected.
          </li>
          <li>
            <strong>Safari (iOS / macOS):</strong> Settings → Safari → Advanced → Website Data → Remove all or select domain.
          </li>
        </ul>
        <p className="mt-3 text-xs text-muted-foreground">
          Note: Clearing local storage will sign you out of your account on this device and reset your theme to system default.
        </p>
      </section>
    </LegalLayout>
  );
}
