import type { Metadata } from "next";
import { WorksIndex } from "@/src/components/works/WorksIndex";

export const metadata: Metadata = {
  title: "Work",
  description: "Selected creative development and WebGL projects.",
};

export default function WorksPage() {
  return <WorksIndex />;
}
