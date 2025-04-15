import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  CssBaseline,
  useTheme,
  useMediaQuery,
  Collapse,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  AccountTree as AccountTreeIcon,
  Settings as SettingsIcon,
  Category as CategoryIcon,
  PlayCircleOutline as PlayCircleOutlineIcon,
  ListAlt as ListAltIcon,
  ExpandLess,
  ExpandMore,
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';

const drawerWidth = 240;

export const MainLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openServices, setOpenServices] = useState(false);
  const [openUPlay, setOpenUPlay] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { logout } = useAuth();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawerContent = (
    <div>
      <Toolbar />
      <List>
        <ListItem disablePadding>
          <ListItemButton 
            onClick={() => navigate('/')}
            selected={location.pathname === '/'}
            sx={{
              '&.Mui-selected': {
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.12)',
                },
              },
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
              },
            }}
          >
            <ListItemIcon sx={{ color: 'inherit' }}>
              <HomeIcon />
            </ListItemIcon>
            <ListItemText primary="Inicio" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton 
            onClick={() => navigate('/mundos')}
            selected={location.pathname === '/mundos' || location.pathname.startsWith('/mundos/')}
            sx={{
              '&.Mui-selected': {
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.12)',
                },
              },
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
              },
            }}
          >
            <ListItemIcon sx={{ color: 'inherit' }}>
              <AccountTreeIcon />
            </ListItemIcon>
            <ListItemText primary="Mundos" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton 
            onClick={() => setOpenServices(!openServices)}
            sx={{
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
              },
            }}
          >
            <ListItemIcon sx={{ color: 'inherit' }}>
              <CategoryIcon />
            </ListItemIcon>
            <ListItemText primary="Servicios" />
            {openServices ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
        </ListItem>
        <Collapse in={openServices} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItem disablePadding>
              <ListItemButton 
                onClick={() => setOpenUPlay(!openUPlay)}
                sx={{ 
                  pl: 4,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  },
                }}
              >
                <ListItemIcon sx={{ color: 'inherit' }}>
                  <PlayCircleOutlineIcon />
                </ListItemIcon>
                <ListItemText primary="ÜPlay" />
                {openUPlay ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
            </ListItem>
            <Collapse in={openUPlay} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItem disablePadding>
                  <ListItemButton 
                    onClick={() => navigate('/playlists')}
                    selected={location.pathname.startsWith('/playlists')}
                    sx={{ 
                      pl: 6,
                      '&.Mui-selected': {
                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.12)',
                        },
                      },
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      },
                    }}
                  >
                    <ListItemIcon sx={{ color: 'inherit' }}>
                      <PlayCircleOutlineIcon />
                    </ListItemIcon>
                    <ListItemText primary="Gamified Playlists" />
                  </ListItemButton>
                </ListItem>
              </List>
            </Collapse>
            {/* Placeholder for other services */}
            <ListItem disablePadding>
              <ListItemButton 
                sx={{ 
                  pl: 4,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  },
                }}
              >
                <ListItemIcon sx={{ color: 'inherit' }}>
                  <PlayCircleOutlineIcon />
                </ListItemIcon>
                <ListItemText primary="ÜMarket" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton 
                sx={{ 
                  pl: 4,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  },
                }}
              >
                <ListItemIcon sx={{ color: 'inherit' }}>
                  <PlayCircleOutlineIcon />
                </ListItemIcon>
                <ListItemText primary="ÜSocial" />
              </ListItemButton>
            </ListItem>
          </List>
        </Collapse>
        <ListItem disablePadding>
          <ListItemButton 
            onClick={() => navigate('/settings')}
            selected={location.pathname === '/settings'}
            sx={{
              '&.Mui-selected': {
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.12)',
                },
              },
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
              },
            }}
          >
            <ListItemIcon sx={{ color: 'inherit' }}>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary="Configuración" />
          </ListItemButton>
        </ListItem>
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        color="secondary"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Gamifier Admin
          </Typography>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              backgroundColor: 'secondary.main',
              color: '#FFFFFF',
            },
          }}
        >
          {drawerContent}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              backgroundColor: 'secondary.main',
              color: '#FFFFFF',
            },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}; 