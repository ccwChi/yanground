import React, { useEffect, useState } from "react";
import { useForm, FormProvider, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
// MUI
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import Backdrop from "@mui/material/Backdrop";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import FormHelperText from "@mui/material/FormHelperText";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import CircularProgress from "@mui/material/CircularProgress";
// Components
import ModalTemplete from "../../../components/Modal/ModalTemplete";
import InputTitle from "../../../components/Guideline/InputTitle";
import AlertDialog from "../../../components/Alert/AlertDialog";
import { LoadingTwo } from "../../../components/Loader/Loading";
// Utils
import { getData } from "../../../utils/api";

/***
 * UploadModal
 * @param {string} title - Modal 標題名稱
 * @param {Function} sendDataToBackend - 傳遞給後端的函式
 * @param {Function} onClose - 關閉函式
 * @returns
 ***/
const UploadModal = React.memo(({ title, sendDataToBackend, onClose }) => {
	// Alert 開關
	const [alertOpen, setAlertOpen] = useState(false);
	// Modal Data
	const [apiData, setApiData] = useState(null);

	// 使用 Yup 來定義表單驗證規則
	const schema = yup.object().shape({
		name: yup.string().required("不可為空值！"),
	});

	// 初始預設 default 值
	const defaultValues = {
		name: apiData ? apiData.name : "",
	};

	// 使用 useForm Hook 來管理表單狀態和驗證
	const methods = useForm({
		defaultValues,
		resolver: yupResolver(schema),
	});

	const {
		control,
		handleSubmit,
		reset,
		formState: { errors, isDirty },
	} = methods;

	// 提交表單資料到後端並執行相關操作
	const onSubmit = (data) => {
		console.log(data);
		// sendDataToBackend(fd, "create");
	};

	// 檢查表單是否汙染
	const onCheckDirty = () => {
		if (isDirty) {
			setAlertOpen(true);
		} else {
			onClose();
		}
	};

	// Alert 回傳值進行最終結果 --- true: 關閉 modal / all: 關閉 Alert
	const handleAlertClose = (agree) => {
		if (agree) {
			onClose();
		}
		setAlertOpen(false);
	};

	return (
		<>
			{/* Modal */}
			<ModalTemplete title={title} show={true} maxWidth={"640px"} onClose={onCheckDirty}>
				<FormProvider {...methods}>
					<form onSubmit={handleSubmit(onSubmit)}>
						<div className="flex flex-col pt-4 gap-4">
							<div className="flex flex-col overflow-y-auto px-1 pb-1" style={{ maxHeight: "60vh" }}>
                                {/* 專管項目 x 專管類別 */}
								<div className="inline-flex sm:flex-row flex-col sm:gap-2 gap-1">
									{/* 專管項目 */}
									<div className="inline-flex flex-col w-full">
										<InputTitle classnames="whitespace-nowrap" title={"專管項目"} />
										<Controller
											control={control}
											name="name"
											render={({ field }) => {
												const { onChange, value } = field;
												return (
													<Autocomplete
														options={[]}
														value={value}
														onChange={(event, selectedOptions) => {
															onChange(selectedOptions);
														}}
														isOptionEqualToValue={(option, value) => option.label === value.label}
														renderInput={(params) => (
															<TextField
																{...params}
																className="inputPadding bg-white"
																placeholder="請選擇專管項目"
																sx={{ "& > div": { padding: "0 !important" } }}
																InputProps={{
																	...params.InputProps,
																	endAdornment: (
																		<>
																			{[].length <= 0 ? (
																				<CircularProgress className="absolute right-[2.325rem]" size={20} />
																			) : null}
																			{params.InputProps.endAdornment}
																		</>
																	),
																}}
															/>
														)}
														ListboxProps={{ style: { maxHeight: "12rem" } }}
														loading={[].length <= 0}
														loadingText={"載入中..."}
														fullWidth
													/>
												);
											}}
										/>
										<FormHelperText className="!text-red-600 break-words !text-right !mt-0 h-5">
											{errors["name"]?.message}
										</FormHelperText>
									</div>
									{/* 專管類別 */}
									<div className="inline-flex flex-col w-full">
										<InputTitle classnames="whitespace-nowrap" title={"專管類別"} />
										<Controller
											control={control}
											name="name"
											render={({ field }) => {
												const { onChange, value } = field;
												return (
													<Autocomplete
														options={[]}
														value={value}
														onChange={(event, selectedOptions) => {
															onChange(selectedOptions);
														}}
														isOptionEqualToValue={(option, value) => option.label === value.label}
														renderInput={(params) => (
															<TextField
																{...params}
																className="inputPadding bg-white"
																placeholder="請選擇專管類別"
																sx={{ "& > div": { padding: "0 !important" } }}
																InputProps={{
																	...params.InputProps,
																	endAdornment: (
																		<>
																			{[].length <= 0 ? (
																				<CircularProgress className="absolute right-[2.325rem]" size={20} />
																			) : null}
																			{params.InputProps.endAdornment}
																		</>
																	),
																}}
															/>
														)}
														ListboxProps={{ style: { maxHeight: "12rem" } }}
														loading={[].length <= 0}
														loadingText={"載入中..."}
														fullWidth
													/>
												);
											}}
										/>
										<FormHelperText className="!text-red-600 break-words !text-right !mt-0 h-5">
											{errors["name"]?.message}
										</FormHelperText>
									</div>
								</div>
                                {/* 專管子項目 */}
								<div className="inline-flex sm:flex-row flex-col sm:gap-2 gap-1">
									<div className="inline-flex flex-col w-full">
										<InputTitle classnames="whitespace-nowrap" title={"專管子項目"} />
										<Controller
											control={control}
											name="name"
											render={({ field }) => {
												const { onChange, value } = field;
												return (
													<Autocomplete
														options={[]}
														value={value}
														onChange={(event, selectedOptions) => {
															onChange(selectedOptions);
														}}
														isOptionEqualToValue={(option, value) => option.label === value.label}
														renderInput={(params) => (
															<TextField
																{...params}
																className="inputPadding bg-white"
																placeholder="請選擇專管子項目"
																sx={{ "& > div": { padding: "0 !important" } }}
																InputProps={{
																	...params.InputProps,
																	endAdornment: (
																		<>
																			{[].length <= 0 ? (
																				<CircularProgress className="absolute right-[2.325rem]" size={20} />
																			) : null}
																			{params.InputProps.endAdornment}
																		</>
																	),
																}}
															/>
														)}
														ListboxProps={{ style: { maxHeight: "12rem" } }}
														loading={[].length <= 0}
														loadingText={"載入中..."}
														fullWidth
													/>
												);
											}}
										/>
										<FormHelperText className="!text-red-600 break-words !text-right !mt-0 h-5">
											{errors["name"]?.message}
										</FormHelperText>
									</div>
								</div>
							</div>
							<Button type="submit" variant="contained" color="success" className="!text-base !h-12" fullWidth>
								儲存
							</Button>
						</div>
					</form>
				</FormProvider>
			</ModalTemplete>

			{/* Alert */}
			<AlertDialog
				open={alertOpen}
				onClose={handleAlertClose}
				icon={<ReportProblemIcon color="secondary" />}
				title="注意"
				content="您所做的變更尚未儲存。是否確定要關閉表單？"
				disagreeText="取消"
				agreeText="確定"
			/>

			{/* Backdrop */}
			<Backdrop sx={{ color: "#fff", zIndex: 1050 }} open={false} onClick={onCheckDirty}>
				<LoadingTwo />
			</Backdrop>
		</>
	);
});

export { UploadModal };
