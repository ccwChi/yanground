// 日期格式查詢參考 https://www.ibm.com/docs/zh-tw/qsip/7.5?topic=language-aql-date-time-formats
import React from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
// import { MobileDatePicker } from "@mui/x-date-pickers/MobileDatePicker";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { Controller, useFormContext } from "react-hook-form";
import zhTW from "date-fns/locale/zh-TW";
import { MobileDatePicker } from "@mui/x-date-pickers";

const ControlledDatePicker = ({
  name,
  format = "yyyy-MM-dd",
  mode = "moblie",
  ...otherProps
}) => {
  const { control } = useFormContext();

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={zhTW}>
      <Controller
        name={name}
        control={control}
        defaultValue={null}
        render={({ field }) =>
          mode === "rwd" ? (
            <DatePicker
              slotProps={{ textField: { size: "small" } }}
              className="inputPadding"
              closeOnSelect={true}
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
          ) : (
            <MobileDatePicker
              slotProps={{ textField: { size: "small" } }}
              className="inputPadding"
              format={format}
              closeOnSelect={true}
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
          )
        }
      />
    </LocalizationProvider>
  );
};

export default ControlledDatePicker;

// <DatePicker
// 						slotProps={{ textField: { size: "small" } }}
// 						className="inputPadding"
// 						closeOnSelect={true}
// 						format={format}
// 						dayOfWeekFormatter={(_day, weekday) => {
// 							console.log(); // AVOID BUG
// 						}}
// 						sx={[
// 							{
// 								width: "100%",
// 							},
// 						]}
// 						{...field}
// 						{...otherProps}
// 					/>
