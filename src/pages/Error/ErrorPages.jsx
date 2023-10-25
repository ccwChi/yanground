import React from "react";
import errorimg from "../../assets/images/404.svg";

// 404
const ErrorPages = () => {
	return (
		<div className="flex flex-col items-center" style={{ paddingTop: "16%" }}>
			<img src={errorimg} className="max-w-sm mx-6" />
			<h3 className="font-bold px-4" style={{ fontSize: "clamp(3.25rem, 10vw, 6.25rem)" }}>404 Errors</h3>
		</div>
	);
};

export default ErrorPages;
