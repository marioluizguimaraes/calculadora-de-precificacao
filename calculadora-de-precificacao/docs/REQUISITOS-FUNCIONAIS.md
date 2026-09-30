# Requisitos Funcionais — Calculadora de Precificação

> Documento focado em **funcionalidade**: campos, regras, validações e cálculos.
> Não descreve leiaute, cores ou componentes visuais — serve de base para um redesign da interface.

## 1. Visão geral

Sistema para videomakers e produtoras audiovisuais montarem um orçamento de projeto de vídeo e
chegarem a um **preço de venda** justificado (custo + markup), com uma **proposta em PDF** ao final.

O sistema tem três grandes áreas:

1. **Meu estúdio** (`/estudio`) — dados fixos do negócio, preenchidos uma vez e reaproveitados em
   todos os orçamentos.
2. **Assistente de orçamento** (`/orcamento`) — fluxo em 9 etapas (wizard) que monta um orçamento
   específico para um cliente/projeto.
3. **Resumo, histórico e proposta** (`/orcamento/resumo`, `/orcamentos`, `/orcamentos/:id`) —
   visualização do cálculo, arquivo de orçamentos salvos e geração de PDF.

Regra geral do fluxo: **nenhuma etapa bloqueia o avanço**. Cada etapa apenas sinaliza (visualmente)
se está "completa"; o usuário pode navegar livremente entre etapas a qualquer momento.

Persistência: tudo roda no navegador (localStorage) — não há backend/servidor de dados. Existem 3
"bancos" persistidos:

- **Perfil do estúdio** (dados do negócio, custos fixos, kit de equipamentos) — um registro único.
- **Rascunho atual** (orçamento em edição) — um registro único, recuperável ao reabrir o app.
- **Histórico de orçamentos salvos** — lista, cada item é uma foto congelada do orçamento + do
  perfil do estúdio no momento do salvamento (alterar custos depois não muda orçamentos já salvos).

Todos os valores monetários são tratados internamente em **centavos** (inteiros); horas em números
decimais (permitem 0,5).

---

## 2. Meu estúdio (perfil do negócio)

Tela de configuração única, com duas abas: **"Custos e jornada"** e **"Proposta e contato"**.
Alimenta também a primeira etapa do assistente ("Seu estúdio"), que é a mesma tela, mostrada apenas
na primeira vez que a pessoa usa o sistema (ou quando acessada explicitamente).

### 2.1 Custos e jornada

**Custos fixos mensais** (lista editável, cada item com):

- Descrição (texto livre)
- Valor mensal (moeda, sem centavos)
- Ação: remover item / adicionar novo item ("Novo custo", valor R$ 0)

Valores de partida sugeridos (todos editáveis/removíveis):

| Descrição                                        | Valor sugerido |
| ------------------------------------------------ | -------------- |
| Softwares e assinaturas (edição, trilhas, nuvem) | R$ 450,00      |
| Internet e telefone                              | R$ 200,00      |
| Contador e DAS/impostos fixos                    | R$ 300,00      |
| Seguro de equipamentos (mensal)                  | R$ 150,00      |
| Manutenção e reposição                           | R$ 200,00      |

**Pró-labore mensal**: campo de moeda (sem centavos). Padrão: R$ 5.000,00.

**Jornada de trabalho**:

- Dias trabalhados por mês (1–31). Padrão: 20.
- Horas produtivas por dia (1–16). Padrão: 8.
- Dias de uso do kit por ano (1–365). Padrão: 120 — base da depreciação diária dos equipamentos.

**Impostos e margem padrão**:

- Regime tributário (seletor único): MEI, Simples Nacional, Pessoa física (RPA), Outro regime.
  Ao trocar, a alíquota efetiva é preenchida com um valor sugerido (0% / 6% / 11% / 14%
  respectivamente), mas continua editável.
- Alíquota efetiva (%, passo 0,5, máx. 60).
- Taxa de pagamento (%, passo 0,5, máx. 30) — cartão, boleto, plataforma.
- Lucro padrão (%, máx. 60) — valor de partida para novos orçamentos; referência de mercado 20–30%.

**Sua base** (cidade de origem):

- Estado (lista IBGE) → Cidade (lista IBGE, dependente do estado, com busca).
- Usada para calcular a distância de deslocamento em cada orçamento.
- Ação "Trocar" limpa a cidade selecionada e reabre os seletores.

Um indicador ao vivo mostra, sempre que esta tela é usada: **"Sua hora custa" = (custos fixos +
pró-labore) ÷ (dias × horas)**, com a memória de cálculo por extenso.

### 2.2 Proposta e contato

Dados que assinam o PDF da proposta:

