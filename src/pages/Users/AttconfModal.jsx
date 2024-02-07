import React, { useEffect, useState, useCallback } from "react";
import InputTitle from "../../components/Guideline/InputTitle";
import ModalTemplete from "../../components/Modal/ModalTemplete";
import AlertDialog from "../../components/Alert/AlertDialog";
import { Loading } from "../../components/Loader/Loading";
import DatePicker from "../../components/DatePicker/DatePicker";
import { PickersDay } from "@mui/x-date-pickers/PickersDay";
import Button from "@mui/material/Button";
import {
	Badge,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Checkbox,
	Paper,
	Chip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import { getData } from "../../utils/api";
import { format } from "date-fns";

const AttconfModal = React.memo(({ title, deliverInfo, sendDataToBackend, onClose }) => {
	// Alert 開關
	const [alertOpen, setAlertOpen] = useState(false);
	// Modal Data
	const [apiData, setApiData] = useState(null);
	// 檢查是否被汙染
	const [isDirty, setIsDirty] = useState(false);
	// 選擇的日期
	const [dates, setDates] = useState(new Date());
	// isLoading 等待請求 api
	const [isLoading, setIsLoading] = useState(true);
	// 上下班 FLAG
	const [selectedOnDuty, setSelectedOnDuty] = useState(null);
	const [selectedOffDuty, setSelectedOffDuty] = useState(null);
	// 有資料的日期
	const [highlightedDays, setHighlightedDays] = useState(null);

	// 取得 Modal 資料
	useEffect(() => {
		getData(`user/${deliverInfo}/attendancies?p=1&s=5000`).then((result) => {
			const data = result.result.content;
			const groupedData = data.reduce((acc, item) => {
				const date = item.occurredAt.split("T")[0];
				acc[date] = acc[date] || [];
				acc[date].push(item);
				return acc;
			}, {});

			const result_ = Object.entries(groupedData).map(([date, items]) => ({
				date,
				items,
			}));

			setHighlightedDays(result_);
		});
	}, []);
	// 取得 Modal 資料
	useEffect(() => {
		setIsLoading(true);
		getData(`user/${deliverInfo}/attendancies/${format(dates, "yyyy-MM-dd")}`).then((result) => {
			const data = result.result;
			// 2023-11-21T16:31:25+08 去除 +08 轉為時間後重新排序
			data.sort((a, b) => new Date(a.occurredAt.slice(0, -3)) - new Date(b.occurredAt.slice(0, -3)));
			setApiData(data);

			// 篩選有 theOtherOne 的資料
			const withTheOtherOne = data.filter((item) => item.theOtherOne);

			// 分別找出上班和下班的時間
			const onDuty = withTheOtherOne.reduce((acc, curr) => {
				const currentDate = new Date(curr.occurredAt.slice(0, -3));
				const accDate = acc ? new Date(acc.occurredAt.slice(0, -3)) : null;

				if (!acc || currentDate < accDate) {
					return curr;
				} else {
					return acc;
				}
			}, null);

			const offDuty = withTheOtherOne.reduce((acc, curr) => {
				const currentDate = new Date(curr.occurredAt.slice(0, -3));
				const accDate = acc ? new Date(acc.occurredAt.slice(0, -3)) : null;

				if (!acc || currentDate > accDate) {
					return curr;
				} else {
					return acc;
				}
			}, null);

			// 設定 state
			setSelectedOnDuty(onDuty?.id);
			setSelectedOffDuty(offDuty?.id);

			setIsLoading(false);
		});
	}, [dates]);

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

	const handleToggleOnDuty = (id) => {
		if (selectedOffDuty !== id) {
			setSelectedOnDuty(selectedOnDuty === id ? null : id);
		}
	};

	const handleToggleOffDuty = (id) => {
		if (selectedOnDuty !== id) {
			setSelectedOffDuty(selectedOffDuty === id ? null : id);
		}
	};

	const getStatusChip = (attendanceType) => {
		const chipProps = { label: "", color: "" };

		switch (attendanceType) {
			case "ATTENDANCE":
				chipProps.label = "考勤";
				chipProps.color = "primary"; // 藍色
				break;
			case "VACATION":
				chipProps.label = "請假";
				chipProps.color = "warning"; // 黃色
				break;
			case null:
				chipProps.label = "缺勤";
				chipProps.color = "error"; // 紅色
				break;
			default:
				break;
		}

		return <Chip label={chipProps.label} color={chipProps.color} />;
	};

	// 提交表單資料到後端並執行相關操作
	const onSubmit = (data) => {
		const fd = new FormData();

		fd.append("since", selectedOnDuty);
		fd.append("until", selectedOffDuty);
		fd.append("type", "ATTENDANCE");

		sendDataToBackend(fd, "attconf", deliverInfo, format(dates, "yyyy-MM-dd"));
	};

	return (
		<>
			{/* Modal */}
			<ModalTemplete title={title} show={true} maxWidth={"640px"} onClose={onCheckDirty}>
				<form>
					<div className="flex flex-col gap-3">
						{/* 日期 */}
						<div className="flex items-center pt-4">
							<InputTitle title={"日期"} pb={false} required={false} classnames="whitespace-nowrap" />
							<DatePicker
								defaultValue={dates}
								setDates={setDates}
								slots={{
									day: (props) => {
										const { day, outsideCurrentMonth, ...other } = props;
										const isDateInData = (dateToCheck, data) => {
											// 取得日期的年、月、日部分
											const year = dateToCheck.getFullYear();
											const month = dateToCheck.getMonth() + 1;
											const day = dateToCheck.getDate();

											// 格式化日期字串
											const dateString = `${year}-${month < 10 ? "0" : ""}${month}-${day < 10 ? "0" : ""}${day}`;
											// 使用 Array.some() 檢查日期是否在資料中的任何一組中
											return data.some((group) => group.date === dateString);
										};

										const isInData = isDateInData(props.day, highlightedDays);
										const isSelected = !props.outsideCurrentMonth && isInData;

										return (
											<Badge key={props.day.toString()} overlap="circular" badgeContent={isSelected ? "🟣" : undefined}>
												<PickersDay {...other} outsideCurrentMonth={outsideCurrentMonth} day={day} />
											</Badge>
										);
									},
								}}
								disabled={!highlightedDays}
							/>
						</div>

						{/* 清單與選擇 */}
						<InputTitle title={"出勤時間"} pb={false} required={false} classnames="whitespace-nowrap" />
						<div className="h-[50vh] rounded-md overflow-y-hidden">
							<TableContainer
								component={Paper}
								className="relative h-full mx-auto !bg-neutral-200 border"
								sx={{
									boxShadow: "none",
								}}>
								<Table stickyHeader sx={{ minWidth: "320px" }}>
									<TableHead>
										<TableRow>
											<TableCell sx={{ textAlign: "center", verticalAlign: "middle" }} width="75px">
												類別
											</TableCell>
											<TableCell sx={{ textAlign: "start", verticalAlign: "middle" }}>時間</TableCell>
											<TableCell sx={{ textAlign: "center", verticalAlign: "middle" }} width="66px">
												位置
											</TableCell>
											<TableCell sx={{ textAlign: "center", verticalAlign: "middle" }} width="66px">
												上班
											</TableCell>
											<TableCell sx={{ textAlign: "center", verticalAlign: "middle" }} width="66px">
												下班
											</TableCell>
										</TableRow>
									</TableHead>
									<TableBody>
										{!isLoading &&
											apiData &&
											apiData.map((item) => (
												<React.Fragment key={item.id}>
													<TableRow className="bg-white">
														<TableCell sx={{ textAlign: "center", verticalAlign: "middle" }}>
															{getStatusChip(item.attendanceType)}
														</TableCell>
														<TableCell sx={{ textAlign: "start", verticalAlign: "middle" }}>
															{item.occurredAt.replace("T", " ").replace("+08", "")}
														</TableCell>
														<TableCell sx={{ textAlign: "center", verticalAlign: "middle" }}>
															{/* {item.theOtherOne === false ? (
																<CloseIcon sx={{ color: "red" }} />
															) : item.theOtherOne ? (
																<CheckIcon sx={{ color: "green" }} />
															) : ( */}
															-{/* )} */}
														</TableCell>
														<TableCell sx={{ textAlign: "center", verticalAlign: "middle" }}>
															<Checkbox
																checked={selectedOnDuty === item.id}
																onChange={() => handleToggleOnDuty(item.id)}
															/>
														</TableCell>
														<TableCell sx={{ textAlign: "center", verticalAlign: "middle" }}>
															<Checkbox
																checked={selectedOffDuty === item.id}
																onChange={() => handleToggleOffDuty(item.id)}
															/>
														</TableCell>
													</TableRow>
												</React.Fragment>
											))}
									</TableBody>
								</Table>
								{isLoading ? (
									<Loading size={48} classNames="absolute inset-0" />
								) : apiData.length <= 0 ? (
									<div className="absolute inset-0 flex items-center justify-center">
										<span className="italic text-neutral-500 text-sm">(尚無資料)</span>
									</div>
								) : null}
							</TableContainer>
						</div>

						{/* 送出按鈕 */}
						<Button variant="contained" color="success" className="!text-base !h-12" fullWidth onClick={onSubmit}>
							儲存修改
						</Button>
					</div>
				</form>
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

export default AttconfModal;
