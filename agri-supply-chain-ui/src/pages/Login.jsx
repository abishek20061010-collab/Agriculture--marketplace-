import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Login = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('farmer');

  useEffect(() => {
    document.title = "AgriChain | Login";
  }, []);
  
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    location: ''
  });
  
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);

  const validateField = (name, value) => {
    let error = '';
    if (name === 'id') {
      if (!value) error = 'ID is required';
      else if (!/^\d+$/.test(value) || parseInt(value) <= 0) error = 'ID must be a positive number';
    }
    if (name === 'name') {
      if (!value) error = 'Name is required';
      else if (value.trim().length < 2) error = 'Name must be at least 2 characters';
    }
    if (name === 'location') {
      if (!value) error = 'Location is required';
    }
    return error;
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched({ ...touched, [name]: true });
    const error = validateField(name, value);
    setErrors({ ...errors, [name]: error });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (touched[name]) {
      setErrors({ ...errors, [name]: validateField(name, value) });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate all
    const newErrors = {
      id: validateField('id', formData.id),
      name: validateField('name', formData.name),
      location: validateField('location', formData.location)
    };
    
    setErrors(newErrors);
    setTouched({ id: true, name: true, location: true });
    
    if (Object.values(newErrors).some(err => err)) return;
    
    setLoading(true);
    
    // Simulate API call and store in localStorage
    setTimeout(() => {
      const user = {
        id: parseInt(formData.id),
        name: formData.name.trim(),
        location: formData.location.trim(),
        role: role
      };
      
      localStorage.setItem('user', JSON.stringify(user));
      toast.success(`Welcome, ${user.name}! 🌾`);
      navigate(`/${role}`);
    }, 800);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-agri-bg">
      <style>{`
        @keyframes float {
          0% { transform: translateY(100vh) rotate(0deg); opacity: 0; }
          10% { opacity: 0.15; }
          90% { opacity: 0.15; }
          100% { transform: translateY(-20vh) rotate(360deg); opacity: 0; }
        }
        .leaf {
          position: absolute;
          bottom: -10%;
          opacity: 0;
          animation: float 15s infinite linear;
        }
      `}</style>
      
      {/* LEFT PANEL */}
      <div className="hidden md:flex flex-col w-[40%] bg-agri-green text-white p-12 relative overflow-hidden justify-between">
        {/* Floating Leaves Background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="leaf left-[10%] text-4xl" style={{ animationDelay: '0s', animationDuration: '18s' }}>🍃</div>
          <div className="leaf left-[30%] text-5xl" style={{ animationDelay: '5s', animationDuration: '22s' }}>🍂</div>
          <div className="leaf left-[50%] text-3xl" style={{ animationDelay: '2s', animationDuration: '15s' }}>🍃</div>
          <div className="leaf left-[70%] text-6xl" style={{ animationDelay: '8s', animationDuration: '25s' }}>🍁</div>
          <div className="leaf left-[85%] text-4xl" style={{ animationDelay: '12s', animationDuration: '19s' }}>🍃</div>
        </div>

        <div className="relative z-10">
          <h1 className="text-[28px] font-bold mb-2">🌾 AgriChain</h1>
          <p className="text-[14px] opacity-85 mb-12">Smart Agricultural Supply Chain</p>
          
          <div className="space-y-6">
            <div className="flex items-start gap-3">
              <div className="mt-1 bg-white/20 p-1 rounded-full text-xs">✓</div>
              <p className="text-[15px]">Real-time crop & order tracking</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 bg-white/20 p-1 rounded-full text-xs">✓</div>
              <p className="text-[15px]">Instant payment processing</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 bg-white/20 p-1 rounded-full text-xs">✓</div>
              <p className="text-[15px]">Warehouse & transport management</p>
            </div>
          </div>
        </div>

        {/* SVG Illustration */}
        <div className="relative z-10 my-8 opacity-90">
          <svg viewBox="0 0 200 100" className="w-full h-auto drop-shadow-xl" xmlns="http://www.w3.org/2000/svg">
            <circle cx="160" cy="30" r="15" fill="#F4A300" opacity="0.9" />
            <path d="M0,80 Q50,40 100,80 T200,80 L200,100 L0,100 Z" fill="#2d8a50" />
            <path d="M-20,90 Q40,60 120,90 T220,90 L220,100 L-20,100 Z" fill="#155a31" />
            <rect x="30" y="65" width="4" height="20" fill="#8B4513" />
            <circle cx="32" cy="65" r="8" fill="#4CAF50" />
            <rect x="80" y="55" width="4" height="30" fill="#8B4513" />
            <circle cx="82" cy="55" r="10" fill="#4CAF50" />
            <rect x="140" y="70" width="3" height="15" fill="#8B4513" />
            <circle cx="141" cy="70" r="7" fill="#4CAF50" />
          </svg>
        </div>

        <div className="relative z-10 text-[11px] opacity-50 font-medium">
          Powered by Smart Agri DB
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-full md:w-[60%] bg-white flex items-center justify-center p-6 overflow-y-auto">
        <div className="w-full max-w-[420px] bg-white rounded-2xl shadow-xl p-10 border border-gray-100">
          <div className="mb-8 text-center md:text-left">
            <h2 className="text-[22px] font-semibold text-[#1a2e1a] mb-1">Welcome Back</h2>
            <p className="text-[14px] text-gray-500">Select your role to continue</p>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-8">
            <button
              type="button"
              onClick={() => { setRole('farmer'); setErrors({}); setTouched({}); }}
              className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-200 ${
                role === 'farmer' 
                  ? 'bg-agri-green text-white ring-2 ring-agri-green ring-offset-2' 
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-agri-green hover:bg-agri-pale'
              }`}
            >
              <span className="text-2xl mb-1">🧑‍🌾</span>
              <span className="font-semibold mb-1 text-sm">Farmer</span>
              <span className={`text-[9px] text-center px-1 leading-tight ${role === 'farmer' ? 'text-white/80' : 'text-gray-400'}`}>
                View crops & revenue
              </span>
            </button>

            <button
              type="button"
              onClick={() => { setRole('warehouse'); setErrors({}); setTouched({}); }}
              className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-200 ${
                role === 'warehouse' 
                  ? 'bg-agri-green text-white ring-2 ring-agri-green ring-offset-2' 
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-agri-green hover:bg-agri-pale'
              }`}
            >
              <span className="text-2xl mb-1">🏭</span>
              <span className="font-semibold mb-1 text-sm">Warehouse</span>
              <span className={`text-[9px] text-center px-1 leading-tight ${role === 'warehouse' ? 'text-white/80' : 'text-gray-400'}`}>
                Admin — manage everything
              </span>
            </button>

            <button
              type="button"
              onClick={() => { setRole('buyer'); setErrors({}); setTouched({}); }}
              className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-200 ${
                role === 'buyer' 
                  ? 'bg-agri-green text-white ring-2 ring-agri-green ring-offset-2' 
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-agri-green hover:bg-agri-pale'
              }`}
            >
              <span className="text-2xl mb-1">🛒</span>
              <span className="font-semibold mb-1 text-sm">Buyer</span>
              <span className={`text-[9px] text-center px-1 leading-tight ${role === 'buyer' ? 'text-white/80' : 'text-gray-400'}`}>
                Browse crops & order
              </span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {role === 'farmer' ? 'Farmer ID' : role === 'warehouse' ? 'Warehouse ID' : 'Buyer ID'}
              </label>
              <input
                type="number"
                name="id"
                value={formData.id}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter your ID (e.g., 101)"
                className={`w-full px-4 py-2.5 rounded-lg border ${
                  errors.id && touched.id ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-agri-green focus:border-agri-green'
                } focus:outline-none focus:ring-1 transition-colors`}
              />
              {errors.id && touched.id && <p className="mt-1 text-xs text-red-500">{errors.id}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter your full name"
                className={`w-full px-4 py-2.5 rounded-lg border ${
                  errors.name && touched.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-agri-green focus:border-agri-green'
                } focus:outline-none focus:ring-1 transition-colors`}
              />
              {errors.name && touched.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location / City</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="e.g., Chennai"
                className={`w-full px-4 py-2.5 rounded-lg border ${
                  errors.location && touched.location ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-agri-green focus:border-agri-green'
                } focus:outline-none focus:ring-1 transition-colors`}
              />
              {errors.location && touched.location && <p className="mt-1 text-xs text-red-500">{errors.location}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 bg-agri-green hover:bg-[#155a31] text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex justify-center items-center shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading...
                </>
              ) : (
                `Enter as ${role === 'farmer' ? '🧑‍🌾 Farmer' : role === 'warehouse' ? '🏭 Warehouse' : '🛒 Buyer'}`
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
