import React, { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PageTitle from "../../components/Guideline/PageTitle";
import FloatingActionButton from "../../components/FloatingActionButton/FloatingActionButton";
import RWDTable from "../../components/RWDTable/RWDTable";
import Pagination from "../../components/Pagination/Pagination";
import AddIcon from "@mui/icons-material/Add";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import CommentIcon from "@mui/icons-material/Comment";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import EditIcon from "@mui/icons-material/Edit";
import { getData, postBodyData, postData } from "../../utils/api";
import { useNotification } from "../../hooks/useNotification";
import constructionTypeList from "../../datas/constructionTypes";
import { LoadingFour } from "../../components/Loader/Loading";
import Backdrop from "@mui/material/Backdrop";
import { SummaryModal } from "./SummaryModal";
import HelpQuestion from "../../components/HelpQuestion/HelpQuestion";

const ConstructionSummary = () => {
  const navigate = useNavigate();
  const showNotification = useNotification();

  // 解析網址取得參數
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  // 傳遞稍後用 Flag
  const [sendBackFlag, setSendBackFlag] = useState(false);
  // cat = Category 設置 tab 分類
  //   const [cat, setCat] = useState(null);
  // API List Data
  const [summaryList, setSummaryList] = useState(null);

  const [projectsList, setProjectsList] = useState(null);
  const [departMemberList, setDepartMemberList] = useState(null);
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

  const apiUrl = `constructionSummary?p=${page + 1}&s=${rowsPerPage}`;

  const [activeStep, setActiveStep] = useState(0);

  // ModalValue 控制開啟的是哪一個 Modal
  const [modalValue, setModalValue] = useState(false);
  // 傳送額外資訊給 Modal
  const [deliverInfo, setDeliverInfo] = useState(null);
  // 如果要打開下一個面板
  //   const [nextModalOpen, setNextModalOpen] = useState(null);

  // Tab 列表對應 api 搜尋參數
  // const tabGroup = [
  //   { f: "", text: "全部" },
  //   { f: "inprogress", text: "進行中" },
  //   { f: "unstarted", text: "尚未開始" },
  //   { f: "end", text: "已結束" },
  // ];

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
  const columnsPC = [
    { key: "name", label: "名稱" },
    // { key: "rocYear", label: "年度" },
    { key: ["project", "name"], label: "專案" },
    { key: ["constructionJob", "typeName"], label: "類別" },
    { key: ["constructionJob", "name"], label: "項目" },
    { key: "since", label: "起始日期" },
  ];

  const columnsMobile = [
    { key: "id", label: "系統ID" },
    { key: "name", label: "名稱" },
    { key: ["project", "name"], label: "專案" },
    { key: "rocYear", label: "年度" },
    { key: ["constructionJob", "typeName"], label: "類別" },
    { key: ["constructionJob", "name"], label: "項目" },
    { key: "since", label: "起始日期" },
    { key: "until", label: "結束日期" },
  ];

  const actions = [
    { value: "edit", icon: <EditIcon />, title: "施工清單 修改" },
    { value: "task", icon: <CommentIcon />, title: "施工清單工項執行 編輯" },
    { value: "dispatch", icon: <GroupAddIcon />, title: "工項執行派工" },
  ];

  // 取得列表資料
  useEffect(() => {
    getSummaryList(apiUrl, constructionTypeList);
    //getConstructionTypeList();
    getProjecstList();
    getDepartMemberList(11);
  }, [apiUrl]);

  //取得清單資料
  const getSummaryList = useCallback(
    (url, typesList) => {
      // console.log("getSummaryList")
      setIsLoading(true);
      getData(url).then((result) => {
        //console.log(result)
        setIsLoading(false);
        const data = result.result;
        // setApiData(data);
        if (page >= data?.totalPages) {
          setPage(0);
          setRowsPerPage(10);
          navigate(`?p=1&s=10`);
        }

        // console.log(result.result);
        // 将第一个数组中的 "constructionType" 映射到相应的 "name" 值
        if (result.result?.content.length > 0) {
          const convertTypeData = result?.result?.content.map((item) => {
            const constructionType = item.constructionJob.constructionType;
            const correspondingName = typesList?.find(
              (t) => t.name === constructionType
            );
            if (correspondingName) {
              item.constructionJob.typeName = correspondingName.label;
            }
            // console.log(item)
            return item;
          });
          const updateTask = { content: convertTypeData, ...data };

          // 取得全部施工清單，並將資料的"CIVIL_CONSTRUCTION"轉變為新增 typename:土木
          setSummaryList(updateTask);
        }
      });
    },
    [page]
  );

  const getProjecstList = () => {
    setIsLoading(true);
    getData("project").then((result) => {
      const projectsList = result.result.content;
      setProjectsList(projectsList);
      setIsLoading(false);
    });
  };
  const getDepartMemberList = useCallback((id) => {
    const departMemberList = `department/${id}/staff`;
    getData(departMemberList).then((result) => {
      setDepartMemberList(result.result);
      //console.log("departMemberList", result.result);
    });
  }, []);
  // // 傳遞給後端資料
  // const sendDataToBackend = (fd, mode, otherData) => {
  // };

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
    const dataMode = event.currentTarget.getAttribute("data-mode"); //在table的component裡讀取該選擇 如edit create
    const dataValue = event.currentTarget.getAttribute("data-value"); //在table的component裡讀取該筆資料id
    setModalValue(dataMode);
    if (dataValue) {
      setDeliverInfo(dataValue);
    }
    setActiveStep(dataMode === "task" ? 1 : dataMode === "dispatch" ? 2 : 0);
  };

  // 關閉 Modal 清除資料
  const onClose = () => {
    setModalValue(false);
    setDeliverInfo(null);
  };

  // useEffect(() => {
  //   console.log("點擊主面板的deliverInfo", deliverInfo);
  // }, [deliverInfo]);
  // modal 開啟參數與顯示標題
  const modalConfig = [
    {
      modalValue: ["create", "task", "edit", "dispatch"],
      modalComponent: (
        <SummaryModal
          title=""
          // sendDataToBackend={sendDataToBackend}
          onClose={onClose}
          projectsList={projectsList}
          departMemberList={departMemberList}
          deliverInfoFromList={deliverInfo}
          setDeliverInfoFromList={setDeliverInfo}
          setDeliverInfo={setDeliverInfo}
          activeStep={activeStep}
          setActiveStep={setActiveStep}
          getSummaryList={getSummaryList}
          apiUrl={apiUrl}
          constructionTypeList={constructionTypeList}
        />
      ),
    },
  ];
  const config = modalValue
    ? modalConfig.find((item) => item.modalValue.includes(modalValue))
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
      {/* <TableTabbar tabGroup={tabGroup} setCat={setCat} /> */}

      {/* Table */}
      <div className="overflow-y-auto sm:overflow-y-hidden h-full order-3 sm:order-1">
        <RWDTable
          data={summaryList?.content ? summaryList.content : []}
          columnsPC={columnsPC}
          columnsMobile={columnsMobile}
          actions={actions}
          cardTitleKey={"name"}
          tableMinWidth={700}
          isLoading={isLoading}
          handleActionClick={handleActionClick}
        />
      </div>

      {/* Pagination */}
      <Pagination
        totalElement={summaryList ? summaryList?.totalElements : 0}
        page={summaryList && page < summaryList?.totalPages ? page : 0}
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

      {/* Backdrop */}
      <Backdrop sx={{ color: "#fff", zIndex: 1400 }} open={sendBackFlag}>
        <LoadingFour />
      </Backdrop>
    </>
  );
};

export default ConstructionSummary;
