import React, { useEffect, useState } from "react";

import { getData, postData } from "../utils/api";

/* modal 元件們 */
import ModalTemplete from "../components/Modal/ModalTemplete";
import {
  Backdrop,
  Button,
  Card,
  FormHelperText,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";

/* 用於抓自己資料 等之後開放選擇請假代理人會用到 */
import useLocalStorageValue from "../hooks/useLocalStorageValue";

/* 用於表單 */
import { useForm, FormProvider, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import InputTitle from "../components/Guideline/InputTitle";

/* 用於警告視窗 */
import AlertDialog from "../components/Alert/AlertDialog";
import { useNotification } from "../hooks/useNotification";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";

/* 載入中 */
import { LoadingFour } from "../components/Loader/Loading";

// data-fns
import { format, set } from "date-fns";

// MUI
import Autocomplete from "@mui/material/Autocomplete";

import CircularProgress from "@mui/material/CircularProgress";

// Component

import ControlledDatePicker from "../components/DatePicker/ControlledDatePicker";
import ControlledOnlyTimePicker from "../components/DatePicker/ControlledOnlyTimePicker";
import Calendar from "../components/Calendar/Calendar";
import { zhTW } from "date-fns/locale";

/**
 * 取得書本價格
 * @param {Object} deliverInfo - 物件包含 anaomly，color，id(考勤)，title，type，start
 * @param {Function} onClose - 父層決定此 model 的關閉
 * @param {bool} isOpen - 此 model 的開關
 * @param {Function} setReflesh - 用於送出資料後，重新抓畫面清單資料
 * @param {Array} attendanceTypeList - 我資料
 */

const today = new Date();
const StaffRosterModal = React.memo(
  ({
    deliverInfo,
    onClose,
    isOpen,
    sendDataToBackend,
    departmentList,
    memberList,
    setMemberList,
    allAttendanceList,
  }) => {
    // 用戶清單
    const [usersList, setUsersList] = useState([]);
    // isLoading 等待請求 API
    const [isLoading, setIsLoading] = useState(false);

    const [selectedDepart, setSelectedDepart] = useState("");
    const [selectedStaff, setSelectedStaff] = useState("");
    const [arrangeLeaveDay, setArrangeLeaveDay] = useState([]);

    /** 如果不是人資部 = 單一部門主管， 部門欄位會直接自動選擇 */
    useEffect(() => {
      if (departmentList.length === 1) {
        setSelectedDepart(departmentList[0].id);
      }
    }, [departmentList]);

    /** 有已選部門後，接著求該部門所有人 */
    useEffect(() => {
      if (selectedDepart) {
        const memberurl = `department/${selectedDepart}/staff`;
        getData(memberurl).then((result) => {
          setIsLoading(false);
          const data = result.result.map((user) => ({
            id: user.id,
            name: user.nickname,
            arrangedLeaveDays: user.arrangedLeaveDays,
          }));
          setMemberList(data);
        });
      }
    }, [selectedDepart]);

    /** 如果有選人 + 有考勤清單，撈出該員工的已排休狀態 */
    useEffect(() => {
      if (!!selectedStaff && allAttendanceList) {
        const selectedStaffAttendance = allAttendanceList
          .filter((userAtt) => userAtt.user.id === selectedStaff.id)
          .reduce((acc, curr) => {
            const month = new Date(curr.date).getMonth() + 1; // 获取日期的月份
            const key = month + "月";
            if (!acc[key]) {
              acc[key] = []; // 如果当前月份的数组不存在，创建一个空数组
            }
            acc[key].push(curr); // 将当前对象添加到对应月份的数组中
            return acc;
          }, {});
        const result = Object.keys(selectedStaffAttendance).map((key) => ({
          [key]: selectedStaffAttendance[key],
        }));
        //   .map((userAtt) => ({
        //     date: userAtt.date,
        //     title: getflagColorandText(userAtt.date).text,
        //     color: getflagColorandText(userAtt.date).color,
        //   }));
        setArrangeLeaveDay(selectedStaffAttendance);
        console.log("selectedStaffAttendance", result);
      }
    }, [selectedStaff]);

    /** 用於顯示月曆上的顯示及顏色 */
    const getflagColorandText = (date) => {
      if (today > new Date(date)) {
        return { color: "#929292", text: "已休", editable: false };
      } else {
        return { color: "#25B09B", text: "排休", editable: true };
      }
    };
    // useEffect(() => {
    //   console.log(selectedStaff);
    // }, [selectedStaff]);

    /** 月曆點擊事件 */
    const handleEventClick = (date) => {
      if (new Date(date) > today) {
        const hasDate = arrangeLeaveDay.some((item) => item.date === date);
        if (hasDate) {
          setArrangeLeaveDay((prev) => prev.filter((arr) => arr.date !== date));
        } else if (
          !hasDate &&
          arrangeLeaveDay?.length < selectedStaff?.arrangedLeaveDays
        ) {
          console.log(
            "arrangeLeaveDay",
            arrangeLeaveDay,
            "selectedStaff",
            selectedStaff
          );
          setArrangeLeaveDay((prev) => [
            ...prev,
            {
              date: date,
              title: getflagColorandText(date).text,
              color: getflagColorandText(date).color,
            },
          ]);
        }
      }
    };

    /** 月曆點擊事件 */
    const handleDayClick = (date) => {
      handleEventClick(date);
    };

    // 提交表單資料到後端並執行相關操作
    const onSubmit = () => {
      //   const formattedDate = format(new Date(data.date), "yyyy-MM-dd");
      const fd = new FormData();
      fd.append("id", selectedStaff);

      //   sendDataToBackend(fd, "create", data.user.label);

      for (const pair of fd.entries()) {
        console.log(pair[0], pair[1]);
      }
    };

    const handlePreviousClick = (calendarRef) => {
      const monthAndYears = calendarRef.current.calendar.currentData.viewTitle;
      const regex = /(\d+)年(\d+)月/;
      const match = monthAndYears.match(regex);
      if (match) {
        const year = match[1];
        const month = match[2] < 10 ? "0" + match[2] : match[2];
        console.log("年份:", year);
        console.log("月份:", month);
      }
    };
    const handleNextClick = (calendarRef) => {
      console.log("點擊下一個月");
    };

    return (
      <>
        {/* Modal */}
        <ModalTemplete
          title={"單一員工排休表"}
          show={isOpen}
          maxWidth={"720px"}
          onClose={onClose}
        >
          <div className="mt-3">
            {/* 表單區 */}
            <div className="flex flex-col sm:flex-row gap-1 max-h-[67vh] overflow-y-auto">
              {/* 請假單 */}

              {/* 部門 x 人員 */}
              <div className="flex flex-col  flex-1 mt-4">
                <div className="flex-1 flex flex-col sm:gap-4">
                  {/* 部門 */}
                  <div className="flex-col w-full">
                    <InputTitle classnames="whitespace-nowrap" title={"部門"} />
                    <Select
                      value={selectedDepart}
                      fullWidth
                      size="small"
                      onChange={(event) => {
                        setSelectedDepart(event.target.value);
                        setSelectedStaff("");
                      }}
                      displayEmpty
                      className="!bg-white"
                    >
                      <MenuItem value="" disabled>
                        <span className="text-neutral-400 font-light">
                          部門選擇
                        </span>
                      </MenuItem>
                      {!!departmentList &&
                        departmentList.map((date) => (
                          <MenuItem key={date.id} value={date.id}>
                            {date.name}
                          </MenuItem>
                        ))}
                    </Select>
                  </div>

                  {/* 人員 */}
                  <div className="flex-col w-full ">
                    <InputTitle classnames="whitespace-nowrap" title={"人員"} />
                    <Select
                      value={selectedStaff?.id ? selectedStaff.id : ""}
                      fullWidth
                      size="small"
                      onChange={(event) => {
                        setSelectedStaff(
                          memberList.find(
                            (data) => data.id === event.target.value
                          )
                        );
                      }}
                      displayEmpty
                      className="!bg-white"
                    >
                      <MenuItem value="" disabled>
                        <span className="text-neutral-400 font-light">
                          人員選擇
                        </span>
                      </MenuItem>
                      {!!memberList &&
                        memberList.map((date) => (
                          <MenuItem key={date.id} value={date.id}>
                            {date.name}
                          </MenuItem>
                        ))}
                    </Select>
                  </div>

                  {/* 本月可排休天數 */}
                  <div className="flex flex-col w-full">
                    <InputTitle
                      classnames="whitespace-nowrap"
                      title={"本月已排天數 / 可排休天數"}
                      required={false}
                    />
                    <div className="border-b-2 h-8 text-center">
                      {arrangeLeaveDay?.length ? arrangeLeaveDay?.length : "-"}{" "}
                      天 /{" "}
                      {selectedStaff?.arrangedLeaveDays
                        ? selectedStaff?.arrangedLeaveDays
                        : "-"}{" "}
                      天
                    </div>
                  </div>

                  {/* 補充說明 */}
                  <div className=" flex flex-col gap-2 mt-4">
                    <p className="!my-0 text-gray-600 font-bold text-[14px]">
                      1. 今日之前的排休將被凍結。
                    </p>
                    <p className="!my-0 text-gray-600 font-bold text-[14px]">
                      2. 只能建立今天之後的排休。
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 mb-1">
                  <Button
                    type="submit"
                    variant="contained"
                    color="success"
                    className="!text-base !h-8 !mt-3"
                    fullWidth
                    onClick={() => {
                      onSubmit();
                    }}
                  >
                    編輯
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    color="success"
                    className="!text-base !h-8 !mt-3"
                    fullWidth
                    onClick={() => {
                      onSubmit();
                    }}
                  >
                    儲存
                  </Button>
                </div>
              </div>

              {/*  */}
              <div className="flex w-[500px]">
                <div className="staffrosterCalendar flex-1">
                  <Calendar
                    data={arrangeLeaveDay}
                    viewOptions={["dayGridMonth"]}
                    displayEventTime={false} // 整天
                    eventBorderColor={"transparent"}
                    eventBackgroundColor={"transparent"}
                    weekNumbers={false}
                    showMonth={true}
                    todayButton={false}
                    height={"400px"}
                    dateClick={(e) => {
                      handleDayClick(e.dateStr);
                      //   console.log("dateClick,", e);
                    }}
                    eventClick={(e) => {
                      handleEventClick(e.event.startStr);
                      //   console.log("eventClick,", e);
                    }}
                    onPreviousClick={(calendarRef) =>
                      handlePreviousClick(calendarRef)
                    }
                    onNextClick={(calendarRef) => handleNextClick(calendarRef)}
                  />
                </div>
              </div>
              {/* </div> */}
            </div>
            {/* 按鈕 Btn Group */}
            {/* <div className="flex sm:flex-row flex-col gap-2">
              <Button
                type="submit"
                variant="contained"
                color="success"
                className="!text-base !h-12 !mt-3"
                fullWidth
                onClick={() => {
                  onSubmit();
                }}
              >
                關閉
              </Button>
            </div> */}
          </div>
        </ModalTemplete>
      </>
    );
  }
);

export default StaffRosterModal;
