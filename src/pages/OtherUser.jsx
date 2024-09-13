import { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../api'
import { Avatar, Box, SvgIcon, Typography } from '@mui/material'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import React from 'react'
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import './UserProfile.css'
import ModalComments from '../components/ModalComments'
import { AppContext } from '../context'

const OtherUser = () => {
 const [user, setUser] = useState({ id: 0 })
 const [userInfomations, setUserInformations] = useState(null)
 const [userNotes, setUserNotes] = useState([])
 const [joinDay, setJoinDay] = useState('')
 const params = useParams()
 const [value, setValue] = React.useState('1')
 const [isModalNote, setIsModalNote] = useState(false)
 const [infoNote, setInfoNote] = useState({})
 const appContext = useContext(AppContext)
 const navi = useNavigate()
 const navigate = useNavigate()

 useEffect(() => {
  let stored = localStorage.getItem('USER')
  if (stored) {
   setUser(JSON.parse(stored))
  }

  let ignore = false
  const getUserInformation = async () => {
   try {
    const res = await api.get(
     `https://samnote.mangasocial.online/profile/${params.id}`
    )
    if (!ignore) {
     setUserInformations(res.data.user)
     setJoinDay(res.data.user.createAccount)
    }
   } catch (err) {
    console.log(err)
   }
  }

  const getNoteOtherUser = async () => {
   try {
    const res = await api.get(`/notes/${params.id}`)
    console.log(res.data)
    if (res) {
     const data = res.data.notes.filter((notes) => notes.type !== 'image')
     console.log(data)
     setUserNotes(data)
    }
   } catch (err) {
    console.log(err)
   }
  }

  getUserInformation()
  getNoteOtherUser()

  return () => {
   ignore = true
  }
 }, [])

 const convertDay = joinDay.split(' ').slice(1, 4)

 function convertCreate(dateStr) {
  const [datePart] = dateStr.split(' ')
  const [year, month, day] = datePart.split('-')
  return `${day}-${month}-${year}`
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

 const handleChange = (event, newValue) => {
  setValue(newValue)
 }

 const modalNote = async (info) => {
  setIsModalNote(true)
  setInfoNote(info)
 }

 const toggleModal = () => {
  setIsModalNote(false)
  setInfoNote({})
 }

 console.log(userInfomations)
 console.log(userNotes)
 console.log(user)

 const handleChat = async () => {
  const response = await api.get(`/chatblock/${user.id}`, userInfomations.id)
  if (response && response.data.state === 200) {
   const relation = await api.post(`/chatblock/${user.id}`, {
    idReceive: userInfomations.id,
   })

   if (relation) {
    navi(`/user/group`, { state: userInfomations })
   }
  }
 }
 return (
  <Box className='bg-zinc-100 w-full'>
   {userInfomations && (
    <>
     <Box className='relative'>
      <img
       src={userInfomations.AvtProfile}
       alt=''
       className='w-full h-[80vh]'
      />
     </Box>

     <Box className='flex items-center gap-4 ml-3 my-4'>
      <Box className='flex items-center gap-4'>
       <Box className='relative'>
        <img
         src={userInfomations.Avarta}
         alt='anh avatar'
         className='w-28 rounded-full'
        />
        <span
         style={{
          backgroundColor: userInfomations.status_Login ? '#31A24C' : '#999',
          width: '30px',
          height: '30px',
          borderRadius: '50%',
          // border: "1px solid #000",
          position: 'absolute',
          bottom: '3%',
          right: '3%',
         }}
        ></span>
       </Box>
       <Box
        sx={{
         overflow: 'hidden',
         width: '250px',
         textOverflow: 'ellipsis',
        }}
       >
        <Typography
         variant='h5'
         className='uppercase font-bold text-ellipsis overflow-hidden'
        >
         {userInfomations.name}
        </Typography>
        <Typography className='text-xl text-ellipsis overflow-hidden'>
         {userInfomations.user_name}
        </Typography>
        <Typography className='text-xl text-ellipsis overflow-hidden'>
         {userInfomations.gmail}
        </Typography>
        <Typography className='text-xl text-ellipsis overflow-hidden'>
         {`Join at ${convertDay[0]}, ${convertDay[1]} ${convertDay[2]}`}
        </Typography>
       </Box>
      </Box>
      <div className='flex flex-col justify-center items-end'>
       <div className='flex justify-center items-center'>
        <button
         style={{
          height: '40px',
          width: 'fit-content',
          whiteSpace: 'nowrap',
          border: 'none',
          alignItems: 'center',
          justifyContent: 'center',
          display: 'flex',
          background: '#3644C7',
          padding: '8px 10px',
          borderRadius: '5px',
          color: '#fff',
         }}
        >
         <svg
          style={{ marginRight: '5px' }}
          width='30'
          height='33'
          viewBox='0 0 49 33'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
         >
          <path
           d='M25.3901 16.5951C26.3568 15.5284 27.0988 14.3117 27.6161 12.9451C28.1335 11.5784 28.3915 10.1617 28.3901 8.69507C28.3901 7.2284 28.1315 5.81174 27.6141 4.44507C27.0968 3.0784 26.3555 1.86174 25.3901 0.795069C27.3901 1.06174 29.0568 1.94507 30.3901 3.44507C31.7235 4.94507 32.3901 6.69507 32.3901 8.69507C32.3901 10.6951 31.7235 12.4451 30.3901 13.9451C29.0568 15.4451 27.3901 16.3284 25.3901 16.5951ZM36.3901 32.6951V26.6951C36.3901 25.4951 36.1235 24.3531 35.5901 23.2691C35.0568 22.1851 34.3568 21.2271 33.4901 20.3951C35.1901 20.9951 36.7655 21.7704 38.2161 22.7211C39.6668 23.6717 40.3915 24.9964 40.3901 26.6951V32.6951H36.3901ZM40.3901 18.6951V14.6951H36.3901V10.6951H40.3901V6.69507H44.3901V10.6951H48.3901V14.6951H44.3901V18.6951H40.3901ZM16.3901 16.6951C14.1901 16.6951 12.3068 15.9117 10.7401 14.3451C9.17347 12.7784 8.39014 10.8951 8.39014 8.69507C8.39014 6.49507 9.17347 4.61174 10.7401 3.04507C12.3068 1.4784 14.1901 0.695068 16.3901 0.695068C18.5901 0.695068 20.4735 1.4784 22.0401 3.04507C23.6068 4.61174 24.3901 6.49507 24.3901 8.69507C24.3901 10.8951 23.6068 12.7784 22.0401 14.3451C20.4735 15.9117 18.5901 16.6951 16.3901 16.6951ZM0.390137 32.6951V27.0951C0.390137 25.9617 0.682137 24.9197 1.26614 23.9691C1.85014 23.0184 2.6248 22.2937 3.59014 21.7951C5.6568 20.7617 7.7568 19.9864 9.89014 19.4691C12.0235 18.9517 14.1901 18.6937 16.3901 18.6951C18.5901 18.6951 20.7568 18.9537 22.8901 19.4711C25.0235 19.9884 27.1235 20.7631 29.1901 21.7951C30.1568 22.2951 30.9321 23.0204 31.5161 23.9711C32.1001 24.9217 32.3915 25.9631 32.3901 27.0951V32.6951H0.390137Z'
           fill='white'
          />
         </svg>
         Add to your group
        </button>
        <button
         style={{
          height: '40px',
          width: 'fit-content',
          whiteSpace: 'nowrap',
          border: 'none',
          alignItems: 'center',
          justifyContent: 'center',
          display: 'flex',
          margin: '0 10px',
          background: '#3644C7',
          padding: '8px 10px',
          borderRadius: '5px',
          color: '#fff',
         }}
         onClick={handleChat}
        >
         <svg
          style={{ marginRight: '5px' }}
          width='25'
          height='41'
          viewBox='0 0 41 41'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
         >
          <path
           d='M20.3926 0.695068C31.6586 0.695068 40.3926 8.94907 40.3926 20.0951C40.3926 31.2411 31.6586 39.4951 20.3926 39.4951C18.4369 39.5001 16.4894 39.2418 14.6026 38.7271C14.2482 38.6296 13.8711 38.6572 13.5346 38.8051L9.56458 40.5571C9.32484 40.663 9.06274 40.7085 8.80132 40.6894C8.53991 40.6703 8.28719 40.5873 8.06538 40.4476C7.84356 40.308 7.65946 40.116 7.52924 39.8885C7.39902 39.661 7.32668 39.4051 7.31858 39.1431L7.21058 35.5831C7.20312 35.3665 7.15156 35.1536 7.05906 34.9576C6.96655 34.7616 6.83505 34.5865 6.67258 34.4431C2.78258 30.9631 0.392578 25.9271 0.392578 20.0951C0.392578 8.94907 9.12458 0.695068 20.3926 0.695068ZM8.38258 25.7691C7.81858 26.6631 8.91858 27.6711 9.76058 27.0311L16.0706 22.2431C16.2788 22.0859 16.5326 22.0008 16.7936 22.0008C17.0545 22.0008 17.3083 22.0859 17.5166 22.2431L22.1886 25.7431C22.5202 25.9921 22.8998 26.1697 23.3035 26.2646C23.7072 26.3595 24.1261 26.3697 24.534 26.2945C24.9418 26.2194 25.3296 26.0604 25.6729 25.8278C26.0162 25.5952 26.3076 25.294 26.5286 24.9431L32.4026 15.6231C32.9666 14.7271 31.8666 13.7191 31.0246 14.3571L24.7146 19.1491C24.5063 19.3063 24.2525 19.3913 23.9916 19.3913C23.7306 19.3913 23.4768 19.3063 23.2686 19.1491L18.5946 15.6491C18.263 15.4004 17.8836 15.2231 17.4801 15.1283C17.0766 15.0336 16.6579 15.0235 16.2503 15.0987C15.8427 15.1738 15.4552 15.3326 15.112 15.5651C14.7689 15.7975 14.4776 16.0985 14.2566 16.4491L8.38258 25.7691Z'
           fill='white'
          />
         </svg>
         Messenger
         <svg
          className='ml-1'
          width='30'
          height='30'
          viewBox='0 0 33 33'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
         >
          <path
           d='M8.39062 12.6951L16.3906 20.6951L24.3906 12.6951'
           stroke='white'
           strokeWidth='2'
           strokeLinecap='round'
           strokeLinejoin='round'
          />
         </svg>
        </button>
        <div
         style={{
          margin: '0px 10px 0 0',
          padding: '0 10px 0',
          display: 'flex',
          backgroundColor: '#999',
          alignItems: 'center',
          borderRadius: '20px',
          cursor: 'pointer',
          height: '39px',
         }}
         onClick={() =>
          navigate(`/user/incognito`, { state: { userInfomations } })
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
       </div>
      </div>
     </Box>
     <br />
     <Box className='flex-[4] h-[900px]'>
      {userNotes.length > 0 ? (
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
          }}
         >
          <TabList onChange={handleChange} aria-label='lab API tabs example'>
           <Tab label='Resent' value='1' />
           <Tab label='Recommended' value='2' />
          </TabList>
         </Box>
         <TabPanel value='1' sx={{ width: '1000px', padding: 0 }}>
          <div className='overflow-scroll w-full h-[700px] hide-scrollbar'>
           {userNotes &&
            userNotes.map((info, index) => (
             <div
              key={`slide ${index}`}
              className='p-2 border-[1px] h-[250px] rounded-xl border-black border-solid my-3'
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
               </div>
              </div>
              <Box
               component='div'
               sx={{
                color: 'text.main',
                margin: '10px 10px 0px',
                height: '120px',
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
               <Box
                component='div'
                sx={{
                 display: 'flex',
                 alignItems: 'center',
                 color: 'text.main',
                 justifyContent: 'flex-end',
                }}
               >
                <div
                 className='h-[30px] text-right cursor-pointer'
                 onClick={() => modalNote(info)}
                >
                 <svg
                  width='30'
                  height='30'
                  viewBox='0 0 30 30'
                  fill='none'
                  xmlns='http://www.w3.org/2000/svg'
                 >
                  <path
                   d='M25.7992 14.4002C25.8033 15.9841 25.4333 17.5465 24.7192 18.9602C23.8725 20.6543 22.5709 22.0792 20.9602 23.0754C19.3494 24.0715 17.4931 24.5995 15.5992 24.6002C14.0154 24.6044 12.453 24.2343 11.0392 23.5202L4.19922 25.8002L6.47922 18.9602C5.76514 17.5465 5.39509 15.9841 5.39922 14.4002C5.39995 12.5063 5.92795 10.6501 6.92408 9.03929C7.92021 7.42853 9.34512 6.12691 11.0392 5.28023C12.453 4.56615 14.0154 4.1961 15.5992 4.20023H16.1992C18.7004 4.33822 21.0629 5.39394 22.8342 7.16526C24.6055 8.93658 25.6612 11.299 25.7992 13.8002V14.4002Z'
                   stroke='black'
                   strokeWidth='1.8'
                   strokeLinecap='round'
                   strokeLinejoin='round'
                  />
                 </svg>
                 <span className='text-md mx-[2px]'>100</span>
                </div>
               </Box>
              </Box>
             </div>
            ))}
          </div>
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
   )}
   {isModalNote && (
    <ModalComments
     toggleModal={toggleModal}
     isModalNote={isModalNote}
     data={infoNote}
     userInfomations={userInfomations}
    />
   )}
  </Box>
 )
}

export default OtherUser
