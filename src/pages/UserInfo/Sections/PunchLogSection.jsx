import React, { useState, useEffect } from "react";
import Calendar from "../../../components/Calendar/Calendar";
import { parseISO, format } from "date-fns";
import { zhTW } from "date-fns/locale";
import { utcToZonedTime } from "date-fns-tz";

const PunchLogSection = React.memo(({ apiPccData }) => {
	return <Calendar data={apiPccData} />;
});

export default PunchLogSection;
