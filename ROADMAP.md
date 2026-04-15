# EduPlatform — Roadmap de Desenvolvimento

## Visão Geral

Plataforma de aprendizado onde professores fazem upload de videoaulas e alunos assistem, comentam e interagem. Arquitetura unificada Next.js com custo zero de infraestrutura.

---

## Stack Técnica

| Camada | Tecnologia | Justificativa |
|---|---|---|
| Framework | Next.js 14+ (App Router) | Full-stack unificado, SSR, API Routes |
| Linguagem | TypeScript | Tipagem, segurança, DX |
| Estilização | Tailwind CSS + shadcn/ui | Componentes prontos, customizáveis |
| Ícones | Lucide React | Leve, consistente com shadcn |
| Banco de dados | SQLite via Prisma ORM | Zero custo, sem servidor, arquivo local |
| Autenticação | NextAuth.js (Credentials) | Sem dependência externa, email/senha |
| Upload de vídeo | Filesystem local + API Routes | Sem cloud, streaming nativo |
| Validação | Zod | Schema validation para forms e API |
| Estado | React Server Components + hooks | Sem Redux, sem complexidade extra |

---

## Modelagem do Banco de Dados (Prisma + SQLite)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}

model User {
  id            String    @id @default(cuid())
  name          String
  email         String    @unique
  passwordHash  String
  role          String    @default("STUDENT") // "STUDENT" | "TEACHER"
  avatarUrl     String?
  bio           String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relations
  lessons       Lesson[]   // Aulas criadas (professor)
  comments      Comment[]  // Comentários feitos
  enrollments   Enrollment[]
}

model Lesson {
  id            String    @id @default(cuid())
  title         String
  description   String
  videoUrl      String    // path relativo no filesystem
  thumbnailUrl  String?
  duration      Int?      // duração em segundos
  isPublished   Boolean   @default(false)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relations
  teacherId     String
  teacher       User      @relation(fields: [teacherId], references: [id])
  comments      Comment[]
  courseId       String?
  course        Course?   @relation(fields: [courseId], references: [id])
}

model Comment {
  id            String    @id @default(cuid())
  content       String
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relations
  userId        String
  user          User      @relation(fields: [userId], references: [id])
  lessonId      String
  lesson        Lesson    @relation(fields: [lessonId], references: [id])
  parentId      String?
  parent        Comment?  @relation("CommentReplies", fields: [parentId], references: [id])
  replies       Comment[] @relation("CommentReplies")
}

model Course {
  id            String    @id @default(cuid())
  title         String
  description   String
  coverUrl      String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relations
  lessons       Lesson[]
  enrollments   Enrollment[]
}

model Enrollment {
  id            String    @id @default(cuid())
  enrolledAt    DateTime  @default(now())

  userId        String
  user          User      @relation(fields: [userId], references: [id])
  courseId       String
  course        Course    @relation(fields: [courseId], references: [id])

  @@unique([userId, courseId])
}
```

> **Comportamentos sugeridos (BDD extras):** O modelo acima já contempla: agrupamento de aulas em cursos, matrícula de alunos em cursos, respostas aninhadas nos comentários (thread), e perfil editável com avatar e bio.

---

## Estrutura de Pastas

```
eduplatform/
├── prisma/
│   └── schema.prisma
├── public/
│   └── uploads/
│       ├── videos/          # Videoaulas armazenadas aqui
│       └── thumbnails/      # Thumbnails das aulas
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── register/
│   │   │       └── page.tsx
│   │   ├── (platform)/
│   │   │   ├── layout.tsx         # Layout com sidebar/navbar
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx       # Dashboard do aluno ou professor
│   │   │   ├── courses/
│   │   │   │   ├── page.tsx       # Catálogo de cursos
│   │   │   │   └── [courseId]/
│   │   │   │       └── page.tsx   # Detalhes do curso
│   │   │   ├── lessons/
│   │   │   │   ├── [lessonId]/
│   │   │   │   │   └── page.tsx   # Player da aula + comentários
│   │   │   │   └── new/
│   │   │   │       └── page.tsx   # Upload de nova aula (professor)
│   │   │   └── profile/
│   │   │       └── page.tsx       # Edição de perfil
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   └── [...nextauth]/
│   │   │   │       └── route.ts
│   │   │   ├── lessons/
│   │   │   │   ├── route.ts       # GET (listar), POST (criar)
│   │   │   │   └── [lessonId]/
│   │   │   │       └── route.ts   # GET, PUT, DELETE
│   │   │   ├── comments/
│   │   │   │   └── route.ts       # POST, GET
│   │   │   ├── courses/
│   │   │   │   └── route.ts
│   │   │   ├── enrollments/
│   │   │   │   └── route.ts
│   │   │   └── upload/
│   │   │       └── route.ts       # Upload de vídeo (multipart)
│   │   ├── layout.tsx
│   │   └── page.tsx               # Landing page
│   ├── components/
│   │   ├── ui/                    # shadcn components
│   │   ├── video-player.tsx
│   │   ├── comment-section.tsx
│   │   ├── comment-item.tsx
│   │   ├── lesson-card.tsx
│   │   ├── course-card.tsx
│   │   ├── upload-form.tsx
│   │   ├── navbar.tsx
│   │   ├── sidebar.tsx
│   │   └── user-avatar.tsx
│   ├── lib/
│   │   ├── prisma.ts              # Singleton do Prisma Client
│   │   ├── auth.ts                # Config NextAuth
│   │   ├── validations.ts         # Schemas Zod
│   │   └── utils.ts               # Helpers (formatDate, etc.)
│   └── types/
│       └── index.ts               # Types globais
├── .env
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Cenários BDD (Comportamentos do Sistema)

