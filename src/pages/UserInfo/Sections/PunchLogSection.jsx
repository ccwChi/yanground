import React, { useState, useEffect } from "react";
import Calendar from "../../../components/Calendar/Calendar";
import { parseISO, format } from "date-fns";
import { zhTW } from "date-fns/locale";
import { utcToZonedTime } from "date-fns-tz";

const PunchLogSection = React.memo(({ apiAttData }) => {
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

	return <Calendar data={events} />;
});

export default PunchLogSection;
