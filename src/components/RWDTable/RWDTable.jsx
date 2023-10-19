import React from "react";
import useMediaQuery from "@mui/material/useMediaQuery";
import {
	Accordion,
	AccordionSummary,
	AccordionDetails,
	Divider,
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

const RWDTable = ({ data, columns, actions, tableMinWidth, isLoading }) => {
	const isSmallScreen = useMediaQuery("(max-width:639.98px)");

	if (isSmallScreen) {
		return (
			<div>
				{!isLoading ? (
					data?.map((item) => (
						<Accordion key={item.id}>
							<AccordionSummary>
								<Typography variant="h6">{item.name}</Typography>
							</AccordionSummary>
							<AccordionDetails>
								{columns.map((column, index) => (
									<div key={index}>
										<Typography variant="body2">
											{column.label}: {item[column.key]}
										</Typography>
									</div>
								))}
							</AccordionDetails>
						</Accordion>
					))
				) : (
					<>Loading...</>
				)}
			</div>
		);
	}

	return (
		<TableContainer component={Paper}>
			<Table sx={{ minWidth: tableMinWidth }}>
				<TableHead>
					<TableRow>
						{columns.map(
							(column, index) =>
								column.key !== "id" && (
									<TableCell key={index} width={column.size} sx={{ textAlign: "center", verticalAlign: "middle" }}>
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
								<TableRow key={rowIndex}>
									{columns.map(
										(column, colIndex) =>
											column.key !== "id" && (
												<TableCell key={colIndex} sx={{ textAlign: "center", verticalAlign: "middle" }}>
													{item[column.key]}
												</TableCell>
											)
									)}
									{actions && (
										<TableCell sx={{ textAlign: "center", verticalAlign: "middle" }}>
											{actions.map((action, index) => (
												<IconButton key={index} aria-label={action.value} color="custom" size="small" data-id={item.id}>
													{action.icon}
												</IconButton>
											))}
										</TableCell>
									)}
								</TableRow>
						  ))
						: Array.from({ length: 3 }).map((_, index) => (
								<TableRow key={index}>
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
						  ))}
				</TableBody>
			</Table>
		</TableContainer>
	);
};

export default RWDTable;
