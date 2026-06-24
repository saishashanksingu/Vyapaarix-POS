import { useEffect, useState } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { CssBaseline, AppBar, Toolbar, Typography, Button, Container, Paper, Tabs, Tab, Box, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert } from "@mui/material";

import logo from "./assets/vyaaparix-logo.jpg";
import API from "./services/api";
import Dashboard from "./pages/Dashboard";
import POS from "./pages/POS";
import Products from "./pages/Products";
import SalesHistory from "./pages/SalesHistory";
import Login from "./pages/Login";
import Cashiers from "./pages/Cashiers";
import AICopilot from "./pages/AICopilot";

const theme = createTheme({
  palette: {
    primary: {
      main: '#f59e0b',
      dark: '#d97706',
      light: '#fde68a',
      contrastText: '#111827'
    },
    secondary: {
      main: '#111827',
      contrastText: '#ffffff'
    },
    background: {
      default: '#fff7ed',
      paper: '#ffffff'
    },
    text: {
      primary: '#111827',
      secondary: '#374151'
    }
  },
  typography: {
    fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    button: {
      textTransform: 'none'
    }
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(90deg, #f59e0b 0%, #ea580c 100%)',
          color: '#111827',
          minHeight: 120,
          paddingTop: 12,
          paddingBottom: 12,
          boxShadow: '0 14px 40px rgba(0, 0, 0, 0.18)'
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          border: '1px solid rgba(15, 23, 42, 0.06)',
          boxShadow: '0 18px 60px rgba(15, 23, 42, 0.05)'
        }
      }
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 700,
          color: '#374151',
          '&.Mui-selected': {
            color: '#111827'
          }
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#fffbf2',
          border: '1px solid rgba(245, 158, 11, 0.16)'
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        containedPrimary: {
          backgroundColor: '#f59e0b',
          color: '#111827',
          '&:hover': {
            backgroundColor: '#d97706'
          }
        },
        outlined: {
          borderColor: '#f59e0b',
          color: '#111827',
          '&:hover': {
            borderColor: '#d97706',
            backgroundColor: '#fff4db'
          }
        }
      }
    }
  }
});

