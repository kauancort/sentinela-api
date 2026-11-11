import swaggerJsdoc from 'swagger-jsdoc';

const routeFiles =
  process.env.NODE_ENV === 'production'
    ? ['./dist/Presentation/**/*.js']
    : ['./src/Presentation/**/*.ts'];

export const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Sentinela API',
      version: '1.0.0',
      description: 'Documentacao da API.'
    },
    servers: [{ url: 'http://localhost:3000', description: 'Servidor local' }],
    paths: {
      '/health': {
        get: {
          summary: 'Verifica se a API esta em funcionamento',
          responses: {
            '200': { description: 'API disponivel' }
          }
        }
      }
    }
  },
  apis: routeFiles
});
