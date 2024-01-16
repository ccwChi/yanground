// constructionTypes.js
// 如果施工種類有新增需手動新增

const constructionTypeList = [
	{
		label: "土木(整地)",
		name: "CIVIL_CONSTRUCTION_GRADING",
		ordinal: 0,
	},
	{
		label: "支架(浪板)",
		name: "BRACKET_CORRUGATED_ROOFING",
		ordinal: 1,
	},
	{
		label: "土木(基礎)",
		name: "CIVIL_CONSTRUCTION_FOUNDATION",
		ordinal: 2,
	},
	{
		label: "測量",
		name: "CONSTRUCTION_SURVEYING",
		ordinal: 3,
	},
	{
		label: "模組安裝",
		name: "PANEL_INSTALLATION",
		ordinal: 4,
	},
	{
		label: "機電",
		name: "MECHATRONICS_ENGINEERING",
		ordinal: 5,
	},
	{
		label: "鋼構(加工)",
		name: "STEEL_FRAME_PROCESSING",
		ordinal: 6,
	},
	{
		label: "鋼構(組立)",
		name: "STEEL_FRAME_ASSEMBLING",
		ordinal: 7,
	},
	{
		label: "鋼構(製造)",
		name: "STEEL_FRAME_MANUFACTURE",
		ordinal: 8,
	},
];

export default constructionTypeList;
