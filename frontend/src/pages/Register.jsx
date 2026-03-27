import { useState } from "react";
import API from "../services/api";
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
                        Register
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