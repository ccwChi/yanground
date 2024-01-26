import React, { useEffect, useState, useRef } from "react";
import { Outlet } from "react-router-dom";
import Header from "./components/Layout/Header";
import Sidebar from "./components/Layout/Sidebar";
import Tabbar from "./components/Tabbar/Tabbar";
import CustomBreadcrumbs from "./components/Breadcrumbs/CustomBreadcrumbs";
import { faHouse, faToolbox, faFileLines, faUsersGear, faAddressCard } from "@fortawesome/free-solid-svg-icons";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./utils/theme";
import "./app.scss";
import useLocalStorageValue from "./hooks/useLocalStorageValue";
// import { useNotification } from "./hooks/useNotification";
import { getData } from "./utils/api";
import liff from "@line/liff";
import { SnackbarProvider, enqueueSnackbar } from "notistack";
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
				{ text: "派工行事曆", href: "dispatchcalendar" },
				{ text: "施工清單", href: "constructionsummary" },
				{ text: "專案管理", href: "project" },
				// { text: "派工清單 (臨時)", href: "dispatchList" },
			],
		},
		{
			icon: faUsersGear,
			text: "HRM",
			href: "#",
			subMenuItems: [
				{ text: "人事管理", href: "users" },
				{ text: "考勤紀錄", href: "attendancecalendar" },
				{ text: "異常考勤", href: "anomalyreport" },
				{ text: "辦公行事曆", href: "workcalendar" },
				// { text: "考勤報表", href: "attendancereport" },
			],
		},
		{
			icon: faAddressCard,
			text: "會員中心",
			href: "#",
			subMenuItems: [
				{ text: "帳戶資訊", href: "userinfo" },
				{ text: "教育訓練", href: "educationtraining" },
				{ text: "MD 文稿工作區", href: "mdworkspace" },
			],
		},
	];

	const lastActiveTimeRef = useRef(Date.now());

	const handleVisibilityChange = () => {
		if (!document.hidden) {
			const currentTime = Date.now();
			const elapsedTime = currentTime - lastActiveTimeRef.current;

			// 1hr
			if (elapsedTime > 60 * 60 * 1000) {
				window.location.reload();
			}

			// 更新最後活動時間
			lastActiveTimeRef.current = currentTime;
		}
	};

	useEffect(() => {
		// 監聽 visibilitychange 事件
		document.addEventListener("visibilitychange", handleVisibilityChange);

		// 清理事件監聽器，以避免在 component 卸載時還執行
		return () => {
			document.removeEventListener("visibilitychange", handleVisibilityChange);
		};
	}, []);

	useEffect(() => {
		initLine();
	}, []);

	useEffect(() => {
		if (!!accessToken) {
			setTimeout(() => {
				getData(
					"",
					true,
					() => {
						enqueueSnackbar(
							"抱歉，您無權訪問此頁面。此頁面僅限部分人員使用，若您認為這是一個錯誤，請聯繫人資處理。感謝理解與合作。",
							{
								variant: "error",
								anchorOrigin: {
									vertical: "bottom",
									horizontal: "center",
								},
								autoHideDuration: 15000,
							}
						);
					},
					() => {
						enqueueSnackbar(
							"認證錯誤。此頁面僅限內部人員使用，若您認為這是一個錯誤，請聯繫人資或資訊部處理。感謝理解與合作。",
							{
								variant: "error",
								anchorOrigin: {
									vertical: "bottom",
									horizontal: "center",
								},
								autoHideDuration: 15000,
							}
						);
					},
					() => {
						enqueueSnackbar("內部伺服器錯誤。請聯繫資訊部處理，感謝理解與合作。", {
							variant: "error",
							anchorOrigin: {
								vertical: "bottom",
								horizontal: "center",
							},
							autoHideDuration: 15000,
						});
					}
				).then((data) => {
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
			}, 1200);
		}
	}, [accessToken]);

	// Liff 登入 Line
	const initLine = () => {
		liff
			.init({
				liffId: LINE_ID,
			})
			.then(() => {
				if (!liff.isLoggedIn()) {
					if (window.location.href.includes("https://erp.yuanrong.goog1e.app")) {
						alert("你還沒登入Line哦！");
					}
					liff.login();
				} else {
					if (window.location.href.includes("https://erp.yuanrong.goog1e.app")) {
						alert("你已經登入Line哦！");
					}
					runApp();
				}
			})
			.catch((err) => {
				console.log("初始化失敗", err);
			});
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

// console.log(
// 	"%c YuanRong!",
// 	"font-weight: bold; font-size: 50px;color: red; text-shadow: 3px 3px 0 rgb(217,31,38) , 6px 6px 0 rgb(226,91,14) , 9px 9px 0 rgb(245,221,8) , 12px 12px 0 rgb(5,148,68) , 15px 15px 0 rgb(2,135,206) , 18px 18px 0 rgb(4,77,145) , 21px 21px 0 rgb(42,21,113); margin-bottom: 12px; padding: 5%"
// );

// console.log(`
// ╔╔════════════════════╗╗
// ||					  ||
// ||	┓┏      ┳┓        ||
// ||	┗┫┓┏┏┓┏┓┣┫┏┓┏┓┏┓  ||
// ||	┗┛┗┻┗┻┛┗┛┗┗┛┛┗┗┫  ||
// ||	               ┛  ||
// └└++++++++++++++++++++┘┘`
// );

console.log(
	"%c YuanRong!",
	"font-weight: bold; font-size: 50px; color: #fff; text-shadow: 0.01em 0.01em #436799, 0.02em 0.02em #436799, 0.03em 0.03em #436799, 0.04em 0.04em #436799, 0.05em 0.05em #436799, 0.06em 0.06em #436799, 0.07em 0.07em #436799, 0.08em 0.08em #436799, 0.09em 0.09em #436799, 0.1em 0.1em #436799, 0.11em 0.11em #436799, 0.12em 0.12em #436799, 0.13em 0.13em #436799, 0.14em 0.14em #436799, 0.15em 0.15em #436799, 0.16em 0.16em #436799, 0.17em 0.17em #436799, 0.18em 0.18em #436799, 0.19em 0.19em #436799, 0.2em 0.2em #436799, 0.21em 0.21em #547DB7, 0.22em 0.22em #547DB7, 0.23em 0.23em #547DB7, 0.24em 0.24em #547DB7, 0.25em 0.25em #547DB7, 0.26em 0.26em #547DB7, 0.27em 0.27em #547DB7, 0.28em 0.28em #547DB7, 0.29em 0.29em #547DB7, 0.3em 0.3em #547DB7, 0.31em 0.31em #547DB7, 0.32em 0.32em #547DB7, 0.33em 0.33em #547DB7, 0.34em 0.34em #547DB7, 0.35em 0.35em #547DB7, 0.36em 0.36em #547DB7, 0.37em 0.37em #547DB7, 0.38em 0.38em #547DB7, 0.39em 0.39em #547DB7, 0.4em 0.4em #547DB7, 0.41em 0.41em #45BDBF, 0.42em 0.42em #45BDBF, 0.43em 0.43em #45BDBF, 0.44em 0.44em #45BDBF, 0.45em 0.45em #45BDBF, 0.46em 0.46em #45BDBF, 0.47em 0.47em #45BDBF, 0.48em 0.48em #45BDBF, 0.49em 0.49em #45BDBF, 0.5em 0.5em #45BDBF, 0.51em 0.51em #45BDBF, 0.52em 0.52em #45BDBF, 0.53em 0.53em #45BDBF, 0.54em 0.54em #45BDBF, 0.55em 0.55em #45BDBF, 0.56em 0.56em #45BDBF, 0.57em 0.57em #45BDBF, 0.58em 0.58em #45BDBF, 0.59em 0.59em #45BDBF, 0.6em 0.6em #45BDBF; margin-bottom: 12px; padding: 5% 0%"
);
