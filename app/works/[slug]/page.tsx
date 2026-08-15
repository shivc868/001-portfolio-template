import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProject, nextProject, projects } from "@/src/data/projects";
import { WorkDetail } from "@/src/components/works/WorkDetail";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/works/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.summary,
    openGraph: { images: [project.poster] },
  };
}

export default async function WorkDetailPage({ params }: PageProps<"/works/[slug]">) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();
  return <WorkDetail project={project} next={nextProject(slug)} />;
}
