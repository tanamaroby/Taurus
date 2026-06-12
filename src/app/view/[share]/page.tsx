import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { ScheduleViewer } from "@/components/schedule-viewer";
import { describeScheduleShare } from "@/lib/schedule";
import { getSharedScheduleBySlug } from "@/lib/share-store";

type ViewPageProps = {
  params: Promise<{
    share: string;
  }>;
};

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

export async function generateMetadata({
  params,
}: ViewPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const schedule = await getSharedScheduleBySlug(resolvedParams.share);
  const safeSchedule = schedule ?? {
    messageTitle: "Taurus shared view",
    ranges: [],
  };
  const summary = describeScheduleShare(safeSchedule);

  return {
    title: summary.title,
    description: summary.description,
    metadataBase: await getMetadataBase(),
    openGraph: {
      title: summary.title,
      description: summary.description,
      images: [
        {
          url: `/og?slug=${resolvedParams.share}`,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: summary.title,
      description: summary.description,
      images: [`/og?slug=${resolvedParams.share}`],
    },
  };
}

export default async function SharedViewPage({ params }: ViewPageProps) {
  const resolvedParams = await params;
  const schedule = await getSharedScheduleBySlug(resolvedParams.share);

  if (!schedule) {
    notFound();
  }

  return <ScheduleViewer schedule={schedule} />;
}
