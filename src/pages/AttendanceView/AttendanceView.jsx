import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
// FontAwesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMapLocationDot } from "@fortawesome/free-solid-svg-icons";
// MUI
import { TablePagination, Tooltip, useMediaQuery } from "@mui/material";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import CircularProgress from "@mui/material/CircularProgress";
import Backdrop from "@mui/material/Backdrop";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import TuneIcon from "@mui/icons-material/Tune";
import AssignmentReturnIcon from "@mui/icons-material/AssignmentReturn";
// Components
import PageTitle from "../../components/Guideline/PageTitle";
import Calendar from "../../components/Calendar/Calendar";
import InputTitle from "../../components/Guideline/InputTitle";
import DatePicker from "../../components/DatePicker/DatePicker";
import FloatingActionButton from "../../components/FloatingActionButton/FloatingActionButton";
import { LoadingFour } from "../../components/Loader/Loading";
import TableTabbar from "../../components/Tabbar/TableTabbar";
// Hooks
import { useNotification } from "../../hooks/useNotification";
// Utils
import { getData, postData } from "../../utils/api";
// Others
import { PunchLocationModal, LeaveApplicationModal } from "./AttendanceViewModal";
// Table 及 Table 所需按鈕、頁數
import RWDTable from "../../components/RWDTable/RWDTable";

// 用網址傳參數
import useNavigateWithParams from "../../hooks/useNavigateWithParams";