### Feature: Cadastro de Usuário

```gherkin
Feature: Cadastro de Usuário

  Scenario: Novo aluno se cadastra com sucesso
    Given que estou na página de cadastro
    When preencho nome, email e senha
    And seleciono o papel "Aluno"
    And clico em "Criar conta"
    Then sou redirecionado ao dashboard do aluno
    And vejo a mensagem "Bem-vindo à plataforma!"

  Scenario: Novo professor se cadastra com sucesso
    Given que estou na página de cadastro
    When preencho nome, email e senha
    And seleciono o papel "Professor"
    And clico em "Criar conta"
    Then sou redirecionado ao dashboard do professor
    And vejo o botão "Criar nova aula"

  Scenario: Cadastro com email duplicado
    Given que já existe um usuário com email "joao@email.com"
    When tento me cadastrar com o mesmo email
    Then vejo a mensagem de erro "Este email já está cadastrado"
```

### Feature: Login

```gherkin
Feature: Login

  Scenario: Login com credenciais válidas
    Given que tenho uma conta cadastrada
    When acesso a página de login
    And insiro email e senha corretos
    Then sou redirecionado ao meu dashboard

  Scenario: Login com senha incorreta
    Given que tenho uma conta cadastrada
    When insiro email correto e senha errada
    Then vejo "Email ou senha incorretos"

  Scenario: Redirecionamento por papel
    Given que estou logado como professor
    Then vejo o dashboard com "Minhas Aulas" e "Criar Aula"
    Given que estou logado como aluno
    Then vejo o dashboard com "Cursos Disponíveis" e "Minhas Matrículas"
```

### Feature: Upload de Aula (Professor)

```gherkin
Feature: Upload de Aula

  Scenario: Professor faz upload de videoaula
    Given que estou logado como professor
    When acesso "Criar nova aula"
    And preencho título e descrição
    And seleciono um arquivo de vídeo (mp4, até 500MB)
    And clico em "Publicar"
    Then a aula aparece na lista "Minhas Aulas"
    And os alunos matriculados podem acessá-la

  Scenario: Upload com arquivo inválido
    Given que estou logado como professor
    When tento enviar um arquivo .exe
    Then vejo "Formato não suportado. Use MP4, WebM ou MOV"

  Scenario: Upload com progresso
    Given que estou enviando um vídeo de 200MB
    Then vejo uma barra de progresso com porcentagem
    And posso cancelar o upload

  Scenario: Professor edita aula existente
    Given que tenho uma aula publicada
    When clico em "Editar"
    Then posso alterar título, descrição e substituir o vídeo

  Scenario: Professor exclui aula
    Given que tenho uma aula publicada
    When clico em "Excluir" e confirmo
    Then a aula é removida da plataforma
    And o arquivo de vídeo é deletado do servidor
```

### Feature: Assistir Aula (Aluno)

```gherkin
Feature: Assistir Aula

  Scenario: Aluno acessa aula disponível
    Given que estou logado como aluno
    And estou matriculado no curso "JavaScript Básico"
    When clico na aula "Variáveis e Tipos"
    Then o player de vídeo carrega e reproduz a aula
    And vejo o título, descrição e nome do professor

  Scenario: Aluno navega catálogo de cursos
    Given que estou logado como aluno
    When acesso "Cursos Disponíveis"
    Then vejo a lista de cursos com título, descrição e professor
    And posso me matricular clicando em "Matricular-se"

  Scenario: Aluno acessa aula sem matrícula
    Given que não estou matriculado no curso
    When tento acessar uma aula
    Then vejo "Matricule-se no curso para acessar esta aula"
    And vejo o botão "Matricular-se"
```

