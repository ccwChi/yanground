import { Autocomplete, TextField } from "@mui/material";
import React from "react";
import { Controller, useFormContext } from "react-hook-form";

/**
 * @param {string} timeInterval - 目前只能選擇 30 或 0，之後有空再補10分的
 * @param {string} minTime - 最早幾點(含)
 * @param {string} maxTime - 最晚幾點(含)
 * @param {string} name - 用於 react-hook-form 的 name
 * @param {string} placeholder - 沒有選擇時的顯示
 * @param {any} otherProps - 可帶入任意 mui autocomplete 的 api，可上官網查詢
 * @param {function} getOptionDisabled - 可以在特定情況使選擇disable 使用範例查看 AttendanceSectionModal
 */

/*  預設為 "HH:mm" = 24小時制 08:00
 */

const ControlledTimeAutoComplete = ({
  timeInterval = "30",
  minTime = 8,
  maxTime = 18,
  name,
  placeholder,
  otherProps,
  getOptionDisabled = null,
}) => {
  const { control } = useFormContext();

  const timeSlots = Array.from(new Array(24 * (60 / timeInterval)))
    .map((_, index) => {
      const hour = Math.floor(index / (60 / timeInterval));
      const minute = index % (60 / timeInterval) === 0 ? "00" : timeInterval;
      const time = `${hour < 10 ? "0" : ""}${hour}:${minute}`;

      return hour >= minTime && hour <= maxTime ? time : null;
    })
    .filter((time) => time !== null && time !== `${maxTime}:30`);

  return (
    <Controller
      control={control}
      name={name}
      defaultValue={""}
      render={({ field }) => {
        const { onChange, value } = field;
        return (
          <Autocomplete
            options={timeSlots}
            value={value}
            onChange={(event, selectedOptions) => {
              onChange(selectedOptions);
            }}
            {...otherProps}
            getOptionDisabled={getOptionDisabled}
            isOptionEqualToValue={(option, value) => option.label === value.label}
            // getOptionDisabled={(option) =>
            //   option === timeSlots[0] || option === timeSlots[2]
            // }
            renderInput={(params) => (
              <TextField
                {...params}
                className="inputPadding bg-white"
                placeholder={placeholder}
                sx={{
                  "& > div": { padding: "0 !important" },
                }}
              />
            )}
            ListboxProps={{ style: { maxHeight: "12rem" } }}
            fullWidth
          />
        );
      }}
    />
  );
};

export default ControlledTimeAutoComplete;
