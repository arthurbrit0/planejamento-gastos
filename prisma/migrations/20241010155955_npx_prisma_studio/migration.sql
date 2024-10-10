-- CreateTable
CREATE TABLE "ConfiguracoesUser" (
    "userId" TEXT NOT NULL PRIMARY KEY,
    "moeda" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Categoria" (
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nome" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "icone" TEXT NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT 'entrada'
);

-- CreateTable
CREATE TABLE "Transacao" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "valor" REAL NOT NULL,
    "descricao" TEXT NOT NULL,
    "data" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT 'entrada',
    "categoria" TEXT NOT NULL,
    "iconeCategoria" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "HistoricoMes" (
    "userId" TEXT NOT NULL,
    "dia" INTEGER NOT NULL,
    "mes" INTEGER NOT NULL,
    "ano" INTEGER NOT NULL,
    "entrada" REAL NOT NULL,
    "saida" REAL NOT NULL,

    PRIMARY KEY ("dia", "mes", "ano", "userId")
);

-- CreateTable
CREATE TABLE "HistoricoAno" (
    "userId" TEXT NOT NULL,
    "mes" INTEGER NOT NULL,
    "ano" INTEGER NOT NULL,
    "entrada" REAL NOT NULL,
    "saida" REAL NOT NULL,

    PRIMARY KEY ("mes", "ano", "userId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Categoria_nome_userId_tipo_key" ON "Categoria"("nome", "userId", "tipo");
