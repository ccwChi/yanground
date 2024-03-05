import React, { useEffect, useState } from "react";
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
import { getData, postData, deleteData } from "../../utils/api";
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
	// 傳送額外資訊給 Modal
	const [deliverInfo, setDeliverInfo] = useState(null);
	// API URL
	const apiUrl = "workCalendar";

	// Button Group
	const btnGroup = [
		{
			mode: "configureSpecialHoliday",
			icon: <SettingsSuggestIcon fontSize="small" />,
			text: "設定特殊假期",
			variant: "contained",
			color: "secondary",
			fabVariant: "warning",
			fab: <SettingsSuggestIcon />,
		},
		{
			mode: "setHolidayConfig",
			icon: <AddLinkIcon fontSize="small" />,
			text: "設定例假日行事曆",
			variant: "contained",
			color: "primary",
			fabVariant: "success",
			fab: <AddLinkIcon />,
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
					color: event.type.value !== "SUSPENDED" ? "#F48A64" : "#FFA516",
					start: format(new Date(event.date), "yyyy-MM-dd", { timeZone: "Asia/Taipei" }),
					type: event.type,
					// start: format(new Date(`${event.date[0]}-${String(event.date[1]).padStart(2, "0")}-${String(event.date[2]).padStart(2, "0")}T00:00:00.000Z`), "yyyy-MM-dd", { timeZone: "Asia/Taipei" }),
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
	const sendDataToBackend = (fd, mode, mdate = "", otherData = null) => {
		// for (var pair of fd.entries()) {
		// 	console.log(pair[0] + ", " + pair[1]);
		// }
		setSendBackFlag(true);

		// url & message
		let url = "workCalendar";
		let message = [];
		switch (mode) {
			case "admincalendarurl":
				message = ["行事曆上傳成功！"];
				break;
			case "temporaryannouncement":
				if (otherData) {
					url += `/${otherData}`;
					message = ["假期編輯成功！"];
				} else {
					url += `/${mdate}`;
					message = ["特殊假期上傳成功！"];
				}
				break;
			case "deleteTA":
				url += `/${otherData}`;
				message = ["假期刪除成功！"];
				break;
			default:
				break;
		}

		// 共用的處理 API 回應邏輯
		const handleApiResponse = (result) => {
			if (result.status) {
				// 如果 API 呼叫成功，顯示成功通知，刷新列表，關閉模態框
				showNotification(message[0], true);
				getApiList(calendaryears);
				onClose();
			} else {
				// 如果 API 呼叫失敗，顯示錯誤通知
				showNotification(result?.result.reason || "出現錯誤。", false);
			}
			setSendBackFlag(false);
		};

		// 處理 API 呼叫的函數，接受一個執行 API 呼叫的函數作為參數
		const handleApiCall = (apiFunction) => {
			apiFunction(url, fd).then((result) => {
				// 呼叫通用的處理 API 回應邏輯
				handleApiResponse(result);
			});
		};

		// 根據模式選擇呼叫 deleteData 或 postData
		if (mode === "deleteTA") {
			handleApiCall(deleteData);
		} else {
			handleApiCall(postData);
		}
	};

	// 關閉 Modal 清除資料
	const onClose = () => {
		setModalValue(false);
		setSelectedDate("");
		setDeliverInfo(null);
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
					title={deliverInfo ? "編輯特殊假期" : "設定特殊假期"}
					deliverInfo={deliverInfo}
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
		<>
			{/* PageTitle */}
			<PageTitle
				title="辦公行事曆"
				description="此頁面是用於輸入政府文件網址以建立例假日行事曆，同時提供自訂特殊假期（如颱風天）。"
				btnGroup={btnGroup}
				handleActionClick={handleActionClick}
			/>

			{/* Calendar */}
			<Calendar
				data={apiData || []}
				defaultViews="multiMonthYear"
				viewOptions={["dayGridMonth", "listMonth", "multiMonthYear"]}
				weekNumbers={false}
				navLinks={false}
				customInitialView={true}
				// 日期點擊事件
				select={(selected) => {
					setSelectedDate(selected.startStr);
					setModalValue("configureSpecialHoliday");
				}}
				// 事件點擊事件
				eventClick={(info) => {
					setDeliverInfo({
						date: new Date(info.event.start),
						id: info.event.id,
						cause: info.event.title,
						type: info.event._def.extendedProps.type.value,
						springFestival: info.event._def.extendedProps.springFestival,
					});
					setModalValue("configureSpecialHoliday");
				}}
				eventContent={(eventInfo) => {
					return (
						<Tooltip title={eventInfo.event._def.title}>
							<div className="px-1.5 py-0.5 text-ellipsis whitespace-nowrap overflow-hidden cursor-pointer">
								{eventInfo.event._def.title}
							</div>
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
		</>
	);
};

export default WorkCalendar;
