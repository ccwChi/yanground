import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App";
import Home from "./pages/Home/Home";
import Sites from "./pages/Sites/Sites";
import ErrorMessage from "./pages/Error/ErrorMessage";
import ErrorPages from "./pages/Error/ErrorPages";
import reportWebVitals from "./test/reportWebVitals";
import "./assets/styles/tailwindcss.sass";
import "./index.scss";

const router = createBrowserRouter([
	{
		path: "/",
		element: <App />,
		errorElement: <ErrorMessage />,
		children: [
			{
				index: true,
				element: <Home />,
			},
			{
				path: "/sites",
				element: <Sites />,
			},
			{
				path: "*",
				element: <ErrorPages />,
			},
		],
	},
]);

ReactDOM.createRoot(document.getElementById("root")).render(
	<React.StrictMode>
		<RouterProvider router={router} />
	</React.StrictMode>
);

reportWebVitals();
