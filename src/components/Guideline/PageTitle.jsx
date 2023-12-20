import React from "react";
import Search from "../Search/Search";
import Button from "@mui/material/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faQuoteLeft } from "@fortawesome/free-solid-svg-icons";

const PageTitle = ({
	title,
	btnGroup,
	handleActionClick,
	isLoading = true,
	children,
	searchMode = false,
	// 下面參數前提都是 searchMode = true
	searchDialogOpen,
	handleOpenDialog,
	handleCloseDialog,
	handleCoverDialog,
	handleClearDialog,
	handleConfirmDialog,
	handleCloseText,
	haveValue,
	isDirty,
}) => {
	return (
		<div className={"relative hidden sm:flex justify-between text-primary-800 mb-3 pt-2 md:px-6 lg:px-8 px-5 pb-6"}>
			<div className="inline-flex items-center gap-2 pe-2">
				{/* Title */}
				<FontAwesomeIcon icon={faQuoteLeft} style={{ fontSize: "1.875rem" }} />
				<span className="font-bold text-2xl leading-10">{title}</span>
				{/* 如果搜尋模式開啟 (searchMode=true) 就會出現篩選器 */}
				{searchMode && (
					<Search
						open={searchDialogOpen}
						handleOpenDialog={handleOpenDialog}
						handleCloseDialog={handleCloseDialog}
						handleCoverDialog={handleCoverDialog}
						handleClearDialog={handleClearDialog}
						handleConfirmDialog={handleConfirmDialog}
						handleCloseText={handleCloseText}
						haveValue={haveValue}
						isDirty={isDirty}>
						{children}
					</Search>
				)}
				{/* 裝飾物 */}
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
				{/* 右側按鈕群組 */}
				{btnGroup &&
					btnGroup.map(
						(btn) =>
							btn.icon && (
								<Button
									key={btn.text}
									variant={btn.variant}
									color={btn.color}
									className="gap-1.5 !ease-in-out !duration-300"
									style={{ transform: "translateY(1rem)" }}
									sx={{ fontSize: "1rem" }}
									data-mode={btn.mode}
									onClick={handleActionClick}
									disabled={!isLoading}>
									{/* <FontAwesomeIcon icon={btn.icon} className="pe-2" /> */}
									{btn.icon}
									{btn.text}
								</Button>
							)
					)}
			</div>
		</div>
	);
};

export default PageTitle;
