import { useState } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { CssBaseline, AppBar, Toolbar, Typography, Button, Container, Paper, Tabs, Tab } from "@mui/material";

import Dashboard from "./pages/Dashboard";
import POS from "./pages/POS";
import Products from "./pages/Products";
import SalesHistory from "./pages/SalesHistory";
import Login from "./pages/Login";

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App(){

  const [user,setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    if (!savedUser) return null;
    try {
      return JSON.parse(savedUser);
    } catch {
      return null;
    }
  });
  const [activeTab, setActiveTab] = useState('pos');
  const role = String(user?.role || "").toLowerCase();
  const isAdmin = role === "admin";
  const canViewSales = isAdmin || role === "cashier";

  // logout function
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  // if not logged in → show login page
  if(!user){
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Login setUser={(u)=>{
          setUser(u);
          localStorage.setItem("user", JSON.stringify(u));
        }} />
      </ThemeProvider>
    );
  }

  return(
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Vyaaparix POS
          </Typography>
          <Typography variant="body1" sx={{ mr: 2 }}>
            Welcome, {user.name} ({user.role})
          </Typography>
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 2 }}>
          <Tabs value={activeTab} onChange={(e, newTab) => setActiveTab(newTab)} centered>
            <Tab label="POS" value="pos" />
            {isAdmin && <Tab label="Products" value="products" />}
            {isAdmin && <Tab label="Dashboard" value="dashboard" />}
            {canViewSales && <Tab label="Sales History" value="sales" />}
          </Tabs>
          {activeTab === 'pos' && <POS />}
          {activeTab === 'products' && <Products />}
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'sales' && <SalesHistory />}
        </Paper>
      </Container>
    </ThemeProvider>
  );
}

export default App;