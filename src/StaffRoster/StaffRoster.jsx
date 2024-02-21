import React from "react";
import { useState } from "react";
import { LoadingTwo } from "../components/Loader/Loading";
import { useMediaQuery } from "@mui/material";
import PageTitle from "../components/Guideline/PageTitle";
import Calendar from "../components/Calendar/Calendar";


const StaffRoster = () => {
    const [isLoading, setIsLoading] = useState(false)
    const isSmallScreen = useMediaQuery("(max-width:575.98px)");

  return (
      <>
        {isLoading ? (
          <>
            {" "}
            <LoadingTwo
              size={isSmallScreen ? 120 : 160}
              textSize={"text-lg sm:text-xl"}
            />
          </>
        ) : (
          <>
            <PageTitle
              title="派工行事曆"
            //   btnGroup={btnGroup}
              description="此頁面是用於查看排班制員工的排休狀態。"
            //   handleActionClick={handleActionClick}
              isLoading={!isLoading}
            />

            <Calendar
              data={[]}
              viewOptions={["dayGridMonth", "dayGridWeek"]}
              _dayMaxEvents={3}
            //   dateClick={(e) => {
            //     handleDayClick(e.dateStr);
            //   }}
            //   eventClick={(e) => {
            //     handleEventClick(e.event.startStr);
            //   }}
            //   eventContent={(eventInfo) => {
            //     return <CustomEventContent event={eventInfo.event} />;
            //   }}

              displayEventTime={false} // 整天
              eventBorderColor={"transparent"}
              eventBackgroundColor={"transparent"}
              eventOrder={""}
              showMonth={true}
            />

            {/* <EventModal
              title="施工清單修改"
              deliverInfo={deliverInfo}
              departMemberList={departMemberList}
              onClose={onClose}
              constructionTypeList={constructionTypeList}
              isOpen={isEventModalOpen}
              setReGetCalendarData={setReGetCalendarData}
              setReGetSummaryListData={setReGetSummaryListData}
              constructionSummaryList={constructionSummaryList}
              sendBackFlag={sendBackFlag}
              setSendBackFlag={setSendBackFlag}
            /> */}
            {/* Modal */}
            {/* {config && config.modalComponent} */}
          </>
        )}
        {/* PageTitle */}
      </>
  );
};

export default StaffRoster;
