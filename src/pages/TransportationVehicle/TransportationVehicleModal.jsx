import React, { useEffect, useState } from "react";
import { useForm, FormProvider, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

// date-fns
import { format } from "date-fns";

// MUI
import Autocomplete from "@mui/material/Autocomplete";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import FormHelperText from "@mui/material/FormHelperText";
import CircularProgress from "@mui/material/CircularProgress";
import Backdrop from "@mui/material/Backdrop";
import Divider from "@mui/material/Divider";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";

// Components
import ModalTemplete from "../../components/Modal/ModalTemplete";
import InputTitle from "../../components/Guideline/InputTitle";
import AlertDialog from "../../components/Alert/AlertDialog";
import { LoadingTwo } from "../../components/Loader/Loading";
import ControlledTimePicker from "../../components/DatePicker/ControlledTimePicker";

// Hooks
import { useNotification } from "../../hooks/useNotification";

// Utils
import { getData } from "../../utils/api";

/***
 * TransportationVehicle Modal
 * @param {string} title - Modal 標題名稱
 * @param {Object} deliverInfo - 顯示資訊
 * @param {Object} acquiredHowList - 獲得方式資料
 * @param {Object} transportationVehicleTaxList - 汽車稅費資料
 * @param {Function} sendDataToBackend - 傳遞給後端的函式
 * @param {Function} onClose - 關閉函式
 * @returns
 ***/
const ConferenceRoomModal = React.memo(
	({ title, deliverInfo, acquiredHowList, transportationVehicleTaxList, sendDataToBackend, onClose }) => {
		// 通知
		const showNotification = useNotification();
		// Alert 開關
		const [alertOpen, setAlertOpen] = useState(false);
		// Modal Data
		const [apiData, setApiData] = useState(null);

		// 使用 Yup 來定義表單驗證規則
		const schema = yup.object().shape({
			licenseTag: yup.string().required("不可為空值！"),
			acquiredHow: yup.object().required("不可為空值！"),
			transportationVehicleTax: yup.object().required("不可為空值！"),
		});

		// 初始預設 default 值
		const defaultValues = {
			licenseTag: apiData?.licenseTag || "",
			acquiredHow:
				apiData && apiData.acquiredHow ? { id: apiData.acquiredHow.value, label: apiData.acquiredHow.chinese } : null,
			transportationVehicleTax: apiData && apiData.tax ? { id: apiData.tax.value, label: apiData.tax.chinese } : null,
		};

		// 使用 useForm Hook 來管理表單狀態和驗證
		const methods = useForm({
			defaultValues,
			resolver: yupResolver(schema),
		});

		const {
			control,
			setValue,
			reset,
			handleSubmit,
			formState: { errors, isDirty },
		} = methods;

		// 取得 Modal 資料
		useEffect(() => {
			if (deliverInfo) {
				getData(`transportationVehicle/${deliverInfo}`).then((result) => {
					if (result.result) {
						const data = result.result;
						setApiData(data);
					} else {
						setApiData(null);
						showNotification("車輛清單 API 請求失敗", false, 10000);
					}
				});
			}
		}, [deliverInfo]);
		useEffect(() => {
			if (apiData) {
				reset(defaultValues);
			}
		}, [apiData]);

		// 提交表單資料到後端並執行相關操作
		const onSubmit = (data) => {
			const fd = new FormData();
			fd.append("licenseTag", data.licenseTag);
			fd.append("acquiredHow", data.acquiredHow.id);
			fd.append("transportationVehicleTax", data.transportationVehicleTax.id);

			if (deliverInfo) {
				sendDataToBackend(fd, "editCar", data.licenseTag, deliverInfo);
			} else {
				sendDataToBackend(fd, "createCar", data.licenseTag);
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
					show={!!acquiredHowList && !!transportationVehicleTaxList && (deliverInfo ? !!apiData : true)}
					maxWidth={"480px"}
					onClose={onCheckDirty}>
					<FormProvider {...methods}>
						<form onSubmit={handleSubmit(onSubmit)}>
							<div className="flex flex-col pt-4 max-h-[67vh] overflow-y-auto">
								{/* 車牌號碼 */}
								<div className="inline-flex flex-col w-full">
									<InputTitle classnames="whitespace-nowrap" title={"車牌號碼"} />
									<Controller
										name="licenseTag"
										control={control}
										render={({ field }) => (
											<TextField
												error={!!errors["licenseTag"]?.message}
												variant="outlined"
												size="small"
												className="inputPadding"
												placeholder="請輸入車牌號碼"
												inputProps={{ maxLength: 25 }}
												fullWidth
												{...field}
											/>
										)}
									/>
									<FormHelperText className="!text-red-600 break-words !text-right h-5">
										{errors["licenseTag"]?.message}
									</FormHelperText>
								</div>
								{/* 獲得方式 */}
								<div className="inline-flex flex-col w-full">
									<InputTitle classnames="whitespace-nowrap" title={"獲得方式"} />
									<Controller
										control={control}
										name="acquiredHow"
										render={({ field }) => {
											const { onChange, value } = field;
											return (
												<Autocomplete
													options={acquiredHowList}
													noOptionsText={!!acquiredHowList ? "無搜尋結果" : "API 獲取失敗，請重整網頁或檢查連線問題。"}
													value={value}
													onChange={(event, selectedOptions, reason) => {
														if (reason === "clear") {
															if (window.confirm("是否確認清空獲得方式欄位？")) {
																setValue("acquiredHow", null);
															}
														} else {
															onChange(selectedOptions);
														}
													}}
													isOptionEqualToValue={(option, value) => option.label === value.label}
													renderInput={(params) => (
														<TextField
															{...params}
															className="inputPadding bg-white"
															placeholder="請選擇獲得方式"
															sx={{
																"& > div": { padding: "0 !important" },
															}}
															InputProps={{
																...params.InputProps,
																endAdornment: (
																	<>
																		{acquiredHowList.length <= 0 ? (
																			<CircularProgress className="absolute right-[2.325rem]" size={20} />
																		) : null}
																		{params.InputProps.endAdornment}
																	</>
																),
															}}
														/>
													)}
													ListboxProps={{ style: { maxHeight: "12rem" } }}
													loading={acquiredHowList.length <= 0}
													loadingText={"載入中..."}
													fullWidth
												/>
											);
										}}
									/>
									<FormHelperText className="!text-red-600 break-words !text-right h-5">
										{errors["acquiredHow"]?.message}
									</FormHelperText>
								</div>
								{/* 汽車稅費 */}
								<div className="inline-flex flex-col w-full">
									<InputTitle classnames="whitespace-nowrap" title={"汽車稅費"} />
									<Controller
										control={control}
										name="transportationVehicleTax"
										render={({ field }) => {
											const { onChange, value } = field;
											return (
												<Autocomplete
													options={transportationVehicleTaxList}
													noOptionsText={
														!!transportationVehicleTaxList ? "無搜尋結果" : "API 獲取失敗，請重整網頁或檢查連線問題。"
													}
													value={value}
													onChange={(event, selectedOptions, reason) => {
														if (reason === "clear") {
															if (window.confirm("是否確認清空汽車稅費欄位？")) {
																setValue("transportationVehicleTax", null);
															}
														} else {
															onChange(selectedOptions);
														}
													}}
													isOptionEqualToValue={(option, value) => option.label === value.label}
													renderInput={(params) => (
														<TextField
															{...params}
															className="inputPadding bg-white"
															placeholder="請選擇汽車稅費"
															sx={{
																"& > div": { padding: "0 !important" },
															}}
															InputProps={{
																...params.InputProps,
																endAdornment: (
																	<>
																		{transportationVehicleTaxList.length <= 0 ? (
																			<CircularProgress className="absolute right-[2.325rem]" size={20} />
																		) : null}
																		{params.InputProps.endAdornment}
																	</>
																),
															}}
														/>
													)}
													ListboxProps={{ style: { maxHeight: "12rem" } }}
													loading={transportationVehicleTaxList.length <= 0}
													loadingText={"載入中..."}
													fullWidth
												/>
											);
										}}
									/>
									<FormHelperText className="!text-red-600 break-words !text-right h-5">
										{errors["transportationVehicleTax"]?.message}
									</FormHelperText>
								</div>
								{/* 按鈕 Btn Group */}
								<div className="flex sm:flex-row flex-col gap-2">
									<Button
										type="submit"
										variant="contained"
										color="success"
										className="!text-base !h-12 !mt-3"
										fullWidth>
										送出
									</Button>
								</div>
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
					open={!acquiredHowList || !transportationVehicleTaxList || (deliverInfo ? !apiData : false)}
					onClick={onCheckDirty}>
					<LoadingTwo />
				</Backdrop>
			</>
		);
	}
);

/***
 * Appointment Modal
 * @param {string} title - Modal 標題名稱
 * @param {Object} deliverInfo - 顯示資訊
 * @param {Array} departmentsList - 部門清單
 * @param {Function} sendDataToBackend - 傳遞給後端的函式
 * @param {Function} onClose - 關閉函式
 * @returns
 ***/
const AppointmentModal = React.memo(({ title, deliverInfo, departmentsList, sendDataToBackend, onClose }) => {
	// 通知
	const showNotification = useNotification();
	// Alert 開關
	const [alertOpen, setAlertOpen] = useState(false);
	// Modal Data
	const [apiData, setApiData] = useState(null);
	// 申請人員清單
	const [membersOneList, setMembersOneList] = useState([]);
	// 使用人員清單
	const [membersTwoList, setMembersTwoList] = useState([]);
	// 車輛清單
	const [transportationVehicleList, setTransportationVehicleList] = useState([]);

	// 使用 Yup 來定義表單驗證規則
	const schema = yup.object().shape({
		depOne: yup.object().required("不可為空值！"),
		applicant: yup.object().required("不可為空值！"),
		vehicle: yup.object().required("不可為空值！"),
		depTwo: yup.object().required("不可為空值！"),
		driver: yup.object().required("不可為空值！"),
		usage: yup.string().required("不可為空值！"),
		estimatedSince: yup.date().required("不可為空值！"),
		estimatedUntil: yup
			.date()
			.nullable()
			.min(yup.ref("estimatedSince"), "結束日期不能早於開始日期")
			.required("不可為空值！"),
		mileageBefore: yup.string(),
		mileageAfter: yup.string().when("mileageBefore", (mileageBefore, schema) => {
			return (
				mileageBefore &&
				schema.test("is-greater", "後一個數字必須大於或等於前一個數字", function (value) {
					return !mileageBefore || !value || parseFloat(value) >= parseFloat(mileageBefore);
				})
			);
		}),
	});

	// 初始預設 default 值
	const defaultValues = {
		depOne: apiData ? { id: apiData.applicant.department.id, label: apiData.applicant.department.name } : null,
		applicant: apiData
			? { id: apiData.applicant.id, label: `${apiData.applicant.lastname}${apiData.applicant.firstname}` }
			: null,
		vehicle: apiData
			? {
					id: apiData.vehicle.id,
					label: apiData.vehicle.licenseTag,
			  }
			: null,
		depTwo: apiData ? { id: apiData.driver.department.id, label: apiData.driver.department.name } : null,
		driver: apiData ? { id: apiData.driver.id, label: `${apiData.driver.lastname}${apiData.driver.firstname}` } : null,
		usage: apiData?.usage || "",
		estimatedSince: apiData ? new Date(apiData.estimatedSince.slice(0, -6)) : null,
		estimatedUntil: apiData ? new Date(apiData.estimatedUntil.slice(0, -6)) : null,
		mileageBefore: apiData?.mileageBefore || "",
		mileageAfter: apiData?.mileageAfter || "",
	};

	// 使用 useForm Hook 來管理表單狀態和驗證
	const methods = useForm({
		defaultValues,
		resolver: yupResolver(schema),
	});

	const {
		control,
		watch,
		getValues,
		setValue,
		reset,
		handleSubmit,
		formState: { errors, isDirty },
	} = methods;
	const watchSinceDate = watch("estimatedSince");
	const watchDepOne = watch("depOne");
	const watchDepTwo = watch("depTwo");

	useEffect(() => {
		if (getValues("depOne") !== null) {
			setMembersOneList(watchDepOne.members);
			if (!getValues("depOne").members) {
				setMembersOneList(departmentsList.find((value) => value.id === apiData.applicant.department.id).members);
			}
		}
	}, [watchDepOne]);

	useEffect(() => {
		if (getValues("depTwo") !== null) {
			setMembersTwoList(watchDepTwo.members);
			if (!getValues("depTwo").members) {
				setMembersTwoList(departmentsList.find((value) => value.id === apiData.driver.department.id).members);
			}
		}
	}, [watchDepTwo]);

	// 取得 Modal 資料
	useEffect(() => {
		if (deliverInfo) {
			getData(`transportationVehicleDispatchment/${deliverInfo}`).then((result) => {
				if (result.result) {
					const data = result.result;
					setApiData(data);
				} else {
					setApiData(null);
					showNotification("預約車輛清單 API 請求失敗", false, 10000);
				}
			});
		}
	}, [deliverInfo]);
	useEffect(() => {
		if (apiData) {
			reset(defaultValues);
		}
	}, [apiData]);

	// 取得車輛清單
	useEffect(() => {
		getData("transportationVehicle?p=1&s=500").then((result) => {
			if (result.result) {
				const data = result.result.content;
				const formattedList = data.map((item) => ({
					label: item.licenseTag,
					id: item.id,
				}));
				setTransportationVehicleList(formattedList);
			} else {
				setTransportationVehicleList([]);
				showNotification("車輛清單 API 請求失敗", false, 10000);
			}
		});
	}, []);

	// 提交表單資料到後端並執行相關操作
	const onSubmit = (data) => {
		const fd = new FormData();
		fd.append("applicant", data.applicant.id);
		fd.append("vehicle", data.vehicle.id);
		fd.append("driver", data.driver.id);
		fd.append("usage", data.usage);
		fd.append("estimatedSince", format(new Date(data.estimatedSince), "yyyy-MM-dd'T'HH:mm"));
		fd.append("estimatedUntil", format(new Date(data.estimatedUntil), "yyyy-MM-dd'T'HH:mm"));
		fd.append("mileageBefore", data.mileageBefore);
		fd.append("mileageAfter", data.mileageAfter);

		if (deliverInfo) {
			sendDataToBackend(fd, "editAppointment", null, deliverInfo);
		} else {
			sendDataToBackend(fd, "createAppointment");
		}

		// console.log(data);

		// for (var pair of fd.entries()) {
		// 	console.log(pair);
		// }
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
				show={!!transportationVehicleList && !!departmentsList && (deliverInfo ? !!apiData : true)}
				maxWidth={"640px"}
				onClose={onCheckDirty}>
				<FormProvider {...methods}>
					<form onSubmit={handleSubmit(onSubmit)}>
						<div className="flex flex-col pt-4 max-h-[68vh] overflow-hidden">
							{/* 主要區域 */}
							<div className="flex-1 overflow-y-auto px-1">
								{/* 車輛 */}
								<div className="flex flex-col w-full">
									<InputTitle classnames="whitespace-nowrap" title={"車輛"} />
									<Controller
										control={control}
										name="vehicle"
										render={({ field }) => {
											const { onChange, value } = field;
											return (
												<Autocomplete
													options={transportationVehicleList}
													noOptionsText={
														!!transportationVehicleList ? "無搜尋結果" : "API 獲取失敗，請重整網頁或檢查連線問題。"
													}
													value={value}
													onChange={(event, selectedOptions, reason) => {
														if (reason === "clear") {
															if (window.confirm("是否確認清空車輛欄位？")) {
																setValue("vehicle", null);
															}
														} else {
															onChange(selectedOptions);
														}
													}}
													isOptionEqualToValue={(option, value) => option.label === value.label}
													renderInput={(params) => (
														<TextField
															{...params}
															className="inputPadding bg-white"
															placeholder="請選擇車輛"
															sx={{
																"& > div": { padding: "0 !important" },
															}}
															InputProps={{
																...params.InputProps,
																endAdornment: (
																	<>
																		{/* {transportationVehicleList.length <= 0 ? (
																		<CircularProgress className="absolute right-[2.325rem]" size={20} />
																	) : null} */}
																		{params.InputProps.endAdornment}
																	</>
																),
															}}
														/>
													)}
													ListboxProps={{ style: { maxHeight: "12rem" } }}
													// loading={transportationVehicleList.length <= 0}
													// loadingText={"載入中..."}
													fullWidth
												/>
											);
										}}
									/>
									<FormHelperText className="!text-red-600 break-words !text-right h-5">
										{errors["vehicle"]?.message}
									</FormHelperText>
								</div>
								{/* 申請部門 x 申請人 set 1 */}
								<div className="flex sm:flex-row flex-col gap-3">
									{/* 部門 */}
									<div className="w-full">
										<InputTitle classnames="whitespace-nowrap" title={"申請部門"} />
										<Controller
											control={control}
											name="depOne"
											render={({ field }) => {
												const { onChange, value } = field;
												return (
													<Autocomplete
														options={departmentsList}
														noOptionsText={
															!!departmentsList ? "無搜尋結果" : "API 獲取失敗，請重整網頁或檢查連線問題。"
														}
														value={value}
														onChange={(event, selectedOptions, reason) => {
															setMembersOneList(null);
															setValue("applicant", null);
															if (reason === "clear") {
																if (window.confirm("是否確認清空部門欄位？")) {
																	setValue("depOne", null);
																}
															} else {
																onChange(selectedOptions);
															}
														}}
														isOptionEqualToValue={(option, value) => option.label === value.label}
														renderInput={(params) => (
															<TextField
																{...params}
																className="inputPadding bg-white"
																placeholder="請選擇部門"
																sx={{
																	"& > div": { padding: "0 !important" },
																}}
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
										<FormHelperText className="!text-red-600 break-words !text-right h-5">
											{errors["depOne"]?.message}
										</FormHelperText>
									</div>
									{/* 人員 */}
									<div className="w-full">
										<InputTitle classnames="whitespace-nowrap" title={"申請人"} />
										<Controller
											control={control}
											name="applicant"
											render={({ field }) => {
												const { onChange, value } = field;
												return (
													<Autocomplete
														options={membersOneList || []}
														noOptionsText={!!membersOneList ? "無搜尋結果" : "API 獲取失敗，請重整網頁或檢查連線問題。"}
														value={value}
														onChange={(event, selectedOptions, reason) => {
															if (reason === "clear") {
																if (window.confirm("是否確認清空申請人欄位？")) {
																	setValue("applicant", null);
																}
															} else {
																onChange(selectedOptions);
															}
														}}
														isOptionEqualToValue={(option, value) => option.label === value.label}
														renderInput={(params) => (
															<TextField
																{...params}
																className="inputPadding bg-white"
																placeholder="請選擇申請人"
																sx={{
																	"& > div": { padding: "0 !important" },
																}}
																InputProps={{
																	...params.InputProps,
																	endAdornment: (
																		<>
																			{/* {membersListOne.length <= 0 ? (
																			<CircularProgress className="absolute right-[2.325rem]" size={20} />
																		) : null} */}
																			{params.InputProps.endAdornment}
																		</>
																	),
																}}
															/>
														)}
														ListboxProps={{ style: { maxHeight: "12rem" } }}
														// loading={membersListOne.length <= 0}
														// loadingText={"載入中..."}
														fullWidth
													/>
												);
											}}
										/>
										<FormHelperText className="!text-red-600 break-words !text-right h-5">
											{errors["applicant"]?.message}
										</FormHelperText>
									</div>
								</div>
								{/* 使用部門 x 使用者 set 2 */}
								<div className="flex sm:flex-row flex-col gap-3">
									{/* 部門 */}
									<div className="w-full">
										<InputTitle classnames="whitespace-nowrap" title={"使用部門"} />
										<Controller
											control={control}
											name="depTwo"
											render={({ field }) => {
												const { onChange, value } = field;
												return (
													<Autocomplete
														options={departmentsList}
														noOptionsText={
															!!departmentsList ? "無搜尋結果" : "API 獲取失敗，請重整網頁或檢查連線問題。"
														}
														value={value}
														onChange={(event, selectedOptions, reason) => {
															setMembersTwoList(null);
															setValue("driver", null);
															if (reason === "clear") {
																if (window.confirm("是否確認清空部門欄位？")) {
																	setValue("depOne", null);
																}
															} else {
																onChange(selectedOptions);
															}
														}}
														isOptionEqualToValue={(option, value) => option.label === value.label}
														renderInput={(params) => (
															<TextField
																{...params}
																className="inputPadding bg-white"
																placeholder="請選擇部門"
																sx={{
																	"& > div": { padding: "0 !important" },
																}}
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
										<FormHelperText className="!text-red-600 break-words !text-right h-5">
											{errors["depTwo"]?.message}
										</FormHelperText>
									</div>
									{/* 人員 */}
									<div className="w-full">
										<InputTitle classnames="whitespace-nowrap" title={"使用者"} />
										<Controller
											control={control}
											name="driver"
											render={({ field }) => {
												const { onChange, value } = field;
												return (
													<Autocomplete
														options={membersTwoList || []}
														noOptionsText={!!membersTwoList ? "無搜尋結果" : "API 獲取失敗，請重整網頁或檢查連線問題。"}
														value={value}
														onChange={(event, selectedOptions, reason) => {
															if (reason === "clear") {
																if (window.confirm("是否確認清空使用者欄位？")) {
																	setValue("driver", null);
																}
															} else {
																onChange(selectedOptions);
															}
														}}
														isOptionEqualToValue={(option, value) => option.label === value.label}
														renderInput={(params) => (
															<TextField
																{...params}
																className="inputPadding bg-white"
																placeholder="請選擇使用者"
																sx={{
																	"& > div": { padding: "0 !important" },
																}}
																InputProps={{
																	...params.InputProps,
																	endAdornment: (
																		<>
																			{/* {membersTwoList.length <= 0 ? (
																			<CircularProgress className="absolute right-[2.325rem]" size={20} />
																		) : null} */}
																			{params.InputProps.endAdornment}
																		</>
																	),
																}}
															/>
														)}
														ListboxProps={{ style: { maxHeight: "12rem" } }}
														// loading={membersTwoList.length <= 0}
														// loadingText={"載入中..."}
														fullWidth
													/>
												);
											}}
										/>
										<FormHelperText className="!text-red-600 break-words !text-right h-5">
											{errors["driver"]?.message}
										</FormHelperText>
									</div>
								</div>
								{/* 用途 */}
								<div className="flex flex-col w-full">
									<InputTitle title={"用途"} classnames="whitespace-nowrap" />
									<Controller
										name="usage"
										control={control}
										render={({ field }) => (
											<TextField
												multiline
												rows={2}
												className="inputPadding"
												placeholder="請輸入用途"
												fullWidth
												{...field}
											/>
										)}
									/>
									<FormHelperText className="!text-red-600 break-words !text-right !mt-0" sx={{ minHeight: "1.25rem" }}>
										{errors["usage"]?.message}
									</FormHelperText>
								</div>
								{/* 開始使用時間 x 結束使用時間 */}
								<div className="flex sm:flex-row flex-col gap-3">
									<div className="w-full">
										<InputTitle title={"開始使用時間"} classnames="whitespace-nowrap" />
										<ControlledTimePicker
											name="estimatedSince"
											format="yyyy-MM-dd a h:m"
											minDateTime={new Date("2023-11")}
											minutesStep={1}
											views={["year", "day", "hours", "minutes"]}
											onChange={(newValue) => {
												setValue("estimatedSince", newValue, { isDirty: true });
												setValue("estimatedUntil", null);
											}}
										/>
									</div>
									<div className="w-full">
										<InputTitle title={"結束使用時間"} classnames="whitespace-nowrap" />
										<ControlledTimePicker
											name="estimatedUntil"
											format="yyyy-MM-dd a h:m"
											minDateTime={(() => {
												if (watchSinceDate) {
													const adjustedDate = new Date(watchSinceDate);
													adjustedDate.setMinutes(adjustedDate.getMinutes() + 1);
													return adjustedDate;
												} else {
													return null;
												}
											})()}
											maxDateTime={(() => {
												const day = new Date(watchSinceDate);
												day.setHours(23, 59, 59, 999);
												return day;
											})()}
											disabled={!watchSinceDate}
											views={["year", "day", "hours", "minutes"]}
										/>
									</div>
								</div>
								<FormHelperText className="!text-red-600 break-words !text-right !mt-0" sx={{ minHeight: "1.25rem" }}>
									{errors["estimatedSince"]?.message === errors["estimatedUntil"]?.message
										? errors["estimatedSince"]?.message
										: errors["estimatedUntil"]?.message}
								</FormHelperText>
							</div>
							{/* 編輯才出現區域 */}
							<Divider className="!border-[1px] !my-3" />
							<div className="flex mb-1">
								<p className="!my-0 text-rose-400 font-bold text-xs !me-1">＊</p>
								<p className="!my-0 text-rose-400 font-bold text-xs">以下為選填選項，單位為公里 (km)。</p>
							</div>
							{/* 出發前里程數 x 返回後里程數 */}
							<div className="flex gap-3">
								{/* 出發前里程數 */}
								<div className="w-full">
									<InputTitle classnames="whitespace-nowrap" title={"出發前里程數"} required={false} />
									<Controller
										name="mileageBefore"
										control={control}
										render={({ field }) => (
											<TextField
												type="number"
												error={!!errors["mileageBefore"]?.message}
												variant="outlined"
												size="small"
												className="inputPadding"
												placeholder="請輸入出發前里程數"
												inputProps={{ step: 0.1 }}
												fullWidth
												{...field}
											/>
										)}
									/>
									<FormHelperText className="!text-red-600 break-words !text-right h-5">
										{errors["mileageBefore"]?.message}
									</FormHelperText>
								</div>
								{/* 返回後里程數 */}
								<div className="w-full">
									<InputTitle classnames="whitespace-nowrap" title={"返回後里程數"} required={false} />
									<Controller
										name="mileageAfter"
										control={control}
										render={({ field }) => (
											<TextField
												type="number"
												error={!!errors["mileageAfter"]?.message}
												variant="outlined"
												size="small"
												className="inputPadding"
												placeholder="請輸入返回後里程數"
												inputProps={{ step: 0.1 }}
												fullWidth
												{...field}
											/>
										)}
									/>
									<FormHelperText className="!text-red-600 break-words !text-right h-5">
										{errors["mileageAfter"]?.message}
									</FormHelperText>
								</div>
							</div>

							{/* 按鈕 Btn Group */}
							<div className="flex sm:flex-row flex-col gap-2">
								<Button type="submit" variant="contained" color="success" className="!text-base !h-12 !mt-3" fullWidth>
									送出
								</Button>
							</div>
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
				open={!transportationVehicleList || !departmentsList || (deliverInfo ? !apiData : false)}
				onClick={onCheckDirty}>
				<LoadingTwo />
			</Backdrop>
		</>
	);
});

export { ConferenceRoomModal, AppointmentModal };
