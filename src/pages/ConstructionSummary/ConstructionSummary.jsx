import React, { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PageTitle from "../../components/Guideline/PageTitle";
import FloatingActionButton from "../../components/FloatingActionButton/FloatingActionButton";
import TableTabber from "../../components/Tabbar/TableTabber";
import RWDTable from "../../components/RWDTable/RWDTable";
import Pagination from "../../components/Pagination/Pagination";
import AddIcon from "@mui/icons-material/Add";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import CommentIcon from "@mui/icons-material/Comment";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import EditIcon from "@mui/icons-material/Edit";
import { getData, postBodyData, postData } from "../../utils/api";
import { UpdatedModal, TaskModal } from "./SummaryModal";
import { useNotification } from "../../hooks/useNotification";
import { DispatchModal } from "./SummaryDispatchModal";

// 如果施工種類有新增需手動新增

const constructionTypeList = [
  {
    label: "土木",
    name: "CIVIL_CONSTRUCTION",
    ordinal: 0,
  },
  {
    label: "機電",
    name: "MECHATRONICS_ENGINEERING",
    ordinal: 1,
  },
  {
    label: "測量",
    name: "CONSTRUCTION_SURVEYING",
    ordinal: 2,
  },
  {
    label: "鋼構(組裝)",
    name: "STEEL_FRAME_ASSEMBLING",
    ordinal: 3,
  },
  {
    label: "鋼構(製造)",
    name: "STEEL_FRAME_MANUFACTURE",
    ordinal: 4,
  },
];

const ConstructionSummary = () => {
	const navigate = useNavigate();
	const showNotification = useNotification();

	// 解析網址取得參數
	const location = useLocation();
	const queryParams = new URLSearchParams(location.search);

  // cat = Category 設置 tab 分類
  const [cat, setCat] = useState(null);
  // API List Data
  const [apiData, setApiData] = useState(null);
  //const [constructionTypeList, setConstructionTypeList] = useState(null);
  const [projectsList, setProjectsList] = useState(null);
  // isLoading 等待請求 api
  const [isLoading, setIsLoading] = useState(true);
  // Page 頁數設置
	const [page, setPage] = useState(
		queryParams.has("p") && !isNaN(+queryParams.get("p")) ? +queryParams.get("p") - 1 : 0
	);
	// rows per Page 多少筆等同於一頁
	const [rowsPerPage, setRowsPerPage] = useState(
		queryParams.has("s") && !isNaN(+queryParams.get("s")) ? +queryParams.get("s") : 10
	);
  const furl = "constructionSummary";
  const apiUrl = `${furl}?p=${page + 1}&s=${rowsPerPage}`;
  // ModalValue 控制開啟的是哪一個 Modal
  const [modalValue, setModalValue] = useState(false);
  // 傳送額外資訊給 Modal
  const [deliverInfo, setDeliverInfo] = useState(null);

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
    // { value: "dispatch", icon: <GroupAddIcon />, title: "工項執行派工" },
  ];

  // 取得列表資料
  useEffect(() => {
    getApiList(apiUrl, constructionTypeList);
    //getConstructionTypeList();
    getProjecstList();
  }, [apiUrl]);

  //取得清單資料
  const getApiList = useCallback((url, typesList) => {
    setIsLoading(true);
    getData(url).then((result) => {
      setIsLoading(false);
      const data = result.result;
      // setApiData(data);
			if (page >= data.totalPages) {
				setPage(0);
				setRowsPerPage(10);
				navigate(`?p=1&s=10`);
			}
		
      //console.log(result.result.content);
      // 将第一个数组中的 "constructionType" 映射到相应的 "name" 值
      if (result.result.content.length > 0) {
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
        //console.log(updateTask);
        setApiData(updateTask);
      }
    });
  }, [page]);

  const getProjecstList = () => {
    setIsLoading(true);
    getData("project").then((result) => {
      setIsLoading(false);
      const projectsList = result.result.content;
      //console.log(projectsList);
      setProjectsList(projectsList);
    });
  };

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
          getApiList(apiUrl, constructionTypeList);
          onClose();
        } else if (result.result.response === 400) {
          //console.log(result.result);
          showNotification(result.result.reason, false);
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
          getApiList(apiUrl, constructionTypeList);
          onClose();
        } else if (result.result.response === 400) {
          //console.log(result.result);
          showNotification(
            "編輯施工清單工項執行們時拋出線程中斷異常：%s❗️",
            false
          );
        } else showNotification("權限不足", false);
      });
    }
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
          constructionTypeList={constructionTypeList}
          projectsList={projectsList}
        />
      ),
    },
    {
      modalValue: "edit",
      modalComponent: (
        <UpdatedModal
          title="施工清單修改"
          deliverInfo={deliverInfo}
          sendDataToBackend={sendDataToBackend}
          onClose={onClose}
          constructionTypeList={constructionTypeList}
          projectsList={projectsList}
        />
      ),
    },
    {
      modalValue: "task",
      modalComponent: (
        <TaskModal
          title="施工清單工項執行編輯"
          deliverInfo={deliverInfo}
          sendDataToBackend={sendDataToBackend}
          onClose={onClose}
        />
      ),
    },
    // {
    //   modalValue: "dispatch",
    //   modalComponent: (
    //     <DispatchModal
    //       title="工項執行派工"
    //       deliverInfo={deliverInfo}
    //       sendDataToBackend={sendDataToBackend}
    //       onClose={onClose}
    //     />
    //   ),
    // },
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
      {/* <TableTabber tabGroup={tabGroup} setCat={setCat} /> */}

      {/* Table */}
      <div className="overflow-y-auto sm:overflow-y-hidden h-full order-3 sm:order-1">
        <RWDTable
          data={apiData?.content ? apiData.content : null}
          columnsPC={columnsPC}
          columnsMobile={columnsMobile}
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
        page={apiData && page < apiData.totalPages ? page : 0}
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
