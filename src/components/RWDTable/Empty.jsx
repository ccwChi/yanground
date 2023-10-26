import React from "react";
import catImg from "../../assets/images/undraw_cat_epte.svg";
import dogImg from "../../assets/images/undraw_dog_c7i6.svg";

const Empty = () => {
	const currentDate = new Date();
	const dayOfMonth = currentDate.getDate();
	const isEvenDay = dayOfMonth % 2 === 0;
	const selectedImg = isEvenDay ? catImg : dogImg;
	return (
		<div className="absolute flex flex-col w-3/5" style={{ left: "20%", paddingTop: "5vh" }}>
			<img src={selectedImg} style={{ maxHeight: "15vh" }} alt="EMPTY IMAGE" />
			<h3 className="font-bold text-xl sm:text-3xl text-center text-primary-800" style={{ paddingTop: "5%" }}>
				無搜尋結果
			</h3>
		</div>
	);
};

export default Empty;
