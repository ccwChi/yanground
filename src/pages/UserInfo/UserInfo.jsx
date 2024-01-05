import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
// MUI
import useMediaQuery from "@mui/material/useMediaQuery";
// import Avatar from "@mui/material/Avatar";
import Brightness2Icon from "@mui/icons-material/Brightness2";
import Brightness7Icon from "@mui/icons-material/Brightness7";
// Components
import TableTabbar from "../../components/Tabbar/TableTabbar";
import { LoadingTwo } from "../../components/Loader/Loading";
// date-fns
import { parseISO, format } from "date-fns";
import { zhTW } from "date-fns/locale";
import { utcToZonedTime } from "date-fns-tz";
// Utils
import { getData } from "../../utils/api";
// Others
import PersonalInfoSection from "./Sections/PersonalInfoSection"; // 個人資訊
import PunchLogSection from "./Sections/PunchLogSection"; // 打卡紀錄
import AttendanceSection from "./Sections/AttendanceSection"; // 考勤紀錄
import ApplicationFormSection from "./Sections/ApplicationFormSection"; // 表單申請
import OperationsManual from "./Sections/OperationsManual"; // 本頁說明
// Styles
import "./userInfo.scss";

const UserInfo = () => {
	// 解析網址取得參數
	const location = useLocation();
	const queryParams = new URLSearchParams(location.search);
	const isSmallScreen = useMediaQuery("(max-width:575.98px)");

	// Tab 列表對應 api 搜尋參數
	const tabGroup = [
		{ f: "info", text: "個人資訊" },
		{ f: "punchlog", text: "打卡紀錄" },
		{ f: "attendancelog", text: "考勤紀錄" },
		// { f: "applicationform", text: "表單申請" },
		// { f: "operationsmanual", text: "本頁說明" },
	];

	// cat = Category 設置 tab 分類
	const [cat, setCat] = useState(
		queryParams.has("cat") && tabGroup.some((tab) => tab.f === queryParams.get("cat")) ? queryParams.get("cat") : "info"
	);
	// 用戶資料 List
	const [userProfile, setUserProfile] = useState(null);
	// 迴圈專用 List
	const [personalInfo, setPersonalInfo] = useState(null);
	// 打卡紀錄 x 考勤紀錄 List
	const [apiPccData, setApiPccData] = useState(null);
	const [apiAttData, setApiAttData] = useState(null);

	const getflagColorandText = (flag) => {
		switch (flag) {
			case true:
				return { color: "#F03355", text: "考勤異常" };
			case false:
				return { color: "#FFA516", text: "考勤已修正" };
			case null:
				return { color: "#25B09B", text: "考勤正常" };
			default:
				break;
		}
	};

	// 取得用戶資料
	useEffect(() => {
		getData("").then((result) => {
			const data = result.result;
			setUserProfile(data);
		});
	}, []);

	useEffect(() => {
		if (userProfile) {
			const parsedData = [
				{
					title: "姓氏",
					content: userProfile.lastname,
				},
				{
					title: "名字",
					content: userProfile.firstname,
				},
				{
					title: "暱稱",
					content: userProfile.nickname,
				},
				{
					title: "性別",
					content: userProfile.gender === false ? "女性" : userProfile.gender === true ? "男性" : "?",
				},
				// {
				// 	title: "部門",
				// 	content: userProfile.department ? userProfile.department.name : "-",
				// },
				// {
				// 	title: "員工編號",
				// 	content: userProfile.employeeId,
				// },
				{ title: "生日", content: userProfile.birthDate },
				{ title: "入職日期", content: userProfile.startedOn },
				{ title: "加入日期", content: userProfile.createdAt?.slice(0, 10) },
				{
					title: "權限",
					content: userProfile.authorities ? userProfile.authorities : "無權限",
					// content: userProfile.authorities ? userProfile.authorities.map((item) => item.name).join("、") : "無權限",
				},
			];
			setPersonalInfo(parsedData);
		}
	}, [userProfile]);

	// 取得打卡歷程資料
	useEffect(() => {
		if (userProfile) {
			getData(`attendance?p=1&s=180`).then((result) => {
				const data = result.result.content;
				const formattedEvents = data.map((event) => ({
					id: event.id,
					title: getflagColorandText(event.anomaly).text,
					color: getflagColorandText(event.anomaly).color,
					start: event.date,
				}));
				setApiAttData(formattedEvents);
			});
			getData(`clockPunch?p=1&s=5000`).then((result) => {
				const data = result.result.content;
				const formattedEvents = data.map((event) => ({
					id: event.id,
					title: event.clockIn ? "上班" : event.clockIn === false ? "下班" : "上/下班",
					date: format(utcToZonedTime(parseISO(event.occurredAt), "Asia/Taipei"), "yyyy-MM-dd HH:mm:ss", {
						locale: zhTW,
					}),
					color: "#547DB7",
				}));
				setApiPccData(formattedEvents);
			});
		}
	}, [userProfile]);

	const isNight = () => {
		const now = new Date();
		const hour = now.getHours();
		const isNightTime = hour >= 16 || hour < 6;
		return isNightTime;
	};

	return (
		<div className="userinfo_wrapper flex flex-col flex-1 sm:-mt-9 -mt-10 sm:-mb-4 -mb-8 overflow-hidden">
			<div className={`header ${isNight() ? "bg-secondary-50" : "bg-[#45BDBF]"}`}>
				<div className="header-background-elements">
					<div className={`header-circle circle-left ${isNight() ? "bg-[#2a776f]" : "bg-[#fffad0]"}`}></div>
					<div className={`header-circle circle-right ${isNight() ? "bg-[#2a776f]" : "bg-[#fffad0]"}`}></div>

					<div className="dashed-shapes">
						<div className="dashed-shape shape-1"></div>
						<div className="dashed-shape shape-2"></div>
						<div className="dashed-shape shape-3"></div>
					</div>

					<div className="clouds">
						<div className="cloud-circle circle-1"></div>
						<div className="cloud-circle circle-2"></div>
						<div className="cloud-circle circle-3"></div>
						<div className="cloud-circle circle-4"></div>
						<div className="cloud-circle circle-5"></div>
						<div className="cloud-circle circle-6"></div>
						<div className="cloud-circle circle-7"></div>
						<div className="cloud-circle circle-8"></div>
						<div className="cloud-circle circle-9"></div>
						<div className="cloud-circle circle-10"></div>
						<div className="cloud-circle circle-11"></div>
						<div className="cloud-circle circle-12"></div>
						<div className="cloud-circle circle-13"></div>
						<div className="cloud-circle circle-14"></div>
						<div className="cloud-circle circle-15"></div>
						<div className="cloud-circle circle-16"></div>
						<div className="cloud-circle circle-17"></div>
						<div className="cloud-circle circle-18"></div>
						<div className="cloud-circle circle-19"></div>
						<div className="cloud-circle circle-20"></div>
						<div className="cloud-circle circle-21"></div>
						<div className="cloud-circle circle-22"></div>
						<div className="cloud-circle circle-23"></div>
						<div className="cloud-circle circle-24"></div>
					</div>
				</div>

				<div className="header-user-info sm:block hidden">
					{/* <div className="user-picture">
						<Avatar
							alt={userProfile?.displayName}
							src={userProfile?.pictureUrl}
							sx={{ width: 80, height: 80, bgcolor: "#547db7" }}
						/>
					</div> */}
					{isNight() ? (
						<Brightness2Icon className="mt-2" fontSize="large" />
					) : (
						<Brightness7Icon className="mt-2" fontSize="large" />
					)}
					<div className="user-name pt-1">
						<h5 className="h5">{userProfile ? `歡迎！ ${userProfile.nickname}` : "載入中..."}</h5>
					</div>
				</div>
			</div>

			<TableTabbar
				tabGroup={tabGroup}
				cat={cat}
				setCat={setCat}
				sx={{
					"& .MuiTabs-scroller": {
						borderRadius: "0.5rem",
						background: "white",
						boxShadow: "0 5px 10px rgba(0, 0, 0, 0.1)",
					},
				}}
			/>

			<div
				className={`relative profile-section flex flex-col flex-1 overflow-hidden ${
					cat === "punchlog" || cat === "attendancelog" ? "sm:pb-3.5 pb-0" : ""
				}`}>
				{(() => {
					switch (cat) {
						case "info": // 個人資訊
							return personalInfo ? (
								<PersonalInfoSection userProfile={userProfile} personalInfo={personalInfo} />
							) : (
								<LoadingTwo size={isSmallScreen ? 120 : 160} textSize={"text-lg sm:text-xl"} />
							);
						case "punchlog": // 打卡紀錄
							return apiPccData ? (
								<PunchLogSection apiPccData={apiPccData} />
							) : (
								<LoadingTwo size={isSmallScreen ? 120 : 160} textSize={"text-lg sm:text-xl"} />
							);
						case "attendancelog": // 考勤紀錄
							return apiAttData ? (
								<AttendanceSection apiAttData={apiAttData} />
							) : (
								<LoadingTwo size={isSmallScreen ? 120 : 160} textSize={"text-lg sm:text-xl"} />
							);
						case "applicationform": // 表單申請
							return <ApplicationFormSection />;
						case "operationsmanual": // 本頁說明
							return <OperationsManual />;
						default: {
							return null;
						}
					}
				})()}
			</div>
		</div>
	);
};

export default UserInfo;
