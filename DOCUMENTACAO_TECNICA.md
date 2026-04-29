# Documentação Técnica — ERP Financeiro Backend

> Destinado ao time técnico que assumirá a operação e evolução do sistema.

---

## Sumário

1. [Visão Geral do Projeto](#1-visão-geral-do-projeto)
2. [Tecnologias e Dependências](#2-tecnologias-e-dependências)
3. [Arquitetura do Sistema](#3-arquitetura-do-sistema)
4. [Estrutura de Diretórios](#4-estrutura-de-diretórios)
5. [Módulos e Funcionalidades](#5-módulos-e-funcionalidades)
6. [Banco de Dados](#6-banco-de-dados)
7. [Autenticação e Autorização](#7-autenticação-e-autorização)
8. [Integrações Externas](#8-integrações-externas)
9. [Fluxos de Negócio](#9-fluxos-de-negócio)
10. [Padrões e Convenções](#10-padrões-e-convenções)
11. [Tarefas Agendadas](#11-tarefas-agendadas)
12. [Arquitetura Orientada a Eventos](#12-arquitetura-orientada-a-eventos)
13. [Setup do Ambiente de Desenvolvimento](#13-setup-do-ambiente-de-desenvolvimento)
14. [Build e Deploy](#14-build-e-deploy)
15. [Testes](#15-testes)
16. [Variáveis de Ambiente](#16-variáveis-de-ambiente)
17. [Armadilhas Comuns e Gotchas](#17-armadilhas-comuns-e-gotchas)

---

## 1. Visão Geral do Projeto

O **ERP Financeiro Backend** é um sistema de gestão financeira desenvolvido em **NestJS** que centraliza:

- Contas a pagar e a receber com fluxo de aprovação multinível
- Gestão de contratos (fornecedores, financiadores, colaboradores)
- Planejamento e controle orçamentário
- Conciliação bancária automática
- Processamento de arquivos CNAB 240 (padrão bancário brasileiro)
- Integração com a API Open Banking do Bradesco

O sistema opera com valores monetários sempre armazenados em **centavos (BIGINT)** para evitar problemas de precisão com ponto flutuante.

**Informações básicas:**

| Item | Valor |
|------|-------|
| Linguagem | TypeScript (Node.js 20) |
| Framework | NestJS 10 |
| Banco de dados | MySQL |
| ORM | TypeORM 0.3.17 |
| Porta padrão | 3003 (configurável via `PORT`) |
| Documentação da API | `/api/swagger` |

---

## 2. Tecnologias e Dependências

### Framework e Infraestrutura

| Pacote | Versão | Propósito |
|--------|--------|-----------|
| `@nestjs/common` | ^10.0.0 | Core do NestJS |
| `@nestjs/core` | ^10.0.0 | Módulo central do framework |
| `@nestjs/platform-express` | ^10.0.0 | Integração com Express |
| `@nestjs/config` | ^3.1.1 | Gerenciamento de variáveis de ambiente |
| `@nestjs/swagger` | ^7.1.11 | Documentação automática da API |
| `@nestjs/event-emitter` | ^2.0.3 | Sistema de eventos assíncronos |
| `@nestjs/schedule` | ^4.1.1 | Agendamento de tarefas (cron) |
| `@nestjs/serve-static` | ^4.0.2 | Servir arquivos estáticos |
| `rxjs` | ^7.8.1 | Programação reativa |

### Banco de Dados

| Pacote | Versão | Propósito |
|--------|--------|-----------|
| `typeorm` | ^0.3.17 | ORM principal |
| `@nestjs/typeorm` | ^10.0.0 | Integração NestJS-TypeORM |
| `mysql2` | ^3.6.1 | Driver MySQL |
| `nestjs-typeorm-paginate` | ^4.0.4 | Paginação automática |

### Autenticação e Segurança

| Pacote | Versão | Propósito |
|--------|--------|-----------|
| `@nestjs/jwt` | ^10.1.1 | Tokens JWT |
| `@nestjs/passport` | ^10.0.2 | Estratégias de autenticação |
| `passport-jwt` | ^4.0.1 | Estratégia JWT |
| `passport-http` | ^0.3.0 | Basic Auth HTTP |
| `bcrypt` | ^5.1.1 | Hash de senhas |

### Geração de Arquivos e Exportação

| Pacote | Versão | Propósito |
|--------|--------|-----------|
| `@react-pdf/renderer` | ^3.4.4 | Geração de PDFs |
| `jspdf` + `jspdf-autotable` | ^2.5.2 / ^3.8.4 | PDFs com tabelas |
| `xlsx` | ^0.18.5 | Importação/exportação Excel |
| `json2csv` | ^6.0.0-alpha.2 | Exportação CSV |

### CNAB e Integração Bancária

| Pacote | Versão | Propósito |
|--------|--------|-----------|
| `cnab240-nodejs` | GitHub (s2way) | Processamento de arquivos CNAB 240 |
| `ssh2` | ^1.16.0 | Transferência SFTP para o banco |
| `axios` | ^1.7.7 | Cliente HTTP para API Bradesco |

### Utilitários

| Pacote | Versão | Propósito |
|--------|--------|-----------|
| `date-fns` | ^2.30.0 | Manipulação de datas (preferido) |
| `dayjs` | ^1.11.13 | Manipulação de datas (legado) |
| `moment` | ^2.14.1 | Manipulação de datas (legado) |
| `zod` | ^3.23.8 | Validação de schemas (CNAB) |
| `class-validator` | ^0.14.0 | Validação de DTOs |
| `class-transformer` | ^0.5.1 | Transformação de objetos |
| `nodemailer` | ^6.9.5 | Envio de e-mails |
| `lodash` | ^4.17.21 | Utilitários gerais |
| `remove-accents` | ^0.4.1 | Sanitização de texto |

### Validação de Dados Brasileiros

- **CPF/CNPJ**: Decorator customizado `@IsValidCPFOrCNPJ()`
- **Formatação monetária**: Utilitários em `src/common/utils/`
- **Máscara de dados**: Funções dedicadas de formatação

---

## 3. Arquitetura do Sistema

### Visão Macro

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                        │
│                  http://localhost:3000                        │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTPS / REST
┌────────────────────────▼────────────────────────────────────┐
│                    BACKEND (NestJS)                           │
│                  http://localhost:3003                        │
│                                                               │
│  ┌─────────┐ ┌──────────┐ ┌──────────┐ ┌────────────────┐  │
│  │  Auth   │ │ Payables │ │Contracts │ │   Budget Plans  │  │
│  │  Module │ │  Module  │ │  Module  │ │     Module      │  │
│  └─────────┘ └──────────┘ └──────────┘ └────────────────┘  │
│       + 24 outros módulos de domínio                          │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                   Common Layer                       │    │
│  │  Guards │ Interceptors │ Decorators │ Pipes │ Utils  │    │
│  └─────────────────────────────────────────────────────┘    │
└───────────────┬─────────────────────┬───────────────────────┘
                │                     │
     ┌──────────▼──────┐   ┌──────────▼──────────┐
     │   MySQL Database │   │   Bradesco Open API  │
     │   (TypeORM)      │   │   + SFTP (CNAB 240)  │
     └─────────────────┘   └─────────────────────┘
```

### Camadas da Aplicação

```
Controller (HTTP) → Service (Negócio) → Repository (Dados) → Database
```

Cada módulo segue esta estrutura padrão:
- **Controller**: Recebe requisições HTTP, valida entrada via DTOs, delega ao Service
- **Service**: Contém toda a lógica de negócio, emite eventos, chama outros serviços
- **Repository**: Acesso ao banco de dados via TypeORM, queries customizadas
- **Entity**: Mapeamento ORM da tabela no banco
- **DTO**: Objetos de transferência para entrada/saída

---

## 4. Estrutura de Diretórios

```
erp-financeiro-backend/
├── src/
│   ├── main.ts                         # Ponto de entrada, bootstrap da aplicação
│   ├── app.module.ts                   # Módulo raiz (importa todos os 28 módulos)
│   ├── app.controller.ts               # Controller raiz (health check)
│   ├── app.service.ts                  # Service raiz
│   │
│   ├── config/
│   │   └── typeorm/
│   │       ├── configuration.ts        # Config runtime do TypeORM
│   │       └── database-config.factory.ts
│   │
│   ├── database/
│   │   ├── migrations/                 # Migrations TypeORM (11 arquivos)
│   │   ├── repositories/              # BaseRepository (padrão base)
│   │   └── typeorm/
│   │       └── ormconfig.ts           # Config CLI do TypeORM
│   │
│   ├── modules/                        # 28 módulos de domínio
│   │   ├── accounts/                   # Contas bancárias
│   │   ├── apiBradesco/               # Integração API Bradesco
│   │   ├── auth/                       # Autenticação JWT
│   │   ├── bank-reconciliation/        # Conciliação bancária
│   │   ├── budget-plans/              # Planos orçamentários
│   │   ├── budgets/                   # Orçamentos
│   │   ├── categorization/            # Categorização de transações
│   │   ├── collaborators/             # Colaboradores
│   │   ├── contracts/                 # Contratos
│   │   ├── cost-centers/              # Centros de custo
│   │   ├── creditCard/                # Cartão de crédito
│   │   ├── files/                     # Gerenciamento de arquivos
│   │   ├── financialManager/          # Gestor financeiro (cron de vencimentos)
│   │   ├── financiers/                # Financiadores
│   │   ├── history/                   # Histórico de contratos (audit trail)
│   │   ├── import-excel/              # Importação de planilhas
│   │   ├── installments/              # Parcelas
│   │   ├── partner-municipalities/    # Municípios parceiros
│   │   ├── partner-states/            # Estados parceiros
│   │   ├── payables/                  # Contas a pagar + aprovações
│   │   ├── programs/                  # Programas
│   │   ├── receivables/               # Contas a receber
│   │   ├── reports/                   # Relatórios
│   │   ├── seed/                      # Seed inicial do banco
│   │   ├── statistics/                # Estatísticas e KPIs
│   │   ├── suppliers/                 # Fornecedores
│   │   ├── token/                     # Tokens Bradesco (OAuth)
│   │   └── users/                     # Usuários
│   │
│   └── common/                         # Infraestrutura compartilhada
│       ├── decorators/                 # Decorators customizados
│       ├── DTOs/                       # DTOs compartilhados
│       ├── enums/                      # Enums compartilhados
│       ├── errors/                     # Classes de erro customizadas
│       ├── events/                     # Definições de eventos
│       ├── exceptions/                 # Filtros de exceção
│       ├── gateways/
│       │   ├── cnab/                   # Processamento CNAB 240
│       │   └── transfer-file-sftp/     # Transferência SFTP
│       ├── guards/                     # Guards de autenticação
│       ├── interceptors/               # TransactionInterceptor
│       ├── mappers/                    # Mapeadores de dados
│       ├── middleware/                 # Middleware Express (logs)
│       ├── pipes/                      # ParseNumericIdPipe .ts (tem espaço!)
│       ├── services/                   # Serviços compartilhados
│       └── utils/                      # 24+ utilitários (datas, formatação, PDF)
│
├── test/                               # Testes E2E
│   ├── app.e2e-spec.ts
│   └── supplier/
│
├── Dockerfile                          # Build multi-estágio
├── cloudbuild.yaml                    # CI/CD Google Cloud Build
├── gcsfuse_run.sh                     # Script de montagem GCS
├── package.json
├── tsconfig.json
├── nest-cli.json
└── .env                               # Variáveis de ambiente (não versionado)
```

---

## 5. Módulos e Funcionalidades

### Módulos Financeiros Centrais

#### `payables/` — Contas a Pagar
O módulo mais complexo do sistema. Gerencia todo o ciclo de vida de pagamentos com fluxo de aprovação multinível.

**Subserviços:**
- `PayablesService` — CRUD e lógica de negócio principal
- `ApprovalService` — Fluxo de aprovação (reside aqui, não em módulo separado)
- `ExportCnabPayableService` — Geração de arquivo CNAB 240 para remessa ao banco
- `PayablePdfService` — Geração de PDF de comprovante

**Status do Payable:**
```
PENDING → APPROVING → APPROVED → PAID → CONCLUDED
                   ↘ REJECTED
         (também pode ser: DUE)
```

---

#### `receivables/` — Contas a Receber

**Subserviços:**
- `ReceivablesService` — CRUD e lógica principal
- `ReceivablePdfService` — Geração de PDF

**Status:**
```
PENDING → APPROVED → RECEIVED → CONCLUDED
(também pode ser: DUE)
```

---

#### `contracts/` — Contratos
Gerencia contratos de fornecedores, financiadores e colaboradores.

**Cron Job (3h da manhã):** Finaliza automaticamente contratos vencidos e inicia novos períodos.

**Status:**
```
PENDING → SIGNED → ONGOING → FINISHED
```

---

#### `installments/` — Parcelas
Rastreia o parcelamento de pagamentos. Vinculado a contratos e payables/receivables.

**Status:**
```
PENDING → PAID
(também pode ser: CANCELLED, OVERDUE)
```

---

#### `bank-reconciliation/` — Conciliação Bancária
Faz a correspondência entre transações bancárias (vindas do Bradesco) e os registros internos. Emite eventos para atualizar status de payables e receivables.

---

#### `accounts/` — Contas Bancárias
Gerencia contas bancárias da organização. Inclui um serviço que executa **a cada hora** para buscar arquivos de retorno CNAB e atualizar saldos.

---

### Módulos de Orçamento

#### `budget-plans/` — Planos Orçamentários
Sistema mestre de planejamento orçamentário com capacidade de compartilhamento externo (via Basic Auth).

#### `budgets/` — Orçamentos
Execução e rastreamento de orçamentos vinculados aos planos.

#### `cost-centers/` — Centros de Custo
Alocação de custos por unidade organizacional.

#### `programs/` — Programas
Dados mestres de programas para alocação orçamentária.

---

### Módulos de Gestão de Parceiros

#### `collaborators/` — Colaboradores
Gerencia funcionários e prestadores de serviço. Possui:
- Importação via CSV (com detecção automática de delimitador)
- Histórico de alterações próprio (`collaborator-history.entity.ts`) com snapshots antes/depois em JSON (`historico_antes` / `historico_depois`)
- Rastreamento de alterações por campo

**Atenção:** `collaborators.remuneration` é armazenado como `DECIMAL` (exceção à regra de centavos).

#### `suppliers/` — Fornecedores
Cadastro de fornecedores com validação de CPF/CNPJ.

#### `financiers/` — Financiadores
Cadastro de financiadores.

#### `partner-municipalities/` e `partner-states/` — Dados Geográficos
Municípios e estados para uso em orçamentos.

---

### Módulos Administrativos

#### `users/` — Usuários
Gerenciamento de contas de usuário, permissões e recuperação de senha.

#### `auth/` — Autenticação
JWT (principal) e Basic Auth (para rotas de compartilhamento). A estratégia JWT extrai apenas `{ id }` do token e busca o usuário completo no banco a cada requisição.

#### `history/` — Histórico de Contratos
Audit trail específico para contratos (diferente do histórico de colaboradores, que é interno ao módulo `collaborators/`).

#### `files/` — Gerenciamento de Arquivos
Upload e download de documentos. Em produção, usa Google Cloud Storage montado via `gcsfuse`.

#### `reports/` — Relatórios
Geração de relatórios financeiros em PDF/Excel/CSV:
- Posição (payables e receivables)
- Fluxo de caixa
- Análise
- Realizado vs planejado

#### `statistics/` — Estatísticas
KPIs para o dashboard principal.

#### `import-excel/` — Importação Excel
Importação de planilhas nos formatos EPV e PARC.

#### `categorization/` — Categorização
Categorização de transações para conciliação bancária.

---

### Módulos de Infraestrutura

#### `seed/` — Seed
Cria o fornecedor padrão Bradesco (CNPJ `60746948000112`) na inicialização se não existir.

#### `token/` — Tokens Bradesco
Gerencia e renova automaticamente tokens OAuth para a API Bradesco.

#### `apiBradesco/` — API Bradesco
Cliente HTTP para consulta de saldos e extratos via Open Banking Bradesco.

#### `financialManager/` — Gestor Financeiro
Executa **todo dia às 1h da manhã** para marcar parcelas, payables e receivables vencidos.

#### `creditCard/` (CardModule) — Cartão de Crédito
Gerenciamento de transações de cartão de crédito corporativo.

---

## 6. Banco de Dados

### ORM e Driver

- **TypeORM** 0.3.17 com driver **mysql2**
- Configuração separada para runtime (`configuration.ts`) e CLI (`ormconfig.ts`)
- Pool de conexões: limite de 20 conexões simultâneas
- Logging habilitado por padrão (desabilitar com `DB_LOGGING=false`)
- SSL habilitado apenas em produção

### Padrão de Entidades

Todas as entidades estendem `AbstractEntity<T>` que fornece:
- `id` (auto-incremento)
- `createdAt` (timestamp de criação)
- `updatedAt` (timestamp de atualização)

### Padrão de Repositórios

`BaseRepository<T>` estende `Repository<T>` do TypeORM. Cada módulo tem seu próprio repositório com queries customizadas.

### Valores Monetários

**Regra:** Todos os valores monetários são armazenados como **BIGINT em centavos**.

Exemplo: R$ 1.234,56 → `123456` no banco.

**Exceção:** `collaborators.remuneration` usa `DECIMAL` (não alterar sem migration).

### Migrations

**Localização:** `src/database/migrations/`

**Migrations existentes (em ordem):**

| Arquivo | Descrição |
|---------|-----------|
| `1747420877429-InitialMigration.ts` | Schema inicial completo |
| `1748272455045-ChangeColumnDateOfBirth.ts` | Correção de tipo de coluna data |
| `1748272455046-AddFoodCategoryDescription.ts` | Descrição de categorias |
| `1748272455047-FixTotalInCentsColumn.ts` | Correção de colunas decimais |
| `1748272455047-UpdateFoodCategoryEnum.ts` | Atualização de enum de categorias |
| `1756321700000-FixValueInCentsColumnToBigint.ts` | Migração para BIGINT |
| `1761228599194-AddCollaboratorId.ts` | Vinculação de colaborador |
| `1764088249000-CreateCollaboratorHistory.ts` | Tabela de histórico de colaboradores |
| `1764675411277-AddIsIndefiniteToContractPeriod.ts` | Flag de contrato indefinido |
| `1764700700000-AddCompetenceDateToPayables.ts` | Data de competência em payables |
| `1769000000000-AddHistoricoBeforeAfterToCollaboratorHistory.ts` | Campos antes/depois no histórico |

**Workflow de migrations:**
```bash
# 1. Altere o arquivo de entidade
# 2. Gere a migration
yarn mg:generate

# 3. Revise o arquivo gerado em src/database/migrations/
# 4. Execute
yarn mg:run

# Para reverter a última migration
yarn mg:revert
```

**Atenção:** Migrations rodam automaticamente na inicialização (`migrationsRun: true`).

### Diagrama de Relacionamentos Principais

```
BudgetPlan ──────────┬── Budget ──── BudgetResult
                     │
CostCenter ──────────┘

Contract ─────────┬── Installment ──┬── Payable ──── Approval
                  │                 └── Receivable
                  ├── Supplier
                  ├── Financier
                  └── Collaborator

Account ──────────── BankReconciliation ──── Payable/Receivable

User ──────────────── Contract
```

---

## 7. Autenticação e Autorização

### Estratégias de Autenticação

#### JWT (Principal)
- Todos os endpoints principais usam Bearer Token
- Payload do token contém apenas `{ id: number }`
- O usuário completo é buscado no banco a cada requisição
- Expiração configurável via `JWT_SECONDS_EXPIRE` (padrão: ~8h)
- Guard: `JwtAuthGuard`

#### Basic Auth para Compartilhamento
- `ShareBasicStrategy` — Endpoints de orçamento compartilhado
- `OptionsBasicStrategy` — Endpoints de opções/configurações
- `JwtOrBasicAuthGuard` — Tenta JWT primeiro, cai para OptionsBasic

### Guards Disponíveis

Todos os guards são fornecidos globalmente via `GuardsModule`:

| Guard | Estratégia | Uso |
|-------|-----------|-----|
| `JwtAuthGuard` | JWT | Endpoints principais |
| `ShareBasicAuthGuard` | Basic Auth | Rotas de compartilhamento |
| `OptionsBasicAuthGuard` | Basic Auth | Rotas de opções |
| `JwtOrBasicAuthGuard` | JWT ou Basic | Endpoints duais |

### Decorators de Autenticação

```typescript
@GetUser()        // Extrai o usuário autenticado da requisição
@GetBudgetPlanId() // Extrai o ID do plano orçamentário
```

### Recuperação de Senha
- Entidade `ForgotPassword` para rastreamento
- Envio de e-mail via Nodemailer (SMTP Gmail)
- Token temporário por e-mail

---

## 8. Integrações Externas

### 8.1 API Open Banking Bradesco

**Módulo:** `src/modules/apiBradesco/`  
**Gerenciamento de token:** `src/modules/token/`

A integração com o Bradesco usa duas camadas de segurança simultâneas: **mTLS** (mutual TLS com certificado de cliente) para a camada de transporte, e **OAuth 2.0 Bearer Token** para autenticação na camada de aplicação.

---

#### Arquitetura dos Serviços

```
ApiBradescoModule
├── ApiBradescoService   — Orquestra as chamadas (saldo, extrato)
├── HeaderService        — Gera o header Authorization com Bearer token
└── HttpService          — Executa requisições HTTP com Axios + mTLS

TokenModule (dependência)
├── TokenService         — Obtém, armazena e renova o OAuth token
└── TokenRepository      — Persiste o token no banco (cache em DB)
```

---

#### 8.1.1 Credenciais e Certificados

A integração requer **quatro credenciais** fornecidas pelo Bradesco. Todas ficam no `.env`:

| Variável | Tipo | Descrição |
|----------|------|-----------|
| `BRADESCO_CLIENT_KEY` | UUID string | Client ID do aplicativo cadastrado no portal Bradesco |
| `BRADESCO_CLIENT_SECRET` | UUID string | Client Secret do aplicativo |
| `BRADESCO_PRIVATE_KEY` | PEM base64 | Chave privada RSA do certificado de cliente |
| `BRADESCO_PUBLIC_KEY` | PEM base64 | Certificado X.509 público (par da chave privada) |
| `BRADESCO_CA_BASE64` | PEM base64 | (Opcional) Certificado da CA do Bradesco para validar o servidor |
| `BRADESCO_BASE_URL` | URL | `https://openapi.bradesco.com.br` |

**Formato dos certificados no `.env`:**

Os certificados PEM são armazenados em **base64** puro (sem quebras de linha) para caber em uma única linha da variável de ambiente. Em runtime, o serviço decodifica de base64 para `Buffer` antes de usar:

```typescript
// src/modules/apiBradesco/http.service.ts
const cert = Buffer.from(process.env.BRADESCO_PUBLIC_KEY, 'base64')  // PEM do cert
const key  = Buffer.from(process.env.BRADESCO_PRIVATE_KEY, 'base64') // PEM da chave
const ca   = caBase64 ? Buffer.from(caBase64, 'base64') : undefined   // PEM da CA (opcional)
```

**Como gerar o base64 de um arquivo PEM:**
```bash
# Linux/Mac
base64 -w 0 certificado.pem   # -w 0 evita quebras de linha

# O resultado é colado diretamente no .env:
BRADESCO_PUBLIC_KEY=MIIDxTCCAq2gAwIBAgIQAqx...
```

---

#### 8.1.2 mTLS — Autenticação Mútua por Certificado

O **mTLS (mutual TLS)** exige que tanto o servidor quanto o cliente apresentem certificados durante o handshake TLS. Isso garante que apenas aplicações registradas e com certificado válido consigam se conectar à API do Bradesco.

**Configuração do `https.Agent` no Axios:**

```typescript
// src/modules/apiBradesco/http.service.ts
private createHttpsAgent(): https.Agent {
  const publicKeyBase64 = process.env.BRADESCO_PUBLIC_KEY
  const privateKeyBase64 = process.env.BRADESCO_PRIVATE_KEY
  const caBase64 = process.env.BRADESCO_CA_BASE64

  // Sem certificados configurados: conexão sem mTLS (útil em desenvolvimento)
  if (!publicKeyBase64 || !privateKeyBase64) {
    return new https.Agent({ rejectUnauthorized: false })
  }

  const cert = Buffer.from(publicKeyBase64, 'base64')  // Certificado do cliente
  const key  = Buffer.from(privateKeyBase64, 'base64') // Chave privada do cliente
  const ca   = caBase64 ? Buffer.from(caBase64, 'base64') : undefined

  return new https.Agent({
    cert,                       // Apresentado ao servidor Bradesco
    key,                        // Prova que possuímos o certificado
    ca,                         // Valida o certificado do servidor
    rejectUnauthorized: false,  // Permite auto-assinados (simplificação atual)
  })
}
```

**O que cada campo faz no handshake TLS:**

| Campo | Direção | Propósito |
|-------|---------|-----------|
| `cert` | Cliente → Servidor | Identifica nossa aplicação para o Bradesco |
| `key` | (local) | Prova que possuímos o certificado (assina o handshake) |
| `ca` | Cliente valida Servidor | Verifica autenticidade do servidor Bradesco |

**Em desenvolvimento:** Se `BRADESCO_PUBLIC_KEY` ou `BRADESCO_PRIVATE_KEY` não estiverem configurados, o `https.Agent` é criado sem certificados de cliente (`rejectUnauthorized: false`). Isso permite testar sem os certificados reais, mas a API Bradesco rejeitará as chamadas.

---

#### 8.1.3 OAuth 2.0 — Obtenção do Access Token

Após o handshake mTLS, a autenticação de aplicação usa **OAuth 2.0 Client Credentials**.

**Endpoint:**
```
POST https://openapi.bradesco.com.br/auth/server-mtls/v2/token
Content-Type: application/x-www-form-urlencoded
```

**Body (form-urlencoded):**
```
grant_type=client_credentials
&client_id=f3e0d274-7797-42f9-ac42-716c2da84157
&client_secret=eeb2703c-4ccd-41e9-9ce5-23ee2f6f49e1
```

**Resposta:**
```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

**Implementação (`src/modules/token/token.service.ts`):**

```typescript
private async getTokenFromAPI(): Promise<Token> {
  const data = {
    grant_type: 'client_credentials',
    client_id: process.env.BRADESCO_CLIENT_KEY,
    client_secret: process.env.BRADESCO_CLIENT_SECRET,
  }

  // Serializa como application/x-www-form-urlencoded
  const formBody = Object.entries(data)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&')

  const response = await this.httpService.post('/auth/server-mtls/v2/token', formBody, headers)
  return { token: response.access_token }
}
```

---

#### 8.1.4 Cache e Renovação Automática do Token

O token OAuth é caro de obter (round-trip ao Bradesco). Por isso é armazenado no banco de dados e reutilizado até expirar.

**Estratégia de cache:**

```
Token salvo no banco com campo expirationDate = agora + expires_in - 10 segundos
                                                                    ↑
                                              Buffer de segurança de 10s
```

**Fluxo de `getToken()` a cada chamada à API:**

```
TokenService.getToken()
     │
     ├── Busca token no banco (cache: 3.550.000ms ≈ 59 min)
     │
     ├── Token encontrado?
     │     ├── SIM → expirationDate > agora?
     │     │           ├── SIM → retorna token existente
     │     │           └── NÃO → chama getTokenFromAPI() → salva novo token
     │     │
     │     └── NÃO → chama getTokenFromAPI() → salva novo token
     │
     └── Erros lançam exceções tipadas:
           FetchingTokendError, TokenNotFoundError, FetchingTokendAPIError
```

**Ao criar novo token, o cache anterior é limpo:**
```typescript
await this.dataSource.queryResultCache.remove(['tokenCache'])
```

---

#### 8.1.5 Headers das Requisições à API

Após obter o token, o `HeaderService` monta o header de autorização:

```typescript
// src/modules/apiBradesco/header.service.ts
generateBearerHeader(bearerToken: string) {
  return {
    Authorization: `Bearer ${bearerToken}`
  }
}
```

**Header completo enviado ao Bradesco:**
```http
GET /v1/fornecimento-extratos-contas/extratos/saldos?agencia=0000&conta=00000000 HTTP/1.1
Host: openapi.bradesco.com.br
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Sobre HMAC-SHA256:** O `HeaderService` possui um método `generateXBradSignature()` implementado que gera assinaturas para o header `X-Brad-Signature`. A assinatura concatena com `\n` o método HTTP, endpoint, parâmetros, bearer token, nonce e timestamp no formato `yyyy-MM-dd'T'HH:mm:00-00:00`, assina com SHA256. Este mecanismo está **implementado mas não está ativo** nas chamadas atuais — as requisições usam apenas Bearer token.

---

#### 8.1.6 Endpoints Utilizados

**Base URL:** `https://openapi.bradesco.com.br`  
**Base Path:** `/v1/fornecimento-extratos-contas/extratos`

**1. Consulta de Saldo**

```
GET /v1/fornecimento-extratos-contas/extratos/saldos
Query params:
  agencia: string   — Número da agência
  conta:   string   — Número da conta
```

Resposta: objeto com saldo livre da conta (produto código `984`).  
Serviço: `ApiBradescoService.getBalance(params: BalanceParamsDTO)`

**2. Consulta de Extrato**

```
GET /v1/fornecimento-extratos-contas/extratos
Query params:
  agencia:    string   — Número da agência
  conta:      string   — Número da conta
  dataInicio: string   — Data início (formato: YYYY-MM-DD)
  dataFim:    string   — Data fim (formato: YYYY-MM-DD)
  tipo:       string   — Tipo do extrato
```

Resposta: lista de transações com detalhes.  
Serviço: `ApiBradescoService.getStatement(params: StatementParamsDTO)`

---

#### 8.1.7 Tratamento de Erros da API Bradesco

| Erro | Origem | Exceção lançada |
|------|--------|-----------------|
| Falha ao buscar token no banco | `TokenService` | `FetchingTokendError` |
| Token não encontrado após fetch | `TokenService` | `TokenNotFoundError` |
| API Bradesco retornou erro | `TokenService` | `FetchingTokendAPIError` |
| Falha ao salvar token | `TokenService` | `CreatingTokenError` |
| Qualquer erro nas chamadas de extrato/saldo | `HttpService` | `BadGatewayException` com mensagem original |

O `HttpService` loga `error.response.data.message` antes de relançar, o que facilita diagnóstico no Cloud Logging.

---

### 8.2 CNAB 240 (Arquivo de Remessa/Retorno Bancário)

**Gateway:** `src/common/gateways/cnab/`

O CNAB 240 é o padrão bancário brasileiro para troca eletrônica de dados entre empresa e banco. Cada arquivo tem exatamente 240 caracteres por linha, posicionais (sem separador).

**Tipos de arquivo:**

| Tipo | Direção | Propósito |
|------|---------|-----------|
| Remessa (Pagamento) | Empresa → Banco | Instruções de pagamento em lote |
| Retorno (Conciliação) | Banco → Empresa | Confirmações, liquidações, extratos |

**Layout Bradesco implementado:**

```
src/common/gateways/cnab/layout/Bradesco/
├── Pagamento/             # Arquivo de remessa (saída)
│   ├── ArquivoHeader.ts   # Header do arquivo (registro tipo 0)
│   ├── LoteHeader.ts      # Header do lote (registro tipo 1)
│   ├── SegmentoA.ts       # Dados do beneficiário (DOC/TED/PIX)
│   ├── SegmentoB.ts       # Dados complementares do sacado
│   ├── SegmentoJ.ts       # Liquidação de boletos
│   └── LoteTrailing.ts    # Rodapé do lote (registro tipo 5)
├── Conciliacao/           # Arquivo de retorno (entrada)
│   ├── LoteHeader.ts
│   ├── Conciliacao.ts     # Segmento E de conciliação
│   └── LoteTrailing.ts
└── ArquivoTrailing.ts     # Rodapé do arquivo (registro tipo 9)
```

**Validação:** Schemas Zod em cada arquivo de layout validam os campos antes da geração.

**Tipos de pagamento suportados:** TED, DOC, PIX, Boleto

**Identificação de Payable no arquivo de retorno:**

O campo `complemento` do segmento de conciliação carrega o identificador no formato:
```
{accountId}-{payableId}
```
Isso permite que o sistema saiba qual payable atualizar ao processar o retorno.

**Mapeamento de status do retorno CNAB:**

| Código CNAB | Status no Sistema |
|-------------|-------------------|
| `D` | PAID (Debitado) |
| `C` | REJECTED (Crédito devolvido) |
| `E` | REJECTED (Erro) |
| `R` | REJECTED (Retornado) |

---

### 8.3 SFTP — VAN Bradesco (Transferência de Arquivos CNAB)

**Gateway:** `src/common/gateways/transfer-file-sftp/`  
**Biblioteca:** `ssh2` v1.16.0 com Observable RxJS para controle assíncrono

O SFTP não conecta diretamente ao servidor do Bradesco. O sistema conecta via SSH a um **servidor Windows intermediário** (VAN — Value Added Network) que roda o software `STCPCLT` da Bradesco. Esse software é responsável por retransmitir os arquivos ao banco.

**Variáveis de ambiente necessárias:**

| Variável | Descrição |
|----------|-----------|
| `SSH_HOST` | IP/hostname do servidor Windows da VAN |
| `SSH_PORT` | Porta SSH (padrão: 22) |
| `SSH_USERNAME` | Usuário SSH |
| `SSH_PASSWORD` | Senha SSH |

**Fluxo de Envio (Remessa — Empresa → Banco):**

```
1. Sistema gera arquivo CNAB 240 de remessa em memória
2. Conexão SSH ao servidor Windows (VAN)
3. Arquivo gravado em:
   C:\STCPCLT_BRADESCO\O0055BRADESCO\SAIDA\{fileName}
4. Executado o comando do STCPCLT em modo envio:
   C:\STCPCLT_BRADESCO\program\stcpclt.exe "C:\STCPCLT_BRADESCO\CTCP.INI"
     -p O0055BRADESCO   (perfil de conexão Bradesco)
     -r 5               (até 5 tentativas)
     -t 30              (timeout 30s)
     -m S               (modo Send)
     -w 0               (sem espera entre tentativas)
5. STCPCLT transmite o arquivo ao banco via rede proprietária
6. Conexão SSH encerrada
```

**Fluxo de Recebimento (Retorno — Banco → Empresa), executado toda hora:**

```
1. Conexão SSH ao servidor Windows (VAN)
2. Executado o STCPCLT em modo recebimento:
   stcpclt.exe [...] -m R (modo Receive)
3. Banco deposita arquivos em:
   C:\STCPCLT_BRADESCO\O0055BRADESCO\ENTRADA\
4. Sistema lê o arquivo mais recente do diretório
   (ordenado por data de modificação)
5. Conteúdo retornado como string para processamento
6. RetornoGateway parseia o CNAB 240
7. Saldos de conta atualizados no banco de dados
8. Status dos payables atualizados (APPROVED → PAID conforme retorno)
```

**Tratamento de erros SFTP:** Conexões SSH com falha são logadas e propagadas via Observable RxJS. A conexão é sempre encerrada no `finally`, mesmo em caso de erro.

---

### 8.4 E-mail (SMTP Gmail)

**Biblioteca:** Nodemailer 6.9.5

**Usos:**
- Notificação de aprovação de payables (envia código identificador para aprovadores)
- Recuperação de senha
- Notificações gerais do sistema

**Configuração:** SMTP Gmail com App Password

---

### 8.5 Google Cloud Storage

Em produção, o diretório `uploads/` é mapeado para um bucket GCS montado via `gcsfuse`. Para o código, é transparente — opera como filesystem local.

---

## 9. Fluxos de Negócio

### 9.1 Fluxo de Aprovação de Payable

```
┌─────────────────────────────────────────────────────────┐
│                   CRIAÇÃO DO PAYABLE                     │
│                   Status: APPROVING                      │
└───────────────────────────┬─────────────────────────────┘
                            │
                  Registros de Aprovação
                  criados no banco
                            │
                  E-mails enviados
                  para cada aprovador
                  (com código identificador único)
                            │
              ┌─────────────▼──────────────┐
              │    APROVADOR ACESSA        │
              │    /aprovar/acesso/[id]    │
              │    Autentica com código    │
              └─────────────┬──────────────┘
                            │
               ┌────────────┴────────────┐
               ▼                         ▼
          APROVADO                  REJEITADO
          (por todos)               Status: REJECTED
               │
               ▼
         Status: APPROVED
               │
         Pagamento realizado
         (CNAB / manual)
               │
               ▼
         Status: PAID
               │
         Conciliação bancária
         confirma pagamento
               │
               ▼
         Status: CONCLUDED
```

**Arquivos relevantes:**
- [src/modules/payables/payables.service.ts](src/modules/payables/payables.service.ts)
- [src/modules/payables/services/approval.service.ts](src/modules/payables/services/approval.service.ts)
- [src/modules/payables/repositories/approval-repository.ts](src/modules/payables/repositories/approval-repository.ts)

---

### 9.2 Fluxo do Ciclo de Vida de Contratos

```
PENDING
  │
  │  Documento assinado enviado
  ▼
SIGNED
  │
  │  Data de início atingida
  │  (verificado pelo cron das 3h)
  ▼
ONGOING
  │
  │  Data de término atingida
  │  (verificado pelo cron das 3h)
  ▼
FINISHED
```

---

### 9.3 Fluxo de Conciliação Bancária

```
1. Cron busca extrato do Bradesco (a cada hora)
2. Transações são comparadas com registros internos
3. Correspondência encontrada:
   ├── Emite evento CheckToFinishPayable
   │   PayablesService: atualiza status para CONCLUDED
   └── Emite evento CheckToFinishReceivable
       ReceivablesService: atualiza status para CONCLUDED
4. Correspondência desfeita:
   ├── Emite evento RestorePayableStatus
   └── Emite evento RestoreReceivableStatus
```

---

### 9.4 Fluxo de Importação CNAB

```
1. Cron (toda hora) conecta via SFTP ao Bradesco
2. Busca arquivos de retorno (Retorno/Conciliação)
3. RetornoGateway parseia o arquivo CNAB 240
4. Dados extraídos atualizam saldos de contas
5. Transações são disponibilizadas para conciliação manual/automática
```

---

### 9.5 Fluxo de Orçamento

```
BudgetPlan (plano mestre)
    │
    ├── duplicado → evento budget.duplicated
    │                    ↓
    │              BudgetResult duplicado
    │
    └── Budget (orçamento de centro de custo)
            │
            ├── valor alterado → evento budgets.process-value
            │                          ↓
            │                    BudgetsService atualiza totais
            │
            └── evento budgetPlans.process-value
                          ↓
                    BudgetPlansService atualiza totais do plano
```

---

## 10. Padrões e Convenções

### Validação de Entrada (DTOs)

```typescript
// Todos os DTOs usam class-validator + class-transformer
export class CreatePayableDto {
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @Min(1)
  valueInCents: number; // Sempre em centavos!
}
```

**Erros de validação retornam HTTP 422** (não 400), com a primeira mensagem de erro.

### Gestão de Transações de Banco

```typescript
// Use o TransactionInterceptor para operações críticas
@UseInterceptors(TransactionInterceptor)
async criticalOperation() {
  // Auto-commit em sucesso, rollback em erro
}
```

### Valores Monetários

```typescript
// Sempre armazene em centavos
const valueInCents = Math.round(valueInReais * 100); // R$ 1.234,56 → 123456

// Utilitários disponíveis em src/common/utils/
import { parseMonetaryToNumber } from 'src/common/utils/parse-monetary-to-number';
```

### Decorators Customizados

| Decorator | Arquivo | Propósito |
|-----------|---------|-----------|
| `@GetUser()` | `common/decorators/` | Extrai usuário autenticado |
| `@GetBudgetPlanId()` | `common/decorators/` | Extrai ID do plano orçamentário |
| `@IsValidCPFOrCNPJ()` | `common/decorators/` | Valida CPF ou CNPJ |
| `@BancaryOrPixDataExists()` | `common/decorators/` | Valida dados bancários/PIX |
| `@IsStartDateGreather()` | `common/decorators/` | Compara datas |

### Dependências Circulares

Use `forwardRef()` quando dois módulos dependem um do outro:

```typescript
// Exemplo: BudgetsModule ↔ BudgetPlansModule
@Module({
  imports: [forwardRef(() => BudgetPlansModule)],
})
export class BudgetsModule {}
```

### Formatação de Datas

Prefira `date-fns` para consistência. `dayjs` e `moment` existem por legado.

---

## 11. Tarefas Agendadas

| Horário | Módulo | Localização | Descrição |
|---------|--------|-------------|-----------|
| Toda hora | `ExtractBalanceCnabService` | `accounts/extract-balance-cnab.service.ts` | Busca arquivos CNAB de retorno via SFTP, atualiza saldos |
| Todo dia às 1h | `FinancialManagerService` | `financialManager/services/financialManager.service.ts` | Marca como vencidos: parcelas, payables e receivables |
| Todo dia às 3h | `ContractsService` | `contracts/services/contracts.service.ts` | Finaliza contratos vencidos, inicia novos períodos |

---

## 12. Arquitetura Orientada a Eventos

O sistema usa `@nestjs/event-emitter` para comunicação assíncrona entre módulos sem acoplamento direto.

| Evento | Emitido por | Tratado por | Propósito |
|--------|-------------|-------------|-----------|
| `budget.duplicated` | `BudgetsService` | `BudgetResultsService` | Duplica resultados de orçamento em cascata |
| `budgets.process-value` | `BudgetResultsService` | `BudgetsService` | Atualiza totais do orçamento |
| `budgetPlans.process-value` | `BudgetsService` | `BudgetPlansService` | Atualiza totais do plano |
| `budgetPlan.duplicated` | `BudgetPlansService` | `CostCentersService` | Atualiza centros de custo |
| `budgetPlan.duplicated-budgets` | `CostCentersService` | `BudgetsService` | Duplica orçamentos em cascata |
| `CheckToFinishPayable` | `BankReconciliationService` | `PayablesService` | Verifica conclusão de payable |
| `CheckToFinishReceivable` | `BankReconciliationService` | `ReceivablesService` | Verifica conclusão de receivable |
| `RestorePayableStatus` | `BankReconciliationService` | `PayablesService` | Restaura status de payable |
| `RestoreReceivableStatus` | `BankReconciliationService` | `ReceivablesService` | Restaura status de receivable |

---

## 13. Setup do Ambiente de Desenvolvimento

### Pré-requisitos

- **Node.js** 20.x (recomendado via nvm)
- **Yarn** (gerenciador de pacotes)
- **MySQL** 8.x rodando localmente ou em container Docker
- **Git**

### Passo a Passo

#### 1. Clone o repositório

```bash
git clone <url-do-repositorio>
cd erp-financeiro-backend
```

#### 2. Instale as dependências

```bash
yarn install
```

#### 3. Configure as variáveis de ambiente

```bash
cp .env.example .env
# Edite o .env com suas configurações locais
```

#### 5. Execute as migrations

```bash
yarn mg:run
```

As migrations criam todo o schema e a migration inicial tem os dados base.

#### 6. Inicie o servidor em modo desenvolvimento

```bash
yarn start:dev
```

O servidor estará disponível em: `http://localhost:3003`

A documentação Swagger estará em: `http://localhost:3003/api/swagger`

### Scripts Disponíveis

```bash
# Desenvolvimento
yarn start:dev        # Modo watch com hot-reload
yarn start:debug      # Debug com hot-reload

# Produção
yarn build            # Compila TypeScript → dist/
yarn start:prod       # Executa dist/main.js

# Database
yarn mg:generate      # Gera nova migration baseado nas entidades
yarn mg:run           # Executa migrations pendentes
yarn mg:revert        # Reverte a última migration
yarn typeorm [cmd]    # Acesso direto ao CLI do TypeORM

# Testes
yarn test             # Executa todos os testes
yarn test:watch       # Modo watch
yarn test:cov         # Cobertura de testes
yarn test:e2e         # Testes E2E

# Qualidade de código
yarn format           # Formata com Prettier
yarn lint             # ESLint (regras desabilitadas no momento)
```

---

## 14. Build e Deploy

### Docker

O Dockerfile usa um **build multi-estágio** para otimizar o tamanho da imagem final:

```
Stage 1 (first-stage):    node:20-alpine + git
  └── Instala dependências via yarn --frozen-lockfile

Stage 2 (second-stage):   node:20-alpine
  └── Copia deps do stage 1
  └── Copia código fonte
  └── Compila TypeScript (yarn build)
  └── Remove devDependencies

Stage 3 (builder):        golang:1.26-alpine
  └── Compila gcsfuse (para montar GCS como filesystem)

Stage 4 (final-stage):    node:20-alpine
  └── Instala fuse + tini
  └── Copia binário gcsfuse do stage 3
  └── Copia dist/ e node_modules do stage 2
  └── ENTRYPOINT: tini (gerenciador de processos)
  └── CMD: ./gcsfuse_run.sh
```

**Build local:**
```bash
docker build -t erp-financeiro-backend .
docker run -p 3003:3003 --env-file .env erp-financeiro-backend
```

### Google Cloud Build (CI/CD)

Arquivo: `cloudbuild.yaml`

**Pipeline:**

```
1. Build da imagem Docker
   → Artifact Registry: <REGION>-docker.pkg.dev/{PROJECT_ID}/<REPOSITORY>/<IMAGE_NAME>:latest
   → Tag com COMMIT_SHA para versionamento

2. Push das imagens (latest + commit SHA)

3. Deploy no Cloud Run
   → Região: configurável (ex: us-central1, southamerica-east1)
   → Serviço: erp-financeiro-backend
   → Plataforma: managed
```

**Configurações:**
- Timeout: 900s (15 min)
- Machine type: E2_HIGHCPU_8
- Logging: Cloud Logging

### Inicialização em Produção

O script `gcsfuse_run.sh`:
1. Monta o bucket GCS no diretório `$MNT_DIR` (para uploads)
2. Executa `node ./dist/main`

### Comportamentos na Inicialização

1. Migrations executam automaticamente
2. `SeedingService.seed()` cria o fornecedor Bradesco se não existir
3. Diretórios de upload são criados automaticamente

---

## 15. Testes

### Estrutura

```
test/
├── app.e2e-spec.ts              # Integração geral
└── supplier/
    └── supplier.e2e-spec.ts     # Testes E2E de fornecedores
```

**Configuração Jest:** `test/jest-e2e.json` para E2E.

**Atenção:** `yarn test:e2e` executa apenas os testes em `test/supplier/`.

### Executando Testes

```bash
# Todos os testes unitários
yarn test

# Arquivo específico
yarn test -- src/modules/payables/payables.service.spec.ts

# Com cobertura
yarn test:cov

# E2E (requer banco de dados configurado)
yarn test:e2e
```

---

## 16. Variáveis de Ambiente

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `PORT` | Não | Porta do servidor (padrão: 3003) |
| `NODE_ENV` | Sim | `development`, `production`, `test` |
| `FRONT_APP_URL` | Sim | URL do frontend (CORS) |
| `HOST_APP_URL` | Sim | URL do próprio backend |
| `DB_HOST` | Sim | Host do MySQL |
| `DB_HOST_LOCAL` | Não | Host local do MySQL (fallback) |
| `DB_PORT` | Sim | Porta do MySQL (3306) |
| `DB_USERNAME` | Sim | Usuário do MySQL |
| `DB_PASSWORD` | Sim | Senha do MySQL |
| `DB_NAME` | Sim | Nome do banco de dados |
| `DB_SYNC` | Não | Sincronização automática (false em prod) |
| `DB_LOGGING` | Não | Log de queries SQL (true) |
| `JWT_SECRET` | Sim | Chave secreta para JWT |
| `JWT_SECONDS_EXPIRE` | Sim | Expiração do JWT em segundos |
| `MAIL_HOST` | Sim | Host SMTP |
| `MAIL_PORT` | Sim | Porta SMTP |
| `MAIL_SERVICE` | Não | Serviço de e-mail |
| `MAIL_USER` | Sim | Usuário do e-mail |
| `MAIL_PASS` | Sim | Senha/App password do e-mail |
| `MAIL_REPLY` | Não | E-mail de resposta |
| `LOGO_TEMPLATE_EMAIL` | Não | URL do logo para templates de e-mail |
| `BRADESCO_CLIENT_KEY` | Prod | Client ID do app cadastrado no portal Bradesco (UUID) |
| `BRADESCO_CLIENT_SECRET` | Prod | Client Secret do app Bradesco (UUID) |
| `BRADESCO_PRIVATE_KEY` | Prod | Chave privada RSA do certificado de cliente (PEM em base64) |
| `BRADESCO_PUBLIC_KEY` | Prod | Certificado X.509 público do cliente (PEM em base64) |
| `BRADESCO_CA_BASE64` | Não | Certificado da CA Bradesco para validar o servidor (PEM em base64) |
| `BRADESCO_BASE_URL` | Prod | URL base da API Bradesco (`https://openapi.bradesco.com.br`) |
| `SSH_HOST` | Prod | IP/hostname do servidor Windows da VAN Bradesco (SFTP) |
| `SSH_PORT` | Prod | Porta SSH do servidor VAN (padrão: 22) |
| `SSH_USERNAME` | Prod | Usuário SSH do servidor VAN |
| `SSH_PASSWORD` | Prod | Senha SSH do servidor VAN |

---

## 17. Armadilhas Comuns e Gotchas

### `ParseNumericIdPipe .ts` — Espaço no Nome do Arquivo

O arquivo `src/common/pipes/ParseNumericIdPipe .ts` tem um espaço no nome. **Não renomear** sem atualizar a importação em `app.module.ts`.

### Valores Monetários

Sempre armazene em centavos como BIGINT. A exceção `collaborators.remuneration` usa DECIMAL — não altere sem criar uma migration.

### Dependências Circulares

Use `forwardRef()`. Exemplo real: `BudgetsModule` ↔ `BudgetPlansModule`.

### TypeScript Relaxado

O projeto tem `strictNullChecks: false` e `noImplicitAny: false`. Atribuições de null/undefined não são verificadas pelo compilador.

### Três Bibliotecas de Data

`date-fns`, `dayjs` e `moment` coexistem. Use `date-fns` para novos códigos.

### Arquivos em Produção

Em produção, uploads vão para o GCS via `gcsfuse`. Em desenvolvimento, ficam em `uploads/` local.

### Banco de Dados com Logging

Logging de SQL está habilitado por padrão. Para desabilitar: `DB_LOGGING=false`.

### Migrations Automáticas

Migrations executam na inicialização. Em produção, isso significa que qualquer migration pendente é aplicada automaticamente no deploy.

### Swagger

A documentação não está em `/api` mas em `/api/swagger`.

### E-mail de Aprovação

O fluxo de aprovação de payables envia e-mails com código identificador. Em desenvolvimento, configure um e-mail real ou use um mock SMTP como [Mailtrap](https://mailtrap.io).

---

*Documentação gerada em Abril/2026. Para dúvidas sobre funcionalidades específicas, consulte os arquivos de código correspondentes ou a equipe responsável pelo sistema.*
