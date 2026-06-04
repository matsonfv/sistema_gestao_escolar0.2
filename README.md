<div align="center">

<img src="frontend/img/logo.png" alt="Logo Sistema de Gestão Escolar" width="120"/>

# 🎓 Sistema de Gestão Escolar

**Plataforma web completa para gerenciamento de alunos, professores e turmas escolares**

[![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-v5.1-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![SQLite](https://img.shields.io/badge/SQLite-v5.1-003B57?style=for-the-badge&logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![HTML5](https://img.shields.io/badge/HTML5-Frontend-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/pt-BR/docs/Web/HTML)
[![License](https://img.shields.io/badge/License-ISC-blue?style=for-the-badge)](LICENSE)

</div>

---

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades](#-funcionalidades)
- [Tecnologias](#-tecnologias)
- [Arquitetura](#-arquitetura)
- [Banco de Dados](#-banco-de-dados)
- [API Reference](#-api-reference)
- [Como Executar](#-como-executar)
- [Estrutura de Pastas](#-estrutura-de-pastas)
- [Screenshots](#-screenshots)
- [Melhorias Futuras](#-melhorias-futuras)

---

## 💡 Sobre o Projeto

O **Sistema de Gestão Escolar** é uma aplicação web fullstack desenvolvida para simplificar a administração de instituições de ensino. Com uma interface limpa voltada ao diretor escolar, o sistema centraliza o cadastro e gerenciamento de **professores**, **alunos** e **turmas**, com autenticação segura e geração de relatórios em PDF.

O projeto segue o padrão **REST API**, com um backend em **Node.js/Express** servindo dados a um frontend em **HTML/CSS/JavaScript puro** — sem dependências de frameworks no lado do cliente, priorizando leveza e acessibilidade.

---

## ✅ Funcionalidades

### 🔐 Autenticação
- Registro de novos usuários (administradores)
- Login com email e senha
- Senhas armazenadas com hash **bcrypt** (salt rounds: 10)
- Sessão gerenciada via **JWT** com expiração de 8 horas
- Proteção de rotas: todas as rotas de dados exigem token válido
- Logout com limpeza de sessão no `localStorage`

### 👨‍🏫 Gestão de Professores
- Cadastro completo: dados pessoais, documentos (CPF, RG), endereço, contato e informações profissionais
- Listagem com busca em tempo real (debounce de 300ms)
- Edição e exclusão com modal de confirmação
- Controle de status: **Ativo**, **Licença** ou **Desligado**
- Validação de CPF e e-mail institucional únicos

### 🎓 Gestão de Alunos
- Cadastro completo com dados pessoais, documentos, endereço, dados do responsável e informações escolares
- Visualização por **turma** (grid de cards) ou listagem geral
- Filtro de alunos por turma específica
- Busca por nome em tempo real
- Status: **Ativo**, **Inativo**, **Transferido** ou **Concluído**
- Vínculo com turma via chave estrangeira (FK com integridade referencial)

### 🏫 Gestão de Turmas
- Criação de turmas com nome, série (1º ao 9º Ano / 1º ao 3º Médio), professor responsável e ano letivo
- Grid visual de turmas com contador de alunos por turma
- Restrição de exclusão: turmas com alunos vinculados não podem ser removidas
- Criação de turma inline durante o cadastro de alunos

### 📄 Geração de Relatório PDF
- Exportação de relatório por turma com: dados da turma, nome do professor e lista completa de alunos
- Gerado server-side com **PDFKit** e entregue via download direto no navegador

---

## 🛠 Tecnologias

### Backend
| Tecnologia | Versão | Uso |
|---|---|---|
| Node.js | 18+ | Runtime JavaScript |
| Express | ^5.1.0 | Framework HTTP/REST |
| SQLite3 | ^5.1.7 | Banco de dados relacional |
| bcrypt | ^5.1.1 | Hash seguro de senhas |
| jsonwebtoken | ^9.0.2 | Autenticação via JWT |
| pdfkit | ^0.17.1 | Geração de relatórios PDF |
| cors | ^2.8.5 | Controle de origens (CORS) |

### Frontend
| Tecnologia | Uso |
|---|---|
| HTML5 | Estrutura e formulários |
| CSS3 | Estilização, modais, responsividade |
| JavaScript (ES6+) | Lógica, consumo de API, manipulação de DOM |
| Font Awesome 6 | Ícones |
| Fetch API | Comunicação assíncrona com o backend |

---

## 🏗 Arquitetura

```
┌──────────────────────────────────────────────────────┐
│                     FRONTEND                         │
│         HTML + CSS + JavaScript (Vanilla)            │
│                                                      │
│   login.html ──► index.html (Dashboard)             │
│   criar_conta.html                                   │
│                                                      │
│   Fetch API + JWT no Header de Autorização          │
└────────────────────┬─────────────────────────────────┘
                     │  HTTP REST (localhost:3000)
┌────────────────────▼─────────────────────────────────┐
│                     BACKEND                          │
│              Node.js + Express v5                    │
│                                                      │
│   Middleware de Auth (JWT Guard)                     │
│   Rotas: /api/login, /api/registrar                  │
│   Rotas protegidas: /api/professores                 │
│                      /api/alunos                     │
│                      /api/turmas                     │
│                      /api/turmas/:id/pdf             │
└────────────────────┬─────────────────────────────────┘
                     │  SQLite3 Driver
┌────────────────────▼─────────────────────────────────┐
│                  BANCO DE DADOS                      │
│                  SQLite (escola.db)                  │
│                                                      │
│   usuarios | professores | alunos | turmas           │
│                                                      │
│   Foreign Keys ativadas (PRAGMA foreign_keys = ON)   │
└──────────────────────────────────────────────────────┘
```

---

## 🗄 Banco de Dados

O sistema utiliza **SQLite** com integridade referencial ativada. As tabelas são criadas automaticamente na primeira execução.

```sql
-- Usuários do sistema (diretores/administradores)
usuarios (id, nome, email UNIQUE, senha)

-- Turmas escolares
turmas (id, nome UNIQUE, serie, professor, ano, data_cadastro)

-- Professores
professores (id, nome_completo, data_nascimento, genero, cpf UNIQUE,
             rg, endereco_*, email_institucional UNIQUE, telefone,
             disciplinas, formacao_academica, data_admissao, status, data_cadastro)

-- Alunos (com FK para turmas)
alunos (id, nome_completo, data_nascimento, genero, cpf UNIQUE, rg,
        endereco_*, nome_responsavel, telefone_responsavel,
        email_responsavel, turma_id FK, ano_ingresso, status, data_cadastro)
```

---

## 📡 API Reference

Todas as rotas abaixo (exceto autenticação) exigem o header:
```
Authorization: Bearer <token_jwt>
```

### Autenticação (Públicas)
| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/api/registrar` | Criar novo usuário |
| `POST` | `/api/login` | Login, retorna JWT |

### Professores
| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/professores` | Listar todos |
| `GET` | `/api/professores/:id` | Buscar por ID |
| `GET` | `/api/professores/buscar/:termo` | Buscar por nome |
| `POST` | `/api/professores` | Cadastrar |
| `PUT` | `/api/professores/:id` | Atualizar |
| `DELETE` | `/api/professores/:id` | Excluir |

### Alunos
| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/alunos` | Listar todos (com JOIN de turma) |
| `GET` | `/api/alunos/:id` | Buscar por ID |
| `GET` | `/api/alunos/turma/:turmaId` | Listar por turma |
| `GET` | `/api/alunos/buscar/:termo` | Buscar por nome |
| `POST` | `/api/alunos` | Cadastrar |
| `PUT` | `/api/alunos/:id` | Atualizar |
| `DELETE` | `/api/alunos/:id` | Excluir |

### Turmas
| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/turmas` | Listar todas |
| `GET` | `/api/turmas/:id` | Buscar por ID |
| `POST` | `/api/turmas` | Criar turma |
| `PUT` | `/api/turmas/:id` | Atualizar turma |
| `DELETE` | `/api/turmas/:id` | Excluir (bloqueia se houver alunos) |
| `GET` | `/api/turmas/:id/pdf` | Gerar relatório PDF da turma |

---

## 🚀 Como Executar

### Pré-requisitos
- [Node.js](https://nodejs.org/) v18 ou superior
- npm (incluído com o Node.js)

### Passo a passo

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/sistema-gestao-escolar.git
cd sistema-gestao-escolar

# 2. Acesse a pasta do backend e instale as dependências
cd backend
npm install

# 3. Inicie o servidor
npm start
```

O servidor estará disponível em **http://localhost:3000**

> O banco de dados `escola.db` é criado automaticamente na pasta `backend/` na primeira execução. Nenhuma configuração adicional é necessária.

### Acesso
- **Login:** http://localhost:3000/login.html
- **Dashboard:** http://localhost:3000 (requer autenticação)

> Para o primeiro acesso, crie uma conta em http://localhost:3000/criar_conta.html

---

## 📁 Estrutura de Pastas

```
sistema-gestao-escolar/
│
├── backend/
│   ├── server.js          # Servidor Express: rotas, middleware, banco de dados
│   ├── escola.db          # Banco de dados SQLite (gerado automaticamente)
│   └── package.json       # Dependências e scripts do backend
│
└── frontend/
    ├── index.html         # Dashboard principal (Gestão de Professores e Alunos)
    ├── login.html         # Tela de login
    ├── criar_conta.html   # Tela de cadastro de usuário
    ├── script.js          # Lógica do dashboard (860 linhas): CRUD, modais, busca
    ├── login.js           # Lógica de autenticação (login)
    ├── criar_conta.js     # Lógica de criação de conta
    ├── styles.css         # Estilos do dashboard principal
    ├── style2.css         # Estilos das telas de login e cadastro
    └── img/
        ├── logo.png       # Logo do sistema
        └── ilustracao.png # Ilustração da tela de login
```

---

## 🔮 Melhorias Futuras

- [ ] Recuperação de senha por e-mail
- [ ] Paginação nas listagens
- [ ] Sistema de notas e frequência
- [ ] Dashboard com gráficos e métricas (total de alunos, professores, turmas)
- [ ] Níveis de acesso diferenciados (Diretor, Secretaria, Professor)
- [ ] Exportação de relatório geral em PDF/Excel
- [ ] Testes automatizados (Jest)
- [ ] Deploy em nuvem com Docker
- [ ] Migração do banco para PostgreSQL

## 👥 Suporte

Para dúvidas ou problemas:
1. Verifique a seção "Solução de Problemas"
2. Confirme se todas as dependências estão instaladas
3. Verifique se a porta 3000 está disponível
4. Consulte os logs do servidor no terminal

## 📄 Licença

Este projeto foi desenvolvido para fins educacionais e de demonstração.

---

**Sistema de Gestão Escolar** - Desenvolvido com ❤️ usando tecnologias web modernas.

[![GitHub](https://img.shields.io/badge/GitHub-matsonfv-181717?style=for-the-badge&logo=github)](https://github.com/seu-usuario)

---
