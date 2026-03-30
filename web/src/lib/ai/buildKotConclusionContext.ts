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
  const hobby = sanitizeForAiInput(step4.hobby, 120);
  const music = sanitizeForAiInput(step4.favoriteMusic, 120);
  const leisure = sanitizeForAiInput(step4.leisureTime, 120);
  const motto = sanitizeForAiInput(step4.lifeMotto, 120);
  return [
    `Имя_профиля: ${name}`,
    `Город: ${city}`,
    `Семейное_положение: ${family}`,
    `Дети: ${children}`,
    `Образование: ${education}`,
    `Книга: ${book}`,
    `Фильм: ${film}`,
    `Хобби: ${hobby}`,
    `Музыка: ${music}`,
    `Свободное_время: ${leisure}`,
    `Девиз_цитата: ${motto}`,
  ].join("\n");
}
