import { createTheme } from "@mui/material/styles";

const theme = createTheme({
	palette: {
		primary: {
			main: "#547db7",
		},
		secondary: {
			main: "#6c757d",
		},
	},
	typography: {
		fontFamily:
			'"Noto Sans SC", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", Arial, sans-serif, Helvetica, monospace',
	},
});

export default theme;
