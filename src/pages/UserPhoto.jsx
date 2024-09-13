// import { useContext, useEffect, useState } from "react";
// import { AppContext } from "../context";
// import api from "../api";
// import { Box, Typography, CircularProgress } from "@mui/material";
// import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
// import Tab from "@mui/material/Tab";
// import TabContext from "@mui/lab/TabContext";
// import TabList from "@mui/lab/TabList";
// import TabPanel from "@mui/lab/TabPanel";
// import "slick-carousel/slick/slick.css";
// import "slick-carousel/slick/slick-theme.css";
// import SvgIcon from "@mui/material/SvgIcon";
// import Avatar from "@mui/material/Avatar";
// import { Swiper, SwiperSlide } from "swiper/react";
// import { Pagination } from "swiper/modules";
// import "swiper/css";

// const UserPhoto = () => {
//   const appContext = useContext(AppContext);
//   const { setSnackbar, user } = appContext;

//   const [userInfomations, setUserInformations] = useState(null);
//   const [userNotes, setUserNotes] = useState(null);
//   const archivedNotes = (userNotes || [])
//     .filter((note) => note.inArchived)
//     .reverse();
//   console.log("archivedNotes", archivedNotes);
//   const [value, setValue] = useState("1");
//   const [reload, setReload] = useState(0); // State to trigger updates
//   const [width, setWidth] = useState(window.innerWidth);

//   const deleteNote = async (index) => {
//     try {
//       await api.delete(`https://samnote.mangasocial.online/notes/${index}`);
//       setSnackbar({
//         isOpen: true,
//         message: `Remove note successfully ${index}`,
//         severity: "success",
//       });
//       setReload((prev) => prev + 1); // Update the state to trigger useEffect
//     } catch (err) {
//       console.error(err);
//       setSnackbar({
//         isOpen: true,
//         message: `Failed to remove note ${index}`,
//         severity: "error",
//       });
//     }
//   };

//   function convertUpdate(dateStr) {
//     const dateObj = new Date(dateStr);
//     const day = dateObj.getDate();
//     const month = dateObj.getMonth() + 1;
//     const year = dateObj.getFullYear();
//     return `${day.toString().padStart(2, "0")}/${month
//       .toString()
//       .padStart(2, "0")}/${year}`;
//   }

//   function convertCreate(dateStr) {
//     const [datePart] = dateStr.split(" ");
//     const [year, month, day] = datePart.split("-");
//     return `${day}-${month}-${year}`;
//   }

//   const clickCopy = (link) => {
//     navigator.clipboard
//       .writeText(link)
//       .then(() => {
//         setSnackbar({
//           isOpen: true,
//           message: `Link copied to clipboard`,
//           severity: "success",
//         });
//       })
//       .catch((err) => {
//         setSnackbar({
//           isOpen: true,
//           message: `Link copied failed`,
//           severity: "error",
//         });
//       });
//   };

//   const convertToHttps = (url) => {
//     if (typeof url === "string" && url.startsWith("http://")) {
//       return url.replace("http://", "https://");
//     }
//     return url;
//   };

//   const handleChange = (event, newValue) => {
//     setValue(newValue);
//   };

//   const CurrentDateTime = () => {
//     const [currentDateTime, setCurrentDateTime] = useState("");

//     useEffect(() => {
//       const now = new Date();
//       const dayOfWeek = now.toLocaleString("en-US", { weekday: "long" });
//       const day = now.toLocaleString("en-US", { day: "2-digit" });
//       const month = now.toLocaleString("en-US", { month: "long" });
//       const year = now.getFullYear();

//       setCurrentDateTime(`${dayOfWeek}, ${day} ${month} ${year}`);
//     }, []);

//     return <div className="font-normal text-xl">{currentDateTime}</div>;
//   };

//   const handleResize = () => {
//     let newWidth;
//     if (window.innerWidth > 1024 && window.innerWidth < 1248) {
//       newWidth = window.innerWidth - 275;
//     } else if (window.innerWidth > 1024) {
//       newWidth = 980;
//     } else {
//       newWidth = window.innerWidth - 25;
//     }
//     setWidth(newWidth);
//   };

//   useEffect(() => {
//     handleResize(); // Gọi handleResize lần đầu khi component được mount

