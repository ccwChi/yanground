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

    // 會有 A.原已選擇task清單，B.原總task清單，然後過濾，最後呈現 C.過濾完task清單(顯示在下拉是選單)、D.已選擇task清單(呈現在下面跟右邊的面板)
    //A.原已選擇task清單，從api取得已選擇的工項執行task清單, 還沒過濾之前
    const [apiSelectedTask, setApiSelectedTask] = useState(null);
    //B 在useEffect取得後直接做處理因此沒有另外儲存
    //C.過濾完task清單
    const [constructionTaskList, setConstructionTaskList] = useState(null);
    //D.此施工清單已選擇的工項執行task清單，list呈現的部分
    const [selectedTasks, setSelectedTasks] = useState([]);
    //新增加的但減去D的部分
    const [onlyNewSelected, setOnlyNewSelected] = useState([]);

    const [selectedTask, setSelectedTask] = useState("");

    const [sendBackFlag, setSendBackFlag] = useState(false);

    const summarySince = new Date(deliverInfo?.since);
    const summaryUntil = new Date(deliverInfo?.until);

    const showNotification = useNotification();

    const getApiSelectedTask = useCallback((id) => {
      const seledtedTaskUrl = `constructionSummary/${id}/tasks`;
      getData(seledtedTaskUrl).then((result) => {
        setApiSelectedTask(result.result);
      });
    }, []);

    useEffect(() => {
      if (deliverInfo === null) {
        setSelectedTasks([]);
        setOnlyNewSelected([]);
        setSelectedTask([]);
        setApiSelectedTask(null);
      }
    }, [deliverInfo]);

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
      formState: { errors },
    } = methods;
    const { remove } = useFieldArray({
      control,
      name: "fields",
    });
    // 檢查表單是否汙染

    //取得工程項目執行並設定已選擇及剩下能選擇的清單
    useEffect(() => {
      setIsLoading(true);
      if (!!apiSelectedTask) {
        const taskurl = `constructionJob/${deliverInfo.constructionJob.id}/task`;
        getData(taskurl).then((result) => {
          setIsLoading(false);
          const data = result.result;
          const contains = [];

          for (const t of apiSelectedTask) {
            const matchTask = data.find(
              (d) => d.id === t.constructionJobTask.id
            );
            if (matchTask) {
              contains.push(t);
            }
          }
          const notMatchingTasks = data.filter((d) => {
            return !apiSelectedTask.some(
              (t) => t.constructionJobTask.id === d.id
            );
          });
          setSelectedTasks(contains);
          setConstructionTaskList(notMatchingTasks);
        });
      }
    }, [apiSelectedTask]);

    useEffect(() => {
      if (!!deliverInfo.id && apiSelectedTask === null) {
        getApiSelectedTask(deliverInfo.id);
      }
    }, [deliverInfo]);

    // 選擇新增移除御三家  //紀錄被選擇的工項執行id  -> selected 只有id
    const handleTaskChange = useCallback((event) => {
      const selected = event.target.value;
      setSelectedTask(selected);
    }, []);

    // 選擇新增移除御三家
    const handleAddTask = useCallback(() => {
      if (!jobTaskDirty) setJobTaskDirty(true);
      // 當選擇並記錄id,
      if (selectedTask) {
        const newAddSeletedTask = [
          ...onlyNewSelected,
          {
            constructionJobTask: constructionTaskList.find(
              (p) => p.id === selectedTask
            ),
            id: "",
          },
        ];
        const handleSeletedTask = [
          {
            constructionJobTask: constructionTaskList.find(
              (p) => p.id === selectedTask
            ),
            id: "",
          },
          ...selectedTasks,
        ];

        setOnlyNewSelected(
          newAddSeletedTask.sort((a, b) => {
            // 先檢查 estimatedSince 是否为非空字符串
            if (a.estimatedSince && !b.estimatedSince) {
              return -1; // a 在前
            } else if (!a.estimatedSince && b.estimatedSince) {
              return 1; // b 在前
            } else if (a.estimatedSince && b.estimatedSince) {
              // estimatedSince 都非空，按日期排序
              if (a.estimatedSince < b.estimatedSince) {
                return -1;
              } else if (a.estimatedSince > b.estimatedSince) {
                return 1;
              }
            }
            if (a.estimatedUntil < b.estimatedUntil) {
              return -1;
            } else if (a.estimatedUntil > b.estimatedUntil) {
              return 1;
            }

            return 0; // a 和 b 相等
          })
        );
        setSelectedTasks(
          handleSeletedTask.sort((a, b) => {
            // 先檢查 estimatedSince 是否为非空字符串
            if (a.estimatedSince && !b.estimatedSince) {
              return -1; // a 在前
            } else if (!a.estimatedSince && b.estimatedSince) {
              return 1; // b 在前
            } else if (a.estimatedSince && b.estimatedSince) {
              // estimatedSince 都非空，按日期排序
              if (a.estimatedSince < b.estimatedSince) {
                return -1;
              } else if (a.estimatedSince > b.estimatedSince) {
                return 1;
              }
            }
            if (a.estimatedUntil < b.estimatedUntil) {
              return -1;
            } else if (a.estimatedUntil > b.estimatedUntil) {
              return 1;
            }
            return 0; // a 和 b 相等
          })
        );

        setConstructionTaskList(
          constructionTaskList
            .filter((p) => p.id !== selectedTask)
            .sort((a, b) => a.ordinal - b.ordinal)
        );
        setSelectedTask("");
      }
    }, [selectedTask, constructionTaskList, selectedTasks, onlyNewSelected]);

    // 選擇新增移除御三家
    const handleRemoveTask = useCallback(
      (taskId, index) => {
        if (!jobTaskDirty) setJobTaskDirty(true);
        const selectedTask = selectedTasks.find(
          (task) => task.constructionJobTask.id === taskId
        );
        if (selectedTask) {
          const updatedConstructionTaskList = [
            ...constructionTaskList,
            selectedTask.constructionJobTask,
          ];
          setConstructionTaskList(updatedConstructionTaskList);
        }
        const forSelectedTasks = selectedTasks.filter(
          (p) => p.constructionJobTask.id !== taskId
        );
        setSelectedTasks(forSelectedTasks);
        const forOnlyNewSelected = onlyNewSelected.filter(
          (p) => p.constructionJobTask.id !== taskId
        );
        setOnlyNewSelected(forOnlyNewSelected);
        remove(index);
      },
      [selectedTasks, constructionTaskList, onlyNewSelected]
    );

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
              <div className="inline-flex gap-3  w-full ">
                <FormControl
                  size="small"
                  className="inputPadding relative"
                  fullWidth
                >
                  <Select
                    disabled={isLoading}
                    labelId="task-select-label"
                    value={selectedTask}
                    onChange={handleTaskChange}
                    displayEmpty
                    //MenuProps={MenuProps}
                  >
                    <MenuItem value="" disabled>
                      <span className="text-neutral-400 font-light">
                        請選擇工項執行
                      </span>
                    </MenuItem>
                    {constructionTaskList?.map((task) => (
                      <MenuItem key={"select" + task.id} value={task.id}>
                        {task.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {isLoading && (
                    <span className="absolute flex items-center right-10 top-0 bottom-0">
                      <CircularProgress color="primary" size={20} />
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
                          minDate={summarySince}
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
