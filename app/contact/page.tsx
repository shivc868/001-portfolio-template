import type { Metadata } from "next";
import { ContactContent } from "@/src/components/contact/ContactContent";

export const metadata: Metadata = {
  title: "Contact",
  description: "Start a build with Akansha S. — WebGL, motion and creative front-end.",
};

export default function ContactPage() {
  return <ContactContent />;
}
