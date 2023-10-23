import React from "react";
import Button from "@mui/material/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faQuoteLeft } from "@fortawesome/free-solid-svg-icons";

const Sites = ({ title, btnGroup, handleActionClick, children }) => {
	return (
		<div
			className={"relative hidden sm:flex justify-between text-primary-800 mb-3"}
			style={{ padding: "1.25rem 2rem 1.5rem" }}>
			<div className="inline-flex items-center gap-2">
				<FontAwesomeIcon icon={faQuoteLeft} style={{ fontSize: "1.875rem" }} />
				<span className="font-bold text-2xl leading-10">{title}</span>
				<svg
					className="absolute start-0 bottom-0"
					xmlns="http://www.w3.org/2000/svg"
					width="178"
					height="12"
					viewBox="0 0 178 12"
					fill="none">
					<rect x="98" width="80" height="12" fill="#547DB7" />
					<rect x="38" width="60" height="12" fill="#F7941D" />
					<rect width="40" height="12" fill="#039E8E" />
				</svg>
			</div>
			<div className="inline-flex gap-2">
				{btnGroup &&
					btnGroup.map((btn) => (
						<Button
							key={btn.text}
							variant={btn.variant}
							color={btn.color}
							className="gap-1.5"
							style={{ transform: "translateY(1rem)" }}
							sx={{ fontSize: "1rem" }}
							data-mode={btn.mode}
							onClick={handleActionClick}>
							{/* <FontAwesomeIcon icon={btn.icon} className="pe-2" /> */}
							{btn.icon}
							{btn.text}
						</Button>
					))}
				{children}
			</div>
		</div>
	);
};

export default Sites;
