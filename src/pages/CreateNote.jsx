import { Editor } from "@tinymce/tinymce-react";
import { useState, useContext, useEffect } from "react";
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import api from "../api";
import Folder from "../components/Folder";
import { Swiper, SwiperSlide } from "swiper/react";
import { AppContext } from "../context";
import { format } from "date-fns";
import CloseIcon from "@mui/icons-material/Close";

import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css";
import "./createnote.css";
import "swiper/css/navigation";

const types = ["text", "checkList"];
const notePublicOptions = ["public", "private"];

const ChecklistComponent = ({ checklistItems, setChecklistItems }) => {
  const [newItem, setNewItem] = useState("");

  const handleAddItem = () => {
    if (newItem.trim()) {
      setChecklistItems([
        ...checklistItems,
        { content: newItem, status: false },
      ]);
      setNewItem("");
    }
  };

  const handleToggleItem = (index) => {
    const updatedItems = checklistItems.map((item, idx) =>
      idx === index ? { ...item, status: !item.status } : item
    );
    setChecklistItems(updatedItems);
  };

  const handleDeleteItem = (index) => {
    const updatedItems = checklistItems.filter((_, idx) => idx !== index);
    setChecklistItems(updatedItems);
  };

  return (
    <div className="w-full p-2">
      <h2>Checklist</h2>
      <ul>
        {checklistItems.map((item, index) => (
          <li key={index}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={item.status}
                  onChange={() => handleToggleItem(index)}
                />
              }
              label={item.content}
            />
            <span onClick={() => handleDeleteItem(index)}>
              <DeleteIcon />
            </span>
          </li>
        ))}
      </ul>
      <div className="flex items-center pl-4">
        <input
          type="text"
          style={{ height: "40px" }}
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder="Add a new list item"
        />
        <span onClick={handleAddItem}>
          <AddIcon />
        </span>
      </div>
    </div>
  );
};

