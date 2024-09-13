import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Button,
  IconButton,
  TextField,
  CircularProgress,
  Typography,
  InputBase,
  Avatar,
} from "@mui/material";
import ImageLogo from "../assets/imagelogo.jsx";
import GifIcon from "../assets/gifIcon.jsx";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import { useContext, useEffect, useState, useRef } from "react";
import { AppContext } from "../context";
import DeleteIcon from "@mui/icons-material/Delete";
import api from "../api";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import CloseIcon from "@mui/icons-material/Close";
import bg_chat from "../assets/img-chat-an-danh.jpg";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import SubdirectoryArrowRightSharpIcon from "@mui/icons-material/SubdirectoryArrowRightSharp";
import { useNavigate, useLocation } from "react-router-dom";

const Incognito = () => {
  const appContext = useContext(AppContext);
  const { user } = appContext;
  const [userChat, setUserChat] = useState([]);
  const [messenger, setMess] = useState(null);
  const [sendMess, setSendMess] = useState("");
  const [idRecei, setIdReceive] = useState(null);
  const [nowRoom, setNowRoom] = useState();
  const [loading, setLoading] = useState(false);
  const [reload, setReload] = useState(0);
  const navigate = useNavigate();
  let { state: { userInfomations = [] } = {} } = useLocation();
  const [userInfo, setUserInfo] = useState(userInfomations);
  const [searchData, setSearchMessage] = useState("");
  const [dataSearch, setdataSearch] = useState(null);
  const [nowChat, setNowChat] = useState(userInfomations);
  const [selectedImage, setSelectedImage] = useState(null); // State for a single image
  const inputRef = useRef(null);
  const [showGiphySearch, setShowGiphySearch] = useState(false);
  const [page, setPage] = useState(1);
  //----------------------------------------------------------------
  function GiphySearch() {
    const [searchTerm, setSearchTerm] = useState("");
    const [gifs, setGifs] = useState([]);
    const [selectedGif, setSelectedGif] = useState(null); // State để theo dõi GIF được chọn
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const API_KEY = "3f9X5UA8I0bbK3h9fwysbiEbluBM6JrC"; // Thay thế bằng API key của bạn

    // Hàm tìm kiếm hoặc tải GIFs phổ biến
    const fetchGifs = async (query) => {
      setLoading(true); // Bắt đầu tải dữ liệu
      setError(null); // Xóa thông báo lỗi trước đó
      setSelectedGif(null); // Xóa GIF đã chọn khi tìm kiếm mới
      const timeoutId = setTimeout(() => {
        setError("Loading took too long. Please try again later.");
        setLoading(false);
      }, 5000); // 5 giây

      try {
        const response = await fetch(
          `https://api.giphy.com/v1/gifs/${
            query ? "search" : "trending"
          }?api_key=${API_KEY}&q=${query || ""}&limit=10`
        );
        const data = await response.json();
        setGifs(data.data);
      } catch (error) {
        console.error("Error fetching GIFs:", error);
        setError("Failed to load GIFs. Please try again later.");
      } finally {
        clearTimeout(timeoutId); // Dọn dẹp thời gian chờ khi hoàn tất
        setLoading(false); // Kết thúc việc tải dữ liệu
      }
    };

    // Hàm gọi khi nhấn nút tìm kiếm
    const handleSearch = () => {
      fetchGifs(searchTerm.trim());
    };

    // Sử dụng useEffect để tải GIFs phổ biến khi trang được tải
    useEffect(() => {
      fetchGifs(); // Gọi fetchGifs mà không có từ khóa để tải GIFs phổ biến mặc định
    }, []);

    // Hàm xử lý khi người dùng chọn một GIF
    const handleGifClick = async (gif) => {
      setSelectedGif(gif); // Đặt GIF đã chọn vào state
      console.log("GIF Information:", {
        id: gif.id,
        title: gif.title,
        url: gif.url,
        image: gif.images.fixed_height.url,
      });

      const [part1, part2] = nowRoom ? nowRoom.split("#") : [];
      const idReceive = part1 != user.id ? part1 : part2;

      const senmess = {
        content: null,
        idReceive: userInfo != null ? userInfo.id : idReceive,
        idRoom: nowRoom ? nowRoom : `${user.id}#${userInfo.id}`,
        img: null,
        gif: gif.images.fixed_height.url,
        type: "gif",
      };

      try {
        await api.post(`/message/chat-unknown/${user.id}`, senmess);
        console.log("Tin nhắn gửi:", senmess);

        setMess((prev) =>
          Array.isArray(prev) ? [...prev, senmess] : [senmess]
        );
        setSendMess("");
        handleGifButtonClick();
        setReload((prev) => prev + 1);
        scrollToBottom();
      } catch (err) {
        console.error("Error sending message:", err);
      }
    };

    return (
      <div className="max-h-[500px] w-full">
        <div className="flex flex-row w-full items-center justify-center">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              background: "#999",
              borderRadius: "30px",
              height: "40px",
              margin: "10px 0",
              width: "fit-content",
              justifyContent: "center",
              paddingLeft: "10px",
            }}
          >
            <TextField
              type="text"
              value={searchTerm}
              id="standard-basic"
              variant="standard"
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search for GIFs"
              sx={{
                width: "90%",
                border: "none",
                margin: "0 0 0px 10px",
                input: { color: "#000" },
              }}
            />
            <IconButton disabled={loading}>
              {loading ? (
                <CircularProgress size={24} className="mr-1 my-1" />
              ) : (
                <SearchIcon className="mr-1 my-1" onClick={handleSearch} />
              )}
            </IconButton>
          </div>
        </div>
        <div className="">
          {error ? (
            <p className="text-center w-full text-red-500">{error}</p>
          ) : selectedGif ? (
            <img
              key={selectedGif.id}
              src={selectedGif.images.fixed_height.url}
              alt={selectedGif.title}
              onClick={() => handleGifClick(selectedGif)}
              style={{ cursor: "pointer", margin: "10px", borderRadius: "4px" }}
            />
          ) : gifs.length > 0 ? (
            gifs.map((gif) => (
              <img
                key={gif.id}
                src={gif.images.fixed_height.url}
                alt={gif.title}
                onClick={() => handleGifClick(gif)}
                style={{
                  cursor: "pointer",
                  margin: "10px",
                  borderRadius: "4px",
                }}
              />
            ))
          ) : (
            <p className="text-center">loading...</p>
          )}
        </div>
      </div>
    );
  }

  //----------------------------------------------------------------
  const handleGifButtonClick = () => {
    setShowGiphySearch((prev) => !prev); // Toggle the visibility of GiphySearch
  };
  console.log("selectedImage 1", selectedImage);
  useEffect(() => {
    console.log("selectedImage", selectedImage); // Log selected image info when selectedImage changes
  }, [selectedImage]);

  const handleButtonClick = () => {
    inputRef.current.click(); // Open file picker when button is clicked
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0]; // Lấy file đầu tiên
    if (file) {
      const objectURL = URL.createObjectURL(file); // Tạo URL tạm thời cho ảnh

      const selectedImage = {
        url: objectURL, // Sử dụng URL tạm thời để hiển thị ảnh
        file, // Lưu file để gửi lên server
      };

      setSelectedImage(selectedImage); // Đặt ảnh đã chọn
      setSendMess(objectURL); // Lưu URL tạm thời nếu cần thiết
    }

    if (inputRef.current) {
      inputRef.current.value = null;
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null); // Remove the selected image
    if (inputRef.current) {
      inputRef.current.value = null;
    }
  };

  //input ảnh
  const handleInputChange = (event) => {
    setSendMess(event.target.value);
  };
  function getCurrentFormattedDateTime() {
    const date = new Date();

    // Lấy các thành phần của ngày và giờ
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Tháng tính từ 0-11, cần +1
    const year = date.getFullYear();

    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    // Xác định AM/PM
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12; // Giờ 0 thành 12
    const formattedHours = String(hours).padStart(2, "0");

    // Lấy múi giờ
    const timeZoneOffset = -date.getTimezoneOffset();
    const offsetSign = timeZoneOffset >= 0 ? "+" : "-";
    const offsetHours = String(
      Math.floor(Math.abs(timeZoneOffset) / 60)
    ).padStart(2, "0");
    const offsetMinutes = String(Math.abs(timeZoneOffset) % 60).padStart(
      2,
      "0"
    );

    // Tạo chuỗi thời gian định dạng
    const formattedDateTime = `${day}/${month}/${year} ${formattedHours}:${minutes}:${seconds} ${ampm} ${offsetSign}${offsetHours}:${offsetMinutes}`;

    return formattedDateTime;
  }
  //lấy tin nhắn
  const getMess = async (data) => {
    const payload = {
      idRoom: `${data.idRoom}`,
    };
    try {
      const res = await api.post(`/message/chat-unknown-id?page=1`, payload);
      setMess(res.data.data);
      console.log("res.data.data", res.data.data);
      scrollToBottom();
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    if (userInfo !== null) {
      getMess({
        idReceive: userInfo.id,
        idRoom: `${user.id}#${userInfo.id}`,
      });
    }
  }, [userInfo]);

  const scrollToBottom = () => {
    setTimeout(() => {
      const element = document.getElementById("lastmessage");
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100); // Thời gian trễ là 100ms (có thể điều chỉnh tùy ý)
  };

  useEffect(() => {
    if (idRecei) {
      getSendMess();
    }
  }, [reload]);

  const handleKeyDown = (event) => {
    if (event.keyCode === 13) {
      SendMessage();
    }
  };

  const SearchMessage = async () => {
    try {
      setLoading(true);
      const res = await api.get(
        `/message/search_unknown_by_text/${user.id}/${searchData}`
      );
      setdataSearch(res.data);

      console.log(" res.status", res.data.status, dataSearch);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false); // Set loading state to false after request is complete
    }
  };

  const SendMessage = async () => {
    const sendAt = getCurrentFormattedDateTime();
    const [part1, part2] = nowRoom ? nowRoom.split("#") : [];

    setIdReceive(part1 !== user.id ? part1 : part2);

    const senmess = {
      content: sendMess,
      idReceive:
        userInfo !== null ? userInfo.id : part1 != user.id ? part1 : part2,
      idRoom: nowRoom ? nowRoom : `${user.id}#${userInfo.id}`,
      img: null,
      gif: null,
      type: "text",
    };

    try {
      await api.post(`/message/chat-unknown/${user.id}`, senmess);
      console.log("tin nhăns gửi ", senmess);

      setMess((prev) => (Array.isArray(prev) ? [...prev, senmess] : [senmess]));
      setSendMess("");
      setReload((prev) => prev + 1);
      scrollToBottom();
    } catch (err) {
      console.error(err);
    }
  };

  const SendImageMessage = async () => {
    const [part1, part2] = nowRoom ? nowRoom.split("#") : [];

    setIdReceive(part1 != user.id ? part1 : part2);
    const senmess = {
      content: null,
      idReceive:
        userInfo != null ? userInfo.id : part1 != user.id ? part1 : part2,
      idRoom: nowRoom ? nowRoom : `${user.id}#${userInfo.id}`,
      img: selectedImage.url, // Sử dụng URL tạm thời để hiển thị ảnh
      gif: null,
      type: "image",
    };
    const formData = new FormData();
    formData.append("content", null);
    formData.append(
      "idReceive",
      userInfo != null ? userInfo.id : part1 != user.id ? part1 : part2
    );
    formData.append("idRoom", nowRoom ? nowRoom : `${user.id}#${userInfo.id}`);
    formData.append("img", selectedImage.file); // Gửi trực tiếp tệp ảnh
    formData.append("gif", null);
    formData.append("type", "image");
    console.log("senmess", senmess);

    try {
      const response = await fetch(
        `https://samnote.mangasocial.online/message/chat-unknown-image2/${user.id}`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      setMess((prev) => (Array.isArray(prev) ? [...prev, senmess] : [senmess]));
      setSendMess(""); // Xóa trạng thái tin nhắn
      setSelectedImage(null); // Đặt lại ảnh đã chọn
      setReload((prev) => prev + 1);
      scrollToBottom();
    } catch (err) {
      console.error("Lỗi khi gửi tin nhắn:", err);
    }
  };

  // const getSendMess = async (data) => {
  //   try {
  //     const res = await api.get(
  //       `/message/chat-unknown-id/${data.idReceive}/${user.id}`
  //     );
  //     scrollToBottom();
  //     console.log("check data", data);
  //     setSendMess(res.data.data);
  //   } catch (err) {
  //     console.log(err);
  //   }
  // };
  const getSendMess = async (data) => {
    try {
      const res = await api.get(
        `/message/chat-unknown-id/${data.idReceive}/${user.id}`
      );
      scrollToBottom();
      console.log("check data", data);
      setSendMess(res.data.data);
    } catch (err) {
      console.log(err);
    }
  };

  const deleteBoxChat = async (data) => {
    const payload = {
      idRoom: data.idRoom,
    };

    try {
      const res = await api.post(
        `/message/delete_chat_unknown`,

        payload
      );

      console.log("payload", payload);
      console.log("thành công");
      setReload((prev) => prev + 1);
      setSendMess(res.data.data);
    } catch (err) {
      console.log("lỗi");
      console.log(err);
    }
  };

  useEffect(() => {
    const getUserChat = async () => {
      try {
        const res = await api.get(
          // `/message/list_user_unknown/77`
          `https://samnote.mangasocial.online/message/list_user_unknown/${user.id}`
        );
        console.log(res.data.data);
        setUserChat(res.data.data);
      } catch (err) {
        console.log(err);
      }
    };

    getUserChat();
  }, [user.id, reload]);

  return (
    <Box className="text-white lg:flex bg-[#DFFFFE] sm:grid sm:grid-cols-[300px_1fr]">
      <Box
        className="sm:w-[300px]"
        sx={{
          display: "flex",
          flexDirection: "column",
          boxShadow: "2px 0 4px rgba(0, 0, 0, 0.1)",
          alignItems: "center",
        }}
      >
        <Box className="bg-[#B6F6FF] uppercase text-black w-full py-3 text-center font-bold">
          chat
        </Box>

        <Box
          className="relative"
          style={{
            margin: "0 10px",
            boxShadow: "0 -2px 4px rgba(0, 0, 0, 0.1)",
          }}
        >
          {" "}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              background: "#fff",
              borderRadius: "30px",
              height: "40px",
              margin: "10px 0",
              width: "90%",
              justifyContent: "center",
            }}
          >
            <TextField
              id="input-with-sx"
              variant="standard"
              placeholder="Search messenger"
              value={searchData}
              onChange={(event) => setSearchMessage(event.target.value)}
              sx={{
                width: "90%",
                margin: "0 0 0px 10px",
                input: { color: "#000" },
              }}
              InputLabelProps={{ style: { color: "#000" } }}
            />
            <IconButton disabled={loading}>
              {loading ? (
                <CircularProgress size={24} className="mr-1 my-1" />
              ) : (
                <SearchIcon className="mr-1 my-1" onClick={SearchMessage} />
              )}
            </IconButton>
          </Box>
          {dataSearch && (
            <Box className="max-h-[85vh] min-w-[100%] overflow-auto absolute bg-white px-1  z-[10] rounded-xl left-[50%] transform -translate-x-1/2 py-[30px]">
              <CloseIcon
                className="bg-black fixed z-20 right-2 top-2 cursor-pointer"
                onClick={() => {
                  setdataSearch(null);
                }}
              />

              {dataSearch.status == 200 ? (
                dataSearch.data.map((item, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      borderRadius: "10px",
                      margin: "5px 0px",
                      padding: "5px",
                      backgroundColor: "#56565DCC",
                      justifyContent: "space-between",
                    }}
                    // onClick={() => {
                    //   getMess(item);
                    //   setNowRoom(item.idRoom);
                    //   setUserInfo(null);
                    //   setNowChat(item);
                    // }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      {item.user === "Unknow" ? (
                        <svg
                          width="48"
                          height="48"
                          viewBox="0 0 48 48"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M32.2804 4.30225H15.7736C8.60355 4.30225 4.3291 8.57669 4.3291 15.7467V32.2536C4.3291 37.7887 6.87013 41.5904 11.3416 43.0283C12.6416 43.4814 14.1387 43.698 15.7736 43.698H32.2804C33.9154 43.698 35.4124 43.4814 36.7125 43.0283C41.1839 41.5904 43.7249 37.7887 43.7249 32.2536V15.7467C43.7249 8.57669 39.4505 4.30225 32.2804 4.30225ZM40.7702 32.2536C40.7702 36.4689 39.1156 39.1281 35.7867 40.2312C33.876 36.4689 29.3455 33.79 24.027 33.79C18.7086 33.79 14.1978 36.4492 12.2674 40.2312H12.2477C8.95811 39.1675 7.28379 36.4886 7.28379 32.2733V15.7467C7.28379 10.1919 10.2188 7.25693 15.7736 7.25693H32.2804C37.8353 7.25693 40.7702 10.1919 40.7702 15.7467V32.2536Z"
                            fill="black"
                          />
                          <path
                            d="M24.0304 16.1208C20.1302 16.1208 16.9785 19.2725 16.9785 23.1727C16.9785 27.0729 20.1302 30.2442 24.0304 30.2442C27.9306 30.2442 31.0822 27.0729 31.0822 23.1727C31.0822 19.2725 27.9306 16.1208 24.0304 16.1208Z"
                            fill="black"
                          />
                        </svg>
                      ) : (
                        <Avatar
                          sx={{ width: "40px", height: "40px", margin: "4px" }}
                          src={item.user.avatar}
                        />
                      )}
                      <Box sx={{ marginLeft: "10px" }}>
                        {item.user === "Unknow" ? (
                          <Typography variant="body1">User name</Typography>
                        ) : (
                          <Typography variant="body1">
                            {item.user.username}
                          </Typography>
                        )}
                        <Typography
                          sx={{
                            overflow: "hidden",
                            width: "140px",
                            whiteSpace: "nowrap",
                            textOverflow: "ellipsis",
                          }}
                          variant="body2"
                        >
                          {item.text}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                ))
              ) : (
                <Typography
                  variant="body2"
                  sx={{ margin: "20px 0", color: "black" }}
                >
                  No chat messages available.
                </Typography>
              )}
            </Box>
          )}
        </Box>

        <Box className="max-h-[47vh] w-[90%] lg:max-h-[50vh] sm:w-[99%] overflow-auto scrollbar-none text-black">
          {" "}
          {userChat.length > 0 ? (
            userChat.map((item, idx) => (
              <Box
                key={idx}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  borderRadius: "30px",
                  margin: "5px 10px",
                  // padding: "5px",
                  backgroundColor: "#fff",
                  justifyContent: "space-between",
                }}
                onClick={() => {
                  getMess(item);
                  setNowRoom(item.idRoom);
                  setUserInfo(null);
                  setNowChat(item);
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Avatar
                    sx={{ width: "40px", height: "40px" }}
                    src={item.user.avatar}
                  />

                  <Box sx={{ marginLeft: "10px", fontWeight: "700" }}>
                    {item.user === "Unknow" ? (
                      <Typography variant="body1" sx={{ fontWeight: "700" }}>
                        User name
                      </Typography>
                    ) : (
                      <Typography variant="body1" sx={{ fontWeight: "700" }}>
                        {item.user.username}
                      </Typography>
                    )}
                    <Typography
                      sx={{
                        overflow: "hidden",
                        width: "140px",
                        whiteSpace: "nowrap",
                        textOverflow: "ellipsis",
                      }}
                      variant="body2"
                    >
                      {item.last_text}
                    </Typography>
                  </Box>
                </Box>
                <DeleteIcon
                  className="cursor-pointer mr-3"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    deleteBoxChat(item);
                    setNowChat(null);
                  }}
                />
              </Box>
            ))
          ) : (
            <Typography variant="body2" sx={{ marginTop: "20px" }}>
              No chat messages available.
            </Typography>
          )}
        </Box>
      </Box>
      {nowChat !== null ? (
        <Box className="fixed inset-0 z-[3] sm:static w-full text-black">
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              padding: "5px 10px",
              backgroundColor: "#DFFFFE",
              boxShadow: "0 4px 4px rgba(0, 0, 0, 0.3)",
              justifyContent: "space-between",
              height: "50px",
              position: "relative",
              zIndex: 100,
            }}
          >
            {" "}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                padding: "10px 5px",
              }}
            >
              <KeyboardBackspaceIcon
                className="sm:hidden block"
                sx={{ marginRight: "10px" }}
                onClick={() => {
                  setNowChat(null);
                }}
              />
              {userInfo ? (
                <>
                  <Avatar
                    sx={{
                      width: "40px",
                      height: "40px",
                      marginRight: "5px",
                    }}
                    src={userInfomations.Avarta}
                  />
                  <Typography variant="body1">
                    {userInfomations.name}
                  </Typography>
                </>
              ) : nowChat.user !== "Unknow" ? (
                <>
                  <Avatar
                    sx={{
                      width: "40px",
                      height: "40px",
                      marginRight: "5px",
                    }}
                    src={nowChat.user.avatar}
                  />
                  <Typography variant="body1">
                    {nowChat.user.username}
                  </Typography>
                </>
              ) : (
                <>
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 48 48"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M32.2804 4.30225H15.7736C8.60355 4.30225 4.3291 8.57669 4.3291 15.7467V32.2536C4.3291 37.7887 6.87013 41.5904 11.3416 43.0283C12.6416 43.4814 14.1387 43.698 15.7736 43.698H32.2804C33.9154 43.698 35.4124 43.4814 36.7125 43.0283C41.1839 41.5904 43.7249 37.7887 43.7249 32.2536V15.7467C43.7249 8.57669 39.4505 4.30225 32.2804 4.30225ZM40.7702 32.2536C40.7702 36.4689 39.1156 39.1281 35.7867 40.2312C33.876 36.4689 29.3455 33.79 24.027 33.79C18.7086 33.79 14.1978 36.4492 12.2674 40.2312H12.2477C8.95811 39.1675 7.28379 36.4886 7.28379 32.2733V15.7467C7.28379 10.1919 10.2188 7.25693 15.7736 7.25693H32.2804C37.8353 7.25693 40.7702 10.1919 40.7702 15.7467V32.2536Z"
                      fill="black"
                    />
                    <path
                      d="M24.0304 16.1208C20.1302 16.1208 16.9785 19.2725 16.9785 23.1727C16.9785 27.0729 20.1302 30.2442 24.0304 30.2442C27.9306 30.2442 31.0822 27.0729 31.0822 23.1727C31.0822 19.2725 27.9306 16.1208 24.0304 16.1208Z"
                      fill="black"
                    />
                  </svg>
                  <Typography variant="body1">User name</Typography>
                </>
              )}
            </Box>
            <MoreHorizIcon />
          </Box>
          <Box
            className="h-[74vh] lg:h-[79vh]"
            sx={{
              width: "100%",
              backgroundImage: `url(${bg_chat})`,
              overflow: "auto",
              scrollbarWidth: "none",
              backgroundPosition: "center bottom",
              backgroundSize: "200%",
              backgroundRepeat: "no-repeat",
            }}
          >
            {messenger?.map((info, index) => (
              <Box
                key={index}
                sx={{
                  marginLeft: "10px",
                  display: "flex",
                  alignItems: "center",
                  color: "#000",
                  justifyContent:
                    info.idReceive !== user.id ? "flex-end" : "flex-start",
                }}
                onClick={() => {
                  getSendMess(info);
                }}
              >
                {info.idReceive === user.id ? (
                  <>
                    <Avatar
                      sx={{
                        width: "40px",
                        height: "40px",
                        margin: "5px",
                      }}
                      src={nowChat.user.avatar}
                    />
                    {info.type === "text" ? (
                      <Box
                        sx={{
                          backgroundColor: "#fff",
                          borderRadius: "10px",
                          padding: "5px",
                          maxWidth: "70%",
                        }}
                      >
                        {info.content}
                      </Box>
                    ) : info.type === "image" ? (
                      <img
                        src={info.img}
                        alt="image"
                        className="w-[30wh] h-[40vh] m-2"
                      />
                    ) : info.type === "gif" ? (
                      <img
                        src={info.gif}
                        alt="GIF"
                        className="max-w-[30wh] max-h-[40vh] m-2"
                      />
                    ) : null}
                  </>
                ) : (
                  <>
                    {" "}
                    {info.type === "text" ? (
                      <Box
                        sx={{
                          backgroundColor: "#1EC0F2",
                          borderRadius: "10px",
                          padding: "5px",
                          margin: "5px 10px",
                          maxWidth: "70%",
                        }}
                      >
                        {info.content}
                      </Box>
                    ) : info.type === "image" ? (
                      <img
                        src={info.img}
                        alt="image"
                        className="w-[30wh] h-[40vh] m-2"
                      />
                    ) : info.type === "gif" ? (
                      <img
                        src={info.gif}
                        alt="GIF"
                        className="max-w-[30wh] max-h-[40vh] m-2"
                      />
                    ) : (
                      ""
                    )}
                  </>
                )}
              </Box>
            ))}
            <div id="lastmessage" />
          </Box>

          <Box
            sx={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              width: "100%",
              padding: "10px 10px 0 10px",
              backgroundColor: "#F4F4F4",
              borderBottomLeftRadius: "15px",
              borderBottomrightRadius: "15px",
            }}
          >
            {showGiphySearch && (
              <div className="absolute bg-white w-[97%] h-[70vh] top-0 -translate-y-[105%] rounded overflow-y-auto flex flex-wrap">
                {" "}
                <div
                  onClick={handleGifButtonClick}
                  className="text-black rounded-[50%] absolute w-[30px] h-[30px]
                  right-[3px] top-[3px] text-center bg-white"
                >
                  <CloseIcon />
                </div>
                <GiphySearch />
              </div>
            )}

            {/* {selectedImage && (
              <div className="absolute bg-white w-[97%] h-[120px] top-0 -translate-y-[105%] rounded overflow-hidden flex">
                <div className="relative m-2">
                  <img
                    src={selectedImage.url}
                    alt="Selected"
                    className="w-[150px] h-[100%] object-cover rounded"
                  />
                  <div
                    onClick={handleRemoveImage}
                    className="text-black rounded-[50%] absolute w-[30px] h-[30px] right-[3px] top-[3px] text-center bg-white cursor-pointer"
                  >
                    <CloseIcon />
                  </div>
                </div>
              </div>
            )} */}

            <IconButton sx={{ p: "5px" }} onClick={handleButtonClick}>
              {selectedImage === null ? (
                <ImageLogo width={20} height={20} />
              ) : (
                <div className="w-[20px] h-[20px] rounded bg-black text-white flex items-center justify-center">
                  +
                </div>
              )}
            </IconButton>
            <input
              type="file"
              ref={inputRef}
              style={{ display: "none" }}
              accept="image/*"
              onChange={handleImageChange}
            />
            <IconButton sx={{ p: "5px" }} onClick={handleGifButtonClick}>
              <GifIcon width={23} height={23} />
            </IconButton>

            {selectedImage ? (
              <>
                {" "}
                <div className="bg-white w-[97%] h-[120px] rounded  flex">
                  <div className="relative m-2">
                    <img
                      src={selectedImage.url}
                      alt="Selected"
                      className="w-[150px] h-[100%] object-cover rounded"
                    />
                    <div
                      onClick={handleRemoveImage}
                      className="text-black rounded-[50%] absolute w-[30px] h-[30px] right-[3px] top-[3px] text-center bg-white cursor-pointer"
                    >
                      <CloseIcon />
                    </div>
                  </div>
                </div>
                <IconButton
                  color={sendMess ? "primary" : "rgba(0,0,0,0.3)"}
                  sx={{ p: "10px" }}
                  aria-label="Send message"
                  onClick={sendMess ? () => SendImageMessage() : undefined}
                >
                  <SubdirectoryArrowRightSharpIcon sx={{ cursor: "pointer" }} />
                </IconButton>
              </>
            ) : (
              <>
                {" "}
                <InputBase
                  sx={{ ml: 1, flex: 1 }}
                  placeholder="Type your message..."
                  value={sendMess}
                  onChange={handleInputChange}
                  onKeyDown={sendMess ? handleKeyDown : undefined}
                />
                <IconButton
                  color={sendMess ? "primary" : "rgba(0,0,0,0.3)"}
                  sx={{ p: "10px" }}
                  aria-label="Send message"
                  onClick={sendMess ? () => SendMessage() : undefined}
                >
                  <SubdirectoryArrowRightSharpIcon sx={{ cursor: "pointer" }} />
                </IconButton>
              </>
            )}
          </Box>
        </Box>
      ) : (
        <></>
      )}
    </Box>
  );
};

export default Incognito;
