import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import TableTabber from "../../components/Tabbar/TableTabber";
import { LoadingTwo } from "../../components/Loader/Loading";
// import Avatar from "@mui/material/Avatar";
import Brightness2Icon from "@mui/icons-material/Brightness2";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import { getData } from "../../utils/api";
import PersonalInfoSection from "./PersonalInfoSection";
import PunchLogSection from "./PunchLogSection";
import "./userInfo.scss";

const UserInfo = () => {
	// 解析網址取得參數
	const location = useLocation();
	const queryParams = new URLSearchParams(location.search);

	// Tab 列表對應 api 搜尋參數
	const tabGroup = [
		{ f: "info", text: "個人資訊" },
		{ f: "punchlog", text: "打卡紀錄" },
	];

	// cat = Category 設置 tab 分類
	const [cat, setCat] = useState(
		queryParams.has("cat") && tabGroup.some((tab) => tab.f === queryParams.get("cat")) ? queryParams.get("cat") : "info"
	);
	// 用戶資料 List
	const [userProfile, setUserProfile] = useState(null);
	// 迴圈專用 List
	const [personalInfo, setPersonalInfo] = useState(null);
	// 打卡紀錄 List
	const [apiAttData, setApiAttData] = useState(null);
	// isLoading 等待請求 API
	const [isLoading, setIsLoading] = useState(true);

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
			setIsLoading(true);
			getData(`user/${userProfile.id}/attendancies?p=1&s=5000`).then((result) => {
				setIsLoading(false);
				const data = result.result.content;
				setApiAttData(data);
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
		<div className="userinfo_wrapper flex flex-col flex-1 sm:-mt-9 -mt-10 sm:-mb-4 -mb-7 overflow-hidden">
			<div className="header bg-secondary-50">
				<div className="header-background-elements">
					<div className="header-circle circle-left"></div>
					<div className="header-circle circle-right"></div>

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

				<div className="header-user-info">
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

			<TableTabber tabGroup={tabGroup} cat={cat} setCat={setCat} />

			<div className="relative profile-section flex flex-col flex-1 overflow-hidden sm:pb-3.5 pb-0">
				{cat === "info" ? (
					personalInfo ? (
						<PersonalInfoSection userProfile={userProfile} personalInfo={personalInfo} />
					) : (
						<LoadingTwo textSize={"text-lg sm:text-xl"} />
					)
				) : (
					<PunchLogSection apiAttData={apiAttData} />
				)}
			</div>
		</div>
	);
};

export default UserInfo;
