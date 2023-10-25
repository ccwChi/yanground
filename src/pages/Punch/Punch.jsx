import React, { useEffect, useState } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import useLocalStorageValue from "../../hooks/useLocalStorageValue";
import "leaflet/dist/leaflet.css";
import { Button, LinearProgress, CircularProgress } from "@mui/material";
import { postData } from "../../utils/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarCheck } from "@fortawesome/free-solid-svg-icons";

const Map = () => {
	const [selectedLocation, setSelectedLocation] = useState(null);
	// 1: 沒打卡，2: 打卡成功，3: 失敗
	const [punchState, setPunchState] = useState(1);
	const [punchTime, setPunchTime] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const userProfile = useLocalStorageValue("userProfile");

	useEffect(() => {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition((position) => {
				const { latitude, longitude } = position.coords;
				setSelectedLocation({ lat: latitude, lng: longitude });
				// setUserProfile(JSON.parse(localStorage.getItem("userProfile")));
			});
		}
	}, [navigator.geolocation]);

	// 需要把 Marker 的 icon 弄出來，不然會顯示錯誤圖片
	const customIcon = L.icon({
		iconUrl: `${userProfile?.pictureUrl}.png`,
		iconSize: [48, 48],
		iconAnchor: [24, 24],
		popupAnchor: [0, -28],
		className: "rounded-full",
	});

	// 提交打卡按鈕
	const handleSubmitPunch = async () => {
		setIsLoading(true);

		const fd = new FormData();
		fd.append("latitude", selectedLocation?.lat.toFixed(6));
		fd.append("longitude", selectedLocation?.lng.toFixed(6));

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
		<div
			style={{
				position: "fixed",
				top: "55px",
				left: 0,
				zIndex: "1025",
				height: "100%",
				width: "100%",
			}}>
			{selectedLocation ? (
				<MapContainer
					center={selectedLocation}
					zoom={13}
					// scrollWheelZoom={false}
					dragging={false}
					style={{ height: "100%", width: "100%" }}>
					<TileLayer
						attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
						url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
					/>
					<Marker position={selectedLocation} icon={customIcon}>
						<Popup closeButton={false} open={true} className="w-64 h-48">
							{punchState === 1 ? (
								isLoading ? (
									<CircularProgress color="inherit" size={60} />
								) : (
									<Button
										variant="contained"
										className="!text-3xl tracking-widest flex-col gap-2 !p-3"
										onClick={(event) => {
											event.stopPropagation();
											handleSubmitPunch();
										}}
										fullWidth>
										<FontAwesomeIcon icon={faCalendarCheck} style={{ fontSize: "5.5rem" }} />
										<p className="text-3xl !m-0">立即打卡</p>
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
						</Popup>
					</Marker>
				</MapContainer>
			) : (
				<LinearProgress />
			)}
		</div>
	);
};
export default Map;

//生成地圖右下的定位座標按鈕
const UserPosition = ({ title, markerPosition, description }) => {
	const map = useMap();
	const helpDivRef = React.useRef(null);

	useEffect(() => {
		const createButtonControl = () => {
			const MapHelp = L.Control.extend({
				onAdd: () => {
					const helpDiv = L.DomUtil.create("div", "custom-button");
					helpDivRef.current = helpDiv;

					const iconDiv = document.createElement("div");
					iconDiv.className = "locationicon-container";
					helpDiv.appendChild(iconDiv);

					helpDiv.addEventListener("click", () => {
						map.setView(markerPosition, map.getZoom());
					});
					return helpDiv;
				},
			});
			return new MapHelp({ position: "bottomright" });
		};

		const control = createButtonControl();
		control.addTo(map);
		return () => {
			helpDivRef.current.remove();
		};
	}, [map, markerPosition, description]);
	return null;
};