const CreateNote = () => {
  const [type, setType] = useState("text");
  const [title, setTitle] = useState("");
  const [idFolder, setIdFolder] = useState("");
  const [pinned, setPinned] = useState(false);
  const [lock, setLock] = useState("");
  const [remindAt, setRemindAt] = useState(null);
  const [dataText, setDataText] = useState("");
  const [checklistItems, setChecklistItems] = useState([]);
  const [notePublic, setNotePublic] = useState(0);
  const [color, setColor] = useState("");
  const [folder, setUserFolder] = useState(null);
  const [allColor, setAllColor] = useState([]);
  const [reload, setReload] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedForDeletion, setSelectedForDeletion] = useState([]);
  const appContext = useContext(AppContext);
  const { user, setSnackbar } = appContext;
  console.log("remindAt", remindAt);
  const outputDate = format(new Date(remindAt), "dd/MM/yyyy HH:mm a '+07:00'");

  function getCurrentFormattedDateTime() {
    const date = new Date();

    // Lấy các thành phần của ngày và giờ
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Tháng tính từ 0-11, cần +1
    const year = date.getFullYear();

    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");

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
    const formattedDateTime = `${day}/${month}/${year} ${formattedHours}:${minutes} ${ampm} ${offsetSign}${offsetHours}:${offsetMinutes}`;

    return formattedDateTime;
  }
  function ImageUploader() {
    const [checkWidth, setCheckWidth] = useState(window.innerWidth - 330);

    console.log("selectedForDeletion", selectedForDeletion);
    console.log("Selected Files state:", selectedFiles);
    const updateCheckWidth = () => {
      if (window.innerWidth > 1200) {
        setCheckWidth(950);
      } else if (window.innerWidth > 1024) {
        setCheckWidth(window.innerWidth - 330);
      } else {
        setCheckWidth(window.innerWidth - 60);
      }
    };

    // Sử dụng useEffect để lắng nghe sự kiện resize của cửa sổ
    useEffect(() => {
      // Cập nhật giá trị ngay lập tức khi component được render
      updateCheckWidth();

      // Thêm event listener khi component được mount
      window.addEventListener("resize", updateCheckWidth);

      // Cleanup event listener khi component bị unmount
      return () => {
        window.removeEventListener("resize", updateCheckWidth);
      };
    }, []);
    const handleImageChange = (event) => {
      const files = Array.from(event.target.files);

      // Cập nhật danh sách các file đã chọn
      setSelectedFiles((prevFiles) => [...prevFiles, ...files]);
    };

    const handleSelectForDeletion = (file) => {
      setSelectedForDeletion((prevSelection) =>
        prevSelection.includes(file)
          ? prevSelection.filter((f) => f !== file)
          : [...prevSelection, file]
      );
    };

    const handleDeleteImage = (file) => {
      setSelectedFiles((prevFiles) => prevFiles.filter((f) => f !== file));
      URL.revokeObjectURL(file); // Giải phóng tài nguyên
    };

    const handleDeleteSelected = () => {
      setSelectedFiles((prevFiles) =>
        prevFiles.filter((f) => !selectedForDeletion.includes(f))
      );
      selectedForDeletion.forEach((file) => URL.revokeObjectURL(file)); // Giải phóng tài nguyên
      setSelectedForDeletion([]); // Xóa danh sách chọn
    };
    return (
      <div
        style={{
          margin: "20px",
          padding: "0 0 10px",
          backgroundColor: "#fff",
          borderRadius: "4px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            padding: "10px 0",
          }}
        >
          <div style={{ marginBottom: "0px" }}>
            <label
              htmlFor="file-upload"
              style={{
                display: "inline-block",
                padding: "3px 10px",
                fontSize: "16px",
                color: "#fff",
                backgroundColor: "#007bff",
                border: "none",
                borderRadius: "5px",
                marginRight: "10px",
                cursor: "pointer",
                textAlign: "center",
                lineHeight: "30px",
              }}
            >
              Select Image
            </label>
            <input
              id="file-upload"
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              style={{ display: "none" }}
            />
          </div>
          {selectedForDeletion.length >= 1 ? (
            <div style={{ marginBottom: "0px" }}>
              <button
                onClick={handleDeleteSelected}
                style={{
                  padding: "3px 10px",
                  marginRight: "10px",
                  fontSize: "16px",
                  color: "#fff",
                  backgroundColor: "#dc3545",
                  border: "none",
                  borderRadius: "5px",
                  lineHeight: "30px",
                  cursor: "pointer",
                }}
              >
                Delete All
              </button>
            </div>
          ) : (
            ""
          )}
        </div>

        <div style={{ width: `${checkWidth}px` }}>
          {" "}
          <Swiper
            modules={[Navigation]}
            spaceBetween={5}
            slidesPerView={5}
            breakpoints={{
              551: {
                slidesPerView: 3,
              },

              1024: {
                slidesPerView: 5,
              },
            }}
            navigation
            style={{
              display: "flex",
              flexDirection: "row",
              flexWrap: "wrap",
              margin: "0px auto",
            }}
          >
            {selectedFiles.map((file, index) => {
              const imageUrl = URL.createObjectURL(file);
              return (
                <SwiperSlide
                  key={index}
                  style={{ position: "relative", margin: "10px 2px" }}
                >
                  <img
                    src={imageUrl}
                    alt={`Selected ${index}`}
                    style={{
                      width: "100%",
                      height: "200px",
                      objectFit: "cover",
                      display: "block",
                      borderRadius: "4px",
                    }}
                  />
                  <button
                    onClick={() => handleDeleteImage(file)}
                    style={{
                      position: "absolute",
                      top: "5px",
                      left: "5px",
                      color: "#000",
                      borderRadius: "50%",
                      cursor: "pointer",
                      width: "25px",
                      height: "25px",
                      border: "0.2px solid #000",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "16px",
                      fontWeight: "bold",
                    }}
                  >
                    <CloseIcon />
                  </button>
                  <input
                    type="checkbox"
                    checked={selectedForDeletion.includes(file)}
                    onChange={() => handleSelectForDeletion(file)}
                    style={{
                      position: "absolute",
                      top: "5px",
                      right: "15px",
                      backgroundColor: "#fff",
                      border: "none",
                      cursor: "pointer",
                    }}
                  />
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>
      </div>
    );
  }
  const handleReload = () => {
    setReload((prev) => prev + 1);
  };

  useEffect(() => {
    let ignore = false;
    const getUserFolder = async () => {
      try {
        const res = await api.get(
          `https://samnote.mangasocial.online/allfolder/${user.id}`
        );
        if (!ignore) {
          setUserFolder(res.data.folder.reverse());
          console.log("User folder", res.data.folder);
        }
      } catch (err) {
        console.log(err);
      }
    };

    getUserFolder();

    return () => {
      ignore = true;
    };
  }, [reload]);

  useEffect(() => {
    const getAllColor = async () => {
      try {
        const res = await api.get(`get_all_color`);
        setAllColor(res.data.data);
        console.log("User color", res.data.data);
      } catch (err) {
        console.error("Failed to fetch colors:", err);
      }
    };

    getAllColor();
  }, []);

  const handleChangeType = (e) => {
    setType(e.target.value);
  };

  const handleChangeNotePublic = (e) => {
    setNotePublic(e.target.value);
  };

  const handleChangeColor = (e) => {
    setColor(e.target.value);
  };

  const handleSubmit = async () => {
    const payloadData = type === "text" ? dataText : checklistItems;

    const selectedColor = allColor.find((col) => col.id === color) || {
      r: 255,
      g: 255,
      b: 255,
    };

    console.log("selectedColor", selectedColor);

    const parsedColor =
      selectedColor != undefined
        ? {
            r: parseInt(selectedColor.r),
            g: parseInt(selectedColor.g),
            b: parseInt(selectedColor.b),
            a: 1,
          }
        : { r: 255, g: 255, b: 255, a: 1 };

    const payload = {
      type,
      data: payloadData === "" ? "content is empty" : payloadData,
      title: title ? title : "TITLE",
      color: parsedColor,
      idFolder: idFolder ? idFolder : null,
      dueAt: getCurrentFormattedDateTime(),
      pinned,
      lock,
      remindAt: remindAt ? outputDate : null,
      linkNoteShare: "",
      notePublic,
    };

    try {
      const res = await api.post(`/notes/${user.id}`, payload);
      console.log("res", res.data.note);
      const formPayload = new FormData();
      selectedFiles.forEach((file) => {
        formPayload.append("image_note", file);
      });
      formPayload.append("id_note", res.data.note.idNote);
      formPayload.append("id_user", user.id);
      const respon = await fetch(
        `https://samnote.mangasocial.online/add_image_note`,
        {
          method: "POST",
          body: formPayload,
        }
      );
      console.log("respon", selectedFiles, res.data.note.idNote, user.id);

      setSnackbar({
        isOpen: true,
        message: "Created new note successfully",
        severity: "success",
      });
    } catch (err) {
      console.error(err);
      setSnackbar({
        isOpen: true,
        message: "Failed to create note",
        severity: "error",
      });
    }
  };

  return (
    <>
      <Box className="max-w mx-auto pt-3 bg-[#3A3F42]">
        <Box className="flex justify-center">
          <svg
            width="25"
            height="25"
            viewBox="0 0 53 53"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M45.295 53H9.10978C8.88515 53 8.66972 52.9108 8.51089 52.7519C8.35205 52.5931 8.26282 52.3777 8.26282 52.153V0.846965C8.26282 0.622336 8.35205 0.406907 8.51089 0.24807C8.66972 0.0892336 8.88515 0 9.10978 0L29.8943 0L46.1421 16.2478V52.153C46.1421 52.3777 46.0528 52.5931 45.8939 52.7519C45.7351 52.9108 45.5196 53 45.295 53Z"
              fill="#F9E7C0"
            />
            <path
              d="M29.8943 0L46.1421 16.2478H33.3478C31.4404 16.2478 29.8942 14.7016 29.8942 12.7942V0H29.8943Z"
              fill="#EAC083"
            />
            <path
              d="M24.3342 9.56494H13.0899C12.4535 9.56494 11.9377 9.04912 11.9377 8.41281C11.9377 7.7765 12.4535 7.26068 13.0899 7.26068H24.3342C24.9706 7.26068 25.4864 7.7765 25.4864 8.41281C25.4864 9.04912 24.9706 9.56494 24.3342 9.56494ZM25.4864 15.9542C25.4864 15.3179 24.9706 14.8021 24.3342 14.8021H13.0899C12.4535 14.8021 11.9377 15.3179 11.9377 15.9542C11.9377 16.5905 12.4535 17.1064 13.0899 17.1064H24.3342C24.9706 17.1064 25.4864 16.5905 25.4864 15.9542ZM25.4864 23.4958C25.4864 22.8595 24.9706 22.3436 24.3342 22.3436H13.0899C12.4535 22.3436 11.9377 22.8595 11.9377 23.4958C11.9377 24.1321 12.4535 24.6479 13.0899 24.6479H24.3342C24.9706 24.6478 25.4864 24.1321 25.4864 23.4958ZM35.2208 31.0372C35.2208 30.401 34.705 29.8851 34.0686 29.8851H13.0899C12.4535 29.8851 11.9377 30.4009 11.9377 31.0372C11.9377 31.6735 12.4535 32.1893 13.0899 32.1893H34.0686C34.705 32.1893 35.2208 31.6735 35.2208 31.0372ZM39.1019 23.4958C39.1019 22.8595 38.5861 22.3436 37.9498 22.3436H30.1876C29.5514 22.3436 29.0355 22.8595 29.0355 23.4958C29.0355 24.1321 29.5513 24.6479 30.1876 24.6479H37.9498C38.5861 24.6478 39.1019 24.1321 39.1019 23.4958ZM31.0464 38.5787C31.0464 37.9425 30.5306 37.4266 29.8943 37.4266H13.0899C12.4535 37.4266 11.9377 37.9424 11.9377 38.5787C11.9377 39.215 12.4535 39.7308 13.0899 39.7308H29.8943C30.5306 39.7307 31.0464 39.2149 31.0464 38.5787ZM37.9002 46.1201C37.9002 45.4839 37.3844 44.968 36.748 44.968H13.0899C12.4535 44.968 11.9377 45.4838 11.9377 46.1201C11.9377 46.7564 12.4535 47.2723 13.0899 47.2723H36.748C37.3843 47.2723 37.9002 46.7564 37.9002 46.1201Z"
              fill="#597B91"
            />
          </svg>

          <h5 className="ml-1 mb-4 uppercase text-white">Create Note</h5>
        </Box>

        <Box className="flex flex-wrap">
          <FormControl className="w-full bg-white rounded-1 md:w-1/3 lg:w-1/4 xl:w-1/4 mx-4 my-2">
            <InputLabel id="demo-simple-select-label">Type</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              label="Type"
              size="small"
              value={type}
              onChange={handleChangeType}
            >
              {types.map((type, idx) => (
                <MenuItem key={idx} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            className="w-full bg-white rounded-1 md:w-1/3 lg:w-1/4 xl:w-1/4 mx-4 my-2"
            label="Title"
            size="small"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <FormControl className="w-full bg-white rounded-1 md:w-1/3 lg:w-1/4 xl:w-1/4 mx-4 my-2">
            <InputLabel id="demo-simple-select-color-label">
              Background-color
            </InputLabel>
            <Select
              labelId="demo-simple-select-color-label"
              id="demo-simple-select-color"
              label="Background-color"
              size="small"
              value={color}
              onChange={handleChangeColor}
            >
              {allColor.map((colorOption) => (
                <MenuItem key={colorOption.id} value={colorOption.id}>
                  {colorOption.name}
                  <span
                    style={{
                      height: "20px",
                      width: "20px",
                      border: "1px solid black",
                      marginLeft: "3px",
                      background: `rgba(${colorOption.r}, ${colorOption.g}, ${colorOption.b})`,
                    }}
                  ></span>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl className="w-full bg-white rounded-1 md:w-1/3 lg:w-1/4 xl:w-1/4 mx-4 my-2">
            <InputLabel id="demo-simple-select-folder">Folder</InputLabel>
            <Select
              label="Folder"
              size="small"
              labelId="demo-simple-select-folder"
              id="demo-simple-select"
              value={idFolder}
              onChange={(e) => setIdFolder(e.target.value)}
            >
              {folder &&
                folder.map((data, index) => (
                  <MenuItem key={index} value={data.id}>
                    {data.nameFolder}
                  </MenuItem>
                ))}
              <Folder setReloadfunction={handleReload} />
            </Select>
          </FormControl>

          <TextField
            className="w-full md:w-1/3 bg-white rounded-1 lg:w-1/4 xl:w-1/4 mx-4 my-2"
            label="Lock"
            size="small"
            type="password"
            value={lock}
            onChange={(e) => setLock(e.target.value)}
          />

          <FormControl className="w-full bg-white rounded-1 md:w-1/3 lg:w-1/4 xl:w-1/4 mx-4 my-2">
            <InputLabel id="demo-simple-select-notePublic">
              Note Public
            </InputLabel>
            <Select
              label="Note Public"
              size="small"
              labelId="demo-simple-select-notePublic"
              id="demo-simple-select"
              value={notePublic}
              onChange={handleChangeNotePublic}
            >
              {notePublicOptions.map((data, index) => (
                <MenuItem key={index} value={index}>
                  {data}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box className="flex items-start text-white w-full flex-col md:w-1/3 lg:w-1/4 xl:w-1/4 z-50 mx-4 my-2">
            <span className="relative top-0 left-0">RemindAt</span>
            {/* <DatePicker
              selected={remindAt}
              onChange={(date) => setRemindAt(date)}
              showTimeSelect
              dateFormat="Pp"
            /> */}
            <DatePicker
              className="w-[250px] "
              selected={remindAt ? remindAt : null}
              onChange={(date) => setRemindAt(date)}
              showTimeSelect
              dateFormat="Pp"
              placeholderText="Select a date and time"
              isClearable
            />
          </Box>
          <FormControlLabel
            className="w-full text-white rounded-1 md:w-1/3 lg:w-1/4 xl:w-1/4 mx-4 my-2"
            label="Pinned"
            control={
              <Checkbox
                className="text-white"
                checked={pinned}
                onChange={(e) => setPinned(e.target.checked)}
              />
            }
          />
          <Box className="flex items-center">
            <Button
              className="h-[35px]"
              variant="contained"
              onClick={handleSubmit}
            >
              Create
            </Button>
          </Box>
        </Box>
        <div>
          <ImageUploader />
        </div>
        {type === "text" ? (
          <>
            <Editor
              apiKey="c9fpvuqin9s9m9702haau5pyi6k0t0zj29nelhczdvjdbt3y"
              value={dataText}
              init={{
                height: "500px",
                menubar: true,
                // menubar: false,
                statusbar: false,
                plugins: [
                  "advlist autolink lists link charmap print preview anchor",
                  "searchreplace visualblocks code fullscreen",
                  "insertdatetime media table paste code help wordcount",
                  "image",
                ],
                bold: [
                  { inline: "strong", remove: "all" },
                  { inline: "p", styles: { fontWeight: "bold" } },
                  { inline: "b", remove: "all" },
                ],
                toolbar:
                  "undo redo |formatselect | bold italic backcolor | \
              alignleft aligncenter alignright alignjustify | \
              bullist numlist outdent indent | removeformat|",
              }}
              onEditorChange={(content) => setDataText(content)}
            />
          </>
        ) : (
          <ChecklistComponent
            checklistItems={checklistItems}
            setChecklistItems={setChecklistItems}
          />
        )}
      </Box>
    </>
  );
};

export default CreateNote;
