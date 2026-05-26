import { useEffect, useState } from "react";
import API from "../services/api";
import Receipt from "./Receipt";
import {
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    Box,
    Chip
} from "@mui/material";

function SalesHistory() {
    const [sales, setSales] = useState([]);
    const [selectedSale, setSelectedSale] = useState(null);

    async function loadSales() {
        try {
            const res = await API.get("/sales");
            setSales(res.data);
        } catch (error) {
            console.error("Failed to load sales:", error);
        }
    }

    useEffect(() => {
        loadSales();
    }, []);

    if (selectedSale) {
        return <Receipt saleId={selectedSale} />;
    }

    return (
        <Box sx={{ p: 3, width: "100%", backgroundColor: "#f8f9fb" }}>
            <Box sx={{ width: "100%", maxWidth: "1400px", mx: "auto", px: { xs: 1, sm: 2, md: 3 } }}>
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
                    Sales History
                </Typography>

                <TableContainer component={Paper} sx={{ overflowX: "auto", width: "100%", boxShadow: '0 16px 40px rgba(15, 23, 42, 0.08)' }}>
                    <Table sx={{ minWidth: 0, width: "100%" }}>
                        <TableHead>
                            <TableRow>
                                <TableCell>Sale ID</TableCell>
                                <TableCell>Date</TableCell>
                                <TableCell>Total Amount</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {sales.map((sale) => (
                                <TableRow key={sale._id}>
                                    <TableCell>{sale._id}</TableCell>
                                    <TableCell>
                                        {new Date(sale.createdAt).toLocaleString()}
                                    </TableCell>
                                    <TableCell>
                                        <Chip label={`Rs.${Number(sale.totalAmount || 0).toFixed(2)}`} color="primary" />
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={() => setSelectedSale(sale._id)}
                                            sx={{ textTransform: 'none', backgroundColor: '#f59e0b', '&:hover': { backgroundColor: '#d97706' } }}
                                        >
                                            View Receipt
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        </Box>
    );
}

export default SalesHistory;
