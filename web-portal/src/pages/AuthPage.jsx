import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { authAPI } from '../utils/api';
import { FcGoogle } from 'react-icons/fc';
import { FaApple } from 'react-icons/fa';
import logoNew from '../assets/logo-new.png'; 
import authHero from '../assets/auth-hero.jpg'; 

const AuthPage = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  
  // State untuk toggle antara Login dan Register view
  const [isLoginView, setIsLoginView] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // State tunggal untuk menangani input form baik login maupun register
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '', // Hanya untuk register
    role: 'patient', // Default role untuk register
    medical_license: '', // Hanya untuk dokter/terapis
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(''); // Hapus error saat user mengetik
  };

  // Fungsi untuk berpindah mode dan reset form
  const toggleView = () => {
    setIsLoginView(!isLoginView);
    setError('');
    setFormData({
      email: '',
      password: '',
      name: '',
      role: 'patient',
      medical_license: '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLoginView) {
        // --- Logika Login ---
        const response = await authAPI.login(formData.email, formData.password);
        if (response.success) {
          login(response.token, response.user);
          navigate('/dashboard');
        } else {
          setError(response.message || 'Login failed');
        }
      } else {
        // --- Logika Register ---
        // Validasi sederhana
        if (!formData.name || !formData.email || !formData.password) {
            throw new Error('Please fill in all required fields.');
        }
        if ((formData.role === 'doctor' || formData.role === 'therapist') && !formData.medical_license) {
             throw new Error('Medical license is required for doctors and therapists.');
        }

        // Backend mengharapkan object user utuh
        const response = await authAPI.register(formData);
        if (response.success) {
          // Auto-login setelah register berhasil
          login(response.token, response.user);
          navigate('/dashboard');
        } else {
          setError(response.message || 'Registration failed. Please try again.');
        }
      }
    } catch (err) {
      console.error("Auth Error:", err);
      setError(err.message || 'An error occurred. Check connection.');
    } finally {
      setLoading(false);
    }
  };

  // Placeholder untuk Social Login (Backend belum siap)
  const handleSocialPlaceholder = () => {
    alert("Social login integration coming soon!");
  };

  return (
    <div className="flex min-h-screen w-full bg-bg-primary">
      {/* --- BAGIAN KIRI: FORM (Akan penuh di mobile, setengah di desktop) --- */}
      <div className="w-full md:w-1/2 flex flex-col justify-center p-8 md:p-16 lg:p-24 overflow-y-auto">
        <div className="w-full max-w-md mx-auto">
            {/* Logo */}
            <div className="mb-10">
                <img src={logoNew} alt="Doctor Stroke Logo" className="h-16 w-auto" />
            </div>

            {/* Header Dinamis */}
            <h1 className="text-4xl font-bold text-text-primary mb-2">
                {isLoginView ? 'Welcome back' : 'Create account'}
            </h1>
            <p className="text-text-secondary mb-8">
                {isLoginView 
                ? 'Welcome back! Please enter your details.' 
                : 'Start your journey to better recovery tracking.'}
            </p>

            {/* Tombol Social Login (Placeholder UI) */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button onClick={handleSocialPlaceholder} className="flex-1 flex items-center justify-center gap-2 py-3 border border-border-color rounded-lg font-medium text-text-primary hover:bg-bg-secondary transition-colors">
                    <FcGoogle size={24} /> <span>Google</span>
                </button>
                <button onClick={handleSocialPlaceholder} className="flex-1 flex items-center justify-center gap-2 py-3 border border-border-color rounded-lg font-medium text-text-primary hover:bg-bg-secondary transition-colors">
                    <FaApple size={24} /> <span>Apple</span>
                </button>
            </div>

            {/* Divider */}
            <div className="relative flex items-center justify-center mb-8">
                <div className="border-t border-border-color w-full absolute"></div>
                <span className="bg-bg-primary px-4 text-text-secondary relative z-10">OR</span>
            </div>

            {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">{error}</div>}

            {/* Main Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Field Nama (Hanya muncul saat Register) */}
                {!isLoginView && (
                <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">Full Name</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg bg-bg-primary border border-border-color focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all"
                        placeholder="Enter your name"
                        required={!isLoginView}
                    />
                </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">Email</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg bg-bg-primary border border-border-color focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all"
                        placeholder="Enter your email"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">Password</label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg bg-bg-primary border border-border-color focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all"
                        placeholder="••••••••"
                        required
                    />
                </div>

                {/* Field Role & License (Hanya muncul saat Register) */}
                {!isLoginView && (
                <>
                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-2">I am a...</label>
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg bg-bg-primary border border-border-color focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all"
                        >
                            <option value="patient">Patient / Caregiver</option>
                            <option value="doctor">Doctor</option>
                            <option value="therapist">Therapist</option>
                        </select>
                    </div>

                    {(formData.role === 'doctor' || formData.role === 'therapist') && (
                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-2">Medical License Number</label>
                        <input
                            type="text"
                            name="medical_license"
                            value={formData.medical_license}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg bg-bg-primary border border-border-color focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all"
                            placeholder="Enter license number"
                            required
                        />
                    </div>
                    )}
                </>
                )}

                {isLoginView && (
                    <div className="flex justify-end">
                        <button type="button" className="text-sm text-accent font-semibold hover:underline">Forgot password?</button>
                    </div>
                )}

                <button type="submit" disabled={loading} className="w-full bg-accent text-white font-bold py-3 px-4 rounded-lg hover:bg-accent-dark transition-colors disabled:opacity-70">
                    {loading ? 'Processing...' : (isLoginView ? 'Sign In' : 'Create account')}
                </button>
            </form>

            {/* Toggle Link untuk berpindah mode */}
            <p className="mt-8 text-center text-text-secondary">
                {isLoginView ? "Don't have an account?" : "Already have an account?"}
                <button onClick={toggleView} className="ml-2 text-accent font-bold hover:underline focus:outline-none">
                    {isLoginView ? 'Sign up for free' : 'Log in'}
                </button>
            </p>
        </div>
      </div>

      {/* --- BAGIAN KANAN: GAMBAR HERO (Disembunyikan di mobile) --- */}
      {/* Menggunakan 'bg-cover' dan 'bg-center' agar gambar mengisi area tanpa distorsi parah, sesuai desain referensi */}
      <div className="hidden md:block md:w-1/2 relative bg-bg-secondary overflow-hidden">
        <div 
            className="absolute inset-0 bg-cover bg-center z-0" 
            style={{ backgroundImage: `url(${authHero})` }} 
            alt="Recovery process"
        />
        {/* Overlay Gradient agar teks terbaca */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10 flex flex-col justify-end p-16">
            <blockquote className="text-white max-w-lg">
                <p className="text-3xl font-bold leading-tight mb-4">"Data-driven care for better stroke recovery outcomes."</p>
                <footer className="text-lg text-gray-300">— Doctor Stroke Platform</footer>
            </blockquote>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;