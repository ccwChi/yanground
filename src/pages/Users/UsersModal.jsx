import React, { useEffect, useState, useRef } from "react";
import { useForm, Controller, FormProvider } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { format } from "date-fns"; // format(data, 'yyyy-MM-dd')
// MUI
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
  Checkbox,
  ListItemText,
  Divider,
  Autocomplete,
  Chip,
  CircularProgress,
} from "@mui/material";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
// Components
import ModalTemplete from "../../components/Modal/ModalTemplete";
import ControlledDatePicker from "../../components/DatePicker/ControlledDatePicker";
import { IOSSwitch } from "../../components/Switch/Switch";
import { LoadingThree } from "../../components/Loader/Loading";
import AlertDialog from "../../components/Alert/AlertDialog";
import InputTitle from "../../components/Guideline/InputTitle";
import TableTabbar from "../../components/Tabbar/TableTabbar";
// Hooks
import { useNotification } from "../../hooks/useNotification";
// Utils
import { getData, getDownloadData } from "../../utils/api";

const EditModal = React.memo(
  ({
    title,
    deliverInfo,
    sendDataToBackend,
    onClose,
    departmentList,
    authorityList,
    factorySiteList,
    workDayTypeList,
    WorkHourTypeList,
    jobTitleList,
  }) => {
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
      nationalIdentityCardNumber: yup
        .mixed()
        .test("is-national-id", "第一字為英文 + 九個數字!", (value) => {
          if (!value) {
            return true;
          }
          return /^[A-Za-z]\d{9}$/.test(value);
        }),
      department: yup.string().required("部門不得為空白!"),
      // jobTitle: yup.string().required("職稱不得為空白!"),
    });

    // 初始預設 default 值
    const defaultValues = {
      employeeId: apiData?.employeeId || "",
      displayName: apiData?.displayName || "",
      nickname: apiData?.nickname || "",
      lastname: apiData?.lastname || "",
      firstname: apiData?.firstname || "",
      nationalIdentityCardNumber: apiData?.nationalIdentityCardNumber || "",
      birthDate: apiData?.birthDate ? new Date(apiData.birthDate) : null,
      gender:
        apiData?.gender === null
          ? null
          : apiData?.gender === true
          ? "male"
          : "female",
      startedOn: apiData?.startedOn ? new Date(apiData.startedOn) : null,
      department: apiData?.department?.id ? apiData.department.id : "",
      authorities: apiData?.authorities.map((authority) => authority.id) || [],
      capital: apiData?.capital ? apiData.capital : false,
      factorySite: apiData?.factorySite?.value ? apiData.factorySite.value : "",
      workDayType: apiData?.workDayType?.value ? apiData.workDayType.value : "",
      workHourType: apiData?.workHourType?.value
        ? apiData.workHourType.value
        : "",
      jobTitle: apiData?.jobTitle ? apiData.jobTitle.id : "",
      termination: apiData?.termination ? apiData.termination : null,
      arrangedLeaveDays: apiData?.arrangedLeaveDays
        ? apiData.arrangedLeaveDays
        : 0,
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
      watch,
      reset,
      setValue,
      formState: { errors, isDirty },
    } = methods;
    const watchWorkDayType = watch("workDayType");

    useEffect(() => {
      if (watchWorkDayType !== "SHIFT") setValue("arrangedLeaveDays", 0);
    }, [watchWorkDayType]);

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
      // console.log("data", data);
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
        arrangedLeaveDays: data?.arrangedLeaveDays
          ? data.arrangedLeaveDays.toString()
          : "0",
      };
      if (!convertData?.employeeId) {
        delete convertData.employeeId;
      }
      if (!convertData?.nationalIdentityCardNumber) {
        delete convertData.nationalIdentityCardNumber;
      }
      if (!convertData?.department) {
        delete convertData.department;
      }
      if (!convertData?.workDayType) {
        delete convertData.workDayType;
      }
      if (!convertData?.workHourType) {
        delete convertData.workHourType;
      }
      if (!convertData?.factorySite) {
        delete convertData.factorySite;
      }
      if (!convertData?.jobTitle) {
        delete convertData.jobTitle;
      }
      if (!convertData?.termination) {
        delete convertData.termination;
      }
      for (let key in convertData) {
        fd.append(key, convertData[key]);
      }
      sendDataToBackend(fd, "edit", deliverInfo);
      resetModal();
      // console.log("convertData", convertData);
    };

    const resetModal = () => {
      reset();
      onClose();
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
      { f: "1", text: "資料1/3" },
      { f: "2", text: "資料2/3" },
      { f: "3", text: "資料3/3" },
    ];

    return (
      <>
        {/* Modal */}
        <ModalTemplete
          title={title}
          show={!!authorityList && (deliverInfo ? !!apiData : true)}
          onClose={onCheckDirty}
          maxWidth={"760px"}
        >
          <FormProvider {...methods}>
            {/* TabBar */}
            <div className="md:hidden mt-3 mb-5 flex-1 -m-3">
              <TableTabbar tabGroup={tabGroup} setCat={setCat} cat={cat} />
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
              <div
                className="flex-col relative columns-1 md:columns-3 md:!min-h-[520px] md:!max-h-[52px] md:py-4 px-3 h-fit gap-8 overflow-y-auto"
                style={{ maxHeight: "65vh", scrollbarWidth: "thin" }}
              >
                <div
                  className={`${
                    cat === "1" ? "static" : "hidden"
                  } space-y-4 md:relative md:flex md:flex-col w-full overflow-y-scroll md:overflow-y-hidden max-h-[60vh] md:h-auto md:max-h-fit md:pb-4 px-2`}
                >
                  {/* 員工編號 */}
                  <div className="w-full">
                    <InputTitle title={"員工編號"} required={false} />
                    {/* <span>員工編號</span> */}
                    <Controller
                      name="employeeId"
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
                    <InputTitle title={"LINE 顯示名稱"} required={false} />
                    <Controller
                      name="displayName"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          variant="outlined"
                          size="small"
                          className="inputPadding"
                          placeholder="LINE 顯示名稱"
                          fullWidth
                          {...field}
                          inputProps={{ readOnly: true }}
                        />
                      )}
                    />
                  </div>

                  {/* 姓氏 */}
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

                  {/* 名字 */}
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

                  {/* 暱稱 */}
                  <div className="w-full">
                    <InputTitle title={"暱稱 / 別名"} required={true} />
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
                      className="!text-red-600 break-words !mt-0 md:flex justify-end !-mb-5"
                      sx={{ minHeight: "1.25rem" }}
                    >
                      {errors.nickname && (
                        <span className=" text-red-700 m-0">
                          {errors.nickname.message}
                        </span>
                      )}
                    </FormHelperText>
                  </div>

                  {/* 生日 */}
                  <div className="w-full">
                    <InputTitle title={"生日"} required={false} />
                    <ControlledDatePicker name="birthDate" />
                  </div>

                  {/* 性別 */}
                  <div className="w-full ">
                    <InputTitle title={"性別"} required={false} />
                    <Controller
                      name="gender"
                      control={control}
                      render={({ field }) => (
                        <FormControl className="h-11">
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
                </div>

                <div
                  className={`${
                    cat === "2" ? "static" : "hidden"
                  } space-y-4 md:relative md:flex md:flex-col w-full overflow-y-scroll md:overflow-y-hidden max-h-[60vh] md:h-auto md:max-h-fit md:pb-4 px-2`}
                >
                  {/* 身分證字號 */}
                  <div className="w-full">
                    <InputTitle title={"身份證字號"} required={false} />
                    <Controller
                      name="nationalIdentityCardNumber"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          variant="outlined"
                          size="small"
                          className="inputPadding"
                          placeholder="身分證字號"
                          fullWidth
                          {...field}
                          inputProps={{ autoComplete: "off" }} // 讓他不會自己跳出自動填充框
                        />
                      )}
                    />
                    <FormHelperText
                      className="!text-red-600 break-words !mt-0 md:flex justify-end !-mb-5"
                      sx={{ minHeight: "1.25rem" }}
                    >
                      {errors.nationalIdentityCardNumber && (
                        <span className={`text-red-700 m-0`}>
                          {errors.nationalIdentityCardNumber.message}
                        </span>
                      )}
                    </FormHelperText>
                  </div>

                  {/* 部門 */}
                  <div className="w-full">
                    <InputTitle title={"部門"} required={true} />
                    <Controller
                      name="department"
                      control={control}
                      //   defaultValue=""
                      render={({ field: { value, onChange } }) => (
                        <Select
                          size="small"
                          labelId="department-select-label"
                          fullWidth
                          className="!h-12"
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
                      className="!text-red-600 break-words !mt-0 md:flex justify-end !-mb-5"
                      sx={{ minHeight: "1.25rem" }}
                    >
                      {errors.department && (
                        <span className={`text-red-700 m-0`}>
                          {errors.department.message}
                        </span>
                      )}
                    </FormHelperText>
                  </div>

                  {/* 職稱 */}
                  <div className="w-full">
                    <InputTitle title={"職稱"} required={true} />
                    <Controller
                      name="jobTitle"
                      control={control}
                      render={({ field: { value, onChange } }) => (
                        <Select
                          size="small"
                          labelId="department-select-label"
                          fullWidth
                          className="!h-12"
                          displayEmpty
                          MenuProps={{
                            PaperProps: {
                              style: { maxHeight: "250px" },
                            },
                          }}
                          value={value}
                          onChange={onChange}
                        >
                          <MenuItem value="" disabled>
                            <span className="text-neutral-400 font-light">
                              尚無職稱
                            </span>
                          </MenuItem>
                          {jobTitleList?.map((jobTitle) => (
                            <MenuItem
                              key={"select" + jobTitle.id}
                              value={jobTitle.id}
                            >
                              {jobTitle.name}
                            </MenuItem>
                          ))}
                        </Select>
                      )}
                    />
                    <FormHelperText
                      className="!text-red-600 break-words !mt-0 md:flex justify-end !-mb-5"
                      sx={{ minHeight: "1.25rem" }}
                    >
                      {errors.jobTitle && (
                        <span className={`text-red-700 m-0`}>
                          {errors.jobTitle.message}
                        </span>
                      )}
                    </FormHelperText>
                  </div>

                  {/* 廠別 */}
                  <div className="w-full">
                    <InputTitle title={"廠別"} required={false} />
                    <Controller
                      name="factorySite"
                      control={control}
                      //   defaultValue=""
                      render={({ field: { value, onChange } }) => (
                        <Select
                          size="small"
                          labelId="factorySite-select-label"
                          displayEmpty
                          className="h-12"
                          fullWidth
                          MenuProps={{
                            PaperProps: {
                              style: { maxHeight: "250px", width: "full" },
                            },
                          }}
                          value={value}
                          onChange={onChange}
                        >
                          {factorySiteList?.map((fac, i) => (
                            <MenuItem key={"select" + i} value={fac.value}>
                              {fac.chinese}
                            </MenuItem>
                          ))}
                        </Select>
                      )}
                    />
                  </div>

                  {/* 工時 */}
                  <div className="w-full">
                    <InputTitle title={"工時"} required={false} />
                    <Controller
                      name="workHourType"
                      control={control}
                      //   defaultValue=""
                      render={({ field: { value, onChange } }) => (
                        <Select
                          size="small"
                          labelId="workHourType-select-label"
                          className="h-12"
                          displayEmpty
                          fullWidth
                          MenuProps={{
                            PaperProps: {
                              style: { maxHeight: "250px" },
                            },
                          }}
                          value={value}
                          onChange={onChange}
                        >
                          {WorkHourTypeList?.map((depart, i) => (
                            <MenuItem key={"select" + i} value={depart.value}>
                              {depart.chinese}
                            </MenuItem>
                          ))}
                        </Select>
                      )}
                    />
                  </div>

                  {/* 到職日 */}
                  <div className="w-full">
                    <InputTitle title={"到職日"} />
                    <ControlledDatePicker name="startedOn" />
                  </div>

                  {/* 離職日 */}
                  <div className="w-full">
                    <InputTitle title={"離職日"} required={false} />
                    <ControlledDatePicker name="termination" />
                  </div>
                </div>

                <div
                  className={`${
                    cat === "3" ? "static" : "hidden"
                  } space-y-4 md:relative md:flex md:flex-col w-full overflow-y-scroll md:overflow-y-hidden max-h-[60vh] md:h-auto md:max-h-fit md:pb-4 px-2`}
                >
                  {/* 權限 */}
                  <div className="w-full">
                    <InputTitle title={"權限"} required={false} />
                    <FormControl
                      component="fieldset"
                      variant="standard"
                      className="w-full"
                    >
                      <Box className="w-full  overflow-y-auto h-[300px] border border-gray-300 rounded-md px-3">
                        <Controller
                          name="authorities"
                          control={control}
                          render={() => (
                            <FormGroup>
                              {authorityList?.map((authority) => (
                                <FormControlLabel
                                  className="justify-between !m-0 border-b-[1px] border-gray-300 "
                                  key={authority.id}
                                  id={authority.id}
                                  {...register("authorities")}
                                  control={
                                    <IOSSwitch
                                      sx={{ m: 1 }}
                                      value={authority.id}
                                      defaultChecked={apiData?.authorities.some(
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

                  {/* 班制 */}
                  <div className="w-full">
                    <InputTitle title={"班制"} required={false} />
                    <Controller
                      name="workDayType"
                      control={control}
                      //   defaultValue=""
                      render={({ field: { value, onChange } }) => (
                        <Select
                          size="small"
                          labelId="workDayType-select-label"
                          displayEmpty
                          className="h-12"
                          fullWidth
                          MenuProps={{
                            PaperProps: {
                              style: { maxHeight: "250px" },
                            },
                          }}
                          value={value}
                          onChange={onChange}
                        >
                          {workDayTypeList?.map((work, i) => (
                            <MenuItem key={"select" + i} value={work.value}>
                              {work.chinese}
                            </MenuItem>
                          ))}
                        </Select>
                      )}
                    />
                  </div>

                  {/* 排休天數 */}
                  <div className="w-full">
                    <InputTitle title={"排休人員月休日"} required={false} />
                    <Controller
                      name="arrangedLeaveDays"
                      control={control}
                      disabled={watchWorkDayType !== "SHIFT"}
                      render={({ field }) => (
                        <TextField
                          variant="outlined"
                          size="small"
                          type="number"
                          className="inputPadding"
                          placeholder="請輸入天數"
                          fullWidth
                          {...field}
                        />
                      )}
                    />
                  </div>

                  {/* 異常考勤通知 */}
                  <div className="w-full inline-flex">
                    <InputTitle title={"考勤異常通知"} required={false} />
                    <Controller
                      name="capital"
                      control={control}
                      render={({ field: { value, onChange } }) => (
                        <Checkbox
                          checked={!value}
                          onChange={(e) => onChange(!value)}
                          className="!-mt-2"
                        />
                      )}
                    />
                  </div>
                </div>
              </div>

              <div className="md:!mt-3">
                <FormHelperText
                  className="!text-red-600 break-words text-justify !mt-0 md:hidden"
                  sx={{ minHeight: "1.25rem" }}
                >
                  {errors.nickname && (
                    <span className=" text-red-700 m-0 pl-5">
                      {errors.nickname.message}
                      {(errors.nationalIdentityCardNumber ||
                        errors.department) && <br />}
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
          onClick={onCheckDirty}
        >
          <LoadingThree />
        </Backdrop>
      </>
    );
  }
);

const ExportModal = React.memo(({ title, onClose }) => {
  // 部門清單
  const [departmentList, setDepartmentList] = useState([]);
  // isLoading 等待請求 API
  const [isLoading, setIsLoading] = useState(false);
  // 提示消息框
  const showNotification = useNotification();
  const timer = useRef();

  // 取得部門資料
  useEffect(() => {
    getData("department").then((result) => {
      if (result.result) {
        const data = result.result.content;
        const formattedDep = data.map((dep) => ({
          label: dep.name,
          id: dep.id,
        }));
        setDepartmentList(formattedDep);
      } else {
        setDepartmentList([]);
      }
    });
  }, []);

  // 初始預設 default 值
  const defaultValues = {
    department: [],
  };

  // 使用 useForm Hook 來管理表單狀態和驗證
  const methods = useForm({
    defaultValues,
  });
  const { control, handleSubmit } = methods;

  // 提交表單資料到後端並執行相關操作
  const onSubmit = (data) => {
    setIsLoading(true);
    // 下面有部門時就會開放
    // 使用 map 函數將每個對象的 id 提取出來, 並將空字符串過濾掉
    const idList = data["department"].map((item) => item.id);
    const filteredIdList = idList.filter((id) => id !== "");
    const idListString = filteredIdList.toString();

    getDownloadData(
      `user/export${!!idListString ? `?departments=${idListString}` : ""}`
    ).then((result) => {
      if (!!result) {
        timer.current = window.setTimeout(() => {
          setIsLoading(false);
        }, 2000);
        if (result.reason) {
          showNotification(result.reason, false);
        } else {
          showNotification(result || "系統錯誤", false);
        }
      } else {
        timer.current = window.setTimeout(() => {
          setIsLoading(false);
        }, 2000);
        showNotification("下載成功", true);
      }
    });
  };

  return (
    <>
      {/* Modal */}
      <ModalTemplete
        title={title}
        show={true}
        maxWidth={"540px"}
        onClose={onClose}
      >
        <div className="flex flex-col pt-4 sm:min-h-[300px] min-h-[400px]">
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="flex flex-col">
                <div className="flex flex-col gap-3 mb-2">
                  {/* 部門 */}
                  <div className="inline-flex flex-col w-full">
                    {/* <InputTitle classnames="whitespace-nowrap" title={"部門"} required={false} /> */}
                    <Controller
                      control={control}
                      name="department"
                      render={({ field }) => {
                        const { onChange, value } = field;
                        return (
                          <Autocomplete
                            multiple
                            disableCloseOnSelect
                            options={departmentList}
                            value={value}
                            onChange={(event, selectedOptions) => {
                              onChange(selectedOptions);
                            }}
                            isOptionEqualToValue={(option, value) =>
                              option.id === value.id
                            }
                            renderTags={(tagValue, getTagProps) =>
                              tagValue.map((option, index) => (
                                <Chip
                                  label={option.label}
                                  {...getTagProps({ index })}
                                />
                              ))
                            }
                            renderOption={(props, option, { selected }) => (
                              <li {...props}>
                                <Checkbox
                                  icon={
                                    <CheckBoxOutlineBlankIcon fontSize="small" />
                                  }
                                  checkedIcon={
                                    <CheckBoxIcon fontSize="small" />
                                  }
                                  style={{ marginRight: 8 }}
                                  checked={selected}
                                />
                                {option.label}
                              </li>
                            )}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                className="inputPadding bg-white"
                                placeholder="請選擇部門 (默認全部)"
                                // sx={{ "& > div": { padding: "0 !important" } }}
                                InputProps={{
                                  ...params.InputProps,
                                  endAdornment: (
                                    <>
                                      {departmentList.length <= 0 ? (
                                        <CircularProgress
                                          className="absolute right-[2.325rem]"
                                          size={20}
                                        />
                                      ) : null}
                                      {params.InputProps.endAdornment}
                                    </>
                                  ),
                                }}
                              />
                            )}
                            ListboxProps={{ style: { maxHeight: "12rem" } }}
                            loading={departmentList.length <= 0}
                            loadingText={"載入中..."}
                            fullWidth
                          />
                        );
                      }}
                    />
                  </div>
                  <div className="relative inline-flex">
                    <Button
                      type="submit"
                      variant="contained"
                      color="dark"
                      disabled={isLoading}
                      className="!text-base !h-12 whitespace-nowrap"
                      fullWidth
                    >
                      生成報表
                    </Button>
                    {isLoading && (
                      <CircularProgress
                        size={24}
                        sx={{
                          position: "absolute",
                          top: "50%",
                          left: "50%",
                          marginTop: "-12px",
                          marginLeft: "-12px",
                        }}
                      />
                    )}
                  </div>
                </div>
                <div className="flex mt-2">
                  <p className="!my-0 text-rose-400 font-bold text-xs !me-1">
                    ＊
                  </p>
                  <p className="!my-0 text-rose-400 font-bold text-xs">
                    若無選擇部門，則默認全部。
                  </p>
                </div>
              </div>
            </form>
          </FormProvider>
        </div>
      </ModalTemplete>
    </>
  );
});

export { EditModal, ExportModal };

// npm i @mui/x-date-pickers
// npm install --save date-fns
