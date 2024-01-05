import React from "react";
// npm i react-markdown
import ReactMarkdown from "react-markdown";
// 第一個新增了對刪除線、表格、任務清單和 URL 的支援, 第二個為支援 HTML
// npm i remark-gfm
import remarkGfm from "remark-gfm";
// npm i rehype-raw
import rehypeRaw from "rehype-raw";
// npm i react-syntax-highlighter
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dark } from "react-syntax-highlighter/dist/esm/styles/prism";

const MarkdownView = ({ text }) => {
	return (
		<ReactMarkdown
			children={text}
			rehypePlugins={[rehypeRaw]}
			remarkPlugins={[remarkGfm]}
			components={{
				code(props) {
					const { children, className, node, ...rest } = props;
					const match = /language-(\w+)/.exec(className || "");
					return match ? (
						<SyntaxHighlighter
							{...rest}
							PreTag="div"
							children={String(children).replace(/\n$/, "")}
							language={match[1]}
							style={dark}
						/>
					) : (
						<code {...rest} className={className}>
							{children}
						</code>
					);
				},
			}}
		/>
	);
};

export default MarkdownView;
