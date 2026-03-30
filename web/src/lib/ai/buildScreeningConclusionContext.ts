import { buildKotConclusionContext } from "@/lib/ai/buildKotConclusionContext";
import { sanitizeForAiInput } from "@/lib/ai/sanitizeForAi";
import {
  computeGerchikovMotivationScores,
  summarizeGerchikovMotivationForAi,
} from "@/lib/gerchikov/gerchikovMotivationProfile";
import type { GerchikovStep2Data } from "@/lib/gerchikov/step2Types";
import {
  computeStep3MeanScore,
  describeStep3MeanLevel,
} from "@/lib/step3/step3LikertScore";
import type { Step3Data, Step4Data } from "@/store/useFormStore";

/**
 * Собирает JSON-подобный текст для LLM: КОТ (числа), Герчиков (мотивация), шаг 3 (эмоц. фон), профиль (шаг 4).
 */
export function buildScreeningConclusionContext(input: {
  rawScore: number;
  maxScore: number;
  kotOfficialIq: number;
  iqNormNote: string;
  profileName: string;
  step2: GerchikovStep2Data;
  step3: Step3Data;
  step4: Step4Data;
}): string {
  const profileBlock = buildKotConclusionContext(input.profileName, input.step4);
  const mot = computeGerchikovMotivationScores(input.step2);
  const motLine = summarizeGerchikovMotivationForAi(mot);
  const motJson = JSON.stringify(mot);
  const mean3 = computeStep3MeanScore(input.step3);
  const step3Line = `Средний_балл_шкалы_Ликерта_шаг3: ${String(mean3)} (1-5). ${describeStep3MeanLevel(mean3)}`;

  const kotBlock = [
    `КОТ_сырой_балл: ${String(input.rawScore)} из ${String(input.maxScore)}`,
    `КОТ_IQ_по_таблице_норм: ${String(input.kotOfficialIq)}`,
    `КОТ_примечание_к_нормам: ${sanitizeForAiInput(input.iqNormNote, 400)}`,
  ].join("\n");

  return [
    kotBlock,
    "",
    `Герчиков_мотивация_профиль_JSON: ${motJson}`,
    motLine,
    "",
    step3Line,
    "",
    "Профиль_и_анкета:",
    profileBlock,
  ].join("\n");
}
