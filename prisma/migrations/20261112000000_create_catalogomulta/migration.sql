-- CreateTable
CREATE TABLE `Catalogomulta` (
    `id` CHAR(36) NOT NULL,
    `codigo` VARCHAR(32) NOT NULL,
    `descricao` VARCHAR(500) NOT NULL,
    `artigoCtb` VARCHAR(100) NOT NULL,
    `gravidade` ENUM('LEVE', 'MEDIA', 'GRAVE', 'GRAVISSIMA') NOT NULL,
    `valorBase` DECIMAL(10, 2) NOT NULL,
    `multiplicador` DECIMAL(6, 2) NOT NULL DEFAULT 1,
    `geraPontos` BOOLEAN NOT NULL,
    `autossuspensiva` BOOLEAN NOT NULL,
    `responsabilidade` ENUM('CONDUTOR', 'PROPRIETARIO') NOT NULL,
    `ativo` BOOLEAN NOT NULL,

    UNIQUE INDEX `Catalogomulta_codigo_key`(`codigo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
