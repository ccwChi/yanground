import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageTitle from "../../../components/Guideline/PageTitle";
import RWDTable from "../../../components/RWDTable/RWDTable";
import Pagination from "../../../components/Pagination/Pagination";
import FloatingActionButton from "../../../components/FloatingActionButton/FloatingActionButton";
import { LoadingFour } from "../../../components/Loader/Loading";
import Backdrop from "@mui/material/Backdrop";
import AddIcon from "@mui/icons-material/Add";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import EditIcon from "@mui/icons-material/Edit";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { getData, postData } from "../../../utils/api";
import { UpdatedModal } from "./ConstructionTypeModal";
import { useNotification } from "../../../hooks/useNotification";

const ConstructionType = () => {
	const params = useParams();
	const types = params.type.split("+");
	const navigate = useNavigate();
	const showNotification = useNotification();

	// ApiUrl 1
	const apiUrl = `constructionType/${types[1]}`;
	// API List Data
	const [apiData, setApiData] = useState(null);
	// isLoading 等待請求 API
	const [isLoading, setIsLoading] = useState(true);
	// Page 頁數設置
	const [page, setPage] = useState(0);
	// rows per Page 多少筆等同於一頁
	const [rowsPerPage, setRowsPerPage] = useState(10);
	// ModalValue 控制開啟的是哪一個 Modal
	const [modalValue, setModalValue] = useState(false);
	// 傳送額外資訊給 Modal
	const [deliverInfo, setDeliverInfo] = useState(null);
	// ApiUrl 2
	const apiUrl_ = `${apiUrl}/job?p=${page + 1}&s=${rowsPerPage}`;
	// 傳遞稍後用 Flag
	const [sendBackFlag, setSendBackFlag] = useState(false);

	// 上方區塊功能按鈕清單
	const btnGroup = [
		{
			mode: "create",
			icon: <AddCircleIcon fontSize="small" />,
			text: "新增工程項目",
			variant: "contained",
			color: "primary",
			fabVariant: "success",
			fab: <AddIcon fontSize="large" />,
		},
	];

	// 對照 api table 所顯示 key
	const columnsPC = [
		{ key: "name", label: "名稱" },
	];
	const columnsMobile = [
		{ key: "id", label: "ID" },
		{ key: "name", label: "名稱" },
	];

	const actions = [
		{ value: "edit", icon: <EditIcon />, title: "編輯工程項目" },
		{ value: "goto", icon: <ArrowForwardIcon />, title: "前往工項執行" },
	];

	// 取得對照參數，檢查路由是否存在
	useEffect(() => {
		checkRouteExists(apiUrl);
	}, []);
	const checkRouteExists = (url) => {
		setIsLoading(true);
		getData(url).then((result) => {
			if (result.response !== 200) {
				navigate("/404");
			}
		});
	};

	// 取得列表資料
	useEffect(() => {
		getApiList(apiUrl_);
	}, [apiUrl_]);
	const getApiList = useCallback((url) => {
		setIsLoading(true);
		getData(url).then((result) => {
			setIsLoading(false);
			const data = result.result;
			setApiData(data);
		});
	}, []);

	// 傳遞給後端資料
	const sendDataToBackend = (fd, mode, otherData) => {
		setSendBackFlag(true);
		let url = "constructionJob";
		let message = [];
		fd.append("constructionType", types[1]);
		switch (mode) {
			case "create":
				message = ["工程項目新增成功！"];
				break;
			case "edit":
				url += "/" + otherData;
				message = ["工程項目編輯成功！"];
				break;
			default:
				break;
		}

		postData(url, fd).then((result) => {
			if (result.status) {
				showNotification(message[0], true);
				getApiList(apiUrl_);
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

		if (dataValue) {
			if (dataMode === "goto") {
				const data = apiData.find((item) => {
					return item.id === dataValue;
				});

				navigate(`${data.name}+${data.id}`);
			}
			setDeliverInfo(dataValue);
		}
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
			modalComponent: <UpdatedModal title="新增工程項目" sendDataToBackend={sendDataToBackend} onClose={onClose} />,
		},
		{
			modalValue: "edit",
			modalComponent: (
				<UpdatedModal
					title="編輯工程項目"
					deliverInfo={deliverInfo}
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
				title={"工程項目 - " + types[0]}
				btnGroup={btnGroup}
				handleActionClick={handleActionClick}
				isLoading={!isLoading}
			/>

			{/* Table */}
			<div className="overflow-y-auto h-full order-3 sm:order-1">
				<RWDTable
					data={apiData}
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
			{/* <Pagination
				totalElement={apiData ? apiData.length : 0}
				page={page}
				onPageChange={handleChangePage}
				rowsPerPage={rowsPerPage}
				onRowsPerPageChange={handleChangeRowsPerPage}
			/> */}

			{/* Floating Action Button */}
			<FloatingActionButton btnGroup={btnGroup} handleActionClick={handleActionClick} />

			{/* Modal */}
			{config && config.modalComponent}

			{/* Backdrop */}
			<Backdrop sx={{ color: "#fff", zIndex: 1400 }} open={sendBackFlag}>
				<LoadingFour />
			</Backdrop>
		</>
	);
};

export default ConstructionType;
