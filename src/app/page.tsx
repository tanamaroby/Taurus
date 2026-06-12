import type { Metadata } from "next";
import { headers } from "next/headers";

import { SchedulePlanner } from "@/components/schedule-planner";

async function getMetadataBase() {
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "https";

  if (!host) {
    return undefined;
  }

  return new URL(`${protocol}://${host}`);
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Taurus — WhatsApp Schedule Blocker",
    description:
      "Create clear plain-text blocked date summaries to copy into WhatsApp.",
    metadataBase: await getMetadataBase(),
    openGraph: {
      title: "Taurus — WhatsApp Schedule Blocker",
      description:
        "Create clear plain-text blocked date summaries to copy into WhatsApp.",
      images: [{ url: "/og", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      images: ["/og"],
    },
  };
}

export default function Home() {
  return <SchedulePlanner />;
}
