import React, { useState, useEffect } from 'react';
import {
    Container,
    Paper,
    Typography,
    Box,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    CircularProgress,
    Card,
    CardContent,
} from '@mui/material';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
} from 'recharts';
import axios from 'axios';
import toast from 'react-hot-toast';

const Statistics = () => {
    const [period, setPeriod] = useState('month');
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, [period]);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/habits/stats', {
                params: { period }
            });
            setStats(response.data.data);
        } catch (error) {
            toast.error('Ошибка загрузки статистики');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: 'short'
        });
    };

    if (loading || !stats) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                <CircularProgress />
            </Box>
        );
    }

    const dailyChartData = stats.dailyStats?.map(stat => ({
        date: formatDate(stat._id.date),
        Выполнено: stat.completed,
        Всего: stat.count,
    })) || [];

    const categoryData = stats.categoryStats?.map(stat => ({
        name: stat._id,
        value: stat.count,
    })) || [];

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

    return (
        <Container maxWidth="lg">
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" gutterBottom>
                    Статистика
                </Typography>

                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <FormControl sx={{ minWidth: 200 }}>
                        <InputLabel>Период</InputLabel>
                        <Select
                            value={period}
                            label="Период"
                            onChange={(e) => setPeriod(e.target.value)}
                        >
                            <MenuItem value="day">День</MenuItem>
                            <MenuItem value="week">Неделя</MenuItem>
                            <MenuItem value="month">Месяц</MenuItem>
                            <MenuItem value="year">Год</MenuItem>
                            <MenuItem value="all">Все время</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
            </Box>

            <Grid container spacing={3}>
                {/* Общая статистика */}
                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Общая статистика
                            </Typography>
                            <Box mt={2}>
                                <Typography variant="body2" color="text.secondary">
                                    Текущий стрик
                                </Typography>
                                <Typography variant="h4">
                                    {stats.streak}
                                </Typography>
                            </Box>

                            <Box mt={2}>
                                <Typography variant="body2" color="text.secondary">
                                    Процент выполнения
                                </Typography>
                                <Typography variant="h4">
                                    {stats.completionRate}%
                                </Typography>
                            </Box>

                            <Box mt={2}>
                                <Typography variant="body2" color="text.secondary">
                                    Активные привычки
                                </Typography>
                                <Typography variant="h4">
                                    {stats.activeHabits}/{stats.totalHabits}
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Ежедневный прогресс */}
                <Grid item xs={12} md={9}>
                    <Paper sx={{ p: 2, height: 400 }}>
                        <Typography variant="h6" gutterBottom>
                            Ежедневный прогресс
                        </Typography>
                        <BarChart
                            width={700}
                            height={300}
                            data={dailyChartData}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="Выполнено" fill="#8884d8" />
                            <Bar dataKey="Всего" fill="#82ca9d" />
                        </BarChart>
                    </Paper>
                </Grid>

                {/* Распределение по категориям */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2, height: 400 }}>
                        <Typography variant="h6" gutterBottom>
                            По категориям
                        </Typography>
                        <PieChart width={500} height={300}>
                            <Pie
                                data={categoryData}
                                cx={200}
                                cy={150}
                                labelLine={false}
                                label={(entry) => `${entry.name}: ${entry.value}`}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {categoryData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </Paper>
                </Grid>

                {/* Тенденция выполнения */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2, height: 400 }}>
                        <Typography variant="h6" gutterBottom>
                            Тенденция выполнения
                        </Typography>
                        <LineChart
                            width={500}
                            height={300}
                            data={dailyChartData}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="Выполнено" stroke="#8884d8" activeDot={{ r: 8 }} />
                        </LineChart>
                    </Paper>
                </Grid>

                {/* Дополнительная информация */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Ключевые показатели
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={4}>
                                <Card variant="outlined">
                                    <CardContent>
                                        <Typography variant="body2" color="text.secondary">
                                            Среднее выполнение в день
                                        </Typography>
                                        <Typography variant="h5">
                                            {dailyChartData.length > 0
                                                ? (dailyChartData.reduce((sum, day) => sum + day.Выполнено, 0) / dailyChartData.length).toFixed(1)
                                                : '0'}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>

                            <Grid item xs={12} md={4}>
                                <Card variant="outlined">
                                    <CardContent>
                                        <Typography variant="body2" color="text.secondary">
                                            Лучший день
                                        </Typography>
                                        <Typography variant="h5">
                                            {dailyChartData.length > 0
                                                ? Math.max(...dailyChartData.map(day => day.Выполнено))
                                                : '0'}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>

                            <Grid item xs={12} md={4}>
                                <Card variant="outlined">
                                    <CardContent>
                                        <Typography variant="body2" color="text.secondary">
                                            Консистентность
                                        </Typography>
                                        <Typography variant="h5">
                                            {stats.completionRate}%
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default Statistics;