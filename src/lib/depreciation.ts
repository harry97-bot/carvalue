/**
 * CARVALUE 자체 잔존가치(감가) 모델 v1
 * 공식 시세 API 부재 → 연식·주행거리·신차가 기반 자체 추정. 추정치는 ±범위로 정직 표기.
 */
export const CURRENT_YEAR = 2026;
const ANNUAL_KM = 15000;

const RETENTION_BY_AGE = [1.0, 0.8, 0.7, 0.62, 0.55, 0.49];

function ageRetention(age: number): number {
  if (age <= 0) return RETENTION_BY_AGE[0];
  if (age < RETENTION_BY_AGE.length) return RETENTION_BY_AGE[age];
  const last = RETENTION_BY_AGE[RETENTION_BY_AGE.length - 1];
  return last * Math.pow(0.89, age - (RETENTION_BY_AGE.length - 1));
}

function mileageFactor(mileage: number, age: number): number {
  const expected = Math.max(age, 0.5) * ANNUAL_KM;
  const adj = -((mileage - expected) / 10000) * 0.018;
  return Math.min(1.15, Math.max(0.75, 1 + adj));
}

export interface ValuationResult {
  estimate: number;
  low: number;
  high: number;
  age: number;
  retentionPct: number;
  depMin: number;
  depMax: number;
}

export function estimateValue(newPrice: number, year: number, mileage: number): ValuationResult {
  const age = Math.max(0, CURRENT_YEAR - year);
  const retention = ageRetention(age);
  const base = newPrice * retention * mileageFactor(mileage, age);
  const estimate = Math.max(0, Math.round(base));
  const low = Math.round(estimate * 0.92);
  const high = Math.round(estimate * 1.08);
  return {
    estimate,
    low,
    high,
    age,
    retentionPct: Math.round(retention * 100),
    depMin: Math.round((1 - high / newPrice) * 100),
    depMax: Math.round((1 - low / newPrice) * 100),
  };
}
