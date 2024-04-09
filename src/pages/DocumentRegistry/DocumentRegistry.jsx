import React from "react";

// fontAwesome
import { faCircleCheck, faCircleXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// Component
import PageTitle from "../../components/Guideline/PageTitle";

const DocumentRegistry = () => {
	return (
		<>
			{/* PageTitle */}
			<PageTitle
				title="專管文件總表"
				description={"此頁面是用於專案文件總表管理，讓用戶可以編輯各個子項目的工程類型，以及新增子項目。"}
			/>

			<div className="flex-1 sm:-mb-4 custom_table overflow-x-auto">
				<table className="w-max max-w-none min-w-full">
					<thead>
						<tr>
							<th width="40" rowSpan="2"></th>
							<th width="120" rowSpan="2">
								項目
							</th>
							<th width="140" rowSpan="2">
								類別
							</th>
							<th width="250" rowSpan="2">
								子項目
							</th>
							<th colSpan="10">工程類型</th>
						</tr>
						<tr>
							<th width="110">屋頂型光電</th>
							<th width="110">地面型光電</th>
							<th width="110">圳溝型光電</th>
							<th width="110">漁電型光電</th>
							<th width="110">基樁工程</th>
							<th width="110">土木工程</th>
							<th width="110">養殖池工程</th>
							<th width="110">修補案場</th>
							<th width="110">標案</th>
							<th width="110">地質鑽探</th>
						</tr>
					</thead>
					<tbody>
						{[...Array(20)].map((_, index) => (
							<tr key={index}>
								<td className="!text-xs !px-1 text-center">{index}</td>
								<td>工程/工務(E)</td>
								<td>合約/承諾書(C)</td>
								<td>交流配電箱電性測試紀錄表(AC)</td>
								<td className="!p-0 h-full">
									<button type="button" className="w-full min-h-[50px]">
										<FontAwesomeIcon icon={faCircleCheck} className="text-secondary-50" fontSize={"28px"} />
									</button>
								</td>
								<td className="!p-0 h-full">
									<button type="button" className="w-full min-h-[50px]">
										<FontAwesomeIcon icon={faCircleCheck} className="text-secondary-50" fontSize={"28px"} />
									</button>
								</td>
								<td className="!p-0 h-full">
									<button type="button" className="w-full min-h-[50px]">
										<FontAwesomeIcon icon={faCircleCheck} className="text-secondary-50" fontSize={"28px"} />
									</button>
								</td>
								<td className="!p-0 h-full">
									<button type="button" className="w-full min-h-[50px]">
										<FontAwesomeIcon icon={faCircleCheck} className="text-secondary-50" fontSize={"28px"} />
									</button>
								</td>
								<td className="!p-0 h-full">
									<button type="button" className="w-full min-h-[50px]">
										<FontAwesomeIcon icon={faCircleXmark} className="text-quinary-50" fontSize={"28px"} />
									</button>
								</td>
								<td className="!p-0 h-full">
									<button type="button" className="w-full min-h-[50px]">
										<FontAwesomeIcon icon={faCircleXmark} className="text-quinary-50" fontSize={"28px"} />
									</button>
								</td>
								<td className="!p-0 h-full">
									<button type="button" className="w-full min-h-[50px]">
										<FontAwesomeIcon icon={faCircleCheck} className="text-secondary-50" fontSize={"28px"} />
									</button>
								</td>
								<td className="!p-0 h-full">
									<button type="button" className="w-full min-h-[50px]">
										<FontAwesomeIcon icon={faCircleCheck} className="text-secondary-50" fontSize={"28px"} />
									</button>
								</td>
								<td className="!p-0 h-full">
									<button type="button" className="w-full min-h-[50px]">
										<FontAwesomeIcon icon={faCircleCheck} className="text-secondary-50" fontSize={"28px"} />
									</button>
								</td>
								<td className="!p-0 h-full">
									<button type="button" className="w-full min-h-[50px]">
										<FontAwesomeIcon icon={faCircleXmark} className="text-quinary-50" fontSize={"28px"} />
									</button>
								</td>
							</tr>
						))}
						{[...Array(200)].map((_, index) => (
							<tr key={index}>
								<td></td>
								<td></td>
								<td></td>
								<td></td>
								<td></td>
								<td></td>
								<td></td>
								<td></td>
								<td></td>
								<td></td>
								<td></td>
								<td></td>
								<td></td>
								<td></td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</>
	);
};

export default DocumentRegistry;
