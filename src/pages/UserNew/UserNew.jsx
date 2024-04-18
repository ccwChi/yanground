import React, { useState } from "react";
import PageTitle from "../../components/Guideline/PageTitle";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import { Tabs } from "@mui/material";
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
const UserNew = () => {
  const [secValue, setSecValue] = useState("attendance");
  const handleChange = (event, newValue) => {
    setSecValue(newValue);
  };
  const btnGroup = [
    {
      mode: "back",
      icon: <KeyboardReturnIcon fontSize="small" />,
      text: "返回",
      variant: "contained",
      color: "primary",
      fabVariant: "success",
      fab: <KeyboardReturnIcon fontSize="large" />,
    }]
  return (
    <>
      <PageTitle
        title="人事資料"
        btnGroup={btnGroup}
        // handleActionClick={handleActionClick}
        // isLoading={!isLoading}
      />
      <div>
        <Box sx={{ width: "100%" }}>
          <Tabs
            value={secValue}
            onChange={handleChange}
            textColor="secondary"
            indicatorColor="secondary"
            aria-label="secondary tabs example"
          >
            <Tab value="userData" label="基本資料" />
            <Tab value="attendance" label="考勤紀錄" />
            <Tab value="salary" label="薪資明細" />
            <Tab value="evalution" label="考核紀錄" />
            <Tab value="leave" label="排休狀態" />
          </Tabs>
        </Box>
      </div>
      <div>
        {secValue === "userData" && <UserDataSec />}
        {secValue === "attendance" && <AttendanceSec />}
        {secValue === "salary" && <SalarySec />}
        {secValue === "evalution" && <EvalutionSec />}
        {secValue === "leave" && <LeaveSec />}
      </div>
    </>
  );
};

export default UserNew;

const UserDataSec = () => {
  return <>基本資料</>;
};
const AttendanceSec = () => {
  return <>考勤紀錄</>;
};
const SalarySec = () => {
  return <>薪資明細</>;
};
const EvalutionSec = () => {
  return <>考核紀錄</>;
};
const LeaveSec = () => {
  return <>排休狀態</>;
};
