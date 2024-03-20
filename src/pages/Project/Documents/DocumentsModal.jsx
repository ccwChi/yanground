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

// Components
import ModalTemplete from "../../../components/Modal/ModalTemplete";
import InputTitle from "../../../components/Guideline/InputTitle";
import AlertDialog from "../../../components/Alert/AlertDialog";
import { LoadingTwo } from "../../../components/Loader/Loading";

// Utils
import { getData } from "../../../utils/api";

// Customs
import FileDownloadIcon from "../../../assets/icons/fileDownloadIcon.svg";
import DownloadArrowIcon from "../../../assets/icons/downloadArrowIcon.svg";
import TrashIcon from "../../../assets/icons/trashIcon.svg";

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

			{/* Backdrop */}
			<Backdrop sx={{ color: "#fff", zIndex: 1050 }} open={false} onClick={onCheckDirty}>
				<LoadingTwo />
			</Backdrop>
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
	const [apiData, setApiData] = useState([
		{
			id: "2147483618",
			uploadedAt: "2024-02-01 13:50:44",
			constructionKindArchive: "Example.docx",
			uploader: "李二牛",
			imgurl: null,
			docSize: "3.8 KB",
		},
		{
			id: "2147483629",
			uploadedAt: "2024-01-27 08:12:04",
			constructionKindArchive: "ExampleExampleExampleExampleExampleExampleExample.pdf",
			uploader: "王大明",
			imgurl: null,
			docSize: "374 B",
		},
		{
			id: "2147483640",
			uploadedAt: "2024-01-25 11:01:27",
			constructionKindArchive: "Example.jpeg",
			uploader: "陳三金",
			imgurl:
				"https://images.unsplash.com/photo-1709418354364-8f3e9ad5c32c?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
			docSize: "12.17 MB",
		},
		{
			id: "2147483651",
			uploadedAt: "2024-01-16 16:59:32",
			constructionKindArchive: "Example.xml",
			uploader: "王大明",
			imgurl: null,
			docSize: "24 B",
		},
		{
			id: "2147483640",
			uploadedAt: "2024-01-02 07:44:58",
			constructionKindArchive: "Example.png",
			uploader: "李二牛",
			imgurl:
				"https://images.unsplash.com/photo-1709223328664-f3c5f94a8e70?q=80&w=2038&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
			docSize: "3.91 MB",
		},
	]);

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

	return (
		<>
			{/* Modal */}
			<ModalTemplete title={title} show={true} maxWidth={"640px"} onClose={onClose}>
				<div className="flex flex-col gap-2.5">
					{/* 子項目名稱 */}
					<h3 className="w-full pt-4">
						子項目：<span className="font-bold">現勘報告書</span>
					</h3>

					{/* 分隔線 */}
					<Divider />

					{/* 主體文件牆 */}
					<div className="flex flex-col h-[400px] gap-4 pe-1 overflow-y-auto">
						{/* 文件 - Start */}
						{apiData ? (
							apiData.map((data) => (
								<div className="flex flex-col gap-2">
									<h4 className="inline-flex items-end">
										<FontAwesomeIcon icon={faQuoteLeft} className="me-2" style={{ fontSize: "1.5rem" }} />
										<span className="font-bold">{data.uploader}</span>
										<span className="text-xs text-primary-800">‧{data.uploadedAt}</span>
									</h4>
									<div className="ps-4">
										<div className="flex sm:flex-row flex-col bg-slate-200 rounded-lg px-4 py-3 gap-2.5 justify-between">
											{data.imgurl ? (
												<div className="flex gap-3 flex-1 overflow-hidden">
													<img
														src={data.imgurl}
														alt={data.constructionKindArchive}
														className="w-64 h-44 object-cover rounded-lg"
													/>
													<div className="inline-flex flex-col justify-end gap-1">
														<span className="text-sm break-all text-black">{data.constructionKindArchive}</span>
														<span className="text-xs text-neutral-500">{data.docSize}</span>
													</div>
												</div>
											) : (
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
														<span className="text-sm break-all text-black">{data.constructionKindArchive}</span>
														<span className="text-xs text-neutral-500">{data.docSize}</span>
													</div>
												</div>
											)}
											<Divider className="sm:hidden" />
											<div className="inline-flex gap-2 sm:justify-start justify-end translate-y-[2px]">
												<Tooltip title={"下載"}>
													<IconButton
														aria-label={"下載"}
														size="small"
														color="secondary"
														sx={{ width: "34px", height: "34px" }}>
														<img src={DownloadArrowIcon} style={{ width: "20px" }} alt={"Download Arrow Icon"} />
													</IconButton>
												</Tooltip>
												<Tooltip title={"刪除"}>
													<IconButton
														aria-label={"刪除"}
														size="small"
														color="secondary"
														sx={{ width: "34px", height: "34px" }}>
														<img src={TrashIcon} style={{ width: "20px" }} alt={"Trash Icon"} />
													</IconButton>
												</Tooltip>
											</div>
										</div>
									</div>
								</div>
							))
						) : (
							<>Nope</>
						)}

						{/* 文件 - End */}
					</div>
				</div>
			</ModalTemplete>
		</>
	);
});

export { UploadModal, FilesManageModal };
