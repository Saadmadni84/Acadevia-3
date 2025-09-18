'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/common/Header';
import { Sidebar} from '@/components/common/Sidebar';
import { Card } from '@/components/ui/Card';
import { LineChart } from '@/components/charts/LineChart';
import { PieChart } from '@/components/charts/PieChart';
import { FiTrendingUp, FiAward, FiBook, FiTarget } from 'react-icons/fi';
import { useRouter } from 'next/navigation';

interface DashboardStats {
    totalPoints: number;
    globalRank: number;
    streakDays: number;
    completedLessons: number;
    averageScore: number;
    enrolledCourses: number;
    upcomingTests: number;
    recentBadges: Badge[];
}

interface Badge {
    id: string;
    name: string;
    icon: string;
    description: string;
    earnedAt: string;
}

export default function StudentDashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const response = await fetch('/api/student/dashboard', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (!response.ok) {
                router.push('/auth/login');
                return;
            }

            const data = await response.json();
            setStats(data);
        } catch (error) {
            console.error('Error fetching dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen">
                <Sidebar userType="student" />
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar userType="student" />

            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />

                <main className="flex-1 overflow-y-auto p-6">
                    {/* Welcome Section */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <h1 className="text-3xl font-bold text-gray-800">
                            Welcome back, Champion! 🏆
                        </h1>
                        <p className="text-gray-600 mt-2">
                            You're on a {stats?.streakDays} day learning streak! Keep conquering!
                        </p>
                    </motion.div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 }}
                        >
                            <Card className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-purple-100">Total Points</p>
                                        <h3 className="text-3xl font-bold mt-1">{stats?.totalPoints}</h3>
                                    </div>
                                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                                        <FiAward className="w-6 h-6" />
                                    </div>
                                </div>
                            </Card>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            <Card className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-blue-100">Global Rank</p>
                                        <h3 className="text-3xl font-bold mt-1">#{stats?.globalRank}</h3>
                                    </div>
                                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                                        <FiTrendingUp className="w-6 h-6" />
                                    </div>
                                </div>
                            </Card>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            <Card className="p-6 bg-gradient-to-br from-green-500 to-green-600 text-white">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-green-100">Average Score</p>
                                        <h3 className="text-3xl font-bold mt-1">{stats?.averageScore}%</h3>
                                    </div>
                                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                                        <FiTarget className="w-6 h-6" />
                                    </div>
                                </div>
                            </Card>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.4 }}
                        >
                            <Card className="p-6 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-orange-100">Active Courses</p>
                                        <h3 className="text-3xl font-bold mt-1">{stats?.enrolledCourses}</h3>
                                    </div>
                                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                                        <FiBook className="w-6 h-6" />
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    </div>

                    {/* Charts Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            <Card className="p-6">
                                <h3 className="text-lg font-semibold mb-4">Weekly Progress</h3>
                                <LineChart
                                    data={[
                                        { day: 'Mon', score: 85 },
                                        { day: 'Tue', score: 92 },
                                        { day: 'Wed', score: 78 },
                                        { day: 'Thu', score: 95 },
                                        { day: 'Fri', score: 88 },
                                        { day: 'Sat', score: 91 },
                                        { day: 'Sun', score: 87 },
                                    ]}
                                    height={300}
                                />
                            </Card>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 }}
                        >
                            <Card className="p-6">
                                <h3 className="text-lg font-semibold mb-4">Subject Distribution</h3>
                                <PieChart
                                    data={[
                                        { subject: 'Mathematics', value: 30, color: '#8B5CF6' },
                                        { subject: 'Science', value: 25, color: '#3B82F6' },
                                        { subject: 'English', value: 20, color: '#10B981' },
                                        { subject: 'History', value: 15, color: '#F59E0B' },
                                        { subject: 'Others', value: 10, color: '#EF4444' },
                                    ]}
                                
                                />
                            </Card>
                        </motion.div>
                    </div>

                    {/* Recent Achievements */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                    >
                        <Card className="p-6">
                            <h3 className="text-lg font-semibold mb-4">Recent Achievements</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                {stats?.recentBadges.map((badge, index) => (
                                    <motion.div
                                        key={badge.id}
                                        initial={{ opacity: 0, scale: 0 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.8 + index * 0.1 }}
                                        className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                                    >
                                        <div className="text-4xl mb-2">{badge.icon}</div>
                                        <p className="text-sm font-medium text-center">{badge.name}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </Card>
                    </motion.div>
                </main>
            </div>
        </div>
    );
}