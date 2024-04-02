import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App";
import Home from "./pages/Home/Home";
// For Trash
import Sites from "./pages/Sites/Sites";
// Fundation Data
import ConstructionTypes from "./pages/Construction/ConstructionTypes";
import ConstructionType from "./pages/Construction/Types/ConstructionType";
import ConstructionJob from "./pages/Construction/Jobs/ConstructionJob";
import JobTitleManagement from "./pages/JobTitleManagement/JobTitleManagement";
// Task Manager
import ConstructionSummary from "./pages/ConstructionSummary/ConstructionSummary";
import DispatchCalendar from "./pages/DispatchCalendar/DispatchCalendar";
import Maps from "./pages/Project/Maps";
// Project Manager
import Project from "./pages/Project/Project";
import ProjectDocumentsManagement from "./pages/Project/Documents/Documents";
import DispatchList from "./pages/DispatchList/DispatchList";
// 人事管理系統
import Users from "./pages/Users/Users";
import AttendanceCalendar from "./pages/AttendanceCalendar/AttendanceCalendar";
import AttendanceView from "./pages/AttendanceView/AttendanceView";
import AttendanceWaiverHRM from "./pages/AttendanceWaiverHRM/AttendanceWaiverHRM";
import WorkCalendar from "./pages/WorkCalendar/WorkCalendar";
import AttendanceReport from "./pages/AttendanceReport/AttendanceReport";
// Member Cencer
import Punch from "./pages/Punch/Punch";
import UserInfo from "./pages/UserInfo/UserInfo";
import UserLeave from "./pages/UserLeave/UserLeave";
import ClientQuestionnaire from "./pages/Client/ClientQuestionnaire";
import EducationTrainging from "./pages/EducationTraining/EducationTraining";
import MDWorkspace from "./pages/MDWorkspace/MDWorkspace";
// Supervisor Zone
import SupervisorApproval from "./pages/SupervisorApproval/SupervisorApproval";
import SupervisorArrangeLeave from "./pages/SupervisorArrangeLeave/SupervisorArrangeLeave";
// Error
import ErrorMessage from "./pages/Error/ErrorMessage";
import ErrorPages from "./pages/Error/ErrorPages";
import Error from "./pages/Error/Error";
import Explotion from "./pages/Error/Explotion";
// Custom
import reportWebVitals from "./test/reportWebVitals";
import "./assets/styles/tailwindcss.sass";
import "./index.scss";
import "react-markdown-editor-lite/lib/index.css";
import HRArrangeLeave from "./pages/HRArrangeLeave/HRArrangeLeave";
import JobTitleManagementTree from "./pages/JobTitleManagement/JobTitleManagementTree";

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
			// For Trash
			{
				path: "/sites",
				element: <Sites />,
			},
			// Fundation Data
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
				path: "/jobtitlemanagement",
				element: <JobTitleManagement />,
			},
			{
				path: "/jobtitlemanagementtree",
				element: <JobTitleManagementTree />,
			},
			// Task Manager
			{
				path: "/constructionsummary",
				element: <ConstructionSummary />,
			},
			{
				path: "/maps",
				element: <Maps />,
			},
			// Project Manager
			{
				path: "/project",
				element: <Project />,
			},
			{
				path: "/project/documents",
				element: <ProjectDocumentsManagement />,
			},
			{
				path: "/dispatchList",
				element: <DispatchList />,
			},
			// 人事管理系統
			{
				path: "/users",
				element: <Users />,
			},
			{
				path: "/attendancecalendar",
				element: <AttendanceCalendar />,
			},
			{
				path: "/attendanceview",
				element: <AttendanceView />,
			},
			{
				path: "/attendancewaiverhrm",
				element: <AttendanceWaiverHRM />,
			},
			{
				path: "/workcalendar",
				element: <WorkCalendar />,
			},
			{
				path: "/attendancereport",
				element: <AttendanceReport />,
			},
			{
				path: "/hrarrangeleave",
				element: <HRArrangeLeave />,
			},
			// Member Cencer
			{
				path: "/punch",
				element: <Punch />,
			},
			{
				path: "/userInfo",
				element: <UserInfo />,
			},
			{
				path: "/userleave",
				element: <UserLeave />,
			},
			{
				path: "/mdworkspace",
				element: <MDWorkspace />,
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
			// Supervisor Zone
			{
				path: "/supervisorarrangeleave",
				element: <SupervisorArrangeLeave />,
			},
			{
				path: "/supervisorapproval",
				element: <SupervisorApproval />,
			},
			// Error
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
			}
		],
	},
]);

ReactDOM.createRoot(document.getElementById("root")).render(
	// <React.StrictMode>
	<RouterProvider router={router} />
	// </React.StrictMode>
);

reportWebVitals();
