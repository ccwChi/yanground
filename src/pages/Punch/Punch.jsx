import React, { useEffect, useState } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Button, LinearProgress, CircularProgress } from "@mui/material";
import liff from "@line/liff";
import { postData } from "../../utils/api";

const LINE_ID = process.env.REACT_APP_LINEID;

const Map = () => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [punchState, setPunchState] = useState(1); //1為沒打卡，2打卡成功，3失敗
  const [punchTime, setPunchTime] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const initLine = () => {
    liff.init(
      { liffId: LINE_ID },
      () => {
        if (liff.isLoggedIn()) {
          runApp();
        } else {
          liff.login();
        }
      },
      (err) => console.error(err)
    );
  };

  useEffect(() => {
    initLine();
  }, []);

  const runApp = () => {
    const accessToken = liff.getAccessToken();
    if (accessToken) {
      //console.log(accessToken);
      localStorage.setItem("accessToken", JSON.stringify(accessToken));
    }
    liff.getProfile().then((profile) => {
      if (profile) {
        setUserProfile(profile);
      }
    });
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        setSelectedLocation({ lat: latitude, lng: longitude });
        //setUserProfile(JSON.parse(localStorage.getItem("userProfile")));
      });
    }
  }, [navigator.geolocation]);

  //需要把Marker的icon弄出來，不然會顯示錯誤圖片
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

    const params = {
      latitude: selectedLocation?.lat.toFixed(6),
      longitude: selectedLocation?.lng.toFixed(6),
    };
    const queryParams = Object.keys(params)
      .map((key) => `${key}=${encodeURIComponent(params[key])}`)
      .join("&");

    // clockPunch / `${queryParams}`;
    postData(`clockPunch?${queryParams}`).then((response) => {
      if (response.result.response === 200) {
        setPunchState(2);
        setPunchTime(response.result.result.occurred )
        setIsLoading(false);
      } else {
        setPunchState(3);
        console.log(response);
        setIsLoading(false);
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
      }}
    >
      {selectedLocation ? (
        <MapContainer
          center={selectedLocation}
          zoom={13}
          // scrollWheelZoom={false}
          dragging={false}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={selectedLocation} icon={customIcon}>
            <Popup closeButton={false} open={true}>
              {punchState === 1 ? (
                <Button
                  variant="contained"
                  sx={{ width: "120px", margin: "-5px" }}
									className=""
                  onClick={() => {
                    handleSubmitPunch();
                  }}
                >
                  {isLoading ? <CircularProgress color="inherit" /> : "打卡"}
                </Button>
              ) : (
                <p
                  variant="contained"
                  sx={{ width: "120px", margin: "-5px" }}
                >
                  {punchState === 2 ? punchTime : "出現錯誤"}
                </p>
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

// import React from "react";

// const Punch = () => {
// 	return (
// 		<>
// 			<h3 className="text-3xl font-bold underline">Punch</h3>
// 		</>
// 	);
// };

// export default Punch;
