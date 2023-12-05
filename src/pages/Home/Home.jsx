import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import useLocalStorageValue from "../../hooks/useLocalStorageValue";
import Avatar from "@mui/material/Avatar";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import BadgeIcon from "@mui/icons-material/Badge";
import Chip from "@mui/material/Chip";
import GroupsIcon from "@mui/icons-material/Groups";
import Divider from "@mui/material/Divider";
import Skeleton from "@mui/material/Skeleton";
import PunchClockIcon from "@mui/icons-material/PunchClock";
import AppRegistrationIcon from "@mui/icons-material/AppRegistration";
import CampaignIcon from "@mui/icons-material/Campaign";
import { getData } from "../../utils/api";
import constructionTypeList from "../../data/constructionTypes";
import "./home.scss";
import liff from "@line/liff";
const LINE_ID = process.env.REACT_APP_LINEID;

const Home = () => {
	// const [countNum, setCountNum] = useState({ staffNum: "-", depNum: "-" });
	const [constSummaryApiList, setConstSummaryApiList] = useState([]);
	const accessToken = useLocalStorageValue("accessToken");
	// const userProfile = useLocalStorageValue("userProfile");
	// isLoading 等待請求 api
	const [isLoading, setIsLoading] = useState(true);
	useEffect(() => {
		// let staffNum, depNum;
		// Promise.all([getData("user?p=1&s=1"), getData("department")])
		// 	.then(([userResult, departmentResult]) => {
		// 		staffNum = userResult.result.totalElements;
		// 		depNum = departmentResult.result.totalElements;
		// 		setCountNum({ staffNum, depNum });
		// 	})

		if (!!accessToken) {
			setTimeout(() => {
				getData("timesheet").then((result) => {
					const data = result.result;

					const transformedData = data.map((item) => {
						const { date, summaries } = item;
						const projectMap = new Map();

						summaries.forEach((summary) => {
							const { project, constructionSummaryJobTasks } = summary;

							if (!projectMap.has(project.name)) {
								projectMap.set(project.name, {
									name: project.name,
									constructionSummaryJobTasks: [],
								});
							}

							const existingProject = projectMap.get(project.name);

							constructionSummaryJobTasks.forEach((task) => {
								const dispatches = task.constructionSummaryJobTaskDispatches;

								if (dispatches.some((dispatch) => dispatch.date === date)) {
									const constructionJobTask =
										getConstructionType(task.constructionJobTask.constructionJob.constructionType) +
										"-" +
										task.constructionJobTask.name;

									const dispatchesForDate = dispatches
										.filter((dispatch) => dispatch.date === date)
										.map((dispatch) => dispatch.labourer.nickname)
										.join(" ");

									existingProject.constructionSummaryJobTasks.push({
										constructionJobTask,
										constructionSummaryJobTaskDispatches: dispatchesForDate,
									});
								}
							});
						});

						return {
							date,
							summaries: Array.from(projectMap.values()).filter(
								(project) => project.constructionSummaryJobTasks.length > 0
							),
						};
					});

					// console.log(transformedData);
					setConstSummaryApiList(transformedData);
					setIsLoading(false);
				});
			}, 1200);
		}
	}, [accessToken]);

	const getConstructionType = (constructionTypeName) => {
		const type = constructionTypeList.find((type) => type.name === constructionTypeName);
		return type ? type.label : "";
	};

	// useEffect(() => {
	// 	const initializeLiff = async () => {
	// 		try {
	// 			await liff.init({ liffId: LINE_ID });
	// 			if (liff.getContext().type.match(/utou/g) && liff.isInClient()) {
	// 				await liff.sendMessages([
	// 					{
	// 						type: "text",
	// 						text: "Hello,\nWorld!\nThis is a multi-line message.",
	// 					},
	// 				]);
	// 			}
	// 		} catch (error) {
	// 			console.error("Error sending message:", error);
	// 		}
	// 	};

	// 	initializeLiff();
	// }, []);

	return (
		<div className="home_wrapper flex flex-col flex-1 overflow-hidden sm:mb-0 -mb-7">
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
						<div className="cloud-circle circle-16"></div>
						<div className="cloud-circle circle-17"></div>
						<div className="cloud-circle circle-18"></div>
						<div className="cloud-circle circle-19"></div>
						<div className="cloud-circle circle-20"></div>
						<div className="cloud-circle circle-21"></div>
						<div className="cloud-circle circle-22"></div>
						<div className="cloud-circle circle-23"></div>
						<div className="cloud-circle circle-24"></div>
					</div>
				</div>
			</div>

			<div className="profile-section flex-1 -mb-7 sm:-mb-4 w-full px-2.5 pt-3.5 pb-14 sm:pb-3.5 flex flex-col overflow-y-auto sm:overflow-hidden">
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

				<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 px-4 sm:flex-1 sm:overflow-hidden pb-4">
					<div className="flex flex-col shadow-md break-words panel border gap-3 bg-white overflow-hidden">
						{/* 標題 */}
						<div className="flex">
							<div className="left text-neutral-400">
								<AppRegistrationIcon className="mx-3" sx={{ fontSize: "50px" }} />
							</div>
							<div className="left">
								<div>
									<span className="h5 text-text">派工</span>
								</div>
								<div className="text-neutral-400">Assignment</div>
							</div>
						</div>
						<Divider variant="middle" />

						{/* 主內容 */}
						<div className="relative flex flex-col px-4 overflow-y-auto flex-1 min-h-[20px]">
							{!isLoading ? (
								constSummaryApiList && constSummaryApiList.length > 0 ? (
									constSummaryApiList?.map((summary, index) => (
										<div className="flex flex-col gap-1.5" key={index}>
											<p className="text-primary-800">
												<span className="text-neutral-500 pe-2">日期：</span>
												{summary.date}
											</p>
											{summary.summaries.map((s) => (
												<div className="inline-flex flex-col gap-1.5" key={s.name}>
													<p className="pt-1 text-primary-800">
														<span className="text-neutral-500 pe-2">案場：</span>
														{s.name}
													</p>
													<span className="text-neutral-500 pe-2">人員分配：</span>
													{s.constructionSummaryJobTasks.map((c) => (
														<div
															className="flex flex-col sm:flex-row items-start"
															key={summary.date + s.name + c.constructionJobTask}>
															{/* <Chip label={c.constructionJobTask} color="primary" className="me-2" /> */}
															<span className="whitespace-nowrap text-sm text-neutral-400">
																〔{c.constructionJobTask}〕
															</span>
															<span className="ms-1.5 sm:ms-0 sm:-mt-0.5">
																{c.constructionSummaryJobTaskDispatches}
															</span>
														</div>
													))}
												</div>
											))}
											{index !== constSummaryApiList.length - 1 && <Divider variant="middle" className="!my-3" />}
										</div>
									))
								) : (
									<div className="absolute inset-0 flex items-center justify-center">
										<span className="italic text-neutral-500 text-sm">(七日內尚無派工資訊)</span>
									</div>
								)
							) : (
								<div className="flex flex-col gap-2.5">
									<Skeleton variant="rounded" width={140} height={24} />
									<Skeleton variant="rounded" width={100} height={24} />
									<Skeleton variant="rounded" width={120} height={24} />
									<Skeleton variant="rounded" width={"100%"} height={48} />
								</div>
							)}
						</div>
					</div>
					<div className="flex flex-col shadow-md break-words panel border gap-3 bg-white overflow-hidden">
						{/* 標題 */}
						<div className="flex">
							<div className="left text-neutral-400">
								<CampaignIcon className="mx-3" sx={{ fontSize: "50px" }} />
							</div>
							<div className="left">
								<div>
									<span className="h5 text-text">公告</span>
								</div>
								<div className="text-neutral-400">Announcement</div>
							</div>
						</div>
						<Divider variant="middle" />

						{/* 主內容 */}
						<div className="flex flex-col items-center justify-center flex-1 px-4 overflow-y-auto">
							<span className="italic text-neutral-500 text-sm">(尚無公告)</span>
						</div>
					</div>
				</div>

				<NavLink to="/userinfo" className="panel bg-white flex mx-4">
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
