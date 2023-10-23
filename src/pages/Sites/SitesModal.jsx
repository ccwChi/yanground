import React, { useEffect, useState } from "react";
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
				<DatePicker />
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

const DispatchWorkModal = ({ title, onClose }) => {
	const [persons, setPersons] = useState(["Person 1", "Person 2", "Person 3", "Person 4"]);
	const [selectedPerson, setSelectedPerson] = useState("");
	const [selectedPersons, setSelectedPersons] = useState([]);

	const handlePersonChange = (event) => {
		const selected = event.target.value;
		setSelectedPerson(selected);
	};

	const handleAddPerson = () => {
		if (selectedPerson) {
			setSelectedPersons([...selectedPersons, selectedPerson]);
			setPersons(persons.filter((person) => person !== selectedPerson));
			setSelectedPerson("");
		}
	};

	const handleRemovePerson = (person) => {
		setSelectedPersons(selectedPersons.filter((p) => p !== person));
		setPersons([...persons, person]);
	};

	return (
		<ModalTemplete title={title} show={true} onClose={onClose}>
			<div className="flex flex-col pt-4 gap-3">
				<p>
					案場：<span className="text-lg">后里</span>
				</p>
				<div className="flex flex-col gap-1.5">
					<p>日期：</p>
					<DatePicker />
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
							<Select labelId="person-select-label" value={selectedPerson} onChange={handlePersonChange}>
								{persons.map((person) => (
									<MenuItem key={person} value={person}>
										{person}
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
						<>
							<ListItem key={person}>
								<ListItemText secondary={person} />
								<IconButton onClick={() => handleRemovePerson(person)}>
									<DeleteIcon />
								</IconButton>
							</ListItem>
							<Divider variant="middle" />
						</>
					))}
				</List>
				<Button variant="contained" color="success" className="!text-base !h-12" fullWidth>
					送出
				</Button>
			</div>
		</ModalTemplete>
	);
};

export { UpdatedModal, OutputListModal, EditModal, DispatchWorkModal };

// npm i @mui/x-date-pickers
// npm install --save date-fns
