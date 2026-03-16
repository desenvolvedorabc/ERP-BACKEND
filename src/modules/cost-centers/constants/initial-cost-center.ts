import {
  CostCenterType,
  SubCategoryReleaseType,
  SubCategoryType,
} from "../enum";

export const initialCostCenters = {
  PARC: [
    {
      name: "Pessoal", // CENTRO DE CUSTO
      categories: [
        {
          name: "Consultoria Estratégica", // CATEGORIA
          type: CostCenterType.PAGAR,
          sub_categories: [
            {
              name: "Especialista Estratégico 1", // SUBCATEGORIA
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.DESPESAS_PESSOAIS,
            },
            {
              name: "Especialista Estratégico 2",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.DESPESAS_PESSOAIS,
            },
            {
              name: "Coordenador de Articulação Política e de Parcerias",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.DESPESAS_PESSOAIS,
            },
            {
              name: "Diretora Parc",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.DESPESAS_PESSOAIS,
            },
            {
              name: "Diretora Adjunta",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.DESPESAS_PESSOAIS,
            },
            {
              name: "Diretora Administrativa - CLT",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.DESPESAS_PESSOAIS,
            },
            {
              name: "Assessora de Direção - Coordenadora CO-IMPACT",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.DESPESAS_PESSOAIS,
            },
            {
              name: "Coordenador de Comunicação",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.DESPESAS_PESSOAIS,
            },
            {
              name: "Coordenador de Tecnologia e Inovação",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.DESPESAS_PESSOAIS,
            },
            {
              name: "Coordenador de Implementação",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.DESPESAS_PESSOAIS,
            },
            {
              name: "Coordenador de NúcleoS Temáticos",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.DESPESAS_PESSOAIS,
            },
            {
              name: "Assessora de Gente e Gestão",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.DESPESAS_PESSOAIS,
            },
            {
              name: "Analista de Dados",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.DESPESAS_PESSOAIS,
            },
            {
              name: "Gestor de Projetos",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.DESPESAS_PESSOAIS,
            },
            {
              name: "Diretora Desenvolvimento Institucional",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.DESPESAS_PESSOAIS,
            },
            {
              name: "Auxiliar de Gestão",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.DESPESAS_PESSOAIS,
            },
          ],
        },
        {
          name: "Consultoria De Base",
          type: CostCenterType.PAGAR,
          sub_categories: [
            {
              name: "Articulador local",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.DESPESAS_PESSOAIS,
            },
            {
              name: "Assessor técnico",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.DESPESAS_PESSOAIS,
            },
          ],
        },
      ],
    },
    {
      name: "Consultoria Temática",
      categories: [
        {
          name: "Consultoria Temática",
          type: CostCenterType.PAGAR,
          sub_categories: [
            {
              name: "Consultoria pedagógica: formação de professores",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.IPCA,
            },
            {
              name: "Consultoria pedagógica: material didático",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.IPCA,
            },
            {
              name: "Consultoria de planejamento e desenvolvimento de qualidade (360h)",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.IPCA,
            },
            {
              name: "Consultoria para o desenvolvimento de ferramentas e sistemas de gestão e monitoramento",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.IPCA,
            },
            {
              name: "Consultoria: Reorganização de rede",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.IPCA,
            },
            {
              name: "Analise de Contribuição do Programa nos estados iniciados em 2019",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.IPCA,
            },
            {
              name: "Desenvolvimento da equipe (80 horas).",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.IPCA,
            },
            {
              name: "Contribuições eventuais - estados atuais (palestrantes)",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.IPCA,
            },
            {
              name: "Formação dos técnicos das regionais",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.IPCA,
            },
            {
              name: "Formação de Articuladores",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.IPCA,
            },
            {
              name: "Ação Comunicação",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.IPCA,
            },
          ],
        },
        {
          name: "Parceria Nova Escola",
          type: CostCenterType.PAGAR,
          sub_categories: [
            {
              name: "Produção e Implementação do Material Didático para 03 Estados",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.IPCA,
            },
            {
              name: "Produção e disponibilização do Material Referência da PARC",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.IPCA,
            },
          ],
        },
      ],
    },
    {
      name: "Logística",
      categories: [
        {
          name: "Viagens Administrativas",
          type: CostCenterType.PAGAR,
          sub_categories: [
            {
              name: "Coordenadores De Implementação",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.DESPESAS_LOGISTICAS,
            },
            {
              name: "Gestor de Projeto",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.DESPESAS_LOGISTICAS,
            },
            {
              name: "Articuladores Locais",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.DESPESAS_LOGISTICAS,
            },
            {
              name: "Consultores Temáticos",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.DESPESAS_LOGISTICAS,
            },
            {
              name: "Consultores Pontuais",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.DESPESAS_LOGISTICAS,
            },
            {
              name: "Direção PARC",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.DESPESAS_LOGISTICAS,
            },
            {
              name: "Direção Adjunta",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.DESPESAS_LOGISTICAS,
            },
            {
              name: "CEO",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.DESPESAS_LOGISTICAS,
            },
          ],
        },
        {
          name: "Viagens Nacionais (CLT)",
          type: CostCenterType.PAGAR,
          sub_categories: [
            {
              name: "Coordenadores De Implementação",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.DESPESAS_LOGISTICAS,
            },
            {
              name: "Gestor de Projeto",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.DESPESAS_LOGISTICAS,
            },
            {
              name: "Articuladores Locais",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.DESPESAS_LOGISTICAS,
            },
            {
              name: "Consultores Temáticos",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.DESPESAS_LOGISTICAS,
            },
            {
              name: "Consultores Pontuais",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.DESPESAS_LOGISTICAS,
            },
            {
              name: "Direção PARC",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.DESPESAS_LOGISTICAS,
            },
            {
              name: "Direção Adjunta",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.DESPESAS_LOGISTICAS,
            },
            {
              name: "CEO",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.DESPESAS_LOGISTICAS,
            },
          ],
        },
        {
          name: "Viagens Nacionais (PJ)",
          type: CostCenterType.PAGAR,
          sub_categories: [
            {
              name: "Coordenadores De Implementação",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.DESPESAS_LOGISTICAS,
            },
            {
              name: "Gestor de Projeto",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.DESPESAS_LOGISTICAS,
            },
            {
              name: "Articuladores Locais",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.DESPESAS_LOGISTICAS,
            },
            {
              name: "Consultores Temáticos",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.DESPESAS_LOGISTICAS,
            },
            {
              name: "Consultores Pontuais",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.DESPESAS_LOGISTICAS,
            },
            {
              name: "Direção PARC",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.DESPESAS_LOGISTICAS,
            },
            {
              name: "Direção Adjunta",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.DESPESAS_LOGISTICAS,
            },
            {
              name: "CEO",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.DESPESAS_LOGISTICAS,
            },
          ],
        },
        {
          name: "Viagens Internacionais",
          type: CostCenterType.PAGAR,
          sub_categories: [
            {
              name: "Coordenadores De Implementação",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.DESPESAS_LOGISTICAS,
            },
            {
              name: "Gestor de Projeto",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.DESPESAS_LOGISTICAS,
            },
            {
              name: "Articuladores Locais",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.DESPESAS_LOGISTICAS,
            },
            {
              name: "Consultores Temáticos",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.DESPESAS_LOGISTICAS,
            },
            {
              name: "Consultores Pontuais",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.DESPESAS_LOGISTICAS,
            },
            {
              name: "Direção PARC",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.DESPESAS_LOGISTICAS,
            },
            {
              name: "Direção Adjunta",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.DESPESAS_LOGISTICAS,
            },
            {
              name: "CEO",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.DESPESAS_LOGISTICAS,
            },
          ],
        },
      ],
    },
    {
      name: "Avaliação Externa",
      categories: [
        {
          name: "Avaliação Externa",
          type: CostCenterType.PAGAR,
          sub_categories: [
            {
              name: "Avaliação 1 - Censitária",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.CAED,
            },
            {
              name: "Avaliação 2 - Formativa",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.CAED,
            },
            {
              name: "Avaliação 3 - Amostral",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.CAED,
            },
          ],
        },
      ],
    },
    {
      name: "Eventos",
      categories: [
        {
          name: "Seminário Nacional",
          type: CostCenterType.PAGAR,
          sub_categories: [
            {
              name: "Seminário nacional",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.IPCA,
            },
          ],
        },
        {
          name: "Apoio A Eventos",
          type: CostCenterType.PAGAR,
          sub_categories: [
            {
              name: "Apoio a Eventos",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.IPCA,
            },
          ],
        },
      ],
    },
    {
      name: "Administração",
      categories: [
        {
          name: "Administração",
          type: CostCenterType.PAGAR,
          sub_categories: [
            {
              name: "Assessoria contábil",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.IPCA,
            },
            {
              name: "Assessoria Jurídica",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.IPCA,
            },
            {
              name: "Locação de imóvel",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.IPCA,
            },
            {
              name: "Luz, água, telefonia e outros",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.IPCA,
            },
            {
              name: "Manutenção do escritório e outras despesas",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.IPCA,
            },
          ],
        },
      ],
    },
  ],
  EPV: [
    {
      name: "Consultoria",
      categories: [
        {
          name: "Consultoria Educacional",
          type: CostCenterType.PAGAR,
          sub_categories: [
            {
              name: "Formação de professores",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.IPCA,
            },
            {
              name: "Formação de formadores",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.IPCA,
            },
            {
              name: "Produção de material didático-pedagógico para alunos ",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.IPCA,
            },
            {
              name: "Formação com os gestores escolares",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.IPCA,
            },
            {
              name: "Logística",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.IPCA,
            },
          ],
        },
        {
          name: "Outras consultorias",
          type: CostCenterType.PAGAR,
          sub_categories: [
            {
              name: "Assessoria de conteúdo SAEV",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.IPCA,
            },
            {
              name: "Formação Luz Do Saber",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.IPCA,
            },
            {
              name: "Consultoria Financeira",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.IPCA,
            },
            {
              name: "Consultoria para construção de sistema de avaliação",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.IPCA,
            },
            {
              name: "Consultoria protocolos COVID",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.IPCA,
            },
          ],
        },
      ],
    },
    {
      name: "Pessoal",
      categories: [
        {
          name: "Salários, Encargos e Benefícios",
          type: CostCenterType.PAGAR,
          sub_categories: [
            {
              name: "Diretor(a) Presidente",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.DESPESAS_PESSOAIS,
            },
            {
              name: "Diretor Financeiro(a)",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.DESPESAS_PESSOAIS,
            },
            {
              name: "Coordenador(a) Executivo(a)",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.DESPESAS_PESSOAIS,
            },
            {
              name: "Coordenador(a) Estadual",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.DESPESAS_PESSOAIS,
            },
            {
              name: "Coordenador(a) Assistente",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.DESPESAS_PESSOAIS,
            },
            {
              name: "Assistente Administrativo(a)",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.DESPESAS_PESSOAIS,
            },
            {
              name: "Jovem Aprendiz",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.DESPESAS_PESSOAIS,
            },
          ],
        },
        {
          name: "Consultoria Estratégica",
          type: CostCenterType.PAGAR,
          sub_categories: [
            {
              name: "CEO + Consultor estratégico 1",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.IPCA,
            },
            {
              name: "Consultor estratégico 2",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.IPCA,
            },
            {
              name: "Diretora executiva",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.IPCA,
            },
            {
              name: "Assessora de direção executiva",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.IPCA,
            },
            {
              name: "Coordenador assistente",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.IPCA,
            },
            {
              name: "Coordenador estadual",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.IPCA,
            },
            {
              name: "Gestor de projeto",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.IPCA,
            },
            {
              name: "Trainee",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.IPCA,
            },
          ],
        },
        {
          name: "Desenvolvimento Profissional Da Equipe",
          type: CostCenterType.PAGAR,
          sub_categories: [
            {
              name: "Formação Da Equipe ABC",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.IPCA,
            },
          ],
        },
      ],
    },
    {
      name: "Comunicação",
      categories: [
        {
          name: "Comunicação",
          type: CostCenterType.PAGAR,
          sub_categories: [
            {
              name: "Manutenção SAEV",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.IPCA,
            },
            {
              name: "Melhorias SAEV",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.IPCA,
            },
            {
              name: "Manutenção Plataforma ABC",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.IPCA,
            },
          ],
        },
      ],
    },
    {
      name: "Logística",
      categories: [
        {
          name: "Viagens Administrativas",
          type: CostCenterType.PAGAR,
          sub_categories: [
            {
              name: "Diretora Executiva",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.DESPESAS_LOGISTICAS,
            },
            {
              name: "Assessora de direção executiva",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.DESPESAS_LOGISTICAS,
            },
            {
              name: "Formação de equipes",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.DESPESAS_LOGISTICAS,
            },
            {
              name: "Diretor Geral",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.DESPESAS_LOGISTICAS,
            },
            {
              name: "Coordenadores Estaduais e Assistentes",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.DESPESAS_LOGISTICAS,
            },
          ],
        },
        {
          name: "Viagens Nacionais (CLT)",
          type: CostCenterType.PAGAR,
          sub_categories: [
            {
              name: "Diretora Executiva",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.DESPESAS_LOGISTICAS,
            },
            {
              name: "Assessora de direção executiva",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.DESPESAS_LOGISTICAS,
            },
            {
              name: "Formação de equipes",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.DESPESAS_LOGISTICAS,
            },
            {
              name: "Diretor Geral",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.DESPESAS_LOGISTICAS,
            },
            {
              name: "Coordenadores Estaduais e Assistentes",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.DESPESAS_LOGISTICAS,
            },
          ],
        },
        {
          name: "Viagens Nacionais (PJ)",
          type: CostCenterType.PAGAR,
          sub_categories: [
            {
              name: "Diretora Executiva",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.DESPESAS_LOGISTICAS,
            },
            {
              name: "Assessora de direção executiva",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.DESPESAS_LOGISTICAS,
            },
            {
              name: "Formação de equipes",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.DESPESAS_LOGISTICAS,
            },
            {
              name: "Diretor Geral",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.DESPESAS_LOGISTICAS,
            },
            {
              name: "Coordenadores Estaduais e Assistentes",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.DESPESAS_LOGISTICAS,
            },
          ],
        },
        {
          name: "Viagens Internacionais",
          type: CostCenterType.PAGAR,
          sub_categories: [
            {
              name: "Diretora Executiva",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.DESPESAS_LOGISTICAS,
            },
            {
              name: "Assessora de direção executiva",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.DESPESAS_LOGISTICAS,
            },
            {
              name: "Formação de equipes",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.DESPESAS_LOGISTICAS,
            },
            {
              name: "Diretor Geral",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.DESPESAS_LOGISTICAS,
            },
            {
              name: "Coordenadores Estaduais e Assistentes",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.DESPESAS_LOGISTICAS,
            },
          ],
        },
      ],
    },
    {
      name: "Eventos",
      categories: [
        {
          name: "Seminário Nacional",
          type: CostCenterType.PAGAR,
          sub_categories: [
            {
              name: "Seminário Nacional",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.IPCA,
            },
          ],
        },

        {
          name: "Seminário Regional",
          type: CostCenterType.PAGAR,
          sub_categories: [
            {
              name: "Infraestrutura",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.IPCA,
            },
            {
              name: "Palestrantes",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.IPCA,
            },
          ],
        },
      ],
    },
    {
      name: "Avaliação Externa",
      categories: [
        {
          name: "Avaliação Externa",
          type: CostCenterType.PAGAR,
          sub_categories: [
            {
              name: "CAED",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.CAED,
            },
            {
              name: "Gráfica",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.IPCA,
            },
            {
              name: "Transportadora",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.IPCA,
            },
            {
              name: "Apoio de coordenação municipal",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.IPCA,
            },
          ],
        },
      ],
    },
    {
      name: "Produção De Conteúdo",
      categories: [
        {
          name: "Produção De Material",
          type: CostCenterType.PAGAR,
          sub_categories: [
            {
              name: "Diagrama e ilustração",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.IPCA,
            },
          ],
        },
        {
          name: "Impressão e entrega de material didático-pedagógico",
          type: CostCenterType.PAGAR,
          sub_categories: [
            {
              name: "Impressão de material didático-pedagógico",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.IPCA,
            },
            {
              name: "Transporte do material didático-pedagógico",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.IPCA,
            },
          ],
        },
      ],
    },
    {
      name: "Administração",
      categories: [
        {
          name: "Administração",
          type: CostCenterType.PAGAR,
          sub_categories: [
            {
              name: "Assessoria contábil",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.IPCA,
            },
            {
              name: "Assessoria Jurídica",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.IPCA,
            },
            {
              name: "Locação de imóvel",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.IPCA,
            },
            {
              name: "Luz, água, telefonia e outros",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.IPCA,
            },
            {
              name: "Manutenção do escritório e outras despesas",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.IPCA,
            },
            {
              name: "Auditoria externa",
              type: SubCategoryType.REDE,
              releaseType: SubCategoryReleaseType.IPCA,
            },
          ],
        },
      ],
    },
  ],
};

