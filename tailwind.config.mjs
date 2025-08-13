/** @type {import('tailwindcss').Config} */
export default {
	content: [
		"./app/**/*.{js,ts,jsx,tsx,mdx}",
		"./components/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
			keyframes: {
				"collapsible-down": {
					from: {
						height: "0",
						opacity: "0",
						transform: "scaleY(0.95)",
					},
					to: {
						height: "var(--radix-collapsible-content-height, auto)",
						opacity: "1",
						transform: "scaleY(1)",
					},
				},
				"collapsible-up": {
					from: {
						height: "var(--radix-collapsible-content-height, auto)",
						opacity: "1",
						transform: "scaleY(1)",
					},
					to: {
						height: "0",
						opacity: "0",
						transform: "scaleY(0.95)",
					},
				},
			},
			animation: {
				"collapsible-down": "collapsible-down 300ms ease-out",
				"collapsible-up": "collapsible-up 300ms ease-out",
			},
		},
	},
	plugins: [],
};
