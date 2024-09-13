// import { useState, useContext, useRef } from "react";
// import { Stage, Layer, Rect, Line } from "react-konva";
// import { Box, TextField, CircularProgress } from "@mui/material";
// import Button from "@mui/material/Button";
// import { SketchPicker } from "react-color";
// import "react-datepicker/dist/react-datepicker.css";
// import { format } from "date-fns";
// import html2canvas from "html2canvas";
// import DatePicker from "react-datepicker";
// import useMediaQuery from "@mui/material/useMediaQuery";
// import { AppContext } from "../context";

// const UserSketch = () => {
//   const appContext = useContext(AppContext);
//   const { user, setSnackbar } = appContext;
//   const [lines, setLines] = useState([]);
//   const [isDrawing, setIsDrawing] = useState(false);
//   const [color, setColor] = useState("black");
//   const [lineWidth, setLineWidth] = useState(2);
//   const [selectedColor, setSelectedColor] = useState("black");
//   const [isEraserActive, setIsEraserActive] = useState(false);
//   const [title, setTitle] = useState("");
//   const [remindAt, setRemindAt] = useState(null);
//   const [loading, setLoading] = useState(false);

//   const lgScreen = useMediaQuery("(max-width:991px)");
//   const [colorNote, setColorNote] = useState({
//     r: "255",
//     g: "255",
//     b: "255",
//     a: "1",
//   });
//   const [displayColorPicker, setDisplayColorPicker] = useState(false);

//   const handleMouseDown = (event) => {
//     setIsDrawing(true);
//     const { offsetX, offsetY } = event.target.getStage().getPointerPosition();
//     setLines([
//       ...lines,
//       {
//         points: [offsetX, offsetY],
//         color: isEraserActive ? "white" : color,
//         width: isEraserActive ? 10 : lineWidth,
//       },
//     ]);
//   };

//   const handleUndo = () => {
//     if (lines.length > 0) {
//       setLines(lines.slice(0, -1));
//     }
//   };

//   const handleMouseMove = (event) => {
//     if (!isDrawing) return;

//     const stage = event.target.getStage();
//     const point = stage.getPointerPosition();
//     let lastLine = lines[lines.length - 1];

//     if (lastLine) {
//       if (!lastLine.points) {
//         lastLine.points = [];
//       }
//       lastLine.points = lastLine.points.concat([point.x, point.y]);
//       setLines([...lines.slice(0, lines.length - 1), lastLine]);
//     }
//   };
//   const outputDate = format(new Date(remindAt), "yyyy/M/d HH:mm:ss");
//   const stageRef = useRef(null);

//   const uploadImage = async () => {
//     try {
//       setLoading(true);
//       // Capture screenshot of the current view
//       const canvas = await html2canvas(document.getElementById("screenshot"));
//       const imageData = canvas.toDataURL("image/png");

//       // Convert data URL to Blob
//       const byteCharacters = atob(imageData.split(",")[1]);
//       const byteNumbers = new Array(byteCharacters.length);
//       for (let i = 0; i < byteCharacters.length; i++) {
//         byteNumbers[i] = byteCharacters.charCodeAt(i);
//       }
//       const byteArray = new Uint8Array(byteNumbers);
//       const blob = new Blob([byteArray], { type: "image/png" });

//       // Create a File object from the Blob
//       const file = new File([blob], "screenshot.png", { type: "image/png" });

//       // Prepare payload for server upload
//       const payload = {
//         type: "image",
//         image_note: file,
//         title: "Your title here", // Replace with your actual title variable
//         r: colorNote.r,
//         g: colorNote.g,
//         b: colorNote.b,
//         a: colorNote.a,
//         content: "dfsdf",
//         remind: outputDate ? outputDate : null,
//       };

