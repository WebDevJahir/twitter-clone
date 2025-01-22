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

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div className="flex max-w-6xl mx-auto">
        <Sidebar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/notifications" element={<NotificationPage />} />
          <Route path="/profile/johndoe" element={<ProfilePage />} />
        </Routes>
        <RightPanel />
        <Toaster />
      </div>
    </>
  )
}

export default App
