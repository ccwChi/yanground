import React from "react";
import PageTitle from "../../components/Guideline/PageTitle";
import AssignmentReturnIcon from "@mui/icons-material/AssignmentReturn";
import TuneIcon from "@mui/icons-material/Tune";
import DeleteIcon from "@mui/icons-material/Delete";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import UserLeaveModal from "../../components/UserLeaveModal/UserLeaveModal";
import { useState } from "react";
import RWDTable from "../../components/RWDTable/RWDTable";
import { useLocation } from "react-router-dom";
import useNavigateWithParams from "../../hooks/useNavigateWithParams";
import { useNotification } from "../../hooks/useNotification";
import { useEffect } from "react";
import { useCallback } from "react";
import { deleteData, getData } from "../../utils/api";
// date-fns
import { parseISO, format } from "date-fns";
import { zhTW } from "date-fns/locale";
import { utcToZonedTime } from "date-fns-tz";
// MUI
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import Pagination from "../../components/Pagination/Pagination";
import { Backdrop, TablePagination } from "@mui/material";
import AlertDialog from "../../components/Alert/AlertDialog";
import { LoadingFour } from "../../components/Loader/Loading";
import MultipleFAB from "../../components/FloatingActionButton/MultipleFAB";

const UserLeave = () => {
  // 解析網址取得參數
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const navigateWithParams = useNavigateWithParams();
  const showNotification = useNotification();

  // API List Data
  const [apiData, setApiData] = useState(null);
  const [filterData, setFilterData] = useState([]);

  // isLoading 等待請求 api
  const [isLoading, setIsLoading] = useState(true);
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
  // ModalValue 控制開啟的是哪一個 Modal
  const [modalValue, setModalValue] = useState(false);
  // 傳送額外資訊給 Modal
  const [deliverInfo, setDeliverInfo] = useState(null);
  // 部門清單
  const [departmentList, setDepartmentList] = useState([]);
  // 人員清單
  const [usersList, setUsersList] = useState([]);
  // 考勤別清單
  const [alertOpen, setAlertOpen] = useState(false);

  /* 打 api 的載入時間用 */
  const [sendBackFlag, setSendBackFlag] = useState(false);

  const [reflesh, setReflesh] = useState(true);
  const [attendanceTypeList, setAttendanceTypeList] = useState([]);
  const [currentPageData, setCurrentPageData] = useState([]);

  const [isOpen, setIsOpen] = useState(false);

  const apiUrl = `me/leave?p=1&s=5000`;

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

  // 取得請假類別
  useEffect(() => {
    getData("attendanceType").then((result) => {
      if (result.result) {
        const data = result.result;
        const filterData = data.filter(
          (i) => i.value !== "ATTENDANCE" && i.value !== "ARRANGED_LEAVE"
        );
        setAttendanceTypeList(filterData);
      } else {
        setAttendanceTypeList([]);
      }
    });
  }, []);

  // 取得列表資料
  useEffect(() => {
    if (reflesh) {
      getApiList(apiUrl);
      setReflesh(false);
    }
  }, [apiUrl, reflesh]);
  const getApiList = useCallback(
    (url) => {
      setIsLoading(true);
      getData(url).then((result) => {
        setIsLoading(false);
        if (result.result) {
          const data = result.result.content;
          const transformedData = data
            .filter((item) => item.type.value !== "ARRANGED_LEAVE")
            .map((item) => ({
              spectiallyKey: item.since
                ? formatDateTime(item.since).slice(0, 10) +
                  " " +
                  item.type.chinese
                : "-",
              fullname: `${item.user.lastname}${item.user.firstname}`,
              department: item.user.department,
              id: item.id,
              date: item.date,
              attendance: item.type.chinese,
              excuse: item.excuse ? item.excuse : "",
              since: item.since ? formatDateTime(item.since) : "-",
              until: item.until ? formatDateTime(item.until) : "-",
            }))
            .sort((a, b) => {
              if (a.date < b.date) {
                return 1;
              }
              if (a.date > b.date) {
                return -1;
              }
              return 0;
            });
          // console.log("transformedData",transformedData)
          setApiData(transformedData);
          const TempCurrentPageData = transformedData.slice(
            page * rowsPerPage,
            page * rowsPerPage + rowsPerPage
          );
          setCurrentPageData(TempCurrentPageData);

          if (page >= data?.totalPages) {
            setPage(0);
            setRowsPerPage(10);
            navigateWithParams(1, 10);
          }
        } else {
          setApiData(null);
        }
      });
    },
    [page, rowsPerPage]
  );

  useEffect(() => {
    if (apiData) {
      const TempCurrentPageData = apiData.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
      );
      setCurrentPageData(TempCurrentPageData);
    }
  }, [page, rowsPerPage, apiData]);

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
  ];

  // 當活動按鈕點擊時開啟 modal 並進行動作
  const handleActionClick = (event) => {
    event.stopPropagation();
    const dataMode = event.currentTarget.getAttribute("data-mode");
    const dataValue = event.currentTarget.getAttribute("data-value");
    setModalValue(dataMode);
    setIsOpen(true);
    setDeliverInfo(
      dataValue ? apiData?.find((item) => item.id === dataValue) : null
    );
    if (dataMode === "delete") {
      setAlertOpen(true);
    }
  };

  const handleAlertClose = async (agree) => {
    if (agree) {
      deleteLeave();
    }
    setAlertOpen(false);
  };

  const deleteLeave = () => {
    setSendBackFlag(true);
    const deleteId = deliverInfo.id;
    const url = `me/leave/${deleteId}`;
    const message = "刪除該筆假單成功";
    deleteData(url).then((result) => {
      if (result.status) {
        showNotification(message, true);
        setAlertOpen(false);
        setDeliverInfo(null);
        setSendBackFlag(false);
        setAlertOpen(false);
        setReflesh(true);
      } else {
        showNotification(
          result.result.reason
            ? result.result.reason
            : result.result
            ? result.result
            : "發生無法預期的錯誤，請洽資訊部。",
          false
        );
        setAlertOpen(false);
        setSendBackFlag(false);
      }
    });
  };

  // 對照 api table 所顯示 key
  const columnsPC = [
    { key: "fullname", label: "姓名", size: "20%" },
    { key: "attendance", label: "請假假別", size: "14%" },
    { key: "since", label: "起始時間", size: "25%" },
    { key: "until", label: "結束時間", size: "25%" },
  ];
  const columnsMobile = [
    { key: "fullname", label: "姓名", size: "20%" },
    { key: "attendance", label: "請假假別", size: "14%" },
    { key: "since", label: "起始時間", size: "25%" },
    { key: "until", label: "結束時間", size: "25%" },
  ];

  // Table 操作按鈕
  const actions = [{ value: "delete", icon: <DeleteIcon />, title: "刪除" }];

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

  // 關閉 Modal 清除資料
  const onClose = () => {
    setModalValue(false);
  };

  // modal 開啟參數與顯示標題
  const modalConfig = [
    {
      modalValue: "leaveapplication",
      modalComponent: (
        <UserLeaveModal
          title={"假單申請"}
          departmentsList={departmentList}
          attendanceTypeList={attendanceTypeList}
          onClose={onClose}
          isOpen={isOpen}
          setReflesh={setReflesh}
        />
      ),
    },
  ];
  const config = modalValue
    ? modalConfig.find((item) => item.modalValue === modalValue)
    : null;

  return (
    <>
      <PageTitle
        title={"請假申請"}
        description="此頁面是用於查看自己請假清單以及請假申請用。"
        btnGroup={btnGroup}
        handleActionClick={handleActionClick}
      ></PageTitle>
      <div className="overflow-y-auto sm:overflow-y-hidden h-full order-3 sm:order-1">
        <RWDTable
          data={currentPageData ? currentPageData : []}
          columnsPC={columnsPC}
          columnsMobile={columnsMobile}
          actions={actions}
          cardTitleKey={["spectiallyKey"]}
          tableMinWidth={700}
          isLoading={isLoading}
          handleActionClick={handleActionClick}
        />
      </div>
      <TablePagination
        className="order-2"
        rowsPerPageOptions={[10, 25, 100]}
        component="div"
        count={apiData ? apiData.length : 0}
        rowsPerPage={rowsPerPage}
        page={page}
        labelRowsPerPage={"每頁行數:"}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
      {/* Modal */}
      {config && config.modalComponent}

      {/* <FloatingActionButton btnGroup={btnGroup} handleActionClick={handleActionClick} /> */}
      <MultipleFAB btnGroup={btnGroup} handleActionClick={handleActionClick} />

      <Backdrop sx={{ color: "#fff", zIndex: 1400 }} open={sendBackFlag}>
        <LoadingFour />
      </Backdrop>
      <AlertDialog
        open={alertOpen}
        onClose={handleAlertClose}
        icon={<ReportProblemIcon color="secondary" />}
        title="注意"
        content={`是否確認刪除 ${deliverInfo?.date && deliverInfo.date} 的 ${
          deliverInfo?.attendance ? `"` + deliverInfo?.attendance + `"` : ""
        } 假單`}
        disagreeText="取消"
        agreeText="確定"
      />
    </>
  );
};

export default UserLeave;