### Feature: Comentários e Respostas

```gherkin
Feature: Comentários

  Scenario: Aluno comenta em uma aula
    Given que estou assistindo a aula "Variáveis e Tipos"
    When escrevo um comentário e clico em "Enviar"
    Then meu comentário aparece na seção de comentários
    And mostra meu nome, avatar e horário

  Scenario: Professor responde comentário
    Given que estou logado como professor
    And um aluno comentou na minha aula
    When clico em "Responder" no comentário do aluno
    And escrevo uma resposta
    Then a resposta aparece aninhada abaixo do comentário original
    And o badge "Professor" é exibido ao lado do meu nome

  Scenario: Comentário vazio não é permitido
    Given que estou na seção de comentários
    When clico em "Enviar" sem escrever nada
    Then o botão permanece desabilitado

  Scenario: Aluno exclui próprio comentário
    Given que fiz um comentário
    When clico no ícone de lixeira do meu comentário
    And confirmo a exclusão
    Then o comentário é removido
```

### Feature: Perfil do Usuário (BDD sugerido)

```gherkin
Feature: Perfil do Usuário

  Scenario: Usuário edita seu perfil
    Given que estou logado
    When acesso "Meu Perfil"
    And altero meu nome e bio
    And faço upload de uma foto de avatar
    And clico em "Salvar"
    Then as alterações são refletidas em toda a plataforma

  Scenario: Professor visualiza estatísticas
    Given que estou logado como professor
    When acesso meu dashboard
    Then vejo o total de alunos matriculados
    And o total de aulas publicadas
    And o total de comentários recebidos
```

### Feature: Matrícula em Curso (BDD sugerido)

```gherkin
Feature: Matrícula

  Scenario: Aluno se matricula em um curso
    Given que estou na página do curso "React Avançado"
    When clico em "Matricular-se"
    Then o curso aparece em "Minhas Matrículas"
    And ganho acesso a todas as aulas do curso

  Scenario: Aluno cancela matrícula
    Given que estou matriculado no curso "React Avançado"
    When clico em "Cancelar matrícula" e confirmo
    Then perco acesso às aulas do curso
    And o curso sai de "Minhas Matrículas"
```

---

## Fases de Desenvolvimento

### FASE 1 — Setup e Infraestrutura
**Estimativa: ~1h**

```
Tarefas:
1. Inicializar projeto Next.js com TypeScript e Tailwind
   $ npx create-next-app@latest eduplatform --typescript --tailwind --app --src-dir
2. Instalar dependências
   $ npm install prisma @prisma/client next-auth bcryptjs zod
   $ npm install -D @types/bcryptjs
3. Configurar Prisma com SQLite
   $ npx prisma init --datasource-provider sqlite
4. Criar schema.prisma (copiar modelo acima)
   $ npx prisma db push
5. Criar singleton do Prisma Client (src/lib/prisma.ts)
6. Instalar e configurar shadcn/ui
   $ npx shadcn@latest init
   $ npx shadcn@latest add button card input label textarea select avatar badge dialog dropdown-menu separator tabs toast
7. Criar pasta public/uploads/videos e public/uploads/thumbnails
8. Configurar .env com NEXTAUTH_SECRET e NEXTAUTH_URL
9. Configurar next.config.js para aceitar uploads grandes
```

### FASE 2 — Autenticação
**Estimativa: ~2h**

```
Tarefas:
1. Configurar NextAuth com CredentialsProvider (src/lib/auth.ts)
   - Hash de senha com bcryptjs
   - Sessão com JWT (strategy: "jwt")
   - Incluir role e id no token/session
2. Criar API route [...nextauth] (src/app/api/auth/[...nextauth]/route.ts)
3. Criar API route de registro (src/app/api/auth/register/route.ts)
   - Validação com Zod (nome, email, senha, role)
   - Hash da senha antes de salvar
   - Retornar erro se email duplicado
4. Criar página de Login (src/app/(auth)/login/page.tsx)
   - Form com email e senha
   - Botão "Entrar" e link "Criar conta"
   - Feedback de erro inline
5. Criar página de Registro (src/app/(auth)/register/page.tsx)
   - Form com nome, email, senha, confirmação de senha
   - Select para papel (Aluno / Professor)
   - Redirect automático ao dashboard após cadastro
6. Criar middleware de proteção de rotas (src/middleware.ts)
   - Rotas /dashboard, /lessons, /courses exigem login
   - Rota /lessons/new exige role TEACHER
```

