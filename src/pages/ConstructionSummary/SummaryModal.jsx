import React, { useEffect, useState, useCallback } from "react";

// modal家族 含面板警告載入中，一些icon
import ModalTemplete from "../../components/Modal/ModalTemplete";
import { useNotification } from "../../hooks/useNotification";
import { Backdrop } from "@mui/material";
import AlertDialog from "../../components/Alert/AlertDialog";
import {
  Loading,
  LoadingFour,
  LoadingThree,
} from "../../components/Loader/Loading";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";

// api
import { getData, postBodyData, postData } from "../../utils/api";

// modal中的不同頁面
import ForSummaryStepper from "../../components/Stepper/Stepper";
import StepperDivOneForSummary from "./StepperDivOneForSummary";
import StepperDivTwoForJobTask from "./StepperDivTwoForJobTask";
import StepperDivThreeForDispatch from "./StepperDivThreeForDispatch";
import constructionTypeList from "../../datas/constructionTypes";
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);

// 使用 step 設三階段、分三個 div，分別進行創建(編輯)施工清單、選擇編輯工項執行、每個工項執行的派工
const SummaryModal = React.memo(
  ({
    deliverInfoFromList,
    setDeliverInfoFromList,
    onClose,
    projectsList,
    departMemberList,
    activeStep,
    setActiveStep,
    getSummaryList,
    apiUrl,
  }) => {
    const [deliverInfo, setDeliverInfo] = useState(null);
    const showNotification = useNotification();
    const [isLoading, setIsLoading] = useState(false);
    // Alert 開關
    const [alertOpen, setAlertOpen] = useState(false);

    // 用來分別確認每個步驟中的使用汙染情況，因為一次只會編輯一個div所以設一個就好
    const [isDivDirty, setIsDivDirty] = useState(false);

    // 第一個summary div要用的狀態
    const [constructionJobList, setConstructionJobList] = useState([]);

    // 下面用來建立stepper的參數
    const [steps, setSteps] = useState([
      "建立施工清單",
      "更新工項執行",
      "工項執行派工",
    ]);

    useEffect(() => {
      if (deliverInfoFromList) {
        setSteps(["修改施工清單", "更新工項執行", "工項執行派工"]);
      } else {
        setSteps(["新增施工清單", "更新工項執行", "工項執行派工"]);
      }
    }, [deliverInfoFromList]);

    //手機板的編輯狀態換div用
    const [currentDivIndex, setCurrentDivIndex] = useState(false);

    const [sendBackFlag, setSendBackFlag] = useState(false);
    // 檢查表單是否汙染
    const onCheckDirty = () => {
      if (isDivDirty) {
        setAlertOpen(true);
      } else {
        onClose();
      }
    };
    // Alert 回傳值進行最終結果 --- true: 關閉 modal / all: 關閉 Alert
    const handleAlertClose = (agree) => {
      if (agree) {
        onClose();
      }
      setAlertOpen(false);
    };

    // 為了避免同步不同不問題，如果是點擊編輯，就用deliveryInfo的summaryID來重新取得清單資料
    // 然後再把這個新的deliveryInfo傳給對應面板
    useEffect(() => {
      if (!!deliverInfoFromList) {
        getSummaryApi(deliverInfoFromList);
      }
    }, []);

    //獲取整張施工清單作為deliveryInfo得資料
    const getSummaryApi = (deliverInfoFromList) => {
      setIsLoading(true);
      const url = `constructionSummary/${deliverInfoFromList}`;
      getData(url).then((result) => {
        const data = result.result;
        const correspondingName = constructionTypeList?.find(
          (t) => t.name === data?.constructionJob?.constructionType
        );
        if (correspondingName) {
          data.constructionJob.typeName = correspondingName.label;
        } //在job.constructionType="CIVIL_CONSTRUCTION"這樣的情況插入typeName=土木這個屬性
        setDeliverInfo(data);
      });
    };

    //將外面傳進來的員工資料deliverInfo代入到每個空格之中

    useEffect(() => {
      if (
        deliverInfo?.id &&
        deliverInfo?.constructionJob?.constructionType &&
        activeStep === 0
      ) {
        getConstructionTypeList(deliverInfo?.constructionJob?.constructionType);
      }
    }, [deliverInfo, activeStep]);
    //取得類別清單後再求得JobList
    const getConstructionTypeList = (value) => {
      setIsLoading(true);
      const typeurl = `constructionType/${value}/job`;
      getData(typeurl).then((result) => {
        const data = result.result;
        setConstructionJobList(data);
        setIsLoading(false);
      });
    };

    // 傳遞給後端資料
    const sendDataToBackend = (fd, mode, otherData) => {
      setSendBackFlag(true);
      let url = "";
      let message = [];
      switch (mode) {
        case "create":
          url = "constructionSummary";
          message = ["施工清單新增成功！"];
          break;
        case "edit":
          url = "constructionSummary/" + otherData;
          message = ["施工清單修改成功！"];
          break;
        case "task":
          url = "constructionSummary/" + otherData[0] + "/tasks";
          message = ["更新工項執行成功！"];
          break;
        default:
          break;
      }
      if (mode === "create" || mode === "edit") {
        postData(url, fd).then((result) => {
          if (result.status) {
            showNotification(message[0], true);
            const correspondingName = constructionTypeList?.find(
              (t) =>
                t.name ===
                result?.result?.result?.constructionJob?.constructionType
            );
            if (correspondingName) {
              result.result.result.constructionJob.typeName =
                correspondingName.label;
            } //在job.constructionType="CIVIL_CONSTRUCTION"這樣的情況插入typeName=土木這個屬性
            setDeliverInfo(result.result.result);
            setActiveStep(1);
            setIsDivDirty(false);
            RefleshMainList();
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
      } else if (mode === "task") {
        postBodyData(url, fd).then((result) => {
          if (result.status) {
            getSummaryApi(otherData[0]);
            setIsDivDirty(false);
            showNotification(message[0], true);
            setActiveStep(otherData[1]);
            RefleshMainList();
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
    };

    const RefleshMainList = () => {
      getSummaryList(apiUrl, constructionTypeList);
    };

    return (
      <>
        {/* Modal */}
        <ModalTemplete
          title={<ForSummaryStepper activeStep={activeStep} steps={steps} />}
          show={!!deliverInfo ? true : !deliverInfoFromList && true}
          maxWidth={"700px"}
          onClose={onCheckDirty}
        >
          <div className="h-[500px] min-h-[50vh]">
            {activeStep === 0 ? (
              <StepperDivOneForSummary
                deliverInfo={deliverInfo}
                projectsList={projectsList}
                setIsDivDirty={setIsDivDirty}
                sendDataToBackend={sendDataToBackend}
                constructionTypeList={constructionTypeList}
                constructionJobList={constructionJobList}
                getConstructionTypeList={getConstructionTypeList}
                isLoading={isLoading}
                onClose={onClose}
                setActiveStep={setActiveStep}
              />
            ) : activeStep === 1 ? (
              <StepperDivTwoForJobTask
                deliverInfo={deliverInfo}
                sendDataToBackend={sendDataToBackend}
                isDivDirty={isDivDirty}
                setIsDivDirty={setIsDivDirty}
                setCurrentDivIndex={setCurrentDivIndex}
                currentDivIndex={currentDivIndex}
                onClose={onClose}
                setDeliverInfoFromList={setDeliverInfoFromList}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
                setActiveStep={setActiveStep}
              />
            ) : (
              <StepperDivThreeForDispatch
                deliverInfo={deliverInfo}
                setActiveStep={setActiveStep}
                setCurrentDivIndex={setCurrentDivIndex}
                currentDivIndex={currentDivIndex}
                departMemberList={departMemberList}
                onClose={onClose}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
                RefleshMainList={RefleshMainList}
              />
            )}
          </div>
        </ModalTemplete>
        <Backdrop
          sx={{ color: "#fff", zIndex: 1050 }}
          open={!deliverInfo ? true : !deliverInfoFromList && true}
          onClick={onCheckDirty}
        >
          <LoadingThree size={40} />
        </Backdrop>
        <Backdrop sx={{ color: "#fff", zIndex: 1400 }} open={sendBackFlag}>
          <LoadingFour />
        </Backdrop>
        {/* Alert */}
        <AlertDialog
          open={alertOpen}
          onClose={handleAlertClose}
          icon={<ReportProblemIcon color="secondary" />}
          title="注意"
          content="您所做的變更尚未儲存。是否確定要關閉表單？"
          disagreeText="取消"
          agreeText="確定"
        />
      </>
    );
  }
);

export { SummaryModal };
