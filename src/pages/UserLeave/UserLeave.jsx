import React, { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// date-fns
import { parseISO, format } from "date-fns";
import { zhTW } from "date-fns/locale";
import { utcToZonedTime } from "date-fns-tz";

// MUI
import Backdrop from "@mui/material/Backdrop";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import AssignmentReturnIcon from "@mui/icons-material/AssignmentReturn";

// Component
import PageTitle from "../../components/Guideline/PageTitle";
import FloatingActionButton from "../../components/FloatingActionButton/FloatingActionButton";
import RWDTable from "../../components/RWDTable/RWDTable";
import Pagination from "../../components/Pagination/Pagination";
import { LoadingFour } from "../../components/Loader/Loading";
import AlertDialog from "../../components/Alert/AlertDialog";
import UserLeaveModal from "../../components/UserLeaveModal/UserLeaveModal";

// Hooks
import useNavigateWithParams from "../../hooks/useNavigateWithParams";
import { useNotification } from "../../hooks/useNotification";

// Utils
import { getData, postData, deleteData } from "../../utils/api";

const UserLeave = () => {
	// 解析網址取得參數
	const location = useLocation();
	const queryParams = new URLSearchParams(location.search);
	const navigateWithParams = useNavigateWithParams();
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
	// Alert 開關
	/**
	 * 0: 關閉
	 * 1: 是否確認刪除視窗
	 */
	const [alertOpen, setAlertOpen] = useState(0);
	const [attendanceTypeList, setAttendanceTypeList] = useState([]);

	const [reflesh, setReflesh] = useState(false);
	const [isOpen, setIsOpen] = useState(false);
	// ApiUrl
	const furl = "me/attendanceWaiverForm";
	const [apiUrl, setApiUrl] = useState("");

	// 轉換時間
	const formatDateTime = (dateTime) => {
		const parsedDateTime = parseISO(dateTime);
		const formattedDateTime = format(utcToZonedTime(parsedDateTime, "Asia/Taipei"), "yyyy-MM-dd HH:mm", {
			locale: zhTW,
		});
		return formattedDateTime;
	};

	// 上方區塊功能按鈕清單
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
	];

	// 對照 api table 所顯示 key
	const columnsPC = [
		{ key: "fullname", label: "姓名", size: "20%" },
		{ key: "attendance", label: "請假假別", size: "14%" },
		{ key: "since", label: "起始時間", size: "25%" },
		{ key: "until", label: "結束時間", size: "25%" },
	];
	const columnsMobile = [
		{ key: "fullname", label: "姓名" },
		{ key: "attendance", label: "請假假別" },
		{ key: "since", label: "起始時間" },
		{ key: "until", label: "結束時間" },
	];

	const actions = [
		{ value: "delete", icon: <DeleteIcon />, title: "刪除" },
		{ value: "leaveEdit", icon: <EditIcon />, title: "編輯" },
	];

	// 更新 ApiUrl
	useEffect(() => {
		let constructedApiUrl = `${furl}?p=${page + 1}&s=${rowsPerPage}`;

		const searchquery = Object.fromEntries(queryParams.entries());
		for (const key in searchquery) {
			if (
				key !== "p" &&
				key !== "s" &&
				searchquery[key] !== undefined &&
				searchquery[key] !== null &&
				searchquery[key] !== ""
			) {
				constructedApiUrl += `&${key}=${encodeURIComponent(searchquery[key])}`;
			}
		}

		setApiUrl(constructedApiUrl);
	}, [page, rowsPerPage, queryParams]);


	// 取得請假類別
	useEffect(() => {
		getData("attendanceType").then((result) => {
			if (result.result) {
				const data = result.result;
				const filterData = data.filter((i) => i.value !== "ATTENDANCE" && i.value !== "ARRANGED_LEAVE");
				setAttendanceTypeList(filterData);
			} else {
				setAttendanceTypeList([]);
			}
		});
	}, []);

	// 取得列表資料
	useEffect(() => {
		if (apiUrl !== "" ) { 
			getApiList(apiUrl); 
		} else if (apiUrl !== "" && reflesh){
			getApiList(apiUrl); setReflesh(false)
		}
	}, [apiUrl, reflesh]);

	const getApiList = useCallback(
		(url) => {
			setIsLoading(true);
			getData(url).then((result) => {
				setIsLoading(false);
				if (result.result) {
					const data = result.result;
					const transformedData = {
						...data,
						content: data.content.map((item) => ({
							spectiallyKey: item.attendance.since ? formatDateTime(item.attendance.since).slice(0, 10) + " " + item.attendance.type.chinese : item.attendance.date+" 缺勤",
							fullname: `${item.attendance.user.lastname}${item.attendance.user.firstname}`,
							department: item.attendance.user.department,
							id: item.attendance.id,
							date: item.attendance.date,
							attendance: item.type.value !== "LEAVE" ? item.type.chinese  : !item.attendance.type.leave ? "缺勤" : item.attendance.type.chinese ,
							attendanceValue: item.type.value !== "LEAVE" ? item.type.chinese  : !item.attendance.type.leave ? null : item.attendance.type.value ,
							excuse: item.excuse ? item.excuse : "",
							since: item.attendance.since ? formatDateTime(item.attendance.since) :  !item.attendance.type.leave ?item.attendance.date :"-",
							until: item.attendance.until ? formatDateTime(item.attendance.until) :  !item.attendance.type.leave ?item.attendance.date :"-",
							waiverId:item.id,
							isLeaveApplication: item.attendance.type.leave,
							agent:item.agent?.id ? item.agent.id : null,
							approvedAt: item.approvedAt ? item.approvedAt : null,
							approver: item.approver ? item.approver : null,
						})),
					};
					setApiData(transformedData);

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
    //
	// 設置頁數
	const handleChangePage = 
		(event, newPage) => {
			setPage(newPage);
			navigateWithParams(newPage + 1, rowsPerPage);
		}

	// 設置每頁顯示並返回第一頁
	const handleChangeRowsPerPage = (event) => {
		const targetValue = parseInt(event.target.value, 10);
		setRowsPerPage(targetValue);
		setPage(0);
		navigateWithParams(1, targetValue);
	};

	// 當活動按鈕點擊時開啟 modal 並進行動作
	const handleActionClick = (event) => {
		event.stopPropagation();
		const dataMode = event.currentTarget.getAttribute("data-mode");
		const dataValue = event.currentTarget.getAttribute("data-value");

		// setModalValue(dataMode);
		setIsOpen(true);
		setDeliverInfo(dataValue ? apiData?.content.find((item) => item.id === dataValue) : null);
		// console.log(dataValue ? apiData?.content.find((item) => item.id === dataValue) : null)
		const isLeaveApplication = apiData?.content.find((item) => item.id === dataValue)?.isLeaveApplication || null
		if (dataMode === "leaveapplication"){
			setModalValue(dataMode);
		}
		if (dataMode === "delete" && isLeaveApplication) 
		{
			setAlertOpen(true);
		} else if (dataMode === "delete" && !isLeaveApplication) {
			showNotification("非假單，無法刪除！", false);
		}
		if (dataMode === "leaveEdit" && isLeaveApplication) {
			setModalValue(dataMode);
		} else if (dataMode === "leaveEdit" && !isLeaveApplication){
			showNotification("非假單，無法編輯！", false);
		}
		};

	const handleAlertClose = async (agree) => {
		if (agree) {
			deleteLeave();
		}
		setAlertOpen(false);
	};

	const deleteLeave = () => {
		setSendBackFlag(true);
		const deleteId = deliverInfo.waiverId;
		const url = `me/attendanceWaiverForm/${deleteId}`;
		const message = "刪除該筆假單成功";
		deleteData(url).then((result) => {
			if (result.status) {
				showNotification(message, true);
				setAlertOpen(false);
				setDeliverInfo(null);
				setSendBackFlag(false);
				setAlertOpen(false);
				setReflesh(true);
			} else {
				showNotification(
					result.result.reason
						? result.result.reason
						: result.result
						? result.result
						: "發生無法預期的錯誤，請洽資訊部。",
					false
				);
				setAlertOpen(false);
				setSendBackFlag(false);
			}
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
			modalValue: "leaveapplication",
			modalComponent: (
				<UserLeaveModal
					title={"假單申請"}
					attendanceTypeList={attendanceTypeList}
					onClose={onClose}
					isOpen={isOpen}
					setReflesh={setReflesh}
				/>
			),
		},{
			modalValue: "leaveEdit",
			modalComponent: (
				<UserLeaveModal
					title={"假單編輯"}
					attendanceTypeList={attendanceTypeList}
					deliverInfo={deliverInfo}
					onClose={onClose}
					isOpen={isOpen}
					setReflesh={setReflesh}
				/>
			),
		},
	];
	const config = modalValue ? modalConfig.find((item) => item.modalValue === modalValue) : null;

	return (
		<>
			{/* PageTitle */}
			<PageTitle
				title="請假申請"
				description={"此頁面是用於查看自己請假清單以及請假申請用，僅有自己申請的假單可以編輯刪除，系統產生的則無法。"}
				btnGroup={btnGroup}
				handleActionClick={handleActionClick}
				isLoading={!isLoading}
			/>

			{/* Table */}
			<div className="overflow-y-auto sm:overflow-y-hidden h-full order-3 sm:order-1">
				<RWDTable
					data={apiData?.content || []}
					columnsPC={columnsPC}
					columnsMobile={columnsMobile}
					actions={actions}
					cardTitleKey={["spectiallyKey"]}
					tableMinWidth={700}
					isLoading={isLoading}
					handleActionClick={handleActionClick}
				/>
			</div>

			{/* Pagination */}
			<Pagination
				totalElement={apiData ? apiData.totalElements : 0}
				page={apiData && page < apiData.totalPages ? page : 0}
				onPageChange={handleChangePage}
				rowsPerPage={rowsPerPage}
				onRowsPerPageChange={handleChangeRowsPerPage}
			/>

			{/* Floating Action Button */}
			<FloatingActionButton btnGroup={btnGroup} handleActionClick={handleActionClick} />

			{/* Modal */}
			{config && config.modalComponent}

			{/* Backdrop */}
			<Backdrop sx={{ color: "#fff", zIndex: 1400 }} open={sendBackFlag}>
				<LoadingFour />
			</Backdrop>

			{/* Alert */}
			<AlertDialog
				open={alertOpen}
				onClose={handleAlertClose}
				icon={<ReportProblemIcon color="secondary" />}
				title="注意"
				content={`是否確認刪除 ${deliverInfo?.date && deliverInfo.date} 的 ${
					deliverInfo?.attendance ? `"` + deliverInfo?.attendance + `"` : ""
				} 假單`}
				disagreeText="取消"
				agreeText="確定"
			/>
		</>
	);
};

export default UserLeave;
