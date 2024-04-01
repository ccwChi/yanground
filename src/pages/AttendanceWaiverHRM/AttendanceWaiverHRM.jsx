import React, { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useForm, Controller, FormProvider } from "react-hook-form";
// date-fns
import { parseISO, format } from "date-fns";
import { zhTW } from "date-fns/locale";
import { utcToZonedTime } from "date-fns-tz";
// MUI
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
// Utils
import { getData, postData } from "../../utils/api";
// Customs
import attendanceWaiverList from "../../datas/attendanceWaiverType";
import { ViewModal } from "./AttendanceWaiverHRMModal";

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
	departments: [],
	users: [],
	types: [],
	since: null,
	until: null,
};

const AttendanceWaiverHRM = () => {
	// 解析網址取得參數
	const location = useLocation();
	const queryParams = new URLSearchParams(location.search);
	const navigateWithParams = useNavigateWithParams();
	const showNotification = useNotification();
	const navigate = useNavigate();
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
	const furl = "attendanceWaiverForm";
	const [apiUrl, setApiUrl] = useState("");
	// 搜尋篩選清單
	const [filters, setFilters] = useState(defaultValue);
	const [departmentList, setDepartmentList] = useState([]);
	const [typeList, setTypeList] = useState([]);
	const [userList, setUserList] = useState([]);
	// SearchDialog Switch
	const [searchDialogOpen, setSearchDialogOpen] = useState(false);
	/** 用 localstorage 的資訊確定是不是人資部，然後決定可以看單一部門還是全部部門 */

	// 預設搜尋篩選內容
	const getValueOrFilter = (queryParam, filter) => {
		const value = queryParams.get(queryParam);
		if (queryParam === "users" || queryParam === "agents" || queryParam === "departments" || queryParam === "types") {
			return !!value ? value.split(",") : filter;
		} else {
			return !!value ? value : filter;
		}
	};
	const defaultValues = {
		// queryString: getValueOrFilter("queryString", filters.queryString),
		// agents: getValueOrFilter("agents", filters.agents),
		departments: getValueOrFilter("departments", filters.departments),
		users: getValueOrFilter("users", filters.users),
		types: getValueOrFilter("types", filters.types),
		since: queryParams.get("since") ? new Date(queryParams.get("since")) : null,
		until: queryParams.get("until") ? new Date(queryParams.get("until")) : null,
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
	const watchDepartment = watch("departments");

	// 更改部門之後，選擇人員部分清空
	useEffect(() => {
		if (watchDepartment.length === 0) {
			setValue("users", []);
		}
	}, [watchDepartment]);

	// 取得特定部門人員清單
	useEffect(() => {
		if (!!watchDepartment) {
			const promises = watchDepartment.map((departId) => {
				const departurl = `department/${departId}/staff`;
				return getData(departurl).then((result) => {
					return result.result ? result.result : [];
				});
			});
			Promise.all(promises)
				.then((results) => {
					const combinedUserList = results.reduce((acc, userList) => acc.concat(userList), []);
					setUserList(combinedUserList);
				})
				.catch((error) => {
					setUserList([]);
				});
		}
	}, [watchDepartment]);

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
				// console.log("constructedApiUrl", constructedApiUrl);
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
							agent: {
								...item.agent,
								displayScreenName: (() => {
									const _item = item.agent;
									let displayScreenName = "";

									if (_item) {
										if (_item.lastname && _item.firstname) {
											displayScreenName = `${_item.lastname}${_item.firstname}`;
										} else if (_item.lastname) {
											displayScreenName = _item.lastname;
										} else if (_item.firstname) {
											displayScreenName = _item.firstname;
										} else if (_item.nickname) {
											displayScreenName = _item.nickname;
										} else {
											displayScreenName = _item.displayName;
										}
									}
									return displayScreenName;
								})(),
							},
							approver: {
								...item.approver,
								displayScreenName: (() => {
									const _item = item.approver;
									let displayScreenName = "";

									if (_item) {
										if (_item.lastname && _item.firstname) {
											displayScreenName = `${_item.lastname}${_item.firstname}`;
										} else if (_item.lastname) {
											displayScreenName = _item.lastname;
										} else if (_item.firstname) {
											displayScreenName = _item.firstname;
										} else if (_item.nickname) {
											displayScreenName = _item.nickname;
										} else {
											displayScreenName = _item.displayName;
										}
									}
									return displayScreenName;
								})(),
							},
							approvedAt: item.approvedAt ? formatDateTime(item.approvedAt) : "-",
							approveState: item.approvedAt ? true : null,
							remark: item.remark,
						})),
					};
					setApiData(transformedData);
					if (page > data?.totalPages) {
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
		const departurl = "department?p=1&s=500";
		const typeurl = "attendanceWaiverType?p=1&s=500";
		getData(departurl).then((result) => {
			if (result.result) {
				const data = result.result.content;
				setDepartmentList(data);
			} else {
				setDepartmentList([]);
			}
		});
		getData(typeurl).then((result) => {
			if (result.result) {
				const data = result.result;
				setTypeList(data);
			} else {
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
		{ key: ["agent", "displayScreenName"], label: "代理人" },
		{ key: ["approver", "displayScreenName"], label: "審核主管" },
		{ key: "approvedAt", label: "審核時間" },
		{ key: "remark", label: "審核備註" },
	];

	// Table 操作按鈕
	const actions = [{ value: "review", icon: <VisibilityIcon />, title: "檢視" }];

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

	// 傳遞給後端資料
	const sendDataToBackend = (fd, mode, otherData) => {
		setSendBackFlag(true);
		let url = "attendanceWaiverForm";
		let message = [];
		switch (mode) {
			case "approval":
				url += `/${otherData[0]}/${otherData[1]}`;
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

		const fullDepartMember = [];
		if (data.departments.length > 0 && data.users.length === 0) {
			const allMember = userList.map((user) => user.id);
			fullDepartMember.push(...allMember);
			data.users = fullDepartMember;
		}

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

	// console.log("departmentList",departmentList)
	// modal 開啟參數與顯示標題
	const modalConfig = [
		{
			modalValue: "review",
			modalComponent: (
				<ViewModal
					title={"檢視審核資訊"}
					deliverInfo={deliverInfo}
					onClose={onClose}
					sendDataToBackend={sendDataToBackend}
				/>
			),
		},
	];
	const config = modalValue ? modalConfig.find((item) => item.modalValue === modalValue) : null;

	return (
		<>
			{/* PageTitle */}
			<PageTitle
				title="豁免出勤審核"
				description="此頁面為提供人資檢視其他同仁員工豁免出勤審核紀錄的功能。"
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
						<InputTitle title={"部門選擇"} classnames="whitespace-nowrap min-w-[70px]" pb={false} required={false} />
						<Controller
							name="departments"
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
											const role = departmentList?.find((r) => r.id === roleId);
											return role ? role.name : null;
										});
										return roleNames.join(", ");
									}}
									{...field}>
									{departmentList?.map((dep) => (
										<MenuItem key={dep.id} value={dep.id}>
											<Checkbox checked={watch("departments").indexOf(dep.id) > -1} />
											{dep.name}
										</MenuItem>
									))}
								</Select>
							)}
						/>
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
											return role ? role.lastname + role.firstname : null;
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

export default AttendanceWaiverHRM;
