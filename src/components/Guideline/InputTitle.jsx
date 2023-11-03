import React from "react";

const InputTitle = ({ title, required = true, pb = true, classnames = "", children }) => {
	return (
		<p className={`${pb && "pb-2"} text-sm sm:text-base ${classnames}`}>
			{title}
			{required && <span className="ms-1 text-primary-100 text-xs sm:text-sm">(必填)</span>}：{children}
		</p>
	);
};

export default InputTitle;
