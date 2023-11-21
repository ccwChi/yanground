import React, { useEffect, useState } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import useLocalStorageValue from "../../hooks/useLocalStorageValue";
import "leaflet/dist/leaflet.css";
import Button from "@mui/material/Button";
import LinearProgress from "@mui/material/LinearProgress";
import CircularProgress from "@mui/material/CircularProgress";
import { postData } from "../../utils/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarCheck } from "@fortawesome/free-solid-svg-icons";

const Explotion = () => {
	// 1: 沒打卡，2: 打卡成功，3: 失敗
	const [punchState, setPunchState] = useState(1);
	const [punchTime, setPunchTime] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	// 提交打卡按鈕
	const handleSubmitPunch = async () => {
		setIsLoading(true);

		const fd = new FormData();
		fd.append("latitude", 23.068665);
		fd.append("longitude", 120.203772);

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
