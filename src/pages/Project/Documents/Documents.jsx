import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { format } from "date-fns";

// MUI
import Button from "@mui/material/Button";
import Skeleton from "@mui/material/Skeleton";
import Backdrop from "@mui/material/Backdrop";
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
	faSpinner,
} from "@fortawesome/free-solid-svg-icons";

// Component
import PageTitle from "../../../components/Guideline/PageTitle";
import RWDTable from "../../../components/RWDTable/RWDTable";
import MultipleFAB from "../../../components/FloatingActionButton/MultipleFAB";
import TableTabbar from "../../../components/Tabbar/TableTabbar";
import { LoadingFour } from "../../../components/Loader/Loading";

// Hooks
import { useNotification } from "../../../hooks/useNotification";
import useNavigateWithParams from "../../../hooks/useNavigateWithParams";

// Utils
import { getData, postBPData } from "../../../utils/api";

// Customs
import FolderManageIcon from "../../../assets/icons/projectManagementIcon.svg";
import { UploadModal, FilesManageModal } from "./DocumentsModal";

// 表單申請按鈕清單
const applicationBtns = [
	{
		icon: faUserTie,
		color: "#e95959",
		text: "業務",
	},
	{
		icon: faTape,
		color: "#6262a7",
		text: "測量",
	},
	{
		icon: faCompassDrafting,
		color: "#547db7",
		text: "設計",
	},
	{
		icon: faWarehouse,
		color: "#3a9fc0",
		text: "倉庫",
	},
	{
		icon: faHelmetSafety,
		color: "#039E8E",
		text: "工程/工務",
	},
	{
		icon: faClipboardCheck,
		color: "#F7941D",
		text: "品檢",
	},
	{
		icon: faUserGear,
		color: "#F03355",
		text: "人事",
	},
];

const isLoadingACBtn = [
	{
		value: "XXX",
		icon: faSpinner,
		color: "#8b8b8b",
		chinese: "‧‧‧",
	},
];

