import React, { useEffect, useState, useCallback } from "react";
import ModalTemplete from "../../../components/Modal/ModalTemplete";
import InputTitle from "../../../components/Guideline/InputTitle";
import { TextField, Button, FormHelperText } from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

const UpdatedModal = ({ title, sendDataToBackend, onClose }) => {
	const schema = yup.object().shape({
		name: yup.string().required("不可為空值！"),
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

		for (let key in data) {
			fd.append(key, data[key]);
		}

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
	);
};

const EditModal = ({ title, deliverInfo, sendDataToBackend, onClose }) => {
	console.log(deliverInfo);
	const defaultValues = {
		name: deliverInfo ? deliverInfo.name : "",
		explanation: deliverInfo ? deliverInfo.explanation : "",
	};

	const schema = yup.object().shape({
		name: yup.string().required("不可為空值！"),
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
		defaultValues,
		resolver: yupResolver(schema),
	});

	const onSubmit = (data) => {
		const fd = new FormData();

		for (let key in data) {
			fd.append(key, data[key]);
		}

		sendDataToBackend(fd, "edit", deliverInfo.id);
		resetModal();
	};

	const resetModal = () => {
		reset(defaultValues);
		onClose();
	};

	return (
		<ModalTemplete title={title} show={true} onClose={onClose}>
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
	);
};

export { UpdatedModal, EditModal };
