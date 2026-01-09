import React, { useState, useEffect } from 'react';
import {
    Container,
    Paper,
    Typography,
    Box,
    Grid,
    Avatar,
    TextField,
    Button,
    Divider,
    Chip,
    LinearProgress,
    Alert,
    CircularProgress,
} from '@mui/material';
import {
    Person,
    Email,
    CalendarToday,
    TrendingUp,
    EmojiEvents,
    CheckCircle,
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const Profile = () => {
    const { user, fetchUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [stats, setStats] = useState(null);

    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    useEffect(() => {
        if (user) {
            reset({
                timezone: user.settings?.timezone || 'UTC',
                dailyReminderTime: user.settings?.dailyReminderTime || '09:00',
                notificationsEnabled: user.settings?.notificationsEnabled ?? true,
            });
            fetchStats();
        }
    }, [user, reset]);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/habits/stats?period=all');
            setStats(response.data.data);
        } catch (error) {
            toast.error('Ошибка загрузки статистики');
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data) => {
        try {
            setSaving(true);
            await axios.put('/api/auth/profile', {
                settings: data
            });
            await fetchUser();
            toast.success('Настройки сохранены');
        } catch (error) {
            toast.error('Ошибка сохранения настроек');
        } finally {
            setSaving(false);
        }
    };

    if (loading || !user) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="lg">
            <Typography variant="h4" gutterBottom>
                Мой профиль
            </Typography>

            <Grid container spacing={3}>
                {/* Информация о пользователе */}
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3 }}>
                        <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
                            <Avatar
                                sx={{
                                    width: 100,
                                    height: 100,
                                    bgcolor: 'primary.main',
                                    fontSize: 40,
                                    mb: 2,
                                }}
                            >
                                {user.username?.charAt(0).toUpperCase()}
                            </Avatar>
                            <Typography variant="h5">{user.username}</Typography>
                            <Typography variant="body2" color="text.secondary">
                                {user.email}
                            </Typography>
                            <Chip
                                label={user.role === 'admin' ? 'Администратор' : 'Пользователь'}
                                color={user.role === 'admin' ? 'secondary' : 'default'}
                                size="small"
                                sx={{ mt: 1 }}
                            />
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        <Box>
                            <Box display="flex" alignItems="center" mb={2}>
                                <CalendarToday sx={{ mr: 1, color: 'text.secondary' }} />
                            </Box>
                        </Box>
                    </Paper>

                    {/* Статистика */}
                    <Paper sx={{ p: 3, mt: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Статистика
                        </Typography>

                        {stats && (
                            <Box>
                                <Box mb={2}>
                                    <Box display="flex" justifyContent="space-between" mb={0.5}>
                                        <Typography variant="body2" display="flex" alignItems="center">
                                            <TrendingUp sx={{ mr: 0.5, fontSize: 16 }} />
                                            Текущий стрик
                                        </Typography>
                                        <Typography variant="body2" fontWeight="bold">
                                            {user.streakStats?.currentStreak || 0} дней
                                        </Typography>
                                    </Box>
                                    <LinearProgress
                                        variant="determinate"
                                        value={(user.streakStats?.currentStreak / Math.max(user.streakStats?.longestStreak, 1)) * 100}
                                        sx={{ height: 6, borderRadius: 3 }}
                                    />
                                </Box>

                                <Box mb={2}>
                                    <Box display="flex" justifyContent="space-between">
                                        <Typography variant="body2" display="flex" alignItems="center">
                                            <EmojiEvents sx={{ mr: 0.5, fontSize: 16 }} />
                                            Лучший стрик
                                        </Typography>
                                        <Typography variant="body2" fontWeight="bold">
                                            {user.streakStats?.longestStreak || 0} дней
                                        </Typography>
                                    </Box>
                                </Box>

                                <Box mb={2}>
                                    <Box display="flex" justifyContent="space-between">
                                        <Typography variant="body2" display="flex" alignItems="center">
                                            <CheckCircle sx={{ mr: 0.5, fontSize: 16 }} />
                                            Всего выполнено
                                        </Typography>
                                        <Typography variant="body2" fontWeight="bold">
                                            {user.streakStats?.totalCompleted || 0}
                                        </Typography>
                                    </Box>
                                </Box>

                                <Box>
                                    <Box display="flex" justifyContent="space-between">
                                        <Typography variant="body2">
                                            Привычек активно
                                        </Typography>
                                        <Typography variant="body2" fontWeight="bold">
                                            {stats.activeHabits} / {stats.totalHabits}
                                        </Typography>
                                    </Box>
                                    <LinearProgress
                                        variant="determinate"
                                        value={(stats.activeHabits / Math.max(stats.totalHabits, 1)) * 100}
                                        sx={{ height: 6, borderRadius: 3, mt: 0.5 }}
                                    />
                                </Box>
                            </Box>
                        )}
                    </Paper>
                </Grid>

                {/* Настройки */}
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Настройки профиля
                        </Typography>

                        <Alert severity="info" sx={{ mb: 3 }}>
                            Настройте время напоминаний и другие параметры
                        </Alert>

                        <form onSubmit={handleSubmit(onSubmit)}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        {...register('dailyReminderTime')}
                                        label="Время ежедневных напоминаний"
                                        type="time"
                                        fullWidth
                                        InputLabelProps={{ shrink: true }}
                                        disabled={saving}
                                    />
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <TextField
                                        {...register('timezone')}
                                        label="Часовой пояс"
                                        select
                                        fullWidth
                                        disabled={saving}
                                        SelectProps={{
                                            native: true,
                                        }}
                                    >
                                        <option value="UTC">UTC</option>
                                        <option value="Europe/Moscow">Москва (UTC+3)</option>
                                        <option value="Europe/Kiev">Киев (UTC+3)</option>
                                        <option value="America/New_York">Нью-Йорк (UTC-5)</option>
                                    </TextField>
                                </Grid>

                                <Grid item xs={12}>
                                    <Box display="flex" alignItems="center" mt={1}>
                                        <input
                                            type="checkbox"
                                            {...register('notificationsEnabled')}
                                            id="notificationsEnabled"
                                            style={{ marginRight: 8 }}
                                            disabled={saving}
                                        />
                                        <label htmlFor="notificationsEnabled">
                                            Включить уведомления
                                        </label>
                                    </Box>
                                </Grid>
                            </Grid>

                            <Box mt={3} display="flex" justifyContent="flex-end">
                                <Button
                                    type="submit"
                                    variant="contained"
                                    disabled={saving}
                                >
                                    {saving ? 'Сохранение...' : 'Сохранить настройки'}
                                </Button>
                            </Box>
                        </form>
                    </Paper>

                    {/* Достижения */}
                    <Paper sx={{ p: 3, mt: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Достижения
                        </Typography>

                        <Grid container spacing={2}>
                            <Grid item xs={6} md={4}>
                                <Box textAlign="center">
                                    <Avatar sx={{ bgcolor: 'gold', width: 60, height: 60, mx: 'auto', mb: 1 }}>
                                        <EmojiEvents />
                                    </Avatar>
                                    <Typography variant="body2" fontWeight="bold">
                                        Неделя подряд
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Выполнять 7 дней подряд
                                    </Typography>
                                    <Chip
                                        label={user.streakStats?.currentStreak >= 7 ? "Получено" : "В процессе"}
                                        color={user.streakStats?.currentStreak >= 7 ? "success" : "default"}
                                        size="small"
                                        sx={{ mt: 1 }}
                                    />
                                </Box>
                            </Grid>

                            <Grid item xs={6} md={4}>
                                <Box textAlign="center">
                                    <Avatar sx={{ bgcolor: 'silver', width: 60, height: 60, mx: 'auto', mb: 1 }}>
                                        <TrendingUp />
                                    </Avatar>
                                    <Typography variant="body2" fontWeight="bold">
                                        30 дней подряд
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Месяц дисциплины
                                    </Typography>
                                    <Chip
                                        label={user.streakStats?.longestStreak >= 30 ? "Получено" : "В процессе"}
                                        color={user.streakStats?.longestStreak >= 30 ? "success" : "default"}
                                        size="small"
                                        sx={{ mt: 1 }}
                                    />
                                </Box>
                            </Grid>

                            <Grid item xs={6} md={4}>
                                <Box textAlign="center">
                                    <Avatar sx={{ bgcolor: '#cd7f32', width: 60, height: 60, mx: 'auto', mb: 1 }}>
                                        <CheckCircle />
                                    </Avatar>
                                    <Typography variant="body2" fontWeight="bold">
                                        100 выполнений
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Стопка привычек
                                    </Typography>
                                    <Chip
                                        label={user.streakStats?.totalCompleted >= 100 ? "Получено" : "В процессе"}
                                        color={user.streakStats?.totalCompleted >= 100 ? "success" : "default"}
                                        size="small"
                                        sx={{ mt: 1 }}
                                    />
                                </Box>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default Profile;