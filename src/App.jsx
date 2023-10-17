import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "./components/Layout/Header";
import Sidebar from "./components/Layout/Sidebar";
import Tabbar from "./components/Tabbar/Tabbar";
import { faUserGear, faHelmetSafety, faToolbox, faVest, faPersonDigging } from "@fortawesome/free-solid-svg-icons";
import { ThemeProvider } from '@mui/material/styles';
import theme from './utils/theme';
import cx from "classnames";
import "./app.scss";

const App = () => {
	const [showSidebar, setShowSidebar] = useState(false);

	const menuItems = [
		{
			icon: faHelmetSafety,
			text: "案場",
			href: "sites",
		},
		{
			icon: faVest,
			text: "工程部",
			href: "constructionType",
		},
		{
			icon: faUserGear,
			text: "人事部",
			href: "users",
		},
		{
			icon: faToolbox,
			text: "業務部",
			href: "#",
			subMenuItems: [
				{ text: "專案管理", href: "project" },
				{ text: "派工清單", href: "dispatchPrint" },
			],
		},
		{
			icon: faPersonDigging,
			text: "範例",
			href: "#",
			subMenuItems: [
				{ text: "403", href: "forbidden" },
				{ text: "登出(暫放)", href: "logout" },
			],
		},
	];

	const toggleSidebar = () => {
		setShowSidebar(!showSidebar);
	};
	const closeSidebar = () => {
		setShowSidebar(false);
	};

	return (
		<ThemeProvider theme={theme}>
			<div className="flex justify-end overflow-x-hidden">
				<div className="relative flex flex-col w-screen min-w-screen">
					{/* Header */}
					<Header toggleSidebar={toggleSidebar} />

					{/* Main Content */}
					<div className="lg:container w-full mx-auto px-0 sm:px-4 flex-1 overflow-hidden py-0 sm:py-4 lg:py-6">
						<div className="flex flex-col main_wrapper bg-white h-full float-right sm:rounded-lg pt-4 pb-26 sm:pb-4 overflow-hidden">
							<Outlet />
						</div>
					</div>

					{/* overlay */}
					<div className={cx("bg_overlay", { open: showSidebar })} onClick={closeSidebar}></div>
				</div>

				{/* SideBar */}
				<div
					className={cx(
						"lg:absolute static lg:container mx-auto sidebar_wrapper pointer-events-none lg:bg-transparent bg-white py-4 lg:py-6",
						{ hide: !showSidebar }
					)}>
					<div className={"flex flex-col overflow-y-auto pointer-events-auto lg:max-w-none max-w-sm"}>
						<Sidebar menuItems={menuItems} closeSidebar={closeSidebar} />
					</div>
				</div>

				{/* Tabbar */}
				<div className="sm:hidden">
					<Tabbar />
				</div>
			</div>
		</ThemeProvider>
	);
};

export default App;