const Documents = () => {
	const navigate = useNavigate();
	// 解析網址取得參數
	const location = useLocation();
	const queryParams = new URLSearchParams(location.search);
	// 通知 Hook
	const showNotification = useNotification();

	// Full Data 資料統合
	const [fullData, setFullData] = useState([]);
	// API List Data
	const [apiData, setApiData] = useState([]);
	// 專管項目清單
	const [projectArchiveItem, setprojectArchiveItem] = useState(isLoadingACBtn);
	// 類型+子項目+工程文件類型清單
	const [constructionKAList, setconstructionKAList] = useState(null);
	// ModalValue 控制開啟的是哪一個 Modal
	const [modalValue, setModalValue] = useState(false);
	// 傳送額外資訊給 Modal
	const [deliverInfo, setDeliverInfo] = useState(null);
	// 選擇當前顯示清單
	const [mode, setMode] = useState(null);
	// isLoading 等待請求 api
	// inside  : 框  架 API 使用
	// outside : 子項目 API 使用
	const [isLoadingInside, setIsLoadingInside] = useState(true);
	const [isLoadingOutside, setIsLoadingOutside] = useState(true);
	// 專案管理 - 專案名稱
	const [projectName, setProjectName] = useState("(讀取中，請稍後...)");
	// SearchDialog Switch
	// const [searchDialogOpen, setSearchDialogOpen] = useState(false);
	// cat = Category 設置 tab 分類
	const [cat, setCat] = useState("");
	// 傳遞稍後用 Flag
	const [sendBackFlag, setSendBackFlag] = useState(false);

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
		{ key: ["matchingdata", "count"], label: "檔案數", size: "38%" },
	];
	const columnsMobile = [
		{ key: "name", label: "專案子項目" },
		{ key: ["matchingdata", "count"], label: "檔案數" },
	];

	// Table 上的子項目操作按鈕
	const actions = [
		// { value: "upload", icon: <FileUploadIcon />, title: "上傳檔案" },
		{
			value: "filesmanage",
			icon: <img src={FolderManageIcon} style={{ width: "18px" }} alt={"Manage Folder Icon"} />,
			title: "檔案瀏覽與管理",
		},
	];

	useEffect(() => {
		setIsLoadingInside(true);

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

		getApiList();

		// 取得 mode 參數
		const modeParam = queryParams.get("mode");
		const mode = applicationBtns.find((obj) => obj.value === modeParam);

		if (modeParam) {
			setMode(mode);
		}
	}, []);

	useEffect(() => {
		if (fullData.length > 0) {
			const transformData = fullData.find((d) => d.value === cat.value);
			setApiData(transformData);
		}
	}, [cat, fullData]);

	const getApiList = () => {
		const projectId = queryParams.get("pj");
		let projectArchiveCategoryList = null;
		// 取得專管類別
		getData("projectArchiveCategory").then((result) => {
			if (result.result) {
				const data = result.result;
				projectArchiveCategoryList = data;

				// 取得專管項目
				getData("projectArchiveItem").then((result) => {
					setIsLoadingInside(false);
					if (result.result) {
						const data = result.result;
						const newData = data.map((item) => {
							const matchingdata = applicationBtns.find((btn) => btn.text === item.chinese);

							const newpjac = item.projectArchiveCategories.map((pjac) => {
								const matchingpjac = projectArchiveCategoryList.find((pj) => pj.value === pjac);
								return {
									acronym: matchingpjac.acronym,
									chinese: matchingpjac.chinese,
									value: matchingpjac.value,
								};
							});

							if (matchingdata) {
								return {
									...item,
									icon: matchingdata.icon,
									color: matchingdata.color,
									projectArchiveCategories: newpjac,
								};
							}

							return item;
						});
						setMode(newData[0] || "");
						setCat(newData[0]?.projectArchiveCategories[0] || "");
						setprojectArchiveItem(newData);
					} else {
						console.log("--- 獲取專管項目失敗");
						setprojectArchiveItem([]);
					}
				});

				// 取得工程文件類型 變成 類型+子項目+工程文件類型清單
				getData(`project/${projectId}/kind`).then((result) => {
					if (result.result) {
						const data = result.result;
						const newData = data.map((item) => {
							return {
								value: item.id,
								label:
									"〔" +
									item.projectArchiveSubItem.projectArchiveCategory.projectArchiveItem.chinese +
									"〕" +
									item.projectArchiveSubItem.projectArchiveCategory.chinese +
									" - " +
									item.projectArchiveSubItem.name,
								// + " (" +
								// item.constructionKind.chinese +
								// ")"
								projectArchiveSubIteFlag: item.projectArchiveSubItem.name,
							};
						});

						// 取得檔案資料
						let documentDataList = [];
						let promises = [];
						newData.map((item) => {
							let promise = getData(`project/${queryParams.get("pj")}/kind/${item.value}/archive`).then((result) => {
								if (result.result) {
									const data = result.result;
									const transformedData = {
										...data,
										...item,
									};
									documentDataList.push(transformedData);
								} else {
									console.log("Error: No result found");
								}
							});

							promises.push(promise);
						});

						Promise.all(promises).then(() => {
							// console.log(documentDataList); // 在這裡列印 documentDataList，確保所有非同步操作都已完成
							setIsLoadingOutside(false);

							// 根據子項目求取文檔數量
							const pjacl = projectArchiveCategoryList.map((item) => {
								return {
									...item,
									projectArchiveSubItems: item.projectArchiveSubItems.map((obj) => {
										let matchingdata = documentDataList.filter((d) => d.projectArchiveSubIteFlag === obj.name);
										if (matchingdata.length === 1) {
											matchingdata = matchingdata[0];
										} else if (matchingdata.length > 1) {
											// 使用 reduce 方法來加總物件
											const summedObject = matchingdata.reduce(
												(accumulator, currentValue) => {
													accumulator.count += currentValue.count; // 加總 count
													accumulator.label += "+" + currentValue.label; // 組合成字串
													accumulator.projectArchiveSubIteFlag = currentValue.projectArchiveSubIteFlag; // 照舊
													accumulator.projectArchives = accumulator.projectArchives.concat(
														currentValue.projectArchives
													); // 合併 projectArchives 陣列
													accumulator.value += "+" + currentValue.value; // 組合成字串
													return accumulator;
												},
												{ count: 0, label: "", projectArchives: [], value: "", projectArchiveSubIteFlag: "" } // 初始化累加器物件
											);
											// summedObject.projectArchives.sort(
											// 	(a, b) =>
											// 		new Date(b.uploadedAt.replace("+08", "").replace("T", " ")) -
											// 		new Date(a.uploadedAt.replace("+08", "").replace("T", " "))
											// );
											matchingdata = summedObject;
										}

										let displayScreenName = "";
										// 確認 projectArchives 是否存在且不為空
										if (matchingdata.projectArchives && matchingdata.projectArchives.length > 0) {
											matchingdata.projectArchives.forEach((archive) => {
												// 格式化日期為 "YYYY-MM-DD HH:mm:ss"
												archive.uploadedAt = format(
													new Date(archive.uploadedAt.replace("+08", "").replace("T", " ")),
													"yyyy-MM-dd HH:mm:ss"
												);

												// 顯示名稱守則
												const mdu = archive.uploader;
												if (mdu.lastname && mdu.firstname) {
													archive.displayScreenName = `${mdu.lastname}${mdu.firstname}`;
												} else if (mdu.lastname) {
													archive.displayScreenName = mdu.lastname;
												} else if (mdu.firstname) {
													archive.displayScreenName = mdu.firstname;
												} else if (mdu.nickname) {
													archive.displayScreenName = mdu.nickname;
												}
											});

											// 對 projectArchives 依照 uploadedAt 由近到遠排序
											matchingdata.projectArchives.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
										}

										return {
											...obj,
											matchingdata,
										};
									}),
								};
							});
							setFullData(pjacl);
						});

						setconstructionKAList(newData);
					} else {
						setconstructionKAList(null);
					}
				});
			} else {
				console.log("--- 獲取專管類別失敗");
				projectArchiveCategoryList = null;
			}
		});
	};

	// 傳遞給後端資料
	const sendDataToBackend = (fd, mode) => {
		setSendBackFlag(true);
		let url = "projectArchive";
		let message = [];
		switch (mode) {
			case "create":
				message = ["子項目文檔新增成功！"];
				break;
			default:
				break;
		}

		if (mode === "create") {
			postBPData(url, fd).then((result) => {
				if (result.status) {
					showNotification(message[0], true);
					resetScreen();
				} else {
					showNotification(
						result.result.reason ? result.result.reason : result.result ? result.result : "權限不足",
						false
					);
				}
				setSendBackFlag(false);
			});
		} else if (mode === "delete") {
			resetScreen();
			setSendBackFlag(false);
		}
	};

	// 當活動按鈕點擊時開啟 modal 並進行動作
	const handleActionClick = (event) => {
		event.stopPropagation();
		const dataMode = event.currentTarget.getAttribute("data-mode");
		const dataValue = event.currentTarget.getAttribute("data-value");

		if (dataMode === "goback") {
			// navigate("/project");
			window.history.back();
			// } else if (dataMode === "filter") {
			// 	handleOpenSearch();
		} else if (dataMode === "filesmanage") {
			setModalValue(dataMode);
			setDeliverInfo(dataValue ? apiData?.projectArchiveSubItems.find((item) => item.id === dataValue) : null);
		} else {
			setModalValue(dataMode);
		}
	};

	// 關閉 Modal 清除資料
	const onClose = () => {
		setModalValue(false);
		setDeliverInfo(null);
	};

	const resetScreen = () => {
		setIsLoadingOutside(true);
		getApiList();
		onClose();
	};

	// modal 開啟參數與顯示標題
	const modalConfig = [
		{
			modalValue: "upload",
			modalComponent: (
				<UploadModal
					title="上傳檔案"
					constructionKAList={constructionKAList || null}
					sendDataToBackend={sendDataToBackend}
					onClose={onClose}
				/>
			),
		},
		{
			modalValue: "filesmanage",
			modalComponent: (
				<FilesManageModal
					title="檔案瀏覽與管理"
					deliverInfo={deliverInfo}
					sendDataToBackend={sendDataToBackend}
					onClose={onClose}
				/>
			),
		},
	];
	const config = modalValue ? modalConfig.find((item) => item.modalValue === modalValue) : null;

	// // 開啟 SearchDialog
	// const handleOpenSearch = () => {
	// 	setSearchDialogOpen(true);
	// };
	// // 關閉 SearchDialog
	// const handleCloseSearch = () => {
	// 	setSearchDialogOpen(false);
	// };
	// // 恢復為上一次搜尋狀態
	// const handleCoverDialog = () => {};
	// // 重置 SearchDialog
	// const handleClearSearch = () => {
	// 	setSearchDialogOpen(false);
	// };
	// // 搜尋送出
	// const onSubmit = () => {
	// 	setSearchDialogOpen(false);
	// };

	return (
		<>
			{/* PageTitle */}
			<PageTitle
				title="專管文檔管理"
				description="此頁面是用於管理專案內的文檔，提供分類檢視管理、上傳和刪除文檔與圖片等功能，以便有效地管理專案資料。"
				btnGroup={btnGroup}
				handleActionClick={handleActionClick}
				isLoading={!isLoadingInside}
				// searchMode
				// // 下面參數前提都是 searchMode = true
				// searchDialogOpen={searchDialogOpen}
				// handleOpenDialog={handleOpenSearch}
				// handleCloseDialog={handleCloseSearch}
				// handleCoverDialog={handleCoverDialog}
				// handleConfirmDialog={onSubmit}
				// handleClearDialog={handleClearSearch}
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
						{projectArchiveItem.map((item) => (
							<div key={item.value} className="inline-flex flex-col items-center gap-2">
								<Button
									id={item.value}
									variant="contained"
									className={`gap-5 !p-2 !w-10 md:!w-14 aspect-square !min-w-0 !rounded-2xl ${
										!isLoadingInside && mode.value === item.value ? "active" : ""
									}`}
									onClick={() => {
										setMode(item);
										setCat(item?.projectArchiveCategories[0] || "");
									}}
									color="dark"
									sx={{
										backgroundColor: item.color,
										"&.active": {
											boxShadow: `white 0px 0px 0px 3px, ${item.color} 0px 0px 0px 6px`,
										},
									}}>
									<FontAwesomeIcon icon={item.icon} className="text-xl md:text-2xl" spin={isLoadingInside} />
								</Button>
								<span className="text-xs md:text-md">{item.chinese}</span>
							</div>
						))}
					</div>
				</div>
				{/* 項目欄 - End */}

				{/* 主區塊 - Start */}
				<div className="md:max-h-max flex-1 overflow-hidden">
					<TableTabbar
						tabGroup={mode?.projectArchiveCategories || null}
						cat={cat}
						setCat={setCat}
						isLoading={isLoadingInside}
						transparentBG={false}
						dontnavigate={true}
						sx={{
							"& .MuiTabs-scroller": {
								borderRadius: "0.5rem",
								background: "white",
								boxShadow: "0 5px 10px rgba(0, 0, 0, 0.1)",
							},
						}}
					/>

					<div
						className="flex flex-col p-3 md:py-6 pb-12 md:pb-3.5 mb-0 mt-px bg-white overflow-auto rounded-b-lg"
						style={{ maxHeight: "calc(100% - 50px)" }}>
						{/* 類別區塊 - Start */}
						{!isLoadingInside ? (
							<h3 className="text-lg text-primary-500 font-bold md:px-7 px-3 pb-2.5">
								{cat.chinese} ({cat.acronym})
							</h3>
						) : (
							<Skeleton width={160} height={38} className="!-translate-y-1 scale-75 md:mx-7 mx-3" />
						)}
						<div className="md:bg-inherit bg-[#E6E6E6] rounded py-2">
							<RWDTable
								data={apiData.projectArchiveSubItems}
								columnsPC={columnsPC}
								columnsMobile={columnsMobile}
								actions={actions}
								cardTitleKey={"name"}
								tableMinWidth={495}
								isLoading={isLoadingOutside}
								handleActionClick={handleActionClick}
								specStatus={true}
							/>
						</div>
						{/* 類別區塊 - End */}
					</div>
				</div>
				{/* 主區塊 - End */}
			</div>

			{/* Floating Action Button */}
			<MultipleFAB btnGroup={btnGroup} handleActionClick={handleActionClick} />

			{/* Backdrop */}
			<Backdrop sx={{ color: "#fff", zIndex: 1400 }} open={sendBackFlag}>
				<LoadingFour />
			</Backdrop>

			{/* Modal */}
			{config && config.modalComponent}
		</>
	);
};

export default Documents;
