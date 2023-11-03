import React, { useEffect, useState, useCallback } from "react";
import ModalTemplete from "../../components/Modal/ModalTemplete";
import InputTitle from "../../components/Guideline/InputTitle";
import AlertDialog from "../../components/Alert/AlertDialog";
import ControlledDatePicker from "../../components/DatePicker/ControlledDatePicker";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import FormHelperText from "@mui/material/FormHelperText";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { useForm, FormProvider, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { getData } from "../../utils/api";
import { format } from "date-fns";
const ITEM_HEIGHT = 36;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
	PaperProps: {
		style: {
			maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
			Width: 250,
		},
	},
};

const UpdatedModal = React.memo(({ title, deliverInfo, sendDataToBackend, onClose }) => {
	// Alert 開關
	const [alertOpen, setAlertOpen] = useState(false);
	// 人員清單
	const [userList, setUserList] = useState(null);
	// 專案清單
	const [projectList, setProjectList] = useState(null);

	// 初始預設 default 值
	const defaultValues = {
		dispatchedOn: deliverInfo ? new Date(deliverInfo.dispatchedOn) : new Date(),
		project: deliverInfo ? deliverInfo.project.id : "",
		content: deliverInfo ? deliverInfo.content : "",
		department: "業務部",
		applicant: deliverInfo ? deliverInfo.applicant.id : "",
	};

	// 使用 Yup 來定義表單驗證規則
	const schema = yup.object().shape({
		dispatchedOn: yup.string().required("不可為空值！"),
		project: yup.string().required("不可為空值"),
		applicant: yup.string().required("不可為空值"),
	});

	// 使用 useForm Hook 來管理表單狀態和驗證
	const methods = useForm({
		defaultValues,
		resolver: yupResolver(schema),
	});

	const {
		control,
		handleSubmit,
		watch,
		formState: { errors, isDirty },
	} = methods;
	const projectId = watch("project");

	// 取得專案資料
	useEffect(() => {
		getData("project?p=1&s=100").then((result) => {
			const data = result.result.content;
			setProjectList(data);
		});
		getData("department/5/staff").then((result) => {
			const data = result.result;
			setUserList(data);
		});
	}, []);

	// 提交表單資料到後端並執行相關操作
	const onSubmit = (data) => {
		const fd = new FormData();
		fd.append("dispatchedOn", format(new Date(data.dispatchedOn), "yyyy-MM-dd"));
		fd.append("department", "5");
		delete data.dispatchedOn;
		delete data.department;
		for (let key in data) {
			fd.append(key, data[key]);
		}

		if (deliverInfo) {
			sendDataToBackend(fd, "edit", deliverInfo.id);
		} else {
			sendDataToBackend(fd, "create");
		}
	};

	// 檢查表單是否汙染
	const onCheckDirty = () => {
		if (isDirty) {
			setAlertOpen(true);
		} else {
			onClose();
		}
	};

	// Alert 回傳值進行最終結果 --- true: 關閉 modal / all: 關閉 Alert
	const handleAlertClose = (agree) => {
		if (agree) {
			onClose();
		}
		setAlertOpen(false);
	};

	const getAddressByProjectId = useCallback((projectList, projectIdToFind) => {
		const foundProject = projectList?.find((project) => project.id === projectIdToFind);

		if (foundProject) {
			const administrativeDivision = foundProject.administrativeDivision;
			if (administrativeDivision) {
				const cityName = administrativeDivision.administeredBy.name;
				const districtName = administrativeDivision.name;
				return `${cityName}${districtName}`;
			}
		}

		return null;
	}, []);

	return (
		<>
			{/* Modal */}
			<ModalTemplete title={title} show={!!projectList && !!userList} maxWidth={"640px"} onClose={onCheckDirty}>
				<FormProvider {...methods}>
					<form onSubmit={handleSubmit(onSubmit)}>
						<div className="flex flex-col pt-4 gap-4">
							<div className="flex flex-col overflow-y-auto px-1 pb-2" style={{ maxHeight: "60vh" }}>
								{/* 日期 */}
								<div className="mb-5">
									<InputTitle title={"申請日期"} />
									<ControlledDatePicker name="dispatchedOn" />
								</div>
								{/* 專案名稱 & 地點 */}
								<div className="inline-flex sm:flex-row flex-col sm:gap-2 gap-0 mb-5 sm:mb-0">
									<div className="w-full">
										<InputTitle title={"工程名稱"} />
										<Controller
											name="project"
											control={control}
											render={({ field }) => (
												<Select
													error={!!errors["project"]?.message}
													className="inputPadding"
													displayEmpty
													{...field}
													fullWidth
													MenuProps={MenuProps}>
													<MenuItem value="" disabled>
														<span className="text-neutral-400 font-light">請選擇工程項目</span>
													</MenuItem>
													{projectList.map((project) => (
														<MenuItem key={project.id} value={project.id}>
															{project.name}
														</MenuItem>
													))}
												</Select>
											)}
										/>
										<FormHelperText
											className="!text-red-600 break-words !text-right !mt-0"
											sx={{ minHeight: "1.25rem" }}>
											{errors["project"]?.message}
										</FormHelperText>
									</div>
									<div className="w-full">
										<InputTitle title={"工程地點"} required={false} />
										<TextField
											error={!!errors["project"]?.message}
											variant="outlined"
											size="small"
											className="inputPadding"
											value={getAddressByProjectId(projectList, projectId)}
											fullWidth
											inputProps={{ readOnly: true }}
										/>
									</div>
								</div>
								{/* 部門 & 申請人 */}
								<div className="inline-flex sm:flex-row flex-col sm:gap-2 gap-0 mb-5 sm:mb-0">
									<div className="w-full">
										<InputTitle title={"派工部門"} required={false} />
										<Controller
											name="department"
											control={control}
											render={({ field }) => (
												<TextField
													variant="outlined"
													size="small"
													className="inputPadding"
													fullWidth
													inputProps={{ readOnly: true }}
													{...field}
												/>
											)}
										/>
									</div>
									<div className="w-full">
										<InputTitle title={"申請人"} />
										<Controller
											name="applicant"
											control={control}
											render={({ field }) => (
												<Select
													error={!!errors["applicant"]?.message}
													className="inputPadding"
													displayEmpty
													{...field}
													fullWidth
													MenuProps={MenuProps}>
													<MenuItem value="" disabled>
														<span className="text-neutral-400 font-light">請選擇申請人</span>
													</MenuItem>
													{userList.map((user) => (
														<MenuItem key={user.id} value={user.id}>
															{user.nickname}
														</MenuItem>
													))}
												</Select>
											)}
										/>
										<FormHelperText
											className="!text-red-600 break-words !text-right !mt-0"
											sx={{ minHeight: "1.25rem" }}>
											{errors["applicant"]?.message}
										</FormHelperText>
									</div>
								</div>
								{/* 內容 */}
								<div className="w-full">
									<InputTitle title={"工程內容"} required={false} />
									<Controller
										name="content"
										control={control}
										render={({ field }) => (
											<TextField
												multiline
												rows={3}
												content="true"
												fullWidth
												InputProps={{
													inputProps: { maxLength: 300 },
												}}
												{...field}
											/>
										)}
									/>
								</div>
							</div>
							<Button type="submit" variant="contained" color="success" className="!text-base !h-12" fullWidth>
								儲存
							</Button>
						</div>
					</form>
				</FormProvider>
			</ModalTemplete>

			{/* Alert */}
			<AlertDialog
				open={alertOpen}
				onClose={handleAlertClose}
				icon={<ReportProblemIcon color="secondary" />}
				title="注意"
				content="您所做的變更尚未儲存。是否確定要關閉表單？"
				disagreeText="取消"
				agreeText="確定"
			/>
		</>
	);
});

