-- CreateTable
CREATE TABLE "Figurinha" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "selecao" TEXT NOT NULL,
    "grupo" TEXT NOT NULL,

    CONSTRAINT "Figurinha_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsuarioFigurinha" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "figurinhaId" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UsuarioFigurinha_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Figurinha_codigo_key" ON "Figurinha"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UsuarioFigurinha_usuarioId_figurinhaId_key" ON "UsuarioFigurinha"("usuarioId", "figurinhaId");

-- AddForeignKey
ALTER TABLE "UsuarioFigurinha" ADD CONSTRAINT "UsuarioFigurinha_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsuarioFigurinha" ADD CONSTRAINT "UsuarioFigurinha_figurinhaId_fkey" FOREIGN KEY ("figurinhaId") REFERENCES "Figurinha"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
