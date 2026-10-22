import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout } from "@/components/LegalLayout";
import { LEGAL_CONFIG } from "@/lib/legal-config";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: `Terms of Service | ${LEGAL_CONFIG.APP_NAME}` },
      {
        name: "description",
        content: `Terms of Service and User Agreement for ${LEGAL_CONFIG.APP_NAME}.`,
      },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <LegalLayout
      title="Terms of Service"
      version={LEGAL_CONFIG.TERMS_VERSION}
      lastUpdated={LEGAL_CONFIG.TERMS_LAST_UPDATED}
    >
      <section>
        <h2 className="font-display text-xl font-bold italic tracking-tight text-foreground">
          1. Agreement to Terms
        </h2>
        <p className="mt-2">
          By accessing or creating an account on {LEGAL_CONFIG.APP_NAME} ("Service"), provided by {LEGAL_CONFIG.OPERATOR_NAME} ("we", "us", or "our"), you agree to be bound by these Terms of Service. If you do not agree, you must not access or use the Service.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-bold italic tracking-tight text-foreground">
          2. Description of Service & Medical Disclaimer
        </h2>
        <p className="mt-2">
          The Service provides a minimalist personal habit and routine tracking dashboard designed to help you build positive daily consistency.
        </p>
        <div className="mt-3 rounded border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-900 dark:text-amber-200">
          <strong className="font-semibold">Health & Medical Disclaimer:</strong> The Service, including sleep logging and habit metrics, is for self-tracking, productivity, and personal awareness purposes only. It is not medical or psychiatric advice, diagnosis, or treatment. Always consult qualified healthcare professionals regarding any health or sleep concerns.
        </div>
      </section>

      <section>
        <h2 className="font-display text-xl font-bold italic tracking-tight text-foreground">
          3. Account Registration & Security
        </h2>
        <p className="mt-2">
          To track habits, you must create an account. You agree to provide a valid email address and maintain the confidentiality of your credentials. You are responsible for all activities occurring under your account. You must notify us immediately at <a href={`mailto:${LEGAL_CONFIG.CONTACT_EMAIL}`} className="underline">{LEGAL_CONFIG.CONTACT_EMAIL}</a> if you detect unauthorized access.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-bold italic tracking-tight text-foreground">
          4. User Content & Data Ownership
        </h2>
        <p className="mt-2">
          You retain all ownership rights to the habit names, checkmarks, sleep logs, and monthly notes ("User Content") you input into the Service. We claim no intellectual property rights over your personal tracker data. You grant us only the limited technical license necessary to store, retrieve, and display your data back to you.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-bold italic tracking-tight text-foreground">
          5. Acceptable Use
        </h2>
        <p className="mt-2">You agree not to:</p>
        <ul className="mt-2 list-disc pl-5 space-y-1">
          <li>Attempt to compromise, probe, or breach the security of the Service or its database.</li>
          <li>Scrape or reverse engineer the proprietary user interface or backend scripts.</li>
          <li>Use automated bots or scripts to overwhelm the server or database infrastructure.</li>
        </ul>
      </section>

      <section>
        <h2 className="font-display text-xl font-bold italic tracking-tight text-foreground">
          6. Termination & Account Deletion
        </h2>
        <p className="mt-2">
          You may terminate your account at any time using the self-service "Erase Account & Data" feature inside the app. Upon confirmation, all your stored habits, logs, and notes will be permanently destroyed. We reserve the right to suspend or terminate accounts that breach these terms.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-bold italic tracking-tight text-foreground">
          7. Disclaimer of Warranties & Limitation of Liability
        </h2>
        <p className="mt-2">
          The Service is provided on an "AS IS" and "AS AVAILABLE" basis without warranties of any kind. To the maximum extent permitted by applicable law, we shall not be liable for any indirect, incidental, special, or consequential damages resulting from your use of or inability to use the Service.
        </p>
      </section>
    </LegalLayout>
  );
}
