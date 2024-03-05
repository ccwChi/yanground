import React, { useEffect } from "react";
import { useState } from "react";
import {
  LoadingFour,
  LoadingThree,
  LoadingTwo,
} from "../../components/Loader/Loading";
import {
  Autocomplete,
  Backdrop,
  CircularProgress,
  TextField,
  Tooltip,
  useMediaQuery,
} from "@mui/material";
import PageTitle from "../../components/Guideline/PageTitle";
import Calendar from "../../components/Calendar/Calendar";
import StaffRosterModal from "./StaffRosterModal";
import MultipleFAB from "../../components/FloatingActionButton/MultipleFAB";
import AddLinkIcon from "@mui/icons-material/AddLink";
import { deleteData, getData, postData } from "../../utils/api";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import useLocalStorageValue from "../../hooks/useLocalStorageValue";
import { format } from "date-fns";
import { zhTW } from "date-fns/locale";
import { useNotification } from "../../hooks/useNotification";
import InputTitle from "../../components/Guideline/InputTitle";
import useNavigateWithParams from "../../hooks/useNavigateWithParams";

const today = new Date();
const fromTodaySevenDay = [];
for (var i = 0; i < 7; i++) {
  const newDate = new Date(today);
  newDate.setDate(today.getDate() + i);
  const newDayString = newDate.toISOString().slice(5, 10).replace("-", "/");
  fromTodaySevenDay.push(newDayString);
}

