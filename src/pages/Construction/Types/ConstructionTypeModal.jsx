import React, { useState } from "react";
import ModalTemplete from "../../../components/Modal/ModalTemplete";
import InputTitle from "../../../components/Guideline/InputTitle";
import AlertDialog from "../../../components/Alert/AlertDialog";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import FormHelperText from "@mui/material/FormHelperText";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import { useForm, FormProvider, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

const UpdatedModal = React.memo(({ title, deliverInfo, sendDataToBackend, onClose }) => {
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

	// 使用 useForm Hook 來管理表單狀態和驗證
	const methods = useForm({
		defaultValues,
		resolver: yupResolver(schema),
	});

	const {
		control,
		handleSubmit,
		formState: { errors, isDirty },
	} = methods;

	// 提交表單資料到後端並執行相關操作
	const onSubmit = (data) => {
		const fd = new FormData();

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

	return (
		<>
			{/* Modal */}
			<ModalTemplete title={title} show={true} onClose={onCheckDirty}>
				<FormProvider {...methods}>
					<form onSubmit={handleSubmit(onSubmit)}>
						<div className="flex flex-col pt-4 gap-4">
							<div className="inline-flex flex-col gap-1">
								<div>
									<InputTitle title={"項目名稱"} />
									<Controller
										name="name"
										control={control}
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
									<FormHelperText className="!text-red-600 break-words !text-right !mt-0" sx={{ minHeight: "1.25rem" }}>
										{errors["name"]?.message}
									</FormHelperText>
								</div>
								<div>
									<InputTitle title={"說明"} required={false} />
									<Controller
										name="explanation"
										control={control}
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
									{/* <FormHelperText className="!text-red-600 h-5">{errors["explanation"]?.message}</FormHelperText> */}
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

export { UpdatedModal };
