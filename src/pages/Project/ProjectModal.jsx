import React, { useEffect, useState } from "react";
import ModalTemplete from "../../components/Modal/ModalTemplete";
import InputTitle from "../../components/Guideline/InputTitle";
import AlertDialog from "../../components/Alert/AlertDialog";
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
import MapDialog from "./MapDialog";
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

const UpdatedModal = React.memo(({ title, deliverInfo, sendDataToBackend, cityList, onClose }) => {
	// Alert 開關
	const [alertOpen, setAlertOpen] = useState(false);
	// 人員清單
	const [userList, setUserList] = useState(null);
	// 鄉鎮區清單
	const [distList, setDistList] = useState(null);
	// 是否為初始化時
	const [initialized, setInitialized] = useState(true);
	// 是否開啟地圖嵌套 Modal
	const [mapDialog, setMapDialog] = useState(false);

	// 初始預設 default 值
	const defaultValues = {
		name: deliverInfo ? deliverInfo.name : "",
		businessRepresentative: deliverInfo ? deliverInfo.businessRepresentative.id : "",
		administrativeDivision_: deliverInfo ? deliverInfo.administrativeDivision.administeredBy.id : "",
		administrativeDivision: deliverInfo ? deliverInfo.administrativeDivision.id : "",
		street: deliverInfo ? deliverInfo.street : "",
		latitude: deliverInfo ? deliverInfo.latitude : "",
		longitude: deliverInfo ? deliverInfo.longitude : "",
		radius: deliverInfo ? deliverInfo.radius : "",
	};

	// 使用 Yup 來定義表單驗證規則
	const schema = yup.object().shape({
		name: yup.string().required("不可為空值！"),
		businessRepresentative: yup.string().required("不可為空值！"),
		administrativeDivision_: yup.string().required("不可為空值！"),
		administrativeDivision: yup.string().required("不可為空值！"),
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
		setValue,
		getValues,
		formState: { errors, isDirty },
	} = methods;
	const city = watch("administrativeDivision_");

	// 取得人員資料
	useEffect(() => {
		getData("department/5/staff").then((result) => {
			const data = result.result;
			setUserList(data);
		});
	}, []);

	// 取得鄉鎮區
	useEffect(() => {
		if (city) {
			if (!initialized) {
				setValue("administrativeDivision", "");
			} else {
				setInitialized(false);
			}
			setDistList(null);
			getData(`administrativeDivision/${city}`).then((result) => {
				const data = result.result.subDivisions;
				setDistList(data);
			});
		}
	}, [city]);

	// 提交表單資料到後端並執行相關操作
	const onSubmit = (data) => {
		const fd = new FormData();

		delete data.administrativeDivision_;
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
			<ModalTemplete title={title} show={!!userList} maxWidth={"640px"} onClose={onCheckDirty}>
				<FormProvider {...methods}>
					<form onSubmit={handleSubmit(onSubmit)}>
						<div className="flex flex-col pt-4 gap-4">
							<div className="flex flex-col overflow-y-auto px-1" style={{ maxHeight: "60vh" }}>
								{/* 名稱 & 人員 */}
								<div className="inline-flex sm:flex-row flex-col sm:gap-2 gap-1">
									<div className="w-full">
										<InputTitle title={"專案名稱"} />
										<Controller
											name="name"
											control={control}
											render={({ field }) => (
												<TextField
													error={!!errors["name"]?.message}
													variant="outlined"
													size="small"
													className="inputPadding"
													placeholder="請輸入專案名稱"
													fullWidth
													inputProps={{ maxLength: 25 }}
													{...field}
												/>
											)}
										/>
										<FormHelperText
											className="!text-red-600 break-words !text-right !mt-0"
											sx={{ minHeight: "1.25rem" }}>
											{errors["name"]?.message}
										</FormHelperText>
									</div>
									<div className="w-full">
										<InputTitle title={"專責人員"} />
										<Controller
											name="businessRepresentative"
											control={control}
											render={({ field }) => (
												<Select
													error={!!errors["businessRepresentative"]?.message}
													className="inputPadding"
													displayEmpty
													{...field}
													fullWidth
													MenuProps={MenuProps}>
													<MenuItem value="" disabled>
														<span className="text-neutral-400 font-light">請輸入專案人員</span>
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
											{errors["businessRepresentative"]?.message}
										</FormHelperText>
									</div>
								</div>
								{/* 地點 */}
								<InputTitle title={"專案地點"} />
								<div className="inline-flex sm:flex-row flex-col sm:gap-2 gap-1">
									<div className="flex gap-2 w-full">
										<div className="w-full">
											<Controller
												name="administrativeDivision_"
												control={control}
												render={({ field }) => (
													<Select
														error={!!errors["administrativeDivision_"]?.message}
														className="inputPadding"
														displayEmpty
														{...field}
														fullWidth
														MenuProps={MenuProps}>
														<MenuItem value="" disabled>
															<span className="text-neutral-400 font-light">縣市</span>
														</MenuItem>
														{cityList.map((c) => (
															<MenuItem key={c.id} value={c.id}>
																{c.name}
															</MenuItem>
														))}
													</Select>
												)}
											/>
											<FormHelperText
												className="!text-red-600 break-words !text-right !mt-0"
												sx={{ minHeight: "1.25rem" }}>
												{errors["administrativeDivision_"]?.message}
											</FormHelperText>
										</div>
										<div className="w-full">
											<Controller
												name="administrativeDivision"
												control={control}
												render={({ field }) => (
													<Select
														error={!!errors["administrativeDivision"]?.message}
														className="inputPadding"
														displayEmpty
														{...field}
														fullWidth
														disabled={!distList && !initialized}
														MenuProps={MenuProps}>
														<MenuItem value="" disabled>
															<span className="text-neutral-400 font-light">鄉鎮區</span>
														</MenuItem>
														{distList
															? distList.map((d) => (
																	<MenuItem key={d.id} value={d.id}>
																		{d.name}
																	</MenuItem>
															  ))
															: getValues("administrativeDivision") && (
																	<MenuItem value={getValues("administrativeDivision")}></MenuItem>
															  )}
													</Select>
												)}
											/>
											<FormHelperText
												className="!text-red-600 break-words !text-right !mt-0"
												sx={{ minHeight: "1.25rem" }}>
												{errors["administrativeDivision"]?.message}
											</FormHelperText>
										</div>
									</div>
									<div className="w-full">
										<Controller
											name="street"
											control={control}
											render={({ field }) => (
												<TextField
													error={!!errors["street"]?.message}
													variant="outlined"
													size="small"
													className="inputPadding"
													placeholder="街道/巷弄"
													fullWidth
													inputProps={{ maxLength: 100 }}
													{...field}
												/>
											)}
										/>
										<FormHelperText
											className="!text-red-600 break-words !text-right !mt-0"
											sx={{ minHeight: "1.25rem" }}>
											{errors["street"]?.message}
										</FormHelperText>
									</div>
								</div>
								{/* 經緯度半徑 */}
								<div className="inline-flex items-center pb-4 pt-0 sm:pt-1 gap-2">
									<InputTitle title={"案場範圍"} required={false} />
									<Button
										type="button"
										variant="contained"
										color="purple"
										onClick={() => {
											setMapDialog(true);
										}}
										className="!text-sm !h-10 !py-0">
										地圖選點
									</Button>
								</div>
								<div className="inline-flex sm:gap-2 gap-1">
									<div className="w-full">
										<Controller
											name="latitude"
											control={control}
											render={({ field }) => (
												<TextField
													label="緯度"
													error={!!errors["latitude"]?.message}
													variant="outlined"
													size="small"
													className="inputPadding"
													InputProps={{
														readOnly: true,
													}}
													disabled={!getValues("latitude")}
													fullWidth
													{...field}
												/>
											)}
										/>
										{/* <FormHelperText
											className="!text-red-600 break-words !text-right !mt-0"
											sx={{ minHeight: "1.25rem" }}>
											{errors["latitude"]?.message}
										</FormHelperText> */}
									</div>
									<div className="w-full">
										<Controller
											name="longitude"
											control={control}
											render={({ field }) => (
												<TextField
													label="經度"
													error={!!errors["longitude"]?.message}
													variant="outlined"
													size="small"
													className="inputPadding"
													InputProps={{
														readOnly: true,
													}}
													disabled={!getValues("longitude")}
													fullWidth
													{...field}
												/>
											)}
										/>
										{/* <FormHelperText
											className="!text-red-600 break-words !text-right !mt-0"
											sx={{ minHeight: "1.25rem" }}>
											{errors["longitude"]?.message}
										</FormHelperText> */}
									</div>
									<div className="w-full">
										<Controller
											name="radius"
											control={control}
											render={({ field }) => (
												<TextField
													label="半徑"
													error={!!errors["radius"]?.message}
													variant="outlined"
													size="small"
													className="inputPadding"
													InputProps={{
														readOnly: true,
													}}
													disabled={!getValues("radius")}
													fullWidth
													{...field}
												/>
											)}
										/>
										{/* <FormHelperText
											className="!text-red-600 break-words !text-right !mt-0"
											sx={{ minHeight: "1.25rem" }}>
											{errors["radius"]?.message}
										</FormHelperText> */}
									</div>
								</div>
							</div>
							<Button type="submit" variant="contained" color="success" className="!text-base !h-12" fullWidth>
								儲存
							</Button>
						</div>

						{/* MapDialog */}
						<MapDialog
							open={mapDialog}
							handleClose={() => setMapDialog(false)}
							pos={{
								lat: getValues("latitude") ? +getValues("latitude") : 0,
								lng: getValues("longitude") ? +getValues("longitude") : 0,
							}}
							r={getValues("radius") ? +getValues("radius") : 500}
						/>
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
