import React from "react";
import Badge from "@mui/material/Badge";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Dialog from "@mui/material/Dialog";
import Tooltip from "@mui/material/Tooltip";
import TuneIcon from "@mui/icons-material/Tune";

const Search = ({
	open,
	handleOpenDialog,
	handleCloseDialog,
	handleCoverDialog,
	handleClearDialog,
	handleConfirmDialog,
	handleCloseText = "取消",
	haveValue,
	isDirty,
	children,
}) => {
	return (
		<>
			<Tooltip title="搜尋篩選器">
				<IconButton aria-label="Filter" onClick={handleOpenDialog}>
					<Badge color="error" variant="dot" invisible={haveValue}>
						<TuneIcon />
					</Badge>
				</IconButton>
			</Tooltip>

			<Dialog
				sx={{ "& .MuiDialog-paper": { width: "90%", maxHeight: 500, margin: "1rem" } }}
				maxWidth="xs"
				open={open}
				onClose={handleCloseDialog}>
				<DialogTitle>搜尋篩選器</DialogTitle>
				<DialogContent dividers>{children}</DialogContent>
				<DialogActions>
					<Button onClick={handleCloseDialog} autoFocus>
						{handleCloseText}
					</Button>
					{handleCoverDialog && (
						<Button onClick={handleCoverDialog} disabled={!isDirty}>
							恢復
						</Button>
					)}
					{handleClearDialog && (
						<Button onClick={handleClearDialog} disabled={haveValue}>
							重置
						</Button>
					)}
					{handleConfirmDialog && (
						<Button onClick={handleConfirmDialog} disabled={!isDirty}>
							確認
						</Button>
					)}
				</DialogActions>
			</Dialog>
		</>
	);
};

export default Search;
