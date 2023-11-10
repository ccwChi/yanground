import React, { useCallback } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import Pagination from "../../components/Pagination/Pagination";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Skeleton from "@mui/material/Skeleton";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import { format } from "date-fns";
import zhTW from "date-fns/locale/zh-TW";
const SKELETONITEM = 3;

// 算出應出勤天數
const getWorkingDaysInfo = () => {
	const today = new Date();
	const currentYear = today.getFullYear();
	const currentMonth = today.getMonth();
	const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
	let workingDays = 0;
	let todayIsWorkingDay = false;
	let todayWorkingDayNumber = 0;

	for (let day = 1; day <= daysInMonth; day++) {
		const currentDate = new Date(currentYear, currentMonth, day);

		if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
			workingDays++;

			if (
				currentDate.getDate() === today.getDate() &&
				currentDate.getMonth() === today.getMonth() &&
				currentDate.getFullYear() === today.getFullYear()
			) {
				todayIsWorkingDay = true;
				todayWorkingDayNumber = workingDays;
			}
		}
	}

	return {
		totalWorkingDays: workingDays,
		todayIsWorkingDay: todayIsWorkingDay,
		todayWorkingDayNumber: todayWorkingDayNumber,
	};
};

const PunchLogSection = React.memo(({ apiAttData, cat, page, setPage, rowsPerPage, setRowsPerPage, isLoading }) => {
	const navigate = useNavigate();
	// 取得當月出勤天數, 今天是否為出勤日, 今天是本月第幾日出勤日
	const { totalWorkingDays, todayIsWorkingDay, todayWorkingDayNumber } = getWorkingDaysInfo();

	// 設置頁數
	const handleChangePage = useCallback(
		(event, newPage) => {
			setPage(newPage);
			navigate(`?cat=${cat}&p=${newPage + 1}&s=${rowsPerPage}`);
		},
		[cat, rowsPerPage]
	);

	// 設置每頁顯示並返回第一頁
	const handleChangeRowsPerPage = (event) => {
		const targetValue = parseInt(event.target.value, 10);
		setRowsPerPage(targetValue);
		setPage(0);
		navigate(`?cat=${cat}&p=1&s=${targetValue}`);
	};
	return (
		<>
			<div className="panel bg-white !mx-6">
				<div>
					<div className="left h3 flex items-center text-sm sm:text-base">
						{todayIsWorkingDay && <BusinessCenterIcon className="me-1 text-orange-900" sx={{ fontSize: "20px" }} />}
						本月出勤進程
						<span className="ms-1 text-sm">
							({todayWorkingDayNumber}/{totalWorkingDays})
						</span>
					</div>
					<NavLink
						to="/punch"
						className="right flex items-center text-neutral-400 hover:text-neutral-600 me-3 transition-colors aa_wrapper text-sm sm:text-base">
						前往打卡
						<ArrowForwardIcon className="ms-1 arrow-animation" sx={{ fontSize: "16px" }} />
					</NavLink>
				</div>
				<div>
					<div className={`range range-${Math.round((todayWorkingDayNumber / totalWorkingDays) * 100)}`}>
						<div className="range-back bg-quaternary-50"></div>
					</div>
				</div>
			</div>
			{!isLoading ? (
				page >= apiAttData.totalPages ? (
					<div className="flex-1 inline-flex items-center justify-center">
						<span className="text-neutral-500 text-sm">( ヽ(#`Д´)ﾉ 頁數超出範圍，請返回第一頁)</span>
					</div>
				) : apiAttData?.content.length > 0 ? (
					<List dense={true} className="overflow-y-auto flex-1 order-3 sm:order-1 sm:!pb-0 !pb-12">
						{apiAttData?.content.map((data, index) => (
							<ListItem key={index} className="h-9">
								<ListItemText
									primary={
										// data.occurredAt.replace("T", " ").replace(/\+.*/, "") +
										format(
											new Date(data.occurredAt.replace("T", " ").replace(/\+.*/, "")),
											"yyyy年MM月dd日 (EEEE) HH:mm:ss",
											{
												locale: zhTW,
											}
										) + " - 打卡"
									}
								/>
							</ListItem>
						))}
					</List>
				) : (
					<div className="flex-1 inline-flex items-center justify-center">
						<span className="text-neutral-500 text-sm">(尚無打卡紀錄，一片空空 ʅ（´◔౪◔）ʃ)</span>
					</div>
				)
			) : (
				<div className="flex-1">
					{Array.from({ length: SKELETONITEM }).map((_, index) => (
						<Skeleton key={index} animation="wave" className="mx-4 !my-3" height={30} sx={{ transform: "none" }} />
					))}
				</div>
			)}

			{/* Pagination */}
			<Pagination
				totalElement={apiAttData ? apiAttData.totalElements : 0}
				page={page}
				onPageChange={handleChangePage}
				rowsPerPage={rowsPerPage}
				onRowsPerPageChange={handleChangeRowsPerPage}
			/>
		</>
	);
});

export default PunchLogSection;
