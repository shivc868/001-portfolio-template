import type { Metadata } from "next";
import { ContactContent } from "@/src/components/contact/ContactContent";

export const metadata: Metadata = {
  title: "Contact",
  description: "Start a project with Maren Voss — art direction, photography, brand.",
};

export default function ContactPage() {
  return <ContactContent />;
}
