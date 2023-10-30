import React from "react";
import { CircularProgress } from "@mui/material";

const Loading = ({ size = 80, classNames = "" }) => {
	return (
		<div className={`h-full flex flex-col justify-center items-center gap-5 ${classNames}`}>
			<CircularProgress color="inherit" size={size} />
			<p>載入中... </p>
		</div>
	);
};

export default Loading;
