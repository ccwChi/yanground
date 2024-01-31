import React, { useState, useEffect } from "react";
import { useForm, FormProvider, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { format } from "date-fns";
// MUI
import Autocomplete from "@mui/material/Autocomplete";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Checkbox from "@mui/material/Checkbox";
import TextField from "@mui/material/TextField";
// import useMediaQuery from "@mui/material/useMediaQuery";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
// Components
import PageTitle from "../../components/Guideline/PageTitle";
import InputTitle from "../../components/Guideline/InputTitle";
import ControlledDatePicker from "../../components/DatePicker/ControlledDatePicker";
// Utils
import { getData } from "../../utils/api";

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

const SalaryCalculation = () => {
	// 部門清單
	const [departmentList, setDepartmentList] = useState([]);
	// const isTargetScreen = useMediaQuery("(max-width:767.98px)");
	// const fixedOptions = { label: "全部", id: "" };

	// 取得部門資料
	useEffect(() => {
		getData("department").then((result) => {
			const data = result.result.content;
			const formattedDep = data.map((dep) => ({ label: dep.name, id: dep.id }));
			// const optionsWithAll = [fixedOptions, ...formattedDep];
			// setDepartmentList(optionsWithAll);
			setDepartmentList(formattedDep);
		});
	}, []);

	// 初始預設 default 值
	const defaultValues = {
		department: [],
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
	const { control, handleSubmit } = methods;

	// 提交表單資料到後端並執行相關操作
	const onSubmit = (data) => {
		const fd = new FormData();

		// 使用 map 函數將每個對象的 id 提取出來, 並將空字符串過濾掉
		const idList = data["department"].map((item) => item.id);
		const filteredIdList = idList.filter((id) => id !== "");

		fd.append("department", filteredIdList);
		fd.append("date", format(data["date"], "yyyy-MM"));

		for (var pair of fd.entries()) {
			console.log(pair[0] + ", " + pair[1]);
		}
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
							<div className="flex flex-col gap-3 mb-2">
								{/* 部門 */}
								<div className="inline-flex flex-col w-full">
									<InputTitle classnames="whitespace-nowrap" title={"部門"} required={false} />
									<Controller
										control={control}
										name="department"
										render={({ field }) => {
											const { onChange, value } = field;
											return (
												<Autocomplete
													multiple
													// limitTags={2}
													disableCloseOnSelect
													options={departmentList}
													value={value}
													onChange={(event, selectedOptions) => {
														onChange(selectedOptions);
														// onChange([...[fixedOptions], ...selectedOptions.filter((option) => option.id !== "")]);
													}}
													isOptionEqualToValue={(option, value) => option.id === value.id}
													renderTags={(tagValue, getTagProps) =>
														tagValue.map((option, index) => (
															<Chip
																label={option.label}
																{...getTagProps({ index })}
																// disabled={option.id === ""}
															/>
														))
													}
													renderOption={(props, option, { selected }) => (
														<li {...props}>
															<Checkbox
																icon={icon}
																checkedIcon={checkedIcon}
																style={{ marginRight: 8 }}
																checked={selected}
															/>
															{option.label}
														</li>
													)}
													renderInput={(params) => (
														<TextField
															{...params}
															className="inputPadding bg-white"
															placeholder="請選擇部門 (默認全部)"
															// sx={{ "& > div": { padding: "0 !important" } }}
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
													fullWidth
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
										// sx={{ width: isTargetScreen ? "100%" : "max-content" }}
									/>
								</div>
								<div className="inline-flex">
									<Button
										type="submit"
										variant="contained"
										color="dark"
										className="!text-base !h-12 whitespace-nowrap md:w-max w-full">
										生成報表
									</Button>
								</div>
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
