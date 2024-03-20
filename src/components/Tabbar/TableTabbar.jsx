import React from "react";
// MUI
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Skeleton from "@mui/material/Skeleton";
// Hooks
import useNavigateWithParams from "../../hooks/useNavigateWithParams";

const TableTabbar = ({
	tabGroup,
	cat,
	setCat,
	isLoading = false,
	classnames = "",
	onTabChange,
	dontnavigate = false,
	transparentBG = true,
	...otherProps
}) => {
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

	return !isLoading ? (
		<Tabs
			value={cat}
			onChange={handleChange}
			className={`${transparentBG ? "!bg-transparent" : "rounded-t-lg"} ${classnames} text-primary-800`}
			variant="scrollable"
			scrollButtons
			allowScrollButtonsMobile
			aria-label="scrollable auto tabs example"
			{...otherProps}>
			{tabGroup.map((tab) => (
				<Tab key={tab.f || tab.value} label={tab.text || tab.chinese} value={tab.f || tab} />
			))}
		</Tabs>
	) : (
		<div className="bg-white rounded-t-lg px-4">
			<Skeleton height={48} />
		</div>
	);
};

export default TableTabbar;
