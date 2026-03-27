import { useState } from "react";
import API from "../services/api";
import Register from "./Register";
import { Card, CardContent, TextField, Button, Typography, Box, Alert } from "@mui/material";

function Login({ setUser }) {

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

      setUser(res.data.user);

    } catch (error) {
      setError("Login failed: " + (error.response?.data?.message || "Unknown error"));
    }
  };

  // show register page
  if(showRegister){
    return <Register setUser={setUser} setShowRegister={setShowRegister} />;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        padding: 2
      }}
    >
      <Card sx={{ maxWidth: 400, width: '100%' }}>
        <CardContent sx={{ padding: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Supermarket POS
          </Typography>
          <Typography variant="h6" component="h2" gutterBottom align="center" color="text.secondary">
            Login
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