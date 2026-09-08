"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

export async function createProjectAction(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  if (!title) {
    throw new Error("Project title is required");
  }

  const owner = await prisma.teamMember.findFirst({
    orderBy: { createdAt: "asc" },
  });

  if (!owner) {
    throw new Error("No team member found. Run pnpm db:seed first.");
  }

  const project = await prisma.videoProject.create({
    data: {
      title,
      ownerId: owner.id,
      status: "DRAFT",
    },
  });

  revalidatePath("/");
  redirect(`/?created=${project.id}`);
}