### FASE 3 — Layout da Plataforma
**Estimativa: ~2h**

```
Tarefas:
1. Criar layout do grupo (platform) com sidebar e navbar
   - Navbar: logo, busca, avatar com dropdown (perfil, sair)
   - Sidebar: navegação contextual por role
     - Aluno: Dashboard, Cursos, Minhas Matrículas
     - Professor: Dashboard, Minhas Aulas, Criar Aula, Cursos
   - Responsivo: sidebar colapsa em mobile (hamburger menu)
2. Criar componente Navbar (src/components/navbar.tsx)
3. Criar componente Sidebar (src/components/sidebar.tsx)
4. Criar componente UserAvatar (src/components/user-avatar.tsx)
5. Criar landing page (src/app/page.tsx)
   - Hero section com CTA "Comece agora"
   - Seções: como funciona, para professores, para alunos
```

### FASE 4 — CRUD de Cursos
**Estimativa: ~2h**

```
Tarefas:
1. API Routes para cursos (src/app/api/courses/route.ts)
   - GET: listar cursos (com filtro e paginação básica)
   - POST: criar curso (somente TEACHER)
2. API Route para curso individual (src/app/api/courses/[courseId]/route.ts)
   - GET: detalhes do curso com aulas
   - PUT: editar curso (somente dono)
   - DELETE: excluir curso (somente dono)
3. Página catálogo de cursos (src/app/(platform)/courses/page.tsx)
   - Grid de CourseCards
   - Cada card: título, descrição, professor, nº de aulas
4. Página detalhes do curso (src/app/(platform)/courses/[courseId]/page.tsx)
   - Info do curso, lista de aulas, botão de matrícula
5. Componente CourseCard (src/components/course-card.tsx)
6. Dialog/página para criar curso (professor)
```

### FASE 5 — Upload e Gerenciamento de Aulas
**Estimativa: ~3h**

```
Tarefas:
1. API Route de upload de vídeo (src/app/api/upload/route.ts)
   - Receber multipart/form-data
   - Validar tipo (mp4, webm, mov) e tamanho (max 500MB)
   - Salvar em public/uploads/videos/ com nome único (uuid)
   - Retornar URL relativa do arquivo
   - Configurar next.config.js: experimental.serverActions.bodySizeLimit
2. API Routes para aulas (src/app/api/lessons/route.ts)
   - POST: criar aula vinculada a curso (somente TEACHER)
   - GET: listar aulas (filtrar por courseId, teacherId)
3. API Route individual (src/app/api/lessons/[lessonId]/route.ts)
   - GET: detalhes da aula
   - PUT: editar aula (somente dono)
   - DELETE: excluir aula + deletar arquivo de vídeo
4. Página de criação de aula (src/app/(platform)/lessons/new/page.tsx)
   - Form: título, descrição, select de curso, upload de vídeo
   - Barra de progresso de upload (XMLHttpRequest ou fetch com ReadableStream)
   - Preview do vídeo antes de publicar
5. Componente UploadForm (src/components/upload-form.tsx)
   - Drag-and-drop zone
   - Validação client-side de tipo e tamanho
   - Progress bar
6. Componente LessonCard (src/components/lesson-card.tsx)
```

### FASE 6 — Player de Vídeo e Página da Aula
**Estimativa: ~2h**

```
Tarefas:
1. Página da aula (src/app/(platform)/lessons/[lessonId]/page.tsx)
   - Player de vídeo HTML5 nativo com controles
   - Título, descrição, info do professor
   - Seção de comentários abaixo
   - Navegação: aula anterior / próxima (dentro do curso)
2. Componente VideoPlayer (src/components/video-player.tsx)
   - Tag <video> com controles nativos do browser
   - Poster/thumbnail se disponível
   - Responsivo (aspect-ratio 16:9)
3. API Route para streaming de vídeo (src/app/api/stream/[filename]/route.ts)
   - Suporte a Range Requests (HTTP 206) para seek no vídeo
   - Headers corretos: Content-Type, Content-Range, Accept-Ranges
```

### FASE 7 — Sistema de Comentários
**Estimativa: ~2h**