const AttendanceView = () => {
	const isTargetScreen = useMediaQuery("(max-width:991.98px)");
	const navigateWithParams = useNavigateWithParams();
	const navigate = useNavigate();
	const showNotification = useNotification();

	// 解析網址取得參數
	const location = useLocation();
	const queryParams = new URLSearchParams(location.search);
	const depValue = queryParams.get("dep");
	const userValue = queryParams.get("user");
	const stateValue = queryParams.get("state");
	const dateValue = queryParams.get("date");
	const tabCat = queryParams.get("cat");

	// Page 頁數設置
	const [page, setPage] = useState(
		queryParams.has("p") && !isNaN(+queryParams.get("p")) ? +queryParams.get("p") - 1 : 0
	);
	// rows per Page 多少筆等同於一頁
	const [rowsPerPage, setRowsPerPage] = useState(
		queryParams.has("s") && !isNaN(+queryParams.get("s")) ? +queryParams.get("s") : 50
	);

	const day = new Date();
	const today = new Date(day).toISOString().slice(0, 10); // 會得到 2024-01-16 這樣的格式
	// 60天前
	const daysAgo = new Date(day);
	daysAgo.setDate(day.getDate() - 30);

	const [currentPageData, setCurrentPageData] = useState([]);
	// const modeValue = queryParams.get("mode");
	// API List Data
	const [apiData, setApiData] = useState([]);
	const [events, setEvents] = useState([]);
	// ModalValue 控制開啟的是哪一個 Modal
	const [modalValue, setModalValue] = useState(false);
	// 傳送額外資訊給 Modal
	const [deliverInfo, setDeliverInfo] = useState(null);
	// 部門清單
	const [departmentList, setDepartmentList] = useState([]);
	// 人員清單
	const [usersList, setUsersList] = useState([]);
	// 考勤別清單
	const [attendanceTypeList, setAttendanceTypeList] = useState([]);
	// isLoading 等待請求 API
	const [isLoading, setIsLoading] = useState(false);
	// SearchDialog Switch
	const [searchDialogOpen, setSearchDialogOpen] = useState(false);
	// cat = Category 設置 tab 分類
	const [cat, setCat] = useState("table");
	// 傳遞至後端是否完成 Flag
	const [sendBackFlag, setSendBackFlag] = useState(false);
	// 搜尋日期
	const [since, setSince] = useState(null);
	const [until, setUntil] = useState(null);
	const [type, setType] = useState("ATTENDANCE");

	useEffect(() => {
		setSince(daysAgo);
		setUntil(day);
	}, []);

	const anomalyList = [
		{
			id: 1,
			text: "全部",
		},
		{
			id: 2,
			text: "異常 ",
		},
		{
			id: 3,
			text: "正常",
		},
	];

	// 區塊功能按鈕清單
	const btnGroup = [
		{
			mode: "leaveapplication",
			icon: <AssignmentReturnIcon fontSize="small" />,
			text: "提出請假申請",
			variant: "contained",
			color: "primary",
			fabVariant: "success",
			fab: <AssignmentReturnIcon />,
		},
		{
			mode: "filter",
			icon: null, // 設為 null 就可以避免 PC 出現
			text: "篩選",
			variant: "contained",
			color: "secondary",
			fabVariant: "secondary",
			fab: <TuneIcon fontSize="large" />,
		},
	];

	const getflagColorandText = (anomaly) => {
		if (anomaly === null) {
			return { color: "#25B09B", text: "考勤正常" };
		} else if (typeof anomaly === "object") {
			return { color: "#F03355", text: anomaly.chinese };
		} else {
			return null;
		}
	};

	// 取得部門資料 x 取得考勤別資料
	useEffect(() => {
		getData("department").then((result) => {
			if (result.result) {
				const data = result.result.content;
				const formattedDep = data.map((dep) => ({ label: dep.name, id: dep.id }));
				setDepartmentList(formattedDep);
			} else {
				setDepartmentList([]);
			}
		});

		getData("attendanceType").then((result) => {
			if (result.result) {
				const data = result.result;
				const formattedList = data.map((obj) => ({ label: obj.chinese, id: obj.value }));
				setAttendanceTypeList(formattedList);
			} else {
				setAttendanceTypeList([]);
			}
		});
	}, []);

	// 取得人員資料
	useEffect(() => {
		if (depValue) {
			getData(`department/${depValue}/staff`).then((result) => {
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

	// 用全部的資料來過濾網址已有的篩選條件
	useEffect(() => {
		setEvents(apiData);
		let tempShowData = apiData;
		if (depValue !== null) {
			tempShowData = tempShowData.filter((event) => {
				return event.user.departmentId === depValue;
			});
		}
		if (userValue !== null) {
			tempShowData = tempShowData.filter((event) => {
				return event.user.id === userValue;
			});
		}
		if (stateValue !== null) {
			tempShowData = tempShowData.filter((event) => {
				return event.anomalyState.id === stateValue;
			});
		}

		setEvents(tempShowData);
		const TempCurrentPageData = tempShowData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
		setCurrentPageData(TempCurrentPageData);
	}, [depValue, userValue, stateValue, dateValue, apiData, page, rowsPerPage]);

	// 只要搜尋條件有變動就讓頁數返回第一頁
	useEffect(() => {
		setPage(0);
	}, [depValue, userValue, stateValue, dateValue, apiData]);

	// 取得日曆資料
	useEffect(() => {
		if (!!since && !!until) {
			setIsLoading(true);
			setApiData([]);
			// Define the API calls
			const sinceForApi = since.toISOString().slice(0, 10);
			const untilForApi = until.toISOString().slice(0, 10);
			navigateWithParams(0, 0, { since: sinceForApi }, false);
			navigateWithParams(0, 0, { until: untilForApi }, false);
			const anomaly = "";
			getData(`attendance?type=${type}&since=${sinceForApi}&until=${untilForApi}&anomaly=${anomaly}&s=5000&p=1`).then(
				(result) => {
					if (result.result) {
						const rawData = result.result.content.map(
							({ id, type, anomaly, date, since, until, user, clockPunchIn, clockPunchOut }) => ({
								id,
								anomalyType: type,
								anomalyReason: anomaly?.chinese || "",
								date,
								title: user.department.name + " - " + user.nickname,
								anomalyState: anomaly === null ? { text: "✔️", id: "3" } : { text: "❌", id: "2" },
								since: clockPunchIn ? clockPunchIn.occurredAt.slice(11, 19) : "-",
								until: clockPunchOut ? clockPunchOut.occurredAt.slice(11, 19) : "-",
								color: getflagColorandText(anomaly).color,
								user: {
									id: user.id,
									nickname: user.nickname,
									fullName: user.lastname + user.firstname,
									department: user.department.name,
									departmentId: user.department.id,
								},
								clockPunchIn,
								clockPunchOut,
							})
						);
						setApiData(
							rawData.sort((a, b) => {
								if (a.date < b.date) {
									return 1;
								}
								if (a.date > b.date) {
									return -1;
								}
								return 0;
							})
						);
					} else {
						setApiData([]);
					}
					setIsLoading(false);
				}
			);
		}
	}, [since, until, type]);

	useEffect(() => {
		if (tabCat === "calendar") {
			setCat("calendar");
		}
	}, [tabCat]);
	// 開啟 SearchDialog
	const handleOpenSearch = () => {
		setSearchDialogOpen(true);
	};
	// 關閉 SearchDialog
	const handleCloseSearch = () => {
		setSearchDialogOpen(false);
	};

	// Tab 列表對應 api 搜尋參數
	const tabGroup = [
		{ f: "table", text: "列表" },
		{ f: "calendar", text: "月曆" },
	];
	// -----------------------------------------------------
	// 對照 api table 所顯示 key
	const columnsPC = [
		{ key: "anomalyType", label: "考勤假別", size: "10%" },
		{ key: ["user", "fullName"], label: "姓名", size: "10%" },
		{ key: ["user", "department"], label: "部門", size: "10%" },
		{ key: "date", label: "日期", size: "14%" },
		{ key: ["anomalyState", "text"], label: "狀態", size: "6%" },
		{ key: "anomalyReason", label: "異常原因", size: "14%" },
		{ key: "since", label: "上班時間", size: "12%" },
		{ key: "until", label: "下班時間", size: "12%" },
	];
	const columnsMobile = [
		{ key: ["user", "fullName"], label: "姓名" },
		{ key: ["user", "nickname"], label: "暱稱" },
		{ key: ["user", "department"], label: "部門" },
		{ key: "date", label: "日期" },
		{ key: ["anomalyState", "text"], label: "狀態" },
		{ key: "anomalyType", label: "考勤假別" },
		{ key: "anomalyReason", label: "異常原因" },
		{ key: "since", label: "上班時間" },
		{ key: "until", label: "下班時間" },
	];

	const actions = [
		{
			value: "location",
			icon: <FontAwesomeIcon icon={faMapLocationDot} size={"lg"} />,
			title: "打卡地點",
		},
	];

	const handleChangePage = (event, newPage) => {
		setPage(newPage);
	};

	const handleChangeRowsPerPage = (event) => {
		setRowsPerPage(+event.target.value);
		setPage(0);
	};

	// 當活動按鈕點擊時開啟 modal 並進行動作
	const handleActionClick = (event) => {
		event.stopPropagation();
		const dataMode = event.currentTarget.getAttribute("data-mode");
		const dataValue = event.currentTarget.getAttribute("data-value");
		setModalValue(dataMode);
		setDeliverInfo(dataValue ? apiData?.find((item) => item.id === dataValue) : null);
	};

	// 傳遞給後端資料
	const sendDataToBackend = (fd, mode, otherData) => {
		setSendBackFlag(true);
		let url = "supervisor/attendanceForm";
		let message = [];
		switch (mode) {
			case "create":
				message = [`「${otherData}」的假單建立成功！`];
				break;
			default:
				break;
		}
		postData(url, fd).then((result) => {
			if (result.status) {
				showNotification(message[0], true);
				onClose();
			} else {
				showNotification(
					result.result.reason ? result.result.reason : result.result ? result.result : "權限不足",
					false
				);
			}
			setSendBackFlag(false);
		});
	};

	// 關閉 Modal 清除資料
	const onClose = () => {
		setModalValue(false);
		setDeliverInfo(null);
	};

	// modal 開啟參數與顯示標題
	const modalConfig = [
		{
			modalValue: "location",
			modalComponent: <PunchLocationModal title={"打卡地點"} deliverInfo={deliverInfo} onClose={onClose} />,
		},
		{
			modalValue: "leaveapplication",
			modalComponent: (
				<LeaveApplicationModal
					title={"假單申請"}
					departmentsList={departmentList}
					attendanceTypesList={attendanceTypeList.filter((obj) => obj.id !== "ATTENDANCE")}
					sendDataToBackend={sendDataToBackend}
					onClose={onClose}
				/>
			),
		},
	];
	const config = modalValue ? modalConfig.find((item) => item.modalValue === modalValue) : null;

	// -----------------------------------------------------
	return (
		<>
			{/* PageTitle & Search */}
			<PageTitle
				title={"考勤檢視"}
				description="此頁面是用於查看整個部門或全體員工的考勤資訊與狀態，同時可檢視員工上下班打卡地點。(✔️= 正常, ❌= 異常)"
				btnGroup={btnGroup}
				handleActionClick={handleActionClick}
				// 搜尋模式
				searchMode
				// 下面參數前提都是 searchMode = true
				searchDialogOpen={searchDialogOpen}
				handleOpenDialog={handleOpenSearch}
				handleCloseDialog={handleCloseSearch}
				handleCloseText={"關閉"}
				isdirty={
					!depValue && !userValue && (stateValue === 1 || stateValue === null) && !dateValue && type !== "ATTENDANCE"
					// && (modeValue === dataCAList[0].value
					// 	|| !dataCAList.some((item) => item.value === modeValue)
					// 	)
				}>
				<div className="relative flex flex-col item-start sm:items-center gap-3">
					<div className="inline-flex items-center w-full gap-2">
						<InputTitle title={"部門"} pb={false} required={false} classnames="whitespace-nowrap" />
						<Autocomplete
							options={departmentList}
							noOptionsText={!!departmentList ? "無搜尋結果" : "API 獲取失敗，請重整網頁或檢查連線問題。"}
							className="flex-1"
							value={departmentList?.find((obj) => obj.id === depValue) || null}
							onChange={(event, newValue, reason) => {
								if (reason === "clear") {
									if (window.confirm("清空部門欄位會連帶清空選擇人員，確定清空？")) {
										const newParams = new URLSearchParams(window.location.search);
										newParams.delete("dep");
										newParams.delete("user");
										navigate(`?${newParams.toString()}`);
										// setUsersList([]);
										// navigate(`/anomaly_report`);
									}
								} else {
									setUsersList([]);
									navigateWithParams(0, 0, { dep: newValue.id }, false);
								}
							}}
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
					</div>
					<div className="inline-flex items-center w-full gap-2">
						<InputTitle title={"人員"} pb={false} required={false} classnames="whitespace-nowrap" />
						<Autocomplete
							options={usersList}
							noOptionsText={!!usersList ? "無搜尋結果" : "API 獲取失敗，請重整網頁或檢查連線問題。"}
							className="flex-1"
							value={usersList?.find((obj) => obj.id === userValue) || null}
							onChange={(event, newValue, reason) => {
								if (reason === "clear") {
									const newParams = new URLSearchParams(window.location.search);
									newParams.delete("user");
									navigate(`?${newParams.toString()}`);
								} else {
									navigateWithParams(0, 0, { user: newValue.id }, false);
								}
							}}
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
												{depValue && usersList.length <= 0 ? (
													<CircularProgress className="absolute right-[2.325rem]" size={20} />
												) : null}
												{params.InputProps.endAdornment}
											</>
										),
									}}
								/>
							)}
							loading={usersList.length <= 0}
							loadingText={"載入中..."}
							disabled={!depValue}
						/>
					</div>
					<div className="inline-flex items-center w-full gap-2">
						<InputTitle title={"狀態"} pb={false} required={false} classnames="whitespace-nowrap" />
						<Select
							value={stateValue ? stateValue : 1}
							onChange={(event) => {
								const newParams = new URLSearchParams(window.location.search);
								if (event.target.value === 1) {
									newParams.delete("state");
									navigate(`?${newParams.toString()}`);
								} else if (event.target.value) {
									navigateWithParams(0, 0, { state: event.target.value }, false);
								}
							}}
							className="inputPadding !pe-5"
							displayEmpty
							fullWidth>
							{anomalyList.map((dc) => (
								<MenuItem key={dc.id} value={dc.id}>
									{dc.text}
								</MenuItem>
							))}
						</Select>
					</div>
					<div className="inline-flex items-center w-full gap-2">
						<InputTitle title={"假別"} pb={false} required={false} classnames="whitespace-nowrap" />
						<Select
							value={type}
							onChange={(e) => setType(e.target.value)}
							className="inputPadding !pe-5"
							displayEmpty
							fullWidth>
							{attendanceTypeList.map((at) => (
								<MenuItem key={at.id} value={at.id}>
									{at.label}
								</MenuItem>
							))}
						</Select>
					</div>
					<div className="w-full text-left flex mt-1">
						<InputTitle title={"選擇日期"} pb={false} required={false} classnames="whitespace-nowrap" />
						<div className="flex ms-2 mt-1">
							<p className="!my-0 text-rose-400 font-bold text-xs !me-1">＊</p>
							<p className="!my-0 text-rose-400 font-bold text-xs">預設選擇日期為今日往前推算30天</p>
						</div>
					</div>
					<div className="inline-flex items-center w-full gap-2">
						<InputTitle title={"起"} pb={false} required={false} classnames="whitespace-nowrap" />
						<DatePicker
							defaultValue={null}
							value={since}
							setDates={setSince}
							// date的網址param在上面用useEffect來進行處理
							views={["year", "month", "day"]}
							format={"yyyy 年 MM 月 dd 日"}
							minDate={new Date("2023-11")}
						/>
					</div>
					<div className="inline-flex items-center w-full gap-2">
						<InputTitle title={"迄"} pb={false} required={false} classnames="whitespace-nowrap" />
						<DatePicker
							defaultValue={null}
							value={until}
							setDates={setUntil}
							// date的網址param在上面用useEffect來進行處理
							views={["year", "month", "day"]}
							format={"yyyy 年 MM 月 dd 日"}
							minDate={since ? new Date(since) : new Date("2023-11")}
							maxDate={new Date(today)}
						/>
					</div>
				</div>
			</PageTitle>

			{/* TabBar */}
			<TableTabbar tabGroup={tabGroup} setCat={setCat} cat={cat} />

			{/* Calendar */}
			{cat === "table" ? (
				<>
					<div className="overflow-y-auto flex-1 h-full order-3 sm:order-1">
						<RWDTable
							data={currentPageData}
							columnsPC={columnsPC}
							columnsMobile={columnsMobile}
							actions={actions}
							cardTitleKey={"title"}
							tableMinWidth={1024}
							isLoading={isLoading}
							handleActionClick={handleActionClick}
						/>
					</div>
					{/* Pagination */}
					<TablePagination
						className="order-2"
						rowsPerPageOptions={[50, 100, 250]}
						component="div"
						count={events ? events.length : 0}
						rowsPerPage={rowsPerPage}
						page={page}
						labelRowsPerPage={"每頁行數:"}
						onPageChange={handleChangePage}
						onRowsPerPageChange={handleChangeRowsPerPage}
					/>
				</>
			) : (
				<Calendar
					data={events}
					viewOptions={["dayGridMonth", "dayGridWeek"]}
					_dayMaxEvents={3}
					navLinkDayClick={(date, jsEvent) => {}}
					eventContent={(e) => CustomEventContent(e, isTargetScreen)}
				/>
			)}

			{/* Floating Action Button */}
			<FloatingActionButton btnGroup={btnGroup} handleActionClick={handleOpenSearch} />

			<Backdrop sx={{ color: "#fff", zIndex: 1400 }} open={(tabCat === "calendar" && isLoading) || sendBackFlag}>
				<LoadingFour />
			</Backdrop>

			{/* Modal */}
			{config && config.modalComponent}
		</>
	);
};

