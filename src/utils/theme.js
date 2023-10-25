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
		dark: {
			main: "#1F1F21",
		},
		group1: {
			main: "#C6A570",
			contrastText: "#fff",
		},
		group2: {
			main: "#4D9697",
			contrastText: "#fff",
		},
		group3: {
			main: "#85B082",
			contrastText: "#fff",
		},
		group4: {
			main: "#949494",
			contrastText: "#fff",
		},
		group5: {
			main: "#343434",
			contrastText: "#fff",
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
					backgroundColor: "#FFFFFF",
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
		MuiListItem: {
			styleOverrides: {
				root: {
					backgroundColor: "white",
					"&:hover": {
						backgroundColor: "#f0f0f0",
					},
				},
			},
		},
		MuiListItemText: {
			styleOverrides: {
				primary: {
					fontSize: "0.75rem",
				},
				secondary: {
					fontSize: "1rem",
					overflowWrap: "break-word",
				},
			},
		},
		MuiAccordion: {
			styleOverrides: { root: { "&:before": { content: "none" } } },
		},
		MuiAccordionSummary: {
			styleOverrides: {
				content: {
					margin: "8px 0",
					"&.Mui-expanded": {
						margin: "8px 0",
					},
				},
			},
		},
	},
});

export default theme;
