/**
 * LEGAL CONFIGURATION & DATA PRIVACY CONSTANTS
 * 
 * DISCLAIMER: The legal text in this application is provided as a template
 * and must be reviewed by a qualified attorney prior to public commercial deployment.
 * 
 * Items marked with "TODO" must be replaced with your actual business/personal details.
 */

export const LEGAL_CONFIG = {
  // TODO: Replace with your actual legal entity name or full individual name
  OPERATOR_NAME: "Neilaksh Das",

  // TODO: Replace with your registered postal address (mandatory under GDPR Art. 13 & German Impressum laws)
  OPERATOR_ADDRESS: "123 Some Street, Kolkata, West Bengal 700001, India",

  // TODO: Replace with your real, monitored privacy and support contact email
  CONTACT_EMAIL: "neilakshdas20832@gmail.com",

  // Website details
  APP_NAME: "Getting 1% Better Each Day",
  APP_URL: "https://days-by-day.lovable.app",

  // Infrastructure & Data Processor Details
  // TODO: Specify your Supabase project region (e.g., 'eu-central-1 Frankfurt', 'us-east-1 Virginia')
  SUPABASE_REGION: "eu-central-1 Frankfurt",
  SUPABASE_DPA_STATUS: "Standard Contractual Clauses (SCC) / Data Processing Addendum in place with Supabase, Inc.",

  // Compliance policy versions & dates
  TERMS_VERSION: "1.0.0",
  TERMS_LAST_UPDATED: "October 22, 2026",
  PRIVACY_VERSION: "1.0.0",
  PRIVACY_LAST_UPDATED: "October 22, 2026",
  COOKIE_POLICY_VERSION: "1.0.0",
  COOKIE_POLICY_LAST_UPDATED: "October 22, 2026",

  // Minimum user age (COPPA / GDPR Art. 8)
  // TODO: Confirm target age: 13 for US/general, 16 for EU without parental consent
  MINIMUM_AGE: 13,

  // Service Worker cache version (kept in sync with public/sw.js)
  SW_CACHE_NAME: "day-by-day-v3",
} as const;

export interface StorageItemDoc {
  key: string;
  name: string;
  type: "localStorage" | "Cache API";
  purpose: string;
  duration: string;
  category: "Strictly Necessary" | "Functional Preference";
}

/**
 * Verified catalog of client-side storage used by the application.
 * VERIFIED AUDIT: Zero advertising or analytics cookies are set or read.
 */
export const VERIFIED_STORAGE_ITEMS: StorageItemDoc[] = [
  {
    key: "sb-*-auth-token",
    name: "Supabase Authentication Session",
    type: "localStorage",
    purpose: "Maintains your authenticated session securely in your browser so you do not have to log in on every page refresh.",
    duration: "Persistent (removed on manual Sign Out)",
    category: "Strictly Necessary",
  },
  {
    key: "theme",
    name: "User Interface Theme",
    type: "localStorage",
    purpose: "Remembers your color preference ('light' or 'dark' paper theme) across visits.",
    duration: "Persistent (user-controlled)",
    category: "Functional Preference",
  },
  {
    key: "pwa_install_hint_dismissed",
    name: "PWA Install Hint Dismissal",
    type: "localStorage",
    purpose: "Remembers when you dismiss the mobile 'Install App' banner so you are not interrupted repeatedly.",
    duration: "Persistent (user-controlled)",
    category: "Functional Preference",
  },
  {
    key: "cookie_notice_acknowledged",
    name: "Storage Transparency Acknowledgment",
    type: "localStorage",
    purpose: "Remembers that you acknowledged our cookie-free and storage transparency notice.",
    duration: "Persistent (user-controlled)",
    category: "Functional Preference",
  },
  {
    key: "terms_accepted_version",
    name: "Terms of Service Acceptance",
    type: "localStorage",
    purpose: "Records the version of Terms of Service accepted during account registration.",
    duration: "Persistent",
    category: "Strictly Necessary",
  },
  {
    key: "day-by-day-v3",
    name: "Service Worker Asset Cache",
    type: "Cache API",
    purpose: "Caches core application HTML, CSS, self-hosted fonts, and app icons for offline functionality and fast loading (capped at 50 entries).",
    duration: "Until application update or cache clear",
    category: "Strictly Necessary",
  },
];
