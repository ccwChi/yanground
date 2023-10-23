import React, { useCallback, useEffect, useState } from "react";
import PageTitle from "../../components/Guideline/PageTitle";
import FloatingActionButton from "../../components/FloatingActionButton/FloatingActionButton";
import TableTabber from "../../components/Tabbar/TableTabber";
import RWDTable from "../../components/RWDTable/RWDTable";
import Pagination from "../../components/Pagination/Pagination";
import AddIcon from "@mui/icons-material/Add";
import FolderCopyIcon from "@mui/icons-material/FolderCopy";
import WorkHistoryIcon from "@mui/icons-material/WorkHistory";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import EditIcon from "@mui/icons-material/Edit";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import { getData, postData } from "../../utils/api";
import { UpdatedModal, OutputListModal, EditModal, DispatchWorkModal } from "./SitesModal";
import { useSnackbar } from "notistack";

const Sites = () => {
	// cat = Category 設置 tab 分類
	const [cat, setCat] = useState(null);
	// API List Data
	const [apiData, setApiData] = useState(null);
	// isLoading 等待請求 api
	const [isLoading, setIsLoading] = useState(false);
	// Page 頁數設置
	const [page, setPage] = useState(0);
	// rows per Page 多少筆等同於一頁
	const [rowsPerPage, setRowsPerPage] = useState(10);
	// ApiUrl
	const furl = "site";
	const apiUrl = `${furl}?p=${page + 1}&s=${rowsPerPage}`;
	// ModalValue 控制開啟的是哪一個 Modal
	const [modalValue, setModalValue] = useState(false);
	// 傳送額外資訊給 Modal
	const [deliverInfo, setDeliverInfo] = useState(null);
	const { enqueueSnackbar } = useSnackbar();

	// Tab 列表對應 api 搜尋參數
	const tabGroup = [
		{ f: "", text: "全部" },
		{ f: "inprogress", text: "進行中" },
		{ f: "unstarted", text: "尚未開始" },
		{ f: "end", text: "已結束" },
	];

	// 上方區塊功能按鈕清單
	const btnGroup = [
		{
			mode: "create",
			icon: <AddCircleIcon fontSize="small" />,
			text: "新增案場",
			variant: "contained",
			color: "primary",
			fabVariant: "success",
			fab: <AddIcon fontSize="large" />,
		},
		{
			mode: "outputList",
			icon: <FileCopyIcon fontSize="small" />,
			text: "輸出派工清單",
			variant: "contained",
			color: "secondary",
			fabVariant: "warning",
			fab: <FolderCopyIcon fontSize="large" />,
		},
	];

	// 對照 api table 所顯示 key
	const columns = [
		{ key: "id", label: "ID" },
		{ key: "name", label: "案場" },
	];

	// edit = 編輯案場名稱 ,dw = dispatch work 明日派工清單
	const actions = [
		{ value: "edit", icon: <EditIcon /> },
		{ value: "dw", icon: <WorkHistoryIcon /> },
	];

	useEffect(() => {
		getApiList(apiUrl);
	}, [apiUrl]);

	const getApiList = useCallback((url) => {
		setIsLoading(true);
		getData(url).then((result) => {
			setIsLoading(false);
			const data = result.result;
			setApiData(data);
		});
	}, []);

	const sendDataToBackend = (fd, mode, otherData) => {
		let url = "";
		let message = [];
		switch (mode) {
			case "create":
				url = furl;
				message = ["案場新增成功！"];
				break;
			case "edit":
				url = furl + "/" + otherData;
				message = ["案場編輯成功！"];
				break;
			default:
				break;
		}
		postData(url, fd).then((result) => {
			if (result.status) {
				enqueueSnackbar(message[0], {
					variant: "success",
					anchorOrigin: {
						vertical: "bottom", // 垂直，可選：'top', 'bottom'
						horizontal: "center", // 水平，可選：'left', 'center', 'right'
					},
					autoHideDuration: 3000,
				});
				getApiList(apiUrl);
			} else {
				enqueueSnackbar(result.result.reason, {
					variant: "error",
					anchorOrigin: {
						vertical: "bottom", // 垂直，可選：'top', 'bottom'
						horizontal: "center", // 水平，可選：'left', 'center', 'right'
					},
					autoHideDuration: 3000,
				});
			}
		});
		for (var pair of fd.entries()) {
			console.log(pair);
		}
	};

	const handleChangePage = useCallback((event, newPage) => {
		setPage(newPage);
	}, []);

	const handleChangeRowsPerPage = (event) => {
		setRowsPerPage(parseInt(event.target.value, 10));
		setPage(0);
	};

	const handleActionClick = (event) => {
		event.stopPropagation();
		const dataMode = event.currentTarget.getAttribute("data-mode");
		const dataValue = event.currentTarget.getAttribute("data-value");
		setModalValue(dataMode);
		setDeliverInfo([dataValue, dataValue ? apiData.find((item) => item.id === dataValue).name : ""]);

		// console.log("Action button clicked", dataMode, dataValue);
	};

	const onClose = () => {
		setModalValue(false);
		setDeliverInfo(null);
	};

	// modal 開啟參數與顯示標題
	const modalConfig = [
		{
			modalValue: "create",
			modalComponent: <UpdatedModal title="新增案場" sendDataToBackend={sendDataToBackend} onClose={onClose} />,
		},
		{ modalValue: "outputList", modalComponent: <OutputListModal title="派工清單" onClose={onClose} /> },
		{
			modalValue: "edit",
			modalComponent: (
				<EditModal title="編輯案場" deliverInfo={deliverInfo} sendDataToBackend={sendDataToBackend} onClose={onClose} />
			),
		},
		{ modalValue: "dw", modalComponent: <DispatchWorkModal title="明日派工" onClose={onClose} /> },
	];
	const config = modalValue ? modalConfig.find((item) => item.modalValue === modalValue) : null;

	return (
		<>
			{/* PageTitle */}
			<PageTitle title="案場" btnGroup={btnGroup} handleActionClick={handleActionClick} />

			{/* TabBar */}
			<TableTabber tabGroup={tabGroup} setCat={setCat} />

			{/* Table */}
			<div className="overflow-y-auto h-full order-3 sm:order-1">
				{/* {apiData && <pre>{JSON.stringify(apiData, null, 2)}</pre>} */}
				<RWDTable
					data={apiData}
					columns={columns}
					actions={actions}
					cardTitleKey={"name"}
					tableMinWidth={540}
					isLoading={isLoading}
					handleActionClick={handleActionClick}
				/>
			</div>

			{/* Pagination */}
			<Pagination
				totalElement={apiData ? apiData.length : 0}
				page={page}
				onPageChange={handleChangePage}
				rowsPerPage={rowsPerPage}
				onRowsPerPageChange={handleChangeRowsPerPage}
			/>

			{/* Floating Action Button */}
			<FloatingActionButton btnGroup={btnGroup} handleActionClick={handleActionClick} />

			{/* Modal */}
			{config && config.modalComponent}
		</>
	);
};

export default Sites;
