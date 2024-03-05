import React, { useEffect, useState, useMemo, useRef } from "react";
// FontAwesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRightToBracket, faArrowRightFromBracket } from "@fortawesome/free-solid-svg-icons";
// Leaflet
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
// MUI
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import AlarmOnIcon from "@mui/icons-material/AlarmOn";
import AlarmOffIcon from "@mui/icons-material/AlarmOff";
// Hooks
import useLocalStorageValue from "../../hooks/useLocalStorageValue";
// Utils
import { postData } from "../../utils/api";
// Customs
import profileIcon from "../../assets/icons/Profile.png";

// 預設座標
const COMPANYLOC = [23.069138196461633, 120.20386275455343];

// Marker
const LocationMarker = () => {
	const userProfile = useLocalStorageValue("userProfile");
	const [position, setPosition] = useState(null);
	const [location, setLocation] = useState(null);
	// 1: 沒打卡，2: 打卡成功，3: 失敗
	const [punchState, setPunchState] = useState(1);
	const [isLoading, setIsLoading] = useState(false);
	const [punchTime, setPunchTime] = useState("");
	const [punchIO, setPunchIO] = useState(null);
	const markerRef = useRef(null);
	// 是否應該更新位置
	const [shouldUpdateLocation, setShouldUpdateLocation] = useState(true);

	// 需要把 Marker 的 icon 弄出來，不然會顯示錯誤圖片
	let iconSize = 54;
	const customIcon = new L.Icon({
		iconUrl: userProfile ? (userProfile.pictureUrl ? userProfile.pictureUrl : profileIcon) : profileIcon, // 替換成你的圖示路徑
		iconSize: [iconSize, iconSize], // 圖示尺寸
		iconAnchor: [iconSize / 2, iconSize], // 圖示錨點
		popupAnchor: [0, -iconSize], // 彈出視窗位置
		className: "rounded-full bg-white !p-1 custom_Licon",
	});

	const map = useMapEvents({
		locationfound(e) {
			// 如果不應該更新位置，則直接傳回
			if (!shouldUpdateLocation) return;

			const newPosition = e.latlng;

			// 檢查位置是否有變化
			if (!position || newPosition.lat !== position.lat || newPosition.lng !== position.lng) {
				setPosition(newPosition);
				map.setView(newPosition, map.getZoom());

				// https://nominatim.org/
				const baseUrl = "https://nominatim.openstreetmap.org/reverse?format=json";
				const apiUrl = `${baseUrl}&lat=${e.latitude}&lon=${e.longitude}`;

				fetch(apiUrl)
					.then((response) => response.json())
					.then((data) => {
						const address = data.display_name;

						const reorderAddress = (apiResult) => {
							const addressArray = apiResult.split(", ").reverse();
							const reorderedAddressArray = addressArray.filter((part) => part !== "臺灣");
							const reorderedAddress = reorderedAddressArray.join("");

							return reorderedAddress;
						};
						const reorderedAddress = reorderAddress(address);

						setLocation(reorderedAddress);
					})
					.catch((error) => {
						console.error("Error:", "呼叫次數/頻率過高，導致呼叫已受到限制");
						console.error("Error:", error);
					});

				// 打開 Popup
				const marker = markerRef.current;
				if (marker) {
					marker.openPopup();
				}
			}
		},
	});

	useEffect(() => {
		map.locate({
			setView: false,
			watch: true, // 是否要一直監測使用者位置
			enableHighAccuracy: true, // 是否要高精準度的抓位置
			// timeout: 10000, // 觸發 locationerror 事件之前等待的毫秒數
		});

		// map.on("locationfound", (e) => {
		// });

		// map.on("locationerror", (e) => {
		// });
	}, [map]);

	// 提交打卡按鈕
	const handleSubmitPunch = async (e, direction) => {
		e.stopPropagation();
		setIsLoading(true);

		const fd = new FormData();
		fd.append("latitude", position.lat);
		fd.append("longitude", position.lng);
		fd.append("clockIn", direction);

		postData("clockPunch", fd).then((result) => {
			setIsLoading(false);
			setShouldUpdateLocation(false);
			if (result.status) {
				const data = result.result.result;
				setPunchState(2);

				const dateTime = data.occurredAt;
				setPunchTime(dateTime.replace("+08", "").split("T"));
				setPunchIO(data.clockIn ? "上班" : data.clockIn === false ? "下班" : "上/下班");
			} else {
				setPunchState(3);
			}
		});
	};

	// clockIn : true=上班；false=下班
	const handlePIButtonClick = (e) => {
		handleSubmitPunch(e, true);
	};
	const handlePOButtonClick = (e) => {
		handleSubmitPunch(e, false);
	};

	return position === null ? (
		<Marker position={COMPANYLOC} icon={customIcon}>
			<Popup open={true} closeButton={false} className="custom_punch_popup">
				<div className={`flex ${punchState === 1 ? "" : "hidden"}`}>
					<p className="!my-0 text-rose-400 font-bold text-lg !me-1">＊</p>
					<div className="inline-flex flex-col gap-2">
						<p className="!my-0 text-rose-400 font-bold text-lg">打卡需開啟定位服務！請確保您的定位功能已啟用。</p>
						<p className="!my-0 text-rose-400 font-bold text-lg">
							也有可能是手機定位系統獲取位置中，如此情況請稍後。
						</p>
						<p className="!my-0 text-rose-400 font-bold text-lg">
							若曾經拒絕開啟或提供定位功能，請至後台重新啟用定位。
						</p>
						<p className="!my-0 text-rose-400 font-bold text-base">如有不明，請聯繫人資部門尋求協助。謝謝！</p>
					</div>
				</div>
			</Popup>
		</Marker>
	) : (
		<Marker ref={markerRef} position={position} icon={customIcon}>
			<Popup open={true} closeButton={false} className="custom_punch_popup">
				<div>
					<h3 className="font-bold text-base sm:text-lg mb-2">地理位置</h3>
					<p className="!mt-0 text-neutral-400 text-sm !mb-1">
						{position.lat}, {position.lng}
					</p>
					<p className="!mt-0 text-neutral-400 text-sm !mb-1">{location}</p>
				</div>
				<div className="flex flex-col min-h-[200px]">
					<h3 className="font-bold text-base sm:text-lg mb-2">打卡</h3>
					<div className="flex items-center justify-center flex-1">
						{punchState === 1 ? (
							isLoading ? (
								<CircularProgress color="inherit" size={60} />
							) : (
								<div
									className="flex rounded w-full"
									style={{
										boxShadow:
											"0px 3px 1px -2px rgba(0,0,0,0.2), 0px 2px 2px 0px rgba(0,0,0,0.14), 0px 1px 5px 0px rgba(0,0,0,0.12)",
									}}>
									<Button
										variant="contained"
										className="!text-3xl tracking-widest flex-col gap-2 !p-3  brightness-95 hover:brightness-100"
										sx={{ borderRadius: "4px 0 0 4px", boxShadow: "none" }}
										fullWidth
										style={{ background: "rgb(108 194 209)" }}
										onClick={handlePIButtonClick}>
										<FontAwesomeIcon icon={faArrowRightToBracket} style={{ fontSize: "2.5rem" }} />
										<p className="text-3xl !m-0 whitespace-nowrap">上班</p>
									</Button>
									<Button
										variant="contained"
										className="!text-3xl tracking-widest flex-col gap-2 !p-3 brightness-95 hover:brightness-100"
										sx={{ borderRadius: "0px 4px 4px 0", boxShadow: "none" }}
										fullWidth
										style={{ background: "rgb(255 140 114)" }}
										onClick={handlePOButtonClick}>
										<FontAwesomeIcon icon={faArrowRightFromBracket} style={{ fontSize: "2.5rem" }} />
										<p className="text-3xl !m-0 whitespace-nowrap">下班</p>
									</Button>
								</div>
							)
						) : punchState === 2 ? (
							<div className="flex w-full">
								<AlarmOnIcon style={{ fontSize: "6rem" }} color={"success"} />
								<div className="inline-flex flex-col items-center justify-center flex-1 gap-2">
									<p className="!my-0 text-lg text-primary-500 font-bold">{punchIO}打卡成功！</p>
									<p className="!my-0 w-full text-sm text-left px-1.5">
										打卡日期：<span className="font-bold text-base">{punchTime[0]}</span>
									</p>
									<p className="!my-0 w-full text-sm text-left px-1.5">
										打卡時間：<span className="font-bold text-base">{punchTime[1]}</span>
									</p>
								</div>
							</div>
						) : (
							<div className="flex w-full">
								<AlarmOffIcon style={{ fontSize: "6rem" }} color={"error"} />
								<div className="inline-flex flex-col items-center justify-center flex-1 gap-2">
									<p className="!my-0 text-lg text-primary-500 font-bold">打卡出現錯誤！</p>
								</div>
							</div>
						)}
					</div>
					<div className={`flex ${punchState === 1 ? "" : "hidden"}`}>
						<p className="!my-0 text-rose-400 font-bold text-xs !me-1">＊</p>
						<p className="!my-0 text-rose-400 font-bold text-xs">
							請注意裝置系統差異或未啟用定位精確度，均可能導致當前位置偏差！
						</p>
					</div>
				</div>
			</Popup>
		</Marker>
	);
};

// Map
const Punch = () => {
	const locationMarker = useMemo(() => <LocationMarker />, []);

	useEffect(() => {
		const currentUrl = window.location.href; // 取得當前網址

		// 檢查網址中是否已經包含時間戳
		if (currentUrl.includes("timestamp=")) {
			// 如果已經包含，只需更新時間戳
			const updatedUrl = currentUrl.replace(/timestamp=\d+/, `timestamp=${new Date().getTime()}`);
			window.history.replaceState(null, null, updatedUrl);
		} else {
			// 如果沒有，添加新的時間戳
			const timestamp = new Date().getTime();
			const newUrl = `${currentUrl}${currentUrl.includes("?") ? "&" : "?"}timestamp=${timestamp}`;
			window.history.replaceState(null, null, newUrl);
		}
	}, []);

	return (
		<div className="absolute top-14 inset-0 lg:inset-0">
			<MapContainer
				center={COMPANYLOC}
				zoom={14}
				attributionControl={false}
				enableHighAccuracy={true}
				doubleClickZoom={false}
				className="h-full w-full">
				<TileLayer
					attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
					url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
				/>
				{locationMarker}
			</MapContainer>
		</div>
	);
};
export default Punch;