- Logo (upload PNG/JPG, até 400 KB; ações: enviar, trocar, remover). Se ausente, o PDF usa um
  monograma com as iniciais do nome.
- Nome do estúdio ou profissional (obrigatório para gerar PDF).
- Seu nome (opcional, usado se não houver nome de estúdio).
- E-mail, Telefone/WhatsApp, CNPJ/CPF, Site ou portfólio.
- Condições de pagamento (texto livre, multi-linha). Padrão: "50% na aprovação da proposta e 50%
  na entrega do material final."
- Validade da proposta (dias, mín. 1). Padrão: 15.

Uma versão **compacta** deste formulário (sem CNPJ/CPF e Site) aparece dentro do diálogo de geração
de PDF, para revisão rápida antes de baixar.

### 2.3 Kit de equipamentos (cadastro reaproveitável)

Ver seção 5 (Equipamentos) — o cadastro do kit também vive no perfil do estúdio, mas é editado
dentro da etapa "Kit" do assistente.

---

## 3. Assistente de orçamento (wizard) — visão geral

Fluxo sequencial de **9 etapas** (a 1ª só aparece na primeira vez ou se acessada explicitamente):

| #   | Etapa (id)              | Objetivo                                       | Critério de "completa" (não bloqueia)              |
| --- | ----------------------- | ---------------------------------------------- | -------------------------------------------------- |
| 1   | Seu estúdio (`estudio`) | Perfil do negócio (seção 2)                    | Pró-labore > 0, dias/mês > 0, cidade-base definida |
| 2   | Projeto (`projeto`)     | Nome do projeto, cliente, tier de complexidade | Título do projeto e nome do cliente preenchidos    |
| 3   | Local (`local`)         | Onde vai gravar; calcula distância             | Distância definida                                 |
| 4   | Serviços (`servicos`)   | Quais sub-serviços entram no pacote            | Pelo menos 1 serviço selecionado                   |
| 5   | Tempo (`tempo`)         | Horas de cada serviço                          | Pelo menos 1 serviço com horas > 0                 |
| 6   | Kit (`equipamentos`)    | Equipamentos próprios/alugados usados          | Pelo menos 1 equipamento no orçamento              |
| 7   | Equipe (`equipe`)       | Freelancers/parceiros contratados              | Sempre "completa" (equipe é opcional)              |
| 8   | Logística (`logistica`) | Custos variáveis do projeto                    | Sempre "completa"                                  |
| 9   | Margem (`margem`)       | Lucro desejado, impostos, arredondamento       | Lucro > 0%                                         |

Navegação:

- Botões "Anterior" / "Próximo: <etapa>" (ou "Ver orçamento" na última etapa).
- Trilho de etapas clicável (permite pular para qualquer etapa a qualquer momento).
- Barra de progresso (mobile).
- Atalho: ao concluir a etapa "Seu estúdio", o rascunho herda automaticamente a alíquota de imposto,
  taxa de pagamento e lucro padrão recém-configurados (preservando comissão e arredondamento já
  definidos no rascunho, se houver).
- Ação "Começar outro": pede confirmação; ao confirmar, apaga o rascunho atual (orçamentos já
  salvos no histórico e os dados do estúdio **não** são afetados) e volta para a etapa "Projeto".
- Painel lateral (desktop) / gaveta (mobile): mostra o **preço calculado ao vivo** e um atalho para
  "Ver resumo completo", visível durante toda a navegação pelo wizard.
- Rodapé fixo (desktop): linha do tempo do projeto inteiro (ver seção 9.2), sempre visível.

---

## 4. Etapa: Projeto

### 4.1 Modelos de projeto (presets)

Cartões de modelo pré-configurado. Ao escolher um, o sistema substitui automaticamente os serviços
selecionados, as horas típicas de cada um (conforme o tier do modelo) e sugestões de equipe:

| Modelo              | Tier | Entrega sugerida                    | Equipe sugerida                                                |
| ------------------- | ---- | ----------------------------------- | -------------------------------------------------------------- |
| Conteúdo para redes | 1    | 4 vídeos verticais de até 60s       | —                                                              |
| Vídeo institucional | 2    | 1 vídeo de 2–3 min + 2 cortes       | Assistente de câmera                                           |
| Cobertura de evento | 2    | 1 aftermovie de 2 min + 3 cortes    | Segundo cinegrafista                                           |
| Casamento e social  | 2    | Filme de 8–12 min + teaser de 1 min | Segundo cinegrafista                                           |
| Filme publicitário  | 3    | Filme de 30s + versões de 15 e 6s   | Diretor de fotografia, gaffer, som direto, produtor, maquiagem |
| Minidocumentário    | 3    | Documentário de 10–15 min           | Técnico de som direto, assistente                              |

