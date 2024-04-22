import React, { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { ConferenceRoomModal, AppointmentModal } from "./TransportationVehicleModal";

// date-fns
import { parseISO, format } from "date-fns";
import { zhTW } from "date-fns/locale";
import { utcToZonedTime } from "date-fns-tz";

// MUI
import Backdrop from "@mui/material/Backdrop";
import Tooltip from "@mui/material/Tooltip";
import AddIcon from "@mui/icons-material/Add";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

// Component
import PageTitle from "../../components/Guideline/PageTitle";
import TableTabbar from "../../components/Tabbar/TableTabbar";
import { LoadingTwo, LoadingFour } from "../../components/Loader/Loading";
import Calendar from "../../components/Calendar/Calendar";
import RWDTable from "../../components/RWDTable/RWDTable";
import Pagination from "../../components/Pagination/Pagination";
import AlertDialog from "../../components/Alert/AlertDialog";
import MultipleFAB from "../../components/FloatingActionButton/MultipleFAB";

// Hooks
import useNavigateWithParams from "../../hooks/useNavigateWithParams";
import { useNotification } from "../../hooks/useNotification";

// Utils
import { getData, postData, deleteData } from "../../utils/api";

// 轉換時間
const formatDateTime = (dateTime) => {
	const parsedDateTime = parseISO(dateTime);
	const formattedDateTime = format(utcToZonedTime(parsedDateTime, "Asia/Taipei"), "yyyy-MM-dd HH:mm", {
		locale: zhTW,
	});
	return formattedDateTime;
};

/***
 * Transportation Vehicle
 * 公務車調度
 * @returns
 ***/
const TransportationVehicle = () => {
	// 解析網址取得參數
	const location = useLocation();
	const queryParams = new URLSearchParams(location.search);
	// 定義年份和月份的狀態
	const currentMonth = new Date().getMonth() + 1;
	const [year, setYear] = useState(queryParams.get("calendaryears") || new Date().getFullYear());
	const [month, setMonth] = useState(
		queryParams.get("calendarmonths") || currentMonth < 10 ? "0" + currentMonth : currentMonth
	);
	// 路由記憶切換
	const navigateWithParams = useNavigateWithParams();
	// 通知
	const showNotification = useNotification();

	// API List Data
	const [apiData, setApiData] = useState(null);
	// isLoading 等待請求 api
	const [isLoading, setIsLoading] = useState(true);
	// Page 頁數設置
	const [page, setPage] = useState(
		queryParams.has("p") && !isNaN(+queryParams.get("p")) ? +queryParams.get("p") - 1 : 0
	);
	// rows per Page 多少筆等同於一頁
	const [rowsPerPage, setRowsPerPage] = useState(
		queryParams.has("s") && !isNaN(+queryParams.get("s")) ? +queryParams.get("s") : 10
	);
	// ModalValue 控制開啟的是哪一個 Modal
	const [modalValue, setModalValue] = useState(false);
	// 傳送額外資訊給 Modal
	const [deliverInfo, setDeliverInfo] = useState(null);
	// 傳遞稍後用 Flag
	const [sendBackFlag, setSendBackFlag] = useState(false);
	// 部門清單
	const [departmentsList, setDepartmentsList] = useState([]);
	// 獲得方式清單
	const [acquiredHowList, setAcquiredHowList] = useState([]);
	// 汽車稅費清單
	const [transportationVehicleTaxList, setTransportationVehicleTaxList] = useState([]);
	// Category
	const tabGroup = [
		{ f: "loanStatusTable", text: "狀況管理" },
		{ f: "appointmentCalendar", text: "調度月曆" },
		{ f: "carManage", text: "車輛管理" },
	];
	const [cat, setCat] = useState(
		queryParams.has("cat") && tabGroup.some((tab) => tab.f === queryParams.get("cat"))
			? queryParams.get("cat")
			: tabGroup[0].f
	);

	/**
	 * Alert 開關
	 * 0: 關閉
	 * 1: 是否確認刪除視窗
	 **/
	const [alertOpen, setAlertOpen] = useState(0);

	// API URL
	const furl = cat === "carManage" ? "transportationVehicle" : "transportationVehicleDispatchment";

	// 監聽 URL 查詢參數的變化並更新相應的狀態
	useEffect(() => {
		const yearParam = queryParams.get("calendaryears");
		const monthParam = queryParams.get("calendarmonths");

		if (yearParam) {
			setYear(yearParam);
		}

		if (monthParam) {
			setMonth(monthParam.length === 1 ? "0" + monthParam : monthParam);
		}
	}, [queryParams]);

	const calendardate = [year, month];

	let apiUrl;
	if (cat === "appointmentCalendar") {
		apiUrl = `${furl}/${calendardate[0]}/${calendardate[1]}?p=1&s=500`;
	} else {
		apiUrl = `${furl}?p=${page + 1}&s=${rowsPerPage}`;
	}

	// 上方區塊功能按鈕清單
	const btnGroup = [
		{
			mode: "createCar",
			icon: <AddCircleIcon fontSize="small" />,
			text: "新增車輛",
			variant: "contained",
			color: "secondary",
			fabVariant: "success",
			fab: <AddIcon fontSize="large" />,
		},
		{
			mode: "createAppointment",
			icon: <AddCircleIcon fontSize="small" />,
			text: "新增調度",
			variant: "contained",
			color: "primary",
			fabVariant: "success",
			fab: <AddIcon fontSize="large" />,
		},
	];

	var columnsPC = [],
		columnsMobile = [],
		actions = [];
	if (cat === "carManage") {
		// 對照 api table 所顯示 key
		columnsPC = [
			{ key: ["licenseTag"], label: "車牌號碼", size: "18%" },
			{ key: ["acquiredHow", "chinese"], label: "獲得方式", size: "18%" },
			{ key: ["tax", "chinese"], label: "汽車稅費", size: "48%", align: "left" },
		];
		columnsMobile = [
			{ key: ["licenseTag"], label: "車牌號碼" },
			{ key: ["acquiredHow", "chinese"], label: "獲得方式" },
			{ key: ["tax", "chinese"], label: "汽車稅費" },
		];

		// 功能操作按鈕
		actions = [
			{ value: "editCar", icon: <EditIcon />, title: "編輯車輛" },
			{ value: "voidCar", icon: <DeleteIcon />, title: "刪除車輛" },
		];
	} else {
		// 對照 api table 所顯示 key
		columnsPC = [
			{ key: ["applicant"], label: "申請人", size: "10%" },
			{ key: ["vehicle", "licenseTag"], label: "車輛", size: "10%" },
			{ key: ["driver"], label: "使用者", size: "10%" },
			{ key: ["usage"], label: "用途", size: "15%", align: "left" },
			{ key: ["mileageBefore"], label: "出發前里程數 (km)", size: "10%" },
			{ key: ["mileageAfter"], label: "返回後里程數 (km)", size: "10%" },
			{ key: ["start"], label: "開始使用時間", size: "12%" },
			{ key: ["end"], label: "結束使用時間", size: "12%" },
		];
		columnsMobile = [
			{ key: ["applicant"], label: "申請人" },
			{ key: ["vehicle", "licenseTag"], label: "車輛" },
			{ key: ["driver"], label: "使用者" },
			{ key: ["usage"], label: "用途" },
			{ key: ["mileageBefore"], label: "出發前里程數 (km)" },
			{ key: ["mileageAfter"], label: "返回後里程數 (km)" },
			{ key: ["start"], label: "開始使用時間" },
			{ key: ["end"], label: "結束使用時間" },
		];

		// 功能操作按鈕
		actions = [
			{ value: "editAppointment", icon: <EditIcon />, title: "編輯調度" },
			{ value: "voidAppointment", icon: <DeleteIcon />, title: "刪除調度" },
		];
	}

	// Event 點擊
	const handleEventClick = (eventClickInfo) => {
		const event = eventClickInfo.event;
		alert(
			"車輛：" +
				event.title +
				"\n" +
				"申請人：" +
				event.extendedProps.applicant +
				"\n" +
				"使用者：" +
				event.extendedProps.driver +
				"\n" +
				"申請時間：" +
				formatDateTime(event.extendedProps.appliedAt) +
				"\n" +
				"調度時間(起)：" +
				formatDateTime(event.extendedProps.estimatedSince) +
				"\n" +
				"調度時間(迄)：" +
				formatDateTime(event.extendedProps.estimatedUntil) +
				"\n" +
				"用途：" +
				event.extendedProps.usage +
				"\n" +
				(event.extendedProps.mileageBefore ? "出發前里程數：" + event.extendedProps.mileageBefore + " 公里\n" : "") +
				(event.extendedProps.mileageAfter ? "返回後里程數：" + event.extendedProps.mileageAfter + " 公里\n" : "")
		);
	};

	// 取得列表資料
	useEffect(() => {
		getApiList(apiUrl);
	}, [apiUrl]);
	const getApiList = useCallback(
		(url) => {
			setIsLoading(true);
			getData(url).then((result) => {
				setIsLoading(false);
				if (result.result) {
					const data = result.result;
					if (data?.content[0]?.licenseTag !== undefined) {
						setApiData(data);
					} else {
						const formattedData = {
							...data,
							content: data.content.map((item) => ({
								...item,
								title: item.vehicle.licenseTag,
								applicant: `${item.applicant.lastname}${item.applicant.firstname}`,
								driver: `${item.driver.lastname}${item.driver.firstname}`,
								appliedAt: formatDateTime(item.appliedAt),
								start: formatDateTime(item.estimatedSince),
								end: formatDateTime(item.estimatedUntil),
								displayTable: `${item.vehicle.licenseTag} (${formatDateTime(item.estimatedSince).slice(0, 10)})`,
							})),
						};
						console.log(formattedData.content);
						setApiData(formattedData);
					}

					if (page >= data?.totalPages) {
						setPage(0);
						setRowsPerPage(10);
						navigateWithParams(1, 10);
					}
				} else {
					setApiData(null);
					showNotification("主資料 API 請求失敗", false, 10000);
				}
			});
		},
		[page]
	);
	// 取得部門資料 x 獲得方式資料 x 汽車稅費資料
	useEffect(() => {
		// 取得部門資料
		getData("department?p=1&s=100").then((result) => {
			if (result.result) {
				const data = result.result.content;
				const formattedDep = data.map((dep) => ({
					id: dep.id,
					label: dep.name,
					members: dep.members.map((member) => ({
						id: member.id,
						label: `${member.lastname}${member.firstname}`,
					})),
				}));
				setDepartmentsList(formattedDep);
			} else {
				setDepartmentsList([]);
				showNotification("部門 API 請求失敗", false, 10000);
			}
		});

		// 獲得方式資料
		getData("acquiredHow").then((result) => {
			if (result.result) {
				const data = result.result;
				const formattedList = data.map((item) => ({ label: item.chinese, id: item.value }));
				setAcquiredHowList(formattedList);
			} else {
				setAcquiredHowList([]);
				showNotification("獲得方式 API 請求失敗", false, 10000);
			}
		});

		// 汽車稅費資料
		getData("transportationVehicleTax").then((result) => {
			if (result.result) {
				const data = result.result;
				const formattedList = data.map((item) => ({ label: item.chinese, id: item.value }));
				setTransportationVehicleTaxList(formattedList);
			} else {
				setTransportationVehicleTaxList([]);
				showNotification("汽車稅費 API 請求失敗", false, 10000);
			}
		});
	}, []);

	// 傳遞給後端資料
	const sendDataToBackend = (fd, mode, otherData, id) => {
		setSendBackFlag(true);
		let url = "";
		let message = [];
		switch (mode) {
			case "createCar":
				url = "transportationVehicle";
				message = `名為「${otherData}」的車輛建立成功！`;
				break;
			case "editCar":
				url = "transportationVehicle/" + id;
				message = `名為「${otherData}」的車輛編輯成功！`;
				break;
			case "createAppointment":
				url = "transportationVehicleDispatchment";
				message = "已建立車輛調度單成功！";
				break;
			case "editAppointment":
				url = "transportationVehicleDispatchment/" + id;
				message = "已編輯車輛調度單成功！";
				break;
			default:
				break;
		}

		postData(url, fd).then((result) => {
			if (result.status) {
				showNotification(message, true);
				getApiList(apiUrl);
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

	// 設置頁數
	const handleChangePage = useCallback((event, newPage) => {
		setPage(newPage);
		navigateWithParams(newPage + 1, rowsPerPage);
	}, []);

	// 設置每頁顯示並返回第一頁
	const handleChangeRowsPerPage = (event) => {
		const targetValue = parseInt(event.target.value, 10);
		setRowsPerPage(targetValue);
		setPage(0);
		navigateWithParams(1, targetValue);
	};

	// 當活動按鈕點擊時動作
	const handleActionClick = (event) => {
		event.stopPropagation();
		const dataMode = event.currentTarget.getAttribute("data-mode");
		const dataValue = event.currentTarget.getAttribute("data-value");

		if (dataMode === "voidCar" || dataMode === "voidAppointment") {
			setDeliverInfo(dataValue);
			setAlertOpen(1);
		} else {
			setModalValue(dataMode);
			if (dataValue) {
				setDeliverInfo(dataValue);
			}
		}
	};

	// 關閉 Modal 清除資料
	const onClose = () => {
		setModalValue(false);
		setDeliverInfo(null);
	};

	// Alert 回傳值進行最終結果 --- true: 關閉 modal / all: 關閉 Alert
	const handleAlertClose = (agree) => {
		if (agree) {
			if (alertOpen === 1) {
				let message = "刪除成功！";
				deleteData(`${furl}/${deliverInfo}`).then((result) => {
					if (result.status) {
						showNotification(message, true);
						getApiList(apiUrl);
					} else {
						showNotification(result?.result.reason || "出現錯誤。", false);
					}
					setSendBackFlag(false);
				});
			}
		}
		setAlertOpen(0);
		setDeliverInfo(null);
	};

	// modal 開啟參數與顯示標題
	const modalConfig = [
		{
			modalValue: "createCar",
			modalComponent: (
				<ConferenceRoomModal
					title="新增車輛"
					acquiredHowList={acquiredHowList}
					transportationVehicleTaxList={transportationVehicleTaxList}
					sendDataToBackend={sendDataToBackend}
					onClose={onClose}
				/>
			),
		},
		{
			modalValue: "editCar",
			modalComponent: (
				<ConferenceRoomModal
					title="編輯車輛"
					deliverInfo={deliverInfo}
					acquiredHowList={acquiredHowList}
					transportationVehicleTaxList={transportationVehicleTaxList}
					sendDataToBackend={sendDataToBackend}
					onClose={onClose}
				/>
			),
		},
		{
			modalValue: "createAppointment",
			modalComponent: (
				<AppointmentModal
					title="新增調度"
					departmentsList={departmentsList}
					sendDataToBackend={sendDataToBackend}
					onClose={onClose}
				/>
			),
		},
		{
			modalValue: "editAppointment",
			modalComponent: (
				<AppointmentModal
					title="編輯調度"
					deliverInfo={deliverInfo}
					departmentsList={departmentsList}
					sendDataToBackend={sendDataToBackend}
					onClose={onClose}
				/>
			),
		},
	];
	const config = modalValue ? modalConfig.find((item) => item.modalValue === modalValue) : null;

	return (
		<>
			{/* PageTitle */}
			<PageTitle
				title="公務車調度"
				description="此頁面是用於公務車調度，提供新增、編輯、刪除申請的功能，並可查看月曆車輛的當前狀態和調度情況。"
				btnGroup={btnGroup}
				handleActionClick={handleActionClick}
			/>

			{/* Tab */}
			<TableTabbar
				tabGroup={tabGroup}
				cat={cat}
				setCat={setCat}
				onTabChange={() => {
					setIsLoading(true);
					setPage(0);
					setRowsPerPage(10);
					navigateWithParams(1, 10);
				}}
				sx={{
					"& .MuiTabs-scroller": {
						borderRadius: "0.5rem",
						background: "white",
						boxShadow: "0 5px 10px rgba(0, 0, 0, 0.1)",
					},
				}}
			/>

			{/* Main Content */}
			<div className={"relative profile-section flex flex-col flex-1 overflow-hidden pb-4 sm:pb-0"}>
				{(() => {
					switch (cat) {
						case "loanStatusTable": // 狀態管理
						case "carManage": // 車輛管理
							return (
								<>
									{/* Table */}
									<div className="pt-2 overflow-y-auto sm:overflow-y-hidden h-full order-3 sm:order-1">
										<RWDTable
											data={apiData?.content || []}
											columnsPC={columnsPC}
											columnsMobile={columnsMobile}
											actions={actions}
											cardTitleKey={cat === "carManage" ? "licenseTag" : "displayTable"}
											tableMinWidth={cat === "carManage" ? 640 : 1200}
											isLoading={isLoading}
											handleActionClick={handleActionClick}
										/>
									</div>

									{/* Pagination */}
									<Pagination
										totalElement={apiData?.totalElements || 0}
										page={apiData && page < apiData.totalPages ? page : 0}
										onPageChange={handleChangePage}
										rowsPerPage={rowsPerPage}
										onRowsPerPageChange={handleChangeRowsPerPage}
									/>
								</>
							);
						case "appointmentCalendar": // 調度月曆
							return (
								<>
									<Calendar
										data={apiData?.content || []}
										viewOptions={["dayGridMonth", "timeGridWeek", "timeGridDay"]}
										customInitialView={true}
										navLinks={false}
										eventContent={renderEventContent}
										eventClick={handleEventClick}
									/>
								</>
							);
						default: {
							return null;
						}
					}
				})()}
			</div>

			{/* FAB */}
			<MultipleFAB btnGroup={btnGroup} handleActionClick={handleActionClick} />

			{/* Modal */}
			{config && config.modalComponent}

			{/* Backdrop */}
			<Backdrop sx={{ color: "#fff", zIndex: 1400 }} open={sendBackFlag}>
				<LoadingFour />
			</Backdrop>
			{isLoading && cat === "appointmentCalendar" && (
				<Backdrop sx={{ color: "#fff", zIndex: 1400 }} open={true}>
					<LoadingTwo />
				</Backdrop>
			)}

			{/* Alert */}
			<AlertDialog
				open={alertOpen !== 0}
				onClose={handleAlertClose}
				icon={<ReportProblemIcon color="secondary" />}
				title="注意"
				content={cat === "carManage" ? "是否確認將此車輛進行刪除處理？" : "是否確認將此預約調度進行刪除處理？"}
				disagreeText="取消"
				agreeText="確定"
			/>
		</>
	);
};

export default TransportationVehicle;

const renderEventContent = (eventInfo) => {
	const event = eventInfo.event;

	return (
		<Tooltip
			title={
				<>
					<p>車輛：{event.title}</p>
					<p>申請人：{event.extendedProps.applicant}</p>
					<p>使用者：{event.extendedProps.driver}</p>
					<p>申請時間：{formatDateTime(event.extendedProps.appliedAt)}</p>
					<p>調度時間(起)：{formatDateTime(event.extendedProps.estimatedSince)}</p>
					<p>調度時間(迄)：{formatDateTime(event.extendedProps.estimatedUntil)}</p>
					<p>用途：{event.extendedProps.usage}</p>
					{event.extendedProps.mileageBefore ? <p>出發前里程數：{event.extendedProps.mileageBefore} 公里</p> : null}
					{event.extendedProps.mileageAfter ? <p>返回後里程數：{event.extendedProps.mileageAfter} 公里</p> : null}
				</>
			}
			slotProps={{
				popper: {
					modifiers: [
						{
							name: "offset",
							options: {
								offset: [0, -10],
							},
						},
					],
				},
			}}
			arrow>
			<div className="w-full px-1 py-px bg-[#F48A64] text-white rounded">
				<b>{eventInfo.timeText}</b>
				<p className="truncate">{eventInfo.event.title}</p>
			</div>
		</Tooltip>
	);
};
