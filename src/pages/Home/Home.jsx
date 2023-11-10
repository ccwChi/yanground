import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import useLocalStorageValue from "../../hooks/useLocalStorageValue";
import Avatar from "@mui/material/Avatar";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import BadgeIcon from "@mui/icons-material/Badge";
import GroupsIcon from "@mui/icons-material/Groups";
import PunchClockIcon from "@mui/icons-material/PunchClock";
import { getData } from "../../utils/api";
import "./home.scss";

const Home = () => {
	const [countNum, setCountNum] = useState({ staffNum: '-', depNum: '-' });
	const userProfile = useLocalStorageValue("userProfile");

	// useEffect(() => {
	// 	let staffNum, depNum;
	// 	Promise.all([getData("user?p=1&s=1"), getData("department")])
	// 		.then(([userResult, departmentResult]) => {
	// 			staffNum = userResult.result.totalElements;
	// 			depNum = departmentResult.result.totalElements;
	// 			setCountNum({ staffNum, depNum });
	// 		})
	// 		.catch((error) => {
	// 			console.error("API Error:", error);
	// 		});
	// }, []);

	return (
		<div className="home_wrapper flex flex-col flex-1">
			<div className="header bg-secondary-50">
				<div className="header-background-elements">
					<div className="header-circle circle-left"></div>
					<div className="header-circle circle-right"></div>

					<div className="dashed-shapes">
						<div className="dashed-shape shape-1"></div>
						<div className="dashed-shape shape-2"></div>
						<div className="dashed-shape shape-3"></div>
					</div>

					<div className="clouds">
						<div className="cloud-circle circle-1"></div>
						<div className="cloud-circle circle-2"></div>
						<div className="cloud-circle circle-3"></div>
						<div className="cloud-circle circle-4"></div>
						<div className="cloud-circle circle-5"></div>
						<div className="cloud-circle circle-6"></div>
						<div className="cloud-circle circle-7"></div>
						<div className="cloud-circle circle-8"></div>
						<div className="cloud-circle circle-9"></div>
						<div className="cloud-circle circle-10"></div>
						<div className="cloud-circle circle-11"></div>
						<div className="cloud-circle circle-12"></div>
						<div className="cloud-circle circle-13"></div>
						<div className="cloud-circle circle-14"></div>
						<div className="cloud-circle circle-15"></div>
					</div>
				</div>

				<div className="header-user-info">
					<div className="user-picture">
						<Avatar
							alt={userProfile?.displayName}
							src={userProfile?.pictureUrl}
							sx={{ width: 80, height: 80, bgcolor: "#547db7" }}
						/>
					</div>
					<div className="user-name">
						<h5 className="h5">{userProfile ? `歡迎！ ${userProfile.nickname}` : "載入中..."}</h5>
					</div>
				</div>
			</div>

			<div className="profile-section flex-1 -mb-7 sm:-mb-4 w-full px-2.5 py-3.5">
				{/* <div className="panel panel-wallet">
					<div className="left bg-secondary-50 text-white">
						<div>
							<BadgeIcon />
						</div>
						<div>目前成員數量</div>
						<div>
							<NavLink to="/users" className="text-white">
								<strong className="text-2xl">{countNum.staffNum}</strong>
								<ArrowForwardIcon />
							</NavLink>
						</div>
					</div>

					<div className="right bg-quaternary-50 text-white">
						<div>
							<GroupsIcon />
						</div>
						<div>部門數量</div>
						<div>
							<NavLink to="/department" className="text-white">
								<strong className="text-2xl">{countNum.depNum}</strong>
								<ArrowForwardIcon />
							</NavLink>
						</div>
					</div>
				</div> */}

				<NavLink to="/userinfo" className="panel bg-white flex !rounded-3xl">
					<div className="left text-neutral-400">
						<PunchClockIcon className="mx-3" sx={{ fontSize: "50px" }} />
					</div>
					<div className="left">
						<div>
							<span className="h5 text-text">查看你的帳戶資訊與打卡紀錄</span>
						</div>
						<div className="text-neutral-400">View Your Account Information and Time Clock Records</div>
					</div>
				</NavLink>
			</div>
		</div>
	);
};

export default Home;
