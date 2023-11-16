import React, { useEffect, useState, useCallback } from "react";
import ModalTemplete from "../../components/Modal/ModalTemplete";

import AlertDialog from "../../components/Alert/AlertDialog";
import {Loading} from "../../components/Loader/Loading";
import {
  TextField,
  Button,
  Select,
  SelectChangeEvent,
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
  CircularProgress,
} from "@mui/material";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import { TransitionGroup } from "react-transition-group";
import { deleteData, getData, postData } from "../../utils/api";
import { useNotification } from "../../hooks/useNotification";

import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import InputTitle from "../../components/Guideline/InputTitle";
import { IOSSwitch } from "../../components/Switch/Switch";

import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";

const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);

const DispatchModal = React.memo(
  ({ title, deliverInfo, onClose, setNextModalOpen }) => {
    // Alert 開關
    const [alertOpen, setAlertOpen] = useState(false);
    const showNotification = useNotification();

    const [taskList, setTaskList] = useState(null);
    const [dateList, setDateList] = useState(null);
    const [isDispatchLoading, setIsDispatchLoading] = useState(false);
    const [isSwitchLoading, setIsSwitchLoading] = useState({});
    const [switchStates, setSwitchStates] = useState({});
    const [departMemberList, setDepartMemberList] = useState(null);
    const [selectedDate, setSelectedDate] = useState("");
    const [activeCard, setActiveCard] = useState("");
    const [selectedSwitch, setSelectedSwitch] = useState(null);
    const [disabledSwitchId, setDisabledSwitchId] = useState(null);
    const theme = useTheme();
    const phoneScreen = useMediaQuery(theme.breakpoints.down("576"));
    const padScreen = useMediaQuery(theme.breakpoints.down("768"));

    const [dispatchDialogOpen, setDispatchDialogOpen] = useState(false);
    // 檢查是否被汙染
    const [isDirty, setIsDirty] = useState(false);

    // 打開面板先取得工務人員清單跟工項執行列表
    useEffect(() => {
      if (deliverInfo) {
        getTaskList();
        getDepartMemberList(11);
        console.log("setNextModalOpen(null)");
        // setNextModalOpen(null);
      }
    }, [deliverInfo]);

    const getDepartMemberList = useCallback((id) => {
      const departMemberList = `department/${id}/staff`;
      getData(departMemberList).then((result) => {
        setDepartMemberList(result.result);
        //console.log("departMemberList", result.result);
      });
    }, []);
    // console.log("派工這邊的deliverInfo", deliverInfo);
    const getTaskList = useCallback(() => {
      const seledtedTaskUrl = `constructionSummary/${deliverInfo}/tasks`;
      getData(seledtedTaskUrl).then((result) => {
        //console.log("taskList", result.result);
        setTaskList(result.result);
        if (!!activeCard) {
          const matchCard = result.result.findIndex(
            (task) => task.id === activeCard.id
          );
          setActiveCard(result.result[matchCard]);
          setIsDispatchLoading(false);
        }
      });
      //console.log("getTaskList");
    }, [activeCard]);

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

    const postDispatchApi = (e, labourersId) => {
      e.preventDefault();
      setSelectedSwitch(labourersId);
      const postUrl = `constructionSummaryJobTask/${activeCard.id}/dispatches`;
      // 開關的開->派遣
      if (e.target.checked) {
        try {
          const params = { labourers: labourersId, date: selectedDate };
          handleSwitchState(e.target.checked, labourersId);
          postData(postUrl, params).then((result) => {
            //console.log(result);
            if (result.status) {
              //handleSwitchState(e.target.checked, labourersId);
              showNotification("處理成功", true);
              getTaskList();
              //setIsDispatchLoading(false);
            } else if (result.result.response !== 200) {
              //console.log(result.result);
              showNotification(result.result.reason, false);
              getTaskList();
              //setIsDispatchLoading(false);
            }
          });
        } catch (error) {
          // 處理錯誤
          console.error("Error:", error);
          setIsDispatchLoading(false);
        }
      } else {
        try {
          // 開關的關->取消派遣
          //filteredObjects: 刪除的時候，將constructionSummaryJobTaskDispatches中對應該員工ID的那個物件(編號)取出
          const filteredObjects =
            activeCard.constructionSummaryJobTaskDispatches.filter(
              (item) => item.labourer.id === labourersId
            );
          handleSwitchState(e.target.checked, labourersId);
          if (filteredObjects) {
            const deleteUrl = `constructionSummaryJobTaskDispatch/${filteredObjects[0].id}`;
            // console.log(deleteUrl);
            deleteData(deleteUrl).then((result) => {
              // console.log(result);
              if (result.status) {
                showNotification("處理成功", true);
                getTaskList();
                //setIsDispatchLoading(false);
                //handleSwitchState(e.target.checked, labourersId);
              } else if (result.result.response !== 200) {
                //console.log(result.result);
                showNotification(result.result.reason, false);
                getTaskList();
                //setIsDispatchLoading(false);
              }
            });
          }
        } catch (error) {
          // 處理錯誤
          console.error("Error:", error);
          setIsDispatchLoading(false);
        }
      }
    };

    const clickSwitch = (e, memberId) => {
      postDispatchApi(e, memberId);
      setDisabledSwitchId(memberId);
      setIsDispatchLoading(true);
    };

    const handleSwitchState = (checked, memberId) => {
      if (memberId) {
        const newState = {
          ...switchStates,
          [memberId]: checked,
        };
        setSwitchStates(newState);
      }
      console.log(switchStates);
    };

    //當選了日期後，要設置日期有哪些人被派出，在switch上呈現
    useEffect(() => {
      if (selectedDate) {
        const updatedSwitchStates = {}; // 創建一個新的物件來儲存更新後的狀態
        departMemberList.forEach((member) => {
          updatedSwitchStates[member.id] =
            activeCard &&
            !!activeCard.constructionSummaryJobTaskDispatches.find(
              (item) =>
                item.labourer.id === member.id && item.date === selectedDate
            );
        });
        //console.log(updatedSwitchStates);
        setSwitchStates(updatedSwitchStates); // 使用更新後的物件來設定狀態
      }
    }, [activeCard, selectedDate]);

    // 點擊卡片的時候，會設定該卡片能選擇的日期，並預設日期為第一個可選擇日，以及派工所需的卡片ID
    const handleClickCard = (task) => {
      setActiveCard(task);
      if (!!task.estimatedSince && !!task.estimatedUntil) {
        const since = new Date(task.estimatedSince);
        const until = new Date(task.estimatedUntil);
        let dateOptions = [];
        const currentDate = new Date(since);
        while (currentDate <= until) {
          const formattedDate = `${currentDate.getFullYear()}-${(
            currentDate.getMonth() + 1
          )
            .toString()
            .padStart(2, "0")}-${currentDate
            .getDate()
            .toString()
            .padStart(2, "0")}`;
          const dayOfWeek = ["日", "一", "二", "三", "四", "五", "六"][
            currentDate.getDay()
          ];
          const displayDate = `${formattedDate} (星期${dayOfWeek})`;
          dateOptions.push({ value: formattedDate, label: displayDate });
          currentDate.setDate(currentDate.getDate() + 1);
        }
        setDateList(dateOptions);
        setSelectedDate(dateOptions[0].value);
      } else {
        setDateList(null);
        setSelectedDate("");
      }
      if (padScreen) {
        setDispatchDialogOpen(true);
      }
    };

    return (
      <>
        {/* Modal */}
        <ModalTemplete
          title={"工項執行派工"}
          show={!!taskList && !!deliverInfo}
          //show={true}
          onClose={() => {
            onCheckDirty();
          }}
          maxWidth={padScreen ? "428px" : "660px"}
        >
          {/* {console.log(deliverInfo)} */}
          <div className="flex relative gap-2 mb-2">
            <div>
              <div
                className={` md:w-[300px] md:h-[69vh] h-[calc(68vh-46px)]  overflow-y-auto relative rounded-md mt-3 p-2 border bg-slate-50 w-full`}
              >
                <Card className="!shadow-sm !p-0 md:hidden text-center mb-2">
                  <CardContent className="!p-0">
                    <Typography variant="h6" component="div" className="pl-3">
                      <span> "請點擊卡片進行派工"</span>
                    </Typography>
                  </CardContent>
                </Card>
                {!!taskList?.length ? (
                  taskList.map((task, index) => (
                    <Card
                      className={` !p-0 mb-3 relative ${
                        activeCard.id === task.id &&
                        "!bg-primary-500 !text-orange-100"
                      }`}
                      key={index + task.constructionJobTask.name}
                      onClick={() => {
                        handleClickCard(task);
                        // console.log("task.id", task.id);
                        // console.log(activeCard);
                      }}
                    >
                      <CardContent className="!p-2">
                        <Typography
                          variant="h6"
                          component="div"
                          className="px-3"
                        >
                          <span>
                            {task?.constructionJobTask.name
                              ? task?.constructionJobTask.name
                              : "尚無資料"}
                          </span>
                        </Typography>
                        <Typography variant="body2" className="p-3">
                          <span className="">
                            預計施工日期:{" "}
                            {task?.estimatedSince ? task.estimatedSince : ""}
                          </span>
                          <br />
                          <span className="">
                            預計完工日期:{" "}
                            {task?.estimatedUntil ? task.estimatedUntil : ""}
                          </span>
                          <br />
                          <span className="">
                            施工位置: {task?.location ? task.location : ""}
                          </span>
                          <br />
                          <span className="overflow-x-auto pe-5">
                            說明: {task?.remark ? task.remark : ""}
                          </span>
                          {/* <br />
                        <span className="overflow-x-auto pe-5">
                          id: {task?.id ? task.id : ""}
                        </span> */}
                          <span className="absolute w-[50px] h-[50px] bottom-0 right-0 flex items-center justify-center">
                            {task.id === activeCard.id && isDispatchLoading && (
                              <CircularProgress size={20} />
                            )}
                          </span>
                        </Typography>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card className=" shadow-sm !p-0 ">
                    <CardContent className="!p-2">
                      <Typography variant="h6" component="div" className="pl-3">
                        <span>尚無資料</span>
                      </Typography>
                    </CardContent>
                  </Card>
                )}
              </div>{" "}
            </div>
            {/* {activeCard?} */}
            <div
              className={`md:w-[300px] md:h-[69vh] h-[calc(68vh-46px)]  overflow-y-auto  rounded-md mt-3 border p-2 hidden md:block`}
            >
              {activeCard ? (
                <div>
                  <InputTitle title={"日期"} required={false} />
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    // defaultValue={''}
                    value={selectedDate}
                    fullWidth
                    onChange={(event) => {
                      setSelectedDate(event.target.value);
                    }}
                  >
                    {!!dateList &&
                      dateList.map((date) => (
                        <MenuItem key={date.value} value={date.value}>
                          {date.label}
                        </MenuItem>
                      ))}
                  </Select>
                  <InputTitle
                    title={"派工人員"}
                    required={false}
                    classnames="mt-2"
                  >
                    {/* <span className="italic text-neutral-500 text-sm">(已選取 {selectedMembers.length} 名人員)</span> */}
                  </InputTitle>
                  <List className="overflow-y-auto border border-neutral-300 rounded !mb-2.5">
                    {departMemberList?.length > 0 ? (
                      <TransitionGroup>
                        {departMemberList.map((member) => (
                          <Collapse key={member.id}>
                            <ListItem className="">
                              <ListItemText
                                secondary={
                                  member.department.name +
                                  " / " +
                                  member.nickname
                                }
                              />
                              <IOSSwitch
                                sx={{ m: 1 }}
                                checked={switchStates[member.id] || false}
                                disabled={
                                  isDispatchLoading &&
                                  disabledSwitchId === member.id
                                }
                                onChange={(e) => {
                                  clickSwitch(e, member.id);
                                }}
                              />
                            </ListItem>
                            <Divider variant="middle" />
                          </Collapse>
                        ))}
                      </TransitionGroup>
                    ) : (
                      <span className="flex h-full items-center justify-center">
                        <span className="italic text-neutral-500 text-sm">
                          (該部門已無人選)
                        </span>
                      </span>
                    )}
                  </List>
                </div>
              ) : (
                <Card className="m-2 shadow-sm !p-0">
                  <CardContent className="!p-2">
                    <Typography variant="h6" component="div" className="pl-3">
                      <span>請選擇左側工項卡片</span>
                    </Typography>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
          {/* <Button
            onClick={() => {}}
            variant="contained"
            color="success"
            className="!text-base !h-10"
            fullWidth
          >
            返回卡片修改日期
          </Button> */}
          {/* <Button
            onClick={() => {}}
            variant="contained"
            color="success"
            className="!text-base !h-10"
            fullWidth
          >
            預覽整體派工清單
          </Button> */}
        </ModalTemplete>
        <Backdrop
          sx={{ color: "#fff", zIndex: 1050 }}
          open={!taskList}
          onClick={onCheckDirty}
        >
          <Loading size={40} />
        </Backdrop>

        <AlertDialog
          open={alertOpen}
          onClose={handleAlertClose}
          icon={<ReportProblemIcon color="secondary" />}
          title="注意"
          content="您所做的變更尚未儲存。是否確定要關閉表單？"
          disagreeText="取消"
          agreeText="確定"
        />
        <DispatchDialog
          activeCard={activeCard}
          onClose={() => setDispatchDialogOpen(false)}
          isOpen={dispatchDialogOpen}
          phoneScreen={phoneScreen}
          dateList={dateList}
          getTaskList={getTaskList}
          departMemberList={departMemberList}
          selectedDate={selectedDate}
        />
      </>
    );
  }
);

const DispatchDialog = React.memo(
  ({
    activeCard,
    onClose,
    isOpen,
    getTaskList,
    dateList,
    phoneScreen,
    departMemberList,
    selectedDate,
    setSelectedDate,
  }) => {
    // Alert 開關
    // 檢查是否被汙染
    const [alertOpen, setAlertOpen] = useState(false);
    const showNotification = useNotification();

    // const [taskList, setTaskList] = useState(null);
    // const [dateList, setDateList] = useState(null);
    const [isDispatchLoading, setIsDispatchLoading] = useState(false);
    const [switchStates, setSwitchStates] = useState({});
    // 檢查表單是否汙染
    const [isDirty, setIsDirty] = useState(false);
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

    const postDispatchApi = (IsSelected, labourersId) => {
      // 開關的開->派遣
      const postUrl = `constructionSummaryJobTask/${activeCard.id}/dispatches`;
      if (IsSelected) {
        try {
          const params = { labourers: labourersId, date: selectedDate };
          postData(postUrl, params).then((result) => {
            //console.log(result);
            if (result.status) {
              showNotification("處理成功", true);
              getTaskList();
              handleSwitchState(IsSelected, labourersId);
            } else if (result.result.response === 400) {
              //console.log(result.result);
              showNotification(result.result.reason, false);
              setIsDispatchLoading(false);
              //目前唯一會導致400的原因只有名稱重複，大概吧
            } else {
              showNotification("需填日期", false);
              setIsDispatchLoading(false);
              //目前測試需有資訊才能修改
              //console.log(result);
            }
          });
        } catch (error) {
          // 處理錯誤
          console.error("Error:", error);
          setIsDispatchLoading(false);
        }
      } else {
        try {
          // 開關的關->取消派遣
          //filteredObjects: 刪除的時候，將constructionSummaryJobTaskDispatches中對應該員工ID的那個物件(編號)取出
          const filteredObjects =
            activeCard.constructionSummaryJobTaskDispatches.filter(
              (item) => item.labourer.id === labourersId
            );
          if (filteredObjects) {
            const deleteUrl = `constructionSummaryJobTaskDispatch/${filteredObjects[0].id}`;
            // console.log(deleteUrl);
            deleteData(deleteUrl).then((result) => {
              // console.log(result);
              if (result.status) {
                showNotification("處理成功", true);
                getTaskList();
                setIsDispatchLoading(false);
                handleSwitchState(IsSelected, labourersId);
              } else if (result.result.response === 400) {
                //console.log(result.result);
                showNotification(result.result.reason, false);
                setIsDispatchLoading(false);
              } else {
                showNotification("沒有修改權限", false);
                setIsDispatchLoading(false);
                //目前測試需有資訊才能修改
                //console.log(result);
              }
            });
          }
        } catch (error) {
          // 處理錯誤
          console.error("Error:", error);
          setIsDispatchLoading(false);
        }
      }
    };

    const handleDateChange = (event) => {
      setSelectedDate(event.target.value);
      //console.log(event.target.value);
    };

    const handleSwitchState = (checked, memberId) => {
      const newState = {
        ...switchStates,
        [memberId]: checked,
      };
      setSwitchStates(newState);
      setTimeout(() => {
        setIsDispatchLoading(false);
      }, 1000);
    };

    useEffect(() => {
      if (selectedDate) {
        const updatedSwitchStates = {}; // 創建一個新的物件來儲存更新後的狀態
        departMemberList.forEach((member) => {
          updatedSwitchStates[member.id] =
            activeCard &&
            !!activeCard.constructionSummaryJobTaskDispatches.find(
              (item) =>
                item.labourer.id === member.id && item.date === selectedDate
            );
        });
        //console.log(updatedSwitchStates);
        setSwitchStates(updatedSwitchStates); // 使用更新後的物件來設定狀態
      }
    }, [activeCard, selectedDate]);

    return (
      <>
        {activeCard && (
          <Dialog
            //fullScreen={phoneScreen}
            open={isOpen}
            onClose={onClose}
            sx={{ width: "auto", maxWidth: "600px" }}
          >
            <DialogTitle
              id="responsive-dialog-title"
              className="mt-5 "
            ></DialogTitle>
            <DialogContent>
              <span className="text-lg w-full text-center">
                <p> {activeCard.constructionJobTask.name}</p>
              </span>
              <hr className="my-2" />
              <div className="w-[70vw]">
                <InputTitle title={"日期"} required={false} />
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  // defaultValue={''}
                  value={selectedDate}
                  fullWidth
                  onChange={(event) => {
                    handleDateChange(event);
                  }}
                >
                  {!!dateList &&
                    dateList.map((date) => (
                      <MenuItem key={date.value} value={date.value}>
                        {date.label}
                      </MenuItem>
                    ))}
                </Select>
                <InputTitle
                  title={"派工人員"}
                  required={false}
                  classnames="mt-2"
                />

                <List className="overflow-y-auto border border-neutral-300 rounded !mb-2.5">
                  {departMemberList?.length > 0 ? (
                    <TransitionGroup>
                      {departMemberList.map((member) => (
                        <Collapse key={member.id}>
                          <ListItem className="">
                            <ListItemText
                              secondary={
                                member.department.name + " / " + member.nickname
                              }
                            />
                            <IOSSwitch
                              sx={{ m: 1 }}
                              checked={switchStates[member.id] || false}
                              disabled={isDispatchLoading}
                              onChange={(e) => {
                                setIsDispatchLoading(true);
                                postDispatchApi(e.target.checked, member.id);
                              }}
                            />
                          </ListItem>
                          <Divider variant="middle" />
                        </Collapse>
                      ))}
                    </TransitionGroup>
                  ) : (
                    <span className="flex h-full items-center justify-center">
                      <span className="italic text-neutral-500 text-sm">
                        (該部門已無人選)
                      </span>
                    </span>
                  )}
                </List>
              </div>
            </DialogContent>
            <Button
              onClick={onClose}
              variant="contained"
              color="success"
              className="!text-base !h-10"
              fullWidth
            >
              返回
            </Button>
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

export { DispatchModal, DispatchDialog };
