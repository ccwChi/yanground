import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import style from "./Tabbar.module.scss";
import PunchClockIcon from "@mui/icons-material/PunchClock";
import HomeIcon from "@mui/icons-material/Home";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";

const Tabbar = () => {
	const location = useLocation();

	const navItems = [
		// color deg: 68(綠), 155(藍), 200(紫), 290(粉), 345(橘)
		{ id: 0, text: "打卡", href: "/punch", icon: <PunchClockIcon fontSize="large" />, hotRotate: "68deg" },
		{ id: 1, text: "首頁", href: "/", icon: <HomeIcon fontSize="large" />, hotRotate: "345deg" },
		{ id: 2, text: "個人資料", href: "/userinfo", icon: <ManageAccountsIcon fontSize="large" />, hotRotate: "290deg" },
	];

	const getKid = () => {
		let path = "/" + location.pathname.split("/")[1];
		const foundItem = navItems.find((item) => item.href === path);
		const foundId = foundItem ? foundItem.id : navItems.length;
		return foundId;
	};

	const shouldSetHeight = (navItems) => {
		return navItems.every((item) => item.id !== getKid());
	};

	return (
		<>
			<nav className={style.nav_wrapper} style={{ "--n": navItems.length, "--k": getKid() }}>
				{navItems.map((item) => (
					<NavLink
						key={item.id}
						className={`tabbar_item ${style.nav_item} ${shouldSetHeight(navItems) ? "h-[4.75rem]" : ""} transition-[height]`}
						to={item.href}
						data-loc={item.id === getKid()}
						data-ico={item.emoji}
						style={{ "--hr": item.hotRotate }}>
						{item.icon}
						{item.text}
					</NavLink>
				))}
			</nav>
		</>
	);
};

export default Tabbar;
