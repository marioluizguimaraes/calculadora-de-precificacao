# Arquitetura

Organização **por feature** (domínio), não por tipo de arquivo. Cada feature concentra tudo o que
precisa e expõe uma API pública via `index.ts`.

```
src/
├── app/                 # Composição da aplicação (nada de regra de negócio)
│   ├── providers/       # QueryClient + provedor de toasts
│   ├── router/          # Rotas (páginas lazy) e erro de rota
│   ├── layout/          # AppShell (cabeçalho, navegação, atalho Ctrl/⌘+K)
│   ├── command/         # Paleta de comandos (shadcn Command)
│   └── styles/          # global.css: Tailwind + HeroUI + ponte de tokens do shadcn
│
├── pages/               # Telas de rota: montam features, sem lógica própria
│   ├── home/
│   ├── quote-wizard/    # Fluxo em cenas + steps.ts (ordem e textos de cada etapa)
│   ├── quote-summary/   # Resultado: breakdown de custos e preço final
│   ├── quotes-history/  # Orçamentos salvos
│   ├── settings/        # Perfil do negócio (custos fixos, regime tributário)
│   └── not-found/
│
├── features/
│   ├── business-profile/  # Custos fixos mensais, pró-labore, dias úteis, regime tributário
│   ├── location/          # Abrangência: regional | estadual | cidade (+ api/ do IBGE)
│   ├── services/          # Catálogo de serviços e sub-serviços por etapa
│   ├── work-stages/       # Tempo (horas/diárias) por etapa: pré, produção, pós
│   ├── equipment/         # Equipamentos próprios (depreciação) e locados (diária)
│   ├── team/              # Profissionais, função, cachê/diária
│   ├── costs/             # Custos variáveis: deslocamento, alimentação, hospedagem, seguro
│   ├── pricing/           # DOMÍNIO: tipos, motor, stores e componentes de preço
│   │   ├── engine/        # Funções PURAS de cálculo (sem React) — núcleo testado
│   │   ├── store/         # Perfil do estúdio + rascunho do orçamento (Zustand persist)
│   │   └── components/    # Monitor ao vivo, timeline, composição, etapa de margem
│   ├── quote/             # Resumo, orçamentos salvos na conta e proposta
│   │   └── export/        # PDF (@react-pdf/renderer, carregado sob demanda)
│   ├── auth/              # Conta: login, cadastro em etapas, sessão, perfil público
│   └── marketplace/       # Ofertas públicas de serviço, busca e chat por oferta
│
├── shared/              # Código reutilizável e agnóstico de domínio
│   ├── components/      # ui/ (shadcn), react-bits/ (animações), layout/, form/ (campos + RHF)
│   ├── hooks/
│   ├── lib/             # utils.ts (cn), formatadores de moeda/tempo, helpers
│   ├── api/             # Cliente HTTP base
│   ├── config/          # Leitura e validação (Zod) do import.meta.env
│   ├── constants/
│   └── types/
│
├── assets/              # images/, icons/, fonts/
└── test/                # setup.ts, mocks/, fixtures/, utils/ (render com providers)
```

## Contrato interno de uma feature

```
features/<nome>/
├── components/   # Componentes da feature
├── hooks/        # Hooks da feature (ex.: useLocationOptions)
├── schemas/      # Schemas Zod — fonte da verdade dos tipos de formulário
├── types/        # Tipos de domínio (z.infer<> quando possível)
├── constants/    # Valores padrão, catálogos
├── utils/        # Funções auxiliares puras
└── index.ts      # API pública (a criar)
```

## Regras

1. **Dependências em uma direção**: `app → pages → features → shared`. `shared` nunca importa de `features`.
   Entre features, `pricing` é a base (domínio); as demais podem importar dela, nunca o contrário.
2. **Motor de cálculo puro**: `features/pricing/engine` recebe dados e devolve números; não conhece
   React, store nem formulários. Isso permite testar cada fórmula isoladamente (cobertura ≥ 90%).
3. **Valores monetários em centavos (inteiros)** para evitar erro de ponto flutuante; formatar só na borda (UI).
4. **Validação na entrada**: todo formulário passa por um schema Zod; `import.meta.env` também é validado.
5. **Testes ao lado do código**: `arquivo.test.ts` na mesma pasta do arquivo testado.

## Dados da API e mocks

Contas, orçamentos salvos, ofertas e chat passam por `shared/api/client.ts`:

```ts
apiRequest({ method: 'POST', path: '/ofertas', body: input }, () => mock.publish(input));
```

Cada chamada descreve o endpoint REST **e** o handler do mock. Sem `VITE_API_URL`, responde o
mock (`features/<nome>/mocks/handlers.ts`), que parte dos JSON da mesma pasta e grava as
alterações no localStorage. Com `VITE_API_URL` definido, a mesma chamada vira um `fetch` com
`Authorization: Bearer <token>` — componentes e hooks não mudam.

| Feature       | Endpoints                                                                                                                                                                                                             | Sementes                                                       |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `auth`        | `POST /auth/login`, `POST /auth/cadastro`, `GET /auth/email-disponivel`, `PATCH /me`                                                                                                                                  | `users.json` (conta demo: `demo@claquete.app` / `claquete123`) |
| `quote`       | `GET /me/orcamentos`, `GET/PUT/DELETE /me/orcamentos/:id`                                                                                                                                                             | `quotes.json`                                                  |
| `marketplace` | `GET/POST /ofertas`, `GET/PATCH/DELETE /ofertas/:id`, `GET /me/ofertas`, `GET /ofertas/:id/conversas`, `POST /ofertas/:id/mensagens`, `GET /me/conversas`, `GET /conversas/:id/mensagens`, `POST /conversas/:id/lida` | `listings.json`, `conversations.json`, `messages.json`         |

Regras de acesso que a API real precisa manter (os testes dos handlers documentam cada uma):
sem login nada é salvo; cada conta só lê os próprios orçamentos; uma conversa pertence a uma
oferta e a um interessado, e só os dois participantes a leem.
