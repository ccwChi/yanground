import {
  faBook,
  faBuildingUser,
  faDoorOpen,
  faFeather,
  faPaperPlane,
} from "@fortawesome/free-solid-svg-icons";
import ModalTemplete from "../../../components/Modal/ModalTemplete";
import ApplicationFormSection from "./ApplicationFormSection";
import ApplicationReacord from "./ApplicationFormSection/ApplicationReacord";
import DayOff from "./ApplicationFormSection/DayOff";
import CompletePunchIO from "./ApplicationFormSection/CompletePunchIO";
import WorkOvertime from "./ApplicationFormSection/WorkOvertime";
import AuditLog from "./ApplicationFormSection/AuditLog";
import { Button, Card } from "@mui/material";
import useLocalStorageValue from "../../../hooks/useLocalStorageValue";
import { useEffect, useState } from "react";
import { getData } from "../../../utils/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { icon } from "leaflet";

const AttendanceSectionModal = ({
  deliverInfo,
  sendBackFlag,
  setSendBackFlag,
  onClose,
  departMemberList,
  isOpen,
}) => {
  // 檢查表單是否汙染
  const onCheckDirty = () => {
    // if (isDirty || jobTaskDirty || isDispatchDirty) {
    //   setAlertOpen(true);
    // } else {
    //   handleClose();
    // }
    onClose();
  };
  // 下面僅關閉汙染警告視窗
  const handleAlertClose = async (agree) => {
    // if (agree) {
    //   handleClose();
    // }
    // setAlertOpen(false);
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

  return (
    <>
      <ModalTemplete
        title={"選擇申請單"}
        show={isOpen}
        maxWidth={"700px"}
        onClose={onCheckDirty}
        className=""
      >
        <div className="flex-1 flex h-[500px] gap-5 p-5">
          {applicationBtns.map((item) => (
            <div
              key={item.id}
              className="inline-flex flex-col flex-1 items-center gap-2"
            >
              <Button
                id={item.id}
                variant="contained"
                className={`w-full flex-1 !bg-[${item.color}]`}

              >
                {" "}
                <span className="flex flex-col gap-y-10">
                  <span className="text-xs sm:text-lg">{item.text}</span>
                  <FontAwesomeIcon
                    icon={item.icon}
                    className="text-2xl sm:text-3xl"
                  />
                </span>
              </Button>
            </div>
          ))}
        </div>
      </ModalTemplete>
    </>
  );
};

export default AttendanceSectionModal;
