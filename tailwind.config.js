/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: '#112D4E',
        accent: '#FF7A30',
        accentHover: '#E86920',
        background: '#F8FAFC',
        surface: '#FFFFFF',
        textPrimary: '#1E293B',
        textSecondary: '#64748B',
        textMuted: '#94A3B8',
        border: '#E2E8F0',
        success: '#22C55E',
        warning: '#F59E0B',
        danger: '#EF4444',
        star: '#FBBF24',
      },
    },
  },
  plugins: [],
}
