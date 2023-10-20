import React, { useEffect, useState } from "react";
import PageTitle from "../../components/Guideline/PageTitle";
import FloatingActionButton from "../../components/FloatingActionButton/FloatingActionButton";
import TableTabber from "../../components/Tabbar/TableTabber";
import RWDTable from "../../components/RWDTable/RWDTable";
import AddIcon from "@mui/icons-material/Add";
import FolderCopyIcon from "@mui/icons-material/FolderCopy";
import WorkHistoryIcon from "@mui/icons-material/WorkHistory";
import EditIcon from "@mui/icons-material/Edit";
import { faCirclePlus, faCopy } from "@fortawesome/free-solid-svg-icons";
import { postData, getData } from "../../utils/api";

const Sites = () => {
	// ApiUrl
	const apiUrl = "site?p=1&s=10";
	// cat = Category 設置 tab 分類
	const [cat, setCat] = useState(null);
	// ApiData
	const [apiData, setApiData] = useState(null);
	// isLoading
	const [isLoading, setIsLoading] = useState(false);
	const tabGroup = [
		{ f: "", text: "全部" },
		{ f: "inprogress", text: "進行中" },
		{ f: "unstarted", text: "尚未開始" },
		{ f: "end", text: "已結束" },
	];
	const btnGroup = [
		{
			icon: faCirclePlus,
			text: "新增案場",
			variant: "contained",
			color: "primary",
			onClick: () => handleAdd(),
			fabVariant: "success",
			fab: <AddIcon fontSize="large" />,
		},
		{
			icon: faCopy,
			text: "輸出派工清單",
			variant: "contained",
			color: "secondary",
			onClick: () => handleExport(),
			fabVariant: "warning",
			fab: <FolderCopyIcon fontSize="large" />,
		},
	];

	const columns = [
		{ key: "id", label: "ID" },
		{ key: "name", label: "案場" },
	];
	// edit = 編輯案場名稱 ,dw = dispatch work 明日派工清單
	const actions = [
		{ value: "edit", icon: <EditIcon /> },
		{ value: "dw", icon: <WorkHistoryIcon /> },
	];

	useEffect(() => {
		getApiList(apiUrl);
	}, [apiUrl]);

	const getApiList = (url) => {
		setIsLoading(true);
		getData(url).then((result) => {
			setIsLoading(false);
			const data = result.result;
			setApiData(data);
		});
	};

	const handleAdd = () => {
		console.log("新增案場被點擊");
	};

	const handleExport = () => {
		console.log("輸出派工清單被點擊");
	};

	return (
		<>
			{/* PageTitle */}
			<PageTitle title="案場" btnGroup={btnGroup} />

			{/* TabBar */}
			<TableTabber tabGroup={tabGroup} setCat={setCat} />

			{/* Content */}

			<div className="overflow-y-auto">
				{/* {apiData && <pre>{JSON.stringify(apiData, null, 2)}</pre>} */}
				<RWDTable data={apiData} columns={columns} actions={actions} tableMinWidth={600} isLoading={isLoading} />
			</div>

			{/* Floating Action Button */}
			<FloatingActionButton btnGroup={btnGroup} />
		</>
	);
};

export default Sites;
