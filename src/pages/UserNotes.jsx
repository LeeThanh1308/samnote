import EditNoteIcon from '@mui/icons-material/EditNote'
import { Editor } from '@tinymce/tinymce-react'
import { useState, useContext, useEffect } from 'react'
import SearchIcon from '@mui/icons-material/Search'
import {
 Box,
 Button,
 Checkbox,
 FormControl,
 FormControlLabel,
 InputLabel,
 IconButton,
 MenuItem,
 Select,
 TextField,
 CircularProgress,
} from '@mui/material'
import { useParams, useLocation } from 'react-router-dom'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious'
import api from '../api'
import { AppContext } from '../context'
import { format } from 'date-fns'
import Folder from '../components/Folder'
import SkipNextIcon from '@mui/icons-material/SkipNext'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import CloseIcon from '@mui/icons-material/Close'

import { Navigation } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'
// Import Swiper styles
import 'swiper/css'
import './createnote.css'
import 'swiper/css/navigation'

const Checklist = ({ data }) => {
 const [items, setItems] = useState([])

 useEffect(() => {
  setItems(data)
 }, [data])

 const handleChange = (index) => {
  const updatedItems = [...items]
  updatedItems[index].status = !updatedItems[index].status
  setItems(updatedItems)
 }

 return (
  <div>
   {items.map((item, index) => (
    <div key={index}>
     <input
      style={{ marginRight: '5px' }}
      type='checkbox'
      checked={item.status}
      onChange={() => handleChange(index)}
     />
     {item.content}
    </div>
   ))}
  </div>
 )
}

const notePublicOptions = ['private', 'public']
const ChecklistComponent = ({ checklistItems, setChecklistItems, data }) => {
 const [newItem, setNewItem] = useState('')

 useEffect(() => {
  if (data) {
   setChecklistItems(data)
  }
 }, [data, setChecklistItems])

 const handleAddItem = () => {
  if (newItem.trim()) {
   setChecklistItems([...checklistItems, { content: newItem, status: false }])
   setNewItem('')
  }
 }

 const handleToggleItem = (index) => {
  const updatedItems = checklistItems.map((item, idx) =>
   idx === index ? { ...item, status: !item.status } : item
  )
  setChecklistItems(updatedItems)
 }

 const handleDeleteItem = (index) => {
  const updatedItems = checklistItems.filter((_, idx) => idx !== index)
  setChecklistItems(updatedItems)
 }

 return (
  <div className='w-full p-2'>
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
   <div className='flex items-center pl-4'>
    <input
     type='text'
     style={{ height: '40px' }}
     value={newItem}
     onChange={(e) => setNewItem(e.target.value)}
     placeholder='  Add a new list item'
    />
    <span onClick={handleAddItem}>
     <AddIcon />
    </span>
   </div>
  </div>
 )
}

