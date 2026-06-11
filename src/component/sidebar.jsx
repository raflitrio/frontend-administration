import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { Menu } from "lucide-react"; // ikon hamburger

const menuItems = [
  { 
    name: 'Dashboard', 
    path: '/', 
    icon: (
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        height="24px" 
        viewBox="0 -960 960 960" 
        width="24px" 
        fill="#e3e3e3"
      >
        <path d="M520-600v-240h320v240H520ZM120-440v-400h320v400H120Zm400 320v-400h320v400H520Zm-400 0v-240h320v240H120Zm80-400h160v-240H200v240Zm400 320h160v-240H600v240Zm0-480h160v-80H600v80ZM200-200h160v-80H200v80Z"/>
      </svg>
    )
  },
  { name: 'kategori', path: '/kategori', icon: (
    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"
    >
      <path d="m260-520 220-360 220 360H260ZM700-80q-75 0-127.5-52.5T520-260q0-75 52.5-127.5T700-440q75 0 127.5 52.5T880-260q0 75-52.5 127.5T700-80Zm-580-20v-320h320v320H120Zm580-60q42 0 71-29t29-71q0-42-29-71t-71-29q-42 0-71 29t-29 71q0 42 29 71t71 29Zm-500-20h160v-160H200v160Zm202-420h156l-78-126-78 126Zm78 0ZM360-340Zm340 80Z"/>
    </svg>
    ) 
},
  { name: 'Komunitas', path: '/komunitas', icon: (
    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"
    >
      <path d="M0-240v-63q0-43 44-70t116-27q13 0 25 .5t23 2.5q-14 21-21 44t-7 48v65H0Zm240 0v-65q0-32 17.5-58.5T307-410q32-20 76.5-30t96.5-10q53 0 97.5 10t76.5 30q32 20 49 46.5t17 58.5v65H240Zm540 0v-65q0-26-6.5-49T754-397q11-2 22.5-2.5t23.5-.5q72 0 116 26.5t44 70.5v63H780Zm-455-80h311q-10-20-55.5-35T480-370q-55 0-100.5 15T325-320ZM160-440q-33 0-56.5-23.5T80-520q0-34 23.5-57t56.5-23q34 0 57 23t23 57q0 33-23 56.5T160-440Zm640 0q-33 0-56.5-23.5T720-520q0-34 23.5-57t56.5-23q34 0 57 23t23 57q0 33-23 56.5T800-440Zm-320-40q-50 0-85-35t-35-85q0-51 35-85.5t85-34.5q51 0 85.5 34.5T600-600q0 50-34.5 85T480-480Zm0-80q17 0 28.5-11.5T520-600q0-17-11.5-28.5T480-640q-17 0-28.5 11.5T440-600q0 17 11.5 28.5T480-560Zm1 240Zm-1-280Z"/>
    </svg>
    ) 
},
  { name: 'Data', path: '/info', icon: (
    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"
    >
      <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-507h560v-133H200v133Zm0 214h560v-134H200v134Zm0 213h560v-133H200v133Zm40-454v-80h80v80h-80Zm0 214v-80h80v80h-80Zm0 214v-80h80v80h-80Z"/>
    </svg>
    ) 
},

{ name: 'Afiliate', path: '/sales', icon: (
    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"
    >
      <path d="M160-120q-50 0-85-35t-35-85q0-50 35-85t85-35q9 0 17.5 1.5T194-355l162-223q-17-21-26.5-47t-9.5-55q0-66 47-113t113-47q66 0 113 47t47 113q0 29-10 55t-27 47l163 223q8-2 16.5-3.5T800-360q50 0 85 35t35 85q0 50-35 85t-85 35q-50 0-85-35t-35-85q0-19 5.5-36.5T701-308L539-531q-5 2-9.5 3t-9.5 3v172q35 12 57.5 43t22.5 70q0 50-35 85t-85 35q-50 0-85-35t-35-85q0-39 22.5-69.5T440-353v-172q-5-2-9.5-3t-9.5-3L259-308q10 14 15.5 31.5T280-240q0 50-35 85t-85 35Zm0-80q17 0 28.5-11.5T200-240q0-17-11.5-28.5T160-280q-17 0-28.5 11.5T120-240q0 17 11.5 28.5T160-200Zm320-480Zm0 480q17 0 28.5-11.5T520-240q0-17-11.5-28.5T480-280q-17 0-28.5 11.5T440-240q0 17 11.5 28.5T480-200Zm320 0q17 0 28.5-11.5T840-240q0-17-11.5-28.5T800-280q-17 0-28.5 11.5T760-240q0 17 11.5 28.5T800-200Zm-640-40Zm320 0Zm320 0ZM480-600q33 0 56.5-23.5T560-680q0-33-23.5-56.5T480-760q-33 0-56.5 23.5T400-680q0 33 23.5 56.5T480-600Z"/>
    </svg>
    ) 
},

];


const Sidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const currentPage = location.pathname;
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
  logout(); // clear auth context
  navigate("/login");
};

  return (
    <aside
      className={`fixed top-0 left-0 h-full ${
        isOpen ? "w-64" : "w-20"
      } bg-gradient-to-r from-[#243748] to-[#4b749f] flex flex-col justify-between shadow-lg z-40 transition-all duration-300`}
    >
      {/* Header dengan tombol hamburger */}
      <div className="flex items-center h-20 px-4 border-b border-white/30 bg-[#08203e]">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-white hover:bg-white/20 p-2 rounded-lg"
        >
          <Menu size={24} />
        </button>
        {isOpen && (
          <div className="ml-3 flex items-baseline gap-2">
            <span className="text-white text-2xl font-bold">FUNRun</span>
          </div>
        )}
      </div>

      {/* Menu */}
      <nav className="flex-1 px-2 py-6">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.name}>
              <Link
                to={item.path}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg font-medium transition-colors duration-200 text-base ${
                  currentPage === item.path
                    ? "bg-blue-600 text-white shadow"
                    : "text-blue-300 hover:bg-white/20 hover:text-white"
                }`}
              >
                {typeof item.icon === "string" ? (
                  <img src={item.icon} alt={item.name} className="w-6 h-6" />
                ) : (
                  item.icon
                )}
                {isOpen && <span>{item.name}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout */}
      <div className="px-2 pb-6">
        <button
          className="w-full flex items-center justify-center gap-2 bg-[#e93a28] hover:bg-red-600 text-white font-semibold py-3 rounded-lg transition-all duration-200"
          onClick={handleLogout}
        >
          {isOpen ? "Log out" : "⏻"}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
