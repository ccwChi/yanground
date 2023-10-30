import React, { useCallback, useEffect, useState } from "react";
import PageTitle from "../../components/Guideline/PageTitle";
import FloatingActionButton from "../../components/FloatingActionButton/FloatingActionButton";
import TableTabber from "../../components/Tabbar/TableTabber";
import RWDTable from "../../components/RWDTable/RWDTable";
import Pagination from "../../components/Pagination/Pagination";
import AddIcon from "@mui/icons-material/Add";
import FolderCopyIcon from "@mui/icons-material/FolderCopy";
import WorkHistoryIcon from "@mui/icons-material/WorkHistory";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import EditIcon from "@mui/icons-material/Edit";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import { getData, postData } from "../../utils/api";
import { useSnackbar } from "notistack";
import EditModal from "./UsersModal";

const Users = () => {
  // cat = Category 設置 tab 分類
  const [cat, setCat] = useState(null);
  // API List Data
  const [apiData, setApiData] = useState(null);
  // isLoading 等待請求 api
  const [isLoading, setIsLoading] = useState(false);
  // Page 頁數設置
  const [page, setPage] = useState(0);
  // rows per Page 多少筆等同於一頁
  const [rowsPerPage, setRowsPerPage] = useState(10);
  // ApiUrl
  const furl = "user";
  const apiUrl = `${furl}?p=${page + 1}&s=${rowsPerPage}`;
  // ModalValue 控制開啟的是哪一個 Modal
  const [modalValue, setModalValue] = useState(false);
  // 傳送額外資訊給 Modal
  const [deliverInfo, setDeliverInfo] = useState(null);
  const { enqueueSnackbar } = useSnackbar();

  // Tab 列表對應 api 搜尋參數
  const tabGroup = [
    { f: "", text: "一般排序" },
    { f: "inprogress", text: "部門排序" },
  ];

  // 對照 api table 所顯示 key
  const columns = [
    { key: "displayName", label: "line名稱" },
    { key: "nickname", label: "暱稱" },
    //{ key: "department.name", label: "部門" },
  ];

  // edit = 編輯名稱
  const actions = [{ value: "edit", icon: <EditIcon /> }];

  // 取得列表資料
  useEffect(() => {
    getApiList(apiUrl);
  }, [apiUrl]);

  const getApiList = useCallback((url) => {
    setIsLoading(true);
    getData(url).then((result) => {
      setIsLoading(false);
      const data = result.result;
      setApiData(data);
    });
  }, []);

  // 傳遞給後端資料
  const sendDataToBackend = (fd, mode, otherData) => {
    let url = "";
    let message = [];
    if (mode === "edit") {
      url = "user" + "/" + otherData;
      message = ["資料修改成功！"];
    }
    postData(url, fd).then((result) => {
      if (result.status) {
        enqueueSnackbar(message[0], {
          variant: "success",
          anchorOrigin: {
            vertical: "bottom", // 垂直，可選：'top', 'bottom'
            horizontal: "center", // 水平，可選：'left', 'center', 'right'
          },
          autoHideDuration: 3000,
        });
        getApiList(apiUrl);
      } else {
        enqueueSnackbar("發生錯誤，請洽詢資工部", {
          variant: "error",
          anchorOrigin: {
            vertical: "bottom", // 垂直，可選：'top', 'bottom'
            horizontal: "center", // 水平，可選：'left', 'center', 'right'
          },
          autoHideDuration: 3000,
        });
      }
    });
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
    const dataMode = event.currentTarget.getAttribute("data-mode");
    const dataValue = event.currentTarget.getAttribute("data-value");
    setModalValue(dataMode);
    console.log(dataValue);
    setDeliverInfo(
      dataValue ? apiData?.content.find((item) => item.id === dataValue) : null
    );
    // console.log("Action button clicked", dataMode, dataValue);
  };

  // 關閉 Modal 清除資料
  const onClose = () => {
    setModalValue(false);
    setDeliverInfo(null);
  };

  // modal 開啟參數與顯示標題
  const modalConfig = [
    {
      modalValue: "edit",
      modalComponent: (
        <EditModal
          title="編輯個人資料"
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
        title="職員清單"
        //btnGroup={btnGroup}
        handleActionClick={handleActionClick}
      />

      {/* TabBar */}
      <TableTabber tabGroup={tabGroup} setCat={setCat} />

      {/* Table */}
      <div className="overflow-y-auto h-full order-3 sm:order-1">
        {/* {apiData && <pre>{JSON.stringify(apiData, null, 2)}</pre>} */}
        <RWDTable
          data={apiData?.content}
          columns={columns}
          actions={actions}
          cardTitleKey={"displayName"}
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

      {/* Modal */}
      {config && config.modalComponent}
    </>
  );
};

export default Users;
