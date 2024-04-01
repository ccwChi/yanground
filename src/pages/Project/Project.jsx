import React, { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// Component
import PageTitle from "../../components/Guideline/PageTitle";
import FloatingActionButton from "../../components/FloatingActionButton/FloatingActionButton";
import RWDTable from "../../components/RWDTable/RWDTable";
import Pagination from "../../components/Pagination/Pagination";
import { LoadingFour } from "../../components/Loader/Loading";
import AlertDialog from "../../components/Alert/AlertDialog";

// Mui
import Backdrop from "@mui/material/Backdrop";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import TuneIcon from "@mui/icons-material/Tune";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import DriveFileMoveIcon from "@mui/icons-material/DriveFileMove";

// Hooks
import { useNotification } from "../../hooks/useNotification";
// date-fns
import { parseISO, format } from "date-fns";
import { zhTW } from "date-fns/locale";
import { utcToZonedTime } from "date-fns-tz";
// Utils
import { getData, postData, deleteData } from "../../utils/api";

// Custom
import { UpdatedModal } from "./ProjectModal";
import useNavigateWithParams from "../../hooks/useNavigateWithParams";
import { Controller, FormProvider, useForm } from "react-hook-form";
import InputTitle from "../../components/Guideline/InputTitle";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import ControlledDatePicker from "../../components/DatePicker/ControlledDatePicker";
import { Divider, TextField } from "@mui/material";
import MultipleFAB from "../../components/FloatingActionButton/MultipleFAB";

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
  phrase: "",
  administrativeDivision: "",
  representative: "",
  constructionKind: "",
  since: null,
  until: null,
};

