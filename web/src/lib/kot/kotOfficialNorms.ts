/**
 * Таблица перевода сырого балла (0…30) в IQ по методике КОТ для сокращённой батареи из 30 заданий.
 *
 * **Важно:** значения ниже соответствуют прежней линейной шкале (70–130) и служат рабочей заглушкой до
 * внесения официальных норм из вашего лицензионного издания методики. Замените массив целиком на таблицу
 * из методички издательства; индекс `i` — сырой балл, `KOT_OFFICIAL_IQ_BY_RAW_SCORE[i]` — IQ.
 */
export const KOT_OFFICIAL_IQ_BY_RAW_SCORE: readonly number[] = ((): number[] => {
  const out: number[] = [];
  for (let i = 0; i <= 30; i += 1) {
    out.push(Math.round(70 + (i / 30) * 60));
  }
  return out;
})();

export const KOT_OFFICIAL_NORM_NOTE =
  "Интерпретация IQ по таблице норм для сокращённой батареи КОТ (30 заданий). Таблица задаётся в `kotOfficialNorms.ts` и должна соответствовать лицензионной методичке; до замены на официальные нормы из издания значения эквивалентны прежней линейной шкале 70–130.";

/**
 * Возвращает IQ по таблице норм для сырого балла КОТ (0…maxRaw).
 */
export function lookupKotOfficialIq(rawScore: number, maxRaw: number): number {
  const clamped = Math.max(0, Math.min(maxRaw, Math.round(rawScore)));
  const row = KOT_OFFICIAL_IQ_BY_RAW_SCORE[clamped];
  if (row === undefined) {
    return KOT_OFFICIAL_IQ_BY_RAW_SCORE[KOT_OFFICIAL_IQ_BY_RAW_SCORE.length - 1] ?? 100;
  }
  return row;
}