```
Tarefas:
1. API Routes para comentários (src/app/api/comments/route.ts)
   - POST: criar comentário (lessonId, content, parentId opcional)
   - GET: listar comentários de uma aula (com replies aninhadas)
   - DELETE: excluir comentário (somente autor)
2. Componente CommentSection (src/components/comment-section.tsx)
   - Textarea + botão enviar
   - Lista de comentários com carregamento
   - Contagem de comentários
3. Componente CommentItem (src/components/comment-item.tsx)
   - Avatar, nome, role badge (se professor), data relativa
   - Botão "Responder" que abre textarea inline
   - Replies aninhadas (1 nível de profundidade visual)
   - Botão excluir (se autor)
4. Validação: comentário não pode ser vazio, max 2000 caracteres
```

### FASE 8 — Matrículas
**Estimativa: ~1h**

```
Tarefas:
1. API Routes para matrículas (src/app/api/enrollments/route.ts)
   - POST: matricular aluno em curso
   - DELETE: cancelar matrícula
   - GET: listar matrículas do aluno
2. Botão de matrícula na página do curso
   - Estado: "Matricular-se" / "Matriculado ✓" / "Cancelar matrícula"
3. Middleware de acesso: verificar matrícula antes de exibir aula
4. Página "Minhas Matrículas" no dashboard do aluno
```

### FASE 9 — Dashboard e Perfil
**Estimativa: ~2h**

```
Tarefas:
1. Dashboard do Aluno
   - Cursos matriculados (grid de cards)
   - Aulas recentes
   - Atalho "Explorar cursos"
2. Dashboard do Professor
   - Estatísticas: total de cursos, aulas, alunos, comentários
   - Lista de aulas recentes com status
   - Botão "Criar nova aula" em destaque
3. Página de perfil (src/app/(platform)/profile/page.tsx)
   - Editar nome, bio, avatar
   - Upload de avatar (salvar em public/uploads/avatars/)
   - Alterar senha
4. API Route de perfil (src/app/api/profile/route.ts)
   - PUT: atualizar dados do perfil
```

### FASE 10 — Polimento e UX
**Estimativa: ~2h**

```
Tarefas:
1. Loading states com Skeleton components (shadcn)
2. Toast notifications para ações (criar, editar, excluir, matricular)
3. Empty states com ilustrações (quando não há cursos, aulas, etc.)
4. Confirmação antes de ações destrutivas (dialog de confirmação)
5. Responsividade completa (mobile-first)
6. SEO básico: metadata nas páginas, Open Graph tags
7. Tratamento de erros global (error.tsx, not-found.tsx)
8. Favicon e branding básico
```

---

## Comandos de Referência Rápida

```bash
# Iniciar projeto
npx create-next-app@latest eduplatform --typescript --tailwind --app --src-dir

# Dependências de produção
npm install prisma @prisma/client next-auth bcryptjs zod lucide-react

# Dependências de desenvolvimento
npm install -D @types/bcryptjs

# Prisma
npx prisma init --datasource-provider sqlite
npx prisma db push          # Aplicar schema
npx prisma studio           # GUI para ver o banco
npx prisma generate          # Gerar client após mudanças

# shadcn/ui
npx shadcn@latest init
npx shadcn@latest add button card input label textarea select avatar badge dialog dropdown-menu separator tabs toast progress skeleton

# Rodar em desenvolvimento
npm run dev

# Build de produção
npm run build && npm start
```

---

## Variáveis de Ambiente (.env)

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="gerar-com-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"
MAX_FILE_SIZE=524288000  # 500MB em bytes
UPLOAD_DIR="./public/uploads"
```

---

## Regras para o Claude Code

Ao implementar este projeto, siga estas diretrizes:

1. **Sempre use Server Components por padrão.** Só marque `"use client"` quando precisar de interatividade (forms, estados, event handlers).
2. **API Routes usam Route Handlers** do App Router (`route.ts` com funções `GET`, `POST`, `PUT`, `DELETE`).
3. **Valide tudo com Zod** — tanto no client quanto no server.
4. **Use o Prisma Client singleton** (não instancie novo PrismaClient em cada request).
5. **Proteja rotas por role** — middleware para autenticação geral, verificação de role nas API routes.
6. **Streaming de vídeo** — implemente Range Requests (HTTP 206) para que o seek funcione.
7. **Nomeie uploads com UUID** — evite colisões e caracteres especiais.
8. **Comentários aninhados** — use relação self-referencing (parentId) com no máximo 1 nível visual de aninhamento.
9. **Feedback visual sempre** — loading spinners, toasts, skeleton screens, empty states.
10. **Mobile-first** — todo layout deve funcionar bem em telas pequenas.
11. **Não use serviços externos** — tudo roda local (SQLite, filesystem, NextAuth credentials).
12. **Tipagem estrita** — sem `any`, defina interfaces para todos os dados.