//     window.addEventListener("resize", handleResize);

//     // Cleanup event listener on component unmount
//     return () => {
//       window.removeEventListener("resize", handleResize);
//     };
//   }, []);

//   useEffect(() => {
//     let ignore = false;
//     const getUserInformation = async () => {
//       try {
//         const res = await api.get(
//           `https://samnote.mangasocial.online/profile/${user.id}`
//         );
//         if (!ignore) {
//           setUserInformations(res.data.user);
//           const filteredNotes = res.data.note.filter(
//             (note) => note.type === "image"
//           );
//           setUserNotes(filteredNotes);
//           console.log("filteredNotes", filteredNotes);
//         }
//       } catch (err) {
//         console.log(err);
//       }
//     };

//     getUserInformation();
//     const getUserNotes = async () => {
//       try {
//         const res = await api.get(`/listimage/${user.id}`);
//         if (!ignore) {
//           const filteredNotes = res.data.note.filter(
//             (note) => note.type === "image"
//           );
//           setUserNotes(filteredNotes);
//           console.log("filteredNotes", filteredNotes);
//         }
//       } catch (err) {
//         console.log(err);
//       }
//     };
//     getUserNotes;
//     return () => {
//       ignore = true;
//     };
//   }, [user.id, reload]);

//   return (
//     <Box className="bg-zinc-100 w-full">
//       {userInfomations && userInfomations !== null ? (
//         <>
//           <Box className=" relative">
//             <img
//               src={userInfomations.AvtProfile}
//               alt=""
//               className="w-full h-[500px]"
//             />

