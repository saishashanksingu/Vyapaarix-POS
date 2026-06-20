import { useEffect, useState } from "react";
import API from "../services/api";
import {
    Typography,
    Card,
    CardContent,
    Box,
    Grid,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    CircularProgress,
    Alert,
    Avatar,
    Divider
} from "@mui/material";
import { People, Receipt, TrendingUp } from "@mui/icons-material";

function Cashiers() {
    const [cashiers, setCashiers] = useState([]);
    const [selectedCashierData, setSelectedCashierData] = useState(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [error, setError] = useState("");

    async function loadCashiers() {
        try {
            setLoading(true);
            setError("");
            const res = await API.get("/auth/cashiers");
            setCashiers(res.data);
        } catch (error) {
            console.error("Failed to load cashiers:", error);
            setError("Failed to load cashiers information from server.");
        } finally {
            setLoading(false);
        }
    }

    async function viewDetails(cashierId) {
        try {
            setDetailsLoading(true);
            setDetailsOpen(true);
            const res = await API.get(`/auth/cashiers/${cashierId}`);
            setSelectedCashierData(res.data);
        } catch (error) {
            console.error("Failed to load cashier details:", error);
            setError("Failed to load cashier details.");
            setDetailsOpen(false);
        } finally {
            setDetailsLoading(false);
        }
    }

    useEffect(() => {
        loadCashiers();
    }, []);

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "300px" }}>
                <CircularProgress color="primary" />
            </Box>
        );
    }

    return (
        <Box sx={{ p: { xs: 1, md: 3 } }}>
            <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: "#111827", display: "flex", alignItems: "center", gap: 1 }}>
                        <People color="primary" /> Store Cashiers
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#6b7280", mt: 0.5 }}>
                        Monitor performance and profile details for cashiers assigned to this store.
                    </Typography>
                </Box>
                <Button variant="outlined" color="primary" onClick={loadCashiers}>
                    Refresh List
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            {cashiers.length === 0 ? (
                <Alert severity="info">No cashiers registered in this store yet. Share your store invite code to invite cashiers.</Alert>
            ) : (
                <Grid container spacing={3}>
                    {cashiers.map((cashier) => {
                        const totalRev = cashier.performance?.totalSales || 0;
                        const salesCount = cashier.performance?.salesCount || 0;
                        const avgVal = cashier.performance?.avgSaleValue || 0;
                        
                        return (
                            <Grid item xs={12} sm={6} md={4} key={cashier._id}>
                                <Card sx={{
                                    height: "100%",
                                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                                    "&:hover": {
                                        transform: "translateY(-4px)",
                                        boxShadow: "0 12px 30px rgba(245, 158, 11, 0.12)"
                                    }
                                }}>
                                    <CardContent sx={{ p: 3 }}>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                                            <Avatar sx={{ bgcolor: "primary.main", color: "primary.contrastText", width: 56, height: 56 }}>
                                                {cashier.name.charAt(0).toUpperCase()}
                                            </Avatar>
                                            <Box>
                                                <Typography variant="h6" sx={{ fontWeight: 700, color: "#111827" }}>
                                                    {cashier.name}
                                                </Typography>
                                                <Typography variant="body2" sx={{ color: "#6b7280" }}>
                                                    {cashier.email}
                                                </Typography>
                                            </Box>
                                        </Box>

                                        <Divider sx={{ my: 2 }} />

                                        <Grid container spacing={2} sx={{ mb: 3 }}>
                                            <Grid item xs={6}>
                                                <Typography variant="caption" sx={{ color: "#9ca3af", display: "block" }}>
                                                    Total Revenue
                                                </Typography>
                                                <Typography variant="body1" sx={{ fontWeight: 700, color: "#2e7d32" }}>
                                                    ₹{totalRev.toFixed(2)}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="caption" sx={{ color: "#9ca3af", display: "block" }}>
                                                    Transactions
                                                </Typography>
                                                <Typography variant="body1" sx={{ fontWeight: 700, color: "#111827" }}>
                                                    {salesCount}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={12}>
                                                <Typography variant="caption" sx={{ color: "#9ca3af", display: "block" }}>
                                                    Avg Transaction Value
                                                </Typography>
                                                <Typography variant="body2" sx={{ fontWeight: 600, color: "#4b5563" }}>
                                                    ₹{avgVal.toFixed(2)}
                                                </Typography>
                                            </Grid>
                                        </Grid>

                                        <Button
                                            fullWidth
                                            variant="contained"
                                            onClick={() => viewDetails(cashier._id)}
                                            sx={{ mt: "auto" }}
                                        >
                                            View Profile & History
                                        </Button>
                                    </CardContent>
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>
            )}

            {/* Cashier Details Modal */}
            <Dialog
                open={detailsOpen}
                onClose={() => setDetailsOpen(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: 4, px: { xs: 1, sm: 2 } }
                }}
            >
                {detailsLoading || !selectedCashierData ? (
                    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "200px" }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <>
                        <DialogTitle sx={{ fontWeight: 700, fontSize: "1.25rem", pb: 1, pt: 3 }}>
                            Cashier Profile Detail
                        </DialogTitle>
                        <DialogContent>
                            <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 3, alignItems: "center", mb: 4, mt: 1 }}>
                                <Avatar sx={{ bgcolor: "primary.main", color: "primary.contrastText", width: 80, height: 80, fontSize: "2rem" }}>
                                    {selectedCashierData.cashier.name.charAt(0).toUpperCase()}
                                </Avatar>
                                <Box sx={{ textAlign: { xs: "center", sm: "left" } }}>
                                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                                        {selectedCashierData.cashier.name}
                                    </Typography>
                                    <Typography variant="body1" sx={{ color: "#6b7280", mb: 1 }}>
                                        {selectedCashierData.cashier.email}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: "#9ca3af", display: "block" }}>
                                        Account Role: {selectedCashierData.cashier.role}
                                    </Typography>
                                </Box>
                            </Box>

                            <Divider sx={{ my: 3 }} />

                            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                                <TrendingUp color="primary" /> Performance Overview
                            </Typography>
                            <Grid container spacing={3} sx={{ mb: 4 }}>
                                <Grid item xs={12} sm={4}>
                                    <Paper sx={{ p: 2, textAlign: "center", bgcolor: "#f0fdf4", border: "1px solid #bbf7d0" }}>
                                        <Typography variant="caption" sx={{ color: "#166534" }}>Total Revenue</Typography>
                                        <Typography variant="h6" sx={{ fontWeight: 700, color: "#15803d" }}>
                                            ₹{selectedCashierData.performance.totalSales.toFixed(2)}
                                        </Typography>
                                    </Paper>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <Paper sx={{ p: 2, textAlign: "center", bgcolor: "#eff6ff", border: "1px solid #bfdbfe" }}>
                                        <Typography variant="caption" sx={{ color: "#1e40af" }}>Transactions Count</Typography>
                                        <Typography variant="h6" sx={{ fontWeight: 700, color: "#1d4ed8" }}>
                                            {selectedCashierData.performance.salesCount}
                                        </Typography>
                                    </Paper>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <Paper sx={{ p: 2, textAlign: "center", bgcolor: "#fffbeb", border: "1px solid #fde68a" }}>
                                        <Typography variant="caption" sx={{ color: "#854d0e" }}>Average Sale Value</Typography>
                                        <Typography variant="h6" sx={{ fontWeight: 700, color: "#b45309" }}>
                                            ₹{selectedCashierData.performance.avgSaleValue.toFixed(2)}
                                        </Typography>
                                    </Paper>
                                </Grid>
                            </Grid>

                            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                                <Receipt color="primary" /> Recent Transactions (Max 10)
                            </Typography>
                            {selectedCashierData.recentSales.length === 0 ? (
                                <Alert severity="info">No transactions processed by this cashier yet.</Alert>
                            ) : (
                                <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #e5e7eb" }}>
                                    <Table size="small">
                                        <TableHead sx={{ bgcolor: "#f9fafb" }}>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                                                <TableCell sx={{ fontWeight: 700 }}>Items Count</TableCell>
                                                <TableCell sx={{ fontWeight: 700 }} align="right">Amount</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {selectedCashierData.recentSales.map((sale) => (
                                                <TableRow key={sale._id}>
                                                    <TableCell>{new Date(sale.createdAt).toLocaleString()}</TableCell>
                                                    <TableCell>
                                                        {sale.items.reduce((sum, item) => sum + item.quantity, 0)} items
                                                    </TableCell>
                                                    <TableCell align="right" sx={{ fontWeight: 600, color: "#15803d" }}>
                                                        ₹{sale.totalAmount.toFixed(2)}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                        </DialogContent>
                        <DialogActions sx={{ pb: 3, px: 3 }}>
                            <Button onClick={() => setDetailsOpen(false)} variant="contained">
                                Close
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </Box>
    );
}

export default Cashiers;
