/*
  Warnings:

  - You are about to alter the column `role` on the `member` table. The data in that column could be lost. The data in that column will be cast from `Text` to `Enum(EnumId(1))`.

*/
-- AlterTable
ALTER TABLE `member` MODIFY `role` ENUM('OWNER', 'ADMIN', 'MEMBER') NOT NULL DEFAULT 'MEMBER';

-- AlterTable
ALTER TABLE `user` ADD COLUMN `role` ENUM('OWNER', 'ADMIN', 'MEMBER') NOT NULL DEFAULT 'MEMBER';
