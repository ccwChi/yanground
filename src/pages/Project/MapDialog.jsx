import React, { useEffect, useState, forwardRef, useRef, useMemo, useCallback } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import AppBar from "@mui/material/AppBar";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Slide from "@mui/material/Slide";
import Slider from "@mui/material/Slider";
import CloseIcon from "@mui/icons-material/Close";
import MapsIcon from "../../assets/icons/Map_pin_icon.png";
import { useFormContext } from "react-hook-form";

const Transition = forwardRef(function Transition(props, ref) {
	return <Slide direction="up" ref={ref} {...props} />;
});

const minRadius = 100;
const maxRadius = 1000;
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
// const circleConfig = [
// 	{ radius: 1000, fillColor: "#433e63" },
// 	{ radius: 950, fillColor: "#433e63" },
// 	{ radius: 900, fillColor: "#425e87" },
// 	{ radius: 850, fillColor: "#425e87" },
// 	{ radius: 800, fillColor: "#638bb7" },
// 	{ radius: 750, fillColor: "#638bb7" },
// 	{ radius: 700, fillColor: "#8793b7" },
// 	{ radius: 650, fillColor: "#8793b7" },
// 	{ radius: 600, fillColor: "#99a7b6" },
// 	{ radius: 550, fillColor: "#99a7b6" },
// 	{ radius: 500, fillColor: "#909dad" },
// 	{ radius: 450, fillColor: "#909dad" },
// 	{ radius: 400, fillColor: "#c0c4c3" },
// 	{ radius: 350, fillColor: "#c0c4c3" },
// 	{ radius: 300, fillColor: "#ece1e8" },
// 	{ radius: 250, fillColor: "#ece1e8" },
// 	{ radius: 200, fillColor: "#e5b1a2" },
// 	{ radius: 150, fillColor: "#e5b1a2" },
// 	{ radius: 100, fillColor: "#f7ceb9" },
// ];

const MapDialog = ({ open, handleClose, pos, r }) => {
	const { setValue } = useFormContext();
	const [position, setPosition] = useState({ lat: 0, lng: 0 });
	const [radius, setRadius] = useState(r);
	const markerRef = useRef(null);

	useEffect(() => {
		if (pos.lat === 0 && pos.lng === 0) {
			navigator.geolocation.getCurrentPosition((location) => {
				const { latitude, longitude } = location.coords;
				setPosition({ lat: latitude, lng: longitude });
			});
		} else {
			setPosition({ lat: pos.lat, lng: pos.lng });
		}
	}, [pos]);

	const eventHandlers = useMemo(
		() => ({
			dragend() {
				const marker = markerRef.current;
				if (marker != null) {
					setPosition(marker.getLatLng());
				}
			},
		}),
		[]
	);

	let iconSize = 64;
	const customIcon = new L.Icon({
		iconUrl: MapsIcon, // 替換成你的圖示路徑
		iconSize: [iconSize, iconSize], // 圖示尺寸
		iconAnchor: [iconSize / 2, iconSize], // 圖示錨點
		popupAnchor: [0, -iconSize], // 彈出視窗位置
	});

	const handleSave = () => {
		setValue("latitude", position.lat);
		setValue("longitude", position.lng);
		setValue("radius", radius);
		handleClose();
	};

	const onClose = () => {
		setPosition({ lat: pos.lat, lng: pos.lng });
		setRadius(r);
		handleClose();
	};

	const renderCircles = useCallback(() => {
		const filterCircleConfig = circleConfig.filter((config) => radius >= config.radius);
		const fccl = filterCircleConfig.length;
		return filterCircleConfig.map((config, index) => (
			<Circle
				key={index}
				center={position}
				pathOptions={{
					fillColor: config.fillColor,
					// fillOpacity: 0.5 - ((fccl - index) / fccl) * 0.05,
					fillOpacity: ((fccl - index) / fccl) * 0.27,
					color: "#95B07E",
					// color: "#959fad",
					weight: 1,
				}}
				radius={config.radius}
				stroke={index % 2 === 1 ? false : true}
			/>
		));
	}, [radius, position]);

	return (
		<Dialog fullScreen open={open} onClose={onClose} TransitionComponent={Transition}>
			<AppBar sx={{ position: "relative" }} color="dark">
				<Toolbar>
					<IconButton edge="start" color="inherit" onClick={onClose} aria-label="close">
						<CloseIcon />
					</IconButton>
					<Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
						選取案場範圍
					</Typography>
				</Toolbar>
			</AppBar>
			{position.lat !== 0 && position.lng !== 0 ? (
				<MapContainer
					center={position}
					zoom={15}
					style={{ height: "100vh", height: "100dvh" }}
					doubleClickZoom={false}
					attributionControl={false}>
					<TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
					<Marker
						position={position}
						attributionControl={false}
						draggable={true}
						eventHandlers={eventHandlers}
						ref={markerRef}
						icon={customIcon}>
						<Popup minWidth={90}>
							<div className="flex flex-col gap-2">
								<p className="!my-0 text-sm">當前座標：</p>
								<span>
									{position.lat}, {position.lng}
								</span>
								<p className="!my-0 text-sm">範圍半徑：</p>
								<Slider
									value={radius}
									min={minRadius}
									max={maxRadius}
									step={50}
									onChange={(event, newValue) => setRadius(newValue)}
									valueLabelDisplay="auto"
									valueLabelFormat={(value) => `${value} 公尺`}
								/>

								<Button variant="contained" color="success" className="!text-base !h-12" fullWidth onClick={handleSave}>
									確定
								</Button>
							</div>
						</Popup>
					</Marker>
					{renderCircles()}
				</MapContainer>
			) : null}
		</Dialog>
	);
};

export default MapDialog;
