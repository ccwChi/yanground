import React, { useCallback, useEffect, useState } from "react";
import PageTitle from "../../components/Guideline/PageTitle";
import FloatingActionButton from "../../components/FloatingActionButton/FloatingActionButton";
import TableTabber from "../../components/Tabbar/TableTabber";
import RWDTable from "../../components/RWDTable/RWDTable";
import Pagination from "../../components/Pagination/Pagination";
import AddIcon from "@mui/icons-material/Add";
import CommentIcon from "@mui/icons-material/Comment";
import FolderCopyIcon from "@mui/icons-material/FolderCopy";
import WorkHistoryIcon from "@mui/icons-material/WorkHistory";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import EditIcon from "@mui/icons-material/Edit";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import { getData, postBodyData, postData } from "../../utils/api";
import { UpdatedModal, TaskModal } from "./SummaryModal";
import { useNotification } from "../../hooks/useNotification";

const ConstructionSummary = () => {
  const showNotification = useNotification();

  // cat = Category 設置 tab 分類
  const [cat, setCat] = useState(null);
  // API List Data
  const [apiData, setApiData] = useState(null);
  // isLoading 等待請求 api
  const [isLoading, setIsLoading] = useState(true);
  // Page 頁數設置
  const [page, setPage] = useState(0);
  // rows per Page 多少筆等同於一頁
  const [rowsPerPage, setRowsPerPage] = useState(10);
  // ApiUrl
  const furl = "constructionSummary";
  const apiUrl = `${furl}?p=${page + 1}&s=${rowsPerPage}`;
  // ModalValue 控制開啟的是哪一個 Modal
  const [modalValue, setModalValue] = useState(false);
  // 傳送額外資訊給 Modal
  const [deliverInfo, setDeliverInfo] = useState(null);

  // Tab 列表對應 api 搜尋參數
  const tabGroup = [
    { f: "", text: "全部" },
    // { f: "inprogress", text: "進行中" },
    // { f: "unstarted", text: "尚未開始" },
    // { f: "end", text: "已結束" },
  ];

  // 上方區塊功能按鈕清單
  const btnGroup = [
    {
      mode: "create",
      icon: <AddCircleIcon fontSize="small" />,
      text: "新增清單",
      variant: "contained",
      color: "primary",
      fabVariant: "success",
      fab: <AddIcon fontSize="large" />,
    },
  ];

  // 對照 api table 所顯示 key
  const columns = [
    { key: "id", label: "系統ID" },
    { key: "name", label: "名稱" },
    { key: "rocYear", label: "年度" },
    //{ key: `${constructionJob.name}`, label: "類別" },
  ];

  const actions = [
    { value: "edit", icon: <EditIcon />, title: "編輯清單名稱" },
    { value: "task", icon: <CommentIcon />, title: "清單工項編輯" },
  ];

  // 取得列表資料
  useEffect(() => {
    getApiList(apiUrl);
  }, [apiUrl]);
  const getApiList = useCallback((url) => {
    setIsLoading(true);
    getData(url).then((result) => {
      setIsLoading(false);
      const data = result.result;
      //console.log(result.result.content);
      setApiData(data);
    });
  }, []);

  // 傳遞給後端資料
  const sendDataToBackend = (fd, mode, otherData) => {
    let url = "";
    let message = [];
    switch (mode) {
      case "create":
        url = "constructionSummary";
        message = ["清單新增成功！"];
        break;
      case "edit":
        url = "constructionSummary" + "/" + otherData;
        message = ["清單修改成功！"];
        break;
      case "task":
        url = "constructionSummary" + "/" + otherData + "/" + "tasks";
        message = ["清單細項送出成功！"];
        break;
      default:
        break;
    }
    if (mode === "create" || mode === "edit") {
      postData(url, fd).then((result) => {
        if (result.status) {
          showNotification(message[0], true);
          getApiList(apiUrl);
          onClose();
        } else if (result.result.response === 400) {
          //console.log(result.result);
          showNotification("已有重複施工清單名稱", false);
          //目前唯一會導致400的原因只有名稱重複，大概吧
        } else {
          showNotification("沒有修改權限", false);
          //目前測試需有資訊才能修改
          //console.log(result);
        }
      });
    } else if (mode === "task") {
      postBodyData(url, fd).then((result) => {
        //console.log(result);
        if (result.status) {
          showNotification(message[0], true);
          getApiList(apiUrl);
          onClose();
        } else if (result.result.response !== 200) {
          //console.log(result.result);
          showNotification("權限不足", false);
        }
      });
    }
    // for (var pair of fd.entries()) {
    //   console.log(pair);
    // }
  };

  // 設置頁數
  const handleChangePage = useCallback((event, newPage) => {
    setPage(newPage);
  }, []);

  // 設置每頁顯示並返回第一頁
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // 當活動按鈕點擊時開啟 modal 並進行動作
  const handleActionClick = (event) => {
    event.stopPropagation();
    const dataMode = event.currentTarget.getAttribute("data-mode"); //在table的component裡讀取該選擇 如edit create
    const dataValue = event.currentTarget.getAttribute("data-value"); //在table的component裡讀取該筆資料id
    setModalValue(dataMode);
    setDeliverInfo(
      dataValue ? apiData.content.find((item) => item.id === dataValue) : ""
    );
  };

  // 關閉 Modal 清除資料
  const onClose = () => {
    setModalValue(false);
    setDeliverInfo(null);
  };

  // modal 開啟參數與顯示標題
  const modalConfig = [
    {
      modalValue: "create",
      modalComponent: (
        <UpdatedModal
          title="新增施工清單"
          sendDataToBackend={sendDataToBackend}
          onClose={onClose}
        />
      ),
    },
    {
      modalValue: "edit",
      modalComponent: (
        <UpdatedModal
          title="修改施工清單"
          deliverInfo={deliverInfo}
          sendDataToBackend={sendDataToBackend}
          onClose={onClose}
        />
      ),
    },
    {
      modalValue: "task",
      modalComponent: (
        <TaskModal
          title="施工清單工項執行"
          deliverInfo={deliverInfo}
          sendDataToBackend={sendDataToBackend}
          onClose={onClose}
        />
      ),
    },
  ];
  const config = modalValue
    ? modalConfig.find((item) => item.modalValue === modalValue)
    : null;

  return (
    <>
      {/* PageTitle */}
      <PageTitle
        title="施工清單"
        btnGroup={btnGroup}
        handleActionClick={handleActionClick}
        isLoading={!isLoading}
      />

      {/* TabBar */}
      <TableTabber tabGroup={tabGroup} setCat={setCat} />

      {/* Table */}
      <div className="overflow-y-auto sm:overflow-y-hidden h-full order-3 sm:order-1">
        <RWDTable
          data={apiData?.content ? apiData.content : null}
          columnsPC={columns}
          columnsMobile={columns}
          actions={actions}
          cardTitleKey={"name"}
          tableMinWidth={540}
          isLoading={isLoading}
          handleActionClick={handleActionClick}
        />
      </div>

      {/* Pagination */}
      <Pagination
        totalElement={apiData ? apiData?.totalElements : 0}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      {/* Floating Action Button */}
      <FloatingActionButton
        btnGroup={btnGroup}
        handleActionClick={handleActionClick}
      />

      {/* Modal */}
      {config && config.modalComponent}
    </>
  );
};

export default ConstructionSummary;
