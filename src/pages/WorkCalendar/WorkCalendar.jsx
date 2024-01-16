import React, { useState } from "react";
// MUI
import Backdrop from "@mui/material/Backdrop";
import AddLinkIcon from "@mui/icons-material/AddLink";
import SettingsSuggestIcon from "@mui/icons-material/SettingsSuggest";
// Components
import Calendar from "../../components/Calendar/Calendar";
import PageTitle from "../../components/Guideline/PageTitle";
import MultipleFAB from "../../components/FloatingActionButton/MultipleFAB";
import { LoadingFour } from "../../components/Loader/Loading";
// Hooks
import { useNotification } from "../../hooks/useNotification";
// Custom
import { AdminCalendarUrlModal, TemporaryAnnouncementModal } from "./WorkCalendarModal";

const WorkCalendar = () => {
	const showNotification = useNotification();
	// ModalValue 控制開啟的是哪一個 Modal
	const [modalValue, setModalValue] = useState(false);
	// 設定點擊開啟日期參數
	const [selectedDate, setSelectedDate] = useState("");
	// 傳遞至後端是否完成 Flag
	const [sendBackFlag, setSendBackFlag] = useState(false);

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

	// 當活動按鈕點擊時動作
	const handleActionClick = (event) => {
		event.stopPropagation();
		const dataMode = event.currentTarget.getAttribute("data-mode");
		setModalValue(dataMode);
	};

	// 傳遞給後端資料
	const sendDataToBackend = (fd, mode, mdate = "") => {
		setSendBackFlag(true);
		let url = "workCalendar";
		let message = [];
		switch (mode) {
			case "admincalendarurl":
				message = ["行事曆上傳成功！"];
				break;
			case "temporaryannouncement":
				url += "/" + mdate;
				message = ["特殊假期上傳成功！"];
				break;
			default:
				break;
		}
		// postData(url, fd).then((result) => {
		// 	if (result.status) {
		// showNotification(message[0], true);
		onClose();
		// 		setSendBackFlag(false);
		// 	} else {
		showNotification("尚無 API，僅供參考 UI", false);
		setSendBackFlag(false);
		// 	}
		// });
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
			/>

			{/* FAB */}
			<MultipleFAB btnGroup={btnGroup} handleActionClick={handleActionClick} />

			{/* Backdrop */}
			<Backdrop sx={{ color: "#fff", zIndex: 1400 }} open={sendBackFlag}>
				<LoadingFour />
			</Backdrop>

			{/* Modal */}
			{config && config.modalComponent}
		</div>
	);
};

export default WorkCalendar;
