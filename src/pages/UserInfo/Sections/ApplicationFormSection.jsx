import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
// MUI
import Button from "@mui/material/Button";
// FontAwesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBook, faDoorOpen, faFeather, faBuildingUser, faPaperPlane } from "@fortawesome/free-solid-svg-icons";
// Component
import ApplicationRecord from "./ApplicationFormSection/ApplicationReacord";
import DayOff from "./ApplicationFormSection/DayOff";
import CompletePunchIO from "./ApplicationFormSection/CompletePunchIO";
import WorkOverTime from "./ApplicationFormSection/WorkOvertime";
import AuditLog from "./ApplicationFormSection/AuditLog";
// Hooks
import useLocalStorageValue from "../../../hooks/useLocalStorageValue";
// Utils
import { getData } from "../../../utils/api";

// 表單申請按鈕清單
const applicationBtns = [
	{
		id: "applicationRecord",
		icon: faBook,
		color: "#6262a7",
		text: "申請紀錄",
	},
	{
		id: "dayOff",
		icon: faDoorOpen,
		color: "#547db7",
		text: "請假",
	},
	{
		id: "completePunchIO",
		icon: faFeather,
		color: "#039E8E",
		text: "補打卡",
	},
	{
		id: "workOvertime",
		icon: faBuildingUser,
		color: "#F7941D",
		text: "加班",
	},
	{
		id: "auditLog",
		icon: faPaperPlane,
		color: "#F03355",
		text: "審核紀錄",
	},
];

const ApplicationFormSection = React.memo(({}) => {
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
		<div className="flex sm:flex-row flex-col sm:p-5 p-3 sm:gap-4 gap-3 overflow-auto pb-16">
			<div className="flex sm:flex-col justify-start !px-4 gap-5 sm:gap-8 panel bg-white sm:w-min !mb-0 !overflow-auto">
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
			<div className="panel bg-white !mb-0 flex-1 !overflow-auto">
				{(() => {
					switch (mode.id) {
						case "applicationRecord":
							return <ApplicationRecord />;
						case "dayOff":
							return <DayOff userProfile={userProfile} memberList={memberList} />;
						case "completePunchIO":
							return <CompletePunchIO userProfile={userProfile} />;
						case "workOvertime":
							return <WorkOverTime />;
						case "auditLog":
							return <AuditLog />;
						default:
							return null;
					}
				})()}
			</div>
		</div>
	);
});

export default ApplicationFormSection;
