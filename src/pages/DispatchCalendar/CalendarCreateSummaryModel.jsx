import React, { useEffect, useState } from "react";
import ModalTemplete from "../../components/Modal/ModalTemplete";

import ControlledDatePicker from "../../components/DatePicker/ControlledDatePicker";
import { format } from "date-fns";
import AlertDialog from "../../components/Alert/AlertDialog";
import { LoadingFour, LoadingThree } from "../../components/Loader/Loading";
import {
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
  Backdrop,
} from "@mui/material";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import { useForm, Controller, FormProvider } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

import InputTitle from "../../components/Guideline/InputTitle";
import { getData } from "../../utils/api";

const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);

const UpdatedModal = React.memo(
  ({
    sendBackFlag,
    title,
    deliverInfo,
    sendDataToBackend,
    onClose,
    projectsList,
  }) => {
    const [alertOpen, setAlertOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [constructionJobList, setConstructionJobList] = useState(null);

    const defaultValues = {
      name: deliverInfo?.name ? deliverInfo.name : "",
      project: deliverInfo?.project ? deliverInfo.project.id : "",
      rocYear: deliverInfo?.rocYear ? deliverInfo.rocYear : "",
      since: deliverInfo?.since ? new Date(deliverInfo.since) : null,
      until: deliverInfo?.until ? new Date(deliverInfo.until) : null,
    };
    // 處理表單驗證錯誤時的回調函數

    // 使用 Yup 來定義表單驗證規則
    const schema = yup.object().shape({
      name: yup.string().required("清單標題不可為空值！"),
      rocYear: yup
        .number("應為數字")
        .required("不可為空值！")
        .test("len", "格式應為民國年", (val) =>
          /^[0-9]{3}$/.test(val.toString())
        )
        .typeError("應填寫民國年 ex: 112"),
      project: yup.string().required("需選擇所屬專案！"),
      since: yup.date().nullable(),
      until: yup
        .date()
        .nullable()
        .test({
          name: "custom-validation",
          message: "完工日期不能早於施工日期",
          test: function (until) {
            const since = this.parent.since;
            // 只有在 estimatedSince 和 estimatedUntil 都有值時才驗證
            if (since && until) {
              const formattedSince = new Date(since).toLocaleDateString(
                "en-CA",
                { timeZone: "Asia/Taipei" }
              );
              const formattedUntil = new Date(until).toLocaleDateString(
                "en-CA",
                { timeZone: "Asia/Taipei" }
              );
              return formattedUntil >= formattedSince;
            }
            return true; // 如果其中一個為空，則不驗證
          },
        }),
    });
    const methods = useForm({
      defaultValues,
      resolver: yupResolver(schema),
    });

    const {
      control,
      handleSubmit,
      reset,
      watch,
      formState: { errors, isDirty },
    } = methods;

    const sinceDay = watch("since");

    //將外面傳進來的員工資料deliverInfo代入到每個空格之中
    useEffect(() => {
      if (deliverInfo?.id && deliverInfo?.constructionJob?.constructionType) {
        setIsLoading(true);
        getConstructionTypeList(deliverInfo?.constructionJob?.constructionType);
        setIsLoading(false);
      }
    }, [deliverInfo, reset]);

    // 提交表單資料到後端並執行相關操作
    const onSubmit = (data) => {
      const convertData = {
        ...data,
        since: data?.since ? format(data.since, "yyyy-MM-dd") : "",
        until: data?.until ? format(data.until, "yyyy-MM-dd") : "",
      };
      delete convertData.type;
      const fd = new FormData();
      for (let key in convertData) {
        fd.append(key, convertData[key]);
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

    const handleAlertClose = (agree) => {
      if (agree) {
        onClose();
      }
      setAlertOpen(false);
    };

    //取得類別清單後再求得JobList
    const getConstructionTypeList = (value) => {
      setIsLoading(true);
      const typeurl = `constructionType/${value}/job`;
      getData(typeurl).then((result) => {
        setIsLoading(false);
        const data = result.result;
        setConstructionJobList(data);
      });
    };

    return (
      <>
        {/* Modal */}
        <ModalTemplete
          title={title}
          show={true}
          maxWidth={"640px"}
          onClose={onCheckDirty}
          className=""
        >
      <div className="w-full max-h-[600px] overflow-y-auto relative">
        <FormProvider {...methods}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="h-full flex flex-col"
          >
            <div className="flex flex-col my-3 flex-1 h-[450px] overflow-y-scroll">
              <div
                className="flex flex-col px-1 pb-2"
                // style={{ maxHeight: "60vh" }}
              >
                {/* 所屬專案 */}
                <div className="sm:mt-2">
                  <InputTitle title={"所屬專案"} />
                  <Controller
                    name="project"
                    control={control}
                    render={({ field: { value, onChange } }) => (
                      <FormControl
                        size="small"
                        className="inputPadding"
                        fullWidth
                      >
                        {value === "" ? (
                          <InputLabel
                            disableAnimation
                            shrink={false}
                            focused={false}
                          >
                            請選擇所屬專案
                          </InputLabel>
                        ) : null}
                        <Select
                          MenuProps={{
                            PaperProps: {
                              style: { maxHeight: "250px" },
                            },
                          }}
                          value={value}
                          onChange={(e) => {
                            onChange(e);
                          }}
                        >
                          {projectsList?.map((project) => (
                            <MenuItem
                              key={"select" + project.id}
                              value={project.id}
                            >
                              {project.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                  />
                  <FormHelperText
                    className="!text-red-600 break-words !text-right !mt-0"
                    sx={{ minHeight: "1.25rem" }}
                  >
                    {errors["project"]?.message}
                  </FormHelperText>
                </div>

                {/* 專案名稱 / 年度 */}
                <div className="inline-flex sm:flex-row flex-col sm:gap-2 gap-0  sm:mb-0 sm:mt-2">
                  <div className="w-full">
                    <InputTitle title={"施工清單標題"} />
                    <Controller
                      name="name"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          variant="outlined"
                          size="small"
                          className="inputPadding"
                          placeholder="清單標題"
                          fullWidth
                          {...field}
                        />
                      )}
                    />
                    <FormHelperText
                      className="!text-red-600 break-words !text-right !mt-0"
                      sx={{ minHeight: "1.25rem" }}
                    >
                      {errors["name"]?.message}
                    </FormHelperText>
                  </div>

                  {/* 所屬年度 */}
                  <div className="w-full">
                    <InputTitle title={"專案年度"} />
                    <Controller
                      name="rocYear"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          variant="outlined"
                          size="small"
                          className="inputPadding"
                          placeholder="專案年度"
                          fullWidth
                          {...field}
                        />
                      )}
                    />
                    <FormHelperText
                      className="!text-red-600 break-words !text-right !mt-0"
                      sx={{ minHeight: "1.25rem" }}
                    >
                      {errors["rocYear"]?.message}
                    </FormHelperText>
                  </div>
                </div>

                <div className="inline-flex sm:flex-row flex-col sm:gap-2 gap-0  sm:mb-0 sm:mt-2">
                  {/* 施工日期 */}
                  <div className="w-full  mt-1">
                    <InputTitle title={"施工日期"} required={false} />
                    <ControlledDatePicker name="since" />
                  </div>

                  {/* 完工日期 */}
                  <div className="w-full mt-1">
                    <InputTitle title={"完工日期"} required={false} />

                    <ControlledDatePicker name="until" minDate={sinceDay} />
                    <FormHelperText
                      className="!text-red-600  break-words !text-right !m-0"
                      sx={{ minHeight: "1.25rem" }}
                    >
                      <span>{errors.until?.message}</span>
                    </FormHelperText>
                  </div>
                </div>
                <p className="!my-0 text-rose-400 font-bold text-xs">
                  * 建議先填寫粗估時間，後續派工事項都會被限制在該時間區段之間；
                </p>
                <p className="!my-0 text-rose-400 font-bold text-xs">
                  *
                  若無先粗估時間則無法對後續派工項目進行新增處理，可先建立後後續再修改。
                </p>
              </div>
            </div>

            <div className="h-fit flex justify-between gap-x-2">
              <Button
                type="submit"
                variant="contained"
                color="success"
                className="!text-base !h-10 w-full"
              >
                儲存
              </Button>
            </div>
            <div className="flex mt-2">
              <p className="!my-0 text-rose-400 font-bold text-xs !me-1">＊</p>
              <p className="!my-0 text-rose-400 font-bold text-xs">
                儲存即新增/修改該施工清單
              </p>
            </div>
          </form>
        </FormProvider>
      </div>
        </ModalTemplete>
        <Backdrop
          sx={{ color: "#fff", zIndex: 1050 }}
          open={!constructionJobList}
          onClick={onCheckDirty}
        >
          <LoadingThree size={40} />
        </Backdrop>
        <Backdrop sx={{ color: "#fff", zIndex: 1400 }} open={sendBackFlag}>
          <LoadingFour />
        </Backdrop>
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
  }
);

export { UpdatedModal };
