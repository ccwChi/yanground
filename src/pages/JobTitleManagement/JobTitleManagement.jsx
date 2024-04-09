import React, { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
// MUI
import Backdrop from "@mui/material/Backdrop";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
// Component
import PageTitle from "../../components/Guideline/PageTitle";
import FloatingActionButton from "../../components/FloatingActionButton/FloatingActionButton";
import RWDTable from "../../components/RWDTable/RWDTable";
import Pagination from "../../components/Pagination/Pagination";
import { LoadingFour, LoadingTwo } from "../../components/Loader/Loading";
import AlertDialog from "../../components/Alert/AlertDialog";
// Hooks
import useNavigateWithParams from "../../hooks/useNavigateWithParams";
import { useNotification } from "../../hooks/useNotification";
// Utils
import { getData, postData, deleteData } from "../../utils/api";
// Customs
import { UpdatedModal } from "./JobTitleManagementModal";
import Tree from "../../components/TreeView/Tree";

const JobTitleManagement = () => {
  // 解析網址取得參數
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const navigateWithParams = useNavigateWithParams();
  const showNotification = useNotification();

  // API List Data
  const [apiData, setApiData] = useState(null);
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
  // 傳遞稍後用 Flag
  const [sendBackFlag, setSendBackFlag] = useState(false);
  // 部門清單
  const [departmentsList, setDepartmentsList] = useState([]);

  // Alert 開關
  /**
   * 0: 關閉
   * 1: 是否確認刪除視窗
   */
  const [alertOpen, setAlertOpen] = useState(0);
  // ApiUrl
  const furl = "jobTitle";
  const apiUrl = `${furl}s`;

  // 上方區塊功能按鈕清單
  const btnGroup = [
    {
      mode: "create",
      icon: <AddCircleIcon fontSize="small" />,
      text: "新增職稱",
      variant: "contained",
      color: "primary",
      fabVariant: "success",
      fab: <AddIcon fontSize="large" />,
    },
  ];

  // 取得列表資料
  useEffect(() => {
    getApiList(apiUrl);
  }, [apiUrl]);
  const getApiList = useCallback(
    (url) => {
      getData(url).then((result) => {
        setIsLoading(false);
        if (result.result) {
          const data = result.result;
          setApiData(data);
        } else {
          setApiData(null);
          showNotification("主資料 API 請求失敗", false, 10000);
        }
      });
    },
    [page]
  );
  // 取得部門資料
  useEffect(() => {
    getData("department").then((result) => {
      if (result.result) {
        const data = result.result.content;
        const formattedDep = data.map((dep) => ({
          label: dep.name,
          id: dep.id,
        }));
        setDepartmentsList(formattedDep);
      } else {
        setDepartmentsList([]);
        showNotification("部門 API 請求失敗", false, 10000);
      }
    });
  }, []);

  // 傳遞給後端資料
  const sendDataToBackend = (fd, mode, otherData) => {
    setSendBackFlag(true);
    let url = furl;
    let message = [];
    switch (mode) {
      case "create":
        message = ["新增職稱成功！"];
        break;
      case "edit":
        url += "/" + otherData;
        message = ["編輯職稱成功！"];
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

  // 當活動按鈕點擊時開啟 modal 並進行動作
  const handleActionClick = (event) => {
    event.stopPropagation();
    const dataMode = event.currentTarget.getAttribute("data-mode");
    const dataValue = event.currentTarget.getAttribute("data-value");

    if (dataMode === "void") {
      setDeliverInfo(dataValue);
      setAlertOpen(1);
    } else {
      setModalValue(dataMode);
      if (dataValue) {
        setDeliverInfo(dataValue);
      }
    }
  };

  // 關閉 Modal 清除資料
  const onClose = () => {
    setModalValue(false);
    setDeliverInfo(null);
  };

  // Alert 回傳值進行最終結果 --- true: 關閉 modal / all: 關閉 Alert
  const handleAlertClose = (agree) => {
    if (agree) {
      if (alertOpen === 1) {
        let message = "刪除成功！";

        deleteData(`${furl}/${deliverInfo}`).then((result) => {
          if (result.status) {
            showNotification(message, true);
            getApiList(apiUrl);
          } else {
            showNotification(result?.result.reason || "出現錯誤。", false);
          }
          setSendBackFlag(false);
        });
      }
    }
    setAlertOpen(0);
    setDeliverInfo(null);
  };

  // modal 開啟參數與顯示標題
  const modalConfig = [
    {
      modalValue: "create",
      modalComponent: (
        <UpdatedModal
          title="新增職稱"
          departmentsList={departmentsList}
          sendDataToBackend={sendDataToBackend}
          onClose={onClose}
        />
      ),
    },
    {
      modalValue: "edit",
      modalComponent: (
        <UpdatedModal
          title="編輯職稱"
          deliverInfo={deliverInfo}
          departmentsList={departmentsList}
          sendDataToBackend={sendDataToBackend}
          onClose={onClose}
        />
      ),
    },
  ];
  const config = modalValue
    ? modalConfig.find((item) => item.modalValue === modalValue)
    : null;

  const handleDelete = (nodeData) => {
    setDeliverInfo(nodeData.id);
    setAlertOpen(1);
  };
  const handleEdit = (nodeData) => {
    setModalValue("edit");
    setDeliverInfo(nodeData.id);
  };

  return (
    <>
      {/* PageTitle */}
      <PageTitle
        title="職稱管理"
        description={
          "此頁面是用於職稱管理，提供新增、檢視、編輯和刪除職稱的功能，以便有效地管理用戶的職稱設置。"
        }
        btnGroup={btnGroup}
        handleActionClick={handleActionClick}
        isLoading={!isLoading}
      />
      <div className="overflow-hidden p-4 h-full ">
        <Tree
          data={apiData}
          editable={true}
          deleteable={true}
          handleDelete={handleDelete}
          handleEdit={handleEdit}
          title={"元融科技"}
        />
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton
        btnGroup={btnGroup}
        handleActionClick={handleActionClick}
        handleEdit={handleEdit}
      />

      {/* Modal */}
      {config && config.modalComponent}

      {/* Backdrop */}
      <Backdrop sx={{ color: "#fff", zIndex: 1400 }} open={sendBackFlag}>
        {sendBackFlag && <LoadingFour />}
      </Backdrop>
      <Backdrop sx={{ color: "#fff", zIndex: 1400 }} open={isLoading}>
        {isLoading && <LoadingTwo />}
      </Backdrop>

      {/* Alert */}
      <AlertDialog
        open={alertOpen !== 0}
        onClose={handleAlertClose}
        icon={<ReportProblemIcon color="secondary" />}
        title="注意"
        content={"是否確認將此職稱進行刪除處理？"}
        disagreeText="取消"
        agreeText="確定"
      />
    </>
  );
};

export default JobTitleManagement;
