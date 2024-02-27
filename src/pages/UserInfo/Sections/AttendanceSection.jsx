import React, { useState, useEffect } from "react";
import Calendar from "../../../components/Calendar/Calendar";
import { parseISO, format } from "date-fns";
import { zhTW } from "date-fns/locale";
import { utcToZonedTime } from "date-fns-tz";
import AttendanceSectionModal from "./AttendanceCalendarModal/AttendanceSectionModal";

import { getData } from "../../../utils/api";

const alertText = "點擊日期即可對當日進行請假單填寫。";

const AttendanceSection = React.memo(({ apiAttData, setReflesh }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [deliverInfo, setDeliverInfo] = useState({});

  // 請假類別 List
  const [attendanceTypeList, setAttendanceTypeList] = useState([]);

  // 取得請假類別
  useEffect(() => {
    getData("attendanceType").then((result) => {
      const data = result.result;
      const filterData = data.filter(
        (i) => i.value !== "ATTENDANCE" && i.value !== "ARRANGED_LEAVE"
      );
      setAttendanceTypeList(filterData);
    });
  }, []);

  const onClose = () => {
    setDeliverInfo({});
    setIsOpen(false);
  };
  const handleClickEvent = (date) => {
    if (apiAttData) {
      const eventContent = apiAttData.filter((data) => data.start === date);
      if (!!eventContent[0]) {
        setDeliverInfo(eventContent[0]);
      } else {
        setDeliverInfo({
          color: "#4b5563",
          id: null,
          start: date,
          title: "尚無考勤資料",
        });
      }
      // console.log("eventContent[0]", eventContent[0]);
      setIsOpen(true);
    }
  };

  const handleDayClick = (e) => {
    handleClickEvent(e.dateStr);
    // console.log("handleDayClick", e);
  };
  return (
    <>
      <div className="flex px-8 pt-2 font-bold text-xs">
        <p className="text-base">{alertText}</p>
      </div>
      {/* <p>aaaaaaaaaaaaa</p> */}
      <Calendar
        data={apiAttData}
        select={(selected) => {
          //   console.log("Date selected ", selected);
        }}
        eventClick={(info) => {
          handleClickEvent(info.event.startStr);
        }}
        dateClick={(e) => {
          handleDayClick(e);
        }}
      />
      <AttendanceSectionModal
        onClose={onClose}
        isOpen={isOpen}
        deliverInfo={deliverInfo}
        setReflesh={setReflesh}
        attendanceTypeList={attendanceTypeList}
      />
    </>
  );
});

export default AttendanceSection;
