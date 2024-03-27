import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useForm, FormProvider, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useDropzone } from "react-dropzone";

// FontAwesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faQuoteLeft } from "@fortawesome/free-solid-svg-icons";

// MUI
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import Backdrop from "@mui/material/Backdrop";
import Button from "@mui/material/Button";
import FormHelperText from "@mui/material/FormHelperText";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import ExtensionIcon from "@mui/icons-material/Extension";
import UndoIcon from "@mui/icons-material/Undo";

// Components
import ModalTemplete from "../../../components/Modal/ModalTemplete";
import InputTitle from "../../../components/Guideline/InputTitle";
import AlertDialog from "../../../components/Alert/AlertDialog";
import LazyImage from "../../../components/LazyImage/LazyImage";
import { LoadingTwo } from "../../../components/Loader/Loading";

// Utils
import { getData, deleteData, putData } from "../../../utils/api";

// Hooks
import { useNotification } from "../../../hooks/useNotification";
import useLocalStorageValue from "../../../hooks/useLocalStorageValue";

// Customs
import FileDownloadIcon from "../../../assets/icons/fileDownloadIcon.svg";
import DownloadArrowIcon from "../../../assets/icons/downloadArrowIcon.svg";
import TrashIcon from "../../../assets/icons/trashIcon.svg";
import emptyImg from "../../../assets/images/emptyCatSleep.png";

/***
 * UploadModal
 * @param {string} title - Modal 標題名稱
 * @param {Object} constructionKAList - 類型+子項目+工程文件類型清單
 * @param {Function} sendDataToBackend - 傳遞給後端的函式
 * @param {Function} onClose - 關閉函式
 * @returns
 ***/
