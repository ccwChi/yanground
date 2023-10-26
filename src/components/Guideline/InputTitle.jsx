import React from "react";

const InputTitle = ({ title, required = true }) => {
	return (
		<p className="pb-2 text-sm sm:text-base">
			{title}
			{required && <span className="ms-1 text-primary-100 text-xs sm:text-sm">(必填)</span>}：
		</p>
	);
};

export default InputTitle;