//             <Typography
//               variant="h4"
//               className="inline-block text-white font-medium absolute right-10 top-10 p-7 rounded-lg"
//             >
//               Hello {userInfomations.name} !
//               <CurrentDateTime />
//             </Typography>
//           </Box>
//           <Box className="flex items-center gap-8 w-10/12 mx-auto my-3 ">
//             <img
//               src={userInfomations.Avarta}
//               alt=""
//               className="w-28 h-28 rounded-full"
//             />
//             <Box>
//               <Typography variant="h5" className="uppercase font-bold">
//                 {userInfomations.name}
//               </Typography>
//               <Typography className="text-xl">
//                 {userInfomations.gmail}
//               </Typography>
//             </Box>
//           </Box>
//           <Box className="flex">
//             <Box className="flex-[4]">
//               {archivedNotes.length > 0 ? (
//                 <>
//                   <div
//                     style={{
//                       display: "flex",
//                       alignItems: "center",
//                       justifyContent: "space-between",
//                       margin: "10px 10px 0px 20px",
//                       padding: "10px 0px 0 10px",
//                     }}
//                   >
//                     <Box component="h3" sx={{ color: "text.main" }}>
//                       NOTE IMAGE
//                     </Box>
//                     <MoreHorizIcon
//                       sx={{ cursor: "pointer", color: "text.main" }}
//                     />
//                   </div>
//                   <TabContext value={value}>
//                     <Box
//                       sx={{
//                         borderBottom: 1,
//                         borderColor: "divider",
//                         marginBottom: "24px",
//                       }}
//                     >
//                       <TabList
//                         onChange={handleChange}
//                         aria-label="lab API tabs example"
//                       >
//                         <Tab label="Resent" value="1" />
//                         <Tab label="Recommended" value="2" />
//                       </TabList>
//                     </Box>
//                     <TabPanel
//                       value="1"
//                       sx={{ maxWidth: `${width}px`, padding: 0 }}
//                     >
//                       <Swiper
//                         spaceBetween={10}
//                         slidesPerView={1}
//                         navigation
//                         pagination={{
//                           clickable: true,
//                         }}
//                         breakpoints={{
//                           551: {
//                             slidesPerView: 2,
//                           },
//                           768: {
//                             slidesPerView: 2,
//                           },
//                         }}
//                         modules={[Pagination]}
//                       >
//                         {archivedNotes &&
//                           archivedNotes.map((info, index) => (
//                             <SwiperSlide
//                               key={index}
//                               className="p-2 border-[1px] rounded-xl border-black border-solid"
//                               style={{
//                                 backgroundColor: `rgba(${info.color.r}, ${info.color.g}, ${info.color.b}, ${info.color.a})`,
//                               }}
//                             >
//                               <div
//                                 style={{
//                                   display: "flex",
//                                   margin: "10px 20px",
//                                   alignItems: "center",
//                                   justifyContent: "space-between",
//                                 }}
//                               >
//                                 <div
//                                   style={{
//                                     display: "flex",
//                                     alignItems: "center",
//                                     justifyContent: "center",
//                                     padding: " 10px 0",
//                                   }}
//                                 >
//                                   <Avatar
//                                     style={{
//                                       height: "45px",
//                                       width: "45px",
//                                       marginRight: "10px",
//                                       objectFit: "cover",
//                                     }}
//                                     src={userInfomations.Avarta}
//                                     alt=""
//                                   />
//                                   <Box sx={{ color: "text.main" }}>
//                                     <p style={{ margin: 0 }}>
//                                       <strong>{userInfomations.name}</strong>
//                                     </p>
//                                     <p style={{ margin: 0 }}>
//                                       {" "}
//                                       Create at {convertCreate(
//                                         info.createAt
//                                       )}{" "}
//                                     </p>
//                                   </Box>
//                                 </div>
//                                 <div className=" flex items-center">
//                                   <div
//                                     className=" flex items-center"
//                                     onClick={() =>
//                                       clickCopy(info.linkNoteShare)
//                                     }
//                                   >
//                                     <SvgIcon
//                                       width="48"
//                                       height="48"
//                                       viewBox="0 0 48 48"
//                                       fill="none"
//                                       xmlns="http://www.w3.org/2000/svg"
//                                     >
//                                       <path
//                                         d="M42 24L28 10V18C14 20 8 30 6 40C11 33 18 29.8 28 29.8V38L42 24Z"
//                                         fill="black"
//                                       />
//                                     </SvgIcon>
//                                   </div>
//                                   <SvgIcon
//                                     onClick={() => deleteNote(info.idNote)}
//                                     sx={{
//                                       color: "#fff",
//                                       marginLeft: "10px",
//                                     }}
//                                     width="24"
//                                     height="24"
//                                     viewBox="0 0 24 24"
//                                     fill="none"
//                                     xmlns="http://www.w3.org/2000/svg"
//                                   >
//                                     <path
//                                       d="M1.71429 6H22.2857"
//                                       stroke="black"
//                                       strokeWidth="2"
//                                       strokeLinecap="round"
//                                       strokeLinejoin="round"
//                                     />
//                                     <path
//                                       d="M4.28571 6H19.7143V21.4286C19.7143 21.8832 19.5336 22.3193 19.2122 22.6407C18.8907 22.9622 18.4546 23.1429 18 23.1429H5.99999C5.54533 23.1429 5.1093 22.9622 4.7878 22.6407C4.46632 22.3193 4.28571 21.8832 4.28571 21.4286V6Z"
//                                       stroke="black"
//                                       strokeWidth="2"
//                                       strokeLinecap="round"
//                                       strokeLinejoin="round"
//                                     />
//                                     <path
//                                       d="M7.71429 6V5.14286C7.71429 4.00622 8.16582 2.91612 8.96955 2.1124C9.77327 1.30868 10.8634 0.857147 12 0.857147C13.1366 0.857147 14.2267 1.30868 15.0305 2.1124C15.8342 2.91612 16.2857 4.00622 16.2857 5.14286V6"
//                                       stroke="black"
//                                       strokeWidth="2"
//                                       strokeLinecap="round"
//                                       strokeLinejoin="round"
//                                     />
//                                     <path
//                                       d="M9.42859 11.1454V18.0051"
//                                       stroke="black"
//                                       strokeWidth="2"
//                                       strokeLinecap="round"
//                                       strokeLinejoin="round"
//                                     />
//                                     <path
//                                       d="M14.5714 11.1454V18.0051"
//                                       stroke="black"
//                                       strokeWidth="2"
//                                       strokeLinecap="round"
//                                       strokeLinejoin="round"
//                                     />
//                                   </SvgIcon>
//                                 </div>
//                               </div>
//                               <Box
//                                 component="div"
//                                 sx={{
//                                   color: "text.main",
//                                   margin: "10px 10px 0px",
//                                   height: "80px",
//                                   overflow: "hidden",
//                                 }}
//                               >
//                                 <strong style={{ fontSize: "20px" }}>
//                                   {info.title}
//                                 </strong>
//                                 <div
//                                   style={{ marginTop: "10px" }}
//                                   dangerouslySetInnerHTML={{
//                                     __html: info.data,
//                                   }}
//                                 />
//                               </Box>
//                               <Swiper
//                                 spaceBetween={0}
//                                 slidesPerView={
//                                   info.image.length === 1 ? 1 : 1.1
//                                 }
//                                 navigation
//                                 onSlideChange={() =>
//                                   console.log("slide change")
//                                 }
//                                 onSwiper={(swiper) => console.log(swiper)}
//                               >
//                                 {info.image &&
//                                   info.image.map((linkImg, index) => (
//                                     <SwiperSlide key={index}>
//                                       {" "}
//                                       <img
//                                         style={{
//                                           height: "200px",
//                                           objectFit: "cover",
//                                           width: "100%",
//                                         }}
//                                         src={convertToHttps(linkImg.link)}
//                                         alt=""
//                                       />
//                                     </SwiperSlide>
//                                   ))}
//                               </Swiper>
//                               <Box
//                                 component="div"
//                                 sx={{
//                                   color: "text.secondary",
//                                   textAlign: "end",
//                                   padding: "0 10px 0 0",
//                                 }}
//                               >
//                                 <p style={{ margin: 0 }}>
//                                   Last edit at {convertUpdate(info.updateAt)}
//                                 </p>

