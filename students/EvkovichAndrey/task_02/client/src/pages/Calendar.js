import React, { useState, useEffect } from 'react';
import {
    Container,
    Paper,
    Typography,
    Box,
    Grid,
    Chip,
    CircularProgress,
    Button,
} from '@mui/material';
import axios from 'axios';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import toast from 'react-hot-toast';

const Calendar = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [calendarData, setCalendarData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCalendarData();
    }, [currentDate]);

    const fetchCalendarData = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/entries/calendar', {
                params: {
                    year: currentDate.getFullYear(),
                    month: currentDate.getMonth(),
                },
            });
            setCalendarData(response.data.data);
        } catch (error) {
            toast.error('Ошибка загрузки календаря');
        } finally {
            setLoading(false);
        }
    };

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const getDayData = (day) => {
        const dayStr = format(day, 'yyyy-MM-dd');
        return calendarData.find(item => {
            // Преобразуем строку в Date объект если нужно
            const itemDate = typeof item.date === 'string' ? parseISO(item.date) : new Date(item.date);
            return format(itemDate, 'yyyy-MM-dd') === dayStr;
        }) || { completed: 0, entries: [] };
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                <CircularProgress />
            </Box>
        );
    }

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

    return (
        <Container maxWidth="lg">
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" gutterBottom>
                    Календарь выполнения
                </Typography>

                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Button onClick={handlePrevMonth}>
                        ← Предыдущий месяц
                    </Button>

                    <Typography variant="h5">
                        {format(currentDate, 'MMMM yyyy', { locale: ru })}
                    </Typography>

                    <Button onClick={handleNextMonth}>
                        Следующий месяц →
                    </Button>
                </Box>
            </Box>

            <Paper sx={{ p: 3 }}>
                <Grid container spacing={1}>
                    {weekDays.map(day => (
                        <Grid item xs key={day} sx={{ textAlign: 'center', py: 2 }}>
                            <Typography variant="subtitle2" fontWeight="bold">
                                {day}
                            </Typography>
                        </Grid>
                    ))}

                    {days.map(day => {
                        const dayData = getDayData(day);
                        const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

                        return (
                            <Grid item xs key={day.toString()} sx={{ textAlign: 'center', py: 2 }}>
                                <Box
                                    sx={{
                                        position: 'relative',
                                        width: 40,
                                        height: 40,
                                        mx: 'auto',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderRadius: '50%',
                                        bgcolor: isToday ? 'primary.main' :
                                            dayData.completed > 0 ? 'success.light' : 'grey.100',
                                        color: isToday ? 'white' : 'text.primary',
                                        cursor: 'pointer',
                                        '&:hover': {
                                            bgcolor: isToday ? 'primary.dark' : 'grey.200',
                                        },
                                    }}
                                >
                                    <Typography variant="body2">
                                        {format(day, 'd')}
                                    </Typography>

                                    {dayData.completed > 0 && (
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                top: -5,
                                                right: -5,
                                                width: 20,
                                                height: 20,
                                                bgcolor: 'success.main',
                                                color: 'white',
                                                borderRadius: '50%',
                                                fontSize: '0.75rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            {dayData.completed}
                                        </Box>
                                    )}
                                </Box>

                                {dayData.entries.length > 0 && (
                                    <Box sx={{ mt: 1 }}>
                                        {dayData.entries.slice(0, 2).map(entry => (
                                            <Chip
                                                key={entry.id}
                                                label={entry.habitName}
                                                size="small"
                                                sx={{
                                                    bgcolor: entry.habitColor,
                                                    color: 'white',
                                                    fontSize: '0.6rem',
                                                    height: 16,
                                                    mb: 0.5,
                                                }}
                                            />
                                        ))}
                                        {dayData.entries.length > 2 && (
                                            <Typography variant="caption" color="text.secondary">
                                                +{dayData.entries.length - 2}
                                            </Typography>
                                        )}
                                    </Box>
                                )}
                            </Grid>
                        );
                    })}
                </Grid>
            </Paper>

            <Box sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom>
                    Легенда
                </Typography>
                <Box display="flex" gap={2} flexWrap="wrap">
                    <Box display="flex" alignItems="center">
                        <Box
                            sx={{
                                width: 20,
                                height: 20,
                                borderRadius: '50%',
                                bgcolor: 'primary.main',
                                mr: 1,
                            }}
                        />
                        <Typography variant="body2">Сегодня</Typography>
                    </Box>
                    <Box display="flex" alignItems="center">
                        <Box
                            sx={{
                                width: 20,
                                height: 20,
                                borderRadius: '50%',
                                bgcolor: 'success.light',
                                mr: 1,
                            }}
                        />
                        <Typography variant="body2">Выполненные привычки</Typography>
                    </Box>
                </Box>
            </Box>
        </Container>
    );
};

export default Calendar;