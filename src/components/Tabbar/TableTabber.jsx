import React from "react";
import { useNavigate } from "react-router-dom";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";

const TableTabber = ({ tabGroup, cat, setCat, classnames = "", onTabChange }) => {
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
			style={{ color: "#273057" }}>
			{tabGroup.map((tab) => (
				<Tab key={tab.f} label={tab.text} value={tab.f} />
			))}
		</Tabs>
	);
};

export default TableTabber;
