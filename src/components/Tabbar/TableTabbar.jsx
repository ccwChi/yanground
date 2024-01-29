import React from "react";
// MUI
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
// Hooks
import useNavigateWithParams from "../../hooks/useNavigateWithParams";

const TableTabbar = ({ tabGroup, cat, setCat, classnames = "", onTabChange, dontnavigate = false, ...otherProps }) => {
	const navigateWithParams = useNavigateWithParams();

	const handleChange = (event, newValue) => {
		setCat(newValue);
		if (!dontnavigate) {
			navigateWithParams(0, 0, { cat: newValue }, false);
		}

		if (onTabChange) {
			onTabChange(newValue);
		}
	};

	return (
		<Tabs
			value={cat}
			onChange={handleChange}
			className={`!bg-transparent ${classnames} text-primary-800`}
			variant="scrollable"
			scrollButtons
			allowScrollButtonsMobile
			aria-label="scrollable auto tabs example"
			{...otherProps}>
			{tabGroup.map((tab) => (
				<Tab key={tab.f} label={tab.text} value={tab.f} />
			))}
		</Tabs>
	);
};

export default TableTabbar;
