import React, { useState, useEffect } from 'react';
import {
    Container,
    Grid,
    Card,
    CardContent,
    Typography,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    IconButton,
    Chip,
    Box,
    Tabs,
    Tab,
    Switch,
    FormControlLabel,
    CircularProgress,
} from '@mui/material';
import {
    Add,
    Edit,
    Delete,
    Archive,
    Unarchive,
    CheckCircle,
    Category,
    TrendingUp,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import axios from 'axios';
import toast from 'react-hot-toast';

const Habits = () => {
    const [habits, setHabits] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingHabit, setEditingHabit] = useState(null);
    const [tabValue, setTabValue] = useState(0);
    const [loading, setLoading] = useState(true);

    const { control, handleSubmit, reset, formState: { errors } } = useForm({
        defaultValues: {
            name: '',
            description: '',
            category: 'other',
            frequency: 'daily',
            goal: 1,
            unit: 'times',
            color: '#4CAF50',
            icon: 'check',
        }
    });

    const fetchHabits = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/habits');
            setHabits(response.data.data);
        } catch (error) {
            toast.error('Ошибка загрузки привычек');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHabits();
    }, []);

    const handleOpenDialog = (habit = null) => {
        if (habit) {
            reset(habit);
            setEditingHabit(habit._id);
        } else {
            reset();
            setEditingHabit(null);
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingHabit(null);
    };

    const onSubmit = async (data) => {
        try {
            if (editingHabit) {
                await axios.put(`/api/habits/${editingHabit}`, data);
                toast.success('Привычка обновлена');
            } else {
                await axios.post('/api/habits', data);
                toast.success('Привычка создана');
            }
            handleCloseDialog();
            fetchHabits();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Ошибка');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Удалить привычку?')) {
            try {
                await axios.delete(`/api/habits/${id}`);
                toast.success('Привычка удалена');
                fetchHabits();
            } catch (error) {
                toast.error('Ошибка удаления');
            }
        }
    };

    const handleArchive = async (id, isArchived) => {
        try {
            await axios.put(`/api/habits/${id}/archive`);
            toast.success(isArchived ? 'Привычка восстановлена' : 'Привычка архивирована');
            fetchHabits();
        } catch (error) {
            toast.error('Ошибка');
        }
    };

    const handleComplete = async (habitId) => {
        try {
            await axios.post('/api/entries', {
                habitId,
                value: 1,
            });
            toast.success('Привычка отмечена!');
            fetchHabits();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Ошибка');
        }
    };

    const categories = [
        { value: 'health', label: 'Здоровье' },
        { value: 'productivity', label: 'Продуктивность' },
        { value: 'learning', label: 'Обучение' },
        { value: 'sports', label: 'Спорт' },
        { value: 'mindfulness', label: 'Осознанность' },
        { value: 'other', label: 'Другое' },
    ];

    const frequencies = [
        { value: 'daily', label: 'Ежедневно' },
        { value: 'weekly', label: 'Еженедельно' },
        { value: 'custom', label: 'Выборочно' },
    ];

    const filteredHabits = habits.filter(habit =>
        tabValue === 0 ? !habit.isArchived : habit.isArchived
    );

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="lg">
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4">Мои привычки</Typography>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => handleOpenDialog()}
                >
                    Новая привычка
                </Button>
            </Box>

            <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
                <Tab label={`Активные (${habits.filter(h => !h.isArchived).length})`} />
                <Tab label={`Архив (${habits.filter(h => h.isArchived).length})`} />
            </Tabs>

            <Grid container spacing={3}>
                {filteredHabits.map((habit) => (
                    <Grid item xs={12} md={6} lg={4} key={habit._id}>
                        <Card>
                            <CardContent>
                                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                                    <Box>
                                        <Typography variant="h6" gutterBottom>
                                            {habit.name}
                                        </Typography>
                                        <Chip
                                            label={categories.find(c => c.value === habit.category)?.label}
                                            size="small"
                                            icon={<Category />}
                                            sx={{ mr: 1 }}
                                        />
                                        <Chip
                                            label={`Стрик: ${habit.streak}`}
                                            size="small"
                                            icon={<TrendingUp />}
                                            color="primary"
                                        />
                                    </Box>
                                    <Box>
                                        <IconButton size="small" onClick={() => handleOpenDialog(habit)}>
                                            <Edit />
                                        </IconButton>
                                        <IconButton size="small" onClick={() => handleArchive(habit._id, habit.isArchived)}>
                                            {habit.isArchived ? <Unarchive /> : <Archive />}
                                        </IconButton>
                                        <IconButton size="small" onClick={() => handleDelete(habit._id)}>
                                            <Delete />
                                        </IconButton>
                                    </Box>
                                </Box>

                                {habit.description && (
                                    <Typography variant="body2" color="text.secondary" paragraph>
                                        {habit.description}
                                    </Typography>
                                )}

                                <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                                    <Typography variant="body2">
                                        Цель: {habit.goal} {habit.unit} {habit.frequency === 'daily' ? 'в день' : 'в неделю'}
                                    </Typography>

                                    {!habit.isArchived && (
                                        <Button
                                            variant={habit.completedToday ? "contained" : "outlined"}
                                            color={habit.completedToday ? "success" : "primary"}
                                            startIcon={<CheckCircle />}
                                            size="small"
                                            onClick={() => handleComplete(habit._id)}
                                            disabled={habit.completedToday}
                                        >
                                            {habit.completedToday ? 'Выполнено' : 'Отметить'}
                                        </Button>
                                    )}
                                </Box>

                                {habit.completedToday && (
                                    <Box mt={1}>
                                        <Typography variant="caption" color="success.main">
                                            Сегодня: {habit.todayValue} {habit.unit}
                                        </Typography>
                                    </Box>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Диалог создания/редактирования */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {editingHabit ? 'Редактировать привычку' : 'Новая привычка'}
                </DialogTitle>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogContent>
                        <Controller
                            name="name"
                            control={control}
                            rules={{ required: 'Название обязательно' }}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    autoFocus
                                    margin="dense"
                                    label="Название привычки"
                                    fullWidth
                                    error={!!errors.name}
                                    helperText={errors.name?.message}
                                />
                            )}
                        />

                        <Controller
                            name="description"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    margin="dense"
                                    label="Описание"
                                    fullWidth
                                    multiline
                                    rows={3}
                                />
                            )}
                        />

                        <Controller
                            name="category"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    select
                                    margin="dense"
                                    label="Категория"
                                    fullWidth
                                >
                                    {categories.map((option) => (
                                        <MenuItem key={option.value} value={option.value}>
                                            {option.label}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            )}
                        />

                        <Controller
                            name="frequency"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    select
                                    margin="dense"
                                    label="Частота"
                                    fullWidth
                                >
                                    {frequencies.map((option) => (
                                        <MenuItem key={option.value} value={option.value}>
                                            {option.label}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            )}
                        />

                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <Controller
                                    name="goal"
                                    control={control}
                                    rules={{ min: { value: 0.1, message: 'Минимум 0.1' } }}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            type="number"
                                            margin="dense"
                                            label="Цель"
                                            fullWidth
                                            error={!!errors.goal}
                                            helperText={errors.goal?.message}
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <Controller
                                    name="unit"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            margin="dense"
                                            label="Единица измерения"
                                            fullWidth
                                        />
                                    )}
                                />
                            </Grid>
                        </Grid>

                        <Controller
                            name="color"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    margin="dense"
                                    label="Цвет"
                                    type="color"
                                    fullWidth
                                    InputProps={{
                                        startAdornment: (
                                            <Box
                                                sx={{
                                                    width: 20,
                                                    height: 20,
                                                    bgcolor: field.value,
                                                    borderRadius: '4px',
                                                    mr: 1,
                                                    border: '1px solid #ccc'
                                                }}
                                            />
                                        )
                                    }}
                                />
                            )}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog}>Отмена</Button>
                        <Button type="submit" variant="contained">
                            {editingHabit ? 'Сохранить' : 'Создать'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Container>
    );
};

export default Habits;