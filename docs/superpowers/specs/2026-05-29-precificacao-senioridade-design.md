# Precificação por Senioridade + Remoção de UI de Equipe

**Data:** 2026-05-29
**Status:** Aprovado (aguardando review do spec)

## Problema

A precificação atual é função pura de `horas × valor/hora`. Como um dev mais
experiente (pleno/sênior) entrega o mesmo projeto em menos horas, ele acaba
**faturando menos** pela mesma entrega:

```
Junior:  12h × R$100 = R$1.200
Senior:   4h × R$100 = R$  400   ← senioridade é punida
```

O `getHours()` agrava o furo numa segunda dimensão (especialização): corta horas
cobradas quando o perfil "combina" (`landing_page` faz landing em `0.8×`) e
aumenta quando não combina (`backend` faz frontend em `1.2×`), ou seja, cobra
mais do cliente justamente quando o dev é pior naquilo.

A raiz é filosófica: cobra-se **tempo**, mas o cliente compra **entrega/valor**.

## Decisões tomadas

- **Modelo:** rate por hora com **multiplicador de senioridade** (não horas fixas,
  não preço fixo por módulo).
- **Multiplicadores:** `junior 1.0×` (+0%), `pleno 1.5×` (+50%), `senior 2.0×` (+100%).
- **Horas do orçamento não mudam** por senioridade — só o valor/hora sobe.
- **Senioridade por organização** (single value), configurada no onboarding. Cenário
  multi-dev (software house) fica fora de escopo por ora (YAGNI).
- **Equipe:** remover apenas a **UI** (opção `b`); manter billing/infra intactos.

### Nota econômica importante

`calcHourlyRate` já parte do `desiredSalary`, então o piso de custo já reflete
quanto o dev quer ganhar. O multiplicador de senioridade **não é recuperação de
custo** — é um **prêmio de posicionamento de mercado** acima desse piso. O piso
cobre a sobrevivência; o multiplicador é o quanto a senioridade vale a mais.

## Parte A — Precificação por senioridade

### A1. Tipo e tabela de multiplicadores

Novo eixo `SeniorityLevel = 'junior' | 'pleno' | 'senior'`, independente do
`developerProfile` (que é **especialização**, não senioridade).

```ts
const SENIORITY_MULTIPLIER: Record<SeniorityLevel, number> = {
  junior: 1.0,
  pleno: 1.5,
  senior: 2.0,
}
```

Local sugerido: helper compartilhado (ex: `src/lib/pricing.ts`) com
`levelMultiplier(level)` e, idealmente, uma única função `calcHourlyRate` que
hoje está **duplicada** (em `orcamentos/novo/page.tsx` e inline no
`onboarding/page.tsx` como `calc`). Centralizar evita divergência.

### A2. Aplicação no rate sugerido

```
suggestedHourlyRate = calcHourlyRate(answers) × levelMultiplier(seniorityLevel)
```

Aplicar em:
- `src/app/(auth)/dashboard/orcamentos/novo/page.tsx` → `calcHourlyRate`
- `src/app/(auth)/onboarding/page.tsx` → o `useMemo calc` (prévia "Seu Valor Hora")
  deve refletir o multiplicador em tempo real.

As horas lançadas no orçamento permanecem as `baseHours` da feature. O
`hourlyRate` no editor continua editável manualmente.

### A3. Configuração no onboarding (Passo 03 — Calibragem)

- Adicionar seletor Júnior / Pleno / Sênior no Passo 03.
- Atualiza a prévia "Seu Valor Hora" em tempo real (rate base × multiplicador),
  mostrando o multiplicador aplicado.
- Persistência: gravar em `answers.seniorityLevel`. O `complete-onboarding.ts`
  já serializa `data.answers` inteiro em `org.metadata` (linhas 116-122), então
  basta incluir o campo no objeto `answers` do form e no schema.
- Default: `junior` (1.0×) — comportamento idêntico ao atual para quem não escolher.

### A4. Neutralizar `getHours`

Em `src/hooks/useDevProfile.ts`, `getHours()` deve retornar a hora-base pura da
feature, **sem** os fatores `0.8× / 1.2× / 1.3×` por especialização. Mantém a
extração robusta do `baseHours` (Decimal/number/string) e o fallback para
`horasEstimadas`. `isRelevant()` pode permanecer.

## Parte B — Remoção da UI de "Equipe" (opção `b`)

### Remover (produto/UI)

- **Onboarding** (`onboarding/page.tsx` + `_schemas/onboarding-schema.ts`):
  - Perfil `software_house` (card do Passo 2 e enum `profile`).
  - Card do plano "Equipe" no Passo 4.
  - Campos legados `invites` e `teamSize`.
- **`src/components/pricing.tsx`** (landing pública): card "Equipe".
- **`SettingsClient.tsx`**: card de upgrade "Equipe".
- **`ProfileSelector.tsx`** e mapas `_profileInfo` / `_recommendedCategories` no
  `quote-editor-client.tsx`: entrada `software_house`.

### Manter intocado (infra — remover quebraria auth/billing)

- Models `Member` e `Invitation`; multi-tenancy do Better-Auth; lib `permissions`.
  Cada org continua com 1 membro (o dono).
- Tipo `Plan`, `PLAN_LIMITS.equipe`, `maxMembers`, checkout
  (`complete-onboarding.ts` e `create-checkout.ts`) — backend de billing fica como
  está (código de "equipe" segue existindo, só não há entrada pela UI).
- Dashboard do **owner** (analytics): mantém label "Equipe" para não quebrar
  relatórios de assinaturas legadas.

## Fora de escopo

- Senioridade por orçamento ou por membro (multi-dev / software house).
- Remoção do plano "Equipe" do billing.
- Redesenho da fórmula de custo (`calcHourlyRate`) além da centralização.

## Verificação

- Onboarding: trocar o nível recalcula a prévia "Seu Valor Hora" (`base × mult`).
- Novo orçamento: `suggestedHourlyRate` reflete o nível salvo; horas das features
  inalteradas; total = `Σ(baseHours × suggestedHourlyRate)`.
- `getHours` retorna `baseHours` puro para todos os perfis/categorias.
- "Equipe" e `software_house` não aparecem em onboarding, pricing público nem
  settings; billing/owner seguem funcionando.
- `pnpm build` / typecheck sem erros (enum `profile` e schema atualizados de forma
  consistente em todos os usos).
