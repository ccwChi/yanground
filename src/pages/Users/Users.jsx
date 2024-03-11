import React, { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useForm, Controller, FormProvider } from "react-hook-form";
import { format } from "date-fns"; // format(data, 'yyyy-MM-dd')
// MUI
import FormControlLabel from "@mui/material/FormControlLabel";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import Slider from "@mui/material/Slider";
import Checkbox from "@mui/material/Checkbox";
import Divider from "@mui/material/Divider";
import Backdrop from "@mui/material/Backdrop";
import SouthIcon from "@mui/icons-material/South";
import EditIcon from "@mui/icons-material/Edit";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import ViewTimelineIcon from "@mui/icons-material/ViewTimeline";
import PunchClockIcon from "@mui/icons-material/PunchClock";
import TuneIcon from "@mui/icons-material/Tune";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import DownloadIcon from "@mui/icons-material/Download";
// Component
import RWDTable from "../../components/RWDTable/RWDTable";
import PageTitle from "../../components/Guideline/PageTitle";
import Pagination from "../../components/Pagination/Pagination";
import InputTitle from "../../components/Guideline/InputTitle";
import MultipleFAB from "../../components/FloatingActionButton/MultipleFAB";
import ControlledDatePicker from "../../components/DatePicker/ControlledDatePicker";
import { LoadingFour } from "../../components/Loader/Loading";
// import FloatingActionButton from "../../components/FloatingActionButton/FloatingActionButton";
// Hooks
import { useNotification } from "../../hooks/useNotification";
import useNavigateWithParams from "../../hooks/useNavigateWithParams";
// Untils
import { getData, postData } from "../../utils/api";
// Customs
import { EditModal, ExportModal } from "./UsersModal";

// MenuItem 選單樣式調整
const ITEM_HEIGHT = 36;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
	PaperProps: {
		style: {
			maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
			Width: 250,
		},
	},
};

// 篩選 default 值
const defaultValue = {
	phrase: "",
	department: "",
	gender: "",
	age: null,
	authorities: [],
	startedFrom: null,
	startedTo: null,
};

