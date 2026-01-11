import type { Config } from 'tailwindcss'

const config: Config = {
    content: [
        './app/**/*.{js,ts,jsx,tsx,mdx}',
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                background: 'var(--background)',
                'background-main': 'var(--background-main)',
                foreground: 'var(--foreground)',
                light: 'var(--light)',
            },
            fontFamily: {
                roboto: 'var(--font-roboto)',
            },
        },
    },
    plugins: [],
}

export default config
