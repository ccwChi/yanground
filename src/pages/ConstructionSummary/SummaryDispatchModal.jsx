import React, { useEffect, useState, useCallback } from "react";
import ModalTemplete from "../../components/Modal/ModalTemplete";

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
  Card,
  CardContent,
  Typography,
  Backdrop,
  CardActions,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import Edit from "@mui/icons-material/Edit";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import { TransitionGroup } from "react-transition-group";
import { useForm, Controller, FormProvider } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { getData } from "../../utils/api";
import { useNotification } from "../../hooks/useNotification";

import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import InputTitle from "../../components/Guideline/InputTitle";

const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);

const DispatchModal = React.memo(
  ({ title, deliverInfo, sendDataToBackend, onClose }) => {
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
        //console.log(convertData)
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
          maxWidth={padScreen ? "428px" : "660px"}
        >
          {/* {console.log(deliverInfo)} */}
          <div className="flex relative">
            <div
              className={`static md:block md:w-[300px] md:h-[69vh] h-[calc(68vh-46px)]  overflow-y-scroll scro rounded-md mt-3`}
            >
              {/* <div>工單預覽</div> */}
              {/* <div className="">清單預覽</div> */}
              {!!selectedTasks.length ? (
                selectedTasks.map((task, index) => (
                  <Card
                    className="m-2 shadow-sm !p-0 relative"
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

                     <button className="bg-gray-200 absolute right-2 bottom-2 rounded-full h-[30px] w-[30px]">+</button>

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
        {/* <Backdrop
            sx={{ color: "#fff", zIndex: 1050 }}
            open={!constructionTaskList}
            onClick={onCheckDirty}
          >
            <Loading size={40} />
          </Backdrop> */}

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
export { DispatchModal };