//                                 <Box
//                                   component="div"
//                                   sx={{
//                                     display: "flex",
//                                     alignItems: "center",
//                                     color: "text.main",
//                                     justifyContent: "flex-end",
//                                   }}
//                                 ></Box>
//                               </Box>
//                             </SwiperSlide>
//                           ))}
//                       </Swiper>
//                     </TabPanel>
//                     <TabPanel value="2" sx={{ width: "100%", padding: 0 }}>
//                       tab2
//                     </TabPanel>
//                   </TabContext>
//                 </>
//               ) : (
//                 <Box className="bg-white p-4 rounded-lg">
//                   <Typography
//                     variant="h5"
//                     className="font-semibold text-center"
//                   >
//                     No note to show
//                   </Typography>
//                 </Box>
//               )}
//             </Box>
//           </Box>
//         </>
//       ) : (
//         <div className="w-full h-full flex items-center justify-center">
//           {" "}
//           <CircularProgress size={30} />
//         </div>
//       )}
//     </Box>
//   );
// };

// export default UserPhoto;
import { useContext, useEffect, useState } from "react";
import { AppContext } from "../context";
import api from "../api";
import { Box, Typography, CircularProgress } from "@mui/material";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import SvgIcon from "@mui/material/SvgIcon";
import Avatar from "@mui/material/Avatar";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";

const UserPhoto = () => {
  const appContext = useContext(AppContext);
  const { user } = appContext;
  const [selectedFiles, setSelectedFiles] = useState([]);
  const convertToHttps = (url) => {
    if (typeof url === "string" && url.startsWith("http://")) {
      return url.replace("http://", "https://");
    }
    return url;
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(
          `https://samnote.mangasocial.online/profile/image_history/${user.id}`
        );
        setSelectedFiles(res.data);
        console.log("image", selectedFiles);
      } catch (err) {
        console.log(err);
      }
    };

    fetchData();
  }, [user.id]);

  return (
    <Box className="flex flex-col">
      {selectedFiles &&
        [...selectedFiles].map((info, index) => (
          <div key={index} className="mb-4 p-3">
            <h4 className="font-semibold mb-2">{info.time}</h4>
            <div className="grid grid-cols-4 gap-4">
              {info.image.map((img, imgIndex) => (
                <img
                  key={imgIndex}
                  src={img.image} // Assuming img.image is the correct path
                  alt={`Image ${imgIndex + 1}`}
                  className={
                    img.type == "image"
                      ? "w-full h-[130px] object-cover rounded-lg border-2 border-r-indigo-500 border-solid"
                      : "w-full h-[130px] object-cover rounded-lg"
                  }
                />
              ))}
            </div>
          </div>
        ))}
    </Box>
  );
};

export default UserPhoto;
