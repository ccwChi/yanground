import React from "react";

const InputTitle = ({ title, required = true, pb = true, children }) => {
	return (
		<p className={`${pb && "pb-2"} text-sm sm:text-base`}>
			{title}
			{required && <span className="ms-1 text-primary-100 text-xs sm:text-sm">(必填)</span>}：{children}
		</p>
	);
};

export default InputTitle;
