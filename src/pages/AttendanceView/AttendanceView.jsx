import React, { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useForm, Controller, FormProvider } from "react-hook-form";
// date-fns
import { parseISO, format } from "date-fns";
import { zhTW } from "date-fns/locale";
import { utcToZonedTime } from "date-fns-tz";
// FontAwesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMapLocationDot } from "@fortawesome/free-solid-svg-icons";
// MUI
import {
  Checkbox,
  TablePagination,
  Tooltip,
  useMediaQuery,
} from "@mui/material";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import CircularProgress from "@mui/material/CircularProgress";
import Backdrop from "@mui/material/Backdrop";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import TuneIcon from "@mui/icons-material/Tune";
import AssignmentReturnIcon from "@mui/icons-material/AssignmentReturn";
// Components
import PageTitle from "../../components/Guideline/PageTitle";
import Calendar from "../../components/Calendar/Calendar";
import InputTitle from "../../components/Guideline/InputTitle";
import DatePicker from "../../components/DatePicker/DatePicker";
import FloatingActionButton from "../../components/FloatingActionButton/FloatingActionButton";
import { LoadingFour } from "../../components/Loader/Loading";
import TableTabbar from "../../components/Tabbar/TableTabbar";
// Hooks
import { useNotification } from "../../hooks/useNotification";
// Utils
import { getData, postData } from "../../utils/api";
// Others
import {
  PunchLocationModal,
  LeaveApplicationModal,
} from "./AttendanceViewModal";
// Table 及 Table 所需按鈕、頁數
import RWDTable from "../../components/RWDTable/RWDTable";

// 用網址傳參數
import useNavigateWithParams from "../../hooks/useNavigateWithParams";
import ControlledDatePicker from "../../components/DatePicker/ControlledDatePicker";
import Pagination from "../../components/Pagination/Pagination";

// MenuItem 選單樣式調整
const ITEM_HEIGHT = 36;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      Width: 250,
    },
  },
};

// 篩選 default 值
const defaultValue = {
  // queryString: "",
  // agents: [],
  departments: [],
  users: [],
  types: [],
  since: null,
  until: null,
};

