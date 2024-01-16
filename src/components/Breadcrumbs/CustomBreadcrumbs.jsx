import React, { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
// MUI
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";

const nameMappings = [
	// 基礎資料
	{ name: "constructionTypes", display: "工程類別" },
	// 工作管理
	{ name: "sites", display: "案場" },
	{ name: "dispatchcalendar", display: "派工行事曆" },
	{ name: "constructionsummary", display: "施工清單" },
	{ name: "dispatchList", display: "派工清單" },
	{ name: "project", display: "專案管理" },
	// HRM
	{ name: "users", display: "人事管理" },
	{ name: "attendancecalendar", display: "考勤紀錄" },
	{ name: "anomaly_report", display: "異常考勤" },
	{ name: "workcalendar", display: "辦公行事曆" },
	// 會員中心
	{ name: "userinfo", display: "帳戶資訊" },
	{ name: "educationtraining", display: "教育訓練" },
	{ name: "mdworkspace", display: "MD 文稿工作區" },
	// Others
	{ name: "setting", display: "設定" },
	{ name: "punch", display: "打卡" },
	{ name: "maps", display: "地圖" },
	// Error
	{ name: "unauthorized", display: "訪問該頁面需要授權" },
	{ name: "forbidden", display: "禁止訪問該頁面" },
	{ name: "404", display: "未找到該頁面" },
	{ name: "internalservererror", display: "內部伺服器錯誤" },
];

const CustomBreadcrumbs = React.memo(() => {
	const location = useLocation();
	const pathnames = location.pathname.split("/").filter((x) => x);
	const [displayText, setDisplayText] = useState(null);

	useEffect(() => {
		let fullName = [];
		pathnames.map((name, index) => {
			const isLast = index === pathnames.length - 1;
			let decodedName = decodeURIComponent(name);
			if (decodedName.includes("+")) {
				decodedName = decodedName.split("+")[0];
			}

			const mappedItem = nameMappings.find((item) => item.name === decodedName);
			const displayText = mappedItem ? mappedItem.display : decodedName;
			fullName.push(displayText);

			if (isLast) setDisplayText(fullName);
		});

		const title = fullName.length > 0 ? fullName.join(" - ") + " | 元融科技" : "元融科技";
		document.title = title;
	}, [location]);

	return (
		<Breadcrumbs
			aria-label="breadcrumb"
			maxItems={3}
			className={`pt-2 sm:pt-3 pb-2 sm:pb-0 px-5 !text-sm ${pathnames.length > 0 ? "" : "!pt-0 !pb-0"}`}>
			{pathnames.length > 0 && (
				<Link component={NavLink} color="inherit" underline="hover" to="/">
					首頁
				</Link>
			)}
			{pathnames.map((name, index) => {
				const routeTo = `/${pathnames.slice(0, index + 1).join("/")}`;
				const isLast = index === pathnames.length - 1;

				return isLast ? (
					<Typography key={name} color="textPrimary" className="!text-sm">
						{!!displayText && displayText[index]}
					</Typography>
				) : (
					<Link key={name} component={NavLink} to={routeTo} color="inherit" underline="hover">
						{!!displayText && displayText[index]}
					</Link>
				);
			})}
		</Breadcrumbs>
	);
});

export default CustomBreadcrumbs;
