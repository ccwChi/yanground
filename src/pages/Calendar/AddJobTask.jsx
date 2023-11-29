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

const TaskModal = React.memo(
  ({
    title,
    deliverInfo,
    sendDataToBackend,
    onClose,
    //   apiSelectedTask,
    setNextModalOpen,
    nextModalOpen,
  }) => {
    // Alert 開關
    const [alertOpen, setAlertOpen] = useState(false);

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

    useEffect(() => {
      if (deliverInfo === null) {
        setSelectedTasks([]);
        setOnlyNewSelected([]);
        setSelectedTask([]);
        setApiSelectedTask(null);
      }
    }, [deliverInfo]);

    const schema = yup.object().shape({
      //   estimatedSince: yup.date().nullable(),
      //   estimatedUntil: yup
      //     .date()
      //     .nullable()
      //     .test({
      //       name: "custom-validation",
      //       message: "结束日期不能早於施工日期",
      //       test: function (estimatedUntil) {
      //         const estimatedSince = this.parent.estimatedSince;
      //         // 只有在 estimatedSince 和 estimatedUntil 都有值時才驗證
      //         // 下面的用意是如果從後端拿到日期為了載入日期選擇器，會轉成00:08:00 GMT+0800的時區，但如果本地端選擇的話會是00:00:00 GMT+0800，
      //         // 會導致選同一天卻顯示結束比開始早而報錯。
      //         if (estimatedSince && estimatedUntil) {
      //           const formattedEstimatedSince = new Date(
      //             estimatedSince
      //           ).toLocaleDateString("en-CA", { timeZone: "Asia/Taipei" });
      //           const formattedEstimatedUntil = new Date(
      //             estimatedUntil
      //           ).toLocaleDateString("en-CA", { timeZone: "Asia/Taipei" });
      //           return formattedEstimatedUntil >= formattedEstimatedSince;
      //         }
      //         return true; // 如果其中一個為空，則不驗證
      //       },
      //     }),
    });

    const defaultValues = {
      // estimatedSince: jobTask?.estimatedSince
      //   ? new Date(jobTask.estimatedSince)
      //   : null,
      // estimatedUntil: jobTask?.estimatedUntil
      //   ? new Date(jobTask.estimatedUntil)
      //   : null,
      // location: jobTask?.location ? jobTask.location : "",
      // remark: jobTask?.remark ? jobTask.remark : "",
    };

    const methods = useForm({
      defaultValues,
      resolver: yupResolver(schema),
    });
    // 使用 useForm Hook 來管理表單狀態和驗證
    const {
      control,
      handleSubmit,
      reset,
      formState: { errors },
    } = methods;

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
          //   console.log("contains=selectedTask",contains)
          //   console.log("notMatchingTasks=ConstructionTaskList=options",notMatchingTasks)
          setSelectedTasks(contains);
          setConstructionTaskList(notMatchingTasks);
        });
      }
      //   console.log("apiSelectedTask", apiSelectedTask);
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
      if (!isDirty) setIsDirty(true);
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
        // console.log("handleSeletedTask",handleSeletedTask)
        // console.log("newAddSeletedTask", newAddSeletedTask);
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
        // console.log("selectedTasks", handleSeletedTask);
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
      (taskId) => {
        if (!isDirty) setIsDirty(true);
        // console.log("selectedTasks", selectedTasks);
        // console.log("constructionTaskList", constructionTaskList);
        const selectedTask = selectedTasks.find(
          (task) => task.constructionJobTask.id === taskId
        );

        const updatedConstructionTaskList = [
          ...constructionTaskList,
          selectedTask.constructionJobTask,
        ];
        setConstructionTaskList(updatedConstructionTaskList);
        // console.log("forConstructionTaskList", updatedConstructionTaskList);

        const forSelectedTasks = selectedTasks.filter(
          (p) => p.constructionJobTask.id !== taskId
        );
        setSelectedTasks(forSelectedTasks);
        // console.log("forSelectedTasks要顯示的卡片含全部", forSelectedTasks);

        const forOnlyNewSelected = onlyNewSelected.filter(
          (p) => p.constructionJobTask.id !== taskId
        );
        setOnlyNewSelected(forOnlyNewSelected);
        // console.log(
        //   "forOnlyNewSelected要顯示的卡片只有新增",
        //   forOnlyNewSelected
        // );

        // getApiSelectedTask(deliverInfo.id);
      },
      [selectedTasks, constructionTaskList, onlyNewSelected]
    );
    // 開啟edit dialog

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
    const onSubmit = async (data) => {
      console.log("data", data);
      //   const convertData = [];
      //   for (var task of selectedTasks) {
      //     const tempTask = {
      //       id: task?.id ? task.id : "",
      //       constructionJobTask: task.constructionJobTask.id,
      //       estimatedSince: task.estimatedSince ? task.estimatedSince : "",
      //       estimatedUntil: task.estimatedUntil ? task.estimatedUntil : "",
      //       location: task?.location ? task.location : "",
      //       remark: task?.remark ? task.remark : "",
      //     };
      //     if (tempTask.id === "") {
      //       delete tempTask.id;
      //     }
      //     convertData.push(tempTask);
      //     //console.log(convertData)
      //   }
      //   try {
      //     if (clearDispatch.length > 0) {
      //       const matchingIds = clearDispatch
      //         .map((id) => {
      //           const matchingTask = deliverInfo.constructionSummaryJobTasks.find(
      //             (task) => task.id === id
      //           );
      //           if (matchingTask) {
      //             return matchingTask.constructionSummaryJobTaskDispatches.map(
      //               (dispatch) => dispatch.id
      //             );
      //           }
      //           return [];
      //         })
      //         .flat();

      //       const deletePromises = matchingIds.map((deleteId) => {
      //         const deleteUrl = `constructionSummaryJobTaskDispatch/${deleteId}`;
      //         return deleteData(deleteUrl);
      //       });

      //       // 使用Promise.all等待所有delete操作完成
      //       const deleteResults = await Promise.all(deletePromises);

      //       // 处理delete操作结果
      //       deleteResults.forEach((result) => {
      //         if (result.status) {
      //           // 删除成功的处理逻辑
      //         } else if (result.result.response !== 200) {
      //           // 删除失败的处理逻辑
      //         }
      //       });
      //       setClearDispatch(null);
      //     }
      //   } catch (error) {
      //     // 处理错误
      //     console.error("Error:", error);
      //   }

      // 等待delete操作完成后再执行sendDataToBackend
      //sendDataToBackend(convertData, "task", otherData);
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
        <div className="">
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)}>
              {onlyNewSelected.map((task, index) => (
                <div key={index} className="border p-2 mb-2 rounded-md">
                  <div className="flex  justify-between">
                    {task.constructionJobTask?.name}
                    <DeleteIcon
                      color="primary"
                      onClick={() => {
                        console.log(task.constructionJobTask?.id);
                        handleRemoveTask(task.constructionJobTask?.id);
                      }}
                    />
                  </div>

                  <div className="mt-3">
                    <InputTitle
                      title={`預計施工日期 - 完工日期`}
                      required={false}
                    />
                    <div className="flex gap-3">
                      <ControlledDatePicker name={`estimatedSince${index}`} />

                      {/* <InputTitle title={"預計完工日期"} required={false} /> */}
                      <ControlledDatePicker name={`estimatedUntil${index}`} />
                    </div>
                  </div>

                  <div className="flex flex-col  mt-3">
                    <InputTitle title={"施工位置"} required={false} />

                    <Controller
                      name={`location${index}`}
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
                  <div className="flex flex-col mt-3">
                    <InputTitle title={"說明 /備註"} required={false} />
                    <Controller
                      name={`remark${index}`}
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
                  </div>
                </div>
              ))}

              <div className="inline-flex gap-3 my-2 w-full">
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
              <div className="w-full my-2">
                <Button
                  type="submit"
                  variant="contained"
                  color="success"
                  className="!mb-2 !ease-in-out !duration-300 !w-full"
                >
                  儲存提交
                </Button>
              </div>
            </form>
          </FormProvider>
        </div>
      </>
    );
  }
);

