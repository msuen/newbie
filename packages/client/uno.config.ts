import { defineConfig, presetMini } from 'unocss'

export default defineConfig({
  presets: [presetMini()],
  theme: {
    colors: {
      primary: '#6366f1',
      'primary-dark': '#4f46e5',
      surface: '#1e1e2e',
      'surface-light': '#2a2a3e',
      accent: '#f59e0b',
    },
  },
})
