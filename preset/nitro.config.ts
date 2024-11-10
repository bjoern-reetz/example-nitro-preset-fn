import { fileURLToPath } from 'node:url'
import type { NitroPreset } from 'nitropack'

export default {
  entry: fileURLToPath(new URL('./runtime.ts', import.meta.url)),
} as NitroPreset