Escolher um modelo é sempre uma substituição total dos serviços atuais (não soma).

### 4.2 Dados do projeto

- Nome do projeto (obrigatório) — aparece no cabeçalho da proposta.
- Cliente: nome (obrigatório), empresa (opcional), e-mail (opcional).
- O que será entregue (texto livre, multi-linha) — aparece na seção "O que você recebe" do PDF.

### 4.3 Complexidade (tier)

Seletor único: **Tier 1 (Simples — redes sociais, pouca estrutura)**, **Tier 2 (Intermediária —
institucional, eventos, social)**, **Tier 3 (Complexa — publicidade, cinema, documentário)**.

Regra: trocar de tier **só atualiza as horas de serviços que ainda estão no valor padrão da
tabela**; horas que o usuário já ajustou manualmente permanecem como estão. O tier não é um
multiplicador oculto — ele só define quais horas sugeridas aparecem no catálogo (seção 5).

---

## 5. Etapa: Local

Define onde a gravação ocorre e calcula a distância usada no custo de deslocamento.

### 5.1 Área de atuação (3 opções, mutuamente exclusivas)

1. **Numa cidade específica** — calcula rota real até lá.
2. **Numa região** — atende um polo regional e cidades ao redor.
3. **Pelo estado todo** — pode ser em qualquer cidade do estado.

Trocar a área de atuação limpa cidade/região selecionadas e o modo manual de distância.

### 5.2 Seleção do local

- Estado (lista IBGE), e conforme a área escolhida:
  - Cidade (lista IBGE, com busca) — se "cidade específica";
  - Região (agrupamento por região intermediária do IBGE, nomeada pela cidade-polo) — se "região".
  - Nada além do estado, se "estado todo".

### 5.3 Distância até o local

- Se a cidade-base (do perfil) ainda não foi definida, o formulário pede estado + cidade da base
  ali mesmo (fica salvo no perfil do estúdio).
- Cálculo automático da distância de ida (km):
  - **Cidade específica**: rota rodoviária real (serviço de roteamento OSRM); se indisponível,
    estimativa por linha reta × fator de 1,25 (fator rodoviário). Mesma cidade da base = 15 km fixo.
  - **Região/estado**: distância típica (mediana) até os municípios da área selecionada.
  - Mostra também a duração estimada da viagem (quando há rota real).
- **Ajuste manual**: campo numérico permite sobrescrever a distância calculada. Uma vez em modo
  manual, o cálculo automático para de atualizar até a pessoa escolher "Usar cálculo automático".
