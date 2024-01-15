import React from "react";
import Calendar from "../../components/Calendar/Calendar";
import PageTitle from "../../components/Guideline/PageTitle";

const OfficeCalendar = () => {
	return (
		<>
			<PageTitle title="辦公行事曆" />
			<Calendar
				defaultViews="multiMonthYear"
				viewOptions={["dayGridMonth", "multiMonthYear"]}
				weekNumbers={false}
				navLinks={false}
				customInitialView={true}
			/>
		</>
	);
};

export default OfficeCalendar;
