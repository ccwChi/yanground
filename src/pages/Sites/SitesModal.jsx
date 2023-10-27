import React, { useEffect, useState, useCallback, useRef } from "react";
import ModalTemplete from "../../components/Modal/ModalTemplete";
import InputTitle from "../../components/Guideline/InputTitle";
import DatePicker from "../../components/Guideline/DatePicker";
import AlertDialog from "../../components/Alert/AlertDialog";
import Loading from "../../components/Loader/Loading";
import {
	TextField,
	Button,
	Select,
	MenuItem,
	FormControl,
	InputLabel,
	List,
	ListItem,
	ListItemText,
	IconButton,
	Divider,
	FormHelperText,
	Collapse,
	Checkbox,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import { TransitionGroup } from "react-transition-group";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { getData } from "../../utils/api";
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
	PaperProps: {
		style: {
			maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
			width: 250,
		},
	},
};

const UpdatedModal = ({ title, deliverInfo, sendDataToBackend, onClose }) => {
	// Alert 開關
	const [alertOpen, setAlertOpen] = useState(false);

	// 初始預設 default 值
	const defaultValues = {
		name: deliverInfo ? deliverInfo.name : "",
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
				<form onSubmit={handleSubmit(onSubmit, onError)}>
					<div className="flex flex-col pt-4 gap-4">
						<div>
							<Controller
								name="name"
								control={control}
								render={({ field }) => (
									<TextField
										variant="outlined"
										size="small"
										className="inputPadding"
										label="案場名稱"
										placeholder="請輸入案場名稱"
										fullWidth
										{...field}
									/>
								)}
							/>
							<FormHelperText className="!text-red-600 h-5">{errors["name"]?.message}</FormHelperText>
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

const OutputListModal = ({ title, deliverInfo, onClose }) => {
	const textFieldRef = useRef(null);
	const [selectedLoc, setSelectedLoc] = useState([]);
	const [dates, setDates] = useState();
	const [textHelf, setTextHelf] = useState("出工");
	const [valueHelf, setValueHelf] = useState("");
	// isLoading 等待請求 api
	const [isLoading, setIsLoading] = useState(false);

	const handleLocChange = (event) => {
		const selected = event.target.value;
		setSelectedLoc(selected);
	};

	// 取得當前格式化後的日期
	const formatDate = (date, result = "yyyy-mm-dd") => {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, "0");
		const day = String(date.getDate()).padStart(2, "0");
		return result === "yyyy-mm-dd" ? `${year}-${month}-${day}` : `${month}/${day}`;
	};

	// 取得所有所選地點的現場人員 api (過濾顯示)
	const getMemberList = () => {
		setIsLoading(true);
		let promises = []; // 用於儲存所有的 promise
		selectedLoc.forEach((locId) => {
			let url = `site/${locId}/${dates ? formatDate(dates) : formatDate(tomorrow)}`;
			let title = deliverInfo.find((item) => item.id === locId).name;
			const promise = getData(url).then((result) => {
				const data = result.result;
				const dutyCallNicknames = data.filter((item) => item.dutyCall === true).map((item) => item.nickname);
				return dutyCallNicknames.length !== 0 ? `${title}\n${dutyCallNicknames.join(" ")}` : "";
			});
			promises.push(promise); // 將每個 promise 新增到陣列中
		});

		// 使用 Promise.all 來等待所有 promise 完成
		Promise.all(promises)
			.then((nicknamesList) => {
				setIsLoading(false);
				const datalist = nicknamesList.join("\n\n");
				setValueHelf(datalist);
			})
			.catch((error) => {
				console.error("Error:", error);
			});
	};

	const handleButtonClick = (event) => {
		setTextHelf(event.target.innerText);
	};

	const handleCopy = () => {
		if (textFieldRef.current) {
			const textToCopy = textFieldRef.current.value;

			navigator.clipboard
				.writeText(textToCopy)
				.then(() => {
					alert("文本已成功复制到剪贴板！");
				})
				.catch((error) => {
					console.error("复制到剪贴板失败:", error);
				});
		}
	};

	return (
		<ModalTemplete title={title} show={true} onClose={onClose}>
			<div className="flex flex-col pt-4 gap-4">
				<DatePicker defaultValue={tomorrow} setDates={setDates} />
				<div className="inline-flex gap-3">
					<Button
						variant="outlined"
						color="secondary"
						className="!text-base !h-12"
						onClick={handleButtonClick}
						fullWidth>
						出工
					</Button>
					<Button
						variant="outlined"
						color="secondary"
						className="!text-base !h-12"
						onClick={handleButtonClick}
						fullWidth>
						案場
					</Button>
				</div>
				<div className="inline-flex items-center gap-3">
					<FormControl size="small" className="inputPadding" fullWidth>
						{selectedLoc.length === 0 ? (
							<InputLabel id="loc-select-label" disableAnimation shrink={false} focused={false}>
								請選擇地點
							</InputLabel>
						) : null}
						<Select
							labelId="loc-select-label"
							multiple
							value={selectedLoc}
							onChange={handleLocChange}
							MenuProps={MenuProps}>
							{deliverInfo &&
								deliverInfo.map((data) => (
									<MenuItem key={data.id} value={data.id}>
										<Checkbox checked={selectedLoc.indexOf(data.id) > -1} />
										{data.name}
									</MenuItem>
								))}
						</Select>
					</FormControl>
					<Button variant="contained" color="dark" className="!text-base !h-12" onClick={getMemberList}>
						查詢
					</Button>
				</div>
				<TextField
					multiline
					rows={8}
					value={`${dates ? formatDate(dates, "mm/dd") : formatDate(tomorrow, "mm/dd")} ${textHelf}\n\n${valueHelf}`}
					InputProps={{
						readOnly: true,
					}}
					inputRef={textFieldRef}
					disabled={isLoading}
				/>
				{isLoading && <Loading size={40} classNames="absolute left-0 right-0" />}
				<Button
					variant="contained"
					color="success"
					className="!text-base !h-12"
					onClick={handleCopy}
					disabled={isLoading}
					fullWidth>
					複製
				</Button>
			</div>
		</ModalTemplete>
	);
};

const DispatchWorkModal = ({ title, deliverInfo, sendDataToBackend, onClose }) => {
	const [persons, setPersons] = useState([]);
	const [selectedPersons, setSelectedPersons] = useState([]);
	const [selectedPerson, setSelectedPerson] = useState("");
	const [dates, setDates] = useState();
	// 檢查是否被汙染
	const [isDirty, setIsDirty] = useState(false);
	// Alert 開關
	const [alertOpen, setAlertOpen] = useState(false);
	// isLoading 等待請求 api
	const [isLoading, setIsLoading] = useState(false);

	// Intl.Collator 物件支援語言敏感的字串比較
	const collator = new Intl.Collator("zh-Hant");

	// Select 選單排序
	const comparePersons = (a, b) => {
		return collator.compare(a.nickname, b.nickname);
	};

	// 取得當前格式化後的日期
	const formatDate = (date) => {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, "0");
		const day = String(date.getDate()).padStart(2, "0");
		return `${year}-${month}-${day}`;
	};

	const furl = "site";
	useEffect(() => {
		setIsLoading(true);
		resetModal();

		let url = furl + "/" + deliverInfo.id + "/" + (dates ? formatDate(dates) : formatDate(tomorrow));
		getData(url).then((result) => {
			setIsLoading(false);
			const data = result.result;
			setPersons(data.filter((person) => !person.dutyCall).sort(comparePersons));
			setSelectedPersons(data.filter((person) => person.dutyCall));
		});
	}, [dates]);

	const handlePersonChange = useCallback((event) => {
		const selected = event.target.value;
		setSelectedPerson(selected);
	}, []);

	const handleAddPerson = useCallback(() => {
		if (!isDirty) setIsDirty(true);
		if (selectedPerson) {
			setSelectedPersons([persons.find((p) => p.id === selectedPerson), ...selectedPersons]);
			setPersons(persons.filter((p) => p.id !== selectedPerson).sort(comparePersons));
			setSelectedPerson("");
		}
	}, [selectedPerson, persons, selectedPersons]);

	const handleRemovePerson = useCallback(
		(person) => {
			if (!isDirty) setIsDirty(true);
			setPersons([selectedPersons.find((p) => p.id === person), ...persons].sort(comparePersons));
			setSelectedPersons(selectedPersons.filter((p) => p.id !== person));
		},
		[selectedPersons, persons]
	);

	const onSubmit = () => {
		const ids = selectedPersons.map((item) => item.id);
		const fd = new FormData();
		fd.append("labourer", ids.join(","));

		sendDataToBackend(fd, "dw", [deliverInfo.id, dates ? formatDate(dates) : formatDate(tomorrow, "mm/dd")]);
	};

	const resetModal = () => {
		setPersons([]);
		setSelectedPersons([]);
		setSelectedPerson("");
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
			<ModalTemplete title={title} show={persons ? true : false} onClose={onCheckDirty}>
				<form>
					<div className="flex flex-col pt-4 gap-2.5">
						<InputTitle title={"案場"} required={false} pb={false}>
							<span className="text-lg">{deliverInfo.name}</span>
						</InputTitle>
						<div className="flex flex-col">
							<InputTitle title={"日期"} required={false} />
							<DatePicker defaultValue={tomorrow} setDates={setDates} />
						</div>
						<div className="flex flex-col">
							<InputTitle title={"人員"} required={false} />
							<div className="inline-flex gap-3">
								<FormControl size="small" className="inputPadding" fullWidth>
									{selectedPerson === "" ? (
										<InputLabel id="person-select-label" disableAnimation shrink={false} focused={false}>
											請選擇人員
										</InputLabel>
									) : null}
									<Select
										labelId="person-select-label"
										value={selectedPerson}
										onChange={handlePersonChange}
										MenuProps={MenuProps}>
										{persons.map((person) => (
											<MenuItem key={"select" + person.id} value={person.id}>
												{person.nickname}
											</MenuItem>
										))}
									</Select>
								</FormControl>
								<Button
									variant="contained"
									color="dark"
									onClick={handleAddPerson}
									disabled={!selectedPerson}
									className="!text-base !h-12">
									新增
								</Button>
							</div>
						</div>
						<List className="overflow-y-auto border border-neutral-300 rounded" sx={{ height: "20vh" }}>
							{!isLoading ? (
								<TransitionGroup>
									{selectedPersons.map((person) => (
										<Collapse key={"selected" + person.id}>
											<ListItem>
												<ListItemText secondary={person.nickname} />
												<IconButton onClick={() => handleRemovePerson(person.id)}>
													<DeleteIcon />
												</IconButton>
											</ListItem>
											<Divider variant="middle" />
										</Collapse>
									))}
								</TransitionGroup>
							) : (
								<Loading size={48} />
							)}
						</List>
						<Button
							variant="contained"
							onClick={onSubmit}
							color="success"
							className="!text-base !h-12"
							disabled={isLoading}
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
};

export { UpdatedModal, OutputListModal, DispatchWorkModal };

// npm i @mui/x-date-pickers
// npm install --save date-fns
