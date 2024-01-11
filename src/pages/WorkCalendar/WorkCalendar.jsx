import Calendar from "../../components/Calendar/Calendar";
import React, { useEffect, useState } from "react";
import PageTitle from "../../components/Guideline/PageTitle";

const WorkCalendar = React.memo(({ apiAttData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [deliverInfo, setDeliverInfo] = useState({});
  const [events, setEvents] = useState([]);
  const year = "2024";
  // 用 Jeff 的公司 google 帳號的日曆資料取得金鑰
  const Key = "AIzaSyBNlYH01_9Hc5S1J9vuFmu2nUqBZJNAXxs";

  //   useEffect(() => {
  //     const fetchData = async () => {
  //       return await fetch(
  //         `https://clients6.google.com/calendar/v3/calendars/taiwan__zh_tw@holiday.calendar.google.com/events?calendarId=taiwan__zh_tw%40holiday.calendar.google.com&singleEvents=true&timeZone=Asia%2FTaipei&maxAttendees=1&maxResults=250&sanitizeHtml=true&timeMin=${year}-01-01T00%3A00%3A00%2B08%3A00&timeMax=${year}-12-31T00%3A00%3A00%2B08%3A00&key=${Key}&%24unique=gc237`,
  //         {
  //           method: "GET",
  //         }
  //       )
  //         .then((response) => {
  //           if (!response.ok) {
  //             const statusCode = response.status;
  //             console.error("HTTP Error: Status Code", statusCode);
  //           }
  //           return response.json();
  //         })
  //         .catch((error) => {
  //           console.error("System Error：", error);
  //           // throw error;
  //           return error.message;
  //         });
  //     };

  //     fetchData().result((result) => {
  //       const data = result;
  //       console.log(data);
  //     });
  //   }, []);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `https://clients6.google.com/calendar/v3/calendars/taiwan__zh_tw@holiday.calendar.google.com/events?calendarId=taiwan__zh_tw%40holiday.calendar.google.com&singleEvents=true&timeZone=Asia%2FTaipei&maxAttendees=1&maxResults=250&sanitizeHtml=true&timeMin=${year}-01-01T00%3A00%3A00%2B08%3A00&timeMax=${year}-12-31T00%3A00%3A00%2B08%3A00&key=${Key}&%24unique=gc237`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const result = await response.json();
        const event = result.items;
        const simplified_data = result.items.map(
          ({ description, start, summary }) => ({
            description: description.substring(0, 4),
            start: start.date,
            summary,
          })
        );
        console.log(simplified_data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);
  useEffect(() => {
    console.log(events);
  }, [events]);

  const onClose = () => {
    setDeliverInfo(null);
    setIsOpen(false);
  };
  const handleClickEvent = (e) => {
    if (apiAttData) {
      const eventContent = apiAttData.filter(
        (data) => data.start === e.event.startStr
      );
      setDeliverInfo(eventContent[0]);
    }
  };

  return (
    <>
      <PageTitle
        title="辦公日曆表"
        // btnGroup={btnGroup}
        // handleActionClick={handleActionClick}
        // isLoading={!isLoading}
      />

      <Calendar
        // data={events}
        viewOptions={["dayGridMonth", "dayGridWeek"]}
        // _dayMaxEvents={3}
        // dateClick={(e) => {
        //   handleDayClick(e.dateStr);
        // }}
        // eventClick={(e) => {
        //   handleEventClick(e.event.startStr);
        // }}
        // eventContent={(eventInfo) => {
        //   return <CustomEventContent event={eventInfo.event} />;
        // }}
        // eventColor={isTargetScreen ? "transparent" : "#F48A64"}
        // displayEventTime={false} // 整天
        // eventBorderColor={"transparent"}
        // eventBackgroundColor={"transparent"}
        // eventOrder={""}
      />
    </>
  );
});

export default WorkCalendar;
