import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-url";
import { getPublishedProjects } from "@/lib/data/projects";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await getPublishedProjects();
  const projectEntries = projects.map((project) => ({
    url: `${SITE_URL}/projetos/${project.slug}`,
    lastModified: project.updated_at,
  }));

  return [
    { url: SITE_URL, lastModified: new Date() },
    { url: `${SITE_URL}/sobre`, lastModified: new Date() },
    ...projectEntries,
  ];
}
