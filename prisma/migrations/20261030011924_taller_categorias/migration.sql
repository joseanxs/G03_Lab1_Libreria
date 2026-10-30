/*
  Warnings:

  - You are about to drop the column `category_id` on the `libros` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "libros" DROP CONSTRAINT "libros_category_id_fkey";

-- DropIndex
DROP INDEX "libros_category_id_idx";

-- AlterTable
ALTER TABLE "libros" DROP COLUMN "category_id";

-- CreateTable
CREATE TABLE "_BookToCategory" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_BookToCategory_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_BookToCategory_B_index" ON "_BookToCategory"("B");

-- AddForeignKey
ALTER TABLE "_BookToCategory" ADD CONSTRAINT "_BookToCategory_A_fkey" FOREIGN KEY ("A") REFERENCES "libros"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BookToCategory" ADD CONSTRAINT "_BookToCategory_B_fkey" FOREIGN KEY ("B") REFERENCES "categorias"("id") ON DELETE CASCADE ON UPDATE CASCADE;