export default function UserNotes() {
 const [type, setType] = useState('') // Add state for type
 const [title, setTitle] = useState('')
 const [idFolder, setIdFolder] = useState(null)
 const [dueAt, setDueAt] = useState(null)
 const [pinned, setPinned] = useState(false)
 const [lock, setLock] = useState('')
 const [remindAt, setRemindAt] = useState(null)
 const [data, setData] = useState('')
 const [image, setImage] = useState([])
 const [notePublic, setNotePublic] = useState(0)
 const [color, setColor] = useState({ r: '255', g: '255', b: '255', a: '1' })
 const [folder, setUserFolder] = useState([])
 const [note, setUserNote] = useState([])
 const [checklistItems, setChecklistItems] = useState([])
 const [noteEdit, setNoteEdit] = useState(null)
 const [updateTrigger, setUpdateTrigger] = useState(0)
 const [allColor, setAllColor] = useState([])
 const [reload, setReload] = useState(0)
 const [currentPage, setCurrentPage] = useState(1)
 const appContext = useContext(AppContext)
 const [selectedFiles, setSelectedFiles] = useState([])
 const [selectedForDeletion, setSelectedForDeletion] = useState([])
 const [checkWidth, setCheckWidth] = useState(window.innerWidth - 330)
 const { user, setSnackbar } = appContext
 const [loading, setLoading] = useState(false)
 const params = useParams()
 if (noteEdit) {
  params.id = noteEdit.idNote
 }
 console.log('params.id', params.id)
 console.log('noteEdit', noteEdit)
 useEffect(() => {
  let ignore = false
  const getUserFolder = async () => {
   try {
    const res = await api.get(
     `https://samnote.mangasocial.online/allfolder/${user.id}`
    )
    if (!ignore) {
     setUserFolder(res.data.folder.reverse())
     console.log('Folder', folder)
    }
   } catch (err) {
    console.log(err)
   }
  }

  getUserFolder()

  return () => {
   ignore = true
  }
 }, [user.id, reload])

 const handleSelectForDeletion = (file) => {
  setSelectedForDeletion((prevSelection) =>
   prevSelection.includes(file)
    ? prevSelection.filter((f) => f !== file)
    : [...prevSelection, file]
  )
 }

 const handleDeleteImage = (file) => {
  setSelectedFiles((prevFiles) => prevFiles.filter((f) => f !== file))
  URL.revokeObjectURL(file) // Giải phóng tài nguyên
 }

 const updateCheckWidth = () => {
  if (window.innerWidth > 1200) {
   setCheckWidth(600)
  } else if (window.innerWidth > 1024) {
   setCheckWidth(window.innerWidth - 330)
  } else {
   setCheckWidth(window.innerWidth - 60)
  }
 }

 // Sử dụng useEffect để lắng nghe sự kiện resize của cửa sổ
 useEffect(() => {
  // Cập nhật giá trị ngay lập tức khi component được render
  updateCheckWidth()

  // Thêm event listener khi component được mount
  window.addEventListener('resize', updateCheckWidth)

  // Cleanup event listener khi component bị unmount
  return () => {
   window.removeEventListener('resize', updateCheckWidth)
  }
 }, [])
 const handleImageChange = (event) => {
  const files = Array.from(event.target.files)

  // Cập nhật danh sách các file đã chọn
  setSelectedFiles((prevFiles) => [...prevFiles, ...files])
 }

 useEffect(() => {
  const getUserNote = async () => {
   try {
    const res = await api.get(`/notes/${user.id}?page=${currentPage}`)
    console.log(`notes/${user.id}?page=${currentPage}`)
    console.log('res', res.data)

    setUserNote(res.data.notes)
   } catch (err) {
    console.log(err)
   }
  }

  getUserNote()
 }, [user.id, updateTrigger, currentPage])

 const handleReload = () => {
  setReload((prev) => prev + 1)
 }

 useEffect(() => {
  const getAllColor = async () => {
   try {
    const res = await api.get(`get_all_color`)
    setAllColor(res.data.data)
    console.log('User color', res.data.data)
   } catch (err) {
    console.error('Failed to fetch colors:', err)
   }
  }

  getAllColor()
 }, [])

 const handleChangeNotePublic = (e) => {
  setNotePublic(e.target.value)
 }

 const handleEditorChange = (content) => {
  setData(content)
 }

 const handleColorChange = (e) => {
  setColor(e.target.value)
 }

 const handleSubmit = async (value) => {
  const payloadData = type === 'text' ? data : checklistItems
  const selectedColor = allColor.find((col) => col.id === color)
  console.log('selectedColor', selectedColor)
  const parsedColor = {
   r: parseInt(selectedColor.r),
   g: parseInt(selectedColor.g),
   b: parseInt(selectedColor.b),
   a: 1,
  }

  const payload = {
   type,
   data: payloadData,
   title,
   color: parsedColor,
   idFolder,
   dueAt: format(new Date(dueAt), "dd/MM/yyyy HH:mm a '+07:00'"),
   pinned,
   lock,
   remindAt: remindAt
    ? format(new Date(remindAt), "dd/MM/yyyy HH:mm a '+07:00'")
    : null,
   linkNoteShare: '',
   notePublic,
  }

  try {
   await api.patch(`/notes/${value}`, payload)
   const formPayload = new FormData()
   selectedFiles.forEach((file) => {
    formPayload.append('image_note', file)
   })
   formPayload.append('id_note', value)
   formPayload.append('id_user', user.id)
   const respon = await fetch(
    `https://samnote.mangasocial.online/add_image_note`,
    {
     method: 'POST',
     body: formPayload,
    }
   )
   setSnackbar({
    isOpen: true,
    message: 'Update note successfully ',
    severity: 'success',
   })

   setUpdateTrigger((prev) => prev + 1) // Trigger the useEffect to fetch notes again
   console.log('payload', payload)
  } catch (err) {
   console.error(err)
   const errorMessage = err.response?.data?.message
   setSnackbar({
    isOpen: true,
    message: errorMessage,
    severity: 'error',
   })
  }
 }

 const deleteNote = async (index) => {
  try {
   await api.delete(`https://samnote.mangasocial.online/notes/${index}`)
   setSnackbar({
    isOpen: true,
    message: `Remove note successfully ${index}`,
    severity: 'success',
   })
   console.log('index', index)
   setUpdateTrigger((prev) => prev + 1) // Update the state to trigger useEffect
  } catch (err) {
   console.error(err)
   setSnackbar({
    isOpen: true,
    message: `Failed to remove note ${index}`,
    severity: 'error',
   })
  }
 }

 const handleDeleteSelected = () => {
  setSelectedFiles((prevFiles) =>
   prevFiles.filter((f) => !selectedForDeletion.includes(f))
  )
  selectedForDeletion.forEach((file) => URL.revokeObjectURL(file)) // Giải phóng tài nguyên
  setSelectedForDeletion([]) // Xóa danh sách chọn
 }

 const deleteImageNote = async (imageId) => {
  try {
   const formPayload = new FormData()
   formPayload.append('id_images[]', imageId)

   formPayload.append('id_note', noteEdit.idNote)
   formPayload.append('id_user', user.id)

   await fetch(`https://samnote.mangasocial.online/delete_image_note`, {
    method: 'POST',
    body: formPayload,
   })

   setSnackbar({
    isOpen: true,
    message: `Remove image successfully`,
    severity: 'success',
   })

   // Cập nhật mảng hình ảnh, loại bỏ phần tử dựa trên `id`
   setImage((prevImages) => prevImages.filter((image) => image.id !== imageId))

   setUpdateTrigger((prev) => prev + 1) // Trigger useEffect to re-fetch data
  } catch (err) {
   console.error(err)
   setSnackbar({
    isOpen: true,
    message: `Failed to remove note ${imageId}`,
    severity: 'error',
   })
  }
 }

 const Pagination = ({ totalPage }) => {
  const handlePageClick = (page) => {
   setCurrentPage(page)
  }

  const renderPages = () => {
   let pages = []

   // Always show the first page
   pages.push(
    <button
     key={1}
     onClick={() => handlePageClick(1)}
     style={{
      fontWeight: currentPage === 1 ? 'bold' : 'normal',
      width: '20px',
      border: 'none',
      borderRadius: '2px',
      margin: '0 3px',
      backgroundColor: '#fff',
     }}
    >
     1
    </button>
   )

   if (currentPage > 3 && currentPage < totalPage) {
    // Show ellipsis after the first page
    pages.push(<span key='start-ellipsis'>...</span>)

    // Show the current page
    pages.push(
     <button
      key={currentPage}
      onClick={() => handlePageClick(currentPage)}
      style={{
       fontWeight: 'bold',
       width: '20px',
       border: 'none',
       backgroundColor: '#fff',
       borderRadius: '2px',
       margin: '0 3px',
      }}
     >
      {currentPage}
     </button>
    )

    // Show ellipsis before the last page
    pages.push(<span key='end-ellipsis'>...</span>)
   } else if (currentPage >= totalPage - 1) {
    // If on last page or second to last page, show pages before the last page
    pages.push(
     <button
      key={totalPage - 1}
      onClick={() => handlePageClick(totalPage - 1)}
      style={{
       fontWeight: currentPage === totalPage - 1 ? 'bold' : 'normal',
       width: '20px',
       backgroundColor: '#fff',
       border: 'none',
       borderRadius: '2px',
       margin: '0 3px',
      }}
     >
      {totalPage - 1}
     </button>
    )
   } else {
    // Show pages 2 and 3 if currentPage <= 3
    for (let i = 2; i <= 3; i++) {
     pages.push(
      <button
       key={i}
       onClick={() => handlePageClick(i)}
       style={{
        fontWeight: currentPage === i ? 'bold' : 'normal',
        width: '20px',
        border: 'none',
        borderRadius: '2px',
        backgroundColor: '#fff',
        margin: '0 3px',
       }}
      >
       {i}
      </button>
     )
    }

    // Show ellipsis before the last page if total pages > 3
    if (totalPage > 3) {
     pages.push(<span key='ellipsis'>...</span>)
    }
   }

   // Always show the last page
   pages.push(
    <button
     key={totalPage}
     onClick={() => handlePageClick(totalPage)}
     style={{
      fontWeight: currentPage === totalPage ? 'bold' : 'normal',
      width: '20px',
      backgroundColor: '#fff',
      border: 'none',
      borderRadius: '2px',
      margin: '0 3px',
     }}
    >
     {totalPage}
    </button>
   )

   return pages
  }

  return (
   <div className='flex items-center text-white'>
    <SkipPreviousIcon
     onClick={() => handlePageClick(currentPage > 1 ? currentPage - 1 : 1)}
     style={{ cursor: 'pointer' }}
    />
    {renderPages()}
    <SkipNextIcon
     onClick={() =>
      handlePageClick(currentPage < totalPage ? currentPage + 1 : totalPage)
     }
     style={{ cursor: 'pointer' }}
    />
   </div>
  )
 }

 const handleGetValue = (info) => {
  setNoteEdit(info)
  setType(info.type)
  setTitle(info.title)
  setIdFolder(info.idFolder)
  setDueAt(info.dueAt)
  setPinned(info.pinned)
  setLock(info.lock)
  setRemindAt(new Date(info.remindAt))
  setData(info.data)
  setNotePublic(info.notePublic)
  setColor(info.color)
  setImage(info.image)
  console.log('now info', info.image)
 }

 const location = useLocation()

 console.log('location', location)

 return (
  <Box className='flex flex-col bg-[#3A3F42]'>
   {' '}
   <Box className='flex justify-center items-center text-white py-3 bg-[#181A1B] w-full h-[100%]'>
    <div className='flex'>
     <EditNoteIcon />
     <p className='m-0 p-0'>Edit Note ({note.length})</p>
    </div>
   </Box>{' '}
   <Box className='grid grid-cols-[350px_1fr] border-top border-black border-solid'>
    <div className='mx-3 overflow-y-auto h-[100vh] border-r border-black border-solid'>
     <div className='flex items-center flex-col'>
      {' '}
      <Box
       sx={{
        display: 'flex',
        alignItems: 'center',
        background: '#fff',
        borderRadius: '30px',
        height: '40px',
        margin: '10px 0',
        width: '90%',
        justifyContent: 'center',
       }}
      >
       <TextField
        id='input-with-sx'
        variant='standard'
        placeholder='Search note'
        // value={searchData}
        // onChange={(event) => setSearchMessage(event.target.value)}
        sx={{
         width: '90%',
         margin: '0 0 0px 10px',
         input: { color: '#000' },
        }}
        InputLabelProps={{ style: { color: '#000' } }}
       />
       <IconButton disabled={loading}>
        {loading ? (
         <CircularProgress size={24} className='mr-1 my-1' />
        ) : (
         <SearchIcon
          className='mr-1 my-1'
          // onClick={SearchMessage}
         />
        )}
       </IconButton>
      </Box>
      <Pagination totalPage={9} />
     </div>

     {note && note.length !== 0 ? (
      note.map((info, index) => (
       <div
        key={index}
        className='my-1 p-3 rounded-xl '
        style={{
         border: '1px solid #000',
         backgroundColor: `rgba(${info.color.r}, ${info.color.g}, ${info.color.b}, ${info.color.a})`,
        }}
        onClick={() => handleGetValue(info)}
       >
        <Box className='flex items-center justify-between'>
         <h4>{info.title}</h4>
         <DeleteIcon
          className='relative z-50 cursor-pointer'
          // onClick={() => deleteNote(info.idNote)}
          onClick={(e) => {
           e.stopPropagation()
           deleteNote(info.idNote)
          }}
         />
        </Box>

        {info.type === 'checkList' || info.type === 'checklist' ? (
         <>
          <Checklist data={info.data.slice(0, 3)} />
          {info.data.length - 3 > 0 && (
           <div className='font-bold'>+{info.data.length - 3} item hidden</div>
          )}
         </>
        ) : (
         <div
          className='max-h-[100px] text-start overflow-hidden'
          dangerouslySetInnerHTML={{ __html: info.data }}
         />
        )}
        <div className='flex gap-2 overflow-hidden'>
         {info.image &&
          info.image.map((image, index) => (
           <img
            className='h-[50px] w-[100px] object-cover'
            key={index}
            src={image.link}
            alt={image.alt}
           />
          ))}
        </div>
       </div>
      ))
     ) : (
      <>
       <div className='w-full h-full flex items-center justify-center'>
        {' '}
        <CircularProgress size={30} />
       </div>
      </>
     )}
    </div>
    {noteEdit === null ? (
     note.length === 0 ? (
      // <h3>You don't have notes to edit</h3>
      <div className='w-full h-full flex items-center justify-center'>
       {' '}
       <CircularProgress size={30} />
      </div>
     ) : (
      <h3>Click any note to edit</h3>
     )
    ) : (
     <Box className='max-w mx-auto mt-3'>
      <Box className='flex flex-wrap'>
       <FormControl className='w-full bg-white rounded-1 sm:w-1/3 mx-2 my-2'>
        <TextField
         id='demo-simple-select'
         label='Type'
         value={type}
         size='small'
        />
       </FormControl>
       <TextField
        className='w-full sm:w-1/3 mx-2 my-2 bg-white rounded-1'
        label='Title'
        size='small'
        value={title}
        onChange={(e) => setTitle(e.target.value)}
       />
       <FormControl className='w-full sm:w-1/3 mx-2 my-2 bg-white rounded-1'>
        <InputLabel id='demo-simple-select-color-label'>
         Background-color
        </InputLabel>
        <Select
         labelId='demo-simple-select-color-label'
         id='demo-simple-select-color'
         label='Background-color'
         size='small'
         value={color}
         onChange={handleColorChange}
        >
         {allColor.map((colorOption) => (
          <MenuItem key={colorOption.id} value={colorOption.id}>
           <Box display='flex' alignItems='center'>
            <span
             style={{
              height: '20px',
              width: '20px',
              border: '1px solid black',
              marginRight: '8px',
              backgroundColor: `rgba(${colorOption.r}, ${colorOption.g}, ${colorOption.b})`,
             }}
            ></span>
            {colorOption.name}
           </Box>
          </MenuItem>
         ))}
        </Select>
       </FormControl>
       <FormControl className='w-full sm:w-1/3 mx-2 my-2 flex items-center flex-row bg-white rounded-1'>
        <InputLabel id='demo-simple-select-color-label'>Folder</InputLabel>
        <Select
         style={{ width: '300px' }}
         size='small'
         // value="rtgiuy"
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
        className='w-full sm:w-1/3 mx-2 my-2 bg-white rounded-1'
        label='Lock'
        size='small'
        type='password'
        value={lock === null ? '' : lock}
        onChange={(e) => setLock(e.target.value)}
       />
       <FormControl className='w-full sm:w-1/3 mx-2 my-2 bg-white rounded-1'>
        <InputLabel id='demo-simple-select-color-label'>NotePublic</InputLabel>
        <Select
         label='NotePublic'
         size='small'
         value={notePublic}
         onChange={handleChangeNotePublic}
        >
         {notePublicOptions.map((note, idx) => (
          <MenuItem key={idx} value={idx}>
           {note}
          </MenuItem>
         ))}
        </Select>
       </FormControl>
       <Box className='flex items-center w-1/3 z-50 mx-2 my-2 text-white'>
        <h6>RemindAt:</h6>{' '}
        <DatePicker
         selected={remindAt}
         onChange={(date) => setRemindAt(date)}
         showTimeSelect
         dateFormat='Pp'
        />
       </Box>
       <FormControlLabel
        className='w-1/3 mx-2 my-2 text-white'
        label='Pinned'
        control={
         <Checkbox
          className='text-white'
          checked={pinned}
          onChange={(e) => setPinned(e.target.checked)}
         />
        }
       />{' '}
       <div className='flex justify-end items-center mr-3'>
        <Button
         className='h-8'
         variant='contained'
         onClick={() => handleSubmit(noteEdit.idNote)}
        >
         Save
        </Button>
       </div>
       <div className='w-full'>
        <div
         style={{
          margin: '20px',
          padding: '0 0 10px',
          backgroundColor: '#fff',
          borderRadius: '4px',
         }}
        >
         <div
          style={{
           display: 'flex',
           justifyContent: 'flex-end',
           padding: '10px 0',
          }}
         >
          <div style={{ marginBottom: '0px' }}>
           <label
            htmlFor='file-upload'
            style={{
             display: 'inline-block',
             padding: '3px 10px',
             fontSize: '16px',
             color: '#fff',
             backgroundColor: '#007bff',
             border: 'none',
             borderRadius: '5px',
             marginRight: '10px',
             cursor: 'pointer',
             textAlign: 'center',
             lineHeight: '30px',
            }}
           >
            Select Image
           </label>
           <input
            id='file-upload'
            type='file'
            accept='image/*'
            multiple
            onChange={handleImageChange}
            style={{ display: 'none' }}
           />
          </div>
          {selectedForDeletion.length >= 1 ? (
           <div style={{ marginBottom: '0px' }}>
            <button
             onClick={handleDeleteSelected}
             style={{
              padding: '3px 10px',
              marginRight: '10px',
              fontSize: '16px',
              color: '#fff',
              backgroundColor: '#dc3545',
              border: 'none',
              borderRadius: '5px',
              lineHeight: '30px',
              cursor: 'pointer',
             }}
            >
             Delete All
            </button>
           </div>
          ) : (
           ''
          )}
         </div>

         <div style={{ width: `${checkWidth}px` }}>
          {' '}
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
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            margin: '0px auto',
           }}
          >
           {image &&
            image.map((image, index) => {
             return (
              <SwiperSlide key={index} style={{ margin: '10px 2px' }}>
               <img
                src={image.link}
                alt={`Selected ${index}`}
                style={{
                 width: '100%',
                 height: '100px',
                 objectFit: 'cover',
                 display: 'block',
                 borderRadius: '4px',
                }}
               />
               <button
                onClick={() => deleteImageNote(image.id)}
                style={{
                 position: 'absolute',
                 top: '5px',
                 left: '5px',
                 color: '#000',
                 borderRadius: '50%',
                 cursor: 'pointer',
                 width: '25px',
                 height: '25px',
                 border: '0.2px solid #000',
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'center',
                 fontSize: '16px',
                 fontWeight: 'bold',
                }}
               >
                <CloseIcon />
               </button>
               {/* <input
                              type="checkbox"
                              // onChange={() => handleSelectForDeletion(file)}
                              style={{
                                position: "absolute",
                                top: "5px",
                                right: "15px",
                                backgroundColor: "#fff",
                                border: "none",
                                cursor: "pointer",
                              }}
                            /> */}
              </SwiperSlide>
             )
            })}
           {selectedFiles.map((file, index) => {
            const imageUrl = URL.createObjectURL(file)
            return (
             <SwiperSlide key={index} style={{ margin: '10px 2px' }}>
              <img
               src={imageUrl}
               alt={`Selected ${index}`}
               style={{
                width: '100%',
                height: '100px',
                objectFit: 'cover',
                display: 'block',
                borderRadius: '4px',
               }}
              />
              <button
               onClick={() => handleDeleteImage(file)}
               style={{
                position: 'absolute',
                top: '5px',
                left: '5px',
                color: '#000',
                borderRadius: '50%',
                cursor: 'pointer',
                width: '25px',
                height: '25px',
                border: '0.2px solid #000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                fontWeight: 'bold',
               }}
              >
               <CloseIcon />
              </button>
              {/* <input
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
                            /> */}
             </SwiperSlide>
            )
           })}
          </Swiper>
         </div>
        </div>
       </div>
       <Box className='w-full'>
        <h5 className='ml-2'>Content</h5>
        {noteEdit.type === 'text' ? (
         <div>
          <Editor
           apiKey='c9fpvuqin9s9m9702haau5pyi6k0t0zj29nelhczdvjdbt3y'
           value={data}
           init={{
            height: '100vh',
            menubar: true,
            statusbar: false,
            toolbar:
             'undo redo | formatselect | bold italic backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat',
           }}
           onEditorChange={handleEditorChange}
          />
         </div>
        ) : (
         <ChecklistComponent
          checklistItems={checklistItems}
          setChecklistItems={setChecklistItems}
          data={noteEdit.data}
         />
        )}
       </Box>
      </Box>
     </Box>
    )}
   </Box>
  </Box>
 )
}
