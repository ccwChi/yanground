import React, { useCallback, useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import PageTitle from "../../components/Guideline/PageTitle";
import { Button, Grow, Grid, Skeleton } from "@mui/material";
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
	const isSmallScreen = useMediaQuery("(max-width:575.98px)");

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

			<div className="flex flex-wrap px-4 md:px-8 py-4 gap-6 overflow-y-auto">
				{isLoading ? (
					<Grid container spacing={2}>
						{Array.from({ length: SKELETONITEM }).map((item, index) => (
							<Grow in key={index} timeout={index * 250}>
								<Grid item xs={isSmallScreen ? 6 : 4}>
									<Skeleton
										variant="rectangular"
										className="rounded"
										sx={{ width: "100%", height: "auto", aspectRatio: "5/3" }}
										fullWidth
									/>
								</Grid>
							</Grow>
						))}
					</Grid>
				) : (
					<Grid container spacing={2}>
						{apiData?.map((item, index) => (
							<Grow in key={item.ordinal} timeout={item.ordinal * 250}>
								<Grid item xs={isSmallScreen ? 6 : 4}>
									<Button
										component={NavLink}
										to={`/constructionTypes/${item.label}+${item.name}`}
										color={`group${(index % 5) + 1}`}
										variant="contained"
										sx={{ aspectRatio: "5/3" }}
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
