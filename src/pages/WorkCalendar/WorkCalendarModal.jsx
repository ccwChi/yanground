import React, { useState } from "react";
import { useForm, FormProvider, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
// MUI
import Button from "@mui/material/Button";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import FormHelperText from "@mui/material/FormHelperText";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
// Component
import AlertDialog from "../../components/Alert/AlertDialog";
import InputTitle from "../../components/Guideline/InputTitle";
import ModalTemplete from "../../components/Modal/ModalTemplete";
import ControlledDatePicker from "../../components/DatePicker/ControlledDatePicker";

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

const typeList = [{ id: "SUSPENDED", text: "停職" }];

// 行政院行事曆網址 Modal
const AdminCalendarUrlModal = React.memo(({ title, sendDataToBackend, onClose }) => {
	// Alert 開關
	const [alertOpen, setAlertOpen] = useState(false);

	// 初始預設 default 值
	const defaultValues = {
		url: "",
	};

	// 使用 Yup 來定義表單驗證規則
	const schema = yup.object().shape({
		url: yup.string().required("不可為空值！"),
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

		sendDataToBackend(fd, "admincalendarurl");
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
			<ModalTemplete title={title} show={true} maxWidth={"540px"} onClose={onCheckDirty}>
				<FormProvider {...methods}>
					<form onSubmit={handleSubmit(onSubmit)}>
						<div className="flex flex-col pt-4">
							<div className="italic text-neutral-500 text-sm mb-3">
								若不知道行事曆網址在哪裡找，可以參考
								<a href="https://data.gov.tw/" target="_blank" rel="noopener noreferrer">
									政府資料開放平臺
								</a>
								的
								<a href="https://data.gov.tw/dataset/14718" target="_blank" rel="noopener noreferrer">
									中華民國政府行政機關辦公日曆表
								</a>
								以取得資訊。 (CSV 按鈕右鍵選取 “複製連結網址”)
							</div>
							<div className="mb-1.5">
								<Controller
									name="url"
									control={control}
									render={({ field }) => (
										<TextField
											variant="outlined"
											size="small"
											className="inputPadding"
											label="行事曆網址"
											placeholder="請貼上行事曆網址"
											fullWidth
											inputProps={{ maxLength: 600 }}
											{...field}
										/>
									)}
								/>
								<FormHelperText className="!text-red-600 h-5">{errors["url"]?.message}</FormHelperText>
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

// 臨時公告假期 Modal
const TemporaryAnnouncementModal = React.memo(({ title, sendDataToBackend, onClose, selectedDate }) => {
	// Alert 開關
	const [alertOpen, setAlertOpen] = useState(false);

	// 初始預設 default 值
	const defaultValues = {
		date: selectedDate ? new Date(selectedDate) : null,
		reason: "",
		type: "SUSPENDED",
	};

	// 使用 Yup 來定義表單驗證規則
	const schema = yup.object().shape({
		reason: yup.string().required("不可為空值！"),
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

		sendDataToBackend(fd, "temporaryannouncement", selectedDate.replace(/-/g, "/"));
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
			<ModalTemplete title={title} show={true} maxWidth={"540px"} onClose={onCheckDirty}>
				<FormProvider {...methods}>
					<form onSubmit={handleSubmit(onSubmit)}>
						{/* {selectedDate} */}
						<div className="flex flex-col pt-4">
							{/* 日期 */}
							<div className="mb-3">
								<InputTitle title={"日期"} required={false} />
								<ControlledDatePicker name="date" />
							</div>
							{/* 原因 */}
							<div className="mb-1.5">
								<InputTitle title={"原因"} />
								<Controller
									name="reason"
									control={control}
									render={({ field }) => (
										<TextField
											error={!!errors["reason"]?.message}
											variant="outlined"
											size="small"
											className="inputPadding"
											placeholder="請輸入特殊假期原因 (e.g. 臨時放颱風假)"
											fullWidth
											inputProps={{ maxLength: 100 }}
											{...field}
										/>
									)}
								/>
								<FormHelperText className="!text-red-600 h-5">{errors["reason"]?.message}</FormHelperText>
							</div>

							<div className="mb-5">
								<InputTitle title={"假別"} required={false} />
								<Controller
									name="type"
									control={control}
									render={({ field }) => (
										<Select
											error={!!errors["type"]?.message}
											className="inputPadding"
											displayEmpty
											{...field}
											fullWidth
											MenuProps={MenuProps}>
											<MenuItem value="" disabled>
												<span className="text-neutral-400 font-light">請選擇申請人</span>
											</MenuItem>
											{typeList?.map((obj) => (
												<MenuItem key={obj.id} value={obj.id}>
													{obj.text}
												</MenuItem>
											))}
										</Select>
									)}
								/>
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
export { AdminCalendarUrlModal, TemporaryAnnouncementModal };
