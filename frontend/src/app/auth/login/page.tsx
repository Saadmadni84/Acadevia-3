'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { FiPhone, FiUser, FiShield } from 'react-icons/fi';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [userType, setUserType] = useState<'student' | 'admin'>('student');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phoneNumber || phoneNumber.length < 10) {
      toast.error('Please enter a valid phone number');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber,
          userType
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('OTP sent successfully!');
        router.push(`/auth/verify-otp?phone=${phoneNumber}&type=${userType}`);
      } else {
        toast.error(data.message || 'Failed to send OTP');
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
  <div 
    className="min-h-screen flex items-center justify-center bg-cover bg-center bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-4"
    style={{
      backgroundImage: "url('/images/school-bg.jpg')",
    }}
  >
    {/* Dark overlay for better form visibility */}
    <div className="absolute inset-0 bg-black/40" />
    
    {/* Login Form */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative z-10 w-full max-w-md"
    >
      <Card className="backdrop-blur-lg bg-white/95 shadow-2xl border-0">
        <div className="p-8">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: 0.1
              }}
              className="w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center"
            >
              <span className="text-3xl">🎮</span>
            </motion.div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Acadeveia
            </h1>
            <p className="text-gray-600 mt-2">Where Learning Meets Gaming</p>
          </div>

          {/* User Type Selection */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setUserType('student')}
              className={`p-4 rounded-xl border-2 transition-all ${
                userType === 'student'
                  ? 'border-purple-500 bg-purple-50 text-purple-700'
                  : 'border-gray-200 bg-white text-gray-600'
              }`}
            >
              <FiUser className="w-6 h-6 mx-auto mb-2" />
              <span className="font-semibold">Student</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setUserType('admin')}
              className={`p-4 rounded-xl border-2 transition-all ${
                userType === 'admin'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-white text-gray-600'
              }`}
            >
              <FiShield className="w-6 h-6 mx-auto mb-2" />
              <span className="font-semibold">Admin</span>
            </motion.button>
          </div>

          {/* Phone Number Input */}
          <form onSubmit={handleSendOTP} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <FiPhone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Enter your phone number"
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  maxLength={10}
                  pattern="[0-9]*"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3 rounded-xl font-semibold transform transition-all hover:scale-105"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle 
                      className="opacity-25" 
                      cx="12" 
                      cy="12" 
                      r="10" 
                      stroke="currentColor" 
                      strokeWidth="4" 
                      fill="none" 
                    />
                    <path 
                      className="opacity-75" 
                      fill="currentColor" 
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" 
                    />
                  </svg>
                  Sending OTP...
                </span>
              ) : (
                'Get Started'
              )}
            </Button>
          </form>

          {/* Footer Links */}
          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-gray-600">
              New to Acadeveia?{' '}
              <Link href="/auth/register" className="text-purple-600 hover:underline font-semibold">
                Create Account
              </Link>
            </p>
            <p className="text-xs text-gray-500">
              By continuing, you agree to our{' '}
              <Link href="/terms" className="underline">Terms</Link> and{' '}
              <Link href="/privacy" className="underline">Privacy Policy</Link>
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  </div>
);
}