export const defaultCostCenters = [
  {
    name: "Consultoria",
    categories: [
      {
        name: "Consultoria Educacional",
        type: CostCenterType.PAGAR,
        sub_categories: [
          {
            name: "Formação de professores",
            type: SubCategoryType.REDE,
            releaseType: SubCategoryReleaseType.DESPESAS_PESSOAIS,
          },
          {
            name: "Formação de formadores",
            type: SubCategoryType.REDE,
            releaseType: SubCategoryReleaseType.DESPESAS_PESSOAIS,
          },
          {
            name: "Produção de material didático-pedagógico para alunos ",
            type: SubCategoryType.REDE,
            releaseType: SubCategoryReleaseType.DESPESAS_PESSOAIS,
          },
          {
            name: "Formação com os gestores escolares",
            type: SubCategoryType.REDE,
            releaseType: SubCategoryReleaseType.DESPESAS_PESSOAIS,
          },
          {
            name: "Logística",
            type: SubCategoryType.REDE,
            releaseType: SubCategoryReleaseType.DESPESAS_PESSOAIS,
          },
        ],
      },
      {
        name: "Outras consultorias",
        type: CostCenterType.PAGAR,
        sub_categories: [
          {
            name: "Assessoria de conteúdo SAEV",
            type: SubCategoryType.REDE,
            releaseType: SubCategoryReleaseType.IPCA,
          },
          {
            name: "Formação Luz Do Saber",
            type: SubCategoryType.REDE,
            releaseType: SubCategoryReleaseType.IPCA,
          },
          {
            name: "Consultoria Financeira",
            type: SubCategoryType.REDE,
            releaseType: SubCategoryReleaseType.IPCA,
          },
          {
            name: "Consultoria para construção de sistema de avaliação",
            type: SubCategoryType.REDE,
            releaseType: SubCategoryReleaseType.IPCA,
          },
          {
            name: "Consultoria protocolos COVID",
            type: SubCategoryType.REDE,
            releaseType: SubCategoryReleaseType.IPCA,
          },
        ],
      },
    ],
  },
  {
    name: "Comunicação",
    categories: [
      {
        name: "Comunicação",
        type: CostCenterType.PAGAR,
        sub_categories: [
          {
            name: "Manutenção SAEV",
            type: SubCategoryType.REDE,
            releaseType: SubCategoryReleaseType.IPCA,
          },
          {
            name: "Melhorias SAEV",
            type: SubCategoryType.REDE,
            releaseType: SubCategoryReleaseType.IPCA,
          },
          {
            name: "Manutenção Plataforma ABC",
            type: SubCategoryType.REDE,
            releaseType: SubCategoryReleaseType.IPCA,
          },
        ],
      },
    ],
  },
  {
    name: "Avaliação Externa",
    categories: [
      {
        name: "Avaliação Externa",
        type: CostCenterType.PAGAR,
        sub_categories: [
          {
            name: "CAED",
            type: SubCategoryType.REDE,
            releaseType: SubCategoryReleaseType.CAED,
          },
          {
            name: "Gráfica",
            type: SubCategoryType.REDE,
            releaseType: SubCategoryReleaseType.IPCA,
          },
          {
            name: "Transportadora",
            type: SubCategoryType.REDE,
            releaseType: SubCategoryReleaseType.IPCA,
          },
          {
            name: "Apoio de coordenação municipal",
            type: SubCategoryType.REDE,
            releaseType: SubCategoryReleaseType.IPCA,
          },
        ],
      },
    ],
  },
  {
    name: "Produção De Conteúdo",
    categories: [
      {
        name: "Produção De Material",
        type: CostCenterType.PAGAR,
        sub_categories: [
          {
            name: "Diagrama e ilustração",
            type: SubCategoryType.REDE,
            releaseType: SubCategoryReleaseType.IPCA,
          },
        ],
      },
      {
        name: "Impressão e entrega de material didático-pedagógico",
        type: CostCenterType.PAGAR,
        sub_categories: [
          {
            name: "Impressão de material didático-pedagógico",
            type: SubCategoryType.REDE,
            releaseType: SubCategoryReleaseType.IPCA,
          },
          {
            name: "Transporte do material didático-pedagógico",
            type: SubCategoryType.REDE,
            releaseType: SubCategoryReleaseType.IPCA,
          },
        ],
      },
    ],
  },
];
