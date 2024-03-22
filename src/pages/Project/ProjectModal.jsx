import React, { useEffect, useState } from "react";
import { getData } from "../../utils/api";

/** react-hook-form */
import { useForm, FormProvider, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

/** 自訂 component */
import ModalTemplete from "../../components/Modal/ModalTemplete";
import InputTitle from "../../components/Guideline/InputTitle";
import AlertDialog from "../../components/Alert/AlertDialog";
import { LoadingTwo } from "../../components/Loader/Loading";
import ControlledDatePicker from "../../components/DatePicker/ControlledDatePicker";

/** mui 元件 */
import TextField from "@mui/material/TextField";
import Backdrop from "@mui/material/Backdrop";
import Button from "@mui/material/Button";
import FormHelperText from "@mui/material/FormHelperText";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";

/** 不知道怎麼分類 */
import MapDialog from "./MapDialog";
import { useNotification } from "../../hooks/useNotification";
import { format } from "date-fns";

const ITEM_HEIGHT = 36;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      Width: 250,
    },
  },
};

const UpdatedModal = React.memo(
  ({ title, deliverInfo, sendDataToBackend, cityList, onClose }) => {
    // Alert 開關
    const [alertOpen, setAlertOpen] = useState(false);
    // 專責人員清單
    const [bizRepList, setBizRepList] = useState(null);
    // 工務專案人員清單
    const [fRepList, setFRepList] = useState(null);
    // 工程類型清單
    const [constructionKindList, setConstructionKindList] = useState([]);
    // 可隸屬主案清單
    const [primaryList, setPrimaryList] = useState([]);
    // 鄉鎮區清單
    const [distList, setDistList] = useState(null);
    // 是否為初始化時
    const [initialized, setInitialized] = useState(true);
    // 是否開啟地圖嵌套 Modal
    const [mapDialog, setMapDialog] = useState(false);
    // Modal Data
    const [apiData, setApiData] = useState(null);
    // 用來儲存地及編號
    const [landLot, setLandLot] = useState("");
    const [landLotForApi, setLandLotforApi] = useState([]);

    const showNotification = useNotification();
    // 使用 Yup 來定義表單驗證規則
    const schema = yup.object().shape({
      name: yup.string().required("不可為空值！"),
      businessRepresentative: yup.string().required("不可為空值！"),
      constructionKind: yup.string().required("不可為空值！"),
      administrativeDivision_: yup.string().required("不可為空值！"),
      administrativeDivision: yup.string().required("不可為空值！"),
      clientContactNumber: yup
        .mixed()
        .test("is-number", "必須為數字", (value, context) => {
          if (!value) {
            return true; // 允許為空
          }
          const contactNumbers = value
            .split(",")
            .map((number) => number.trim());
          // 检查每个号码是否都为数字
          return contactNumbers.every((phone) => /^[0-9]*$/.test(phone));
        }),
      landLot: yup.mixed().test("is-number", "必須為數字", (value, context) => {
        if (!value) {
          return true; // 允許為空
        }
        const landLots = value.split(",").map((number) => number.trim());
        // 检查每个号码是否都为数字
        return landLots.every((phone) => /^[0-9]*$/.test(phone));
      }),
    });

    // 初始預設 default 值
    const defaultValues = {
      name: apiData ? apiData.name : "",
      administrativeDivision_: apiData
        ? apiData.administrativeDivision?.administeredBy?.id || ""
        : "",
      administrativeDivision: apiData
        ? apiData.administrativeDivision?.id || ""
        : "",
      street: apiData ? apiData.street || "" : "",
      latitude: apiData ? apiData.latitude || "" : "",
      longitude: apiData ? apiData.longitude || "" : "",
      radius: apiData ? apiData.radius || "" : "",
      businessRepresentative: apiData ? apiData.businessRepresentative.id : "",
      foremanRepresentative: apiData
        ? apiData.foremanRepresentative?.id || ""
        : "",
      //   juridicalPerson: "",
    //   primary: apiData ? apiData?.primary || "" : "",
    //   clientName: apiData ? apiData.clientName || "" : "",
    //   clientIdentifier: apiData ? apiData.clientIdentifier || "" : "",
      constructionKind: apiData ? apiData.constructionKind?.value || "" : "",
    //   kiloWatts: apiData ? apiData.kiloWatts || "" : "",
    //   dateOfContract: apiData?.dateOfContract
    //     ? new Date(apiData.dateOfContract)
    //     : null,
    //   completionDate: apiData?.completionDate
    //     ? new Date(apiData.completionDate)
    //     : null,
      // landLot: 馬的這兩個異類在搞是
      // clientContactNumber:
    };

    // 使用 useForm Hook 來管理表單狀態和驗證
    const methods = useForm({
      defaultValues,
      resolver: yupResolver(schema),
    });

    const {
      control,
      handleSubmit,
      watch,
      setValue,
      getValues,
      reset,
      formState: { errors, isDirty },
    } = methods;
    const city = watch("administrativeDivision_");

    // 取得 Modal 資料
    useEffect(() => {
      if (deliverInfo) {
        getData(`project/${deliverInfo}`).then((result) => {
          const data = result.result;
          setApiData(data);
        });
      }
    }, [deliverInfo]);
    useEffect(() => {
      if (apiData) {
        reset(defaultValues);
      }
    }, [apiData]);

    // 取得人員資料
    useEffect(() => {
      getData("department/5/staff").then((result) => {
        const data = result.result.map((item) => {
          let displayScreenName = "";

          if (item.lastname && item.firstname) {
            displayScreenName = `${item.lastname}${item.firstname}`;
          } else if (item.lastname) {
            displayScreenName = item.lastname;
          } else if (item.firstname) {
            displayScreenName = item.firstname;
          } else if (item.nickname) {
            displayScreenName = item.nickname;
          } else {
            displayScreenName = item.displayName;
          }

          return {
            ...item,
            displayScreenName: displayScreenName,
          };
        });
        setBizRepList(data);
      });
      getData("department/11/staff").then((result) => {
        const data = result.result.map((item) => {
          let displayScreenName = "";

          if (item.lastname && item.firstname) {
            displayScreenName = `${item.lastname}${item.firstname}`;
          } else if (item.lastname) {
            displayScreenName = item.lastname;
          } else if (item.firstname) {
            displayScreenName = item.firstname;
          } else if (item.nickname) {
            displayScreenName = item.nickname;
          } else {
            displayScreenName = item.displayName;
          }

          return {
            ...item,
            displayScreenName: displayScreenName,
          };
        });
        setFRepList(data);
      });
      getData("constructionKind").then((result) => {
        if (result.result) {
          const data = result.result;
          setConstructionKindList(data);
        } else {
          setConstructionKindList([]);
        }
      });
      if (!!deliverInfo) {
        getData(`project/${deliverInfo}/primaries`).then((result) => {
          if (result.result) {
            const data = result.result;
            setPrimaryList(data);
          } else {
            setPrimaryList([]);
          }
        });
      }
    }, []);

    // 取得鄉鎮區
    useEffect(() => {
      if (city) {
        if (!initialized) {
          setValue("administrativeDivision", "");
        } else {
          setInitialized(false);
        }
        setDistList(null);
        getData(`administrativeDivision/${city}`).then((result) => {
          const data = result.result.subDivisions;
          setDistList(data);
        });
      }
    }, [city]);

    // 提交表單資料到後端並執行相關操作
    const onSubmit = (data) => {
    //   console.log(data);
      const dataForApi = {
        ...data,
        completionDate: data?.completionDate
          ? format(data.completionDate, "yyyy-MM-dd")
          : "",
        dateOfContract: data?.dateOfContract
          ? format(data.dateOfContract, "yyyy-MM-dd")
          : "",
      };
	  if (deliverInfo){
		delete dataForApi.primary;
		delete dataForApi.landLot;
		delete dataForApi.clientContactNumber;
	  }
      const fd = new FormData();
      // console.log(data)
      // delete data.administrativeDivision_;
      for (let key in dataForApi) {
        fd.append(key, data[key] || "");
      }

      if (deliverInfo) {
        sendDataToBackend(fd, "edit", deliverInfo);
      } else {
        sendDataToBackend(fd, "create");
      }
    };

    // 檢查表單是否汙染
    const onCheckDirty = () => {
      if (isDirty) {
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

    // const handleDelete = (data) => {
    //   const index = cadastralNumberForApi.findIndex((num) => num === data);
    //   if (index !== -1) {
    //     const newList = [...cadastralNumberForApi];
    //     newList.slice(index, 1);
    //     setConstructionKindList(newList);
    //   }
    // };
    const handleDelete = (data) => {
      const index = landLotForApi.findIndex((num) => num === data);
      if (index !== -1) {
        // 检查是否找到匹配的元素
        const newList = [...landLotForApi]; // 创建原数组的副本
        newList.splice(index, 1); // 删除匹配的元素
        setLandLotforApi(newList); // 更新状态
      }
    };
    return (
      <>
        {/* Modal */}
        <ModalTemplete
          title={title}
          show={!!bizRepList && !!fRepList && (deliverInfo ? !!apiData : true)}
          maxWidth={"640px"}
          onClose={onCheckDirty}
        >
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="flex flex-col pt-4 gap-4">
                <div
                  className="flex flex-col overflow-y-auto px-1 pb-1"
                  style={{ maxHeight: "60vh" }}
                >
                  {/* 名稱 & 隸屬主專案*/}
                  <div className="inline-flex sm:flex-row flex-col sm:gap-2 gap-1">
                    <div className="w-full">
                      <InputTitle title={"專案名稱"} />
                      <Controller
                        name="name"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            error={!!errors["name"]?.message}
                            variant="outlined"
                            size="small"
                            className="inputPadding"
                            placeholder="請輸入專案名稱"
                            fullWidth
                            inputProps={{ maxLength: 25 }}
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
                  </div>
                  {/*  隸屬主專案 ********************************需要有專案id  */}
                  {/* <div
                    className={`inline-flex sm:flex-row flex-col sm:gap-2 gap-1 ${
                      !deliverInfo && "hidden"
                    }`}
                  >
                    <div className="w-full">
                      <InputTitle title={"隸屬主專案"} required={false} />
                      <Controller
                        name="primary"
                        control={control}
                        render={({ field }) => (
                          <Select
                            error={!!errors["primary"]?.message}
                            className="inputPadding"
                            displayEmpty
                            {...field}
                            fullWidth
                            MenuProps={MenuProps}
                          >
                            <MenuItem value="">
                              <span className="text-neutral-400 font-light">
                                若此案為分案，請選擇隸屬主專案
                              </span>
                            </MenuItem>
                            {primaryList.map((proj) => (
                              <MenuItem key={proj.id} value={proj.id}>
                                {proj.name}
                              </MenuItem>
                            ))}
                          </Select>
                        )}
                      />
                      <FormHelperText
                        className="!text-red-600 break-words !text-right !mt-0"
                        sx={{ minHeight: "1.25rem" }}
                      >
                        {errors["primary"]?.message}
                      </FormHelperText>
                    </div>
                  </div> */}
                  {/* 業務人員 & 工務專管人員 */}
                  <div className="inline-flex sm:flex-row flex-col sm:gap-2 gap-1">
                    <div className="w-full">
                      <InputTitle title={"專責人員"} />
                      <Controller
                        name="businessRepresentative"
                        control={control}
                        render={({ field }) => (
                          <Select
                            error={!!errors["businessRepresentative"]?.message}
                            className="inputPadding"
                            displayEmpty
                            {...field}
                            fullWidth
                            MenuProps={MenuProps}
                          >
                            <MenuItem value="" disabled>
                              <span className="text-neutral-400 font-light">
                                請選擇專責人員
                              </span>
                            </MenuItem>
                            {bizRepList.map((user) => (
                              <MenuItem key={user.id} value={user.id}>
                                {user.displayScreenName}
                              </MenuItem>
                            ))}
                          </Select>
                        )}
                      />
                      <FormHelperText
                        className="!text-red-600 break-words !text-right !mt-0"
                        sx={{ minHeight: "1.25rem" }}
                      >
                        {errors["businessRepresentative"]?.message}
                      </FormHelperText>
                    </div>
                    <div className="w-full">
                      <InputTitle title={"工務專管人員"} required={false} />
                      <Controller
                        name="foremanRepresentative"
                        control={control}
                        render={({ field }) => (
                          <Select
                            error={!!errors["foremanRepresentative"]?.message}
                            className="inputPadding"
                            displayEmpty
                            {...field}
                            fullWidth
                            MenuProps={MenuProps}
                          >
                            <MenuItem value="">
                              <span className="text-neutral-400 font-light">
                                請選擇工務專管人員
                              </span>
                            </MenuItem>
                            {fRepList.map((user) => (
                              <MenuItem key={user.id} value={user.id}>
                                {user.displayScreenName}
                              </MenuItem>
                            ))}
                          </Select>
                        )}
                      />
                      <FormHelperText
                        className="!text-red-600 break-words !text-right !mt-0"
                        sx={{ minHeight: "1.25rem" }}
                      >
                        {errors["foremanRepresentative"]?.message}
                      </FormHelperText>
                    </div>
                  </div>
                  {/* 工程類型 */}
                  <div className="inline-flex sm:flex-row flex-col sm:gap-2 gap-1">
                    <div className="w-full">
                      <InputTitle title={"工程類型"} />
                      <Controller
                        name="constructionKind"
                        control={control}
                        render={({ field }) => (
                          <Select
                            error={!!errors["constructionKind"]?.message}
                            className="inputPadding"
                            displayEmpty
                            {...field}
                            fullWidth
                            MenuProps={MenuProps}
                          >
                            <MenuItem value="" disabled>
                              <span className="text-neutral-400 font-light">
                                請選擇工程類型
                              </span>
                            </MenuItem>
                            {constructionKindList.map((kind) => (
                              <MenuItem key={kind.value} value={kind.value}>
                                {kind.chinese}
                              </MenuItem>
                            ))}
                          </Select>
                        )}
                      />
                      <FormHelperText
                        className="!text-red-600 break-words !text-right !mt-0"
                        sx={{ minHeight: "1.25rem" }}
                      >
                        {errors["constructionKind"]?.message}
                      </FormHelperText>
                    </div>
                    {/* <div className="w-full">
                      <InputTitle title={"kW 數"} required={false} />
                      <Controller
                        name="kiloWatts"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            error={!!errors["kiloWatts"]?.message}
                            variant="outlined"
                            size="small"
                            className="inputPadding"
                            placeholder="請輸入 kW 數"
                            fullWidth
                            inputProps={{ maxLength: 25 }}
                            {...field}
                          />
                        )}
                      />
                      <FormHelperText
                        className="!text-red-600 break-words !text-right !mt-0"
                        sx={{ minHeight: "1.25rem" }}
                      >
                        {errors["kiloWatts"]?.message}
                      </FormHelperText>
                    </div> */}
                  </div>
                  {/* 業主名稱 & 業主證號 */}
                  {/* <div className="inline-flex sm:flex-row flex-col sm:gap-2 gap-1">
                    <div className="w-full">
                      <InputTitle title={"業主名稱"} required={false} />
                      <Controller
                        name="clientName"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            error={!!errors["clientName"]?.message}
                            variant="outlined"
                            size="small"
                            className="inputPadding"
                            placeholder="請輸入業主名稱"
                            fullWidth
                            inputProps={{ maxLength: 25 }}
                            {...field}
                          />
                        )}
                      />
                      <FormHelperText
                        className="!text-red-600 break-words !text-right !mt-0"
                        sx={{ minHeight: "1.25rem" }}
                      >
                        {errors["clientName"]?.message}
                      </FormHelperText>
                    </div>
                    <div className="w-full">
                      <InputTitle title={"業主證號"} required={false} />
                      <Controller
                        name="clientIdentifier"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            error={!!errors["clientIdentifier"]?.message}
                            variant="outlined"
                            size="small"
                            className="inputPadding"
                            placeholder="請輸入業主證號"
                            fullWidth
                            inputProps={{ maxLength: 25 }}
                            {...field}
                          />
                        )}
                      />
                      <FormHelperText
                        className="!text-red-600 break-words !text-right !mt-0"
                        sx={{ minHeight: "1.25rem" }}
                      >
                        {errors["clientIdentifier"]?.message}
                      </FormHelperText>
                    </div>
                  </div> */}
                  {/**************************************** 電話是另一隻api 需要專案id  */}
                  {/* 業主電話  */}
                  {/* <div className={`inline-flex sm:flex-row flex-col sm:gap-2 gap-1 ${!deliverInfo && "hidden"}`}>
                    <div className="w-full">
                      <InputTitle title={"業主電話"} required={false} />
                      <Controller
                        name="clientContactNumber"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            placeholder="如果多筆 請輸入 ex. 0912345678, 06271234567"
                            error={!!errors["clientContactNumber"]?.message}
                            variant="outlined"
                            type="tel"
                            size="small"
                            className="inputPadding"
                            fullWidth
                            {...field}
                          />
                        )}
                      />
                      <FormHelperText
                        className="!text-red-600 break-words !text-right !mt-0"
                        sx={{ minHeight: "1.25rem" }}
                      >
                        {errors["clientContactNumber"]?.message}
                      </FormHelperText>
                    </div>
                  </div> */}

                  {/* 地點 */}
                  <InputTitle title={"專案地點"} />
                  <div className="inline-flex sm:flex-row flex-col sm:gap-2 gap-1">
                    <div className="flex gap-2 w-full">
                      <div className="w-full">
                        <Controller
                          name="administrativeDivision_"
                          control={control}
                          render={({ field }) => (
                            <Select
                              error={
                                !!errors["administrativeDivision_"]?.message
                              }
                              className="inputPadding"
                              displayEmpty
                              {...field}
                              fullWidth
                              MenuProps={MenuProps}
                            >
                              <MenuItem value="" disabled>
                                <span className="text-neutral-400 font-light">
                                  縣市
                                </span>
                              </MenuItem>
                              {cityList.map((c) => (
                                <MenuItem key={c.id} value={c.id}>
                                  {c.name}
                                </MenuItem>
                              ))}
                            </Select>
                          )}
                        />
                        <FormHelperText
                          className="!text-red-600 break-words !text-right !mt-0"
                          sx={{ minHeight: "1.25rem" }}
                        >
                          {errors["administrativeDivision_"]?.message}
                        </FormHelperText>
                      </div>
                      <div className="w-full">
                        <Controller
                          name="administrativeDivision"
                          control={control}
                          render={({ field }) => (
                            <Select
                              error={
                                !!errors["administrativeDivision"]?.message
                              }
                              className="inputPadding"
                              displayEmpty
                              {...field}
                              fullWidth
                              disabled={!distList && !initialized}
                              MenuProps={MenuProps}
                            >
                              <MenuItem value="" disabled>
                                <span className="text-neutral-400 font-light">
                                  鄉鎮區
                                </span>
                              </MenuItem>
                              {distList
                                ? distList.map((d) => (
                                    <MenuItem key={d.id} value={d.id}>
                                      {d.name}
                                    </MenuItem>
                                  ))
                                : getValues("administrativeDivision") && (
                                    <MenuItem
                                      value={getValues(
                                        "administrativeDivision"
                                      )}
                                    ></MenuItem>
                                  )}
                            </Select>
                          )}
                        />
                        <FormHelperText
                          className="!text-red-600 break-words !text-right !mt-0"
                          sx={{ minHeight: "1.25rem" }}
                        >
                          {errors["administrativeDivision"]?.message}
                        </FormHelperText>
                      </div>
                    </div>
                    <div className="w-full">
                      <Controller
                        name="street"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            error={!!errors["street"]?.message}
                            variant="outlined"
                            size="small"
                            className="inputPadding"
                            placeholder="街道/巷弄"
                            fullWidth
                            inputProps={{ maxLength: 100 }}
                            {...field}
                          />
                        )}
                      />
                      <FormHelperText
                        className="!text-red-600 break-words !text-right !mt-0"
                        sx={{ minHeight: "1.25rem" }}
                      >
                        {errors["street"]?.message}
                      </FormHelperText>
                    </div>
                  </div>

                  {/* **************************************************** 地籍編號是另一隻api */}
                  {/* <div className={`inline-flex sm:flex-row flex-col sm:gap-2 gap-1 ${!deliverInfo && "hidden"}`}>
                    <div className="w-full">
                      <InputTitle title={"地號"} required={false} />
                      <Controller
                        name="landLot"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            placeholder="純數字，如多筆請用逗號隔開 ex. 1234, 4567"
                            error={!!errors["landLot"]?.message}
                            variant="outlined"
                            type="tel"
                            size="small"
                            className="inputPadding"
                            fullWidth
                            {...field}
                          />
                        )}
                      />
                      <FormHelperText
                        className="!text-red-600 break-words !text-right !mt-0"
                        sx={{ minHeight: "1.25rem" }}
                      >
                        {errors["landLot"]?.message}
                      </FormHelperText>
                    </div>
                  </div> */}

                  {/* 簽約日期 x 完工日期 */}
                  {/* <div className="w-full flex sm:flex-row flex-col gap-x-4">
                    <div className="w-full">
                      <InputTitle title={"簽約日期"} required={false} />
                      <ControlledDatePicker name="dateOfContract" mode="rwd" />
                      <FormHelperText
                        className="!text-red-600 break-words !text-right !mt-0"
                        sx={{ minHeight: "1.25rem" }}
                      >
                        {errors["dateOfContract"]?.message}
                      </FormHelperText>
                    </div>{" "}
                    <div className="w-full">
                      <InputTitle title={"完工日期"} required={false} />
                      <ControlledDatePicker name="completionDate" mode="rwd" />
                      <FormHelperText
                        className="!text-red-600 break-words !text-right !mt-0"
                        sx={{ minHeight: "1.25rem" }}
                      >
                        {errors["completionDate"]?.message}
                      </FormHelperText>
                    </div>
                  </div> */}

                  {/* 經緯度半徑 */}
                  <div className="inline-flex items-center pb-4 pt-0 sm:pt-1 gap-2">
                    <InputTitle title={"案場範圍"} required={false} />
                    <Button
                      type="button"
                      variant="contained"
                      color="purple"
                      onClick={() => {
                        setMapDialog(true);
                      }}
                      className="!text-sm !h-10 !py-0"
                    >
                      地圖選點
                    </Button>
                  </div>
                  <div className="inline-flex sm:gap-2 gap-1">
                    <div className="w-full">
                      <InputTitle title={"緯度"} required={false} />
                      <Controller
                        name="latitude"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            placeholder="請選擇地點"
                            error={!!errors["latitude"]?.message}
                            variant="outlined"
                            size="small"
                            className="inputPadding"
                            // InputProps={{
                            // 	readOnly: true,
                            // }}
                            // disabled={!getValues("latitude")}
                            fullWidth
                            {...field}
                          />
                        )}
                      />
                      {/* <FormHelperText
											className="!text-red-600 break-words !text-right !mt-0"
											sx={{ minHeight: "1.25rem" }}>
											{errors["latitude"]?.message}
										</FormHelperText> */}
                    </div>
                    <div className="w-full">
                      <InputTitle title={"經度"} required={false} />
                      <Controller
                        name="longitude"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            placeholder="請選擇地點"
                            error={!!errors["longitude"]?.message}
                            variant="outlined"
                            size="small"
                            className="inputPadding"
                            // InputProps={{
                            // 	readOnly: true,
                            // }}
                            // disabled={!getValues("longitude")}
                            fullWidth
                            {...field}
                          />
                        )}
                      />
                      {/* <FormHelperText
											className="!text-red-600 break-words !text-right !mt-0"
											sx={{ minHeight: "1.25rem" }}>
											{errors["longitude"]?.message}
										</FormHelperText> */}
                    </div>
                    <div className="w-full">
                      <InputTitle title={"半徑"} required={false} />
                      <Controller
                        name="radius"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            placeholder="請選擇地點"
                            error={!!errors["radius"]?.message}
                            variant="outlined"
                            size="small"
                            className="inputPadding"
                            // InputProps={{
                            // 	readOnly: true,
                            // }}
                            // disabled={!getValues("radius")}
                            fullWidth
                            {...field}
                          />
                        )}
                      />
                      {/* <FormHelperText
											className="!text-red-600 break-words !text-right !mt-0"
											sx={{ minHeight: "1.25rem" }}>
											{errors["radius"]?.message}
										</FormHelperText> */}
                    </div>
                  </div>
                </div>
                <Button
                  type="submit"
                  variant="contained"
                  color="success"
                  className="!text-base !h-12"
                  disabled={deliverInfo && !distList}
                  fullWidth
                >
                  儲存
                </Button>
              </div>

              {/* MapDialog */}
              {mapDialog && (
                <MapDialog
                  open={mapDialog}
                  handleClose={() => setMapDialog(false)}
                  pos={{
                    lat: getValues("latitude") ? +getValues("latitude") : 0,
                    lng: getValues("longitude") ? +getValues("longitude") : 0,
                  }}
                  r={getValues("radius") ? +getValues("radius") : 500}
                />
              )}
            </form>
          </FormProvider>
        </ModalTemplete>

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

        {/* Backdrop */}
        <Backdrop
          sx={{ color: "#fff", zIndex: 1050 }}
          open={!bizRepList || !fRepList || (deliverInfo ? !apiData : false)}
          onClick={onCheckDirty}
        >
          <LoadingTwo />
        </Backdrop>
      </>
    );
  }
);

export { UpdatedModal };
