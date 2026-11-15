# Sentinela API

Projeto acadêmico de gestão de infrações de trânsito, desenvolvido por **Kauan Cortiço, Gabriel Barella, Wesley Servelin e Weslley Katsube**.

O escopo desta versão está concluído: CRUDs de Cidadão, Veículo e Catálogo de Multas, transferência de propriedade, aplicação de multas com análise de pontuação, consultas e cancelamento lógico. A API é o produto desta entrega; a interface para explorar as requisições é o Swagger.

## Tecnologias e arquitetura

Node.js 22, TypeScript, Express 5, Prisma 6, MySQL 8.4, Docker Compose e Swagger/OpenAPI.

```text
src/
  Presentation/     Rotas HTTP e controllers.
  Application/      Handlers, DTOs, mappers e validators por caso de uso.
  Domain/           Entidades, regras de negócio, erros e contratos de repositório.
  Infrastructure/   Repositórios Prisma e conexão com o banco.
  Config/           Configuração do Swagger.
  App.ts            Composição de dependências, middlewares e adaptação de erros HTTP.
```

Os controllers delegam aos handlers, que validam a entrada e coordenam os casos de uso usando contratos do domínio. A Infrastructure implementa esses contratos com Prisma. O domínio não depende de Express ou Prisma. O Docker Compose executa a API e o MySQL juntos.

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

### CRUDs disponíveis

| Módulo | Rotas |
| --- | --- |
| Cidadão | `POST /cidadaos`, `GET /cidadaos`, `GET /cidadaos/:id`, `PUT /cidadaos/:id`, `DELETE /cidadaos/:id` |
| Veículo | `POST /veiculos`, `GET /veiculos`, `GET /veiculos/:id`, `PUT /veiculos/:id`, `DELETE /veiculos/:id` |
| Transferência | `PATCH /veiculos/:id/proprietario` |
| Catálogo de Multas | `POST /catalogo-multas`, `GET /catalogo-multas`, `GET /catalogo-multas/:id`, `PUT /catalogo-multas/:id`, `DELETE /catalogo-multas/:id` |

As listagens usam `pagina` e `tamanhoPagina`, com padrão 1/20 e máximo 100. Filtros e corpos completos estão no Swagger. O PUT substitui os dados editáveis; no Veículo, ele recebe somente marca, modelo, ano e cor. A troca de proprietário usa o PATCH separado.

## Exemplos de requisição

Execute os exemplos em Bash, pelo WSL ou Linux, ou use os mesmos corpos no Swagger. Substitua os valores entre `<...>` pelos IDs retornados nas etapas anteriores. Os dados são fictícios; em um banco já utilizado, escolha CPF, CNH, placa e código de catálogo ainda disponíveis.

### 1. Cadastrar proprietário e condutor

O proprietário pode não possuir CNH. Isso não o transforma no condutor da ocorrência.

```sh
curl -i -X POST http://localhost:3000/cidadaos \
  -H 'Content-Type: application/json' \
  -d '{
    "nome": "Ana Exemplo",
    "cpf": "529.982.247-25",
    "email": "ana@example.com",
    "possuiCnh": false
  }'
```

Guarde o `id` como `<PROPRIETARIO_ID>`. Agora cadastre o condutor:

```sh
curl -i -X POST http://localhost:3000/cidadaos \
  -H 'Content-Type: application/json' \
  -d '{
    "nome": "Bruno Exemplo",
    "cpf": "111.444.777-35",
    "email": "bruno@example.com",
    "possuiCnh": true,
    "cnhNumero": "00012345678",
    "cnhValidade": "2035-12-31",
    "situacaoCnh": "REGULAR",
    "motivoSituacaoCnh": null,
    "exerceAtividadeRemunerada": false
  }'
```

Guarde o `id` como `<CONDUTOR_ID>`. Ambos retornam 201. CPF pode vir com máscara, mas é validado e salvo com 11 dígitos. Número de CNH é texto, preservando zeros iniciais.

### 2. Cadastrar o veículo

```sh
curl -i -X POST http://localhost:3000/veiculos \
  -H 'Content-Type: application/json' \
  -d '{
    "placa": "ABC1D23",
    "marca": "Marca Exemplo",
    "modelo": "Modelo Exemplo",
    "ano": 2020,
    "cor": "Prata",
    "proprietarioId": "<PROPRIETARIO_ID>"
  }'
```

Retorna 201. Guarde o `id` como `<VEICULO_ID>`.

### 3. Cadastrar um tipo de infração

Descrição, referência e valor abaixo são apenas dados de demonstração.

```sh
curl -i -X POST http://localhost:3000/catalogo-multas \
  -H 'Content-Type: application/json' \
  -d '{
    "codigo": "DEMO-001",
    "descricao": "Infração fictícia para demonstração",
    "artigoCtb": "Referência fictícia",
    "gravidade": "GRAVISSIMA",
    "valorBase": 293.47,
    "multiplicador": 1,
    "geraPontos": true,
    "autossuspensiva": false,
    "responsabilidade": "CONDUTOR",
    "ativo": true
  }'
```

