import { useNavigate, useParams, Link } from 'react-router-dom'
import { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context'
import api from '../api'
import { Box, Typography, Button, TextField } from '@mui/material'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import SettingsIcon from '@mui/icons-material/Settings'
import SearchIcon from '@mui/icons-material/Search'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'
import SvgIcon from '@mui/material/SvgIcon'
import Avatar from '@mui/material/Avatar'
import './UserProfile.css'
import { io } from 'socket.io-client'
import ModalChat from '../components/ModalChat'

const UserProfile = () => {
 const appContext = useContext(AppContext)
 const { setSnackbar, user } = appContext
 const [socket, setSocket] = useState(null)
 const [userInfomations, setUserInformations] = useState(null)
 const [notePrivate, setNotePrivate] = useState([])
 const [lastUsers, setLastUsers] = useState([])
 const [userNotes, setUserNotes] = useState(null)
 const archivedNotes = (userNotes || []).filter((note) => note.inArchived)
 const [value, setValue] = useState('1')
 const [valueNotePrivate, setValueNotePrivate] = useState('1')
 const [reload, setReload] = useState(0) // State to trigger updates
 const [allNotePublic, setAllNotePublic] = useState([])
 const [isModalMess, setIsModalMessage] = useState(false)
 const [dataMess, setDataMess] = useState([])
 const [payloadData, setPayloadData] = useState('')
 const navigate = useNavigate()

 const params = useParams()
 const userID = params.id

 useEffect(() => {
  // let ignore = false
  const getUserInformation = async (userID) => {
   try {
    const res = await api.get(
     `https://samnote.mangasocial.online/profile/${userID}`
    )
    setUserInformations(res.data.user)
    setUserNotes(res.data.note)
   } catch (err) {
    console.log(err)
   }
  }

  getUserInformation(userID)
 }, [userID, reload])

 useEffect(() => {
  fetchLastUsers()
  fetchAllNotesProfile()
  fetchAllNotePublic()
 }, [])

 useEffect(() => {
  fetchAllDataMess()
  const newSocket = io('https://samnote.mangasocial.online')
  console.log(newSocket)
  setSocket(newSocket)

  newSocket.on('connect', () => {
   console.log('Connected to socket.IO server', newSocket.id)
  })

  newSocket.on('join_room', (newRoom) => {
   if (newRoom.includes(user.id)) {
    console.log(newRoom)
    fetchAllDataMess()
   }
  })

  return () => {
   newSocket.disconnect() // Ngắt kết nối khi component bị xoá
  }
 }, [])

 const fetchAllDataMess = async () => {
  const response = await api.get(
   `https://samnote.mangasocial.online/message/list_user_chat1vs1/${user.id}`
  )
  if (response && response.data.status === 200) {
   setDataMess(response.data.data)
  }
 }

 const fetchLastUsers = async () => {
  const response = await api.get('/lastUser')
  if (response && response.data.status === 200) {
   setLastUsers(response.data.data.slice(0, 4))
  }
 }

 const fetchAllNotePublic = async () => {
  try {
   const response = await api.get('/notes_public')
   if (response && response.data.message === 'success') {
    setAllNotePublic(response.data.public_note)
   }
  } catch (err) {
   console.log(err)
  }
 }

 useEffect(() => {
  fetchAllNotePublic()
 }, [reload])

 const fetchAllNotesProfile = async () => {
  const response = await api.get(`/profile/${user.id}`).then((res) => {
   const dataFilter = res.data.note.filter((notes) => notes.notePublic === 0)
   return dataFilter
  })
  setNotePrivate(response)
 }

 const Checklist = ({ data }) => {
  const [items, setItems] = useState([])

  useEffect(() => {
   setItems(data)
  }, [data])

  return (
   <div>
    {items.map((item, index) => (
     <div key={index}>
      <input
       style={{ marginRight: '5px' }}
       type='checkbox'
       checked={item.status}
      />
      {item.content}
     </div>
    ))}
   </div>
  )
 }

 const deleteNote = async (index) => {
  try {
   await api.delete(`/notes/${index}`)
   setSnackbar({
    isOpen: true,
    message: `Remove note successfully ${index}`,
    severity: 'success',
   })
   setReload((prev) => prev + 1) // Update the state to trigger useEffect
  } catch (err) {
   console.error(err)
   setSnackbar({
    isOpen: true,
    message: `Failed to remove note ${index}`,
    severity: 'error',
   })
  }
 }

 function convertUpdate(dateStr) {
  const dateObj = new Date(dateStr)
  const day = dateObj.getDate()
  const month = dateObj.getMonth() + 1
  const year = dateObj.getFullYear()
  return `${day.toString().padStart(2, '0')}/${month
   .toString()
   .padStart(2, '0')}/${year}`
 }

 function convertCreate(dateStr) {
  const [datePart] = dateStr.split(' ')
  const [year, month, day] = datePart.split('-')
  return `${day}-${month}-${year}`
 }

 const handleChange = (event, newValue) => {
  setValue(newValue)
 }

 const handleChangeNotePrivate = (event, newValue) => {
  setValueNotePrivate(newValue)
 }

 function getCurrentFormattedDateTime() {
  const date = new Date()

  // Lấy các thành phần của ngày và giờ
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0') // Tháng tính từ 0-11, cần +1
  const year = date.getFullYear()

  let hours = date.getHours()
  const minutes = String(date.getMinutes()).padStart(2, '0')

  // Xác định AM/PM
  const ampm = hours >= 12 ? 'PM' : 'AM'
  hours = hours % 12
  hours = hours ? hours : 12 // Giờ 0 thành 12
  const formattedHours = String(hours).padStart(2, '0')

  // Lấy múi giờ
  const timeZoneOffset = -date.getTimezoneOffset()
  const offsetSign = timeZoneOffset >= 0 ? '+' : '-'
  const offsetHours = String(
   Math.floor(Math.abs(timeZoneOffset) / 60)
  ).padStart(2, '0')
  const offsetMinutes = String(Math.abs(timeZoneOffset) % 60).padStart(2, '0')

  // Tạo chuỗi thời gian định dạng
  const formattedDateTime = `${day}/${month}/${year} ${formattedHours}:${minutes} ${ampm} ${offsetSign}${offsetHours}:${offsetMinutes}`

  return formattedDateTime
 }

 const handleSubmit = async () => {
  const payload = {
   type: 'text',
   data: payloadData,
   title: 'Quick notes',
   color: { r: 255, g: 255, b: 255, a: 1 },
   idFolder: null,
   dueAt: getCurrentFormattedDateTime(),
   pinned: false,
   lock: '',
   remindAt: null,
   linkNoteShare: '',
   notePublic: 1,
  }

  console.log('payload', payload) // Check payload structure before sending

  try {
   await api.post(`/notes/${user.id}`, payload)
   setReload((prev) => prev + 1)
   setPayloadData('')
   setSnackbar({
    isOpen: true,
    message: 'Created new note successfully',
    severity: 'success',
   })
  } catch (err) {
   console.error(err)
   setSnackbar({
    isOpen: true,
    message: 'Failed to create note',
    severity: 'error',
   })
  }
 }

 const getTimeDifference = (time1, time2) => {
  const realTime = time1 + '+0700'
  const diffInMs = new Date(time2).getTime() - new Date(realTime).getTime()
  const diffInSeconds = Math.floor(diffInMs / 1000)
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  const diffInHours = Math.floor(diffInMinutes / 60)
  const diffInDays = Math.floor(diffInHours / 24)

  if (diffInHours < 1) {
   return `${diffInMinutes} min`
  } else if (diffInDays < 1) {
   return `${diffInHours} hours`
  } else if (diffInDays < 30) {
   return `${diffInDays} day`
  } else {
   return `more 30 day`
  }
 }

 const handleMess = () => {
  setIsModalMessage(!isModalMess)
 }

 console.log(lastUsers)
 return (
  <Box className='w-full bg-[#4A4B51] h-auto'>
   <Box className='w-full bg-[#ddd] h-auto'>
    {userInfomations ? (
     <>
      <Box className='lg:relative'>
       <img
        src={userInfomations.AvtProfile}
        alt=''
        className='lg:w-full lg:h-[500px] lg:object-fit hidden lg:block'
       />
      </Box>
      <Box className='flex items-center justify-between w-full mx-auto my-3'>
       <div className='flex items-center justify-between lg:justify-normal gap-8 w-10/12 mx-auto'>
        <span className='text-[#5BE260] w-[100px] text-4xl block lg:hidden ml-8'>
         PROFILE
        </span>
        <img
         src={userInfomations.Avarta}
         alt=''
         className='w-28 h-28 rounded-full hidden lg:block object-cover'
        />
        <Box>
         <Typography
          variant='h5'
          className='uppercase font-bold hidden lg:block'
         >
          {userInfomations.name}
         </Typography>
         <Typography className='text-xl hidden lg:block'>
          {userInfomations.gmail}
         </Typography>
        </Box>
       </div>
       <img
        className='w-[50px] h-[50px] object-cover rounded-full block lg:hidden'
        src={user.Avarta}
        alt='Avarta'
       />
       <div className='mx-10 flex items-center'>
        <SettingsIcon
         fontSize='large'
         className='cursor-pointer block text-5xl lg:hidden text-white'
         onClick={() => navigate(`/user/setting`)}
        />
        <div
         style={{
          margin: '0px 10px 0 0',
          padding: '0 10px 0',
          display: 'flex',
          backgroundColor: '#fff',
          alignItems: 'center',
          borderRadius: '20px',
          cursor: 'pointer',
          height: '39px',
         }}
         onClick={() =>
          navigate('/user/incognito', {
           state: { userInfomations: null },
          })
         }
        >
         <img
          style={{
           height: '20px',
           width: '20px',
           marginRight: '5px',
          }}
          src='https://s3-alpha-sig.figma.com/img/9765/1fb1/545af073cb81365ffa194ba6a7206ff1?Expires=1721001600&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=YP-6PnN36sD7~7-JrZkVVV7aDWVv4Ne6ZNik-vcASGppOo9~APa9puyjcWdbmvJp9z8RNmp6wMYmqquBvku5PUk6VjpGIpVbzDUS6M4BRabGwIKIiBIDCiM0zSiFEs8Aswgqp0aJ8YGDDhMoC5xfNoJyWHllBw0kuZCkhhJ9jGkRi-yp-niJCH38JZCi2nf9BsySXNaffArMVHFnECnOLKnk1nbVXHljJ-qbZ-rpdE2Kem9GOw4KYA~EnkIxbFhGIPzn2glqv5lOVZoUphbQ79wkVtjIfEAqN5egw8jT7kMIn-s7AMmpzKjGD1KfSD91P5wSA7TUAbJkt89e70gyEA__'
          alt='Incognito'
         />
         Incognito
        </div>
        <div className='relative inline-block'>
         <div
          className='bg-white flex items-center p-2 cursor-pointer rounded-[20px] h-[39px]'
          onClick={handleMess}
         >
          messenger
          <svg
           width='28'
           height='28'
           viewBox='0 0 48 48'
           fill='none'
           xmlns='http://www.w3.org/2000/svg'
           className='hidden lg:block after:content  ml-2'
          >
           <g clipPath='url(#clip0_295_3410)'>
            <path
             d='M0.00198132 23.278C0.00198132 9.898 10.482 0 24.002 0C37.522 0 48 9.9 48 23.278C48 36.656 37.52 46.554 24 46.554C21.58 46.554 19.24 46.234 17.06 45.634C16.6345 45.5195 16.1825 45.5548 15.78 45.734L11 47.834C10.7118 47.9623 10.3965 48.0176 10.0819 47.995C9.76732 47.9724 9.46312 47.8727 9.19622 47.7047C8.92931 47.5366 8.70791 47.3054 8.5516 47.0315C8.39528 46.7575 8.30887 46.4493 8.29998 46.134L8.15998 41.854C8.14913 41.5961 8.08694 41.343 7.97704 41.1095C7.86715 40.876 7.71176 40.6667 7.51998 40.494C5.11521 38.324 3.20093 35.6661 1.90487 32.6977C0.608801 29.7293 -0.0392407 26.5187 0.00398132 23.28L0.00198132 23.278ZM16.642 18.898L9.60198 30.098C8.90198 31.158 10.242 32.376 11.242 31.598L18.822 25.858C19.342 25.458 20.022 25.458 20.562 25.858L26.162 30.058C27.842 31.318 30.242 30.858 31.362 29.098L38.402 17.898C39.102 16.838 37.762 15.638 36.762 16.398L29.182 22.138C28.682 22.538 27.982 22.538 27.462 22.138L21.862 17.938C21.4637 17.6372 21.0073 17.4224 20.5216 17.3074C20.036 17.1924 19.5317 17.1796 19.0408 17.2698C18.55 17.3601 18.0832 17.5515 17.6703 17.8318C17.2573 18.1121 16.9071 18.4752 16.642 18.898Z'
             fill='#000'
             // fill="#F4F4F4"
            />
           </g>
           <defs>
            <clipPath id='clip0_295_3410'>
             <rect width='48' height='48' fill='white' />
            </clipPath>
           </defs>
          </svg>
         </div>
         <div className='absolute top-2 right-2 pointer-events-none transform translate-x-1/2 -translate-y-1/2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full'>
          {dataMess.filter((mess) => mess.is_seen === 0).length !== 0
           ? dataMess.filter((mess) => mess.is_seen === 0).length
           : 0}
         </div>
         {isModalMess && <ModalChat dataMess={dataMess} />}
        </div>
       </div>
      </Box>

      <Box className='flex w-full items-end bg-[#99999] justify-center text-white mb-6 block lg:hidden'>
       <SearchIcon className='mr-1 my-1' />
       <input
        className='w-[80%] h-[35px] text-white bg-[#777777] placeholder-white-400 placeholder-shown:text-gray-500 block lg:hidden'
        type='text'
        placeholder='Search...'
       />
      </Box>
      <div className={`w-[98%] flex justify-between mb-4 m-auto`}>
       <div className='w-[30%] h-[285px] bg-[#FFF4BA] rounded-xl mt-3'>
        <div className='flex justify-between w-full mt-2 px-2'>
         <span className='font-[700] text-[#888888] text-xl'>Quick notes</span>
         <Button className='' variant='contained' onClick={handleSubmit}>
          Create
         </Button>
        </div>
        <TextField
         className='p-2 w-full'
         id='standard-multiline-static'
         placeholder='Content'
         multiline
         rows={9}
         variant='standard'
         value={payloadData}
         onChange={(event) => setPayloadData(event.target.value)}
        />
       </div>
       <div className='mt-3 w-[30%] h-[285px] bg-[#fff] rounded-xl'>
        <div className='mx-2 my-2 w-[95%] h-[100%]'>
         <span className='font-[700] text-[#888888] text-xl'>New User</span>
         <ul className='mt-1 p-0 w-full h-[78%] overflow-hidden'>
          {lastUsers.length > 0 ? (
           lastUsers.map(({ id, linkAvatar, user_name, createAt }) => (
            <li key={`${id}`}>
             <Link
              to={`/other-user/${id}`}
              className='w-full h-[15%] flex justify-between items-center my-1 ml-2 link-dark text-decoration-none'
             >
              <img
               className='w-[40px] h-[40px] rounded-xl object-cover mt-2'
               src={linkAvatar}
               alt='image'
              />
              <span className='truncate-text w-[50%] mr-2'>{user_name}</span>
              <span className='mr-3'>
               {createAt.split(' ').slice(1, 4).join(' ')}
              </span>
             </Link>
            </li>
           ))
          ) : (
           <></>
          )}
         </ul>
        </div>
       </div>
       <div className='mt-3 w-[35%] h-[285px] bg-[#fff] rounded-xl'>
        {allNotePublic.length > 0 ? (
         <div className='mt-2 w-[95%] h-[95%] ml-2'>
          {' '}
          <span className='font-[700] text-[#888888] text-xl'>New Notes</span>
          {allNotePublic.slice(0, 5).map((item, index) => (
           <div
            key={`notePublic ${index}`}
            className='w-full h-[15%] flex justify-evenly my-1 ml-2 items-center'
           >
            <span className=' w-[20%] h-[full] truncate-text border-l-4 border-black-200'>
             {item.author}
            </span>
            <span className='w-[55%] break-words'>
             Create a new public note
            </span>
            <span className='text-xs break-words w-[12%] whitespace-nowrap'>
             {getTimeDifference(item.update_at, new Date())}
            </span>
           </div>
          ))}
         </div>
        ) : (
         <></>
        )}
       </div>
      </div>
      <Box className='flex'>
       <Box className='flex-[4] w-full'>
        {archivedNotes.length > 0 ? (
         <>
          <div
           style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 0px 0 10px',
            backgroundColor: '#fff',
           }}
          >
           <Box component='h3' sx={{ color: 'text.main' }}>
            PUBLIC NOTE
           </Box>
           <MoreHorizIcon sx={{ cursor: 'pointer', color: 'text.main' }} />
          </div>
          <TabContext value={value}>
           <Box
            sx={{
             borderBottom: 1,
             borderColor: 'divider',
             marginBottom: '24px',
             backgroundColor: '#fff',
             width: '100%',
            }}
           >
            <TabList onChange={handleChange} aria-label='lab API tabs example'>
             <Tab label='Resent' value='1' />
             <Tab label='Recommended' value='2' />
            </TabList>
           </Box>
           <TabPanel
            value='1'
            className='lg:w-[1000px] w-auto'
            sx={{ maxWidth: '1000px', padding: 0 }}
           >
            <Swiper
             spaceBetween={20}
             slidesPerView={2.5}
             navigation
             onSlideChange={() => console.log('slide change')}
             onSwiper={(swiper) => console.log(swiper)}
            >
             {archivedNotes &&
              archivedNotes.map((info, index) => (
               <SwiperSlide
                key={index}
                className='p-2 border-[1px] rounded-xl border-black border-solid'
                style={{
                 backgroundColor: `rgba(${info.color.r}, ${info.color.g}, ${info.color.b}, ${info.color.a})`,
                }}
               >
                <div
                 style={{
                  display: 'flex',
                  margin: '10px 20px',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                 }}
                >
                 <div
                  style={{
                   display: 'flex',
                   alignItems: 'center',
                   justifyContent: 'center',
                   padding: ' 10px 0',
                  }}
                 >
                  <Avatar
                   style={{
                    height: '45px',
                    width: '45px',
                    marginRight: '10px',
                    objectFit: 'cover',
                   }}
                   src={userInfomations.Avarta}
                   alt=''
                  />
                  <Box sx={{ color: 'text.main' }}>
                   <p style={{ margin: 0 }}>
                    <strong>{userInfomations.name}</strong>
                   </p>
                   <p style={{ margin: 0 }}>
                    {' '}
                    Create at {convertCreate(info.createAt)}{' '}
                   </p>
                  </Box>
                 </div>
                 <div className=' flex items-center'>
                  <div className=' flex items-center'>
                   <SvgIcon
                    style={{
                     marginRight: '3px',
                     color: '#fff',
                     width: '28px',
                     height: '30px',
                    }}
                    viewBox='0 0 32 25'
                    fill='none'
                    xmlns='http://www.w3.org/2000/svg'
                   >
                    <path
                     d='M30.4044 10.5738C30.7877 11.1021 31 11.7884 31 12.5C31 13.2117 30.7877 13.898 30.4044 14.4263C27.9767 17.675 22.4507 24 16 24C9.54928 24 4.02338 17.675 1.59568 14.4263C1.21225 13.898 1 13.2117 1 12.5C1 11.7884 1.21225 11.1021 1.59568 10.5738C4.02338 7.32501 9.54928 1 16 1C22.4507 1 27.9767 7.32501 30.4044 10.5738Z'
                     stroke='black'
                     strokeWidth='2'
                     strokeLinecap='round'
                     strokeLinejoin='round'
                    />
                    <path
                     d='M15.9999 17.6108C18.5538 17.6108 20.6241 15.3225 20.6241 12.4997C20.6241 9.67697 18.5538 7.38867 15.9999 7.38867C13.446 7.38867 11.3757 9.67697 11.3757 12.4997C11.3757 15.3225 13.446 17.6108 15.9999 17.6108Z'
                     stroke='black'
                     strokeWidth='2'
                     strokeLinecap='round'
                     strokeLinejoin='round'
                    />
                   </SvgIcon>
                   {info.view}
                  </div>
                  <SvgIcon
                   onClick={() => deleteNote(info.idNote)}
                   sx={{
                    color: '#fff',
                    marginLeft: '10px',
                   }}
                   width='24'
                   height='24'
                   viewBox='0 0 24 24'
                   fill='none'
                   xmlns='http://www.w3.org/2000/svg'
                  >
                   <path
                    d='M1.71429 6H22.2857'
                    stroke='black'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                   />
                   <path
                    d='M4.28571 6H19.7143V21.4286C19.7143 21.8832 19.5336 22.3193 19.2122 22.6407C18.8907 22.9622 18.4546 23.1429 18 23.1429H5.99999C5.54533 23.1429 5.1093 22.9622 4.7878 22.6407C4.46632 22.3193 4.28571 21.8832 4.28571 21.4286V6Z'
                    stroke='black'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                   />
                   <path
                    d='M7.71429 6V5.14286C7.71429 4.00622 8.16582 2.91612 8.96955 2.1124C9.77327 1.30868 10.8634 0.857147 12 0.857147C13.1366 0.857147 14.2267 1.30868 15.0305 2.1124C15.8342 2.91612 16.2857 4.00622 16.2857 5.14286V6'
                    stroke='black'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                   />
                   <path
                    d='M9.42859 11.1454V18.0051'
                    stroke='black'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                   />
                   <path
                    d='M14.5714 11.1454V18.0051'
                    stroke='black'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                   />
                  </SvgIcon>
                 </div>
                </div>
                <Box
                 component='div'
                 sx={{
                  color: 'text.main',
                  margin: '10px 10px 0px',
                  height: '160px',
                  overflow: 'hidden',
                 }}
                >
                 <strong style={{ fontSize: '20px' }}>{info.title}</strong>
                 {info.type === 'checkList' || info.type === 'checklist' ? (
                  <>
                   <Checklist data={info.data.slice(0, 3)} />
                   {info.data.length - 3 > 0 && (
                    <div className='font-bold'>
                     +{info.data.length - 3} item hidden
                    </div>
                   )}
                  </>
                 ) : (
                  <div
                   className='max-h-[100px] text-start overflow-hidden'
                   dangerouslySetInnerHTML={{
                    __html: info.data,
                   }}
                  />
                 )}
                </Box>
                <Box
                 component='div'
                 sx={{
                  color: 'text.secondary',
                  textAlign: 'end',
                  padding: '0 10px 0 0',
                 }}
                >
                 <p style={{ margin: 0 }}>
                  Last edit at {convertUpdate(info.updateAt)}
                 </p>

                 <Box
                  component='div'
                  sx={{
                   display: 'flex',
                   alignItems: 'center',
                   color: 'text.main',
                   justifyContent: 'flex-end',
                  }}
                 ></Box>
                </Box>
               </SwiperSlide>
              ))}
            </Swiper>
           </TabPanel>
           <TabPanel value='2' sx={{ width: '100%', padding: 0 }}>
            tab2
           </TabPanel>
          </TabContext>
         </>
        ) : (
         <Box className='bg-white p-4 rounded-lg'>
          <Typography variant='h5' className='font-semibold text-center'>
           No note to show
          </Typography>
         </Box>
        )}
       </Box>
      </Box>
      <br />

      <Box className='flex-[4]'>
       {notePrivate.length > 0 ? (
        <>
         <div
          style={{
           display: 'flex',
           alignItems: 'center',
           justifyContent: 'space-between',
           padding: '10px 0px 0 10px',
           backgroundColor: '#fff',
          }}
         >
          <Box component='h3' sx={{ color: 'text.main' }}>
           PRIVATE NOTE
          </Box>
          <MoreHorizIcon sx={{ cursor: 'pointer', color: 'text.main' }} />
         </div>
         <TabContext value={valueNotePrivate}>
          <Box
           sx={{
            borderBottom: 1,
            borderColor: 'divider',
            marginBottom: '24px',
            backgroundColor: '#fff',
           }}
          >
           <TabList
            onChange={handleChangeNotePrivate}
            aria-label='lab API tabs example'
           >
            <Tab label='Resent' value='1' />
            <Tab label='Recommended' value='2' />
           </TabList>
          </Box>
          <TabPanel
           value='1'
           className='lg:w-[1000px] w-auto'
           sx={{ maxWidth: '1000px', padding: 0 }}
          >
           <Swiper
            spaceBetween={20}
            slidesPerView={2.5}
            navigation
            onSlideChange={() => console.log('slide change')}
            onSwiper={(swiper) => console.log(swiper)}
           >
            {notePrivate &&
             notePrivate.map((info, index) => (
              <SwiperSlide
               key={index}
               className='p-2 border-[1px] rounded-xl border-black border-solid'
               style={{
                backgroundColor: `rgba(${info.color.r}, ${info.color.g}, ${info.color.b}, ${info.color.a})`,
               }}
              >
               <div
                style={{
                 display: 'flex',
                 margin: '10px 20px',
                 alignItems: 'center',
                 justifyContent: 'space-between',
                }}
               >
                <div
                 style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: ' 10px 0',
                 }}
                >
                 <Avatar
                  style={{
                   height: '45px',
                   width: '45px',
                   marginRight: '10px',
                   objectFit: 'cover',
                  }}
                  src={userInfomations.Avarta}
                  alt=''
                 />
                 <Box sx={{ color: 'text.main' }}>
                  <p style={{ margin: 0 }}>
                   <strong>{userInfomations.name}</strong>
                  </p>
                  <p style={{ margin: 0 }}>
                   {' '}
                   Create at {convertCreate(info.createAt)}{' '}
                  </p>
                 </Box>
                </div>
                <div className=' flex items-center'>
                 <div className=' flex items-center'>
                  <SvgIcon
                   style={{
                    marginRight: '3px',
                    color: '#fff',
                    width: '28px',
                    height: '30px',
                   }}
                   viewBox='0 0 32 25'
                   fill='none'
                   xmlns='http://www.w3.org/2000/svg'
                  >
                   <path
                    d='M30.4044 10.5738C30.7877 11.1021 31 11.7884 31 12.5C31 13.2117 30.7877 13.898 30.4044 14.4263C27.9767 17.675 22.4507 24 16 24C9.54928 24 4.02338 17.675 1.59568 14.4263C1.21225 13.898 1 13.2117 1 12.5C1 11.7884 1.21225 11.1021 1.59568 10.5738C4.02338 7.32501 9.54928 1 16 1C22.4507 1 27.9767 7.32501 30.4044 10.5738Z'
                    stroke='black'
                    stroke-width='2'
                    stroke-linecap='round'
                    stroke-linejoin='round'
                   />
                   <path
                    d='M15.9999 17.6108C18.5538 17.6108 20.6241 15.3225 20.6241 12.4997C20.6241 9.67697 18.5538 7.38867 15.9999 7.38867C13.446 7.38867 11.3757 9.67697 11.3757 12.4997C11.3757 15.3225 13.446 17.6108 15.9999 17.6108Z'
                    stroke='black'
                    stroke-width='2'
                    stroke-linecap='round'
                    stroke-linejoin='round'
                   />
                  </SvgIcon>

                  {info.view}
                 </div>
                 <SvgIcon
                  onClick={() => deleteNote(info.idNote)}
                  sx={{
                   color: '#fff',
                   marginLeft: '10px',
                  }}
                  width='24'
                  height='24'
                  viewBox='0 0 24 24'
                  fill='none'
                  xmlns='http://www.w3.org/2000/svg'
                 >
                  <path
                   d='M1.71429 6H22.2857'
                   stroke='black'
                   strokeWidth='2'
                   strokeLinecap='round'
                   strokeLinejoin='round'
                  />
                  <path
                   d='M4.28571 6H19.7143V21.4286C19.7143 21.8832 19.5336 22.3193 19.2122 22.6407C18.8907 22.9622 18.4546 23.1429 18 23.1429H5.99999C5.54533 23.1429 5.1093 22.9622 4.7878 22.6407C4.46632 22.3193 4.28571 21.8832 4.28571 21.4286V6Z'
                   stroke='black'
                   strokeWidth='2'
                   strokeLinecap='round'
                   strokeLinejoin='round'
                  />
                  <path
                   d='M7.71429 6V5.14286C7.71429 4.00622 8.16582 2.91612 8.96955 2.1124C9.77327 1.30868 10.8634 0.857147 12 0.857147C13.1366 0.857147 14.2267 1.30868 15.0305 2.1124C15.8342 2.91612 16.2857 4.00622 16.2857 5.14286V6'
                   stroke='black'
                   strokeWidth='2'
                   strokeLinecap='round'
                   strokeLinejoin='round'
                  />
                  <path
                   d='M9.42859 11.1454V18.0051'
                   stroke='black'
                   strokeWidth='2'
                   strokeLinecap='round'
                   strokeLinejoin='round'
                  />
                  <path
                   d='M14.5714 11.1454V18.0051'
                   stroke='black'
                   strokeWidth='2'
                   strokeLinecap='round'
                   strokeLinejoin='round'
                  />
                 </SvgIcon>
                </div>
               </div>
               <Box
                component='div'
                sx={{
                 color: 'text.main',
                 margin: '10px 10px 0px',
                 height: '160px',
                 overflow: 'hidden',
                }}
               >
                <strong style={{ fontSize: '20px' }}>{info.title}</strong>
                <div
                 style={{ marginTop: '10px' }}
                 dangerouslySetInnerHTML={{
                  __html: info.data,
                 }}
                />
               </Box>
               <Box
                component='div'
                sx={{
                 color: 'text.secondary',
                 textAlign: 'end',
                 padding: '0 10px 0 0',
                }}
               >
                <p style={{ margin: 0 }}>
                 Last edit at {convertUpdate(info.updateAt)}
                </p>

                <Box
                 component='div'
                 sx={{
                  display: 'flex',
                  alignItems: 'center',
                  color: 'text.main',
                  justifyContent: 'flex-end',
                 }}
                ></Box>
               </Box>
              </SwiperSlide>
             ))}
           </Swiper>
          </TabPanel>
          <TabPanel value='2' sx={{ width: '100%', padding: 0 }}>
           tab2
          </TabPanel>
         </TabContext>
        </>
       ) : (
        <Box className='bg-white p-4 rounded-lg'>
         <Typography variant='h5' className='font-semibold text-center'>
          No note to show
         </Typography>
        </Box>
       )}
      </Box>
     </>
    ) : (
     <h1>Not found</h1>
    )}
   </Box>
  </Box>
 )
}

export default UserProfile
