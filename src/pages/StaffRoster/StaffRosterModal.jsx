import React, { useEffect, useState } from "react";
import { getData } from "../../utils/api";

/* modal 元件們 */
import ModalTemplete from "../../components/Modal/ModalTemplete";
import { Button, Chip, MenuItem, Select, useMediaQuery } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

/* 用於警告視窗 */
import AlertDialog from "../../components/Alert/AlertDialog";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";

/* Component */
import Calendar from "../../components/Calendar/Calendar";
import CustomDatePicker from "../../components/DatePicker/DatePicker";
import InputTitle from "../../components/Guideline/InputTitle";
import { format } from "date-fns";
import { zhTW } from "date-fns/locale";
import { useNotification } from "../../hooks/useNotification";

/**
 * 取得書本價格
 * @param {bool} isOpen // model 的開關
 * @param {function} setIsOpen // 跟上面是一組的 useState
 * @param {function} sendDataToBackend 把資料回傳給主頁面，使其傳遞 api 用
 * @param {array} departmentList // 部門清單，當為人資時為全部的部門，當非人資 = 理論上等於工務主管 => 求得對應部門
 * @param {array} allAttendanceList // 可看的、對應的全部部門人員的排休，ex:人資就會看到全部
 * @param {array} calendarMonthRange  // 月曆當下的第一天最後一天 ex:[2024-03-01, 2024-03-31]
 * @param {function} handleNextPreviousClick // 當點擊上下個月時，要讓上面的 calendarMonthRange 轉換成對應月份
 */

