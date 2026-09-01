import type { Metadata } from "next";
import { getBestFor } from "@/content/best-for";
import { pageMetadata } from "@/lib/seo";
import { BestForPage } from "@/components/bestfor/BestForPage";

const content = getBestFor("best-for-home-backup")!;

export const metadata: Metadata = pageMetadata({
  title: content.title,
  description: content.metaDescription,
  path: "/best-for-home-backup",
});

export default function Page() {
  return <BestForPage content={content} />;
}
