import React, { useState, useEffect } from "react";

// Components
import { Loading } from "../Loader/Loading";

// Others
import noImgAvailable from "../../assets/images/noImgAvailable.jpg";

/**
 * 處理 image onload 與 onerror 問題
 * @param {string} classnames - 擴充 classname
 * @returns
 */
const LazyImage = ({ classnames, ...otherProps }) => {
	const [loading, setLoading] = useState(true);

	return (
		<>
			<img
				onError={({ currentTarget }) => {
					currentTarget.onerror = null; // prevents looping
					currentTarget.src = noImgAvailable;
				}}
				onLoad={() => {
					setLoading(false);
				}}
				className={classnames}
				{...otherProps}
			/>
			{loading && (
				<div style={{ backgroundColor: "rgb(115 115 115 / 70%)" }} className={`absolute ${classnames}`}>
					<Loading classNames="text-white" />
				</div>
			)}
		</>
	);
};

export default LazyImage;
