import React from "react";
import emptyImg from "../../../../assets/images/emptyCatSleep.png";

const WorkOvertime = React.memo(({}) => {
	return (
		<div className="flex flex-col items-center justify-center gap-2 pt-[15%] pb-[15%]">
			<img src={emptyImg} alt="catimage" className="w-2/5 max-w-sm min-w-[10rem]" />
			<p className="h5">「加班」畫面施工中 Zzz ...</p>
		</div>
	);
});

export default WorkOvertime;
