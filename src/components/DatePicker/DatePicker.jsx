// 日期格式查詢參考 https://www.ibm.com/docs/zh-tw/qsip/7.5?topic=language-aql-date-time-formats
import React from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { MobileDatePicker } from "@mui/x-date-pickers/MobileDatePicker";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import zhTW from "date-fns/locale/zh-TW";

const CustomDatePicker = ({ defaultValue, setDates, format = "yyyy/MM/dd EE", mode = "rwd", ...otherProps }) => {
	return (
		<LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={zhTW}>
			{mode === "rwd" ? (
				<DatePicker
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
					{...otherProps}
				/>
			) : (
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
					{...otherProps}
				/>
			)}
		</LocalizationProvider>
	);
};

export default CustomDatePicker;
