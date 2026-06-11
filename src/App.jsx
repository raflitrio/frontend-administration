import { Routes, Route, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Sidebar from './component/sidebar';
import Home from './component/home';
import Kategori from './component/kategori';
import Komunitas from './component/komunitas';
import Login from './component/login';
import Register from './component/register';
import ProtectedRoute from './component/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import Sales from './component/sales';
import PriceRange from './component/pricerange';
import Info from './component/info';

function App() {
  const location = useLocation();
  const isAuthPage = ["/login", "/register"].includes(location.pathname);
  const [isOpen, setIsOpen] = useState(true); // sidebar state

  return (
    <AuthProvider>
      <div className="min-h-screen flex relative">
        {!isAuthPage && <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />}

        <main
          className={`flex-1 transition-all duration-300 ${
            !isAuthPage ? (isOpen ? "ml-64" : "ml-20") : ""
          }`}
        >
          <Routes>
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path="/kategori"
              element={
                <ProtectedRoute>
                  <Kategori />
                </ProtectedRoute>
              }
            />
            <Route
              path="/komunitas"
              element={
                <ProtectedRoute>
                  <Komunitas />
                </ProtectedRoute>
              }
            />
            <Route
              path="/info"
              element={
                <ProtectedRoute>
                  <Info />
                </ProtectedRoute>
              }
            />
            <Route
              path="/sales"
              element={
                <ProtectedRoute>
                  <Sales />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pricerange"
              element={
                <ProtectedRoute>
                  <PriceRange />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>

        {!isAuthPage}
        <ToastContainer 
        position="top-right" 
        autoClose={3000} 
        hideProgressBar={false} 
        newestOnTop={false} 
        closeOnClick 
        rtl={false} 
        pauseOnFocusLoss 
        draggable 
        pauseOnHover 
        theme="light"
      />
      </div>
    </AuthProvider>
  );
}

export default App;
