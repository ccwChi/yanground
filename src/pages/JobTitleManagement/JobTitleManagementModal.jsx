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
import ModalTemplete from "../../components/Modal/ModalTemplete";
import InputTitle from "../../components/Guideline/InputTitle";
import AlertDialog from "../../components/Alert/AlertDialog";
import { LoadingTwo } from "../../components/Loader/Loading";
// Utils
import { getData } from "../../utils/api";

/***
 * Updated Modal
 * @param {string} title - Modal 標題名稱
 * @param {Object} deliverInfo - 顯示資訊
 * @param {Array} departmentsList - 部門清單
 * @param {Function} sendDataToBackend - 傳遞給後端的函式
 * @param {Function} onClose - 關閉函式
 * @returns
 ***/
const UpdatedModal = React.memo(({ title, deliverInfo, departmentsList, sendDataToBackend, onClose }) => {
	// 職稱清單選擇主管
	const [supervisorTitles, setSupervisorTitles] = useState([]);
	// Alert 開關
	const [alertOpen, setAlertOpen] = useState(false);
	// Modal Data
	const [apiData, setApiData] = useState(null);

	// 使用 Yup 來定義表單驗證規則
	const schema = yup.object().shape({
		department: yup.object().required("不可為空值！"),
		name: yup.string().required("不可為空值！"),
	});

	// 初始預設 default 值
	const defaultValues = {
		supervisor: apiData && apiData.supervisor ? { id: apiData.supervisor.id, label: apiData.supervisor.name } : null,
		department: apiData && apiData.department ? { id: apiData.department.id, label: apiData.department.name } : null,
		name: apiData ? apiData.name : "",
		approvable: apiData ? apiData.approvable : false,
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

	// 取得 Modal 資料 x 取得職稱資料
	useEffect(() => {
		if (deliverInfo) {
			getData(`jobTitle/${deliverInfo}`).then((result) => {
				if (result.result) {
					const data = result.result;
					setApiData(data);
				} else {
					setApiData(null);
				}
			});
		}
		getData(`jobTitle?p=1&s=200`).then((result) => {
			if (result.result) {
				const data = result.result.content;
				const formattedList = data.map((obj) => ({ label: obj.name, id: obj.id }));
				setSupervisorTitles(formattedList);
			} else {
				setSupervisorTitles([]);
			}
		});
	}, [deliverInfo]);
	useEffect(() => {
		if (apiData) {
			reset(defaultValues);
		}
	}, [apiData]);

	// 過濾自己無法選擇自己成為直屬主管
	useEffect(() => {
		if (supervisorTitles.length > 0 && !!apiData) {
			const filteredTitles = supervisorTitles.filter((obj) => obj.id !== apiData.id);
			setSupervisorTitles(filteredTitles);
		}
	}, [supervisorTitles, apiData]);

	// 檢查值是否存在，沒有就不加入 formdata
	const appendToFormData = (formData, key, value) => {
		if (value !== undefined && value !== null) {
			formData.append(key, value);
		} else {
			formData.append(key, "");
		}
	};

	// 提交表單資料到後端並執行相關操作
	const onSubmit = (data) => {
		const fd = new FormData();

		appendToFormData(fd, "department", data.department?.id);
		appendToFormData(fd, "name", data.name);
		appendToFormData(fd, "supervisor", data.supervisor?.id);

		if (deliverInfo) {
			appendToFormData(fd, "approvable", data.approvable);
			sendDataToBackend(fd, "edit", deliverInfo);
		} else {
			sendDataToBackend(fd, "create");
		}
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
			<ModalTemplete
				title={title}
				show={deliverInfo ? !!apiData && !!supervisorTitles : !!departmentsList}
				maxWidth={"640px"}
				onClose={onCheckDirty}>
				<FormProvider {...methods}>
					<form onSubmit={handleSubmit(onSubmit)}>
						<div className="flex flex-col pt-4 gap-4">
							<div className="flex flex-col overflow-y-auto px-1 pb-1" style={{ maxHeight: "60vh" }}>
								{/* 部門 & 職稱 */}
								<div className="inline-flex sm:flex-row flex-col sm:gap-2 gap-1">
									{/* 部門 */}
									<div className="inline-flex flex-col w-full">
										<InputTitle classnames="whitespace-nowrap" title={"職稱所屬部門"} />
										<Controller
											control={control}
											name="department"
											render={({ field }) => {
												const { onChange, value } = field;
												return (
													<Autocomplete
														options={departmentsList}
														value={value}
														onChange={(event, selectedOptions) => {
															onChange(selectedOptions);
														}}
														isOptionEqualToValue={(option, value) => option.label === value.label}
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
																			{departmentsList.length <= 0 ? (
																				<CircularProgress className="absolute right-[2.325rem]" size={20} />
																			) : null}
																			{params.InputProps.endAdornment}
																		</>
																	),
																}}
															/>
														)}
														ListboxProps={{ style: { maxHeight: "12rem" } }}
														loading={departmentsList.length <= 0}
														loadingText={"載入中..."}
														fullWidth
													/>
												);
											}}
										/>
										<FormHelperText className="!text-red-600 break-words !text-right !mt-0 h-5">
											{errors["department"]?.message}
										</FormHelperText>
									</div>
									{/* 名稱 */}
									<div className="inline-flex flex-col w-full">
										<InputTitle title={"名稱"} />
										<Controller
											name="name"
											control={control}
											render={({ field }) => (
												<TextField
													error={!!errors["name"]?.message}
													variant="outlined"
													size="small"
													className="inputPadding"
													placeholder="請輸入名稱"
													fullWidth
													inputProps={{ maxLength: 25 }}
													{...field}
												/>
											)}
										/>
										<FormHelperText
											className="!text-red-600 break-words !text-right !mt-0 h-5"
											sx={{ minHeight: "1.25rem" }}>
											{errors["name"]?.message}
										</FormHelperText>
									</div>
								</div>
								{/* 直屬主管 */}
								<div className="inline-flex sm:flex-row flex-col sm:gap-2 gap-1">
									{/* 直屬主管 */}
									<div className="inline-flex flex-col w-full">
										<InputTitle classnames="whitespace-nowrap" title={"直屬主管"} required={false} />
										<Controller
											control={control}
											name="supervisor"
											render={({ field }) => {
												const { onChange, value } = field;
												return (
													<Autocomplete
														options={supervisorTitles}
														value={value}
														onChange={(event, selectedOptions) => {
															onChange(selectedOptions);
														}}
														isOptionEqualToValue={(option, value) => option.label === value.label}
														renderInput={(params) => (
															<TextField
																{...params}
																className="inputPadding bg-white"
																placeholder="請選擇直屬主管"
																sx={{ "& > div": { padding: "0 !important" } }}
																InputProps={{
																	...params.InputProps,
																	endAdornment: (
																		<>
																			{supervisorTitles.length <= 0 ? (
																				<CircularProgress className="absolute right-[2.325rem]" size={20} />
																			) : null}
																			{params.InputProps.endAdornment}
																		</>
																	),
																}}
															/>
														)}
														ListboxProps={{ style: { maxHeight: "12rem" } }}
														loading={supervisorTitles.length <= 0}
														loadingText={"載入中..."}
														fullWidth
													/>
												);
											}}
										/>
									</div>
								</div>

								<div
									className={`inline-flex items-center sm:gap-2 gap-1 mt-4 ${deliverInfo ? "visible" : "invisible"}`}>
									<InputTitle title={"可進行簽核"} required={false} />
									<Controller
										name="approvable"
										control={control}
										render={({ field: { value, onChange } }) => (
											<Checkbox checked={value} onChange={(e) => onChange(!value)} className="!-mt-1" />
										)}
									/>
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
			<Backdrop
				sx={{ color: "#fff", zIndex: 1050 }}
				open={deliverInfo ? !apiData || !supervisorTitles : !departmentsList}
				onClick={onCheckDirty}>
				<LoadingTwo />
			</Backdrop>
		</>
	);
});

export { UpdatedModal };
