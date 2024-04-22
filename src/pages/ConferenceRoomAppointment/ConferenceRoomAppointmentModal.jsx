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
 * ConferenceRoom Modal
 * @param {string} title - Modal 標題名稱
 * @param {Object} deliverInfo - 顯示資訊
 * @param {Array} factorySiteList - 廠別清單
 * @param {Function} sendDataToBackend - 傳遞給後端的函式
 * @param {Function} onClose - 關閉函式
 * @returns
 ***/
const ConferenceRoomModal = React.memo(({ title, deliverInfo, factorySiteList, sendDataToBackend, onClose }) => {
	// 通知
	const showNotification = useNotification();
	// Alert 開關
	const [alertOpen, setAlertOpen] = useState(false);
	// Modal Data
	const [apiData, setApiData] = useState(null);

	// 使用 Yup 來定義表單驗證規則
	const schema = yup.object().shape({
		factory: yup.object().required("不可為空值！"),
		name: yup.string().required("不可為空值！"),
	});

	// 初始預設 default 值
	const defaultValues = {
		factory:
			apiData && apiData.factorySite ? { id: apiData.factorySite.value, label: apiData.factorySite.chinese } : null,
		name: apiData?.name || "",
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
			getData(`conferenceRoom/${deliverInfo}`).then((result) => {
				if (result.result) {
					const data = result.result;
					setApiData(data);
				} else {
					setApiData(null);
					showNotification("會議室清單 API 請求失敗", false, 10000);
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
		fd.append("factorySite", data.factory.id);
		fd.append("name", data.name);

		if (deliverInfo) {
			sendDataToBackend(fd, "editRoom", data.name, deliverInfo);
		} else {
			sendDataToBackend(fd, "createRoom", data.name);
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
				show={!!factorySiteList && (deliverInfo ? !!apiData : true)}
				maxWidth={"480px"}
				onClose={onCheckDirty}>
				<FormProvider {...methods}>
					<form onSubmit={handleSubmit(onSubmit)}>
						<div className="flex flex-col pt-4 max-h-[67vh] overflow-y-auto">
							{/* 廠別 */}
							<div className="inline-flex flex-col w-full">
								<InputTitle classnames="whitespace-nowrap" title={"廠別"} />
								<Controller
									control={control}
									name="factory"
									render={({ field }) => {
										const { onChange, value } = field;
										return (
											<Autocomplete
												options={factorySiteList}
												noOptionsText={!!factorySiteList ? "無搜尋結果" : "API 獲取失敗，請重整網頁或檢查連線問題。"}
												value={value}
												onChange={(event, selectedOptions, reason) => {
													if (reason === "clear") {
														if (window.confirm("是否確認清空廠別欄位？")) {
															setValue("factory", null);
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
														placeholder="請選擇廠別"
														sx={{
															"& > div": { padding: "0 !important" },
														}}
														InputProps={{
															...params.InputProps,
															endAdornment: (
																<>
																	{factorySiteList.length <= 0 ? (
																		<CircularProgress className="absolute right-[2.325rem]" size={20} />
																	) : null}
																	{params.InputProps.endAdornment}
																</>
															),
														}}
													/>
												)}
												ListboxProps={{ style: { maxHeight: "12rem" } }}
												loading={factorySiteList.length <= 0}
												loadingText={"載入中..."}
												fullWidth
											/>
										);
									}}
								/>
								<FormHelperText className="!text-red-600 break-words !text-right h-5">
									{errors["factory"]?.message}
								</FormHelperText>
							</div>
							{/* 會議室名稱 */}
							<div className="inline-flex flex-col w-full">
								<InputTitle classnames="whitespace-nowrap" title={"會議室名稱"} />
								<Controller
									name="name"
									control={control}
									render={({ field }) => (
										<TextField
											error={!!errors["name"]?.message}
											variant="outlined"
											size="small"
											className="inputPadding"
											placeholder="請輸入會議室名稱"
											inputProps={{ maxLength: 25 }}
											fullWidth
											{...field}
										/>
									)}
								/>
								<FormHelperText className="!text-red-600 break-words !text-right h-5">
									{errors["name"]?.message}
								</FormHelperText>
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
				open={!factorySiteList || (deliverInfo ? !apiData : false)}
				onClick={onCheckDirty}>
				<LoadingTwo />
			</Backdrop>
		</>
	);
});

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
	// 人員清單
	const [membersList, setMembersList] = useState([]);
	// 會議室清單
	const [conferenceRoomList, setConferenceRoomList] = useState([]);

	// 使用 Yup 來定義表單驗證規則
	const schema = yup.object().shape({
		dep: yup.object().required("不可為空值！"),
		applicant: yup.object().required("不可為空值！"),
		conferenceRoom: yup.object().required("不可為空值！"),
		sinceDate: yup.date().required("不可為空值！"),
		endDate: yup.date().nullable().min(yup.ref("sinceDate"), "結束日期不能早於開始日期").required("不可為空值！"),
	});

	// 初始預設 default 值
	const defaultValues = {
		dep: apiData ? { id: apiData.applicant.department.id, label: apiData.applicant.department.name } : null,
		applicant: apiData
			? { id: apiData.applicant.id, label: `${apiData.applicant.lastname}${apiData.applicant.firstname}` }
			: null,
		conferenceRoom: apiData
			? {
					id: apiData.conferenceRoom.id,
					label: `〔${apiData.conferenceRoom.factorySite.chinese}〕${apiData.conferenceRoom.name}`,
			  }
			: null,
		sinceDate: apiData ? new Date(apiData.since.slice(0, -6)) : null,
		endDate: apiData ? new Date(apiData.until.slice(0, -6)) : null,
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
	const watchSinceDate = watch("sinceDate");
	const watchDep = watch("dep");

	useEffect(() => {
		if (getValues("dep") !== null) {
			setMembersList(watchDep.members);
			if (!getValues("dep").members) {
				setMembersList(departmentsList.find((value) => value.id === apiData.applicant.department.id).members);
			}
		}
	}, [watchDep]);

	// 取得 Modal 資料
	useEffect(() => {
		if (deliverInfo) {
			getData(`conferenceRoomBooking/${deliverInfo}`).then((result) => {
				if (result.result) {
					const data = result.result;
					setApiData(data);
				} else {
					setApiData(null);
					showNotification("預約會議室清單 API 請求失敗", false, 10000);
				}
			});
		}
	}, [deliverInfo]);
	useEffect(() => {
		if (apiData) {
			reset(defaultValues);
		}
	}, [apiData]);

	// 取得會議室清單
	useEffect(() => {
		getData("conferenceRoom?p=1&s=500").then((result) => {
			if (result.result) {
				const data = result.result.content;
				const formattedDep = data.map((item) => ({
					label: `〔${item.factorySite.chinese}〕${item.name}`,
					id: item.id,
				}));
				setConferenceRoomList(formattedDep);
			} else {
				setConferenceRoomList([]);
				showNotification("會議室清單 API 請求失敗", false, 10000);
			}
		});
	}, []);

	// 提交表單資料到後端並執行相關操作
	const onSubmit = (data) => {
		const fd = new FormData();
		fd.append("applicant", data.applicant.id);
		fd.append("conferenceRoomId", data.conferenceRoom.id);
		fd.append("since", format(new Date(data.sinceDate), "yyyy-MM-dd'T'HH:mm"));
		fd.append("until", format(new Date(data.endDate), "yyyy-MM-dd'T'HH:mm"));

		if (deliverInfo) {
			sendDataToBackend(fd, "editAppointment", null, deliverInfo);
		} else {
			sendDataToBackend(fd, "createAppointment", { room: data.conferenceRoom.label, applicant: data.applicant.label });
		}

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
				show={!!conferenceRoomList && !!departmentsList && (deliverInfo ? !!apiData : true)}
				maxWidth={"640px"}
				onClose={onCheckDirty}>
				<FormProvider {...methods}>
					<form onSubmit={handleSubmit(onSubmit)}>
						<div className="flex flex-col pt-4 max-h-[67vh] overflow-y-auto">
							{/* 會議室 */}
							<div className="flex flex-col w-full">
								<InputTitle classnames="whitespace-nowrap" title={"會議室"} />
								<Controller
									control={control}
									name="conferenceRoom"
									render={({ field }) => {
										const { onChange, value } = field;
										return (
											<Autocomplete
												options={conferenceRoomList}
												noOptionsText={!!conferenceRoomList ? "無搜尋結果" : "API 獲取失敗，請重整網頁或檢查連線問題。"}
												value={value}
												onChange={(event, selectedOptions, reason) => {
													if (reason === "clear") {
														if (window.confirm("是否確認清空會議室欄位？")) {
															setValue("conferenceRoom", null);
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
														placeholder="請選擇會議室"
														sx={{
															"& > div": { padding: "0 !important" },
														}}
														InputProps={{
															...params.InputProps,
															endAdornment: (
																<>
																	{/* {conferenceRoomList.length <= 0 ? (
																		<CircularProgress className="absolute right-[2.325rem]" size={20} />
																	) : null} */}
																	{params.InputProps.endAdornment}
																</>
															),
														}}
													/>
												)}
												ListboxProps={{ style: { maxHeight: "12rem" } }}
												// loading={conferenceRoomList.length <= 0}
												// loadingText={"載入中..."}
												fullWidth
											/>
										);
									}}
								/>
								<FormHelperText className="!text-red-600 break-words !text-right h-5">
									{errors["conferenceRoom"]?.message}
								</FormHelperText>
							</div>
							<div className="flex sm:flex-row flex-col gap-3">
								{/* 部門 x 人員 */}
								{/* 部門 */}
								<div className="w-full">
									<InputTitle classnames="whitespace-nowrap" title={"部門"} />
									<Controller
										control={control}
										name="dep"
										render={({ field }) => {
											const { onChange, value } = field;
											return (
												<Autocomplete
													options={departmentsList}
													noOptionsText={!!departmentsList ? "無搜尋結果" : "API 獲取失敗，請重整網頁或檢查連線問題。"}
													value={value}
													onChange={(event, selectedOptions, reason) => {
														setMembersList(null);
														setValue("applicant", null);
														if (reason === "clear") {
															if (window.confirm("是否確認清空部門欄位？")) {
																setValue("dep", null);
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
										{errors["dep"]?.message}
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
													options={membersList || []}
													noOptionsText={!!membersList ? "無搜尋結果" : "API 獲取失敗，請重整網頁或檢查連線問題。"}
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
																		{/* {membersList.length <= 0 ? (
																			<CircularProgress className="absolute right-[2.325rem]" size={20} />
																		) : null} */}
																		{params.InputProps.endAdornment}
																	</>
																),
															}}
														/>
													)}
													ListboxProps={{ style: { maxHeight: "12rem" } }}
													// loading={membersList.length <= 0}
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
							{/* 開始時間 x 結束時間 */}
							<div className="flex sm:flex-row flex-col gap-3">
								<div className="w-full">
									<InputTitle title={"開始時間"} classnames="whitespace-nowrap text-primary-800 font-bold" />
									<ControlledTimePicker
										name="sinceDate"
										format="yyyy-MM-dd a h:m"
										minDateTime={new Date("2023-11")}
										minutesStep={1}
										views={["year", "day", "hours", "minutes"]}
										onChange={(newValue) => {
											setValue("sinceDate", newValue, { isDirty: true });
											setValue("endDate", null);
										}}
									/>
								</div>
								<div className="w-full">
									<InputTitle title={"結束時間"} classnames="whitespace-nowrap text-primary-800 font-bold" />
									<ControlledTimePicker
										name="endDate"
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
								{errors["sinceDate"]?.message === errors["endDate"]?.message
									? errors["sinceDate"]?.message
									: errors["endDate"]?.message}
							</FormHelperText>
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
				open={!conferenceRoomList || !departmentsList || (deliverInfo ? !apiData : false)}
				onClick={onCheckDirty}>
				<LoadingTwo />
			</Backdrop>
		</>
	);
});

export { ConferenceRoomModal, AppointmentModal };
