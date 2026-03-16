import { defineConfig, presetUno } from 'unocss'

export default defineConfig({
  presets: [presetUno()],
  shortcuts: {
    'shell-container': 'mx-auto w-full max-w-[1380px] px-4 md:px-6 xl:px-8',
    'surface-card':
      'relative overflow-hidden rounded-[var(--radius-card)] border border-[var(--line-soft)] bg-[var(--surface-1)] shadow-[var(--shadow-soft)]',
    'surface-card-strong':
      'relative overflow-hidden rounded-[var(--radius-panel)] border border-[var(--line-strong)] bg-[var(--surface-2)] shadow-[var(--shadow-strong)]',
    'section-kicker':
      'inline-flex items-center gap-2 rounded-full border border-[var(--line-soft)] bg-[var(--surface-chip)] px-3 py-1 text-[0.72rem] font-700 uppercase tracking-[0.18em] text-[var(--text-muted)]',
    'field-stack': 'grid gap-3',
    'panel-stack': 'grid gap-4 md:gap-5',
    'button-row': 'flex flex-wrap items-center gap-3',
    'result-list-grid': 'grid gap-3',
    'eyebrow-copy':
      'font-[var(--font-ui)] text-[0.74rem] font-700 uppercase tracking-[0.16em] text-[var(--text-muted)]',
  },
  theme: {
    fontFamily: {
      display:
        '"Noto Serif SC","Songti SC","STSong","Source Han Serif SC",serif',
      sans: '"Noto Sans SC","PingFang SC","Microsoft YaHei",sans-serif',
      ui: '"Outfit Variable","Manrope Variable","Noto Sans SC",sans-serif',
      number: '"Manrope Variable","Noto Sans SC",sans-serif',
    },
  },
})
