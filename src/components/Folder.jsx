// import { useState, useEffect, useContext } from "react";
// import {
//   Box,
//   Button,
//   TextField,
//   CircularProgress,
//   MenuItem,
// } from "@mui/material";
// import api from "../api";
// import ModeEditIcon from "@mui/icons-material/ModeEdit";
// import DeleteIcon from "@mui/icons-material/Delete";
// import { AppContext } from "../context";

// const Folder = (setReloadfunction) => {
//   const [folders, setFolders] = useState([]);
//   const [showInputBox, setShowInputBox] = useState(false);
//   const [loadingCreateFolder, setLoadingCreateFolder] = useState(false);
//   const [folderName, setFolderName] = useState("");
//   const [resultMessage, setResultMessage] = useState(null);
//   const [reload, setReload] = useState(0);
//   const [reloadfs, setReloadfs] = useState(0);
//   const [loadingRename, setLoadingRename] = useState(false);
//   const [newFolderName, setNewFolderName] = useState("");
//   const [folderIdToRename, setFolderIdToRename] = useState(null);

//   const appContext = useContext(AppContext);
//   const { user } = appContext;

//   useEffect(() => {
//     fetchFolders();
//   }, [reload, reloadfs]);

//   const fetchFolders = async () => {
//     try {
//       const res = await api.get(`/allfolder/${user.id}`);
//       setFolders(res.data.folder.reverse());
//     } catch (err) {
//       console.log(err);
//     }
//   };

//   const handleCreateFolder = async () => {
//     if (!folderName.trim()) {
//       setResultMessage("Please enter a folder name");
//       return;
//     }
//     try {
//       setLoadingCreateFolder(true);
//       const response = await api.post(`/folder/${user.id}`, {
//         nameFolder: folderName,
//       });
//       setResultMessage(response.data.message);
//       setReloadfs((prev) => prev + 1);
//       setFolderName("");
//     } catch (error) {
//       console.error("Error creating folder:", error);
//       alert("Error creating folder.");
//     } finally {
//       setLoadingCreateFolder(false);
//     }
//   };

//   const handleDeleteFolder = async (folderId) => {
//     try {
//       await api.delete(`/changefolder/${folderId}`);
//       setReload((prev) => prev + 1);
//       setResultMessage("Create folder is success");
//     } catch (error) {
//       console.error("Error deleting folder:", error);
//       alert("Error deleting folder.");
//     }
//   };

//   const handleRenameFolder = async () => {
//     if (!newFolderName.trim()) {
//       setResultMessage("Please enter a new folder name");
//       return;
//     }
//     try {
//       setLoadingRename(true);
//       const response = await api.patch(`/changefolder/${folderIdToRename}`, {
//         nameFolder: newFolderName,
//       });
//       setResultMessage("Rename folder success");
//       setReload((prev) => prev + 1);
//       setFolderIdToRename(null);
//       setNewFolderName("");
//     } catch (error) {
//       console.error("Error renaming folder:", error);
//       alert("Error renaming folder.");
//     } finally {
//       setLoadingRename(false);
//     }
//   };

//   const handleOpenRenameInput = (folderId, currentName) => {
//     setFolderIdToRename(folderId);
//     setNewFolderName(currentName);
//   };

