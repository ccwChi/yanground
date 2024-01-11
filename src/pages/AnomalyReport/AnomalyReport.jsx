import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
// MUI
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import CircularProgress from "@mui/material/CircularProgress";
import Backdrop from "@mui/material/Backdrop";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import TuneIcon from "@mui/icons-material/Tune";
import { useTheme } from "@mui/material/styles";
import MobileStepper from "@mui/material/MobileStepper";
import Button from "@mui/material/Button";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
// Components
import PageTitle from "../../components/Guideline/PageTitle";
import Calendar from "../../components/Calendar/Calendar";
import InputTitle from "../../components/Guideline/InputTitle";
import DatePicker from "../../components/DatePicker/DatePicker";
import FloatingActionButton from "../../components/FloatingActionButton/FloatingActionButton";
import { LoadingTwo } from "../../components/Loader/Loading";
// date-fns
import { parseISO, format } from "date-fns";
import { zhTW } from "date-fns/locale";
import { utcToZonedTime } from "date-fns-tz";
// Hooks
import { useNotification } from "../../hooks/useNotification";
// Utils
import { getData } from "../../utils/api";
// Others
import ARimg from "../../assets/images/AnomalousImageRepresentation.png";
import { async } from "q";
import TableTabbar from "../../components/Tabbar/TableTabbar";
import emptyImg from "../../../src/assets/images/emptyCatSleep.png";
import { Tooltip, useMediaQuery } from "@mui/material";
//
import RWDTable from "../../components/RWDTable/RWDTable";
import EditIcon from "@mui/icons-material/Edit";
import { result } from "./result";

