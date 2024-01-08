import React, { useState, useEffect, useCallback } from "react";

// import "./calendar.css";
import constructionTypeList from "../../data/constructionTypes";

import PageTitle from "../../components/Guideline/PageTitle";
import AddIcon from "@mui/icons-material/Add";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import { getData, postData } from "../../utils/api";
import { EventModal } from "./CalendarModal";
import { useNotification } from "../../hooks/useNotification";
import { LoadingThree } from "../../components/Loader/Loading";
import Calendar from "../../components/Calendar/Calendar";
import { Backdrop, Tooltip, useMediaQuery } from "@mui/material";
import { UpdatedModal } from "./NewSummaryModal";
import { calendarColorList } from "../../data/calendarColorList";

const today = new Date();
//明天
const twoDaysLater = new Date(today);
twoDaysLater.setDate(today.getDate() + 1);
//五天前
const fiveDaysBefore = new Date(today);
fiveDaysBefore.setDate(today.getDate() - 5);
// 生成日期區間
const dates = [];
let currentDateIterator = new Date(fiveDaysBefore);
while (currentDateIterator <= twoDaysLater) {
  dates.push(currentDateIterator.toISOString().slice(0, 10));
  currentDateIterator.setDate(currentDateIterator.getDate() + 1);
}

const DispatchCalendar = () => {
  const isTargetScreen = useMediaQuery("(max-width:991.98px)");
  const [isLoading, setIsLoading] = useState(true);
  const showNotification = useNotification();
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [departMemberList, setDepartMemberList] = useState(null);

  // 儲存整理完的(七天)派工人員清單 + 全部施工清單過濾之後的全部，events會用這個下去做日期分類
  const [constSummaryApiList, setConstSummaryApiList] = useState(null);
  const [events, setEvents] = useState([]);

  // 在上面全域指派了幾天前幾天後，並儲存那些天數的陣列
  const [dateList, setDateList] = useState([]);

  // 新增施工清單的按鈕，要傳遞求得的全部專案新增面板
  const [projectsList, setProjectsList] = useState(null);

  // 用日期改變作為重打api的依據，為了在面板修改派工後可以重取api並將對應的日期資料傳給面板
  const [reGetCalendarData, setReGetCalendarData] = useState(today); // 派工用這個重取資料
  const [reGetSummaryListData, setReGetSummaryListData] = useState(today); // 修改工項執行用這個重取資料

  // 儲存api求得的施工清單總攬
  const [constructionSummaryList, setConstructionSummaryList] = useState(null);

  const [sendBackFlag, setSendBackFlag] = useState(false);

  // ModalValue 控制開啟的是哪一個 Modal
  const [modalValue, setModalValue] = useState(false);
  // 傳送額外資訊給 Modal
  const [deliverInfo, setDeliverInfo] = useState(null);

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

  // 當面板傳了日期回來時會更新
  useEffect(() => {
    if (dateList && constructionSummaryList) {
      getCalendarData();
    }
  }, [dateList, constructionSummaryList, reGetCalendarData]);

  useEffect(() => {
    getDepartMemberList("11");
    getProjecstList();
  }, []);

  useEffect(() => {
    getConstructionSummaryList();
  }, [reGetSummaryListData]);

  useEffect(() => {
    setDateList(dates);
  }, []);

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

  const getCalendarData = () => {
    getData("timesheet").then((result) => {
      const data = result.result;
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
            const simplifiedTasks = constructionSummaryJobTasks.map((task) => {
              const {
                id,
                constructionJobTask,
                estimatedSince,
                estimatedUntil,
                location,
                remark,
                constructionSummaryJobTaskDispatches,
              } = task;

              const simplifiedDispatches = constructionSummaryJobTaskDispatches
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
            });

            return {
              id,
              constructionJob: {
                id: constructionJob.id,
                constructionType: constructionJob.constructionType,
                name: constructionJob.name,
              },
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
        const existingData = transformedData.find((data) => data.date === date);

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

      //這個就是取得7天派工的整理精華+ 全部清單清空派工人員
      setConstSummaryApiList(filterTransformedData);

      const oneDayTotal = filterTransformedData.filter(
        (list) =>
          list.date === reGetCalendarData || list.date === reGetSummaryListData
      );
      if (oneDayTotal.length > 0) {
        setDeliverInfo(oneDayTotal[0]);
      }

      setReGetCalendarData(null);
      setReGetSummaryListData(null);
      setIsEventModalOpen(true);
      setEvents(events);
      setIsLoading(false);
    });
  };

  const getDepartMemberList = useCallback((id) => {
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
      setConstructionSummaryList(filterList);
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
          setConstructionSummaryList(null);
          showNotification(message[0], true);
          getConstructionSummaryList();
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

  const handleDayClick = (date) => {
    handleEventClick(date);
  };

  // 當活動按鈕點擊時開啟 modal 並進行動作

  // 關閉 Modal 清除資料
  const onClose = () => {
    setModalValue(false);
    setDeliverInfo(null);
  };

  const getProjecstList = () => {
    getData("project").then((result) => {
      const projectsList = result.result.content;
      //console.log(projectsList);
      setProjectsList(projectsList);
    });
  };

  const handleActionClick = (event) => {
    event.stopPropagation();
    const dataMode = event.currentTarget.getAttribute("data-mode"); //在table的component裡讀取該選擇 如edit create
    setModalValue(dataMode);
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
      {/* PageTitle */}

      <PageTitle
        title="派工行事曆"
        btnGroup={btnGroup}
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
      />
      <Backdrop sx={{ color: "#fff", zIndex: 1050 }} open={isLoading}>
        <LoadingThree size={40} />
      </Backdrop>
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
      />
      {/* Modal */}
      {config && config.modalComponent}
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
                {extendedProps.project.name +
                  "-" +
                  extendedProps.constructionJob.name}
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
