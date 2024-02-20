import React, { useEffect, useState } from "react";
import { getData, postData } from "../../../../utils/api";

/* modal 元件們 */
import ModalTemplete from "../../../../components/Modal/ModalTemplete";
import {
  Backdrop,
  Button,
  Card,
  Divider,
  FormControl,
  FormHelperText,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";

/* 用於抓自己資料 等之後開放選擇請假代理人會用到 */
import useLocalStorageValue from "../../../../hooks/useLocalStorageValue";

/* 用於表單 */
import { useForm, FormProvider, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import InputTitle from "../../../../components/Guideline/InputTitle";
/* 用於表單中的時間 */
import { format } from "date-fns";
import { zhTW } from "date-fns/locale";
import ControlledTimePicker from "../../../../components/DatePicker/ControlledTimePicker";

/* 用於警告視窗 */
import AlertDialog from "../../../../components/Alert/AlertDialog";
import { useNotification } from "../../../../hooks/useNotification";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";

/* 載入中 */
import { LoadingFour } from "../../../../components/Loader/Loading";

import {
  DateTimePicker,
  LocalizationProvider,
  TimePicker,
  renderTimeViewClock,
} from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import ControlledOnlyTimePicker from "../../../../components/DatePicker/ControlledOnlyTimePicker";

/**
 * 取得書本價格
 * @param {Object} deliverInfo - 物件包含 anaomly，color，id(考勤)，title，type，start
 * @param {Function} onClose - 父層決定此 model 的關閉
 * @param {bool} isOpen - 此 model 的開關
 * @param {Function} setReflesh - 用於送出資料後，重新抓畫面清單資料
 * @param {Array} attendanceTypeList - 我資料
 */

const AttendanceSectionModal = ({
  deliverInfo,
  onClose,
  isOpen,
  setReflesh,
  attendanceTypeList,
}) => {
  /* 汙染警告 modal 開啟 */
  const [alertOpen, setAlertOpen] = useState(false);
  const showNotification = useNotification();

  /* 打 api 的載入時間用 */
  const [sendBackFlag, setSendBackFlag] = useState(false);

  /* 給表單內的時間參考值 */
  const choseDay = new Date(deliverInfo.start);

  /* 下面僅關閉汙染警告視窗 */
  const onCheckDirty = (value) => {
    if (isDirty) {
      setAlertOpen(true);
    } else {
      onClose();
      reset();
    }
  };
  const handleAlertClose = async (agree) => {
    if (agree) {
      reset();
      onClose();
    }
    setAlertOpen(false);
  };

  /* 使用 useForm Hook 來管理表單狀態和驗證 */
  const schema = yup.object().shape({
    leave: yup.string().required("假別不得為空"),
    reason: yup
      .string()
      .max(250, "原因最多只能輸入 250 個字符")
      .required("原因不可為空值！"),
    sinceDate: yup.date().required("起始時間不可為空值！"),
    endDate: yup.date().required("結束時間不可為空值！"),
  });
  const methods = useForm({
    resolver: yupResolver(schema),
  });
  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isDirty },
  } = methods;
  const watchSinceDate = watch("sinceDate");
  const watchEndDate = watch("endDate");

  /* MenuItem 選單樣式調整 */
  const ITEM_HEIGHT = 48;
  const ITEM_PADDING_TOP = 8;
  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        Width: 250,
      },
    },
  };

  /* 取得自身部門人員清單(去除自己) 因為現在還不用選代理人，先註解 */
  // const [memberList, setMemberList] = useState([]);
  // const userProfile = useLocalStorageValue("userProfile");
  // useEffect(() => {
  //   if (userProfile?.department) {
  //     getData(`department/${userProfile.department.id}/staff`).then(
  //       (result) => {
  //         const data = result.result;
  //         const formattedUser = data
  //           .filter((us) => userProfile.id !== us.id)
  //           .map((us) => ({
  //             label:
  //               us.lastname && us.firstname
  //                 ? us.lastname + us.firstname
  //                 : us.displayName,
  //             value: us.id,
  //           }));
  //         setMemberList(formattedUser);
  //       }
  //     );
  //   }
  // }, [userProfile]);

  /* 提交表單資料到後端並執行相關操作 */
  const onSubmit = (data) => {
    setSendBackFlag(true);
    let url = "attendance";
    let message = "送出表單成功";
    if (data.sinceDate < data.endDate) {
      const since =
        deliverInfo.start +
        "T" +
        format(data.sinceDate, "HH:mm:ss", {
          locale: zhTW,
        });
      const until =
        deliverInfo.start +
        "T" +
        format(data.endDate, "HH:mm:ss", {
          locale: zhTW,
        });

      let dataForApi = {
        date: deliverInfo.start,
        type: data.leave,
        since: since,
        until: until,
      };

      const fd = new FormData();
      for (let key in dataForApi) {
        fd.append(key, dataForApi[key]);
      }

      postData(url, fd).then((result) => {
        if (result.status) {
          showNotification(message, true);
          reset();
          onClose();
          setReflesh(true);
        } else {
          showNotification(
            result.result.reason
              ? result.result.reason
              : result.result
              ? result.result
              : "發生無法預期的錯誤，可能為已超過請假期限",
            false
          );
        }
        setSendBackFlag(false);
      });
    } else {
      showNotification("時間起迄輸入錯誤", false);
    }
  };

  return (
    <>
      <ModalTemplete
        title={"請假申請單"}
        show={isOpen}
        maxWidth={"700px"}
        onClose={onCheckDirty}
      >
        {/* ------------- Modal Body 開始 ------------- */}
        {/* ------------- 日期 考勤狀態 ------------- */}
        <div className="h-22 w-full flex gap-4 mt-3">
          <Card className="flex-1 p-3">
            <p
              onClick={() => {
                console.log(deliverInfo);
              }}
            >
              日期：
              <span className="font-bold mb-2">
                {deliverInfo.start}
                {" " +
                  new Date(deliverInfo.start).toLocaleDateString("zh-TW", {
                    weekday: "long",
                  })}
              </span>
            </p>
          </Card>
          <Card
            className="w-32 justify-center items-center hidden md:flex"
            sx={{ backgroundColor: deliverInfo.color, color: "white" }}
            onClick={() => {
              console.log(deliverInfo);
            }}
          >
            {deliverInfo.title}
          </Card>
        </div>

        {/* ------------- 表單 開始------------- */}
        <div className="h-[470px] w-full flex flex-col pt-4">
          <FormProvider {...methods}>
            <form
              className="inline-flex flex-col flex-1  overflow-hidden"
              onSubmit={handleSubmit(onSubmit)}
            >
              <div className="flex flex-col flex-1 gap-4 overflow-y-scroll">
                {/* ------------- 請假類別 ------------- */}
                <div className="w-full flex flex-col">
                  <div className="w-full  sm:mt-0">
                    <InputTitle
                      title={"請假類別"}
                      classnames="whitespace-nowrap text-primary-800 font-bold"
                      pb={true}
                      required={true}
                    />
                    <Controller
                      name="leave"
                      control={control}
                      defaultValue={""}
                      render={({ field }) => (
                        <Select
                          className="inputPadding"
                          displayEmpty
                          MenuProps={MenuProps}
                          fullWidth
                          {...field}
                        >
                          <MenuItem value="" disabled>
                            <span className="text-neutral-400 font-light">
                              請選擇請假類別
                            </span>
                          </MenuItem>

                          {attendanceTypeList?.map((dep) => (
                            <MenuItem
                              key={"select" + dep.value}
                              value={dep.value}
                            >
                              {dep.chinese}
                            </MenuItem>
                          ))}
                        </Select>
                      )}
                    />
                  </div>
                  <FormHelperText
                    className="!text-red-600 break-words !text-right !mt-0 !-mb-2"
                    sx={{ minHeight: "1.25rem" }}
                  >
                    {errors["leave"]?.message}
                  </FormHelperText>
                </div>

                <Divider className="hidden sm:block" />

                {/* ------------- 開始時間 x 結束時間 ------------- */}
                <div className="flex flex-col">
                  <div className="flex sm:flex-row flex-col gap-4">
                    <div className="w-full flex flex-col">
                      <InputTitle
                        title={"請選擇請假時間"}
                        classnames="whitespace-nowrap text-primary-800 font-bold"
                      />
                      <ControlledOnlyTimePicker
                        minutesStep={30}
                        name="sinceDate"
                      />
                      <FormHelperText
                        className="!text-red-600 break-words !text-right !mt-0"
                        sx={{ minHeight: "1.25rem" }}
                      >
                        {errors["sinceDate"]?.message}
                      </FormHelperText>
                    </div>

                    <div className="w-full flex flex-col">
                      <InputTitle
                        title={"結束時間"}
                        classnames="whitespace-nowrap text-primary-800 font-bold"
                      />
                      <ControlledOnlyTimePicker
                        name="endDate"
                        minutesStep={30}
                        minTime={watchSinceDate}
                        disabled={!watchSinceDate}
                        // views={["year", "day", "hours", "minutes"]}
                      />

                      <FormHelperText
                        className="!text-red-600 break-words !text-right !mt-0"
                        sx={{ minHeight: "1.25rem" }}
                      >
                        {errors["endDate"]?.message}
                      </FormHelperText>
                    </div>
                  </div>
                </div>
                <Divider className="hidden sm:block" />
                {/* ------------- 原因 ------------- */}
                <div className="w-full">
                  <InputTitle
                    title={"原因"}
                    required={true}
                    classnames="whitespace-nowrap text-primary-800 font-bold -translate-y-px"
                  />
                  <Controller
                    name="reason"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        multiline
                        rows={2}
                        className="inputPadding"
                        placeholder={"請輸入請假事由"}
                        fullWidth
                        {...field}
                      />
                    )}
                  />
                  <FormHelperText
                    className="!text-red-600 break-words !text-right !mt-0"
                    sx={{ minHeight: "1.25rem" }}
                  >
                    {errors["reason"]?.message}
                  </FormHelperText>
                </div>

                <Divider />
              </div>

              {/* Footer */}
              {/* </div> */}
              <Button
                type="submit"
                variant="contained"
                color="dark"
                className="!text-base !h-12"
                fullWidth
              >
                送出
              </Button>
            </form>
          </FormProvider>
        </div>

        {/* )}
        </div> */}
        {/* ------------- 表單內容 結束------------- */}
        {/* ------------- Modal Body 結束 ------------- */}
      </ModalTemplete>
      {/* 警告視窗元件 開始 */}
      <AlertDialog
        open={alertOpen}
        onClose={handleAlertClose}
        icon={<ReportProblemIcon color="secondary" />}
        title="注意"
        content={`您所做的變更尚未儲存。是否確定要關閉表單`}
        disagreeText="取消"
        agreeText="確定"
      />
      {/* Backdrop */}
      {/* 警告視窗元件 視窗 */}
      {/*  loading 元件 開始 */}
      <Backdrop sx={{ color: "#fff", zIndex: 1400 }} open={sendBackFlag}>
        <LoadingFour />
      </Backdrop>
      {/* loading 元件 結束 */}
    </>
  );
};

export default AttendanceSectionModal;
