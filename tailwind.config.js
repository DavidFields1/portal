/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: 'class', // <--- ¡Esto es lo importante!
	content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
	theme: {
		extend: {},
	},
	plugins: [],
}
