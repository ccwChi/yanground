import React, { useState, useEffect, useCallback } from "react";

// import "./calendar.css";
import constructionTypeList from "../../datas/constructionTypes";

import PageTitle from "../../components/Guideline/PageTitle";
import AddIcon from "@mui/icons-material/Add";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import { getData, postData } from "../../utils/api";
import { EventModal } from "./CalendarModal";
import { useNotification } from "../../hooks/useNotification";
import { LoadingThree, LoadingTwo } from "../../components/Loader/Loading";
import Calendar from "../../components/Calendar/Calendar";
import { Backdrop, Tooltip, useMediaQuery } from "@mui/material";
import { UpdatedModal } from "./CalendarCreateSummaryModel";
import { calendarColorList } from "../../datas/calendarColorList";
import { useLocation } from "react-router-dom";
import useNavigateWithParams from "../../hooks/useNavigateWithParams";
import { format } from "date-fns";
import { zhTW } from "date-fns/locale";
import AlertDialog from "../../components/Alert/AlertDialog";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
const today = new Date();
// //30天後
// const twoDaysLater = new Date(today);
// twoDaysLater.setDate(today.getDate() + 30);
// //30天前
// const fiveDaysBefore = new Date(today);
// fiveDaysBefore.setDate(today.getDate() - 30);
// // 生成日期區間 dates = [2024-03-01, 2024-03-02, ..., 2024-03-07]
// const dates = [];
// let currentDateIterator = new Date(fiveDaysBefore);
// while (currentDateIterator <= twoDaysLater) {
//   dates.push(currentDateIterator.toISOString().slice(0, 10));
//   currentDateIterator.setDate(currentDateIterator.getDate() + 1);
// }
/////////////////////////////////////////////////////////////////////////////此版本是有lazy loading版，但太多牽連導致東錯溪錯
const DispatchCalendar = () => {
  const isTargetScreen = useMediaQuery("(max-width:991.98px)");
  // Alert 開關
  const [alertOpen, setAlertOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const showNotification = useNotification();
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [departMemberList, setDepartMemberList] = useState([]);

  // 儲存整理完的(七天)派工人員清單 + 全部施工清單過濾之後的全部，events會用這個下去做日期分類
  const [constSummaryApiList, setConstSummaryApiList] = useState([]);
  const [events, setEvents] = useState([]);

  // 在上面全域指派了幾天前幾天後，並儲存那些天數的陣列
  const [dateList, setDateList] = useState([]);

  // 新增施工清單的按鈕，要傳遞求得的全部專案新增面板
  const [projectsList, setProjectsList] = useState([]);

  // 用日期改變作為重打api的依據，為了在面板修改派工後可以重取api並將對應的日期資料傳給面板
  const [reGetCalendarData, setReGetCalendarData] = useState(today); // 派工用這個重取資料
  const [reGetSummaryListData, setReGetSummaryListData] = useState(true); // 修改工項執行用這個重取資料

  // 儲存api求得的施工清單總攬
  const [constructionSummaryList, setConstructionSummaryList] = useState([]);

  const [sendBackFlag, setSendBackFlag] = useState(false);

  // ModalValue 控制開啟的是哪一個 Modal
  const [modalValue, setModalValue] = useState(false);
  // 傳送額外資訊給 Modal
  const [deliverInfo, setDeliverInfo] = useState(null);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const isSmallScreen = useMediaQuery("(max-width:575.98px)");

  /** 送出 api 後，重打排休清單的標記 */
  const [reload, setReload] = useState(true);

  /** 紀錄月份，為了lazyloading不重複取 */
  const [monthCache, setMonthCache] = useState(new Set());

  const navigateWithParams = useNavigateWithParams();
  // 上方區塊功能按鈕清單

  const btnGroup = [
    {
      mode: "create",
      icon: <AddCircleIcon fontSize="small" />,
      text: "新增施工清單",
      variant: "contained",
      color: "primary",
      fabVariant: "success",
      fab: <AddIcon fontSize="large" />,
    },
  ];
  const monthValue = queryParams.get("month");
  const calendaryearsValue = queryParams.get("calendaryears");

  /** 先行判斷今天後，取得這個月的最後一天跟第一天，並設置日期清單 */
  useEffect(() => {
    if (monthCache.size === 0) {
      const monthFirstDay = format(
        new Date(today.getFullYear(), today.getMonth(), 1),
        "yyyy-MM-dd",
        {
          locale: zhTW,
        }
      );
      const monthLastDay = format(
        new Date(today.getFullYear(), today.getMonth() + 1, 0),
        "yyyy-MM-dd",
        {
          locale: zhTW,
        }
      );
      let currentDateIterator = new Date(monthFirstDay);
      let dates = [];
      while (currentDateIterator <= new Date(monthLastDay)) {
        dates.push(currentDateIterator.toISOString().slice(0, 10));
        currentDateIterator.setDate(currentDateIterator.getDate() + 1);
      }
      setDateList(dates);
      console.log("打第一個求日期", dates);
    }
    // console.log("dates", dates);
    // setCalendarMonthRange([monthFirstDay, monthLastDay]);
  }, [monthCache]);

  // 登入畫面，先取得部門清單跟專案清單
  useEffect(() => {
    getDepartMemberList();
    getProjecstList();
    const currentDate = new Date();
    const currentMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth()
    );
    const thisMonth = formatDate(currentMonth).slice(5, 7);
    navigateWithParams(0, 0, { month: thisMonth }, false);
  }, []);

  // 得到施工清單，但這個會隨著派工更改，所以需要有重抓依賴項。
  useEffect(() => {
    console.log("reGetSummaryListData", reGetSummaryListData);
    if (reGetSummaryListData) {
      getConstructionSummaryList();
      console.log("打summmary");
      setReGetSummaryListData(false);
    }
  }, [reGetSummaryListData]);

  // 當面板傳了日期回來時會更新，會重新得到本月，求timesheet/(本月)的派工資訊
  // 求完會在 monthCache 記住求過這個月了
  // useEffect(() => {
  //   console.log(dateList);
  // }, [dateList]);

  useEffect(() => {
    console.log("有因為datalist所以蟲跑嗎", dateList);
    let calendarYearMonth = "";
    if (calendaryearsValue) {
      calendarYearMonth = `${calendaryearsValue}/${monthValue}`;
    } else {
      calendarYearMonth = format(
        new Date(today.getFullYear(), today.getMonth(), 1),
        "yyyy/MM",
        { locale: zhTW }
      );
    }
    console.log("monthCache",monthCache)
    console.log("calendarYearMonth",calendarYearMonth)
    console.log("monthCache",monthCache)
    if (
      monthCache &&
      !monthCache.has(calendarYearMonth) &&
      dateList.length > 0 &&
      !!constructionSummaryList.length > 0
    ) {
      console.log("有跑這邊嗎")
      getCalendarData(calendarYearMonth);
      setMonthCache((prev) => new Set(prev.add(calendarYearMonth)));
    }
  }, [dateList, constructionSummaryList, reGetCalendarData]);

  // useEffect(() => {
  //   console.log("monthCache", monthCache);
  //   const calendarRef = {
  //     current: {
  //       calendar: {
  //         currentData: {
  //           viewTitle: `${calendaryearsValue}年${monthValue}月`,
  //         },
  //       },
  //     },
  //   };
  //   handleNextPreviousClick(calendarRef);
  // }, [monthCache]);
  

  // 點擊月曆的上個月下個月後，從calendarRef撈出年月，格式如2024年1月
  const handleNextPreviousClick = (calendarRef) => {
    const monthAndYears = calendarRef.current.calendar.currentData.viewTitle;
    const regex = /(\d+)年(\d+)月/;
    const match = monthAndYears.match(regex);
    console.log("handleClickeNextMonth match", match);
    if (!!match) {
      console.log("有match");
      const year = match[1];
      const month = match[2].length < 2 ? "0" + match[2] : match[2];
      const monthFirstDay = `${year}-${month}-01`;
      // const tempMonthEnd = new Date(thisMonthstart).
      const rowFirstDate = new Date(monthFirstDay);
      const monthLastDay = format(
        new Date(rowFirstDate.getFullYear(), rowFirstDate.getMonth() + 1, 0),
        "yyyy-MM-dd",
        {
          locale: zhTW,
        }
      );
      // setCalendarMonthRange([monthFirstDay, monthLastDay]);
      console.log("!monthCache)", !monthCache.has(`${year}/${month}`));
      console.log("monthCache", monthCache);
      console.log("year", year);
      console.log("month", month);
      navigateWithParams(0, 0, { month: month }, false);
      if (!monthCache.has(`${year}/${month}`)) {
        console.log("有跑新的log");
        let currentDateIterator = new Date(monthFirstDay);
        let dates = [];
        while (currentDateIterator <= new Date(monthLastDay)) {
          dates.push(currentDateIterator.toISOString().slice(0, 10));
          currentDateIterator.setDate(currentDateIterator.getDate() + 1);
        }
        setDateList((prev) => [...prev, ...dates]);
        console.log("...dates", dates);
      }
    }
  };

  // 用來對取得的 since 跟 until 求F的區間全部日期
  const SummaryDatePeriod = (since, until) => {
    let summaryDates = [];
    if (!!since && !!until) {
      let sinceDate = new Date(since);
      while (sinceDate <= new Date(until)) {
        summaryDates.push(sinceDate.toISOString().slice(0, 10));
        sinceDate.setDate(sinceDate.getDate() + 1);
      }
    }
    return summaryDates;
  };

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}/${month}/${day}`;
  };

  const getCalendarData = (calendarYearMonth) => {
    console.log("getCalendarData");
    setIsLoading(true);
    getData(`timesheet/${calendarYearMonth}`)
      .then((result) => {
        const data = result.result;
        console.log(data);
        const transformData = (data) => {
          return data.map((item) => {
            //第一層是date, summaries
            const { date, summaries } = item;
            //從summaries可能有數個案場，任一個打開的第二層是下列五個屬性
            const simplifiedSummaries = summaries.map((summary) => {
              const {
                id,
                constructionJob,
                name,
                project,
                constructionSummaryJobTasks,
                since,
                until,
              } = summary;
              //從constructionSummaryJobTasks打開的第三層是下列五個屬性
              const simplifiedTasks = constructionSummaryJobTasks.map(
                (task) => {
                  const {
                    id,
                    constructionJobTask,
                    estimatedSince,
                    estimatedUntil,
                    location,
                    remark,
                    constructionSummaryJobTaskDispatches,
                  } = task;

                  const simplifiedDispatches =
                    constructionSummaryJobTaskDispatches
                      .filter((dispatch) => dispatch.date === date) // 过滤出 date 等于给定日期的项
                      .map((dispatch) => {
                        const { id, labourer, date } = dispatch;
                        const { id: labourerId, nickname } = labourer;
                        return {
                          id,
                          labourer: {
                            id: labourerId,
                            nickname,
                          },
                          date,
                        };
                      });
                  return {
                    id,
                    constructionJobTask: {
                      id: constructionJobTask.id,
                      name: constructionJobTask.name,
                    },
                    estimatedSince,
                    estimatedUntil,
                    location,
                    remark,
                    constructionSummaryJobTaskDispatches: simplifiedDispatches,
                  };
                }
              );

              return {
                id,
                name,
                project: {
                  id: project.id,
                  name: project.name,
                },
                summaryJobTasks: simplifiedTasks.sort((a, b) => {
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
                }),
                since,
                until,
              };
            });

            return {
              date,
              summaries: simplifiedSummaries,
            };
          });
        };
        const transformedData = transformData(data);
        const dateSummariesMap = dateList.map((date) => {
          const existingData = transformedData.find(
            (data) => data.date === date
          );

          if (existingData) {
            const newSummaries = existingData.summaries.slice();
            constructionSummaryList.forEach((summary) => {
              if (
                !newSummaries.some(
                  (existingSummary) => existingSummary.id === summary.id
                )
              ) {
                newSummaries.push({ ...summary, dispatch: "none" });
              }
            });

            return { date, summaries: newSummaries };
          } else {
            const newSummaries = constructionSummaryList.map((summary) => ({
              ...summary,
              dispatch: "none",
            }));

            return { date, summaries: newSummaries };
          }
        });

        const filterTransformedData = dateSummariesMap
          .map((oneday) => {
            return {
              date: oneday.date,
              summaries: oneday?.summaries?.filter((sum) =>
                SummaryDatePeriod(sum.since, sum.until).includes(oneday.date)
              ),
            };
          })
          .filter((oneday) => oneday.summaries.length > 0);

        const events = filterTransformedData.flatMap((item) => {
          return item.summaries.map((summary) => {
            return {
              title: summary.project.name,
              start: item.date,
              extendedProps: summary,
            };
          });
        });

        console.log("filterTransformedData", filterTransformedData);
        setConstSummaryApiList((prev) => [...prev, ...filterTransformedData]);

        const oneDayTotal = filterTransformedData.filter(
          (list) =>
            list.date === reGetCalendarData ||
            list.date === reGetSummaryListData
        );
        if (oneDayTotal.length > 0) {
          console.log("這邊有重設嗎")
          setDeliverInfo(oneDayTotal[0]);
        }
        setSendBackFlag(false)
        setReGetCalendarData(null);
        setReGetSummaryListData(null);
        setIsEventModalOpen(true);
        setEvents((prev) => [...prev, ...events]);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  };
  useEffect(() => {
    console.log("deliverInfo", deliverInfo);
  }, [deliverInfo]);

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

  const getConstructionSummaryList = useCallback(() => {
    const summaryList = `constructionSummary?p=1&s=5000`;
    getData(summaryList).then((result) => {
      const filterList = result.result.content.map((data) => {
        const {
          id,
          name,
          constructionJob,
          project,
          constructionSummaryJobTasks,
          since,
          until,
        } = data;
        const modifiedSummaryJobTasks = constructionSummaryJobTasks
          ? constructionSummaryJobTasks.map((task) => ({
              ...task,
              constructionSummaryJobTaskDispatches: [],
            }))
          : [];
        return {
          id,
          constructionJob,
          name,
          project,
          summaryJobTasks: modifiedSummaryJobTasks
            ? modifiedSummaryJobTasks.sort((a, b) => {
                if (a.estimatedSince && !b.estimatedSince) {
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
                return 0;
              })
            : [],
          since,
          until,
        };
      });
      setConstructionSummaryList((prev) => [...prev, ...filterList]);
    });
  }, []);

  const handleEventClick = (date) => {
    if (!!constSummaryApiList) {
      const oneDayTotal = constSummaryApiList.filter(
        (list) => list.date === date
      );
      if (!!oneDayTotal) {
        setDeliverInfo(oneDayTotal[0]);
        setIsEventModalOpen(true);
      }
    }
  };

  const handleDayClick = (date) => {
    handleEventClick(date);
  };

  const sendDataToBackend = (fd, mode, otherData) => {
    setSendBackFlag(true);
    let url = "";
    let message = [];
    switch (mode) {
      case "create":
        url = "constructionSummary";
        message = ["清單新增成功！"];
        break;
      default:
        break;
    }
    if (mode === "create") {
      postData(url, fd).then((result) => {
        if (result.status) {
          setReGetSummaryListData(true);
          setConstructionSummaryList([]);
          showNotification(message[0], true);
          getConstructionSummaryList([]);
          onClose();
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
      });
    }
    // for (var pair of fd.entries()) {
    //   console.log(pair);
    // }
  };

  // 當活動按鈕點擊時開啟 modal 並進行動作

  // 關閉 Modal 清除資料
  const onClose = () => {
    setModalValue(false);
    setDeliverInfo(null);
  };

  const getProjecstList = () => {
    getData("project?p=1&s=5000").then((result) => {
      const projectsList = result.result.content;
      setProjectsList(projectsList);
    });
  };

  const handleActionClick = (event) => {
    event.stopPropagation();
    const dataMode = event.currentTarget.getAttribute("data-mode"); //在table的component裡讀取該選擇 如edit create
    setModalValue(dataMode);
  };

  // 檢查表單是否汙染
  const onCheckDirty = () => {
    if (isLoading) {
      setAlertOpen(true);
    }
  };
  // 下面僅關閉汙染警告視窗
  const handleAlertClose = async (agree) => {
    if (agree) {
      setIsLoading(false);
    }
    setAlertOpen(false);
  };

  const modalConfig = [
    {
      modalValue: "create",
      modalComponent: (
        <UpdatedModal
          title="新增施工清單"
          sendDataToBackend={sendDataToBackend}
          onClose={onClose}
          constructionTypeList={constructionTypeList}
          projectsList={projectsList}
          sendBackFlag={sendBackFlag}
        />
      ),
    },
  ];
  const config = modalValue
    ? modalConfig.find((item) => item.modalValue === modalValue)
    : null;

  return (
    <>
      <PageTitle
        title="派工行事曆"
        btnGroup={btnGroup}
        description="此頁面是用於派工，點擊日期及可派工。"
        handleActionClick={handleActionClick}
        isLoading={!isLoading}
      />

      <Calendar
        data={events}
        viewOptions={["dayGridMonth", "dayGridWeek"]}
        _dayMaxEvents={3}
        dateClick={(e) => {
          handleDayClick(e.dateStr);
        }}
        eventClick={(e) => {
          handleEventClick(e.event.startStr);
        }}
        eventContent={(eventInfo) => {
          return <CustomEventContent event={eventInfo.event} />;
        }}
        eventColor={isTargetScreen ? "transparent" : "#F48A64"}
        displayEventTime={false} // 整天
        eventBorderColor={"transparent"}
        eventBackgroundColor={"transparent"}
        eventOrder={""}
        showMonth={true}
        onPreviousClick={(calendarRef) => handleNextPreviousClick(calendarRef)}
        onNextClick={(calendarRef) => handleNextPreviousClick(calendarRef)}
      />

      <EventModal
        title="施工清單修改"
        deliverInfo={deliverInfo}
        departMemberList={departMemberList}
        onClose={onClose}
        constructionTypeList={constructionTypeList}
        isOpen={isEventModalOpen}
        setReGetCalendarData={setReGetCalendarData}
        setReGetSummaryListData={setReGetSummaryListData}
        constructionSummaryList={constructionSummaryList}
        sendBackFlag={sendBackFlag}
        setSendBackFlag={setSendBackFlag}
        setMonthCache={setMonthCache}
        setEvents={setEvents}
        setDateList={setDateList}
        setConstSummaryApiList={setConstSummaryApiList}
        setConstructionSummaryList={setConstructionSummaryList}
        handleNextPreviousClick={handleNextPreviousClick}
      />
      {/* Modal */}
      {config && config.modalComponent}
      <Backdrop
        sx={{ color: "#fff", zIndex: 1050 }}
        open={isLoading}
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
        content="正在載入中，是否取消載入動畫？"
        disagreeText="返回"
        agreeText="確定"
      />

      {/* PageTitle */}
    </>
  );
};

export default DispatchCalendar;

const CustomEventContent = ({ event }) => {
  const isTargetScreen = useMediaQuery("(max-width:991.98px)");
  const extendedProps = event._def.extendedProps;
  const noDispatched = extendedProps.hasOwnProperty("dispatch");
  const targetId = extendedProps?.id[17];
  const selectedColor = calendarColorList.find((item) => item.id === targetId);

  return (
    <>
      <div>
        {isTargetScreen ? (
          <div className="mt-1">
            <div
              className={`text-center w-full text-lg ${
                noDispatched && "text-sm m-0 p-0"
              }`}
            >
              <span className=" w-full rounded-md">
                {extendedProps.project.name}
              </span>
            </div>
            {!noDispatched &&
              extendedProps.summaryJobTasks.map((summaryJobTask) => (
                <div key={summaryJobTask.id} className="">
                  <div className={`m-1 p-1 text-center relative`}>
                    <span
                      className={`whitespace-nowrap text-base text-neutral-400 ${
                        noDispatched && "text-sm m-0 p-0"
                      }`}
                    >
                      {`[${summaryJobTask.constructionJobTask.name}]`}
                    </span>
                    <span className="cursor-pointer absolute right-0 top-0.5"></span>
                  </div>
                  <div className="m-1 text-center align-middle">
                    {summaryJobTask.constructionSummaryJobTaskDispatches
                      .length > 0
                      ? summaryJobTask.constructionSummaryJobTaskDispatches.map(
                          (dispatch, index) => (
                            <span className="ms-1" key={"0" + index}>
                              {dispatch.labourer.nickname}
                            </span>
                          )
                        )
                      : null}
                  </div>
                </div>
              ))}
          </div>
        ) : (
          // 在PC螢幕上，如果有dispatch:none這個屬性(我額外添加的，代表沒有被派工，顏色不同)
          <p
            className={`px-2 text-ellipsis overflow-hidden rounded-sm  cursor-pointer ${
              extendedProps?.dispatch
                ? " bg-gray-200 text-gray-500"
                : `${selectedColor?.fortw} text-white`
            } `}
          >
            <Tooltip
              describeChild={true}
              className="z-[3000]"
              componentsProps={{
                tooltip: {
                  sx: {
                    padding: "0",
                    zIndex: "3000",
                  },
                },
              }}
              placement="right-start"
              title={extendedProps.summaryJobTasks.map(
                (summaryJobTask, index) => (
                  <div key={index + summaryJobTask.id} className="">
                    {summaryJobTask.constructionSummaryJobTaskDispatches
                      .length > 0 &&
                      summaryJobTask.constructionSummaryJobTaskDispatches.map(
                        (dispatch, index) => (
                          <span className="text-lg px-2 " key={index}>
                            {dispatch.labourer.nickname}
                            <br />
                          </span>
                        )
                      )}
                  </div>
                )
              )}
            >
              <span>
                {event.title}-{extendedProps.name}
              </span>
            </Tooltip>
          </p>
        )}
      </div>
    </>
  );
};