const UploadModal = React.memo(({ title, constructionKAList, sendDataToBackend, onClose }) => {
	// 解析網址取得參數
	const location = useLocation();
	const queryParams = new URLSearchParams(location.search);
	// Alert 開關
	const [alertOpen, setAlertOpen] = useState(false);
	// Modal Data
	const [apiData, setApiData] = useState(null);
	// Drop and Drag Upload Zone's Files
	const [uploadedFiles, setUploadedFiles] = useState([]);

	// 使用 Yup 來定義表單驗證規則
	const schema = yup.object().shape({
		name: yup.object().required("不可為空值！"),
		remarks: yup.string().max(250, "備註最多只能輸入 250 個字符"),
	});

	// 初始預設 default 值
	const defaultValues = {
		name: apiData ? apiData.name : null,
		remarks: apiData ? apiData.remarks : "",
	};

	// 使用 useForm Hook 來管理表單狀態和驗證
	const methods = useForm({
		defaultValues,
		resolver: yupResolver(schema),
	});

	const {
		control,
		handleSubmit,
		reset,
		formState: { errors, isDirty },
	} = methods;

	// 提交表單資料到後端並執行相關操作
	const onSubmit = (data) => {
		const fd = new FormData();
		const projectId = queryParams.get("pj");

		fd.append("constructionKindArchive", data?.name?.value || "");
		fd.append("remarks", data?.remarks || "");
		fd.append("project", projectId);

		uploadedFiles.forEach((file) => {
			fd.append("files", file);
		});

		sendDataToBackend(fd, "create");
	};

	// 檢查表單是否汙染
	const onCheckDirty = () => {
		if (isDirty) {
			setAlertOpen(true);
		} else {
			onClose();
		}
	};

	// Alert 回傳值進行最終結果 --- true: 關閉 modal / all: 關閉 Alert
	const handleAlertClose = (agree) => {
		if (agree) {
			onClose();
		}
		setAlertOpen(false);
	};

	const onDrop = (acceptedFiles) => {
		setUploadedFiles((prevFiles) => [...prevFiles, ...acceptedFiles]);
	};

	const handleDeleteFile = (indexToDelete) => {
		setUploadedFiles((prevFiles) => prevFiles.filter((file, index) => index !== indexToDelete));
	};

	const { getRootProps, getInputProps } = useDropzone({ onDrop });

	return (
		<>
			{/* Modal */}
			<ModalTemplete title={title} show={true} maxWidth={"640px"} onClose={onCheckDirty}>
				<FormProvider {...methods}>
					<form onSubmit={handleSubmit(onSubmit)}>
						<div className="flex flex-col pt-2 sm:pt-4 gap-2">
							<div className="flex flex-col overflow-y-auto px-1 pb-1" style={{ maxHeight: "67vh" }}>
								{/* 專管子項目 */}
								<div className="inline-flex sm:flex-row flex-col sm:gap-2 gap-1">
									<div className="inline-flex flex-col w-full">
										<InputTitle classnames="whitespace-nowrap" title={"專管子項目"} />
										<Controller
											control={control}
											name="name"
											render={({ field }) => {
												const { onChange, value } = field;
												return (
													<Autocomplete
														options={constructionKAList}
														value={value}
														onChange={(event, selectedOptions) => {
															onChange(selectedOptions);
														}}
														isOptionEqualToValue={(option, value) => option.label === value.label}
														renderInput={(params) => (
															<TextField
																{...params}
																className="inputPadding bg-white"
																placeholder="請選擇專管子項目"
																sx={{ "& > div": { padding: "0 !important" } }}
																InputProps={{
																	...params.InputProps,
																	endAdornment: (
																		<>
																			{constructionKAList.length <= 0 ? (
																				<CircularProgress className="absolute right-[2.325rem]" size={20} />
																			) : null}
																			{params.InputProps.endAdornment}
																		</>
																	),
																}}
															/>
														)}
														ListboxProps={{ style: { maxHeight: "12rem" } }}
														loading={constructionKAList.length <= 0}
														loadingText={"載入中..."}
														fullWidth
													/>
												);
											}}
										/>
										<FormHelperText className="!text-red-600 break-words !text-right !mt-0 h-5">
											{errors["name"]?.message}
										</FormHelperText>
									</div>
								</div>
								{/* 檔案上傳區 */}
								<div className="inline-flex flex-col sm:gap-4 gap-3 mt-2">
									<div
										{...getRootProps()}
										className="px-3 sm:py-10 py-6 cursor-pointer text-center border-2 border-neutral-400 border-dashed">
										<input {...getInputProps()} />
										<p className="text-sm">
											<span className="hidden sm:inline-block">將檔案拖曳到此處，或</span>點擊選擇檔案上傳
										</p>
									</div>
									<div className="pb-2 sm:pb-4">
										<InputTitle classnames="whitespace-nowrap" title={"已上傳的文件"} required={false}>
											{uploadedFiles.length > 0 && ` (${uploadedFiles.length})`}
										</InputTitle>
										<ul className="sm:h-24 h-20 text-sm overflow-y-auto bg-[#E6E6E6] px-5 sm:py-3 py-2">
											{uploadedFiles.length <= 0 && (
												<div className="flex flex-1 h-full items-center justify-center">
													<span className="italic text-neutral-500 text-sm">(尚無文件資訊)</span>
												</div>
											)}
											{uploadedFiles.map((file, index) => (
												<li key={index} className="truncate" style={{ listStyle: "inside" }}>
													<DeleteIcon
														type="button"
														className="cursor-pointer text-zinc-600"
														onClick={() => handleDeleteFile(index)}
													/>
													{file.path} - {file.size} bytes
												</li>
											))}
										</ul>
									</div>
								</div>
								{/* 備註 */}
								<div className="inline-flex sm:flex-row flex-col sm:gap-2 gap-1">
									<div className="inline-flex flex-col w-full">
										<InputTitle classnames="whitespace-nowrap" title={"備註"} required={false} />
										<Controller
											name="remarks"
											control={control}
											render={({ field }) => (
												<TextField
													multiline
													rows={2}
													className="inputPadding"
													placeholder="請輸入備註"
													fullWidth
													{...field}
												/>
											)}
										/>
										<FormHelperText className="!text-red-600 break-words !text-right !mt-0 h-5">
											{errors["remarks"]?.message}
										</FormHelperText>
									</div>
								</div>
							</div>
							<Button type="submit" variant="contained" color="success" className="!text-base !h-12" fullWidth>
								儲存
							</Button>
						</div>
					</form>
				</FormProvider>
			</ModalTemplete>

			{/* Alert */}
			<AlertDialog
				open={alertOpen}
				onClose={handleAlertClose}
				icon={<ReportProblemIcon color="secondary" />}
				title="注意"
				content="您所做的變更尚未儲存。是否確定要關閉表單？"
				disagreeText="取消"
				agreeText="確定"
			/>
		</>
	);
});

/***
 * Manage Files Modal
 * @param {string} title - Modal 標題名稱
 * @param {Object} deliverInfo - 顯示資訊
 * @param {Function} sendDataToBackend - 傳遞給後端的函式
 * @param {Function} onClose - 關閉函式
 * @returns
 ***/
