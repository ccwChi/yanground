import React, { useEffect, useState, useCallback } from "react";
import {
  Autocomplete,
  Button,
  Card,
  CardContent,
  Checkbox,
  MenuItem,
  Select,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Loading } from "../../components/Loader/Loading";
import { deleteData, getData, postData } from "../../utils/api";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../../hooks/useNotification";
import CircularProgress from "@mui/material/CircularProgress";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import AlertDialog from "../../components/Alert/AlertDialog";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

// const thisMonth = new Date().toISOString().slice(5, 7); // 會得到2024-01-16這樣的格式
const currentDate = new Date();

// step-3 的 div，編修派工人員，想要正常執行 EditDispatchDiv，一定要傳一個 summaryID進去
const StepperDivThreeForDispatch = React.memo(
  ({
    deliverInfo,
    setDeliverInfo,
    setActiveStep,
    setCurrentDivIndex,
    currentDivIndex,
    onClose,
    isLoading,
    setIsLoading,
    RefleshMainList,
    setSendBackFlag,
    isDivDirty,
    setIsDivDirty,
  }) => {
    //載入後先抓api=右半部卡片內容
    const [taskList, setTaskList] = useState([]);
    //每個卡片都有自己的日期狀態
    const [dateList, setDateList] = useState([]);

    //要送出哪位員工在哪天被派出用
    const [selectedDate, setSelectedDate] = useState("");

    const [jobTask, setJobTask] = useState(null);
    const theme = useTheme();
    const padScreen = useMediaQuery(theme.breakpoints.down("768"));

    //api 求得的可派員工跟已被派出員工的清單
    const [departMemberList, setDepartMemberList] = useState([]);
    const [dispatchedList, setDispatchedList] = useState([]);

    // 過濾後顯示在下拉選擇欄裡面的列表
    const [taskSelectLabouerList, setTaskSelectLabouerList] = useState([]);
    const [dispatchForApi, setDispatchForApi] = useState([]);

    // 正在跑過濾派工選項中的loading
    const [isOptionLoading, setIsOptionLoading] = useState(false);
    const [alertOpen, setAlertOpen] = useState(false);
    const [buttonDirection, setButtonDirection] = useState("");
    const showNotification = useNotification();
    const navigate = useNavigate();

    useEffect(() => {
      setIsLoading(true);
      getThreeMonthDispatchLabourer();
      getDepartMemberList();
    }, []);

    // 打開面板先取得工務人員清單跟工項執行列表
    useEffect(() => {
      if (!!deliverInfo) {
        setIsDivDirty(false);
        getTaskList();
      }
    }, [deliverInfo]);

    // 當螢幕在手機模式跟電腦寬度之間拉伸的話，要隨時重製初始視窗
    useEffect(() => {
      if (!padScreen) {
        setCurrentDivIndex(0);
      }
    }, [padScreen]);

    // Alert 回傳值進行最終結果 --- true: 關閉 modal / all: 關閉 Alert
    const handleAlertClose = (agree) => {
      if (agree) {
        if (buttonDirection === "toDivTwo") {
          setActiveStep(1);
        } else if (buttonDirection === "close") {
          onClose();
        } else if (buttonDirection === "toCalendar") {
          navigate("/dispatchcalendar");
        } else if (typeof buttonDirection === "object") {
          handleClickCard(buttonDirection);
        }
      }
      setButtonDirection("");
      setIsDivDirty(false);
      setAlertOpen(false);
    };

    // 將日期轉換成 'YYYY/MM/DD'
    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}/${month}/${day}`;
    };

    // 求得上個月、這個月、下個月，並求得這三個月的派工人員id，
    // 規格為[{date:2024-01-01, dispatchIds:[id,id,..]},...]
    const getThreeMonthDispatchLabourer = () => {
      const currentMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth()
      );
      const previousMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - 1
      );
      const nextMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1
      );
      const monthArray = [
        formatDate(currentMonth).slice(0, 7),
        formatDate(previousMonth).slice(0, 7),
        formatDate(nextMonth).slice(0, 7),
      ];

      const promises = monthArray.map((month) => {
        const getThreeMonthDispatchLabourer = `timesheet/${month}`;
        return getData(getThreeMonthDispatchLabourer).then((result) => {
          const simplifyResult = result.result.map((summary) => {
            const dispatchIds = summary.summaries.flatMap((s) =>
              s.constructionSummaryJobTasks.flatMap((task) =>
                task.constructionSummaryJobTaskDispatches
                  .filter((dispatch) => dispatch.date === summary.date)
                  .map((dispatch) => dispatch.labourer.id)
              )
            );
            return {
              date: summary.date,
              dispatchIds: dispatchIds,
            };
          });
          return simplifyResult;
        });
      });
      Promise.all(promises)
        .then((allResults) => {
          const mergedList = allResults.flat();
          setDispatchedList(mergedList);
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
        });
    };

    // 求得所有可派工人清單
    // 規格為[{department:{id:id,name:"str"},id:id,nickname:"str"},...]
    const getDepartMemberList = useCallback(() => {
      const idArray = [11, 13, 17, 19];
      const promises = idArray.map((id) => {
        const departMemberListEndpoint = `department/${id}/staff`;
        return getData(departMemberListEndpoint).then((result) => {
          const filterList = result.result.map((data) => {
            const { id, nickname, department } = data;
            return { id, nickname, department };
          });
          return filterList;
        });
      });
      Promise.all(promises)
        .then((allResults) => {
          const mergedList = allResults.flat();
          setDepartMemberList(mergedList);
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
        });
    }, []);

    // 求得派工清單裡面的工項執行，用來顯示卡片，要有delivery才能求得
    const getTaskList = () => {
      if (!!deliverInfo) {
        const seledtedTaskUrl = `constructionSummary/${deliverInfo?.id}/tasks`;
        getData(seledtedTaskUrl).then((result) => {
          setTaskList(result.result);
          if (!!jobTask) {
            const matchCard = result.result.findIndex(
              (task) => task.id === jobTask.id
            );
            setJobTask(result.result[matchCard]);
          }
          setIsLoading(false);
        });
      }
    };

    // 點擊卡片的時候，會設定該卡片能選擇的日期，並預設日期為第一個可選擇日，以及派工所需的卡片ID
    const handleClickCard = (task) => {
      if (task.id === jobTask?.id) {
        return;
      }
      setJobTask(task);
      setDispatchForApi([]);
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

        setIsOptionLoading(false);

        // setDispatchForApi([]);
      }
      if (padScreen) {
        setCurrentDivIndex(1);
      }
    };

    // 點擊卡片的時候用，卡片有since跟unitl的話會求得日期區間
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

    useEffect(() => {
      setIsOptionLoading(true);
      if (jobTask && selectedDate && dispatchedList.length > 0) {
        forTaskSelectLabouerList(jobTask);
      }
    }, [jobTask, selectedDate, dispatchedList]);

    //過濾下拉式選單用的派工清單
    const forTaskSelectLabouerList = (selectedJobTask) => {
      const dayRestLabourerIds = dispatchedList
        .filter((list) => list.date === selectedDate)
        .map((i) => i.dispatchIds)
        .flat();

      //全部可選的人 減去 該天已被選的人 => 可選的人
      const notSelected = departMemberList
        .filter((member) => !dayRestLabourerIds.includes(member.id))
        .map((member) => {
          if (member.dispatchId) {
            const { dispatchId, ...memberWithoutDispatchId } = member;
            return memberWithoutDispatchId;
          } else {
            return member;
          }
        });

      //全部可選的人 中只選出 該天已被選的人 => 要設置狀態

      //最終結果是選哪個執行，選單只有該執行已派人的人+完全沒被派過的人
      let selectedPersonnel = [];
      if (selectedJobTask?.constructionSummaryJobTaskDispatches?.length > 0) {
        selectedPersonnel = departMemberList.filter((person) => {
          return selectedJobTask.constructionSummaryJobTaskDispatches
            .filter((i) => i.date === selectedDate)
            .some((dispatch) => {
              if (dispatch.labourer.id === person.id) {
                person.dispatchId = dispatch.id;
                return true;
              }
              return false;
            });
        });
      }
      const uniqueTaskSelectLabouerList = Array.from(
        new Set([...notSelected, ...selectedPersonnel].map(JSON.stringify))
      ).map(JSON.parse);
      // TaskSelectLabouerList = 還沒派出去的 + 今天已經派了
      setTaskSelectLabouerList(uniqueTaskSelectLabouerList);
      if (selectedJobTask?.constructionSummaryJobTaskDispatches?.length > 0) {
        const beSeleted = uniqueTaskSelectLabouerList.filter((labourer) =>
          selectedJobTask.constructionSummaryJobTaskDispatches
            .filter((dispatch) => dispatch.date === selectedDate)
            .some((dispatched) => dispatched.labourer.id === labourer.id)
        );
        setDispatchForApi(beSeleted);
      }
      setIsOptionLoading(false);
      setSendBackFlag(false);
    };
    // 派工人員的選擇，點選下拉是選單觸發
    const handleChange = (event, value) => {
      setIsDivDirty(true);
      setDispatchForApi(value);
    };
    //下面是處理新增派工
    const postDataPromise = (dispatchUrl, fd) => {
      return postData(dispatchUrl, fd).then((result) => {
        if (result.status) {
          showNotification("派工更改成功", true);
          return "postTrue";
        } else {
          showNotification(
            result.result.reason
              ? result.result.reason
              : result.result
              ? result.result
              : "權限不足",
            false
          );
          return "postFalse";
        }
      });
    };
    //下面是處理刪除派工的部分
    const deleteDataPromise = (deleteId) => {
      const deleteUrl = `constructionSummaryJobTaskDispatch/${deleteId}`;
      return deleteData(deleteUrl).then((result) => {
        if (result.status) {
          showNotification("刪除派工更改成功", true);
          return "deleteTrue";
        } else {
          showNotification(
            result.result.reason
              ? result.result.reason
              : result.result
              ? result.result
              : "權限不足",
            false
          );
          return "deleteFalse";
        }
      });
    };

    // 點擊派工提交
    const handleDispatchOnly = async () => {
      setIsDivDirty(true);
      setSendBackFlag(true);
      const newIncrease = dispatchForApi
        .filter((item) => item && !item.hasOwnProperty("dispatchId"))
        .map((item) => item.id);
      const removeWithPatchId = taskSelectLabouerList
        .filter((item) => item && item.hasOwnProperty("dispatchId"))
        .filter(
          (item1) =>
            !dispatchForApi.some(
              (item2) => item1.dispatchId === item2.dispatchId
            )
        )
        .map((item) => item.dispatchId);

      //下面是處理新增派工的部分
      const dispatchUrl = `constructionSummaryJobTask/${jobTask.id}/dispatches`;
      const fd = new FormData();
      const disPatchData = { labourers: newIncrease, date: selectedDate };
      for (let key in disPatchData) {
        fd.append(key, disPatchData[key]);
      }

      //用promise all等api都打完了再來發送日期給月曆主頁面，
      //讓月曆主頁面因為useEffect日期而重打api並重設今天的deliveryInfo
      try {
        const [postDataResult, deleteResults] = await Promise.all([
          postDataPromise(dispatchUrl, fd),
          Promise.all(
            removeWithPatchId.map((deleteId) => deleteDataPromise(deleteId)),
            setDispatchedList([]),
            getThreeMonthDispatchLabourer(),
            RefleshMainList(),
            updateJobTaskContent()
          ),
        ]);
      } catch (error) {
        console.error("Error:", error);
      }
    };

    const updateJobTaskContent = () => {
      const oldSummaryId = deliverInfo.id;
      getData(`constructionSummary/${oldSummaryId}`).then((result) => {
        const newSummary = result.result;
        setDeliverInfo(newSummary);
      });
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
                    jobTask?.id === task.id && "!bg-slate-200 "
                  }`}
                  key={index + task.constructionJobTask.name}
                  onClick={() => {
                    if (isDivDirty) {
                      setAlertOpen(true);
                      setButtonDirection(task);
                    } else {
                      handleClickCard(task);
                    }
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
            {jobTask ? (
              <div className="flex flex-col gap-y-4">
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={selectedDate}
                  fullWidth
                  onChange={(event) => {
                    setSelectedDate(event.target.value);
                  }}
                  displayEmpty
                >
                  <MenuItem value="" disabled>
                    <span className="text-neutral-400 font-light">
                      尚未選擇工項日期
                    </span>
                  </MenuItem>
                  {!!dateList &&
                    dateList.map((date) => (
                      <MenuItem key={date.value} value={date.value}>
                        {date.label}
                      </MenuItem>
                    ))}
                </Select>
                <div className="relative">
                  <Autocomplete
                    multiple
                    options={taskSelectLabouerList.sort(
                      (a, b) => -b.department.id.localeCompare(a.department.id)
                    )}
                    groupBy={(taskSelectLabouerList) =>
                      taskSelectLabouerList.department.name
                    }
                    loading={isOptionLoading}
                    disableCloseOnSelect
                    getOptionLabel={(taskSelectLabouerList) =>
                      taskSelectLabouerList.nickname
                    }
                    isOptionEqualToValue={(taskSelectLabouerList, value) =>
                      taskSelectLabouerList.id === value.id
                    }
                    disabled={!selectedDate}
                    onChange={handleChange}
                    value={dispatchForApi}
                    noOptionsText="當天已無可派人員"
                    renderOption={
                      (props, taskSelectLabouerList, { selected }) => (
                        // dispatchedList.length === 0 ? (
                        //   <CircularProgress color="inherit" size={20} />
                        // ) : (

                        <li {...props}>
                          <Checkbox
                            icon={icon}
                            checkedIcon={checkedIcon}
                            checked={selected}
                          />
                          {taskSelectLabouerList.nickname}
                        </li>
                      )
                      // )
                    }
                    renderInput={(params) => (
                      <>
                        <TextField
                          disabled={isOptionLoading}
                          {...params}
                          placeholder={
                            dispatchForApi.length > 0 ? "" : "尚無派工人員"
                          }
                        />
                      </>
                    )}
                  />
                  {isOptionLoading && selectedDate && (
                    <span className="absolute flex items-center right-10 top-0 bottom-0">
                      <CircularProgress color="primary" size={20} />
                    </span>
                  )}
                </div>
                <Button
                  variant="contained"
                  color="success"
                  // disabled={isEditableDate}
                  className="!ease-in-out !duration-300 !-mt-4 !min-w-[150px] h-fit"
                  style={{ transform: "translateY(1rem)" }}
                  onClick={handleDispatchOnly}
                >
                  修改人員 / 儲存
                </Button>
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
                if (isDivDirty) {
                  setAlertOpen(true);
                  setButtonDirection("toDivTwo");
                } else {
                  setActiveStep(1);
                }
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
                  if (isDivDirty) {
                    setAlertOpen(true);
                    setButtonDirection("close");
                  } else {
                    onClose();
                  }
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
                if (isDivDirty) {
                  setAlertOpen(true);
                  setButtonDirection("toCalendar");
                } else {
                  navigate("/dispatchcalendar");
                }
              }}
            >
              派工行事曆
            </Button>
          </div>
          <div className="flex mt-2">
            <p className="!my-0 text-rose-400 font-bold text-xs !me-1">＊</p>
            <p className="!my-0 text-rose-400 font-bold text-xs">
              本頁需要案下儲存按鈕才會儲存，僅能派出上個月、這個月、下個月三個月的派工。
            </p>
          </div>
          <AlertDialog
            open={alertOpen}
            onClose={handleAlertClose}
            icon={<ReportProblemIcon color="secondary" />}
            title="注意"
            content="您所做的變更尚未儲存。是否確定放棄變更？"
            disagreeText="取消"
            agreeText="確定"
          />
        </div>
      </>
    );
  }
);

export default StepperDivThreeForDispatch;
