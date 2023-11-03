import React from "react";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";
import TablePagination from "@mui/material/TablePagination";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";

const Pagination = ({ totalElement, page, onPageChange, rowsPerPage, onRowsPerPageChange }) => {
	return (
		<div className="order-2">
			<TablePagination
				className="customPagination"
				rowsPerPageOptions={[10, 25, 50]}
				component="div"
				count={totalElement}
				page={page}
				onPageChange={onPageChange}
				rowsPerPage={rowsPerPage}
				onRowsPerPageChange={onRowsPerPageChange}
				labelRowsPerPage="每頁行數"
				labelDisplayedRows={({ from, to, count }) => `${count} 項中的 ${from}-${to} 項`}
				sx={[
					{
						"> div": {
							justifyContent: "flex-start",
						},
					},
				]}
				ActionsComponent={() => (
					<div className="flex flex-1">
						<div className="flex-1"></div>
						<div className="inline-flex items-center text-sm gap-1">
							第
							<Select value={page} variant="standard" onChange={(e) => onPageChange(null, e.target.value)}>
								<MenuItem value="0" className="!hidden !p-0"></MenuItem>
								{Array.from({ length: Math.ceil(totalElement / rowsPerPage) }, (_, i) => (
									<MenuItem key={i} value={i}>
										{i + 1}
									</MenuItem>
								))}
							</Select>
							頁
						</div>
						<IconButton onClick={() => onPageChange(null, page - 1)} disabled={page === 0}>
							<KeyboardArrowLeftIcon />
						</IconButton>
						<IconButton
							onClick={() => onPageChange(null, page + 1)}
							disabled={page >= Math.ceil(totalElement / rowsPerPage) - 1}>
							<KeyboardArrowRightIcon />
						</IconButton>
					</div>
				)}
			/>
		</div>
	);
};

export default Pagination;
