import React, { useState } from "react";
import { Tabs, Tab } from "@mui/material";

const TableTabber = ({ tabGroup, setCat }) => {
	const [value, setValue] = useState(0);

	const handleChange = (event, newValue) => {
		setValue(newValue);
		setCat(tabGroup[newValue].f);
	};

	return (
		<Tabs
			value={value}
			onChange={handleChange}
			variant="scrollable"
			scrollButtons
			allowScrollButtonsMobile
			aria-label="scrollable auto tabs example"
			style={{ color: "#273057", borderBottom: "2px solid #E6E6E6" }}>
			{tabGroup.map((tab) => (
				<Tab key={tab.f} label={tab.text} />
			))}
		</Tabs>
	);
};

export default TableTabber;
