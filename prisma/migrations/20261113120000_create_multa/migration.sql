-- CreateTable
CREATE TABLE `Multa` (
    `id` CHAR(36) NOT NULL,
    `ocorrenciaId` CHAR(36) NOT NULL,
    `codigoCamera` VARCHAR(50) NOT NULL,
    `placaCapturada` VARCHAR(7) NOT NULL,
    `veiculoId` CHAR(36) NOT NULL,
    `proprietarioIdNaOcorrencia` CHAR(36) NOT NULL,
    `condutorId` CHAR(36) NULL,
    `responsavelId` CHAR(36) NULL,
    `catalogoMultaId` CHAR(36) NOT NULL,
    `codigoInfracaoAplicado` VARCHAR(32) NOT NULL,
    `descricaoInfracaoAplicada` VARCHAR(500) NOT NULL,
    `artigoCtbAplicado` VARCHAR(100) NOT NULL,
    `gravidadeAplicada` ENUM('LEVE', 'MEDIA', 'GRAVE', 'GRAVISSIMA') NOT NULL,
    `responsabilidadeAplicada` ENUM('CONDUTOR', 'PROPRIETARIO') NOT NULL,
    `valorAplicado` DECIMAL(14, 2) NOT NULL,
    `pontosAplicaveis` INTEGER NOT NULL,
    `autossuspensiva` BOOLEAN NOT NULL,
    `dataHoraOcorrencia` DATETIME(3) NOT NULL,
    `local` VARCHAR(200) NOT NULL,
    `status` ENUM('REGISTRADA', 'AGUARDANDO_IDENTIFICACAO', 'CANCELADA') NOT NULL,
    `motivoCancelamento` VARCHAR(100) NULL,

    UNIQUE INDEX `Multa_ocorrenciaId_key`(`ocorrenciaId`),
    INDEX `Multa_responsavelId_dataHoraOcorrencia_idx`(`responsavelId`, `dataHoraOcorrencia`),
    INDEX `Multa_placaCapturada_dataHoraOcorrencia_idx`(`placaCapturada`, `dataHoraOcorrencia`),
    INDEX `Multa_status_dataHoraOcorrencia_idx`(`status`, `dataHoraOcorrencia`),
    INDEX `Multa_veiculoId_idx`(`veiculoId`),
    INDEX `Multa_proprietarioIdNaOcorrencia_idx`(`proprietarioIdNaOcorrencia`),
    INDEX `Multa_condutorId_idx`(`condutorId`),
    INDEX `Multa_catalogoMultaId_idx`(`catalogoMultaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Multa` ADD CONSTRAINT `Multa_veiculoId_fkey` FOREIGN KEY (`veiculoId`) REFERENCES `Veiculo`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `Multa` ADD CONSTRAINT `Multa_proprietarioIdNaOcorrencia_fkey` FOREIGN KEY (`proprietarioIdNaOcorrencia`) REFERENCES `Cidadao`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `Multa` ADD CONSTRAINT `Multa_condutorId_fkey` FOREIGN KEY (`condutorId`) REFERENCES `Cidadao`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `Multa` ADD CONSTRAINT `Multa_responsavelId_fkey` FOREIGN KEY (`responsavelId`) REFERENCES `Cidadao`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `Multa` ADD CONSTRAINT `Multa_catalogoMultaId_fkey` FOREIGN KEY (`catalogoMultaId`) REFERENCES `CatalogoMulta`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
