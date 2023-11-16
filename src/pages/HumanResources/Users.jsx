import React, { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PageTitle from "../../components/Guideline/PageTitle";
import RWDTable from "../../components/RWDTable/RWDTable";
import Pagination from "../../components/Pagination/Pagination";
import EditIcon from "@mui/icons-material/Edit";
import { getData, postData } from "../../utils/api";
import { useSnackbar } from "notistack";
import EditModal from "./UsersModal";
import { useNotification } from "../../hooks/useNotification";

const Users = () => {
  const navigate = useNavigate();
  const showNotification = useNotification();

  // 解析網址取得參數
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  // cat = Category 設置 tab 分類，之後分類用
  //const [cat, setCat] = useState(null);
  // API List Data
  const [apiData, setApiData] = useState(null);
  // isLoading 等待請求 api
  const [isLoading, setIsLoading] = useState(false);
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
  // ApiUrl
  const furl = "user";
  const apiUrl = `${furl}?p=${page + 1}&s=${rowsPerPage}`;
  // 在主畫面先求得部門跟權限list再直接傳給面板
  const [departmentList, setDepartmentList] = useState(null);
  const [authorityList, setAuthorityList] = useState(null);
  // ModalValue 控制開啟的是哪一個 Modal
  const [modalValue, setModalValue] = useState(false);
  // 傳送額外資訊給 Modal
  const [deliverInfo, setDeliverInfo] = useState(null);
  const { enqueueSnackbar } = useSnackbar();

  // Tab 列表對應 api 搜尋參數
  // const tabGroup = [
  // 	{ f: "", text: "一般排序" },
  // 	{ f: "inprogress", text: "部門排序" },
  // ];

  // 對照 api table 所顯示 key
  const columnsPC = [
    { key: "pictureUrl", label: "頭像", size: "15%" },
    { key: "displayName", label: "line名稱", size: "25%" },
    { key: "nickname", label: "暱稱", size: "25%" },
    { key: ["department", "name"], label: "部門", size: "18%" },
  ];
  // 對照 api table 所顯示 key
  const columnsMobile = [
    { key: "displayName", label: "line名稱" },
    { key: "nickname", label: "暱稱" },
    { key: ["department", "name"], label: "部門" },
    { key: "gender", label: "性別" },
  ];

  // edit = 編輯名稱
  const actions = [{ value: "edit", icon: <EditIcon /> }];

  // 取得列表資料
  useEffect(() => {
    getApiList(apiUrl);
  }, [apiUrl]);

  const getApiList = useCallback(
    (url) => {
      setIsLoading(true);
      getData(url).then((result) => {
        setIsLoading(false);
        const data = result.result;
        setApiData(data);
        if (page >= data.totalPages) {
          setPage(0);
          setRowsPerPage(10);
          navigate(`?p=1&s=10`);
        }
      });
    },
    [page]
  );

  //取得部門清單跟權限清單
  useEffect(() => {
    setIsLoading(true);
    const departurl = "department";
    const authorityurl = "authority";
    getData(departurl).then((result) => {
      setIsLoading(false);
      const data = result.result.content;
      setDepartmentList(data);
    });
    getData(authorityurl).then((result) => {
      setIsLoading(false);
      const data = result.result;
      const sortedAuthorityList = data.slice().sort((a, b) => a.id - b.id);
      setAuthorityList(sortedAuthorityList);
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
  const handleChangePage = useCallback(
    (event, newPage) => {
      setPage(newPage);
      navigate(`?p=${newPage + 1}&s=${rowsPerPage}`);
    },
    [rowsPerPage]
  );

  // 設置每頁顯示並返回第一頁
  const handleChangeRowsPerPage = (event) => {
    const targetValue = parseInt(event.target.value, 10);
    setRowsPerPage(targetValue);
    setPage(0);
    navigate(`?p=1&s=${targetValue}`);
  };

  // 當活動按鈕點擊時開啟 modal 並進行動作
  const handleActionClick = (event) => {
    event.stopPropagation();
    const dataMode = event.currentTarget.getAttribute("data-mode");
    const dataValue = event.currentTarget.getAttribute("data-value");
    setModalValue(dataMode);
    setDeliverInfo(
      dataValue ? apiData?.content.find((item) => item.id === dataValue) : null
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
      modalValue: "edit",
      modalComponent: (
        <EditModal
          title="編輯個人資料"
          deliverInfo={deliverInfo}
          sendDataToBackend={sendDataToBackend}
          onClose={onClose}
          departmentList={departmentList}
          authorityList={authorityList}
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
        title="人事管理"
        //btnGroup={btnGroup}
        handleActionClick={handleActionClick}
      />

      {/* TabBar */}
      {/* <TableTabber tabGroup={tabGroup} setCat={setCat} /> */}

      {/* Table */}
      <div className="overflow-y-auto h-full order-3 sm:order-1">
        <RWDTable
          data={apiData?.content}
          columnsPC={columnsPC}
          columnsMobile={columnsMobile}
          actions={actions}
          cardTitleKey={"displayName"}
          tableMinWidth={540}
          isLoading={isLoading}
          handleActionClick={handleActionClick}
        />
      </div>

      {/* Pagination */}
      <Pagination
        totalElement={apiData ? apiData.totalElements : 0}
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