- Se a distância não for definida e houver diárias de gravação, o sistema emite um aviso ("Sem a
  distância até o local, o deslocamento não entra no preço").

---

## 6. Etapa: Serviços

Catálogo fixo de **sub-serviços** agrupados em 3 etapas de produção:

### 6.1 Pré-produção

Briefing e reuniões · Roteiro · Storyboard · Decupagem e ordem do dia · Visita técnica · Produção
de elenco e locação · Contratos e autorizações.

### 6.2 Gravação (produção)

Montagem de set e luz · Captação de imagens · Entrevistas e depoimentos · Imagens aéreas (drone) ·
Making of e fotos · Backup do material.

### 6.3 Pós-produção

Decupagem do material · Edição e montagem · Correção de cor · Motion graphics · Mixagem e
sonorização · Trilha sonora · Locução · Legendas · Libras e audiodescrição · Cortes para redes ·
Rodadas de revisão · Exportação e entrega.

Cada sub-serviço tem uma descrição curta e **horas sugeridas por tier** (1/2/3) — ex.: "Edição e
montagem" sugere 3h (tier 1), 10h (tier 2) ou 24h (tier 3).

### 6.4 Interação

- Cada serviço é marcado/desmarcado individualmente (toggle).
- Ação por etapa: "Marcar todos" / "Limpar etapa" (marca/desmarca todos os serviços daquela etapa
  de uma vez, preservando horas já ajustadas dos que continuam marcados).
- Contador "X/Y" de quantos serviços da etapa estão marcados.
- Ao marcar um serviço, ele entra no orçamento com as horas sugeridas do tier atual do projeto.

> Nota: as horas aqui são as **do próprio usuário (quem orça)**. Trabalho de terceiros entra pela
> etapa "Equipe".

---

## 7. Etapa: Tempo

Ajuste fino das horas de cada serviço selecionado, agrupado pelas 3 etapas (pré/gravação/pós).

- Se nenhum serviço foi selecionado, mostra aviso para voltar à etapa anterior.
- Para cada serviço: nome, barra proporcional de horas (relativa ao serviço com mais horas do
  orçamento), campo numérico de horas (passo 0,5), botão remover.
- Cabeçalho de cada grupo (etapa) mostra, ao vivo: total de horas em timecode, número de diárias
  (ver regra de arredondamento abaixo) e custo de mão de obra da etapa.
- Texto de contexto: a diária considera as horas/dia configuradas no perfil do estúdio.

**Regra de diárias**: diárias de uma etapa = horas da etapa ÷ horas/dia, arredondado **para cima**
(uma diária parcial conta como inteira).

---

## 8. Etapa: Kit (equipamentos)

Dois blocos: **kit próprio** (cadastro reaproveitável) e **aluguel** (só para este orçamento).

### 8.1 Kit próprio

- Cadastro persistente no perfil do estúdio (reaproveitado entre orçamentos).
- Sugestões de itens comuns, com valores de mercado aproximados (nome, categoria, valor de compra,
  % de revenda, vida útil, diária de aluguel equivalente): câmera mirrorless full frame, câmera de
  cinema, lente zoom 24-70mm, lente fixa 50mm, kit de iluminação LED, microfone lapela sem fio,
  microfone shotgun + gravador, gimbal/estabilizador, tripé com cabeça fluida, drone 4K, computador
  de edição. Um toque adiciona a sugestão ao kit com os valores padrão (editáveis depois).
- Também é possível cadastrar item avulso ("Outro equipamento").
- Cada item do kit tem: nome, categoria, valor de compra, valor de revenda, vida útil (anos).
- Categorias disponíveis: Câmera, Lente, Iluminação, Áudio, Suporte e estabilização, Drone,
  Computador de edição, Outro. Cada categoria define a etapa padrão do item (a maioria é
  "Gravação"; "Computador" é "Pós-produção").
- Cada item do kit tem um interruptor "levar neste orçamento" — ao ativar, o item entra na lista de
  equipamentos deste orçamento específico (cópia dos dados no momento da ativação).
- Editar um item do kit atualiza também a cópia usada nos orçamentos que o referenciam.
- Excluir um item do kit ("Tirar do kit") remove também sua cópia de todos os orçamentos.
- Cada item, quando levado a um orçamento, tem um campo "Diárias neste orçamento": por padrão
  segue as diárias da etapa a que pertence; pode ser sobrescrito com um número fixo.
- Mostra ao vivo: custo diário de depreciação de cada item, e (se estiver no orçamento atual) o
  custo total dele neste orçamento.

### 8.2 Aluguel

- Itens que existem só para este orçamento (não ficam no kit permanente).
- Sugestões rápidas: as mesmas do kit que têm diária de aluguel > 0 (até 5 sugestões).
- Cada item de aluguel: nome, valor da diária, número de diárias (padrão: segue a etapa,
  sobrescrevível), ação remover.
- Todo item de aluguel é atribuído por padrão à etapa "Gravação".

Rodapé da etapa: contagem total de itens no orçamento (próprios + alugados) e custo total de
equipamentos.

---

## 9. Etapa: Equipe

Cadastro de profissionais contratados por diária, específicos deste orçamento.

### 9.1 Adição rápida por função

Botões de atalho por etapa (pré/gravação/pós), com diária de mercado sugerida (todas editáveis):

| Função                   | Etapa        | Diária sugerida |
| ------------------------ | ------------ | --------------- |
| Assistente de câmera     | Gravação     | R$ 350          |
| Segundo cinegrafista     | Gravação     | R$ 600          |
| Diretor(a) de fotografia | Gravação     | R$ 1.200        |
| Eletricista / gaffer     | Gravação     | R$ 500          |
| Técnico(a) de som direto | Gravação     | R$ 600          |
| Maquiador(a)             | Gravação     | R$ 450          |
| Piloto de drone          | Gravação     | R$ 700          |
| Produtor(a)              | Pré-produção | R$ 450          |
| Roteirista               | Pré-produção | R$ 500          |
| Editor(a) freelancer     | Pós-produção | R$ 450          |
| Motion designer          | Pós-produção | R$ 550          |
| Colorista                | Pós-produção | R$ 700          |
| Locutor(a)               | Pós-produção | R$ 400          |

Botão adicional: "Outra função" (entra como "Profissional", etapa Gravação, diária R$ 400).

### 9.2 Edição de cada membro da equipe

Campos por item: Função (texto livre), Etapa (pré/gravação/pós — trocar a etapa reseta o número de
diárias para o padrão da nova etapa), Diária (moeda), Quantidade de pessoas (mín. 1, inteiro),
Diárias (padrão: segue a etapa; sobrescrevível), custo calculado ao vivo (diária × pessoas ×
diárias), ação remover.

Se nenhum membro foi adicionado, mostra mensagem informando que é normal trabalhar sozinho e que
pode seguir para a próxima etapa.

**Impacto no cálculo**: toda pessoa alocada na etapa "Gravação" conta como presença no set (usada
para ratear alimentação/hospedagem — ver seção 10).

---

## 10. Etapa: Logística (custos variáveis)

Quatro blocos de custo, todos entrando no custo da etapa de Gravação:

### 10.1 Deslocamento

- Preço do litro de combustível (moeda). Padrão: R$ 6,29.
- Consumo do veículo, km por litro (mín. 1, passo 0,5). Padrão: 11.
- Pedágios por viagem (moeda, soma de ida e volta). Padrão: R$ 0.
- **Viagens automáticas** (interruptor): quando ligado, o número de viagens é calculado
  automaticamente — 1 viagem se houver alguma noite de hospedagem, senão 1 viagem por diária de
  gravação. Quando desligado, permite informar manualmente o número de viagens.
- Subtotal exibido: combustível + pedágios.
- Fórmula do combustível: distância de ida (km) × 2 (ida e volta) × nº de viagens ÷ km por litro ×
  preço do litro.
- Se a distância ainda não foi definida na etapa Local, mostra aviso com atalho para escolher o
  local.

### 10.2 Alimentação

- Valor por pessoa, por diária (moeda). Padrão: R$ 50,00.
- Descrição contextual: nº de pessoas no set × nº de diárias de gravação.
- Cálculo: valor por pessoa/diária × pessoas no set (1 + equipe alocada em "Gravação") × diárias de
  gravação.

### 10.3 Hospedagem

- Nº de noites (inteiro, padrão 0).
- Valor por pessoa, por noite (moeda). Padrão: R$ 250,00.
- Dica contextual: se a distância for maior que 200 km, sugere hospedar a equipe e fazer uma
  viagem só.
- Cálculo: valor por noite × noites × pessoas no set.

### 10.4 Custos do projeto

- Seguro da produção (moeda).
- Locação de espaço (moeda).
- Trilhas e bancos de imagem (moeda).
- Lista de "outros custos" (livre, cada item com descrição + valor; adicionar/remover).

Total de logística exibido ao final da etapa (soma de todos os 4 blocos).

---

## 11. Etapa: Margem (impostos e lucro)

### 11.1 Margem de lucro

- Controle deslizante (slider) de 0% a 60%, passo 1%. Herdado do "lucro padrão" do perfil ao
  iniciar um orçamento novo.
- Indicador de status conforme a faixa:
  - < 15%: "Abaixo do mercado" (alerta)
  - 15–19%: "Um pouco abaixo" (atenção)
  - 20–30%: "Na referência de mercado" (ok)
  - > 30%: "Acima da média — justifique o valor"
- Mostra lado a lado: **Preço mínimo** (lucro zero — cobre custos e impostos) e **Preço sugerido**
  (com o lucro definido), além do valor de lucro em R$ e da margem de contribuição.

### 11.2 Impostos e taxas

- Imposto (%, passo 0,5, máx. 60) — herdado da alíquota do perfil, editável só para este orçamento.
- Taxa de pagamento (%, passo 0,5, máx. 30) — cartão, boleto, plataforma.
- Comissão (%, passo 0,5, máx. 50) — indicação, agência ou parceiro.
- Exibe a fórmula do markup por extenso, com os valores atuais substituídos.

### 11.3 Arredondamento

Escolha única entre: **Exato** (sem arredondamento), **R$ 10**, **R$ 50**, **R$ 100**. O preço
sugerido é arredondado **para cima** para o múltiplo escolhido; a diferença vira lucro adicional.

### 11.4 Validação

Se (Imposto + Taxa de pagamento + Comissão + Lucro) ≥ 100%, o cálculo fica indefinido e o sistema
emite aviso pedindo para reduzir algum percentual.

---

## 12. Motor de cálculo (regras e fórmulas)

Todas as fórmulas abaixo operam em centavos; a leitura em R$ é só na exibição.

### 12.1 Custo da hora do profissional

```
custoFixoMensal    = soma(custos fixos mensais) + pró-labore
horasProdutivasMes = dias trabalhados/mês × horas por dia
custoHora          = custoFixoMensal ÷ horasProdutivasMes
```

Se não houver horas produtivas, custo da hora = 0 e emite aviso "perfil-incompleto".

### 12.2 Horas e diárias por etapa

- Horas de uma etapa = soma das horas de todos os serviços marcados naquela etapa.
- Diárias de uma etapa = horas da etapa ÷ horas/dia, arredondado para cima.
- "Diárias de gravação" = diárias da etapa "Gravação" — usada como base de toda a logística.

### 12.3 Mão de obra direta (própria)

```
maoDeObraEtapa = custoHora × horasDaEtapa
```

### 12.4 Equipe

```
custoMembro = diária × pessoas × diárias
```

Onde diárias = valor sobrescrito manualmente, ou (se não sobrescrito) as diárias da etapa em que o
membro está alocado.

**Pessoas no set** = 1 (o próprio usuário) + soma das pessoas de todos os membros de equipe
alocados na etapa "Gravação".

### 12.5 Equipamentos

```
# Próprio (depreciação linear)
depreciaçãoAnual = max(0, valorCompra − valorRevenda) ÷ vidaÚtilAnos
custoDiário      = depreciaçãoAnual ÷ diasDeUsoDoKitPorAno

# Alugado
custoDiário      = valorDaDiáriaDeAluguel

# Em ambos os casos:
custoDoItem = custoDiário × diárias
```

Diárias = valor sobrescrito manualmente no item, ou (se não sobrescrito) as diárias da etapa a que
o item pertence.

### 12.6 Logística

```
trips = nº manual, OU (automático):
        0 se não há diárias de gravação;
        1 se há alguma noite de hospedagem;
        senão, 1 por diária de gravação.

combustível = (distânciaKm × 2 × trips ÷ kmPorLitro) × preçoDoLitro
pedágios    = pedágioPorViagem × trips
alimentação = valorPorPessoaDiária × pessoasNoSet × diáriasDeGravação
hospedagem  = valorPorPessoaNoite × noites × pessoasNoSet
+ seguro + locação de espaço + trilhas/bancos de imagem + soma dos custos extras avulsos
```

Toda a logística é atribuída ao custo da etapa "Gravação".

### 12.7 Custo direto (unitário) do orçamento

```
custoDireto = Σ(mão de obra própria, todas as etapas)
            + Σ(equipe, todas as etapas)
            + Σ(equipamentos, todas as etapas)
            + logísticaTotal
```

### 12.8 Markup e preço de venda (método Sebrae, 7 etapas)

```
DV (despesas variáveis) = imposto% + taxaDePagamento% + comissão%
DF (despesas fixas)     = 0  — já embutidas no custo da hora, evita cobrar 2x
LP (lucro pretendido)   = % de lucro definido na etapa Margem

markup = 100 ÷ [100 − (DV + LP)]

preçoMínimo    = custoDireto × [100 ÷ (100 − DV)]     (LP = 0 → cobre custo + impostos, lucro zero)
preçoSugerido  = arredondaParaCima(custoDireto × markup, degrauEscolhido)
```

Se DV + LP ≥ 100%, o markup é indefinido e o cálculo emite aviso bloqueando a leitura do preço
(o sistema usa markup = 1 apenas como fallback de exibição, sinalizando o erro).

### 12.9 Decomposição do preço final (composição)

```
impostos  = preçoSugerido × imposto%
taxas     = preçoSugerido × taxaDePagamento%
comissão  = preçoSugerido × comissão%
lucro     = preçoSugerido − custoDireto − impostos − taxas − comissão   (o que sobra — garante
                                                                          que a soma feche exatamente)
```

Seis grupos de composição, sempre na mesma ordem: **Seu trabalho**, **Equipe**, **Equipamentos**,
**Logística**, **Impostos e taxas**, **Lucro**.

### 12.10 Margem de contribuição

```
margemContribuição = preçoSugerido − (equipe + equipamentosAlugados + logísticaTotal
                                       + impostos + taxas + comissão)
```

(Não desconta mão de obra própria nem depreciação de equipamentos próprios — são custos que não
saem do caixa no ato.)

### 12.11 Preço por etapa (para a proposta)

O preço final é **rateado proporcionalmente ao custo de cada etapa** (pré / gravação / pós),
garantindo que a soma das partes seja exatamente igual ao preço total (sem perda de centavos por
arredondamento — o resto vai para a etapa de maior custo).

### 12.12 Hora efetiva

```
horaEfetiva = preçoSugerido ÷ totalDeHorasPróprias
```

Mostrado como "sua hora sai por" (comparado ao custo/hora bruto).

### 12.13 Avisos do sistema (não bloqueiam, apenas alertam)

| Código                  | Condição                                | Mensagem                                          |
| ----------------------- | --------------------------------------- | ------------------------------------------------- |
| `perfil-incompleto`     | custo da hora ≤ 0                       | Informe seus custos mensais e sua jornada.        |
| `sem-servicos`          | nenhum serviço selecionado              | Escolha ao menos um serviço.                      |
| `sem-distancia`         | distância nula e há diárias de gravação | Sem distância, o deslocamento não entra no preço. |
| `percentuais-invalidos` | DV+LP ≥ 100%                            | Impostos, taxas e lucro somam 100% ou mais.       |
| `margem-baixa`          | lucro < 15%                             | Lucro abaixo da referência de mercado (20–30%).   |

---

## 13. Resumo do orçamento (`/orcamento/resumo`)

Tela de leitura consolidada do orçamento em edição, com:

- Cabeçalho: título do projeto, nome do cliente (+ empresa), local, chip do tier.
- Lista de avisos pendentes (seção 12.13), se houver.
- Bloco de preço: preço sugerido (destaque), preço mínimo, lucro (valor e %), hora efetiva vs.
  custo/hora.
- Linha do tempo do projeto (ver seção 14.2) + cards de preço por etapa (pré/gravação/pós).
- Composição do preço: alternância entre gráfico de barra empilhada (com legenda, valor e %) e
  tabela (grupo / valor / % do preço).
- "Como chegamos nesse número": lista passo a passo (custo da hora → mão de obra → + equipe → +
  equipamentos → + logística → = custo direto → × markup → = preço sugerido), cada passo com valor
  e fórmula, alguns com explicação expansível citando a fonte metodológica (Sebrae / Forasteiro /
  Impulso Filmes).
- "O que está incluído": lista de serviços por etapa, equipe (com multiplicador "N× função"),
  equipamentos, e o texto de entrega do projeto.

Ações disponíveis (variam se é rascunho ou orçamento já salvo — ver seção 15):

- **Editar** — volta ao wizard.
- **Salvar** (só no rascunho ativo) — grava uma foto do orçamento + perfil no histórico; fica
  desabilitado quando já está salvo sem alterações desde o último salvamento.
- **Duplicar** (só em orçamento salvo) — cria uma cópia com novo id e título "(cópia)", abre no
  wizard a partir da etapa Projeto.
- **Gerar proposta** — salva automaticamente (se ainda não salvo) e abre o diálogo de PDF.

---

## 14. Componentes de visualização usados no resumo e no wizard

(Descritos aqui pela **função**, não pelo estilo visual — o redesign é livre para reinterpretá-los.)

### 14.1 Monitor de preço ao vivo

Mostra, a qualquer momento durante o wizard: preço sugerido (com contagem animada), markup
aplicado, preço mínimo, barra de composição resumida, e 4 indicadores: custo da hora, total de
horas próprias, diárias de gravação, lucro. Mostra o primeiro aviso pendente, se houver.

### 14.2 Linha do tempo de produção

Representa cada serviço selecionado como um "bloco" com largura proporcional às horas, organizados
em 3 trilhas (pré / gravação / pós), em sequência temporal. Ao passar o cursor sobre um bloco,
mostra nome, duração e o instante em que começa. Há uma régua de tempo acima (marcações
proporcionais). Versão compacta (sem rótulos) é usada em espaços menores (rodapé do wizard, home).

### 14.3 Barra/gráfico de composição

Barra empilhada horizontal com os 6 grupos de custo (trabalho, equipe, equipamentos, logística,
impostos, lucro), proporcional ao valor de cada grupo. Versão completa traz legenda com nome,
percentual, valor e descrição de cada grupo; versão compacta é só a barra (usada no monitor ao
vivo).

---

## 15. Histórico de orçamentos (`/orcamentos` e `/orcamentos/:id`)

### 15.1 Lista (`/orcamentos`)

- Estado vazio: mensagem + botão para montar um orçamento.
- Cada item da lista mostra: barra de proporção de horas por etapa, data de salvamento, título do
  projeto, cliente + local, preço (congelado no momento do salvamento), ação "Abrir", ação
  "Excluir" (remove permanentemente do histórico, sem confirmação adicional).

### 15.2 Detalhe (`/orcamentos/:id`)

- Mesma tela de resumo (seção 13), mas usando o **perfil e o rascunho congelados** no momento do
  salvamento (não o perfil/rascunho atuais).
- Selo indicando "Salvo em <data> · custos da época".
- Ações: Editar (carrega esse orçamento congelado no rascunho ativo e abre o wizard), Duplicar
  (cria cópia editável independente), Gerar proposta (PDF com os dados congelados).
- Se o id não existir no histórico, mostra página "não encontrado".

---

## 16. Geração de proposta em PDF

Diálogo acionado a partir do resumo (ativo ou salvo). Antes de gerar:

- Mostra formulário compacto de identidade do estúdio (ver 2.2) — editável ali mesmo; qualquer
  alteração é salva no perfil do estúdio (aplica-se a propostas futuras também).
- Interruptor **"Anexar memória de cálculo"**: inclui uma página extra com a composição do preço e
  os parâmetros do cálculo (transparência para o cliente).
- Campo **"Observação para o cliente"** (texto livre, ex.: nº de revisões incluídas, prazo de
  entrega) — aparece como item de condições no PDF.
- Botão "Baixar proposta": desabilitado se faltar nome do estúdio/profissional. Mostra estado de
  carregamento durante a geração. Em caso de erro, mostra mensagem pedindo para tentar de novo /
  checar formato da logo.
- Ao concluir a geração, salva o orçamento no histórico (se ainda não salvo) e baixa o arquivo PDF.

### 16.1 Conteúdo do PDF (página 1 — sempre gerada)

- Cabeçalho: logo (ou monograma com iniciais) + nome do estúdio + contato; data de emissão.
- Título do projeto, cliente, local, validade da proposta (data de emissão + dias de validade).
- "O que você recebe" (texto de entrega), se preenchido.
- "Como o trabalho acontece": lista por etapa (pré/gravação/pós) com os serviços incluídos e,
  para a etapa de gravação, o número de diárias (demais etapas mostram horas).
- "Equipe" e "Estrutura técnica" (equipamentos), se houver, lado a lado.
- "Investimento": tabela com o preço de cada etapa que teve custo, e o total do projeto em
  destaque.
- "Condições": condições de pagamento, validade da proposta, aviso de que deslocamento/alimentação/
  demais custos de produção já estão inclusos (se houver logística), e a observação livre
  informada no diálogo.

### 16.2 Página 2 — "Memória de cálculo" (opcional)

- Barra de composição do preço (mesmos 6 grupos) com legenda (nome, %, valor).
- Tabela de parâmetros: custo da hora de trabalho, horas de trabalho, diárias de gravação, custo
  direto total, % de impostos+taxas+comissão, % de margem de lucro, markup aplicado.
- Fórmula por extenso do cálculo de preço.

---

## 17. Página inicial (`/`)

- Chamada principal: "Continuar orçamento" (se já existe rascunho com conteúdo) ou "Começar
  orçamento"; atalho "Ver orçamentos salvos" se houver histórico.
- Se há rascunho em andamento, mostra o título do projeto em edição.
- Exemplo estático (dados fictícios) demonstrando o monitor de preço e a linha do tempo, para
  ilustrar o método.
- Seção explicando o método em 4 passos: custo da hora → custo do projeto → markup → proposta, com
  as fórmulas resumidas e créditos das fontes metodológicas.
- Seção "Últimos orçamentos": até 3 orçamentos mais recentes do histórico, cada um linkando para o
  respectivo detalhe.

---

## 18. Navegação e utilitários globais

- Cabeçalho fixo em todas as páginas: marca, link "Orçamentos" (histórico), link "Meu estúdio"
  (configurações), busca (paleta de comandos, atalho Ctrl/Cmd+K), alternância de tema claro/escuro,
  botão "Novo orçamento" / "Continuar orçamento" (contextual conforme existência de rascunho).
- Paleta de comandos: busca rápida de ações/páginas via atalho de teclado.
- Tema claro/escuro com preferência persistida.
- Página "não encontrado" para rotas inválidas ou orçamento inexistente no histórico.

---

## 19. Regras de negócio transversais (resumo para quem for redesenhar)

1. **Nada bloqueia o avanço** — os indicadores de "completo" são só sinalização, nunca travam
   navegação.
2. **Herança de perfil → rascunho**: alíquota de imposto, taxa de pagamento e lucro padrão do
   estúdio alimentam um novo orçamento; depois disso, cada orçamento pode divergir livremente sem
   afetar o perfil (exceto o kit de equipamentos, que é sempre compartilhado).
3. **Orçamentos salvos são fotografias**: preço, perfil e rascunho ficam congelados no momento do
   "Salvar" — mudanças posteriores no estúdio não alteram orçamentos já salvos.
4. **Diárias por padrão seguem a etapa**, mas todo item (equipe, equipamento) pode ter seu próprio
   número de diárias, independente da etapa.
5. **Arredondamento sempre para cima**, e a diferença sempre vira lucro adicional (nunca é
   "perdida" nem afeta os demais grupos da composição).
6. **A logística inteira é custeada dentro da etapa de Gravação**, mesmo que o rateio final do
   preço por etapa distribua esse custo proporcionalmente entre as 3 etapas.
7. **Todas as somas de composição/rateio fecham exatamente no preço final** — qualquer resto de
   arredondamento é absorvido pelo grupo/etapa de maior valor (nunca gera diferença visível).
