/*
  Warnings:

  - Added the required column `schoolOrg` to the `Student` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Student" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "graduationYear" INTEGER NOT NULL,
    "phoneNumber" TEXT,
    "promisingStudent" BOOLEAN NOT NULL DEFAULT false,
    "schoolOrg" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zipCode" TEXT
);
INSERT INTO "new_Student" ("createdAt", "email", "firstName", "graduationYear", "id", "lastName", "phoneNumber", "promisingStudent", "updatedAt") SELECT "createdAt", "email", "firstName", "graduationYear", "id", "lastName", "phoneNumber", coalesce("promisingStudent", false) AS "promisingStudent", "updatedAt" FROM "Student";
DROP TABLE "Student";
ALTER TABLE "new_Student" RENAME TO "Student";
CREATE UNIQUE INDEX "Student_email_key" ON "Student"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
