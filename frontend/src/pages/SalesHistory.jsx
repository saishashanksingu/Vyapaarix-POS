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
        <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
                Sales History
            </Typography>

            <TableContainer component={Paper}>
                <Table>
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
                                    <Chip label={`₹${sale.totalAmount}`} color="primary" />
                                </TableCell>
                                <TableCell>
                                    <Button
                                        variant="outlined"
                                        onClick={() => setSelectedSale(sale._id)}
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
    );
}

export default SalesHistory;