import React, { useState, useEffect } from "react";
import Calendar from "../../../components/Calendar/Calendar";
import { parseISO, format } from "date-fns";
import { zhTW } from "date-fns/locale";
import { utcToZonedTime } from "date-fns-tz";
import AttendanceSectionModal from "./AttendanceCalendarModal/AttendanceSectionModal";

const alertText = "每天凌晨 12 點考勤系統會自動計算前一天的出勤狀況，檢查是否存在異常紀錄，包括缺勤和打卡情況。";

const AttendanceSection = React.memo(({ apiAttData }) => {
	const [isOpen, setIsOpen] = useState(false);
	const [deliverInfo, setDeliverInfo] = useState({});

	const onClose = () => {
		setDeliverInfo(null);
		setIsOpen(false);
	};
	const handleClickEvent = (e) => {
		if (apiAttData) {
			const eventContent = apiAttData.filter((data) => data.start === e.event.startStr);
			setDeliverInfo(eventContent[0]);
		}
	};

	return (
		<>
			{/* <div className="flex px-4 pt-2 text-rose-400 font-bold text-xs">
				<p className="me-1">＊</p>
				<p>{alertText}</p>
			</div> */}
			<Calendar
				data={apiAttData}
				select={(selected) => {
					//   console.log("Date selected ", selected);
				}}
				// eventClick={(info) => {
				// 	//   console.log("Event clicked ", info);
				// 	handleClickEvent(info);
				// 	setIsOpen(true);
				// }}
			/>
			<AttendanceSectionModal onClose={onClose} isOpen={isOpen} deliverInfo={deliverInfo} />
		</>
	);
});

export default AttendanceSection;
