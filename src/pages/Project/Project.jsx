import React, { useCallback, useEffect, useState } from "react";
import PageTitle from "../../components/Guideline/PageTitle";
import FloatingActionButton from "../../components/FloatingActionButton/FloatingActionButton";
import RWDTable from "../../components/RWDTable/RWDTable";
import Pagination from "../../components/Pagination/Pagination";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import { getData, postData } from "../../utils/api";
import { UpdatedModal } from "./ProjectModal";
import { useNotification } from "../../hooks/useNotification";

const Project = () => {
	const showNotification = useNotification();

	// API List Data
	const [apiData, setApiData] = useState(null);
	// isLoading 等待請求 api
	const [isLoading, setIsLoading] = useState(true);
	// Page 頁數設置
	const [page, setPage] = useState(0);
	// rows per Page 多少筆等同於一頁
	const [rowsPerPage, setRowsPerPage] = useState(10);
	// ApiUrl
	const furl = "project";
	const apiUrl = `${furl}?p=${page + 1}&s=${rowsPerPage}`;
	// ModalValue 控制開啟的是哪一個 Modal
	const [modalValue, setModalValue] = useState(false);
	// 傳送額外資訊給 Modal
	const [deliverInfo, setDeliverInfo] = useState(null);
	// 縣市清單
	const [cityList, setCityList] = useState(null);

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
		{ key: "name", label: "專案名稱" },
		{ key: "businessRepresentative", label: "負責人", children: { key: "nickname" }, size: "15%" },
		{ key: "administrativeDivision", label: "地點", size: "20%" },
	];
	const columnsMobile = [
		{ key: "name", label: "專案名稱" },
		{ key: "businessRepresentative", label: "負責人", children: { key: "nickname" } },
		{ key: "administrativeDivision", label: "地點" },
	];

	const actions = [
		{ value: "edit", icon: <EditIcon />, title: "編輯專案" },
	];

	// 取得列表資料
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

	// 取得縣市資料
	useEffect(() => {
		getData("administrativeDivision??p=1&s=50").then((result) => {
			const data = result.result.content;
			setCityList(data);
		});
	}, []);

	// 傳遞給後端資料
	const sendDataToBackend = (fd, mode, otherData) => {
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
				showNotification(result.result.reason, false);
			}
		});

		// for (var pair of fd.entries()) {
		// 	console.log(pair);
		// }
	};

	// 設置頁數
	const handleChangePage = useCallback((event, newPage) => {
		setPage(newPage);
	}, []);

	// 設置每頁顯示並返回第一頁
	const handleChangeRowsPerPage = (event) => {
		setRowsPerPage(parseInt(event.target.value, 10));
		setPage(0);
	};

	// 當活動按鈕點擊時開啟 modal 並進行動作
	const handleActionClick = (event) => {
		event.stopPropagation();
		const dataMode = event.currentTarget.getAttribute("data-mode");
		const dataValue = event.currentTarget.getAttribute("data-value");
		setModalValue(dataMode);
		setDeliverInfo(dataValue ? apiData.content.find((item) => item.id === dataValue) : "");
	};

	// 關閉 Modal 清除資料
	const onClose = () => {
		setModalValue(false);
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
			<PageTitle title="專案管理" btnGroup={btnGroup} handleActionClick={handleActionClick} isLoading={!isLoading} />

			{/* Table */}
			<div className="overflow-y-auto sm:overflow-y-hidden h-full order-3 sm:order-1">
				<RWDTable
					data={apiData?.content}
					columnsPC={columnsPC}
					columnsMobile={columnsMobile}
					actions={actions}
					cardTitleKey={"name"}
					tableMinWidth={540}
					isLoading={isLoading}
					handleActionClick={handleActionClick}
				/>
			</div>

			{/* Pagination */}
			<Pagination
				totalElement={apiData ? apiData.totalElements : 0}
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

export default Project;
