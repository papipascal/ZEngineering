-- CreateEnum
CREATE TYPE "DocumentFolder" AS ENUM ('CONTRACT', 'CLIENT_SPECS', 'ENGINEERING', 'EMAILS', 'OTHER');

-- CreateEnum
CREATE TYPE "EmailPurpose" AS ENUM ('INFORMATION', 'QUERY', 'DOCUMENT_SUBMISSION', 'COMMENT_REQUEST', 'OTHER');

-- CreateEnum
CREATE TYPE "EmailDocumentIntent" AS ENUM ('FOR_INFORMATION', 'AS_INPUT', 'FOR_COMMENTS');

-- AlterTable
ALTER TABLE "Document" ADD COLUMN "folder" "DocumentFolder" NOT NULL DEFAULT 'OTHER';

-- AlterTable
ALTER TABLE "IncomingEmail" ADD COLUMN "purpose" "EmailPurpose",
ADD COLUMN "documentIntent" "EmailDocumentIntent",
ADD COLUMN "isExternal" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "notes" TEXT;
