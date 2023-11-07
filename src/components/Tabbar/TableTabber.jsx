import React, { useState } from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";

const TableTabber = ({ tabGroup, setCat, classnames = "", onTabChange }) => {
	const [value, setValue] = useState(0);

	const handleChange = (event, newValue) => {
		setValue(newValue);
		setCat(tabGroup[newValue].f);

		if (onTabChange) {
			onTabChange(newValue);
		}
	};

	return (
		<Tabs
			value={value}
			onChange={handleChange}
			className={classnames}
			variant="scrollable"
			scrollButtons
			allowScrollButtonsMobile
			aria-label="scrollable auto tabs example"
			style={{ color: "#273057" }}>
			{tabGroup.map((tab) => (
				<Tab key={tab.f} label={tab.text} />
			))}
		</Tabs>
	);
};

export default TableTabber;