//       // Prepare FormData for fetch
//       const formPayload = new FormData();
//       formPayload.append("image_note", file);
//       formPayload.append("type", "image");
//       formPayload.append("title", payload.title);
//       formPayload.append("r", payload.r);
//       formPayload.append("g", payload.g);
//       formPayload.append("b", payload.b);
//       formPayload.append("a", payload.a);
//       formPayload.append("content", payload.content);
//       if (payload.remind) {
//         formPayload.append("remind", payload.remind);
//       }

//       const response = await fetch(
//         `https://samnote.mangasocial.online/new-note-image/${user.id}`,
//         {
//           method: "POST",
//           body: formPayload,
//         }
//       );

//       if (response.ok) {
//         setSnackbar({
//           isOpen: true,
//           message: "Save note successfully ",
//           severity: "success",
//         });
//       } else {
//         setSnackbar({
//           isOpen: true,
//           message: "Failed to save note ",
//           severity: "error",
//         });
//       }
//     } catch (error) {
//       setSnackbar({
//         isOpen: true,
//         message: "Failed to save note ",
//         severity: "error",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   // const downloadImage = async () => {
//   //   try {
//   //     // Capture screenshot of the current view
//   //     const canvas = await html2canvas(document.getElementById("screenshot"));
//   //     const imageData = canvas.toDataURL("image/png");

//   //     // Download the image locally
//   //     const downloadLink = document.createElement("a");
//   //     downloadLink.href = imageData;
//   //     downloadLink.download = "screenshot.png";
//   //     document.body.appendChild(downloadLink);
//   //     downloadLink.click();
//   //     document.body.removeChild(downloadLink);
//   //   } catch (error) {
//   //     setSnackbar({
//   //       isOpen: true,
//   //       message: "Failed to dowload image ",
//   //       severity: "error",
//   //     });
//   //   }
//   // };

//   const handleMouseUp = () => {
//     setIsDrawing(false);
//   };

//   const handleColorChange = (newColor) => {
//     setColor(newColor);
//     setSelectedColor(newColor);
//   };

//   const handleWidthChange = (newValue) => {
//     setLineWidth(newValue);
//   };

//   const handleClick = () => {
//     setDisplayColorPicker(!displayColorPicker);
//   };

//   const handleClose = () => {
//     setDisplayColorPicker(false);
//   };

//   const handleChange = (color) => {
//     setColorNote(color.rgb);
//   };

//   const boardWidth = lgScreen
//     ? window.innerWidth - 20
//     : window.innerWidth - 267;
//   const boardHeight = 500;

//   return (
//     <div className="w-full">
//       <div className="flex flex-wrap items-center justify-between px-2 py-3">
//         <h3 className="uppercase">sketch note</h3>{" "}
//         <Button
//           className="mx-4"
//           variant="contained"
//           disabled={loading}
//           sx={{ height: "40px", width: "90px" }}
//           onClick={uploadImage}
//         >
//           {loading ? <CircularProgress size={24} /> : "create"}
//         </Button>
//       </div>
//       <div className="flex flex-wrap items-center ">
//         <TextField
//           className="w-full md:w-1/3 lg:w-1/4 xl:w-1/4 mx-2 my-2"
//           label="Title"
//           size="small"
//           value={title}
//           onChange={(e) => setTitle(e.target.value)}
//         />
//         <div
//           className="w-full md:w-1/3 lg:w-1/4 xl:w-1/4 mx-2 my-2"
//           style={{
//             padding: "5px",
//             background: "#fff",
//             borderRadius: "3px",
//             boxShadow: "0 0 0 1px rgba(0,0,0,.1)",
//             cursor: "pointer",
//             whiteSpace: "nowrap",
//             display: "flex",
//             height: "39px",
//           }}
//           onClick={handleClick}
//         >
//           Background-color:
//           <div
//             style={{
//               width: "36px",
//               height: "100%",
//               border: "0.1px solid black",
//               marginLeft: "5px",
//               borderRadius: "2px",
//               background: `rgba(${colorNote.r}, ${colorNote.g}, ${colorNote.b}, ${colorNote.a})`,
//             }}
//           />
//         </div>
//         {displayColorPicker && (
//           <div
//             style={{
//               position: "absolute",
//               right: "45%",
//               top: "50px",
//               zIndex: "90",
//             }}
//           >
//             <div
//               style={{
//                 position: "fixed",
//                 top: "0px",
//                 right: "0px",
//                 bottom: "0px",
//                 left: "0px",
//               }}
//               onClick={handleClose}
//             />
//             <SketchPicker color={color} onChange={handleChange} />
//           </div>
//         )}
//         <Box className="flex items-center w-full md:w-1/3 lg:w-1/4 xl:w-1/4 z-50 mx-4 my-2">
//           <h6>RemindAt:</h6>
//           <DatePicker
//             selected={remindAt}
//             onChange={(date) => setRemindAt(date)}
//             showTimeSelect
//             dateFormat="Pp"
//           />
//         </Box>
//       </div>

