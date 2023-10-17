module.exports = {
	// prefix: "tw-",
	content: ["./src/**/*.{js,jsx,ts,tsx}"],
	theme: {
		extend: {
			fontFamily: {
				// font-notoSerif
				notoSerif: ['"Noto Serif SC"', "cursive"],
			},
			spacing: {
				15: "3.75rem",
				26: "6.5rem",
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
			},
		},
	},
	plugins: [],
};
