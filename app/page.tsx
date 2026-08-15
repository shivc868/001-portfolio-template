import type { Metadata } from "next";
import { Hero } from "@/src/components/home/Hero";
import { ProjectSection } from "@/src/components/home/ProjectSection";
import { HomeRecognition } from "@/src/components/home/HomeRecognition";
import { projects } from "@/src/data/projects";

export const metadata: Metadata = {
  title: "Maren Voss — Art Director & Photographer, Berlin",
};

export default function Home() {
  // Every project gets a home section. ProjectVideo pauses whatever leaves the
  // viewport, so the deck never has more than two videos decoding at once and
  // the three-simultaneous ceiling (rule #19) still holds.
  const featured = projects;
  return (
    <main>
      <Hero />
      {featured.map((p, i) => (
        <ProjectSection key={p.slug} project={p} index={i} isLast={i === featured.length - 1} />
      ))}
      <HomeRecognition />
    </main>
  );
}
