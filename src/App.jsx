import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "./components/Layout/Header";
import Sidebar from "./components/Layout/Sidebar";
import Tabbar from "./components/Tabbar/Tabbar";
import CustomBreadcrumbs from "./components/Breadcrumbs/CustomBreadcrumbs";
import {
	faUserGear,
	faHelmetSafety,
	faToolbox,
	faVest,
	faPersonDigging,
	faFileLines,
	faHouse,
} from "@fortawesome/free-solid-svg-icons";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./utils/theme";
import "./app.scss";
import useLocalStorageValue from "./hooks/useLocalStorageValue";
import { getData } from "./utils/api";
import liff from "@line/liff";
import { SnackbarProvider } from "notistack";
const LINE_ID = process.env.REACT_APP_LINEID;

const App = () => {
	// 設置 RWD 時，SideBar 是否顯示
	const [showSidebar, setShowSidebar] = useState(false);
	const accessToken = useLocalStorageValue("accessToken");

	// SideBar 顯示資料
	// icon => FontAwesome Icon
	// text => Display Text
	// herf => URL
	const menuItems = [
		{ icon: faHouse, text: "主頁", href: "/" },
		{
			icon: faHelmetSafety,
			text: "案場",
			href: "sites",
		},
		{
			icon: faFileLines,
			text: "基礎資料",
			href: "#",
			subMenuItems: [{ text: "工程類別", href: "constructionTypes" }],
		},
		{
			icon: faToolbox,
			text: "工作管理",
			href: "#",
			subMenuItems: [
				{ text: "施工清單", href: "constructionsummary" },
				{ text: "專案管理", href: "project" },
				{ text: "派工清單", href: "dispatchList" },
			],
		},
		{
			icon: faUserGear,
			text: "HRM",
			href: "#",
			subMenuItems: [
				{ text: "人事管理", href: "users" },
				{ text: "帳戶資訊", href: "userinfo" },
			],
		},
		// },
		// {
		//  icon: faVest,
		// 	icon: faPersonDigging,
		// 	text: "範例",
		// 	href: "#",
		// 	subMenuItems: [
		// 		{ text: "403", href: "forbidden" },
		// 		{ text: "登出(暫放)", href: "logout" },
		// 	],
		// },
	];

	useEffect(() => {
		initLine();
	}, []);

	useEffect(() => {
		if (!!accessToken) {
			alert("_:" + accessToken);
			setTimeout(() => {
				getData().then((data) => {
					if (data?.result) {
						let d = data.result;
						if (d.displayName) {
							delete d.statusMessage;
							delete d.userId;
							delete d.nationalIdentityCardNumber;
							localStorage.setItem("userProfile", JSON.stringify(d));
						}
					}
				});
			}, 3000);
		}
	}, [accessToken]);

	// Liff 登入 Line
	const initLine = () => {
		liff.init(
			{ liffId: LINE_ID },
			() => {
				if (liff.isLoggedIn()) {
					runApp();
				} else {
					liff.login();
				}
			},
			(err) => console.error(err)
		);
	};

	// 設置憑證與從後端讀取用戶資料
	const runApp = () => {
		const accessToken = liff.getAccessToken();
		if (accessToken) {
			localStorage.setItem("accessToken", JSON.stringify(accessToken));
		}
	};

	// SideBar 開關
	const toggleSidebar = () => {
		setShowSidebar(!showSidebar);
	};
	const closeSidebar = () => {
		setShowSidebar(false);
	};

	return (
		<ThemeProvider theme={theme}>
			<SnackbarProvider maxSnack={5}>
				<div className="flex justify-end overflow-x-hidden">
					<div className="relative flex flex-col w-screen min-w-screen">
						{/* Main Content */}
						<div className="w-full flex-1 overflow-hidden">
							<div className="relative flex flex-col main_wrapper h-full float-right overflow-hidden">
								{/* Header */}
								<Header toggleSidebar={toggleSidebar} classnames="lg:!hidden" />
								{/* Breadcrumb */}
								<CustomBreadcrumbs />
								{/* Router */}
								<Outlet />
							</div>
						</div>

						{/* overlay */}
						<div className={`bg_overlay ${showSidebar ? "open" : ""}`} onClick={closeSidebar}></div>
					</div>

					{/* SideBar */}
					<div
						className={`lg:absolute static sidebar_wrapper pointer-events-none lg:bg-transparent bg-white ${
							!showSidebar ? "hide" : ""
						}`}>
						<Sidebar menuItems={menuItems} closeSidebar={closeSidebar} />
					</div>

					{/* Tabbar */}
					<div className="sm:hidden">
						<Tabbar />
					</div>
				</div>
			</SnackbarProvider>
		</ThemeProvider>
	);
};

export default App;

console.log(
	"%c YuanRong!",
	"font-weight: bold; font-size: 50px;color: red; text-shadow: 3px 3px 0 rgb(217,31,38) , 6px 6px 0 rgb(226,91,14) , 9px 9px 0 rgb(245,221,8) , 12px 12px 0 rgb(5,148,68) , 15px 15px 0 rgb(2,135,206) , 18px 18px 0 rgb(4,77,145) , 21px 21px 0 rgb(42,21,113); margin-bottom: 12px; padding: 5%"
);
