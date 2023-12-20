import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App";
import Home from "./pages/Home/Home";
import Sites from "./pages/Sites/Sites";
import ConstructionTypes from "./pages/Construction/ConstructionTypes";
import ConstructionType from "./pages/Construction/Types/ConstructionType";
import ConstructionJob from "./pages/Construction/Jobs/ConstructionJob";
import ConstructionSummary from "./pages/ConstructionSummary/ConstructionSummary";
import DispatchCalendar from "./pages/DispatchCalendar/DispatchCalendar";
import Project from "./pages/Project/Project";
import Maps from "./pages/Project/Maps";
import DispatchList from "./pages/DispatchList/DispatchList";
import Users from "./pages/HumanResources/Users";
import UsersAttendanceCalendar from "./pages/HumanResources/AttendanceCalendar";
import Punch from "./pages/Punch/Punch";
import UserInfo from "./pages/UserInfo/UserInfo";
import ErrorMessage from "./pages/Error/ErrorMessage";
import ErrorPages from "./pages/Error/ErrorPages";
import Error from "./pages/Error/Error";
import Explotion from "./pages/Error/Explotion";
import reportWebVitals from "./test/reportWebVitals";
import "./assets/styles/tailwindcss.sass";
import "./index.scss";
import ClientQuestionnaire from "./pages/Client/ClientQuestionnaire";
import EducationTrainging from "./pages/EducationTraining/EducationTraining";

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
				path: "/constructionsummary",
				element: <ConstructionSummary />,
			},
			{
				path: "/project",
				element: <Project />,
			},
			{
				path: "/maps",
				element: <Maps />,
			},
			{
				path: "/dispatchList",
				element: <DispatchList />,
			},
			{
				path: "/users",
				element: <Users />,
			},
			{
				path: "/users/attendance_calendar",
				element: <UsersAttendanceCalendar />,
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
				path: "/dispatchcalendar",
				element: <DispatchCalendar />,
			},
			{
				path: "/educationtraining",
				element: <EducationTrainging />,
			},
			{
				path: "/clientquestionnaire",
				element: <ClientQuestionnaire />,
			},
			{
				path: "/unauthorized",
				element: <Error />,
			},
			{
				path: "/forbidden",
				element: <Error />,
			},
			{
				path: "/internalservererror",
				element: <Error />,
			},
			{
				path: "/OJrqiGtV/H0aAwx3b58FUg==",
				element: <Explotion />,
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
