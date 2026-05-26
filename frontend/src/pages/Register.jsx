import { useState } from "react";
import API from "../services/api";
import logo from "../assets/vyaaparix-logo.jpg";
import { Card, CardContent, TextField, Button, Typography, Box, Alert, FormControl, InputLabel, Select, MenuItem } from "@mui/material";

function Register({ setUser, setShowRegister }) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("Cashier");
    const [error, setError] = useState("");

    const handleRegister = async () => {
        try {
            setError("");
            const res = await API.post("/auth/register", {
                name,
                email,
                password,
                role
            });
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("user", JSON.stringify(res.data.user));
            setUser(res.data.user);
            setShowRegister(false);
            // alert("User Registered Successfully!");

        } catch (error) {
            setError("Registration Failed: " + (error.response?.data?.message || "Unknown error"));
        }
    };

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
                        Register
                    </Typography>
                    <Typography variant="subtitle1" component="h2" gutterBottom align="center" sx={{ color: '#6b7280', mb: 4 }}>
                        Create your store account
                    </Typography>

                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                    <TextField
                        fullWidth
                        label="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        margin="normal"
                        required
                    />

                    <TextField
                        fullWidth
                        label="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        margin="normal"
                        required
                    />

                    <TextField
                        fullWidth
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleRegister()}
                        margin="normal"
                        required
                    />

                    <FormControl fullWidth margin="normal">
                        <InputLabel>Role</InputLabel>
                        <Select
                            value={role}
                            label="Role"
                            onChange={(e) => setRole(e.target.value)}
                        >
                            <MenuItem value="Cashier">Cashier</MenuItem>
                            <MenuItem value="Admin">Admin</MenuItem>
                        </Select>
                    </FormControl>

                    <Button
                        fullWidth
                        variant="contained"
                        color="primary"
                        onClick={handleRegister}
                        sx={{ mt: 2, mb: 2 }}
                    >
                        Register
                    </Button>

                    <Button
                        fullWidth
                        variant="outlined"
                        onClick={() => setShowRegister(false)}
                    >
                        Back to Login
                    </Button>
                </CardContent>
            </Card>
        </Box>
    );
}

export default Register;