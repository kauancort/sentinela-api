# P2 Backend

API em TypeScript e Express, com MySQL, Prisma e Swagger. O Docker Compose pode executar a API e o banco juntos.

## Requisitos

Para executar tudo em containers, basta Docker com Compose v2.

- **Windows:** instale o Docker Desktop, habilite o mecanismo WSL 2 e a integração com a distribuição Linux que usará. Abra o terminal do Ubuntu/WSL na pasta do projeto.
- **Linux:** instale Docker Engine e o plugin Docker Compose. Verifique que o serviço está ativo e que seu usuário pode executar `docker`.
- **API fora do Docker:** instale Node.js `>=20.19` e `<23`.

Confira se o Docker está disponível:

```sh
docker --version
docker compose version
```

## Iniciar API e banco com Docker

Na raiz do projeto, no terminal WSL ou Linux:

```sh
cp .env.example .env
docker compose up --build -d
docker compose exec api npx prisma migrate deploy
```

Abra <http://localhost:3000/health> para verificar a API e <http://localhost:3000/api-docs> para acessar o Swagger. Para acompanhar os logs, use `docker compose logs -f`; para parar os containers, `docker compose down`.

Por padrão, o MySQL fica disponível na porta `3306` do computador e os dados ficam no volume `mysql_data`. Se essa porta já estiver ocupada, defina `MYSQL_HOST_PORT=3307` no `.env` antes de iniciar. Para conectar à API rodando fora do Docker, ajuste também a porta da `DATABASE_URL` para `3307`.

## Executar a API no computador

Use esta opção para rodar o Node no Windows, WSL ou Linux e manter apenas o MySQL em container:

```sh
cp .env.example .env
docker compose up -d mysql
npm install
npm run prisma:generate
npm run prisma:deploy
npm run dev
```

No Windows, os mesmos comandos podem ser executados no PowerShell; para usar `cp`, abra o terminal WSL ou troque por `Copy-Item .env.example .env`. O arquivo `.env.example` já aponta a API local para `localhost:3306`.

## Comandos úteis

| Comando | Uso |
| --- | --- |
| `npm run dev` | Inicia a API em desenvolvimento. |
| `npm run build` | Compila TypeScript para `dist/`. |
| `npm run typecheck` | Verifica os tipos sem gerar arquivos. |
| `npm run prisma:generate` | Gera o cliente Prisma após alterações no schema. |
| `npm run prisma:migrate -- --name nome` | Cria e aplica uma migration em desenvolvimento. |
| `npm run prisma:deploy` | Aplica migrations já existentes. |
| `npm run prisma:studio` | Abre o Prisma Studio. |

Dentro do container da API, execute os comandos Prisma com `docker compose exec api npx prisma ...`.
