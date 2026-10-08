# Modelo de precificação

Baseado em:
[Impulso Filmes](https://www.impulsofilmes.com.br/como-funciona-a-tabela-de-precos-de-uma-produtora-de-video/),
[Forasteiro Produções](https://forasteiroproducoes.com/blog/videomaker-quanto-cobrar-producao-video/) e
[Sebrae — 7 etapas](https://www.sebraeplay.com.br/content/precificacao-de-servicos-7-etapas-para-chegar-ao-preco-ideal).

Não existe preço universal: a base é **equipe + equipamentos + tempo × complexidade**, adaptada à
realidade de quem presta o serviço. O sistema coleta esse contexto e aplica as fórmulas abaixo.

## Entradas (o que o usuário informa)

| Grupo             | Dados                                                                                                                                                | Feature            |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| Perfil do negócio | Custos fixos mensais (aluguel, internet, softwares/IA, contador), pró-labore desejado, dias trabalhados/mês, horas/dia, regime tributário e alíquota | `business-profile` |
| Área de atuação   | Tipo: **regional**, **estadual** ou **cidade específica** (UF/município via IBGE); distância média até a locação                                     | `location`         |
| Serviços          | Tipo de produção (tier) e sub-serviços por etapa (abaixo)                                                                                            | `services`         |
| Tempo             | Horas ou diárias por etapa/sub-serviço                                                                                                               | `work-stages`      |
| Equipamentos      | Próprio: valor de compra, valor de revenda, vida útil. Locado: valor da diária                                                                       | `equipment`        |
| Equipe            | Função, cobrança por diária (diária × diárias) ou por hora (valor da hora × horas no projeto)                                                        | `team`             |
| Custos variáveis  | Deslocamento (km, combustível, pedágio), alimentação, hospedagem, seguro, locação de espaço, trilha/banco de imagens                                 | `costs`            |
| Margem            | Lucro pretendido (%) — referência de mercado 20–30%                                                                                                  | `pricing`          |

### Etapas e sub-serviços

- **Pré-produção**: briefing/reunião, roteiro, storyboard, decupagem, visita técnica, produção de elenco/locação, documentação (autorizações de uso de imagem).
- **Produção (captação)**: direção, direção de fotografia, operação de câmera, drone, som direto, iluminação, maquiagem, making of.
- **Pós-produção**: edição/montagem, color grading, motion graphics/animação, mixagem e sonorização, trilha, narração/locução, legendas, Libras, versões/cortes para redes, rodadas de revisão.

### Tier de complexidade

| Tier | Exemplos                                       | Uso no cálculo                    |
| ---- | ---------------------------------------------- | --------------------------------- |
| 1    | Conteúdo para redes sociais, produções simples | Horas típicas menores por serviço |
| 2    | Institucional, corporativo, eventos            | Horas típicas intermediárias      |
| 3    | Publicidade, cinema, documentário              | Horas típicas maiores             |

O tier define as **horas sugeridas** de cada sub-serviço (`features/services/constants/catalog.ts`),
não um multiplicador escondido: a complexidade fica visível nas horas, que a pessoa ajusta. Ao
trocar de tier, só mudam as horas que ainda estão no valor padrão.

## Fórmulas (`features/pricing/engine`)

```
# 1. Custo da hora do profissional (Sebrae etapa 1–2 / Forasteiro)
custoFixoMensal   = soma(custosFixos) + proLabore
horasProdutivasMes = diasTrabalhadosMes × horasPorDia
custoHora          = custoFixoMensal ÷ horasProdutivasMes

# 2. Mão de obra direta
maoDeObra = Σ (custoHora × horasDaEtapa)  +  Σ (diária × pessoas × diárias  |  valorHora × pessoas × horas)

# 3. Equipamentos
depreciaçãoAnual  = (valorCompra − valorRevenda) ÷ anosVidaÚtil
custoEquipDiária  = depreciaçãoAnual ÷ diasDeUsoPorAno
custoEquipamentos = Σ (custoEquipDiária × diáriasDeUso) + Σ (locação × diárias)

# 4. Custo unitário do serviço (Sebrae etapa 2)
custoVariável  = deslocamento + alimentação + hospedagem + seguro + outros
custoUnitário  = maoDeObra + custoEquipamentos + custoVariável

# 5. Markup (Sebrae etapa 5) — percentuais sobre o preço de venda
markup = 100 ÷ [100 − (DV% + DF% + LP%)]
   DV = despesas variáveis sobre a venda (impostos, taxas de pagamento, comissão)
   DF = 0 — os custos fixos já entram pelo custo da hora (evita cobrar duas vezes)
   LP = lucro pretendido

# 6. Preço de venda (Sebrae etapa 7)
preçoVenda = custoUnitário × markup

# Equivalência com o "gross up" de impostos (Forasteiro):
#   preço = custo ÷ (1 − alíquota)  ≡  markup quando DF = LP = 0
```

Validação obrigatória: `DV + DF + LP < 100%` (caso contrário o markup é indefinido/negativo).

Regras adicionais do motor:

- **Diárias** = horas da etapa ÷ horas por dia, arredondadas para cima.
- **Viagens** = 1 se houver hospedagem, senão uma por diária de gravação (editável).
- **Alimentação e hospedagem** multiplicam pelas pessoas no set (você + equipe da gravação).
- **Arredondamento**: o preço sobe para o múltiplo escolhido; a diferença vira lucro, e a
  composição sempre fecha exatamente no preço.
- **Por etapa** (proposta): o preço é rateado proporcionalmente ao custo de cada etapa; a
  logística entra na gravação.

## Saídas

- **Breakdown** por grupo (mão de obra, equipe, equipamentos, variáveis, impostos, lucro) e por etapa.
- **Margem de contribuição**: `preço − (custo dos serviços + despesas variáveis)`.
- **Preço mínimo** (lucro 0%) × **preço sugerido**, para apoiar a negociação sem prejuízo.
- Proposta exportável com a justificativa de cada item.
