import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import SignUpPage from '../src/pages/auth/SignUpPage'
import HomePage from './pages/home/HomePage'
import LoginPage from '../src/pages/auth/LoginPage'
import Sidebar from './components/common/Sidebar'
import RightPanel from './components/common/RightPanel'
import NotificationPage from './pages/notifications/NotificationPage'
import ProfilePage from './pages/profile/ProfilePage'
import { Toaster } from 'react-hot-toast'
import { useQuery } from '@tanstack/react-query'
import { Navigate } from 'react-router-dom'

function App() {
  const [count, setCount] = useState(0)

  const { data: authUser, isLoading, isError, error } = useQuery({
    queryKey: ['authData'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/auth/me')
        const data = await response.json()
        console.log('data', data)
        if (data.error) {
          return null
        }

        if (!response.ok || data.message === "Unauthorized: No Token Provided") {
          return null; // Return null if unauthorized
        }

        if (data.error) {
          throw new Error(data.error)
        }
        return data
      } catch (error) {
        throw error
      }
    },
    retry: 1,
  })

  console.log('authUser', authUser)

  return (
    <>
      <div className="flex max-w-6xl mx-auto">
        {authUser && <Sidebar />}
        <Routes>
          <Route path="/" element={authUser ? <HomePage /> : <Navigate to='/login' />} />
          <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to='/' />} />
          <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to='/' />} />
          <Route path="/notifications" element={authUser ? <NotificationPage /> : <Navigate to='/login' />} />
          <Route path="/profile/johndoe" element={authUser ? <ProfilePage /> : <Navigate to='/login' />} />
        </Routes>
        {authUser && <RightPanel />}
        <Toaster />
      </div>
    </>
  )
}

export default App
