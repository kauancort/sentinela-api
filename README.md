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
docker compose exec api npm run prisma:deploy
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

## Atualizar o Prisma no container

Após receber alterações no schema ou novas migrations, execute na raiz do projeto:

```sh
docker compose exec api npm run prisma:generate
docker compose exec api npm run prisma:deploy
docker compose restart api
```

Gerar o cliente no computador não atualiza o cliente de `/app/node_modules` no container. O volume de dependências pode manter um cliente antigo mesmo após um novo build. Use os comandos acima também se a API não reconhecer um modelo novo. Eles preservam os dados do banco.

## Catálogo, CameraTransito e Multa

**Catálogo de Multas** cadastra os tipos de infração: descrição, gravidade, responsabilidade, valor e regras de pontos. **CameraTransito** recebe a ocorrência e aplica a multa usando um item ativo do catálogo. **Multa** guarda essa aplicação, com snapshots do valor, da infração e do proprietário conhecido no registro. Alterações posteriores no catálogo ou na propriedade do veículo não reescrevem esses dados.

| Método | Rota | Resultado |
| --- | --- | --- |
| POST | `/camera-transito/multar` | 201 com multa, análise e pendências. |
| GET | `/camera-transito/procurarPorPlaca?placa=ABC1D23` | 200 com veículo e proprietário atual (`id`, `nome`). |
| GET | `/camera-transito/multas` | 200 com `{ itens, total, pagina, tamanhoPagina }`. |
| DELETE | `/camera-transito/multas/:id` | 204 sem corpo, inclusive se já cancelada. Não envie body. |

Use os exemplos e os IDs dos seus cadastros no [Swagger](http://localhost:3000/api-docs). Uma ocorrência repetida pelo mesmo `ocorrenciaId` retorna 409. Entradas inválidas retornam 400 e registros ausentes, 404. Cadastros de cidadãos, veículos e catálogo vinculados a multas continuam protegidos contra exclusão com 409, mesmo após o cancelamento.

A listagem aceita `pagina`, `tamanhoPagina`, `placa`, `codigoCamera`, `catalogoMultaId`, `condutorId`, `responsavelId`, `status`, `gravidade`, `dataInicial` e `dataFinal`. O padrão é página 1 com 20 itens, máximo 100. Datas usam ISO 8601 com fuso e intervalo inclusivo. Canceladas aparecem por padrão; filtre por `status` quando necessário.

O DELETE mantém o histórico e grava `Cancelamento por erro de fiscalização.`. A multa cancelada deixa de contribuir para os pontos e a quantidade de gravíssimas nas próximas análises. Respostas de análises já entregues não são recalculadas.

### Limites desta versão

A pontuação é uma projeção acadêmica dos registros internos e do cadastro atual, na janela de 12 meses de calendário da ocorrência. Não reconstrói CNH histórica nem garante saldo administrativo serializado sob ocorrências concorrentes. Alertas não suspendem ou cassam a CNH, não criam outras multas e não enviam mensagens externas.

A placa não identifica o condutor. Em infração de responsabilidade do condutor, sua ausência gera `AGUARDANDO_IDENTIFICACAO`, responsável nulo e análise de pontos indisponível. A resposta informa o proprietário a contatar; não há endpoint para identificar o condutor nesta versão, e a pendência permanece até essa evolução. O módulo usa `codigoCamera` textual, sem cadastro de equipamento físico.
