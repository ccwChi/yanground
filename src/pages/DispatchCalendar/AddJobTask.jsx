import React, { useEffect, useState, useCallback } from "react";
import ControlledDatePicker from "../../components/DatePicker/ControlledDatePicker";
import { format } from "date-fns";
import {
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  FormHelperText,
  Backdrop,
  CircularProgress,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

import {
  useForm,
  Controller,
  FormProvider,
  useFieldArray,
} from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { getData, postBodyData } from "../../utils/api";

import InputTitle from "../../components/Guideline/InputTitle";
import { useNotification } from "../../hooks/useNotification";
import { LoadingFour } from "../../components/Loader/Loading";
import constructionTypeList from "../../datas/constructionTypes";

const TaskModal = React.memo(
  ({
    deliverInfo,
    setReGetSummaryListData,
    setAddJobTask,
    jobTaskDirty,
    setJobTaskDirty,
  }) => {
    // Alert 開關

    const [isLoading, setIsLoading] = useState(false);

    // const [selectedTask, setSelectedTask] = useState("");
    // 用來儲存求得的 api Data
    const [jobList, setJobList] = useState([]);
    const [taskList, setTaskList] = useState([]);

    // 用來選擇執行前置，要先選類別跟項目
    const [selectedType, setSelectedType] = useState("");
    const [selectedJob, setSelectedJob] = useState("");
    const [selectedTask, setSelectedTask] = useState("");

    // 用來儲存已經存在於施工清單內的工項執行 ex [53, 83, 89, 139]
    const [taskIdInSummaryList, setTaskIdInSummaryList] = useState([]);

    // 已經存在=不能再選擇的taskList 下面陣列用來渲染右邊表格
    const [existedTaskList, setExistedTaskList] = useState([]);

    // 下列的清單是刪除已經有的/已經被選的，剩下能選的執行清單
    const [optionableTaskList, setOptionableTaskList] = useState([]);
    const [onlyNewSelected, setOnlyNewSelected] = useState([]);
    const [sendBackFlag, setSendBackFlag] = useState(false);

    const summarySince = deliverInfo?.since
      ? new Date(deliverInfo.since)
      : null;
    const summaryUntil = deliverInfo?.until
      ? new Date(deliverInfo.until)
      : null;
    const showNotification = useNotification();

    // const getApiSelectedTask = useCallback((id) => {
    //   const seledtedTaskUrl = `constructionSummary/${id}/tasks`;
    //   getData(seledtedTaskUrl).then((result) => {
    //     setApiSelectedTask(result.result);
    //   });
    // }, []);

    // useEffect(() => {
    //   if (deliverInfo === null) {
    //     setSelectedTasks([]);
    //     setOnlyNewSelected([]);
    //     setSelectedTask([]);
    //     setApiSelectedTask(null);
    //   }
    // }, [deliverInfo]);

    const schema = yup.object().shape({
      fields: yup.array().of(
        yup.object().shape({
          estimatedSince: yup.date().nullable(),
          estimatedUntil: yup
            .date()
            .nullable()
            .test({
              name: "custom-validation",
              message: "结束日期不能早於施工日期",
              test: function (estimatedUntil) {
                const estimatedSince = this.parent.estimatedSince;

                if (estimatedSince && estimatedUntil) {
                  const formattedEstimatedSince = new Date(
                    estimatedSince
                  ).toLocaleDateString("en-CA", { timeZone: "Asia/Taipei" });
                  const formattedEstimatedUntil = new Date(
                    estimatedUntil
                  ).toLocaleDateString("en-CA", { timeZone: "Asia/Taipei" });
                  return formattedEstimatedUntil >= formattedEstimatedSince;
                }

                return true;
              },
            }),
        })
      ),
    });

    const methods = useForm({
      resolver: yupResolver(schema),
    });
    // 使用 useForm Hook 來管理表單狀態和驗證
    const {
      control,
      handleSubmit,
      watch,
      formState: { errors },
    } = methods;
    const { remove } = useFieldArray({
      control,
      name: "fields",
    });
    const estimatedSinceDay = (index) => {
      return watch(`fields[${index}].estimatedSince`);
    };
    // 檢查表單是否汙染

    // 一但有了deliveryInfo資料，就求得那些工項已有 setTaskIdInSummaryList
    useEffect(() => {
      let TaskIsInSummary = [];
      deliverInfo.summaryJobTasks &&
        deliverInfo.summaryJobTasks.map((jt) => {
          return TaskIsInSummary.push(jt.constructionJobTask.id);
        });
      setTaskIdInSummaryList(TaskIsInSummary); //這個到時候用來過濾 只有id
      setExistedTaskList(deliverInfo?.summaryJobTasks);
    }, []);

    // 一旦選擇了工程類別，api 求工程項目的
    useEffect(() => {
      setIsLoading(true);
      if (!!selectedType) {
        const typeurl = `constructionType/${selectedType}/job`;
        getData(typeurl).then((result) => {
          setJobList(result.result);
          setIsLoading(false);
        });
      }
    }, [selectedType]);

    // 一旦選擇了工程類別，求工項執行 task 的 api
    useEffect(() => {
      getApiTaskList();
    }, [selectedJob]);

    const getApiTaskList = useCallback(() => {
      setIsLoading(true);
      if (!!selectedJob) {
        const typeurl = `constructionJob/${selectedJob}/task`;
        getData(typeurl).then((result) => {
          setTaskList(result.result);
          setIsLoading(false);
        });
      }
    }, [selectedJob]);

    useEffect(() => {
      if (taskList) {
        const filteredArray = taskList.filter((task) => {
          return !taskIdInSummaryList.includes(task.id);
        });
        setOptionableTaskList(filteredArray);
      }
    }, [taskList, taskIdInSummaryList]);

    // 新增
    const handleAddTask = () => {
      if (!jobTaskDirty) setJobTaskDirty(true);
      if (selectedTask) {
        const pickdata = optionableTaskList
          .filter((i) => i.id === selectedTask)
          .map((t) => {
            return {
              constructionJobTask: { id: t.id, name: t.name },
              id: "",
              remark: "",
              estimatedSince: "",
              estimatedUntil: "",
              location: "",
            };
          });
        const newTaskIdList = [...taskIdInSummaryList];
        newTaskIdList.push(selectedTask);
        setOnlyNewSelected([...onlyNewSelected, ...pickdata]); // 要顯示在新增加可編輯的部分，權資料
        setTaskIdInSummaryList(newTaskIdList); //要用來過濾的，已經存在的，僅id
        setExistedTaskList([...existedTaskList, ...pickdata]); // 已經在清單中+剛剛已增加的
        setSelectedTask(""); // 清除選擇欄
      }
    };

    // 移除
    const handleRemoveTask = (task, index) => {
      if (!jobTaskDirty) setJobTaskDirty(true);
      const newOnlyNewSelected = onlyNewSelected.filter(
        (i) => i.constructionJobTask.id !== task
      );
      setOnlyNewSelected(newOnlyNewSelected);
      const newTaskIdList = taskIdInSummaryList.filter((i) => i !== task);
      setTaskIdInSummaryList(newTaskIdList);
      remove(index);
    };

    const onSubmit = (data) => {
      setSendBackFlag(true);
      const convertData = [];
      for (var task of data.fields) {
        const tempTask = {
          constructionJobTask: task.constructionJobTask,
          estimatedSince: task.estimatedSince
            ? format(task.estimatedSince, "yyyy-MM-dd")
            : "",
          estimatedUntil: task.estimatedUntil
            ? format(task.estimatedUntil, "yyyy-MM-dd")
            : "",
          location: task?.location ? task.location : "",
          remark: task?.remark ? task.remark : "",
        };
        convertData.push(tempTask);
      }
      const url = `constructionSummary/${deliverInfo.id}/tasks`;
      postBodyData(url, convertData).then((result) => {
        if (result.status) {
          showNotification("資料上傳成功", true);
          setReGetSummaryListData(deliverInfo.date);
        } else {
          showNotification(
            result.result.reason
              ? result.result.reason
              : result.result
              ? result.result
              : "權限不足",
            false
          );
        }
        setSendBackFlag(false);
        setAddJobTask(null);
      });
    };
    return (
      <>
        <div className="w-full flex justify-center my-2">
          <span className="font-bold text-lg px-4 border-b-2">
            {deliverInfo.name} - 新增工項執行
          </span>{" "}
        </div>

        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="relative">
              <div className="inline-flex gap-x-3 w-full mb-3">
                {/* 選擇工程類別 Type */}
                <FormControl
                  size="small"
                  className="inputPadding relative"
                  fullWidth
                >
                  <Select
                    labelId="task-select-label"
                    value={selectedType}
                    onChange={(e) => {
                      setJobList([]);
                      setSelectedType(e.target.value);
                      setSelectedJob("");
                      setSelectedTask("");
                    }}
                    displayEmpty
                  >
                    <MenuItem value="" disabled>
                      <span className="text-neutral-400 font-light">
                        工程類別
                      </span>
                    </MenuItem>
                    {constructionTypeList?.map((type) => (
                      <MenuItem key={type.ordinal} value={type.name}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {false && (
                    <span className="absolute flex items-center right-10 top-0 bottom-0">
                      <CircularProgress color="primary" size={20} />
                    </span>
                  )}
                </FormControl>
                {/* 選擇工程項目 Job */}
                <FormControl
                  size="small"
                  className="inputPadding relative"
                  fullWidth
                >
                  <Select
                    disabled={!!selectedType && jobList.length === 0}
                    labelId="task-select-label"
                    value={selectedJob}
                    onChange={(e) => {
                      setOptionableTaskList([]);
                      setSelectedJob(e.target.value);
                      setSelectedTask("");
                    }}
                    displayEmpty
                    // MenuProps={MenuProps}
                  >
                    <MenuItem value="" disabled>
                      <span className="text-neutral-400 font-light">
                        工程項目
                      </span>
                    </MenuItem>
                    {jobList?.map((job) => (
                      <MenuItem key={job.id} value={job.id}>
                        {job.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {!!selectedType && jobList.length === 0 && (
                    <span className="absolute flex items-center right-8 top-0 bottom-0">
                      <CircularProgress color="primary" size={18} />
                    </span>
                  )}
                </FormControl>
              </div>
              {/* 選擇工項執行 Task */}
              <div className="inline-flex gap-x-3 w-full">
                <FormControl
                  size="small"
                  className="inputPadding relative"
                  fullWidth
                >
                  <Select
                    disabled={isLoading}
                    labelId="task-select-label"
                    value={selectedTask}
                    onChange={(e) => setSelectedTask(e.target.value)}
                    displayEmpty
                    //MenuProps={MenuProps}
                  >
                    <MenuItem value="" disabled>
                      <span className="text-neutral-400 font-light">
                        請選擇工項執行
                      </span>
                    </MenuItem>
                    {optionableTaskList?.map((task) => (
                      <MenuItem key={task.id} value={task.id}>
                        {task.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {!!selectedJob && optionableTaskList.length === 0 && isLoading && (
                    <span className="absolute flex items-center right-8 top-0 bottom-0">
                      <CircularProgress color="primary" size={18} />
                    </span>
                  )}
                </FormControl>
                <Button
                  variant="contained"
                  color="dark"
                  onClick={handleAddTask}
                  disabled={!selectedTask}
                  className="!text-base !h-12"
                >
                  新增
                </Button>
              </div>

              <div className="flex-1 my-2">
                {onlyNewSelected.map((task, index) => (
                  <div key={index} className="border p-2 mb-2 rounded-md">
                    <div className="flex justify-between">
                      {task.constructionJobTask?.name}
                      <DeleteIcon
                        color="secondary"
                        onClick={() => {
                          handleRemoveTask(task.constructionJobTask?.id, index);
                        }}
                      />
                    </div>
                    <div className="hidden">
                      {/* 這個直接用來儲存constructionJobTask作為送api的資料之一 */}
                      <Controller
                        name={`fields[${index}].constructionJobTask`}
                        defaultValue={task.constructionJobTask?.id}
                        control={control}
                        render={({ field }) => (
                          <TextField
                            variant="outlined"
                            size="small"
                            className="inputPadding"
                            fullWidth
                            {...field}
                          />
                        )}
                      />
                    </div>
                    <div className="mt-3">
                      <InputTitle
                        title={`預計施工日期 - 完工日期`}
                        required={false}
                      />
                      <div className="flex gap-3">
                        <ControlledDatePicker
                          name={`fields[${index}].estimatedSince`}
                          minDate={summarySince}
                          maxDate={summaryUntil}
                        />
                        <ControlledDatePicker
                          name={`fields[${index}].estimatedUntil`}
                          minDate={estimatedSinceDay(index)}
                          maxDate={summaryUntil}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col  mt-3">
                      <InputTitle title={"施工位置"} required={false} />

                      <Controller
                        name={`fields[${index}].location`}
                        defaultValue={""}
                        control={control}
                        render={({ field }) => (
                          <TextField
                            variant="outlined"
                            size="small"
                            className="inputPadding"
                            placeholder="請輸入施工位置"
                            fullWidth
                            {...field}
                          />
                        )}
                      />
                    </div>
                    <div className="flex flex-col mt-3">
                      <InputTitle title={"說明 /備註"} required={false} />
                      <Controller
                        name={`fields[${index}].remark`}
                        defaultValue={""}
                        control={control}
                        render={({ field }) => (
                          <TextField
                            variant="outlined"
                            size="small"
                            className="inputPadding"
                            placeholder="請輸入說明或備註"
                            fullWidth
                            {...field}
                          />
                        )}
                      />
                    </div>

                    <div className="flex-col inline-flex w-full ">
                      <FormHelperText
                        className="!text-red-600 break-words !text-right !mt-0"
                        sx={{ minHeight: "1.25rem" }}
                      >
                        <span>
                          {errors.fields?.[index]?.estimatedUntil?.message}
                        </span>
                      </FormHelperText>
                    </div>
                  </div>
                ))}
              </div>

              <div className="w-full sticky bg-white  bottom-0 py-2">
                <Button
                  type="submit"
                  variant="contained"
                  color="success"
                  className="!ease-in-out !duration-300 !w-full"
                >
                  儲存提交
                </Button>
              </div>
            </div>
          </form>
        </FormProvider>

        <Backdrop sx={{ color: "#fff", zIndex: 1400 }} open={sendBackFlag}>
          <LoadingFour />
        </Backdrop>
      </>
    );
  }
);

export { TaskModal };
