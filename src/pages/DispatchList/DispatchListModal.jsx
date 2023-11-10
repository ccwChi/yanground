import React, { useEffect, useState, useCallback } from "react";
import ModalTemplete from "../../components/Modal/ModalTemplete";
import InputTitle from "../../components/Guideline/InputTitle";
import AlertDialog from "../../components/Alert/AlertDialog";
import ControlledDatePicker from "../../components/DatePicker/ControlledDatePicker";
import { Loading, LoadingTwo } from "../../components/Loader/Loading";
import TextField from "@mui/material/TextField";
import Backdrop from "@mui/material/Backdrop";
import Button from "@mui/material/Button";
import Collapse from "@mui/material/Collapse";
import Divider from "@mui/material/Divider";
import FormHelperText from "@mui/material/FormHelperText";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import { TransitionGroup } from "react-transition-group";
import DeleteIcon from "@mui/icons-material/Delete";
import { useForm, FormProvider, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { getData } from "../../utils/api";
import { format } from "date-fns";
import { useNotification } from "../../hooks/useNotification";
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
	// Modal Data
	const [apiData, setApiData] = useState(null);

	// 使用 Yup 來定義表單驗證規則
	const schema = yup.object().shape({
		dispatchedOn: yup.string().required("不可為空值！"),
		project: yup.string().required("不可為空值"),
		applicant: yup.string().required("不可為空值"),
	});

	// 初始預設 default 值
	const defaultValues = {
		dispatchedOn: apiData ? new Date(apiData.dispatchedOn) : new Date(),
		project: apiData ? apiData.project.id : "",
		content: apiData && apiData?.content ? apiData.content : "",
		department: "業務部",
		applicant: apiData ? apiData.applicant.id : "",
	};

	// 使用 useForm Hook 來管理表單狀態和驗證
	const methods = useForm({
		defaultValues,
		resolver: yupResolver(schema),
	});

	const {
		control,
		handleSubmit,
		watch,
		reset,
		formState: { errors, isDirty },
	} = methods;
	const projectId = watch("project");

	useEffect(() => {
		if (deliverInfo) {
			getData(`dispatchment/${deliverInfo}`).then((result) => {
				const data = result.result;
				setApiData(data);
			});
		}
	}, [deliverInfo]);

	useEffect(() => {
		if (apiData) {
			reset(defaultValues);
		}
	}, [apiData]);

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
			sendDataToBackend(fd, "edit", deliverInfo);
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

		return "";
	}, []);

	return (
		<>
			{/* Modal */}
			<ModalTemplete
				title={title}
				show={!!projectList && !!userList && (deliverInfo ? !!apiData : true)}
				maxWidth={"640px"}
				onClose={onCheckDirty}>
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
													{projectList?.map((project) => (
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
								<div className="inline-flex sm:flex-row flex-col sm:gap-2 gap-5">
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
													{userList?.map((user) => (
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
												fullWidth
												placeholder="請輸入工程內容"
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

			{/* Backdrop */}
			<Backdrop
				sx={{ color: "#fff", zIndex: 1050 }}
				open={!projectList || !userList || (deliverInfo ? !apiData : false)}
				onClick={onCheckDirty}>
				<LoadingTwo />
			</Backdrop>
		</>
	);
});

const AddDispatcherModal = React.memo(({ title, deliverInfo, departmentList, sendDataToBackend, onClose }) => {
	const showNotification = useNotification();

	// 人員清單
	const [memberList, setMemberList] = useState(null);
	// 已選清單
	const [selectedMembers, setSelectedMembers] = useState(null);
	// Alert 開關
	const [alertOpen, setAlertOpen] = useState(false);
	// 是否為初始化時
	const [initialized, setInitialized] = useState(true);
	// 檢查 List 是否被汙染
	const [isListDirty, setIsListDirty] = useState(false);

	useEffect(() => {
		if (deliverInfo) {
			let data = {};
			getData(`dispatchment/${deliverInfo}/staff`).then((result) => {
				data = result.result;
				const initialSelectedMembers = data.map((item) => ({
					department: item.department.name,
					member: item.displayName,
					memberId: item.id,
				}));
				setSelectedMembers(initialSelectedMembers);
			});
		}
	}, [deliverInfo]);

	// 初始預設 default 值
	const defaultValues = {
		department: "",
		member: "",
	};

	// 使用 Yup 來定義表單驗證規則
	const schema = yup.object().shape({
		department: yup.string().required("不可為空值！"),
		member: yup.string().required("不可為空值！"),
	});

	// 使用 useForm Hook 來管理表單狀態和驗證
	const methods = useForm({
		defaultValues,
		resolver: yupResolver(schema),
	});
	const {
		control,
		watch,
		handleSubmit,
		setValue,
		getValues,
		formState: { errors, isDirty },
	} = methods;
	const dep_ = watch("department");

	// 取得該部門內的人員
	useEffect(() => {
		if (dep_) {
			if (!initialized) {
				setValue("member", "");
			} else {
				setInitialized(false);
			}
			setMemberList(null);
			getData(`department/${dep_}/staff`).then((result) => {
				const data = result.result;
				setMemberList(data);
			});
		}
	}, [dep_]);

	const onSubmit = (data) => {
		const { department, member } = data;
		const existingMember = selectedMembers.find((m) => m.memberId === member);

		const departmentText = departmentList.find((d) => d.id === department).name;
		const memberText = memberList.find((m) => m.id === member).nickname;

		if (existingMember) {
			showNotification(`〔${departmentText} / ${memberText}〕已存在清單內，不可重複新增！`, false);
			return;
		}

		setSelectedMembers([{ department: departmentText, member: memberText, memberId: member }, ...selectedMembers]);

		setValue("member", "");
	};

	// 移除派工人員暫存清單
	const handleRemoveMember = (member) => {
		if (!isDirty) setIsListDirty(true);
		const updatedMembers = selectedMembers.filter((m) => m.member !== member);
		setSelectedMembers(updatedMembers);
	};

	// 儲存按鈕，傳遞資料給後端
	const handleSave = () => {
		const selectedMemberIds = selectedMembers.map((m) => m.memberId);

		const fd = new FormData();
		fd.append("staffs", selectedMemberIds.join(","));
		sendDataToBackend(fd, "awl", deliverInfo);
	};

	// 檢查表單是否汙染
	const onCheckDirty = () => {
		if (isDirty || isListDirty) {
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
			<ModalTemplete title={title} show={true} maxWidth={"540px"} onClose={onCheckDirty}>
				<FormProvider {...methods}>
					<form onSubmit={handleSubmit(onSubmit)}>
						<div className="flex flex-col pt-4 gap-2.5">
							<div className="inline-flex flex-row gap-2">
								<div className="w-full">
									<InputTitle title={"部門"} />
									<Controller
										name="department"
										control={control}
										render={({ field }) => (
											<Select
												error={!!errors["department"]?.message}
												className="inputPadding"
												displayEmpty
												{...field}
												fullWidth
												MenuProps={MenuProps}>
												<MenuItem value="" disabled>
													<span className="text-neutral-400 font-light">請選擇部門</span>
												</MenuItem>
												{departmentList?.map((dep) => (
													<MenuItem key={"select" + dep.id} value={dep.id}>
														{dep.name}
													</MenuItem>
												))}
											</Select>
										)}
									/>
									<FormHelperText className="!text-red-600 break-words !text-right !mt-0" sx={{ minHeight: "1.25rem" }}>
										{errors["department"]?.message}
									</FormHelperText>
								</div>
								<div className="w-full">
									<InputTitle title={"人員"} />
									<Controller
										name="member"
										control={control}
										render={({ field }) => (
											<Select
												error={!!errors["member"]?.message}
												className="inputPadding"
												displayEmpty
												{...field}
												fullWidth
												disabled={!memberList && !initialized}
												MenuProps={MenuProps}>
												<MenuItem value="" disabled>
													<span className="text-neutral-400 font-light">請選擇人員</span>
												</MenuItem>
												{memberList
													? memberList.map((m) => (
															<MenuItem key={m.id} value={m.id}>
																{m.nickname}
															</MenuItem>
													  ))
													: getValues("member") && <MenuItem value={getValues("member")}></MenuItem>}
											</Select>
										)}
									/>
									<FormHelperText className="!text-red-600 break-words !text-right !mt-0" sx={{ minHeight: "1.25rem" }}>
										{errors["member"]?.message}
									</FormHelperText>
								</div>
							</div>
							<Button
								type="submit"
								variant="contained"
								color="purple"
								className="!text-base !h-12"
								disabled={!memberList && !initialized}
								fullWidth>
								新增人員
							</Button>
						</div>
					</form>
				</FormProvider>

				{/* ------------------------------------------------------ */}
				<Divider variant="middle" className="!my-5" />
				{/* ------------------------------------------------------ */}

				<InputTitle title={"派工人員"} required={false}>
					<span className="italic text-neutral-500 text-sm">
						(已選取 {selectedMembers ? selectedMembers.length : "-"} 名人員)
					</span>
				</InputTitle>
				<List className="overflow-y-auto border border-neutral-300 rounded !mb-2.5" sx={{ height: "22.5vh" }}>
					{selectedMembers ? (
						selectedMembers?.length > 0 ? (
							<TransitionGroup>
								{selectedMembers?.map((member) => (
									<Collapse key={member.member}>
										<ListItem className="!py-1">
											<ListItemText secondary={member.department + " / " + member.member} />
											<IconButton aria-label="delete" title="Delete" onClick={() => handleRemoveMember(member.member)}>
												<DeleteIcon />
											</IconButton>
										</ListItem>
										<Divider variant="middle" />
									</Collapse>
								))}
							</TransitionGroup>
						) : (
							<div className="flex h-full items-center justify-center">
								<span className="italic text-neutral-500 text-sm">(尚無資料)</span>
							</div>
						)
					) : (
						<div className="flex items-center justify-center h-full">
							<Loading size={40} />
						</div>
					)}
				</List>

				<Button variant="contained" color="success" className="!text-base !h-12" fullWidth onClick={handleSave}>
					儲存
				</Button>
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
