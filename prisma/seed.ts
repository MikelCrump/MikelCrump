import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.videoClipAttempt.deleteMany();
  await prisma.videoClip.deleteMany();
  await prisma.videoProject.deleteMany();
  await prisma.loraWeight.deleteMany();
  await prisma.referenceImage.deleteMany();
  await prisma.characterProfile.deleteMany();
  await prisma.course.deleteMany();
  await prisma.lmsModule.deleteMany();
  await prisma.teamMember.deleteMany();

  const owner = await prisma.teamMember.create({
    data: {
      email: "mikel@crump.studio",
      name: "Mikel Crump",
      role: Role.ADMIN,
    },
  });

  const lmsModule = await prisma.lmsModule.create({
    data: {
      name: "Foundations of Leadership",
      code: "LDR-101",
      courses: {
        create: [
          {
            title: "Leading Through Ambiguity",
            needsAssets: true,
          },
          {
            title: "Feedback That Lands",
            needsAssets: true,
          },
        ],
      },
    },
    include: { courses: true },
  });

  const lecturerA = await prisma.characterProfile.create({
    data: {
      name: "Dr. Ava Ren",
      soulId: "soul_ava_ren_01",
      description: "Warm, precise lecturer. Mid-40s. Studio-ready presence.",
      referenceImages: {
        create: [
          {
            url: "https://placehold.co/512x512/1a1a1a/f5f0e8?text=Ava+Front",
            kind: "front",
          },
          {
            url: "https://placehold.co/512x512/1a1a1a/f5f0e8?text=Ava+3Q",
            kind: "three-quarter",
          },
        ],
      },
      loraWeights: {
        create: [
          {
            label: "ava-ren-v1",
            fileUrl: "https://example.invalid/loras/ava-ren-v1.safetensors",
            baseModel: "sdxl",
            trigger: "ava_ren_soul",
            isActive: true,
          },
        ],
      },
    },
  });

  const lecturerB = await prisma.characterProfile.create({
    data: {
      name: "Marcus Hale",
      soulId: "soul_marcus_hale_01",
      description: "Measured, conversational lecturer. Early 50s. Soft studio key.",
      referenceImages: {
        create: [
          {
            url: "https://placehold.co/512x512/102a2a/e8f5f0?text=Marcus+Front",
            kind: "front",
          },
          {
            url: "https://placehold.co/512x512/102a2a/e8f5f0?text=Marcus+Profile",
            kind: "profile",
          },
        ],
      },
      loraWeights: {
        create: [
          {
            label: "marcus-hale-v2",
            fileUrl: "https://example.invalid/loras/marcus-hale-v2.safetensors",
            baseModel: "sdxl",
            trigger: "marcus_hale_soul",
            isActive: true,
          },
        ],
      },
    },
  });

  await prisma.videoProject.create({
    data: {
      title: "Sample: Leading Through Ambiguity — Intro",
      ownerId: owner.id,
      courseId: lmsModule.courses[0]?.id,
      status: "DRAFT",
      sourceLlm: "claude",
    },
  });

  console.log("Seeded Crump Studio:");
  console.log(`  TeamMember: ${owner.email}`);
  console.log(`  Module: ${lmsModule.code} (${lmsModule.courses.length} courses)`);
  console.log(`  Characters: ${lecturerA.name}, ${lecturerB.name}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
