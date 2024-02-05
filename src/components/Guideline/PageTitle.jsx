import React from "react";
// FontAwesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faQuoteLeft } from "@fortawesome/free-solid-svg-icons";
// MUI
import Button from "@mui/material/Button";
// Customs
import Search from "../Search/Search";
import Quiz from "../HelpQuestion/Quiz";

/**
 * 頁面標題元件
 * @param {string} title - 標題文字
 * @param {string} description - 標題描述，預設為空字串
 * @param {ReactNode} btnGroup - 按鈕群組元件
 * @param {function} handleActionClick - 點擊動作處理函數
 * @param {boolean} isLoading - 是否處於載入狀態，預設為 true
 * @param {ReactNode} children - 子元件
 * @param {boolean} searchMode - 搜尋模式開啟或關閉，預設為 false
 * @param {boolean} searchDialogOpen - 搜尋對話框是否開啟
 * @param {function} handleOpenDialog - 開啟對話框處理函數
 * @param {function} handleCloseDialog - 關閉對話框處理函數
 * @param {function} handleCoverDialog - 覆蓋對話框處理函數
 * @param {function} handleClearDialog - 清除對話框處理函數
 * @param {function} handleConfirmDialog - 確認對話框處理函數
 * @param {string} handleCloseText - 關閉按鈕文字
 * @param {boolean} haveValue - 是否有值
 * @param {boolean} isDirty - 是否修改過
 * @param {boolean} quizMode - QA模式開啟或關閉，預設為 false
 * @param {string} quizContent - QA內容
 * @param {string} quizModalSize - QA對話框大小，預設為 "439px"
 * @param {function} quizModalClose - 關閉QA對話框處理函數
 * @returns
 */
const PageTitle = ({
	title,
	description = "",
	btnGroup,
	handleActionClick,
	isLoading = true,
	children,
	// 搜尋模式
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
	// 說明顯示
	quizMode = false,
	// 下面參數前提都是 quizMode = true
	quizContent,
	quizModalSize = "439px",
	quizModalClose,
}) => {
	return (
		<div className={"relative hidden sm:flex justify-between text-primary-800 mb-3 pt-2 md:px-6 lg:px-8 px-5 pb-6"}>
			<div className="pe-2 w-full">
				{/* Title */}
				<div className="flex flex-col">
					<div className="flex items-center justify-between gap-2">
						<div className="inline-flex items-center gap-2">
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
							{quizMode && <Quiz content={quizContent} maxWidth={quizModalSize} otherCloseFun={quizModalClose} />}
						</div>
						{/* 右側按鈕群組 */}
						<div className="inline-flex gap-2">
							{btnGroup &&
								btnGroup.map(
									(btn) =>
										btn.icon && (
											<Button
												key={btn.text}
												variant={btn.variant}
												color={btn.color}
												className="gap-1.5 !ease-in-out !duration-300"
												style={{ transform: "translateY(-0.15rem)" }}
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
					{!!description && <p className="max-w-screen-md break-words text-sm">{description}</p>}
				</div>
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
		</div>
	);
};

export default PageTitle;
