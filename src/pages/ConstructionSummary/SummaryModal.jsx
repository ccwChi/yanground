import React, { useEffect, useState, useCallback, useRef } from "react";
import ModalTemplete from "../../components/Modal/ModalTemplete";

import InputTitle from "../../components/Guideline/InputTitle";

import ControlledDatePicker from "../../components/DatePicker/ControlledDatePicker";
import { format } from "date-fns";
import AlertDialog from "../../components/Alert/AlertDialog";
import Loading from "../../components/Loader/Loading";
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
  Checkbox,
  Card,
  CardContent,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import Edit from "@mui/icons-material/Edit";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import { TransitionGroup } from "react-transition-group";
import { useForm, Controller, FormProvider } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { getData } from "../../utils/api";
import { useNotification } from "../../hooks/useNotification";

import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { TaskAltSharp } from "@mui/icons-material";

const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const constructionTypeList = [
  {
    label: "土木",
    name: "CIVIL_CONSTRUCTION",
    ordinal: 0,
  },
  {
    label: "機電",
    name: "MECHATRONICS_ENGINEERING",
    ordinal: 1,
  },
  {
    label: "測量",
    name: "CONSTRUCTION_SURVEYING",
    ordinal: 2,
  },
  {
    label: "鋼構(組裝)",
    name: "STEEL_FRAME_ASSEMBLING",
    ordinal: 3,
  },
  {
    label: "鋼構(製造)",
    name: "STEEL_FRAME_MANUFACTURE",
    ordinal: 4,
  },
];

