import cors from 'cors';
import express, { type ErrorRequestHandler } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';

import { swaggerSpec } from './Config/Swagger';
import { AtualizarCidadaoHandler } from './Application/Cidadao/Handlers/AtualizarCidadaoHandler';
import { BuscarCidadaoPorIdHandler } from './Application/Cidadao/Handlers/BuscarCidadaoPorIdHandler';
import { CriarCidadaoHandler } from './Application/Cidadao/Handlers/CriarCidadaoHandler';
import { ExcluirCidadaoHandler } from './Application/Cidadao/Handlers/ExcluirCidadaoHandler';
import { ListarCidadaosHandler } from './Application/Cidadao/Handlers/ListarCidadaosHandler';
import { CidadaoRepositoryPrisma } from './Infrastructure/Persistence/Prisma/CidadaoRepositoryPrisma';
import { prisma } from './Infrastructure/Persistence/PrismaClient';
import { CidadaoController } from './Presentation/Cidadao/CidadaoController';
import { ErroAplicacaoCidadao, ErroDadosCidadaoInvalidos } from './Application/Cidadao/CidadaoApplicationErrors';
import { criarCidadaoRoutes } from './Presentation/Cidadao/CidadaoRoutes';
import { AtualizarCatalogoMultaHandler } from './Application/CatalogoMulta/Handlers/AtualizarCatalogoMultaHandler';
import { BuscarCatalogoMultaPorIdHandler } from './Application/CatalogoMulta/Handlers/BuscarCatalogoMultaPorIdHandler';
import { CriarCatalogoMultaHandler } from './Application/CatalogoMulta/Handlers/CriarCatalogoMultaHandler';
import { ExcluirCatalogoMultaHandler } from './Application/CatalogoMulta/Handlers/ExcluirCatalogoMultaHandler';
import { ListarCatalogoMultasHandler } from './Application/CatalogoMulta/Handlers/ListarCatalogoMultasHandler';
import {
  ErroAplicacaoCatalogoMulta,
  ErroDadosCatalogoMultaInvalidos
} from './Application/CatalogoMulta/CatalogoMultaApplicationErrors';
import { CatalogoMultaRepositoryPrisma } from './Infrastructure/Persistence/Prisma/CatalogoMultaRepositoryPrisma';
import { CatalogoMultaController } from './Presentation/CatalogoMulta/CatalogoMultaController';
import { criarCatalogoMultaRoutes } from './Presentation/CatalogoMulta/CatalogoMultaRoutes';

export const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/health', (_request, response) => {
  response.status(200).json({ status: 'ok' });
});

const cidadaoRepository = new CidadaoRepositoryPrisma(prisma);
const cidadaoController = new CidadaoController(
  new CriarCidadaoHandler(cidadaoRepository),
  new AtualizarCidadaoHandler(cidadaoRepository),
  new ExcluirCidadaoHandler(cidadaoRepository),
  new BuscarCidadaoPorIdHandler(cidadaoRepository),
  new ListarCidadaosHandler(cidadaoRepository)
);

app.use('/cidadaos', criarCidadaoRoutes(cidadaoController));
const catalogoMultaRepository = new CatalogoMultaRepositoryPrisma(prisma);
const catalogoMultaController = new CatalogoMultaController(
  new CriarCatalogoMultaHandler(catalogoMultaRepository),
  new AtualizarCatalogoMultaHandler(catalogoMultaRepository),
  new ExcluirCatalogoMultaHandler(catalogoMultaRepository),
  new BuscarCatalogoMultaPorIdHandler(catalogoMultaRepository),
  new ListarCatalogoMultasHandler(catalogoMultaRepository)
);
app.use('/catalogo-multas', criarCatalogoMultaRoutes(catalogoMultaController));
const tratarErro: ErrorRequestHandler = (erro, request, response, next) => {
  if (response.headersSent) return next(erro);
  if (erro instanceof SyntaxError && 'type' in erro && erro.type === 'entity.parse.failed') {
    erro = request.originalUrl.startsWith('/catalogo-multas')
      ? new ErroDadosCatalogoMultaInvalidos('body', 'O corpo deve conter JSON válido.')
      : new ErroDadosCidadaoInvalidos('body', 'O corpo deve conter JSON válido.');
  }
  if (erro instanceof ErroAplicacaoCatalogoMulta) {
    const status = {
      CATALOGO_MULTA_DADOS_INVALIDOS: 400,
      CATALOGO_MULTA_NAO_ENCONTRADO: 404,
      CATALOGO_MULTA_CONFLITO: 409
    };
    response.status(status[erro.codigo]).json({
      erro: { codigo: erro.codigo, mensagem: erro.message, campo: erro.campo }
    });
    return;
  }
  if (!(erro instanceof ErroAplicacaoCidadao)) return next(erro);
  const status = { CIDADAO_DADOS_INVALIDOS: 400, CIDADAO_NAO_ENCONTRADO: 404, CIDADAO_CONFLITO: 409 };
  response.status(status[erro.codigo]).json({
    erro: { codigo: erro.codigo, mensagem: erro.message, campo: erro.campo }
  });
};
app.use(tratarErro);
