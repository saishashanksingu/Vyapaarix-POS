import { useState, useEffect } from "react";
import API from "../services/api";
import { UNIT_OPTIONS, formatQuantity, formatRate, isCountUnit } from "../utils/units";
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
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { Delete, Add, Edit } from "@mui/icons-material";

function Products() {
    const [products, setProducts] = useState([]);
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [barcode, setBarcode] = useState("");
    const [stock, setStock] = useState("");
    const [unit, setUnit] = useState("piece");
    const [reorderLevel, setReorderLevel] = useState("10");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [saving, setSaving] = useState(false);
    
    // Edit dialog states
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [editName, setEditName] = useState("");
    const [editPrice, setEditPrice] = useState("");
    const [editBarcode, setEditBarcode] = useState("");
    const [editStock, setEditStock] = useState("");
    const [editUnit, setEditUnit] = useState("piece");
    const [editReorderLevel, setEditReorderLevel] = useState("10");
    const [editSaving, setEditSaving] = useState(false);
    const [loading, setLoading] = useState(false);
    const selectedUnitLabel = UNIT_OPTIONS.find((option) => option.value === unit)?.shortLabel || unit;
    const editUnitLabel = UNIT_OPTIONS.find((option) => option.value === editUnit)?.shortLabel || editUnit;

    async function loadProducts() {
        try {
            setLoading(true);
            const res = await API.get("/products");
            setProducts(res.data);
        } catch (error) {
            console.error("Failed to load products:", error);
            setError("Failed to load products");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadProducts();
    }, []);

    const addProduct = async () => {
        if (!name || !barcode || !price || stock === "") {
            setError("Please fill all fields");
            return;
        }
        if (isCountUnit(unit) && !Number.isInteger(Number(stock))) {
            setError("Piece, box, and pack stock must be whole numbers");
            return;
        }
        if (isCountUnit(unit) && !Number.isInteger(Number(reorderLevel || 0))) {
            setError("Piece, box, and pack reorder levels must be whole numbers");
            return;
        }
        try {
            setError("");
            setSuccess("");
            setSaving(true);
            await API.post("/products", {
                name: name,
                price: parseFloat(price),
                stockQuantity: parseFloat(stock),
                barcode: barcode,
                unit: unit,
                reorderLevel: parseFloat(reorderLevel || 0)
            });

            setName("");
            setBarcode("");
            setPrice("");
            setStock("");
            setUnit("piece");
            setReorderLevel("10");

            setSuccess("Product added successfully!");
            loadProducts();
        } catch (error) {
            console.error("Failed to add product:", error);
            setError(error.response?.data?.message || "Failed to add product");
        } finally {
            setSaving(false);
        }
    };

    const openEditDialog = (product) => {
        setEditingProduct(product);
        setEditName(product.name);
        setEditPrice(product.price);
        setEditBarcode(product.barcode);
        setEditStock(product.stockQuantity);
        setEditUnit(product.unit || "piece");
        setEditReorderLevel(product.reorderLevel ?? 10);
        setEditDialogOpen(true);
    };

    const closeEditDialog = () => {
        setEditDialogOpen(false);
        setEditingProduct(null);
        setEditName("");
        setEditPrice("");
        setEditBarcode("");
        setEditStock("");
        setEditUnit("piece");
        setEditReorderLevel("10");
    };

    const updateProduct = async () => {
        if (!editName || !editBarcode || !editPrice || editStock === "") {
            setError("Please fill all fields");
            return;
        }
        if (isCountUnit(editUnit) && !Number.isInteger(Number(editStock))) {
            setError("Piece, box, and pack stock must be whole numbers");
            return;
        }
        if (isCountUnit(editUnit) && !Number.isInteger(Number(editReorderLevel || 0))) {
            setError("Piece, box, and pack reorder levels must be whole numbers");
            return;
        }

        try {
            setError("");
            setEditSaving(true);
            await API.put(`/products/${editingProduct._id}`, {
                name: editName,
                price: parseFloat(editPrice),
                stockQuantity: parseFloat(editStock),
                barcode: editBarcode,
                unit: editUnit,
                reorderLevel: parseFloat(editReorderLevel || 0)
            });

            setSuccess("Product updated successfully!");
            closeEditDialog();
            loadProducts();
        } catch (error) {
            console.error("Failed to update product:", error);
            setError(error.response?.data?.message || "Failed to update product");
        } finally {
            setEditSaving(false);
        }
    };

    const deleteProduct = async (id) => {
        if (window.confirm("Are you sure you want to delete this product?")) {
            try {
                setError("");
                await API.delete(`/products/${id}`);
                setSuccess("Product deleted successfully!");
                loadProducts();
            } catch (error) {
                console.error("Failed to delete product:", error);
                setError("Failed to delete product");
            }
        }
    };

    return (
        <Box sx={{ p: 3, backgroundColor: "#f5f5f5", minHeight: "100vh", width: "100%" }}>
            <Box sx={{ width: "100%", maxWidth: "1400px", mx: "auto", px: { xs: 1, sm: 2, md: 3 } }}>
                <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold", mb: 3 }}>
                📦 Product Management
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
            <Snackbar
                open={Boolean(success)}
                autoHideDuration={3000}
                onClose={() => setSuccess("")}
                message={success}
            />

            {/* Add Product Section */}
            <Paper sx={{ p: 3, mb: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: "600", mb: 2 }}>
                    ➕ Add New Product
                </Typography>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            fullWidth
                            label="Product Name"
                            placeholder="Enter product name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            variant="outlined"
                            size="small"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            fullWidth
                            label={`Rate per ${selectedUnitLabel} (Rs.)`}
                            placeholder="0.00"
                            type="number"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            variant="outlined"
                            size="small"
                            inputProps={{ step: "0.01", min: "0" }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                        <TextField
                            fullWidth
                            label={`Stock (${selectedUnitLabel})`}
                            placeholder="0"
                            type="number"
                            value={stock}
                            onChange={(e) => setStock(e.target.value)}
                            variant="outlined"
                            size="small"
                            inputProps={{ step: isCountUnit(unit) ? "1" : "0.01", min: "0" }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Unit</InputLabel>
                            <Select
                                value={unit}
                                label="Unit"
                                onChange={(e) => setUnit(e.target.value)}
                            >
                                {UNIT_OPTIONS.map((u) => (
                                    <MenuItem key={u.value} value={u.value}>
                                        {u.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                        <TextField
                            fullWidth
                            label={`Reorder Level (${selectedUnitLabel})`}
                            placeholder="10"
                            type="number"
                            value={reorderLevel}
                            onChange={(e) => setReorderLevel(e.target.value)}
                            variant="outlined"
                            size="small"
                            inputProps={{ step: isCountUnit(unit) ? "1" : "0.01", min: "0" }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                        <TextField
                            fullWidth
                            label="Barcode"
                            placeholder="Enter barcode"
                            value={barcode}
                            onChange={(e) => setBarcode(e.target.value)}
                            variant="outlined"
                            size="small"
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Button
                            variant="contained"
                            startIcon={<Add />}
                            onClick={addProduct}
                            disabled={saving}
                            sx={{
                                backgroundColor: "#f59e0b",
                                "&:hover": { backgroundColor: "#d97706" },
                                textTransform: "none",
                                fontWeight: "600"
                            }}
                        >
                            {saving ? "Adding…" : "Add Product"}
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            {/* Product List Section */}
            <Paper sx={{ p: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: "600", mb: 2 }}>
                    📋 Product List ({products.length})
                </Typography>
                
                {loading ? (
                    <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : products.length === 0 ? (
                    <Alert severity="info">No products found. Add a product to get started!</Alert>
                ) : (
                    <TableContainer sx={{ overflowX: "auto", width: "100%" }}>
                        <Table sx={{ minWidth: 0, width: "100%" }}>
                            <TableHead sx={{ backgroundColor: "#f0f0f0" }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: "700", color: "#1976d2" }}>Product Name</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: "700", color: "#1976d2" }}>Price</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: "700", color: "#1976d2" }}>Stock</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: "700", color: "#1976d2" }}>Unit</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: "700", color: "#1976d2" }}>Reorder</TableCell>
                                    <TableCell sx={{ fontWeight: "700", color: "#1976d2" }}>Barcode</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: "700", color: "#1976d2" }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {products.map((p) => (
                                    <TableRow
                                        key={p._id}
                                        sx={{
                                            "&:hover": { backgroundColor: "#fafafa" },
                                            borderBottom: "1px solid #e0e0e0"
                                        }}
                                    >
                                        <TableCell sx={{ fontWeight: "500" }}>{p.name}</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: "500", color: "#2e7d32" }}>
                                            {formatRate(p.price, p.unit)}
                                        </TableCell>
                                        <TableCell
                                            align="center"
                                            sx={{
                                                fontWeight: "600",
                                                color: p.stockQuantity <= (p.reorderLevel ?? 5) ? "#d32f2f" : "#1976d2",
                                                backgroundColor: p.stockQuantity <= (p.reorderLevel ?? 5) ? "#ffebee" : "transparent"
                                            }}
                                        >
                                            {formatQuantity(p.stockQuantity, p.unit)}
                                        </TableCell>
                                        <TableCell align="center" sx={{ fontWeight: "500", color: "#666" }}>
                                            {UNIT_OPTIONS.find((option) => option.value === p.unit)?.label || p.unit || "Piece"}
                                        </TableCell>
                                        <TableCell align="center" sx={{ fontWeight: "500", color: "#666" }}>
                                            {formatQuantity(p.reorderLevel ?? 0, p.unit)}
                                        </TableCell>
                                        <TableCell sx={{ fontFamily: "monospace", fontSize: "0.9rem" }}>
                                            {p.barcode}
                                        </TableCell>
                                        <TableCell align="center">
                                            <IconButton
                                                size="small"
                                                color="primary"
                                                onClick={() => openEditDialog(p)}
                                                title="Edit Product"
                                                sx={{
                                                    backgroundColor: "#e3f2fd",
                                                    "&:hover": { backgroundColor: "#bbdefb" },
                                                    mr: 1
                                                }}
                                            >
                                                <Edit fontSize="small" />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                color="error"
                                                onClick={() => deleteProduct(p._id)}
                                                title="Delete Product"
                                                sx={{
                                                    backgroundColor: "#ffebee",
                                                    "&:hover": { backgroundColor: "#ffcdd2" }
                                                }}
                                            >
                                                <Delete fontSize="small" />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Paper>
            </Box>

            {/* Edit Product Dialog */}
            <Dialog open={editDialogOpen} onClose={closeEditDialog} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: "700", color: "#1976d2" }}>
                    ✏️ Edit Product
                </DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    <TextField
                        fullWidth
                        label="Product Name"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        margin="normal"
                        variant="outlined"
                    />
                    <TextField
                        fullWidth
                        label={`Rate per ${editUnitLabel} (Rs.)`}
                        type="number"
                        value={editPrice}
                        onChange={(e) => setEditPrice(e.target.value)}
                        margin="normal"
                        variant="outlined"
                        inputProps={{ step: "0.01", min: "0" }}
                    />
                    <TextField
                        fullWidth
                        label={`Stock (${editUnitLabel})`}
                        type="number"
                        value={editStock}
                        onChange={(e) => setEditStock(e.target.value)}
                        margin="normal"
                        variant="outlined"
                        inputProps={{ step: isCountUnit(editUnit) ? "1" : "0.01", min: "0" }}
                    />
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Unit</InputLabel>
                        <Select
                            value={editUnit}
                            label="Unit"
                            onChange={(e) => setEditUnit(e.target.value)}
                        >
                            {UNIT_OPTIONS.map((u) => (
                                <MenuItem key={u.value} value={u.value}>
                                    {u.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <TextField
                        fullWidth
                        label={`Reorder Level (${editUnitLabel})`}
                        type="number"
                        value={editReorderLevel}
                        onChange={(e) => setEditReorderLevel(e.target.value)}
                        margin="normal"
                        variant="outlined"
                        inputProps={{ step: isCountUnit(editUnit) ? "1" : "0.01", min: "0" }}
                    />
                    <TextField
                        fullWidth
                        label="Barcode"
                        value={editBarcode}
                        onChange={(e) => setEditBarcode(e.target.value)}
                        margin="normal"
                        variant="outlined"
                    />
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={closeEditDialog} variant="outlined">
                        Cancel
                    </Button>
                    <Button
                        onClick={updateProduct}
                        variant="contained"
                        disabled={editSaving}
                        sx={{
                            backgroundColor: "#f59e0b",
                            "&:hover": { backgroundColor: "#d97706" }
                        }}
                    >
                        {editSaving ? "Updating…" : "Update Product"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default Products;
