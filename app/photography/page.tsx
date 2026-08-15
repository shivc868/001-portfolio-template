import type { Metadata } from "next";
import { PhotoGallery } from "@/src/components/photography/PhotoGallery";

export const metadata: Metadata = {
  title: "Photography",
  description: "Selected photography — documentary, editorial and place.",
};

export default function PhotographyPage() {
  return <PhotoGallery />;
}
