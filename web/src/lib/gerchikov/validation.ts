import type { GerchikovStep2Data } from "@/lib/gerchikov/step2Types";

function isMulti12Valid(ids: string[]): boolean {
  return ids.length >= 1 && ids.length <= 2;
}

/**
 * Проверка заполненности шага 2 по правилам опросника (1–2 ответа, один ответ и т.д.).
 */
export function isGerchikovStep2Complete(data: GerchikovStep2Data): boolean {
  if (!isMulti12Valid(data.q1)) {
    return false;
  }
  if (data.q2 === null) {
    return false;
  }
  if (!isMulti12Valid(data.q3) || !isMulti12Valid(data.q4) || !isMulti12Valid(data.q5)) {
    return false;
  }
  const incomeKeys: Array<keyof GerchikovStep2Data> = [
    "q6",
    "q7",
    "q8",
    "q9",
    "q10",
    "q11",
    "q12",
    "q13",
    "q14",
  ];
  for (const key of incomeKeys) {
    if (data[key] === null) {
      return false;
    }
  }
  if (data.q15 === null) {
    return false;
  }
  if (
    !isMulti12Valid(data.q16) ||
    !isMulti12Valid(data.q17) ||
    !isMulti12Valid(data.q18) ||
    !isMulti12Valid(data.q19) ||
    !isMulti12Valid(data.q20)
  ) {
    return false;
  }
  if (data.q21.length < 1) {
    return false;
  }
  if (data.isLeader === null) {
    return false;
  }
  if (data.isLeader) {
    return isMulti12Valid(data.q22);
  }
  return isMulti12Valid(data.q23);
}

/**
 * Число «закрытых» пунктов для прогресс-бара (макс. 23 на шаге 2).
 */
export function getGerchikovStep2AnsweredCount(data: GerchikovStep2Data): number {
  let n = 0;
  if (isMulti12Valid(data.q1)) {
    n += 1;
  }
  if (data.q2 !== null) {
    n += 1;
  }
  if (isMulti12Valid(data.q3)) {
    n += 1;
  }
  if (isMulti12Valid(data.q4)) {
    n += 1;
  }
  if (isMulti12Valid(data.q5)) {
    n += 1;
  }
  for (const key of ["q6", "q7", "q8", "q9", "q10", "q11", "q12", "q13", "q14"] as const) {
    if (data[key] !== null) {
      n += 1;
    }
  }
  if (data.q15 !== null) {
    n += 1;
  }
  if (isMulti12Valid(data.q16)) {
    n += 1;
  }
  if (isMulti12Valid(data.q17)) {
    n += 1;
  }
  if (isMulti12Valid(data.q18)) {
    n += 1;
  }
  if (isMulti12Valid(data.q19)) {
    n += 1;
  }
  if (isMulti12Valid(data.q20)) {
    n += 1;
  }
  if (data.q21.length >= 1) {
    n += 1;
  }
  if (data.isLeader !== null) {
    n += 1;
  }
  if (data.isLeader === true && isMulti12Valid(data.q22)) {
    n += 1;
  }
  if (data.isLeader === false && isMulti12Valid(data.q23)) {
    n += 1;
  }
  return n;
}
