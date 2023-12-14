import React, { useState, useEffect } from "react";
import Calendar from "../../components/Calendar/Calendar";
import { parseISO, format } from "date-fns";
import { zhTW } from "date-fns/locale";
import { utcToZonedTime } from "date-fns-tz";

const alertText = "每天凌晨 12 點考勤系統會自動計算前一天的出勤狀況，檢查是否存在異常紀錄，包括缺勤和打卡情況。";

const AttendanceSection = React.memo(({ apiAttData }) => {
	const [events, setEvents] = useState([]);

	useEffect(() => {
		if (apiAttData) {
			const formattedEvents = apiAttData.map((event) => ({
				id: event.id,
				title: event.clockIn ? "上班" : event.clockIn === false ? "下班" : "上/下班",
				date: format(utcToZonedTime(parseISO(event.occurredAt), "Asia/Taipei"), "yyyy-MM-dd HH:mm:ss", {
					locale: zhTW,
				}),
			}));

			setEvents(formattedEvents);
		}
	}, [apiAttData]);

	return (
		<>
			{/* <div className="flex px-4 pt-2 text-rose-400 font-bold text-xs">
				<p className="me-1">＊</p>
				<p>{alertText}</p>
			</div> */}
			<Calendar
				data={events}
				select={(selected) => {
					console.log("Date selected ", selected);
				}}
				eventClick={(info) => {
					console.log("Event clicked ", info);
				}}
			/>
		</>
	);
});

export default AttendanceSection;
