-- CreateTable
CREATE TABLE `Veiculo` (
    `id` CHAR(36) NOT NULL,
    `placa` VARCHAR(7) NOT NULL,
    `marca` VARCHAR(100) NOT NULL,
    `modelo` VARCHAR(100) NOT NULL,
    `ano` INTEGER NOT NULL,
    `cor` VARCHAR(50) NOT NULL,
    `proprietarioId` CHAR(36) NOT NULL,

    UNIQUE INDEX `Veiculo_placa_key`(`placa`),
    INDEX `Veiculo_proprietarioId_idx`(`proprietarioId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Veiculo` ADD CONSTRAINT `Veiculo_proprietarioId_fkey` FOREIGN KEY (`proprietarioId`) REFERENCES `Cidadao`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
