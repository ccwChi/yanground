import React, { useState } from "react";
// MUI
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import QuizIcon from "@mui/icons-material/Quiz";
// Component
import ModalTemplete from "../../components/Modal/ModalTemplete";

const Quiz = ({ content, maxWidth, otherCloseFun }) => {
	const [show, setShow] = useState(false);
	return (
		<>
			<Tooltip title="說明">
				{/* <IconButton aria-label="Quiz"> */}
				<QuizIcon className="text-neutral-500 cursor-pointer" onClick={() => setShow(true)} />
				{/* </IconButton> */}
			</Tooltip>
			{/* Modal */}
			<ModalTemplete
				title={"說明"}
				show={show}
				onClose={() => {
					setShow(false);
					otherCloseFun();
				}}
				maxWidth={maxWidth}>
				{content}
			</ModalTemplete>
		</>
	);
};

export default Quiz;
