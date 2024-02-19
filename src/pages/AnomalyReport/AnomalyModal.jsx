import React, { useState, useEffect, useRef } from "react";
import { useForm, FormProvider, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
// Leaflet
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import MapsIcon from "../../assets/icons/Map_pin_icon.png";
// MUI
import Autocomplete from "@mui/material/Autocomplete";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import CircularProgress from "@mui/material/CircularProgress";
import FormHelperText from "@mui/material/FormHelperText";
// Component
import ModalTemplete from "../../components/Modal/ModalTemplete";
import InputTitle from "../../components/Guideline/InputTitle";
import ControlledDatePicker from "../../components/DatePicker/ControlledDatePicker";
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
	// 用戶廠別的資料
	const [workingLoc, setWorkingLoc] = useState(null);
	// 打卡資訊
	const [punchLog, setPunchLog] = useState(deliverInfo[punchInOutButtons[0].value]);
	// Tab 選擇 (active 概念)
	const [alignment, setAlignment] = useState(punchInOutButtons[0].value);
	// 建立 ref 儲存地圖實例
	const mapRef = useRef(null);

	// 取得用戶廠別的資料
	useEffect(() => {
		getData(`user/${deliverInfo.user.id}`).then((result) => {
			if (result.result) {
				const data = result.result.factorySite;
				setWorkingLoc(data);
			} else {
				setWorkingLoc(null);
			}
		});
	}, []);

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
			<ModalTemplete title={title} show={true} maxWidth={"768px"} onClose={onClose}>
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
							是否已設置廠別：
							{/* /是否派工中： */}
							<span className="font-bold">
								{workingLoc === false ? "N" : workingLoc ? "Y" : "-"}
								{/* /N */}
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
										center={[workingLoc.latitude, workingLoc.longitude]}
										pathOptions={{
											fillColor: "#8b96a6",
											color: "#95B07E",
											weight: 3,
										}}
										radius={workingLoc.radius}
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
		</>
	);
});

/***
 * 請假申請 Modal
 * @param {string} title - Modal 標題名稱
 * @param {Array} departmentsList - 部門清單
 * @param {Array} attendanceTypesList - 考勤別清單
 * @param {Function} onClose - 關閉函式
 * @returns
 ***/
const LeaveApplicationModal = React.memo(({ title, departmentsList, attendanceTypesList, onClose }) => {
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
	};

	// 使用 Yup 來定義表單驗證規則
	const schema = yup.object().shape({
		department: yup.object().required("不可為空值！"),
		user: yup.object().required("不可為空值！"),
		attendanceType: yup.object().required("不可為空值！"),
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
		console.log(data);
	};

	return (
		<>
			{/* Modal */}
			<ModalTemplete title={title} show={true} maxWidth={"640px"} onClose={onClose}>
				<div className="mt-3">
					<FormProvider {...methods}>
						<form onSubmit={handleSubmit(onSubmit)}>
							<div className="flex flex-col gap-1">
								{/* 部門 x 人員 */}
								<div className="flex sm:flex-row flex-col gap-3">
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
										<FormHelperText className="!text-red-600 h-5">{errors["department"]?.message}</FormHelperText>
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
										<FormHelperText className="!text-red-600 h-5">{errors["user"]?.message}</FormHelperText>
									</div>
								</div>
								{/* 請假單 */}
								<div className="flex sm:flex-row flex-col gap-3">
									{/* 請假單 */}
									<div className="inline-flex flex-col w-full">
										<InputTitle classnames="whitespace-nowrap" title={"請假單類別"} />
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
										<FormHelperText className="!text-red-600 h-5">{errors["attendanceType"]?.message}</FormHelperText>
									</div>
								</div>
								{/* 按鈕 Btn Group */}
								<div className="flex sm:flex-row flex-col gap-2">
									<Button
										type="submit"
										variant="contained"
										color="success"
										className="!text-base !h-12 !mt-1"
										fullWidth>
										送出
									</Button>
								</div>
								{/* 日期 */}
								{/* <div className="inline-flex flex-col">
									<InputTitle classnames="whitespace-nowrap" title={"日期"} required={false} />
									<ControlledDatePicker
										name="date"
										mode="rwd"
										views={["month", "year"]}
										format={"yyyy 年 MM 月 dd 日"}
										minDate={new Date("2023-11")}
										closeOnSelect={false}
										// sx={{ width: isTargetScreen ? "100%" : "max-content" }}
									/>
								</div> */}
							</div>
						</form>
					</FormProvider>
				</div>
			</ModalTemplete>
		</>
	);
});

export { PunchLocationModal, LeaveApplicationModal };
