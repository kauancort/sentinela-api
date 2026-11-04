# P2 Backend

Base de uma API em **TypeScript**, com **Express**, **Prisma ORM**, **MySQL** em Docker e documentacao em **Swagger**.

## Estrutura

```text
src/
├── Domain/                         # Entidades, contratos de repositorio e erros do dominio
├── Application/                    # Casos de uso e DTOs, agrupados por funcionalidade
├── Infrastructure/
│   └── Persistence/
│       ├── Prisma/                 # Implementacoes de repositorios do Prisma
│       └── PrismaClient.ts         # Cliente Prisma compartilhado
├── Presentation/                   # Controllers, rotas e schemas Swagger por funcionalidade
├── Shared/
│   ├── Errors/
│   ├── Http/
│   └── Middlewares/
├── Config/
│   └── Swagger.ts
├── App.ts
└── Server.ts
```

As pastas vazias usam `.gitkeep` apenas para permanecerem no Git.

## Pre-requisitos

No Windows, instale o NVM for Windows e depois uma versao do Node compativel:

```powershell
nvm install 22
nvm use 22
node --version
npm --version
```

Tambem e necessario instalar e iniciar o Docker Desktop. Depois, confira:

```powershell
docker --version
docker compose version
```

## Primeira execucao com Docker

1. Crie o arquivo de ambiente:

   ```powershell
   Copy-Item .env.example .env
   ```

2. Suba a API e o MySQL:

   ```powershell
   docker compose up --build
   ```

3. Acesse:

   - API: `http://localhost:3000/health`
   - Swagger: `http://localhost:3000/api-docs`

O MySQL fica acessivel pela porta `3306`. Os dados sao persistidos no volume Docker `mysql_data`.

## Execucao local da API

Com o MySQL rodando pelo Docker, mantenha a `DATABASE_URL` do `.env` apontando para `localhost` e execute:

```powershell
npm install
npm run prisma:generate
npm run dev
```

Quando houver modelos no arquivo `prisma/schema.prisma`, crie a primeira migration:

```powershell
npm run prisma:migrate -- --name nome_da_migration
```

## Scripts

| Comando | Descricao |
| --- | --- |
| `npm run dev` | Inicia a API em desenvolvimento com recarregamento automatico. |
| `npm run build` | Compila TypeScript para `dist/`. |
| `npm run start` | Executa a versao compilada. |
| `npm run typecheck` | Verifica os tipos sem gerar arquivos. |
| `npm run prisma:generate` | Gera o cliente do Prisma. |
| `npm run prisma:migrate` | Cria e aplica uma migration de desenvolvimento. |
| `npm run prisma:studio` | Abre a interface visual do Prisma. |
