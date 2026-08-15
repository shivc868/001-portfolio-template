import type { Metadata } from "next";
import { AboutContent } from "@/src/components/about/AboutContent";

export const metadata: Metadata = {
  title: "About",
  description:
    "Maren Voss — art director and photographer in Berlin. Identities, campaigns and books.",
};

export default function AboutPage() {
  return <AboutContent />;
}
