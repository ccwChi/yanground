import React, { useState, useEffect } from "react";
import { useForm, FormProvider, Controller, get } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
// MUI
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import FormHelperText from "@mui/material/FormHelperText";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import TextField from "@mui/material/TextField";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
// FontAwesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faQuoteLeft } from "@fortawesome/free-solid-svg-icons";
// Components
import InputTitle from "../../../../components/Guideline/InputTitle";
import ControlledTimePicker from "../../../../components/DatePicker/ControlledTimePicker";

const leaveTypes = [
	{ value: "ordinary", label: "一般日加班" },
	{ value: "holiday", label: "假日加班" },
];

const WorkOvertime = React.memo(({ userProfile }) => {
	// 使用 Yup 來定義表單驗證規則
	const schema = yup.object().shape({
		leave: yup.string().required("假別不可為空值！"),
		reason: yup.string().max(100, "原因最多只能輸入 100 個字符"),
		//   .required("原因不可為空值！"),
		sinceDate: yup.date().required("開始"),
		endDate: yup.date().required("結束時間不可為空值！"),
	});
	// 初始預設 default 值
	const defaultValues = {
		leave: "",
		reason: "",
		sinceDate: null,
		endDate: null,
		agent: null,
	};

	// 使用 useForm Hook 來管理表單狀態和驗證
	const methods = useForm({
		defaultValues,
		resolver: yupResolver(schema),
	});

	const {
		control,
		handleSubmit,
		watch,
		getValues,
		setValue,
		formState: { errors },
	} = methods;
	const watchSinceDate = watch("sinceDate");
	const watchEndDate = watch("endDate");

	useEffect(() => {
		if (getValues("endDate") !== null) {
			setValue("endDate", null);
		}
	}, [watchSinceDate]);

	// 提交表單資料到後端並執行相關操作
	const onSubmit = (data) => {
		console.log(data);
	};

	const calculateDuration = (startTime, endTime) => {
		const start = new Date(startTime);
		const end = new Date(endTime);
		const millisecondsPerMinute = 60 * 1000; // 一分鐘的毫秒數
		const millisecondsPerHour = 60 * millisecondsPerMinute; // 一小時的毫秒數
		const millisecondsPerDay = 24 * millisecondsPerHour; // 一天的毫秒數
		const lunchBreakStart = 12 * millisecondsPerHour; // 午休開始時間（毫秒）
		const lunchBreakEnd = 13 * millisecondsPerHour; // 午休結束時間（毫秒）
		const workHoursPerDay = 8; // 一天最多工作8小時

		// 計算時間差異
		const timeDifference = end.getTime() - start.getTime();

		// 計算天數
		const days = Math.floor(timeDifference / millisecondsPerDay);

		// 計算小時數和分鐘數，扣除午休時間
		let remainingTime = timeDifference % millisecondsPerDay;

		// 扣除午休時間
		if ((start.getHours() < 12 && end.getHours() >= 13) || (start.getHours() <= 12 && end.getHours() === 13)) {
			remainingTime -= lunchBreakEnd - lunchBreakStart; // 扣除午休時間
		}

		// 確保不超過一天的最大工作時間
		const maxWorkTime = workHoursPerDay * millisecondsPerHour;
		remainingTime = Math.min(remainingTime, maxWorkTime);

		// 轉換為小時和分鐘
		const hours = Math.floor(remainingTime / millisecondsPerHour);
		const minutes = Math.round((remainingTime % millisecondsPerHour) / millisecondsPerMinute);

		if (hours === 8) {
			return { days: days + 1, hours: 0, minutes };
		} else {
			return { days, hours, minutes };
		}
	};

	return (
		<div className="flex flex-col sm:px-4 px-2 h-full">
			{/* Header */}
			<div className="relative inline-flex items-center gap-2 pe-2 sm:pb-4 mb-4 text-primary-800">
				<FontAwesomeIcon icon={faQuoteLeft} className="text-2xl sm:text-3xl" />
				<span className="font-bold text-1xl sm:text-2xl leading-10">加班申請單</span>
				<svg
					className="absolute -start-[1.125rem] sm:-start-[1.625rem] bottom-0 hidden sm:block"
					xmlns="http://www.w3.org/2000/svg"
					width="178"
					height="12"
					viewBox="0 0 178 12"
					fill="none">
					<rect x="98" width="80" height="12" fill="#547DB7" />
					<rect x="38" width="60" height="12" fill="#F7941D" />
					<rect width="40" height="12" fill="#039E8E" />
				</svg>
			</div>
			<FormProvider {...methods}>
				<form className="inline-flex flex-col flex-1 gap-4" onSubmit={handleSubmit(onSubmit)}>
					{/* Content */}
					<div className="flex-1">
						{/* 申請人 x 部門 */}
						<div className="flex gap-3 mb-3">
							<div className="w-full">
								<InputTitle
									title={"申請部門"}
									required={false}
									classnames="whitespace-nowrap text-primary-800 font-bold"
								/>
								<p className="sm:text-lg text-base">{userProfile?.department?.name || "-"}</p>
							</div>
							<div className="w-full">
								<InputTitle
									title={"申請人"}
									required={false}
									classnames="whitespace-nowrap text-primary-800 font-bold"
								/>
								<p className="sm:text-lg text-base">{userProfile?.lastname + userProfile?.firstname || "-"}</p>
							</div>
						</div>

						<Divider />

						{/* 加班類別 */}
						<div className="flex gap-3 items-center pt-4">
							<InputTitle
								title={"加班類別"}
								pb={false}
								required={true}
								classnames="whitespace-nowrap text-primary-800 font-bold -translate-y-px"
							/>
							<Controller
								name="leave"
								control={control}
								render={({ field }) => (
									<FormControl>
										<RadioGroup row name="row-radio-buttons-group">
											{leaveTypes.map((leaveType) => (
												<FormControlLabel
													key={leaveType.value}
													value={leaveType.value}
													control={<Radio size="small" />}
													label={leaveType.label}
													checked={field.value === leaveType.value}
													onChange={() => field.onChange(leaveType.value)}
													// {...field}
												/>
											))}
										</RadioGroup>
									</FormControl>
								)}
							/>
						</div>
						<FormHelperText className="!text-red-600 break-words !text-right !mt-0" sx={{ minHeight: "1.25rem" }}>
							{errors["leave"]?.message}
						</FormHelperText>

						<Divider />

						{/* 開始時間 x 結束時間 */}
						<div className="flex sm:flex-row flex-col gap-3 pt-4">
							<div className="w-full">
								<InputTitle title={"開始時間"} classnames="whitespace-nowrap text-primary-800 font-bold" />
								<ControlledTimePicker
									name="sinceDate"
									format="yyyy-MM-dd a h:m"
									minDateTime={new Date("2023-11")}
									minutesStep={"30"}
									views={["year", "day", "hours", "minutes"]}
								/>
							</div>
							<div className="w-full">
								<InputTitle title={"結束時間"} classnames="whitespace-nowrap text-primary-800 font-bold" />
								<ControlledTimePicker
									name="endDate"
									format="yyyy-MM-dd a h:m"
									// minDateTime={watchSinceDate}
									minDateTime={(() => {
										if (watchSinceDate) {
											const adjustedDate = new Date(watchSinceDate);
											adjustedDate.setHours(adjustedDate.getHours() + 1);
											return adjustedDate;
										} else {
											return null;
										}
									})()}
									maxDateTime={new Date(new Date().getTime() + 24 * 60 * 60 * 1000)}
									disabled={!watchSinceDate}
									views={["year", "day", "hours", "minutes"]}
								/>
							</div>
						</div>
						<FormHelperText className="!text-red-600 break-words !text-right !mt-0" sx={{ minHeight: "1.25rem" }}>
							{errors["sinceDate"] ? errors["sinceDate"].message + "/" : ""}
							{errors["endDate"]?.message}
						</FormHelperText>

						<Divider />

						{/* 原因 */}
						<div className="flex gap-3 items-start pt-4 sm:my-1">
							<InputTitle
								title={"原因"}
								required={false}
								classnames="whitespace-nowrap text-primary-800 font-bold -translate-y-px"
							/>
							<Controller
								name="reason"
								control={control}
								render={({ field }) => (
									<TextField
										multiline
										rows={3}
										className="inputPadding"
										placeholder="請輸入加班事由"
										fullWidth
										{...field}
									/>
								)}
							/>
						</div>
						<FormHelperText className="!text-red-600 break-words !text-right !mt-0" sx={{ minHeight: "1.25rem" }}>
							{errors["reason"]?.message}
						</FormHelperText>
					</div>

					{/* Footer */}
					<Button type="submit" variant="contained" color="dark" className="!text-base !h-12 !mb-3" fullWidth>
						送出
					</Button>
				</form>
			</FormProvider>
		</div>
	);
});

export default WorkOvertime;
