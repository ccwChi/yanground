import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// MUI
import Button from "@mui/material/Button";
import KeyboardReturnIcon from "@mui/icons-material/KeyboardReturn";
import FileUploadIcon from "@mui/icons-material/FileUpload";

// FontAwesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faUserTie,
	faTape,
	faCompassDrafting,
	faWarehouse,
	faHelmetSafety,
	faClipboardCheck,
	faUserGear,
} from "@fortawesome/free-solid-svg-icons";

// Component
import PageTitle from "../../../components/Guideline/PageTitle";
import RWDTable from "../../../components/RWDTable/RWDTable";
import MultipleFAB from "../../../components/FloatingActionButton/MultipleFAB";

// Hooks
import { useNotification } from "../../../hooks/useNotification";
import useNavigateWithParams from "../../../hooks/useNavigateWithParams";

// Utils
import { getData } from "../../../utils/api";

// Customs
import FolderManagedIcon from "../../../assets/icons/projectManagementIcon.svg";
import { UploadModal } from "./DocumentsModal";

// 表單申請按鈕清單
const applicationBtns = [
	{
		id: "a",
		icon: faUserTie,
		color: "#e95959",
		text: "業務",
	},
	{
		id: "b",
		icon: faTape,
		color: "#6262a7",
		text: "測量",
	},
	{
		id: "c",
		icon: faCompassDrafting,
		color: "#547db7",
		text: "設計",
	},
	{
		id: "d",
		icon: faWarehouse,
		color: "#3a9fc0",
		text: "倉庫",
	},
	{
		id: "e",
		icon: faHelmetSafety,
		color: "#039E8E",
		text: "工程",
	},
	{
		id: "f",
		icon: faClipboardCheck,
		color: "#F7941D",
		text: "品檢",
	},
	// {
	// 	id: "g",
	// 	icon: faUserGear,
	// 	color: "#F03355",
	// 	text: "人事",
	// },
];

