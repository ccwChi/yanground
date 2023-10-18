// theme.js
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
	palette: {
		primary: {
			main: "#547db7",
		},
		secondary: {
			main: "#6c757d",
		},
		success: {
			main: "#039e8e",
		},
	},
	typography: {
		fontFamily:
			'"Noto Sans SC", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", Arial, sans-serif, Helvetica, monospace',
	},
	components: {
		MuiTabs: {
			styleOverrides: {
				indicator: {
					backgroundColor: "#F7941D",
				},
				root: {
					"& .MuiTabs-scrollButtons": {
						width: "24px",
					},
				},
			},
		},
		MuiTab: {
			styleOverrides: {
				root: {
					color: "#273057",
					fontSize: "16px",
					fontWeight: "bold",
					padding: "12px 24px",
					"&.Mui-selected": {
						color: "#273057",
					},
				},
			},
		},
	},
});

export default theme;
