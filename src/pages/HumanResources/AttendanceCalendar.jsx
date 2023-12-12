import React, { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PageTitle from "../../components/Guideline/PageTitle";
import Calendar from "../../components/Calendar/Calendar";
import InputTitle from "../../components/Guideline/InputTitle";
import DatePicker from "../../components/DatePicker/DatePicker";
import FloatingActionButton from "../../components/FloatingActionButton/FloatingActionButton";
import { LoadingTwo } from "../../components/Loader/Loading";
import { parseISO, format } from "date-fns";
import { zhTW } from "date-fns/locale";
import { utcToZonedTime } from "date-fns-tz";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import CircularProgress from "@mui/material/CircularProgress";
import Backdrop from "@mui/material/Backdrop";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import TuneIcon from "@mui/icons-material/Tune";
import { getData } from "../../utils/api";

const AttendanceCalendar = () => {
	const navigate = useNavigate();
	// 解析網址取得參數
	const location = useLocation();
	const queryParams = new URLSearchParams(location.search);
	// 設定部門人員
	const depValue = queryParams.get("dep");
	const userValue = queryParams.get("user");
	const modeValue = queryParams.get("mode");
	// API List Data
	const [apiData, setApiData] = useState(null);
	// 部門
	const [departmentList, setDepartmentList] = useState([]);
	// 人員
	const [usersList, setUsersList] = useState([]);
	// isLoading 等待請求 API
	const [isLoading, setIsLoading] = useState(false);
	// SearchDialog Switch
	const [searchDialogOpen, setSearchDialogOpen] = useState(false);

	// 搜尋日期
	const [dates, setDates] = useState(new Date());
	// 設定日期條件
	const [dateCondition, setDateCondition] = useState(2);
	const dateConList = [
		{
			id: 1,
			text: "依據年, 月, 日進行搜尋",
			views: ["year", "month", "day"],
			formatOne: "yyyy 年 MM 月 dd 日",
			formatTwo: "yyyy-MM-dd",
			formatThree: "yyyy/MM/dd",
		},
		{
			id: 2,
			text: "依據年, 月進行搜尋",
			views: ["month", "year"],
			formatOne: "yyyy 年 MM 月",
			formatTwo: "yyyy-MM",
			formatThree: "yyyy/MM",
		},
		// { id: 3, text: "依據年份進行搜尋", views: ["year"], formatOne: "yyyy 年", formatTwo: "yyyy" },
	];
	const dataCAList = [
		{ value: "clockPunch", text: "打卡紀錄" },
		{ value: "attendance", text: "出勤紀錄" },
	];

	// 區塊功能按鈕清單
	const btnGroup = [
		{
			mode: "filter",
			icon: null, // 設為 null 就可以避免 PC 出現
			text: "篩選",
			variant: "contained",
			color: "secondary",
			fabVariant: "secondary",
			fab: <TuneIcon fontSize="large" />,
		},
	];

	// 取得部門資料
	useEffect(() => {
		getData("department").then((result) => {
			const data = result.result.content;
			const formattedDep = data.map((dep) => ({ label: dep.name, id: dep.id }));
			setDepartmentList(formattedDep);
		});
	}, []);

	// 取得人員資料
	useEffect(() => {
		if (depValue) {
			getData(`department/${depValue}/staff`).then((result) => {
				const data = result.result;
				const formattedUser = data.map((us) => ({ label: us.nickname, id: us.id }));
				setUsersList(formattedUser);
			});
		}
	}, [depValue]);

	// 取得日曆資料
	useEffect(() => {
		if (userValue && depValue) {
			setIsLoading(true);
			getData(`user/${userValue}/clockPunch/${format(dates, dateConList[dateCondition - 1].formatThree)}`).then(
				(result) => {
					setIsLoading(false);
					const data = result.result.content;
					const formattedEvents = data.map((event) => ({
						id: event.id,
						title: event.clockIn ? "上班" : event.clockIn === false ? "下班" : "上/下班",
						date: format(utcToZonedTime(parseISO(event.occurredAt), "Asia/Taipei"), "yyyy-MM-dd HH:mm:ss", {
							locale: zhTW,
						}),
					}));
					setApiData(formattedEvents);
				}
			);
		}
	}, [userValue, dates, dateCondition]);

	// 開啟 SearchDialog
	const handleOpenSearch = () => {
		setSearchDialogOpen(true);
	};
	// 關閉 SearchDialog
	const handleCloseSearch = () => {
		setSearchDialogOpen(false);
	};

	// 變動日期格式
	const selectedDateCon = dateConList.find((dc) => dateCondition === dc.id) || {};
	// 使用了 || {}，這是為了防止 selectedDateCon 為 undefined 時解構賦值產生錯誤。

	return (
		<>
			{/* PageTitle & Search */}
			<PageTitle
				title={`${
					!userValue
						? "打卡與考勤"
						: `${
								usersList?.find((obj) => obj.id === userValue)?.label
									? usersList.find((obj) => obj.id === userValue).label + "的"
									: ""
						  }${
								dataCAList.find((obj) => obj.value === modeValue)
									? dataCAList.find((obj) => obj.value === modeValue).text
									: dataCAList[0].text
						  }`
				}`}
				searchMode
				// 下面參數前提都是 searchMode = true
				searchDialogOpen={searchDialogOpen}
				handleOpenDialog={handleOpenSearch}
				handleCloseDialog={handleCloseSearch}
				handleCloseText={"關閉"}
				haveValue={
					!depValue &&
					!userValue &&
					dateCondition === 2 &&
					(modeValue === dataCAList[0].value || !dataCAList.some((item) => item.value === modeValue))
				}>
				<div className="relative flex flex-col item-start sm:items-center gap-3">
					<div className="inline-flex items-center w-full">
						<InputTitle title={"選擇資料"} pb={false} required={false} classnames="whitespace-nowrap" />
						<Select
							value={!modeValue ? dataCAList[0].value : modeValue}
							onChange={(event) =>
								navigate(
									`/users/attendance_calendar?user=${userValue || ""}&dep=${depValue || ""}&mode=${event.target.value}`
								)
							}
							className="inputPadding"
							displayEmpty
							fullWidth>
							{dataCAList.map((item) => (
								<MenuItem key={item.value} value={item.value}>
									{item.text}
								</MenuItem>
							))}
						</Select>
					</div>
					<div className="inline-flex items-center w-full">
						<InputTitle title={"部門"} pb={false} required={false} classnames="whitespace-nowrap" />
						<Autocomplete
							options={departmentList}
							className="flex-1"
							value={departmentList?.find((obj) => obj.id === depValue) || null}
							onChange={(event, newValue, reason) => {
								if (reason === "clear") {
									if (window.confirm("是否確認清空部門欄位？")) {
										setUsersList([]);
										setApiData(null);
										navigate(`/users/attendance_calendar?mode=${modeValue || ""}`);
									}
								} else {
									setUsersList([]);
									setApiData(null);
									navigate(`/users/attendance_calendar?dep=${newValue.id}&mode=${modeValue || ""}`);
								}
							}}
							renderInput={(params) => (
								<TextField
									{...params}
									className="inputPadding bg-white"
									placeholder="請選擇部門"
									sx={{ "& > div": { padding: "0 !important" } }}
									InputProps={{
										...params.InputProps,
										endAdornment: (
											<>
												{departmentList.length <= 0 ? (
													<CircularProgress className="absolute right-[2.325rem]" size={20} />
												) : null}
												{params.InputProps.endAdornment}
											</>
										),
									}}
								/>
							)}
							loading={departmentList.length <= 0}
							loadingText={"載入中..."}
						/>
					</div>
					<div className="inline-flex items-center w-full">
						<InputTitle title={"人員"} pb={false} required={false} classnames="whitespace-nowrap" />
						<Autocomplete
							options={usersList}
							className="flex-1"
							value={usersList?.find((obj) => obj.id === userValue) || null}
							onChange={(event, newValue, reason) => {
								if (reason === "clear") {
									if (window.confirm("是否確認清空人員欄位？")) {
										setApiData(null);
										navigate(`/users/attendance_calendar?dep=${depValue || ""}&mode=${modeValue || ""}`);
									}
								} else {
									setApiData(null);
									navigate(
										`/users/attendance_calendar?user=${newValue.id}&dep=${depValue || ""}&mode=${modeValue || ""}`
									);
								}
							}}
							renderInput={(params) => (
								<TextField
									{...params}
									className="inputPadding bg-white"
									placeholder="請選擇人員"
									sx={{ "& > div": { padding: "0 !important" } }}
									InputProps={{
										...params.InputProps,
										endAdornment: (
											<>
												{depValue && usersList.length <= 0 ? (
													<CircularProgress className="absolute right-[2.325rem]" size={20} />
												) : null}
												{params.InputProps.endAdornment}
											</>
										),
									}}
								/>
							)}
							loading={usersList.length <= 0}
							loadingText={"載入中..."}
							disabled={!depValue}
						/>
					</div>
					<div className="inline-flex items-center w-full">
						<InputTitle title={"條件"} pb={false} required={false} classnames="whitespace-nowrap" />
						<Select
							value={dateCondition}
							onChange={(event) => setDateCondition(event.target.value)}
							className="inputPadding !pe-5"
							displayEmpty
							fullWidth>
							{dateConList.map((dc) => (
								<MenuItem key={dc.id} value={dc.id}>
									{dc.text}
								</MenuItem>
							))}
						</Select>
					</div>
					<div className="inline-flex items-center w-full">
						<InputTitle title={"日期"} pb={false} required={false} classnames="whitespace-nowrap" />
						<DatePicker
							defaultValue={dates}
							setDates={setDates}
							views={selectedDateCon.views}
							format={selectedDateCon.formatOne}
							minDate={new Date("2023-11")}
						/>
					</div>
				</div>
			</PageTitle>

			{/* Calendar */}
			<Calendar
				data={apiData}
				initialDate={dates && format(dates, selectedDateCon.formatTwo)}
				defaultViews={dateCondition === 1 ? "dayGridDay" : "dayGridMonth"}
				viewOptions={
					dateCondition === 1
						? ["dayGridDay", "timeGridDay", "listMonth"]
						: ["dayGridMonth", "timeGridWeek", "listMonth"]
				}
				goto={format(dates, selectedDateCon.formatTwo)}
				navLinks={false}
				pnlive={false}
			/>

			{/* Floating Action Button */}
			<FloatingActionButton btnGroup={btnGroup} handleActionClick={handleOpenSearch} />

			{/* Backdrop */}
			<Backdrop sx={{ color: "#fff", zIndex: 1400 }} open={isLoading}>
				<LoadingTwo />
			</Backdrop>
		</>
	);
};

export default AttendanceCalendar;
