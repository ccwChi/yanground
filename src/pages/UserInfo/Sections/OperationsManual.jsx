import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
// https://mui.com/x/api/tree-view/tree-item/
// https://github.com/mui/material-ui/issues/19953
// MUI
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
// npm i @mui/x-tree-view
import { styled, useTheme } from "@mui/material/styles";
import { TreeView } from "@mui/x-tree-view/TreeView";
import { TreeItem, treeItemClasses } from "@mui/x-tree-view/TreeItem";
// Custom
import MarkdownView from "../../../components/MarkdownView";

const contentsList = [
	{
		id: 0,
		label: "測試1",
		md: "xxx",
	},
	{
		id: 1,
		label: "測試2",
		children: [
			{
				id: 2,
				label: "2-1",
				md: "ooo",
			},
		],
	},
	{
		id: 5,
		label: "測試3",
		children: [
			{
				id: 10,
				label: "3-1",
				md: "ggg",
			},
			{
				id: 6,
				label: "測試3-2",
				children: [
					{
						id: 8,
						label: "3-2-1",
						md: "rrr",
					},
					{
						id: 9,
						label: "3-2-2",
						md: "ttt",
					},
				],
			},
		],
	},
];

const StyledTreeItemRoot = styled(TreeItem)(({ theme }) => ({
	color: theme.palette.text.secondary,
	[`& .${treeItemClasses.content}`]: {
		paddingRight: theme.spacing(1),
		color: theme.palette.text.secondary,
		borderTopRightRadius: theme.spacing(2),
		borderBottomRightRadius: theme.spacing(2),
		"&:hover": {
			backgroundColor: theme.palette.action.hover,
		},
		"&.Mui-focused, &.Mui-selected, &.Mui-selected.Mui-focused": {
			backgroundColor: "transparent",
		},
		[`& .${treeItemClasses.label}`]: {
			fontWeight: "inherit",
			color: "inherit",
		},
	},
	[`&.active .${treeItemClasses.content}`]: {
		fontWeight: theme.typography.fontWeightMedium,
		color: "var(--tree-view-color)",
		backgroundColor: `var(--tree-view-bg-color, ${theme.palette.action.selected}) !important`,
	},
	[`& .${treeItemClasses.group}`]: {
		marginLeft: "0",
		[`& .${treeItemClasses.content}`]: {
			paddingLeft: theme.spacing(2),
		},
	},
}));

const OperationsManual = () => {
	const theme = useTheme();
	const markdownRef = useRef(null);
	const navigate = useNavigate();
	// 解析網址取得參數
	const location = useLocation();
	const queryParams = new URLSearchParams(location.search);
	const [markdownContent, setMarkdownContent] = useState("");

	useEffect(() => {
		import(`../../../datas/om1/${queryParams.get("md") || "xxx"}.md`)
			.then((res) => {
				fetch(res.default)
					.then((res) => res.text())
					.then((res) => setMarkdownContent(res))
					.catch((err) => console.error(err));
			})
			.catch((err) => console.error(err));
	}, [queryParams]);

	const renderTreeItems = (nodes) => {
		const styleProps = {
			"--tree-view-color": theme.palette.mode !== "dark" ? theme.palette.primary.main : theme.palette.primary.main,
			"--tree-view-bg-color": theme.palette.mode !== "dark" ? "#DBE8F9" : "#DBE8F9",
		};

		return nodes.map((node) => (
			<StyledTreeItemRoot
				key={node.id}
				nodeId={node.id.toString()}
				label={
					<div
						onClick={(event) => {
							// event.stopPropagation();
							if (node.md) {
								queryParams.set("md", node.md);
								const newSearch = queryParams.toString();
								navigate(`?${newSearch}`);
							}
							markdownRef.current.scrollTop = 0;
						}}>
						{node.label}
					</div>
				}
				style={styleProps}
				className={queryParams.get("md") === node.md && "active"}>
				{node.children && renderTreeItems(node.children)}
			</StyledTreeItemRoot>
		));
	};
	return (
		<div className="flex md:flex-row flex-col overflow-auto">
			<TreeView
				aria-label="file system navigator"
				defaultCollapseIcon={<ExpandMoreIcon color="primary" />}
				defaultExpandIcon={<ChevronRightIcon color="primary" />}
				defaultEndIcon={<div style={{ width: 24 }} />}
				sx={{ width: "calc(100% - 2rem)", m: 2, p: 1 }}
				className="md:max-w-[200px] md:overflow-y-auto bg-white rounded h-min">
				{renderTreeItems(contentsList)}
			</TreeView>
			<div
				className="custom-html-style flex-1 scroll-smooth md:overflow-y-auto text-base leading-normal mt-4 pt-4 px-4 sm:mb-4 sm:me-4 sm:pb-3 pb-16 bg-white rounded"
				ref={markdownRef}>
				<MarkdownView text={markdownContent} />
			</div>
		</div>
	);
};

export default OperationsManual;
