import { useState } from "react";
import API from "../services/api";
import Register from "./Register";
import logo from "../assets/vyaaparix-logo.jpg";
import { Card, CardContent, TextField, Button, Typography, Box, Alert } from "@mui/material";

function Login({ setUser, setStore }) {

  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [showRegister,setShowRegister] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      setError("");
      const res = await API.post("/auth/login", {
        email,
        password
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      if (res.data.store) {
        localStorage.setItem("store", JSON.stringify(res.data.store));
        setStore?.(res.data.store);
      }

      setUser(res.data.user);

    } catch (error) {
      setError("Login failed: " + (error.response?.data?.message || "Unknown error"));
    }
  };

  // show register page
  if(showRegister){
    return <Register setUser={setUser} setStore={setStore} setShowRegister={setShowRegister} />;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #ffedd5 0%, #fef3c7 100%)',
        padding: 2
      }}
    >
      <Card sx={{ maxWidth: 420, width: '100%', borderRadius: 4, boxShadow: '0 24px 80px rgba(15, 23, 42, 0.1)', border: '1px solid rgba(245, 158, 11, 0.16)' }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <Box component="img" src={logo} alt="Brand logo" sx={{ width: 140, height: 'auto' }} />
          </Box>
          <Typography variant="h5" component="h1" gutterBottom align="center" sx={{ fontWeight: 700, color: '#111827' }}>
            Login
          </Typography>
          <Typography variant="subtitle1" component="h2" gutterBottom align="center" sx={{ color: '#6b7280', mb: 4 }}>
            Access your dashboard securely
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            margin="normal"
            required
          />

          <TextField
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            margin="normal"
            required
          />

          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={handleLogin}
            sx={{ mt: 2, mb: 2 }}
          >
            Login
          </Button>

          <Typography align="center">
            New user?{" "}
            <Button onClick={()=>setShowRegister(true)} sx={{ p: 0, minWidth: 'auto' }}>
              Register here
            </Button>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}

export default Login;
