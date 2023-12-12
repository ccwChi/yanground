import React from "react";
import SpeedDial from "@mui/material/SpeedDial";
import SpeedDialIcon from "@mui/material/SpeedDialIcon";
import SpeedDialAction from "@mui/material/SpeedDialAction";

import AddIcon from "@mui/icons-material/Add";

const MultipleFAB = ({ btnGroup, handleActionClick }) => {
	return (
		<SpeedDial
			ariaLabel="FAB templete"
			className="sm:!hidden !flex"
			sx={{ position: "absolute", bottom: 6 * 16, right: 16, zIndex: 1024 }}
			// icon={<AddIcon fontSize="large"  />}
			icon={<SpeedDialIcon icon={<AddIcon fontSize="large" />} sx={{ height: "auto" }} />}
			FabProps={{
				sx: {
					bgcolor: "success.main",
					"&:hover": {
						bgcolor: "success.main",
					},
				},
			}}>
			{btnGroup.map((btn) => (
				<SpeedDialAction
					key={btn.text}
					icon={btn.fab}
					aria-label={btn.text}
					tooltipTitle={btn.text}
					tooltipOpen
					onClick={handleActionClick}
					data-mode={btn.mode}
					sx={{ "& > span": { whiteSpace: "nowrap" } }}
				/>
			))}
		</SpeedDial>
	);
};

export default MultipleFAB;
