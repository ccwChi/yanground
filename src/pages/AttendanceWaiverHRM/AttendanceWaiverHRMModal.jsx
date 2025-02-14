import React, { useEffect, useState } from "react";
// MUI
import Chip from "@mui/material/Chip";
import Backdrop from "@mui/material/Backdrop";
import EditIcon from "@mui/icons-material/Edit";
import { Button, MenuItem, Select, TextField } from "@mui/material";
// Components
import ModalTemplete from "../../components/Modal/ModalTemplete";
import { LoadingTwo } from "../../components/Loader/Loading";
// Hooks
import useLocalStorageValue from "../../hooks/useLocalStorageValue";
import { getData } from "../../utils/api";

/***
 * 檢視審核 Modal
 * @param {string} title - Modal 標題名稱
 * @param {Object} deliverInfo - 顯示資訊
 * @param {Function} sendDataToBackend - 傳遞給後端的函式
 * @param {Function} onClose - 關閉函式
 * @returns
 ***/
const ViewModal = React.memo(
  ({ title, deliverInfo, onClose, sendDataToBackend }) => {
    // 取得當前用戶資訊
    const userProfile = useLocalStorageValue("userProfile");
    // 用於儲存文字欄位的值
    const [textFieldValue, setTextFieldValue] = useState("");
    // 用於更改編輯代理人的欄位出現
    const [editAgent, setEditAgent] = useState(false);
    // 用於更改編輯代理人
    const [selectAgent, setSelectAgent] = useState("");
    // 用於儲存代理人清單
    const [agentList, setAgentList] = useState([]);
    const [departmentList, setDepartmentList] = useState([]);
    // 當文字欄位的值改變時更新狀態
    const handleTextFieldChange = (event) => {
      setTextFieldValue(event.target.value);
    };

    // 按鈕點擊事件
    const handleSubmit = () => {
      const fd = new FormData();
      fd.append("remark", textFieldValue);
      // **要記得添加代理人資訊，目前不知道後端api接受代理人格式
      sendDataToBackend(fd, "approval", [deliverInfo.id, userProfile.id]);
    };
    // 按鈕點擊退回是件
    const handleUnapproval = () => {
      // 串 api
      // console.log(deliverInfo)
      const fd = new FormData();
      sendDataToBackend(fd, "unapproval", [deliverInfo.id]);
    };

    useEffect(() => {
      if (!!deliverInfo) {
        setEditAgent(false);
        if (agentList.length === 0 && deliverInfo?.attendance) {
          getData(
            `attendance/agent?p=1&s=50&id=${deliverInfo.attendance.user.id}`
          ).then((result) => {
            const data = result.result;
            const formattedUser = data.content.map((us) => ({
              label:
                us.lastname && us.firstname
                  ? us.lastname + us.firstname
                  : us.displayName,
              value: us.id,
            }));
            setAgentList(formattedUser);
          });
        }
      }
    }, [deliverInfo]);

    const handleEditAgent = () => {
      const fd = new FormData();
      fd.append("agent", selectAgent);
      sendDataToBackend(fd, "editAgent", [deliverInfo.id]);
    };
    useEffect(() => {
      if (!editAgent) {
        setSelectAgent("");
      }
    }, [editAgent]);

    return (
      <>
        {/* Modal */}
        <ModalTemplete
          title={title}
          show={!!userProfile}
          maxWidth={"768px"}
          onClose={onClose}
        >
          <div className="flex flex-col pt-4 gap-3">
            {deliverInfo.attendance && (
              <div className="inline-flex flex-col sm:flex-row border px-3 py-2 rounded-sm border-zinc-300 gap-1">
                <p className="w-full">
                  日期：
                  <span className="font-bold">
                    {deliverInfo.attendance.date}
                  </span>
                </p>
                <p className="w-full">
                  申請原因：
                  <span className="font-bold">
                    {deliverInfo.attendance.anomaly
                      ? deliverInfo.attendance?.anomaly?.chinese || null
                      : deliverInfo.attendance?.type?.chinese || null}
                  </span>
                </p>
              </div>
            )}
            <div className="flex flex-col">
              <div className="inline-flex flex-col sm:flex-row py-1 gap-1">
                <p className="w-full">
                  申請人：
                  <span className="font-bold">{deliverInfo.fullname}</span>
                </p>
                <p className="w-full">
                  申請類型：
                  <span className="font-bold">
                    {deliverInfo.attendanceWaivertype}
                  </span>
                </p>
              </div>
              <div className="inline-flex flex-col sm:flex-row py-1 gap-1">
                <p className="w-full">
                  申請區間(起)：
                  <span className="font-bold">{deliverInfo.since}</span>
                </p>
                <p className="w-full">
                  申請區間(迄)：
                  <span className="font-bold">{deliverInfo.until}</span>
                </p>
              </div>
              {/* 代理人開始 */}
              <div className="inline-flex flex-col sm:flex-row py-1 gap-1">
                <div className="w-full flex gap-x-2 items-center">
                  <span>
                    代理人：
                    <span className={`${editAgent && "hidden"} font-bold`}>
                      {deliverInfo.agent.displayScreenName || "-" || "尚未填寫"}
                    </span>
                  </span>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={selectAgent}
                    onChange={(e) => {
                      setSelectAgent(e.target.value);
                    }}
                    className={`${
                      !editAgent && "!hidden"
                    } !h-6 !border-none !m-0 !p-2`}
                    displayEmpty
                  >
                    <MenuItem value="">請選擇代理人</MenuItem>
                    {agentList.map((agent, i) => (
                      <MenuItem key={i} value={agent.value}>
                        {agent.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {!editAgent && (
                    <EditIcon
                      className="translate-y-[2px] cursor-pointer"
                      fontSize="small"
                      onClick={() => {
                        setEditAgent(true);
                      }}
                    />
                  )}
                  {editAgent && (
                    <div className="flex gap-x-2">
                      <Button
                        variant="contained"
                        className="h-6 !p-0 !m-0"
                        onClick={handleEditAgent}
                      >
                        更改
                      </Button>
                      <Button
                        variant="contained"
                        className="h-6 !p-0 !m-0"
                        onClick={() => {
                          setEditAgent(false);
                        }}
                      >
                        返回
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              {/* 代理人結束 */}
              <div className="inline-flex flex-col sm:flex-row py-1 gap-1">
                <p className="w-full">
                  申請緣由：
                  <span className="font-bold">{deliverInfo.excuse || "-"}</span>
                </p>
              </div>
            </div>
            <div className="relative inline-flex flex-col justify-center border sm:px-4 px-3 py-2 rounded-sm bg-zinc-100 min-h-[140px] gap-2">
              {deliverInfo.approveState ? (
                <>
                  <p className="w-full">
                    簽核主管：
                    <span className="font-bold">
                      {deliverInfo.approver.displayScreenName}
                    </span>
                  </p>
                  <p className="w-full">
                    簽核日期：
                    <span className="font-bold">{deliverInfo.approvedAt}</span>
                  </p>
                  <p className="w-full">
                    簽核備註：
                    {deliverInfo.remark ? (
                      <span className="font-bold">{deliverInfo.remark}</span>
                    ) : (
                      <span className="italic text-neutral-500 text-sm">
                        (無備註)
                      </span>
                    )}
                  </p>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-center">
                    <span className="italic text-neutral-500 text-sm">
                      (尚未被審核，故無資料顯示)
                    </span>
                  </div>
                  <TextField
                    multiline
                    rows={2}
                    className="inputPadding bg-white"
                    placeholder="主管尚未簽核，此欄可輸入備註 (可為空)"
                    value={textFieldValue}
                    onChange={handleTextFieldChange}
                    fullWidth
                  />
                  <div className="flex gap-x-4 w-full">
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={handleSubmit}
                    >
                      審核
                    </Button>
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={handleUnapproval}
                    >
                      退回
                    </Button>
                  </div>
                </>
              )}
              <div className="absolute right-3 -top-9">
                {deliverInfo.approveState === true ? (
                  <Chip
                    variant="outlined"
                    label={"審核通過"}
                    size="small"
                    color="success"
                    // icon={<DoneIcon />}
                    sx={{
                      fontWeight: "700",
                      borderRadius: "4px",
                      backgroundColor: "#21AA9C19",
                    }}
                  />
                ) : deliverInfo.rejectedAt === true ? (
                  <Chip
                    variant="outlined"
                    label={"審核不通過"}
                    size="small"
                    color="error"
                    // icon={<CloseIcon />}
                    sx={{
                      fontWeight: "700",
                      borderRadius: "4px",
                      backgroundColor: "#D52F2F19",
                    }}
                  />
                ) : (
                  <Chip
                    variant="outlined"
                    label={"待審核"}
                    size="small"
                    color="warning"
                    // icon={<WarningIcon />}
                    sx={{
                      fontWeight: "700",
                      borderRadius: "4px",
                      backgroundColor: "#ED6C0219",
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        </ModalTemplete>

        {/* Backdrop */}
        <Backdrop
          sx={{ color: "#fff", zIndex: 1050 }}
          open={!userProfile}
          onClick={onClose}
        >
          <LoadingTwo />
        </Backdrop>
      </>
    );
  }
);
export { ViewModal };
