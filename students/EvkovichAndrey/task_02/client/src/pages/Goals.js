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
    LinearProgress,
    Box,
    Chip,
    CircularProgress,
} from '@mui/material';
import {
    Add,
    Edit,
    Delete,
    CheckCircle,
    Flag,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import axios from 'axios';
import toast from 'react-hot-toast';

const Goals = () => {
    const [goals, setGoals] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingGoal, setEditingGoal] = useState(null);
    const [loading, setLoading] = useState(true);

    const { control, handleSubmit, reset, formState: { errors } } = useForm({
        defaultValues: {
            title: '',
            description: '',
            target: 1,
            unit: 'раз',
            deadline: '',
            category: 'other',
        }
    });

    const fetchGoals = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/goals');
            setGoals(response.data.data);
        } catch (error) {
            toast.error('Ошибка загрузки целей');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGoals();
    }, []);

    const handleOpenDialog = (goal = null) => {
        if (goal) {
            reset({
                ...goal,
                deadline: goal.deadline ? goal.deadline.split('T')[0] : '',
            });
            setEditingGoal(goal._id);
        } else {
            reset();
            setEditingGoal(null);
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingGoal(null);
    };

    const onSubmit = async (data) => {
        try {
            if (editingGoal) {
                await axios.put(`/api/goals/${editingGoal}`, data);
                toast.success('Цель обновлена');
            } else {
                await axios.post('/api/goals', data);
                toast.success('Цель создана');
            }
            handleCloseDialog();
            fetchGoals();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Ошибка');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Удалить цель?')) {
            try {
                await axios.delete(`/api/goals/${id}`);
                toast.success('Цель удалена');
                fetchGoals();
            } catch (error) {
                toast.error('Ошибка удаления');
            }
        }
    };

    const handleComplete = async (id) => {
        try {
            await axios.put(`/api/goals/${id}/complete`);
            toast.success('🎉 Цель достигнута!');
            fetchGoals();
        } catch (error) {
            toast.error('Ошибка');
        }
    };

    const handleProgress = async (id, increment) => {
        try {
            await axios.put(`/api/goals/${id}/progress`, { increment });
            toast.success('Прогресс обновлен');
            fetchGoals();
        } catch (error) {
            toast.error('Ошибка');
        }
    };

    const categories = [
        { value: 'habit', label: 'Привычки' },
        { value: 'reading', label: 'Чтение' },
        { value: 'sports', label: 'Спорт' },
        { value: 'learning', label: 'Обучение' },
        { value: 'other', label: 'Другое' },
    ];

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
                <Typography variant="h4">Мои цели</Typography>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => handleOpenDialog()}
                >
                    Новая цель
                </Button>
            </Box>

            <Grid container spacing={3}>
                {goals.map((goal) => (
                    <Grid item xs={12} md={6} key={goal._id}>
                        <Card>
                            <CardContent>
                                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                                    <Box>
                                        <Typography variant="h6" gutterBottom>
                                            {goal.title}
                                            {goal.isCompleted && (
                                                <Chip
                                                    label="Завершено"
                                                    color="success"
                                                    size="small"
                                                    sx={{ ml: 1 }}
                                                />
                                            )}
                                        </Typography>
                                        <Chip
                                            label={categories.find(c => c.value === goal.category)?.label}
                                            size="small"
                                            icon={<Flag />}
                                            sx={{ mr: 1 }}
                                        />
                                    </Box>
                                    <Box>
                                        <IconButton size="small" onClick={() => handleOpenDialog(goal)}>
                                            <Edit />
                                        </IconButton>
                                        <IconButton size="small" onClick={() => handleDelete(goal._id)}>
                                            <Delete />
                                        </IconButton>
                                    </Box>
                                </Box>

                                {goal.description && (
                                    <Typography variant="body2" color="text.secondary" paragraph>
                                        {goal.description}
                                    </Typography>
                                )}

                                <Box mb={2}>
                                    <Box display="flex" justifyContent="space-between" mb={1}>
                                        <Typography variant="body2">
                                            Прогресс
                                        </Typography>
                                        <Typography variant="body2" fontWeight="bold">
                                            {goal.progress}%
                                        </Typography>
                                    </Box>
                                    <LinearProgress
                                        variant="determinate"
                                        value={goal.progress}
                                        sx={{ height: 8, borderRadius: 4 }}
                                    />
                                    <Typography variant="caption" display="block" textAlign="right" mt={0.5}>
                                        {goal.current} / {goal.target} {goal.unit}
                                    </Typography>
                                </Box>

                                {goal.deadline && (
                                    <Typography variant="caption" display="block" color="text.secondary" mb={2}>
                                        Дедлайн: {new Date(goal.deadline).toLocaleDateString('ru-RU')}
                                    </Typography>
                                )}

                                <Box display="flex" justifyContent="space-between">
                                    <Box>
                                        <Button
                                            size="small"
                                            onClick={() => handleProgress(goal._id, 1)}
                                            disabled={goal.isCompleted}
                                        >
                                            +1
                                        </Button>
                                        <Button
                                            size="small"
                                            onClick={() => handleProgress(goal._id, -1)}
                                            disabled={goal.isCompleted}
                                            sx={{ ml: 1 }}
                                        >
                                            -1
                                        </Button>
                                    </Box>

                                    {!goal.isCompleted && (
                                        <Button
                                            variant="contained"
                                            size="small"
                                            startIcon={<CheckCircle />}
                                            onClick={() => handleComplete(goal._id)}
                                        >
                                            Завершить
                                        </Button>
                                    )}
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Диалог создания/редактирования */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {editingGoal ? 'Редактировать цель' : 'Новая цель'}
                </DialogTitle>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogContent>
                        <Controller
                            name="title"
                            control={control}
                            rules={{ required: 'Название обязательно' }}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    autoFocus
                                    margin="dense"
                                    label="Название цели"
                                    fullWidth
                                    error={!!errors.title}
                                    helperText={errors.title?.message}
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

                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <Controller
                                    name="target"
                                    control={control}
                                    rules={{
                                        required: 'Цель обязательна',
                                        min: { value: 1, message: 'Минимум 1' }
                                    }}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            type="number"
                                            margin="dense"
                                            label="Цель"
                                            fullWidth
                                            error={!!errors.target}
                                            helperText={errors.target?.message}
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <Controller
                                    name="unit"
                                    control={control}
                                    rules={{ required: 'Единица измерения обязательна' }}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            margin="dense"
                                            label="Единица измерения"
                                            fullWidth
                                            error={!!errors.unit}
                                            helperText={errors.unit?.message}
                                        />
                                    )}
                                />
                            </Grid>
                        </Grid>

                        <Controller
                            name="deadline"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    margin="dense"
                                    label="Дедлайн"
                                    type="date"
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
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
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog}>Отмена</Button>
                        <Button type="submit" variant="contained">
                            {editingGoal ? 'Сохранить' : 'Создать'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Container>
    );
};

export default Goals;