import React, { useCallback, useEffect, useState } from "react";
import { useLocation,useNavigate } from "react-router-dom";
import { useForm, Controller, FormProvider } from "react-hook-form";
// date-fns
import { parseISO, format } from "date-fns";
import { zhTW } from "date-fns/locale";
import { utcToZonedTime } from "date-fns-tz";
// MUI
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { Backdrop, Checkbox, MenuItem, Select } from "@mui/material";
// Components
import PageTitle from "../../components/Guideline/PageTitle";
import RWDTable from "../../components/RWDTable/RWDTable";
import Pagination from "../../components/Pagination/Pagination";
import { LoadingFour } from "../../components/Loader/Loading";
import InputTitle from "../../components/Guideline/InputTitle";
import ControlledDatePicker from "../../components/DatePicker/ControlledDatePicker";
// Hooks
import useNavigateWithParams from "../../hooks/useNavigateWithParams";
import { useNotification } from "../../hooks/useNotification";
import useLocalStorageValue from "../../hooks/useLocalStorageValue";
// Utils
import { getData, postData } from "../../utils/api";
// Customs
import attendanceWaiverList from "../../datas/attendanceWaiverType";
import { ReviewModal } from "./SupervisorApprovalModal";



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
	// queryString: "",
	// agents: [],
	users: [],
	types: [],
	since: null,
	until: null,
};


