import React, { useEffect, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import MapsIcon from "../../assets/icons/Map_pin_icon.png";
import { getData } from "../../utils/api";

const circleConfig = [
	{ radius: 1000, fillColor: "#6299B6" },
	{ radius: 950, fillColor: "#6299B6" },
	{ radius: 900, fillColor: "#6DB7C0" },
	{ radius: 850, fillColor: "#6DB7C0" },
	{ radius: 800, fillColor: "#7AC6BA" },
	{ radius: 750, fillColor: "#7AC6BA" },
	{ radius: 700, fillColor: "#85CCAF" },
	{ radius: 650, fillColor: "#85CCAF" },
	{ radius: 600, fillColor: "#91D7A5" },
	{ radius: 550, fillColor: "#91D7A5" },
	{ radius: 500, fillColor: "#A0DEA2" },
	{ radius: 450, fillColor: "#A0DEA2" },
	{ radius: 400, fillColor: "#B9E5AC" },
	{ radius: 350, fillColor: "#B9E5AC" },
	{ radius: 300, fillColor: "#D2EEBE" },
	{ radius: 250, fillColor: "#D2EEBE" },
	{ radius: 200, fillColor: "#ECF6D1" },
	{ radius: 150, fillColor: "#ECF6D1" },
	{ radius: 100, fillColor: "#F7F8E6" },
];

const Maps = () => {
	// 座標位置
	const [position, setPosition] = useState({ lat: 0, lng: 0 });
	// 半徑範圍
	const [radius, setRadius] = useState(0);
	// 取得 id 參數
	const location = useLocation();
	const queryParams = new URLSearchParams(location.search);

	useEffect(() => {
		if (queryParams.has("id")) {
			const id_ = queryParams.get("id");
			getData(`project/${id_}`).then((result) => {
				const data = result.result;
				setPosition({ lat: data.latitude, lng: data.longitude });
				setRadius(data.radius);
			});
		} else {
			navigator.geolocation.getCurrentPosition((location) => {
				const { latitude, longitude } = location.coords;
				setPosition({ lat: latitude, lng: longitude });
			});
		}
	}, []);

	let iconSize = 64;
	const customIcon = new L.Icon({
		iconUrl: MapsIcon, // 替換成你的圖示路徑
		iconSize: [iconSize, iconSize], // 圖示尺寸
		iconAnchor: [iconSize / 2, iconSize], // 圖示錨點
		popupAnchor: [0, -iconSize], // 彈出視窗位置
	});

	const renderCircles = useCallback(() => {
		const filterCircleConfig = circleConfig.filter((config) => radius >= config.radius);
		const fccl = filterCircleConfig.length;
		return filterCircleConfig.map((config, index) => (
			<Circle
				key={index}
				center={position}
				pathOptions={{
					fillColor: config.fillColor,
					fillOpacity: ((fccl - index) / fccl) * 0.27,
					color: "#95B07E",
					weight: 1,
				}}
				radius={config.radius}
				stroke={index % 2 === 1 ? false : true}
			/>
		));
	}, [radius, position]);

	return position.lat !== 0 && position.lng !== 0 ? (
		<MapContainer center={position} zoom={15} className="absolute top-14 inset-0 lg:inset-0" doubleClickZoom={false}>
			<TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
			<Marker position={position} icon={customIcon}>
				<Popup minWidth={90}>
					<div className="flex flex-col items-center gap-2">
						<p className="!my-0 text-sm">座標</p>
						<span>
							{position.lat}, {position.lng}
						</span>
						<p className="!my-0 text-sm">範圍半徑</p>
						<span>{radius} 公尺</span>
					</div>
				</Popup>
			</Marker>
			{renderCircles()}
		</MapContainer>
	) : null;
};

export default Maps;
