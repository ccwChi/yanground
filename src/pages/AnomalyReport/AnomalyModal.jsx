import React, { useState } from "react";
// Leaflet
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import MapsIcon from "../../assets/icons/Map_pin_icon.png";
// MUI
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
// Component
import ModalTemplete from "../../components/Modal/ModalTemplete";

// 打卡 tabbar 對應清單
const punchInOutButtons = [
  { value: "clockPunchIn", label: "上班打卡" },
  { value: "clockPunchOut", label: "下班打卡" },
];

/***
 * 打卡地點 Modal
 * @param {string} title - Modal 標題名稱
 * @param {Object} deliverInfo - 顯示資訊
 * @param {Function} onClose - 關閉函式
 * @returns
 ***/
const PunchLocationModal = React.memo(({ title, deliverInfo, onClose }) => {
  // 打卡資訊
  const [punchLog, setPunchLog] = useState(
    deliverInfo[punchInOutButtons[0].value]
  );
  // Tab 選擇 (active 概念)
  const [alignment, setAlignment] = useState(punchInOutButtons[0].value);

  // Tab 切換
  const handleChange = (event, newAlignment) => {
    if (newAlignment !== null) {
      setAlignment(newAlignment);
      setPunchLog(deliverInfo[newAlignment]);
    }
  };

  // Leaflet 地圖設置指標
  let iconSize = 64;
  const customIcon = new L.Icon({
    iconUrl: MapsIcon, // 替換成你的圖示路徑
    iconSize: [iconSize, iconSize], // 圖示尺寸
    iconAnchor: [iconSize / 2, iconSize], // 圖示錨點
    popupAnchor: [0, -iconSize], // 彈出視窗位置
  });

  return (
    <>
      {/* Modal */}
      <ModalTemplete
        title={title}
        show={true}
        maxWidth={"768px"}
        onClose={onClose}
      >
        <div className="mt-3">
          <div className="flex sm:flex-row flex-col gap-2 text-sm sm:text-base pb-2">
            <p className="w-full">
              姓名：
              <span className="font-bold">{deliverInfo.user.fullName}</span>
            </p>
            <p className="w-full">
              部門：
              <span className="font-bold">{deliverInfo.user.department}</span>
            </p>
          </div>
          <div className="flex sm:flex-row flex-col gap-2 text-sm sm:text-base">
            <p className="w-full">
              打卡時間：
              <span className="font-bold">
                {/* {deliverInfo.date} {deliverInfo.since} */}
                {punchLog?.occurredAt
                  ? punchLog.occurredAt.split(/[T+]/).slice(0, 2).join(" ")
                  : "-"}
              </span>
            </p>
            <p className="w-full">
              打卡狀態：
              <span className="font-bold">{deliverInfo.anomalyState.text}</span>
            </p>
          </div>
          {/* 切換顯示按鈕 Tabbar - Start */}
          <ToggleButtonGroup
            color="primary"
            value={alignment}
            exclusive
            onChange={handleChange}
            aria-label="Punch in/out Button Group"
            className="my-3"
            fullWidth
          >
            {punchInOutButtons.map((button) => (
              <ToggleButton
                key={button.value}
                value={button.value}
                style={{
                  backgroundColor:
                    alignment === button.value ? "#547DB7" : undefined,
                  color: alignment === button.value ? "white" : undefined,
                }}
              >
                {button.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
          {/* 切換顯示按鈕 Tabbar - End */}

          {/* 地圖 - Start */}
          <div className="relative w-full h-80">
            {punchLog ? (
              <MapContainer
                center={[punchLog.latitude, punchLog.longitude]}
                zoom={15}
                attributionControl={false}
                className="absolute inset-0"
                doubleClickZoom={false}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker
                  position={[punchLog.latitude, punchLog.longitude]}
                  icon={customIcon}
                >
                  <Popup minWidth={90}>
                    <div className="flex flex-col items-center gap-2">
                      <p className="!my-0 w-full text-sm text-left px-1.5">
                        打卡日期：
                        <span className="font-bold text-base">
                          {punchLog.occurredAt.replace("+08", "").split("T")[0]}
                        </span>
                      </p>
                      <p className="!my-0 w-full text-sm text-left px-1.5">
                        打卡時間：
                        <span className="font-bold text-base">
                          {punchLog.occurredAt.replace("+08", "").split("T")[1]}
                        </span>
                      </p>
                      <p className="!my-0 w-full text-sm text-left px-1.5">
                        緯度座標：
                        <span className="font-bold text-base">
                          {punchLog.latitude}
                        </span>
                      </p>
                      <p className="!my-0 w-full text-sm text-left px-1.5">
                        經度座標：
                        <span className="font-bold text-base">
                          {punchLog.longitude}
                        </span>
                      </p>
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-200">
                <span className="italic text-neutral-500 text-sm sm:text-base">
                  (無下班打卡紀錄)
                </span>
              </div>
            )}
          </div>
          {/* 地圖 - End */}
        </div>
      </ModalTemplete>
    </>
  );
});

export { PunchLocationModal };
