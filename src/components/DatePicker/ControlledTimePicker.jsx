// 日期格式查詢參考 https://www.ibm.com/docs/zh-tw/qsip/7.5?topic=language-aql-date-time-formats
import React from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { Controller, useFormContext } from "react-hook-form";
import zhTW from "date-fns/locale/zh-TW";

const ControlledTimePicker = ({ name, format = "yyyy-MM-dd", ...otherProps }) => {
	const { control } = useFormContext();

	return (
		<LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={zhTW}>
			<Controller
				name={name}
				control={control}
				defaultValue={null}
				render={({ field }) => (
					<DateTimePicker
						slotProps={{ textField: { size: "small" } }}
						className="inputPadding"
						format={format}
						dayOfWeekFormatter={(_day, weekday) => {
							console.log(); // AVOID BUG
						}}
						sx={[
							{
								width: "100%",
							},
						]}
						{...field}
						{...otherProps}
					/>
				)}
			/>
		</LocalizationProvider>
	);
};

export default ControlledTimePicker;
