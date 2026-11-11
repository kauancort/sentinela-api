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
    components: {
      schemas: {
        CidadaoRequest: {
          type: 'object',
          required: ['nome', 'cpf', 'email', 'possuiCnh'],
          properties: {
            nome: { type: 'string' },
            cpf: { type: 'string', example: '529.982.247-25' },
            email: { type: 'string', format: 'email' },
            possuiCnh: { type: 'boolean' },
            cnhNumero: { type: 'string', nullable: true },
            cnhValidade: { type: 'string', format: 'date', nullable: true },
            situacaoCnh: {
              type: 'string',
              enum: ['SEM_HABILITACAO', 'REGULAR', 'SUSPENSA', 'CASSADA']
            },
            motivoSituacaoCnh: { type: 'string', nullable: true },
            exerceAtividadeRemunerada: { type: 'boolean' }
          }
        },
        CidadaoUpdateRequest: {
          allOf: [
            { $ref: '#/components/schemas/CidadaoRequest' },
            {
              type: 'object',
              required: [
                'cnhNumero',
                'cnhValidade',
                'situacaoCnh',
                'motivoSituacaoCnh',
                'exerceAtividadeRemunerada'
              ]
            }
          ]
        },
        CidadaoResponse: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            nome: { type: 'string' },
            cpf: { type: 'string' },
            email: { type: 'string', format: 'email' },
            possuiCnh: { type: 'boolean' },
            cnhNumero: { type: 'string', nullable: true },
            cnhValidade: { type: 'string', format: 'date', nullable: true },
            situacaoCnh: {
              type: 'string',
              enum: ['SEM_HABILITACAO', 'REGULAR', 'SUSPENSA', 'CASSADA']
            },
            motivoSituacaoCnh: { type: 'string', nullable: true },
            exerceAtividadeRemunerada: { type: 'boolean' },
            criadoEm: { type: 'string', format: 'date-time' },
            atualizadoEm: { type: 'string', format: 'date-time' }
          }
        },
        ListarCidadaosResponse: {
          type: 'object',
          properties: {
            itens: {
              type: 'array',
              items: { $ref: '#/components/schemas/CidadaoResponse' }
            },
            total: { type: 'integer' },
            pagina: { type: 'integer' },
            tamanhoPagina: { type: 'integer' }
          }
        }
      }
    },
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
