import React, { useState, useEffect } from "react";
import { useForm, FormProvider, Controller } from "react-hook-form";
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
	{ value: "annual", label: "上班" },
	{ value: "personal", label: "下班" },
];

const CompletePunchIO = React.memo(({ userProfile }) => {
	// 使用 Yup 來定義表單驗證規則
	const schema = yup.object().shape({
		checkedType: yup.string().required("補假類型不可為空值！"),
		reason: yup.string().max(250, "原因最多只能輸入 250 個字符").required("原因不可為空值！"),
		checkedDate: yup.date().required("補卡時間不可為空值！"),
	});

	// 初始預設 default 值
	const defaultValues = {
		checkedType: "",
		reason: "",
		checkedDate: null,
	};

	// 使用 useForm Hook 來管理表單狀態和驗證
	const methods = useForm({
		defaultValues,
		resolver: yupResolver(schema),
	});

	const {
		control,
		handleSubmit,
		formState: { errors },
	} = methods;

	// 提交表單資料到後端並執行相關操作
	const onSubmit = (data) => {
		console.log(data);
	};

	return (
		<div className="flex flex-col sm:px-4 px-2 h-full">
			{/* Header */}
			<div className="relative inline-flex items-center gap-2 pe-2 sm:pb-4 mb-4 text-primary-800">
				<FontAwesomeIcon icon={faQuoteLeft} className="text-2xl sm:text-3xl" />
				<span className="font-bold text-1xl sm:text-2xl leading-10">補卡單</span>
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

						{/* 補假類型 */}
						<div className="flex gap-3 items-center pt-4">
							<InputTitle
								title={"補假類型"}
								pb={false}
								required={true}
								classnames="whitespace-nowrap text-primary-800 font-bold -translate-y-px"
							/>
							<Controller
								name="checkedType"
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
							{errors["checkedType"]?.message}
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
										placeholder="請輸入補卡事由"
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

						{/* 補卡時間 */}
						<div className="flex flex-row items-center gap-3 pt-4">
							<InputTitle
								title={"補卡時間"}
								pb={false}
								classnames="whitespace-nowrap text-primary-800 font-bold h-min"
							/>
							<ControlledTimePicker
								name="checkedDate"
								format="yyyy-MM-dd a h:m"
								minutesStep={30}
								minDateTime={new Date("2023-11")}
							/>
						</div>
						<FormHelperText className="!text-red-600 break-words !text-right !mt-0" sx={{ minHeight: "1.25rem" }}>
							{errors["checkedDate"]?.message}
						</FormHelperText>
					</div>

					{/* Footer */}
					<Button type="submit" variant="contained" color="dark" className="!text-base !h-12 !mb-3" fullWidth>
						儲存
					</Button>
				</form>
			</FormProvider>
		</div>
	);
});

export default CompletePunchIO;
