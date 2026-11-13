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
        },
        VeiculoCreateRequest: {
          type: 'object',
          required: ['placa', 'marca', 'modelo', 'ano', 'cor', 'proprietarioId'],
          properties: {
            placa: {
              type: 'string',
              description: 'Placa brasileira com ou sem máscara; será normalizada.',
              example: 'ABC-1234'
            },
            marca: { type: 'string', maxLength: 100, example: 'Toyota' },
            modelo: { type: 'string', maxLength: 100, example: 'Corolla' },
            ano: { type: 'integer', minimum: 1886, example: 2024 },
            cor: { type: 'string', maxLength: 50, example: 'Prata' },
            proprietarioId: {
              type: 'string',
              format: 'uuid',
              example: '550e8400-e29b-41d4-a716-446655440000'
            }
          }
        },
        VeiculoUpdateRequest: {
          type: 'object',
          required: ['marca', 'modelo', 'ano', 'cor'],
          properties: {
            marca: { type: 'string', maxLength: 100, example: 'Toyota' },
            modelo: { type: 'string', maxLength: 100, example: 'Corolla XEi' },
            ano: { type: 'integer', minimum: 1886, example: 2024 },
            cor: { type: 'string', maxLength: 50, example: 'Preto' }
          }
        },
        VeiculoTransferenciaRequest: {
          type: 'object',
          required: ['novoProprietarioId'],
          properties: {
            novoProprietarioId: {
              type: 'string',
              format: 'uuid',
              example: '9b2f22d6-2d63-4b35-8c00-1234567890ab'
            }
          }
        },
        VeiculoResponse: {
          type: 'object',
          required: ['id', 'placa', 'marca', 'modelo', 'ano', 'cor', 'proprietarioId'],
          properties: {
            id: { type: 'string', format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440000' },
            placa: { type: 'string', example: 'ABC1234' },
            marca: { type: 'string', example: 'Toyota' },
            modelo: { type: 'string', example: 'Corolla' },
            ano: { type: 'integer', example: 2024 },
            cor: { type: 'string', example: 'Prata' },
            proprietarioId: { type: 'string', format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440000' }
          }
        },
        ListarVeiculosResponse: {
          type: 'object',
          required: ['itens', 'total', 'pagina', 'tamanhoPagina'],
          properties: {
            itens: { type: 'array', items: { $ref: '#/components/schemas/VeiculoResponse' } },
            total: { type: 'integer', example: 1 },
            pagina: { type: 'integer', example: 1 },
            tamanhoPagina: { type: 'integer', example: 20 }
          }
        },
        VeiculoErrorResponse: {
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
                    'VEICULO_DADOS_INVALIDOS',
                    'VEICULO_NAO_ENCONTRADO',
                    'VEICULO_PROPRIETARIO_NAO_ENCONTRADO',
                    'VEICULO_CONFLITO'
                  ]
                },
                mensagem: { type: 'string' },
                campo: { type: 'string' }
              }
            }
          }
        },
        CatalogoMultaCreateRequest: {
          type: 'object',
          required: [
            'codigo', 'descricao', 'artigoCtb', 'gravidade', 'valorBase',
            'geraPontos', 'autossuspensiva', 'responsabilidade', 'ativo'
          ],
          properties: {
            codigo: { type: 'string', maxLength: 32, example: '745-50' },
            descricao: { type: 'string', maxLength: 500, example: 'Transitar em velocidade superior à máxima permitida em mais de 50%' },
            artigoCtb: { type: 'string', maxLength: 100, example: 'Art. 218, III' },
            gravidade: { type: 'string', enum: ['LEVE', 'MEDIA', 'GRAVE', 'GRAVISSIMA'], example: 'GRAVISSIMA' },
            valorBase: { type: 'number', format: 'double', minimum: 0.01, example: 293.47 },
            multiplicador: { type: 'number', format: 'double', minimum: 0.01, default: 1, example: 3 },
            geraPontos: { type: 'boolean', example: true },
            autossuspensiva: { type: 'boolean', example: true },
            responsabilidade: { type: 'string', enum: ['CONDUTOR', 'PROPRIETARIO'], example: 'CONDUTOR' },
            ativo: { type: 'boolean', example: true }
          }
        },
        CatalogoMultaUpdateRequest: {
          allOf: [
            { $ref: '#/components/schemas/CatalogoMultaCreateRequest' },
            { type: 'object', required: ['multiplicador'] }
          ]
        },
        CatalogoMultaResponse: {
          allOf: [
            { $ref: '#/components/schemas/CatalogoMultaUpdateRequest' },
            {
              type: 'object',
              required: ['id', 'valorCalculado', 'pontosAplicaveis'],
              properties: {
                id: { type: 'string', format: 'uuid' },
                valorCalculado: { type: 'number', format: 'double', readOnly: true, example: 880.41 },
                pontosAplicaveis: { type: 'integer', readOnly: true, example: 7 }
              }
            }
          ]
        },
        ListarCatalogoMultasResponse: {
          type: 'object',
          required: ['itens', 'total', 'pagina', 'tamanhoPagina'],
          properties: {
            itens: { type: 'array', items: { $ref: '#/components/schemas/CatalogoMultaResponse' } },
            total: { type: 'integer', example: 1 },
            pagina: { type: 'integer', example: 1 },
            tamanhoPagina: { type: 'integer', example: 20 }
          }
        },
        CatalogoMultaErrorResponse: {
          type: 'object',
          required: ['erro'],
          properties: {
            erro: {
              type: 'object',
              required: ['codigo', 'mensagem'],
              properties: {
                codigo: {
                  type: 'string',
                  enum: ['CATALOGO_MULTA_DADOS_INVALIDOS', 'CATALOGO_MULTA_NAO_ENCONTRADO', 'CATALOGO_MULTA_CONFLITO']
                },
                mensagem: { type: 'string' },
                campo: { type: 'string' }
              }
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