export { TaskModal };

//     {/* Modal */}
//     <ModalTemplete
//     title={title}
//     show={constructionTaskList ? true : false}
//     //show={true}
//     onClose={onCheckDirty}
//     maxWidth={padScreen ? "428px" : "660px"}
//   >
//     <div className="flex gap-3 relative">
//       <div className="w-[360px] bg-bue-500">
//         {/* <FormProvider {...methods}>
//           <form onSubmit={handleSubmit(onSubmit)}> */}
//         <div
//           className="flex flex-col pt-4 gap-4 !overflow-y-auto"
//           style={{ height: "70vh", scrollbarWidth: "thin" }}
//         >
//           <div>
//             <TextField
//               variant="outlined"
//               size="small"
//               className="inputPadding"
//               label="清單標題"
//               value={deliverInfo?.name ? deliverInfo.name : ""}
//               fullWidth
//               inputProps={{ readOnly: true }}
//             />
//           </div>
//   <div className="inline-flex gap-3">
//     <FormControl size="small" className="inputPadding" fullWidth>
//       {selectedTask === "" ? (
//         <InputLabel
//           id="task-select-label"
//           disableAnimation
//           shrink={false}
//           focused={false}
//         >
//           請選擇工項執行
//         </InputLabel>
//       ) : null}
//       <Select
//         labelId="task-select-label"
//         value={selectedTask}
//         onChange={handleTaskChange}
//         //MenuProps={MenuProps}
//       >
//         {constructionTaskList?.map((task) => (
//           <MenuItem key={"select" + task.id} value={task.id}>
//             {task.name}
//           </MenuItem>
//         ))}
//       </Select>
//     </FormControl>
//     <Button
//       variant="contained"
//       color="dark"
//       onClick={handleAddTask}
//       disabled={!selectedTask}
//       className="!text-base !h-12"
//     >
//       新增
//     </Button>
//   </div>
//   <List
//     className="overflow-y-auto border border-neutral-300 rounded"
//     sx={{ height: "100%" }}
//   >
//     {!isLoading ? (
//       <TransitionGroup>
//         {selectedTasks.map((task) => (
//           <Collapse
//             key={"selected" + task.constructionJobTask?.id}
//           >
//             <ListItem>
//               <ListItemText
//                 secondary={task.constructionJobTask?.name}
//               />
//               <IconButton
//                 onClick={() => {
//                   handleEditTask(task);
//                 }}
//               >
//                 <Edit />
//               </IconButton>
//               {task.id.length === 0 && (
//                 <IconButton
//                   onClick={() => {
//                     handleRemoveTask(task.constructionJobTask.id);
//                   }}
//                 >
//                   <DeleteIcon />
//                 </IconButton>
//               )}
//             </ListItem>
//             <Divider variant="middle" />
//           </Collapse>
//         ))}
//       </TransitionGroup>
//     ) : (
//       <Loading size={18} />
//     )}
//   </List>
//           {padScreen ? (
//             <div className="flex gap-x-3">
//               <Button
//                 variant="contained"
//                 color="success"
//                 className="!text-sm !h-10 !md:text-base"
//                 fullWidth
//                 onClick={() => {
//                   setIsCheckingList(!isCheckingList);
//                 }}
//               >
//                 {isCheckingList ? "返回" : "預覽清單"}
//               </Button>
//               <Button
//                 onClick={onSubmit}
//                 variant="contained"
//                 color="success"
//                 className="!text-sm !h-10 !md:text-base"
//                 fullWidth
//               >
//                 儲存
//               </Button>
//               <Button
//                 onClick={() => {
//                   // console.log("setNextModalOpendispatch");
//                   // setNextModalOpen("dispatch");
//                   onSubmit("dispatch");
//                 }}
//                 variant="contained"
//                 color="success"
//                 className="!text-sm !h-10 !md:text-base"
//                 fullWidth
//               >
//                 儲存並派工
//               </Button>
//             </div>
//           ) : (
//             <div className="flex gap-x-1">
//               <Button
//                 onClick={onSubmit}
//                 variant="contained"
//                 color="success"
//                 className="!text-base !h-12"
//                 fullWidth
//               >
//                 儲存
//               </Button>
//               <Button
//                 onClick={() => {
//                   // console.log("setNextModalOpendispatch");
//                   // setNextModalOpen("dispatch");
//                   onSubmit("dispatch");
//                 }}
//                 variant="contained"
//                 color="success"
//                 className="!text-base !h-12"
//                 fullWidth
//               >
//                 儲存並派工
//               </Button>
//             </div>
//           )}
//         </div>
//         {/* </form>
//         </FormProvider> */}
//       </div>
//       <div
//         className={`${
//           isCheckingList ? "absolute" : "hidden"
//         }  md:block md:w-[300px] md:static md:h-[69vh] h-[calc(68vh-46px)] right-0 left-0 top-0 bottom-0 z-10 border-2 overflow-y-scroll rounded-md bg-slate-50 mt-3`}
//       >
//         {/* <div>工單預覽</div> */}
//         {/* <div className="">清單預覽</div> */}
//         {!!selectedTasks.length ? (
//           selectedTasks.map((task, index) => (
//             <Card
//               className="m-2 shadow-sm !p-0"
//               key={index + task.constructionJobTask.name}
//             >
//               <CardContent className="!p-2">
//                 <Typography variant="h6" component="div" className="pl-3">
//                   {task?.constructionJobTask.name
//                     ? task?.constructionJobTask.name
//                     : "尚無資料"}
//                 </Typography>
//                 <Typography variant="body2" className="pl-3">
//                   <span className="m-1">
//                     預計施工日期:{" "}
//                     {task?.estimatedSince ? task.estimatedSince : ""}
//                   </span>
//                   <br />
//                   <span className="m-1">
//                     預計完工日期:{" "}
//                     {task?.estimatedUntil ? task.estimatedUntil : ""}
//                   </span>
//                   <br />
//                   <span className="m-1">
//                     施工位置: {task?.location ? task.location : ""}
//                   </span>
//                   <br />
//                   <span className="m-1 overflow-x-auto">
//                     說明: {task?.remark ? task.remark : ""}
//                   </span>
//                 </Typography>
//               </CardContent>
//             </Card>
//           ))
//         ) : (
//           <Card className="m-2 shadow-sm !p-0">
//             <CardContent className="!p-2">
//               <Typography variant="h6" component="div" className="pl-3">
//                 尚無資料
//               </Typography>
//             </CardContent>
//           </Card>
//         )}
//       </div>
//     </div>
//   </ModalTemplete>
//   <Backdrop
//     sx={{ color: "#fff", zIndex: 1050 }}
//     open={!constructionTaskList}
//     onClick={onCheckDirty}
//   >
//     <LoadingThree size={40} />
//   </Backdrop>
//   <TaskEditDialog
//     deliverTaskInfo={deliverTaskInfo}
//     sendDataToTaskEdit={sendDataToTaskEdit}
//     onClose={onTaskEditClose}
//     isOpen={taskEditOpen}
//     clearDispatch={clearDispatch}
//     setClearDispatch={setClearDispatch}
//     phoneScreen={phoneScreen}
//     aria-labelledby="responsive-dialog-title"
//   />
//   {/* Alert */}
//   <AlertDialog
//     open={alertOpen}
//     onClose={handleAlertClose}
//     icon={<ReportProblemIcon color="secondary" />}
//     title="注意"
//     content="您所做的變更尚未儲存。是否確定要關閉表單？"
//     disagreeText="取消"
//     agreeText="確定"
//   />
