import React, { useEffect, useState } from "react";
import ModalTemplete from "../../components/Modal/ModalTemplete";

import ControlledDatePicker from "../../components/DatePicker/ControlledDatePicker";
import { format } from "date-fns";
import AlertDialog from "../../components/Alert/AlertDialog";
import { LoadingFour, LoadingThree } from "../../components/Loader/Loading";
import { TextField, FormHelperText, Backdrop } from "@mui/material";
// import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import EditCalendarIcon from "@mui/icons-material/EditCalendar";
import { useForm, Controller, FormProvider } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { deleteData, postBodyData, postData } from "../../utils/api";
import { useNotification } from "../../hooks/useNotification";
import AddIcon from "@mui/icons-material/Add";
import InputTitle from "../../components/Guideline/InputTitle";

//  下面用來測下單選單
import Checkbox from "@mui/material/Checkbox";
import Autocomplete from "@mui/material/Autocomplete";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";

//   下面用來做accordion
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { TaskModal } from "./AddJobTask";

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);

const EventModal = React.memo(
  ({ deliverInfo, setReGetCalendarApi, onClose, departMemberList, isOpen }) => {
    // Alert 開關
    const [alertOpen, setAlertOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [sendBackFlag, setSendBackFlag] = useState(false);
    const [isDispatchDirty, setIsDispatchDirty] = useState(false);
    const [jobTask, setJobTask] = useState(null);
    const [addJobTask, setAddJobTask] = useState(null);
    const [taskSelectLabouerList, setTaskSelectLabouerList] = useState([]);
    const [dispatchForApi, setDispatchForApi] = useState([]);

    const [activeJobTask, setActiveJobTask] = useState("");

    //點擊刪除工項執行垃圾桶跳出警告框
    const [alertDeleteJobTaskOpen, setAlertDeleteJobTaskOpen] = useState(false);
    const [deleteJobTaskId, setDeleteJobTaskId] = useState(true);

    //把送出工項執行的url設為全域變數，有些postbody會再奇怪的地方執行
    const postBodyJobTaskUrl = `constructionSummary/${jobTask?.summaryId}/tasks`;

    //手機板的編輯狀態換div用
    const [currentDivIndex, setCurrentDivIndex] = useState(0);

    // 新增工項執行專用的汙染狀態
    const [jobTaskDirty, setJobTaskDirty] = useState(false);

    const showNotification = useNotification();

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

    const defaultValues = {
      estimatedSince: jobTask?.estimatedSince
        ? new Date(jobTask.estimatedSince)
        : null,
      estimatedUntil: jobTask?.estimatedUntil
        ? new Date(jobTask.estimatedUntil)
        : null,
      location: jobTask?.location ? jobTask.location : "",
      remark: jobTask?.remark ? jobTask.remark : "",
    };

    const methods = useForm({
      defaultValues,
      resolver: yupResolver(schema),
    });
    // 使用 useForm Hook 來管理表單狀態和驗證
    const {
      control,
      handleSubmit,
      reset,
      formState: { errors, isDirty },
    } = methods;

    // 任何jobTask改變重設工項執行選單顯示
    useEffect(() => {
      if (!!jobTask) {
        setIsLoading(true);
        reset({
          estimatedSince: jobTask?.estimatedSince
            ? new Date(jobTask.estimatedSince)
            : null,
          estimatedUntil: jobTask?.estimatedUntil
            ? new Date(jobTask.estimatedUntil)
            : null,
          location: jobTask?.location ? jobTask.location : "",
          remark: jobTask?.remark ? jobTask.remark : "",
        });
        setIsLoading(false);
      }
    }, [jobTask]);

    //如果deliverInfo被重設，就重新的取得JobTask，然後因為只有提交後才會重得deliveryInfo，所以要reset dirty狀態
    useEffect(() => {
      if (jobTask && deliverInfo?.summaries?.length > 0) {
        const updateJobTask = deliverInfo.summaries
          .flatMap((summary) =>
            summary?.summaryJobTasks
              ? summary.summaryJobTasks.map((summaryJobTask) => {
                  if (summaryJobTask.id === jobTask.id) {
                    return { ...summaryJobTask, summaryId: summary.id };
                  }
                  return undefined;
                })
              : []
          )
          .filter(Boolean); // 移除 undefined
        setAddJobTask(null);
        setJobTask(updateJobTask[0]);
        forTaskSelectLabouerList(updateJobTask[0]);
        setSendBackFlag(false);
        setIsDispatchDirty(false);
        reset();
      }
    }, [deliverInfo]);

    // 檢查表單是否汙染
    const onCheckDirty = () => {
      if (isDirty || jobTaskDirty) {
        setAlertOpen(true);
      } else {
        handleClose();
      }
    };
    // 下面僅關閉汙染警告視窗
    const handleAlertClose = async (agree) => {
      if (agree) {
        handleClose();
      }
      setAlertOpen(false);
    };

    const handleClose = () => {
      reset();
      setIsDispatchDirty(false);
      setCurrentDivIndex(0);
      setJobTaskDirty(false);
      setActiveJobTask("");
      setAddJobTask(null);
      setJobTask(null);
      onClose();
    };

    //僅提交工項執行的資料上傳
    const onSubmit = (data) => {
      setSendBackFlag(true);

      const convertData = [
        {
          id: jobTask?.id ? jobTask?.id : "",
          constructionJobTask: jobTask.constructionJobTask.id,
          estimatedSince: data?.estimatedSince
            ? format(data.estimatedSince, "yyyy-MM-dd")
            : "",
          estimatedUntil: data?.estimatedUntil
            ? format(data.estimatedUntil, "yyyy-MM-dd")
            : "",
          location: data?.location ? data.location : "",
          remark: data?.remark ? data.remark : "",
        },
      ];
      PostBodyData(postBodyJobTaskUrl, convertData);
      setReGetCalendarApi(deliverInfo.date);
    };

    //該天全部專案有被選的人
    const filterTheDayRestLabourer = () => {
      const filteredLabourerIds = deliverInfo.summaries.flatMap((summary) =>
        summary.summaryJobTasks.flatMap((summaryJobTask) =>
          summaryJobTask.constructionSummaryJobTaskDispatches
            .filter((dispatch) => dispatch.labourer.id !== undefined)
            .map((dispatch) => dispatch.labourer.id)
        )
      );
      //   console.log("filterTheDayRestLabourer",filteredLabourerIds);
      return filteredLabourerIds;
    };

    //過濾下拉式選單用的派工清單
    const forTaskSelectLabouerList = (selectedJobTask) => {
      const dayRestLabourerIds = filterTheDayRestLabourer();
      //全部可選的人 減去 該天已被選的人 => 可選的人
      const notSelected = departMemberList.filter(
        (member) => !dayRestLabourerIds.includes(member.id)
      );
      //全部可選的人 中只選出 該天已被選的人 => 要設置狀態
      //最終結果是選哪個執行，選單只有該執行已派人的人+完全沒被派過的人
      let selectedPersonnel = [];
      if (selectedJobTask?.constructionSummaryJobTaskDispatches?.length > 0) {
        selectedPersonnel = departMemberList.filter((person) => {
          return selectedJobTask.constructionSummaryJobTaskDispatches.some(
            (dispatch) => {
              if (dispatch.labourer.id === person.id) {
                // 如果 dispatch.labourer.id 与 person.id 匹配，就将 dispatch.id 添加到 person 对象中
                person.dispatchId = dispatch.id;
                return true; // 返回 true 以将该 person 包含在结果中
              }
              return false;
            }
          );
        });
      }
      setTaskSelectLabouerList([...notSelected, ...selectedPersonnel]);
      if (selectedJobTask?.constructionSummaryJobTaskDispatches?.length > 0) {
        const beSeleted = [...notSelected, ...selectedPersonnel].filter(
          (labourer) =>
            selectedJobTask.constructionSummaryJobTaskDispatches.some(
              (dispatched) => dispatched.labourer.id === labourer.id
            )
        );

        setDispatchForApi(beSeleted);
        //console.log("DispatchForApi", beSeleted);
      } else {
        setDispatchForApi([]);
        //console.log("DispatchForApi", []);
      }
      setIsLoading(false);
    };

    const handleJobTaskEdit = (selectedJobTask, summaryId) => {
      const jobTask = { ...selectedJobTask, summaryId };
      // console.log("jobTask", jobTask);
      setActiveJobTask(selectedJobTask.id);
      setDispatchForApi([]);
      setIsLoading(true);
      setAddJobTask(null);
      setJobTask(jobTask);
      //過濾下拉式選單用的派工清單
      forTaskSelectLabouerList(jobTask);
      setCurrentDivIndex(1);
    };

    // 派工人員的選擇，點選下拉是選單觸發
    const handleChange = (event, value) => {
      setIsDispatchDirty(true);
      setDispatchForApi(value);
      //   console.log("event", event);
    };

    // 點擊派工提交
    const handleDispatchOnly = async () => {
      setSendBackFlag(true);
      //console.log("目前選單裡面的人:", taskSelectLabouerList);

      const newIncrease = dispatchForApi
        .filter((item) => item && !item.hasOwnProperty("dispatchId"))
        .map((item) => item.id);
      //console.log("要新增的人(列id):", newIncrease);
      const removeWithPatchId = taskSelectLabouerList
        .filter((item) => item && item.hasOwnProperty("dispatchId"))
        .filter(
          (item1) =>
            !dispatchForApi.some(
              (item2) => item1.dispatchId === item2.dispatchId
            )
        )
        .map((item) => item.dispatchId);
      //   console.log("要移除的人(列派工id):", removeWithPatchId);
      //下面是處理新增派工的部分
      const dispatchUrl = `constructionSummaryJobTask/${jobTask.id}/dispatches`;
      const fd = new FormData();
      const disPatchData = { labourers: newIncrease, date: deliverInfo.date };
      for (let key in disPatchData) {
        fd.append(key, disPatchData[key]);
      }

      //用promise all等api都打完了再來發送日期給月曆主頁面，
      //讓月曆主頁面因為useEffect日期而重打api並重設今天的deliveryInfo
      try {
        const [postDataResult, deleteResults] = await Promise.all([
          postDataPromise(dispatchUrl, fd),
          Promise.all(
            removeWithPatchId.map((deleteId) => deleteDataPromise(deleteId))
          ),
        ]);
        setReGetCalendarApi(deliverInfo.date);
      } catch (error) {
        console.error("Error:", error);
      }
    };

    //下方只有送api的函數
    //下面是處理新增派工
    const postDataPromise = (dispatchUrl, fd) => {
      return postData(dispatchUrl, fd).then((result) => {
        if (result.status) {
          showNotification("派工更改成功", true);
          return "postTrue";
        } else {
          showNotification(
            result?.result?.reason ? result?.result?.reason : "錯誤",
            false
          );
          return "postFalse";
        }
      });
    };
    //下面是處理刪除派工的部分
    const deleteDataPromise = (deleteId) => {
      const deleteUrl = `constructionSummaryJobTaskDispatch/${deleteId}`;
      return deleteData(deleteUrl).then((result) => {
        if (result.status) {
          showNotification("刪除派工更改成功", true);
          return "deleteTrue";
        } else if (result.result.response !== 200) {
          showNotification(
            result?.result?.reason ? result?.result?.reason : "刪除錯誤",
            false
          );
          return "deleteFalse";
        }
      });
    };
    //下面是更改工項執行的api
    const PostBodyData = (jobTaskUrl, convertData) => {
      postBodyData(jobTaskUrl, convertData).then((result) => {
        // console.log("convertData", convertData, "result", result);
        if (result.status) {
          showNotification("更改工項執行成功", true);
        } else {
          showNotification(
            result?.result?.reason ? result.result.reason : "錯誤",
            false
          );
        }
        setReGetCalendarApi(deliverInfo.date);
      });
    };

    // 下面到return中間處理新增工項執行的東西

    const AddNewJobTask = (e, summary) => {
      e.stopPropagation();
      setAddJobTask(null);
      setActiveJobTask("");
      setCurrentDivIndex(1);
      // console.log("AddNewJobTask", summary);
      setJobTask(null);
      setTimeout(() => {
        setAddJobTask(summary);
      }, 500);
    };

    const handleAlertDeleteJobTaskOpen = async (agree) => {
      if (agree) {
        DeteleSummary();
      }
      setAlertDeleteJobTaskOpen(false);
    };

    const DeteleSummary = () => {
      setSendBackFlag(true);
      const deleteUrl = `constructionSummaryJobTask/${deleteJobTaskId}`;
      deleteData(deleteUrl).then((result) => {
        if (result.status) {
          showNotification("刪除派工更改成功", true);
          setReGetCalendarApi(deliverInfo.date);
        } else if (result.result.response !== 200) {
          showNotification(
            result?.result?.reason ? result?.result?.reason : "刪除錯誤",
            false
          );
        }
        setSendBackFlag(false);
      });
    };

    return (
      <>
        {/* Modal */}
        {!!deliverInfo && (
          <ModalTemplete
            title={deliverInfo.date}
            show={isOpen}
            maxWidth={"700px"}
            onClose={onCheckDirty}
            className="!border-none "
          >
            <button
              variant="contained"
              className={`${
                currentDivIndex === 1 ? "block" : "hidden"
              } absolute text-base !rounded-md px-2 -mt-10 md:hidden `}
              onClick={() => {
                setCurrentDivIndex(0);
              }}
            >
              <ArrowBackIcon color="primary" className="!w-5" />
            </button>

            <div className="flex gap-5 ">
              {/* 左邊框 */}
              <div
                className={`w-full md:block border rounded-md bg-slate-100
                ${currentDivIndex === 0 ? "block" : "hidden"} 
                  h-[70vh] bg-slate-5 overflow-y-scroll p-2 mt-4`}
              >
                {deliverInfo.summaries.map((summary, index) => (
                  <Accordion key={index}>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      className={`relative !min-h-[50px] !flex !align-center`}
                      sx={{
                        borderBottom: "1.5px solid rgb(209, 213, 219)",
                        borderLeft: 0,
                        borderRight: 0,
                        borderTop: 0,
                      }}
                      // onClick={() => {
                      //   console.log(summary);
                      // }}
                    >
                      <span className="text-lg w-full ps-2 text-left flex items-center h-full">
                        {summary.project.name + "-" + summary.name}
                      </span>
                    </AccordionSummary>
                    <AccordionDetails>
                      {summary.summaryJobTasks.map((summaryJobTask) => (
                        <div key={summaryJobTask.id} className={`border-b-2`}>
                          <div
                            className={` rounded-md  ${
                              activeJobTask === summaryJobTask.id &&
                              "bg-slate-200 my-1 py-0.5"
                            }`}
                            onClick={() => {
                              handleJobTaskEdit(summaryJobTask, summary.id);
                            }}
                          >
                            <div className={`m-1 p-1 relative  `}>
                              <span
                                className={`whitespace-nowrap text-base text-neutral-400 ${
                                  activeJobTask === summaryJobTask.id
                                    ? "text-neutral-600"
                                    : "text-neutral-400"
                                }`}
                              >
                                {`[${summaryJobTask.constructionJobTask.name}]`}
                              </span>
                              <span className="cursor-pointer absolute right-0.5 top-0.5">
                                <EditCalendarIcon
                                  color={`${
                                    activeJobTask === summaryJobTask.id
                                      ? "success"
                                      : "disabled"
                                  }`}
                                />
                                {/* <DeleteIcon
                                  className="ml-1"
                                  color="disabled"
                                  onClick={() => {
                                    DeleteSummaryJobTask(summaryJobTask.id);
                                    console.log(
                                      "DeleteSummaryJobTaskId",
                                      summaryJobTask.id
                                    );
                                  }}
                                /> */}
                              </span>
                            </div>
                            <div className="m-1 align-middle">
                              {summaryJobTask.constructionSummaryJobTaskDispatches.map(
                                (dispatch, index) => (
                                  <span className="ms-1" key={index}>
                                    {dispatch.labourer.nickname}
                                  </span>
                                )
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      <div className="w-full h-12 relative">
                        <Button
                          variant="contained"
                          color="inherit"
                          className="!ease-in-out !duration-300 absolute top-3 right-0"
                          // sx={{ transform: "translate(4px, 1rem)" }}
                          onClick={(e) => {
                            AddNewJobTask(e, summary);
                          }}
                        >
                          <AddIcon />
                          新增工項執行
                        </Button>
                      </div>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </div>

              {/* 右邊框 */}
              <div
                className={`w-full ${
                  currentDivIndex === 1 ? "block" : "hidden"
                } md:block h-[70vh] bg-slate-5 overflow-y-scroll mt-4 flex-col pe-2`}
              >
                {jobTask ? (
                  <div className="mt-1">
                    <div className="w-full flex justify-center my-2">
                      <span
                        className="font-bold text-lg px-4 border-b-2"
                        // onClick={() => {
                        //   console.log(deliverInfo);
                        // }}
                      >
                        {!!jobTask && (
                          <span className="text">
                            {jobTask?.constructionJobTask?.name}
                          </span>
                        )}{" "}
                        - 編輯
                      </span>{" "}
                    </div>

                    {/* 派工div */}
                    <div className="mt-2">
                      <InputTitle
                        title={`選擇 ${deliverInfo.date} 派工人員`}
                        required={false}
                      />
                      <Autocomplete
                        multiple
                        options={taskSelectLabouerList.sort(
                          (a, b) =>
                            -b.department.id.localeCompare(a.department.id)
                        )}
                        groupBy={(taskSelectLabouerList) =>
                          taskSelectLabouerList.department.name
                        }
                        disableCloseOnSelect
                        getOptionLabel={(taskSelectLabouerList) =>
                          taskSelectLabouerList.nickname
                        }
                        isOptionEqualToValue={(taskSelectLabouerList, value) =>
                          taskSelectLabouerList.id === value.id
                        }
                        onChange={handleChange}
                        value={dispatchForApi}
                        renderOption={(
                          props,
                          taskSelectLabouerList,
                          { selected }
                        ) =>
                          isLoading ? (
                            <CircularProgress color="inherit" size={20} />
                          ) : (
                            <li {...props}>
                              <Checkbox
                                icon={icon}
                                checkedIcon={checkedIcon}
                                checked={selected}
                              />
                              {taskSelectLabouerList.nickname}
                            </li>
                          )
                        }
                        renderInput={(params) => <TextField {...params} />}
                      />
                    </div>
                    <div className="w-full -mt-2 mb-3 flex justify-end">
                      <Button
                        variant="contained"
                        color="success"
                        className="!mb-2 !ease-in-out !duration-300"
                        style={{ transform: "translateY(1rem)" }}
                        onClick={handleDispatchOnly}
                      >
                        僅修改人員/儲存
                      </Button>
                    </div>
                    <hr className="mt-5 bg-slate-800" />
                    {/* 清單div */}
                    <FormProvider {...methods}>
                      <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="flex flex-col gap-1.5 mt-3">
                          <InputTitle title={`預計施工日期`} required={false} />
                          <ControlledDatePicker name="estimatedSince" />
                        </div>
                        <div className="flex flex-col gap-1.5 mt-3">
                          <InputTitle title={"預計完工日期"} required={false} />
                          <ControlledDatePicker name="estimatedUntil" />
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
                        </div>
                        <div className="w-full -mt-2 flex justify-end">
                          <Button
                            type="submit"
                            color="success"
                            variant="contained"
                            className="!mb-2 !ease-in-out !duration-300"
                            style={{ transform: "translateY(1rem)" }}
                          >
                            僅修改工項執行內容
                          </Button>
                        </div>
                      </form>
                    </FormProvider>
                  </div>
                ) : addJobTask ? (
                  <div className="flex-col">
                    <TaskModal
                      apiSelectedTask={addJobTask?.summaryJobTasks}
                      setAddJobTask={setAddJobTask}
                      deliverInfo={{ ...addJobTask, date: deliverInfo.date }}
                      setReGetCalendarApi={setReGetCalendarApi}
                      isLoading={isLoading}
                      setIsLoading={setIsLoading}
                      jobTaskDirty={jobTaskDirty}
                      setJobTaskDirty={setJobTaskDirty}
                    />
                  </div>
                ) : (
                  <div className="mt-1">
                    <div className="text-base text-center w-full mt-3 p-2  border-b-2">
                      <span className="text-lg p-1 m-1 w-full rounded-md ">
                        請選擇編輯項目
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </ModalTemplete>
        )}
        <Backdrop
          sx={{ color: "#fff", zIndex: 1050 }}
          open={false}
          onClick={onCheckDirty}
        >
          <LoadingThree size={40} />
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
        {/* 點選垃圾桶刪除工項執行選項 */}
        <AlertDialog
          open={alertDeleteJobTaskOpen}
          onClose={handleAlertDeleteJobTaskOpen}
          icon={<ReportProblemIcon color="secondary" />}
          title="注意"
          content="您點選刪除工項執行，確定刪除？"
          disagreeText="取消"
          agreeText="確定"
        />
        {/* Backdrop */}
        <Backdrop sx={{ color: "#fff", zIndex: 1400 }} open={sendBackFlag}>
          <LoadingFour />
        </Backdrop>
      </>
    );
  }
);

export { EventModal };