//       <div>
//         <div
//           id="screenshot"
//           ref={stageRef}
//           className="lg:w-[100%-267px] w-[100%-20px]"
//           style={{
//             // width: boardWidth,
//             borderBottom: "1px solid black",
//             borderTop: "1px solid black",
//             height: boardHeight,
//             overflow: "hidden",
//           }}
//         >
//           <Stage
//             width={boardWidth}
//             height={boardHeight}
//             onMouseDown={handleMouseDown}
//             onMouseMove={handleMouseMove}
//             onMouseUp={handleMouseUp}
//           >
//             <Layer>
//               <Rect width={boardWidth} height={boardHeight} fill="white" />
//               {lines.map((line, i) => (
//                 <Line
//                   key={i}
//                   points={line.points}
//                   stroke={line.color}
//                   strokeWidth={line.width}
//                   tension={0.5}
//                   lineCap="round"
//                 />
//               ))}
//             </Layer>
//           </Stage>
//         </div>{" "}
//         <div className="flex items-center justify-center py-2">
//           <Box
//             className="list-button"
//             sx={{
//               width: "fit-content",
//               height: "fit-content",
//               padding: "0 20px",
//               borderRadius: "40px",
//               zIndex: "5",
//               backgroundColor: "#999",
//               display: "flex",
//               color: "text.main",
//               flexDirection: "row",
//               justifyContent: "center",
//             }}
//           >
//             <div style={{ display: "flex", alignItems: "center" }}>
//               <button
//                 className="color-button"
//                 style={{
//                   backgroundColor: "#0000FF",
//                   width: "20px",
//                   height: "20px",
//                   margin: "5px",
//                   borderRadius: "50%",
//                   cursor: "pointer",
//                   border:
//                     selectedColor === "#0000FF"
//                       ? "3px solid #fff"
//                       : "0.5px solid #fff",
//                 }}
//                 onClick={() => handleColorChange("#0000FF")}
//               />
//               <button
//                 className="color-button"
//                 style={{
//                   backgroundColor: "#FF0000",
//                   width: "20px",
//                   height: "20px",
//                   margin: "5px",
//                   borderRadius: "50%",
//                   cursor: "pointer",
//                   border:
//                     selectedColor === "#FF0000"
//                       ? "3px solid #fff"
//                       : "0.5px solid #fff",
//                 }}
//                 onClick={() => handleColorChange("#FF0000")}
//               />
//               <button
//                 className="color-button"
//                 style={{
//                   backgroundColor: "#800080",
//                   width: "20px",
//                   height: "20px",
//                   margin: "5px",
//                   borderRadius: "50%",
//                   cursor: "pointer",
//                   border:
//                     selectedColor === "#800080"
//                       ? "3px solid #fff"
//                       : "0.5px solid #fff",
//                 }}
//                 onClick={() => handleColorChange("#800080")}
//               />
//               <button
//                 className="color-button"
//                 style={{
//                   backgroundColor: "#FFFF00",
//                   width: "20px",
//                   height: "20px",
//                   margin: "5px",
//                   borderRadius: "50%",
//                   cursor: "pointer",
//                   border:
//                     selectedColor === "#FFFF00"
//                       ? "3px solid #fff"
//                       : "0.5px solid #fff",
//                 }}
//                 onClick={() => handleColorChange("#FFFF00")}
//               />
//               <button
//                 className="color-button"
//                 style={{
//                   backgroundColor: "#000000",
//                   width: "20px",
//                   height: "20px",
//                   margin: "5px",
//                   borderRadius: "50%",
//                   cursor: "pointer",
//                   border:
//                     selectedColor === "#000000"
//                       ? "3px solid #fff"
//                       : "0.5px solid #fff",
//                 }}
//                 onClick={() => handleColorChange("#000000")}
//               />
//             </div>
//             <div
//               style={{
//                 marginLeft: "20px",
//                 display: "flex",
//                 alignItems: "center",
//                 height: "80px",
//               }}
//             >
//               <button
//                 style={{
//                   margin: "0",
//                   padding: "0 2px",

