import {
  faBook,
  faBuildingUser,
  faDoorOpen,
  faFeather,
  faPaperPlane,
  faQuoteLeft,
} from "@fortawesome/free-solid-svg-icons";
import ModalTemplete from "../../../../components/Modal/ModalTemplete";
import ApplicationFormSection from "../ApplicationFormSection";
import ApplicationReacord from "../ApplicationFormSection/ApplicationReacord";
import DayOff from "./DayOff";
import CompletePunchIO from "./CompletePunchIO";
import WorkOvertime from "./WorkOvertime";
import AuditLog from "../ApplicationFormSection/AuditLog";
import {
  Autocomplete,
  Backdrop,
  Button,
  Card,
  CircularProgress,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Radio,
  RadioGroup,
  TextField,
} from "@mui/material";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";

import useLocalStorageValue from "../../../../hooks/useLocalStorageValue";
import React, { useEffect, useState } from "react";
import { getData } from "../../../../utils/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { icon } from "leaflet";

import { useForm, FormProvider, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import InputTitle from "../../../../components/Guideline/InputTitle";
import ControlledTimePicker from "../../../../components/DatePicker/ControlledTimePicker";
import AlertDialog from "../../../../components/Alert/AlertDialog";
import { LoadingFour } from "../../../../components/Loader/Loading";
import { zhTW } from "date-fns/locale";

const AttendanceSectionModal = ({
  deliverInfo,
  onClose,
  departMemberList,
  isOpen,
}) => {
  // 檢查表單是否汙染
  const [selectedDiv, setSelectedDiv] = useState(0);
  const [isDirty, setIsDirty] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [sendBackFlag, setSendBackFlag] = useState(false);
  const [isBack, setIsBack] = useState(false);

  const onCheckDirty = (value) => {
    if (isDirty) {
      setAlertOpen(true);
    } else if (!isDirty && value === "isBack") {
      setSelectedDiv(0);
      setIsDirty(false);
    } else {
      onClose();
      setSelectedDiv(0);
    }
  };

  // 下面僅關閉汙染警告視窗
  const handleAlertClose = async (agree) => {
    if (agree) {
      if (isBack) {
        setSelectedDiv(0);
        setIsDirty(false);
        setTimeout(() => {
          setIsBack(false);
        }, 100);
      } else {
        setSelectedDiv(0);
        setIsBack(false);
        onClose();
      }
    }
    setAlertOpen(false);
  };

  const userProfile = useLocalStorageValue("userProfile");
  // 自身部門人員清單
  const [memberList, setMemberList] = useState([]);

  // 取得自身部門人員清單(去除自己)
  useEffect(() => {
    if (userProfile?.department) {
      getData(`department/${userProfile.department.id}/staff`).then(
        (result) => {
          const data = result.result;
          const formattedUser = data
            .filter((us) => userProfile.id !== us.id)
            .map((us) => ({
              label:
                us.lastname && us.firstname
                  ? us.lastname + us.firstname
                  : us.displayName,
              value: us.id,
            }));
          setMemberList(formattedUser);
        }
      );
    }
  }, [userProfile]);
  // 表單申請按鈕清單

  return (
    <>
      <ModalTemplete
        title={
          selectedDiv === 0
            ? "選擇申請單"
            : selectedDiv === 1
            ? "請假申請單"
            : selectedDiv === 2
            ? "補打卡申請單"
            : "加班申請單"
        }
        show={isOpen}
        maxWidth={"700px"}
        onClose={onCheckDirty}
      >
        <button
          variant="contained"
          className={`${
            (selectedDiv === 1) | (selectedDiv === 2) | (selectedDiv === 3)
              ? "block"
              : "hidden"
          } absolute text-base !rounded-md ms-4 -mt-11  `}
          onClick={() => {
            setIsBack(true);
            onCheckDirty("isBack");
          }}
        >
          <ArrowBackIcon color="primary" className="!w-5" />
        </button>
        <div className="h-[500px] w-full flex flex-col p-5 gap-4">
          {selectedDiv === 0 ? (
            <DivZero
              setSelectedDiv={setSelectedDiv}
              deliverInfo={deliverInfo}
            />
          ) : selectedDiv === 1 ? (
            <DayOff
              userProfile={userProfile}
              memberList={memberList}
              setIsDirty={setIsDirty}
            />
          ) : selectedDiv === 2 ? (
            <CompletePunchIO
              userProfile={userProfile}
              setIsDirty={setIsDirty}
            />
          ) : (
            <WorkOvertime
              userProfile={userProfile}
              memberList={memberList}
              setIsDirty={setIsDirty}
            />
          )}
        </div>
      </ModalTemplete>
      {/* 點選垃圾桶刪除工項執行選項 */}
      <AlertDialog
        open={alertOpen}
        onClose={handleAlertClose}
        icon={<ReportProblemIcon color="secondary" />}
        title="注意"
        content={`您所做的變更尚未儲存。是否確定要${
          isBack ? "返回選擇頁" : "關閉表單"
        }？`}
        disagreeText="取消"
        agreeText="確定"
      />
      {/* Backdrop */}
      <Backdrop sx={{ color: "#fff", zIndex: 1400 }} open={sendBackFlag}>
        <LoadingFour />
      </Backdrop>
    </>
  );
};

export default AttendanceSectionModal;

const DivZero = ({ userProfile, memberList, setSelectedDiv, deliverInfo }) => {
  const applicationBtns = [
    {
      id: "dayOff",
      icon: faDoorOpen,
      color: "#547db7",
      text: "請假",
      component: <DayOff userProfile={userProfile} memberList={memberList} />,
    },
    {
      id: "completePunchIO",
      icon: faFeather,
      color: "#039E8E",
      text: "補打卡",
      component: <CompletePunchIO userProfile={userProfile} />,
    },
    {
      id: "workOvertime",
      icon: faBuildingUser,
      color: "#F7941D",
      text: "加班",
      component: <WorkOvertime />,
    },
  ];
  // console.log(deliverInfo);
  return (
    <>
      <div className="h-22 w-full flex gap-4">
        <Card className="flex-1 p-2 ">
          {deliverInfo.start}
          {" " +
            new Date(deliverInfo.start).toLocaleDateString("zh-TW", {
              weekday: "long",
            })}
          <p>
            上班時間:{" "}
            {deliverInfo?.since
              ? deliverInfo.since.slice(0, 10) +
                " " +
                deliverInfo.since.slice(11, 19)
              : "無紀錄"}
          </p>
          <p>
            下班時間:{" "}
            {deliverInfo?.until
              ? deliverInfo.until.slice(0, 10) +
                " " +
                deliverInfo.until.slice(11, 19)
              : "無紀錄"}
          </p>
        </Card>
        <Card
          className="w-32 justify-center items-center hidden md:flex"
          sx={{ backgroundColor: deliverInfo.color, color: "white" }}
          // onClick={() => {
          //   console.log(deliverInfo);
          // }}
        >
          {deliverInfo.title}
        </Card>
      </div>
      <div className="flex-1 flex flex-col sm:flex-row gap-5">
        {applicationBtns.map((item, index) => (
          <div
            key={item.id}
            className={`inline-flex flex-col flex-1 items-center gap-2 rounded-md`}
          >
            <Button
              id={item.id}
              variant="contained"
              className={`w-full flex-1`}
              style={{ backgroundColor: item.color }}
              onClick={() => {
                setSelectedDiv(index + 1);
              }}
            >
              <span className="flex flex-col gap-y-4">
                <FontAwesomeIcon
                  icon={item.icon}
                  className="text-4xl sm:text-6xl"
                />
                <span className="text-base sm:text-xl  tracking-widest">
                  {item.text}
                </span>
              </span>
            </Button>
          </div>
        ))}
      </div>
    </>
  );
};

const DivThree = () => {
  return (
    <div
      onClick={() => {
        console.log("3");
      }}
    >
      DivThree
    </div>
  );
};
