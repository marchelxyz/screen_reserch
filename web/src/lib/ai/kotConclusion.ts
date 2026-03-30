import {
  OPENAI_JSON_RESPONSE_FORMAT,
  OPENAI_SYSTEM_PROMPT_KOT_CONCLUSION,
} from "@/lib/ai/openaiPromptPolicy";

type KotConclusionJson = {
  conclusion: string;
};

/**
 * Запрашивает у OpenAI текст заключения по баллам КОТ и контексту профиля.
 * Возвращает null при отсутствии ключа или ошибке API.
 */
export async function generateKotScreeningConclusion(input: {
  rawScore: number;
  maxScore: number;
  estimatedIq: number;
  iqNormNote: string;
  profileContext: string;
}): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey.length === 0) {
    return null;
  }

  const model = process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";
  const userPayload = {
    rawScore: input.rawScore,
    maxScore: input.maxScore,
    estimatedIq: input.estimatedIq,
    iqNormNote: input.iqNormNote,
    profileContext: input.profileContext,
  };

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.4,
      response_format: OPENAI_JSON_RESPONSE_FORMAT,
      messages: [
        { role: "system", content: OPENAI_SYSTEM_PROMPT_KOT_CONCLUSION },
        {
          role: "user",
          content: JSON.stringify(userPayload),
        },
      ],
    }),
  });

  if (!res.ok) {
    return null;
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const text = data.choices?.[0]?.message?.content;
  if (!text || typeof text !== "string") {
    return null;
  }

  let parsed: KotConclusionJson;
  try {
    parsed = JSON.parse(text) as KotConclusionJson;
  } catch {
    return null;
  }

  if (typeof parsed.conclusion !== "string" || parsed.conclusion.length === 0) {
    return null;
  }

  return parsed.conclusion.slice(0, 12000);
}
