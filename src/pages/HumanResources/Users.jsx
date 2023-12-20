import React, { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";

// Component
import RWDTable from "../../components/RWDTable/RWDTable";
import PageTitle from "../../components/Guideline/PageTitle";
import Pagination from "../../components/Pagination/Pagination";
import InputTitle from "../../components/Guideline/InputTitle";
import MultipleFAB from "../../components/FloatingActionButton/MultipleFAB";
// import FloatingActionButton from "../../components/FloatingActionButton/FloatingActionButton";

// Mui
import FormControlLabel from "@mui/material/FormControlLabel";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import Slider from "@mui/material/Slider";
import Checkbox from "@mui/material/Checkbox";
import EditIcon from "@mui/icons-material/Edit";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import ViewTimelineIcon from "@mui/icons-material/ViewTimeline";
import PunchClockIcon from "@mui/icons-material/PunchClock";
import TuneIcon from "@mui/icons-material/Tune";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";

// Custom
import { getData, postData } from "../../utils/api";
import EditModal from "./UsersModal";
import AttconfModal from "./AttconfModal";
import { useNotification } from "../../hooks/useNotification";

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
	name: "",
	department: "",
	gender: "",
	age: [18, 65],
	permissions: [],
	startDate: null,
};

const Users = () => {
	const navigate = useNavigate();
	const showNotification = useNotification();

	// 解析網址取得參數
	const location = useLocation();
	const queryParams = new URLSearchParams(location.search);

	// cat = Category 設置 tab 分類，之後分類用
	//const [cat, setCat] = useState(null);
	// API List Data
	const [apiData, setApiData] = useState(null);
	// isLoading 等待請求 api
	const [isLoading, setIsLoading] = useState(false);
	// Page 頁數設置
	const [page, setPage] = useState(
		queryParams.has("p") && !isNaN(+queryParams.get("p")) ? +queryParams.get("p") - 1 : 0
	);
	// rows per Page 多少筆等同於一頁
	const [rowsPerPage, setRowsPerPage] = useState(
		queryParams.has("s") && !isNaN(+queryParams.get("s")) ? +queryParams.get("s") : 10
	);
	// ApiUrl
	const furl = "user";
	const apiUrl = `${furl}?p=${page + 1}&s=${rowsPerPage}`;
	// 在主畫面先求得部門跟權限 list 再直接傳給面板
	const [departmentList, setDepartmentList] = useState(null);
	const [authorityList, setAuthorityList] = useState(null);
	// ModalValue 控制開啟的是哪一個 Modal
	const [modalValue, setModalValue] = useState(false);
	// 傳送額外資訊給 Modal
	const [deliverInfo, setDeliverInfo] = useState(null);
	// SearchDialog Switch
	const [searchDialogOpen, setSearchDialogOpen] = useState(false);
	// 搜尋篩選清單
	const [filters, setFilters] = useState(defaultValue);

	// 預設搜尋篩選內容
	const defaultValues = {
		name: filters.name,
		department: filters.department,
		gender: filters.gender,
		age: filters.age,
		permissions: filters.permissions,
		startDate: filters.startDate,
	};

	// 使用 useForm Hook 來管理表單狀態和驗證
	const methods = useForm({
		defaultValues,
	});
	const {
		control,
		reset,
		watch,
		formState: { isDirty },
		handleSubmit,
	} = methods;

	// Tab 列表對應 api 搜尋參數
	// const tabGroup = [
	// 	{ f: "", text: "一般排序" },
	// 	{ f: "inprogress", text: "部門排序" },
	// ];

	// 上方區塊功能按鈕清單
	const btnGroup = [
		{
			mode: "richMenu",
			icon: <AutoFixHighIcon fontSize="small" />,
			text: "激活 Line 圖文選單",
			variant: "contained",
			color: "primary",
			fabVariant: "success",
			fab: <AutoFixHighIcon />,
		},
		{
			mode: "viewpunch",
			icon: <ExitToAppIcon fontSize="small" />,
			text: "打卡紀錄",
			// text: "打卡與考勤",
			variant: "contained",
			color: "secondary",
			// fabVariant: "success",
			fab: <ExitToAppIcon />,
		},
		// {
		// 	mode: "filter",
		// 	icon: null, // 設為 null 就可以避免 PC 出現
		// 	text: "篩選",
		// 	variant: "contained",
		// 	color: "secondary",
		// 	fabVariant: "secondary",
		// 	fab: <TuneIcon />,
		// },
	];

	// 對照 api table 所顯示 key
	const columnsPC = [
		{ key: "pictureUrl", label: "", size: "120px" },
		{ key: "displayName", label: "line名稱", size: "16%", align: "left" },
		{ key: "nickname", label: "暱稱", size: "14%" },
		{ key: "gender", label: "性別", size: "10%" },
		{ key: ["department", "name"], label: "部門", size: "14%" },
		{ key: "startedOn", label: "到職日", size: "16%" },
	];
	const columnsMobile = [
		{ key: "displayName", label: "line名稱" },
		{ key: "lastname", label: "姓氏" },
		{ key: "firstname", label: "名字" },
		{ key: "nickname", label: "暱稱" },
		{ key: ["department", "name"], label: "部門" },
		{ key: "gender", label: "性別" },
		{ key: "startedOn", label: "到職日" },
		{ key: "birthDate", label: "生日" },
	];

	// edit = 編輯名稱
	const actions = [
		{ value: "edit", icon: <EditIcon />, title: "編輯個人資料" },
		{ value: "viewpunch", icon: <PunchClockIcon />, title: "個人打卡紀錄" }, //  "打卡與考勤"
		// { value: "attconf", icon: <ViewTimelineIcon />, title: "出勤時間確認" },
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

	// 取得部門清單跟權限清單
	useEffect(() => {
		setIsLoading(true);
		const departurl = "department";
		const authorityurl = "authority";
		getData(departurl).then((result) => {
			setIsLoading(false);
			const data = result.result.content;
			setDepartmentList(data);
		});
		getData(authorityurl).then((result) => {
			setIsLoading(false);
			const data = result.result;
			const sortedAuthorityList = data.slice().sort((a, b) => a.id - b.id);
			setAuthorityList(sortedAuthorityList);
		});
	}, []);

	// 傳遞給後端資料
	const sendDataToBackend = (fd, mode, otherData, mdate = "") => {
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
			} else {
				// showNotification("發生錯誤，請洽詢資工部", false);
				if (mode === "edit") {
					showNotification(result.result.reason ? result.result.reason : "發生錯誤，請洽詢資工部", false);
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
			}
		});
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
				`attendance_calendar?user=${dataValue || ""}&dep=${
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
				/>
			),
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
	};
	// 搜尋送出
	const onSubmit = (data) => {
		reset(data);
		setFilters(data);
		setSearchDialogOpen(false);
		console.log(data);
	};

	return (
		<>
			{/* PageTitle */}
			<PageTitle
				title="人事管理"
				btnGroup={btnGroup}
				handleActionClick={handleActionClick}
				isLoading={!isLoading}
				// searchMode
				// 下面參數前提都是 searchMode = true
				searchDialogOpen={searchDialogOpen}
				handleOpenDialog={handleOpenSearch}
				handleCloseDialog={handleCloseSearch}
				handleCoverDialog={handleCoverDialog}
				handleConfirmDialog={handleSubmit(onSubmit)}
				handleClearDialog={handleClearSearch}
				haveValue={filters === defaultValue}
				isDirty={isDirty}>
				<form className="flex flex-col gap-2">
					<div className="inline-flex items-center gap-2">
						<InputTitle title={"Line 名稱"} classnames="whitespace-nowrap min-w-[80px]" pb={false} required={false} />
						<Controller
							name="name"
							control={control}
							render={({ field }) => (
								<TextField className="inputPadding" placeholder="請輸入 Line 名稱" fullWidth {...field} />
							)}
						/>
					</div>
					<div className="inline-flex items-center gap-2">
						<InputTitle title={"部門名稱"} classnames="whitespace-nowrap min-w-[80px]" pb={false} required={false} />
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
									<FormControlLabel value={"female"} control={<Radio color="secondary" size="small" />} label="女性" />
									<FormControlLabel value={"male"} control={<Radio color="secondary" size="small" />} label="男性" />
								</RadioGroup>
							)}
						/>
					</div>
					<InputTitle title={"年齡"} classnames="whitespace-nowrap min-w-[80px]" pb={false} required={false} />
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
					<InputTitle title={"權限"} classnames="whitespace-nowrap min-w-[80px]" pb={false} required={false} />
					<Controller
						name="permissions"
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
										<Checkbox checked={watch("permissions").indexOf(auth.id) > -1} />
										{auth.name}
									</MenuItem>
								))}
							</Select>
						)}
					/>
				</form>
			</PageTitle>

			{/* Table */}
			<div className="overflow-y-auto h-full order-3 sm:order-1">
				<RWDTable
					data={apiData?.content}
					columnsPC={columnsPC}
					columnsMobile={columnsMobile}
					actions={actions}
					cardTitleKey={"displayName"}
					tableMinWidth={800}
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

			{/* Modal */}
			{config && config.modalComponent}
		</>
	);
};

export default Users;
