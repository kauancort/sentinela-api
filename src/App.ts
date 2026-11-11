import cors from 'cors';
import express from 'express';
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
import { cidadaoErrorHandler } from './Presentation/Cidadao/CidadaoErrorHandler';
import { criarCidadaoRoutes } from './Presentation/Cidadao/CidadaoRoutes';

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
app.use(cidadaoErrorHandler);
