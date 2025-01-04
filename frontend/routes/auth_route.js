import { Routes, Route } from 'react-router-dom'

import SignUpPage from '../src/pages/auth/SignUpPage'
import HomePage from '../src/pages/home/HomePage'
import LoginPage from '../src/pages/auth/LoginPage'

const AuthRoute = () => {
    return (
        <Routes>
            <Route path='/' element={<HomePage />} />
            <Route path='/login' element={<LoginPage />} />
            <Route path='/signup' element={<SignUpPage />} />
        </Routes>
    );
};

export default AuthRoute;