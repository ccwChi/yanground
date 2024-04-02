import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

// MUI
import AddIcon from "@mui/icons-material/Add";
import AddCircleIcon from "@mui/icons-material/AddCircle";

// Component
import PageTitle from "../../components/Guideline/PageTitle";
import TableTabbar from "../../components/Tabbar/TableTabbar";
import { LoadingTwo } from "../../components/Loader/Loading";
import Calendar from "../../components/Calendar/Calendar";

/***
 * CarDispatch
 * 會議室預約
 * @returns
 ***/
const MeetingRoomReservation = () => {
	// 解析網址取得參數
	const location = useLocation();
	const queryParams = new URLSearchParams(location.search);

	// Category
	const tabGroup = [
		{ f: "loanStatusTable", text: "狀況管理" },
		{ f: "reservationCalendar", text: "預約月曆" },
	];
	const [cat, setCat] = useState(
		queryParams.has("cat") && tabGroup.some((tab) => tab.f === queryParams.get("cat"))
			? queryParams.get("cat")
			: tabGroup[0].f
	);

	// 上方區塊功能按鈕清單
	const btnGroup = [
		{
			mode: "create",
			icon: <AddCircleIcon fontSize="small" />,
			text: "新增預約",
			variant: "contained",
			color: "primary",
			fabVariant: "success",
			fab: <AddIcon fontSize="large" />,
		},
	];

	// 當活動按鈕點擊時動作
	const handleActionClick = (event) => {
		event.stopPropagation();
		const dataMode = event.currentTarget.getAttribute("data-mode");
		const dataValue = event.currentTarget.getAttribute("data-value");
	};

	return (
		<>
			{/* PageTitle */}
			<PageTitle
				title="會議室預約"
				description="此頁面是用於會議室預約，提供新增、編輯、刪除申請的功能，並可查看月曆會議室的當前狀態和預約情況。"
				btnGroup={btnGroup}
				handleActionClick={handleActionClick}
			/>

			{/* Tab */}
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

			{/* Main Content */}
			<div className={"relative profile-section flex flex-col flex-1 overflow-hidden pb-4 sm:pb-0"}>
				{(() => {
					switch (cat) {
						case "loanStatusTable": // 狀態管理
							// return apiDataTable ? (
							return <>這邊放 Table Component</>;
						// ) : (
						// 	<LoadingTwo size={isSmallScreen ? 120 : 160} textSize={"text-lg sm:text-xl"} />
						// );
						case "reservationCalendar": // 預約月曆
							// return apiDataCalendar ? (
							return (
								<Calendar
									data={[]}
									viewOptions={["dayGridMonth", "timeGridDay"]}
									navLinks={false}
									customInitialView={true}
								/>
							);
						// ) : (
						// 	<LoadingTwo size={isSmallScreen ? 120 : 160} textSize={"text-lg sm:text-xl"} />
						// );
						default: {
							return null;
						}
					}
				})()}
			</div>
		</>
	);
};

export default MeetingRoomReservation;