const Documents = () => {
	const navigate = useNavigate();
	const navigateWithParams = useNavigateWithParams();
	// 解析網址取得參數
	const location = useLocation();
	const queryParams = new URLSearchParams(location.search);
	// 通知 Hook
	const showNotification = useNotification();

	// API List Data
	const [apiData, setApiData] = useState([
		{
			value: "ZHUAN_AN_LI_AN",
			chinese: "專案立案",
			abbreviation: "P",
			projectArchiveSubItem: [
				{
					id: "2147483647",
					numericCode: "SP-01",
					name: "空拍圖",
					fileNum: 5,
					mediaNum: 24,
				},
				{
					id: "2147483648",
					numericCode: "SP-02",
					name: "現場照片",
					fileNum: 0,
					mediaNum: 7,
				},
				{
					id: "2147483649",
					numericCode: "SP-03",
					name: "現勘報告書",
					fileNum: 12,
					mediaNum: 0,
				},
			],
		},
		{
			value: "XXXX",
			chinese: "合約/承諾書",
			abbreviation: "C",
			projectArchiveSubItem: [
				{
					id: "2147483650",
					numericCode: "SC-01",
					name: "工程承攬合約",
					fileNum: 1139,
					mediaNum: 72,
				},
				{
					id: "2147483651",
					numericCode: "SC-02",
					name: "採購合約",
					fileNum: 543,
					mediaNum: 0,
				},
				{
					id: "2147483652",
					numericCode: "SC-03",
					name: "施工規範",
					fileNum: 7,
					mediaNum: 0,
				},
				{
					id: "2147483653",
					numericCode: "SC-04",
					name: "受託承諾書",
					fileNum: 0,
					mediaNum: 0,
				},
				{
					id: "2147483654",
					numericCode: "SC-05",
					name: "誠信廉潔暨遵法承諾晝",
					fileNum: 0,
					mediaNum: 0,
				},
				{
					id: "2147483655",
					numericCode: "SC-06",
					name: "承攬人工作安全承諾書",
					fileNum: 99,
					mediaNum: 1,
				},
				{
					id: "2147483656",
					numericCode: "SC-07",
					name: "職安衛承諾書",
					fileNum: 2,
					mediaNum: 4,
				},
			],
		},
		{
			value: "ZHUAN_AN_LI_AN",
			chinese: "報價單",
			abbreviation: "P",
			projectArchiveSubItem: [
				{
					id: "2147483688",
					numericCode: "SQ-01",
					name: "承攬工程報價單",
					fileNum: 12,
					mediaNum: 2,
				},
				{
					id: "2147483689",
					numericCode: "SQ-02",
					name: "採購工程報價單",
					fileNum: 4,
					mediaNum: 7,
				},
				{
					id: "2147483690",
					numericCode: "SQ-03",
					name: "成本分析表",
					fileNum: 3,
					mediaNum: 0,
				},
			],
		},
	]);
	// ModalValue 控制開啟的是哪一個 Modal
	const [modalValue, setModalValue] = useState(false);
	// 傳送額外資訊給 Modal
	const [deliverInfo, setDeliverInfo] = useState(null);
	// 選擇當前顯示清單
	const [mode, setMode] = useState(applicationBtns[0]);
	// isLoading 等待請求 api
	const [isLoading, setIsLoading] = useState(false); // 預設為 true 暫時先改為 false
	// 專案管理 - 專案名稱
	const [projectName, setProjectName] = useState("(讀取中，請稍後...)");

	// 上方區塊功能按鈕清單
	const btnGroup = [
		{
			mode: "goback",
			icon: <KeyboardReturnIcon fontSize="small" />,
			text: "返回專案管理",
			variant: "contained",
			color: "secondary",
			fabVariant: "success",
			fab: <KeyboardReturnIcon fontSize="large" />,
		},
		{
			mode: "upload",
			icon: <FileUploadIcon fontSize="small" />,
			text: "上傳檔案",
			variant: "contained",
			color: "primary",
			fabVariant: "success",
			fab: <FileUploadIcon fontSize="large" />,
		},
	];

	// 對照 api table 所顯示 key
	const columnsPC = [
		{ key: "name", label: "專案子項目", align: "left", size: "40%" },
		{ key: "fileNum", label: "文檔數", size: "19%" },
		{ key: "mediaNum", label: "圖檔數", size: "19%" },
	];
	const columnsMobile = [
		{ key: "name", label: "專案子項目" },
		{ key: "fileNum", label: "文檔數" },
		{ key: "mediaNum", label: "圖檔數" },
	];

	// Table 上的子項目操作按鈕
	const actions = [
		{ value: "upload", icon: <FileUploadIcon />, title: "上傳檔案" },
		{ value: "filesmanaged", icon: <img src={FolderManagedIcon} style={{ width: "18px" }} />, title: "檔案瀏覽與管理" },
	];

	useEffect(() => {
		// 取得專案名稱
		if (queryParams.has("pj")) {
			const projectId = queryParams.get("pj");
			getData(`project/${projectId}`).then((result) => {
				if (result.result) {
					const data = result.result;
					setProjectName(data.name);
				} else {
					setProjectName("獲取專管文檔管理資料名稱失敗");
					showNotification("獲取專管文檔管理資料失敗，即將返回上一頁", false);
					const timeoutId = setTimeout(() => {
						navigate("/project");
					}, 3000);

					// 在元建卸載時清除，以防止內存洩漏
					return () => clearTimeout(timeoutId);
				}
			});
		} else {
			showNotification("專案管理 ID 不存在，即將返回上一頁", false);
			const timeoutId = setTimeout(() => {
				navigate("/project");
			}, 3000);

			// 在元建卸載時清除，以防止內存洩漏
			return () => clearTimeout(timeoutId);
		}

		// 取得 mode 參數
		const modeParam = queryParams.get("mode");
		const mode = applicationBtns.find((obj) => obj.id === modeParam);

		if (modeParam) {
			setMode(mode);
		}
	}, []);

	// 傳遞給後端資料
	const sendDataToBackend = (fd, mode, otherData) => {
	};

	// 當活動按鈕點擊時開啟 modal 並進行動作
	const handleActionClick = (event) => {
		event.stopPropagation();
		const dataMode = event.currentTarget.getAttribute("data-mode");
		const dataValue = event.currentTarget.getAttribute("data-value");

		if (dataMode === "goback") {
			navigate("/project");
		} else {
			setModalValue(dataMode);
			// setDeliverInfo(dataValue ? apiData?.content.find((item) => item.id === dataValue) : null);
		}
	};

	// 選擇項目並修改路由
	const handleClick = (item) => {
		navigateWithParams(0, 0, { mode: item.id }, false);
	};

	// 關閉 Modal 清除資料
	const onClose = () => {
		setModalValue(false);
		setDeliverInfo(null);
	};

	// modal 開啟參數與顯示標題
	const modalConfig = [
		{
			modalValue: "upload",
			modalComponent: <UploadModal title="上傳檔案" sendDataToBackend={sendDataToBackend} onClose={onClose} />,
		},
	];
	const config = modalValue ? modalConfig.find((item) => item.modalValue === modalValue) : null;

	return (
		<>
			{/* PageTitle */}
			<PageTitle
				title="專管文檔管理"
				description="此頁面是用於管理專案內的文檔，提供分類檢視管理、上傳和刪除文檔與圖片等功能，以便有效地管理專案資料。"
				btnGroup={btnGroup}
				handleActionClick={handleActionClick}
				isLoading={!isLoading}
			/>
			{/* Project Name */}
			<p className="sm:px-6 px-3 mb-2 text-xs sm:text-sm">
				<span>專案：</span>
				<span className="font-bold">{projectName}</span>
			</p>

			{/* Main Content */}
			<div className="flex md:flex-row-reverse flex-col md:px-5 px-3 gap-3 overflow-auto flex-1 md:pb-0 pb-6">
				{/* 項目欄 - Start */}
				<div className="md:max-h-max md:w-min">
					<div className="flex md:flex-col justify-start max-h-full px-4 py-3 md:py-4 gap-4 md:gap-5 bg-white overflow-auto rounded-lg">
						{applicationBtns.map((item) => (
							<div key={item.id} className="inline-flex flex-col items-center gap-2">
								<Button
									id={item.id}
									variant="contained"
									className={`gap-5 !p-2 !w-10 md:!w-12 aspect-square !min-w-0 !rounded-2xl ${
										mode.id === item.id ? "active" : ""
									}`}
									onClick={() => {
										setMode(item);
										handleClick(item);
									}}
									color="dark"
									sx={{
										backgroundColor: item.color,
										"&.active": {
											boxShadow: `white 0px 0px 0px 3px, ${item.color} 0px 0px 0px 6px`,
										},
									}}>
									<FontAwesomeIcon icon={item.icon} className="text-xl md:text-2xl" />
								</Button>
								<span className="text-xs md:text-md">{item.text}</span>
							</div>
						))}
					</div>
				</div>
				{/* 項目欄 - End */}

				{/* 主區塊 - Start */}
				<div className="md:max-h-max flex-1 overflow-hidden">
					<div className="flex flex-col p-3 md:py-6 mb-0 max-h-full bg-white overflow-auto rounded-lg md:gap-6 gap-4">
						{/* 類別區塊 - Start */}
						{apiData.map((data) => (
							<div key={data.value}>
								<h3 className="text-lg text-primary-500 font-bold md:px-7 px-3 pb-2.5">
									{data.chinese} ({data.abbreviation})
								</h3>
								<div className="md:bg-inherit bg-[#E6E6E6] rounded py-2">
									<RWDTable
										data={data.projectArchiveSubItem}
										columnsPC={columnsPC}
										columnsMobile={columnsMobile}
										actions={actions}
										cardTitleKey={"name"}
										tableMinWidth={495}
										handleActionClick={handleActionClick}
										specStatus={true}
									/>
								</div>
							</div>
						))}
						{/* 類別區塊 - End */}
					</div>

					{/* {(() => {
						switch (mode.id) {
							case "a":
								return <>123</>;
							case "b":
								return <>1233</>;
							case "c":
								return <>12333</>;
							case "d":
								return <>123333</>;
							case "e":
								return <>1233333</>;
							default:
								return null;
						}
					})()} */}
				</div>
				{/* 主區塊 - End */}
			</div>

			{/* Floating Action Button */}
			<MultipleFAB btnGroup={btnGroup} handleActionClick={handleActionClick} />

			{/* Modal */}
			{config && config.modalComponent}
		</>
	);
};

export default Documents;