//   return (
//     <div>
//       <MenuItem onClick={() => setShowInputBox(true)} className="font-semibold">
//         + create new folder
//       </MenuItem>
//       {showInputBox && (
//         <div className="fixed h-screen w-screen flex items-center justify-center inset-0 bg-[rgba(0,0,0,0.9)]">
//           <div className="bg-white w-[300px] h-[400px] flex items-center justify-between flex-col rounded-md overflow-auto p-4">
//             <span
//               className="fixed bg-white top-3 right-3 p-2 rounded-md cursor-pointer"
//               onClick={() => {
//                 setShowInputBox(false);
//                 setReloadfunction((prev) => prev + 1);
//               }}
//             >
//               {" "}
//               close
//             </span>
//             <div className="mb-4">
//               <TextField
//                 label="Folder Name"
//                 type="text"
//                 value={folderName}
//                 onChange={(e) => setFolderName(e.target.value)}
//                 placeholder="Enter Folder Name"
//                 fullWidth
//               />
//               {resultMessage !== null && (
//                 <Box className="fixed inset-0 z-50 bg-[rgba(0,0,0,0.4)] flex items-center justify-center flex-col">
//                   <Box className="flex relative items-center justify-center bg-white h-[120px] w-[500px] pb-[50px] rounded-lg">
//                     {resultMessage}
//                     <Button
//                       className="absolute bottom-0"
//                       variant="contained"
//                       sx={{ margin: "10px" }}
//                       onClick={() => setResultMessage(null)}
//                     >
//                       OK
//                     </Button>
//                   </Box>
//                 </Box>
//               )}
//             </div>
//             <Button
//               disabled={loadingCreateFolder}
//               variant="contained"
//               onClick={handleCreateFolder}
//             >
//               {loadingCreateFolder ? <CircularProgress size={24} /> : "Create"}
//             </Button>
//             <div className="mt-4 w-full">
//               {folders.map((folder) => (
//                 <div
//                   key={folder.id}
//                   className="flex items-center justify-between p-2 rounded-md bg-gray-100 hover:bg-gray-200"
//                 >
//                   <div>{folder.nameFolder}</div>
//                   <div>
//                     <ModeEditIcon
//                       onClick={() =>
//                         handleOpenRenameInput(folder.id, folder.nameFolder)
//                       }
//                       className="cursor-pointer"
//                     />
//                     <DeleteIcon
//                       onClick={() => handleDeleteFolder(folder.id)}
//                       className="cursor-pointer ml-2"
//                     />
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       )}
//       {folderIdToRename && (
//         <div className="fixed h-screen w-screen flex items-center justify-center inset-0 bg-[rgba(0,0,0,0.9)]">
//           <div className="bg-white w-[300px] h-[200px] flex items-center justify-center flex-col rounded-md p-4">
//             <TextField
//               label="New Folder Name"
//               type="text"
//               value={newFolderName}
//               onChange={(e) => setNewFolderName(e.target.value)}
//               placeholder="Enter New Folder Name"
//               fullWidth
//             />
//             <div className="mt-4 w-full">
//               <Button
//                 disabled={loadingRename}
//                 variant="outlined"
//                 onClick={() => setFolderIdToRename(null)}
//               >
//                 cancel
//               </Button>
//               <Button
//                 disabled={loadingRename}
//                 variant="contained"
//                 onClick={handleRenameFolder}
//               >
//                 {loadingRename ? <CircularProgress size={24} /> : "Rename"}
//               </Button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Folder;
import React, { useState, useEffect, useContext } from "react";
import {
  Box,
  Button,
  TextField,
  CircularProgress,
  MenuItem,
} from "@mui/material";
import api from "../api";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import DeleteIcon from "@mui/icons-material/Delete";
import { AppContext } from "../context";

