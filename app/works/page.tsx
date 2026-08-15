import type { Metadata } from "next";
import { WorksIndex } from "@/src/components/works/WorksIndex";

export const metadata: Metadata = {
  title: "Design",
  description: "Selected design and art-direction projects.",
};

export default function WorksPage() {
  return <WorksIndex />;
}
