# Anima Online - Bootstrap Next.js + Supabase

Template base com **Next.js (App Router)**, **Supabase Auth SSR** e UI moderna no padrão **v0** usando **shadcn/ui + Tailwind + Radix UI + lucide-react**.

## Requisitos locais

- Node.js **20 LTS** (recomendado para Vercel)
- npm 10+

## Setup local

```bash
npm install
npm run dev
```

App disponível em `http://localhost:3000`.

## Variáveis de ambiente

Crie um `.env.local` com:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

> Essas variáveis também devem existir no projeto da Vercel (Preview e Production).

## Rotas principais

- `/` landing com CTA para Entrar e Dashboard
- `/login` login com email/senha
- `/dashboard` área protegida por middleware

Fluxo esperado:

- Usuário autenticado acessando `/login` → redireciona para `/dashboard`
- Usuário não autenticado acessando `/dashboard` → redireciona para `/login`

## Deploy na Vercel

- **Preview Deployments:** todo PR gera um ambiente preview.
- **Production:** merge em `main` promove deploy de produção.

## Supabase Redirect URLs (importante)

No painel do Supabase (Authentication → URL Configuration), configure:

- URL local: `http://localhost:3000`
- URL de produção: domínio final (ex: `https://animaonline.com`)
- URL(s) de preview da Vercel, quando necessário (ou wildcard suportado pela sua estratégia)

Sem isso, fluxos de autenticação e callbacks podem falhar em preview/prod.

## Checks de qualidade

```bash
npm run lint
npm run build
```

Ambos devem passar antes de abrir/atualizar PR.