const UpdatedModal = React.memo(
  ({ title, deliverInfo, sendDataToBackend, onClose }) => {
    // Alert 開關
    const [alertOpen, setAlertOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [constructionJobList, setConstructionJobList] = useState(null);

    const showNotification = useNotification();
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
      job: yup.number().required().typeError("需選擇工程類別及項目"),
    });

    // 處理表單驗證錯誤時的回調函數
    const onError = (errors) => {
      if (Object.keys(errors).length > 0) {
        for (const key in errors) {
          if (errors.hasOwnProperty(key)) {
            const errorMessage = errors[key]?.message;
          }
        }
      }
    };
    const methods = useForm({
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
        reset({
          name: deliverInfo?.name ? deliverInfo.name : "",
          rocYear: deliverInfo?.rocYear ? deliverInfo.rocYear : "",
          type: deliverInfo?.constructionJob?.constructionType
            ? deliverInfo.constructionJob.constructionType
            : "",
          job: deliverInfo?.constructionJob?.id
            ? deliverInfo.constructionJob.id
            : "",
          since: deliverInfo?.since ? new Date(deliverInfo.since) : null,
          until: deliverInfo?.until ? new Date(deliverInfo.until) : null,
        });
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
      delete convertData.t;
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
          onClose={onCheckDirty}
        >
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit, onError)}>
              <div className="flex flex-col pt-4 gap-4">
                <div>
                  <Controller
                    name="name"
                    control={control}
                    defaultValue={""}
                    render={({ field }) => (
                      <TextField
                        variant="outlined"
                        size="small"
                        className="inputPadding"
                        //label="清單標題"
                        label={
                          !!errors.name ? (
                            <span className=" text-red-700 m-0">
                              {errors?.name?.message}
                            </span>
                          ) : (
                            "專案(案場)"
                          )
                        }
                        placeholder="清單標題"
                        fullWidth
                        {...field}
                      />
                    )}
                  />
                </div>

                <div>
                  <Controller
                    name="rocYear"
                    control={control}
                    defaultValue={""}
                    render={({ field }) => (
                      <TextField
                        variant="outlined"
                        size="small"
                        className="inputPadding"
                        //   label="專案年度"
                        //   placeholder="ex: 112"
                        label={
                          !!errors.rocYear ? (
                            <span className=" text-red-700 m-0">
                              {errors?.rocYear?.message}
                            </span>
                          ) : (
                            "專案年度"
                          )
                        }
                        placeholder="專案年度"
                        fullWidth
                        {...field}
                      />
                    )}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <span>工程類別</span>
                  <Controller
                    name="type"
                    control={control}
                    defaultValue=""
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
                          readOnly={deliverInfo?.constructionSummaryJobTasks.length>0}
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
                            setValue("job", "");
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
                </div>
                <span>工程項目</span>
                <div className="flex flex-col gap-1.5">
                  <Controller
                    name="job"
                    control={control}
                    defaultValue=""
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
						  readOnly={deliverInfo?.constructionSummaryJobTasks.length>0}
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
                  <FormHelperText className="!text-red-600 h-3">
                    {errors.type && (
                      <p className="text-danger m-0">
                        {errors.type.message}
                        {/* {showNotification(`${errors.type.message}`, false)} */}
                      </p>
                    )}
                    {errors.job && (
                      <p className="text-danger m-0">
                        {errors.job.message}
                        {/* {showNotification(`${errors.job.message}`, false)} */}
                      </p>
                    )}
                  </FormHelperText>
                </div>

                <div className="flex flex-col gap-1.5">
                  <span>
                    開工日期
                    <span className=" text-sm text-gray-400"> </span>
                  </span>
                  <ControlledDatePicker name="since" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <span>
                    完工日期
                    <span className=" text-sm text-gray-400"> </span>
                  </span>
                  <ControlledDatePicker name="until" />
                </div>
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

const TaskModal = React.memo(
  ({ title, deliverInfo, sendDataToBackend, onClose }) => {
    // Alert 開關
    const [alertOpen, setAlertOpen] = useState(false);
    const [taskEditOpen, setTaskEditOpen] = useState(false);
    const [deliverTaskInfo, setDeliverTaskInfo] = useState(null);

    const [isLoading, setIsLoading] = useState(false);
    const [constructionTaskList, setConstructionTaskList] = useState(null);

    const [selectedTasks, setSelectedTasks] = useState([]);
    const [selectedTask, setSelectedTask] = useState("");

    const theme = useTheme();
    const phoneScreen = useMediaQuery(theme.breakpoints.down("576"));
    const padScreen = useMediaQuery(theme.breakpoints.down("768"));
    const [isCheckingList, setIsCheckingList] = useState(false);

    // 檢查是否被汙染
    const [isDirty, setIsDirty] = useState(false);

    const showNotification = useNotification();
    // 使用 Yup 來定義表單驗證規則
    //const schema = yup.object().shape({
    //   name: yup.string().required("清單標題不可為空值！"),
    //   rocYear: yup
    //     .number("應為數字")
    //     .required("不可為空值！")
    //     .test("len", "格式應為民國年", (val) =>
    //       /^[0-9]{3}$/.test(val.toString())
    //     )
    //     .typeError("應填寫民國年 ex: 112"),
    //   job: yup.number().required().typeError("需選擇工程類別及項目"),
    //});

    // 處理表單驗證錯誤時的回調函數
    const onError = (errors) => {
      if (Object.keys(errors).length > 0) {
        for (const key in errors) {
          if (errors.hasOwnProperty(key)) {
            const errorMessage = errors[key]?.message;
          }
        }
      }
    };

    // 使用 useForm Hook 來管理表單狀態和驗證
    const methods = useForm();
    const {
      control,
      handleSubmit,
      reset,
      formState: { errors },
    } = methods;

    //取得工程項目執行並設定已選擇及剩下能選擇的清單
    useEffect(() => {
      setIsLoading(true);
      if (deliverInfo.constructionJob.id) {
        const taskurl = `constructionJob/${deliverInfo.constructionJob.id}/task`;
        getData(taskurl).then((result) => {
          //這個result是用工程項目去找工項執行清單的結果
          setIsLoading(false);
          const data = result.result;
          const contains = [];
          for (const t of deliverInfo.constructionSummaryJobTasks) {
            const matchTask = data.find(
              (d) => d.id === t.constructionJobTask.id
            );
            if (matchTask) {
              contains.push(t);
            }
          }
          const notMatchingTasks = data.filter((d) => {
            return !deliverInfo.constructionSummaryJobTasks.some(
              (t) => t.constructionJobTask.id === d.id
            );
          });
          setSelectedTasks(contains);
          setConstructionTaskList(notMatchingTasks);
        });
      }
    }, [deliverInfo]);

    //將外面傳進來的資料deliverInfo代入到每個空格之中
    useEffect(() => {
      if (constructionTaskList && deliverInfo) {
        setIsLoading(true);
        reset({
          name: deliverInfo?.name ? deliverInfo.name : "",
          rocYear: deliverInfo?.rocYear ? deliverInfo.rocYear : "",
          type: deliverInfo?.constructionJob?.constructionType
            ? deliverInfo.constructionJob.constructionType
            : "",
          job: deliverInfo?.constructionJob?.id
            ? deliverInfo.constructionJob.id
            : "",
          since: deliverInfo?.since ? deliverInfo.since : "",
          until: deliverInfo?.until ? deliverInfo.until : "",
        });
        setIsLoading(false);
      }
    }, [constructionTaskList, reset]);

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

        setSelectedTasks(handleSeletedTask);
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
      const checkListIndex = selectedTasks.findIndex(
        (i) => i.constructionJobTask.id === data.constructionJobTask.id
      );
      if (checkListIndex !== -1) {
        const updatedSelectedTasks = [...selectedTasks];
        updatedSelectedTasks[checkListIndex] = data;
        setSelectedTasks(updatedSelectedTasks);
      }
    };

    // 提交表單資料到後端並執行相關操作
    const onSubmit = () => {
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
      sendDataToBackend(convertData, "task", deliverInfo.id);
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
          maxWidth={padScreen ? 428 : "660px"}
        >
          <div className="flex gap-3 relative">
            <div className="w-[360px] bg-bue-500">
              <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit, onError)}>
                  <div
                    className="flex flex-col pt-4 gap-4 !overflow-y-auto"
                    style={{ height: "70vh", scrollbarWidth: "thin" }}
                  >
                    <div>
                      <Controller
                        name="name"
                        control={control}
                        defaultValue={""}
                        render={({ field }) => (
                          <TextField
                            variant="outlined"
                            size="small"
                            className="inputPadding"
                            label="清單標題"
                            fullWidth
                            inputProps={{ readOnly: true }}
                            {...field}
                          />
                        )}
                      />
                    </div>

                    <div className="inline-flex gap-3">
                      <FormControl
                        size="small"
                        className="inputPadding"
                        fullWidth
                      >
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
                                      handleRemoveTask(
                                        task.constructionJobTask.id
                                      );
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
                          className="!text-base "
                          fullWidth
                          onClick={() => {
                            setIsCheckingList(!isCheckingList);
                          }}
                        >
                          {isCheckingList ? "返回" : "預覽清單"}
                        </Button>
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
                    ) : (
                      <Button
                        type="submit"
                        variant="contained"
                        color="success"
                        className="!text-base !h-12"
                        fullWidth
                      >
                        儲存
                      </Button>
                    )}
                  </div>
                </form>
              </FormProvider>
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

        <TaskEditDialog
          deliverTaskInfo={deliverTaskInfo}
          sendDataToTaskEdit={sendDataToTaskEdit}
          onClose={onTaskEditClose}
          isOpen={taskEditOpen}
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
  ({ deliverTaskInfo, sendDataToTaskEdit, onClose, isOpen, phoneScreen }) => {
    // Alert 開關
    // 檢查是否被汙染
    const [alertOpen, setAlertOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

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
    };

    const methods = useForm();
    const {
      control,
      handleSubmit,
      reset,
      setValue,
      formState: { errors, isDirty },
    } = methods;
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

    const onSubmit = (data) => {
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

      // 把convertData轉成=deliveryTaskInfo {id: '..896', constructionJobTask: {…}, estimatedSince: null, estimatedUntil: null, location: '', …}
      //console.log(convertData);
      sendDataToTaskEdit(convertData);
      onClose();
    };

    return (
      <>
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
                  <span>預計施工日期</span>
                  <ControlledDatePicker name="estimatedSince" />
                </div>
                <div className="flex flex-col gap-1.5 mt-3">
                  <span>預計完工日期</span>
                  <ControlledDatePicker name="estimatedUntil" />
                </div>
                <div className="flex flex-col gap-1.5 mt-3">
                  <span>施工位置</span>
                  <Controller
                    name="location"
                    control={control}
                    defaultValue={""}
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
                  <span>說明 / 備註</span>
                  <Controller
                    name="remark"
                    control={control}
                    defaultValue={""}
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

                <div className="d-flex inline-flex w-full gap-2 mt-4">
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
              </form>
            </FormProvider>
            {/* <DialogContentText></DialogContentText> */}
          </DialogContent>
        </Dialog>
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

export { UpdatedModal, TaskModal, TaskEditDialog };

// npm i @mui/x-date-pickers
// npm install --save date-fns
