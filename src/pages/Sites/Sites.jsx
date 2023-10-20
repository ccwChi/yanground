import React, { useCallback, useEffect, useState } from "react";
import PageTitle from "../../components/Guideline/PageTitle";
import FloatingActionButton from "../../components/FloatingActionButton/FloatingActionButton";
import TableTabber from "../../components/Tabbar/TableTabber";
import RWDTable from "../../components/RWDTable/RWDTable";
import Pagination from "../../components/Pagination/Pagination";
import ModalTemplete from "../../components/Modal/ModalTemplete";
import AddIcon from "@mui/icons-material/Add";
import FolderCopyIcon from "@mui/icons-material/FolderCopy";
import WorkHistoryIcon from "@mui/icons-material/WorkHistory";
import EditIcon from "@mui/icons-material/Edit";
import { faCirclePlus, faCopy } from "@fortawesome/free-solid-svg-icons";
import { getData } from "../../utils/api";
import { UpdatedModal, OutputListModal, EditModal, DispatchWorkModal } from "./SitesModal";

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
	const apiUrl = `site?p=${page + 1}&s=${rowsPerPage}`;
	// ModalValue 控制開啟的是哪一個 Modal
	const [modalValue, setModalValue] = useState(false);

	const tabGroup = [
		{ f: "", text: "全部" },
		{ f: "inprogress", text: "進行中" },
		{ f: "unstarted", text: "尚未開始" },
		{ f: "end", text: "已結束" },
	];
	const btnGroup = [
		{
			mode: "create",
			icon: faCirclePlus,
			text: "新增案場",
			variant: "contained",
			color: "primary",
			fabVariant: "success",
			fab: <AddIcon fontSize="large" />,
		},
		{
			mode: "outputList",
			icon: faCopy,
			text: "輸出派工清單",
			variant: "contained",
			color: "secondary",
			fabVariant: "warning",
			fab: <FolderCopyIcon fontSize="large" />,
		},
	];

	const columns = [
		{ key: "id", label: "ID" },
		{ key: "name", label: "案場" },
	];

	// edit = 編輯案場名稱 ,dw = dispatch work 明日派工清單
	const actions = [
		{ value: "edit", icon: <EditIcon /> },
		{ value: "dw", icon: <WorkHistoryIcon /> },
	];

	// modal 開啟參數與顯示標題
	const modalConfig = [
		{ modalValue: "create", title: "新增案場", modalComponent: <UpdatedModal /> },
		{ modalValue: "outputList", title: "派工清單", modalComponent: <OutputListModal /> },
		{ modalValue: "edit", title: "編輯案場", modalComponent: <EditModal /> },
		{ modalValue: "dw", title: "明日派工", modalComponent: <DispatchWorkModal /> },
	];
	const config = modalValue ? modalConfig.find((item) => item.modalValue === modalValue) : null;

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

		console.log("Action button clicked", dataMode, dataValue);
	};

	const onClose = () => {
		setModalValue(false);
	};

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
					tableMinWidth={600}
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
			<FloatingActionButton btnGroup={btnGroup} />

			{/* Modal */}
			<ModalTemplete title={config ? config.title : ""} show={config ? true : false} onClose={onClose}>
				{config && config.modalComponent}
			</ModalTemplete>
		</>
	);
};

export default Sites;
