# Calculadora de Precificação — Produção de Vídeo

Sistema para videomakers e produtoras calcularem o preço de um serviço de produção de vídeo
a partir do contexto real do trabalho: **área de atuação** (regional, estadual ou cidade),
**serviços e sub-serviços** por etapa, **equipamentos** (depreciação/locação), **equipe**,
**tempo por etapa**, **custos variáveis**, **impostos** e **margem de lucro**.

## Stack

| Camada           | Ferramenta                                                                          |
| ---------------- | ----------------------------------------------------------------------------------- |
| Build / dev      | Vite 8 + `@vitejs/plugin-react`                                                     |
| UI               | React 19 + TypeScript 6 (strict)                                                    |
| Estilo           | Tailwind CSS 4 (tokens em `src/app/styles`)                                         |
| Roteamento       | React Router                                                                        |
| Estado do wizard | Zustand (com persistência do rascunho)                                              |
| Formulários      | React Hook Form + Zod                                                               |
| Dados remotos    | TanStack Query (API de localidades do IBGE)                                         |
| Testes           | Vitest + Testing Library + jsdom                                                    |
| Qualidade        | ESLint 9 (typescript-eslint strict, a11y), Prettier, Husky, lint-staged, commitlint |

## Primeiros passos

```bash
nvm use            # Node 22 (ver .nvmrc)
npm install
cp .env.example .env.local
npm run dev
```

## O fluxo

1. **Seu estúdio** (só na primeira vez) — custos fixos, pró-labore e jornada → valor da sua hora.
2. **Projeto** — modelos prontos (redes, institucional, evento, casamento, publicidade,
   minidoc) que já marcam serviços, horas e equipe típicas; cliente e entregáveis.
3. **Local** — cidade, região ou estado; distância real da sua base.
4. **Serviços** e **Tempo** — sub-serviços de pré, gravação e pós, com horas por tier.
5. **Kit** — equipamento próprio (depreciação) cadastrado uma vez; aluguéis pela diária.
6. **Equipe**, **Logística** e **Margem** — diárias, deslocamento, alimentação, hospedagem,
   impostos, taxas e lucro.
7. **Resumo** — preço sugerido × mínimo, composição, linha do tempo e a conta passo a passo.
8. **Proposta em PDF** — com a sua marca e, opcionalmente, a memória de cálculo.

O preço é recalculado ao vivo em todas as etapas. Rascunho, estúdio e histórico ficam salvos
no navegador (`localStorage`).

## APIs externas (gratuitas, sem chave)

| API                                                                                 | Uso                                                |
| ----------------------------------------------------------------------------------- | -------------------------------------------------- |
| [IBGE — Localidades](https://servicodados.ibge.gov.br/api/docs/localidades)         | Estados, municípios e regiões intermediárias       |
| [kelvins/municipios-brasileiros](https://github.com/kelvins/municipios-brasileiros) | Coordenadas de cada município (código IBGE)        |
| [OSRM](https://project-osrm.org/) (servidor público)                                | Distância rodoviária real até a cidade do trabalho |

Sem rota disponível, a distância é estimada por linha reta × 1,25. Em atuação regional ou
estadual, usa-se a mediana das distâncias até os municípios da área.

## Scripts

| Script                  | O que faz                                               |
| ----------------------- | ------------------------------------------------------- |
| `npm run dev`           | Servidor de desenvolvimento                             |
| `npm run build`         | Checagem de tipos + build de produção                   |
| `npm run preview`       | Serve o build localmente                                |
| `npm run typecheck`     | Apenas checagem de tipos                                |
| `npm run lint`          | ESLint (falha com qualquer warning)                     |
| `npm run format`        | Formata com Prettier                                    |
| `npm run test`          | Vitest em modo watch                                    |
| `npm run test:coverage` | Testes com cobertura (limite maior no motor de cálculo) |
| `npm run validate`      | Tudo o que a CI roda, exceto o build                    |

## Convenções

- **Commits**: [Conventional Commits](https://www.conventionalcommits.org/pt-br/) (validado pelo commitlint).
- **Imports**: use o alias `@/` (`@/shared/lib/...`). Uma feature só importa outra pela API
  pública (`@/features/<nome>`), regra garantida pelo ESLint.
- **Variáveis de ambiente**: apenas `VITE_*`, tipadas em `src/vite-env.d.ts`. Nunca coloque segredos nelas.

## Documentação

- [Arquitetura e organização de pastas](docs/ARCHITECTURE.md)
- [Modelo de precificação](docs/PRICING-MODEL.md)
- [Bibliotecas de UI (HeroUI, shadcn, React Bits, Tailwind)](docs/UI-LIBRARIES.md)