function App() {

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    if (!savedUser) return null;
    try {
      return JSON.parse(savedUser);
    } catch {
      return null;
    }
  });
  const [store, setStore] = useState(() => {
    const savedStore = localStorage.getItem("store");
    if (!savedStore) return null;
    try {
      return JSON.parse(savedStore);
    } catch {
      return null;
    }
  });
  const [activeTab, setActiveTab] = useState('pos');
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwdError, setPwdError] = useState("");
  const [pwdSuccess, setPwdSuccess] = useState("");
  const [pwdLoading, setPwdLoading] = useState(false);

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setPwdError("New passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      setPwdError("Password must be at least 6 characters long");
      return;
    }
    try {
      setPwdLoading(true);
      setPwdError("");
      setPwdSuccess("");
      await API.post("/auth/change-password", {
        currentPassword,
        newPassword
      });
      setPwdSuccess("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => {
        setChangePasswordOpen(false);
        setPwdSuccess("");
      }, 1500);
    } catch (error) {
      setPwdError(error.response?.data?.message || "Failed to update password");
    } finally {
      setPwdLoading(false);
    }
  };
  const role = String(user?.role || "").toLowerCase();
  const isAdmin = role === "admin";
  const canViewSales = isAdmin || role === "cashier";

  useEffect(() => {
    if (!isAdmin) return;
    if (store?.cashierInviteCode) return;

    API.get("/auth/cashier-invite")
      .then((res) => {
        const nextStore = {
          _id: res.data.storeId,
          name: res.data.storeName,
          cashierInviteCode: res.data.cashierInviteCode
        };
        setStore(nextStore);
        localStorage.setItem("store", JSON.stringify(nextStore));
      })
      .catch((error) => console.error("Failed to load cashier invite:", error));
  }, [isAdmin, store?.cashierInviteCode]);

  // logout function
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("store");
    setUser(null);
    setStore(null);
  };

  // if not logged in → show login page
  if (!user) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Login setUser={(u) => {
          setUser(u);
          localStorage.setItem("user", JSON.stringify(u));
        }} setStore={setStore} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static" color="primary" elevation={0}>
        <Toolbar sx={{ minHeight: { xs: 104, md: 120 }, gap: 2, px: { xs: 2, md: 4 }, justifyContent: 'space-between', alignItems: 'center' }}>
          <Box component="img" src={logo} alt="Vyaaparix logo" sx={{ width: { xs: 100, sm: 120, md: 144 }, height: 'auto' }} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body1" sx={{ color: 'secondary.contrastText', fontWeight: 500 }}>
              {store?.name ? `${store.name} - ` : ""}Welcome, {user.name} ({user.role})
            </Typography>
            {isAdmin && store?.cashierInviteCode && (
              <Typography variant="body2" sx={{ color: 'secondary.contrastText', fontWeight: 700 }}>
                Cashier invite: {store.cashierInviteCode}
              </Typography>
            )}
            <Button variant="outlined" color="inherit" onClick={() => setChangePasswordOpen(true)} sx={{ color: 'secondary.contrastText', borderColor: 'secondary.contrastText', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
              Change Password
            </Button>
            <Button variant="contained" color="secondary" onClick={handleLogout} sx={{ boxShadow: '0 10px 22px rgba(0,0,0,0.12)' }}>
              Logout
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth={false} sx={{ mt: 4, mb: 4, px: { xs: 1, sm: 2, md: 3 } }}>
        <Paper sx={{ p: 2, width: "100%", maxWidth: "1440px", mx: "auto", borderRadius: 4, boxShadow: '0 24px 80px rgba(15, 23, 42, 0.08)', border: '1px solid rgba(15, 23, 42, 0.06)' }}>
          <Tabs
            value={activeTab}
            onChange={(e, newTab) => setActiveTab(newTab)}
            centered
            textColor="secondary"
            indicatorColor="secondary"
            sx={{ borderBottom: '1px solid rgba(15, 23, 42, 0.08)', mb: 2 }}
          >
            <Tab label="POS" value="pos" />
            {isAdmin && <Tab label="Products" value="products" />}
            {isAdmin && <Tab label="Dashboard" value="dashboard" />}
            {isAdmin && <Tab label="Cashiers" value="cashiers" />}
            {isAdmin && <Tab label="AI Copilot" value="ai" />}
            {canViewSales && <Tab label="Sales History" value="sales" />}
          </Tabs>
          {activeTab === 'pos' && <POS />}
          {activeTab === 'products' && <Products />}
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'cashiers' && <Cashiers />}
          {activeTab === 'ai' && <AICopilot />}
          {activeTab === 'sales' && <SalesHistory />}
        </Paper>
      </Container>

      {/* Change Password Dialog */}
      <Dialog
        open={changePasswordOpen}
        onClose={() => setChangePasswordOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 4, p: 1 }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Change Password</DialogTitle>
        <DialogContent>
          {pwdError && <Alert severity="error" sx={{ mb: 2 }}>{pwdError}</Alert>}
          {pwdSuccess && <Alert severity="success" sx={{ mb: 2 }}>{pwdSuccess}</Alert>}

          <TextField
            margin="dense"
            label="Current Password"
            type="password"
            fullWidth
            variant="outlined"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            disabled={pwdLoading}
          />
          <TextField
            margin="dense"
            label="New Password"
            type="password"
            fullWidth
            variant="outlined"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={pwdLoading}
          />
          <TextField
            margin="dense"
            label="Confirm New Password"
            type="password"
            fullWidth
            variant="outlined"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleChangePassword()}
            disabled={pwdLoading}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setChangePasswordOpen(false)} disabled={pwdLoading}>
            Cancel
          </Button>
          <Button onClick={handleChangePassword} variant="contained" disabled={pwdLoading}>
            {pwdLoading ? "Updating..." : "Update Password"}
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
}

export default App;
