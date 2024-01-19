import React, { useEffect, useState, useCallback } from "react";
import { format } from "date-fns";
import { useLocation } from "react-router-dom";
// MUI
import Backdrop from "@mui/material/Backdrop";
import Tooltip from "@mui/material/Tooltip";
import AddLinkIcon from "@mui/icons-material/AddLink";
import SettingsSuggestIcon from "@mui/icons-material/SettingsSuggest";
// Components
import Calendar from "../../components/Calendar/Calendar";
import PageTitle from "../../components/Guideline/PageTitle";
import MultipleFAB from "../../components/FloatingActionButton/MultipleFAB";
import { LoadingTwo, LoadingFour } from "../../components/Loader/Loading";
// Hooks
import { useNotification } from "../../hooks/useNotification";
// Utils
import { getData, postData } from "../../utils/api";
// Custom
import { AdminCalendarUrlModal, TemporaryAnnouncementModal } from "./WorkCalendarModal";

const WorkCalendar = () => {
	// 解析網址取得參數
	const location = useLocation();
	const queryParams = new URLSearchParams(location.search);
	const calendaryears = queryParams.get("calendaryears");
	const showNotification = useNotification();
	// ModalValue 控制開啟的是哪一個 Modal
	const [modalValue, setModalValue] = useState(false);
	// 設定點擊開啟日期參數
	const [selectedDate, setSelectedDate] = useState("");
	// 傳遞至後端是否完成 Flag
	const [sendBackFlag, setSendBackFlag] = useState(false);
	// API 資料
	const [apiData, setApiData] = useState(null);
	// 休假類型清單
	const [dayOffTypeList, setDayOffTypeList] = useState(null);
	// isLoading 等待請求 API
	const [isLoading, setIsLoading] = useState(false);
	// API URL
	const apiUrl = "workCalendar";

	// Button Group
	const btnGroup = [
		{
			mode: "setHolidayConfig",
			icon: <AddLinkIcon fontSize="small" />,
			text: "設定例假日行事曆",
			variant: "contained",
			color: "primary",
			fabVariant: "success",
			fab: <AddLinkIcon />,
		},
		{
			mode: "configureSpecialHoliday",
			icon: <SettingsSuggestIcon fontSize="small" />,
			text: "設定特殊假期",
			variant: "contained",
			color: "secondary",
			fabVariant: "warning",
			fab: <SettingsSuggestIcon />,
		},
	];

	// 清空查詢字串
	useEffect(() => {
		// 獲取當前 URL 的查詢字串
		const queryString = window.location.search;
		// 如果有查詢字串，清空它並重新載入頁面
		if (queryString) {
			window.history.replaceState({}, document.title, window.location.pathname);
		}
	}, []);

	// 取得日曆資料
	useEffect(() => {
		getApiList(calendaryears);
	}, [calendaryears]);
	const getApiList = (yDate) => {
		setIsLoading(true);
		getData(`${apiUrl}${yDate ? "/" + yDate : ""}`).then((result) => {
			if (result.result) {
				const data = result.result;
				const formattedEvents = data.map((event) => ({
					id: event.id,
					title: event.cause,
					// 使用日期對象的 toISOString 方法和 substring 方法進行格式轉換
					start: format(new Date(event.date), "yyyy-MM-dd", { timeZone: "Asia/Taipei" }),
				}));
				setApiData(formattedEvents);
				setIsLoading(false);
			} else {
				setApiData(null);
			}
		});
	};

	// 取得休假類型清單
	useEffect(() => {
		getData("dayOffType").then((result) => {
			if (result.result) {
				const data = result.result;
				setDayOffTypeList(data);
			} else {
				setDayOffTypeList(null);
				console.log("Error");
			}
		});
	}, []);

	// 當活動按鈕點擊時動作
	const handleActionClick = (event) => {
		event.stopPropagation();
		const dataMode = event.currentTarget.getAttribute("data-mode");
		setModalValue(dataMode);
	};

	// 傳遞給後端資料
	const sendDataToBackend = (fd, mode, mdate = "") => {
		// for (var pair of fd.entries()) {
		// 	console.log(pair[0] + ", " + pair[1]);
		// }
		setSendBackFlag(true);
		let url = "workCalendar";
		let message = [];
		switch (mode) {
			case "admincalendarurl":
				message = ["行事曆上傳成功！"];
				break;
			case "temporaryannouncement":
				url += `/${mdate}`;
				message = ["特殊假期上傳成功！"];
				break;
			default:
				break;
		}
		postData(url, fd).then((result) => {
			if (result.status) {
				showNotification(message[0], true);
				getApiList(calendaryears);
				onClose();
				setSendBackFlag(false);
			} else {
				showNotification(result?.result.reason || "出現錯誤。", false);
				setSendBackFlag(false);
			}
		});
	};

	// 關閉 Modal 清除資料
	const onClose = () => {
		setModalValue(false);
		setSelectedDate("");
	};

	// modal 開啟參數與顯示標題
	const modalConfig = [
		{
			modalValue: "setHolidayConfig",
			modalComponent: (
				<AdminCalendarUrlModal title={"設定例假日行事曆"} sendDataToBackend={sendDataToBackend} onClose={onClose} />
			),
		},
		{
			modalValue: "configureSpecialHoliday",
			modalComponent: (
				<TemporaryAnnouncementModal
					title={"設定特殊假期"}
					sendDataToBackend={sendDataToBackend}
					onClose={onClose}
					selectedDate={selectedDate}
					dayOffTypeList={dayOffTypeList}
				/>
			),
		},
	];
	const config = modalValue ? modalConfig.find((item) => item.modalValue === modalValue) : null;

	return (
		<div className="flex-1 overflow-hidden mb-4 sm:mb-0">
			{/* PageTitle */}
			<PageTitle title="辦公行事曆" btnGroup={btnGroup} handleActionClick={handleActionClick} />

			{/* Calendar */}
			<Calendar
				data={apiData || []}
				defaultViews="multiMonthYear"
				viewOptions={["dayGridMonth", "multiMonthYear"]}
				weekNumbers={false}
				navLinks={false}
				customInitialView={true}
				// 日期點擊事件
				select={(selected) => {
					setSelectedDate(selected.startStr);
					setModalValue("configureSpecialHoliday");
				}}
				eventContent={(eventInfo) => {
					return (
						<Tooltip title={eventInfo.event._def.title}>
							<div className="px-1.5 text-ellipsis whitespace-nowrap overflow-hidden">{eventInfo.event._def.title}</div>
						</Tooltip>
					);
				}}
			/>

			{/* FAB */}
			<MultipleFAB btnGroup={btnGroup} handleActionClick={handleActionClick} />

			{/* Backdrop */}
			<Backdrop sx={{ color: "#fff", zIndex: 1400 }} open={sendBackFlag || isLoading}>
				{sendBackFlag ? <LoadingFour /> : <LoadingTwo />}
			</Backdrop>

			{/* Modal */}
			{config && config.modalComponent}
		</div>
	);
};

export default WorkCalendar;
