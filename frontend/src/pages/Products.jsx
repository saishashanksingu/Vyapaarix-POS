import { useState, useEffect } from "react";
import API from "../services/api";
import {
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  IconButton,
  Alert,
  Snackbar
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { Delete, Add } from "@mui/icons-material";

function Products() {
    const [products, setProducts] = useState([]);
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [barcode, setBarcode] = useState("");
    const [stock, setStock] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [saving, setSaving] = useState(false);

    async function loadProducts() {
        try {
            const res = await API.get("/products");
            setProducts(res.data);
        } catch (error) {
            console.error("Failed to load products:", error);
            setError("Failed to load products");
        }
    }

    useEffect(() => {
        loadProducts();
    }, []);

    const addProduct = async () => {
        if (!name || !barcode || !price || !stock) {
            setError("Please fill all fields");
            return;
        }
        try {
            setError("");
            setSuccess("");
            setSaving(true);
            await API.post("/products", {
                name: name,
                price: parseFloat(price),
                stockQuantity: parseInt(stock, 10),
                barcode: barcode,
            });

            setName("");
            setBarcode("");
            setPrice("");
            setStock("");

            setSuccess("Product added to inventory");
            loadProducts();
        } catch (error) {
            console.error("Failed to add product:", error);
            setError(error.response?.data?.message || "Failed to add product");
        } finally {
            setSaving(false);
        }
    };

    const deleteProduct = async (id) => {
        try {
            await API.delete(`/products/${id}`);
            loadProducts();
        } catch (error) {
            console.error("Failed to delete product:", error);
            setError("Failed to delete product");
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
                Product Management
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <Snackbar
                open={Boolean(success)}
                autoHideDuration={2500}
                onClose={() => setSuccess("")}
                message={success}
            />

            <Paper sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Add New Product
                </Typography>
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <TextField
                            fullWidth
                            label="Product Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <TextField
                            fullWidth
                            label="Price"
                            type="number"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <TextField
                            fullWidth
                            label="Stock Quantity"
                            type="number"
                            value={stock}
                            onChange={(e) => setStock(e.target.value)}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <TextField
                            fullWidth
                            label="Barcode"
                            value={barcode}
                            onChange={(e) => setBarcode(e.target.value)}
                        />
                    </Grid>
                    <Grid size={12}>
                        <Button
                            variant="contained"
                            startIcon={<Add />}
                            onClick={addProduct}
                            disabled={saving}
                        >
                            {saving ? "Saving…" : "Add Product"}
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                    Product List
                </Typography>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>Price</TableCell>
                                <TableCell>Stock</TableCell>
                                <TableCell>Barcode</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {products.map((p) => (
                                <TableRow key={p._id}>
                                    <TableCell>{p.name}</TableCell>
                                    <TableCell>₹{p.price}</TableCell>
                                    <TableCell>{p.stockQuantity}</TableCell>
                                    <TableCell>{p.barcode}</TableCell>
                                    <TableCell>
                                        <IconButton
                                            color="error"
                                            onClick={() => deleteProduct(p._id)}
                                        >
                                            <Delete />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Box>
    );
}

export default Products;
