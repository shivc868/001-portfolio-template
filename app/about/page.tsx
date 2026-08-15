import type { Metadata } from "next";
import { AboutContent } from "@/src/components/about/AboutContent";

export const metadata: Metadata = {
  title: "About",
  description:
    "Akansha S. — creative developer in Bengaluru. WebGL, motion systems and production front-end.",
};

export default function AboutPage() {
  return <AboutContent />;
}
