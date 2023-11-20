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
  FormHelperText,
  Backdrop,
} from "@mui/material";
import {
  useForm,
  Controller,
  FormProvider,
  authorityList,
} from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { getData } from "../../utils/api";
import { IOSSwitch } from "../../components/Switch/Switch";
import { useNotification } from "../../hooks/useNotification";
import AlertDialog from "../../components/Alert/AlertDialog";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import InputTitle from "../../components/Guideline/InputTitle";
import TableTabber from "../../components/Tabbar/TableTabber";
import Loading from "../../components/Loader/Loading";

const EditModal = ({
  title,
  deliverInfo,
  sendDataToBackend,
  onClose,
  departmentList,
  authorityList,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [cat, setCat] = useState("1");

  // 檢查是否被汙染
  const [alertOpen, setAlertOpen] = useState(false);

  const theme = useTheme();
  const padScreen = useMediaQuery(theme.breakpoints.down("768"));

  const schema = yup.object().shape({
    nickname: yup.string().required("暱稱不得為空白!"),
    nationalIdentityCardNumber: yup
      .mixed()
      .test("is-national-id", "格式為第一字為英文 + 九個數字!", (value) => {
        if (!value) {
          return true;
        }
        return /^[A-Za-z]\d{9}$/.test(value);
      }),
    department: yup.string().required("部門不得為空白!"),
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
        department: deliverInfo?.department?.id
          ? deliverInfo.department.id
          : "",
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
    if (convertData?.department === null || convertData?.department === "") {
      delete convertData.department;
    }
    for (let key in convertData) {
      fd.append(key, convertData[key]);
    }
    // console.log(convertData)
    // for (var pair of fd.entries()) {
    //   console.log(pair);
    // }
    // sendDataToBackend(fd, "edit", deliverInfo.id);
    // resetModal();
  };

  const resetModal = () => {
    reset();
    onClose();
  };

  const tabGroup = [
    { f: "1", text: "資料1/2" },
    { f: "2", text: "資料2/2" },
    { f: "3", text: "權限" },
  ];

  return (
    <>
      <ModalTemplete
        title={title}
        show={!!deliverInfo.id && !!authorityList ? true : false}
        onClose={onCheckDirty}
        maxWidth={"760px"}
      >
        <FormProvider {...methods}>
          {/* TabBar */}
          <div className="md:hidden mt-3 mb-5 flex-1 -m-3">
            <TableTabber tabGroup={tabGroup} setCat={setCat} cat={cat} />
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div
              className="flex-col relative columns-1 md:columns-3 md:!min-h-[520px] md:!max-h-[52px] md:py-5 mx-3 h-fit gap-8"
              style={{ maxHeight: "65vh", scrollbarWidth: "thin" }}
            >
              <div
                className={`${
                  cat === "1" ? "static" : "hidden"
                } space-y-4 md:relative md:inline-block w-full overflow-y-auto  max-h-[60vh] md:h-auto md:max-h-fit`}
              >
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
                    //defaultValue={deliverInfo ? deliverInfo[1] : ""}
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
                    sx={{ minHeight: "1.25rem" }}
                  >
                    {errors.nickname && (
                      <span className=" text-red-700 m-0">
                        {errors.nickname.message}
                      </span>
                    )}
                  </FormHelperText>
                </div>
              </div>

              <div
                className={`${
                  cat === "2" ? "static" : "hidden"
                }  md:relative md:inline-block w-full overflow-y-auto  max-h-[60vh] md:h-auto md:max-h-fit`}
              >
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
                          name="row-radio-buttons-group"
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
                    sx={{ minHeight: "1.25rem" }}
                  >
                    {errors.nationalIdentityCardNumber && (
                      <span className={`text-red-700 m-0`}>
                        {errors.nationalIdentityCardNumber.message}
                      </span>
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
                  <InputTitle title={"到職日"} required={false} />
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
                        onChange={onChange}
                      >
                        {departmentList?.map((depart) => (
                          <MenuItem
                            key={"select" + depart.id}
                            value={depart.id}
                          >
                            {depart.name}
                          </MenuItem>
                        ))}
                      </Select>
                    )}
                  />
                  <FormHelperText
                    className="!text-red-600 break-words text-justify !mt-0 hidden md:block"
                    sx={{ minHeight: "1.25rem" }}
                  >
                    {errors.department && (
                      <span className={`text-red-700 m-0`}>
                        {errors.department.message}
                      </span>
                    )}
                  </FormHelperText>
                </div>
              </div>

              {/* 權限 */}
              <div
                className={`${
                  cat === "3" ? "static" : "hidden"
                } space-y-4 md:relative md:inline-block w-full overflow-y-auto max-h-[60vh] md:h-auto md:max-h-fit `}
              >
                <FormControl
                  component="fieldset"
                  variant="standard"
                  className="w-full"
                >
                  {" "}
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
            </div>
            <div className="!mt-2 md:!mt-0">
              <div></div>

              <FormHelperText
                className="!text-red-600 break-words text-justify !mt-0 md:hidden"
                sx={{ minHeight: "1.25rem" }}
              >
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
                {errors.department && (
                  <span className={`text-red-700 m-0 pl-5 `}>
                    {errors.department.message}
                  </span>
                )}
              </FormHelperText>
              <Button
                type="submit"
                variant="contained"
                color="success"
                className="!text-base "
                fullWidth
              >
                儲存
              </Button>
            </div>
          </form>
        </FormProvider>
      </ModalTemplete>
      {/* <Backdrop sx={{ color: "#fff", zIndex: 1050 }} open={!deliverInfo.id || !authorityList} onClick={onCheckDirty}> 
    <Loading size={40} /> 
   </Backdrop> */}

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
