import React, { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { ConferenceRoomModal, AppointmentModal } from "./ConferenceRoomAppointmentModal";

// date-fns
import { parseISO, format } from "date-fns";
import { zhTW } from "date-fns/locale";
import { utcToZonedTime } from "date-fns-tz";

// MUI
import Backdrop from "@mui/material/Backdrop";
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

/***
 * Conference Room Appointment
 * 會議室預約
 * @returns
 ***/
const ConferenceRoomAppointment = () => {
	// 解析網址取得參數
	const location = useLocation();
	const queryParams = new URLSearchParams(location.search);
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
	// 部門清單
	const [factorySiteList, setFactorySiteList] = useState([]);
	// Category
	const tabGroup = [
		{ f: "loanStatusTable", text: "狀況管理" },
		{ f: "appointmentCalendar", text: "預約月曆" },
		{ f: "roomManage", text: "會議室管理" },
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
	const furl = cat === "roomManage" ? "conferenceRoom" : "conferenceRoomBooking";
	const apiUrl = `${furl}?p=${page + 1}&s=${rowsPerPage}`;

	// 上方區塊功能按鈕清單
	const btnGroup = [
		{
			mode: "createRoom",
			icon: <AddCircleIcon fontSize="small" />,
			text: "新增會議室",
			variant: "contained",
			color: "secondary",
			fabVariant: "success",
			fab: <AddIcon fontSize="large" />,
		},
		{
			mode: "createAppointment",
			icon: <AddCircleIcon fontSize="small" />,
			text: "新增預約",
			variant: "contained",
			color: "primary",
			fabVariant: "success",
			fab: <AddIcon fontSize="large" />,
		},
	];

	var columnsPC = [],
		columnsMobile = [],
		actions = [];
	if (cat === "roomManage") {
		// 對照 api table 所顯示 key
		columnsPC = [
			{ key: ["factorySite", "chinese"], label: "廠別", size: "33%" },
			{ key: ["name"], label: "會議室名稱", size: "33%" },
		];
		columnsMobile = [
			{ key: ["factorySite", "chinese"], label: "廠別" },
			{ key: ["name"], label: "會議室名稱" },
		];

		// 功能操作按鈕
		actions = [
			{ value: "editRoom", icon: <EditIcon />, title: "編輯會議室" },
			{ value: "voidRoom", icon: <DeleteIcon />, title: "刪除會議室" },
		];
	} else {
		// 對照 api table 所顯示 key
		columnsPC = [
			{ key: ["applicant"], label: "預約者", size: "12%" },
			{ key: ["appliedAt"], label: "預約時間", size: "16%" },
			{ key: ["conferenceRoom", "factorySite", "chinese"], label: "工廠站點", size: "12%" },
			{ key: ["conferenceRoom", "name"], label: "會議室名稱", size: "15%" },
			{ key: ["since"], label: "開始時間", size: "16%" },
			{ key: ["until"], label: "結束時間", size: "16%" },
		];
		columnsMobile = [
			{ key: ["applicant"], label: "預約者" },
			{ key: ["appliedAt"], label: "預約時間" },
			{ key: ["conferenceRoom", "factorySite", "chinese"], label: "工廠站點" },
			{ key: ["conferenceRoom", "name"], label: "會議室名稱" },
			{ key: ["since"], label: "開始時間" },
			{ key: ["until"], label: "結束時間" },
		];

		// 功能操作按鈕
		actions = [
			{ value: "editAppointment", icon: <EditIcon />, title: "編輯預約" },
			{ value: "voidAppointment", icon: <DeleteIcon />, title: "刪除預約" },
		];
	}

	// 轉換時間
	const formatDateTime = (dateTime) => {
		const parsedDateTime = parseISO(dateTime);
		const formattedDateTime = format(utcToZonedTime(parsedDateTime, "Asia/Taipei"), "yyyy-MM-dd HH:mm", {
			locale: zhTW,
		});
		return formattedDateTime;
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
					if (data?.content[0].factorySite !== undefined) {
						setApiData(data);
					} else {
						const formattedData = {
							...data,
							content: data.content.map((item) => ({
								...item,
								applicant: `${item.applicant.lastname}${item.applicant.firstname}`,
								appliedAt: formatDateTime(item.appliedAt),
								since: formatDateTime(item.since),
								until: formatDateTime(item.until),
								displayTable: `〔${formatDateTime(item.since).slice(0, 10)}〕${item.conferenceRoom.name} (${
									item.conferenceRoom.factorySite.chinese
								})`,
							})),
						};
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
	// 取得部門資料 x 廠別資料
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

		// 取得廠別資料
		getData("factorySite").then((result) => {
			if (result.result) {
				const data = result.result;
				const formattedDep = data.map((fs) => ({ label: fs.chinese, id: fs.value }));
				setFactorySiteList(formattedDep);
			} else {
				setFactorySiteList([]);
				showNotification("廠別 API 請求失敗", false, 10000);
			}
		});
	}, []);

	// 傳遞給後端資料
	const sendDataToBackend = (fd, mode, otherData, id) => {
		setSendBackFlag(true);
		let url = "conferenceRoom";
		let message = [];
		switch (mode) {
			case "createRoom":
				url = "conferenceRoom";
				message = [`名為「${otherData}」的會議室建立成功！`];
				break;
			case "editRoom":
				url = "conferenceRoom/" + id;
				message = [`名為「${otherData}」的會議室編輯成功！`];
				break;
			case "createAppointment":
				url = "conferenceRoomBooking";
				message = [`「${otherData.room}」會議室已被「${otherData.applicant}」申請成功！`];
				break;
			default:
				break;
		}

		postData(url, fd).then((result) => {
			if (result.status) {
				showNotification(message[0], true);
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

		if (dataMode === "voidRoom") {
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
			modalValue: "createRoom",
			modalComponent: (
				<ConferenceRoomModal
					title="新增會議室"
					factorySiteList={factorySiteList}
					sendDataToBackend={sendDataToBackend}
					onClose={onClose}
				/>
			),
		},
		{
			modalValue: "editRoom",
			modalComponent: (
				<ConferenceRoomModal
					title="編輯會議室"
					deliverInfo={deliverInfo}
					factorySiteList={factorySiteList}
					sendDataToBackend={sendDataToBackend}
					onClose={onClose}
				/>
			),
		},
		{
			modalValue: "createAppointment",
			modalComponent: (
				<AppointmentModal
					title="新增預約"
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
					title="編輯預約"
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
				title="會議室預約"
				description="此頁面是用於會議室預約，提供新增、編輯、刪除申請的功能，並可查看月曆會議室的當前狀態和預約情況。"
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
						case "roomManage": // 會議室管理
							return (
								<>
									{/* Table */}
									<div className="pt-2 overflow-y-auto sm:overflow-y-hidden h-full order-3 sm:order-1">
										<RWDTable
											data={apiData?.content || []}
											columnsPC={columnsPC}
											columnsMobile={columnsMobile}
											actions={actions}
											cardTitleKey={cat === "roomManage" ? "name" : "displayTable"}
											tableMinWidth={cat === "roomManage" ? 540 : 1024}
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
						case "appointmentCalendar": // 預約月曆
							// return apiDataCalendar ? (
							return (
								<Calendar
									data={[]}
									viewOptions={["dayGridMonth", "timeGridDay"]}
									navLinks={false}
									customInitialView={true}
								/>
							);
						// ) : (
						// 	<LoadingTwo size={isSmallScreen ? 120 : 160} textSize={"text-lg sm:text-xl"} />
						// );
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

			{/* Alert */}
			<AlertDialog
				open={alertOpen !== 0}
				onClose={handleAlertClose}
				icon={<ReportProblemIcon color="secondary" />}
				title="注意"
				content={"是否確認將此會議室進行刪除處理？"}
				disagreeText="取消"
				agreeText="確定"
			/>
		</>
	);
};

export default ConferenceRoomAppointment;