const SupervisorApproval = () => {
	// 解析網址取得參數
	const location = useLocation();
	const queryParams = new URLSearchParams(location.search);
	const navigateWithParams = useNavigateWithParams();
	const showNotification = useNotification();
	const navigate = useNavigate();
	const userProfile = useLocalStorageValue("userProfile");
	const userDepartId = userProfile && userProfile.department.id
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
	// ModalValue 控制開啟的是哪一個 Modal
	const [modalValue, setModalValue] = useState(false);
	// 傳送額外資訊給 Modal
	const [deliverInfo, setDeliverInfo] = useState(null);
	// 傳遞至後端是否完成 Flag
	const [sendBackFlag, setSendBackFlag] = useState(false);
	// ApiUrl
	const furl = "supervisor/attendanceWaiverForm";
	const [apiUrl, setApiUrl] = useState("");
	// 搜尋篩選清單
	const [filters, setFilters] = useState(defaultValue);
	const [departmentList, setDepartmentList] = useState([]);
	const [typeList, setTypeList] = useState([]);
	const [userList, setUserList] = useState([]);
	// SearchDialog Switch
	const [searchDialogOpen, setSearchDialogOpen] = useState(false);
	// 預設搜尋篩選內容
	const getValueOrFilter = (queryParam, filter) => {
		const value = queryParams.get(queryParam);
		if (queryParam === "users" || queryParam === "agents" || queryParam === "types" ) {
			return !!value ? value.split(",") : filter;
		}  else {
			return !!value ? value : filter;
		}
	};
	const defaultValues = {
		// queryString: getValueOrFilter("queryString", filters.queryString),
		// departments :getValueOrFilter("departments", filters.departments),
		// agents: getValueOrFilter("agents", filters.agents),
		users: getValueOrFilter("users", filters.users),
		types: getValueOrFilter("types", filters.types),
		since: queryParams.get("since") ? new Date(queryParams.get("since")) : null,
		until: queryParams.get("until") ? new Date(queryParams.get("until")) : null
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
	const watchSinceDate = watch("since");

	useEffect(() => {
		if (!!userDepartId){
			const departurl = `department/${userDepartId}/staff`;
			getData(departurl)
				.then((result) => {
					if (result.result){
						setUserList(result.result);
					}else {setUserList([])};
				})
		}
	}, [userDepartId]);

	useEffect(() => {
		const startedFromDate = new Date(watchSinceDate);
		const startedToDate = new Date(watch("until"));
		// 檢查 startedFrom 是否大於 startedTo
		if (startedFromDate > startedToDate) {
			setValue("until", null);
		}
	}, [watchSinceDate, setValue]);

	// 轉換時間
	const formatDateTime = (dateTime) => {
		const parsedDateTime = parseISO(dateTime);
		const formattedDateTime = format(utcToZonedTime(parsedDateTime, "Asia/Taipei"), "yyyy-MM-dd HH:mm", {
			locale: zhTW,
		});
		return formattedDateTime;
	};

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
					const transformedData = {
						...data,
						content: data.content.map((item) => ({
							fullname: `${item.attendance.user.lastname}${item.attendance.user.firstname}`,
							department: item.attendance.user.department,
							id: item.id,
							appliedAt: item.appliedAt ? formatDateTime(item.appliedAt) : "-",
							attendanceWaivertype: item.type.chinese,
							attendance: item.attendance,
							excuse: item.excuse,
							since: item.since ? formatDateTime(item.since) : "-",
							until: item.until ? formatDateTime(item.until) : "-",
							agent: item.agent,
							approver: item.approver,
							approvedAt: item.approvedAt ? formatDateTime(item.approvedAt) : "-",
							approveState: item.approvedAt ? true : null,
							remark: item.remark,
						})),
					};
					setApiData(transformedData);

					if (page >= data?.totalPages) {
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


	// 取得部門清單 & 考勤類別清單
	useEffect(() => {
		const typeurl = "attendanceWaiverType?p=1&s=500";
		getData(typeurl).then((result) => {
			if (result.result){
				const data = result.result;
				setTypeList(data);
				// console.log("type",data)
			}else {
				setTypeList([]);
			}
		});
	}, []);


	// 對照 API Table 所顯示 key
	const columnsPC = [
		{ key: "attendanceWaivertype", label: "類別", size: "12%" },
		{ key: "fullname", label: "申請人", size: "12%" },
		{ key: "since", label: "申請區間 (起)", size: "17%" },
		{ key: "until", label: "申請區間 (迄)", size: "17%" },
		{ key: "appliedAt", label: "提出申請時間", size: "17%" },
		{ key: "approveState", label: "審核狀態", size: "12%" },
	];
	const columnsMobile = [
		{ key: "id", label: "編號" },
		{ key: "fullname", label: "申請人" },
		{ key: "attendanceWaivertype", label: "類別" },
		{ key: "excuse", label: "申請事由" },
		{ key: "since", label: "申請區間 (起)" },
		{ key: "until", label: "申請區間 (迄)" },
		{ key: "appliedAt", label: "提出申請時間" },
		{ key: "agent", label: "代理人" },
		{ key: ["approver", "fullName"], label: "審核主管" },
		{ key: "approvedAt", label: "審核時間" },
		{ key: "remark", label: "審核備註" },
	];

	// Table 操作按鈕
	const actions = [{ value: "review", icon: <ReceiptLongIcon />, title: "審核" }];

	// 傳遞給後端資料
	const sendDataToBackend = (fd, mode, otherData) => {
		setSendBackFlag(true);
		let url = "supervisor/attendanceWaiverForm";
		let message = [];
		switch (mode) {
			case "approval":
				url += `/${otherData[0]}/approve`;
				message = ["審核成功！"];
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
					result.result.reason ? result.result.reason : result.result ? result.result : "權限不足",
					false
				);
			}
			setSendBackFlag(false);
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

	const handleActionClick = (event) => {
		event.stopPropagation();
		const dataMode = event.currentTarget.getAttribute("data-mode");
		const dataValue = event.currentTarget.getAttribute("data-value");

		setModalValue(dataMode);
		setDeliverInfo(dataValue ? apiData?.content.find((item) => item.id === dataValue) : null);
	};

	// 關閉 Modal 清除資料
	const onClose = () => {
		setModalValue(false);
		setDeliverInfo(null);
	};

		//  下面為搜索專用
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
			navigate(`?p=1&s=10`);
		};
		// 搜尋送出
		const onSubmit = (data) => {
			setFilters(data);
			setSearchDialogOpen(false);
			// delete data.departments;
			console.log(data)
			
			// console.log(fullDepartMember)
			// data.users.forEach(id => {
			// 	const filteredUsers = userList.filter(user => user.id === id);
			// 	fullUserPack.push(...filteredUsers);
			// });
			// if (fullUserPack.length !== 0){
			// 	data.users =  fullUserPack
			// } else {
			// 	delete data.users
			// }
			const fd = new FormData();
			for (let key in data) {
				switch (key) {
					// case "users":
					// 	fd.append(key, JSON.stringify(data[key]));
					// 	break;
					case "since":
					case "until":
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
	// 到上面為止都是搜索功能 //

	// modal 開啟參數與顯示標題
	const modalConfig = [
		{
			modalValue: "review",
			modalComponent: (
				<ReviewModal title={"審核"} deliverInfo={deliverInfo} sendDataToBackend={sendDataToBackend} onClose={onClose} />
			),
		},
	];
	const config = modalValue ? modalConfig.find((item) => item.modalValue === modalValue) : null;

	return (
		<>
			{/* PageTitle */}
			<PageTitle title="主管審核" description="此頁面是供主管檢視部門成員的請假和考勤紀錄，以便審核和決定是否通過。" searchMode
				// 下面參數前提都是 searchMode = true
				searchDialogOpen={searchDialogOpen}
				handleOpenDialog={handleOpenSearch}
				handleCloseDialog={handleCloseSearch}
				handleCoverDialog={handleCoverDialog}
				handleConfirmDialog={handleSubmit(onSubmit)}
				handleClearDialog={handleClearSearch}
				haveValue={filters === defaultValue}
				isDirty={isDirty}
			>
				<FormProvider {...methods}>
					<form className="flex flex-col gap-2">
						{/* <div className="inline-flex items-center gap-2">
							<Controller
								name="queryString"
								control={control}
								render={({ field }) => (
									<TextField
										className="inputPadding"
										placeholder="請輸入名稱進行查詢"
										fullWidth
										{...field}
									/>
								)}
							/>
						</div>
						<Divider /> */}
						<InputTitle title={"人員選擇"} classnames="whitespace-nowrap min-w-[70px]" pb={false} required={false} />
						<Controller
							name="users"
							control={control}
							render={({ field }) => (
								<Select
									className="inputPadding pe-3"
									multiple
									displayEmpty
									MenuProps={MenuProps}
									renderValue={(selected) => {
										if (selected.length === 0) {
											return <span className="text-neutral-400 font-light">請選擇人員</span>;
										}

										const roleNames = selected.map((roleId) => {
											const role = userList?.find((r) => r.id === roleId);
											return role ? (role.lastname + role.firstname) : null;
										});
										return roleNames.join(", ");
									}}
									{...field}>
									{userList?.map((user) => (
										<MenuItem key={user.id} value={user.id}>
											<Checkbox checked={watch("users").indexOf(user.id) > -1} />
											{user.lastname + user.firstname}
										</MenuItem>
									))}
								</Select>
							)}
						/>
						<InputTitle title={"考勤類別"} classnames="whitespace-nowrap min-w-[70px]" pb={false} required={false} />
						<Controller
							name="types"
							control={control}
							render={({ field }) => (
								<Select
									className="inputPadding pe-3"
									multiple
									displayEmpty
									MenuProps={MenuProps}
									renderValue={(selected) => {
										if (selected.length === 0) {
											return <span className="text-neutral-400 font-light">請選擇部門</span>;
										}

										const roleNames = selected.map((roleId) => {
											const role = typeList?.find((r) => r.value === roleId);
											return role ? role.chinese : null;
										});
										return roleNames.join(", ");
									}}
									{...field}>
									{typeList?.map((type) => (
										<MenuItem key={type.value} value={type.value}>
											<Checkbox checked={watch("types").indexOf(type.value) > -1} />
											{type.chinese}
										</MenuItem>
									))}
								</Select>
							)}
						/>
						<InputTitle title={"日期區間"} classnames="whitespace-nowrap min-w-[70px]" pb={false} required={false} />
						<div className="inline-flex items-center">
							<InputTitle title={"起"} classnames="whitespace-nowrap me-2" pb={false} required={false} />
							<ControlledDatePicker name="since" maxDate={new Date()} />
						</div>
						<div className="inline-flex items-center">
							<InputTitle title={"迄"} classnames="whitespace-nowrap me-2" pb={false} required={false} />
							<ControlledDatePicker
								name="until"
								minDate={watchSinceDate}
								disabled={!watchSinceDate}
								maxDate={new Date()}
							/>
						</div>
					</form>
				</FormProvider>
			</PageTitle>

			{/* Table */}
			<div className="overflow-y-auto sm:overflow-y-hidden h-full order-3 sm:order-1">
				<RWDTable
					data={apiData?.content}
					columnsPC={columnsPC}
					columnsMobile={columnsMobile}
					actions={actions}
					cardTitleKey={"fullname"}
					tableMinWidth={800}
					isLoading={isLoading}
					handleActionClick={handleActionClick}
					attendanceWaiverList={attendanceWaiverList}
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

			{/* Modal */}
			{config && config.modalComponent}

			{/* Backdrop */}
			<Backdrop sx={{ color: "#fff", zIndex: 1400 }} open={sendBackFlag}>
				<LoadingFour />
			</Backdrop>
		</>
	);
};

export default SupervisorApproval;
