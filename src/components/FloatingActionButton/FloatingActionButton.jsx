import React from "react";
import Fab from "@mui/material/Fab";

const FloatingActionButton = ({ btnGroup }) => {
	return (
		<div className="absolute right-4 bottom-28 sm:hidden flex flex-col-reverse gap-3">
			{btnGroup.map((btn) => (
				<Fab
					key={btn.text}
					color={btn.fabVariant}
					title={btn.text}
					aria-label={btn.text}
					onClick={btn.onClick}
					sx={{ zIndex: 1024 }}>
					{btn.fab}
				</Fab>
			))}
		</div>
	);
};

export default FloatingActionButton;
