import {
  Button,
  CircularProgress,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { format } from "date-fns";
import InputTitle from "../../components/Guideline/InputTitle";
import ControlledDatePicker from "../../components/DatePicker/ControlledDatePicker";
import { Controller, FormProvider, useForm } from "react-hook-form";
import React, { useEffect } from "react";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

const currentYear = new Date().toLocaleDateString("zh-TW-u-ca-roc", {
  year: "numeric",
});

// step-1 的 div，編修施工清單本人
const StepperDivOneForSummary = React.memo(
  ({
    deliverInfo,
    projectsList,
    setIsDivDirty,
    sendDataToBackend,
    setActiveStep,
    isLoading,
    onClose,
  }) => {
    const defaultValues = {
      name: deliverInfo?.name ? deliverInfo.name : "",
      project: deliverInfo?.project ? deliverInfo.project.id : "",
      rocYear: deliverInfo?.rocYear
        ? deliverInfo.rocYear
        : currentYear.slice(2, 5),
      type: deliverInfo?.constructionJob?.constructionType
        ? deliverInfo.constructionJob.constructionType
        : "",
      job: deliverInfo?.constructionJob?.id
        ? deliverInfo.constructionJob.id
        : "",
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
      // type: yup.string().required("需選擇工程類別!"),
      // job: yup
      //   .number()
      //   .required("需選擇工程項目!")
      //   .typeError("需選擇工程項目!"),
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
                {
                  timeZone: "Asia/Taipei",
                }
              );
              const formattedUntil = new Date(until).toLocaleDateString(
                "en-CA",
                {
                  timeZone: "Asia/Taipei",
                }
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
    // 使用 useForm Hook 來管理表單狀態和驗證
    const {
      control,
      handleSubmit,
      watch,
      formState: { errors, isDirty },
    } = methods;
    // 用來替until時間設置最小日期
    const sinceDay = watch("since");

    useEffect(() => {
      setIsDivDirty(isDirty);
    }, [isDirty]);

    // 提交表單資料到後端並執行相關操作
    const onSubmit = (data) => {
      if (isDirty) {
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
      } else {
        setActiveStep(1);
      }
    };

    return (
      <div className="w-full h-full relative">
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
                variant="contained"
                color="secondary"
                className="!text-base !h-10  w-1/3"
                onClick={() => {
                  onClose();
                }}
              >
                關閉不儲存
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="success"
                className="!text-base !h-10 w-1/3"
              >
                下一步
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
    );
  }
);

export default StepperDivOneForSummary;
