import { Navigate, Outlet } from 'react-router-dom'

const AuthLayout = () => {
 const isLogin = JSON.parse(localStorage.getItem('USER'))
 return isLogin ? <Navigate to='/' /> : <Outlet />
}

export default AuthLayout