const AttendanceView = () => {
  const isTargetScreen = useMediaQuery("(max-width:991.98px)");
  const navigateWithParams = useNavigateWithParams();
  const navigate = useNavigate();
  const showNotification = useNotification();

  // 解析網址取得參數
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  // Page 頁數設置
  const [page, setPage] = useState(
    queryParams.has("p") && !isNaN(+queryParams.get("p"))
      ? +queryParams.get("p") - 1
      : 0
  );
  // rows per Page 多少筆等同於一頁
  const [rowsPerPage, setRowsPerPage] = useState(
    queryParams.has("s") && !isNaN(+queryParams.get("s"))
      ? +queryParams.get("s")
      : 10
  );

  // const modeValue = queryParams.get("mode");
  // API List Data
  const [apiData, setApiData] = useState([]);
  // ModalValue 控制開啟的是哪一個 Modal
  const [modalValue, setModalValue] = useState(false);
  // 傳送額外資訊給 Modal
  const [deliverInfo, setDeliverInfo] = useState(null);
  // 搜尋篩選清單
  const [filters, setFilters] = useState(defaultValue);
  const [departmentList, setDepartmentList] = useState([]);
  const [userList, setUserList] = useState([]);
  const [typeList, setTypeList] = useState([]);
  // 傳遞至後端是否完成 Flag
  const [sendBackFlag, setSendBackFlag] = useState(false);
  // isLoading 等待請求 API
  const [isLoading, setIsLoading] = useState(true);
  // SearchDialog Switch
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  // cat = Category 設置 tab 分類
  const [cat, setCat] = useState("table");
  // 搜尋日期
  const [since, setSince] = useState(null);
  const [until, setUntil] = useState(null);
  const [type, setType] = useState("ATTENDANCE");
  // ApiUrl
  const furl = "attendance";
  const [apiUrl, setApiUrl] = useState("");

  // 預設搜尋篩選內容
  const getValueOrFilter = (queryParam, filter) => {
    const value = queryParams.get(queryParam);
    if (
      queryParam === "users" ||
      queryParam === "agents" ||
      queryParam === "departments" ||
      queryParam === "types"
    ) {
      return !!value ? value.split(",").map(String) : filter;
    } else {
      return !!value ? value : filter;
    }
  };

  const defaultValues = {
    // queryString: getValueOrFilter("queryString", filters.queryString),
    // agents: getValueOrFilter("agents", filters.agents),
    departments: getValueOrFilter("departments", filters.departments),
    users: getValueOrFilter("users", filters.users),
    types: getValueOrFilter("types", filters.types),
    since: queryParams.get("since") ? new Date(queryParams.get("since")) : null,
    until: queryParams.get("until") ? new Date(queryParams.get("until")) : null,
  };

  // 使用 useForm Hook 來管理表單狀態和驗證
  const methods = useForm({
    defaultValues,
  });
  const {
    control,
    reset,
    watch,
    setValue,
    formState: { isDirty },
    handleSubmit,
  } = methods;
  const watchSinceDate = watch("since");
  const watchDepartment = watch("departments");

  // 更改部門之後，選擇人員部分清空
  useEffect(() => {
    if (watchDepartment.length === 0) {
      setValue("users", []);
    }
  }, [watchDepartment]);

  // 取得特定部門人員清單
  useEffect(() => {
    if (!!watchDepartment) {
      const promises = watchDepartment.map((departId) => {
        const departurl = `department/${departId}/staff`;
        return getData(departurl).then((result) => {
          return result.result ? result.result : [];
        });
      });
      Promise.all(promises)
        .then((results) => {
          const combinedUserList = results.reduce(
            (acc, userList) => acc.concat(userList),
            []
          );
          setUserList(combinedUserList);
        })
        .catch((error) => {
          setUserList([]);
        });
    }
  }, [watchDepartment]);

  useEffect(() => {
    const startedFromDate = new Date(watchSinceDate);
    const startedToDate = new Date(watch("until"));

    // 檢查 startedFrom 是否大於 startedTo
    if (startedFromDate > startedToDate) {
      setValue("until", null);
    }
  }, [watchSinceDate, setValue]);

  // 轉換時間
  const formatDateTime = (dateTime) => {
    const parsedDateTime = parseISO(dateTime);
    const formattedDateTime = format(
      utcToZonedTime(parsedDateTime, "Asia/Taipei"),
      "yyyy-MM-dd HH:mm",
      {
        locale: zhTW,
      }
    );
    return formattedDateTime;
  };

  // 更新 ApiUrl
  useEffect(() => {
    let constructedApiUrl = `${furl}?p=${page + 1}&s=${rowsPerPage}`;

    const searchquery = Object.fromEntries(queryParams.entries());
    for (const key in searchquery) {
      if (
        key !== "p" &&
        key !== "s" &&
        searchquery[key] !== undefined &&
        searchquery[key] !== null &&
        searchquery[key] !== ""
      ) {
        constructedApiUrl += `&${key}=${encodeURIComponent(searchquery[key])}`;
      }
    }

    setApiUrl(constructedApiUrl);
  }, [page, rowsPerPage, queryParams]);

  // 取得列表資料
  useEffect(() => {
    if (apiUrl !== "") {
      getApiList(apiUrl);
    }
  }, [apiUrl]);
  const getApiList = useCallback((url) => {
    setIsLoading(true);
    getData(url).then((result) => {
      setIsLoading(false);
      if (result.result) {
        const data = result.result;
        const transformedData = {
          ...data,
          content: data.content.map(
            ({
              id,
              type,
              anomaly,
              date,
              since,
              until,
              user,
              clockPunchIn,
              clockPunchOut,
            }) => ({
              id,
              anomalyType: type,
              anomalyReason: anomaly?.chinese || "",
              date,
              title: user.department.name + " - " + user.nickname,
              anomalyState:
                anomaly === null
                  ? { text: "✔️", id: "3" }
                  : { text: "❌", id: "2" },
              since: since ? formatDateTime(since) : "-",
              until: until ? formatDateTime(until) : "-",
              color: getflagColorandText(anomaly).color,
              user: {
                id: user.id,
                nickname: user.nickname,
                fullName: user.lastname + user.firstname,
                department: user.department.name,
                departmentId: user.department.id,
              },
              clockPunchIn,
              clockPunchOut,
            })
          ),
        };
        setApiData(transformedData);
        if (page > data?.totalPages) {
          setPage(0);
          setRowsPerPage(10);
          navigateWithParams(1, 10);
        }
      } else {
        setApiData([]);
      }
      setIsLoading(false);
    });
  }, []);

  // 區塊功能按鈕清單
  const btnGroup = [
    {
      mode: "leaveapplication",
      icon: <AssignmentReturnIcon fontSize="small" />,
      text: "提出請假申請",
      variant: "contained",
      color: "primary",
      fabVariant: "success",
      fab: <AssignmentReturnIcon />,
    },
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

  const getflagColorandText = (anomaly) => {
    if (anomaly === null) {
      return { color: "#25B09B", text: "考勤正常" };
    } else if (typeof anomaly === "object") {
      return { color: "#F03355", text: anomaly.chinese };
    } else {
      return null;
    }
  };

  // 取得部門清單 & 考勤類別清單
  useEffect(() => {
    const departurl = "department?p=1&s=500";
    const typeurl = "attendanceType?p=1&s=500";
    getData(departurl).then((result) => {
      if (result.result) {
        const data = result.result.content;
        setDepartmentList(data);
      } else {
        setDepartmentList([]);
      }
    });
    getData(typeurl).then((result) => {
      if (result.result) {
        const data = result.result;
        setTypeList(data);
      } else {
        setTypeList([]);
      }
    });
  }, []);

  // useEffect(() => {
  // 	if (tabCat === "calendar") {
  // 		setCat("calendar");
  // 	}
  // }, [tabCat]);

  // Tab 列表對應 api 搜尋參數
  const tabGroup = [
    { f: "table", text: "列表" },
    { f: "calendar", text: "月曆" },
  ];
  // -----------------------------------------------------
  // 對照 api table 所顯示 key
  const columnsPC = [
    { key: "anomalyType", label: "考勤假別", size: "10%" },
    { key: ["user", "fullName"], label: "姓名", size: "10%" },
    { key: ["user", "department"], label: "部門", size: "10%" },
    { key: "date", label: "日期", size: "14%" },
    { key: ["anomalyState", "text"], label: "狀態", size: "6%" },
    { key: "anomalyReason", label: "異常原因", size: "14%" },
    { key: "since", label: "上班時間", size: "12%" },
    { key: "until", label: "下班時間", size: "12%" },
  ];

  const columnsMobile = [
    { key: "anomalyType", label: "考勤假別" },
    { key: ["user", "fullName"], label: "姓名" },
    { key: ["user", "nickname"], label: "暱稱" },
    { key: ["user", "department"], label: "部門" },
    { key: "date", label: "日期" },
    { key: ["anomalyState", "text"], label: "狀態" },
    { key: "anomalyReason", label: "異常原因" },
    { key: "since", label: "上班時間" },
    { key: "until", label: "下班時間" },
  ];

  const actions = [
    {
      value: "location",
      icon: <FontAwesomeIcon icon={faMapLocationDot} size={"lg"} />,
      title: "打卡地點",
    },
  ];

  // 設置頁數
  const handleChangePage = useCallback(
    (event, newPage) => {
      setPage(newPage);
      navigateWithParams(newPage + 1, rowsPerPage);
    },
    [rowsPerPage]
  );

  // 設置每頁顯示並返回第一頁
  const handleChangeRowsPerPage = (event) => {
    const targetValue = parseInt(event.target.value, 10);
    setRowsPerPage(targetValue);
    setPage(0);
    navigateWithParams(1, targetValue);
  };

  //  下面為搜索專用
  // 開啟 SearchDialog
  const handleOpenSearch = () => {
    setSearchDialogOpen(true);
  };
  // 關閉 SearchDialog
  const handleCloseSearch = () => {
    reset(defaultValues);
    setSearchDialogOpen(false);
  };
  // 恢復為上一次搜尋狀態
  const handleCoverDialog = () => {
    reset(defaultValues);
  };
  // 重置 SearchDialog
  const handleClearSearch = () => {
    reset(defaultValue);
    setFilters(defaultValue);
    setSearchDialogOpen(false);
    navigate(`?p=1&s=10`);
  };
  // 搜尋送出
  const onSubmit = (data) => {
    setFilters(data);
    setSearchDialogOpen(false);

    const fullDepartMember = [];
    if (data.departments.length > 0 && data.users.length === 0) {
      const allMember = userList.map((user) => user.id);
      fullDepartMember.push(...allMember);
      data.users = fullDepartMember;
    }

    const fd = new FormData();
    for (let key in data) {
      switch (key) {
        // case "users":
        // 	fd.append(key, JSON.stringify(data[key]));
        // 	break;
        case "since":
        case "until":
          if (data[key] !== null) {
            fd.append(key, format(data[key], "yyyy-MM-dd"));
          }
          break;
        default:
          if (data[key] !== null) {
            fd.append(key, data[key]);
          }
          break;
      }
    }

    const searchParams = new URLSearchParams(fd);
    setPage(0);
    setRowsPerPage(10);
    navigate(`?p=1&s=10&${searchParams.toString()}`);
  };
  // 到上面為止都是搜索功能 //

  // 當活動按鈕點擊時開啟 modal 並進行動作
  const handleActionClick = (event) => {
    event.stopPropagation();
    const dataMode = event.currentTarget.getAttribute("data-mode");
    const dataValue = event.currentTarget.getAttribute("data-value");
    setModalValue(dataMode);
    setDeliverInfo(
      dataValue ? apiData?.content?.find((item) => item.id === dataValue) : null
    );
  };

  // 傳遞給後端資料
  const sendDataToBackend = (fd, mode, otherData) => {
    setSendBackFlag(true);
    let url = "supervisor/attendanceForm";
    let message = [];
    switch (mode) {
      case "create":
        message = [`「${otherData}」的假單建立成功！`];
        break;
      case "arrangeLeave":
        url = `user/${otherData[1]}/arrangedLeave/${otherData[2]}`;
        message = [`「${otherData[0]}」的假單建立成功！`];
        break;
      default:
        break;
    }
    postData(url, fd).then((result) => {
      if (result.status) {
        showNotification(message[0], true);
        getApiList(apiUrl);
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
  };

  // 關閉 Modal 清除資料
  const onClose = () => {
    setModalValue(false);
    setDeliverInfo(null);
  };

  // modal 開啟參數與顯示標題
  const modalConfig = [
    {
      modalValue: "location",
      modalComponent: (
        <PunchLocationModal
          title={"打卡地點"}
          deliverInfo={deliverInfo}
          onClose={onClose}
        />
      ),
    },
    {
      modalValue: "leaveapplication",
      modalComponent: (
        <LeaveApplicationModal
          title={"假單申請"}
          departmentsList={departmentList}
          attendanceTypesList={typeList.filter(
            (obj) => obj.value !== "ATTENDANCE"
          )}
          sendDataToBackend={sendDataToBackend}
          onClose={onClose}
        />
      ),
    },
  ];

  const config = modalValue
    ? modalConfig.find((item) => item.modalValue === modalValue)
    : null;

  // -----------------------------------------------------
  return (
    <>
      {/* PageTitle & Search */}
      <PageTitle
        title={"考勤檢視"}
        description="此頁面是用於查看整個部門或全體員工的考勤資訊與狀態，同時可檢視員工上下班打卡地點。(✔️= 正常, ❌= 異常)"
        btnGroup={btnGroup}
        handleActionClick={handleActionClick}
        // 搜尋模式
        searchMode
        // 下面參數前提都是 searchMode = true
        searchDialogOpen={searchDialogOpen}
        handleOpenDialog={handleOpenSearch}
        handleCloseDialog={handleCloseSearch}
        handleCoverDialog={handleCoverDialog}
        handleConfirmDialog={handleSubmit(onSubmit)}
        handleClearDialog={handleClearSearch}
        haveValue={filters === defaultValue}
        isDirty={isDirty}
      >
        <FormProvider {...methods}>
          <form className="flex flex-col gap-2">
            <InputTitle
              title={"部門選擇"}
              classnames="whitespace-nowrap min-w-[70px]"
              pb={false}
              required={false}
            />
            <Controller
              name="departments"
              control={control}
              render={({ field }) => (
                <Select
                  className="inputPadding pe-3"
                  displayEmpty
                  MenuProps={MenuProps}
                  multiple
                  {...field}
                  renderValue={(selected) => {
                    if (selected.length === 0) {
                      return (
                        <span className="text-neutral-400 font-light">
                          請選擇部門
                        </span>
                      );
                    }

                    const roleNames = selected.map((roleId) => {
                      const role = departmentList?.find((r) => r.id === roleId);
                      return role ? role.name : null;
                    });
                    return roleNames.join(", ");
                  }}
                >
                  {departmentList?.map((dep) => (
                    <MenuItem key={dep.id} value={dep.id}>
                      <Checkbox
                        checked={watch("departments").indexOf(dep.id) > -1}
                      />
                      {dep.name}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
            <InputTitle
              title={"人員選擇"}
              classnames="whitespace-nowrap min-w-[70px]"
              pb={false}
              required={false}
            />

            <Controller
              name="users"
              control={control}
              disabled={watchDepartment.length === 0}
              render={({ field }) => (
                <Select
                  className="inputPadding pe-3"
                  multiple
                  displayEmpty
                  MenuProps={MenuProps}
                  renderValue={(selected) => {
                    if (selected.length === 0) {
                      return (
                        <span className="text-neutral-400 font-light">
                          請先選擇部門，再選擇人員
                        </span>
                      );
                    }
                    const roleNames = selected.map((roleId) => {
                      const role = userList?.find((r) => r.id === roleId);
                      return role ? role.lastname + role.firstname : null;
                    });
                    return roleNames.join(", ");
                  }}
                  {...field}
                >
                  {userList?.map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      <Checkbox
                        checked={watch("users").indexOf(user.id) > -1}
                      />
                      {user.lastname + user.firstname}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
            <InputTitle
              title={"考勤類別"}
              classnames="whitespace-nowrap min-w-[70px]"
              pb={false}
              required={false}
            />
            <Controller
              name="types"
              control={control}
              render={({ field }) => (
                <Select
                  className="inputPadding pe-3"
                  multiple
                  displayEmpty
                  MenuProps={MenuProps}
                  renderValue={(selected) => {
                    if (selected.length === 0) {
                      return (
                        <span className="text-neutral-400 font-light">
                          請選擇考勤類別
                        </span>
                      );
                    }

                    const roleNames = selected.map((roleId) => {
                      const role = typeList?.find((r) => r.value === roleId);
                      return role ? role.chinese : null;
                    });
                    return roleNames.join(", ");
                  }}
                  {...field}
                >
                  {typeList?.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      <Checkbox
                        checked={watch("types").indexOf(type.value) > -1}
                      />
                      {type.chinese}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
            <div className="inline-flex items-center">
              <InputTitle
                title={"日期區間"}
                classnames="whitespace-nowrap min-w-[70px]"
                pb={false}
                required={false}
              />
            </div>
            <div className="inline-flex items-center">
              <InputTitle
                title={"起"}
                classnames="whitespace-nowrap me-2"
                pb={false}
                required={false}
              />
              <ControlledDatePicker name="since" maxDate={new Date()} />
            </div>
            <div className="inline-flex items-center">
              <InputTitle
                title={"迄"}
                classnames="whitespace-nowrap me-2"
                pb={false}
                required={false}
              />
              <ControlledDatePicker
                name="until"
                minDate={watchSinceDate}
                disabled={!watchSinceDate}
                maxDate={new Date()}
              />
            </div>
          </form>
        </FormProvider>
      </PageTitle>

      {/* TabBar */}
      {/* <TableTabbar tabGroup={tabGroup} setCat={setCat} cat={cat} /> */}

      {/* Calendar */}
      {/* {cat === "table" ? (
				<>
					<div className="overflow-y-auto flex-1 h-full order-3 sm:order-1"> */}
      <RWDTable
        data={apiData?.content || []}
        columnsPC={columnsPC}
        columnsMobile={columnsMobile}
        actions={actions}
        cardTitleKey={"title"}
        tableMinWidth={1024}
        isLoading={isLoading}
        handleActionClick={handleActionClick}
      />
      {/* </div> */}
      {/* Pagination */}
      {/* Pagination */}
      <Pagination
        totalElement={apiData ? apiData.totalElements : 0}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
      {/* </> */}
      {/* ) : (
				<Calendar
					data={events}
					viewOptions={["dayGridMonth", "dayGridWeek"]}
					_dayMaxEvents={3}
					navLinkDayClick={(date, jsEvent) => {}}
					eventContent={(e) => CustomEventContent(e, isTargetScreen)}
				/>
			)} */}

      {/* Floating Action Button */}
      <FloatingActionButton
        btnGroup={btnGroup}
        handleActionClick={handleOpenSearch}
      />

      <Backdrop sx={{ color: "#fff", zIndex: 1400 }} open={sendBackFlag}>
        <LoadingFour />
      </Backdrop>

      {/* Modal */}
      {config && config.modalComponent}
    </>
  );
};

export default AttendanceView;

const CustomEventContent = ({ event, isTargetScreen }) => {
  const extendedProps = event._def.extendedProps;
  // if (isTargetScreen) {
  //   return null;
  // }
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
                考勤假別 : {extendedProps.anomalyType?.chinese || ""}
              </p>
              <p className="text-base">
                異常狀態 : {extendedProps.anomalyState.id === "2" && "異常"}
                {extendedProps.anomalyState.id === "3" && "正常"}
              </p>
              <p className="text-base">上班時間 : {extendedProps.since}</p>
              <p className="text-base">下班時間 : {extendedProps.until}</p>
              <p className="text-base">
                異常原因 :{" "}
                {extendedProps?.anomaly ? extendedProps?.anomaly.chinese : "-"}
              </p>
            </div>
          }
        >
          <span>{event.title}</span>
        </Tooltip>
      </div>
    </>
  );
};
