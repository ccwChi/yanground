import React, { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";

// MUI
import Backdrop from "@mui/material/Backdrop";
import AddIcon from "@mui/icons-material/Add";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";

// Component
import PageTitle from "../../components/Guideline/PageTitle";
import TableTabbar from "../../components/Tabbar/TableTabbar";
import { LoadingTwo, LoadingFour } from "../../components/Loader/Loading";
import Calendar from "../../components/Calendar/Calendar";
import RWDTable from "../../components/RWDTable/RWDTable";
import Pagination from "../../components/Pagination/Pagination";
import AlertDialog from "../../components/Alert/AlertDialog";
import FloatingActionButton from "../../components/FloatingActionButton/FloatingActionButton";

// Hooks
import useNavigateWithParams from "../../hooks/useNavigateWithParams";

/***
 * CarDispatch
 * 公務車調度
 * @returns
 ***/
const CarDispatch = () => {
	// 解析網址取得參數
	const location = useLocation();
	const queryParams = new URLSearchParams(location.search);
	// 路由記憶切換
	const navigateWithParams = useNavigateWithParams();

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
	// Category
	const tabGroup = [
		{ f: "loanStatusTable", text: "狀況管理" },
		{ f: "reservationCalendar", text: "預約月曆" },
	];
	const [cat, setCat] = useState(
		queryParams.has("cat") && tabGroup.some((tab) => tab.f === queryParams.get("cat"))
			? queryParams.get("cat")
			: tabGroup[0].f
	);
	// Alert 開關
	/**
	 * 0: 關閉
	 * 1: 是否確認刪除視窗
	 */
	const [alertOpen, setAlertOpen] = useState(0);

	// 上方區塊功能按鈕清單
	const btnGroup = [
		{
			mode: "create",
			icon: <AddCircleIcon fontSize="small" />,
			text: "新增預約",
			variant: "contained",
			color: "primary",
			fabVariant: "success",
			fab: <AddIcon fontSize="large" />,
		},
	];
	// 對照 api table 所顯示 key
	const columnsPC = [{ key: [""], label: "Title", align: "left" }];
	const columnsMobile = [{ key: [""], label: "Title" }];

	// 當活動按鈕點擊時動作
	const handleActionClick = (event) => {
		event.stopPropagation();
		const dataMode = event.currentTarget.getAttribute("data-mode");
		const dataValue = event.currentTarget.getAttribute("data-value");
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

	// Alert 回傳值進行最終結果 --- true: 關閉 modal / all: 關閉 Alert
	const handleAlertClose = (agree) => {
		if (agree) {
			if (alertOpen === 1) {
				// let message = "刪除成功！";
				// deleteData(`${furl}/${deliverInfo}`).then((result) => {
				// 	if (result.status) {
				// 		showNotification(message, true);
				// 		getApiList(apiUrl);
				// 	} else {
				// 		showNotification(result?.result.reason || "出現錯誤。", false);
				// 	}
				// 	setSendBackFlag(false);
				// });
			}
		}
		setAlertOpen(0);
		setDeliverInfo(null);
	};

	// modal 開啟參數與顯示標題
	const modalConfig = [
		{
			modalValue: "create",
			modalComponent: <></>,
		},
	];
	const config = modalValue ? modalConfig.find((item) => item.modalValue === modalValue) : null;

	return (
		<>
			{/* PageTitle */}
			<PageTitle
				title="公務車調度"
				description="此頁面是用於公務車調度，提供新增、編輯、刪除申請的功能，並可查看月曆車輛的當前狀態和預約情況。"
				btnGroup={btnGroup}
				handleActionClick={handleActionClick}
			/>

			{/* Tab */}
			<TableTabbar
				tabGroup={tabGroup}
				cat={cat}
				setCat={setCat}
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
							// return apiDataTable ? (
							return (
								<>
									{/* Table */}
									<div className="pt-2 overflow-y-auto sm:overflow-y-hidden h-full order-3 sm:order-1">
										<RWDTable
											data={[]}
											columnsPC={columnsPC}
											columnsMobile={columnsMobile}
											// // actions={actions}
											// // cardTitleKey={"name"}
											// tableMinWidth={540}
											// isLoading={isLoading}
											handleActionClick={handleActionClick}
										/>
									</div>

									{/* Pagination */}
									<Pagination
										// totalElement={apiData ? apiData.totalElements : 0}
										// page={apiData && page < apiData.totalPages ? page : 0}
										// onPageChange={handleChangePage}
										// rowsPerPage={rowsPerPage}
										// onRowsPerPageChange={handleChangeRowsPerPage}
										totalElement={0}
										page={0}
										onPageChange={handleChangePage}
										rowsPerPage={rowsPerPage}
										onRowsPerPageChange={handleChangeRowsPerPage}
									/>
								</>
							);
						// ) : (
						// 	<LoadingTwo size={isSmallScreen ? 120 : 160} textSize={"text-lg sm:text-xl"} />
						// );
						case "reservationCalendar": // 預約月曆
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
				open={alertOpen !== 0}
				onClose={handleAlertClose}
				icon={<ReportProblemIcon color="secondary" />}
				title="注意"
				content={"是否確認將此職稱進行刪除處理？"}
				disagreeText="取消"
				agreeText="確定"
			/>
		</>
	);
};

export default CarDispatch;
