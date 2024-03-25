import React, { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// Component
import PageTitle from "../../components/Guideline/PageTitle";
import FloatingActionButton from "../../components/FloatingActionButton/FloatingActionButton";
import RWDTable from "../../components/RWDTable/RWDTable";
import Pagination from "../../components/Pagination/Pagination";
import { LoadingFour } from "../../components/Loader/Loading";
import AlertDialog from "../../components/Alert/AlertDialog";

// Mui
import Backdrop from "@mui/material/Backdrop";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import DriveFileMoveIcon from "@mui/icons-material/DriveFileMove";

// Hooks
import { useNotification } from "../../hooks/useNotification";

// Utils
import { getData, postData, deleteData } from "../../utils/api";

// Custom
import { UpdatedModal } from "./ProjectModal";

const Project = () => {
	const navigate = useNavigate();
	const showNotification = useNotification();

	// 解析網址取得參數
	const location = useLocation();
	const queryParams = new URLSearchParams(location.search);

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
	// ApiUrl
	const furl = "project";
	const apiUrl = `${furl}?p=${page + 1}&s=${rowsPerPage}`;
	// ModalValue 控制開啟的是哪一個 Modal
	const [modalValue, setModalValue] = useState(false);
	// 傳送額外資訊給 Modal
	const [deliverInfo, setDeliverInfo] = useState(null);
	// 縣市清單
	const [cityList, setCityList] = useState(null);
	// 傳遞稍後用 Flag
	const [sendBackFlag, setSendBackFlag] = useState(false);
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
			text: "新增專案",
			variant: "contained",
			color: "primary",
			fabVariant: "success",
			fab: <AddIcon fontSize="large" />,
		},
	];

	// 對照 api table 所顯示 key
	const columnsPC = [
		{ key: "name", label: "專案名稱", align: "left" },
		{ key: ["businessRepresentative", "nickname"], label: "負責人", size: "12%" },
		{ key: ["foremanRepresentative", "nickname"], label: "工務專管人員", size: "12%" },
		{ key: "administrativeDivision", label: "地點", size: "15%" },
	];
	const columnsMobile = [
		{ key: "name", label: "專案名稱" },
		{ key: ["businessRepresentative", "nickname"], label: "負責人" },
		{ key: ["foremanRepresentative", "nickname"], label: "工務專管人員" },
		{ key: "administrativeDivision", label: "地點" },
	];

	const actions = [
		{ value: "edit", icon: <EditIcon />, title: "編輯專案" },
		{ value: "void", icon: <DeleteIcon />, title: "刪除專案" },
		// { value: "gotoFM", icon: <DriveFileMoveIcon />, title: "前往專管文件管理頁" },
	];

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
					setApiData(data);
					if (page >= data?.totalPages) {
						setPage(0);
						setRowsPerPage(10);
						navigate(`?p=1&s=10`);
					}
				} else {
					setApiData(null);
					showNotification("主資料 API 請求失敗", false, 10000);
				}
			});
		},
		[page]
	);

	// 取得縣市資料
	useEffect(() => {
		getData("administrativeDivision?p=1&s=50").then((result) => {
			const data = result.result?.content;
			setCityList(data);
		});
	}, []);

	// 傳遞給後端資料
	const sendDataToBackend = (fd, mode, otherData) => {
		setSendBackFlag(true);
		let url = furl;
		let message = [];
		switch (mode) {
			case "create":
				message = ["專案新增成功！"];
				break;
			case "edit":
				url += "/" + otherData;
				message = ["專案編輯成功！"];
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

		// for (var pair of fd.entries()) {
		// 	console.log(pair);
		// }
	};

	// 設置頁數
	const handleChangePage = useCallback((event, newPage) => {
		setPage(newPage);
		navigate(`?p=${newPage + 1}&s=${rowsPerPage}`);
	}, []);

	// 設置每頁顯示並返回第一頁
	const handleChangeRowsPerPage = (event) => {
		const targetValue = parseInt(event.target.value, 10);
		setRowsPerPage(targetValue);
		setPage(0);
		navigate(`?p=1&s=${targetValue}`);
	};

	// 當活動按鈕點擊時開啟 modal 並進行動作
	const handleActionClick = (event) => {
		event.stopPropagation();
		const dataMode = event.currentTarget.getAttribute("data-mode");
		const dataValue = event.currentTarget.getAttribute("data-value");

		if (dataMode === "void") {
			setDeliverInfo(dataValue);
			setAlertOpen(1);
		} else if (dataMode === "gotoFM") {
			navigate(`documents?pj=${dataValue}`);
		} else {
			setModalValue(dataMode);
			if (dataValue) {
				setDeliverInfo(dataValue);
			}
		}
		// setDeliverInfo(dataValue ? apiData.content.find((item) => item.id === dataValue) : "");
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

				deleteData(`project/${deliverInfo}`).then((result) => {
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
			modalValue: "create",
			modalComponent: (
				<UpdatedModal title="新增專案" sendDataToBackend={sendDataToBackend} cityList={cityList} onClose={onClose} />
			),
		},
		{
			modalValue: "edit",
			modalComponent: (
				<UpdatedModal
					title="編輯專案"
					deliverInfo={deliverInfo}
					sendDataToBackend={sendDataToBackend}
					cityList={cityList}
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
				title="專案管理"
				description={"此頁面是用於新增、編輯專案，同時可以選擇案場範圍，提供方便管理專案的功能。"}
				btnGroup={btnGroup}
				handleActionClick={handleActionClick}
				isLoading={!isLoading}
			/>

			{/* Table */}
			<div className="overflow-y-auto sm:overflow-y-hidden h-full order-3 sm:order-1">
				<RWDTable
					data={apiData?.content}
					columnsPC={columnsPC}
					columnsMobile={columnsMobile}
					actions={actions}
					cardTitleKey={"name"}
					tableMinWidth={1024}
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
				open={alertOpen !== 0}
				onClose={handleAlertClose}
				icon={<ReportProblemIcon color="secondary" />}
				title="注意"
				content={"是否確認將此專案進行刪除處理？"}
				disagreeText="取消"
				agreeText="確定"
			/>
		</>
	);
};

export default Project;