const AnomalyReport = () => {
  const navigate = useNavigate();
  const showNotification = useNotification();
  // 解析網址取得參數
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  // 設定部門人員
  const depValue = queryParams.get("dep");
  const userValue = queryParams.get("user");
  // const modeValue = queryParams.get("mode");
  // API List Data
  const [apiDataA, setApiDataA] = useState([]);
  const [apiDataB, setApiDataB] = useState([]);
  const [events, setEvents] = useState([]);
  const [showData, setShowData] = useState([]);
  // 部門
  const [departmentList, setDepartmentList] = useState([]);
  // 人員
  const [usersList, setUsersList] = useState([]);
  // isLoading 等待請求 API
  const [isLoading, setIsLoading] = useState(false);
  // SearchDialog Switch
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  // cat = Category 設置 tab 分類
  const [cat, setCat] = useState("table");
  // 搜尋日期
  const [dates, setDates] = useState(new Date());
  // 設定日期條件
  const [dateCondition, setDateCondition] = useState(2);
  // 切換畫面大小時，月曆的切換
  const [isAldreadyRender, setIsAldreadyRender] = useState(false);

  const isTargetScreen = useMediaQuery("(max-width:991.98px)");

  const dateConList = [
    {
      id: 1,
      text: "依據年, 月, 日進行搜尋",
      views: ["year", "month", "day"],
      formatOne: "yyyy 年 MM 月 dd 日",
      formatTwo: "yyyy-MM-dd",
      formatThree: "yyyy/MM/dd",
    },
    {
      id: 2,
      text: "依據年, 月進行搜尋",
      views: ["month", "year"],
      formatOne: "yyyy 年 MM 月",
      formatTwo: "yyyy-MM",
      formatThree: "yyyy/MM",
    },
    // { id: 3, text: "依據年份進行搜尋", views: ["year"], formatOne: "yyyy 年", formatTwo: "yyyy" },
  ];
  const dataCAList = [
    { value: "clockPunch", text: "打卡紀錄" },
    { value: "attendance", text: "出勤紀錄" },
  ];

  // 區塊功能按鈕清單
  const btnGroup = [
    {
      mode: "filter",
      icon: null, // 設為 null 就可以避免 PC 出現
      text: "篩選",
      variant: "contained",
      color: "secondary",
      fabVariant: "secondary",
      fab: <TuneIcon fontSize="large" />,
    },
  ];

  const getflagColorandText = (flag) => {
    switch (flag) {
      case true:
        return { color: "#F03355", text: "考勤異常" };
      case false:
        return { color: "#FFA516", text: "考勤已修正" };
      case null:
        return { color: "#25B09B", text: "考勤正常" };
      default:
        break;
    }
  };

  // 取得部門資料
  useEffect(() => {
    getData("department").then((result) => {
      const data = result.result.content;
      const formattedDep = data.map((dep) => ({ label: dep.name, id: dep.id }));
      setDepartmentList(formattedDep);
    });
  }, []);

  // 取得人員資料
  useEffect(() => {
    if (depValue) {
      getData(`department/${depValue}/staff`).then((result) => {
        const data = result.result;
        const formattedUser = data.map((us) => ({
          label:
            us.lastname && us.firstname
              ? us.lastname + us.firstname
              : us.displayName,
          id: us.id,
        }));
        setUsersList(formattedUser);
      });
    }
  }, [depValue]);

  // 取得日曆資料
  useEffect(() => {
    // setIsLoading(true);
    // Define the API calls
    const type = "ATTENDANCE";
    const since = "2024-01-06";
    const until = "2024-01-06";
    const anomaly = "";
    // const fullAttendance = getData(
    //   `attendance?type=${type}&since=${since}&anomaly=${anomaly}&until=${until}&s=5000&p=1`
    // ).then((result) => {
    //   console.log(result)
    //   const rawData = result.result.content.map(
    //     ({ anomaly, date, id, since, until, user }) => ({
    //       anomaly: anomaly ? "異常" : !anomaly ? "已補單" : "正常",
    //       date,
    //       id,
    //       since: since ? since.slice(11, 19) : "無紀錄",
    //       until: until ? until.slice(11, 19) : "無紀錄",
    //       title: user.department.name + " - " + user.nickname,
    //       color: getflagColorandText(anomaly).color,
    //       user: {
    //         id: user.id,
    //         nickname: user.nickname,
    //         fullName: user.lastname + user.firstname,
    //         department: user.department.name,
    //         departmentId: user.department.id,
    //       },
    //     })
    //   );
    //   setEvents(rawData);
    //   console.log(rawData);
    //   setIsLoading(false);
    // });
    const rawData = result.result.content.map(
      ({ anomaly, date, id, since, until, user }) => ({
        title: user.department.name + " - " + user.nickname,
        anomaly: anomaly ? "異常" : !anomaly ? "已補單" : "正常",
        date,
        id,
        since: since ? since.slice(11, 19) : "-",
        until: until ? until.slice(11, 19) : "-",
        color: getflagColorandText(anomaly).color,
        user: {
          id: user.id,
          nickname: user.nickname,
          fullName: user.lastname + user.firstname,
          department: user.department.name,
          departmentId: user.department.id,
        },
      })
    );
    setEvents(
      rawData.sort((a, b) => {
        if (a.user.departmentId < b.user.departmentId) {
          return -1;
        }
        if (a.user.departmentId > b.user.departmentId) {
          return 1;
        }
        return 0;
      })
    );
    console.log(
      rawData.sort((a, b) => {
        if (a.user.departmentId < b.user.departmentId) {
          return -1;
        }
        if (a.user.departmentId > b.user.departmentId) {
          return 1;
        }
        return 0;
      })
    );
  }, []);

  // 開啟 SearchDialog
  const handleOpenSearch = () => {
    setSearchDialogOpen(true);
  };
  // 關閉 SearchDialog
  const handleCloseSearch = () => {
    setSearchDialogOpen(false);
  };

  // 變動日期格式
  const selectedDateCon =
    dateConList.find((dc) => dateCondition === dc.id) || {};
  // 使用了 || {}，這是為了防止 selectedDateCon 為 undefined 時解構賦值產生錯誤。

  const theme = useTheme();
  const [activeStep, setActiveStep] = React.useState(0);
  const maxSteps = 3;

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  // Tab 列表對應 api 搜尋參數
  const tabGroup = [
    { f: "table", text: "列表" },
    { f: "calendar", text: "月曆" },
  ];
  // -----------------------------------------------------
  // 對照 api table 所顯示 key
  const columnsPC = [
    { key: ["user", "fullName"], label: "姓名", size: "180px" },
    { key: ["user", "department"], label: "部門", size: "180px" },
    { key: "date", label: "日期", size: "190px" },
    { key: "anomaly", label: "狀態", size: "170px" },
    { key: "since", label: "上班時間", size: "180px" },
    { key: "until", label: "下班時間", size: "180px" },
    // { key: "until", label: "補單狀況", size: "14%" },
  ];
  const columnsMobile = [
    { key: "displayName", label: "line名稱" },
    { key: ["user", "fullName"], label: "姓名" },
    { key: ["user", "nickname"], label: "暱稱" },
    { key: ["user", "department"], label: "部門" },
    { key: "date", label: "日期" },
    { key: "anomaly", label: "狀態" },
    { key: "since", label: "上班時間" },
    { key: "until", label: "下班時間" },
  ];
  // edit = 編輯名稱
  const actions = [
    { value: "edit", icon: <EditIcon />, title: "編輯個人資料" },
    // { value: "attconf", icon: <ViewTimelineIcon />, title: "出勤時間確認" },
  ];
  // -----------------------------------------------------
  return (
    <>
      {/* PageTitle & Search */}
      <PageTitle
        title={`${
          !userValue
            ? "考勤紀錄"
            : `${
                usersList?.find((obj) => obj.id === userValue)?.label
                  ? usersList.find((obj) => obj.id === userValue).label + "的"
                  : ""
              }考勤紀錄
						  `
        }`}
        // 搜尋模式
        searchMode
        // 下面參數前提都是 searchMode = true
        searchDialogOpen={searchDialogOpen}
        handleOpenDialog={handleOpenSearch}
        handleCloseDialog={handleCloseSearch}
        handleCloseText={"關閉"}
        haveValue={
          !depValue && !userValue && dateCondition === 2
          // && (modeValue === dataCAList[0].value
          // 	|| !dataCAList.some((item) => item.value === modeValue)
          // 	)
        }
        // 說明顯示
        quizMode
        // 下面參數前提都是 quizMode = true
        quizContent={
          <div className="pt-3">
            <div
              className="flex flex-col items-center"
              style={{
                height: 255,
                maxWidth: 400,
                width: "100%",
                overflowY: "auto",
              }}
            >
              {(() => {
                switch (activeStep) {
                  case 0:
                    return (
                      <p className="font-bold text-primary-900 pb-3">
                        〔畫面元素介紹〕
                      </p>
                    );
                  case 1:
                    return (
                      <p className="font-bold text-primary-900 pb-3">
                        〔更新頻率概述〕
                      </p>
                    );
                  case 2:
                    return (
                      <p className="font-bold text-primary-900 pb-3">
                        〔考勤顏色說明〕
                      </p>
                    );
                  default:
                    return null;
                }
              })()}
              {(() => {
                switch (activeStep) {
                  case 0:
                    return (
                      <div className="flex flex-col items-center h-full text-sm">
                        <img
                          className="border mt-3 mb-6 rounded"
                          src={ARimg}
                          alt="考勤與打卡圖片示意"
                        />
                        <p>
                          上方為
                          <span className="text-base font-bold text-primary-800">
                            「考勤紀錄」
                          </span>
                        </p>
                        <p>
                          下方為
                          <span className="text-base font-bold text-primary-800">
                            「打卡紀錄」
                          </span>
                        </p>
                      </div>
                    );
                  case 1:
                    return (
                      <div className="flex flex-col items-start h-full text-sm gap-3">
                        <div className="inline-flex">
                          <span className="whitespace-nowrap">考勤紀錄：</span>
                          <p>
                            <span className="text-base font-bold text-primary-800">
                              每日隔日凌晨 12:00 更新考勤數據。
                            </span>
                          </p>
                        </div>
                        <div className="inline-flex">
                          <span className="whitespace-nowrap">打卡紀錄：</span>
                          <p>
                            <span className="text-base font-bold text-primary-800">
                              即時更新
                            </span>
                            ，立即刷新頁面即可查看最新紀錄。
                          </p>
                        </div>
                        <p>情境範例：</p>
                        <ul>
                          <li>
                            1/1 大明 8:00 打卡上班，17:00
                            打卡下班，地理位置正常，打卡紀錄會即時更新至資料庫。
                          </li>
                          <li>
                            1/2 凌晨 12:00 系統更新資訊，會顯示
                            <span className="font-bold">「考勤正常」</span>。
                          </li>
                        </ul>
                      </div>
                    );
                  case 2:
                    return (
                      <div className="flex flex-col w-full h-full text-sm gap-3">
                        <div className="inline-flex flex-col gap-1">
                          <span className="px-2 py-0.5 bg-[#F03355] rounded text-white w-fit">
                            考勤異常
                          </span>
                          <p>考勤資料異常狀況：</p>
                          <ul>
                            <li>
                              1. <span className="font-bold">上班時間異常</span>
                            </li>
                            <li>
                              2. <span className="font-bold">下班時間異常</span>
                            </li>
                            <li>
                              3. <span className="font-bold">打卡範圍異常</span>
                            </li>
                            <li>
                              4. <span className="font-bold">工時異常</span>{" "}
                              (上下班/請假時間不滿 8 小時)
                            </li>
                          </ul>
                        </div>
                        <div className="inline-flex flex-col gap-1">
                          <span className="px-2 py-0.5 bg-[#FFA516] rounded text-white w-fit">
                            考勤已修正
                          </span>
                          <p>
                            代表
                            <span className="font-bold">已經進行編輯修正</span>
                            的情況。
                          </p>
                        </div>
                      </div>
                    );
                  default:
                    return activeStep;
                }
              })()}
            </div>
            <MobileStepper
              variant="dots"
              steps={maxSteps}
              position="static"
              activeStep={activeStep}
              sx={{ maxWidth: 400, flexGrow: 1, px: 0, pb: 0 }}
              backButton={
                <Button
                  size="small"
                  onClick={handleBack}
                  disabled={activeStep === 0}
                >
                  {theme.direction === "rtl" ? (
                    <KeyboardArrowRight />
                  ) : (
                    <KeyboardArrowLeft />
                  )}
                  上一頁
                </Button>
              }
              nextButton={
                <Button
                  size="small"
                  onClick={handleNext}
                  disabled={activeStep === maxSteps - 1}
                >
                  下一頁
                  {theme.direction === "rtl" ? (
                    <KeyboardArrowLeft />
                  ) : (
                    <KeyboardArrowRight />
                  )}
                </Button>
              }
            />
          </div>
        }
        quizModalClose={() => setActiveStep(0)}
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
              value={departmentList?.find((obj) => obj.id === depValue) || null}
              onChange={(event, newValue, reason) => {
                console.log("event",event,"newValue",newValue,"reason",reason)
                if (reason === "clear") {
                  if (window.confirm("是否確認清空部門欄位？")) {
                    setUsersList([]);
                    setApiDataA([]);
                    setApiDataB([]);
                    
                    navigate(`/anomaly_report`);
                  }
                } else {
                  setUsersList([]);
                  setApiDataA([]);
                  setApiDataB([]);
                  navigate(`/anomaly_report?dep=${newValue.id}`);
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
          <div className="inline-flex items-center w-full gap-2">
            <InputTitle
              title={"人員"}
              pb={false}
              required={false}
              classnames="whitespace-nowrap"
            />
            <Autocomplete
              options={usersList}
              className="flex-1"
              value={usersList?.find((obj) => obj.id === userValue) || null}
              onChange={(event, newValue, reason) => {
                if (reason === "clear") {
                  if (window.confirm("是否確認清空人員欄位？")) {
                    setApiDataA([]);
                    setApiDataB([]);
                    navigate(`/anomaly_report?dep=${depValue || ""}`);
                  }
                } else {
                  setApiDataA([]);
                  setApiDataB([]);
                  navigate(
                    `/anomaly_report?user=${newValue.id}&dep=${
                      depValue || ""
                    }`
                  );
                }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  className="inputPadding bg-white"
                  placeholder="請選擇人員"
                  sx={{ "& > div": { padding: "0 !important" } }}
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {depValue && usersList.length <= 0 ? (
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
              loading={usersList.length <= 0}
              loadingText={"載入中..."}
              disabled={!depValue}
            />
          </div>
          <div className="inline-flex items-center w-full gap-2">
            <InputTitle
              title={"條件"}
              pb={false}
              required={false}
              classnames="whitespace-nowrap"
            />
            <Select
              value={dateCondition}
              onChange={(event) => setDateCondition(event.target.value)}
              className="inputPadding !pe-5"
              displayEmpty
              fullWidth
            >
              {dateConList.map((dc) => (
                <MenuItem key={dc.id} value={dc.id}>
                  {dc.text}
                </MenuItem>
              ))}
            </Select>
          </div>
          <div className="inline-flex items-center w-full gap-2">
            <InputTitle
              title={"日期"}
              pb={false}
              required={false}
              classnames="whitespace-nowrap"
            />
            <DatePicker
              defaultValue={dates}
              setDates={setDates}
              views={selectedDateCon.views}
              format={selectedDateCon.formatOne}
              minDate={new Date("2023-11")}
            />
          </div>
        </div>
      </PageTitle>

      {/* TabBar */}
      <TableTabbar tabGroup={tabGroup} setCat={setCat} cat={cat} />
      {/* Calendar */}
      {cat === "table" ? (
        // <div className="flex flex-col items-center justify-center gap-2 pt-[15%] pb-[15%]">
        //   <img
        //     src={emptyImg}
        //     alt="catimage"
        //     className="w-2/5 max-w-sm min-w-[10rem]"
        //   />
        //   <p className="h5">「列表」畫面施工中 Zzz ...</p>
        // </div>
        <div className="overflow-y-auto h-full order-3 sm:order-1">
          <RWDTable
            data={showData.length > 0 ? showData : events}
            columnsPC={columnsPC}
            columnsMobile={columnsMobile}
            // actions={actions}
            cardTitleKey={"title"}
            tableMinWidth={800}
            isLoading={isLoading}
            // handleActionClick={handleActionClick}
          />
        </div>
      ) : (
        <Calendar
          data={events}
          viewOptions={["dayGridMonth", "dayGridWeek"]}
          _dayMaxEvents={3}
          navLinkDayClick={(date, jsEvent) => {}}
          eventContent={!isTargetScreen && CustomEventContent}
        />
      )}

      {/* Floating Action Button */}
      <FloatingActionButton
        btnGroup={btnGroup}
        handleActionClick={handleOpenSearch}
      />

      {/* Backdrop */}
      <Backdrop sx={{ color: "#fff", zIndex: 1400 }} open={isLoading}>
        <LoadingTwo />
      </Backdrop>
    </>
  );
};

export default AnomalyReport;

const CustomEventContent = ({ event }) => {
  const extendedProps = event._def.extendedProps;
  // console.log(extendedProps);
  return (
    <>
      <div>
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
          title={
            <div className="p-2">
              <p className="text-xl">{extendedProps.user.nickname}</p>
              <p className="text-base">{event.startStr}</p>
              <p className="text-base">
                異常狀態 :{" "}
                {extendedProps.anomaly
                  ? "異常"
                  : !extendedProps.anomaly
                  ? "已補單"
                  : "正常"}
              </p>
              <p className="text-base">上班時間 : {extendedProps.since}</p>
              <p className="text-base">下班時間 : {extendedProps.until}</p>
            </div>
          }
        >
          <span>{event.title}</span>
        </Tooltip>
      </div>
    </>
  );
};
