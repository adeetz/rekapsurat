import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Eye, EyeOff, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { authAPI } from '../services/api';

const EnvelopeAnimation = () => (
 <motion.div 
   initial={{ scale: 0 }}
   animate={{ scale: 1 }}
   transition={{ duration: 0.5 }}
   className="relative w-64 h-64 mb-8"
 >
   {/* Envelope Body */}
   <motion.div 
     initial={{ rotateX: 0 }}
     animate={{ rotateX: [0, -180, -360], y: [0, -20, 0] }}
     transition={{ duration: 3, repeat: Infinity, repeatDelay: 1 }}
     className="absolute w-full h-48 bg-blue-600 rounded-lg shadow-lg"
     style={{ transformStyle: 'preserve-3d' }}
   >
     {/* Front Flap */}
     <motion.div
       initial={{ rotateX: 0 }}
       animate={{ rotateX: [0, 180, 0] }}
       transition={{ duration: 3, repeat: Infinity, repeatDelay: 1 }}
       className="absolute top-0 left-0 w-full h-24 origin-bottom bg-blue-500"
       style={{ 
         clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 50%, 0 100%)',
         transformStyle: 'preserve-3d'
       }}
     />
     
     {/* Letter */}
     <motion.div
       initial={{ y: 0 }}
       animate={{ y: [-80, -20, -80] }}
       transition={{ duration: 3, repeat: Infinity, repeatDelay: 1 }}
       className="absolute top-0 w-48 h-32 -translate-x-1/2 bg-white rounded shadow-md left-1/2"
     >
       <div className="p-2">
         <div className="w-full h-2 mb-2 bg-gray-200 rounded"></div>
         <div className="w-3/4 h-2 mb-2 bg-gray-200 rounded"></div>
         <div className="w-1/2 h-2 bg-gray-200 rounded"></div>
       </div>
     </motion.div>
   </motion.div>
 </motion.div>
);

export default function Login() {
 const navigate = useNavigate();
 const [formData, setFormData] = useState({
   username: '',
   password: ''
 });
 const [error, setError] = useState('');
 const [showPassword, setShowPassword] = useState(false);
 const [isLoading, setIsLoading] = useState(false);

 const handleSubmit = async (e) => {
   e.preventDefault();
   setError('');
   setIsLoading(true);

   try {
     const response = await authAPI.login(formData);
     console.log('Login response:', response);

     if (response.status === 'success') {
       localStorage.setItem('user', JSON.stringify(response.data));
       localStorage.setItem('isAuthenticated', 'true');
       toast.success('Login berhasil!');
       navigate('/dashboard');
     } else {
       setError(response.message || 'Username atau password salah!');
       toast.error(response.message || 'Username atau password salah!');
     }
   } catch (error) {
     console.error('Login error:', error);
     setError(error.message || 'Gagal melakukan login!');
     toast.error(error.message || 'Gagal melakukan login!');
   } finally {
     setIsLoading(false);
   }
 };

 const handleChange = (e) => {
   setFormData({
     ...formData,
     [e.target.name]: e.target.value
   });
   setError('');
 };

 return (
   <div className="flex w-screen h-screen overflow-hidden">
     {/* Left Side - Login Form */}
     <div className="flex items-center justify-center w-full p-8 lg:w-1/2 bg-gradient-to-br from-blue-50 via-white to-purple-50">
       <motion.div 
         initial={{ opacity: 0, x: -20 }}
         animate={{ opacity: 1, x: 0 }}
         transition={{ duration: 0.6 }}
         className="w-full max-w-md p-8 space-y-8 border shadow-2xl bg-white/80 backdrop-blur-lg rounded-2xl border-white/20"
       >
         {/* Logo and Title */}
         <div className="space-y-2 text-center">
           <motion.div 
             className="flex justify-center"
             whileHover={{ scale: 1.05 }}
           >
             <div className="p-3 bg-blue-600 shadow-lg rounded-2xl">
               <Mail className="w-8 h-8 text-white" />
             </div>
           </motion.div>
           <h2 className="mt-4 text-3xl font-bold tracking-tight text-gray-900">
             Selamat Datang
           </h2>
           <p className="text-sm text-gray-600">
             Silakan masuk ke akun Anda
           </p>
         </div>

         <form onSubmit={handleSubmit} className="mt-8 space-y-6">
           {error && (
             <motion.div
               initial={{ opacity: 0, y: -10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -10 }}
               className="p-4 border-l-4 border-red-500 rounded-lg bg-red-50"
             >
               <p className="text-sm text-red-600">{error}</p>
             </motion.div>
           )}

           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.2 }}
             className="space-y-4"
           >
             {/* Username Input */}
             <div className="relative group">
               <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                 <User className="w-5 h-5 text-blue-500 transition-colors group-focus-within:text-blue-600" />
               </div>
               <input
                 id="username"
                 name="username"
                 type="text"
                 required
                 disabled={isLoading}
                 className="block w-full py-3 pl-10 pr-3 text-gray-900 transition-all duration-200 ease-in-out bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400"
                 placeholder="Masukkan username"
                 value={formData.username}
                 onChange={handleChange}
               />
             </div>

             {/* Password Input */}
             <div className="relative group">
               <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                 <Lock className="w-5 h-5 text-blue-500 transition-colors group-focus-within:text-blue-600" />
               </div>
               <input
                 id="password"
                 name="password"
                 type={showPassword ? 'text' : 'password'}
                 required
                 disabled={isLoading}
                 className="block w-full py-3 pl-10 pr-10 text-gray-900 transition-all duration-200 ease-in-out bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400"
                 placeholder="Masukkan password"
                 value={formData.password}
                 onChange={handleChange}
               />
               <button
                 type="button"
                 className="absolute inset-y-0 right-0 flex items-center pr-3 transition-opacity duration-200 hover:opacity-75"
                 onClick={() => setShowPassword(!showPassword)}
                 disabled={isLoading}
               >
                 {showPassword ? (
                   <EyeOff className="w-5 h-5 text-gray-500" />
                 ) : (
                   <Eye className="w-5 h-5 text-gray-500" />
                 )}
               </button>
             </div>
           </motion.div>

           {/* Submit Button */}
           <motion.button
             whileHover={{ scale: 1.01 }}
             whileTap={{ scale: 0.99 }}
             type="submit"
             disabled={isLoading}
             className="relative w-full group"
           >
             <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-200"></div>
             <div className="relative flex items-center justify-center w-full px-6 py-3 transition-all duration-200 bg-blue-600 rounded-xl group-hover:bg-blue-700">
               <span className="text-base font-semibold text-white">
                 {isLoading ? 'Memproses...' : 'Masuk'}
               </span>
             </div>
           </motion.button>
         </form>
       </motion.div>
     </div>

     {/* Right Side - Animation */}
     <div className="items-center justify-center hidden w-1/2 lg:flex bg-gradient-to-br from-blue-600 to-blue-800">
       <div className="text-center">
         <EnvelopeAnimation />
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.5 }}
           className="text-white"
         >
           <h1 className="mb-4 text-4xl font-bold">Sistem Manajemen Surat</h1>
           <p className="text-lg text-blue-100">
             Kelola surat masuk dan keluar dengan mudah dan efisien
           </p>
         </motion.div>
       </div>
     </div>
   </div>
 );
}