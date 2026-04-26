/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {

        fontSize: {
            'sm': '12px',
            'base': '14px',
            'xl': '16px',
            '2xl': '20px',
            '3xl': '28px',
            '4xl': '38px',
            '5xl': '50px',
        },

        extend: {
            fontFamily: {
              inter: ["'Inter'", "sans-serif"],
              gelasio: ["'Gelasio'", "serif"]
            },
            colors: {
                white:       'rgb(var(--c-white) / <alpha-value>)',
                black:       'rgb(var(--c-black) / <alpha-value>)',
                grey:        'rgb(var(--c-grey) / <alpha-value>)',
                'dark-grey': 'rgb(var(--c-dark-grey) / <alpha-value>)',
                red:         'rgb(var(--c-red) / <alpha-value>)',
                twitter:     'rgb(var(--c-twitter) / <alpha-value>)',
                brand:       'rgb(var(--c-brand) / <alpha-value>)',
                transparent: 'transparent',
            },
        },

    },
    plugins: [],
};