import React, { useState } from "react";
import "leaflet/dist/leaflet.css";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import { postData } from "../../utils/api";
import style from "./explotion.module.scss";

const Explotion = () => {
	const [punchState, setPunchState] = useState(1);
	const [isLoading, setIsLoading] = useState(false);
	const [punchTime, setPunchTime] = useState("");
	const [punchIO, setPunchIO] = useState(null);

	const getRandomCoordinate = () => {
		const coordinates = [
			[23.0689293, 120.2037904],
			[23.0690215, 120.2037026],
			[23.0691163, 120.2038734],
			[23.0690171, 120.2039011],
		];

		// 計算四角形的邊界
		const minLatitude = Math.min(...coordinates.map((coord) => coord[0]));
		const maxLatitude = Math.max(...coordinates.map((coord) => coord[0]));
		const minLongitude = Math.min(...coordinates.map((coord) => coord[1]));
		const maxLongitude = Math.max(...coordinates.map((coord) => coord[1]));

		// 生成隨機的經緯度
		const randomLatitude = (minLatitude + Math.random() * (maxLatitude - minLatitude)).toFixed(7);
		const randomLongitude = (minLongitude + Math.random() * (maxLongitude - minLongitude)).toFixed(7);

		return {
			latitude: randomLatitude,
			longitude: randomLongitude,
		};
	};

	// 提交打卡按鈕
	const handleSubmitPunch = async (e, direction) => {
		e.stopPropagation();
		setIsLoading(true);

		const randomCoordinate = getRandomCoordinate();

		const fd = new FormData();
		fd.append("latitude", randomCoordinate.latitude);
		fd.append("longitude", randomCoordinate.longitude);
		fd.append("clockIn", direction);

		postData("clockPunch", fd).then((result) => {
			setIsLoading(false);
			if (result.status) {
				const data = result.result.result;
				setPunchState(2);

				const dateTime = data.occurredAt;
				setPunchTime(dateTime.replace("+08", "").split("T"));
				setPunchIO(data.clockIn ? "CLOCK IN" : data.clockIn === false ? "CLOCK OUT" : "IN/OUT");
			} else {
				setPunchState(3);
			}
		});
	};

	const handlePIButtonClick = (e) => {
		handleSubmitPunch(e, true);
	};
	const handlePOButtonClick = (e) => {
		handleSubmitPunch(e, false);
	};

	return (
		<div className="absolute inset-0 flex flex-col justify-center items-center bg-[#1d1e22]">
			{punchState === 1 ? (
				isLoading ? (
					<CircularProgress color="inherit" size={60} />
				) : (
					<div className="flex items-center justify-center flex-wrap">
						<button onClick={handlePIButtonClick} className={`${style.neon_button} ${style.neon_button__1}`}>
							PLAY
						</button>
						<button onClick={handlePOButtonClick} className={`${style.neon_button} ${style.neon_button__2}`}>
							EXIT
						</button>
					</div>
				)
			) : punchState === 2 ? (
				<>
					<p className="text-white text-2xl font-bold tracking-wide !mt-0 !mb-1">{punchIO} SUCCESS！</p>
					{punchTime.map((time, index) => (
						<React.Fragment key={index}>
							<p className="text-white text-lg font-bold tracking-wide leading-tight !my-0">{time}</p>
						</React.Fragment>
					))}
				</>
			) : (
				<p variant="contained">出現錯誤</p>
			)}
		</div>
	);
};
export default Explotion;