const FilesManageModal = React.memo(({ title, deliverInfo, sendDataToBackend, onClose }) => {
	const showNotification = useNotification();
	// 取得 AccessToken
	const accessToken = useLocalStorageValue("accessToken");
	// 取得顯示的文檔資料
	const [apiData, setApiData] = useState([]);
	// 設置刪除的 id 旗標
	const [deleteId, setDeleteId] = useState(0);
	// 檢查是否確定要刪除
	const [alertOpen, setAlertOpen] = useState(false);
	// 設定圖片網域 URL
	const [imageUrl, setImageUrl] = useState("");

	useEffect(() => {
		const currentDomain = window.location.origin;

		let apiUrl;
		if (currentDomain === "https://erp.yuanrong-tech.com.tw") {
			apiUrl = "https://api.yuanrong-tech.com.tw";
		} else if (currentDomain === "http://localhost:3000" || currentDomain === "https://erp.yuanrong.goog1e.app") {
			apiUrl = "https://api.yuanrong.goog1e.app";
		} else {
			apiUrl = "";
		}

		setImageUrl(apiUrl);
	}, []);

	useEffect(() => {
		if (deliverInfo) {
			const data = deliverInfo?.matchingdata?.projectArchives || [];
			setApiData(data);
		}
	}, [deliverInfo]);

	// 投射更大範圍差異性
	const convertIDToRange = (id) => {
		// 取得尾數兩位數和尾數一位
		const lastTwoDigits = parseInt(id.toString().slice(-2));
		const lastDigit = parseInt(id.toString().slice(-1));

		// 將尾數兩位數和尾數一位相乘
		const result = lastTwoDigits * lastDigit;

		// 將結果轉換為 359 區間內的數字
		const convertedNumber = result % 359;

		return convertedNumber;
	};

	// 將檔案大小（以位元組為單位）轉換格式（KB、MB、GB 等）
	const formatFileSize = (bytes) => {
		if (bytes === 0) return "0 Bytes";

		const k = 1024;
		const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
		const i = Math.floor(Math.log(bytes) / Math.log(k));

		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
	};

	// Alert 回傳值進行最終結果 --- true: 關閉 modal / all: 關閉 Alert
	const handleAlertClose = (agree) => {
		if (agree) {
			deleteData(`projectArchive/${deleteId}`).then((result) => {
				let message = "刪除文檔成功！";

				if (result.status) {
					showNotification(message, true);
				} else {
					showNotification(result?.result.reason || "出現錯誤。", false);
				}
				setDeleteId(0);
				sendDataToBackend("", "delete");
			});
		}
		setAlertOpen(false);
	};

	const handleRecoverFile = (indexToRecover) => {
		putData(`projectArchive/${indexToRecover}`).then((result) => {
			let message = "恢復文檔成功！";

			if (result.status) {
				showNotification(message, true);
			} else {
				showNotification(result?.result.reason || "出現錯誤。", false);
			}
			sendDataToBackend("", "recover");
		});
	};

	return (
		<>
			{/* Modal */}
			<ModalTemplete title={title} show={true} maxWidth={"680px"} onClose={onClose}>
				<div className="relative flex flex-col gap-2.5 mb-3">
					{/* 子項目名稱 */}
					<h3 className="w-full pt-4">
						子項目：<span className="font-bold">{deliverInfo.name}</span>
					</h3>

					{/* 分隔線 */}
					<Divider />

					{/* 主體文件牆 */}
					<div className="flex flex-col h-[400px] gap-4 pe-1 overflow-y-auto">
						{/* 文件 - Start */}
						{apiData ? (
							apiData.length > 0 ? (
								apiData.map((data) => (
									<div className="flex flex-col gap-2" key={data.id}>
										<h4 className="inline-flex items-end">
											<FontAwesomeIcon icon={faQuoteLeft} className="me-2" style={{ fontSize: "1.5rem" }} />
											<span className="font-bold">{data.displayScreenName}</span>
											<span className="text-xs text-primary-800">‧{data.uploadedAt}</span>
										</h4>
										<div className="ps-4">
											<div
												className={`flex sm:flex-row flex-col bg-slate-200 rounded-lg px-4 py-3 gap-2.5 justify-between ${
													data.removed === false ? "contrast-75 grayscale" : ""
												}`}>
												{data.mimeType && data.mimeType.template?.includes("image") ? (
													// 圖片版本
													<div className="flex flex-col sm:flex-row gap-3 flex-1 overflow-hidden relative">
														<LazyImage
															src={`${imageUrl}/projectArchive/${data.id}/${data.mimeType?.value || ""}`}
															// ?token=${accessToken} 等待後端補邏輯
															alt={data.originalFilename}
															classnames="lg:w-64 lg:min-w-64 lg:h-44 sm:w-52 sm:min-w-52 sm:h-36 w-full h-44 object-cover rounded-lg"
														/>
														<div className="inline-flex flex-col justify-end gap-1">
															<span className="text-sm break-all text-black">{data.originalFilename}</span>
															<span className="text-xs text-neutral-500">{formatFileSize(data.size)}</span>
															{data.remarks && (
																<span className="text-sm break-all text-zinc-600 mt-2">註記： {data.remarks}</span>
															)}
														</div>
													</div>
												) : (
													// 其它文檔
													<div className="flex gap-3 flex-1 overflow-hidden">
														<div
															className="hidden sm:inline-flex items-center justify-center min-w-10 w-10 h-10 bg-[#8AA37D] rounded-full"
															style={{ filter: `hue-rotate(${convertIDToRange(data.id)}deg)` }}>
															<img
																src={FileDownloadIcon}
																className="translate-x-[2px] translate-y-[1.5px]"
																style={{ width: "24px" }}
																alt={"File Download Icon"}
															/>
														</div>
														<div className="inline-flex flex-col gap-1 -translate-y-1px">
															<span className="text-sm break-all text-black">{data.originalFilename}</span>
															<span className="text-xs text-neutral-500">{formatFileSize(data.size)}</span>
															{data.remarks && (
																<span className="text-sm break-all text-zinc-600 mt-2">註記： {data.remarks}</span>
															)}
														</div>
													</div>
												)}
												<Divider className="sm:hidden" />
												<div className="inline-flex gap-2 sm:justify-start justify-end translate-y-[2px]">
													{data.removed === false ? (
														<Tooltip title={"恢復"}>
															<IconButton
																aria-label={"恢復"}
																size="small"
																color="secondary"
																onClick={() => {
																	handleRecoverFile(data.id);
																}}
																sx={{ width: "34px", height: "34px" }}>
																<UndoIcon sx={{ color: "white" }} />
															</IconButton>
														</Tooltip>
													) : (
														<>
															<Tooltip title={"下載"}>
																<IconButton
																	aria-label={"下載"}
																	size="small"
																	color="secondary"
																	onClick={() =>
																		window.open(
																			`${imageUrl}/projectArchive/${data.id}/${data.mimeType?.value || ""}`,
																			"_blank"
																		)
																	}
																	sx={{ width: "34px", height: "34px" }}>
																	<img src={DownloadArrowIcon} style={{ width: "20px" }} alt={"Download Arrow Icon"} />
																</IconButton>
															</Tooltip>
															<Tooltip title={"刪除"}>
																<IconButton
																	aria-label={"刪除"}
																	size="small"
																	color="secondary"
																	onClick={() => {
																		setAlertOpen(true);
																		setDeleteId(data.id);
																	}}
																	sx={{ width: "34px", height: "34px" }}>
																	<img src={TrashIcon} style={{ width: "20px" }} alt={"Trash Icon"} />
																</IconButton>
															</Tooltip>
														</>
													)}
												</div>
											</div>
										</div>
									</div>
								))
							) : (
								<div className="flex-1 flex flex-col items-center justify-center gap-2">
									<img src={emptyImg} alt="catimage" className="w-2/5 max-w-sm min-w-[10rem]" />
									<p className="font-bold">尚無已上傳文件 ...</p>
								</div>
							)
						) : (
							<div className="flex-1 flex flex-col items-center justify-center gap-2">
								<img src={emptyImg} alt="catimage" className="w-2/5 max-w-sm min-w-[10rem]" />
								<p className="font-bold">資料取得錯誤</p>
							</div>
						)}

						{/* 文件 - End */}
					</div>

					{/* 文檔數顯示 */}
					{apiData && (
						<div className="absolute -bottom-7 right-1 text-xs text-neutral-500">共 {apiData.length} 個檔案</div>
					)}
				</div>
			</ModalTemplete>

			{/* Alert */}
			<AlertDialog
				open={alertOpen}
				onClose={handleAlertClose}
				icon={<ReportProblemIcon color="secondary" />}
				title="注意"
				content="是否確認將此檔案進行刪除處理？"
				disagreeText="取消"
				agreeText="確定"
			/>
		</>
	);
});

export { UploadModal, FilesManageModal };
