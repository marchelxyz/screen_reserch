import { sanitizeForAiInput } from "@/lib/ai/sanitizeForAi";
import type { Step4Data } from "@/store/useFormStore";

/**
 * Собирает краткий обезличенный контекст для LLM (шаг 4 + имя профиля).
 */
export function buildKotConclusionContext(
  profileName: string,
  step4: Step4Data
): string {
  const name = sanitizeForAiInput(profileName, 80);
  const city = sanitizeForAiInput(step4.city, 80);
  const family = sanitizeForAiInput(step4.familyStatus, 80);
  const children = sanitizeForAiInput(step4.children, 80);
  const education = sanitizeForAiInput(step4.education, 120);
  const book = sanitizeForAiInput(step4.favoriteBook, 120);
  const film = sanitizeForAiInput(step4.favoriteFilm, 120);
  return [
    `Имя_профиля: ${name}`,
    `Город: ${city}`,
    `Семейное_положение: ${family}`,
    `Дети: ${children}`,
    `Образование: ${education}`,
    `Книга: ${book}`,
    `Фильм: ${film}`,
  ].join("\n");
}
