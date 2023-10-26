import React, { useState } from "react";
import ModalTemplete from "../../../components/Modal/ModalTemplete";
import InputTitle from "../../../components/Guideline/InputTitle";
import AlertDialog from "../../../components/Alert/AlertDialog";
import { TextField, Button, FormHelperText } from "@mui/material";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

const UpdatedModal = ({ title, sendDataToBackend, onClose }) => {
	// Alert 開關
	const [alertOpen, setAlertOpen] = useState(false);

	// 使用 Yup 來定義表單驗證規則
	const schema = yup.object().shape({
		name: yup.string().required("不可為空值！"),
	});

	// 處理表單驗證錯誤時的回調函數
	const onError = (errors) => {
		if (Object.keys(errors).length > 0) {
			for (const key in errors) {
				if (errors.hasOwnProperty(key)) {
					const errorMessage = errors[key]?.message;
					console.log(errorMessage);
				}
			}
		}
	};

	// 使用 useForm Hook 來管理表單狀態和驗證
	const {
		control,
		handleSubmit,
		reset,
		formState: { errors, isDirty },
	} = useForm({
		// 使用 Yup 驗證規則來解析表單
		resolver: yupResolver(schema),
	});

	// 提交表單資料到後端並執行相關操作
	const onSubmit = (data) => {
		const fd = new FormData();

		// 遍歷表單資料對象，將每個欄位加入到 FormData 對像中
		for (let key in data) {
			fd.append(key, data[key]);
		}

		// 向後端發送 FormData 物件以執行建立操作
		sendDataToBackend(fd, "create");

		resetModal();
	};

	// 重設 modal
	const resetModal = () => {
		reset();
		onClose();
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

	return (
		<>
			{/* Modal */}
			<ModalTemplete title={title} show={true} onClose={onCheckDirty}>
				<form onSubmit={handleSubmit(onSubmit, onError)}>
					<div className="flex flex-col pt-4 gap-4">
						<div className="inline-flex flex-col gap-1">
							<div>
								<InputTitle title={"項目名稱"} />
								<Controller
									name="name"
									control={control}
									defaultValue={""}
									render={({ field }) => (
										<TextField
											variant="outlined"
											size="small"
											className="inputPadding"
											placeholder="請輸入項目名稱"
											fullWidth
											inputProps={{ maxLength: 25 }}
											{...field}
										/>
									)}
								/>
								<FormHelperText className="!text-red-600 break-words" sx={{ minHeight: "1.25rem" }}>
									{errors["name"]?.message}
								</FormHelperText>
							</div>
							<div>
								<InputTitle title={"說明"} required={false} />
								<Controller
									name="explanation"
									control={control}
									defaultValue={""}
									render={({ field }) => (
										<TextField
											multiline
											rows={6}
											className="inputPadding"
											placeholder="請輸入項目說明"
											fullWidth
											{...field}
										/>
									)}
								/>
								<FormHelperText className="!text-red-600 h-5">{errors["explanation"]?.message}</FormHelperText>
							</div>
						</div>
						<Button type="submit" variant="contained" color="success" className="!text-base !h-12" fullWidth>
							建立
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
				content="您所做的變更尚未儲存。是否確定要關閉表單？"
				disagreeText="取消"
				agreeText="確定"
			/>
		</>
	);
};

const EditModal = ({ title, deliverInfo, sendDataToBackend, onClose }) => {
	// Alert 開關
	const [alertOpen, setAlertOpen] = useState(false);

	// 初始預設 default 值
	const defaultValues = {
		name: deliverInfo ? deliverInfo.name : "",
		explanation: deliverInfo ? deliverInfo.explanation : "",
	};

	// 使用 Yup 來定義表單驗證規則
	const schema = yup.object().shape({
		name: yup.string().required("不可為空值！"),
	});

	// 處理表單驗證錯誤時的回調函數
	const onError = (errors) => {
		if (Object.keys(errors).length > 0) {
			for (const key in errors) {
				if (errors.hasOwnProperty(key)) {
					const errorMessage = errors[key]?.message;
					console.log(errorMessage);
				}
			}
		}
	};

	// 使用 useForm Hook 來管理表單狀態和驗證
	const {
		control,
		handleSubmit,
		reset,
		formState: { errors, isDirty },
	} = useForm({
		defaultValues,
		resolver: yupResolver(schema),
	});

	// 提交表單資料到後端並執行相關操作
	const onSubmit = (data) => {
		const fd = new FormData();

		for (let key in data) {
			fd.append(key, data[key]);
		}

		sendDataToBackend(fd, "edit", deliverInfo.id);
		resetModal();
	};

	// 重設 modal
	const resetModal = () => {
		reset(defaultValues);
		onClose();
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

	return (
		<>
			{/* Modal */}
			<ModalTemplete title={title} show={true} onClose={onCheckDirty}>
				<form onSubmit={handleSubmit(onSubmit, onError)}>
					<div className="flex flex-col pt-4 gap-4">
						<div className="inline-flex flex-col gap-1">
							<div>
								<InputTitle title={"項目名稱"} />
								<Controller
									name="name"
									control={control}
									defaultValue={""}
									render={({ field }) => (
										<TextField
											variant="outlined"
											size="small"
											className="inputPadding"
											placeholder="請輸入項目名稱"
											fullWidth
											inputProps={{ maxLength: 25 }}
											{...field}
										/>
									)}
								/>
								<FormHelperText className="!text-red-600 break-words" sx={{ minHeight: "1.25rem" }}>
									{errors["name"]?.message}
								</FormHelperText>
							</div>
							<div>
								<InputTitle title={"說明"} required={false} />
								<Controller
									name="explanation"
									control={control}
									defaultValue={""}
									render={({ field }) => (
										<TextField
											multiline
											rows={6}
											className="inputPadding"
											placeholder="請輸入項目說明"
											fullWidth
											{...field}
										/>
									)}
								/>
								<FormHelperText className="!text-red-600 h-5">{errors["explanation"]?.message}</FormHelperText>
							</div>
						</div>
						<Button type="submit" variant="contained" color="success" className="!text-base !h-12" fullWidth>
							儲存
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
				content="您所做的變更尚未儲存。是否確定要關閉表單？"
				disagreeText="取消"
				agreeText="確定"
			/>
		</>
	);
};

export { UpdatedModal, EditModal };
