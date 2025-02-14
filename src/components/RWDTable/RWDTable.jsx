import React from "react";
// MUI
import useMediaQuery from "@mui/material/useMediaQuery";
import Chip from "@mui/material/Chip";
import Avatar from "@mui/material/Avatar";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Divider from "@mui/material/Divider";
import Grow from "@mui/material/Grow";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Skeleton from "@mui/material/Skeleton";
import Tooltip from "@mui/material/Tooltip";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DoneIcon from "@mui/icons-material/Done";
import CloseIcon from "@mui/icons-material/Close";
import WarningIcon from "@mui/icons-material/Warning";
// Customs
import Empty from "./Empty";

const SKELETONITEM = 6;
const CARD_BOX_SHADOW = "0px 2px 2px 0px rgba(0, 0, 0, 0.25)";

const RWDTable = ({
	data,
	columnsPC,
	columnsMobile,
	actions,
	cardTitleKey,
	tableMinWidth,
	isLoading,
	handleActionClick,
	actionSpec = false,
	attendanceWaiverList = null,
	specStatus = false,
}) => {
	const isSmallScreen = useMediaQuery("(max-width:575.98px)");

	if (isSmallScreen) {
		return (
			<div className={`flex flex-col gap-3 pt-1 ${specStatus ? "pb-1" : "pb-[30%]"}`}>
				{!isLoading ? (
					data && data.length > 0 ? (
						data.map((item, rowIndex) => (
							<Grow in={true} key={"Accordion" + rowIndex}>
								<Accordion
									sx={[
										{
											margin: "0 1rem",
											borderRadius: "8px",
											boxShadow: CARD_BOX_SHADOW,
											"&.Mui-expanded": {
												margin: "0 1rem",
											},
										},
									]}>
									<AccordionSummary
										className="flex-row-reverse !items-center"
										expandIcon={<ExpandMoreIcon className="text-text opacity-75" sx={{ fontSize: "1.85rem" }} />}
										sx={[
											{
												// alignItems: "flex-start",
												"&.Mui-expanded": {
													minHeight: "50px",
												},
											},
										]}>
										<div className="flex w-full justify-between gap-1">
											<Typography variant="h6" className="!text-lg !leading-relaxed" sx={{ wordBreak: "break-word" }}>
												{Array.isArray(cardTitleKey)
													? cardTitleKey.reduce((item, key) => item[key], item)
													: item[cardTitleKey]}
											</Typography>
											<div className="flex items-center gap-2">
												{attendanceWaiverList &&
													(item.approveState === true ? (
														<Chip
															variant="outlined"
															label={"審核通過"}
															size="small"
															color="success"
															// icon={<DoneIcon />}
															sx={{ fontWeight: "700", borderRadius: "4px", backgroundColor: "#21AA9C19" }}
														/>
													) : item.rejectedAt === true ? (
														<Chip
															variant="outlined"
															label={"審核不通過"}
															size="small"
															color="error"
															// icon={<CloseIcon />}
															sx={{ fontWeight: "700", borderRadius: "4px", backgroundColor: "#D52F2F19" }}
														/>
													) : (
														<Chip
															variant="outlined"
															label={"待審核"}
															size="small"
															color="warning"
															// icon={<WarningIcon />}
															sx={{ fontWeight: "700", borderRadius: "4px", backgroundColor: "#ED6C0219" }}
														/>
													))}
												{actionSpec && (
													<div className="whitespace-nowrap">
														{actionSpec[1].map((action, index) => (
															<IconButton
																key={"AccordionActionKey" + rowIndex + "-" + index}
																title={action.title}
																aria-label={action.value}
																className={
																	(rowIndex === 0 && index === 0) || (data.length - 1 === rowIndex && index === 1)
																		? "!hidden"
																		: ""
																}
																color="custom"
																size="small"
																data-mode={action.value}
																data-value={item.id}
																onClick={handleActionClick}>
																{action.icon}
															</IconButton>
														))}
													</div>
												)}
												{actions && (
													<div className="whitespace-nowrap">
														{actions.map((action, index) => (
															<IconButton
																key={"AccordionActionKey" + rowIndex + "-" + index}
																title={action.title}
																aria-label={action.value}
																color="custom"
																size="small"
																data-mode={action.value}
																data-value={item.id}
																sx={{ width: "34px", aspectRatio: "1/1" }}
																onClick={handleActionClick}>
																{action.icon}
															</IconButton>
														))}
													</div>
												)}
											</div>
										</div>
									</AccordionSummary>
									<AccordionDetails
										className="text-sm"
										sx={[
											{
												borderTop: "1px solid rgba(224, 224, 224, 1)",
											},
										]}>
										{columnsMobile.map((column, index) => (
											<div key={"AccordionRow-" + rowIndex + "-" + index}>
												<div className="flex justify-between py-2">
													<div className="text-neutral-500 pe-2 whitespace-nowrap">{column.label}</div>
													<div className="text-black break-all">
														{(() => {
															switch (column.key) {
																case "gender":
																	return item.gender ? "男性" : item.gender === false ? "女性" : "?";
																case "administrativeDivision":
																	return item.administrativeDivision ? (
																		item.administrativeDivision.administeredBy.name + item.administrativeDivision.name
																	) : (
																		<span className="italic text-neutral-500 text-sm">-</span>
																	);
																case "lastname+firstname":
																	const hasLastname = item.lastname && item.lastname.trim() !== "";
																	const hasFirstname = item.firstname && item.firstname.trim() !== "";

																	if (hasLastname && hasFirstname) {
																		return item.lastname + item.firstname;
																	} else if (hasLastname) {
																		return item.lastname;
																	} else if (hasFirstname) {
																		return item.firstname;
																	} else {
																		return <span className="italic text-neutral-500 text-sm">-</span>;
																	}
																case "anomalyType":
																	return (
																		<Chip
																			label={item.anomalyType.chinese}
																			size="small"
																			sx={{
																				backgroundColor: "#039e8e",
																				color: "white",
																			}}
																		/>
																	);
																case "anomalyReason":
																	return item.anomalyReason ? (
																		<span className="text-red-500">{item.anomalyReason}</span>
																	) : (
																		<span className="italic text-neutral-500 text-sm">-</span>
																	);
																default:
																	const columnData = columnsMobile.find((col) => col.key === column.key);
																	if (columnData) {
																		const columnKeys = Array.isArray(columnData.key)
																			? columnData.key
																			: [columnData.key];
																		const value = columnKeys.reduce((item, key) => (item && item[key]) || null, item);

																		if (value !== null) {
																			return value;
																		}
																	}

																	return <span className="italic text-neutral-500 text-sm">-</span>;
																// if (column.children) {
																// 	return item[column.key] ? (
																// 		item[column.key][column.children.key]
																// 	) : (
																// 		<span className="italic text-neutral-500 text-sm">-</span>
																// 	);
																// } else {
																// 	return item[column.key] ? (
																// 		item[column.key]
																// 	) : (
																// 		<span className="italic text-neutral-500 text-sm">-</span>
																// 	);
																// }
															}
														})()}
													</div>
												</div>
												<Divider />
											</div>
										))}
									</AccordionDetails>
								</Accordion>
							</Grow>
						))
					) : (
						<>
							{data && data.length <= 0 && <Empty />}
							{!data && <Empty word="資料請求失敗" />}
						</>
					)
				) : (
					Array.from({ length: SKELETONITEM }).map((_, index) => (
						<Grow in={true} key={"Skeleton" + index}>
							<div
								className="flex items-center h-13 px-4 mx-4 bg-white rounded-lg gap-3"
								style={{ boxShadow: CARD_BOX_SHADOW }}>
								<Skeleton
									animation="wave"
									height={34}
									sx={{ display: "inline-flex", margin: 0, transform: "none", flex: 1 }}
								/>
								<Skeleton
									variant="circular"
									animation="wave"
									width={34}
									height={34}
									sx={{ display: "inline-block", transform: "none" }}
								/>
							</div>
						</Grow>
					))
				)}
			</div>
		);
	}

	return (
		<TableContainer
			component={Paper}
			className="h-full mx-auto"
			sx={{
				borderTop: "2px solid rgb(230, 230, 230)",
				width: "96%",
				borderRadius: "0.5rem",
				boxShadow: "0 5px 10px rgba(0, 0, 0, 0.1)",
			}}>
			<Table stickyHeader sx={{ minWidth: tableMinWidth }}>
				<TableHead>
					<TableRow>
						{actionSpec && (
							<TableCell width="140px" sx={{ textAlign: "center", verticalAlign: "middle" }}>
								{actionSpec[0]}
							</TableCell>
						)}
						{columnsPC.map((column, index) => (
							<TableCell
								key={"TableTitleKey" + column.key}
								width={column.size}
								sx={{
									textAlign: column.align ? column.align : "center",
									verticalAlign: "middle",
									paddingLeft: column.align && index === 0 ? "5% !important" : 0,
								}}>
								{column.label}
							</TableCell>
						))}
						{actions && (
							<TableCell width="160px" sx={{ textAlign: "center", verticalAlign: "middle" }}>
								操作
							</TableCell>
						)}
					</TableRow>
				</TableHead>
				<TableBody className={`${!isLoading ? "" : "absolute w-full"}`}>
					{!isLoading &&
						data &&
						data.length > 0 &&
						data.map((item, rowIndex) => (
							<Grow in={true} key={"TableItem" + rowIndex}>
								<TableRow>
									{actionSpec && (
										<TableCell sx={{ textAlign: "center", verticalAlign: "middle" }}>
											{actionSpec[1].map((action, index) => (
												<Tooltip key={"TableActionAction" + index} title={action.title}>
													<IconButton
														aria-label={action.value}
														color="dark"
														size="small"
														data-mode={action.value}
														data-value={item.id}
														onClick={handleActionClick}>
														{action.icon}
													</IconButton>
												</Tooltip>
											))}
										</TableCell>
									)}
									{columnsPC.map((column, index) => (
										<TableCell
											key={"TableTitleList" + column.key + index}
											sx={{
												textAlign: column.align ? column.align : "center",
												verticalAlign: "middle",
												paddingLeft: column.align && index === 0 ? "5% !important" : 0,
											}}>
											{(() => {
												switch (column.key) {
													case "pictureUrl":
														return item.pictureUrl ? (
															<div className="flex items-center justify-center">
																<Avatar src={item.pictureUrl} alt={item.nickname} />
															</div>
														) : (
															<span className="italic text-neutral-500 text-sm">-</span>
														);
													case "gender":
														return item.gender ? "男性" : item.gender === false ? "女性" : "?";
													case "administrativeDivision":
														return item.administrativeDivision ? (
															item.administrativeDivision.administeredBy.name + item.administrativeDivision.name
														) : (
															<span className="italic text-neutral-500 text-sm">-</span>
														);
													case "lastname+firstname":
														const hasLastname = item.lastname && item.lastname.trim() !== "";
														const hasFirstname = item.firstname && item.firstname.trim() !== "";

														if (hasLastname && hasFirstname) {
															return item.lastname + item.firstname;
														} else if (hasLastname) {
															return item.lastname;
														} else if (hasFirstname) {
															return item.firstname;
														} else {
															return <span className="italic text-neutral-500 text-sm">-</span>;
														}
													case "approveState":
														return item.approveState === true ? (
															<Chip
																variant="outlined"
																label={"審核通過"}
																size="small"
																color="success"
																// icon={<DoneIcon />}
																sx={{ fontWeight: "700", borderRadius: "4px", backgroundColor: "#21AA9C19" }}
															/>
														) : item.rejectedAt === true ? (
															<Chip
																variant="outlined"
																label={"審核不通過"}
																size="small"
																color="error"
																// icon={<CloseIcon />}
																sx={{ fontWeight: "700", borderRadius: "4px", backgroundColor: "#D52F2F19" }}
															/>
														) : (
															<Chip
																variant="outlined"
																label={"待審核"}
																size="small"
																color="warning"
																// icon={<WarningIcon />}
																sx={{ fontWeight: "700", borderRadius: "4px", backgroundColor: "#ED6C0219" }}
															/>
														);
													case "attendanceWaivertype":
														return (
															<Chip
																label={item.attendanceWaivertype}
																size="small"
																sx={{
																	backgroundColor: attendanceWaiverList.find(
																		(type) => type.chinese === item.attendanceWaivertype
																	).color,
																	color: "white",
																}}
															/>
														);
													case "anomalyType":
														return (
															<Chip
																label={item.anomalyType.chinese}
																size="small"
																sx={{
																	backgroundColor: "#039e8e",
																	color: "white",
																}}
															/>
														);
													case "anomalyReason":
														return item.anomalyReason ? (
															<span className="text-red-500">{item.anomalyReason}</span>
														) : (
															<span className="italic text-neutral-500 text-sm">-</span>
														);
													default: {
														const columnData = columnsPC.find((col) => col.key === column.key);
														if (columnData) {
															const columnKeys = Array.isArray(columnData.key) ? columnData.key : [columnData.key];
															const value = columnKeys.reduce((item, key) => (item && item[key]) || null, item);

															if (value !== null) {
																return value;
															}
														}

														return <span className="italic text-neutral-500 text-sm">-</span>;
													}
													// if (column.children) {
													// 	return item[column.key] ? (
													// 		item[column.key][column.children.key]
													// 	) : (
													// 		<span className="italic text-neutral-500 text-sm">-</span>
													// 	);
													// } else {
													// 	return item[column.key] ? (
													// 		item[column.key]
													// 	) : (
													// 		<span className="italic text-neutral-500 text-sm">-</span>
													// 	);
													// }
												}
											})()}
										</TableCell>
									))}
									{actions && (
										<TableCell sx={{ textAlign: "center", verticalAlign: "middle" }}>
											{actions.map((action, index) => (
												<Tooltip key={"TableActionAction" + index} title={action.title}>
													<IconButton
														aria-label={action.value}
														color="custom"
														size="small"
														sx={{ width: "34px", aspectRatio: "1/1" }}
														data-mode={action.value}
														data-value={item.id}
														onClick={handleActionClick}>
														{action.icon}
													</IconButton>
												</Tooltip>
											))}
										</TableCell>
									)}
								</TableRow>
							</Grow>
						))}
				</TableBody>
			</Table>
			{isLoading &&
				Array.from({ length: SKELETONITEM }).map((_, index) => (
					<Grow in={true} key={"Skeleton" + index}>
						<div className="flex items-center py-2" style={{ minWidth: `${tableMinWidth * 0.95}px` }}>
							<Skeleton
								animation="wave"
								width={"15%"}
								height={34}
								sx={{ display: "inline-block", margin: "0 12px", transform: "none" }}
							/>
							<Skeleton
								animation="wave"
								width={"30%"}
								height={34}
								sx={{ display: "inline-block", margin: "0 12px", transform: "none" }}
							/>
							<Skeleton
								animation="wave"
								width={"55%"}
								height={34}
								sx={{
									display: "inline-block",
									margin: "0 12px",
									transform: "none",
								}}
							/>
							<Skeleton
								animation="wave"
								width={34}
								height={34}
								sx={{ display: "inline-block", margin: "0 12px", minWidth: "34px", transform: "none" }}
								variant="circular"
							/>
						</div>
					</Grow>
				))}
			{!isLoading && data && data.length <= 0 && <Empty />}
			{!isLoading && !data && <Empty word="資料請求失敗" />}
		</TableContainer>
	);
};

export default RWDTable;
