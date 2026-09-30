# Bibliotecas de UI

| Biblioteca                                  | Papel                                                                                 | Onde fica                           |
| ------------------------------------------- | ------------------------------------------------------------------------------------- | ----------------------------------- |
| [Tailwind CSS v4](https://tailwindcss.com/) | Utilitários e design tokens (`@theme`)                                                | `src/app/styles/global.css`         |
| [HeroUI v3](https://heroui.com/)            | **Biblioteca principal** de componentes e **dona do tema** (cores, radius, dark mode) | pacote `@heroui/react`              |
| [shadcn/ui](https://ui.shadcn.com/)         | Componentes que o HeroUI não tem; o código é copiado para o repositório               | `src/shared/components/ui/`         |
| [React Bits](https://www.reactbits.dev/)    | Componentes animados (texto, fundos, efeitos) via registry do shadcn                  | `src/shared/components/react-bits/` |

## Por que funcionam juntas

- **Mesma base de acessibilidade**: o HeroUI v3 é construído sobre React Aria, e o shadcn está
  configurado com o estilo `aria-nova` (`components.json`), que usa as mesmas primitivas.
- **Um tema só**: o HeroUI define as variáveis CSS; o `global.css` tem uma **ponte** que expõe os
  tokens que o shadcn espera (`primary`, `card`, `popover`, `input`, `ring`, `destructive`,
  `muted-foreground`...) apontando para as variáveis do HeroUI. Mudou o tema do HeroUI, o shadcn acompanha.
- **Dark mode**: `.dark` ou `data-theme="dark"` no `<html>` (padrão de ambas), com fallback para
  `prefers-color-scheme`.
- **`cn`**: pacote oficial `cn` do shadcn (substitui clsx + tailwind-merge), reexportado em
  `@/shared/lib/utils`.

## Qual usar?

1. Existe no **HeroUI**? Use o HeroUI (`import { Button } from '@heroui/react'`).
2. Não existe? Adicione do **shadcn**: `npm run ui:add <componente>`.
3. Efeito visual / animação de destaque (hero, títulos, fundos)? **React Bits**, sempre na variante
   **TS + Tailwind** (`-TS-TW`): `npm run ui:add @react-bits/BlurText-TS-TW`.

Componentes de domínio (formulários de equipamento, resumo do orçamento...) ficam em
`src/features/<feature>/components` e **compõem** esses componentes base, nunca os editam.

## Colisão de tokens HeroUI × shadcn

Dois tokens têm o mesmo nome e significados diferentes:

| Token    | HeroUI                      | shadcn                           |
| -------- | --------------------------- | -------------------------------- |
| `muted`  | cor de **texto** secundário | **fundo** sutil (`bg-muted`)     |
| `accent` | cor da **marca**            | **fundo de hover** (`bg-accent`) |

O HeroUI é dono do tema, então **em componentes shadcn** faça a troca:

| shadcn gerou                                | Troque por                |
| ------------------------------------------- | ------------------------- |
| `bg-muted` (e variantes `hover:`, `/50`...) | `bg-default`              |
| `bg-accent`                                 | `bg-default-hover`        |
| `text-accent-foreground`                    | `text-default-foreground` |

`npm run lint:tokens` aponta cada ocorrência com a sugestão. Ele roda no `validate`, no
pre-commit (arquivos de `ui/` e `react-bits/`) e na CI.

## Onde cada biblioteca aparece

- **HeroUI**: formulários (NumberField, Select, ComboBox, Slider, Switch, ToggleButtonGroup),
  Modal, AlertDialog, Drawer, Tabs, Alert, Chip, Toast, EmptyState.
- **shadcn/ui**: paleta de comandos (`command`), explicações das fórmulas (`hover-card`),
  linhas de kit e histórico (`item`).
- **React Bits**: título animado da home (`BlurText`), grão de película (`Noise`), cartões dos
  modelos (`SpotlightCard`) e o preço ao vivo (`CountUp`).
- **React Aria** direto: cartões de escolha (`RadioGroup` + `RadioField`) e botões de serviço.

Ajustes locais no código gerado (comentados no próprio arquivo): `CountUp` com mola de
amortecimento crítico (a original demorava segundos para assentar) e sem voltar a zero quando o
valor muda; `SpotlightCard` usando os tokens do tema.

## Ao adicionar componentes pelo CLI

- Revise o diff: o CLI pode acrescentar variáveis CSS ao `global.css`. Variáveis que duplicam
  tokens do HeroUI devem ser removidas e mapeadas na ponte.
- Rode `npm run lint:tokens` e ajuste as colisões.
- Dependências extras (ex.: `motion`, `gsap` no React Bits) são instaladas pelo próprio CLI.