export default AttendanceView;

const CustomEventContent = ({ event, isTargetScreen }) => {
	const extendedProps = event._def.extendedProps;
	// if (isTargetScreen) {
	//   return null;
	// }
	return (
		<>
			<div>
				<Tooltip
					describeChild={true}
					className="z-[3000]"
					componentsProps={{
						tooltip: {
							sx: {
								padding: "0",
								zIndex: "3000",
							},
						},
					}}
					placement="right-start"
					title={
						<div className="p-2">
							<p className="text-xl">{extendedProps.user.nickname}</p>
							<p className="text-base">{event.startStr}</p>
							<p className="text-base">考勤假別 : {extendedProps.type.chinese}</p>
							<p className="text-base">
								異常狀態 : {extendedProps.anomalyState.id === "2" && "異常"}
								{extendedProps.anomalyState.id === "3" && "正常"}
							</p>
							<p className="text-base">上班時間 : {extendedProps.since}</p>
							<p className="text-base">下班時間 : {extendedProps.until}</p>
							<p className="text-base">異常原因 : {extendedProps?.anomaly ? extendedProps?.anomaly.chinese : "-"}</p>
						</div>
					}>
					<span>{event.title}</span>
				</Tooltip>
			</div>
		</>
	);
};

// 說明顯示
// quizMode
// // 下面參數前提都是 quizMode = true
// quizContent={
//   <div className="pt-3">
//     <div
//       className="flex flex-col items-center"
//       style={{
//         height: 255,
//         maxWidth: 400,
//         width: "100%",
//         overflowY: "auto",
//       }}
//     >
//       {(() => {
//         switch (activeStep) {
//           case 0:
//             return (
//               <p className="font-bold text-primary-900 pb-3">
//                 〔畫面元素介紹〕
//               </p>
//             );
//           case 1:
//             return (
//               <p className="font-bold text-primary-900 pb-3">
//                 〔更新頻率概述〕
//               </p>
//             );
//           case 2:
//             return (
//               <p className="font-bold text-primary-900 pb-3">
//                 〔考勤顏色說明〕
//               </p>
//             );
//           default:
//             return null;
//         }
//       })()}
//       {(() => {
//         switch (activeStep) {
//           case 0:
//             return (
//               <div className="flex flex-col items-center h-full text-sm">
//                 <img
//                   className="border mt-3 mb-6 rounded"
//                   src={ARimg}
//                   alt="考勤與打卡圖片示意"
//                 />
//                 <p>
//                   上方為
//                   <span className="text-base font-bold text-primary-800">
//                     「考勤紀錄」
//                   </span>
//                 </p>
//                 <p>
//                   下方為
//                   <span className="text-base font-bold text-primary-800">
//                     「打卡紀錄」
//                   </span>
//                 </p>
//               </div>
//             );
//           case 1:
//             return (
//               <div className="flex flex-col items-start h-full text-sm gap-3">
//                 <div className="inline-flex">
//                   <span className="whitespace-nowrap">考勤紀錄：</span>
//                   <p>
//                     <span className="text-base font-bold text-primary-800">
//                       每日隔日凌晨 12:00 更新考勤數據。
//                     </span>
//                   </p>
//                 </div>
//                 <div className="inline-flex">
//                   <span className="whitespace-nowrap">打卡紀錄：</span>
//                   <p>
//                     <span className="text-base font-bold text-primary-800">
//                       即時更新
//                     </span>
//                     ，立即刷新頁面即可查看最新紀錄。
//                   </p>
//                 </div>
//                 <p>情境範例：</p>
//                 <ul>
//                   <li>
//                     1/1 大明 8:00 打卡上班，17:00
//                     打卡下班，地理位置正常，打卡紀錄會即時更新至資料庫。
//                   </li>
//                   <li>
//                     1/2 凌晨 12:00 系統更新資訊，會顯示
//                     <span className="font-bold">「考勤正常」</span>。
//                   </li>
//                 </ul>
//               </div>
//             );
//           case 2:
//             return (
//               <div className="flex flex-col w-full h-full text-sm gap-3">
//                 <div className="inline-flex flex-col gap-1">
//                   <span className="px-2 py-0.5 bg-[#F03355] rounded text-white w-fit">
//                     考勤異常
//                   </span>
//                   <p>考勤資料異常狀況：</p>
//                   <ul>
//                     <li>
//                       1. <span className="font-bold">上班時間異常</span>
//                     </li>
//                     <li>
//                       2. <span className="font-bold">下班時間異常</span>
//                     </li>
//                     <li>
//                       3. <span className="font-bold">打卡範圍異常</span>
//                     </li>
//                     <li>
//                       4. <span className="font-bold">工時異常</span>{" "}
//                       (上下班/請假時間不滿 8 小時)
//                     </li>
//                   </ul>
//                 </div>
//                 <div className="inline-flex flex-col gap-1">
//                   <span className="px-2 py-0.5 bg-[#FFA516] rounded text-white w-fit">
//                     考勤已修正
//                   </span>
//                   <p>
//                     代表
//                     <span className="font-bold">已經進行編輯修正</span>
//                     的情況。
//                   </p>
//                 </div>
//               </div>
//             );
//           default:
//             return activeStep;
//         }
//       })()}
//     </div>
//     <MobileStepper
//       variant="dots"
//       steps={maxSteps}
//       position="static"
//       activeStep={activeStep}
//       sx={{ maxWidth: 400, flexGrow: 1, px: 0, pb: 0 }}
//       backButton={
//         <Button
//           size="small"
//           onClick={handleBack}
//           disabled={activeStep === 0}
//         >
//           {theme.direction === "rtl" ? (
//             <KeyboardArrowRight />
//           ) : (
//             <KeyboardArrowLeft />
//           )}
//           上一頁
//         </Button>
//       }
//       nextButton={
//         <Button
//           size="small"
//           onClick={handleNext}
//           disabled={activeStep === maxSteps - 1}
//         >
//           下一頁
//           {theme.direction === "rtl" ? (
//             <KeyboardArrowLeft />
//           ) : (
//             <KeyboardArrowRight />
//           )}
//         </Button>
//       }
//     />
//   </div>
// }
// quizModalClose={() => setActiveStep(0)}
