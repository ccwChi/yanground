import React, { useState, useEffect } from "react";
import Calendar from "../../components/Calendar/Calendar";
import { parseISO } from "date-fns";

const PunchLogSection = React.memo(({ apiAttData }) => {
	const [events, setEvents] = useState([]);

	useEffect(() => {
		if (apiAttData) {
			const formattedEvents = apiAttData.map((event) => ({
				id: event.id,
				title: "打卡",
				date: parseISO(event.occurredAt),
			}));

			setEvents(formattedEvents);
		}
	}, [apiAttData]);

	return <Calendar data={events} />;
});

export default PunchLogSection;
