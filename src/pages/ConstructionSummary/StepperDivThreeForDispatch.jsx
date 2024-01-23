import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  CardContent,
  Collapse,
  Divider,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Select,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { IOSSwitch } from "../../components/Switch/Switch";
import InputTitle from "../../components/Guideline/InputTitle";
import { Loading } from "../../components/Loader/Loading";
import { deleteData, getData, postData } from "../../utils/api";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../../hooks/useNotification";
import { TransitionGroup } from "react-transition-group";
import HelpQuestion from "../../components/HelpQuestion/HelpQuestion";

// step-3 的 div，編修派工人員，想要正常執行 EditDispatchDiv，一定要傳一個 summaryID進去
const StepperDivThreeForDispatch = React.memo(
  ({
    deliverInfo,
    setActiveStep,
    setCurrentDivIndex,
    currentDivIndex,
    departMemberList,
    onClose,
    isLoading,
    setIsLoading,
    RefleshMainList,
  }) => {
    //載入後先抓api=右半部卡片內容
    const [taskList, setTaskList] = useState([]);
    //每個卡片都有自己的日期狀態
    const [dateList, setDateList] = useState([]);
    const [isDispatchLoading, setIsDispatchLoading] = useState(false);
    const [switchStates, setSwitchStates] = useState({});

    //要送出哪位員工在哪天被派出用
    const [selectedDate, setSelectedDate] = useState("");

    const [activeCard, setActiveCard] = useState("");
    const [selectedSwitch, setSelectedSwitch] = useState(null);
    const [disabledSwitchId, setDisabledSwitchId] = useState(null);
    const theme = useTheme();
    const padScreen = useMediaQuery(theme.breakpoints.down("768"));

    const showNotification = useNotification();
    const navigate = useNavigate();
    useEffect(() => {
      setIsLoading(true);
    }, []);

    // 打開面板先取得工務人員清單跟工項執行列表
    useEffect(() => {
      console.log(deliverInfo)
      if (!!deliverInfo) {
        getTaskList();
      }
    }, [deliverInfo]);

    // 當螢幕在手機模式跟電腦寬度之間拉伸的話，要隨時重製初始視窗
    useEffect(() => {
      if (!padScreen) {
        setCurrentDivIndex(0);
      }
    }, [padScreen]);

    //當選了日期後，要設置日期有哪些人被派出，在switch上呈現
    useEffect(() => {
      updateSwitchState();
    }, [activeCard, selectedDate]);

    const getTaskList = () => {
      if (!!deliverInfo) {
        // console.log("deliverInfo", deliverInfo);
        const seledtedTaskUrl = `constructionSummary/${deliverInfo?.id}/tasks`;
        getData(seledtedTaskUrl).then((result) => {
          //console.log("taskList", result.result);
          setTaskList(result.result);
          if (!!activeCard) {
            const matchCard = result.result.findIndex(
              (task) => task.id === activeCard.id
            );
            setActiveCard(result.result[matchCard]);
          }
          setIsDispatchLoading(false);
          setIsLoading(false);
        });
      }
    };

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
        setCurrentDivIndex(1);
      }
      setSwitchStates({});
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
    };

    const postDispatchApi = (e, labourersId) => {
      e.preventDefault();
      setSelectedSwitch(labourersId);
      let timerId;
      const postUrl = `constructionSummaryJobTask/${activeCard.id}/dispatches`;
      // 開關的開->派遣
      if (e.target.checked) {
        try {
          const params = { labourers: labourersId, date: selectedDate };
          handleSwitchState(e.target.checked, labourersId);
          if (timerId) {
            clearTimeout(timerId);
          }
          postData(postUrl, params).then((result) => {
            //console.log(result);
            if (result.status) {
              showNotification(
                "新增成功，目前人員有" +
                  result?.result?.result?.map((i) => i.labourer.nickname),

                true
              );
              getTaskList();
            } else {
              showNotification(
                result.result.reason
                  ? result.result.reason
                  : (result.result
                  ? result.result
                  : "權限不足"),
                false
              );
              updateSwitchState();
              setIsDispatchLoading(false);
            }
          });
        } catch (error) {
          // 處理錯誤
          console.error("Error:", error);
          updateSwitchState();
          setIsDispatchLoading(false);
        }
      } else {
        try {
          // 開關的關->取消派遣
          // filteredObjects: 刪除的時候，將constructionSummaryJobTaskDispatches中對應該員工ID的那個物件(編號)取出
          const filteredObjects =
            activeCard.constructionSummaryJobTaskDispatches.filter(
              (item) => item.labourer.id === labourersId
            );
          if (filteredObjects) {
            const deleteUrl = `constructionSummaryJobTaskDispatch/${filteredObjects[0].id}`;
            handleSwitchState(e.target.checked, labourersId);
            if (timerId) {
              clearTimeout(timerId);
            }
            deleteData(deleteUrl).then((result) => {
              if (result.status) {
                showNotification(
                  "刪除成功，尚有人員" +
                    result?.result?.result?.map((i) => i.labourer.nickname),
                  true
                );
                getTaskList();
              } else  {
                showNotification(
                  result.result.reason
                    ? result.result.reason
                    : (result.result
                    ? result.result
                    : "權限不足"),
                  false
                );
                updateSwitchState();
                setIsDispatchLoading(false);
              }
            });
          }
        } catch (error) {
          // 處理錯誤
          console.error("Error:", error);
          updateSwitchState();
          setIsDispatchLoading(false);
        }
      }
    };

    const updateSwitchState = () => {
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
        setSwitchStates(updatedSwitchStates); // 使用更新後的物件來設定狀態
      }
    };

    const generateDateRange = (estimatedSince, estimatedUntil) => {
      if (estimatedSince && estimatedUntil) {
        // 如果都有值，使用日期區間的方法生成日期陣列
        const startDate = new Date(estimatedSince);
        const endDate = new Date(estimatedUntil);

        const dates = [];
        let currentDateIterator = new Date(startDate);
        while (currentDateIterator <= endDate) {
          dates.push(currentDateIterator.toISOString().slice(0, 10));
          currentDateIterator.setDate(currentDateIterator.getDate() + 1);
        }

        return dates;
      } else {
        // 如果有null，生成 [null, yyyy-MM-dd] 或 [yyyy-MM-dd, null]
        const dateArray = [];
        if (estimatedSince !== null) {
          dateArray.push(estimatedSince);
          dateArray.push(null);
        } else if (estimatedUntil !== null) {
          dateArray.push(null);
          dateArray.push(estimatedUntil);
        }
        return dateArray;
      }
    };

    return (
      <>
        {/* 上邊欄 */}
        <div className="h-full flex max-h-[432px] gap-x-3">
          {/* 上邊的左欄 */}

          <div
            className={`md:block  flex-1 gap-y-3 my-2 p-2 overflow-y-scroll
            ${!currentDivIndex ? "block" : "hidden"}`}
          >
            <Card className="!shadow-sm !p-0 md:hidden text-center mb-2">
              <CardContent className="!p-0">
                <Typography variant="h6" component="div" className="pl-3">
                  <span> "請點擊卡片進行派工"</span>
                </Typography>
              </CardContent>
            </Card>

            {isLoading ? (
              <Loading size={18} />
            ) : !!taskList?.length ? (
              taskList.map((task, index) => (
                <Card
                  className={` !p-0 mb-3 relative ${
                    activeCard.id === task.id && "!bg-slate-200 "
                  }`}
                  key={index + task.constructionJobTask.name}
                  onClick={() => {
                    handleClickCard(task);
                  }}
                >
                  <CardContent className="!p-2">
                    <Typography variant="h6" component="div" className="px-3">
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
                      <span className="bg-gray-300 w-full h-[0.1px] inline-block m-0 text-xs"></span>
                      {generateDateRange(
                        task.estimatedSince,
                        task.estimatedUntil
                      ).map((date) => (
                        <React.Fragment key={date}>
                          <span className=" w-full ">
                            <span>{date ? date + ": " : ""}</span>

                            <span className="">
                              {task?.constructionSummaryJobTaskDispatches
                                .length > 0 &&
                                task?.constructionSummaryJobTaskDispatches
                                  ?.filter((d) => d.date === date)
                                  .map(
                                    (dispatch) => dispatch.labourer?.nickname
                                  )
                                  .join(", ")}
                            </span>
                            <br />
                          </span>
                        </React.Fragment>
                      ))}
                    </Typography>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className=" shadow-sm !p-0 ">
                <CardContent className="!p-2">
                  <Typography
                    variant="h6"
                    component="div"
                    className="pl-3 text-center"
                  >
                    <span>尚無資料</span>
                  </Typography>
                </CardContent>
              </Card>
            )}
          </div>
          {/* 上邊的右欄 */}
          <div
            className={`${currentDivIndex ? "block" : "hidden"} 
              block flex-1 my-2 p-2 md:block md:w-full right-0 left-0 top-0 bottom-0 z-10 border-2 overflow-y-scroll rounded-md bg-slate-50 `}
          >
            {activeCard ? (
              <div className="">
                <InputTitle title={"日期"} required={false} />
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
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
                </InputTitle>
                <List className="overflow-y-auto border border-neutral-300 rounded !mb-2.5">
                  {departMemberList?.length > 0 ? (
                    <TransitionGroup>
                      {departMemberList.map((member) => (
                        <Collapse key={member.id}>
                          <ListItem className="!bg-transparent">
                            <ListItemText
                              secondary={
                                member.department.name + " / " + member.nickname
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
              <Card className=" shadow-sm !p-0">
                <CardContent className="!p-2">
                  <Typography
                    variant="h6"
                    component="div"
                    className="pl-3 text-center"
                  >
                    <span>請選擇左側工項卡片</span>
                  </Typography>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
        {/* 下邊欄用來放提交button */}
        <div>
          <div className="h-fit flex justify-between gap-x-2">
            <Button
              variant="contained"
              color="success"
              className="!text-base !h-10 !mt-1"
              fullWidth
              disabled={currentDivIndex === 1}
              onClick={() => {
                setActiveStep(1);
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
                if (currentDivIndex === 0) {
                  RefleshMainList();
                  onClose();
                } else if (padScreen) {
                  setCurrentDivIndex(0);
                }
              }}
            >
              {currentDivIndex === 0 ? "關閉" : "返回"}
            </Button>
            <Button
              variant="contained"
              color="success"
              className="!text-small sm:!text-base !h-10 !mt-1"
              fullWidth
              disabled={currentDivIndex === 1}
              onClick={() => {
                navigate("/dispatchcalendar");
              }}
            >
              派工行事曆
            </Button>
          </div>
          <div className="flex mt-2">
            <p className="!my-0 text-rose-400 font-bold text-xs !me-1">＊</p>
            <p className="!my-0 text-rose-400 font-bold text-xs">
              本頁面每個派工選項皆會直接儲存資料。
            </p>
          </div>
        </div>
      </>
    );
  }
);

export default StepperDivThreeForDispatch;
