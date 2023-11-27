import React from "react";
import useMediaQuery from "@mui/material/useMediaQuery";
import Backdrop from "@mui/material/Backdrop";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";

function ModalTemplete({ title, show, onClose, maxWidth = 439, children }) {
	const isSmallScreen = useMediaQuery("(max-width:575.98px)");
	return (
		<Modal
			aria-labelledby="transition-modal-title"
			aria-describedby="transition-modal-description"
			open={show}
			// onClose={handleClose}
			closeAfterTransition
			slots={{ backdrop: Backdrop }}
			slotProps={{
				backdrop: {
					timeout: 250,
				},
			}}>
			<Box
				sx={{
					position: "absolute",
					m: "0.5rem",
					px: isSmallScreen ? 2.5 : 4,
					py: 4,
					top: "50%",
					left: "calc(50% - 0.5rem)",
					width: "calc(100% - 1rem)",
					maxWidth: maxWidth,
					transform: "translate(-50%, -50%)",
					bgcolor: "background.paper",
					borderRadius: "20px",
					boxShadow: "0px 12px 20px 0px rgba(0, 0, 0, 0.25)",
				}}>
				<div className="relative">
					<h3 className="text-xl font-bold px-8 pb-4 text-center text-primary-800 border-b border-neutral-300">
						{title}
					</h3>
					<IconButton
						className="-translate-y-1.5"
						aria-label="close modal"
						onClick={onClose}
						sx={{ position: "absolute", top: 0, right: 0 }}>
						<CloseIcon />
					</IconButton>
				</div>
				{children}
			</Box>
		</Modal>
	);
}

export default ModalTemplete;
