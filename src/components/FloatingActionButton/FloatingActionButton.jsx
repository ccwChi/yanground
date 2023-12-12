import React from "react";
import Fab from "@mui/material/Fab";

const FloatingActionButton = ({ btnGroup, handleActionClick }) => {
	return (
		<div className="absolute right-4 bottom-24 sm:hidden flex flex-col-reverse gap-3">
			{btnGroup.map((btn) => (
				<Fab
					key={btn.text}
					color={btn.fabVariant}
					title={btn.text}
					aria-label={btn.text}
					data-mode={btn.mode}
					onClick={handleActionClick}
					sx={{ zIndex: 1024 }}>
					{btn.fab}
				</Fab>
			))}
		</div>
	);
};

export default FloatingActionButton;