//                   cursor: "pointer",
//                   borderColor: "#f2f2f2",

//                   backgroundColor: "#999",
//                   transform: lineWidth === 2 ? "scale(1.1)" : "scale(0.8)",
//                 }}
//                 onClick={() => handleWidthChange(2)}
//               >
//                 1X
//               </button>
//               <button
//                 style={{
//                   margin: "0 10px",
//                   cursor: "pointer",
//                   backgroundColor: "#999",
//                   borderColor: "#f2f2f2",
//                   padding: "0 2px",
//                   transform: lineWidth === 4 ? "scale(1.1)" : "scale(0.8)",
//                 }}
//                 onClick={() => handleWidthChange(4)}
//               >
//                 2X
//               </button>{" "}
//               <button
//                 style={{
//                   margin: "0",
//                   padding: "0 2px",

//                   cursor: "pointer",
//                   backgroundColor: "#999",
//                   borderColor: "#f2f2f2",

//                   transform: lineWidth === 8 ? "scale(1.1)" : "scale(0.8)",
//                 }}
//                 onClick={() => handleWidthChange(8)}
//               >
//                 4X
//               </button>{" "}
//             </div>
//             <div
//               style={{
//                 marginLeft: "20px",
//                 whiteSpace: "nowrap",
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "flex-end",
//               }}
//             >
//               <Button variant="outlined" onClick={handleUndo}>
//                 undo
//               </Button>
//             </div>
//             {/* <div
//               style={{
//                 marginLeft: "10px",
//                 whiteSpace: "nowrap",
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "flex-end",
//               }}
//             >
//               <Button variant="contained" onClick={downloadImage}>
//                 dowload img
//               </Button>
//             </div> */}
//           </Box>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default UserSketch;

