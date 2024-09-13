import { Navigate, Outlet } from 'react-router-dom'
import UserPanel from '../components/UserPanel'

const RootLayout = () => {
 const isLogin = JSON.parse(localStorage.getItem('USER'))

 return isLogin ? (
  <section className='vw-100 min-vh-100'>
   <UserPanel />
  </section>
 ) : (
  <Navigate to='/login' />
 )
}

export default RootLayout
