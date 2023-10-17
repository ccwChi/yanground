import React, { useEffect, useState } from "react";
import PageTitle from "../../components/Guideline/PageTitle";
import { faCirclePlus, faCopy } from "@fortawesome/free-solid-svg-icons";
import { postData, getData } from "../../utils/api";

const Sites = () => {
	const btnGroup = [
		{
			icon: faCirclePlus,
			text: "新增案場",
			variant: "contained",
			color: "primary",
			onClick: () => handleAdd(),
		},
		{
			icon: faCopy,
			text: "輸出派工清單",
			variant: "contained",
			color: "secondary",
			onClick: () => handleExport(),
		},
	];

	const handleAdd = () => {
		console.log("新增案場被點擊");
	};

	const handleExport = () => {
		console.log("輸出派工清單被點擊");
	};

	// const [postDataResult, setPostDataResult] = useState(null);
	// const [getDataResult, setGetDataResult] = useState(null);

	// const handlePostClick = () => {
	// 	const url = "https://api.yuanrong-tech.com.tw/project/7044555410912577110";
	// 	const data = {
	// 		name: "AAAB",
	// 		administrativeDivision: "",
	// 		street: "AAAB",
	// 		businessRepresentative: "7030915114245031340",
	// 	};

	// 	postData(url, data).then((result) => setPostDataResult(result));
	// };

	// const handleGetClick = () => {
	// 	const url = "https://api.yuanrong-tech.com.tw/project";

	// 	getData(url).then((result) => setGetDataResult(result));
	// };

	return (
		<div>
			<PageTitle title="案場" btnGroup={btnGroup} />

			{/* <button onClick={handlePostClick}>發送 POST 請求</button>
			<button onClick={handleGetClick}>發送 GET 請求</button>

			{postDataResult && (
				<div>
					<h2>POST 請求結果</h2>
					<pre>{JSON.stringify(postDataResult, null, 2)}</pre>
				</div>
			)}

			{getDataResult && (
				<div>
					<h2>GET 請求結果</h2>
					<pre>{JSON.stringify(getDataResult, null, 2)}</pre>
				</div>
			)} */}
		</div>
	);
};

export default Sites;
