import { GravidadeCatalogoMulta } from '../CatalogoMulta/CatalogoMulta';
import { type Cidadao, SituacaoCnh } from '../Cidadao/Cidadao';
import { Multa } from './Multa';

export type ResultadoPontuacao = 'SEM_IMPEDIMENTO_IDENTIFICADO' | 'AGUARDANDO_IDENTIFICACAO'
  | 'SEM_HABILITACAO' | 'LIMITE_ATINGIDO' | 'ANALISE_ADMINISTRATIVA_NECESSARIA';

export interface AlertaPontuacao {
  codigo: string;
  cidadaoId: string | null;
  mensagem: string;
}

export interface AnalisePontuacao {
  dataReferencia: Date;
  responsavelId: string | null;
  pontuacaoAnalisavel: boolean;
  pontosAnteriores: number | null;
  pontosDaNovaMulta: number | null;
  pontosProjetados: number | null;
  gravissimasComputaveis: number | null;
  limitePontos: number | null;
  atingiuLimite: boolean | null;
  infracaoAutossuspensiva: boolean;
  resultado: ResultadoPontuacao;
  motivos: string[];
  alertas: AlertaPontuacao[];
}

export class PoliticaPontuacao {
  static inicioJanela(referencia: Date): Date {
    const inicio = new Date(referencia);
    const dia = inicio.getUTCDate();
    inicio.setUTCDate(1);
    inicio.setUTCFullYear(inicio.getUTCFullYear() - 1);
    const ultimoDia = new Date(Date.UTC(inicio.getUTCFullYear(), inicio.getUTCMonth() + 1, 0)).getUTCDate();
    inicio.setUTCDate(Math.min(dia, ultimoDia));
    return inicio;
  }

  static analisar(nova: Multa, historico: readonly Multa[], responsavel: Cidadao | null, condutor: Cidadao | null): AnalisePontuacao {
    const referencia = nova.dataHoraOcorrencia;
    const analise: AnalisePontuacao = {
      dataReferencia: referencia,
      responsavelId: nova.responsavelId,
      pontuacaoAnalisavel: false,
      pontosAnteriores: null,
      pontosDaNovaMulta: null,
      pontosProjetados: null,
      gravissimasComputaveis: null,
      limitePontos: null,
      atingiuLimite: null,
      infracaoAutossuspensiva: nova.autossuspensiva,
      resultado: 'SEM_IMPEDIMENTO_IDENTIFICADO',
      motivos: ['Projeção acadêmica baseada no cadastro atual e na leitura disponível; não reconstrói CNH histórica nem garante saldo administrativo serializado sob concorrência.'],
      alertas: []
    };
    const alertar = (codigo: string, cidadaoId: string | null, mensagem: string): void => {
      analise.alertas.push({ codigo, cidadaoId, mensagem });
    };
    // A mesma pessoa pode ser condutor e responsável; avaliar o cadastro uma só vez.
    const pessoas = new Map<string, Cidadao>();
    if (responsavel) pessoas.set(responsavel.id, responsavel);
    if (condutor) pessoas.set(condutor.id, condutor);
    for (const pessoa of pessoas.values()) {
      if (!pessoa.possuiCnh || pessoa.situacaoCnh === SituacaoCnh.SEM_HABILITACAO) {
        alertar('SEM_HABILITACAO', pessoa.id, 'Cadastro sem CNH; não há prontuário de pontos analisável para esta pessoa.');
      }
      if (pessoa.situacaoCnh === SituacaoCnh.SUSPENSA || pessoa.situacaoCnh === SituacaoCnh.CASSADA) {
        alertar(`CNH_${pessoa.situacaoCnh}`, pessoa.id, `CNH ${pessoa.situacaoCnh.toLowerCase()} no cadastro atual; requer análise administrativa.`);
      }
      if (pessoa.cnhValidade && pessoa.cnhValidade.toISOString().slice(0, 10) < referencia.toISOString().slice(0, 10)) {
        alertar('CNH_VENCIDA', pessoa.id, 'Validade cadastrada anterior à data da ocorrência; requer confirmação, sem enquadramento automático.');
      }
    }
    if (condutor && (!condutor.possuiCnh || condutor.situacaoCnh === SituacaoCnh.SEM_HABILITACAO)) {
      alertar('POSSIVEL_ART_162_I', condutor.id, 'Possível enquadramento no art. 162, I, sujeito à confirmação de CNH, PPD ou ACC; nenhuma multa adicional foi criada.');
    }
    if (nova.autossuspensiva) {
      alertar('INFRACAO_AUTOSSUSPENSIVA', nova.responsavelId, 'Infração com suspensão específica; depende de análise administrativa e não compõe a soma de pontos.');
    }

    if (nova.responsavelId === null) {
      analise.resultado = 'AGUARDANDO_IDENTIFICACAO';
      analise.motivos.push('Condutor não identificado; não é possível atribuir ou analisar pontos.');
    } else if (!responsavel || responsavel.id !== nova.responsavelId) {
      analise.resultado = 'ANALISE_ADMINISTRATIVA_NECESSARIA';
      analise.motivos.push('Cadastro do responsável indisponível para a análise.');
    } else if (!responsavel.possuiCnh || responsavel.situacaoCnh === SituacaoCnh.SEM_HABILITACAO) {
      analise.resultado = 'SEM_HABILITACAO';
      analise.motivos.push('Responsável cadastrado sem CNH; pontuação não analisável.');
    } else {
      const inicio = this.inicioJanela(referencia);
      const computaveis = new Map<string, Multa>();
      for (const multa of [...historico, nova]) {
        if (multa.responsavelId === responsavel.id && multa.podeComputarPontos(true)
          && multa.dataHoraOcorrencia > inicio && multa.dataHoraOcorrencia <= referencia) {
          computaveis.set(multa.ocorrenciaId, multa);
        }
      }
      const anteriores = [...computaveis.values()].filter(multa => multa.ocorrenciaId !== nova.ocorrenciaId);
      analise.pontuacaoAnalisavel = true;
      analise.pontosAnteriores = anteriores.reduce((total, multa) => total + multa.pontosAplicaveis, 0);
      analise.pontosDaNovaMulta = nova.podeComputarPontos(true) ? nova.pontosAplicaveis : 0;
      analise.pontosProjetados = analise.pontosAnteriores + analise.pontosDaNovaMulta;
      analise.gravissimasComputaveis = [...computaveis.values()].filter(multa => multa.gravidadeAplicada === GravidadeCatalogoMulta.GRAVISSIMA).length;
      analise.limitePontos = responsavel.exerceAtividadeRemunerada || analise.gravissimasComputaveis === 0
        ? 40 : analise.gravissimasComputaveis === 1 ? 30 : 20;
      analise.atingiuLimite = analise.pontosProjetados >= analise.limitePontos;
      if (analise.atingiuLimite) {
        analise.resultado = 'LIMITE_ATINGIDO';
        alertar('LIMITE_PONTOS_ATINGIDO', responsavel.id, 'Projeção atingiu o limite de pontos; a situação efetiva da CNH permanece inalterada.');
      }
    }
    if (analise.alertas.length > 0) {
      if (analise.resultado === 'SEM_IMPEDIMENTO_IDENTIFICADO') analise.resultado = 'ANALISE_ADMINISTRATIVA_NECESSARIA';
      analise.motivos.push(...analise.alertas.map(alerta => alerta.mensagem));
    }
    return analise;
  }
}
