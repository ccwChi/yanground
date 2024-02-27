import React, { useEffect } from "react";
import { useState } from "react";
import { LoadingTwo } from "../components/Loader/Loading";
import { useMediaQuery } from "@mui/material";
import PageTitle from "../components/Guideline/PageTitle";
import Calendar from "../components/Calendar/Calendar";
import StaffRosterModal from "./StaffRosterModal";
import MultipleFAB from "../components/FloatingActionButton/MultipleFAB";
import AddLinkIcon from "@mui/icons-material/AddLink";
import { getData } from "../utils/api";
import { useNavigate } from "react-router-dom";
import useLocalStorageValue from "../hooks/useLocalStorageValue";
import { format } from "date-fns";
import { zhTW } from "date-fns/locale";

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

  // ModalValue 控制開啟的是哪一個 Modal
  const [modalValue, setModalValue] = useState(false);
  // 傳送額外資訊給 Modal
  const [isOpen, setIsOpen] = useState(false);
  const [departmentList, setDepartmentList] = useState([]);
  const [memberList, setMemberList] = useState([]);
  const [userDepartId, setUserDepartId] = useState("");
  const [allAttendanceList, setAllattendanceList] = useState([]);
  const [monthCache, setMonthCache] = useState([]);
  const [calendarMonthRange, setCalendarMonthRange] = useState([]);
  const navigate = useNavigate();
  // const location = useLocation();
  const userProfile = useLocalStorageValue("userProfile");

  /** 用 localstorage 的資訊確定是不是人資部，然後決定可以看單一部門還是全部部門 */
  useEffect(() => {
    if (userProfile) {
      const UserDeptId = userProfile.department.id;
      setUserDepartId(UserDeptId);
      if (UserDeptId === 31) {
        // 如果給人資部門，現在給全部的部門，理論上給有排班人員的部門就好
        getData("department").then((result) => {
          setIsLoading(false);
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
  }, []);

  /** 取得這個月全部的排休資料 */
  useEffect(() => {
    const type = "ARRANGED_LEAVE";
    const anomaly = "";
    const alreadyget =
      calendarMonthRange?.[0] && calendarMonthRange[0].slice(0, 7);
    if (!monthCache.includes(alreadyget) && calendarMonthRange.length > 0) {
      getData(
        `attendance?type=${type}&since=${calendarMonthRange[0]}&until=${calendarMonthRange[1]}&anomaly=${anomaly}&s=5000&p=1`
      ).then((result) => {
        const rawData = result.result.content.map(
          ({ anomaly, date, id, since, until, user }, i) => ({
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
          })
        );

        setAllattendanceList(
          rawData.sort((a, b) => {
            if (a.date < b.date) {
              return 1;
            }
            if (a.date > b.date) {
              return -1;
            }
            return 0;
          })
        );
        setMonthCache((prev) => [...prev, calendarMonthRange[0].slice(0, 7)]);
      });
    }
  }, [calendarMonthRange]);

  useEffect(() => {}, []);

  useEffect(() => {
    console.log(allAttendanceList);
  }, [allAttendanceList]);

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

  // 關閉 Modal 清除資料
  const onClose = () => {
    setIsOpen(false);
  };

  // modal 開啟參數與顯示標題
  const modalConfig = [
    {
      modalValue: "buildStaffRoster",
      modalComponent: (
        <StaffRosterModal
          onClose={onClose}
          isOpen={isOpen}
          departmentList={departmentList}
          memberList={memberList}
          setMemberList={setMemberList}
          deliverInfo={userProfile}
          allAttendanceList={allAttendanceList}
          setCalendarMonthRange={setCalendarMonthRange}
        />
      ),
    },
  ];
  const config = modalValue
    ? modalConfig.find((item) => item.modalValue === modalValue)
    : null;

  return (
    <>
      {!isLoading ? (
        <></>
      ) : (
        <>
          <PageTitle
            title="排休行事曆"
            btnGroup={btnGroup}
            handleActionClick={handleActionClick}
            description="此頁面僅提供給人資及各部門主管查看、編輯同部門員工排休值勤表。"
            // isLoading={!isLoading}
          />

          <Calendar
            data={allAttendanceList}
            viewOptions={["dayGridMonth", "dayGridWeek"]}
            _dayMaxEvents={3}
            displayEventTime={false} // 整天
            eventBorderColor={"transparent"}
            eventBackgroundColor={"transparent"}
            eventOrder={""}
            showMonth={true}
          />

          {/* FAB */}
          <MultipleFAB
            btnGroup={btnGroup}
            handleActionClick={handleActionClick}
          />
          {/* Modal */}
          {config && config.modalComponent}
        </>
      )}
      {/* PageTitle */}
    </>
  );
};

export default StaffRoster;
