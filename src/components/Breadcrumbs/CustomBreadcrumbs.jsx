import React from "react";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { NavLink, useLocation } from "react-router-dom";

const CustomBreadcrumbs = () => {
	const location = useLocation();
	const pathnames = location.pathname.split("/").filter((x) => x);

	const nameMappings = [
		{ name: "userinfo", display: "帳戶資訊" },
		{ name: "sites", display: "案場" },
		{ name: "constructionTypes", display: "工程類別" },
		{ name: "constructionsummary", display: "施工清單" },
		{ name: "users", display: "人事管理" },
		{ name: "dispatchList", display: "派工清單" },
		{ name: "project", display: "專案管理" },
		{ name: "setting", display: "設定" },
		{ name: "punch", display: "打卡" },
		{ name: "maps", display: "地圖" },
		{ name: "dispatchcalendar", display: "派工行事曆" },
		{ name: "attendance_calendar", display: "打卡與考勤" },
	];

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
				let decodedName = decodeURIComponent(name);
				if (decodedName.includes("+")) {
					decodedName = decodedName.split("+")[0];
				}

				const mappedItem = nameMappings.find((item) => item.name === decodedName);
				const displayText = mappedItem ? mappedItem.display : decodedName;

				return isLast ? (
					<Typography key={name} color="textPrimary" className="!text-sm">
						{displayText}
					</Typography>
				) : (
					<Link key={name} component={NavLink} to={routeTo} color="inherit" underline="hover">
						{displayText}
					</Link>
				);
			})}
		</Breadcrumbs>
	);
};

export default CustomBreadcrumbs;
