import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout } from "@/components/LegalLayout";
import { LEGAL_CONFIG } from "@/lib/legal-config";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: `Privacy Policy | ${LEGAL_CONFIG.APP_NAME}` },
      {
        name: "description",
        content: `Privacy Policy and Data Protection Notice for ${LEGAL_CONFIG.APP_NAME}. GDPR & CCPA compliant data handling.`,
      },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      version={LEGAL_CONFIG.PRIVACY_VERSION}
      lastUpdated={LEGAL_CONFIG.PRIVACY_LAST_UPDATED}
    >
      <section>
        <h2 className="font-display text-xl font-bold italic tracking-tight text-foreground">
          1. Data Controller Information
        </h2>
        <p className="mt-2">
          The data controller responsible for the processing of personal data on this website is:
        </p>
        <div className="mt-3 rounded border border-border bg-card p-3 font-mono text-xs">
          <p className="font-bold text-foreground">{LEGAL_CONFIG.OPERATOR_NAME}</p>
          <p className="text-muted-foreground mt-1">{LEGAL_CONFIG.OPERATOR_ADDRESS}</p>
          <p className="mt-2 text-primary">
            Contact & Data Requests:{" "}
            <a href={`mailto:${LEGAL_CONFIG.CONTACT_EMAIL}`} className="underline">
              {LEGAL_CONFIG.CONTACT_EMAIL}
            </a>
          </p>
        </div>
      </section>

      <section>
        <h2 className="font-display text-xl font-bold italic tracking-tight text-foreground">
          2. Data Minimization Audit: What We Collect & Why
        </h2>
        <p className="mt-2">
          We adhere strictly to the principle of data minimization (GDPR Art. 5(1)(c)). We only collect and process data strictly necessary to deliver the personal habit tracking service:
        </p>
        <ul className="mt-3 list-disc pl-5 space-y-2">
          <li>
            <strong>Account Credentials:</strong> Your email address and encrypted password hash (managed securely via Supabase Auth) to authenticate your access.
          </li>
          <li>
            <strong>Habit Protocols:</strong> Custom titles and display order of the habits or routines you create.
          </li>
          <li>
            <strong>Daily Checkmarks:</strong> Boolean completion indicators (true/false) associated with dates you mark.
          </li>
          <li>
            <strong>Sleep Records:</strong> Self-reported integer sleep hours (5 to 9+ hours) per date.
          </li>
          <li>
            <strong>Monthly Reflections:</strong> Plain-text reflection notes written by you.
          </li>
        </ul>
        <div className="mt-3 rounded border border-destructive/20 bg-destructive/5 p-3 text-xs text-foreground/90">
          <strong className="text-destructive font-semibold">Special Category Notice (GDPR Art. 9):</strong> Sleep records and free-text notes reflect personal lifestyle metrics. We urge you <em>not</em> to enter sensitive medical diagnoses, medication logs, or health records into free-text fields.
        </div>
      </section>

      <section>
        <h2 className="font-display text-xl font-bold italic tracking-tight text-foreground">
          3. Lawful Basis for Processing (GDPR Art. 6 & Art. 9)
        </h2>
        <p className="mt-2">
          We process your personal data under the following legal bases:
        </p>
        <ul className="mt-2 list-disc pl-5 space-y-1">
          <li>
            <strong>Performance of Contract (Art. 6(1)(b)):</strong> To provide the tracker board, sync records across devices, and deliver core features you requested by signing up.
          </li>
          <li>
            <strong>Explicit Consent (Art. 9(2)(a)):</strong> For health-adjacent lifestyle logging (such as sleep hours), by voluntarily inputting these values you provide explicit consent to process them for personal visualization. You may delete these logs at any time.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="font-display text-xl font-bold italic tracking-tight text-foreground">
          4. Infrastructure, Third Parties & Data Transfers
        </h2>
        <p className="mt-2">
          We do not sell, rent, or monetize your personal data. We engage only essential infrastructure providers:
        </p>
        <ul className="mt-3 list-disc pl-5 space-y-2">
          <li>
            <strong>Supabase Inc. (Database & Auth):</strong> Cloud database hosting with strict Row Level Security (RLS) ensuring that your habits and notes can only be read by your authenticated user ID. Hosting Region: <code>{LEGAL_CONFIG.SUPABASE_REGION}</code>. Transfers governed by Standard Contractual Clauses (SCCs).
          </li>
          <li>
            <strong>Zero External Fonts CDN:</strong> All typography (Archivo & IBM Plex Mono) is 100% self-hosted from local files. No requests or IP addresses are sent to Google Fonts servers.
          </li>
          <li>
            <strong>Zero Third-Party Advertising or Trackers:</strong> We do not include Google Analytics, Facebook Pixel, or any advertising SDKs.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="font-display text-xl font-bold italic tracking-tight text-foreground">
          5. Your Legal Rights (GDPR & CCPA/CPRA)
        </h2>
        <p className="mt-2">
          Depending on your location, you have the following enforceable legal rights:
        </p>
        <ul className="mt-2 list-disc pl-5 space-y-1">
          <li>
            <strong>Right to Access & Portability (Art. 15 & 20):</strong> You can export a full, structured JSON copy of all your data at any time via the in-app "Export Personal Data" button.
          </li>
          <li>
            <strong>Right to Erasure / Right to be Forgotten (Art. 17):</strong> You can permanently wipe your account and all associated habit and sleep records using the in-app "Erase Account & Data" tool.
          </li>
          <li>
            <strong>Right to Complain:</strong> You have the right to lodge a complaint with an EU data protection supervisory authority (such as your national Data Protection Commissioner).
          </li>
          <li>
            <strong>California Privacy Notice (CCPA/CPRA):</strong> We do not sell or share personal information. California consumers have the right to know, delete, and receive non-discriminatory service.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="font-display text-xl font-bold italic tracking-tight text-foreground">
          6. Age Limitations
        </h2>
        <p className="mt-2">
          Our service is intended for users who are at least <strong>{LEGAL_CONFIG.MINIMUM_AGE} years of age</strong>. We do not knowingly collect personal information from children under this age threshold.
        </p>
      </section>
    </LegalLayout>
  );
}
