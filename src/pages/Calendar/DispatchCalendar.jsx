import { useState, useEffect, useCallback, useRef } from "react";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid"; // a plugin!
import interactionPlugin from "@fullcalendar/interaction";
// import "./calendar.css";
import constructionTypeList from "../../data/constructionTypes";

import PageTitle from "../../components/Guideline/PageTitle";
import FloatingActionButton from "../../components/FloatingActionButton/FloatingActionButton";
import TableTabber from "../../components/Tabbar/TableTabber";
import RWDTable from "../../components/RWDTable/RWDTable";
import Pagination from "../../components/Pagination/Pagination";
import AddIcon from "@mui/icons-material/Add";
import FolderCopyIcon from "@mui/icons-material/FolderCopy";
import WorkHistoryIcon from "@mui/icons-material/WorkHistory";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import EditIcon from "@mui/icons-material/Edit";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import { getData, postData } from "../../utils/api";
import { EventModal } from "./CalendarModal";
import { useNotification } from "../../hooks/useNotification";
import {
  Loading,
  LoadingFour,
  LoadingThree,
} from "../../components/Loader/Loading";
import Calendar from "../../components/Calendar/Calendar";
import { Backdrop, useMediaQuery } from "@mui/material";

const today = new Date();

const DispatchCalendar = () => {
  
  const [isLoading, setIsLoading] = useState(true);
  const showNotification = useNotification();
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  // API List Data
  const [apiData, setApiData] = useState(null);
  const [constSummaryApiList, setConstSummaryApiList] = useState(null);
  const [departMemberList, setDepartMemberList] = useState(null);
  const [events, setEvents] = useState([]);

  // 用日期改變作為重打api的依據，為了在面板修改派工後可以重取api並將對應的日期資料傳給面板
  const [reGetCalendarApi, setReGetCalendarApi] = useState(today);

  // isLoading 等待請求 api
  // Page 頁數設置
  const [page, setPage] = useState(0);
  // rows per Page 多少筆等同於一頁
  const [rowsPerPage, setRowsPerPage] = useState(100);
  // ApiUrl
  // const furl = "site";
  // const apiUrl = `${furl}?p=${page + 1}&s=${rowsPerPage}`;
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

  // const calendarRef = useRef(null);

  useEffect(() => {
    if (!!reGetCalendarApi) {
      //console.log("calendar有打七天派工api", reGetCalendarApi);

      getCalendarData();
    }
    //else console.log("reGetCalendarApi為false, 沒打七天派工api");
  }, [reGetCalendarApi]);

  useEffect(() => {
    getDepartMemberList("11");
  }, []);

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

              // if (simplifiedDispatches.length > 0) {
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
              // } else {
              //   return null;
              // }
            });
            // const filteredTasks = simplifiedTasks.filter(
            //   (task) => task !== null
            // );

            return {
              id,
              constructionJob: {
                id: constructionJob.id,
                Type: constructionJob.Type,
                name: constructionJob.name,
              },
              name,
              project: {
                id: project.id,
                name: project.name,
              },
              summaryJobTasks: simplifiedTasks,
            };
          });

          return {
            date,
            summaries: simplifiedSummaries,
          };
        });
      };
      const transformedData = transformData(data);
      console.log(transformedData);
      // console.log(transformedData);

      const events = transformedData.flatMap((item) => {
        return item.summaries.map((summary) => {
          return {
            title: summary.project.name,
            start: item.date,
            extendedProps: summary,
          }; //, summaries: summary
        });
      });
      setConstSummaryApiList(transformedData);
      // console.log("取得七天派工api後並轉換的transformedData", transformedData);
      //console.log("reGetCalendarApi", reGetCalendarApi);

      const oneDayTotal = transformedData.filter(
        (list) => list.date === reGetCalendarApi
      );
      if (oneDayTotal.length > 0) {
        setDeliverInfo(oneDayTotal[0]);
        //console.log("有成功重設oneDayTotal", oneDayTotal);
      } else {
        //console.log("沒有成功重設oneDayTotal", oneDayTotal);
      }
      setReGetCalendarApi(null);
      setIsEventModalOpen(true);
      console.log("events", events);
      setEvents(events);
      setIsLoading(false);
    });
  };

  const getDepartMemberList = useCallback((id) => {
    const departMemberList = `department/${id}/staff`;
    getData(departMemberList).then((result) => {
      const filterList = result.result.map((data) => {
        const { id, nickname, department } = data;
        return { id, nickname, department };
      });
      setDepartMemberList(filterList);
    });
  }, []);

  // 傳遞給後端資料
  const sendDataToBackend = (fd, mode, otherData) => {
    console.log("觸發sendDataToBackend");
    // let url = "";
    // let message = [];
    // switch (mode) {
    // 	case "create":
    // 		url = furl;
    // 		message = ["案場新增成功！"];
    // 		break;
    // 	case "edit":
    // 		url = furl + "/" + otherData;
    // 		message = ["案場編輯成功！"];
    // 		break;
    // 	case "dw":
    // 		url = furl + "/" + otherData[0] + "/" + otherData[1];
    // 		message = ["明日派工指定成功！"];
    // 		break;
    // 	default:
    // 		break;
    // }
    // postData(url, fd).then((result) => {
    // 	if (result.status) {
    // 		showNotification(message[0], true);
    // 		getApiList(apiUrl);
    // 		onClose();
    // 	} else {
    // 		showNotification(result.result.reason ? result.result.reason : "權限不足", false);
    // 	}
    // });

    // for (var pair of fd.entries()) {
    // 	console.log(pair);
    // }
  };

  const handleEventClick = (e) => {
    if (!!constSummaryApiList) {
      const oneDayTotal = constSummaryApiList.filter(
        (list) => list.date === e.event.startStr
      );
      if (oneDayTotal.length > 0) {
        setDeliverInfo(oneDayTotal[0]);
      } else {
        setDeliverInfo(null);
      }
      setIsEventModalOpen(true);
    }
  };
  const handleDayClick = (e) => {
    if (!!constSummaryApiList) {
      const oneDayTotal = constSummaryApiList.filter(
        (list) => list.date === e.dateStr
      );
      if (oneDayTotal.length > 0) {
        setDeliverInfo(oneDayTotal[0]);
      } else {
        setDeliverInfo(null);
      }
      setIsEventModalOpen(true);
    }
  };

  useEffect(() => {
    if (deliverInfo) {
      console.log("點擊單一日期後傳給面板的deliverInfo", deliverInfo);
    }
  }, [deliverInfo]);

  // 當活動按鈕點擊時開啟 modal 並進行動作
  const handleActionClick = (event) => {
    // event.stopPropagation();
    // const dataMode = event.currentTarget.getAttribute("data-mode");
    // const dataValue = event.currentTarget.getAttribute("data-value");
    // setModalValue(dataMode);
    // setDeliverInfo(
    //   dataValue ? apiData.find((item) => item.id === dataValue) : ""
    // );
    // if (dataMode === "outputList") {
    //   setDeliverInfo(apiData);
    // }
  };

  // 關閉 Modal 清除資料
  const onClose = () => {
    setModalValue(false);
    setDeliverInfo(null);
  };

  // modal 開啟參數與顯示標題
  // const modalConfig = [
  //   {
  //     modalValue: "edit",
  //     modalComponent: (
  //       <CalendarModal
  //         title="施工清單修改"
  //         deliverInfo={deliverInfo}
  //         sendDataToBackend={sendDataToBackend}
  //         onClose={onClose}
  //         constructionTypeList={constructionTypeList}
  //         // projectsList={projectsList}
  //       />
  //     ),
  //   },
  // ];
  // const config = modalValue
  //   ? modalConfig.find((item) => item.modalValue === modalValue)
  //   : null;

  return (
    <>
      {/* PageTitle */}

      <PageTitle
        title="派工行事曆"
        btnGroup={btnGroup}
        handleActionClick={handleActionClick}
        isLoading={!isLoading}
      />
      {/* {console.log("constSummaryApiList",constSummaryApiList)} */}
      <div className="flex justify-center p-5 w-full h-full overflow-y-auto ">
        <div className="relative flex flex-col flex-1 overflow-y-auto ">
          <Calendar
            data={events}
            viewOptions={["dayGridMonth", "dayGridWeek"]}
            _dayMaxEvents={3}
            dateClick={(e) => {
              handleDayClick(e);
              console.log("day.e", e);
            }}
            eventClick={(e) => {
              handleEventClick(e);
            }}
            editable={true}
            eventContent={(eventInfo) => (
              <CustomEventContent event={eventInfo.event} />
            )}
            eventColor={'transparent'}
            height="auto"
            displayEventTime={false}
            
          />
          {/* <FullCalendar
            // ref={calendarRef}
            plugins={[dayGridPlugin, interactionPlugin]}
            headerToolbar={{
              // left: "myCustomButton prev,today,next",
              left: "prev,today,next",
              center: "title",
              right: "dayGridMonth,dayGridWeek", //
            }}
            buttonText={{
              today: "current",
              month: "month",
              week: "week",
              day: "day",
              list: "list",
            }}
            initialView="dayGridMonth"
            editable={true} //目前只知可以讓event變cursor point
            selectable={true}
            //selectMirror={true}
            dayMaxEvents={true} //當同格有超多event 會變成+3+4..
            //weekends={weekendsVisible}
            events={events}
            // select={handleDateSelect}
            // eventContent={renderEventContent} // custom render function
            eventClick={(e) => handleEventClick(e)}
            //eventsSet={() => handleEvents(events)}
            eventResize={""}
            dateClick={handleDayClick}

          /> */}
        </div>
      </div>
      <Backdrop
        sx={{ color: "#fff", zIndex: 1050 }}
        open={isLoading}
        // onClick={onCheckDirty}
      >
        <LoadingThree size={40} />
      </Backdrop>
      <EventModal
        title="施工清單修改"
        deliverInfo={deliverInfo}
        departMemberList={departMemberList}
        sendDataToBackend={sendDataToBackend}
        onClose={onClose}
        constructionTypeList={constructionTypeList}
        // projectsList={projectsList}
        isOpen={isEventModalOpen}
        setReGetCalendarApi={setReGetCalendarApi}
      />
      {/* Modal */}
      {/* {config && config.modalComponent} */}
    </>
  );
};

