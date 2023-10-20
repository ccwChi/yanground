import React, { useEffect, useState } from "react";
import useLocalStorageValue from "../../hooks/useLocalStorageValue";
import PageTitle from "../../components/Guideline/PageTitle";
import { Avatar, List, ListItem, ListItemText, Divider, Typography } from "@mui/material";
import { getData } from "../../utils/api";

const UserInfo = () => {
	const userProfile = useLocalStorageValue("userProfile");
	const [personalInfo, setPersonalInfo] = useState(null);
	// ApiData
	const [apiAttData, setApiAttData] = useState(null);

	useEffect(() => {
		if (userProfile) {
			const parsedData = [
				{
					title: "姓氏",
					content: userProfile.firstname,
				},
				{
					title: "名字",
					content: userProfile.lastname,
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
				console.log(data);
			});
		}
	}, [userProfile]);

	return (
		<>
			{/* PageTitle */}
			<PageTitle title="個人資料" />

			{userProfile && (
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
			)}
		</>
	);
};

export default UserInfo;
