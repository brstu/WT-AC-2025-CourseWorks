import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import {
    AppBar,
    Box,
    CssBaseline,
    Drawer,
    IconButton,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Toolbar,
    Typography,
    Avatar,
    Menu,
    MenuItem,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import {
    Menu as MenuIcon,
    Dashboard,
    FormatListBulleted,
    CalendarMonth,
    Flag,
    BarChart,
    Person,
    Logout,
    Add,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const drawerWidth = 240;

const Layout = () => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const menuItems = [
        { text: 'Панель управления', icon: <Dashboard />, path: '/' },
        { text: 'Привычки', icon: <FormatListBulleted />, path: '/habits' },
        { text: 'Календарь', icon: <CalendarMonth />, path: '/calendar' },
        { text: 'Цели', icon: <Flag />, path: '/goals' },
        { text: 'Статистика', icon: <BarChart />, path: '/stats' },
    ];

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        handleMenuClose();
        logout();
    };

    const drawer = (
        <div>
            <Toolbar>
                <Typography variant="h6" noWrap>
                    HabitTracker
                </Typography>
            </Toolbar>
            <List>
                {menuItems.map((item) => (
                    <ListItem
                        button
                        key={item.text}
                        onClick={() => {
                            navigate(item.path);
                            if (isMobile) setMobileOpen(false);
                        }}
                    >
                        <ListItemIcon>{item.icon}</ListItemIcon>
                        <ListItemText primary={item.text} />
                    </ListItem>
                ))}
            </List>
        </div>
    );

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar
                position="fixed"
                sx={{
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    ml: { sm: `${drawerWidth}px` },
                }}
            >
                <Toolbar>
                    {isMobile && (
                        <IconButton
                            color="inherit"
                            aria-label="open drawer"
                            edge="start"
                            onClick={handleDrawerToggle}
                            sx={{ mr: 2 }}
                        >
                            <MenuIcon />
                        </IconButton>
                    )}
                    <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                        Отметь прогресс — порадуй дофамин
                    </Typography>

                    <IconButton
                        color="inherit"
                        onClick={() => navigate('/habits?new=true')}
                        sx={{ mr: 2 }}
                    >
                        <Add />
                    </IconButton>

                    <IconButton onClick={handleMenuOpen} color="inherit">
                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                            {user?.username?.charAt(0).toUpperCase()}
                        </Avatar>
                    </IconButton>
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleMenuClose}
                    >
                        <MenuItem onClick={() => { handleMenuClose(); navigate('/profile'); }}>
                            <ListItemIcon>
                                <Person fontSize="small" />
                            </ListItemIcon>
                            Профиль
                        </MenuItem>
                        <MenuItem onClick={handleLogout}>
                            <ListItemIcon>
                                <Logout fontSize="small" />
                            </ListItemIcon>
                            Выход
                        </MenuItem>
                    </Menu>
                </Toolbar>
            </AppBar>

            <Box
                component="nav"
                sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
            >
                {isMobile ? (
                    <Drawer
                        variant="temporary"
                        open={mobileOpen}
                        onClose={handleDrawerToggle}
                        ModalProps={{ keepMounted: true }}
                        sx={{
                            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                        }}
                    >
                        {drawer}
                    </Drawer>
                ) : (
                    <Drawer
                        variant="permanent"
                        sx={{
                            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                        }}
                        open
                    >
                        {drawer}
                    </Drawer>
                )}
            </Box>

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    mt: 8,
                }}
            >
                <Outlet />
            </Box>
        </Box>
    );
};

export default Layout;