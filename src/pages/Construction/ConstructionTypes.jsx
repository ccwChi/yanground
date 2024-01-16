import React, { useCallback, useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import PageTitle from "../../components/Guideline/PageTitle";
import Button from "@mui/material/Button";
import Grow from "@mui/material/Grow";
import Grid from "@mui/material/Grid";
import Skeleton from "@mui/material/Skeleton";
import { useMediaQuery } from "@mui/material";
import { getData } from "../../utils/api";
const SKELETONITEM = 1;

const ConstructionTypes = () => {
	// API List Data
	const [apiData, setApiData] = useState(null);
	// isLoading 等待請求 api
	const [isLoading, setIsLoading] = useState(true);
	// ApiUrl
	const apiUrl = "constructionType";
	// 螢幕大小判斷參數
	const isLargeScreen = useMediaQuery("(max-width:1399.98px)");
	const isSmallScreen = useMediaQuery("(max-width:575.98px)");
	// Btn Img
	const imageUrls = [
		"https://www.yuanrong-tech.com.tw/WebFiles/img/77470008-8f35-4785-8870-d85b2e00f33e/354ab255-bdea-4192-b7a3-99b7111ff4aa.png",
		"https://www.yuanrong-tech.com.tw/WebFiles/img/3e63d586-7595-4305-80cc-58fa20da805c/7a52f936-49f6-45de-9f32-e98a5ac6e0ef.jpg",
		"https://www.yuanrong-tech.com.tw/WebFiles/img/77470008-8f35-4785-8870-d85b2e00f33e/ee9497de-729b-47a9-a620-abdaed272427.png",
		"https://www.yuanrong-tech.com.tw/WebFiles/img/a35dd396-2308-4fd7-b191-ec0173e75a0c/94bdf01d-26c7-4b78-bae8-7bd5dd459103.jpg",
		"https://www.yuanrong-tech.com.tw/WebFiles/img/59c0b760-1ac3-4d46-8a90-9e70f2d91920/31864d28-61e6-440d-a125-5f23b203e2fe.jpg",
		"https://www.yuanrong-tech.com.tw/WebFiles/img/59c0b760-1ac3-4d46-8a90-9e70f2d91920/5853a6f2-733b-4dc4-a207-bdce480ac324.jpg",
		"https://www.yuanrong-tech.com.tw/WebFiles/img/3e63d586-7595-4305-80cc-58fa20da805c/eccdb80b-6779-44ad-b3c0-dfc3200a905d.jpg",
		"https://www.yuanrong-tech.com.tw/WebFiles/img/3e63d586-7595-4305-80cc-58fa20da805c/01216c45-6866-4edb-9ee9-6f1c1fbfcfc6.jpg",
		"https://www.yuanrong-tech.com.tw/WebFiles/img/3e63d586-7595-4305-80cc-58fa20da805c/7a52f936-49f6-45de-9f32-e98a5ac6e0ef.jpg",
	];

	// 取得列表資料
	useEffect(() => {
		getApiList(apiUrl);
	}, [apiUrl]);
	const getApiList = useCallback((url) => {
		setIsLoading(true);
		getData(url).then((result) => {
			setIsLoading(false);
			const data = result.result;
			setApiData(data);
		});
	}, []);

	return (
		<>
			{/* PageTitle */}
			<PageTitle title="工程類別" />

			<div className="flex flex-wrap px-4 md:px-8 pt-4 sm:pb-4 pb-10 gap-6 overflow-y-auto">
				{isLoading ? (
					<Grid container spacing={2}>
						{Array.from({ length: SKELETONITEM }).map((_, index) => (
							<Grow in key={index} timeout={index * 250}>
								<Grid item xs={isLargeScreen ? (isSmallScreen ? 6 : 4) : 3}>
									<Skeleton
										variant="rectangular"
										className="rounded"
										sx={{
											width: "100%",
											height: "auto",
											aspectRatio: "5/3",
										}}
									/>
								</Grid>
							</Grow>
						))}
					</Grid>
				) : (
					<Grid container spacing={2}>
						{apiData?.map((item, index) => (
							<Grow in key={item.ordinal} timeout={item.ordinal * 250}>
								<Grid item xs={isLargeScreen ? (isSmallScreen ? 6 : 4) : 3}>
									<Button
										component={NavLink}
										to={`/constructionTypes/${item.label}+${item.name}`}
										variant="contained"
										sx={{
											aspectRatio: "5/3",
											backgroundBlendMode: "multiply",
											background: `linear-gradient(rgba(84, 125, 183, 0.75), rgba(3, 158, 142, 0.5)), url(${imageUrls[index]})`,
											backgroundSize: "cover",
											backgroundPosition: "center",
											backgroundRepeat: "no-repeat",
										}}
										fullWidth>
										<div className="flex flex-col items-center">
											<div className="text-xl sm:text-2xl md:text-3xl tracking-widest">{item.label}</div>
										</div>
									</Button>
								</Grid>
							</Grow>
						))}
					</Grid>
				)}
			</div>
		</>
	);
};

export default ConstructionTypes;
