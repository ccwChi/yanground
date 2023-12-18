import { useState } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import {
  Box,
  Button,
  CardActionArea,
  CardActions,
  Grid,
  Grow,
  Modal,
  Skeleton,
} from "@mui/material";
import PageTitle from "../../components/Guideline/PageTitle";
import TableTabber from "../../components/Tabbar/TableTabber";
import { useLocation } from "react-router-dom";
import ModalTemplete from "../../components/Modal/ModalTemplete";

const video_one = "https://youtu.be/irbqlvjMgmE";
const embedId = "irbqlvjMgmE";
const video_one_img = "https://img.youtube.com/vi/irbqlvjMgmE/0.jpg";
const video_two = "https://youtu.be/ZSpWM5U93bc";
const video_two_img = "https://img.youtube.com/vi/ZSpWM5U93bc/0.jpg";

const EducationTrainging = () => {
  // 解析網址取得參數
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  const [isLoading, setIsLoading] = useState(true);

  const tabGroup = [
    { f: "paperData", text: "教學文檔" },
    { f: "constructionVideoData", text: "施工影片" },
  ];

  const [cat, setCat] = useState(
    queryParams.has("cat") &&
      tabGroup.some((tab) => tab.f === queryParams.get("cat"))
      ? queryParams.get("cat")
      : "info"
  );

  useState(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 100);
  }, []);

  return (
    <>
      <PageTitle title="教育訓練" />
      <TableTabber tabGroup={tabGroup} cat={cat} setCat={setCat} />

      {/* block2 */}
      <div className="relative overflow-y-auto mt-5 flex flex-col flex-1 overflow-hidden sm:pb-3.5 pb-0">
        {cat === "paperData" ? (
          !isLoading ? (
            <></>
          ) : (
            <ListSkeletonLoading />
          )
        ) : !isLoading ? (
          <VideoData />
        ) : (
          <CardSkeletonLoading />
        )}
      </div>
    </>
  );
};

export default EducationTrainging;

const CardSkeletonLoading = () => {
  return (
    <div className="grid sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-4 ">
      {Array.from({ length: 2 }).map((_, index) => (
        <Skeleton
          key={index}
          variant="rectangular"
          className="rounded"
          sx={{
            width: "100%",
            height: "auto",
            aspectRatio: "5/3",
          }}
        />
      ))}
    </div>
  );
};

const ListSkeletonLoading = () => {
  return (
    <div className="flex flex-col px-8">
      <Skeleton className="!h-16 " />
      <Skeleton className="!h-8 w-96" />
      <Skeleton className="!h-8 w-96" />
      <Skeleton className="!h-8 w-96" />
    </div>
  );
};

const VideoData = () => {
  const [clickVideo, setClickVideo] = useState(null);

  const onClose = () => {
    setClickVideo(null);
  };
  return (
    <div className="grid sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-4 ">
      {Array.from({ length: 6 }).map((_, index) => (
        <Card key={index}>
          <CardActionArea>
            {/* 這邊是放youtube影片 */}
            {/* <CardMedia
                sx={{ width: "100%", height: "auto", aspectRatio: "5/3" }}
                component="iframe"
                //   height="300px"
                //   width="600px"
                src={`https://www.youtube.com/embed/${embedId}`}
                alt="aaa"
              /> */}
            {/* 這邊是放youtube影片截圖 */}
            <CardMedia
              sx={{ width: "100%", height: "auto", aspectRatio: "5/3" }}
              component="img"
              //   height="300px"
              //   width="600px"
              src={`https://img.youtube.com/vi/${embedId}/0.jpg`}
              alt={embedId}
              onClick={() => setClickVideo(embedId)}
            />
            <CardContent>
              <Typography gutterBottom variant="h5" component="div">
                影片標題
              </Typography>
              {/* <Typography variant="body2" color="text.secondary">
              影片簡介
            </Typography> */}
            </CardContent>
          </CardActionArea>
          {/* <CardActions>
          <Button size="small" color="primary">
            按鈕處理
          </Button>
        </CardActions> */}
        </Card>
      ))}
      <Modal
        open={!!clickVideo}
        onClose={onClose}
        className="h-screen flex justify-center items-center bg-black bg-opacity-60"
      >
        <div className=" bg-opacity-90 text-white p-2 m-2 md:m-3 rounded-lg w-full md:max-w-[800px]">
          <iframe
            title="aaa"
            src={`https://www.youtube.com/embed/${clickVideo}`}
            alt="aaa"
            className=" aspect-[5/3] w-full"
            allowFullScreen
          />
        </div>
      </Modal>
    </div>
  );
};
