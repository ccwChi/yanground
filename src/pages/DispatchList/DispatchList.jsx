import React, { useCallback, useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PageTitle from "../../components/Guideline/PageTitle";
import FloatingActionButton from "../../components/FloatingActionButton/FloatingActionButton";
import RWDTable from "../../components/RWDTable/RWDTable";
import Pagination from "../../components/Pagination/Pagination";
import { LoadingFour } from "../../components/Loader/Loading";
import Backdrop from "@mui/material/Backdrop";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import PrintIcon from "@mui/icons-material/Print";
import { getData, postData } from "../../utils/api";
import { useNotification } from "../../hooks/useNotification";
import { UpdatedModal, AddDispatcherModal } from "./DispatchListModal";

/** 到時候可以移除套件 **/
import Docxtemplater from "docxtemplater";
import PizZip from "pizzip";
import PizZipUtils from "pizzip/utils/index.js";
import { saveAs } from "file-saver";

const loadFile = (url, callback) => {
	PizZipUtils.getBinaryContent(url, callback);
};

const DispatchList = () => {
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
	const furl = "dispatchment";
	const apiUrl = `${furl}?p=${page + 1}&s=${rowsPerPage}`;
	// ModalValue 控制開啟的是哪一個 Modal
	const [modalValue, setModalValue] = useState(false);
	// 傳送額外資訊給 Modal
	const [deliverInfo, setDeliverInfo] = useState(null);
	// 部門清單
	const [departmentList, setDepartmentList] = useState(null);
	// 傳遞稍後用 Flag
	const [sendBackFlag, setSendBackFlag] = useState(false);

	// 上方區塊功能按鈕清單
	const btnGroup = [
		{
			mode: "create",
			icon: <AddCircleIcon fontSize="small" />,
			text: "新增派工清單",
			variant: "contained",
			color: "primary",
			fabVariant: "success",
			fab: <AddIcon fontSize="large" />,
		},
	];

	// 對照 api table 所顯示 key
	const columnsPC = [
		{
			key: ["project", "name"],
			label: "專案名稱",
		},
		{
			key: ["applicant", "nickname"],
			label: "申請人",
			size: "15%",
		},
		{ key: "dispatchedOn", label: "申請日期", size: "20%" },
	];
	const columnsMobile = [
		{
			key: ["project", "name"],
			label: "專案名稱",
		},
		{
			key: ["applicant", "nickname"],
			label: "申請人",
		},
		{ key: "dispatchedOn", label: "申請日期" },
	];

	const actions = [
		{ value: "awl", icon: <GroupAddIcon />, title: "新增派工人員" },
		{ value: "edit", icon: <EditIcon />, title: "編輯派工清單" },
		{ value: "print", icon: <PrintIcon />, title: "列印派工清單" },
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
				const data = result.result;
				setApiData(data);
				if (page >= data.totalPages) {
					setPage(0);
					setRowsPerPage(10);
					navigate(`?p=1&s=10`);
				}
			});
		},
		[page]
	);

	// 取得部門資料
	useEffect(() => {
		getData("department").then((result) => {
			const data = result.result.content;
			setDepartmentList(data);
		});
	}, []);

	// 傳遞給後端資料
	const sendDataToBackend = (fd, mode, otherData) => {
		setSendBackFlag(true);
		let url = furl;
		let message = [];
		switch (mode) {
			case "create":
				message = ["派工清單新增成功！"];
				break;
			case "edit":
				url += "/" + otherData;
				message = ["派工清單編輯成功！"];
				break;
			case "awl":
				url += "/" + otherData + "/staff";
				message = ["派工人員新增成功！"];
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
					result.result.reason
					  ? result.result.reason
					  : (result.result
					  ? result.result
					  : "權限不足"),
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
	const handleChangePage = useCallback(
		(event, newPage) => {
			setPage(newPage);
			navigate(`?p=${newPage + 1}&s=${rowsPerPage}`);
		},
		[rowsPerPage]
	);

	// 設置每頁顯示並返回第一頁
	const handleChangeRowsPerPage = (event) => {
		const targetValue = parseInt(event.target.value, 10);
		setRowsPerPage(targetValue);
		setPage(0);
		navigate(`?p=1&s=${targetValue}`);
	};

	// 資料進入模板
	const generateDocument = (data) => {
		// 讀取 Word 模板文件
		loadFile("/dispatchListTemplete.docx", function (error, content) {
			if (error) {
				throw error;
			}

			// 創建 PizZip 對象並將 Word 模板加載到其中
			var zip = new PizZip(content);

			// 創建 docxtemplater 實例
			var doc = new Docxtemplater(zip, {
				paragraphLoop: true,
				linebreaks: true,
			});

			// 將 departmentsAndNames 轉換為一個對象，其中鍵是 "departmentX" 和 "nameX"，X 是索引
			// (16 為 Table 下欄位的數量)
			const d = [...Array(16)].reduce((result, _, index) => {
				const staff = data.staffs[index];
				result[`department${index + 1}`] = staff ? staff.department.name : "";
				result[`name${index + 1}`] = staff ? staff.nickname : "";
				return result;
			}, {});

			// 定義要插入的資料 & 插入資料到模板
			doc.setData({
				department: data.department ? data.department.name : "",
				applicant: data.applicant ? data.applicant.nickname : "",
				dispatchedOn: data.dispatchedOn ? data.dispatchedOn : "",
				projectName: data.project ? data.project.name : "",
				administrativeDivision: data.project
					? data.project.administrativeDivision.administeredBy.name + data.project.administrativeDivision.name
					: "",
				content: data.content ? data.content : "",
				...d,
			});

			try {
				// 嘗試渲染 docxtemplater 文檔
				doc.render();
			} catch (error) {
				// 如果渲染過程中出現錯誤，捕獲錯誤並處理它

				// 將錯誤對象轉換為 JSON
				const replaceErrors = (key, value) => {
					if (value instanceof Error) {
						return Object.getOwnPropertyNames(value).reduce(function (error, key) {
							error[key] = value[key];
							return error;
						}, {});
					}
					return value;
				};

				// 將錯誤信息轉換為 JSON 字符串並打印到控制台
				console.log(JSON.stringify({ error: error }, replaceErrors));

				// 如果錯誤具有 properties 屬性並包含一個 errors 數組，則提取並打印錯誤消息
				if (error.properties && error.properties.errors instanceof Array) {
					const errorMessages = error.properties.errors
						.map(function (error) {
							return error.properties.explanation;
						})
						.join("\n");
					console.log("errorMessages", errorMessages);
				}

				// 抛出錯誤以進一步處理或報告給用戶
				throw error;
			}

			// 將合併後的 Word 文檔轉換為 ArrayBuffer
			var out = doc.getZip().generate({
				type: "blob",
				mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
			});

			// 保存或下載生成的 Word 文檔
			saveAs(out, `臨時派工單${data.project ? " - " + data.project.name : ""}.docx`);
		});
	};

	// 當活動按鈕點擊時開啟 modal 並進行動作
	const handleActionClick = (event) => {
		event.stopPropagation();
		const dataMode = event.currentTarget.getAttribute("data-mode");
		const dataValue = event.currentTarget.getAttribute("data-value");
		setModalValue(dataMode);

		if (dataValue) {
			if (dataMode !== "print") {
				setDeliverInfo(dataValue);
			} else {
				const mainData = apiData.content.find((item) => item.id === dataValue);
				generateDocument(mainData);
			}
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
			modalComponent: <UpdatedModal title="新增派工清單" sendDataToBackend={sendDataToBackend} onClose={onClose} />,
		},
		{
			modalValue: "edit",
			modalComponent: (
				<UpdatedModal
					title="編輯派工清單"
					deliverInfo={deliverInfo}
					sendDataToBackend={sendDataToBackend}
					onClose={onClose}
				/>
			),
		},
		{
			modalValue: "awl",
			modalComponent: (
				<AddDispatcherModal
					title="新增派工人員"
					deliverInfo={deliverInfo}
					departmentList={departmentList}
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
			<PageTitle title="派工清單" btnGroup={btnGroup} handleActionClick={handleActionClick} isLoading={!isLoading} />

			{/* Table */}
			<div className="overflow-y-auto sm:overflow-y-hidden h-full order-3 sm:order-1">
				<RWDTable
					data={apiData?.content}
					columnsPC={columnsPC}
					columnsMobile={columnsMobile}
					actions={actions}
					cardTitleKey={["project", "name"]}
					tableMinWidth={540}
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
		</>
	);
};

export default DispatchList;
