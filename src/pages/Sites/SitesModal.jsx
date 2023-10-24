import React, { useEffect, useState, useCallback } from "react";
import ModalTemplete from "../../components/Modal/ModalTemplete";
import DatePicker from "../../components/Guideline/DatePicker";
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
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { getData } from "../../utils/api";
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);

const UpdatedModal = ({ title, sendDataToBackend, onClose }) => {
	const schema = yup.object().shape({
		name: yup.string().max(25, "請輸入 25 個字以內的案場名稱！").required("不可為空值！"),
	});

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

	const {
		control,
		handleSubmit,
		reset,
		formState: { errors, isDirty },
	} = useForm({
		resolver: yupResolver(schema),
	});

	const onSubmit = (data) => {
		const fd = new FormData();
		fd.append("name", data.name);

		sendDataToBackend(fd, "create");
		resetModal();
	};

	const resetModal = () => {
		reset();
		onClose();
	};

	return (
		<ModalTemplete title={title} show={true} onClose={onClose}>
			<form onSubmit={handleSubmit(onSubmit, onError)}>
				<div className="flex flex-col pt-4 gap-4">
					<div>
						<Controller
							name="name"
							control={control}
							defaultValue={""}
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
						建立
					</Button>
				</div>
			</form>
		</ModalTemplete>
	);
};

const OutputListModal = ({ title, onClose }) => {
	const [selectedLoc, setSelectedLoc] = useState("");
	const handleLocChange = (event) => {
		const selected = event.target.value;
		setSelectedLoc(selected);
	};

	return (
		<ModalTemplete title={title} show={true} onClose={onClose}>
			<div className="flex flex-col pt-4 gap-4">
				<DatePicker defaultValue={new Date().setDate(new Date().getDate() + 1)} />
				<div className="inline-flex gap-3">
					<Button variant="outlined" color="secondary" className="!text-base !h-12" fullWidth>
						出工
					</Button>
					<Button variant="outlined" color="secondary" className="!text-base !h-12" fullWidth>
						案場
					</Button>
				</div>
				<div className="inline-flex items-center gap-3">
					<FormControl size="small" className="inputPadding" fullWidth>
						{selectedLoc === "" ? (
							<InputLabel id="loc-select-label" disableAnimation shrink={false} focused={false}>
								請選擇地點
							</InputLabel>
						) : null}
						<Select labelId="loc-select-label" value={selectedLoc} onChange={handleLocChange}>
							<MenuItem value={10}>還沒有API</MenuItem>
							<MenuItem value={20}>還沒有API</MenuItem>
							<MenuItem value={30}>還沒有API</MenuItem>
						</Select>
					</FormControl>
					<Button variant="contained" color="dark" className="!text-white !text-base !h-12">
						查詢
					</Button>
				</div>
				<TextField multiline rows={6} />
				<Button variant="contained" color="success" className="!text-base !h-12" fullWidth>
					複製
				</Button>
			</div>
		</ModalTemplete>
	);
};

const EditModal = ({ title, deliverInfo, sendDataToBackend, onClose }) => {
	const schema = yup.object().shape({
		name: yup.string().max(25, "請輸入 25 個字以內的案場名稱！").required("不可為空值！"),
	});

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

	const {
		control,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm({
		resolver: yupResolver(schema),
	});

	const onSubmit = (data) => {
		const fd = new FormData();
		fd.append("name", data.name);

		sendDataToBackend(fd, "edit", deliverInfo[0]);
		resetModal();
	};

	const resetModal = () => {
		reset();
		onClose();
	};

	return (
		<ModalTemplete title={title} show={true} onClose={onClose}>
			<form onSubmit={handleSubmit(onSubmit, onError)}>
				<div className="flex flex-col pt-4 gap-4">
					<div>
						<Controller
							name="name"
							control={control}
							defaultValue={deliverInfo ? deliverInfo[1] : ""}
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
	);
};

const DispatchWorkModal = ({ title, deliverInfo, personsData, sendDataToBackend, onClose }) => {
	const [persons, setPersons] = useState([]);
	const [selectedPersons, setSelectedPersons] = useState([]);
	const [selectedPerson, setSelectedPerson] = useState("");
	const [dates, setDates] = useState();
	// isLoading 等待請求 api
	const [isLoading, setIsLoading] = useState(false);

	// Intl.Collator 物件支援語言敏感的字串比較
	const collator = new Intl.Collator("zh-Hant");

	// Select 選單排序
	const comparePersons = (a, b) => {
		return collator.compare(a.nickname, b.nickname);
	};

	// 取得當前格式化後的日期
	const formatToYYYYMMDD = (date) => {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, "0");
		const day = String(date.getDate()).padStart(2, "0");
		return `${year}-${month}-${day}`;
	};

	const furl = "site";
	useEffect(() => {
		setIsLoading(true);
		resetModal();

		let url = furl + "/" + deliverInfo[0] + "/" + (dates ? dates : formatToYYYYMMDD(tomorrow));
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
		if (selectedPerson) {
			setSelectedPersons([persons.find((p) => p.id === selectedPerson), ...selectedPersons]);
			setPersons(persons.filter((p) => p.id !== selectedPerson).sort(comparePersons));
			setSelectedPerson("");
		}
	}, [selectedPerson, persons, selectedPersons]);

	const handleRemovePerson = useCallback(
		(person) => {
			setPersons([selectedPersons.find((p) => p.id === person), ...persons].sort(comparePersons));
			setSelectedPersons(selectedPersons.filter((p) => p.id !== person));
		},
		[selectedPersons, persons]
	);

	const onSubmit = () => {
		const ids = selectedPersons.map((item) => item.id);
		const fd = new FormData();
		fd.append("labourer", ids.join(","));

		sendDataToBackend(fd, "dw", [deliverInfo[0], dates ? dates : formatToYYYYMMDD(tomorrow)]);
		closeModal();
	};

	const resetModal = () => {
		setPersons([]);
		setSelectedPersons([]);
		setSelectedPerson("");
	};

	const closeModal = () => {
		resetModal();
		onClose();
	};

	return (
		<ModalTemplete title={title} show={persons ? true : false} onClose={onClose}>
			<form>
				<div className="flex flex-col pt-4 gap-3">
					<p>
						案場：<span className="text-lg">{deliverInfo[1]}</span>
					</p>
					<div className="flex flex-col gap-1.5">
						<p>日期：</p>
						<DatePicker defaultValue={tomorrow} setDates={setDates} />
					</div>
					<div className="flex flex-col gap-1.5">
						<p>人員：</p>
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
									MenuProps={{
										PaperProps: {
											style: { maxHeight: "250px" },
										},
									}}>
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
								className="!text-white !text-base !h-12">
								新增
							</Button>
						</div>
					</div>
					<List className="overflow-y-auto border border-neutral-300 rounded" sx={{ height: "20vh" }}>
						{selectedPersons.map((person) => (
							<div key={"selected" + person.id}>
								<ListItem>
									<ListItemText secondary={person.nickname} />
									<IconButton onClick={() => handleRemovePerson(person.id)}>
										<DeleteIcon />
									</IconButton>
								</ListItem>
								<Divider variant="middle" />
							</div>
						))}
					</List>
					<Button variant="contained" onClick={onSubmit} color="success" className="!text-base !h-12" fullWidth>
						送出
					</Button>
				</div>
			</form>
		</ModalTemplete>
	);
};

export { UpdatedModal, OutputListModal, EditModal, DispatchWorkModal };

// npm i @mui/x-date-pickers
// npm install --save date-fns
