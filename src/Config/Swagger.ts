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
        MultarRequest: {
          type: 'object',
          additionalProperties: false,
          required: ['ocorrenciaId', 'codigoCamera', 'placa', 'catalogoMultaId', 'dataHoraOcorrencia', 'local'],
          properties: {
            ocorrenciaId: { type: 'string', format: 'uuid', description: 'Identificador único da captura; repetição retorna 409.' },
            codigoCamera: { type: 'string', minLength: 1, maxLength: 50 },
            placa: { type: 'string', example: 'ABC1D23', description: 'Placa antiga ou Mercosul; normalizada como no cadastro de Veículo.' },
            catalogoMultaId: { type: 'string', format: 'uuid' },
            condutorId: { type: 'string', format: 'uuid', nullable: true, description: 'Opcional; não é deduzido pelo proprietário.' },
            dataHoraOcorrencia: { type: 'string', format: 'date-time', description: 'ISO 8601 com segundos e fuso, até milissegundos, ano entre 1000 e 9999; data real e não futura.' },
            local: { type: 'string', minLength: 1, maxLength: 200 }
          }
        },
        MultaResponse: {
          type: 'object',
          required: ['id', 'ocorrenciaId', 'codigoCamera', 'placaCapturada', 'veiculoId', 'proprietarioIdNaOcorrencia', 'condutorId', 'responsavelId', 'catalogoMultaId', 'codigoInfracaoAplicado', 'descricaoInfracaoAplicada', 'artigoCtbAplicado', 'gravidadeAplicada', 'responsabilidadeAplicada', 'valorAplicado', 'pontosAplicaveis', 'autossuspensiva', 'dataHoraOcorrencia', 'local', 'status', 'motivoCancelamento'],
          properties: {
            id: { type: 'string', format: 'uuid' },
            ocorrenciaId: { type: 'string', format: 'uuid' },
            codigoCamera: { type: 'string', example: 'CAM-001' },
            placaCapturada: { type: 'string', example: 'ABC1D23' },
            veiculoId: { type: 'string', format: 'uuid' },
            proprietarioIdNaOcorrencia: { type: 'string', format: 'uuid' },
            condutorId: { type: 'string', format: 'uuid', nullable: true },
            responsavelId: { type: 'string', format: 'uuid', nullable: true },
            catalogoMultaId: { type: 'string', format: 'uuid' },
            codigoInfracaoAplicado: { type: 'string', example: 'EXEMPLO-001' },
            descricaoInfracaoAplicada: { type: 'string', example: 'Infração fictícia de demonstração' },
            artigoCtbAplicado: { type: 'string', example: 'Referência fictícia' },
            gravidadeAplicada: { type: 'string', enum: ['LEVE', 'MEDIA', 'GRAVE', 'GRAVISSIMA'] },
            responsabilidadeAplicada: { type: 'string', enum: ['CONDUTOR', 'PROPRIETARIO'] },
            valorAplicado: { type: 'number', minimum: 0, maximum: 999998999900, example: 1.01, description: 'Snapshot do cálculo monetário do catálogo, arredondado em centavos (2,01 × 0,50 = 1,01).' },
            pontosAplicaveis: { type: 'integer', enum: [0, 3, 4, 5, 7], description: 'Regra da infração; pendência não atribui estes pontos a pessoa desconhecida.' },
            autossuspensiva: { type: 'boolean' },
            dataHoraOcorrencia: { type: 'string', format: 'date-time', description: 'Ocorrência normalizada para UTC.' },
            local: { type: 'string' },
            status: { type: 'string', enum: ['REGISTRADA', 'AGUARDANDO_IDENTIFICACAO', 'CANCELADA'] },
            motivoCancelamento: { type: 'string', nullable: true, example: null }
          }
        },
        AnalisePontuacaoResponse: {
          type: 'object',
          required: ['dataReferencia', 'responsavelId', 'pontuacaoAnalisavel', 'pontosAnteriores', 'pontosDaNovaMulta', 'pontosProjetados', 'gravissimasComputaveis', 'limitePontos', 'atingiuLimite', 'infracaoAutossuspensiva', 'resultado', 'motivos', 'alertas'],
          description: 'Sem responsável habilitado, números, limite e atingiuLimite são nulos com motivo explícito. Alertas são independentes e não alteram a CNH.',
          properties: {
            dataReferencia: { type: 'string', format: 'date-time' },
            responsavelId: { type: 'string', format: 'uuid', nullable: true },
            pontuacaoAnalisavel: { type: 'boolean' },
            pontosAnteriores: { type: 'integer', nullable: true, minimum: 0 },
            pontosDaNovaMulta: { type: 'integer', nullable: true, minimum: 0 },
            pontosProjetados: { type: 'integer', nullable: true, minimum: 0 },
            gravissimasComputaveis: { type: 'integer', nullable: true, minimum: 0 },
            limitePontos: { type: 'integer', enum: [20, 30, 40, null], nullable: true },
            atingiuLimite: { type: 'boolean', nullable: true },
            infracaoAutossuspensiva: { type: 'boolean' },
            resultado: { type: 'string', enum: ['SEM_IMPEDIMENTO_IDENTIFICADO', 'AGUARDANDO_IDENTIFICACAO', 'SEM_HABILITACAO', 'LIMITE_ATINGIDO', 'ANALISE_ADMINISTRATIVA_NECESSARIA'] },
            motivos: { type: 'array', items: { type: 'string' } },
            alertas: { type: 'array', items: {
              type: 'object', required: ['codigo', 'cidadaoId', 'mensagem'], properties: {
                codigo: { type: 'string', enum: ['SEM_HABILITACAO', 'CNH_SUSPENSA', 'CNH_CASSADA', 'CNH_VENCIDA', 'POSSIVEL_ART_162_I', 'INFRACAO_AUTOSSUSPENSIVA', 'LIMITE_PONTOS_ATINGIDO'] },
                cidadaoId: { type: 'string', format: 'uuid', nullable: true },
                mensagem: { type: 'string' }
              }
            } }
          }
        },
        MultarResponse: {
          type: 'object', required: ['multa', 'analise', 'pendencias'],
          example: {
            multa: {
              id: '550e8400-e29b-41d4-a716-446655440001',
              ocorrenciaId: 'f8fdb891-12aa-4d12-aecb-85198bedca02',
              codigoCamera: 'CAM-001', placaCapturada: 'ABC1D23',
              veiculoId: '550e8400-e29b-41d4-a716-446655440002',
              proprietarioIdNaOcorrencia: '550e8400-e29b-41d4-a716-446655440003',
              condutorId: null, responsavelId: null,
              catalogoMultaId: '8bb197c0-5f68-41c4-a780-a6f729d64dac',
              codigoInfracaoAplicado: 'EXEMPLO-001', descricaoInfracaoAplicada: 'Infração fictícia de demonstração',
              artigoCtbAplicado: 'Referência fictícia', gravidadeAplicada: 'LEVE', responsabilidadeAplicada: 'CONDUTOR',
              valorAplicado: 1.01, pontosAplicaveis: 3, autossuspensiva: false,
              dataHoraOcorrencia: '2026-11-12T12:00:00.000Z', local: 'Avenida Brasil, 100',
              status: 'AGUARDANDO_IDENTIFICACAO', motivoCancelamento: null
            },
            analise: {
              dataReferencia: '2026-11-12T12:00:00.000Z', responsavelId: null, pontuacaoAnalisavel: false,
              pontosAnteriores: null, pontosDaNovaMulta: null, pontosProjetados: null,
              gravissimasComputaveis: null, limitePontos: null, atingiuLimite: null,
              infracaoAutossuspensiva: false, resultado: 'AGUARDANDO_IDENTIFICACAO',
              motivos: [
                'Projeção acadêmica baseada no cadastro atual e na leitura disponível; não reconstrói CNH histórica nem garante saldo administrativo serializado sob concorrência.',
                'Condutor não identificado; não é possível atribuir ou analisar pontos.'
              ], alertas: []
            },
            pendencias: [{
              codigo: 'IDENTIFICAR_CONDUTOR', proprietarioId: '550e8400-e29b-41d4-a716-446655440003',
              mensagem: 'Identificação do condutor pendente; proprietário a contatar. Nenhuma notificação foi enviada. Não há rota de identificação nesta versão.'
            }]
          },
          properties: {
            multa: { $ref: '#/components/schemas/MultaResponse' },
            analise: { $ref: '#/components/schemas/AnalisePontuacaoResponse' },
            pendencias: { type: 'array', items: {
              type: 'object', required: ['codigo', 'mensagem', 'proprietarioId'], properties: {
                codigo: { type: 'string', enum: ['IDENTIFICAR_CONDUTOR'] },
                mensagem: { type: 'string', description: 'Pendência informativa; não indica envio de notificação ou disponibilidade de rota para identificar condutor.' },
                proprietarioId: { type: 'string', format: 'uuid' }
              }
            } }
          }
        },
        CameraTransitoErrorResponse: {
          type: 'object', required: ['erro'], properties: {
            erro: { type: 'object', required: ['codigo', 'mensagem'], properties: {
              codigo: { type: 'string', enum: ['CAMERA_TRANSITO_DADOS_INVALIDOS', 'CAMERA_TRANSITO_NAO_ENCONTRADO', 'CAMERA_TRANSITO_OCORRENCIA_DUPLICADA', 'CAMERA_TRANSITO_CONFLITO'] },
              mensagem: { type: 'string' }, campo: { type: 'string' }
            } }
          }
        },
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
                valorCalculado: {
                  type: 'number', format: 'double', readOnly: true, example: 880.41,
                  description: 'Valor base × multiplicador, arredondado para duas casas decimais; meio centavo arredonda para cima.'
                },
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
