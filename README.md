# Pixit Tasks

Este repositório fornece uma API REST completa para gerenciamento de tarefas de usuários, utilizando as tecnologias:

- 🔌 **Fastify**: Framework Node.js para desenvolvimento rápido e eficiente de APIs.
- 📦 **Pnpm**: Gerenciador de pacotes para manter as dependências do projeto organizadas.
- 💾 **Postgres**: Banco de dados relacional para armazenamento de dados.
- 💚 **Prisma**: ORM (Object-Relational Mapping) para facilitar a interação com o banco de dados.
- 🔐 **JWT**: Padrão de autenticação para proteger endpoints da API.
- 💎 **Zod**: ️ Validador de dados para garantir a segurança e confiabilidade da API.
- 📝 **Swagger**: Ferramenta para documentação de APIs.
- ⚓ **Docker**: Ferramenta para conteinerização e virtualização da API.
- ⚡️ **Vitest**: Framework de testes unitários rápido e confiável.
- 🌐 **Supertest**: Ferramenta para testar APIs de forma integrada.

## Documentação da API

### Autenticação

| Rota                 | Autenticação | Descrição        |
| :------------------- | :----------: | :--------------- |
| `POST /api/register` |     `🌎`      | Criar um usuário |
| `POST /api/login`    |     `🌎`      | Fazer login      |

### Tarefas

| Rota                    | Autenticação | Descrição                          |
| :---------------------- | :----------: | :--------------------------------- |
| `GET /api/tasks`        |     `🔐`      | Listar todas as tarefas do usuário |
| `GET /api/tasks/:id`    |     `🔐`      | Buscar uma tarefa                  |
| `POST /api/tasks`       |     `🔐`      | Cria uma tarefa                    |
| `PUT /api/tasks/:id`    |     `🔐`      | Atualizar tarefa                   |
| `DELETE /api/tasks/:id` |     `🔐`      | Deletar tarefa                     |

## Instalação

### Requisitos

- Node.js
- Docker
- Docker Compose
- Pnpm
- Git

### Clone o repositório:

```bash
git clone https://github.com/mnzsss/pixit-tasks.git
```

### Instale as dependências:

```bash
pnpm install
```

### Crie as variáveis de ambiente:

Copie o arquivo `.env.example` para `.env`:

```bash
cp .env.example .env
```

Edite o arquivo `.env` seguindo as instruções do arquivo e configure as variáveis de acordo com seu ambiente.


### Crie o banco de dados e execute as migrações

Rode o Docker Compose:

```bash
docker-compose up
```
Acesse o container do banco de dados:

```bash
docker exec -it pixit-fastify sh
```

Execute o comando para criar o banco de dados e aplicar as migrações:

```bash
pnpm prisma generate
```

## Acesse a API

- A API estará disponível na URL http://0.0.0.0:3000/api.
- Utilize a documentação (Swagger) da API para explorar os endpoints e funcionalidades disponíveis: http://0.0.0.0:3000/api/docs.

## Testes

Para rodar os testes, execute o comando:

```bash
pnpm test
```

Ou, se preferir rode os testes com cobertura e UI:

```bash
pnpm test:ui
```