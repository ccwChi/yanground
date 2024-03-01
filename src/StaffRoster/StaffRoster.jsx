import React, { useEffect } from "react";
import { useState } from "react";
import {
  LoadingFour,
  LoadingThree,
  LoadingTwo,
} from "../components/Loader/Loading";
import { Backdrop, useMediaQuery } from "@mui/material";
import PageTitle from "../components/Guideline/PageTitle";
import Calendar from "../components/Calendar/Calendar";
import StaffRosterModal from "./StaffRosterModal";
import MultipleFAB from "../components/FloatingActionButton/MultipleFAB";
import AddLinkIcon from "@mui/icons-material/AddLink";
import { getData, postData } from "../utils/api";
import { useNavigate } from "react-router-dom";
import useLocalStorageValue from "../hooks/useLocalStorageValue";
import { format } from "date-fns";
import { zhTW } from "date-fns/locale";
import { useNotification } from "../hooks/useNotification";

const today = new Date();
const fromTodaySevenDay = [];
for (var i = 0; i < 7; i++) {
  const newDate = new Date(today);
  newDate.setDate(today.getDate() + i);
  const newDayString = newDate.toISOString().slice(5, 10).replace("-", "/");
  fromTodaySevenDay.push(newDayString);
}

const StaffRoster = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [sendBackFlag, setSendBackFlag] = useState(false);

  /** ModalValue 控制開啟的是哪一個 Modal */
  const [modalValue, setModalValue] = useState(false);

  /** 傳送額外資訊給 Modal */
  const [isOpen, setIsOpen] = useState(false);

  /** 儲存部門、部門人員清單 */
  const [departmentList, setDepartmentList] = useState([]);
  const [memberList, setMemberList] = useState([]);

  /** 取得所有人的排休清單 */
  const [allAttendanceList, setAllattendanceList] = useState([]);

  /** 紀錄月份，為了lazyloading不重複取 */
  const [monthCache, setMonthCache] = useState([]);

  /** 紀錄目前月曆的月份，並求得本月第一天跟最後一天 */
  const [calendarMonthRange, setCalendarMonthRange] = useState([]);

  /** 送出 api 後，重打排休清單的標記 */
  const [reload, setReload] = useState(true);

  const showNotification = useNotification();

  /** 用 localstorage 的資訊確定是不是人資部，然後決定可以看單一部門還是全部部門 */
  const userProfile = useLocalStorageValue("userProfile");
  useEffect(() => {
    if (userProfile) {
      const UserDeptId = userProfile.department.id;
      if (UserDeptId === "31" || UserDeptId === "29") {
        /** 如果給人資部門，現在給全部的部門，理論上給有排班人員的部門就好 31人資 29法務 */
        getData("department").then((result) => {
          const data = result.result.content;
          setDepartmentList(data);
          console.log("setDepartmentList", data);
        });
      } else if (UserDeptId) {
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
    const type = "ARRANGED_LEAVE";
    const anomaly = "";
    const alreadyget =
      calendarMonthRange?.[0] && calendarMonthRange[0].slice(0, 7);
    if (!monthCache.includes(alreadyget) && calendarMonthRange.length > 0) {
      setIsLoading(true);
      getData(
        `attendance?type=${type}&since=${calendarMonthRange[0]}&until=${calendarMonthRange[1]}&anomaly=${anomaly}&s=5000&p=1`
      ).then((result) => {
        const rawData = result.result.content
          .map(({ anomaly, date, id, since, until, user }, i) => ({
            title: user.department.name + " - " + user.nickname,
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
        setMonthCache((prev) => [...prev, calendarMonthRange[0].slice(0, 7)]);
        setIsLoading(false);
      });
    }
  }, [calendarMonthRange]);

  const sendDataToBackend = (fd, mode, otherdata) => {
    setIsLoading(true);
    let apiUrl = `user/${otherdata}/arrangedLeave`;
    let message = "";
    switch (mode) {
      case "emptyDays":
        message = "清除當月排休成功";
        break;
      case "withDays":
        message = "建立排休成功";
        break;
      default:
        break;
    }

    postData(apiUrl, fd).then((result) => {
      if (result.status) {
        showNotification(message, true);
        setIsOpen(false);
        setMonthCache([]);
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
          memberList={memberList}
          setMemberList={setMemberList}
          deliverInfo={userProfile}
          allAttendanceList={allAttendanceList}
          calendarMonthRange={calendarMonthRange}
          setCalendarMonthRange={setCalendarMonthRange}
          handleNextPreviousClick={handleNextPreviousClick}
          sendDataToBackend={sendDataToBackend}
          setAllattendanceList={setAllattendanceList}
          setReload={setReload}
        />
      ),
    },
  ];
  const config = modalValue
    ? modalConfig.find((item) => item.modalValue === modalValue)
    : null;

  return (
    <>
      <>
        <PageTitle
          title="排休月曆表"
          btnGroup={btnGroup}
          handleActionClick={handleActionClick}
          description="此頁面僅提供給人資及各部門主管查看、編輯同部門員工排休值勤表。"
          // isLoading={!isLoading}
        />

        {allAttendanceList.length === 0 && departmentList.lenth === 0 ? (
          <>
            <LoadingThree size={40} />
          </>
        ) : (
          <Calendar
            data={allAttendanceList}
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
          />
        )}
        {/* FAB */}
        <MultipleFAB
          btnGroup={btnGroup}
          handleActionClick={handleActionClick}
        />
        {/* Modal */}
        {config && config.modalComponent}
        <Backdrop sx={{ color: "#fff", zIndex: 1400 }} open={sendBackFlag}>
          <LoadingFour />
        </Backdrop>
        <Backdrop sx={{ color: "#fff", zIndex: 3000 }} open={isLoading}>
          <LoadingThree size={40} />
        </Backdrop>
      </>

      {/* PageTitle */}
    </>
  );
};

export default StaffRoster;
