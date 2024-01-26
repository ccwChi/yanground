import React, { useState, useEffect } from "react";
import { useForm, FormProvider, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
// MUI
import Autocomplete from "@mui/material/Autocomplete";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import useMediaQuery from "@mui/material/useMediaQuery";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
// Components
import PageTitle from "../../components/Guideline/PageTitle";
import InputTitle from "../../components/Guideline/InputTitle";
import ControlledDatePicker from "../../components/DatePicker/ControlledDatePicker";
// Utils
import { getData } from "../../utils/api";

const SalaryCalculation = () => {
	// 部門清單
	const [departmentList, setDepartmentList] = useState([]);
	const isTargetScreen = useMediaQuery("(max-width:767.98px)");

	// 取得部門資料
	useEffect(() => {
		getData("department").then((result) => {
			const data = result.result.content;
			const formattedDep = data.map((dep) => ({ label: dep.name, id: dep.id }));
			const optionsWithAll = [{ label: "全部", id: "" }, ...formattedDep];
			setDepartmentList(optionsWithAll);
		});
	}, []);

	// 初始預設 default 值
	const defaultValues = {
		department: null,
		date: new Date(),
	};

	// 使用 Yup 來定義表單驗證規則
	const schema = yup.object().shape({
		date: yup
			.date()
			.transform((v) => (v instanceof Date && !isNaN(v) ? v : null))
			.required("不可為空值！"),
	});

	// 使用 useForm Hook 來管理表單狀態和驗證
	const methods = useForm({
		defaultValues,
		resolver: yupResolver(schema),
	});
	const {
		control,
		handleSubmit,
		formState: { errors, isDirty },
	} = methods;

	// 提交表單資料到後端並執行相關操作
	const onSubmit = (data) => {
		const fd = new FormData();

		for (let key in data) {
			fd.append(key, data[key]);
		}

		console.log(data);
		// sendDataToBackend(fd, "temporaryannouncement", _date);
	};

	return (
		<div className="flex-1 overflow-hidden mb-4 sm:mb-0">
			{/* PageTitle */}
			<PageTitle title="考勤報表" />
			<div className="mx-[2%] bg-white rounded-lg shadow-md px-4 py-5">
				<FormProvider {...methods}>
					<form onSubmit={handleSubmit(onSubmit)}>
						<div className="flex flex-col">
							<p className="mb-4">選擇您要查看的年份和月份，然後點擊『生成報表』按鈕，以載出當月考勤結算的報表。</p>
							<Divider className="!border-[1px] !mb-6" />
							<div className="flex md:flex-row flex-col md:items-end gap-3 mb-2">
								{/* 部門 */}
								<div className="inline-flex flex-col">
									<InputTitle classnames="whitespace-nowrap" title={"部門"} required={false} />
									<Controller
										control={control}
										name="department"
										render={({ field }) => {
											const { onChange, value } = field;
											return (
												<Autocomplete
													options={departmentList}
													className="md:w-[200px] w-full"
													value={value}
													onChange={(event, selectedOptions) => {
														onChange(selectedOptions);
													}}
													isOptionEqualToValue={(option, value) => option.id === value.id}
													renderInput={(params) => (
														<TextField
															{...params}
															className="inputPadding bg-white"
															placeholder="請選擇部門"
															sx={{ "& > div": { padding: "0 !important" } }}
															InputProps={{
																...params.InputProps,
																endAdornment: (
																	<>
																		{departmentList.length <= 0 ? (
																			<CircularProgress className="absolute right-[2.325rem]" size={20} />
																		) : null}
																		{params.InputProps.endAdornment}
																	</>
																),
															}}
														/>
													)}
													loading={departmentList.length <= 0}
													loadingText={"載入中..."}
												/>
											);
										}}
									/>
								</div>
								{/* 日期 */}
								<div className="inline-flex flex-col">
									<InputTitle classnames="whitespace-nowrap" title={"日期"} required={false} />
									<ControlledDatePicker
										name="date"
										mode="rwd"
										views={["month", "year"]}
										format={"yyyy 年 MM 月"}
										minDate={new Date("2023-11")}
										sx={{ width: isTargetScreen ? "100%" : "max-content" }}
									/>
								</div>
								<Button
									type="submit"
									variant="contained"
									color="dark"
									className="!text-base !h-12 whitespace-nowrap md:w-max w-full">
									生成報表
								</Button>
							</div>
							<div className="flex mt-2">
								<p className="!my-0 text-rose-400 font-bold text-xs !me-1">＊</p>
								<p className="!my-0 text-rose-400 font-bold text-xs">若無選擇部門，則默認全部。</p>
							</div>
							<div className="flex mt-2">
								<p className="!my-0 text-rose-400 font-bold text-xs !me-1">＊</p>
								<p className="!my-0 text-rose-400 font-bold text-xs">
									每月的 10 號
									23:59:59（台灣時區，UTC+08:00）後，將凍結上一個月的考勤，此後無法修改上個月的考勤記錄。確保在此截止日期之前完成任何必要的修改。
								</p>
							</div>
						</div>
					</form>
				</FormProvider>
			</div>
		</div>
	);
};

export default SalaryCalculation;
