module.exports = {
	// prefix: "tw-",
	content: ["./src/**/*.{js,jsx,ts,tsx}"],
	theme: {
		extend: {
			spacing: {
				13: "3.125rem",
			},
			fontSize: {
				"1xl": "1.375rem",
			},
			minWidth: {
				screen: "100vw",
			},
			colors: {
				text: "#1f1f21",
				primary: {
					50: "#547db7",
					100: "#436799",
					500: "#394c7f",
					800: "#273057",
					900: "#11374A",
				},
				secondary: {
					50: "#039E8E",
				},
				tertiary: {
					50: "#F7941D",
				},
				quaternary: {
					50: "#6262a7",
				},
			},
			screens: {
				sm: "576px",
			},
		},
	},
	plugins: [],
};
