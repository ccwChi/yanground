import {
  Button,
  Card,
  CardContent,
  CircularProgress,
  Collapse,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormHelperText,
  IconButton,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Select,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import AlertDialog from "../../components/Alert/AlertDialog";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import React, { useCallback, useEffect, useState } from "react";
import { useTheme } from "@mui/material/styles";
import { getData } from "../../utils/api";
import { TransitionGroup } from "react-transition-group";
import Edit from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { Loading } from "../../components/Loader/Loading";
import { useForm, Controller, FormProvider } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { format } from "date-fns";
import InputTitle from "../../components/Guideline/InputTitle";
import ControlledDatePicker from "../../components/DatePicker/ControlledDatePicker";
import HelpQuestion from "../../components/HelpQuestion/HelpQuestion";

// step-2 的 div，編修工項執行，會用主面板拿到的summaryID重求API後設為deliveryInfo傳進來
const EditJobTaskDiv = React.memo(
  ({
    deliverInfo,
    sendDataToBackend,
    isDivDirty,
    setIsDivDirty,
    setCurrentDivIndex,
    currentDivIndex,
    onClose,
    setDeliverInfoFromList,
    isLoading,
    setIsLoading,
  }) => {
    // Alert 開關

    // const [isLoading, setIsLoading] = useState(true);
    // 會有 A.原已選擇task清單，B.原總task清單，然後過濾，最後呈現 C.過濾完task清單(顯示在下拉是選單)、D.已選擇task清單(呈現在下面跟右邊的面板)
    //A.原已選擇task清單，從api取得已選擇的工項執行task清單, 還沒過濾之前
    const [apiSelectedTask, setApiSelectedTask] = useState(null);
    //B 在useEffect取得後直接做處理因此沒有另外儲存
    //C.過濾完task清單
    const [constructionTaskList, setConstructionTaskList] = useState(null);
    //D.此施工清單已選擇的工項執行task清單，list呈現的部分
    const [selectedTasks, setSelectedTasks] = useState([]);
    //新增加的但減去D的部分
    const [selectedTask, setSelectedTask] = useState("");

    // 用來處理跳出dialog並編輯工項執行
    const [taskEditOpen, setTaskEditOpen] = useState(false);
    const [deliverTaskInfo, setDeliverTaskInfo] = useState(null);

    const summarySince = deliverInfo?.since
      ? new Date(deliverInfo.since)
      : null;
    const summaryUntil = deliverInfo?.until
      ? new Date(deliverInfo.until)
      : null;

    const theme = useTheme();
    const padScreen = useMediaQuery(theme.breakpoints.down("768"));

    useEffect(() => {
      if (!padScreen) {
        setCurrentDivIndex(0);
      }
    }, [padScreen]);

    // 先用id求得清單中有的工項執行
    useEffect(() => {
      setIsLoading(true);
      if (apiSelectedTask === null) {
        getApiSelectedTask(deliverInfo?.id);
      }
    }, [deliverInfo]);

    const getApiSelectedTask = (id) => {
      const seledtedTaskUrl = `constructionSummary/${id}/tasks`;
      getData(seledtedTaskUrl).then((result) => {
        setApiSelectedTask(result.result);
        // console.log("ApiSelectedTask,", result.result);
      });
    };

    //取得工程項目執行並設定已選擇及剩下能選擇的清單
    useEffect(() => {
      if (!!apiSelectedTask) {
        setIsLoading(true);
        const taskurl = `constructionJob/${deliverInfo.constructionJob.id}/task`;
        getData(taskurl).then((result) => {
          // setIsLoading(false);
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
          setTimeout(() => {
            setIsLoading(false);
          }, 100);
        });
      }
    }, [apiSelectedTask]);

    // 選擇新增移除御三家  //紀錄被選擇的工項執行id  -> selected 只有id
    const handleTaskChange = useCallback((event) => {
      const selected = event.target.value;
      setSelectedTask(selected);
    }, []);

    // 選擇新增移除御三家
    const handleAddTask = useCallback(() => {
      if (!isDivDirty) setIsDivDirty(true);
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
        if (!isDivDirty) setIsDivDirty(true);
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
        // getApiSelectedTask(deliverInfo.id);
      },
      [selectedTasks, constructionTaskList]
    );
    // 開啟edit dialog
    const handleEditTask = useCallback((task) => {
      setTaskEditOpen(true);
      setDeliverTaskInfo(task);
    }, []);

    // edit dialo傳回來的data統合
    const sendDataToTaskEdit = (data) => {
      if (!isDivDirty) setIsDivDirty(true);
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

    const onTaskEditClose = () => {
      setTaskEditOpen(false);
      setDeliverTaskInfo(null);
    };

    const onSubmit = async (activeStep) => {
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
      }
      sendDataToBackend(convertData, "task", [deliverInfo.id, activeStep]);
      setDeliverInfoFromList(deliverInfo.id);
    };

    // console.log(deliverInfo);
    return (
      <>
        {/* 除了按鈕以外的主內容顯示 */}
        <div className="h-full flex max-h-[432px] gap-x-3">
          {/* 左邊欄 */}
          <div
            className={`flex flex-col flex-1 gap-y-3 my-2 
            ${!currentDivIndex ? "flex" : "hidden"}`}
          >
            <div className="mt-2">
              <p className="font-extrabold text-lg text-center">
                {deliverInfo?.name ? deliverInfo.name : ""}
              </p>
              <p className=" text-sm text-center">
                {deliverInfo?.since
                  ? deliverInfo.since.split("-").join("/")
                  : "日期未選"}
                -{" "}
                {deliverInfo?.until
                  ? deliverInfo.until.split("-").join("/")
                  : "日期未選"}
              </p>
            </div>
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
            <List className="overflow-y-scroll border border-neutral-300 rounded h-full">
              {!isLoading ? (
                <TransitionGroup>
                  {selectedTasks.length > 0 ? (
                    selectedTasks.map((task) => (
                      <Collapse key={"selected" + task.constructionJobTask?.id}>
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
                    ))
                  ) : (
                    <Collapse>
                      <ListItem>
                        <ListItemText
                          sx={{ textAlign: "center" }}
                          secondary="尚無資料"
                        />
                      </ListItem>
                    </Collapse>
                  )}
                </TransitionGroup>
              ) : (
                <Loading size={18} />
              )}
            </List>
          </div>
          {/* 右邊欄 */}

          <div
            className={`${currentDivIndex ? "block" : "hidden"} 
              block flex-1 my-2 md:block md:w-full right-0 left-0 top-0 bottom-0 z-10 border-2 overflow-y-scroll rounded-md bg-slate-50 `}
          >
            {!!selectedTasks.length ? (
              selectedTasks.map((task, index) => (
                <Card
                  className="m-2 mb-0 shadow-sm !p-0 !pb-2 h-fit"
                  key={index + task.constructionJobTask.name}
                  onClick={() => {
                    handleEditTask(task);
                  }}
                >
                  <CardContent className="!p-2">
                    <Typography variant="h6" component="div" className="pl-3">
                      {task?.constructionJobTask.name
                        ? task?.constructionJobTask.name
                        : "尚無資料"}
                    </Typography>
                    <Typography variant="body2" className="pl-2">
                      <span className="m-1">
                        {task?.estimatedSince
                          ? task.estimatedSince
                          : "施工日期未選"}
                      </span>
                      <span>-</span>
                      <span className="m-1">
                        {task?.estimatedUntil
                          ? task.estimatedUntil
                          : "完工日期未選"}
                      </span>
                      <br />
                      <span className="m-1">
                        施工位置: {task?.location ? task.location : ""}
                      </span>
                      <br />
                      <span className="m-1 overflow-x-auto break-words">
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

        {/* 下方按鈕顯示 */}
        <div>
          <div className="h-fit flex justify-between gap-x-2">
            <Button
              variant="contained"
              color="success"
              disabled={!!currentDivIndex}
              className="!text-base !h-10 !mt-1 "
              fullWidth
              onClick={() => {
                onSubmit(0);
              }}
            >
              上一步
            </Button>
            <Button
              variant="contained"
              color="secondary"
              className="!text-base !h-10 !mt-1"
              fullWidth
              onClick={() => {
                padScreen ? setCurrentDivIndex(!currentDivIndex) : onClose();
              }}
            >
              {currentDivIndex ? "返回" : padScreen ? "預覽" : "關閉且不儲存"}
            </Button>
            <Button
              type="onSubmit"
              variant="contained"
              disabled={!!currentDivIndex}
              color="success"
              className={`!text-base !h-10 !mt-1`}
              fullWidth
              onClick={() => {
                onSubmit(2);
                // setActiveStep(2);
              }}
            >
              下一步
            </Button>
          </div>
          <div className="flex mt-2">
            <p className="!my-0 text-rose-400 font-bold text-xs !me-1">＊</p>
            <p className="!my-0 text-rose-400 font-bold text-xs">
              上一步及下一步皆會儲存本頁資料。
            </p>
          </div>
        </div>
        {/* <Backdrop
            sx={{ color: "#fff", zIndex: 1050 }}
            open={isLoading}
            onClick={onCheckDirty}
          >
            <LoadingThree size={40} />
          </Backdrop> */}
        <TaskEditDialog
          deliverTaskInfo={deliverTaskInfo}
          setIsLoading={setIsLoading}
          sendDataToTaskEdit={sendDataToTaskEdit}
          onClose={onTaskEditClose}
          isOpen={taskEditOpen}
          summarySince={summarySince}
          summaryUntil={summaryUntil}
        />
      </>
    );
  }
);

// step-2.5 用來新增編輯工項執行的日期、地點備註用的 dialog
const TaskEditDialog = React.memo(
  ({
    deliverTaskInfo,
    sendDataToTaskEdit,
    onClose,
    isOpen,
    setIsLoading,
    summarySince,
    summaryUntil,
  }) => {
    // Alert 開關
    // 檢查是否被汙染
    const [alertOpen, setAlertOpen] = useState(false);

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
      watch,
      formState: { errors, isDirty },
    } = methods;

    const estimatedSince = watch("estimatedSince");

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
      }
      setAlertOpen(false);
      // setAlertDateChangeOpen(false);
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

      sendDataToTaskEdit(convertData);
      onClose();
    };

    return (
      <>
        {deliverTaskInfo && (
          <Dialog open={isOpen} onClose={onCheckDirty}>
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
                    <div className="flex items-center">
                      <InputTitle title={"預計施工日期"} required={false} />
                      <HelpQuestion
                        content="在未選專案日期的情況下無法選擇工項日期"
                        className="mb-1.5 ms-2"
                      />
                      {/* <Quiz /> */}
                    </div>
                    {console.log(
                      "summarySince",
                      summarySince,
                      "summaryUntil",
                      summaryUntil
                    )}
                    <ControlledDatePicker
                      name="estimatedSince"
                      disabled={!summarySince || !summaryUntil}
                      minDate={summarySince}
                      maxDate={summaryUntil}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 mt-3">
                    <InputTitle title={"預計完工日期"} required={false} />
                    <ControlledDatePicker
                      name="estimatedUntil"
                      disabled={!summarySince || !summaryUntil}
                      minDate={!!estimatedSince ? estimatedSince : summarySince}
                      maxDate={summaryUntil}
                    />
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
      </>
    );
  }
);

export default EditJobTaskDiv;
