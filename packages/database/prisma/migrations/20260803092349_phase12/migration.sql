-- CreateTable
CREATE TABLE "ServiceCategory" (
    "id" SERIAL NOT NULL,
    "publicId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "iconUrl" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ServiceCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Service" (
    "id" SERIAL NOT NULL,
    "publicId" TEXT NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "basePrice" INTEGER NOT NULL,
    "estimatedDurationMinutes" INTEGER NOT NULL DEFAULT 60,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceAddon" (
    "id" SERIAL NOT NULL,
    "publicId" TEXT NOT NULL,
    "serviceId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ServiceAddon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PricingTier" (
    "id" SERIAL NOT NULL,
    "publicId" TEXT NOT NULL,
    "serviceId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "flatPrice" INTEGER NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PricingTier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VehicleTypeMultiplier" (
    "id" SERIAL NOT NULL,
    "publicId" TEXT NOT NULL,
    "serviceId" INTEGER NOT NULL,
    "vehicleType" TEXT NOT NULL,
    "multiplier" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VehicleTypeMultiplier_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ServiceCategory_publicId_key" ON "ServiceCategory"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceCategory_slug_key" ON "ServiceCategory"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Service_publicId_key" ON "Service"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "Service_slug_key" ON "Service"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceAddon_publicId_key" ON "ServiceAddon"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "PricingTier_publicId_key" ON "PricingTier"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "VehicleTypeMultiplier_publicId_key" ON "VehicleTypeMultiplier"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "VehicleTypeMultiplier_serviceId_vehicleType_key" ON "VehicleTypeMultiplier"("serviceId", "vehicleType");

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ServiceCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceAddon" ADD CONSTRAINT "ServiceAddon_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PricingTier" ADD CONSTRAINT "PricingTier_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleTypeMultiplier" ADD CONSTRAINT "VehicleTypeMultiplier_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;
