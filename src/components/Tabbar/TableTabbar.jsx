import React from "react";
import { useNavigate } from "react-router-dom";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";

const TableTabbar = ({ tabGroup, cat, setCat, classnames = "", onTabChange }) => {
	const navigate = useNavigate();

	const handleChange = (event, newValue) => {
		setCat(newValue);
		navigate(`?cat=${newValue}`);

		if (onTabChange) {
			onTabChange(newValue);
		}
	};

	return (
		<Tabs
			value={cat}
			onChange={handleChange}
			className={`!bg-transparent ${classnames}`}
			variant="scrollable"
			scrollButtons
			allowScrollButtonsMobile
			aria-label="scrollable auto tabs example"
			sx={{
				color: "#273057",
				"& .MuiTabs-scroller": {
					borderRadius: "0.5rem",
					background: "white",
					boxShadow: "0 5px 10px rgba(0, 0, 0, 0.1)",
				},
			}}>
			{tabGroup.map((tab) => (
				<Tab key={tab.f} label={tab.text} value={tab.f} />
			))}
		</Tabs>
	);
};

export default TableTabbar;