Retorna 201. Guarde o `id` como `<CATALOGO_MULTA_ID>`. O catálogo calcula o valor em centavos; multiplicador afeta dinheiro, não pontos.

### 4. Aplicar uma multa: endpoint complexo

```sh
curl -i -X POST http://localhost:3000/camera-transito/multar \
  -H 'Content-Type: application/json' \
  -d '{
    "ocorrenciaId": "f8fdb891-12aa-4d12-aecb-85198bedca01",
    "codigoCamera": "CAM-001",
    "placa": "ABC1D23",
    "catalogoMultaId": "<CATALOGO_MULTA_ID>",
    "condutorId": "<CONDUTOR_ID>",
    "dataHoraOcorrencia": "2026-11-12T12:00:00-03:00",
    "local": "Avenida Exemplo, 100"
  }'
```

Retorna 201 com `{ multa, analise, pendencias }`. Guarde `multa.id` como `<MULTA_ID>`. Data da ocorrência precisa ser real, ter fuso e não estar no futuro. Não envie valor ou pontos: eles vêm do catálogo.

Para este condutor sem histórico anterior, a projeção será de 7 pontos, uma gravíssima computável, limite 30 e `atingiuLimite=false`. O responsável é o condutor informado, mesmo sendo diferente do proprietário.

Repetir exatamente a ocorrência retorna 409 com `CAMERA_TRANSITO_OCORRENCIA_DUPLICADA`. Para uma captura diferente, gere outro `ocorrenciaId`. Para demonstrar identificação pendente, use uma nova ocorrência com `condutorId: null`: neste catálogo, a multa fica `AGUARDANDO_IDENTIFICACAO` e os campos numéricos da análise ficam nulos, com motivo explícito.

### 5. Consultar veículo e histórico

```sh
curl --get http://localhost:3000/camera-transito/procurarPorPlaca \
  --data-urlencode 'placa=abc-1d23'
```

```sh
curl --get http://localhost:3000/camera-transito/multas \
  --data-urlencode 'placa=ABC1D23' \
  --data-urlencode 'codigoCamera=CAM-001' \
  --data-urlencode 'pagina=1' \
  --data-urlencode 'tamanhoPagina=20'
```

Ambos retornam 200. A busca mostra o proprietário atual; a listagem mostra os snapshots de cada aplicação, incluindo canceladas.

### 6. Atualizar o cidadão e transferir o veículo

O PUT exige todos os campos editáveis. Manter CPF e CNH do próprio cidadão funciona:

```sh
curl -i -X PUT 'http://localhost:3000/cidadaos/<CONDUTOR_ID>' \
  -H 'Content-Type: application/json' \
  -d '{
    "nome": "Bruno Exemplo Atualizado",
    "cpf": "11144477735",
    "email": "bruno@example.com",
    "possuiCnh": true,
    "cnhNumero": "00012345678",
    "cnhValidade": "2035-12-31",
    "situacaoCnh": "REGULAR",
    "motivoSituacaoCnh": null,
    "exerceAtividadeRemunerada": false
  }'
```

Neste exemplo, Bruno também passa a ser proprietário do veículo:

```sh
curl -i -X PATCH 'http://localhost:3000/veiculos/<VEICULO_ID>/proprietario' \
  -H 'Content-Type: application/json' \
  -d '{ "novoProprietarioId": "<CONDUTOR_ID>" }'
```

Ambos retornam 200. Consultar a placa agora mostra Bruno; a multa já registrada mantém o ID de Ana como proprietário histórico.

### 7. Cancelar e conferir a preservação do histórico

```sh
curl -i -X DELETE 'http://localhost:3000/camera-transito/multas/<MULTA_ID>'
```

Retorna 204 sem corpo, inclusive ao repetir. Consulte as canceladas:

```sh
curl --get http://localhost:3000/camera-transito/multas \
  --data-urlencode 'placa=ABC1D23' \
  --data-urlencode 'status=CANCELADA'
```

O registro permanece com status e motivo de cancelamento. Nas próximas análises, deixa de contribuir para os pontos e para a contagem de gravíssimas. Excluir o catálogo ainda vinculado retorna 409:

```sh
curl -i -X DELETE 'http://localhost:3000/catalogo-multas/<CATALOGO_MULTA_ID>'
```

## Limites desta versão

A pontuação é uma projeção acadêmica dos registros internos e do cadastro atual, na janela de 12 meses de calendário da ocorrência. Não reconstrói CNH histórica nem garante saldo administrativo serializado sob ocorrências concorrentes. Alertas não suspendem ou cassam a CNH, não criam outras multas e não enviam mensagens externas.

A placa não identifica o condutor. Em infração de responsabilidade do condutor, sua ausência gera `AGUARDANDO_IDENTIFICACAO`, responsável nulo e análise de pontos indisponível. A resposta informa o proprietário a contatar; não há endpoint para identificar o condutor nesta versão, e a pendência permanece até essa evolução. O módulo usa `codigoCamera` textual, sem cadastro de equipamento físico.
