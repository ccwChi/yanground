import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App";
import Home from "./pages/Home/Home";
import Sites from "./pages/Sites/Sites";
import ConstructionTypes from "./pages/Construction/ConstructionTypes";
import ConstructionType from "./pages/Construction/Types/ConstructionType";
import ConstructionJob from "./pages/Construction/Jobs/ConstructionJob";
import Punch from "./pages/Punch/Punch";
import UserInfo from "./pages/UserInfo/UserInfo";
import ErrorMessage from "./pages/Error/ErrorMessage";
import ErrorPages from "./pages/Error/ErrorPages";
import Forbidden from "./pages/Error/Forbidden";
import Unauthorized from "./pages/Error/Unauthorized";
import reportWebVitals from "./test/reportWebVitals";
import "./assets/styles/tailwindcss.sass";
import "./index.scss";
import Users from "./pages/HumanResources/Users";

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
				path: "/constructiontypes",
				element: <ConstructionTypes />,
			},
			{
				path: "/constructiontypes/:type",
				element: <ConstructionType />,
			},
			{
				path: "/constructiontypes/:type/:job",
				element: <ConstructionJob />,
			},
			{
				path: "/users",
				element: <Users />,
			},
			{
				path: "/punch",
				element: <Punch />,
			},
			{
				path: "/userInfo",
				element: <UserInfo />,
			},
			{
				path: "/forbidden",
				element: <Forbidden />,
			},
			{
				path: "/unauthorized",
				element: <Unauthorized />,
			},
			{
				path: "/404",
				element: <ErrorPages />,
			},
			{
				path: "*",
				element: <ErrorPages />,
			},
		],
	},
]);

ReactDOM.createRoot(document.getElementById("root")).render(
	// <React.StrictMode>
	<RouterProvider router={router} />
	// </React.StrictMode>
);

reportWebVitals();
