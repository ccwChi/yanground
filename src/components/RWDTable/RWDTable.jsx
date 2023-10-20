import React from "react";
import useMediaQuery from "@mui/material/useMediaQuery";
import {
	Accordion,
	AccordionSummary,
	AccordionDetails,
	Divider,
	Grow,
	IconButton,
	Typography,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	Skeleton,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
const SKELETONITEM = 6;
const CARD_BOX_SHADOW = "0px 4px 4px 0px rgba(0, 0, 0, 0.25)";

const RWDTable = ({ data, columns, actions, cardTitleKey, tableMinWidth, isLoading }) => {
	const isSmallScreen = useMediaQuery("(max-width:575.98px)");

	const handleActionClick = (event) => {
		event.stopPropagation();
		const dataMode = event.currentTarget.getAttribute("data-mode");
		const dataValue = event.currentTarget.getAttribute("data-value");

		console.log("Action button clicked", dataMode, dataValue);
	};

	if (isSmallScreen) {
		return (
			<div className="flex flex-col gap-3 pt-2">
				{!isLoading
					? data?.map((item, rowIndex) => (
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
										className="flex-row-reverse"
										expandIcon={
											<ExpandMoreIcon
												className="text-text"
												fontSize="large"
												sx={{
													margin: "8px 0",
												}}
											/>
										}
										sx={[
											{
												alignItems: "flex-start",
												"&.Mui-expanded": {
													height: "52px",
													minHeight: "48px",
												},
											},
										]}>
										<div className="flex w-full justify-between gap-1">
											<Typography variant="h6" sx={{ wordBreak: "break-word" }}>
												{item[cardTitleKey]}
											</Typography>
											{actions && (
												<div className="whitespace-nowrap">
													{actions.map((action, index) => (
														<IconButton
															key={"AccordionActionKey" + rowIndex + "-" + index}
															aria-label={action.value}
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
										</div>
									</AccordionSummary>
									<AccordionDetails
										sx={[
											{
												borderTop: "1px solid rgba(224, 224, 224, 1)",
											},
										]}>
										{columns.map((column, index) => (
											<div key={"AccordionRow-" + rowIndex + "-" + index}>
												<div className="flex justify-between py-2">
													<span className="text-neutral-500">{column.label}</span>
													<p className="text-black">{item[column.key]}</p>
												</div>
												<Divider />
											</div>
										))}
									</AccordionDetails>
								</Accordion>
							</Grow>
					  ))
					: Array.from({ length: SKELETONITEM }).map((_, index) => (
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
					  ))}
			</div>
		);
	}

	return (
		<TableContainer component={Paper} sx={{ boxShadow: "none" }}>
			<Table sx={{ minWidth: tableMinWidth }}>
				<TableHead>
					<TableRow>
						{columns.map(
							(column) =>
								column.key !== "id" && (
									<TableCell
										key={"TableTitleKey" + column.key}
										width={column.size}
										sx={{ textAlign: "center", verticalAlign: "middle" }}>
										{column.label}
									</TableCell>
								)
						)}
						{actions && (
							<TableCell width="140px" sx={{ textAlign: "center", verticalAlign: "middle" }}>
								操作
							</TableCell>
						)}
					</TableRow>
				</TableHead>
				<TableBody>
					{!isLoading
						? data?.map((item, rowIndex) => (
								<Grow in={true} key={"TableItem" + rowIndex}>
									<TableRow>
										{columns.map(
											(column) =>
												column.key !== "id" && (
													<TableCell
														key={"TableTitleList" + column.key}
														sx={{ textAlign: "center", verticalAlign: "middle" }}>
														{item[column.key]}
													</TableCell>
												)
										)}
										{actions && (
											<TableCell sx={{ textAlign: "center", verticalAlign: "middle" }}>
												{actions.map((action, index) => (
													<IconButton
														key={"TableActionAction" + index}
														aria-label={action.value}
														color="custom"
														size="small"
														data-mode={action.value}
														data-value={item.id}
														onClick={handleActionClick}>
														{action.icon}
													</IconButton>
												))}
											</TableCell>
										)}
									</TableRow>
								</Grow>
						  ))
						: Array.from({ length: SKELETONITEM }).map((_, index) => (
								<Grow in={true} key={"Skeleton" + index}>
									<TableRow>
										<TableCell sx={{ textAlign: "center", verticalAlign: "middle" }}>
											<Skeleton
												animation="wave"
												width={"calc(30% - 18px)"}
												height={35.5}
												sx={{ display: "inline-block", margin: "0 24px 0 12px", transform: "none" }}
											/>
											<Skeleton
												animation="wave"
												width={"calc(70% - 18px)"}
												height={35.5}
												sx={{ display: "inline-block", transform: "none" }}
											/>
										</TableCell>
										<TableCell sx={{ textAlign: "center", verticalAlign: "middle" }}>
											<Skeleton
												animation="wave"
												height={35.5}
												sx={{
													display: "inline-block",
													width: "calc(100% - 35.5px - 36px)",
													transform: "none",
												}}
											/>
											<Skeleton
												animation="wave"
												width={35.5}
												height={35.5}
												sx={{ display: "inline-block", margin: "0 12px 0 24px", transform: "none" }}
												variant="circular"
											/>
										</TableCell>
									</TableRow>
								</Grow>
						  ))}
				</TableBody>
			</Table>
		</TableContainer>
	);
};

export default RWDTable;