const StaffRoster = () => {
  const [isLoading, setIsLoading] = useState(false);

  /** ModalValue 控制開啟的是哪一個 Modal */
  const [modalValue, setModalValue] = useState(false);

  /** 傳送額外資訊給 Modal */
  const [isOpen, setIsOpen] = useState(false);

  /** 儲存部門、部門人員清單 */
  const [departmentList, setDepartmentList] = useState([]);

  /** 取得所有人的排休清單 */
  const [allAttendanceList, setAllattendanceList] = useState([]);

  /** 紀錄月份，為了lazyloading不重複取 */
  const [monthCache, setMonthCache] = useState(new Set());

  /** 紀錄目前月曆的月份，並求得本月第一天跟最後一天 */
  const [calendarMonthRange, setCalendarMonthRange] = useState([]);

  /** 送出 api 後，重打排休清單的標記 */
  const [reload, setReload] = useState(true);

  // SearchDialog Switch
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);

  // 人員清單
  const [usersList, setUsersList] = useState([]);

  const [events, setEvents] = useState([]);
  const showNotification = useNotification();

  // 解析網址取得參數
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const depValue = queryParams.get("dep");
  const navigate = useNavigate();
  const navigateWithParams = useNavigateWithParams();

  /** 用 localstorage 的資訊確定是不是人資部，然後決定可以看單一部門還是全部部門 */
  const userProfile = useLocalStorageValue("userProfile");

  useEffect(() => {
    if (userProfile) {
      const containsHR = userProfile.authorities.some(
        (item) => item.id === "5" || item.role === "41"
      );
      if (containsHR) {
        /** 如果給人資部門，現在給全部的部門，理論上給有排班人員的部門就好 31人資 29法務 */
        getData("department").then((result) => {
          const data = result.result.content;
          const formattedDep = data.map((dep) => ({
            label: dep.name,
            id: dep.id,
          }));
          setDepartmentList(formattedDep);
          console.log("setDepartmentList", data);
        });
      } else if (!containsHR) {
        // 如果不是人資部門，部門清單只會有自己部門
        setDepartmentList([userProfile.department]);
      }
    }
  }, [userProfile]);

  /** 先行判斷今天後，取得這個月的最後一天跟第一天 */
  useEffect(() => {
    if (reload) {
      const today = new Date();
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
      setCalendarMonthRange([monthFirstDay, monthLastDay]);
      setReload(false);
    }
  }, [reload]);

  /** 取得這個月全部的排休資料 */
  useEffect(() => {
    const alreadyget =
      calendarMonthRange?.[0] && calendarMonthRange[0].slice(0, 7);
    const year = calendarMonthRange?.[0] && calendarMonthRange[0].slice(0, 4);
    const month = calendarMonthRange?.[0] && calendarMonthRange[0].slice(5, 7);
    console.log("monthCache", monthCache);
    if (
      monthCache &&
      !monthCache.has(alreadyget) &&
      calendarMonthRange.length > 0
    ) {
      setIsLoading(true);
      getData(`arrangedLeave/${year}/${month}`).then((result) => {
        const rawData = result.result
          .map(({ anomaly, date, id, since, until, user }, i) => ({
            title: user.nickname + " - " + user.department.name,
            date,
            id,
            color: "#25B09B",
            user: {
              id: user.id,
              nickname: user.nickname,
              fullName: user.lastname + user.firstname,
              department: user.department.name,
              departmentId: user.department.id,
            },
          }))
          .sort((a, b) => {
            if (a.date > b.date) {
              return 1;
            }
            if (a.date < b.date) {
              return -1;
            }
            return 0;
          });

        setAllattendanceList((prev) => [...prev, ...rawData]);
        setMonthCache((prev) => new Set(prev.add(alreadyget)));
        setIsLoading(false);
      });
    }
  }, [calendarMonthRange]);

  // 用全部的資料來過濾網址已有的篩選條件
  useEffect(() => {
    setEvents(allAttendanceList);
    let tempShowData = allAttendanceList;
    if (depValue !== null) {
      tempShowData = tempShowData.filter((event) => {
        return event.user.departmentId === depValue;
      });
    }
    setEvents(tempShowData);
  }, [depValue, allAttendanceList]);

  const sendDataToBackend = (fd, mode, otherdata) => {
    setIsLoading(true);
    let url = "";
    let message = "";
    switch (mode) {
      case "remove":
        url = `user/${otherdata[0]}/arrangedLeave/${otherdata[1]}/${otherdata[2]}`;
        message = "清除當月排休成功";
        break;
      case "update":
        url = `user/${otherdata[0]}/arrangedLeave`;
        message = "建立排休成功";
        break;
      default:
        break;
    }
    if (mode === "update") {
      postData(url, fd).then((result) => {
        if (result.status) {
          showNotification(message, true);
          setIsOpen(false);
          setMonthCache(new Set());
          setAllattendanceList([]);
          setCalendarMonthRange([]);
          setReload(true);
          setIsLoading(false);
        } else {
          showNotification(
            result.result.reason
              ? result.result.reason
              : result.result
              ? result.result
              : "發生無法預期的錯誤，請洽資訊部。",
            false
          );
        }
        setIsLoading(false);
      });
    } else if (mode === "remove") {
      deleteData(url).then((result) => {
        if (result.status) {
          showNotification(message, true);
          setIsOpen(false);
          setMonthCache(new Set());
          setAllattendanceList([]);
          setCalendarMonthRange([]);
          setReload(true);
          setIsLoading(false);
        } else {
          showNotification(
            result.result.reason
              ? result.result.reason
              : result.result
              ? result.result
              : "發生無法預期的錯誤，請洽資訊部。",
            false
          );
        }
        setIsLoading(false);
      });
    }
  };

  // Button Group
  const btnGroup = [
    {
      mode: "buildStaffRoster",
      icon: <AddLinkIcon fontSize="small" />,
      text: "設定員工排休",
      variant: "contained",
      color: "primary",
      fabVariant: "success",
      fab: <AddLinkIcon />,
    },
  ];

  // 當活動按鈕點擊時動作
  const handleActionClick = (event) => {
    event.stopPropagation();
    const dataMode = event.currentTarget.getAttribute("data-mode");
    setModalValue(dataMode);
    setIsOpen(true);
  };

  const handleNextPreviousClick = (calendarRef) => {
    console.log("calendarRef", calendarRef);
    const monthAndYears = calendarRef.current.calendar.currentData.viewTitle;
    console.log("monthAndYears", monthAndYears);
    const regex = /(\d+)年(\d+)月/;
    const match = monthAndYears.match(regex);
    if (match) {
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
      console.log("[monthFirstDay, monthLastDay]", [
        monthFirstDay,
        monthLastDay,
      ]);
      setCalendarMonthRange([monthFirstDay, monthLastDay]);
    }
  };

  // modal 開啟參數與顯示標題
  const modalConfig = [
    {
      modalValue: "buildStaffRoster",
      modalComponent: (
        <StaffRosterModal
          setIsOpen={setIsOpen}
          isOpen={isOpen}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          departmentList={departmentList}
          deliverInfo={userProfile}
          allAttendanceList={allAttendanceList}
          calendarMonthRange={calendarMonthRange}
          setCalendarMonthRange={setCalendarMonthRange}
          handleNextPreviousClick={handleNextPreviousClick}
          sendDataToBackend={sendDataToBackend}
        />
      ),
    },
  ];
  const config = modalValue
    ? modalConfig.find((item) => item.modalValue === modalValue)
    : null;

  // 開啟 SearchDialog
  const handleOpenSearch = () => {
    setSearchDialogOpen(true);
  };
  // 關閉 SearchDialog
  const handleCloseSearch = () => {
    setSearchDialogOpen(false);
  };

  return (
    <>
      <>
        <PageTitle
          title="排休月曆表"
          btnGroup={btnGroup}
          handleActionClick={handleActionClick}
          description="此頁面僅提供給人資及各部門主管查看、編輯同部門員工排休值勤表。"
          // 搜尋模式
          searchMode
          // 下面參數前提都是 searchMode = true
          searchDialogOpen={searchDialogOpen}
          handleOpenDialog={handleOpenSearch}
          handleCloseDialog={handleCloseSearch}
          handleCloseText={"關閉"}
          isdirty={depValue}
        >
          <div className="relative flex flex-col item-start sm:items-center gap-3">
            <div className="inline-flex items-center w-full gap-2">
              <InputTitle
                title={"部門"}
                pb={false}
                required={false}
                classnames="whitespace-nowrap"
              />
              <Autocomplete
                options={departmentList}
                className="flex-1"
                value={
                  departmentList?.find((obj) => obj.id === depValue) || null
                }
                onChange={(event, newValue, reason) => {
                  if (reason === "clear") {
                    if (
                      window.confirm(
                        "確定清空部門欄位？"
                      )
                    ) {
                      const newParams = new URLSearchParams(
                        window.location.search
                      );
                      newParams.delete("dep");
                      navigate(`?${newParams.toString()}`);
                    }
                  } else {
                    navigateWithParams(0, 0, { dep: newValue.id }, false);
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    className="inputPadding bg-white"
                    placeholder="請選擇部門"
                    sx={{ "& > div": { padding: "0 !important" } }}
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {departmentList.length <= 0 ? (
                            <CircularProgress
                              className="absolute right-[2.325rem]"
                              size={20}
                            />
                          ) : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
                loading={departmentList.length <= 0}
                loadingText={"載入中..."}
              />
            </div>
          </div>
        </PageTitle>

        {allAttendanceList.length === 0 && departmentList.lenth === 0 ? (
          <>
            <LoadingThree size={40} />
          </>
        ) : (
          <Calendar
            data={events}
            viewOptions={["dayGridMonth"]}
            weekNumbers={false}
            _dayMaxEvents={3}
            navLinks={false}
            customInitialView={true}
            eventBorderColor={"transparent"}
            eventBackgroundColor={"transparent"}
            eventOrder={""}
            showMonth={true}
            onPreviousClick={(calendarRef) =>
              handleNextPreviousClick(calendarRef)
            }
            onNextClick={(calendarRef) => handleNextPreviousClick(calendarRef)}
            eventContent={(eventInfo) => {
              return (
                <Tooltip title={eventInfo.event._def.title}>
                  <div className="px-1.5 py-0.5 text-ellipsis whitespace-nowrap overflow-hidden cursor-pointer">
                    {eventInfo.event._def.title}
                  </div>
                </Tooltip>
              );
            }}
          />
        )}
        {/* FAB */}
        <MultipleFAB
          btnGroup={btnGroup}
          handleActionClick={handleActionClick}
        />
        {/* Modal */}
        {config && config.modalComponent}
        <Backdrop sx={{ color: "#fff", zIndex: 3000 }} open={isLoading}>
          <LoadingThree size={40} />
        </Backdrop>
      </>

      {/* PageTitle */}
    </>
  );
};

export default StaffRoster;
