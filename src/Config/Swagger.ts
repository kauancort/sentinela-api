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
      description: 'API para cadastro e consulta de cidadãos e ocorrências de trânsito.'
    },
    servers: [{ url: 'http://localhost:3000', description: 'Servidor local' }],
    components: {
      schemas: {
        CidadaoCreateRequest: {
          type: 'object',
          required: ['nome', 'cpf', 'email', 'possuiCnh'],
          properties: {
            nome: { type: 'string', example: 'Ana Exemplo' },
            cpf: { type: 'string', description: 'CPF com ou sem máscara.', example: '529.982.247-25' },
            email: { type: 'string', format: 'email', example: 'ana@example.com' },
            possuiCnh: { type: 'boolean', example: false },
            cnhNumero: { type: 'string', nullable: true, example: '00012345678' },
            cnhValidade: { type: 'string', format: 'date', nullable: true, example: '2030-12-31' },
            situacaoCnh: {
              type: 'string',
              enum: ['SEM_HABILITACAO', 'REGULAR', 'SUSPENSA', 'CASSADA'],
              example: 'SEM_HABILITACAO'
            },
            motivoSituacaoCnh: { type: 'string', nullable: true, example: null },
            exerceAtividadeRemunerada: { type: 'boolean', example: false }
          }
        },
        CidadaoUpdateRequest: {
          allOf: [
            { $ref: '#/components/schemas/CidadaoCreateRequest' },
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
          required: [
            'id',
            'nome',
            'cpf',
            'email',
            'possuiCnh',
            'cnhNumero',
            'cnhValidade',
            'situacaoCnh',
            'motivoSituacaoCnh',
            'exerceAtividadeRemunerada',
          ],
          properties: {
            id: { type: 'string', format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440000' },
            nome: { type: 'string', example: 'Ana Exemplo' },
            cpf: { type: 'string', example: '52998224725' },
            email: { type: 'string', format: 'email', example: 'ana@example.com' },
            possuiCnh: { type: 'boolean', example: false },
            cnhNumero: { type: 'string', nullable: true, example: null },
            cnhValidade: { type: 'string', format: 'date', nullable: true, example: null },
            situacaoCnh: {
              type: 'string',
              enum: ['SEM_HABILITACAO', 'REGULAR', 'SUSPENSA', 'CASSADA'],
              example: 'SEM_HABILITACAO'
            },
            motivoSituacaoCnh: { type: 'string', nullable: true, example: null },
            exerceAtividadeRemunerada: { type: 'boolean', example: false },
            possuiVeiculo: {
              type: 'boolean',
              readOnly: true,
              description: 'Campo derivado da relação com Veículo quando ela estiver disponível.'
            }
          }
        },
        ListarCidadaosResponse: {
          type: 'object',
          required: ['itens', 'total', 'pagina', 'tamanhoPagina'],
          properties: {
            itens: {
              type: 'array',
              items: { $ref: '#/components/schemas/CidadaoResponse' }
            },
            total: { type: 'integer', example: 1 },
            pagina: { type: 'integer', example: 1 },
            tamanhoPagina: { type: 'integer', example: 20 }
          }
        },
        CidadaoErrorResponse: {
          type: 'object',
          required: ['erro'],
          properties: {
            erro: {
              type: 'object',
              required: ['codigo', 'mensagem'],
              properties: {
                codigo: {
                  type: 'string',
                  enum: [
                    'CIDADAO_DADOS_INVALIDOS',
                    'CIDADAO_NAO_ENCONTRADO',
                    'CIDADAO_CONFLITO'
                  ]
                },
                mensagem: { type: 'string' },
                campo: { type: 'string' }
              }
            }
          },
          example: {
            erro: {
              codigo: 'CIDADAO_DADOS_INVALIDOS',
              mensagem: 'O CPF informado é inválido.',
              campo: 'cpf'
            }
          }
        }
      }
    },
    paths: {
      '/health': {
        get: {
          summary: 'Verifica se a API está em funcionamento',
          responses: {
            '200': { description: 'API disponível' }
          }
        }
      }
    }
  },
  apis: routeFiles
});
