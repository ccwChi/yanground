import { useState, useEffect, useRef, useCallback } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import { Box, Button, CardActionArea, Modal, Skeleton } from "@mui/material";
import PageTitle from "../../components/Guideline/PageTitle";
import TableTabbar from "../../components/Tabbar/TableTabbar";
import { useLocation } from "react-router-dom";
import fakeData from "./fakeData";

const EducationTrainging = () => {
  // 解析網址取得參數
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingNewData, setLoadingNewData] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [showSkeleton, setShowSkeleton] = useState(false);

  const tabGroup = [
    // { f: "paperData", text: "教學文檔" },
    { f: "constructionVideoData", text: "施工影片" },
  ];

  const [cat, setCat] = useState(
    queryParams.has("cat") &&
      tabGroup.some((tab) => tab.f === queryParams.get("cat"))
      ? queryParams.get("cat")
      : "constructionVideoData"
  );

  const observer = useRef();

  const lastDataRef = useCallback(
    (node) => {
      if (loading || !node || !hasMore) return;

      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        // console.log("entries",entries)
        if (entries[0].isIntersecting) {
          setPage((prevPage) => prevPage + 1);
        }
      });

      observer.current.observe(node);
    },
    [loading, hasMore]
  );

  //   useEffect(() => {
  //     console.log("observer", observer);
  //   }, [observer]);

  const fetchData = async () => {
    setLoading(true);
    setShowSkeleton(true);

    // 模擬從檔案中取得更多資料的過程
    const startIndex = (page - 1) * 10;
    const endIndex = startIndex + 10;
    const newData = fakeData.slice(startIndex, endIndex);

    // 模擬API請求的延遲
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setData((prevData) => [...prevData, ...newData]);

    // 假設這裡判斷還有更多資料，否則設定 hasMore 為 false
    setHasMore(newData.length > 0);

    setLoading(false);
    setShowSkeleton(false);
  };

  useEffect(() => {
    fetchData();
  }, [page]); // 每次 page 更新時觸發

  return (
    <>
      <PageTitle title="教育訓練" />
      <TableTabbar tabGroup={tabGroup} cat={cat} setCat={setCat} />

      {/* block2 */}
      <div className="relative overflow-y-auto mt-5 flex flex-col flex-1 overflow-hidden sm:pb-3.5 pb-0">
        {cat === "paperData" ? (
          !loading ? (
            <></>
          ) : (
            <ListSkeletonLoading />
          )
        ) : (
          <>
            <VideoData data={data} lastDataRef={lastDataRef} />
            {showSkeleton && <CardSkeletonLoading />}
          </>
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

const VideoData = ({ data, lastDataRef }) => {
  const [clickVideo, setClickVideo] = useState(null);

  const onClose = () => {
    setClickVideo(null);
  };
  return (
    <div className="grid sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-4 ">
      {data.map((video, index) => (
        <Card key={index} ref={index === data.length - 1 ? lastDataRef : null}>
          <CardActionArea>
            <CardMedia
              sx={{ width: "100%", height: "auto", aspectRatio: "5/3" }}
              component="img"
              //   height="300px"
              //   width="600px"
              loading="lazy"
              src={`https://img.youtube.com/vi/${video.id}/0.jpg`}
              alt={video.title}
              onClick={() => setClickVideo(video.id)}
            />
            <CardContent>
              <Typography gutterBottom variant="h6" component="div">
                {video.title + index}
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card>
      ))}
      <Modal
        open={!!clickVideo}
        onClose={onClose}
        className="h-screen flex justify-center items-center bg-black bg-opacity-60"
      >
        <div className=" bg-opacity-90 text-white p-2 m-2 md:m-3 rounded-lg w-full md:max-w-[800px]">
          <iframe
            title={clickVideo}
            src={`https://www.youtube.com/embed/${clickVideo}`}
            alt={clickVideo}
            className=" aspect-[5/3] w-full"
            allowFullScreen
          />
        </div>
      </Modal>
    </div>
  );
};
