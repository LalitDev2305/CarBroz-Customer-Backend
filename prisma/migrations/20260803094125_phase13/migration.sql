-- CreateTable
CREATE TABLE "SduiScreen" (
    "id" SERIAL NOT NULL,
    "publicId" TEXT NOT NULL,
    "screenId" TEXT NOT NULL,
    "targetApp" TEXT NOT NULL DEFAULT 'CUSTOMER',
    "layoutJson" JSONB NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "SduiScreen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SduiTemplate" (
    "id" SERIAL NOT NULL,
    "publicId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "templateType" TEXT NOT NULL,
    "defaultLayoutJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SduiTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SduiComponentRegistry" (
    "id" SERIAL NOT NULL,
    "publicId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "componentType" TEXT NOT NULL,
    "schemaJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SduiComponentRegistry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SduiScreen_publicId_key" ON "SduiScreen"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "SduiScreen_screenId_targetApp_key" ON "SduiScreen"("screenId", "targetApp");

-- CreateIndex
CREATE UNIQUE INDEX "SduiTemplate_publicId_key" ON "SduiTemplate"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "SduiTemplate_templateId_key" ON "SduiTemplate"("templateId");

-- CreateIndex
CREATE UNIQUE INDEX "SduiComponentRegistry_publicId_key" ON "SduiComponentRegistry"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "SduiComponentRegistry_name_key" ON "SduiComponentRegistry"("name");
