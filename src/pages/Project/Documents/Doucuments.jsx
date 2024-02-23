import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
// MUI
import Button from "@mui/material/Button";
// FontAwesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faUserTie,
	faTape,
	faCompassDrafting,
    faWarehouse,
    faHelmetSafety,
    faClipboardCheck,
    faUserGear,
} from "@fortawesome/free-solid-svg-icons";
// Component
import PageTitle from "../../../components/Guideline/PageTitle";
// Hooks
import useLocalStorageValue from "../../../hooks/useLocalStorageValue";
// Utils
import { getData } from "../../../utils/api";

// 表單申請按鈕清單
const applicationBtns = [
	{
		id: "a",
		icon: faUserTie,
		color: "#e95959",
		text: "業務",
	},
	{
		id: "b",
		icon: faTape,
		color: "#6262a7",
		text: "測量",
	},
	{
		id: "c",
		icon: faCompassDrafting,
		color: "#547db7",
		text: "設計",
	},
	{
		id: "d",
		icon: faWarehouse,
		color: "#3a9fc0",
		text: "倉庫",
	},
	{
		id: "e",
		icon: faHelmetSafety,
		color: "#039E8E",
		text: "工程",
	},
	{
		id: "f",
		icon: faClipboardCheck,
		color: "#F7941D",
		text: "品檢",
	},
	{
		id: "g",
		icon: faUserGear,
		color: "#F03355",
		text: "人事",
	},
];

const Documents = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const userProfile = useLocalStorageValue("userProfile");
	// 自身部門人員清單
	const [memberList, setMemberList] = useState([]);

	// 取得自身部門人員清單(去除自己)
	useEffect(() => {
		if (userProfile?.department) {
			getData(`department/${userProfile.department.id}/staff`).then((result) => {
				const data = result.result;
				const formattedUser = data
					.filter((us) => userProfile.id !== us.id)
					.map((us) => ({
						label: us.lastname && us.firstname ? us.lastname + us.firstname : us.displayName,
						value: us.id,
					}));
				setMemberList(formattedUser);
			});
		}
	}, [userProfile]);

	// 選擇當前顯示清單
	const [mode, setMode] = useState(applicationBtns[0]);

	useEffect(() => {
		// 取得當前 URL 的 search 參數
		const searchParams = new URLSearchParams(location.search);

		// 取得 mode 參數
		const modeParam = searchParams.get("mode");
		const mode = applicationBtns.find((obj) => obj.id === modeParam);

		if (modeParam) {
			setMode(mode);
		}
	}, []);

	const handleClick = (item) => {
		// 取得當前 URL 的 search 參數
		const currentSearchParams = new URLSearchParams(location.search);

		// 設置或更新 mode 參數
		currentSearchParams.set("mode", item.id);

		// 獲取新的 search 字串
		const newSearch = currentSearchParams.toString();

		// 導航到新的URL
		navigate(`?${newSearch}`);
	};

	return (
		<>
			{/* PageTitle */}
			<PageTitle
				title="專管文檔管理"
				description="此頁面是用於管理專案內的文檔，提供分類檢視管理、上傳和刪除文檔與圖片等功能，以便有效地管理專案資料。"
			/>
			<p className="sm:px-5 px-3 mb-1 text-xs sm:text-sm">
				<span>專案：</span>
				<span className="font-bold">學甲分線圳路（地面型）太陽光電發電 系統新建工程</span>
			</p>
			<div className="flex sm:flex-row-reverse flex-col sm:px-5 px-3 gap-3 overflow-auto pb-16">
				<div className="flex sm:flex-col sm:max-h-max justify-start px-4 py-3 sm:py-4 gap-4 sm:gap-5 bg-white sm:w-min overflow-auto rounded-lg">
					{applicationBtns.map((item) => (
						<div key={item.id} className="inline-flex flex-col items-center gap-2">
							<Button
								id={item.id}
								variant="contained"
								className={`gap-5 !p-3 !w-12 sm:!w-14 aspect-square !min-w-0 !rounded-2xl ${
									mode.id === item.id ? "active" : ""
								}`}
								onClick={() => {
									setMode(item);
									handleClick(item);
								}}
								color="dark"
								sx={{
									backgroundColor: item.color,
									"&.active": {
										boxShadow: `white 0px 0px 0px 3px, ${item.color} 0px 0px 0px 6px`,
									},
								}}>
								<FontAwesomeIcon icon={item.icon} className="text-2xl sm:text-3xl" />
							</Button>
							<span className="text-xs sm:text-sm">{item.text}</span>
						</div>
					))}
				</div>
				<div className="p-4 bg-white mb-0 flex-1 overflow-auto rounded-lg">
					{/* {(() => {
						switch (mode.id) {
							case "a":
								return <>123</>;
							case "b":
								return <>1233</>;
							case "c":
								return <>12333</>;
							case "d":
								return <>123333</>;
							case "e":
								return <>1233333</>;
							default:
								return null;
						}
					})()} */}
				</div>
			</div>
		</>
	);
};

export default Documents;
