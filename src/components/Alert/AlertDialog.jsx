import React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

const AlertDialog = ({ open, onClose, icon, title, content, disagreeText, agreeText }) => {
	const handleClose = (agree) => {
		onClose(agree);
	};

	return (
		<Dialog
			open={open}
			onClose={() => handleClose(false)}
			aria-labelledby="alert-dialog-title"
			aria-describedby="alert-dialog-description">
			<DialogTitle id="alert-dialog-title" className="flex items-center gap-1">
				{icon} {title}
			</DialogTitle>
			<DialogContent>
				<DialogContentText id="alert-dialog-description">{content}</DialogContentText>
			</DialogContent>
			<DialogActions>
				<Button onClick={() => handleClose(false)}>{disagreeText}</Button>
				<Button onClick={() => handleClose(true)} autoFocus>
					{agreeText}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default AlertDialog;
