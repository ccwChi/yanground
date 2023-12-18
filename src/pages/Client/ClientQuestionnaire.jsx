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
import { Form, useLoaderData } from "react-router-dom";

const clientquestionnaire = React.memo(() => {
  const defaultValues = {
    name: "",
  };
  // 處理表單驗證錯誤時的回調函數

  // 使用 Yup 來定義表單驗證規則
  const schema = yup.object().shape({
    name: yup.string().required("清單標題不可為空值！"),
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
    setValue,
    formState: { errors, isDirty },
  } = methods;
  // 用來替until時間設置最小日期
  const sinceDay = watch("since");

  // 提交表單資料到後端並執行相關操作
  const onSubmit = (data) => {
    console.log("data", data);
  };

  return (
    <div className="flex justify-center items-center overflow-y-auto ">
      <FormProvider {...methods}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="h-full flex flex-col w-[450px] max-w-[90vw] max-h-[95vh] rounded-md p-2 relative bg-slate-300 overflow-y-auto bg-opacity-70"
        >
          <div className="flex flex-col my-3 flex-1 h-[450px] ">
            <div
              className="flex flex-col px-1 pb-2"
              // style={{ maxHeight: "60vh" }}
            >
              {/* 所屬專案 */}
              <div className="">
                <div className="w-full">
                  <InputTitle title={"姓名、所屬單位、職稱、..."} />
                  <Controller
                    name="name"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        variant="outlined"
                        size="small"
                        className="inputPadding"
                        placeholder="姓名"
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
              </div>

              {/* 專案名稱 */}
              <div className="inline-flex sm:flex-row flex-col sm:gap-2 gap-0  sm:mb-0">
                <div className="w-full">
                  <InputTitle title={"同行欄A"} />
                  <Controller
                    name="name"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        variant="outlined"
                        size="small"
                        className="inputPadding"
                        placeholder="同行欄A"
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
                  <InputTitle title={"同行欄B"} />
                  <Controller
                    name="rocYear"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        variant="outlined"
                        size="small"
                        className="inputPadding"
                        placeholder="同行欄B"
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
              <div className="inline-flex sm:flex-row flex-col sm:gap-2 gap-0 sm:mb-0">
                {/* 工程類別 */}
                <div className="w-full">
                  <InputTitle title={"選擇問題"} />
                  <Controller
                    name="type"
                    control={control}
                    render={({ field: { value, onChange } }) => (
                      <FormControl
                        size="small"
                        className="inputPadding"
                        fullWidth
                      >
                        {value === "" ? (
                          <InputLabel
                            id="type-select-label"
                            disableAnimation
                            shrink={false}
                            focused={false}
                          >
                            請選擇***
                          </InputLabel>
                        ) : null}
                        <Select
                          readOnly={false}
                          labelId="type-select-label"
                          MenuProps={{
                            PaperProps: {
                              style: { maxHeight: "250px" },
                            },
                          }}
                          value={value}
                          onChange={(e) => {
                            onChange(e);
                            // setValue("job", ""); //選了別種類別就要把項目選擇欄位清空
                          }}
                        >
                          <MenuItem></MenuItem>
                        </Select>
                      </FormControl>
                    )}
                  />
                  <FormHelperText
                    className="!text-red-600 break-words !text-right !mt-0"
                    sx={{ minHeight: "1.25rem" }}
                  >
                    {errors["type"]?.message}
                  </FormHelperText>
                </div>
              </div>
              <div className="inline-flex sm:flex-row flex-col sm:gap-2 gap-0  sm:mb-0">
                <div className="w-full  mt-1">
                  <InputTitle title={"日期選擇器"} required={false} />
                  <ControlledDatePicker name="since" />
                </div>
              </div>
              <div
                id="indicators-carousel"
                className="relative w-full"
                data-carousel="static"
              >
                <div className="relative h-56 overflow-hidden rounded-lg md:h-96">
                  <div
                    className="hidden duration-700 ease-in-out"
                    data-carousel-item="active"
                  >
                    <img
                      src="/src/assets/images/undraw_cat_epte.svg"
                      className="absolute block w-full -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2"
                      alt="..."
                    />
                  </div>

                  <div
                    className="hidden duration-700 ease-in-out"
                    data-carousel-item
                  >
                    <img
                      src="/src/assets/images/undraw_dog_c7i6.svg"
                      className="absolute block w-full -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2"
                      alt="..."
                    />
                  </div>
                </div>

                <div className="absolute z-30 flex -translate-x-1/2 space-x-3 rtl:space-x-reverse bottom-5 left-1/2">
                  <button
                    type="button"
                    className="w-3 h-3 rounded-full"
                    aria-current="true"
                    aria-label="Slide 1"
                    data-carousel-slide-to="0"
                  ></button>
                  <button
                    type="button"
                    className="w-3 h-3 rounded-full"
                    aria-current="false"
                    aria-label="Slide 2"
                    data-carousel-slide-to="1"
                  ></button>
                  <button
                    type="button"
                    className="w-3 h-3 rounded-full"
                    aria-current="false"
                    aria-label="Slide 3"
                    data-carousel-slide-to="2"
                  ></button>
                  <button
                    type="button"
                    className="w-3 h-3 rounded-full"
                    aria-current="false"
                    aria-label="Slide 4"
                    data-carousel-slide-to="3"
                  ></button>
                  <button
                    type="button"
                    className="w-3 h-3 rounded-full"
                    aria-current="false"
                    aria-label="Slide 5"
                    data-carousel-slide-to="4"
                  ></button>
                </div>

                <button
                  type="button"
                  className="absolute top-0 start-0 z-30 flex items-center justify-center h-full px-4 cursor-pointer group focus:outline-none"
                  data-carousel-prev
                >
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/30 dark:bg-gray-800/30 group-hover:bg-white/50 dark:group-hover:bg-gray-800/60 group-focus:ring-4 group-focus:ring-white dark:group-focus:ring-gray-800/70 group-focus:outline-none">
                    <svg
                      className="w-4 h-4 text-white dark:text-gray-800 rtl:rotate-180"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 6 10"
                    >
                      <path
                        stroke="currentColor"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M5 1 1 5l4 4"
                      />
                    </svg>
                    <span className="sr-only">Previous</span>
                  </span>
                </button>
                <button
                  type="button"
                  className="absolute top-0 end-0 z-30 flex items-center justify-center h-full px-4 cursor-pointer group focus:outline-none"
                  data-carousel-next
                >
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/30 dark:bg-gray-800/30 group-hover:bg-white/50 dark:group-hover:bg-gray-800/60 group-focus:ring-4 group-focus:ring-white dark:group-focus:ring-gray-800/70 group-focus:outline-none">
                    <svg
                      className="w-4 h-4 text-white dark:text-gray-800 rtl:rotate-180"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 6 10"
                    >
                      <path
                        stroke="currentColor"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="m1 9 4-4-4-4"
                      />
                    </svg>
                    <span className="sr-only">Next</span>
                  </span>
                </button>
              </div>
            </div>
          </div>
          <div className="flex mt-2">
            <p className="!my-0 text-rose-400 font-bold text-xs !me-1">＊</p>
            <p className="!my-0 text-rose-400 font-bold text-xs">註解</p>
          </div>
          <div className="h-fit flex justify-between gap-x-2">
            <Button
              type="submit"
              variant="contained"
              color="success"
              className="!text-base !h-10"
              fullWidth
            >
              送出
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
});

export default clientquestionnaire;
