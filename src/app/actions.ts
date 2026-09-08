"use server";

import { redirect } from "next/navigation";
import { createProject } from "@/server/services/project-service";

export async function createProjectAction(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  if (!title) {
    throw new Error("Project title is required");
  }

  const project = await createProject({ title });
  redirect(`/projects/${project.id}/wizard`);
}
