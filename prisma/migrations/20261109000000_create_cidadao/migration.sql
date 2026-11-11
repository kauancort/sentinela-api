-- CreateTable
CREATE TABLE `Cidadao` (
    `id` CHAR(36) NOT NULL,
    `nome` VARCHAR(200) NOT NULL,
    `cpf` CHAR(11) NOT NULL,
    `email` VARCHAR(254) NOT NULL,
    `possuiCnh` BOOLEAN NOT NULL,
    `cnhNumero` VARCHAR(32) NULL,
    `cnhValidade` DATE NULL,
    `situacaoCnh` ENUM('SEM_HABILITACAO', 'REGULAR', 'SUSPENSA', 'CASSADA') NOT NULL,
    `motivoSituacaoCnh` TEXT NULL,
    `exerceAtividadeRemunerada` BOOLEAN NOT NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Cidadao_cpf_key`(`cpf`),
    UNIQUE INDEX `Cidadao_cnhNumero_key`(`cnhNumero`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