import { useState, useContext, useRef, useEffect } from "react";
import { Stage, Layer, Rect, Line } from "react-konva";
import {
  Box,
  TextField,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import Button from "@mui/material/Button";
import api from "../api";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import html2canvas from "html2canvas";
import DatePicker from "react-datepicker";
import useMediaQuery from "@mui/material/useMediaQuery";
import { AppContext } from "../context";

const UserSketch = () => {
  const appContext = useContext(AppContext);
  const { user, setSnackbar } = appContext;
  const [lines, setLines] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("black");
  const [lineWidth, setLineWidth] = useState(2);
  const [selectedColor, setSelectedColor] = useState("black");
  const [isEraserActive, setIsEraserActive] = useState(false);
  const [title, setTitle] = useState("");
  const [remindAt, setRemindAt] = useState(null);
  const [loading, setLoading] = useState(false);
  const [allColor, setAllColor] = useState([]);
  const [widthScreen, setWidthScreen] = useState(() => {
    const initialWidth = window.innerWidth >= 1260 ? 1260 : window.innerWidth;
    return initialWidth;
  });

  const [boardWidth, setBoardWidth] = useState(() => {
    const initialWidth = window.innerWidth >= 1260 ? 1260 : window.innerWidth;
    return initialWidth > 1024 ? initialWidth - 267 : initialWidth - 20;
  });
  const lgScreen = useMediaQuery("(max-width:991px)");
  const [payloadData, setPayloadData] = useState("");
  const [colorNote, setColorNote] = useState({
    r: "255",
    g: "255",
    b: "255",
    a: "1",
  });
  const [displayColorPicker, setDisplayColorPicker] = useState(false);

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

  const updateDimensions = () => {
    let newWidthScreen = window.innerWidth;
    if (newWidthScreen >= 1260) {
      newWidthScreen = 1260;
    }

    setWidthScreen(newWidthScreen);

    const newBoardWidth =
      newWidthScreen > 1024 ? newWidthScreen - 267 : newWidthScreen - 20;
    setBoardWidth(newBoardWidth);
  };

  useEffect(() => {
    updateDimensions(); // Cập nhật chiều rộng ban đầu
    window.addEventListener("resize", updateDimensions); // Cập nhật khi thay đổi kích thước

    return () => {
      window.removeEventListener("resize", updateDimensions);
    };
  }, []);

  const handleMouseDown = (event) => {
    setIsDrawing(true);
    const { offsetX, offsetY } = event.target.getStage().getPointerPosition();
    setLines([
      ...lines,
      {
        points: [offsetX, offsetY],
        color: isEraserActive ? "white" : color,
        width: isEraserActive ? 10 : lineWidth,
      },
    ]);
  };

  const handleMouseMove = (event) => {
    if (!isDrawing) return;

    const stage = event.target.getStage();
    const point = stage.getPointerPosition();
    let lastLine = lines[lines.length - 1];

    if (lastLine) {
      if (!lastLine.points) {
        lastLine.points = [];
      }
      lastLine.points = lastLine.points.concat([point.x, point.y]);
      setLines([...lines.slice(0, lines.length - 1), lastLine]);
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const handleColorChange = (newColor) => {
    setColor(newColor);
    setSelectedColor(newColor);
  };

  const handleWidthChange = (newValue) => {
    setLineWidth(newValue);
  };

  const handleChangeColor = (e) => {
    setColor(e.target.value);
  };

  const handleUndo = () => {
    if (lines.length > 0) {
      setLines(lines.slice(0, -1));
    }
  };

  const outputDate = format(new Date(remindAt), "dd/MM/yyyy HH:mm a '+07:00'");
  const stageRef = useRef(null);

  const uploadImage = async () => {
    try {
      setLoading(true);

      const canvas = await html2canvas(document.getElementById("screenshot"));
      const imageData = canvas.toDataURL("image/png");
      const byteCharacters = atob(imageData.split(",")[1]);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "image/png" });
      const file = new File([blob], "screenshot.png", { type: "image/png" });
      const selectedColor = allColor.find((col) => col.id === color);
      console.log("file", file);

      const payload = {
        type: "image",
        image_note: file,
        title: title,
        r: selectedColor ? parseInt(selectedColor.r) : 255,
        g: selectedColor ? parseInt(selectedColor.g) : 255,
        b: selectedColor ? parseInt(selectedColor.b) : 255,
        a: selectedColor ? 1 : 1,
        content: payloadData,
        remind: outputDate ? outputDate : null,
      };

      const formPayload = new FormData();
      formPayload.append("image_note", file);
      formPayload.append("type", "image");
      formPayload.append("title", payload.title);
      formPayload.append("r", payload.r);
      formPayload.append("g", payload.g);
      formPayload.append("b", payload.b);
      formPayload.append("a", payload.a);
      formPayload.append("content", payload.content);
      if (payload.remind) {
        formPayload.append("remind", payload.remind);
      }

      const response = await fetch(
        `https://samnote.mangasocial.online/new-note-image/${user.id}`,
        {
          method: "POST",
          body: formPayload,
        }
      );

      if (response.ok) {
        setSnackbar({
          isOpen: true,
          message: "Save note successfully ",
          severity: "success",
        });
      } else {
        setSnackbar({
          isOpen: true,
          message: "Failed to save note ",
          severity: "error",
        });
      }
    } catch (error) {
      setSnackbar({
        isOpen: true,
        message: "Failed to save note ",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const boardHeight = 500;

  return (
    <div className="w-full h-auto">
      <div className="flex flex-wrap items-center justify-between px-2 py-3">
        <h3 className="uppercase">sketch note</h3>
        <Button
          className="mx-4"
          variant="contained"
          disabled={loading}
          sx={{ height: "40px", width: "90px" }}
          onClick={uploadImage}
        >
          {loading ? <CircularProgress size={24} /> : "create"}
        </Button>
      </div>
      <div className="flex flex-wrap mb-2 items-center">
        <TextField
          className="w-full md:w-1/3 lg:w-1/4 xl:w-1/4 mx-3 my-2"
          label="Title"
          size="small"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <FormControl className="w-full md:w-1/3 lg:w-1/4 xl:w-1/4 mx-3 my-2">
          <InputLabel id="demo-simple-select-color-label">
            Background-color
          </InputLabel>
          <Select
            labelId="demo-simple-select-color-label"
            id="demo-simple-select-color"
            label="Background-color"
            size="small"
            className="flex flex-row"
            value={color}
            onChange={handleChangeColor}
          >
            {allColor.map((colorOption) => (
              <MenuItem
                key={colorOption.id}
                value={colorOption.id}
                className="flex flex-row"
              >
                <span
                  style={{
                    display: "block",
                    height: "20px",
                    width: "20px",
                    marginRight: "20px",
                    border: "1px solid black",
                    marginLeft: "3px",
                    background: `rgba(${colorOption.r}, ${colorOption.g}, ${colorOption.b})`,
                  }}
                >
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{colorOption.name}
                </span>{" "}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Box className="flex items-center w-full md:w-1/3 lg:w-1/4 xl:w-1/4 z-50 mx-3 my-2">
          <h6>RemindAt:</h6>
          <DatePicker
            selected={remindAt}
            onChange={(date) => setRemindAt(date)}
            showTimeSelect
            dateFormat="Pp"
          />
        </Box>
        <TextField
          className="mx-3 mt-2 w-full"
          id="standard-multiline-static"
          label="Content"
          multiline
          rows={3}
          value={payloadData}
          onChange={(event) => setPayloadData(event.target.value)}
        />
      </div>

      <div>
        <div
          id="screenshot"
          ref={stageRef}
          className="lg:w-[100%-267px] w-[100%]"
          style={{
            borderBottom: "1px solid black",
            borderTop: "1px solid black",
            background: `rgba(${colorNote.r},${colorNote.g},${colorNote.b},${colorNote.a})`,
          }}
        >
          <Stage
            width={boardWidth}
            height={boardHeight}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            <Layer>
              <Rect
                x={0}
                y={0}
                width={boardWidth}
                height={boardHeight}
                fill={`rgba(${colorNote.r},${colorNote.g},${colorNote.b},${colorNote.a})`}
              />
              {lines.map((line, index) => (
                <Line
                  key={index}
                  points={line.points}
                  stroke={line.color}
                  strokeWidth={line.width}
                  tension={0.5}
                  lineCap="round"
                  lineJoin="round"
                />
              ))}
            </Layer>
          </Stage>
        </div>{" "}
        <div className="flex items-center justify-center py-2">
          <Box
            className="list-button"
            sx={{
              width: "fit-content",
              height: "fit-content",
              padding: "0 20px",
              borderRadius: "40px",
              zIndex: "20",
              backgroundColor: "#999",
              display: "flex",
              color: "text.main",
              flexDirection: "row",
              justifyContent: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <button
                className="color-button"
                style={{
                  backgroundColor: "#0000FF",
                  width: "20px",
                  height: "20px",
                  margin: "5px",
                  borderRadius: "50%",
                  cursor: "pointer",
                  border:
                    selectedColor === "#0000FF"
                      ? "3px solid #fff"
                      : "0.5px solid #fff",
                }}
                onClick={() => handleColorChange("#0000FF")}
              />
              <button
                className="color-button"
                style={{
                  backgroundColor: "#FF0000",
                  width: "20px",
                  height: "20px",
                  margin: "5px",
                  borderRadius: "50%",
                  cursor: "pointer",
                  border:
                    selectedColor === "#FF0000"
                      ? "3px solid #fff"
                      : "0.5px solid #fff",
                }}
                onClick={() => handleColorChange("#FF0000")}
              />
              <button
                className="color-button"
                style={{
                  backgroundColor: "#800080",
                  width: "20px",
                  height: "20px",
                  margin: "5px",
                  borderRadius: "50%",
                  cursor: "pointer",
                  border:
                    selectedColor === "#800080"
                      ? "3px solid #fff"
                      : "0.5px solid #fff",
                }}
                onClick={() => handleColorChange("#800080")}
              />
              <button
                className="color-button"
                style={{
                  backgroundColor: "#FFFF00",
                  width: "20px",
                  height: "20px",
                  margin: "5px",
                  borderRadius: "50%",
                  cursor: "pointer",
                  border:
                    selectedColor === "#FFFF00"
                      ? "3px solid #fff"
                      : "0.5px solid #fff",
                }}
                onClick={() => handleColorChange("#FFFF00")}
              />
              <button
                className="color-button"
                style={{
                  backgroundColor: "#000000",
                  width: "20px",
                  height: "20px",
                  margin: "5px",
                  borderRadius: "50%",
                  cursor: "pointer",
                  border:
                    selectedColor === "#000000"
                      ? "3px solid #fff"
                      : "0.5px solid #fff",
                }}
                onClick={() => handleColorChange("#000000")}
              />
            </div>
            <div
              style={{
                marginLeft: "20px",
                display: "flex",
                alignItems: "center",
                height: "80px",
              }}
            >
              <button
                style={{
                  margin: "0",
                  padding: "0 2px",

                  cursor: "pointer",
                  borderColor: "#f2f2f2",

                  backgroundColor: "#999",
                  transform: lineWidth === 2 ? "scale(1.1)" : "scale(0.8)",
                }}
                onClick={() => handleWidthChange(2)}
              >
                1X
              </button>
              <button
                style={{
                  margin: "0 10px",
                  cursor: "pointer",
                  backgroundColor: "#999",
                  borderColor: "#f2f2f2",
                  padding: "0 2px",
                  transform: lineWidth === 4 ? "scale(1.1)" : "scale(0.8)",
                }}
                onClick={() => handleWidthChange(4)}
              >
                2X
              </button>{" "}
              <button
                style={{
                  margin: "0",
                  padding: "0 2px",

                  cursor: "pointer",
                  backgroundColor: "#999",
                  borderColor: "#f2f2f2",

                  transform: lineWidth === 8 ? "scale(1.1)" : "scale(0.8)",
                }}
                onClick={() => handleWidthChange(8)}
              >
                4X
              </button>{" "}
            </div>
            <div
              style={{
                marginLeft: "20px",
                whiteSpace: "nowrap",
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: "10px",
              }}
            >
              <Button
                variant="outlined"
                onClick={() => {
                  handleWidthChange(8);
                  handleColorChange("#fff");
                }}
              >
                delete
              </Button>
              <Button variant="outlined" onClick={handleUndo}>
                undo
              </Button>
            </div>
            {/* <div
              style={{
                marginLeft: "10px",
                whiteSpace: "nowrap",
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
              }}
            >
              <Button variant="contained" onClick={downloadImage}>
                dowload img
              </Button>
            </div> */}
          </Box>
        </div>
      </div>
    </div>
  );
};

export default UserSketch;