const AddDispatcherModal = React.memo(({ title, deliverInfo, sendDataToBackend, onClose }) => {
	// 檢查是否被汙染
	const [isDirty, setIsDirty] = useState(false);
	// Alert 開關
	const [alertOpen, setAlertOpen] = useState(false);

	const onSubmit = () => {
		// const ids = selectedPersons.map((item) => item.id);
		// const fd = new FormData();
		// fd.append("labourer", ids.join(","));

		// sendDataToBackend(fd, "dw", [deliverInfo.id, format(dates, "yyyy-MM-dd")]);
	};

	// const resetModal = () => {
	// 	setPersons([]);
	// 	setSelectedPersons([]);
	// 	setSelectedPerson("");
	// };

	// 檢查表單是否汙染
	const onCheckDirty = () => {
		if (isDirty) {
			setAlertOpen(true);
		} else {
			onClose();
		}
	};

	// Alert 回傳值進行最終結果 --- true: 關閉 modal / all: 關閉 Alert
	const handleAlertClose = (agree) => {
		if (agree) {
			onClose();
		}
		setAlertOpen(false);
	};

	return (
		<>
			{/* Modal */}
			<ModalTemplete title={title} show={true} onClose={onCheckDirty}>
				<form>
					<div className="flex flex-col pt-4 gap-2.5">
						<Button
							variant="contained"
							onClick={onSubmit}
							color="success"
							className="!text-base !h-12"
							fullWidth>
							送出
						</Button>
					</div>
				</form>
			</ModalTemplete>

			{/* Alert */}
			<AlertDialog
				open={alertOpen}
				onClose={handleAlertClose}
				icon={<ReportProblemIcon color="secondary" />}
				title="注意"
				content="您所做的變更尚未儲存。是否確定要關閉？"
				disagreeText="取消"
				agreeText="確定"
			/>
		</>
	);
});

export { UpdatedModal, AddDispatcherModal };
