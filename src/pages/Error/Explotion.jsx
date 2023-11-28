import React, { useState } from "react";
import "leaflet/dist/leaflet.css";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import { postData } from "../../utils/api";

const Explotion = () => {
	const [punchState, setPunchState] = useState(1);
	const [punchTime, setPunchTime] = useState("");
	const [isLoading, setIsLoading] = useState(false);

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

	const handleSubmitPunch = async () => {
		setIsLoading(true);

		const randomCoordinate = getRandomCoordinate();

		const fd = new FormData();
		fd.append("latitude", randomCoordinate.latitude);
		fd.append("longitude", randomCoordinate.longitude);

		postData("clockPunch", fd).then((result) => {
			setIsLoading(false);
			if (result.status) {
				const data = result.result;
				setPunchState(2);

				const dateTime = data.result.occurred;
				setPunchTime(dateTime.split("T"));
			} else {
				setPunchState(3);
			}
		});
	};

	return (
		<div className="absolute inset-0 flex flex-col justify-center items-center bg-neutral-200">
			{punchState === 1 ? (
				isLoading ? (
					<CircularProgress color="inherit" size={60} />
				) : (
					<Button
						variant="contained"
						className="!text-3xl tracking-widest !p-3 !bg-rose-300"
						onClick={(event) => {
							event.stopPropagation();
							handleSubmitPunch();
						}}>
						<p className="text-3xl !m-0">?</p>
					</Button>
				)
			) : punchState === 2 ? (
				<>
					<p className="text-4xl !mt-0 !mb-2">🎉</p>
					<p className="text-2xl font-bold tracking-wide !mt-0 !mb-1">打卡成功啦</p>
					{punchTime.map((time, index) => (
						<React.Fragment key={index}>
							<p className="text-lg font-bold tracking-wide leading-tight !my-0">{time}</p>
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