const today = new Date();
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
const StaffRosterModal = React.memo(
  ({
    isOpen,
    setIsOpen,
    sendDataToBackend,
    departmentList,
    allAttendanceList,
    calendarMonthRange,
    handleNextPreviousClick,
  }) => {
    /** 選擇部門，選擇員工用 */
    const [selectedDepart, setSelectedDepart] = useState("");
    const [selectedStaff, setSelectedStaff] = useState("");

    /** 當選擇了某個員工後，從之前傳進來的全部員工排休撈這個單一員工的 */
    const [arrangeLeaveDay, setArrangeLeaveDay] = useState([]);

    /** 當點擊日期後，直接對該日期做可以直接送於 api 的處理，格式如[2024-03-01,2024-03-02] */

    /** modal 汙染用 */
    const [isDirty, setIsDirty] = useState(false);
    const [alertOpen, setAlertOpen] = useState(false);

    /** 偵測是否為手機 */
    const isPhoneScreen = useMediaQuery("(max-width:768px)");

    /** 有了部門後再儲存部門人員清單用的 */
    const [memberList, setMemberList] = useState([]);

    /** 給日期選擇器用的 */
    const [dates, setDates] = useState(null);

    const showNotification = useNotification();

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
      setArrangeLeaveDay([]);
      if (!!selectedStaff && allAttendanceList) {
        const selectedStaffAttendance = allAttendanceList
          .filter((userAtt) => userAtt.user.id === selectedStaff.id)
          .reduce((acc, curr) => {
            const year = new Date(curr.date).getFullYear();
            const month = new Date(curr.date).getMonth() + 1;
            const formattedMonth = month < 10 ? "0" + month : month;
            const key = `${year}-${formattedMonth}`;
            if (!acc[key]) {
              acc[key] = [];
            }
            acc[key].push({
              title: getflagColorandText(curr.date).text,
              date: curr.date,
              color: getflagColorandText(curr.date).color,
            });
            return acc;
          }, {});
        setArrangeLeaveDay(selectedStaffAttendance);
      }
    }, [selectedStaff, allAttendanceList]);

    /** 用於顯示月曆上的顯示及顏色 */
    const getflagColorandText = (date) => {
      if (today > new Date(date)) {
        return { color: "#a6a4a4", text: "已休", editable: false };
      } else {
        return { color: "#25B09B", text: "排休", editable: true };
      }
    };

    /** 月曆點擊事件 */
    const handleEventClick = (date) => {
      const thisMonth = calendarMonthRange[0].slice(0, 7);
      if (!selectedStaff) {
        return;
      }

      if (new Date(date) > today) {
        const hasDate =
          thisMonth in arrangeLeaveDay &&
          arrangeLeaveDay?.[thisMonth].some((item) => item.date === date);

        if (hasDate) {
          setIsDirty(true);
          setArrangeLeaveDay((prev) => ({
            ...prev,
            [thisMonth]: prev[thisMonth].filter((arr) => arr.date !== date),
          }));
        } else if (
          !hasDate &&
          thisMonth in arrangeLeaveDay &&
          arrangeLeaveDay[thisMonth]?.length < selectedStaff?.arrangedLeaveDays
        ) {
          setIsDirty(true);
          setArrangeLeaveDay((prev) => ({
            ...prev,
            [thisMonth]: [
              ...prev[thisMonth],
              {
                date: date,
                title: getflagColorandText(date).text,
                color: getflagColorandText(date).color,
              },
            ],
          }));
        } else if (
          !hasDate &&
          !(thisMonth in arrangeLeaveDay) &&
          selectedStaff?.arrangedLeaveDays > 0
        ) {
          setIsDirty(true);
          setArrangeLeaveDay((prev) => ({
            ...prev,
            [thisMonth]: [
              {
                date: date,
                title: getflagColorandText(date).text,
                color: getflagColorandText(date).color,
              },
            ],
          }));
        } else if (
          arrangeLeaveDay[thisMonth]?.length >= selectedStaff?.arrangedLeaveDays
        ) {
          showNotification("該月排休已滿", true, 1000);
        }
      }
    };

    // 檢查表單是否汙染
    const onCheckDirty = () => {
      if (isDirty) {
        setAlertOpen(true);
      } else {
        clearAll();
      }
    };
    // 下面僅關閉汙染警告視窗
    const handleAlertClose = async (agree) => {
      if (agree) {
        clearAll();
      }
      setAlertOpen(false);
    };

    const clearAll = () => {
      setIsDirty(false);
      setIsOpen(false);
      setSelectedStaff("");
    };

    /** 月曆點擊事件 */
    const handleDayClick = (date) => {
      handleEventClick(date);
    };

    // 提交表單資料到後端並執行相關操作
    const onSubmit = () => {
      const calendarMonth = calendarMonthRange[0].slice(0, 7);
      const year = calendarMonthRange[0].slice(0, 4);
      const month = calendarMonthRange[0].slice(5, 7);
      const todayDateString = new Date(today).toISOString().slice(0, 10);
      const filteredDates = arrangeLeaveDay?.[calendarMonth]
        ? arrangeLeaveDay[calendarMonth].filter(
            (item) => item.date > todayDateString
          )
        : [];
      const extractedDates = filteredDates.map((item) => item.date);
      const dateParam = extractedDates.join(",");
      const fd = new FormData();
      fd.append("dates", dateParam);
      if (dateParam === "") {
        const otherData = [selectedStaff.id, year, month];
        const mode = "remove";
        sendDataToBackend(fd, mode, otherData);
        clearAll();
      } else {
        const mode = "update";
        const otherData = [selectedStaff.id];
        sendDataToBackend(fd, mode, otherData);
        clearAll();
      }
    };

    /** 下面是專門為 ios 手機模式下寫的切換月份 */
    const goToPreviousMonth = () => {
      const getYearMonth = calendarMonthRange[0];

      const previousMonth = new Date(getYearMonth);
      previousMonth.setMonth(previousMonth.getMonth() - 1);

      const changedYearMonth = format(previousMonth, "yyyy-MM-dd", {
        locale: zhTW,
      })
        .slice(0, 7)
        .replace("-", "年")
        .concat("月");
      const calendarRef = {
        current: { calendar: { currentData: { viewTitle: changedYearMonth } } },
      };
      handleNextPreviousClick(calendarRef);
    };

    const goToNextMonth = () => {
      const getYearMonth = calendarMonthRange[0];

      const previousMonth = new Date(getYearMonth);
      previousMonth.setMonth(previousMonth.getMonth() + 1);

      const changedYearMonth = format(previousMonth, "yyyy-MM-dd", {
        locale: zhTW,
      })
        .slice(0, 7)
        .replace("-", "年")
        .concat("月");
      const calendarRef = {
        current: { calendar: { currentData: { viewTitle: changedYearMonth } } },
      };
      handleNextPreviousClick(calendarRef);
    };

    return (
      <>
        {/* Modal */}
        <ModalTemplete
          title={"單一員工排休表"}
          show={isOpen}
          maxWidth={"720px"}
          onClose={onCheckDirty}
        >
          <div className="mt-3">
            {/* 表單區 */}
            <div className="flex flex-col md:flex-row gap-1 max-h-[67vh] overflow-y-auto">
              {/* 請假單 */}

              {/* 部門 x 人員 */}
              <div className="flex flex-col flex-1 sm:mt-4">
                <div className="flex-1 flex flex-col gap-4">
                  {/* 部門 */}
                  <div className="flex-col w-full">
                    <InputTitle classnames="whitespace-nowrap" title={"部門"} />
                    <Select
                      value={selectedDepart}
                      fullWidth
                      size="small"
                      onChange={(event) => {
                        setMemberList([]);
                        setSelectedStaff("");
                        setArrangeLeaveDay([]);
                        setSelectedDepart(event.target.value);
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
                            {date.label}
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
                    <div className="border-b-2 h-8 md:text-center ps-2">
                      {arrangeLeaveDay &&
                      arrangeLeaveDay[calendarMonthRange[0]?.slice(0, 7)] &&
                      arrangeLeaveDay[calendarMonthRange[0].slice(0, 7)].length
                        ? arrangeLeaveDay[calendarMonthRange[0].slice(0, 7)]
                            .length
                        : "0"}{" "}
                      天 /{" "}
                      {selectedStaff?.arrangedLeaveDays
                        ? selectedStaff?.arrangedLeaveDays
                        : "-"}{" "}
                      天
                    </div>
                  </div>

                  {/* 補充說明 */}
                  <div className=" flex flex-col gap-2 mt-4  ">
                    <p className="!my-0 text-gray-600 font-bold text-[14px]">
                      1. 只能建立今天之後的排休。
                    </p>
                    <p className="!my-0 text-gray-600 font-bold text-[14px]">
                      2. 一次僅建立同個月的排休。
                    </p>
                    <p className="!my-0 text-gray-600 font-bold text-[14px]">
                      3. 一次可建立多天，新建立的會覆蓋之前的。
                    </p>
                    <p className="!my-0 text-gray-600 font-bold text-[14px] sm:hidden">
                      4. 藍底日期在選擇一次同天日期即可取消。
                    </p>
                  </div>
                </div>
                <div className="md:flex gap-2 mb-1 hidden">
                  <Button
                    type="submit"
                    variant="contained"
                    color="success"
                    className="!text-base !h-8 !mt-3"
                    disabled={!selectedStaff}
                    fullWidth
                    onClick={() => {
                      onSubmit();
                    }}
                  >
                    儲存
                  </Button>
                </div>
              </div>

              {/* 月曆 */}
              {isPhoneScreen ? (
                <>
                  <div className="w-full flex flex-col gap-2">
                    <div className="inline-flex w-full gap-4 mt-2">
                      <CustomDatePicker
                        setDates={setDates}
                        defaultValue={dates}
                        format="yyyy-MM-dd"
                        mode="a"
                        closeOnSelect={true}
                        minDate={
                          calendarMonthRange.length > 0 &&
                          new Date(calendarMonthRange[0]) <= today
                            ? new Date(tomorrow)
                            : new Date(calendarMonthRange[0])
                        }
                        maxDate={
                          calendarMonthRange.length > 0 &&
                          new Date(calendarMonthRange[1])
                        }
                      />

                      <Button
                        type="submit"
                        variant="contained"
                        color="success"
                        className="!text-base !h-12 !mt-0 !w-40"
                        disabled={!selectedStaff}
                        fullWidth
                        onClick={() => {
                          const formatedDate =
                            dates &&
                            format(dates, "yyyy-MM-dd", { locale: zhTW });
                          handleEventClick(formatedDate);
                        }}
                      >
                        添加 / 移除
                      </Button>
                    </div>
                    <div className="w-full shadow-md border border-gray-300 p-2 rounded-sm flex flex-col gap-1">
                      <div className="flex justify-between mb-2 border-b-2 pb-2">
                        <Chip
                          label={
                            calendarMonthRange.length > 0 &&
                            calendarMonthRange[0].slice(0, 7)
                          }
                          color="default"
                          className="!rounded-md !text-lg"
                        />
                        <div className="flex gap-1">
                          <Chip
                            label="上個月"
                            onClick={() => goToPreviousMonth()}
                            icon={<ArrowBackIcon fontSize={"small"} />}
                            color="default"
                            className="!rounded-md"
                          />
                          <Chip
                            label="下個月"
                            onClick={() => goToNextMonth()}
                            icon={<ArrowForwardIcon />}
                            color="default"
                            className="!rounded-md"
                          />
                        </div>
                      </div>
                      {calendarMonthRange.length > 0 &&
                      arrangeLeaveDay?.[calendarMonthRange[0].slice(0, 7)] ? (
                        arrangeLeaveDay?.[
                          calendarMonthRange[0].slice(0, 7)
                        ].map((data, i) => (
                          <Chip
                            key={i}
                            color={`${
                              data.title === "已休" ? "default" : "primary"
                            }`}
                            className="!rounded-md"
                            label={data.date + "-" + data.title}
                          />
                        ))
                      ) : (
                        <p>該月份尚無資料</p>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {" "}
                  <div className="flex md:w-[500px]">
                    <div className="staffrosterCalendar relative flex-1">
                      <Calendar
                        data={Object.values(arrangeLeaveDay).flat()}
                        viewOptions={["dayGridMonth"]}
                        displayEventTime={true} // 整天
                        eventBorderColor={"transparent"}
                        eventBackgroundColor={"transparent"}
                        customInitialView={true}
                        weekNumbers={false}
                        showMonth={true}
                        todayButton={false}
                        navLinks={false}
                        height={"400px"}
                        dateClick={(e) => {
                          handleDayClick(e.dateStr);
                        }}
                        eventClick={(e) => {
                          handleEventClick(e.event.startStr);
                        }}
                        onPreviousClick={(calendarRef) =>
                          handleNextPreviousClick(calendarRef)
                        }
                        onNextClick={(calendarRef) =>
                          handleNextPreviousClick(calendarRef)
                        }
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
            {/* 按鈕 Btn Group */}
            <div className="flex gap-2 mb-1 sm:hidden">
              <Button
                type="submit"
                variant="contained"
                color="success"
                className="!text-base !h-8 !mt-3"
                disabled={!selectedStaff}
                fullWidth
                onClick={() => {
                  onSubmit();
                }}
              >
                儲存
              </Button>
            </div>
          </div>
        </ModalTemplete>
        <AlertDialog
          open={alertOpen}
          onClose={handleAlertClose}
          icon={<ReportProblemIcon color="secondary" />}
          title="注意"
          content="您所做的變更尚未儲存。是否確定要關閉表單？"
          disagreeText="取消"
          agreeText="確定"
        />
      </>
    );
  }
);

export default StaffRosterModal;
