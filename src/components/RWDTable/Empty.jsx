import React from "react";
import catImg from "../../assets/images/undraw_cat_epte.svg";
import dogImg from "../../assets/images/undraw_dog_c7i6.svg";

const Empty = () => {
	const currentDate = new Date();
	const dayOfMonth = currentDate.getDate();
	const isEvenDay = dayOfMonth % 2 === 0;
	const selectedImg = isEvenDay ? catImg : dogImg;
	return (
		<div className="absolute w-3/5 pt-12" style={{ left: "20%" }}>
			<img src={selectedImg} alt="EMPTY IMAGE" />
			<h3 className="pt-8 font-bold text-4xl text-center text-primary-800">無搜尋結果</h3>
		</div>
	);
};

export default Empty;
