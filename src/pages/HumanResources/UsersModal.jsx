import React, { useEffect, useState, useCallback } from "react";
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
  useMediaQuery,
} from "@mui/material";
import { useForm, Controller, FormProvider } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { getData } from "../../utils/api";
import { IOSSwitch } from "../../components/Switch/Switch";
import { useNotification } from "../../hooks/useNotification";
import AlertDialog from "../../components/Alert/AlertDialog";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";

const EditModal = ({
  title,
  deliverInfo,
  sendDataToBackend,
  onClose,
  departmentList,
  authorityList,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  // 檢查是否被汙染
  const [alertOpen, setAlertOpen] = useState(false);

  const theme = useTheme();
  const padScreen = useMediaQuery(theme.breakpoints.down("768"));

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

  const methods = useForm({
    resolver: yupResolver(schema),
  });

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = methods;

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
        maxWidth={padScreen ? 428 : "760px"}
      >
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div
              className="flex flex-col gap-5  !overflow-y-auto borderx md:flex-wrap md:min-h-[520px] md:max-h-[540px]"
              style={{ height: "70vh", scrollbarWidth: "thin" }}
            >
              <div className="flex flex-col gap-1.5 w-100 md:w-[320px] mt-5">
                <span>員工編號</span>
                <Controller
                  name="empolyeeId"
                  control={control}
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
              </div>
              <div className="flex flex-col gap-1.5  w-100 md:w-[320px]">
                <span>line名稱</span>
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
                      disabled
                    />
                  )}
                />
              </div>
              {/* 姓名 */}
              <div className="flex gap-x-4  w-100 md:w-[320px]">
                <div className="flex flex-col gap-1.5 ">
                  <span>姓氏</span>
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

                <div className="flex flex-col gap-1.5">
                  <span>名字</span>
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
              </div>
              {/* 暱稱性別 */}
              <div className=" columns-2  w-100 md:w-[320px]">
                <div className="flex flex-col gap-1.5">
                  <span>暱稱</span>
                  <Controller
                    name="nickname"
                    control={control}
                    //defaultValue={deliverInfo ? deliverInfo[1] : ""}
                    render={({ field }) => (
                      <TextField
                        variant="outlined"
                        size="small"
                        className="inputPadding"
                        label={
                          errors.nickname && (
                            <span className=" text-red-700 m-0">
                              {errors.nickname.message}
                            </span>
                          )
                        }
                        placeholder="請輸入暱稱"
                        fullWidth
                        {...field}
                      />
                    )}
                  />
                </div>
                <Controller
                  name="gender"
                  control={control}
                  render={({ field }) => (
                    <FormControl>
                      <span>性別</span>
                      <RadioGroup
                        row
                        aria-labelledby="demo-row-radio-buttons-group-label"
                        name="row-radio-buttons-group"
                        className="mt-2 "
                      >
                        <FormControlLabel
                          {...field}
                          value="male"
                          control={
                            <Radio
                              checked={field.value === "male"}
                              size="small"
                            />
                          }
                          label="男性"
                        />
                        <FormControlLabel
                          {...field}
                          value="female"
                          control={
                            <Radio
                              checked={field.value === "female"}
                              size="small"
                            />
                          }
                          label="女性"
                        />
                      </RadioGroup>
                    </FormControl>
                  )}
                />
              </div>

              <div className="flex flex-col gap-1.5 w-100 md:w-[320px]">
                <span>身份證字號</span>
                <Controller
                  name="nationalIdentityCardNumber"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      variant="outlined"
                      size="small"
                      className="inputPadding"
                      label={
                        errors.nationalIdentityCardNumber && (
                          <span className=" text-red-700 m-0">
                            {errors.nationalIdentityCardNumber.message}
                          </span>
                        )
                      }
                      placeholder="身分證字號"
                      fullWidth
                      {...field}
                    />
                  )}
                />
              </div>

              <div className="flex flex-col gap-1.5 w-100 md:w-[320px] md:mt-5">
                <span>生日</span>
                <ControlledDatePicker name="birthDate" />
              </div>

              <div className="flex flex-col gap-1.5 w-100 md:w-[320px]">
                <p>到職日：</p>
                <ControlledDatePicker name="startedOn" />
              </div>

              <div className="flex flex-col gap-1.5 w-100 md:w-[320px]">
                <span>部門</span>
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
              <FormControl
                component="fieldset"
                variant="standard"
                className="flex flex-col gap-1.5 w-100 md:w-[320px]"
              >
                <span>權限</span>
                <Box className="w-full h-[150px]  overflow-y-auto  bg-slate-50 border-2 rounded-lg">
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
            </div>
            <Button
              type="submit"
              variant="contained"
              color="success"
              className="!text-base !mt-4 md:!mt-0"
              fullWidth
            >
              儲存
            </Button>
          </form>
        </FormProvider>
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
