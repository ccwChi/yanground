// 日期格式查詢參考 https://www.ibm.com/docs/zh-tw/qsip/7.5?topic=language-aql-date-time-formats
import React from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { MobileDatePicker } from "@mui/x-date-pickers/MobileDatePicker";
import zhTW from "date-fns/locale/zh-TW";

const DatePicker = ({ defaultValue, setDates, format = 'yyyy/MM/dd EE' }) => {
	// 取得當前格式化後的日期
	const formatToYYYYMMDD = (date) => {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, "0");
		const day = String(date.getDate()).padStart(2, "0");
		return `${year}-${month}-${day}`;
	};

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
				onAccept={(data) => setDates(formatToYYYYMMDD(data))}
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
