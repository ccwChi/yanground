import React, { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
// date-fns
import { parseISO, format } from "date-fns";
import { zhTW } from "date-fns/locale";
import { utcToZonedTime } from "date-fns-tz";
// MUI
import VisibilityIcon from "@mui/icons-material/Visibility";
// Components
import PageTitle from "../../components/Guideline/PageTitle";
import RWDTable from "../../components/RWDTable/RWDTable";
import Pagination from "../../components/Pagination/Pagination";
// Hooks
import useNavigateWithParams from "../../hooks/useNavigateWithParams";
import { useNotification } from "../../hooks/useNotification";
// Utils
import { getData, postData } from "../../utils/api";
// Customs
import attendanceWaiverList from "../../datas/attendanceWaiverType";
import { ViewModal } from "./AttendanceWaiverHRMModal";
import { Backdrop } from "@mui/material";
import { LoadingFour } from "../../components/Loader/Loading";

const AttendanceWaiverHRM = () => {
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
	// 傳遞至後端是否完成 Flag
	const [sendBackFlag, setSendBackFlag] = useState(false);
	// ApiUrl
	const furl = "attendanceWaiverForm";
	const apiUrl = `${furl}?p=${page + 1}&s=${rowsPerPage}`;

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
					const transformedData = {
						...data,
						content: data.content.map((item) => ({
							fullname: `${item.attendance.user.lastname}${item.attendance.user.firstname}`,
							department: item.attendance.user.department,
							id: item.id,
							appliedAt: item.appliedAt ? formatDateTime(item.appliedAt) : "-",
							attendanceWaivertype: item.type.chinese,
							attendance: item.attendance,
							excuse: item.excuse,
							since: item.since ? formatDateTime(item.since) : "-",
							until: item.until ? formatDateTime(item.until) : "-",
							agent: item.agent,
							approver: item.approver,
							approvedAt: item.approvedAt ? formatDateTime(item.approvedAt) : "-",
							approveState: item.approvedAt ? true : null,
							remark: item.remark,
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
				}
			});
		},
		[page]
	);

	// 對照 API Table 所顯示 key
	const columnsPC = [
		{ key: "attendanceWaivertype", label: "類別", size: "12%" },
		{ key: "fullname", label: "申請人", size: "12%" },
		{ key: "since", label: "申請區間 (起)", size: "17%" },
		{ key: "until", label: "申請區間 (迄)", size: "17%" },
		{ key: "appliedAt", label: "提出申請時間", size: "17%" },
		{ key: "approveState", label: "審核狀態", size: "12%" },
	];
	const columnsMobile = [
		{ key: "id", label: "編號" },
		{ key: "fullname", label: "申請人" },
		{ key: "attendanceWaivertype", label: "類別" },
		{ key: "excuse", label: "申請事由" },
		{ key: "since", label: "申請區間 (起)" },
		{ key: "until", label: "申請區間 (迄)" },
		{ key: "appliedAt", label: "提出申請時間" },
		{ key: "agent", label: "代理人" },
		{ key: ["approver", "fullName"], label: "審核主管" },
		{ key: "approvedAt", label: "審核時間" },
		{ key: "remark", label: "審核備註" },
	];

	// Table 操作按鈕
	const actions = [{ value: "review", icon: <VisibilityIcon />, title: "檢視" }];

	// 設置頁數
	const handleChangePage = useCallback(
		(event, newPage) => {
			setPage(newPage);
			navigateWithParams(newPage + 1, rowsPerPage);
		},
		[rowsPerPage]
	);

	// 設置每頁顯示並返回第一頁
	const handleChangeRowsPerPage = (event) => {
		const targetValue = parseInt(event.target.value, 10);
		setRowsPerPage(targetValue);
		setPage(0);
		navigateWithParams(1, targetValue);
	};

	const handleActionClick = (event) => {
		event.stopPropagation();
		const dataMode = event.currentTarget.getAttribute("data-mode");
		const dataValue = event.currentTarget.getAttribute("data-value");

		setModalValue(dataMode);
		setDeliverInfo(dataValue ? apiData?.content.find((item) => item.id === dataValue) : null);
	};

	// 傳遞給後端資料
	const sendDataToBackend = (fd, mode, otherData) => {
		setSendBackFlag(true);
		let url = "attendanceWaiverForm";
		let message = [];
		switch (mode) {
			case "approval":
				url += `/${otherData[0]}/${otherData[1]}`;
				message = ["審核成功！"];
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


	// 關閉 Modal 清除資料
	const onClose = () => {
		setModalValue(false);
		setDeliverInfo(null);
	};

	// modal 開啟參數與顯示標題
	const modalConfig = [
		{
			modalValue: "review",
			modalComponent: (
				<ViewModal title={"檢視審核資訊"} deliverInfo={deliverInfo} onClose={onClose} sendDataToBackend={sendDataToBackend}/>
			),
		},
	];
	const config = modalValue ? modalConfig.find((item) => item.modalValue === modalValue) : null;

	return (
		<>
			{/* PageTitle */}
			<PageTitle
				title="豁免出勤"
				description="此頁面為提供人資檢視其他同仁員工豁免出勤審核紀錄的功能。"
			/>

			{/* Table */}
			<div className="overflow-y-auto sm:overflow-y-hidden h-full order-3 sm:order-1">
				<RWDTable
					data={apiData?.content}
					columnsPC={columnsPC}
					columnsMobile={columnsMobile}
					actions={actions}
					cardTitleKey={"fullname"}
					tableMinWidth={800}
					isLoading={isLoading}
					handleActionClick={handleActionClick}
					attendanceWaiverList={attendanceWaiverList}
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

			{/* Modal */}
			{config && config.modalComponent}

			{/* Backdrop */}
			<Backdrop sx={{ color: "#fff", zIndex: 1400 }} open={sendBackFlag}>
				<LoadingFour />
			</Backdrop>
		</>
	);
};

export default AttendanceWaiverHRM;
