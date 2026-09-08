-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'CREATOR', 'REVIEWER');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('DRAFT', 'NORMALIZED', 'GENERATING', 'AUDIO', 'REVIEW', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "ClipStatus" AS ENUM ('QUEUED', 'RUNNING', 'SUCCEEDED', 'FAILED');

-- CreateTable
CREATE TABLE "TeamMember" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" "Role" NOT NULL DEFAULT 'CREATOR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LmsModule" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,

    CONSTRAINT "LmsModule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Course" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "needsAssets" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharacterProfile" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "soulId" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CharacterProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReferenceImage" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "kind" TEXT,

    CONSTRAINT "ReferenceImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoraWeight" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "baseModel" TEXT NOT NULL,
    "trigger" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "LoraWeight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VideoProject" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "courseId" TEXT,
    "status" "ProjectStatus" NOT NULL DEFAULT 'DRAFT',
    "sourceLlm" TEXT,
    "rawPayload" JSONB,
    "sceneScript" JSONB,
    "joinedAudioUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VideoProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VideoClip" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "characterId" TEXT,
    "dialogue" TEXT NOT NULL,
    "promptSettings" JSONB NOT NULL,
    "cameraSettings" JSONB NOT NULL,
    "videoModel" TEXT NOT NULL,
    "jobId" TEXT,
    "outputUrl" TEXT,
    "audioUrl" TEXT,
    "status" "ClipStatus" NOT NULL DEFAULT 'QUEUED',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VideoClip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VideoClipAttempt" (
    "id" TEXT NOT NULL,
    "clipId" TEXT NOT NULL,
    "attempt" INTEGER NOT NULL,
    "status" "ClipStatus" NOT NULL,
    "request" JSONB NOT NULL,
    "response" JSONB,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VideoClipAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TeamMember_email_key" ON "TeamMember"("email");

-- CreateIndex
CREATE UNIQUE INDEX "LmsModule_code_key" ON "LmsModule"("code");

-- CreateIndex
CREATE UNIQUE INDEX "CharacterProfile_soulId_key" ON "CharacterProfile"("soulId");

-- CreateIndex
CREATE UNIQUE INDEX "VideoClip_projectId_order_key" ON "VideoClip"("projectId", "order");

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "LmsModule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReferenceImage" ADD CONSTRAINT "ReferenceImage_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "CharacterProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoraWeight" ADD CONSTRAINT "LoraWeight_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "CharacterProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoProject" ADD CONSTRAINT "VideoProject_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "TeamMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoProject" ADD CONSTRAINT "VideoProject_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoClip" ADD CONSTRAINT "VideoClip_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "VideoProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoClip" ADD CONSTRAINT "VideoClip_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "CharacterProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoClipAttempt" ADD CONSTRAINT "VideoClipAttempt_clipId_fkey" FOREIGN KEY ("clipId") REFERENCES "VideoClip"("id") ON DELETE CASCADE ON UPDATE CASCADE;
