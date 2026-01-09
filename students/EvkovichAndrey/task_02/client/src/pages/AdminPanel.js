import React, { useState, useEffect } from 'react';
import {
    Container,
    Paper,
    Typography,
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Chip,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    CircularProgress,
    Alert,
} from '@mui/material';
import {
    Delete,
    Edit,
    Lock,
    LockOpen,
    Add,
    Refresh,
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const AdminPanel = () => {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        if (user?.role === 'admin') {
            fetchUsers();
        }
    }, [user]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            // В реальном проекте нужен эндпоинт /api/admin/users
            const response = await axios.get('/api/users/all'); // Нужно создать этот эндпоинт
            setUsers(response.data.data);
        } catch (error) {
            toast.error('Ошибка загрузки пользователей');
        } finally {
            setLoading(false);
        }
    };

    const handleMakeAdmin = async (userId) => {
        try {
            await axios.put(`/api/admin/users/${userId}/role`, { role: 'admin' });
            toast.success('Права администратора предоставлены');
            fetchUsers();
        } catch (error) {
            toast.error('Ошибка');
        }
    };

    const handleRemoveAdmin = async (userId) => {
        try {
            await axios.put(`/api/admin/users/${userId}/role`, { role: 'user' });
            toast.success('Права администратора отозваны');
            fetchUsers();
        } catch (error) {
            toast.error('Ошибка');
        }
    };

    const handleDeleteUser = async (userId) => {
        if (window.confirm('Удалить пользователя?')) {
            try {
                await axios.delete(`/api/admin/users/${userId}`);
                toast.success('Пользователь удален');
                fetchUsers();
            } catch (error) {
                toast.error('Ошибка удаления');
            }
        }
    };

    if (!user || user.role !== 'admin') {
        return (
            <Container maxWidth="md">
                <Box sx={{ mt: 8, textAlign: 'center' }}>
                    <Alert severity="error" sx={{ mb: 2 }}>
                        Доступ запрещен. Требуются права администратора.
                    </Alert>
                </Box>
            </Container>
        );
    }

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="lg">
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" gutterBottom>
                    Панель администратора
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Управление пользователями и системой
                </Typography>
            </Box>

            <Paper sx={{ p: 3, mb: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6">
                        Пользователи ({users.length})
                    </Typography>
                    <Box>
                        <Button
                            variant="outlined"
                            startIcon={<Refresh />}
                            onClick={fetchUsers}
                            sx={{ mr: 1 }}
                        >
                            Обновить
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<Add />}
                            onClick={() => setOpenDialog(true)}
                        >
                            Добавить админа
                        </Button>
                    </Box>
                </Box>

                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Имя пользователя</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Роль</TableCell>
                                <TableCell>Дата регистрации</TableCell>
                                <TableCell>Действия</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {users.map((userItem) => (
                                <TableRow key={userItem._id}>
                                    <TableCell>{userItem.username}</TableCell>
                                    <TableCell>{userItem.email}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={userItem.role === 'admin' ? 'Админ' : 'Пользователь'}
                                            color={userItem.role === 'admin' ? 'secondary' : 'default'}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {new Date(userItem.createdAt).toLocaleDateString('ru-RU')}
                                    </TableCell>
                                    <TableCell>
                                        {userItem.role === 'admin' ? (
                                            <IconButton
                                                size="small"
                                                onClick={() => handleRemoveAdmin(userItem._id)}
                                                title="Отозвать права админа"
                                            >
                                                <LockOpen />
                                            </IconButton>
                                        ) : (
                                            <IconButton
                                                size="small"
                                                onClick={() => handleMakeAdmin(userItem._id)}
                                                title="Сделать администратором"
                                            >
                                                <Lock />
                                            </IconButton>
                                        )}
                                        <IconButton
                                            size="small"
                                            onClick={() => handleDeleteUser(userItem._id)}
                                            title="Удалить"
                                            disabled={userItem._id === user._id}
                                        >
                                            <Delete />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* Диалог добавления админа */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                <DialogTitle>Добавить администратора</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" paragraph>
                        Создайте нового администратора или назначьте существующему пользователю права администратора.
                    </Typography>
                    {/* Форма будет здесь */}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Отмена</Button>
                    <Button variant="contained">Добавить</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default AdminPanel;