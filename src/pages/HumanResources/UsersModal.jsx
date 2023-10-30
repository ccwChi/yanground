import React, { useEffect, useState, useCallback } from "react";
import ModalTemplete from "../../components/Modal/ModalTemplete";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { MobileDatePicker } from "@mui/x-date-pickers/MobileDatePicker";
import zhTW from "date-fns/locale/zh-TW";
import { format } from "date-fns"; // format(data, 'yyyy-MM-dd')

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
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
  FormGroup,
  Checkbox,
  Box,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { getData } from "../../utils/api";
import { IOSSwitch } from "../../components/Switch/Switch";
import { faL } from "@fortawesome/free-solid-svg-icons";
import { useNotification } from "../../hooks/useNotification";
import AlertDialog from "../../components/Alert/AlertDialog";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";

const EditModal = ({ title, deliverInfo, sendDataToBackend, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [departmentList, setDepartmentList] = useState(null);
  const [authorityList, setAuthorityList] = useState(null);
  // 檢查是否被汙染
  const [alertOpen, setAlertOpen] = useState(false);

  const showNotification = useNotification();

  const schema = yup.object().shape({
    nickname: yup.string().required("暱稱不得為空白"),
    nationalIdentityCardNumber: yup
      .mixed()
      .test("is-national-id", "第一字為英文，後面九個數字", (value) => {
        if (!value) {
          return true;
        }
        return /^[A-Za-z]\d{9}$/.test(value);
      }),
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

  const onCheckDirty = () => {
    if (isDirty) {
      setAlertOpen(true);
    } else {
      onClose();
    }
  };

  const handleAlertClose = (agree) => {
    if (agree) {
      onClose();
    }
    setAlertOpen(false);
  };

  //取得部門清單跟權限清單
  useEffect(() => {
    setIsLoading(true);
    const departurl = "department";
    const authorityurl = "authority";
    getData(departurl).then((result) => {
      setIsLoading(false);
      const data = result.result.content;
      setDepartmentList(data);
    });
    getData(authorityurl).then((result) => {
      setIsLoading(false);
      const data = result.result;
      setAuthorityList(data);
    });
  }, []);

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm({
    resolver: yupResolver(schema),
  });

  //將外面傳進來的員工資料deliverInfo代入到每個空格之中
  useEffect(() => {
    if (deliverInfo?.id) {
      setIsLoading(true);
      reset({
        empolyeeId: deliverInfo?.empolyeeId || "",
        displayName: deliverInfo?.displayName || "",
        nickname: deliverInfo?.nickname || "",
        lastname: deliverInfo?.lastname || "",
        firstname: deliverInfo?.firstname || "",
        nationalIdentityCardNumber:
          deliverInfo?.nationalIdentityCardNumber || "",
        birthDate: deliverInfo?.birthDate
          ? new Date(deliverInfo.birthDate)
          : null,
        gender:
          deliverInfo?.gender === null
            ? null
            : deliverInfo?.gender === true
            ? "male"
            : "female",
        startedOn: deliverInfo?.startedOn
          ? new Date(deliverInfo.startedOn)
          : null,
        department: deliverInfo?.department?.id,
        authorities:
          deliverInfo?.authorities.map((authority) => authority.id) || [],
      });
      setIsLoading(false);
    }
  }, [deliverInfo, reset]);

  const onSubmit = (data) => {
    const fd = new FormData();
    const convertData = {
      ...data,
      startedOn: data?.startedOn ? format(data.startedOn, "yyyy-MM-dd") : "",
      birthDate: data?.birthDate ? format(data.birthDate, "yyyy-MM-dd") : "",
      gender:
        data.gender === "male" ? true : data.gender === "female" ? false : "",
      nationalIdentityCardNumber: data?.nationalIdentityCardNumber
        ? data.nationalIdentityCardNumber.toUpperCase()
        : "",
    };
    if (
      convertData?.nationalIdentityCardNumber === null ||
      convertData?.nationalIdentityCardNumber === ""
    ) {
      delete convertData.nationalIdentityCardNumber;
    }

    for (let key in convertData) {
      fd.append(key, convertData[key]);
    }

    // for (var pair of fd.entries()) {
    //   console.log(pair);
    // }
    sendDataToBackend(fd, "edit", deliverInfo.id);
    resetModal();
  };

  const resetModal = () => {
    reset();
    onClose();
  };

  return (
    <>
      <ModalTemplete
        title={title}
        show={!!deliverInfo.id && !!authorityList ? true : false}
        onClose={onCheckDirty}
      >
        <form onSubmit={handleSubmit(onSubmit, onError)}>
          <div
            className="flex flex-col pt-4 gap-4 !overflow-y-auto "
            style={{ height: "70vh", scrollbarWidth: "thin" }}
          >
            <div>
              <Controller
                name="empolyeeId"
                control={control}
                //defaultValue={deliverInfo ? deliverInfo[1] : ""}
                render={({ field }) => (
                  <TextField
                    variant="outlined"
                    size="small"
                    className="inputPadding"
                    label="員工編號"
                    placeholder="員工編號"
                    fullWidth
                    disabled
                    {...field}
                  />
                )}
              />
              {/* <FormHelperText className="!text-red-600 h-5">{errors["name"]?.message}</FormHelperText> */}
            </div>

            <div>
              <Controller
                name="displayName"
                control={control}
                //defaultValue={deliverInfo ? deliverInfo[1] : ""}
                render={({ field }) => (
                  <TextField
                    variant="outlined"
                    size="small"
                    className="inputPadding"
                    label="line名稱"
                    placeholder="line名稱"
                    fullWidth
                    {...field}
                    disabled
                  />
                )}
              />
              {/* <FormHelperText className="!text-red-600 h-5">{errors["name"]?.message}</FormHelperText> */}
            </div>
            <div>
              <Controller
                name="lastname"
                control={control}
                //defaultValue={deliverInfo ? deliverInfo[1] : ""}
                render={({ field }) => (
                  <TextField
                    variant="outlined"
                    size="small"
                    className="inputPadding"
                    label="姓氏"
                    placeholder="姓氏"
                    fullWidth
                    {...field}
                  />
                )}
              />
              {/* <FormHelperText className="!text-red-600 h-5">{errors["name"]?.message}</FormHelperText> */}
            </div>
            <div>
              <Controller
                name="firstname"
                control={control}
                //defaultValue={deliverInfo ? deliverInfo[1] : ""}
                render={({ field }) => (
                  <TextField
                    variant="outlined"
                    size="small"
                    className="inputPadding"
                    label="名字"
                    placeholder="名字"
                    fullWidth
                    {...field}
                  />
                )}
              />
              {/* <FormHelperText className="!text-red-600 h-5">{errors["name"]?.message}</FormHelperText> */}
            </div>

            <div>
              <Controller
                name="nickname"
                control={control}
                //defaultValue={deliverInfo ? deliverInfo[1] : ""}
                render={({ field }) => (
                  <TextField
                    variant="outlined"
                    size="small"
                    className="inputPadding"
                    label="暱稱"
                    placeholder="暱稱"
                    fullWidth
                    {...field}
                  />
                )}
              />
              <FormHelperText className="!text-red-600 h-5">
                {" "}
                {errors.nickname && (
                  <p className="text-danger m-0">
                    {errors.nickname.message}
                    {showNotification(`${errors.nickname.message}`, false)}
                  </p>
                )}
              </FormHelperText>
            </div>

            <div>
              <Controller
                name="nationalIdentityCardNumber"
                control={control}
                //defaultValue={deliverInfo ? deliverInfo[1] : ""}
                render={({ field }) => (
                  <TextField
                    variant="outlined"
                    size="small"
                    className="inputPadding"
                    label="身分證字號"
                    placeholder="身分證字號"
                    fullWidth
                    {...field}
                  />
                )}
              />
              <FormHelperText className="!text-red-600 h-5">
                {" "}
                {errors.nationalIdentityCardNumber && (
                  <p className="text-danger m-0">
                    {errors.nationalIdentityCardNumber.message}
                    {showNotification("身分證格式錯誤", false)}
                  </p>
                )}
              </FormHelperText>
              {/* <FormHelperText className="!text-red-600 h-5">{errors["name"]?.message}</FormHelperText> */}
            </div>
            <div>
              <Controller
                name="gender"
                control={control}
                render={({ field }) => (
                  <FormControl>
                    <FormLabel
                      id="demo-row-radio-buttons-group-label"
                      onClick={() => {
                        console.log(
                          "departmentList",
                          departmentList,
                          "authorityList",
                          authorityList
                        );
                      }}
                    >
                      性別
                    </FormLabel>
                    <RadioGroup
                      row
                      aria-labelledby="demo-row-radio-buttons-group-label"
                      name="row-radio-buttons-group"
                    >
                      <FormControlLabel
                        {...field}
                        value="male"
                        control={<Radio checked={field.value === "male"} />}
                        label="男性"
                      />
                      <FormControlLabel
                        {...field}
                        value="female"
                        control={<Radio checked={field.value === "female"} />}
                        label="女性"
                      />
                    </RadioGroup>
                  </FormControl>
                )}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <p
                onClick={() => {
                  console.log(deliverInfo);
                }}
              >
                生日：
              </p>
              <LocalizationProvider
                dateAdapter={AdapterDateFns}
                adapterLocale={zhTW}
              >
                <Controller
                  name="birthDate"
                  control={control}
                  render={({ field }) => (
                    <MobileDatePicker
                      slotProps={{ textField: { size: "small" } }}
                      className="inputPadding"
                      dayOfWeekFormatter={(_day, weekday) => {
                        console.log(); // AVOID BUG
                      }}
                      sx={[
                        {
                          width: "100%",
                        },
                      ]}
                      {...field}
                      format="yyyy-MM-dd"
                    />
                  )}
                />
              </LocalizationProvider>
            </div>

            <div className="flex flex-col gap-1.5">
              <p>到職日：</p>
              <LocalizationProvider
                dateAdapter={AdapterDateFns}
                adapterLocale={zhTW}
              >
                <Controller
                  name="startedOn"
                  control={control}
                  render={({ field }) => (
                    <MobileDatePicker
                      slotProps={{ textField: { size: "small" } }}
                      className="inputPadding"
                      dayOfWeekFormatter={(_day, weekday) => {
                        console.log(); // AVOID BUG
                      }}
                      sx={[{ width: "100%" }]}
                      {...field}
                      format="yyyy-MM-dd"
                    />
                  )}
                />
              </LocalizationProvider>
            </div>

            <div className="flex flex-col gap-1.5">
              <p>部門</p>
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
                    onChange={onChange}
                  >
                    {departmentList?.map((depart) => (
                      <MenuItem key={"select" + depart.id} value={depart.id}>
                        {depart.name}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
            </div>

            <FormControl component="fieldset" variant="standard">
              <FormLabel component="legend">權限</FormLabel>
              <Box sx={{ width: "100%", height: "180px", overflowY: "scroll" }}>
                <Controller
                  name="authorities"
                  control={control}
                  render={() => (
                    <FormGroup>
                      {authorityList?.map((authority) => (
                        <FormControlLabel
                          className="justify-between !m-0 pl-3 pe-3 border-b-2 "
                          key={authority.id}
                          id={authority.id}
                          {...register("authorities")}
                          control={
                            <IOSSwitch
                              sx={{ m: 1 }}
                              value={authority.id}
                              defaultChecked={deliverInfo?.authorities.some(
                                (existingAuthority) =>
                                  existingAuthority.id === authority.id
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

            <Button
              type="submit"
              variant="contained"
              color="success"
              className="!text-base !h-12"
              fullWidth
            >
              儲存
            </Button>
          </div>
        </form>
      </ModalTemplete>
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

export default EditModal;

// npm i @mui/x-date-pickers
// npm install --save date-fns
