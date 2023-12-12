import React, { useEffect, useState } from "react";
import ModalTemplete from "../../components/Modal/ModalTemplete";
import ControlledDatePicker from "../../components/DatePicker/ControlledDatePicker";
import { format } from "date-fns"; // format(data, 'yyyy-MM-dd')
import {
	TextField,
	Button,
	Select,
	MenuItem,
	FormControl,
	RadioGroup,
	FormControlLabel,
	Radio,
	FormGroup,
	Box,
	useTheme,
	FormHelperText,
	Backdrop,
} from "@mui/material";
import { useForm, Controller, FormProvider } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { getData } from "../../utils/api";
import { IOSSwitch } from "../../components/Switch/Switch";
import { LoadingThree } from "../../components/Loader/Loading";
import AlertDialog from "../../components/Alert/AlertDialog";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import InputTitle from "../../components/Guideline/InputTitle";
import TableTabber from "../../components/Tabbar/TableTabber";

const EditModal = ({ title, deliverInfo, sendDataToBackend, onClose, departmentList, authorityList }) => {
	// RWD Tabbar 當前位置
	const [cat, setCat] = useState("1");
	// 檢查是否被汙染
	const [alertOpen, setAlertOpen] = useState(false);
	// Modal Data
	const [apiData, setApiData] = useState(null);
	const theme = useTheme();

	// 使用 Yup 來定義表單驗證規則
	const schema = yup.object().shape({
		nickname: yup.string().required("暱稱不得為空白!"),
		nationalIdentityCardNumber: yup.mixed().test("is-national-id", "格式為第一字為英文 + 九個數字!", (value) => {
			if (!value) {
				return true;
			}
			return /^[A-Za-z]\d{9}$/.test(value);
		}),
		department: yup.string().required("部門不得為空白!"),
	});

	// 初始預設 default 值
	const defaultValues = {
		empolyeeId: apiData?.empolyeeId || "",
		displayName: apiData?.displayName || "",
		nickname: apiData?.nickname || "",
		lastname: apiData?.lastname || "",
		firstname: apiData?.firstname || "",
		nationalIdentityCardNumber: apiData?.nationalIdentityCardNumber || "",
		birthDate: apiData?.birthDate ? new Date(apiData.birthDate) : null,
		gender: apiData?.gender === null ? null : apiData?.gender === true ? "male" : "female",
		startedOn: apiData?.startedOn ? new Date(apiData.startedOn) : null,
		department: apiData?.department?.id ? apiData.department.id : "",
		authorities: apiData?.authorities.map((authority) => authority.id) || [],
	};

	// 使用 useForm Hook 來管理表單狀態和驗證
	const methods = useForm({
		defaultValues,
		resolver: yupResolver(schema),
	});

	const {
		control,
		handleSubmit,
		register,
		reset,
		formState: { errors, isDirty },
	} = methods;

	// 取得 Modal 資料
	useEffect(() => {
		if (deliverInfo) {
			getData(`user/${deliverInfo}`).then((result) => {
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

	// 提交表單資料到後端並執行相關操作
	const onSubmit = (data) => {
		const fd = new FormData();
		const convertData = {
			...data,
			startedOn: data?.startedOn ? format(data.startedOn, "yyyy-MM-dd") : "",
			birthDate: data?.birthDate ? format(data.birthDate, "yyyy-MM-dd") : "",
			gender: data.gender === "male" ? true : data.gender === "female" ? false : "",
			nationalIdentityCardNumber: data?.nationalIdentityCardNumber ? data.nationalIdentityCardNumber.toUpperCase() : "",
		};
		if (convertData?.nationalIdentityCardNumber === null || convertData?.nationalIdentityCardNumber === "") {
			delete convertData.nationalIdentityCardNumber;
		}
		if (convertData?.department === null || convertData?.department === "") {
			delete convertData.department;
		}
		for (let key in convertData) {
			fd.append(key, convertData[key]);
		}

		sendDataToBackend(fd, "edit", deliverInfo);
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

	const tabGroup = [
		{ f: "1", text: "資料1/2" },
		{ f: "2", text: "資料2/2" },
		{ f: "3", text: "權限" },
	];

	return (
		<>
			{/* Modal */}
			<ModalTemplete
				title={title}
				show={!!authorityList && (deliverInfo ? !!apiData : true)}
				onClose={onCheckDirty}
				maxWidth={"760px"}>
				<FormProvider {...methods}>
					{/* TabBar */}
					<div className="md:hidden mt-3 mb-5 flex-1 -m-3">
						<TableTabber tabGroup={tabGroup} setCat={setCat} cat={cat} />
					</div>

					<form onSubmit={handleSubmit(onSubmit)}>
						<div
							className="flex-col relative columns-1 md:columns-3 md:!min-h-[520px] md:!max-h-[52px] md:py-5 mx-3 h-fit gap-8 overflow-hidden"
							style={{ maxHeight: "65vh", scrollbarWidth: "thin" }}>
							<div
								className={`${
									cat === "1" ? "static" : "hidden"
								} space-y-4 md:relative md:inline-block w-full overflow-y-auto  max-h-[60vh] md:h-auto md:max-h-fit`}>
								{/* 員工編號 */}
								<div className="w-full ">
									<InputTitle title={"員工編號"} required={false} />
									{/* <span>員工編號</span> */}
									<Controller
										name="empolyeeId"
										control={control}
										render={({ field }) => (
											<TextField
												variant="outlined"
												size="small"
												className="inputPadding"
												placeholder="員工編號"
												fullWidth
												inputProps={{ readOnly: true }}
												{...field}
											/>
										)}
									/>
								</div>
								{/* line名稱 */}
								<div className="w-full">
									<InputTitle title={"line名稱"} required={false} />
									<Controller
										name="displayName"
										control={control}
										render={({ field }) => (
											<TextField
												variant="outlined"
												size="small"
												className="inputPadding"
												placeholder="line名稱"
												fullWidth
												{...field}
												inputProps={{ readOnly: true }}
											/>
										)}
									/>
								</div>
								{/* 姓+名 */}

								<div className="w-full">
									<InputTitle title={"姓氏"} required={false} />
									<Controller
										name="lastname"
										control={control}
										render={({ field }) => (
											<TextField
												variant="outlined"
												size="small"
												className="inputPadding"
												placeholder="請輸入姓氏"
												fullWidth
												{...field}
											/>
										)}
									/>
								</div>

								<div className="w-full">
									<InputTitle title={"名字"} required={false} />
									<Controller
										name="firstname"
										control={control}
										render={({ field }) => (
											<TextField
												variant="outlined"
												size="small"
												className="inputPadding"
												placeholder="請輸入名字"
												fullWidth
												{...field}
											/>
										)}
									/>
								</div>
								{/* 暱稱+性別 */}

								<div className="w-full">
									<InputTitle title={"暱稱 / 別名"} required={false} />
									<Controller
										name="nickname"
										control={control}
										render={({ field }) => (
											<TextField
												variant="outlined"
												size="small"
												className="inputPadding"
												// label={
												//   errors.nickname && (
												//     <span className=" text-red-700 m-0">
												//       {errors.nickname.message}
												//     </span>
												//   )
												// }
												placeholder="請輸入暱稱"
												fullWidth
												{...field}
											/>
										)}
									/>
									<FormHelperText
										className="!text-red-600 break-words  text-justify !mt-0 hidden md:block"
										sx={{ minHeight: "1.25rem" }}>
										{errors.nickname && <span className=" text-red-700 m-0">{errors.nickname.message}</span>}
									</FormHelperText>
								</div>
							</div>

							<div
								className={`${
									cat === "2" ? "static" : "hidden"
								}  md:relative md:inline-block w-full overflow-y-auto  max-h-[60vh] md:h-auto md:max-h-fit`}>
								<div className="w-full">
									<InputTitle title={"性別"} required={false} />
									<Controller
										name="gender"
										control={control}
										render={({ field }) => (
											<FormControl>
												<RadioGroup
													row
													aria-labelledby="demo-row-radio-buttons-group-label"
													name="row-radio-buttons-group">
													<FormControlLabel
														{...field}
														value="male"
														control={<Radio checked={field.value === "male"} size="small" />}
														label="男性"
													/>
													<FormControlLabel
														{...field}
														value="female"
														control={<Radio checked={field.value === "female"} size="small" />}
														label="女性"
													/>
												</RadioGroup>
											</FormControl>
										)}
									/>
								</div>
								{/* 身份證字號 */}
								<div className="w-full mt-4">
									<InputTitle title={"身份證字號"} required={false} />
									<Controller
										name="nationalIdentityCardNumber"
										control={control}
										render={({ field }) => (
											<TextField
												variant="outlined"
												size="small"
												className="inputPadding"
												// label={
												//   errors.nationalIdentityCardNumber && (
												//     <span className=" text-red-700 m-0">
												//       {errors.nationalIdentityCardNumber.message}
												//     </span>
												//   )
												// }
												placeholder="身分證字號"
												fullWidth
												{...field}
											/>
										)}
									/>
									<FormHelperText
										className="!text-red-600 break-words text-justify !mt-0 hidden md:block"
										sx={{ minHeight: "1.25rem" }}>
										{errors.nationalIdentityCardNumber && (
											<span className={`text-red-700 m-0`}>{errors.nationalIdentityCardNumber.message}</span>
										)}
									</FormHelperText>
								</div>

								{/* 生日 */}
								<div className="w-full mt-4 md:mt-0">
									<InputTitle title={"生日"} required={false} />
									<ControlledDatePicker name="birthDate" />
								</div>
								{/* 到職日 */}
								<div className="w-full mt-4">
									<InputTitle title={"到職日"} />
									<ControlledDatePicker name="startedOn" />
								</div>
								{/* 部門 */}
								{/* <div className=" gap-1.5 w-100 md:w-[320px]"> */}
								<div className="w-full flex flex-col mt-4">
									<InputTitle title={"部門"} required={true} />
									<Controller
										name="department"
										control={control}
										//   defaultValue=""
										render={({ field: { value, onChange } }) => (
											<Select
												labelId="department-select-label"
												MenuProps={{
													PaperProps: {
														style: { maxHeight: "250px" },
													},
												}}
												value={value}
												onChange={onChange}>
												{departmentList?.map((depart) => (
													<MenuItem key={"select" + depart.id} value={depart.id}>
														{depart.name}
													</MenuItem>
												))}
											</Select>
										)}
									/>
									<FormHelperText
										className="!text-red-600 break-words text-justify !mt-0 hidden md:block"
										sx={{ minHeight: "1.25rem" }}>
										{errors.department && <span className={`text-red-700 m-0`}>{errors.department.message}</span>}
									</FormHelperText>
								</div>
							</div>

							{/* 權限 */}
							<div
								className={`${
									cat === "3" ? "static" : "hidden"
								} space-y-4 md:relative md:inline-block w-full overflow-y-auto max-h-[60vh] md:max-h-[470px]`}>
								<FormControl component="fieldset" variant="standard" className="w-full">
									<InputTitle title={"權限"} required={false} />
									<Box className="w-full  overflow-y-auto  border-gray-400 rounded-md">
										<Controller
											name="authorities"
											control={control}
											render={() => (
												<FormGroup>
													{authorityList?.map((authority) => (
														<FormControlLabel
															className="justify-between !m-0 border-b-[1px] border-gray-400 "
															key={authority.id}
															id={authority.id}
															{...register("authorities")}
															control={
																<IOSSwitch
																	sx={{ m: 1 }}
																	value={authority.id}
																	defaultChecked={apiData?.authorities.some(
																		(existingAuthority) => existingAuthority.id === authority.id
																	)}
																/>
															}
															label={authority.name}
															labelPlacement="start"
														/>
													))}
												</FormGroup>
											)}
										/>
									</Box>
								</FormControl>
							</div>
						</div>
						<div className="!mt-2 md:!mt-0">
							<div></div>

							<FormHelperText
								className="!text-red-600 break-words text-justify !mt-0 md:hidden"
								sx={{ minHeight: "1.25rem" }}>
								{errors.nickname && (
									<span className=" text-red-700 m-0 pl-5">
										{errors.nickname.message}
										{(errors.nationalIdentityCardNumber || errors.department) && <br />}
									</span>
								)}
								{errors.nationalIdentityCardNumber && (
									<span className={`text-red-700 m-0 pl-5 `}>
										身份證字號{errors.nationalIdentityCardNumber.message}
										{!!errors.department && <br />}
									</span>
								)}
								{errors.department && <span className={`text-red-700 m-0 pl-5 `}>{errors.department.message}</span>}
							</FormHelperText>
							<Button type="submit" variant="contained" color="success" className="!text-base " fullWidth>
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
				open={!authorityList || (deliverInfo ? !apiData : false)}
				onClick={onCheckDirty}>
				<LoadingThree />
			</Backdrop>
		</>
	);
};

export default EditModal;

// npm i @mui/x-date-pickers
// npm install --save date-fns
