export const GEMINI_MODELS = {
  FLASH: 'gemini-2.0-flash',
  PRO: 'gemini-2.5-pro',
  FLASH_LITE: 'gemini-2.5-flash',
} as const

export const MODEL_LABELS: Record<string, string> = {
  [GEMINI_MODELS.FLASH]: 'Gemini 2.0 Flash',
  [GEMINI_MODELS.PRO]: 'Gemini 2.5 Pro',
  [GEMINI_MODELS.FLASH_LITE]: 'Gemini 2.5 Flash',
}

export const DEFAULT_MODEL = GEMINI_MODELS.FLASH

export const VALID_MODELS = Object.values(GEMINI_MODELS)

export const LEGACY_MODELS = ['gemini-pro', 'gemini-1.5-flash', 'gemini-3.6-flash'] as const
