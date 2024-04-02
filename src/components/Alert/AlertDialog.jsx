import React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

const AlertDialog = ({ open, onClose, icon, title, content, disagreeText, agreeText, children, ...otherProps }) => {
	const handleClose = (agree) => {
		onClose(agree);
	};

	return (
		<Dialog
			open={!!open}   //改個強迫轉bool 不然個人請假頁面log會出現紅色警訊
			onClose={() => handleClose(false)}
			aria-labelledby="alert-dialog-title"
			aria-describedby="alert-dialog-description"
			{...otherProps}>
			<DialogTitle id="alert-dialog-title" className="flex items-center gap-1">
				{icon} {title}
			</DialogTitle>
			<DialogContent>
				<DialogContentText id="alert-dialog-description">
					{content}
					{children}
				</DialogContentText>
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
