/**
 * Precificação por senioridade.
 *
 * O valor/hora final é o piso de custo (calcBaseHourlyRate, derivado de
 * salário + custos fixos ajustados por imposto/margem) multiplicado por um
 * prêmio de senioridade. O piso cobre a sobrevivência; o multiplicador é o
 * quanto a senioridade vale a mais no mercado.
 */

export type SeniorityLevel = 'junior' | 'pleno' | 'senior'

export const SENIORITY_MULTIPLIER: Record<SeniorityLevel, number> = {
  junior: 1.0,
  pleno: 1.5,
  senior: 2.0,
}

export const SENIORITY_LABELS: Record<SeniorityLevel, string> = {
  junior: 'Júnior',
  pleno: 'Pleno',
  senior: 'Sênior',
}

/** Multiplicador do nível. Default `junior` (1.0×) para valores ausentes/inválidos. */
export function levelMultiplier(level?: string | null): number {
  if (level && level in SENIORITY_MULTIPLIER) {
    return SENIORITY_MULTIPLIER[level as SeniorityLevel]
  }
  return SENIORITY_MULTIPLIER.junior
}

/** Piso de custo (não arredondado), antes do prêmio de senioridade. */
export function calcBaseHourlyRate(
  answers: Record<string, string | undefined>,
): number {
  const desiredSalary = Number(answers.desiredSalary) || 0
  const fixedCosts = Number(answers.fixedCosts) || 0
  const taxPercentage = Number(answers.taxPercentage) || 0
  const profitMargin = Number(answers.profitMargin) || 0
  const workHoursDay = Number(answers.workHoursDay) || 0
  const workDaysMonth = Number(answers.workDaysMonth) || 22

  const deductions = (taxPercentage + profitMargin) / 100
  const adjustmentFactor = deductions < 1 ? 1 - deductions : 0.01
  const monthlyGoal = (desiredSalary + fixedCosts) / adjustmentFactor
  const hoursPerMonth = workHoursDay * workDaysMonth

  return hoursPerMonth > 0 ? monthlyGoal / hoursPerMonth : 0
}

/** Valor/hora sugerido final: piso de custo × multiplicador de senioridade. */
export function calcHourlyRate(
  answers: Record<string, string | undefined>,
  level?: string | null,
): number {
  return Math.ceil(calcBaseHourlyRate(answers) * levelMultiplier(level))
}
