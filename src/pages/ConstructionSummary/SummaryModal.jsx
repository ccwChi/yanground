import React, { useEffect, useState, useCallback } from "react";
import ModalTemplete from "../../components/Modal/ModalTemplete";

import ControlledDatePicker from "../../components/DatePicker/ControlledDatePicker";
import { format } from "date-fns";
import AlertDialog from "../../components/Alert/AlertDialog";
import {
  Loading,
  LoadingFour,
  LoadingThree,
} from "../../components/Loader/Loading";
import {
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Divider,
  FormHelperText,
  Collapse,
  Card,
  CardContent,
  Typography,
  Backdrop,
  CircularProgress,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import Edit from "@mui/icons-material/Edit";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import { TransitionGroup } from "react-transition-group";
import {
  useForm,
  Controller,
  FormProvider,
  useFieldArray,
} from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { deleteData, getData, postBodyData, postData } from "../../utils/api";
import { useNotification } from "../../hooks/useNotification";

import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import InputTitle from "../../components/Guideline/InputTitle";
import ForSummaryStepper from "./Stepper";

import { IOSSwitch } from "../../components/Switch/Switch";
import { useNavigate } from "react-router";

const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
const currentYear = new Date().toLocaleDateString("zh-TW-u-ca-roc", {
  year: "numeric",
});

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
    constructionTypeList,
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
        setIsLoading(false);
      }
    }, []);

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
        setIsLoading(false);
        const data = result.result;
        setConstructionJobList(data);
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
          } else if (result.result.response !== 400) {
            //console.log(result.result);
            showNotification(
              result?.result?.reason ? result.result.reason : "錯誤",
              false
            );
          }
          setSendBackFlag(false);
        });
      } else if (mode === "task") {
        postBodyData(url, fd).then((result) => {
          if (result.status) {
            setIsDivDirty(false);
            showNotification(message[0], true);
            setActiveStep(otherData[1]);
            RefleshMainList();
          } else if (result.result.response !== 200) {
            showNotification(
              result?.result?.reason ? result.result.reason : "錯誤",
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
          maxWidth={"640px"}
          onClose={onCheckDirty}
        >
          <div className="h-[500px] min-h-[50vh]">
            {activeStep === 0 ? (
              <EditSummaryDiv
                deliverInfo={deliverInfo}
                projectsList={projectsList}
                setIsDivDirty={setIsDivDirty}
                sendDataToBackend={sendDataToBackend}
                constructionTypeList={constructionTypeList}
                constructionJobList={constructionJobList}
                getConstructionTypeList={getConstructionTypeList}
                isLoading={isLoading}
                onClose={onClose}
              />
            ) : activeStep === 1 ? (
              <EditJobTaskDiv
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
              />
            ) : (
              <EditDispatchDiv
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

// step-1 的 div，編修施工清單本人
const EditSummaryDiv = React.memo(
  ({
    deliverInfo,
    projectsList,
    setIsDivDirty,
    sendDataToBackend,
    constructionTypeList,
    constructionJobList,
    getConstructionTypeList,
    isLoading,
    onClose,
  }) => {
    const defaultValues = {
      name: deliverInfo?.name ? deliverInfo.name : "",
      project: deliverInfo?.project ? deliverInfo.project.id : "",
      rocYear: deliverInfo?.rocYear
        ? deliverInfo.rocYear
        : currentYear.slice(2, 5),
      type: deliverInfo?.constructionJob?.constructionType
        ? deliverInfo.constructionJob.constructionType
        : "",
      job: deliverInfo?.constructionJob?.id
        ? deliverInfo.constructionJob.id
        : "",
      since: deliverInfo?.since ? new Date(deliverInfo.since) : null,
      until: deliverInfo?.until ? new Date(deliverInfo.until) : null,
    };
    // 處理表單驗證錯誤時的回調函數

    // 使用 Yup 來定義表單驗證規則
    const schema = yup.object().shape({
      name: yup.string().required("清單標題不可為空值！"),
      rocYear: yup
        .number("應為數字")
        .required("不可為空值！")
        .test("len", "格式應為民國年", (val) =>
          /^[0-9]{3}$/.test(val.toString())
        )
        .typeError("應填寫民國年 ex: 112"),
      type: yup.string().required("需選擇工程類別!"),
      job: yup
        .number()
        .required("需選擇工程項目!")
        .typeError("需選擇工程項目!"),
      project: yup.string().required("需選擇所屬專案！"),
      since: yup.date().nullable(),
      until: yup
        .date()
        .nullable()
        .test({
          name: "custom-validation",
          message: "完工日期不能早於施工日期",
          test: function (until) {
            const since = this.parent.since;

            // 只有在 estimatedSince 和 estimatedUntil 都有值時才驗證
            if (since && until) {
              const formattedSince = new Date(since).toLocaleDateString(
                "en-CA",
                {
                  timeZone: "Asia/Taipei",
                }
              );
              const formattedUntil = new Date(until).toLocaleDateString(
                "en-CA",
                {
                  timeZone: "Asia/Taipei",
                }
              );
              return formattedUntil >= formattedSince;
            }
            return true; // 如果其中一個為空，則不驗證
          },
        }),
    });
    const methods = useForm({
      defaultValues,
      resolver: yupResolver(schema),
    });
    // 使用 useForm Hook 來管理表單狀態和驗證
    const {
      control,
      handleSubmit,
      watch,
      setValue,

      formState: { errors, isDirty },
    } = methods;
    // 用來替until時間設置最小日期
    const sinceDay = watch("since");

    useEffect(() => {
      setIsDivDirty(isDirty);
    }, [isDirty]);

    // 提交表單資料到後端並執行相關操作
    const onSubmit = (data) => {
      const convertData = {
        ...data,
        since: data?.since ? format(data.since, "yyyy-MM-dd") : "",
        until: data?.until ? format(data.until, "yyyy-MM-dd") : "",
      };
      delete convertData.type;

      const fd = new FormData();
      for (let key in convertData) {
        fd.append(key, convertData[key]);
      }
      // console.log(convertData);
      if (deliverInfo) {
        // console.log("deliverInfoFromList");
        sendDataToBackend(fd, "edit", deliverInfo.id);
      } else {
        // console.log("create");
        sendDataToBackend(fd, "create");
      }
    };

    return (
      <div className="w-full h-full relative">
        <FormProvider {...methods}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="h-full flex flex-col"
          >
            <div className="flex flex-col my-3 flex-1 h-[450px] overflow-y-scroll">
              <div
                className="flex flex-col px-1 pb-2"
                // style={{ maxHeight: "60vh" }}
              >
                {/* 所屬專案 */}
                <div className="">
                  <InputTitle title={"所屬專案"} />
                  <Controller
                    name="project"
                    control={control}
                    render={({ field: { value, onChange } }) => (
                      <FormControl
                        size="small"
                        className="inputPadding"
                        fullWidth
                      >
                        {value === "" ? (
                          <InputLabel
                            disableAnimation
                            shrink={false}
                            focused={false}
                          >
                            請選擇所屬專案
                          </InputLabel>
                        ) : null}
                        <Select
                          MenuProps={{
                            PaperProps: {
                              style: { maxHeight: "250px" },
                            },
                          }}
                          value={value}
                          onChange={(e) => {
                            onChange(e);
                          }}
                        >
                          {projectsList?.map((project) => (
                            <MenuItem
                              key={"select" + project.id}
                              value={project.id}
                            >
                              {project.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                  />
                  <FormHelperText
                    className="!text-red-600 break-words !text-right !mt-0"
                    sx={{ minHeight: "1.25rem" }}
                  >
                    {errors["project"]?.message}
                  </FormHelperText>
                </div>

                {/* 專案名稱 */}
                <div className="inline-flex sm:flex-row flex-col sm:gap-2 gap-0  sm:mb-0">
                  <div className="w-full">
                    <InputTitle title={"施工清單標題"} />
                    <Controller
                      name="name"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          variant="outlined"
                          size="small"
                          className="inputPadding"
                          placeholder="清單標題"
                          fullWidth
                          {...field}
                        />
                      )}
                    />
                    <FormHelperText
                      className="!text-red-600 break-words !text-right !mt-0"
                      sx={{ minHeight: "1.25rem" }}
                    >
                      {errors["name"]?.message}
                    </FormHelperText>
                  </div>

                  {/* 所屬年度 */}
                  <div className="w-full">
                    <InputTitle title={"專案年度"} />
                    <Controller
                      name="rocYear"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          variant="outlined"
                          size="small"
                          className="inputPadding"
                          placeholder="專案年度"
                          fullWidth
                          {...field}
                        />
                      )}
                    />
                    <FormHelperText
                      className="!text-red-600 break-words !text-right !mt-0"
                      sx={{ minHeight: "1.25rem" }}
                    >
                      {errors["rocYear"]?.message}
                    </FormHelperText>
                  </div>
                </div>
                <div className="inline-flex sm:flex-row flex-col sm:gap-2 gap-0 sm:mb-0">
                  {/* 工程類別 */}
                  <div className="w-full">
                    <InputTitle title={"工程類別"} />
                    <Controller
                      name="type"
                      control={control}
                      render={({ field: { value, onChange } }) => (
                        <FormControl
                          size="small"
                          className="inputPadding"
                          fullWidth
                        >
                          {value === "" ? (
                            <InputLabel
                              id="type-select-label"
                              disableAnimation
                              shrink={false}
                              focused={false}
                            >
                              請選擇工程類別
                            </InputLabel>
                          ) : null}
                          <Select
                            readOnly={false}
                            labelId="type-select-label"
                            MenuProps={{
                              PaperProps: {
                                style: { maxHeight: "250px" },
                              },
                            }}
                            disabled={
                              deliverInfo?.constructionSummaryJobTasks?.length >
                              0
                            }
                            value={value}
                            onChange={(e) => {
                              onChange(e);
                              getConstructionTypeList(e.target.value);
                              setValue("job", ""); //選了別種類別就要把項目選擇欄位清空
                            }}
                          >
                            {constructionTypeList?.map((type) => (
                              <MenuItem
                                key={"select" + type.ordinal}
                                value={type.name}
                              >
                                {type.label}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      )}
                    />
                    <FormHelperText
                      className="!text-red-600 break-words !text-right !mt-0"
                      sx={{ minHeight: "1.25rem" }}
                    >
                      {errors["type"]?.message}
                    </FormHelperText>
                  </div>

                  {/* 工程項目 */}
                  <div className="w-full">
                    <InputTitle title={"工程項目"} />
                    <Controller
                      name="job"
                      control={control}
                      render={({ field: { value, onChange } }) => (
                        <FormControl
                          size="small"
                          className="inputPadding relative"
                          fullWidth
                        >
                          <Select
                            disabled={
                              deliverInfo?.constructionSummaryJobTasks?.length >
                                0 || isLoading
                            }
                            labelId="task-select-label"
                            value={value}
                            onChange={onChange}
                            displayEmpty
                            //MenuProps={MenuProps}
                          >
                            <MenuItem value="" disabled>
                              <span className="text-neutral-400 font-light">
                                請選擇工程項目
                              </span>
                            </MenuItem>
                            {!!constructionJobList &&
                              constructionJobList?.map((type) => (
                                <MenuItem
                                  key={"select" + type.id}
                                  value={type.id}
                                >
                                  {type.name}
                                </MenuItem>
                              ))}
                          </Select>
                          {isLoading && (
                            <span className="absolute flex items-center right-10 top-0 bottom-0">
                              <CircularProgress color="primary" size={20} />
                            </span>
                          )}
                        </FormControl>
                      )}
                    />
                    <FormHelperText
                      className="!text-red-600 break-words !text-right !mt-0"
                      sx={{ minHeight: "1.25rem" }}
                    >
                      {errors["job"]?.message}
                    </FormHelperText>
                  </div>
                </div>
                <div className="inline-flex sm:flex-row flex-col sm:gap-2 gap-0  sm:mb-0">
                  {/* 施工日期 */}
                  <div className="w-full  mt-1">
                    <InputTitle title={"施工日期"} required={false} />
                    <ControlledDatePicker name="since" />
                  </div>

                  {/* 完工日期 */}
                  <div className="w-full mt-1">
                    <InputTitle title={"完工日期"} required={false} />

                    <ControlledDatePicker name="until" minDate={sinceDay} />
                    <FormHelperText
                      className="!text-red-600  break-words !text-right !m-0"
                      sx={{ minHeight: "1.25rem" }}
                    >
                      <span>{errors.until?.message}</span>
                    </FormHelperText>
                  </div>
                </div>
              </div>
            </div>

            <div className="h-fit flex justify-between gap-x-2">
              <Button
                variant="contained"
                color="secondary"
                className="!text-base !h-10  w-1/3"
                onClick={() => {
                  onClose();
                }}
              >
                關閉不儲存
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="success"
                className="!text-base !h-10 w-1/3"
              >
                下一步
              </Button>
            </div>
            <div className="flex mt-2">
              <p className="!my-0 text-rose-400 font-bold text-xs !me-1">＊</p>
              <p className="!my-0 text-rose-400 font-bold text-xs">
                儲存即新增/修改該施工清單
              </p>
            </div>
          </form>
        </FormProvider>
      </div>
    );
  }
);

// step-2 的 div，編修工項執行，會用主面板拿到的summaryID重求API後設為deliveryInfo傳進來
const EditJobTaskDiv = React.memo(
  ({
    deliverInfo,
    sendDataToBackend,
    isDivDirty,
    setIsDivDirty,
    setCurrentDivIndex,
    currentDivIndex,
    onClose,
    setDeliverInfoFromList,
    isLoading,
    setIsLoading,
  }) => {
    // Alert 開關

    // const [isLoading, setIsLoading] = useState(true);
    // 會有 A.原已選擇task清單，B.原總task清單，然後過濾，最後呈現 C.過濾完task清單(顯示在下拉是選單)、D.已選擇task清單(呈現在下面跟右邊的面板)
    //A.原已選擇task清單，從api取得已選擇的工項執行task清單, 還沒過濾之前
    const [apiSelectedTask, setApiSelectedTask] = useState(null);
    //B 在useEffect取得後直接做處理因此沒有另外儲存
    //C.過濾完task清單
    const [constructionTaskList, setConstructionTaskList] = useState(null);
    //D.此施工清單已選擇的工項執行task清單，list呈現的部分
    const [selectedTasks, setSelectedTasks] = useState([]);
    //新增加的但減去D的部分
    const [selectedTask, setSelectedTask] = useState("");

    // 用來處理跳出dialog並編輯工項執行
    const [taskEditOpen, setTaskEditOpen] = useState(false);
    const [deliverTaskInfo, setDeliverTaskInfo] = useState(null);

    const summarySince = new Date(deliverInfo?.since);
    const summaryUntil = new Date(deliverInfo?.until);

    const theme = useTheme();
    const padScreen = useMediaQuery(theme.breakpoints.down("768"));

    useEffect(() => {
      if (!padScreen) {
        setCurrentDivIndex(0);
      }
    }, [padScreen]);

    // 先用id求得清單中有的工項執行
    useEffect(() => {
      setIsLoading(true);
      if (apiSelectedTask === null) {
        getApiSelectedTask(deliverInfo?.id);
      }
    }, [deliverInfo]);

    const getApiSelectedTask = (id) => {
      const seledtedTaskUrl = `constructionSummary/${id}/tasks`;
      getData(seledtedTaskUrl).then((result) => {
        setApiSelectedTask(result.result);
        // console.log("ApiSelectedTask,", result.result);
      });
    };

    //取得工程項目執行並設定已選擇及剩下能選擇的清單
    useEffect(() => {
      if (!!apiSelectedTask) {
        setIsLoading(true);
        const taskurl = `constructionJob/${deliverInfo.constructionJob.id}/task`;
        getData(taskurl).then((result) => {
          // setIsLoading(false);
          const data = result.result;
          const contains = [];

          for (const t of apiSelectedTask) {
            const matchTask = data.find(
              (d) => d.id === t.constructionJobTask.id
            );
            if (matchTask) {
              contains.push(t);
            }
          }
          const notMatchingTasks = data.filter((d) => {
            return !apiSelectedTask.some(
              (t) => t.constructionJobTask.id === d.id
            );
          });
          setSelectedTasks(contains);
          setConstructionTaskList(notMatchingTasks);
          setTimeout(() => {
            setIsLoading(false);
          }, 100);
        });
      }
    }, [apiSelectedTask]);

    // 選擇新增移除御三家  //紀錄被選擇的工項執行id  -> selected 只有id
    const handleTaskChange = useCallback((event) => {
      const selected = event.target.value;
      setSelectedTask(selected);
    }, []);

    // 選擇新增移除御三家
    const handleAddTask = useCallback(() => {
      if (!isDivDirty) setIsDivDirty(true);
      if (selectedTask) {
        const handleSeletedTask = [
          {
            constructionJobTask: constructionTaskList.find(
              (p) => p.id === selectedTask
            ),
            id: "",
          },
          ...selectedTasks,
        ];

        setSelectedTasks(
          handleSeletedTask.sort((a, b) => {
            // 先檢查 estimatedSince 是否为非空字符串
            if (a.estimatedSince && !b.estimatedSince) {
              return -1; // a 在前
            } else if (!a.estimatedSince && b.estimatedSince) {
              return 1; // b 在前
            } else if (a.estimatedSince && b.estimatedSince) {
              // estimatedSince 都非空，按日期排序
              if (a.estimatedSince < b.estimatedSince) {
                return -1;
              } else if (a.estimatedSince > b.estimatedSince) {
                return 1;
              }
            }
            if (a.estimatedUntil < b.estimatedUntil) {
              return -1;
            } else if (a.estimatedUntil > b.estimatedUntil) {
              return 1;
            }

            return 0; // a 和 b 相等
          })
        );
        setConstructionTaskList(
          constructionTaskList
            .filter((p) => p.id !== selectedTask)
            .sort((a, b) => a.ordinal - b.ordinal)
        );
        setSelectedTask("");
      }
    }, [selectedTask, constructionTaskList, selectedTasks]);

    // 選擇新增移除御三家
    const handleRemoveTask = useCallback(
      (task) => {
        if (!isDivDirty) setIsDivDirty(true);
        setConstructionTaskList(
          [
            selectedTasks.find((p) => p.constructionJobTask.id === task)
              .constructionJobTask,
            ...constructionTaskList,
          ].sort((a, b) => a.ordinal - b.ordinal)
        );
        setSelectedTasks(
          selectedTasks.filter((p) => p.constructionJobTask.id !== task)
        );
        // getApiSelectedTask(deliverInfo.id);
      },
      [selectedTasks, constructionTaskList]
    );
    // 開啟edit dialog
    const handleEditTask = useCallback((task) => {
      setTaskEditOpen(true);
      setDeliverTaskInfo(task);
    }, []);

    // edit dialo傳回來的data統合
    const sendDataToTaskEdit = (data) => {
      if (!isDivDirty) setIsDivDirty(true);
      const checkListIndex = selectedTasks.findIndex(
        (i) => i.constructionJobTask.id === data.constructionJobTask.id
      );
      if (checkListIndex !== -1) {
        const updatedSelectedTasks = [...selectedTasks];
        updatedSelectedTasks[checkListIndex] = data;
        setSelectedTasks(
          updatedSelectedTasks.sort((a, b) => {
            // 先检查 estimatedSince 是否為空
            if (a.estimatedSince && !b.estimatedSince) {
              return -1;
            } else if (!a.estimatedSince && b.estimatedSince) {
              return 1;
            } else if (a.estimatedSince && b.estimatedSince) {
              if (a.estimatedSince < b.estimatedSince) {
                return -1;
              } else if (a.estimatedSince > b.estimatedSince) {
                return 1;
              }
            }

            if (a.estimatedUntil < b.estimatedUntil) {
              return -1;
            } else if (a.estimatedUntil > b.estimatedUntil) {
              return 1;
            }

            return 0; // a 和 b 相等
          })
        );
      }
    };

    const onTaskEditClose = () => {
      setTaskEditOpen(false);
      setDeliverTaskInfo(null);
    };

    const onSubmit = async (activeStep) => {
      const convertData = [];
      for (var task of selectedTasks) {
        const tempTask = {
          id: task?.id ? task.id : "",
          constructionJobTask: task.constructionJobTask.id,
          estimatedSince: task.estimatedSince ? task.estimatedSince : "",
          estimatedUntil: task.estimatedUntil ? task.estimatedUntil : "",
          location: task?.location ? task.location : "",
          remark: task?.remark ? task.remark : "",
        };
        if (tempTask.id === "") {
          delete tempTask.id;
        }
        convertData.push(tempTask);
      }
      sendDataToBackend(convertData, "task", [deliverInfo.id, activeStep]);
      setDeliverInfoFromList(deliverInfo.id);
    };

    // console.log(deliverInfo);
    return (
      <>
        {/* 除了按鈕以外的主內容顯示 */}
        <div className="h-full flex max-h-[432px] gap-x-3">
          {/* 左邊欄 */}
          <div
            className={`flex flex-col flex-1 gap-y-3 my-2 
          ${!currentDivIndex ? "flex" : "hidden"}`}
          >
            <div>
              <TextField
                variant="outlined"
                size="small"
                className="inputPadding"
                label="清單標題"
                value={deliverInfo?.name ? deliverInfo.name : ""}
                fullWidth
                inputProps={{ readOnly: true }}
              />
            </div>
            <div className="inline-flex gap-x-3 w-full">
              <FormControl
                size="small"
                className="inputPadding relative"
                fullWidth
              >
                <Select
                  disabled={isLoading}
                  labelId="task-select-label"
                  value={selectedTask}
                  onChange={handleTaskChange}
                  displayEmpty
                  //MenuProps={MenuProps}
                >
                  <MenuItem value="" disabled>
                    <span className="text-neutral-400 font-light">
                      請選擇工項執行
                    </span>
                  </MenuItem>
                  {constructionTaskList?.map((task) => (
                    <MenuItem key={"select" + task.id} value={task.id}>
                      {task.name}
                    </MenuItem>
                  ))}
                </Select>
                {isLoading && (
                  <span className="absolute flex items-center right-10 top-0 bottom-0">
                    <CircularProgress color="primary" size={20} />
                  </span>
                )}
              </FormControl>
              <Button
                variant="contained"
                color="dark"
                onClick={handleAddTask}
                disabled={!selectedTask}
                className="!text-base !h-12"
              >
                新增
              </Button>
            </div>
            <List className="overflow-y-scroll border border-neutral-300 rounded h-full">
              {!isLoading ? (
                <TransitionGroup>
                  {selectedTasks.length > 0 ? (
                    selectedTasks.map((task) => (
                      <Collapse key={"selected" + task.constructionJobTask?.id}>
                        <ListItem>
                          <ListItemText
                            secondary={task.constructionJobTask?.name}
                          />
                          <IconButton
                            onClick={() => {
                              handleEditTask(task);
                            }}
                          >
                            <Edit />
                          </IconButton>
                          {task.id.length === 0 && (
                            <IconButton
                              onClick={() => {
                                handleRemoveTask(task.constructionJobTask.id);
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          )}
                        </ListItem>
                        <Divider variant="middle" />
                      </Collapse>
                    ))
                  ) : (
                    <Collapse>
                      <ListItem>
                        <ListItemText
                          sx={{ textAlign: "center" }}
                          secondary="尚無資料"
                        />
                      </ListItem>
                    </Collapse>
                  )}
                </TransitionGroup>
              ) : (
                <Loading size={18} />
              )}
            </List>
          </div>
          {/* 右邊欄 */}

          <div
            className={`${currentDivIndex ? "block" : "hidden"} 
            block flex-1 my-2 md:block md:w-full right-0 left-0 top-0 bottom-0 z-10 border-2 overflow-y-scroll rounded-md bg-slate-50 `}
          >
            {!!selectedTasks.length ? (
              selectedTasks.map((task, index) => (
                <Card
                  className="m-2 mb-0 shadow-sm !p-0 !pb-2 h-fit"
                  key={index + task.constructionJobTask.name}
                  onClick={() => {
                    handleEditTask(task);
                  }}
                >
                  <CardContent className="!p-2">
                    <Typography variant="h6" component="div" className="pl-3">
                      {task?.constructionJobTask.name
                        ? task?.constructionJobTask.name
                        : "尚無資料"}
                    </Typography>
                    <Typography variant="body2" className="pl-2">
                      <span className="m-1">
                        {task?.estimatedSince
                          ? task.estimatedSince
                          : "施工日期未選"}
                      </span>
                      <span>-</span>
                      <span className="m-1">
                        {task?.estimatedUntil
                          ? task.estimatedUntil
                          : "完工日期未選"}
                      </span>
                      <br />
                      <span className="m-1">
                        施工位置: {task?.location ? task.location : ""}
                      </span>
                      <br />
                      <span className="m-1 overflow-x-auto break-words">
                        說明: {task?.remark ? task.remark : ""}
                      </span>
                    </Typography>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="m-2 shadow-sm !p-0">
                <CardContent className="!p-2">
                  <Typography variant="h6" component="div" className="pl-3">
                    尚無資料
                  </Typography>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* 下方按鈕顯示 */}
        <div>
          <div className="h-fit flex justify-between gap-x-2">
            <Button
              variant="contained"
              color="success"
              disabled={!!currentDivIndex}
              className="!text-base !h-10 !mt-1 "
              fullWidth
              onClick={() => {
                onSubmit(0);
              }}
            >
              上一步
            </Button>
            <Button
              variant="contained"
              color="secondary"
              className="!text-base !h-10 !mt-1"
              fullWidth
              onClick={() => {
                padScreen ? setCurrentDivIndex(!currentDivIndex) : onClose();
              }}
            >
              {currentDivIndex ? "返回" : padScreen ? "預覽" : "關閉且不儲存"}
            </Button>
            <Button
              type="onSubmit"
              variant="contained"
              disabled={!!currentDivIndex}
              color="success"
              className={`!text-base !h-10 !mt-1`}
              fullWidth
              onClick={() => {
                onSubmit(2);
                // setActiveStep(2);
              }}
            >
              下一步
            </Button>
          </div>
          <div className="flex mt-2">
            <p className="!my-0 text-rose-400 font-bold text-xs !me-1">＊</p>
            <p className="!my-0 text-rose-400 font-bold text-xs">
              上一步及下一步皆會儲存本頁資料。
            </p>
          </div>
        </div>
        {/* <Backdrop
          sx={{ color: "#fff", zIndex: 1050 }}
          open={isLoading}
          onClick={onCheckDirty}
        >
          <LoadingThree size={40} />
        </Backdrop> */}
        <TaskEditDialog
          deliverTaskInfo={deliverTaskInfo}
          setIsLoading={setIsLoading}
          sendDataToTaskEdit={sendDataToTaskEdit}
          onClose={onTaskEditClose}
          isOpen={taskEditOpen}
          summarySince={summarySince}
          summaryUntil={summaryUntil}
        />
      </>
    );
  }
);

// step-2.5 用來新增編輯工項執行的日期、地點備註用的 dialog
const TaskEditDialog = React.memo(
  ({
    deliverTaskInfo,
    sendDataToTaskEdit,
    onClose,
    isOpen,
    setIsLoading,
    summarySince,
    summaryUntil,
  }) => {
    // Alert 開關
    // 檢查是否被汙染
    const [alertOpen, setAlertOpen] = useState(false);

    const schema = yup.object().shape({
      estimatedSince: yup.date().nullable(),
      estimatedUntil: yup
        .date()
        .nullable()
        .test({
          name: "custom-validation",
          message: "结束日期不能早於施工日期",
          test: function (estimatedUntil) {
            const estimatedSince = this.parent.estimatedSince;

            // 只有在 estimatedSince 和 estimatedUntil 都有值時才驗證
            // 下面的用意是如果從後端拿到日期為了載入日期選擇器，會轉成00:08:00 GMT+0800的時區，但如果本地端選擇的話會是00:00:00 GMT+0800，
            // 會導致選同一天卻顯示結束比開始早而報錯。
            if (estimatedSince && estimatedUntil) {
              const formattedEstimatedSince = new Date(
                estimatedSince
              ).toLocaleDateString("en-CA", { timeZone: "Asia/Taipei" });
              const formattedEstimatedUntil = new Date(
                estimatedUntil
              ).toLocaleDateString("en-CA", { timeZone: "Asia/Taipei" });
              return formattedEstimatedUntil >= formattedEstimatedSince;
            }
            return true; // 如果其中一個為空，則不驗證
          },
        }),
    });

    const methods = useForm({
      // defaultValues,
      resolver: yupResolver(schema),
    });
    // 使用 useForm Hook 來管理表單狀態和驗證
    const {
      control,
      handleSubmit,
      reset,
      watch,
      formState: { errors, isDirty },
    } = methods;

    const estimatedSince = watch("estimatedSince");

    // 檢查表單是否汙染
    const onCheckDirty = () => {
      if (isDirty) {
        setAlertOpen(true);
      } else {
        onClose();
      }
    };
    // // Alert 回傳值進行最終結果 --- true: 關閉 modal / all: 關閉 Alert
    const handleAlertClose = (agree) => {
      if (agree) {
        onClose();
      }
      setAlertOpen(false);
      // setAlertDateChangeOpen(false);
    };

    // deliverTaskInfo 傳進來的 {id: '7056078833492952896', constructionJobTask: {…}, estimatedSince: null, estimatedUntil: null, location: '', …}
    // 格式 {id: '', constructionJobTask:1 , estimatedSince: '', estimatedUntil: '', location: '', remarK:''}

    //將外面傳進來的資料deliverInfo代入到每個空格之中 OK
    useEffect(() => {
      if (!!deliverTaskInfo) {
        setIsLoading(true);
        reset({
          id: deliverTaskInfo?.id ? deliverTaskInfo?.id : "",
          constructionJobTask: deliverTaskInfo.constructionJobTask.id,
          estimatedSince: deliverTaskInfo?.estimatedSince
            ? new Date(deliverTaskInfo.estimatedSince)
            : null,
          estimatedUntil: deliverTaskInfo?.estimatedUntil
            ? new Date(deliverTaskInfo.estimatedUntil)
            : null,
          location: deliverTaskInfo?.location ? deliverTaskInfo.location : "",
          remark: deliverTaskInfo?.remark ? deliverTaskInfo.remark : "",
        });
        setIsLoading(false);
      }
    }, [deliverTaskInfo, reset]);

    // useEffect(()=>{

    // },[data.estimatedSince])

    const onSubmit = (data) => {
      //console.log("要送出的", data);
      const convertData = {
        id: deliverTaskInfo?.id ? deliverTaskInfo?.id : "",
        constructionJobTask: {
          id: deliverTaskInfo.constructionJobTask.id,
          name: deliverTaskInfo.constructionJobTask.name,
        },
        estimatedSince: data?.estimatedSince
          ? format(data.estimatedSince, "yyyy-MM-dd")
          : "",
        estimatedUntil: data?.estimatedUntil
          ? format(data.estimatedUntil, "yyyy-MM-dd")
          : "",
        location: data?.location ? data.location : "",
        remark: data?.remark ? data.remark : "",
      };

      if (!deliverTaskInfo.constructionSummaryJobTaskDispatches?.length) {
        sendDataToTaskEdit(convertData);
        onClose();
      } else {
        if (
          convertData.estimatedSince === deliverTaskInfo.estimatedSince &&
          convertData.estimatedUntil === deliverTaskInfo.estimatedUntil
        ) {
          sendDataToTaskEdit(convertData);
          onClose();
        }
        // else {
        //   setAlertDateChangeOpen(true);
        // }
      }

      sendDataToTaskEdit(convertData);
    };

    return (
      <>
        {deliverTaskInfo && (
          <Dialog open={isOpen} onClose={onCheckDirty}>
            <DialogTitle id="responsive-dialog-title" className="mt-5 ">
              <span className=" border-b-2 p-2">
                {deliverTaskInfo?.constructionJobTask?.name}{" "}
                <span className="text-sm mx-2">編輯</span>
              </span>
            </DialogTitle>
            <DialogContent>
              <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="flex flex-col gap-1.5 mt-3">
                    <InputTitle title={"預計施工日期"} required={false} />
                    <ControlledDatePicker
                      name="estimatedSince"
                      minDate={summarySince}
                      maxDate={summaryUntil}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 mt-3">
                    <InputTitle title={"預計完工日期"} required={false} />
                    <ControlledDatePicker
                      name="estimatedUntil"
                      minDate={!!estimatedSince ? estimatedSince : summarySince}
                      maxDate={summaryUntil}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 mt-3">
                    <InputTitle title={"施工位置"} required={false} />

                    <Controller
                      name="location"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          variant="outlined"
                          size="small"
                          className="inputPadding"
                          placeholder="請輸入施工位置"
                          //   inputProps={{ readOnly: true }}
                          fullWidth
                          {...field}
                        />
                      )}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 mt-3">
                    <InputTitle title={"說明 /備註"} required={false} />
                    <Controller
                      name="remark"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          variant="outlined"
                          size="small"
                          className="inputPadding"
                          placeholder="請輸入說明或備註"
                          //   inputProps={{ readOnly: true }}
                          fullWidth
                          {...field}
                        />
                      )}
                    />
                  </div>

                  <div className="flex-col inline-flex w-full ">
                    <FormHelperText
                      className="!text-red-600 break-words !text-right !mt-0"
                      sx={{ minHeight: "1.25rem" }}
                    >
                      <span>{errors.estimatedUntil?.message}</span>
                    </FormHelperText>
                    <div className="flex gap-2">
                      <Button
                        variant="contained"
                        color="success"
                        className="!text-base !h-12 "
                        fullWidth
                        onClick={() => {
                          onCheckDirty();
                        }}
                      >
                        返回
                      </Button>
                      <Button
                        type="submit"
                        variant="contained"
                        color="success"
                        className="!text-base !h-12 "
                        fullWidth
                      >
                        儲存
                      </Button>
                    </div>
                  </div>
                </form>
              </FormProvider>
            </DialogContent>
          </Dialog>
        )}
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

// step-3 的 div，編修派工人員，想要正常執行 EditDispatchDiv，一定要傳一個 summaryID進去
const EditDispatchDiv = React.memo(
  ({
    deliverInfo,
    setActiveStep,
    setCurrentDivIndex,
    currentDivIndex,
    departMemberList,
    onClose,
    isLoading,
    setIsLoading,
    RefleshMainList,
  }) => {
    //載入後先抓api=右半部卡片內容
    const [taskList, setTaskList] = useState([]);
    //每個卡片都有自己的日期狀態
    const [dateList, setDateList] = useState([]);
    const [isDispatchLoading, setIsDispatchLoading] = useState(false);
    const [switchStates, setSwitchStates] = useState({});

    //要送出哪位員工在哪天被派出用
    const [selectedDate, setSelectedDate] = useState("");

    const [activeCard, setActiveCard] = useState("");
    const [selectedSwitch, setSelectedSwitch] = useState(null);
    const [disabledSwitchId, setDisabledSwitchId] = useState(null);
    const theme = useTheme();
    const padScreen = useMediaQuery(theme.breakpoints.down("768"));

    const showNotification = useNotification();
    const navigate = useNavigate();
    useEffect(() => {
      setIsLoading(true);
    }, []);

    // 打開面板先取得工務人員清單跟工項執行列表
    useEffect(() => {
      // if (deliverInfo) {
      if (!!deliverInfo) {
        getTaskList();
      }
    }, [deliverInfo]);

    // 當螢幕在手機模式跟電腦寬度之間拉伸的話，要隨時重製初始視窗
    useEffect(() => {
      if (!padScreen) {
        setCurrentDivIndex(0);
      }
    }, [padScreen]);

    //當選了日期後，要設置日期有哪些人被派出，在switch上呈現
    useEffect(() => {
      updateSwitchState();
    }, [activeCard, selectedDate]);

    const getTaskList = () => {
      if (!!deliverInfo) {
        // console.log("deliverInfo", deliverInfo);
        const seledtedTaskUrl = `constructionSummary/${deliverInfo?.id}/tasks`;
        getData(seledtedTaskUrl).then((result) => {
          //console.log("taskList", result.result);
          setTaskList(result.result);
          if (!!activeCard) {
            const matchCard = result.result.findIndex(
              (task) => task.id === activeCard.id
            );
            setActiveCard(result.result[matchCard]);
          }
          setIsDispatchLoading(false);
          setIsLoading(false);
        });
      }
    };

    // 點擊卡片的時候，會設定該卡片能選擇的日期，並預設日期為第一個可選擇日，以及派工所需的卡片ID
    const handleClickCard = (task) => {
      setActiveCard(task);
      if (!!task.estimatedSince && !!task.estimatedUntil) {
        const since = new Date(task.estimatedSince);
        const until = new Date(task.estimatedUntil);
        let dateOptions = [];
        const currentDate = new Date(since);
        while (currentDate <= until) {
          const formattedDate = `${currentDate.getFullYear()}-${(
            currentDate.getMonth() + 1
          )
            .toString()
            .padStart(2, "0")}-${currentDate
            .getDate()
            .toString()
            .padStart(2, "0")}`;
          const dayOfWeek = ["日", "一", "二", "三", "四", "五", "六"][
            currentDate.getDay()
          ];
          const displayDate = `${formattedDate} (星期${dayOfWeek})`;
          dateOptions.push({ value: formattedDate, label: displayDate });
          currentDate.setDate(currentDate.getDate() + 1);
        }
        setDateList(dateOptions);
        setSelectedDate(dateOptions[0].value);
      } else {
        setDateList(null);
        setSelectedDate("");
      }
      if (padScreen) {
        setCurrentDivIndex(1);
      }
      setSwitchStates({});
    };

    const clickSwitch = (e, memberId) => {
      postDispatchApi(e, memberId);
      setDisabledSwitchId(memberId);
      setIsDispatchLoading(true);
    };

    const handleSwitchState = (checked, memberId) => {
      if (memberId) {
        const newState = {
          ...switchStates,
          [memberId]: checked,
        };
        setSwitchStates(newState);
      }
    };

    const postDispatchApi = (e, labourersId) => {
      e.preventDefault();
      setSelectedSwitch(labourersId);
      let timerId;
      const postUrl = `constructionSummaryJobTask/${activeCard.id}/dispatches`;
      // 開關的開->派遣
      if (e.target.checked) {
        try {
          const params = { labourers: labourersId, date: selectedDate };
          handleSwitchState(e.target.checked, labourersId);
          if (timerId) {
            clearTimeout(timerId);
          }
          postData(postUrl, params).then((result) => {
            //console.log(result);
            if (result.status) {
              showNotification(
                "新增成功，目前人員有" +
                  result?.result?.result?.map((i) => i.labourer.nickname),

                true
              );
              getTaskList();
            } else if (result.result.response !== 200) {
              showNotification(
                result?.result?.reason
                  ? result.result.reason
                  : "Oops! 發生錯誤!",
                false
              );
              updateSwitchState();
              setIsDispatchLoading(false);
            }
          });
        } catch (error) {
          // 處理錯誤
          console.error("Error:", error);
          updateSwitchState();
          setIsDispatchLoading(false);
        }
      } else {
        try {
          // 開關的關->取消派遣
          //filteredObjects: 刪除的時候，將constructionSummaryJobTaskDispatches中對應該員工ID的那個物件(編號)取出
          const filteredObjects =
            activeCard.constructionSummaryJobTaskDispatches.filter(
              (item) => item.labourer.id === labourersId
            );
          if (filteredObjects) {
            const deleteUrl = `constructionSummaryJobTaskDispatch/${filteredObjects[0].id}`;
            handleSwitchState(e.target.checked, labourersId);
            if (timerId) {
              clearTimeout(timerId);
            }
            deleteData(deleteUrl).then((result) => {
              if (result.status) {
                showNotification(
                  "刪除成功，尚有人員" +
                    result?.result?.result?.map((i) => i.labourer.nickname),
                  true
                );
                getTaskList();
              } else if (result.result.response !== 200) {
                updateSwitchState();
                setIsDispatchLoading(false);
              }
            });
          }
        } catch (error) {
          // 處理錯誤
          console.error("Error:", error);
          updateSwitchState();
          setIsDispatchLoading(false);
        }
      }
    };

    const updateSwitchState = () => {
      if (selectedDate) {
        const updatedSwitchStates = {}; // 創建一個新的物件來儲存更新後的狀態
        departMemberList.forEach((member) => {
          updatedSwitchStates[member.id] =
            activeCard &&
            !!activeCard.constructionSummaryJobTaskDispatches.find(
              (item) =>
                item.labourer.id === member.id && item.date === selectedDate
            );
        });
        setSwitchStates(updatedSwitchStates); // 使用更新後的物件來設定狀態
      }
    };

    const generateDateRange = (estimatedSince, estimatedUntil) => {
      if (estimatedSince && estimatedUntil) {
        // 如果都有值，使用日期區間的方法生成日期陣列
        const startDate = new Date(estimatedSince);
        const endDate = new Date(estimatedUntil);

        const dates = [];
        let currentDateIterator = new Date(startDate);
        while (currentDateIterator <= endDate) {
          dates.push(currentDateIterator.toISOString().slice(0, 10));
          currentDateIterator.setDate(currentDateIterator.getDate() + 1);
        }

        return dates;
      } else {
        // 如果有null，生成 [null, yyyy-MM-dd] 或 [yyyy-MM-dd, null]
        const dateArray = [];
        if (estimatedSince !== null) {
          dateArray.push(estimatedSince);
          dateArray.push(null);
        } else if (estimatedUntil !== null) {
          dateArray.push(null);
          dateArray.push(estimatedUntil);
        }
        return dateArray;
      }
    };

    return (
      <>
        {/* 上邊欄 */}
        <div className="h-full flex max-h-[432px] gap-x-3">
          {/* 上邊的左欄 */}

          <div
            className={`md:block  flex-1 gap-y-3 my-2 p-2 overflow-y-scroll
          ${!currentDivIndex ? "block" : "hidden"}`}
          >
            <Card className="!shadow-sm !p-0 md:hidden text-center mb-2">
              <CardContent className="!p-0">
                <Typography variant="h6" component="div" className="pl-3">
                  <span> "請點擊卡片進行派工"</span>
                </Typography>
              </CardContent>
            </Card>

            {isLoading ? (
              <Loading size={18} /> // 如果 isLoading 为 true，显示 Loading 组件
            ) : !!taskList?.length ? (
              taskList.map((task, index) => (
                <Card
                  className={` !p-0 mb-3 relative ${
                    activeCard.id === task.id && "!bg-slate-200 "
                  }`}
                  key={index + task.constructionJobTask.name}
                  onClick={() => {
                    handleClickCard(task);
                  }}
                >
                  <CardContent className="!p-2">
                    <Typography variant="h6" component="div" className="px-3">
                      <span>
                        {task?.constructionJobTask.name
                          ? task?.constructionJobTask.name
                          : "尚無資料"}
                      </span>
                    </Typography>
                    <Typography variant="body2" className="p-3">
                      <span className="">
                        預計施工日期:{" "}
                        {task?.estimatedSince ? task.estimatedSince : ""}
                      </span>

                      <br />
                      <span className="">
                        預計完工日期:{" "}
                        {task?.estimatedUntil ? task.estimatedUntil : ""}
                      </span>
                      <br />
                      <span className="">
                        施工位置: {task?.location ? task.location : ""}
                      </span>
                      <br />
                      <span className="overflow-x-auto pe-5">
                        說明: {task?.remark ? task.remark : ""}
                      </span>
                      <span className="bg-gray-300 w-full h-[0.1px] inline-block m-0 text-xs"></span>
                      {/* <hr className="m-1"/> */}
                      {generateDateRange(
                        task.estimatedSince,
                        task.estimatedUntil
                      ).map((date) => (
                        <React.Fragment key={date}>
                          <span className=" w-full ">
                            <span>{date ? date + ": " : ""}</span>

                            <span className="">
                              {task?.constructionSummaryJobTaskDispatches
                                .length > 0 &&
                                task?.constructionSummaryJobTaskDispatches
                                  ?.filter((d) => d.date === date)
                                  .map(
                                    (dispatch) => dispatch.labourer?.nickname
                                  )
                                  .join(", ")}
                            </span>
                            <br />
                          </span>
                        </React.Fragment>
                      ))}
                    </Typography>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className=" shadow-sm !p-0 ">
                <CardContent className="!p-2">
                  <Typography
                    variant="h6"
                    component="div"
                    className="pl-3 text-center"
                  >
                    <span>尚無資料</span>
                  </Typography>
                </CardContent>
              </Card>
            )}
          </div>
          {/* 上邊的右欄 */}
          <div
            className={`${currentDivIndex ? "block" : "hidden"} 
            block flex-1 my-2 p-2 md:block md:w-full right-0 left-0 top-0 bottom-0 z-10 border-2 overflow-y-scroll rounded-md bg-slate-50 `}
          >
            {activeCard ? (
              <div className="">
                <InputTitle title={"日期"} required={false} />
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={selectedDate}
                  fullWidth
                  onChange={(event) => {
                    setSelectedDate(event.target.value);
                  }}
                >
                  {!!dateList &&
                    dateList.map((date) => (
                      <MenuItem key={date.value} value={date.value}>
                        {date.label}
                      </MenuItem>
                    ))}
                </Select>
                <InputTitle
                  title={"派工人員"}
                  required={false}
                  classnames="mt-2"
                ></InputTitle>
                <List className="overflow-y-auto border border-neutral-300 rounded !mb-2.5">
                  {departMemberList?.length > 0 ? (
                    <TransitionGroup>
                      {departMemberList.map((member) => (
                        <Collapse key={member.id}>
                          <ListItem className="!bg-transparent">
                            <ListItemText
                              secondary={
                                member.department.name + " / " + member.nickname
                              }
                            />
                            <IOSSwitch
                              sx={{ m: 1 }}
                              checked={switchStates[member.id] || false}
                              disabled={
                                isDispatchLoading &&
                                disabledSwitchId === member.id
                              }
                              onChange={(e) => {
                                clickSwitch(e, member.id);
                              }}
                            />
                          </ListItem>
                          <Divider variant="middle" />
                        </Collapse>
                      ))}
                    </TransitionGroup>
                  ) : (
                    <span className="flex h-full items-center justify-center">
                      <span className="italic text-neutral-500 text-sm">
                        (該部門已無人選)
                      </span>
                    </span>
                  )}
                </List>
              </div>
            ) : (
              <Card className=" shadow-sm !p-0">
                <CardContent className="!p-2">
                  <Typography
                    variant="h6"
                    component="div"
                    className="pl-3 text-center"
                  >
                    <span>請選擇左側工項卡片</span>
                  </Typography>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
        {/* 下邊欄用來放提交button */}
        <div>
          <div className="h-fit flex justify-between gap-x-2">
            <Button
              variant="contained"
              color="success"
              className="!text-base !h-10 !mt-1"
              fullWidth
              disabled={currentDivIndex === 1}
              onClick={() => {
                setActiveStep(1);
              }}
            >
              上一步
            </Button>
            <Button
              variant="contained"
              color="secondary"
              className="!text-base !h-10 !mt-1"
              fullWidth
              onClick={() => {
                if (currentDivIndex === 0) {
                  RefleshMainList();
                  onClose();
                } else if (padScreen) {
                  setCurrentDivIndex(0);
                }
              }}
            >
              {currentDivIndex === 0 ? "關閉" : "返回"}
            </Button>
            <Button
              variant="contained"
              color="success"
              className="!text-small sm:!text-base !h-10 !mt-1"
              fullWidth
              disabled={currentDivIndex === 1}
              onClick={() => {
                navigate("/dispatchcalendar");
              }}
            >
              派工行事曆
            </Button>
          </div>
          <div className="flex mt-2">
            <p className="!my-0 text-rose-400 font-bold text-xs !me-1">＊</p>
            <p className="!my-0 text-rose-400 font-bold text-xs">
              本頁面每個派工選項皆會直接儲存資料。
            </p>
          </div>
        </div>
      </>
    );
  }
);