const Folder = ({ setReloadfunction }) => {
  const [folders, setFolders] = useState([]);
  const [showInputBox, setShowInputBox] = useState(false);
  const [loadingCreateFolder, setLoadingCreateFolder] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [resultMessage, setResultMessage] = useState(null);
  const [reload, setReload] = useState(0);
  const [reloadfs, setReloadfs] = useState(0);
  const [loadingRename, setLoadingRename] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [folderIdToRename, setFolderIdToRename] = useState(null);

  const appContext = useContext(AppContext);
  const { user } = appContext;

  useEffect(() => {
    fetchFolders();
  }, [reload, reloadfs]);

  const fetchFolders = async () => {
    try {
      const res = await api.get(`/allfolder/${user.id}`);
      setFolders(res.data.folder.reverse());
      setReloadfunction((prev) => prev + 1);
    } catch (err) {
      console.log(err);
    }
  };

  const handleCreateFolder = async () => {
    if (!folderName.trim()) {
      setResultMessage("Please enter a folder name");
      return;
    }
    try {
      setLoadingCreateFolder(true);
      const response = await api.post(`/folder/${user.id}`, {
        nameFolder: folderName,
      });
      setResultMessage(response.data.message);
      setReloadfs((prev) => prev + 1);
      setFolderName("");
    } catch (error) {
      console.error("Error creating folder:", error);
      alert("Error creating folder.");
    } finally {
      setLoadingCreateFolder(false);
    }
  };

  const handleDeleteFolder = async (folderId) => {
    try {
      await api.delete(`/changefolder/${folderId}`);
      setReload((prev) => prev + 1);
      setResultMessage("Create folder is success");
    } catch (error) {
      console.error("Error deleting folder:", error);
      alert("Error deleting folder.");
    }
  };

  const handleRenameFolder = async () => {
    if (!newFolderName.trim()) {
      setResultMessage("Please enter a new folder name");
      return;
    }
    try {
      setLoadingRename(true);
      const response = await api.patch(`/changefolder/${folderIdToRename}`, {
        nameFolder: newFolderName,
      });
      setResultMessage("Rename folder success");
      setReload((prev) => prev + 1);
      setFolderIdToRename(null);
      setNewFolderName("");
    } catch (error) {
      console.error("Error renaming folder:", error);
      alert("Error renaming folder.");
    } finally {
      setLoadingRename(false);
    }
  };

  const handleOpenRenameInput = (folderId, currentName) => {
    setFolderIdToRename(folderId);
    setNewFolderName(currentName);
  };

  return (
    <div>
      <MenuItem onClick={() => setShowInputBox(true)} className="font-semibold">
        + create new folder
      </MenuItem>
      {showInputBox && (
        <div className="fixed h-screen w-screen flex items-center justify-center inset-0 bg-[rgba(0,0,0,0.1)]">
          <div className=" bg-[#3A3F42] w-[300px] h-[400px] flex items-center justify-between flex-col rounded-md overflow-auto p-4">
            <div className="mb-4">
              <TextField
                className="bg-white rounded-1"
                label="Folder Name"
                type="text"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                placeholder="Enter Folder Name"
                fullWidth
              />
              {resultMessage !== null && (
                <Box className="fixed inset-0 z-50 bg-[rgba(0,0,0,0.4)] flex items-center justify-center flex-col">
                  <Box className="flex relative items-center justify-center bg-white h-[120px] w-[500px] pb-[50px] rounded-lg">
                    {resultMessage}
                    <Button
                      className="absolute bottom-0"
                      variant="contained"
                      sx={{ margin: "10px" }}
                      onClick={() => setResultMessage(null)}
                    >
                      OK
                    </Button>
                  </Box>
                </Box>
              )}
            </div>

            <div>
              <Button
                className="mr-2 border-[1px] border-white border-solid text-white"
                // variant="outlined"
                onClick={() => {
                  setShowInputBox(false);
                }}
              >
                close
              </Button>
              <Button
                disabled={loadingCreateFolder}
                className="mr-2 border-[1px] border-white border-solid text-white"
                // variant="contained"
                onClick={handleCreateFolder}
              >
                {loadingCreateFolder ? (
                  <CircularProgress size={24} />
                ) : (
                  "Create"
                )}
              </Button>
            </div>
            <div className="mt-4 w-full">
              {folders.map((folder) => (
                <div
                  key={folder.id}
                  className="flex items-center justify-between p-2 mt-1 rounded-md bg-gray-100 hover:bg-gray-200"
                >
                  <div>{folder.nameFolder}</div>
                  <div>
                    <ModeEditIcon
                      onClick={() =>
                        handleOpenRenameInput(folder.id, folder.nameFolder)
                      }
                      className="cursor-pointer"
                    />
                    <DeleteIcon
                      onClick={() => handleDeleteFolder(folder.id)}
                      className="cursor-pointer ml-2"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {folderIdToRename && (
        <div className="fixed h-screen w-screen flex items-center justify-center inset-0 bg-[rgba(0,0,0,0.9)]">
          <div className="bg-white w-[300px] h-[200px] flex items-center justify-center flex-col rounded-md p-4">
            <TextField
              label="New Folder Name"
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Enter New Folder Name"
              fullWidth
            />
            <div className="mt-4 w-full">
              <Button
                disabled={loadingRename}
                variant="outlined"
                onClick={() => setFolderIdToRename(null)}
              >
                cancel
              </Button>
              <Button
                disabled={loadingRename}
                variant="contained"
                onClick={handleRenameFolder}
              >
                {loadingRename ? <CircularProgress size={24} /> : "Rename"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Folder;
