import React, { useState, useEffect } from "react";
import { useForm, FormProvider, Controller, get } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
// MUI
import Autocomplete from "@mui/material/Autocomplete";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
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
	{ value: "annual", label: "特休假" },
	{ value: "personal", label: "事假" },
	{ value: "sick", label: "病假" },
	{ value: "official", label: "公假" },
	{ value: "bereavement", label: "喪假" },
	{ value: "menstrual", label: "生理假" },
	{ value: "maternity", label: "產假" },
	{ value: "paternity", label: "陪產假" },
	{ value: "parental", label: "育嬰假" },
	{ value: "marriQage", label: "婚假" },
	{ value: "xxx", label: "補假" },
];

const DayOff = React.memo(({ userProfile, memberList, setIsDirty }) => {
	// 使用 Yup 來定義表單驗證規則
	const schema = yup.object().shape({
		leave: yup.string().required("假別不可為空值！"),
		reason: yup.string().max(250, "原因最多只能輸入 250 個字符").required("原因不可為空值！"),
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
		formState: { errors, isDirty },
	} = methods;
	const watchSinceDate = watch("sinceDate");
	const watchEndDate = watch("endDate");

	useEffect(() => {
		setIsDirty(isDirty);
	}, [isDirty]);

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
		<div className="flex flex-col h-full">
			<FormProvider {...methods}>
				<form className="inline-flex flex-col flex-1 gap-4 overflow-hidden" onSubmit={handleSubmit(onSubmit)}>
					{/* Content */}
					<div className="flex-1 pe-2 overflow-y-scroll">
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

						{/* 假別 */}
						<div className="flex gap-3 items-center pt-4">
							<InputTitle
								title={"假別"}
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

						{/* 原因 */}
						<div className="flex gap-3 items-start pt-4">
							<InputTitle
								title={"原因"}
								required={true}
								classnames="whitespace-nowrap text-primary-800 font-bold -translate-y-px"
							/>
							<Controller
								name="reason"
								control={control}
								render={({ field }) => (
									<TextField
										multiline
										rows={2}
										className="inputPadding"
										placeholder="請輸入請假事由"
										fullWidth
										{...field}
									/>
								)}
							/>
						</div>
						<FormHelperText className="!text-red-600 break-words !text-right !mt-0" sx={{ minHeight: "1.25rem" }}>
							{errors["reason"]?.message}
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
									views={["year", "day", "hours"]}
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
									disabled={!watchSinceDate}
									views={["year", "day", "hours"]}
								/>
							</div>
						</div>
						<FormHelperText className="!text-red-600 break-words !text-right !mt-0" sx={{ minHeight: "1.25rem" }}>
							{errors["sinceDate"] ? errors["sinceDate"].message + "/" : ""}
							{errors["endDate"]?.message}
						</FormHelperText>

						<Divider />

						{/* 代理人 x 請假總時數 */}
						<div className="flex sm:flex-row flex-col gap-3 pt-4">
							<div className="w-full">
								<InputTitle
									title={"代理人"}
									required={false}
									classnames="whitespace-nowrap text-primary-800 font-bold"
								/>
								<Controller
									name="agent"
									control={control}
									render={({ field: { onChange, ...field } }) => (
										<Autocomplete
											options={memberList}
											className="flex-1"
											onChange={(_, data) => onChange(data)}
											isOptionEqualToValue={(option, value) => option.label === value.label}
											renderInput={(params) => (
												<TextField
													{...params}
													{...field}
													className="inputPadding bg-white"
													placeholder="請選擇代理人"
													sx={{ "& > div": { padding: "0 !important" } }}
													InputProps={{
														...params.InputProps,
														endAdornment: (
															<>
																{memberList.length <= 0 ? (
																	<CircularProgress className="absolute right-[2.325rem]" size={20} />
																) : null}
																{params.InputProps.endAdornment}
															</>
														),
													}}
												/>
											)}
											loading={memberList.length <= 0}
											loadingText={"載入中..."}
											{...field}
										/>
									)}
									onChange={([, data]) => data}
								/>
							</div>
							<div className="flex flex-col w-full">
								<InputTitle
									title={"請假總時數"}
									required={false}
									classnames="whitespace-nowrap text-primary-800 font-bold"
								/>
								<div className="inline-flex items-center flex-1">
									<p className="sm:text-lg text-base">
										{watchSinceDate && watchEndDate && watchSinceDate <= watchEndDate
											? (() => {
													const duration = calculateDuration(watchSinceDate, watchEndDate);
													return (
														<span>
															{duration.days} 天 {duration.hours} 小時 {duration.minutes} 分鐘
														</span>
													);
											  })()
											: "-"}
									</p>
								</div>
							</div>
						</div>
					</div>

					{/* Footer */}
					<Button type="submit" variant="contained" color="dark" className="!text-base !h-12" fullWidth>
						送出
					</Button>
				</form>
			</FormProvider>
		</div>
	);
});

export default DayOff;