export default DispatchCalendar;

const CustomEventContent = ({ event }) => {
  const isTargetScreen = useMediaQuery("(max-width:991.98px)");
  const extendedProps = event._def.extendedProps;
  // Customize event content here
  return (
    <div className="">
      {isTargetScreen ? (
        <div className="mt-1">
          <div className="text-base text-center w-full rounded-md p-2">
            <span className="text-lg  w-full rounded-md">
              {extendedProps.project.name +
                "-" +
                extendedProps.constructionJob.name}
            </span>
          </div>
          {extendedProps.summaryJobTasks.map((summaryJobTask) => (
            //   jobTask?.constructionSummaryJobTaskDispatches.length === 0 ?
            <div key={summaryJobTask.id} className="">
              <div
                className={` rounded-md 

              `}
              >
                <div className={`m-1 p-1 text-center relative  `}>
                  <span
                    className={`whitespace-nowrap text-base text-neutral-400 `}
                  >
                    {"["}
                    {summaryJobTask.constructionJobTask.name}
                    {"]"}
                  </span>
                  <span className="cursor-pointer absolute right-0 top-0.5"></span>
                </div>
                <div className="m-1 text-center align-middle">
                  {summaryJobTask.constructionSummaryJobTaskDispatches.length >
                  0
                    ? summaryJobTask.constructionSummaryJobTaskDispatches.map(
                        (dispatch, index) => (
                          // <div
                          //   key={dispatch.labourer.id}
                          //   className=" bg-amber-50"
                          // >

                          <span className="ms-1" key={index}>
                            {dispatch.labourer.nickname}
                          </span>
                        )
                      )
                    : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <strong>{event.title}</strong>
      )}
    </div>
  );
};
