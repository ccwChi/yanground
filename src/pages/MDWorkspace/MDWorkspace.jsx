import React, { useState, useRef } from "react";
import Editor, { Plugins } from "react-markdown-editor-lite";
// MUI
import UploadIcon from "@mui/icons-material/Upload";
// Component
import MarkdownView from "../../components/MarkdownView";
import PageTitle from "../../components/Guideline/PageTitle";
// Hooks
import { useNotification } from "../../hooks/useNotification";

const MDWorkspace = () => {
	const showNotification = useNotification();
	const [markdownContent, setMarkdownContent] = useState("");
	const fileInputRef = useRef(null);
	const mdEditor = useRef(null);

	Editor.unuse(Plugins.FontUnderline);
	Editor.unuse(Plugins.BlockWrap);
	Editor.addLocale("zh-TW", {
		btnHeader: "標頭",
		btnBold: "粗體",
		btnItalic: "斜體",
		btnStrikethrough: "刪除線",
		btnUnordered: "無序列表",
		btnOrdered: "有序列表",
		btnQuote: "引用",
		btnTable: "表格",
		btnImage: "圖片上傳",
		btnLink: "超連結",
		btnClear: "清除",
		btnUndo: "撤銷",
		btnRedo: "重做",
		btnMode: "顯示模式切換",
		btnFullscreen: "全螢幕模式切換",
	});
	Editor.useLocale("zh-TW");

	// 上方區塊功能按鈕清單
	const btnGroup = [
		{
			mode: "upload",
			icon: <UploadIcon fontSize="small" />,
			text: "上傳 .md",
			variant: "contained",
			color: "primary",
			fabVariant: "success",
			fab: <UploadIcon fontSize="large" />,
		},
	];

	// 當活動按鈕點擊時動作
	const handleActionClick = (event) => {
		event.stopPropagation();
		const dataMode = event.currentTarget.getAttribute("data-mode");
		switch (dataMode) {
			case "upload":
				fileInputRef.current.click();
				break;
			default:
				break;
		}
	};

	const handleFileInputChange = (e) => {
		var fileTypes = ["md"]; //acceptable file types
		const file = e.target.files[0];

		if (file) {
			var extension = file.name.split(".").pop().toLowerCase(), // file extension from input file
				isSuccess = fileTypes.indexOf(extension) > -1; // is extension in acceptable types

			if (isSuccess) {
				const reader = new FileReader();

				reader.onload = (event) => {
					const content = event.target.result;
					setMarkdownContent(content);
				};

				reader.readAsText(file);

				showNotification(`檔案「${file.name}」讀取成功！`, true);
			} else {
				showNotification("檔案類型錯誤，僅接受 .md 格式。", false);
			}
		}
	};

	// const handleClick = () => {
	// 	if (mdEditor.current) {
	// 		alert(mdEditor.current.getMdValue());
	// 	}
	// };

	const handleEditorChange = ({ text }) => {
		setMarkdownContent(text);
	};

	return (
		<>
			{/* PageTitle */}
			<input type="file" ref={fileInputRef} style={{ display: "none" }} accept=".md" onChange={handleFileInputChange} />
			<PageTitle title="MD 文稿工作區" btnGroup={btnGroup} handleActionClick={handleActionClick} />
			{/* <button onClick={handleClick}>Get value</button> */}

			{/* Markdown */}
			<Editor
				ref={mdEditor}
				value={markdownContent}
				placeholder={"請在這裡輸入文字... (採用 markdown 語法)"}
				className="flex-1 !z-[1025] sm:-mb-4 overflow-hidden"
				onChange={handleEditorChange}
				// plugins={PLUGINS}
				renderHTML={(text) => <MarkdownView text={text} />}
			/>
		</>
	);
};

export default MDWorkspace;

// const PLUGINS = [
// 	"header",
// 	"font-bold",
// 	"font-italic",
// 	"font-strikethrough",
// 	"list-unordered",
// 	"list-ordered",
// 	"block-quote",
// 	"block-code-inline",
// 	"block-code-block",
// 	"table",
// 	"link",
// 	"clear",
// 	"logger",
// 	"mode-toggle",
// 	"full-screen",
// ];
