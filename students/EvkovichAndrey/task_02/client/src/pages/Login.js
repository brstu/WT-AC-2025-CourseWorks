import React, { useState } from 'react';
import {
    Container,
    Paper,
    TextField,
    Button,
    Typography,
    Box,
    Link,
    Alert,
} from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useForm } from 'react-hook-form';

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

    const onSubmit = async (data) => {
        try {
            setError('');
            const result = await login(data.email, data.password);
            if (result.success) {
                navigate('/');
            } else {
                setError(result.error?.message || 'Ошибка входа');
            }
        } catch (err) {
            setError('Произошла ошибка при входе');
        }
    };

    return (
        <Container maxWidth="sm">
            <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
                    <Typography variant="h4" component="h1" gutterBottom align="center">
                        Вход в Habit Tracker
                    </Typography>
                    <Typography variant="body1" color="text.secondary" align="center" gutterBottom>
                        Отметь прогресс — порадуй дофамин
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)}>
                        <TextField
                            {...register('email', {
                                required: 'Email обязателен',
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: 'Некорректный email',
                                },
                            })}
                            fullWidth
                            label="Email"
                            margin="normal"
                            error={!!errors.email}
                            helperText={errors.email?.message}
                            disabled={isSubmitting}
                        />

                        <TextField
                            {...register('password', {
                                required: 'Пароль обязателен',
                                minLength: {
                                    value: 6,
                                    message: 'Минимум 6 символов',
                                },
                            })}
                            fullWidth
                            label="Пароль"
                            type="password"
                            margin="normal"
                            error={!!errors.password}
                            helperText={errors.password?.message}
                            disabled={isSubmitting}
                        />

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            size="large"
                            sx={{ mt: 3, mb: 2 }}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Вход...' : 'Войти'}
                        </Button>

                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="body2">
                                Нет аккаунта?{' '}
                                <Link component={RouterLink} to="/register">
                                    Зарегистрироваться
                                </Link>
                            </Typography>
                        </Box>
                    </form>
                </Paper>
            </Box>
        </Container>
    );
};

export default Login;