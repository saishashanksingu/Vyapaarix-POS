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

  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotCode, setForgotCode] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState("");
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotError, setForgotError] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

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

  const handleRequestCode = async () => {
    if (!forgotEmail) {
      setForgotError("Email is required");
      return;
    }
    try {
      setForgotLoading(true);
      setForgotError("");
      setForgotSuccess("");
      await API.post("/auth/forgot-password", { email: forgotEmail });
      setForgotSuccess("Verification code generated! Please check server console logs.");
      setForgotStep(2);
    } catch (err) {
      setForgotError(err.response?.data?.message || "Failed to generate reset code");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!forgotCode || !forgotNewPassword) {
      setForgotError("Code and new password are required");
      return;
    }
    if (forgotNewPassword !== forgotConfirmPassword) {
      setForgotError("New passwords do not match");
      return;
    }
    try {
      setForgotLoading(true);
      setForgotError("");
      setForgotSuccess("");
      await API.post("/auth/reset-password", {
        email: forgotEmail,
        code: forgotCode,
        newPassword: forgotNewPassword
      });
      setForgotSuccess("Password reset successfully! You can now login.");
      setTimeout(() => {
        setShowForgotPassword(false);
        setForgotStep(1);
        setForgotEmail("");
        setForgotCode("");
        setForgotNewPassword("");
        setForgotConfirmPassword("");
        setForgotSuccess("");
      }, 2000);
    } catch (err) {
      setForgotError(err.response?.data?.message || "Failed to reset password");
    } finally {
      setForgotLoading(false);
    }
  };

  // show register page
  if(showRegister){
    return <Register setUser={setUser} setStore={setStore} setShowRegister={setShowRegister} />;
  }

  if (showForgotPassword) {
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
              Reset Password
            </Typography>
            <Typography variant="subtitle1" component="h2" gutterBottom align="center" sx={{ color: '#6b7280', mb: 4 }}>
              {forgotStep === 1 ? "Enter your email to request a reset code" : "Enter reset code & your new password"}
            </Typography>

            {forgotError && <Alert severity="error" sx={{ mb: 2 }}>{forgotError}</Alert>}
            {forgotSuccess && <Alert severity="success" sx={{ mb: 2 }}>{forgotSuccess}</Alert>}

            {forgotStep === 1 ? (
              <>
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  margin="normal"
                  required
                  disabled={forgotLoading}
                />
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  onClick={handleRequestCode}
                  sx={{ mt: 2, mb: 2 }}
                  disabled={forgotLoading}
                >
                  {forgotLoading ? "Sending..." : "Send Reset Code"}
                </Button>
              </>
            ) : (
              <>
                <TextField
                  fullWidth
                  label="6-Digit Code"
                  type="text"
                  value={forgotCode}
                  onChange={(e) => setForgotCode(e.target.value)}
                  margin="normal"
                  required
                  disabled={forgotLoading}
                  helperText="Retrieve from server terminal logs"
                />
                <TextField
                  fullWidth
                  label="New Password"
                  type="password"
                  value={forgotNewPassword}
                  onChange={(e) => setForgotNewPassword(e.target.value)}
                  margin="normal"
                  required
                  disabled={forgotLoading}
                />
                <TextField
                  fullWidth
                  label="Confirm New Password"
                  type="password"
                  value={forgotConfirmPassword}
                  onChange={(e) => setForgotConfirmPassword(e.target.value)}
                  margin="normal"
                  required
                  disabled={forgotLoading}
                />
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  onClick={handleResetPassword}
                  sx={{ mt: 2, mb: 2 }}
                  disabled={forgotLoading}
                >
                  {forgotLoading ? "Resetting..." : "Reset Password"}
                </Button>
              </>
            )}

            <Button
              fullWidth
              variant="outlined"
              onClick={() => {
                setShowForgotPassword(false);
                setForgotStep(1);
                setForgotError("");
                setForgotSuccess("");
              }}
              disabled={forgotLoading}
            >
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
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

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
            <Button onClick={() => setShowForgotPassword(true)} sx={{ p: 0, minWidth: 'auto', fontSize: '0.85rem' }}>
              Forgot Password?
            </Button>
          </Box>

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
