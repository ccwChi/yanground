import React, { useRef } from "react";
import Editor, { Plugins } from "react-markdown-editor-lite";
import MarkdownView from "../../components/MarkdownView";

Editor.unuse(Plugins.FontUnderline);
Editor.unuse(Plugins.BlockWrap);

const MDWorkspace = () => {
	const mdEditor = useRef(null);

	const handleClick = () => {
		if (mdEditor.current) {
			alert(mdEditor.current.getMdValue());
		}
	};

	return (
		<>
			{/* <button onClick={handleClick}>Get value</button> */}
			<Editor
				ref={mdEditor}
				className="flex-1 !z-[1060] -mb-4 overflow-hidden"
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
