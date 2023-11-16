import React, { useEffect, useState, useCallback } from "react";
import ModalTemplete from "../../components/Modal/ModalTemplete";

import ControlledDatePicker from "../../components/DatePicker/ControlledDatePicker";
import { format } from "date-fns";
import AlertDialog from "../../components/Alert/AlertDialog";
import { Loading, LoadingThree } from "../../components/Loader/Loading";
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
  Collapse,
  Card,
  CardContent,
  Typography,
  Backdrop,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import Edit from "@mui/icons-material/Edit";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import { TransitionGroup } from "react-transition-group";
import { useForm, Controller, FormProvider } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { deleteData, getData } from "../../utils/api";
import { useNotification } from "../../hooks/useNotification";

import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import InputTitle from "../../components/Guideline/InputTitle";

const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);

const UpdatedModal = React.memo(
  ({
    title,
    deliverInfo,
    sendDataToBackend,
    onClose,
    constructionTypeList,
    projectsList,
  }) => {
    // Alert 開關
    const [alertOpen, setAlertOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [constructionJobList, setConstructionJobList] = useState(null);

    const defaultValues = {
      name: deliverInfo?.name ? deliverInfo.name : "",
      project: deliverInfo?.project ? deliverInfo.project.id : "",
      rocYear: deliverInfo?.rocYear ? deliverInfo.rocYear : "",
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
      type: yup.string().required("需選擇工程類別!"),
      job: yup
        .number()
        .required("需選擇工程項目!")
        .typeError("需選擇工程項目!"),
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
    // 使用 useForm Hook 來管理表單狀態和驗證
    const {
      control,
      handleSubmit,
      reset,
      setValue,
      formState: { errors, isDirty },
    } = methods;

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

    // Alert 回傳值進行最終結果 --- true: 關閉 modal / all: 關閉 Alert
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
    //constructionTypeList
    return (
      <>
        {/* Modal */}
        <ModalTemplete
          title={title}
          show={
            title === "新增施工清單"
              ? true
              : !!constructionJobList
              ? true
              : false
          }
          maxWidth={"640px"}
          onClose={onCheckDirty}
        >
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="flex flex-col pt-4 gap-4">
                <div
                  className="flex flex-col overflow-y-auto px-1 pb-2"
                  style={{ maxHeight: "60vh" }}
                >
                  {/* 所屬專案 */}
                  <div className="">
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
                              id="project-select-label"
                              disableAnimation
                              shrink={false}
                              focused={false}
                            >
                              請選擇所屬專案
                            </InputLabel>
                          ) : null}
                          <Select
                            labelId="project-select-label"
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

                  {/* 專案名稱 */}
                  <div className="inline-flex sm:flex-row flex-col sm:gap-2 gap-0 mb-5 sm:mb-0">
                    <div className="w-full">
                      <InputTitle title={"專案(案場)"} />
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

                  <div className="inline-flex sm:flex-row flex-col sm:gap-2 gap-0 mb-5 sm:mb-0">
                    {/* 工程類別 */}
                    <div className="w-full">
                      <InputTitle title={"工程類別"} />
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
                                請選擇工程類別
                              </InputLabel>
                            ) : null}
                            <Select
                              readOnly={
                                deliverInfo?.constructionSummaryJobTasks
                                  .length > 0
                              }
                              labelId="type-select-label"
                              MenuProps={{
                                PaperProps: {
                                  style: { maxHeight: "250px" },
                                },
                              }}
                              value={value}
                              onChange={(e) => {
                                onChange(e);
                                getConstructionTypeList(e.target.value);
                                setValue("job", ""); //選了別種類別就要把項目選擇欄位清空
                              }}
                            >
                              {constructionTypeList?.map((type) => (
                                <MenuItem
                                  key={"select" + type.ordinal}
                                  value={type.name}
                                >
                                  {type.label}
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
                        {errors["type"]?.message}
                      </FormHelperText>
                    </div>

                    {/* 工程項目 */}
                    <div className="w-full">
                      <InputTitle title={"工程項目"} />
                      <Controller
                        name="job"
                        control={control}
                        render={({ field: { value, onChange } }) => (
                          <FormControl
                            size="small"
                            className="inputPadding"
                            fullWidth
                          >
                            {value === "" ? (
                              <InputLabel
                                id="job-select-label"
                                disableAnimation
                                shrink={false}
                                focused={false}
                              >
                                請選擇工程項目
                              </InputLabel>
                            ) : null}

                            <Select
                              labelId="job-select-label"
                              readOnly={
                                deliverInfo?.constructionSummaryJobTasks
                                  .length > 0
                              }
                              MenuProps={{
                                PaperProps: {
                                  style: { maxHeight: "250px" },
                                },
                              }}
                              value={value}
                              onChange={onChange}
                            >
                              {!!constructionJobList &&
                                constructionJobList.map((type) => (
                                  <MenuItem
                                    key={"select" + type.id}
                                    value={type.id}
                                  >
                                    {type.name}
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
                        {errors["job"]?.message}
                      </FormHelperText>
                    </div>
                  </div>
                  <div className="inline-flex sm:flex-row flex-col sm:gap-2 gap-0 mb-5 sm:mb-0">
                    {/* 施工日期 */}
                    <div className="w-full">
                      <InputTitle title={"施工日期"} required={false} />
                      <ControlledDatePicker name="since" />
                    </div>

                    {/* 完工日期 */}
                    <div className="w-full">
                      <InputTitle title={"完工日期"} required={false} />
                      <ControlledDatePicker name="until" />
                      <FormHelperText
                        className="!text-red-600  break-words !text-right !mt-0"
                        sx={{ minHeight: "1.25rem" }}
                      >
                        <span>{errors.until?.message}</span>
                      </FormHelperText>
                    </div>
                  </div>
                </div>
              </div>
              <div>
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
          </FormProvider>
        </ModalTemplete>
        <Backdrop
          sx={{ color: "#fff", zIndex: 1050 }}
          open={!constructionJobList}
          onClick={onCheckDirty}
        >
          <LoadingThree size={40} />
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

// taskModal沒有使用react-form-hook
const TaskModal = React.memo(
  ({
    title,
    deliverInfo,
    sendDataToBackend,
    onClose,
    setNextModalOpen,
    nextModalOpen,
  }) => {
    // Alert 開關
    const [alertOpen, setAlertOpen] = useState(false);
    const [taskEditOpen, setTaskEditOpen] = useState(false);
    const [deliverTaskInfo, setDeliverTaskInfo] = useState(null);

    const [isLoading, setIsLoading] = useState(false);

    // 會有 A.原已選擇task清單，B.原總task清單，然後過濾，最後呈現 C.過濾完task清單(顯示在下拉是選單)、D.已選擇task清單(呈現在下面跟右邊的面板)
    //A.原已選擇task清單，從api取得已選擇的工項執行task清單, 還沒過濾之前
    const [apiSelectedTask, setApiSelectedTask] = useState(null);
    //B 在useEffect取得後直接做處理因此沒有另外儲存
    //C.過濾完task清單
    const [constructionTaskList, setConstructionTaskList] = useState(null);
    //D.此施工清單已選擇的工項執行task清單，list呈現的部分
    const [selectedTasks, setSelectedTasks] = useState([]);

    const [selectedTask, setSelectedTask] = useState("");

    const [clearDispatch, setClearDispatch] = useState([]);
    const theme = useTheme();
    const phoneScreen = useMediaQuery(theme.breakpoints.down("576"));
    const padScreen = useMediaQuery(theme.breakpoints.down("768"));
    const [isCheckingList, setIsCheckingList] = useState(false);

    // 檢查是否被汙染
    const [isDirty, setIsDirty] = useState(false);

    const getApiSelectedTask = useCallback((id) => {
      const seledtedTaskUrl = `constructionSummary/${id}/tasks`;
      getData(seledtedTaskUrl).then((result) => {
        setApiSelectedTask(result.result);
      });
    }, []);

    //取得工程項目執行並設定已選擇及剩下能選擇的清單
    useEffect(() => {
      setIsLoading(true);
      if (!!apiSelectedTask) {
        const taskurl = `constructionJob/${deliverInfo.constructionJob.id}/task`;
        getData(taskurl).then((result) => {
          //這個result是用工程項目去找工項執行清單的結果
          //console.log("取得總清單",result)
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
      if (!!deliverInfo.id) {
        getApiSelectedTask(deliverInfo.id);
      }
    }, [deliverInfo]);

    // 選擇新增移除御三家
    const handleTaskChange = useCallback((event) => {
      const selected = event.target.value;
      setSelectedTask(selected);
    }, []);

    // 選擇新增移除御三家
    const handleAddTask = useCallback(() => {
      if (!isDirty) setIsDirty(true);
      if (selectedTask) {
        const handleSeletedTask = [
          {
            constructionJobTask: constructionTaskList.find(
              (p) => p.id === selectedTask
            ),
            id: "",
          },
          ...selectedTasks,
        ];

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
    }, [selectedTask, constructionTaskList, selectedTasks]);

    // 選擇新增移除御三家
    const handleRemoveTask = useCallback(
      (task) => {
        if (!isDirty) setIsDirty(true);
        setConstructionTaskList(
          [
            selectedTasks.find((p) => p.constructionJobTask.id === task)
              .constructionJobTask,
            ...constructionTaskList,
          ].sort((a, b) => a.ordinal - b.ordinal)
        );
        setSelectedTasks(
          selectedTasks.filter((p) => p.constructionJobTask.id !== task)
        );
        getApiSelectedTask(deliverInfo.id);
      },
      [selectedTasks, constructionTaskList]
    );
    // 開啟edit dialog
    const handleEditTask = useCallback((task) => {
      setTaskEditOpen(true);
      setDeliverTaskInfo(task);
    }, []);
    // 關閉edit dialog
    const onTaskEditClose = () => {
      setTaskEditOpen(false);
      setDeliverTaskInfo(null);
    };

    // edit dialo傳回來的data統合
    const sendDataToTaskEdit = (data) => {
      if (!isDirty) setIsDirty(true);
      const checkListIndex = selectedTasks.findIndex(
        (i) => i.constructionJobTask.id === data.constructionJobTask.id
      );
      if (checkListIndex !== -1) {
        const updatedSelectedTasks = [...selectedTasks];
        updatedSelectedTasks[checkListIndex] = data;
        setSelectedTasks(
          updatedSelectedTasks.sort((a, b) => {
            // 先检查 estimatedSince 是否為空
            if (a.estimatedSince && !b.estimatedSince) {
              return -1;
            } else if (!a.estimatedSince && b.estimatedSince) {
              return 1;
            } else if (a.estimatedSince && b.estimatedSince) {
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
      }
    };

    // 提交表單資料到後端並執行相關操作
    const onSubmit = async (modalName) => {
      const convertData = [];
      for (var task of selectedTasks) {
        const tempTask = {
          id: task?.id ? task.id : "",
          constructionJobTask: task.constructionJobTask.id,
          estimatedSince: task.estimatedSince ? task.estimatedSince : "",
          estimatedUntil: task.estimatedUntil ? task.estimatedUntil : "",
          location: task?.location ? task.location : "",
          remark: task?.remark ? task.remark : "",
        };
        if (tempTask.id === "") {
          delete tempTask.id;
        }
        convertData.push(tempTask);
        //console.log(convertData)
      }
      try {
        if (clearDispatch.length > 0) {
          const matchingIds = clearDispatch
            .map((id) => {
              const matchingTask = deliverInfo.constructionSummaryJobTasks.find(
                (task) => task.id === id
              );
              if (matchingTask) {
                return matchingTask.constructionSummaryJobTaskDispatches.map(
                  (dispatch) => dispatch.id
                );
              }
              return [];
            })
            .flat();

          const deletePromises = matchingIds.map((deleteId) => {
            const deleteUrl = `constructionSummaryJobTaskDispatch/${deleteId}`;
            return deleteData(deleteUrl);
          });

          // 使用Promise.all等待所有delete操作完成
          const deleteResults = await Promise.all(deletePromises);

          // 处理delete操作结果
          deleteResults.forEach((result) => {
            if (result.status) {
              // 删除成功的处理逻辑
            } else if (result.result.response !== 200) {
              // 删除失败的处理逻辑
            }
          });
          setClearDispatch(null);
        }
      } catch (error) {
        // 处理错误
        console.error("Error:", error);
      }

      const otherData = {
        deliverInfoId: deliverInfo.id,
        nextModal: "dispatch",
      };

      // 等待delete操作完成后再执行sendDataToBackend
      sendDataToBackend(convertData, "task", otherData);
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

    return (
      <>
        {/* Modal */}
        <ModalTemplete
          title={title}
          show={constructionTaskList ? true : false}
          //show={true}
          onClose={onCheckDirty}
          maxWidth={padScreen ? "428px" : "660px"}
        >
          <div className="flex gap-3 relative">
            <div className="w-[360px] bg-bue-500">
              {/* <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit)}> */}
              <div
                className="flex flex-col pt-4 gap-4 !overflow-y-auto"
                style={{ height: "70vh", scrollbarWidth: "thin" }}
              >
                <div>
                  <TextField
                    variant="outlined"
                    size="small"
                    className="inputPadding"
                    label="清單標題"
                    value={deliverInfo?.name ? deliverInfo.name : ""}
                    fullWidth
                    inputProps={{ readOnly: true }}
                  />
                </div>
                <div className="inline-flex gap-3">
                  <FormControl size="small" className="inputPadding" fullWidth>
                    {selectedTask === "" ? (
                      <InputLabel
                        id="task-select-label"
                        disableAnimation
                        shrink={false}
                        focused={false}
                      >
                        請選擇工項執行
                      </InputLabel>
                    ) : null}
                    <Select
                      labelId="task-select-label"
                      value={selectedTask}
                      onChange={handleTaskChange}
                      //MenuProps={MenuProps}
                    >
                      {constructionTaskList?.map((task) => (
                        <MenuItem key={"select" + task.id} value={task.id}>
                          {task.name}
                        </MenuItem>
                      ))}
                    </Select>
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
                <List
                  className="overflow-y-auto border border-neutral-300 rounded"
                  sx={{ height: "100%" }}
                >
                  {!isLoading ? (
                    <TransitionGroup>
                      {selectedTasks.map((task) => (
                        <Collapse
                          key={"selected" + task.constructionJobTask?.id}
                        >
                          <ListItem>
                            <ListItemText
                              secondary={task.constructionJobTask?.name}
                            />
                            <IconButton
                              onClick={() => {
                                handleEditTask(task);
                              }}
                            >
                              <Edit />
                            </IconButton>
                            {task.id.length === 0 && (
                              <IconButton
                                onClick={() => {
                                  handleRemoveTask(task.constructionJobTask.id);
                                }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            )}
                          </ListItem>
                          <Divider variant="middle" />
                        </Collapse>
                      ))}
                    </TransitionGroup>
                  ) : (
                    <Loading size={18} />
                  )}
                </List>
                {padScreen ? (
                  <div className="flex gap-x-3">
                    <Button
                      variant="contained"
                      color="success"
                      className="!text-sm !h-10 !md:text-base"
                      fullWidth
                      onClick={() => {
                        setIsCheckingList(!isCheckingList);
                      }}
                    >
                      {isCheckingList ? "返回" : "預覽清單"}
                    </Button>
                    <Button
                      onClick={onSubmit}
                      variant="contained"
                      color="success"
                      className="!text-sm !h-10 !md:text-base"
                      fullWidth
                    >
                      儲存
                    </Button>
                    <Button
                      onClick={() => {
                        // console.log("setNextModalOpendispatch");
                        // setNextModalOpen("dispatch");
                        onSubmit("dispatch");
                      }}
                      variant="contained"
                      color="success"
                      className="!text-sm !h-10 !md:text-base"
                      fullWidth
                    >
                      儲存並派工
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-x-1">
                    <Button
                      onClick={onSubmit}
                      variant="contained"
                      color="success"
                      className="!text-base !h-12"
                      fullWidth
                    >
                      儲存
                    </Button>
                    <Button
                      onClick={() => {
                        // console.log("setNextModalOpendispatch");
                        // setNextModalOpen("dispatch");
                        onSubmit("dispatch");
                      }}
                      variant="contained"
                      color="success"
                      className="!text-base !h-12"
                      fullWidth
                    >
                      儲存並派工
                    </Button>
                  </div>
                )}
              </div>
              {/* </form>
              </FormProvider> */}
            </div>
            <div
              className={`${
                isCheckingList ? "absolute" : "hidden"
              }  md:block md:w-[300px] md:static md:h-[69vh] h-[calc(68vh-46px)] right-0 left-0 top-0 bottom-0 z-10 border-2 overflow-y-scroll rounded-md bg-slate-50 mt-3`}
            >
              {/* <div>工單預覽</div> */}
              {/* <div className="">清單預覽</div> */}
              {!!selectedTasks.length ? (
                selectedTasks.map((task, index) => (
                  <Card
                    className="m-2 shadow-sm !p-0"
                    key={index + task.constructionJobTask.name}
                  >
                    <CardContent className="!p-2">
                      <Typography variant="h6" component="div" className="pl-3">
                        {task?.constructionJobTask.name
                          ? task?.constructionJobTask.name
                          : "尚無資料"}
                      </Typography>
                      <Typography variant="body2" className="pl-3">
                        <span className="m-1">
                          預計施工日期:{" "}
                          {task?.estimatedSince ? task.estimatedSince : ""}
                        </span>
                        <br />
                        <span className="m-1">
                          預計完工日期:{" "}
                          {task?.estimatedUntil ? task.estimatedUntil : ""}
                        </span>
                        <br />
                        <span className="m-1">
                          施工位置: {task?.location ? task.location : ""}
                        </span>
                        <br />
                        <span className="m-1 overflow-x-auto">
                          說明: {task?.remark ? task.remark : ""}
                        </span>
                      </Typography>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="m-2 shadow-sm !p-0">
                  <CardContent className="!p-2">
                    <Typography variant="h6" component="div" className="pl-3">
                      尚無資料
                    </Typography>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </ModalTemplete>
        <Backdrop
          sx={{ color: "#fff", zIndex: 1050 }}
          open={!constructionTaskList}
          onClick={onCheckDirty}
        >
          <LoadingThree size={40} />
        </Backdrop>
        <TaskEditDialog
          deliverTaskInfo={deliverTaskInfo}
          sendDataToTaskEdit={sendDataToTaskEdit}
          onClose={onTaskEditClose}
          isOpen={taskEditOpen}
          clearDispatch={clearDispatch}
          setClearDispatch={setClearDispatch}
          phoneScreen={phoneScreen}
          aria-labelledby="responsive-dialog-title"
        />
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

const TaskEditDialog = React.memo(
  ({
    deliverTaskInfo,
    sendDataToTaskEdit,
    onClose,
    isOpen,
    phoneScreen,
    clearDispatch,
    setClearDispatch,
  }) => {
    // Alert 開關
    // 檢查是否被汙染
    const [alertOpen, setAlertOpen] = useState(false);
    const [alertDateChangeOpen, setAlertDateChangeOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const schema = yup.object().shape({
      estimatedSince: yup.date().nullable(),
      estimatedUntil: yup
        .date()
        .nullable()
        .test({
          name: "custom-validation",
          message: "结束日期不能早於施工日期",
          test: function (estimatedUntil) {
            const estimatedSince = this.parent.estimatedSince;

            // 只有在 estimatedSince 和 estimatedUntil 都有值時才驗證
            // 下面的用意是如果從後端拿到日期為了載入日期選擇器，會轉成00:08:00 GMT+0800的時區，但如果本地端選擇的話會是00:00:00 GMT+0800，
            // 會導致選同一天卻顯示結束比開始早而報錯。
            if (estimatedSince && estimatedUntil) {
              const formattedEstimatedSince = new Date(
                estimatedSince
              ).toLocaleDateString("en-CA", { timeZone: "Asia/Taipei" });
              const formattedEstimatedUntil = new Date(
                estimatedUntil
              ).toLocaleDateString("en-CA", { timeZone: "Asia/Taipei" });
              return formattedEstimatedUntil >= formattedEstimatedSince;
            }
            return true; // 如果其中一個為空，則不驗證
          },
        }),
    });

    const methods = useForm({
      // defaultValues,
      resolver: yupResolver(schema),
    });
    // 使用 useForm Hook 來管理表單狀態和驗證
    const {
      control,
      handleSubmit,
      reset,
      formState: { errors, isDirty },
    } = methods;

    // 檢查表單是否汙染
    const onCheckDirty = () => {
      if (isDirty) {
        setAlertOpen(true);
      } else {
        onClose();
      }
    };
    // // Alert 回傳值進行最終結果 --- true: 關閉 modal / all: 關閉 Alert
    const handleAlertClose = (agree) => {
      if (agree) {
        onClose();
        if (!clearDispatch || !clearDispatch?.includes(deliverTaskInfo.id)) {
          setClearDispatch([...clearDispatch, deliverTaskInfo.id]);
          //console.log([...clearDispatch, deliverTaskInfo.id]);
        }
      }
      setAlertOpen(false);
      setAlertDateChangeOpen(false);
    };

    // deliverTaskInfo 傳進來的 {id: '7056078833492952896', constructionJobTask: {…}, estimatedSince: null, estimatedUntil: null, location: '', …}
    // 格式 {id: '', constructionJobTask:1 , estimatedSince: '', estimatedUntil: '', location: '', remarK:''}

    //將外面傳進來的資料deliverInfo代入到每個空格之中 OK
    useEffect(() => {
      if (!!deliverTaskInfo) {
        setIsLoading(true);
        reset({
          id: deliverTaskInfo?.id ? deliverTaskInfo?.id : "",
          constructionJobTask: deliverTaskInfo.constructionJobTask.id,
          estimatedSince: deliverTaskInfo?.estimatedSince
            ? new Date(deliverTaskInfo.estimatedSince)
            : null,
          estimatedUntil: deliverTaskInfo?.estimatedUntil
            ? new Date(deliverTaskInfo.estimatedUntil)
            : null,
          location: deliverTaskInfo?.location ? deliverTaskInfo.location : "",
          remark: deliverTaskInfo?.remark ? deliverTaskInfo.remark : "",
        });
        setIsLoading(false);
      }
    }, [deliverTaskInfo, reset]);

    // useEffect(()=>{

    // },[data.estimatedSince])

    const onSubmit = (data) => {
      //console.log("要送出的", data);
      const convertData = {
        id: deliverTaskInfo?.id ? deliverTaskInfo?.id : "",
        constructionJobTask: {
          id: deliverTaskInfo.constructionJobTask.id,
          name: deliverTaskInfo.constructionJobTask.name,
        },
        estimatedSince: data?.estimatedSince
          ? format(data.estimatedSince, "yyyy-MM-dd")
          : "",
        estimatedUntil: data?.estimatedUntil
          ? format(data.estimatedUntil, "yyyy-MM-dd")
          : "",
        location: data?.location ? data.location : "",
        remark: data?.remark ? data.remark : "",
      };

      if (!deliverTaskInfo.constructionSummaryJobTaskDispatches?.length) {
        sendDataToTaskEdit(convertData);
        onClose();
      } else {
        if (
          convertData.estimatedSince === deliverTaskInfo.estimatedSince &&
          convertData.estimatedUntil === deliverTaskInfo.estimatedUntil
        ) {
          sendDataToTaskEdit(convertData);
          onClose();
        } else {
          setAlertDateChangeOpen(true);
        }
      }

      // 把convertData轉成=deliveryTaskInfo {id: '..896', constructionJobTask: {…}, estimatedSince: null, estimatedUntil: null, location: '', …}
      //console.log(convertData);
      sendDataToTaskEdit(convertData);
    };

    return (
      <>
        {deliverTaskInfo && (
          <Dialog
            fullScreen={phoneScreen}
            open={isOpen}
            onClose={onCheckDirty}
            className=""
          >
            <DialogTitle id="responsive-dialog-title" className="mt-5 ">
              <span className=" border-b-2 p-2">
                {deliverTaskInfo?.constructionJobTask?.name}{" "}
                <span className="text-sm mx-2">編輯</span>
              </span>
            </DialogTitle>
            <DialogContent>
              <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="flex flex-col gap-1.5 mt-3">
                    <InputTitle title={"預計施工日期"} required={false} />
                    <ControlledDatePicker name="estimatedSince" />
                  </div>
                  <div className="flex flex-col gap-1.5 mt-3">
                    <InputTitle title={"預計完工日期"} required={false} />
                    <ControlledDatePicker name="estimatedUntil" />
                  </div>
                  <div className="flex flex-col gap-1.5 mt-3">
                    <InputTitle title={"施工位置"} required={false} />

                    <Controller
                      name="location"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          variant="outlined"
                          size="small"
                          className="inputPadding"
                          placeholder="請輸入施工位置"
                          //   inputProps={{ readOnly: true }}
                          fullWidth
                          {...field}
                        />
                      )}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 mt-3">
                    <InputTitle title={"說明 /備註"} required={false} />
                    <Controller
                      name="remark"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          variant="outlined"
                          size="small"
                          className="inputPadding"
                          placeholder="請輸入說明或備註"
                          //   inputProps={{ readOnly: true }}
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
                      <span>{errors.estimatedUntil?.message}</span>
                    </FormHelperText>
                    <div className="flex gap-2">
                      <Button
                        variant="contained"
                        color="success"
                        className="!text-base !h-12 "
                        fullWidth
                        onClick={() => {
                          onCheckDirty();
                        }}
                      >
                        返回
                      </Button>
                      <Button
                        type="submit"
                        variant="contained"
                        color="success"
                        className="!text-base !h-12 "
                        fullWidth
                      >
                        儲存
                      </Button>
                    </div>
                  </div>
                </form>
              </FormProvider>
              {/* <DialogContentText></DialogContentText> */}
            </DialogContent>
          </Dialog>
        )}
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
        <AlertDialog
          open={alertDateChangeOpen}
          onClose={handleAlertClose}
          icon={<ReportProblemIcon color="secondary" />}
          title="注意"
          content={
            <span>
              該項目已在特定日期派工，
              <br />
              <span>
                更改日期將會刪除該項目內容所有已派工人員
                <br />
              </span>
              {deliverTaskInfo?.constructionSummaryJobTaskDispatches?.length >
                0 &&
                deliverTaskInfo.constructionSummaryJobTaskDispatches
                  ?.sort((a, b) => new Date(a.date) - new Date(b.date))
                  .map((dispatch, index) => (
                    <span key={index}>
                      {dispatch.date} {dispatch.labourer.nickname}
                      <br />
                    </span>
                  ))}
              確定將再工項執行編輯畫面儲存後刪除
            </span>
          }
          disagreeText="取消"
          agreeText="確定"
        />
      </>
    );
  }
);

// const TaskDispatchModal = React.memo() =>{

// }

export { UpdatedModal, TaskModal, TaskEditDialog };

// npm i @mui/x-date-pickers
// npm install --save date-fns
