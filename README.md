# ERP Backend

Backend do sistema ERP financeiro, construido com [NestJS](https://nestjs.com/) e [TypeORM](https://typeorm.io/).

## Funcionalidades

- Gestao de contas a pagar (payables) com fluxo de aprovacao
- Integracao bancaria com Bradesco (CNAB 240, API e VAN/SFTP)
- Gestao de contratos, fornecedores e centros de custo
- Planos orcamentarios e acompanhamento financeiro
- Importacao de dados via Excel
- Envio de emails transacionais (aprovacao, rejeicao, convites)
- Autenticacao JWT com gestao de perfis de acesso
- Geracao de relatorios e exportacao de dados

## Pre-requisitos

- [Node.js](https://nodejs.org/) v20+
- [Yarn](https://yarnpkg.com/)
- [MySQL](https://www.mysql.com/) 8.0+

## Instalacao

1. Clone o repositorio:

```bash
git clone https://github.com/desenvolvedorabc/ERP-BACKEND.git
cd ERP-BACKEND
```

2. Instale as dependencias:

```bash
yarn install
```

3. Configure as variaveis de ambiente:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com as configuracoes do seu ambiente. Veja a secao [Variaveis de Ambiente](#variaveis-de-ambiente) para detalhes.

4. Crie o banco de dados MySQL:

```sql
CREATE DATABASE erp_financeiro;
```

5. Execute as migrations:

```bash
yarn mg:run
```

> Se preferir sincronizacao automatica durante o desenvolvimento, defina `DB_SYNC=true` no `.env`. **Nao use em producao.**

## Executando

```bash
# Desenvolvimento (com hot-reload)
yarn start:dev

# Producao
yarn build
yarn start:prod
```

O servidor inicia na porta definida em `PORT` (padrao: 3003).

## Scripts disponiveis

| Comando | Descricao |
|---------|-----------|
| `yarn start:dev` | Inicia em modo desenvolvimento com hot-reload |
| `yarn build` | Compila o projeto |
| `yarn start:prod` | Inicia em modo producao |
| `yarn mg:generate` | Gera uma nova migration baseada nas alteracoes das entities |
| `yarn mg:run` | Executa as migrations pendentes |
| `yarn mg:revert` | Reverte a ultima migration |
| `yarn test` | Executa testes unitarios |
| `yarn test:e2e` | Executa testes end-to-end |
| `yarn lint` | Executa o linter |

## Variaveis de Ambiente

Consulte o arquivo [.env.example](.env.example) para a lista completa. As principais categorias sao:

| Categoria | Variaveis | Descricao |
|-----------|-----------|-----------|
| **Servidor** | `PORT`, `NODE_ENV` | Porta e ambiente de execucao |
| **Banco de dados** | `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME` | Conexao MySQL |
| **Autenticacao** | `JWT_SECRET`, `JWT_SECONDS_EXPIRE` | Configuracao JWT |
| **Email** | `MAIL_HOST`, `MAIL_PORT`, `MAIL_USER`, `MAIL_PASS` | Servidor SMTP |
| **URLs** | `FRONT_APP_URL`, `HOST_APP_URL`, `LOGO_URL` | URLs da aplicacao |
| **Bradesco** | `BRADESCO_*` | Integracao bancaria (opcional) |
| **SSH/SFTP** | `SSH_HOST`, `SSH_PORT`, `SSH_USERNAME`, `SSH_PASSWORD` | Transferencia de arquivos VAN (opcional) |

## Docker

```bash
docker build -t erp-backend .
docker run -p 3003:3003 --env-file .env erp-backend
```

## Estrutura do Projeto

```
src/
  app.module.ts          # Modulo raiz
  main.ts                # Entry point
  config/                # Configuracoes (TypeORM, etc.)
  database/              # Migrations e configuracao do banco
  common/                # Decorators, enums, gateways, utils
  mails/                 # Templates e envio de emails
  modules/
    auth/                # Autenticacao e autorizacao (JWT)
    users/               # Gestao de usuarios
    payables/            # Contas a pagar
    contracts/           # Contratos
    suppliers/           # Fornecedores
    cost-centers/        # Centros de custo
    budget-plans/        # Planos orcamentarios
    import-excel/        # Importacao de dados
    apiBradesco/         # Integracao API Bradesco
    token/               # Gestao de tokens Bradesco
    seed/                # Dados iniciais
```

## Licenca

Este projeto e open source.