const Users = () => {
	const navigate = useNavigate();
	const showNotification = useNotification();
	const navigateWithParams = useNavigateWithParams();

	const [sendBackFlag, setSendBackFlag] = useState(false);

	// 解析網址取得參數
	const location = useLocation();
	const queryParams = new URLSearchParams(location.search);

	// cat = Category 設置 tab 分類，之後分類用
	//const [cat, setCat] = useState(null);
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
	// 在主畫面先求得部門跟權限 list 再直接傳給面板
	const [departmentList, setDepartmentList] = useState(null);
	const [authorityList, setAuthorityList] = useState(null);
	const [factorySiteList, setFactorySiteList] = useState([]);
	const [workDayTypeList, setWorkDayTypeList] = useState([]);
	const [workHourTypeList, setWorkHourTypeList] = useState([]);
	const [jobTitleList, setJobTitleList] = useState([]);
	// ModalValue 控制開啟的是哪一個 Modal
	const [modalValue, setModalValue] = useState(false);
	// 傳送額外資訊給 Modal
	const [deliverInfo, setDeliverInfo] = useState(null);
	// SearchDialog Switch
	const [searchDialogOpen, setSearchDialogOpen] = useState(false);
	// 搜尋篩選清單
	const [filters, setFilters] = useState(defaultValue);
	// 控制顯示/隱藏 Slider 的狀態
	const [isAgeEnabled, setIsAgeEnabled] = useState(false);
	// ApiUrl
	const furl = "user";
	const [apiUrl, setApiUrl] = useState("");

	// 預設搜尋篩選內容
	const getValueOrFilter = (queryParam, filter) => {
		const value = queryParams.get(queryParam);
		if (queryParam === "authorities") {
			return !!value ? value.split(",").map(Number) : filter;
		} else {
			return !!value ? value : filter;
		}
	};
	const getAgeValue = () => {
		const ageFrom = queryParams.get("ageFrom");
		const ageTo = queryParams.get("ageTo");

		return ageFrom !== null && ageTo !== null ? [parseInt(ageFrom, 10), parseInt(ageTo, 10)] : filters.age;
	};
	const defaultValues = {
		phrase: getValueOrFilter("phrase", filters.phrase),
		department: getValueOrFilter("department", filters.department),
		gender: getValueOrFilter("gender", filters.gender),
		age: getAgeValue(),
		authorities: getValueOrFilter("authorities", filters.authorities),
		startedFrom: filters.startedFrom, // getValueOrFilter("startedFrom", filters.startedFrom),
		startedTo: filters.startedTo, // getValueOrFilter("startedTo", filters.startedTo),
	};

	// 使用 useForm Hook 來管理表單狀態和驗證
	const methods = useForm({
		defaultValues,
	});
	const {
		control,
		reset,
		watch,
		setValue,
		formState: { isDirty },
		handleSubmit,
	} = methods;
	const watchSinceDate = watch("startedFrom");

	useEffect(() => {
		const startedFromDate = new Date(watchSinceDate);
		const startedToDate = new Date(watch("startedTo"));

		// 檢查 startedFrom 是否大於 startedTo
		if (startedFromDate > startedToDate) {
			setValue("startedTo", null);
		}
	}, [watchSinceDate, setValue]);

	// Tab 列表對應 api 搜尋參數
	// const tabGroup = [
	// 	{ f: "", text: "一般排序" },
	// 	{ f: "inprogress", text: "部門排序" },
	// ];

	// 上方區塊功能按鈕清單
	const btnGroup = [
		{
			mode: "download",
			icon: <DownloadIcon fontSize="small" />,
			text: "輸出人事資料",
			variant: "contained",
			color: "secondary",
			fabVariant: "success",
			fab: <DownloadIcon />,
		},
		{
			mode: "richMenu",
			icon: <AutoFixHighIcon fontSize="small" />,
			text: "激活 Line 圖文選單",
			variant: "contained",
			color: "primary",
			fabVariant: "success",
			fab: <AutoFixHighIcon />,
		},
		// {	// 已剝離變成一個新頁面
		// 	mode: "viewpunch",
		// 	icon: <ExitToAppIcon fontSize="small" />,
		// 	text: "考勤紀錄",
		// 	variant: "contained",
		// 	color: "secondary",
		// 	// fabVariant: "success",
		// 	fab: <ExitToAppIcon />,
		// },
		{
			mode: "filter",
			icon: null, // 設為 null 就可以避免 PC 出現
			text: "篩選",
			variant: "contained",
			color: "secondary",
			fabVariant: "secondary",
			fab: <TuneIcon />,
		},
	];

	// 對照 api table 所顯示 key
	const columnsPC = [
		{ key: "pictureUrl", label: "", size: "120px" },
		{ key: "employeeId", label: "員工編號", size: "8%", align: "left" },
		{ key: "displayName", label: "LINE 顯示名稱", size: "10%", align: "left" },
		{ key: "lastname+firstname", label: "姓名", size: "10%" },
		{ key: "nickname", label: "暱稱", size: "10%" },
		{ key: "gender", label: "性別", size: "8%" },
		{ key: ["department", "name"], label: "部門", size: "10%" },
		{ key: ["factorySite", "chinese"], label: "廠別", size: "10%" },
		{ key: "startedOn", label: "到職日", size: "12%" },
	];
	const columnsMobile = [
		{ key: "employeeId", label: "員工編號" },
		{ key: "displayName", label: "LINE 顯示名稱" },
		{ key: "lastname+firstname", label: "姓名" },
		{ key: "nickname", label: "暱稱" },
		{ key: ["department", "name"], label: "部門" },
		{ key: ["factorySite", "chinese"], label: "廠別" },
		{ key: ["workHourType", "chinese"], label: "廠別", size: "10%" },
		{ key: "gender", label: "性別" },
		{ key: "startedOn", label: "到職日" },
		{ key: "birthDate", label: "生日" },
	];

	const actions = [
		{ value: "edit", icon: <EditIcon />, title: "編輯個人資料" },
		{ value: "viewpunch", icon: <PunchClockIcon />, title: "個人考勤紀錄" },
		// { value: "attconf", icon: <ViewTimelineIcon />, title: "出勤時間確認" },
	];

	// 更新 ApiUrl
	useEffect(() => {
		let constructedApiUrl = `${furl}?p=${page + 1}&s=${rowsPerPage}`;

		const searchquery = Object.fromEntries(queryParams.entries());
		for (const key in searchquery) {
			if (
				key !== "p" &&
				key !== "s" &&
				searchquery[key] !== undefined &&
				searchquery[key] !== null &&
				searchquery[key] !== ""
			) {
				constructedApiUrl += `&${key}=${encodeURIComponent(searchquery[key])}`;
			}
		}

		setApiUrl(constructedApiUrl);
	}, [page, rowsPerPage, queryParams]);

	// 取得列表資料
	useEffect(() => {
		if (apiUrl !== "") getApiList(apiUrl);
	}, [apiUrl]);
	const getApiList = useCallback(
		(url) => {
			setIsLoading(true);
			getData(url).then((result) => {
				setIsLoading(false);
				if (result.result) {
					const data = result.result;
					data.content = data.content.map((item) => {
						let displayScreenName = "";

						if (item.lastname && item.firstname) {
							displayScreenName = `${item.lastname}${item.firstname}`;
						} else if (item.lastname) {
							displayScreenName = item.lastname;
						} else if (item.firstname) {
							displayScreenName = item.firstname;
						} else if (item.nickname) {
							displayScreenName = item.nickname;
						} else {
							displayScreenName = item.displayName;
						}

						return {
							...item,
							displayScreenName: displayScreenName,
						};
					});
					console.log(data);
					setApiData(data);

					if (page > data.totalPages) {
						setPage(0);
						setRowsPerPage(10);
						navigateWithParams(1, 10);
					}
				} else {
					setApiData(null);
				}
			});
		},
		[page]
	);

	// 取得部門清單跟權限清單
	useEffect(() => {
		const departurl = "department?p=1&s=500";
		const authorityurl = "authority";
		getData(departurl).then((result) => {
			const data = result.result.content;
			setDepartmentList(data);
		});
		getData(authorityurl).then((result) => {
			const data = result.result;
			const sortedAuthorityList = data.slice().sort((a, b) => a.id - b.id);
			setAuthorityList(sortedAuthorityList);
		});
		getData("factorySite").then((result) => {
			const data = result.result;
			setFactorySiteList([
				{
					value: "",
					chinese: "暫無廠別",
				},
				...data,
			]);
		});
		getData("workDayType").then((result) => {
			const data = result.result;
			setWorkDayTypeList([
				{
					value: "",
					chinese: "暫無班制",
					workCalendar: true,
				},
				...data,
			]);
		});
		getData("workHourType").then((result) => {
			const data = result.result;
			setWorkHourTypeList([
				{
					value: "",
					chinese: "暫無班制",
				},
				...data,
			]);
		});
		getData("jobTitle?p=1&s=5000").then((result) => {
			const data = result.result.content.map((obj) => ({
				id: obj.id,
				name: obj.name,
			}));
			setJobTitleList(data);
		});
	}, []);

	// 傳遞給後端資料
	const sendDataToBackend = (fd, mode, otherData, mdate = "") => {
		setSendBackFlag(true);
		let url = "user/";
		let message = [];
		switch (mode) {
			case "edit":
				url += otherData;
				message = ["資料修改成功！"];
				break;
			case "attconf":
				url += otherData + "/attendancies/" + mdate;
				message = ["出勤時間確認成功！"];
				break;
			default:
				break;
		}
		postData(url, fd).then((result) => {
			if (result.status) {
				showNotification(message[0], true);
				if (mode === "edit") {
					getApiList(apiUrl);
				}
				setSendBackFlag(false);
			} else {
				// showNotification("發生錯誤，請洽詢資工部", false);
				if (mode === "edit") {
					showNotification(result.result.reason ? result.result.reason : "發生錯誤，請洽詢資工部", false);
				} else {
					showNotification(
						result.result.reason ? result.result.reason : result.result ? result.result : "權限不足",
						false
					);
				}
				setSendBackFlag(false);
			}
		});
	};

	// 設置頁數
	const handleChangePage = useCallback(
		(event, newPage) => {
			setPage(newPage);
			navigateWithParams(newPage + 1, rowsPerPage);
		},
		[rowsPerPage]
	);

	// 設置每頁顯示並返回第一頁
	const handleChangeRowsPerPage = (event) => {
		const targetValue = parseInt(event.target.value, 10);
		setRowsPerPage(targetValue);
		setPage(0);
		navigateWithParams(1, targetValue);
	};

	// 當活動按鈕點擊時開啟 modal 並進行動作
	const handleActionClick = (event) => {
		event.stopPropagation();
		const dataMode = event.currentTarget.getAttribute("data-mode");
		const dataValue = event.currentTarget.getAttribute("data-value");
		if (dataMode === "richMenu") {
			postData(dataMode, "").then((result) => {
				if (result.result.requestId) {
					showNotification("成功激活！", true);
				} else {
					showNotification("激活失敗。", false);
				}
			});
			// } else if (dataMode === "attconf") {
			// 	setModalValue(dataMode);
			// 	setDeliverInfo(dataValue);
		} else if (dataMode === "filter") {
			handleOpenSearch();
		} else if (dataMode === "viewpunch") {
			navigate(
				`/attendancecalendar?user=${dataValue || ""}&dep=${
					apiData.content.find((item) => item.id === dataValue)?.department.id || ""
				}&mode=clockPunch`
			);
		} else {
			setModalValue(dataMode);
			setDeliverInfo(dataValue);
			// setDeliverInfo(dataValue ? apiData?.content.find((item) => item.id === dataValue) : null);
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
			modalValue: "edit",
			modalComponent: (
				<EditModal
					title="編輯個人資料"
					deliverInfo={deliverInfo}
					sendDataToBackend={sendDataToBackend}
					onClose={onClose}
					departmentList={departmentList}
					authorityList={authorityList}
					workDayTypeList={workDayTypeList}
					factorySiteList={factorySiteList}
					WorkHourTypeList={workHourTypeList}
					jobTitleList={jobTitleList}
				/>
			),
		},
		{
			modalValue: "download",
			modalComponent: <ExportModal title="輸出人事資料" onClose={onClose} />,
		},
		// {
		// 	modalValue: "attconf",
		// 	modalComponent: (
		// 		<AttconfModal
		// 			title="出勤時間確認"
		// 			deliverInfo={deliverInfo}
		// 			sendDataToBackend={sendDataToBackend}
		// 			onClose={onClose}
		// 		/>
		// 	),
		// },
	];
	const config = modalValue ? modalConfig.find((item) => item.modalValue === modalValue) : null;

	// 開啟 SearchDialog
	const handleOpenSearch = () => {
		setSearchDialogOpen(true);
	};
	// 關閉 SearchDialog
	const handleCloseSearch = () => {
		reset(defaultValues);
		setSearchDialogOpen(false);
	};
	// 恢復為上一次搜尋狀態
	const handleCoverDialog = () => {
		reset(defaultValues);
	};
	// 重置 SearchDialog
	const handleClearSearch = () => {
		reset(defaultValue);
		setFilters(defaultValue);
		setSearchDialogOpen(false);
		setIsAgeEnabled(false);
		navigate(`?p=1&s=10`);
	};
	// 搜尋送出
	const onSubmit = (data) => {
		setFilters(data);
		setSearchDialogOpen(false);

		const fd = new FormData();

		for (let key in data) {
			switch (key) {
				case "age":
					if (data[key] !== null) {
						const ageFrom = Math.max(data[key][0], data[key][1]);
						const ageTo = Math.min(data[key][0], data[key][1]);
						fd.append("ageFrom", ageFrom);
						fd.append("ageTo", ageTo);
					}
					break;
				case "startedFrom":
				case "startedTo":
					if (data[key] !== null) {
						fd.append(key, format(data[key], "yyyy-MM-dd"));
					}
					break;
				default:
					if (data[key] !== null) {
						fd.append(key, data[key]);
					}
					break;
			}
		}

		const searchParams = new URLSearchParams(fd);
		setPage(0);
		setRowsPerPage(10);
		navigate(`?p=1&s=10&${searchParams.toString()}`);
	};

	const handleCheckboxChange = (event) => {
		let CBstatus = event.target.checked;
		setIsAgeEnabled(CBstatus);
		if (!CBstatus) {
			setValue("age", null, { shouldDirty: true });
		} else {
			setValue("age", [18, 65], { shouldDirty: true });
		}
	};

	return (
		<>
			{/* PageTitle */}
			<PageTitle
				title="人事管理"
				description="此頁面主要功能包括員工資訊查詢、編輯，以及查看考勤紀錄，同時支援激活 Line 圖文選單。"
				btnGroup={btnGroup}
				handleActionClick={handleActionClick}
				isLoading={!isLoading}
				searchMode
				// 下面參數前提都是 searchMode = true
				searchDialogOpen={searchDialogOpen}
				handleOpenDialog={handleOpenSearch}
				handleCloseDialog={handleCloseSearch}
				handleCoverDialog={handleCoverDialog}
				handleConfirmDialog={handleSubmit(onSubmit)}
				handleClearDialog={handleClearSearch}
				haveValue={filters === defaultValue}
				isDirty={isDirty}>
				<FormProvider {...methods}>
					<form className="flex flex-col gap-2">
						<div className="inline-flex items-center gap-2">
							<Controller
								name="phrase"
								control={control}
								render={({ field }) => (
									<TextField
										className="inputPadding"
										placeholder="請輸入名稱、員編或身分證進行查詢"
										fullWidth
										{...field}
									/>
								)}
							/>
						</div>
						<Divider />
						<div className="inline-flex items-center gap-2">
							<InputTitle title={"部門名稱"} classnames="whitespace-nowrap min-w-[70px]" pb={false} required={false} />
							<Controller
								name="department"
								control={control}
								render={({ field }) => (
									<Select
										className="inputPadding"
										displayEmpty
										MenuProps={MenuProps}
										fullWidth
										disabled={!departmentList}
										{...field}>
										<MenuItem value="" disabled>
											<span className="text-neutral-400 font-light">請選擇部門</span>
										</MenuItem>
										<MenuItem value="">全部部門</MenuItem>
										{departmentList?.map((dep) => (
											<MenuItem key={"select" + dep.id} value={dep.id}>
												{dep.name}
											</MenuItem>
										))}
									</Select>
								)}
							/>
						</div>
						<div className="inline-flex items-center justify-between gap-2">
							<InputTitle title={"性別"} classnames="whitespace-nowrap pb-1" pb={false} required={false} />
							<Controller
								name="gender"
								control={control}
								render={({ field }) => (
									<RadioGroup className="inputPadding" row label="性別" {...field}>
										<FormControlLabel value={""} control={<Radio color="secondary" size="small" />} label="全部" />
										<FormControlLabel value={false} control={<Radio color="secondary" size="small" />} label="女性" />
										<FormControlLabel value={true} control={<Radio color="secondary" size="small" />} label="男性" />
									</RadioGroup>
								)}
							/>
						</div>
						<div className="inline-flex items-center justify-between gap-2">
							<InputTitle title={"年齡"} classnames="whitespace-nowrap min-w-[70px]" pb={false} required={false} />
							<FormControlLabel
								control={<Checkbox checked={isAgeEnabled} onChange={handleCheckboxChange} />}
								label="根據年齡判斷"
							/>
						</div>
						{isAgeEnabled && (
							<Controller
								name="age"
								control={control}
								render={({ field }) => (
									<div className="px-3.5 sm:px-5">
										<Slider
											label="年齡"
											value={field.value}
											onChange={(event, value) => field.onChange(value)}
											valueLabelDisplay="auto"
											min={12}
											max={80}
											color="secondary"
										/>
									</div>
								)}
							/>
						)}
						<InputTitle title={"權限"} classnames="whitespace-nowrap min-w-[70px]" pb={false} required={false} />
						<Controller
							name="authorities"
							control={control}
							render={({ field }) => (
								<Select
									className="inputPadding pe-3"
									multiple
									displayEmpty
									MenuProps={MenuProps}
									renderValue={(selected) => {
										if (selected.length === 0) {
											return <span className="text-neutral-400 font-light">請選擇權限</span>;
										}

										const roleNames = selected.map((roleId) => {
											const role = authorityList?.find((r) => r.id === roleId);
											return role ? role.name : null;
										});
										return roleNames.join(", ");
									}}
									{...field}>
									{authorityList?.map((auth) => (
										<MenuItem key={auth.id} value={auth.id}>
											<Checkbox checked={watch("authorities").indexOf(auth.id) > -1} />
											{auth.name}
										</MenuItem>
									))}
								</Select>
							)}
						/>
						<InputTitle title={"到職日區間"} classnames="whitespace-nowrap min-w-[70px]" pb={false} required={false} />
						<div className="inline-flex items-center">
							<InputTitle title={"起"} classnames="whitespace-nowrap me-2" pb={false} required={false} />
							<ControlledDatePicker name="startedFrom" maxDate={new Date()} />
						</div>
						<div className="inline-flex items-center">
							<InputTitle title={"迄"} classnames="whitespace-nowrap me-2" pb={false} required={false} />
							<ControlledDatePicker
								name="startedTo"
								minDate={watchSinceDate}
								disabled={!watchSinceDate}
								maxDate={new Date()}
							/>
						</div>
					</form>
				</FormProvider>
			</PageTitle>

			{/* Table */}
			<div className="overflow-y-auto h-full order-3 sm:order-1">
				<RWDTable
					data={apiData?.content}
					columnsPC={columnsPC}
					columnsMobile={columnsMobile}
					actions={actions}
					cardTitleKey={"displayScreenName"}
					tableMinWidth={1140}
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
			{/* <FloatingActionButton btnGroup={btnGroup} handleActionClick={handleActionClick} /> */}
			<MultipleFAB btnGroup={btnGroup} handleActionClick={handleActionClick} />
			<Backdrop sx={{ color: "#fff", zIndex: 1400 }} open={sendBackFlag}>
				<LoadingFour />
			</Backdrop>

			{/* Modal */}
			{config && config.modalComponent}
		</>
	);
};

export default Users;
