import React, { useState, useEffect, useRef } from "react";
// FullCalendar
import interactionPlugin from "@fullcalendar/interaction";
import zhTwLocale from "@fullcalendar/core/locales/zh-tw";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import multiMonthPlugin from "@fullcalendar/multimonth";
// MUI
import useMediaQuery from "@mui/material/useMediaQuery";
import IconButton from "@mui/material/IconButton";
import ButtonGroup from "@mui/material/ButtonGroup";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import TodayIcon from "@mui/icons-material/Today";
import CalendarViewMonthIcon from "@mui/icons-material/CalendarViewMonth";
import CalendarViewWeekIcon from "@mui/icons-material/CalendarViewWeek";
import EventNoteIcon from "@mui/icons-material/EventNote";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AvTimerIcon from "@mui/icons-material/AvTimer";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ListAltIcon from "@mui/icons-material/ListAlt";
// Custom
import "./calendar.scss";

const Calendar = ({
	data,
	defaultViews = "dayGridMonth",
	viewOptions = ["dayGridMonth", "timeGridWeek", "listMonth"],
	_dayMaxEvents = 2,
	pnlive = true,
	goto,
	weekNumbers = true,
	customInitialView = false,
	...otherProps
}) => {
	const isTargetScreen = useMediaQuery("(max-width:991.98px)");
	const isTargetScreenSm = useMediaQuery("(max-width:389.98px)");
	const calendarRef = useRef(null);
	const [activeButton, setActiveButton] = useState("");
	const [calendarTitle, setCalendarTitle] = useState("");

	useEffect(() => {
		if (!customInitialView) {
			const newView = isTargetScreen ? "listMonth" : defaultViews;
			calendarRef.current.getApi().changeView(newView);
			setActiveButton(newView);
		} else {
			setActiveButton(defaultViews);
		}
	}, [isTargetScreen, defaultViews]);

	useEffect(() => {
		if (goto) {
			calendarRef.current.getApi().gotoDate(goto);
		}
	}, [goto]);

	const handleViewChange = (view) => {
		calendarRef.current.getApi().changeView(view);
		setActiveButton(view);
	};

	const getTitleForView = (view) => {
		switch (view) {
			case "dayGridMonth":
				return "月";
			case "dayGridWeek":
				return "週";
			case "timeGridWeek":
				return "週 (時)";
			case "dayGridDay":
				return "日";
			case "timeGridDay":
				return "日 (時)";
			case "listMonth":
				return "列表";
			case "multiMonthYear":
				return "年";
			default:
				return null;
		}
	};

	const getIconForView = (view) => {
		switch (view) {
			case "dayGridMonth":
				return <CalendarTodayIcon fontSize="small" />;
			case "dayGridWeek":
				return <CalendarViewWeekIcon fontSize="small" />;
			case "timeGridWeek":
				return <AccessTimeIcon fontSize="small" />;
			case "dayGridDay":
				return <EventNoteIcon fontSize="small" />;
			case "timeGridDay":
				return <AvTimerIcon fontSize="small" />;
			case "listMonth":
				return <ListAltIcon fontSize="small" />;
			case "multiMonthYear":
				return <CalendarViewMonthIcon fontSize="small" />;
			default:
				return null;
		}
	};

	return (
		<>
			<div className="relative flex items-center justify-between pt-1 sm:pt-3 px-4" data-flag="header">
				<div className="inline-flex items-center">
					{pnlive && (
						<>
							<Tooltip title="Previous">
								<IconButton onClick={() => calendarRef.current.getApi().prev()} sx={{ mr: 0.5 }}>
									<ArrowBackIosNewIcon fontSize="small" />
								</IconButton>
							</Tooltip>
							<Tooltip title="Next">
								<IconButton onClick={() => calendarRef.current.getApi().next()} sx={{ mr: 0.5 }}>
									<ArrowForwardIosIcon fontSize="small" />
								</IconButton>
							</Tooltip>
						</>
					)}
					<Tooltip title="今日">
						<IconButton onClick={() => calendarRef.current.getApi().today()} sx={{ mr: 0.5 }}>
							<TodayIcon fontSize="small" />
						</IconButton>
					</Tooltip>
				</div>
				{!isTargetScreenSm && (
					<div className="sm:absolute left-0 right-0 mx-auto font-bold text-primary-900 lg:text-2xl md:text-xl text-lg opacity-80 tracking-wide w-fit">
						{calendarTitle}
					</div>
				)}
				<div className="punchlog_btngrpwrp">
					{isTargetScreen && !customInitialView ? (
						<ButtonGroup variant="outlined">
							<Button onClick={() => handleViewChange("listMonth")} className={"primary"}>
								<ListAltIcon fontSize="small" />
							</Button>
						</ButtonGroup>
					) : (
						<ButtonGroup variant="outlined">
							{viewOptions.map((view) => (
								<Tooltip key={view} title={getTitleForView(view)}>
									<Button
										onClick={() => handleViewChange(view)}
										className={activeButton === view ? "primary" : "default"}>
										{getIconForView(view)}
									</Button>
								</Tooltip>
							))}
						</ButtonGroup>
					)}
				</div>
			</div>
			{isTargetScreenSm && (
				<div className="left-0 right-0 mx-auto font-bold text-primary-900 text-base opacity-80 tracking-wide w-fit">
					{calendarTitle}
				</div>
			)}
			<FullCalendar
				ref={calendarRef}
				plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin, multiMonthPlugin]}
				initialView={customInitialView ? defaultViews : isTargetScreen ? "listMonth" : defaultViews}
				headerToolbar={false}
				// 設為星期一開始
				firstDay={1}
				datesSet={(dateInfo) => {
					setCalendarTitle(dateInfo.view.title);
				}}
				events={data}
				// 最多顯示多少個
				dayMaxEvents={true}
				views={{
					dayGridMonth: {
						dayMaxEvents: _dayMaxEvents,
					},
				}}
				// 是否可以點擊
				selectable={true}
				// 在月視圖中決定是否應該呈現上個月或下個月的日期
				showNonCurrentDates={false}
				// 決定是否應在日曆上顯示週數
				weekNumbers={weekNumbers}
				// 週數格式 e.g. short - W 6 ; narrow - W6 ; numeric - 6
				weekNumberFormat={{ week: "narrow" }}
				viewClassNames={"custom_calendar"}
				eventColor="#F48A64" // "#ff97a9"
				locale={zhTwLocale}
				timeZone="Asia/Taipei"
				// 確定日名稱和周名稱是否可點擊
				navLinks={!isTargetScreen}
				nextDayThreshold={"08:00:00"}
				{...otherProps}
			/>
		</>
	);
};

export default Calendar;

//****** How To Use ? ******//

// data = 傳入你的資料 (*格式記得符合 Calendar 規範)
// viewOptions = 預設為 ["dayGridMonth", "timeGridWeek", "listMonth"]，用途為右上方的視圖模式選擇
// _dayMaxEvents = 預設為 2，用途為每日最多顯示幾筆資料在月視圖的畫面上?
// ...otherProps = 允許設定其他 Calendar 屬性傳入

// 最簡單使用方法：
// e.g.
//	<Calendar data={events} />

// 如果要自己設定其他日曆屬性：
// e.g.
//	<Calendar
//		data={events}
//		viewOptions={["dayGridMonth", "dayGridWeek", "timeGridWeek", "dayGridDay", "timeGridDay"]}
//		_dayMaxEvents={3}
//		eventClick={(info) => {
//			console.log("Event clicked:", info.event.id, info.event.title, info.event);
//		}}
//	/>
