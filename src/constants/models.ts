export const GEMINI_MODELS = {
  FLASH: 'gemini-2.0-flash',
  PRO: 'gemini-2.5-pro',
} as const

export const DEFAULT_MODEL = GEMINI_MODELS.FLASH

export const VALID_MODELS = Object.values(GEMINI_MODELS)

export const LEGACY_MODELS = ['gemini-pro', 'gemini-1.5-flash', 'gemini-3.6-flash'] as const
