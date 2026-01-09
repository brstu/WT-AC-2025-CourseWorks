import React, { useState, useEffect } from 'react';
import {
    Grid,
    Paper,
    Typography,
    Box,
    Card,
    CardContent,
    LinearProgress,
    Chip,
    IconButton,
} from '@mui/material';
import {
    CheckCircle,
    EmojiEvents,
    TrendingUp,
    CalendarToday,
    Refresh,
} from '@mui/icons-material';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import axios from 'axios';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import toast from 'react-hot-toast';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [habits, setHabits] = useState([]);
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [habitsRes, statsRes, goalsRes] = await Promise.all([
                axios.get('/api/habits'),
                axios.get('/api/habits/stats?period=week'),
                axios.get('/api/goals?completed=false'),
            ]);

            setHabits(habitsRes.data.data);
            setStats(statsRes.data.data);
            setGoals(goalsRes.data.data);
        } catch (error) {
            toast.error('Ошибка загрузки данных');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCompleteHabit = async (habitId) => {
        try {
            await axios.post('/api/entries', {
                habitId,
                value: 1,
            });
            toast.success('Привычка отмечена!');
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Ошибка');
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                <LinearProgress sx={{ width: '100%' }} />
            </Box>
        );
    }

    const chartData = {
        labels: stats?.dailyStats?.map(stat => {
            const date = new Date(stat._id.date);
            return format(date, 'dd MMM', { locale: ru });
        }) || [],
        datasets: [
            {
                label: 'Выполнено привычек',
                data: stats?.dailyStats?.map(stat => stat.completed) || [],
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
        },
    };

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" gutterBottom>
                    Панель управления
                </Typography>
                <IconButton onClick={fetchData}>
                    <Refresh />
                </IconButton>
            </Box>

            <Grid container spacing={3}>
                {/* Статистика */}
                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent>
                            <Box display="flex" alignItems="center" mb={2}>
                                <CheckCircle color="primary" sx={{ mr: 1 }} />
                                <Typography variant="h6">Текущий стрик</Typography>
                            </Box>
                            <Typography variant="h3">{stats?.streak || 0}</Typography>
                            <Typography variant="body2" color="text.secondary">
                                дней подряд
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent>
                            <Box display="flex" alignItems="center" mb={2}>
                                <EmojiEvents color="secondary" sx={{ mr: 1 }} />
                                <Typography variant="h6">Выполнено сегодня</Typography>
                            </Box>
                            <Typography variant="h3">
                                {habits.filter(h => h.completedToday).length}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                из {habits.length} привычек
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent>
                            <Box display="flex" alignItems="center" mb={2}>
                                <TrendingUp color="success" sx={{ mr: 1 }} />
                                <Typography variant="h6">Процент выполнения</Typography>
                            </Box>
                            <Typography variant="h3">{stats?.completionRate || 0}%</Typography>
                            <LinearProgress
                                variant="determinate"
                                value={stats?.completionRate || 0}
                                sx={{ mt: 1 }}
                            />
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent>
                            <Box display="flex" alignItems="center" mb={2}>
                                <CalendarToday color="action" sx={{ mr: 1 }} />
                                <Typography variant="h6">Активных привычек</Typography>
                            </Box>
                            <Typography variant="h3">{stats?.activeHabits || 0}</Typography>
                            <Typography variant="body2" color="text.secondary">
                                из {stats?.totalHabits || 0} всего
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* График */}
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Прогресс за неделю
                        </Typography>
                        <Box sx={{ height: 300 }}>
                            <Line data={chartData} options={chartOptions} />
                        </Box>
                    </Paper>
                </Grid>

                {/* Привычки на сегодня */}
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Привычки на сегодня
                        </Typography>
                        <Box>
                            {habits.slice(0, 5).map((habit) => (
                                <Box
                                    key={habit._id}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        mb: 1,
                                        p: 1,
                                        borderRadius: 1,
                                        bgcolor: habit.completedToday ? 'success.light' : 'grey.100',
                                    }}
                                >
                                    <Box>
                                        <Typography variant="body1">{habit.name}</Typography>
                                        <Chip
                                            label={habit.category}
                                            size="small"
                                            sx={{ mr: 1, mt: 0.5 }}
                                        />
                                    </Box>
                                    <IconButton
                                        size="small"
                                        onClick={() => handleCompleteHabit(habit._id)}
                                        disabled={habit.completedToday}
                                        color={habit.completedToday ? "success" : "default"}
                                    >
                                        <CheckCircle />
                                    </IconButton>
                                </Box>
                            ))}
                        </Box>
                    </Paper>
                </Grid>

                {/* Цели */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Активные цели
                        </Typography>
                        <Grid container spacing={2}>
                            {goals.slice(0, 3).map((goal) => (
                                <Grid item xs={12} md={4} key={goal._id}>
                                    <Card variant="outlined">
                                        <CardContent>
                                            <Typography variant="h6" gutterBottom>
                                                {goal.title}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                                {goal.description}
                                            </Typography>
                                            <Box display="flex" alignItems="center" mt={1}>
                                                <Box flexGrow={1} mr={1}>
                                                    <LinearProgress
                                                        variant="determinate"
                                                        value={goal.progress}
                                                    />
                                                </Box>
                                                <Typography variant="body2">
                                                    {goal.progress}%
                                                </Typography>
                                            </Box>
                                            <Typography variant="caption" display="block" mt={1}>
                                                {goal.current} / {goal.target} {goal.unit}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Dashboard;