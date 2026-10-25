import Script from "next/script";
import { analyticsBeforeSendScript } from "@/lib/analytics";

// Renders the Umami tracker only when both env vars were set at build time.
const SRC = process.env.NEXT_PUBLIC_UMAMI_SRC;
const WEBSITE_ID = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;

export function Analytics() {
  if (!SRC || !WEBSITE_ID) return null;
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: analyticsBeforeSendScript }} />
      <Script
        src={SRC}
        data-website-id={WEBSITE_ID}
        data-do-not-track="true"
        data-exclude-search="true"
        data-before-send="__apexBeforeSend"
        strategy="afterInteractive"
      />
    </>
  );
}
