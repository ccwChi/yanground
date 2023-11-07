import React, { useEffect, useState } from "react";
import PageTitle from "../../components/Guideline/PageTitle";
import Loading from "../../components/Loader/Loading";
import Avatar from "@mui/material/Avatar";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import { getData } from "../../utils/api";

const UserInfo = () => {
	const [userProfile, setUserProfile] = useState(null);
	const [personalInfo, setPersonalInfo] = useState(null);
	// ApiData
	const [apiAttData, setApiAttData] = useState(null);

	// 取得用戶資料
	useEffect(() => {
		getData("").then((result) => {
			const data = result.result;
			setUserProfile(data);
		});
	}, []);

	// 取得打卡歷程資料
	useEffect(() => {
		if (userProfile) {
			const parsedData = [
				{
					title: "姓氏",
					content: userProfile.lastname,
				},
				{
					title: "名字",
					content: userProfile.firstname,
				},
				{
					title: "暱稱",
					content: userProfile.nickname,
				},
				{
					title: "性別",
					content: userProfile.gender,
				},
				{
					title: "部門",
					content: userProfile.department ? userProfile.department.name : "無資料",
				},
				{
					title: "員工編號",
					content: userProfile.id,
				},
				{
					title: "權限",
					content: userProfile.authorities ? userProfile.authorities.map((item) => item.name).join("、") : "無權限",
				},
			];
			setPersonalInfo(parsedData);
			getData(`user/${userProfile.id}/attendancies?p=1&s=100`).then((result) => {
				const data = result.result;
				setApiAttData(data);
			});
		}
	}, [userProfile]);

	return (
		<>
			{/* PageTitle */}
			<PageTitle title="帳戶資訊" />

			{userProfile && apiAttData ? (
				<div className="flex flex-col md:flex-row items-center md:items-start md:justify-center px-6 pt-6 sm:py-6 gap-3 sm:gap-6 flex-1 overflow-hidden ">
					<div className="inline-flex flex-col items-center gap-2">
						<Avatar
							alt={userProfile.displayName}
							src={userProfile.pictureUrl}
							sx={{ width: 112, height: 112, bgcolor: "#547db7" }}
						/>
						<Typography gutterBottom variant="h5" component="div">
							{userProfile.displayName}
						</Typography>
					</div>
					<div className="w-full h-full overflow-y-auto border rounded-lg bg-white">
						<List sx={{ padding: 0 }}>
							{personalInfo &&
								personalInfo.map((info, index) => (
									<div key={index}>
										<ListItem>
											<ListItemText primary={info.title} secondary={info.content ? info.content : "(無資料)"} />
										</ListItem>
										<Divider variant="middle" />
									</div>
								))}
						</List>
					</div>
					<div className="w-full md:max-w-xs h-full overflow-y-auto border rounded-lg bg-white">
						<Typography gutterBottom variant="p" component="div" className="ps-3 pt-3">
							〈打卡歷程〉
						</Typography>
						<List sx={{ padding: 0 }}>
							{apiAttData &&
								(apiAttData.empty ? (
									<p className="px-4">(尚未有打卡紀錄)</p>
								) : (
									apiAttData.content.map((data, index) => (
										<div key={index}>
											<ListItem className="flex-col" sx={{ alignItems: "flex-start" }}>
												<ListItemText secondary={"時間：" + data.occurredAt.replace("T", " ").replace(/\+.*/, "")} />
												<ListItemText secondary={"座標：" + data.latitude + ", " + data.longitude} />
											</ListItem>
											<Divider variant="middle" />
										</div>
									))
								))}
						</List>
					</div>
				</div>
			) : (
				<Loading />
			)}
		</>
	);
};

export default UserInfo;
