import { useCallback, useEffect, useState } from "react";
import API from "../services/api";
import {
    Typography,
    Card,
    CardContent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    Box,
    Divider
} from "@mui/material";
import { Download } from "@mui/icons-material";

function Receipt({ saleId }) {
    const [receipt, setReceipt] = useState(null);

    const fetchReceipt = useCallback(async () => {
        try {
            const res = await API.get(`/sales/receipt/${saleId}`);
            setReceipt(res.data);
        } catch (error) {
            console.error("Failed to fetch receipt:", error);
        }
    }, [saleId]);

    useEffect(() => {
        if (saleId) {
            fetchReceipt();
        }
    }, [saleId, fetchReceipt]);

    if (!receipt) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography>Loading Receipt...</Typography>
            </Box>
        );
    }

    const downloadPDF = () => {
        window.open(
            `http://localhost:5000/api/sales/receipt-pdf/${receipt.receiptId}`,
            "_blank"
        );
    };

    return (
        <Box sx={{ p: 3 }}>
            <Card sx={{ maxWidth: 600, mx: 'auto' }}>
                <CardContent>
                    <Typography variant="h5" align="center" gutterBottom>
                        Receipt
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        <strong>Receipt ID:</strong> {receipt.receiptId}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        <strong>Date:</strong> {new Date(receipt.date).toLocaleString()}
                    </Typography>

                    <Divider sx={{ my: 2 }} />

                    <Typography variant="h6" gutterBottom>
                        Items
                    </Typography>
                    <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Item</TableCell>
                                    <TableCell align="right">Price</TableCell>
                                    <TableCell align="right">Qty</TableCell>
                                    <TableCell align="right">Total</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {receipt.items.map((item, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{item.name}</TableCell>
                                        <TableCell align="right">₹{item.price}</TableCell>
                                        <TableCell align="right">{item.quantity}</TableCell>
                                        <TableCell align="right">₹{item.total}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <Divider sx={{ my: 2 }} />

                    <Typography variant="h6" align="right">
                        Total: ₹{receipt.totalAmount}
                    </Typography>

                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                        <Button
                            variant="contained"
                            startIcon={<Download />}
                            onClick={downloadPDF}
                        >
                            Download Receipt PDF
                        </Button>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
}

export default Receipt;