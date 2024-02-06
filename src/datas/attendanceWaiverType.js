// attendanceWaiverType.js

const attendanceWaiverList = [
	{
		value: "MEND",
		chinese: "補打卡",
		timeUnit: 3600.0,
		color: "#547db7",
	},
	{
		value: "LATE_OR_EARLY",
		chinese: "遲到或早退",
		timeUnit: 3600.0,
		color: "#039E8E",
	},
	{
		value: "LEAVE",
		chinese: "請假",
		timeUnit: 3600.0,
		color: "#F7941D",
	},
	{
		value: "FIELD",
		chinese: "外勤",
		timeUnit: 3600.0,
		color: "#6262a7",
	},
	{
		value: "OVERTIME",
		chinese: "加班",
		timeUnit: 1800.0,
		color: "#F03355",
	},
];

export default attendanceWaiverList;