const Project = () => {
  const navigateWithParams = useNavigateWithParams();
  const navigate = useNavigate();
  const showNotification = useNotification();

  // 解析網址取得參數
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  // API List Data
  const [apiData, setApiData] = useState([]);
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
  // 縣市清單
  const [cityList, setCityList] = useState(null);
  // 傳遞稍後用 Flag
  const [sendBackFlag, setSendBackFlag] = useState(false);
  // Alert 開關
  // 如果面板中刪除資料，不想關閉面板而重載
  const [refreshModal, setRefreshModal] = useState(true);
  /**
   * 0: 關閉
   * 1: 是否確認刪除視窗
   */
  const [alertOpen, setAlertOpen] = useState(0);
  // 搜尋篩選清單
  const [filters, setFilters] = useState(defaultValue);
  // SearchDialog Switch
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const furl = "project";
  const [apiUrl, setApiUrl] = useState("");
  // 工程類型清單
  const [constructionKindList, setConstructionKindList] = useState([]);
  // 工程類型清單
  const [representativeList, setRepresentativeList] = useState([]);
  // 預設搜尋篩選內容
  const getValueOrFilter = (queryParam, filter) => {
    const value = queryParams.get(queryParam);
    return !!value ? value : filter;
  };

  const defaultValues = {
    phrase: getValueOrFilter("phrase", filters.phrase),
    administrativeDivision: getValueOrFilter(
      "administrativeDivision",
      filters.administrativeDivision
    ),
    representative: getValueOrFilter("representative", filters.representative),
    constructionKind: getValueOrFilter(
      "constructionKind",
      filters.constructionKind
    ),
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

  // 上方區塊功能按鈕清單
  const btnGroup = [
    {
      mode: "create",
      icon: <AddCircleIcon fontSize="small" />,
      text: "新增專案",
      variant: "contained",
      color: "primary",
      fabVariant: "success",
      fab: <AddIcon fontSize="large" />,
    },
    // {
    //   mode: "filter",
    //   icon: null, // 設為 null 就可以避免 PC 出現
    //   text: "篩選",
    //   variant: "contained",
    //   color: "secondary",
    //   fabVariant: "secondary",
    //   fab: <TuneIcon />,
    // },
  ];

  // 對照 api table 所顯示 key
  const columnsPC = [
    { key: "name", label: "專案名稱", align: "left" },
    {
      key: ["constructionKind", "chinese"],
      label: "工程類型",
      size: "10%",
    },
    {
      key: ["businessRepresentative", "nickname"],
      label: "負責人",
      size: "10%",
    },
    {
      key: ["foremanRepresentative", "nickname"],
      label: "工務專管人員",
      size: "10%",
    },
    {
      key: ["primary", "name"],
      label: "隸屬主專案",
      align: "left",
      size: "20%",
    },
    { key: "administrativeDivision", label: "地點", size: "12%" },
  ];
  const columnsMobile = [
    { key: "name", label: "專案名稱" },
    {
      key: ["constructionKind", "chinese"],
      label: "工程類型",
    },
    { key: ["businessRepresentative", "nickname"], label: "負責人" },
    { key: ["foremanRepresentative", "nickname"], label: "工務專管人員" },
    { key: ["primary", "name"], label: "隸屬主專案" },
    { key: "administrativeDivision", label: "地點" },
  ];

  const actions = [
    { value: "edit", icon: <EditIcon />, title: "編輯專案" },
    { value: "void", icon: <DeleteIcon />, title: "刪除專案" },
    {
      value: "gotoFM",
      icon: <DriveFileMoveIcon />,
      title: "前往專管文件管理頁",
    },
  ];
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
        setApiData(data);
        if (page >= data?.totalPages) {
          setPage(0);
          setRowsPerPage(10);
          //   navigate(`?p=1&s=10`);
        }
      } else {
        setApiData([]);
        showNotification("主資料 API 請求失敗", false, 10000);
      }
      setIsLoading(false);
    });
  }, []);

  // 取得縣市資料  &  工程類型資料 & 可選擇工務/業務 專管人員
  useEffect(() => {
    const administrativeDivisionUrl = "administrativeDivision?p=1&s=500";
    getData(administrativeDivisionUrl).then((result) => {
      if (result.result) {
        const data = result.result.content;
        setCityList(data);
      } else {
        setCityList([]);
      }
    });
    getData("constructionKind").then((result) => {
      if (result.result) {
        const data = result.result;
        setConstructionKindList(data);
      } else {
        setConstructionKindList([]);
      }
    });
    const getDepartMemberList = () => {
      const idArray = [5, 11];
      const promises = idArray.map((id) => {
        const departMemberListEndpoint = `department/${id}/staff`;
        return getData(departMemberListEndpoint).then((result) => {
          const filterList = result.result.map((data) => {
            const { id, nickname, department } = data;
            return { id, nickname, department };
          });
          return filterList;
        });
      });
      Promise.all(promises)
        .then((allResults) => {
          const mergedList = allResults.flat();
          setRepresentativeList(mergedList);
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
        });
    };
    getDepartMemberList();
  }, []);

  // 傳遞給後端資料
  const sendDataToBackend = (fd, mode, otherData) => {
    setSendBackFlag(true);
    let url = furl;
    let message = [];
    switch (mode) {
      case "create":
        message = ["專案新增成功！"];
        break;
      case "edit":
        url += "/" + otherData;
        message = ["專案編輯成功！"];
        break;
      case "deleteContact":
        url = "clientContactNumber/" + otherData;
        message = ["刪除成功！"];
        break;
      case "creatContact":
        url = "clientContactNumber";
        message = ["新增成功！"];
        break;
      case "creatLandLot":
        url = "landLot";
        message = ["新增成功！"];
        break;
      case "deleteLandlot":
        url = "landLot/" + otherData;
        message = ["刪除成功！"];
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
    } else if (mode === "deleteContact" || mode === "deleteLandlot") {
      deleteData(url).then((result) => {
        if (result.status) {
          showNotification(message[0], true);
          getApiList(apiUrl);
          setRefreshModal(true);
        } else {
          showNotification(
            result.result.reason
              ? result.result.reason
              : result.result
              ? result.result
              : "產生無法預期的錯誤，請洽資訊部",
            false
          );
        }
        setSendBackFlag(false);
      });
    } else if (mode === "creatContact" || mode === "creatLandLot") {
      postData(url, fd).then((result) => {
        if (result.status) {
          showNotification(message[0], true);
          getApiList(apiUrl);
          setRefreshModal(true);
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
    }

    // for (var pair of fd.entries()) {
    // 	console.log(pair);
    // }
  };

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

    // const fullDepartMember = [];
    // if (data.departments.length > 0 && data.users.length === 0) {
    //   const allMember = userList.map((user) => user.id);
    //   fullDepartMember.push(...allMember);
    //   data.users = fullDepartMember;
    // }

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

    if (dataMode === "void") {
      setDeliverInfo(dataValue);
      setAlertOpen(1);
    } else if (dataMode === "filter") {
      handleOpenSearch();
    } else if (dataMode === "gotoFM") {
      // 查看有無工程類型於專案
      if (
        !apiData.content.find((item) => item.id === dataValue).constructionKind
      ) {
        showNotification("無工程類型，無法開啟專管文件管理頁！", false);
      } else {
        navigate(`documents?pj=${dataValue}`);
      }
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

        deleteData(`project/${deliverInfo}`).then((result) => {
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
          title="新增專案"
          sendDataToBackend={sendDataToBackend}
          cityList={cityList}
          onClose={onClose}
          refreshModal={refreshModal}
          setRefreshModal={setRefreshModal}
          constructionKindList={constructionKindList}
          setConstructionKindList={setConstructionKindList}
        />
      ),
    },
    {
      modalValue: "edit",
      modalComponent: (
        <UpdatedModal
          title="編輯專案"
          deliverInfo={deliverInfo}
          sendDataToBackend={sendDataToBackend}
          cityList={cityList}
          onClose={onClose}
          refreshModal={refreshModal}
          setRefreshModal={setRefreshModal}
          constructionKindList={constructionKindList}
          setConstructionKindList={setConstructionKindList}
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
        title="專案管理"
        description={
          "此頁面是用於新增、編輯專案，同時可以選擇案場範圍，提供方便管理專案的功能。"
        }
        btnGroup={btnGroup}
        handleActionClick={handleActionClick}
        // 搜尋模式
        searchMode={false}
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
            <div className="inline-flex items-center gap-2">
              <Controller
                name="phrase"
                control={control}
                render={({ field }) => (
                  <TextField
                    className="inputPadding"
                    placeholder="請輸入名稱、員編或身分證進行查詢"
                    fullWidth
                    {...field}
                  />
                )}
              />
            </div>
            <Divider />
            <div className="inline-flex items-center gap-2">
              <InputTitle
                title={"所屬縣市"}
                classnames="whitespace-nowrap min-w-[70px]"
                pb={false}
                required={false}
              />
              <Controller
                name="administrativeDivision"
                control={control}
                render={({ field }) => (
                  <Select
                    className="inputPadding"
                    displayEmpty
                    MenuProps={MenuProps}
                    fullWidth
                    disabled={!cityList}
                    {...field}
                  >
                    <MenuItem value="" disabled>
                      <span className="text-neutral-400 font-light">
                        請選擇所屬縣市
                      </span>
                    </MenuItem>
                    <MenuItem value="">全部縣市</MenuItem>
                    {cityList?.map((city) => (
                      <MenuItem key={"select" + city.id} value={city.id}>
                        {city.name}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
            </div>
            <div className="inline-flex items-center gap-2">
              <InputTitle
                title={"工程類型"}
                classnames="whitespace-nowrap min-w-[70px]"
                pb={false}
                required={false}
              />
              <Controller
                name="constructionKind"
                control={control}
                render={({ field }) => (
                  <Select
                    className="inputPadding"
                    displayEmpty
                    MenuProps={MenuProps}
                    fullWidth
                    disabled={!constructionKindList}
                    {...field}
                  >
                    <MenuItem value="" disabled>
                      <span className="text-neutral-400 font-light">
                        請選擇工程類型
                      </span>
                    </MenuItem>
                    {/* <MenuItem value=""></MenuItem> */}
                    {constructionKindList?.map((constructionKind) => (
                      <MenuItem
                        key={"select" + constructionKind.value}
                        value={constructionKind.value}
                      >
                        {constructionKind.chinese}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
            </div>
            <div className="inline-flex items-center gap-2">
              <InputTitle
                title={"專管人員"}
                classnames="whitespace-nowrap min-w-[70px]"
                pb={false}
                required={false}
              />
              <Controller
                name="representative"
                control={control}
                render={({ field }) => (
                  <Select
                    className="inputPadding"
                    displayEmpty
                    MenuProps={MenuProps}
                    fullWidth
                    disabled={!representativeList}
                    {...field}
                  >
                    <MenuItem value="" disabled>
                      <span className="text-neutral-400 font-light">
                        請選擇專管人員
                      </span>
                    </MenuItem>
                    {/* <MenuItem value=""></MenuItem> */}
                    {representativeList?.map((representative) => (
                      <MenuItem
                        key={"select" + representative.id}
                        value={representative.id}
                      >
                        {representative.nickname}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
            </div>
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
              />
            </div>
          </form>
        </FormProvider>
      </PageTitle>
      {/* Table */}
      <div className="overflow-y-auto sm:overflow-y-hidden h-full order-3 sm:order-1">
        <RWDTable
          data={apiData?.content}
          columnsPC={columnsPC}
          columnsMobile={columnsMobile}
          actions={actions}
          cardTitleKey={"name"}
          tableMinWidth={1280}
          isLoading={isLoading}
          handleActionClick={handleActionClick}
        />
      </div>
      {/* Pagination */}
      <Pagination
        totalElement={apiData ? apiData.totalElements : 0}
        page={apiData && page < apiData.totalPages ? page : 0}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
      {/* Floating Action Button */}
      {/* <FloatingActionButton
        btnGroup={btnGroup}
        handleActionClick={handleActionClick}
      /> */}
      {/* Modal */}
      {config && config.modalComponent}

      {/* Floating Action Button */}
      <MultipleFAB btnGroup={btnGroup} handleActionClick={handleActionClick} />
      {/* Backdrop */}
      <Backdrop sx={{ color: "#fff", zIndex: 1400 }} open={sendBackFlag}>
        <LoadingFour />
      </Backdrop>
      {/* Alert */}
      <AlertDialog
        open={alertOpen !== 0}
        onClose={handleAlertClose}
        icon={<ReportProblemIcon color="secondary" />}
        title="注意"
        content={"是否確認將此專案進行刪除處理？"}
        disagreeText="取消"
        agreeText="確定"
      />
    </>
  );
};

export default Project;
