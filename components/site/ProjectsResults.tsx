import ProjectCard from "@/components/site/ProjectCard";
import Reveal from "@/components/site/Reveal";
import { getProjects } from "@/lib/queries";

export default async function ProjectsResults() {
  const projects = (await getProjects()).slice(0, 4);

  if (projects.length === 0) {
    return (
      <p className="rounded-card-sm border border-dashed border-line p-10 text-center text-muted">
        Projects are on their way — check back soon.
      </p>
    );
  }

  return (
    <Reveal className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </Reveal>
  );
}
