import React, { useState } from "react";
import { useForm, FormProvider, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { format } from "date-fns";
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

// 行政院行事曆網址 Modal
const AdminCalendarUrlModal = React.memo(({ title, sendDataToBackend, onClose }) => {
	// Alert 開關
	/**
	 * 0: 關閉
	 * 1: 開啟表單汙染狀態提示
	 */
	const [alertOpen, setAlertOpen] = useState(0);

	// 初始預設 default 值
	const defaultValues = {
		source: "",
	};

	// 使用 Yup 來定義表單驗證規則
	const schema = yup.object().shape({
		source: yup.string().required("不可為空值！"),
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
			setAlertOpen(1);
		} else {
			onClose();
		}
	};

	// Alert 回傳值進行最終結果 --- true: 關閉 modal / all: 關閉 Alert
	const handleAlertClose = (agree) => {
		if (agree) {
			onClose();
		}
		setAlertOpen(0);
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
								以取得資訊。
								<br /> (點擊“檢視資料”後，在“JSON”按鈕右鍵選取“複製連結網址”)
								<div className="flex mt-2">
									<p className="!my-0 text-rose-400 font-bold text-xs !me-1">＊</p>
									<p className="!my-0 text-rose-400 font-bold text-xs">注意！請選取 Google 行事曆專用版本日曆表。</p>
								</div>
							</div>
							<div className="mb-1.5">
								<Controller
									name="source"
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
								<FormHelperText className="!text-red-600 h-5">{errors["source"]?.message}</FormHelperText>
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
				open={alertOpen !== 0}
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
const TemporaryAnnouncementModal = React.memo(
	({ title, deliverInfo, sendDataToBackend, onClose, selectedDate, dayOffTypeList }) => {
		console.log(deliverInfo);
		// Alert 開關
		/**
		 * 0: 關閉
		 * 1: 開啟表單汙染狀態提示
		 * 2: 開啟刪除提示
		 */
		const [alertOpen, setAlertOpen] = useState(0);

		// 初始預設 default 值
		const defaultValues = {
			date: deliverInfo ? deliverInfo.date : selectedDate ? new Date(selectedDate) : new Date(),
			cause: deliverInfo ? deliverInfo.cause : "",
			type: dayOffTypeList ? (deliverInfo ? deliverInfo.type : dayOffTypeList[0].value) : "",
		};

		// 使用 Yup 來定義表單驗證規則
		const schema = yup.object().shape({
			date: yup
				.date()
				.transform((v) => (v instanceof Date && !isNaN(v) ? v : null))
				.required("不可為空值！"),
			cause: yup.string().required("不可為空值！"),
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
			const _date = format(data.date, "yyyy/MM/dd");

			delete data.date;
			for (let key in data) {
				fd.append(key, data[key]);
			}

			if (deliverInfo) {
				fd.append("date", _date);
			}
			// 待刪除，需與後端確認
			fd.append("springFestival", false);

			sendDataToBackend(fd, "temporaryannouncement", _date, deliverInfo?.id || null);
		};
		const onDelete = () => {
			sendDataToBackend("", "deleteTA", "", deliverInfo.id);
		};

		// 檢查表單是否汙染
		const onCheckDirty = () => {
			if (isDirty) {
				setAlertOpen(1);
			} else {
				onClose();
			}
		};

		// Alert 回傳值進行最終結果 --- true: 關閉 modal / all: 關閉 Alert
		const handleAlertClose = (agree) => {
			if (agree) {
				if (alertOpen === 1) {
					onClose();
				} else {
					onDelete();
				}
			}
			setAlertOpen(0);
		};

		return (
			<>
				{/* Modal */}
				<ModalTemplete title={title} show={true} maxWidth={"540px"} onClose={onCheckDirty}>
					<FormProvider {...methods}>
						<form onSubmit={handleSubmit(onSubmit)}>
							<div className="flex flex-col pt-4">
								{/* 日期 */}
								<div className="mb-1.5">
									<InputTitle title={"日期"} required={false} />
									<ControlledDatePicker name="date" />
									<FormHelperText className="!text-red-600 h-5">{errors["date"]?.message}</FormHelperText>
								</div>
								{/* 原因 */}
								<div className="mb-1.5">
									<InputTitle title={"原因"} />
									<Controller
										name="cause"
										control={control}
										render={({ field }) => (
											<TextField
												error={!!errors["cause"]?.message}
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
									<FormHelperText className="!text-red-600 h-5">{errors["cause"]?.message}</FormHelperText>
								</div>
								{/* 假別 */}
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
												disabled={!dayOffTypeList}
												MenuProps={MenuProps}>
												<MenuItem value="" disabled>
													<span className="text-neutral-400 font-light">請選擇假別</span>
												</MenuItem>
												{dayOffTypeList?.map((obj) => (
													<MenuItem key={obj.value} value={obj.value}>
														{obj.chinese}
													</MenuItem>
												))}
											</Select>
										)}
									/>
								</div>

								<div className="flex sm:flex-row flex-col gap-3">
									{deliverInfo && (
										<Button
											variant="contained"
											color="secondary"
											className="!text-base !h-12 sm:w-max w-full"
											onClick={() => setAlertOpen(2)}>
											刪除
										</Button>
									)}
									<Button type="submit" variant="contained" color="success" className="!text-base !h-12" fullWidth>
										儲存
									</Button>
								</div>
							</div>
						</form>
					</FormProvider>
				</ModalTemplete>

				{/* Alert */}
				<AlertDialog
					open={alertOpen !== 0}
					onClose={handleAlertClose}
					icon={<ReportProblemIcon color="secondary" />}
					title="注意"
					content={alertOpen === 1 ? "您所做的變更尚未儲存。是否確定要關閉表單？" : "是否確定要刪除該筆假期？"}
					disagreeText="取消"
					agreeText="確定"
				/>
			</>
		);
	}
);
export { AdminCalendarUrlModal, TemporaryAnnouncementModal };
