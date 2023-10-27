// 日期格式查詢參考 https://www.ibm.com/docs/zh-tw/qsip/7.5?topic=language-aql-date-time-formats
import React from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { MobileDatePicker } from "@mui/x-date-pickers/MobileDatePicker";
import zhTW from "date-fns/locale/zh-TW";

const DatePicker = ({ defaultValue, setDates, format = "yyyy/MM/dd EE" }) => {
	return (
		<LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={zhTW}>
			<MobileDatePicker
				slotProps={{ textField: { size: "small" } }}
				className="inputPadding"
				format={format}
				defaultValue={defaultValue}
				dayOfWeekFormatter={(_day, weekday) => {
					console.log(); // AVOID BUG
				}}
				onAccept={(data) => setDates(data)}
				sx={[
					{
						width: "100%",
					},
				]}
			/>
		</LocalizationProvider>
	);
};

export default DatePicker;
