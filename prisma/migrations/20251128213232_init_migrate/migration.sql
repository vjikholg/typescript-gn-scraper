-- CreateEnum
CREATE TYPE "MathNodeTypes" AS ENUM ('text', 'fraction', 'sqrt', 'sub', 'sup', 'group');

-- CreateTable
CREATE TABLE "GroupInfo" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "tags" TEXT[],
    "generators" JSONB[],

    CONSTRAINT "GroupInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MathNode" (
    "id" TEXT NOT NULL,
    "type" "MathNodeTypes" NOT NULL,
    "payload" JSONB NOT NULL,
    "parentId" TEXT,

    CONSTRAINT "MathNode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharTableEntry" (
    "id" SERIAL NOT NULL,
    "groupInfoId" INTEGER NOT NULL,
    "mathNodeId" TEXT NOT NULL,
    "row" INTEGER NOT NULL,
    "column" INTEGER NOT NULL,

    CONSTRAINT "CharTableEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GroupInfo_id_key" ON "GroupInfo"("id");

-- CreateIndex
CREATE UNIQUE INDEX "GroupInfo_name_key" ON "GroupInfo"("name");

-- CreateIndex
CREATE INDEX "MathNode_parentId_idx" ON "MathNode"("parentId");

-- CreateIndex
CREATE INDEX "CharTableEntry_groupInfoId_idx" ON "CharTableEntry"("groupInfoId");

-- CreateIndex
CREATE INDEX "CharTableEntry_mathNodeId_idx" ON "CharTableEntry"("mathNodeId");

-- AddForeignKey
ALTER TABLE "MathNode" ADD CONSTRAINT "MathNode_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "MathNode"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharTableEntry" ADD CONSTRAINT "CharTableEntry_groupInfoId_fkey" FOREIGN KEY ("groupInfoId") REFERENCES "GroupInfo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharTableEntry" ADD CONSTRAINT "CharTableEntry_mathNodeId_fkey" FOREIGN KEY ("mathNodeId") REFERENCES "MathNode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
