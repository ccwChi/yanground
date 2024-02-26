import React, { useState, useEffect, useRef } from "react";
import { useForm, FormProvider, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
// data-fns
import { format } from "date-fns";
// Leaflet
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import MapsIcon from "../../assets/icons/Map_pin_icon.png";
// MUI
import Autocomplete from "@mui/material/Autocomplete";
import Button from "@mui/material/Button";
import Backdrop from "@mui/material/Backdrop";
import TextField from "@mui/material/TextField";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import CircularProgress from "@mui/material/CircularProgress";
import FormHelperText from "@mui/material/FormHelperText";
// Component
import ModalTemplete from "../../components/Modal/ModalTemplete";
import InputTitle from "../../components/Guideline/InputTitle";
import { LoadingTwo } from "../../components/Loader/Loading";
import ControlledDatePicker from "../../components/DatePicker/ControlledDatePicker";
import ControlledOnlyTimePicker from "../../components/DatePicker/ControlledOnlyTimePicker";
// Utils
import { getData } from "../../utils/api";

// 打卡 tabbar 對應清單
const punchInOutButtons = [
	{ value: "clockPunchIn", label: "上班打卡" },
	{ value: "clockPunchOut", label: "下班打卡" },
];

/***
 * 打卡地點 Modal
 * @param {string} title - Modal 標題名稱
 * @param {Object} deliverInfo - 顯示資訊
 * @param {Function} onClose - 關閉函式
 * @returns
 ***/
const PunchLocationModal = React.memo(({ title, deliverInfo, onClose }) => {
	// 上下班用戶廠別清單
	const [workingLocList, setWorkingLocList] = useState(null);
	// 用戶廠別的資料
	const [workingLoc, setWorkingLoc] = useState(null);
	// 打卡資訊
	const [punchLog, setPunchLog] = useState(deliverInfo[punchInOutButtons[0].value]);
	// Tab 選擇 (active 概念)
	const [alignment, setAlignment] = useState(punchInOutButtons[0].value);
	// isLoading 等待請求 API
	const [isLoading, setIsLoading] = useState(false);
	// 建立 ref 儲存地圖實例
	const mapRef = useRef(null);

	// 取得用戶廠別的資料
	useEffect(() => {
		if (deliverInfo) {
			let pl1 = deliverInfo[punchInOutButtons[0].value],
				pl2 = deliverInfo[punchInOutButtons[1].value];

			// 建立 Promise 陣列，用於存放非同步請求
			let promises = [
				getData(
					`attendance/${deliverInfo.user.id}/${format(new Date(), "yyyy/MM/dd")}?latitude=${
						pl1?.latitude || ""
					}&longitude=${pl1?.longitude || ""}`
				),
				getData(
					`attendance/${deliverInfo.user.id}/${format(new Date(), "yyyy/MM/dd")}?latitude=${
						pl2?.latitude || ""
					}&longitude=${pl2?.longitude || ""}`
				),
			];

			setIsLoading(true);

			// 使用 Promise.all() 並行處理兩個非同步請求
			Promise.all(promises).then((results) => {
				// 如果兩個請求都成功
				if (results.every((result) => result.result)) {
					const data1 = results[0].result;
					const data2 = results[1].result;

					// 更新狀態
					setWorkingLocList([data1, data2]);
					setWorkingLoc(data1);
					setIsLoading(false);
				} else {
					// 如果至少有一個請求失敗
					setWorkingLocList(null);
					setWorkingLoc(null);
					setIsLoading(false);
				}
			});
		}
	}, [deliverInfo]);

	// 發生變化時，設置新的地圖中心點
	useEffect(() => {
		if (mapRef.current) {
			mapRef.current.setView([punchLog.latitude, punchLog.longitude], mapRef.current.getZoom());
		}
	}, [punchLog]);

	// Tab 切換
	const handleChange = (event, newAlignment) => {
		if (newAlignment !== null) {
			setAlignment(newAlignment);
			if (workingLocList) {
				setWorkingLoc(workingLocList[punchInOutButtons.findIndex((button) => button.value === newAlignment)]);
			}

			setPunchLog(deliverInfo[newAlignment]);
		}
	};

	// Leaflet 地圖設置指標
	let iconSize = 64;
	const customIcon = new L.Icon({
		iconUrl: MapsIcon, // 替換成你的圖示路徑
		iconSize: [iconSize, iconSize], // 圖示尺寸
		iconAnchor: [iconSize / 2, iconSize], // 圖示錨點
		popupAnchor: [0, -iconSize], // 彈出視窗位置
	});

	return (
		<>
			{/* Modal */}
			<ModalTemplete
				title={title}
				show={!isLoading}
				maxWidth={"768px"}
				onClose={() => {
					setWorkingLoc(null);
					onClose();
				}}>
				<div className="mt-3">
					<div className="flex sm:flex-row flex-col gap-2 text-sm sm:text-base pb-2">
						<p className="w-full">
							姓名：
							<span className="font-bold">{deliverInfo.user.fullName}</span>
						</p>
						<p className="w-full">
							部門：
							<span className="font-bold">{deliverInfo.user.department}</span>
						</p>
					</div>
					<div className="flex sm:flex-row flex-col gap-2 text-sm sm:text-base">
						{/* <p className="w-full">
							打卡時間：
							<span className="font-bold">
								{punchLog?.occurredAt
								? punchLog.occurredAt.split(/[T+]/).slice(0, 2).join(" ")
								: "-"}
							</span>
						</p> */}
						<p className="w-full">
							打卡狀態：
							<span className="font-bold">{deliverInfo.anomalyState.text}</span>
						</p>
						<p className="w-full">
							是否超出打卡範圍：
							<span className="font-bold">
								{punchLog
									? workingLoc
										? workingLoc.overRange
											? `超出 ${workingLoc.overRange} 公尺`
											: "否"
										: "(尚未指派打卡地點)"
									: "(無打卡資訊)"}
							</span>
						</p>
					</div>
					{/* 切換顯示按鈕 Tabbar - Start */}
					<ToggleButtonGroup
						color="primary"
						value={alignment}
						exclusive
						onChange={handleChange}
						aria-label="Punch in/out Button Group"
						className="my-3"
						fullWidth>
						{punchInOutButtons.map((button) => (
							<ToggleButton
								key={button.value}
								value={button.value}
								style={{
									backgroundColor: alignment === button.value ? "#547DB7" : undefined,
									color: alignment === button.value ? "white" : undefined,
								}}>
								{button.label}
							</ToggleButton>
						))}
					</ToggleButtonGroup>
					{/* 切換顯示按鈕 Tabbar - End */}

					{/* 地圖 - Start */}
					<div className="relative w-full h-80">
						{punchLog ? (
							<MapContainer
								ref={mapRef}
								center={[punchLog.latitude, punchLog.longitude]}
								zoom={15}
								attributionControl={false}
								className="absolute inset-0"
								doubleClickZoom={false}>
								<TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
								<Marker position={[punchLog.latitude, punchLog.longitude]} icon={customIcon}>
									<Popup minWidth={90}>
										<div className="flex flex-col items-center gap-2">
											<p className="!my-0 w-full text-sm text-left px-1.5">
												打卡日期：
												<span className="font-bold text-base">
													{punchLog.occurredAt.replace("+08", "").split("T")[0]}
												</span>
											</p>
											<p className="!my-0 w-full text-sm text-left px-1.5">
												打卡時間：
												<span className="font-bold text-base">
													{punchLog.occurredAt.replace("+08", "").split("T")[1]}
												</span>
											</p>
											<p className="!my-0 w-full text-sm text-left px-1.5">
												緯度座標：
												<span className="font-bold text-base">{punchLog.latitude}</span>
											</p>
											<p className="!my-0 w-full text-sm text-left px-1.5">
												經度座標：
												<span className="font-bold text-base">{punchLog.longitude}</span>
											</p>
										</div>
									</Popup>
								</Marker>
								{workingLoc && (
									<Circle
										center={[workingLoc.latitudeShouldBe, workingLoc.longitudeShouldBe]}
										pathOptions={{
											fillColor: "#8b96a6",
											color: "#95B07E",
											weight: 3,
										}}
										radius={workingLoc.radiusShouldBe}
										stroke={true}
									/>
								)}
							</MapContainer>
						) : (
							<div className="absolute inset-0 flex items-center justify-center bg-slate-200">
								<span className="italic text-neutral-500 text-sm sm:text-base">(無下班打卡紀錄)</span>
							</div>
						)}
					</div>
					{/* 地圖 - End */}
				</div>
			</ModalTemplete>

			{/* Backdrop */}
			<Backdrop sx={{ color: "#fff", zIndex: 1050 }} open={isLoading} onClick={onClose}>
				<LoadingTwo />
			</Backdrop>
		</>
	);
});

/***
 * 請假申請 Modal
 * @param {string} title - Modal 標題名稱
 * @param {Array} departmentsList - 部門清單
 * @param {Array} attendanceTypesList - 考勤別清單
 * @param {Function} sendDataToBackend - 傳遞給後端的函式
 * @param {Function} onClose - 關閉函式
 * @returns
 ***/
const LeaveApplicationModal = React.memo(
	({ title, departmentsList, attendanceTypesList, sendDataToBackend, onClose }) => {
		// 用戶清單
		const [usersList, setUsersList] = useState([]);
		// isLoading 等待請求 API
		const [isLoading, setIsLoading] = useState(false);

		// 初始預設 default 值
		const defaultValues = {
			department: null,
			user: null,
			attendanceType: null,
			date: new Date(),
			since: null,
			until: null,
		};

		// 使用 Yup 來定義表單驗證規則
		const schema = yup.object().shape({
			attendanceType: yup.object().required("不可為空值！"),
			department: yup.object().required("不可為空值！"),
			user: yup.object().required("不可為空值！"),
			date: yup.date().required("日期不可為空值！"),
			since: yup.date().required("起始時間不可為空值！"),
			until: yup
				.date()
				.required("結束時間不可為空值！")
				.test("is-after-since", "結束時間必須大於起始時間", function (value) {
					const { since } = this.parent;
					return value > since;
				}),
		});

		// 使用 useForm Hook 來管理表單狀態和驗證
		const methods = useForm({
			defaultValues,
			resolver: yupResolver(schema),
		});
		const {
			control,
			watch,
			setValue,
			handleSubmit,
			formState: { errors, isDirty },
		} = methods;
		const depValue = watch("department");
		const sinceValue = watch("since");

		// 取得人員資料
		useEffect(() => {
			if (depValue) {
				setValue("user", null);
				setUsersList([]);

				getData(`department/${depValue.id}/staff`).then((result) => {
					if (result.result) {
						const data = result.result;
						const formattedUser = data.map((us) => ({
							label: us.lastname && us.firstname ? us.lastname + us.firstname : us.displayName,
							id: us.id,
						}));
						setUsersList(formattedUser);
					} else {
						setUsersList([]);
					}
				});
			}
		}, [depValue]);

		// 提交表單資料到後端並執行相關操作
		const onSubmit = (data) => {
			const formattedDate = format(new Date(data.date), "yyyy-MM-dd");
			const formattedSinceTime = format(new Date(data.since), "HH:mm:ss");
			const formattedUntilTime = format(new Date(data.until), "HH:mm:ss");

			const fd = new FormData();
			fd.append("id", data.user.id);
			fd.append("type", data.attendanceType.id);
			fd.append("date", formattedDate);
			fd.append("since", `${formattedDate}T${formattedSinceTime}`);
			fd.append("until", `${formattedDate}T${formattedUntilTime}`);

			sendDataToBackend(fd, "create", data.user.label);

			// for (const pair of fd.entries()) {
			// 	console.log(pair[0], pair[1]);
			// }
		};

		return (
			<>
				{/* Modal */}
				<ModalTemplete title={title} show={true} maxWidth={"640px"} onClose={onClose}>
					<div className="mt-3">
						<FormProvider {...methods}>
							<form onSubmit={handleSubmit(onSubmit)}>
								{/* 表單區 */}
								<div className="flex flex-col gap-1 max-h-[67vh] overflow-y-auto">
									{/* 請假單 */}
									<div className="flex sm:flex-row flex-col sm:gap-3">
										{/* 請假單 */}
										<div className="inline-flex flex-col w-full">
											<InputTitle classnames="whitespace-nowrap" title={"請假類別"} />
											<Controller
												control={control}
												name="attendanceType"
												render={({ field }) => {
													const { onChange, value } = field;
													return (
														<Autocomplete
															options={attendanceTypesList}
															value={value}
															onChange={(event, selectedOptions) => {
																onChange(selectedOptions);
															}}
															isOptionEqualToValue={(option, value) => option.label === value.label}
															renderInput={(params) => (
																<TextField
																	{...params}
																	className="inputPadding bg-white"
																	placeholder="請選擇請假單類別"
																	sx={{ "& > div": { padding: "0 !important" } }}
																	InputProps={{
																		...params.InputProps,
																		endAdornment: (
																			<>
																				{attendanceTypesList.length <= 0 && depValue !== null ? (
																					<CircularProgress className="absolute right-[2.325rem]" size={20} />
																				) : null}
																				{params.InputProps.endAdornment}
																			</>
																		),
																	}}
																/>
															)}
															ListboxProps={{ style: { maxHeight: "12rem" } }}
															loading={attendanceTypesList.length <= 0 && depValue !== null}
															loadingText={"載入中..."}
															fullWidth
														/>
													);
												}}
											/>
											<FormHelperText className="!text-red-600 break-words !text-right h-5">{errors["attendanceType"]?.message}</FormHelperText>
										</div>
									</div>
									{/* 部門 x 人員 */}
									<div className="flex sm:flex-row flex-col sm:gap-3">
										{/* 部門 */}
										<div className="inline-flex flex-col w-full">
											<InputTitle classnames="whitespace-nowrap" title={"部門"} />
											<Controller
												control={control}
												name="department"
												render={({ field }) => {
													const { onChange, value } = field;
													return (
														<Autocomplete
															options={departmentsList}
															value={value}
															onChange={(event, selectedOptions, reason) => {
																if (reason === "clear") {
																	if (window.confirm("是否確認清空部門欄位？")) {
																		setValue("user", null);
																		setValue("department", null);
																		setUsersList([]);
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
											<FormHelperText className="!text-red-600 break-words !text-right h-5">{errors["department"]?.message}</FormHelperText>
										</div>
										{/* 人員 */}
										<div className="inline-flex flex-col w-full">
											<InputTitle classnames="whitespace-nowrap" title={"人員"} />
											<Controller
												control={control}
												name="user"
												render={({ field }) => {
													const { onChange, value } = field;
													return (
														<Autocomplete
															options={usersList}
															value={value}
															onChange={(event, selectedOptions) => {
																onChange(selectedOptions);
															}}
															isOptionEqualToValue={(option, value) => option.label === value.label}
															renderInput={(params) => (
																<TextField
																	{...params}
																	className="inputPadding bg-white"
																	placeholder="請選擇人員"
																	sx={{ "& > div": { padding: "0 !important" } }}
																	InputProps={{
																		...params.InputProps,
																		endAdornment: (
																			<>
																				{usersList.length <= 0 && depValue !== null ? (
																					<CircularProgress className="absolute right-[2.325rem]" size={20} />
																				) : null}
																				{params.InputProps.endAdornment}
																			</>
																		),
																	}}
																/>
															)}
															ListboxProps={{ style: { maxHeight: "12rem" } }}
															loading={usersList.length <= 0 && depValue !== null}
															loadingText={"載入中..."}
															fullWidth
														/>
													);
												}}
											/>
											<FormHelperText className="!text-red-600 break-words !text-right h-5">{errors["user"]?.message}</FormHelperText>
										</div>
									</div>
									{/* 日期 */}
									<div className="flex sm:flex-row flex-col sm:gap-3">
										{/* 日期 */}
										<div className="inline-flex flex-col w-full">
											<InputTitle classnames="whitespace-nowrap" title={"日期"} />
											<ControlledDatePicker
												name="date"
												mode="rwd"
												views={["year", "month", "day"]}
												format={"yyyy 年 MM 月 dd 日 (EE)"}
												minDate={new Date("2023-11")}
												closeOnSelect={false}
												// sx={{ width: isTargetScreen ? "100%" : "max-content" }}
											/>
											<FormHelperText className="!text-red-600 break-words !text-right h-5">{errors["date"]?.message}</FormHelperText>
										</div>
									</div>
									{/* 時間起迄 */}
									<div className="flex sm:flex-row flex-col sm:gap-3">
										{/* 時間(起) */}
										<div className="inline-flex flex-col w-full">
											<InputTitle classnames="whitespace-nowrap" title={"請假時間(起)"} />
											<ControlledOnlyTimePicker name="since" minutesStep={30} />
											<FormHelperText className="!text-red-600 break-words !text-right h-5">{errors["since"]?.message}</FormHelperText>
										</div>

										{/* 時間(迄) */}
										<div className="inline-flex flex-col w-full">
											<InputTitle classnames="whitespace-nowrap" title={"請假時間(迄)"} />
											<ControlledOnlyTimePicker
												name="until"
												minutesStep={30}
												minTime={sinceValue}
												disabled={!sinceValue}
											/>
											<FormHelperText className="!text-red-600 break-words !text-right h-5">{errors["until"]?.message}</FormHelperText>
										</div>
									</div>
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
							</form>
						</FormProvider>
					</div>
				</ModalTemplete>
			</>
		);
	}
);

export { PunchLocationModal, LeaveApplicationModal };
