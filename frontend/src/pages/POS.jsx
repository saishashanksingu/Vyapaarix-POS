import { useEffect, useState } from "react";
import API from "../services/api";
import Receipt from "./Receipt";
import BarcodeScanner from "../components/BarcodeScanner";
import {
    formatQuantity,
    formatRate,
    getDefaultQuantity,
    getQuantityStep,
    getUnitMeta,
    normalizeQuantityInput
} from "../utils/units";
import {
  Card,
  CardContent,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  TextField,
  Box,
  Divider,
  Chip,
  Paper,
  InputAdornment,
  CircularProgress
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { Add, Remove, ShoppingCart, QrCodeScanner, Search, Delete } from "@mui/icons-material";

function POS() {
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [saleId, setSaleId] = useState(null);
    const [barcode, setBarcode] = useState("");
    const [barcodeQuantity, setBarcodeQuantity] = useState(1);
    const [showScanner, setShowScanner] = useState(false);
    const [productQuery, setProductQuery] = useState("");
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [checkoutLoading, setCheckoutLoading] = useState(false);
    const [scanLookupLoading, setScanLookupLoading] = useState(false);
    const [lastScannedCode, setLastScannedCode] = useState("");
    const [productQuantities, setProductQuantities] = useState({});

    async function loadProducts() {
        try {
            setLoadingProducts(true);
            const res = await API.get("/products");
            setProducts(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingProducts(false);
        }
    }

    useEffect(() => {
        loadProducts();
    }, []);

    const addToCart = (product, quantity = null) => {
        const unit = product.unit || "piece";
        const requestedQuantity = normalizeQuantityInput(quantity ?? getDefaultQuantity(unit), unit);
        if (!requestedQuantity) {
            alert("Enter a valid quantity");
            return;
        }

        const existing = cart.find((item) => item._id === product._id);
        const currentQuantity = existing ? Number(existing.quantity || 0) : 0;
        const nextQuantity = Number((currentQuantity + requestedQuantity).toFixed(3));

        if (nextQuantity > Number(product.stockQuantity || 0)) {
            alert(`Only ${formatQuantity(product.stockQuantity, unit)} available for ${product.name}`);
            return;
        }

        if (existing) {
            const updatedCart = cart.map((item) =>
                item._id === product._id
                    ? { ...item, quantity: nextQuantity }
                    : item
            );
            setCart(updatedCart);
        } else {
            setCart([...cart, { ...product, quantity: requestedQuantity }]);
        }
        setProductQuantities((current) => ({
            ...current,
            [product._id]: getDefaultQuantity(unit)
        }));
    };

    const updateQuantity = (productId, delta) => {
        const updatedCart = cart.map((item) => {
            if (item._id === productId) {
                const newQuantity = normalizeQuantityInput(item.quantity + delta, item.unit);
                if (newQuantity && newQuantity > Number(item.stockQuantity || 0)) {
                    alert(`Only ${formatQuantity(item.stockQuantity, item.unit)} available for ${item.name}`);
                    return item;
                }
                return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
            }
            return item;
        }).filter(Boolean);
        setCart(updatedCart);
    };

    const removeFromCart = (productId) => {
        setCart(cart.filter(item => item._id !== productId));
    };

    const total = cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    const checkout = async () => {
        try {
            setCheckoutLoading(true);
            const items = cart.map((item) => ({
                productId: item._id,
                quantity: item.quantity
            }));

            const res = await API.post("/sales", { items });

            if (res.data && res.data.sale && res.data.sale._id) {
                setSaleId(res.data.sale._id);
            }

            setCart([]);
            loadProducts();
        } catch (error) {
            console.error("Checkout failed:", error);
            alert(error.response?.data?.message || "Checkout failed. Please try again.");
        } finally {
            setCheckoutLoading(false);
        }
    };

    const scanBarcode = async () => {
        if (!barcode.trim()) return;
        try {
            const res = await API.get(`/products/barcode/${barcode}`);
            addToCart(res.data, barcodeQuantity);
            setBarcode("");
            setBarcodeQuantity(1);
        } catch (error) {
            console.error("Barcode lookup failed:", error);
            alert("Product not found");
        }
    };

    const handleScan = async (scannedBarcode) => {
        if (!scannedBarcode || scanLookupLoading) return;
        if (scannedBarcode === lastScannedCode) return;

        try {
            setScanLookupLoading(true);
            setLastScannedCode(scannedBarcode);
            const res = await API.get(`/products/barcode/${scannedBarcode}`);
            addToCart(res.data, getDefaultQuantity(res.data.unit));
            setShowScanner(false);
        } catch (error) {
            console.error("Scanner lookup failed:", error);
            alert("Product not found");
        } finally {
            setScanLookupLoading(false);
            setTimeout(() => setLastScannedCode(""), 1000);
        }
    };

    const filteredProducts = products.filter((p) => {
        const q = productQuery.trim().toLowerCase();
        if (!q) return true;
        return (
            String(p.name || "").toLowerCase().includes(q) ||
            String(p.barcode || "").toLowerCase().includes(q)
        );
    });

    return (
        <>
            {saleId ? (
                <Receipt saleId={saleId} />
            ) : (
                <Box sx={{ backgroundColor: "#f8f9fa", minHeight: "100vh", py: { xs: 1.5, sm: 2, md: 3 }, width: "100%" }}>
                    <Box sx={{ width: "100%", maxWidth: "1400px", mx: "auto", px: { xs: 1, sm: 2, md: 3 } }}>
                        {/* Header */}
                        <Box sx={{ mb: { xs: 2, md: 3 } }}>
                            <Typography
                                variant="h4"
                                sx={{
                                    fontWeight: 700,
                                    color: "#1a1a1a",
                                    mb: 0.5,
                                    fontSize: { xs: "1.75rem", sm: "2rem", md: "2.5rem" }
                                }}
                            >
                                🛒 Point of Sale
                            </Typography>
                            <Typography variant="body2" sx={{ color: "#999" }}>
                                Manage products and complete transactions
                            </Typography>
                        </Box>

                        <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }} sx={{ alignItems: "flex-start" }}>
                            {/* Products Section - Left Pane */}
                            <Grid item xs={12} md={7} lg={8}>
                                <Paper
                                    sx={{
                                        borderRadius: 2,
                                        overflow: "hidden",
                                        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
                                        height: "100%",
                                        display: "flex",
                                        flexDirection: "column"
                                    }}
                                >
                                    <Box
                                        sx={{
                                            px: { xs: 1.5, sm: 2 },
                                            py: 1.5,
                                            borderBottom: "1px solid #e0e0e0",
                                            backgroundColor: "#fafafa"
                                        }}
                                    >
                                        <Typography
                                            variant="h6"
                                            sx={{
                                                fontWeight: 700,
                                                mb: { xs: 1.5, sm: 0 },
                                                fontSize: { xs: "1rem", sm: "1.1rem" }
                                            }}
                                        >
                                            📦 Product Inventory
                                        </Typography>
                                        <TextField
                                            size="small"
                                            value={productQuery}
                                            onChange={(e) => setProductQuery(e.target.value)}
                                            placeholder="Search by product name or barcode..."
                                            fullWidth
                                            sx={{ mt: { xs: 1, sm: 0 } }}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <Search fontSize="small" sx={{ color: "#999" }} />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </Box>

                                    <Box sx={{ p: { xs: 1.5, sm: 2 }, overflow: "auto", flex: 1 }}>
                                        {loadingProducts ? (
                                            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                                                <CircularProgress />
                                            </Box>
                                        ) : filteredProducts.length === 0 ? (
                                            <Typography color="text.secondary" align="center" sx={{ py: 3 }}>
                                                {productQuery ? "No matching products found" : "No products available"}
                                            </Typography>
                                        ) : (
                                            <Grid container spacing={{ xs: 1, sm: 1.5 }}>
                                                {filteredProducts.map((p) => {
                                                    const stockQty = Number(p.stockQuantity ?? 0);
                                                    const outOfStock = stockQty <= 0;
                                                    const unitMeta = getUnitMeta(p.unit);
                                                    const selectedQuantity = productQuantities[p._id] ?? getDefaultQuantity(p.unit);
                                                    return (
                                                        <Grid item xs={12} sm={6} lg={4} key={p._id}>
                                                            <Card
                                                                sx={{
                                                                    height: "100%",
                                                                    display: "flex",
                                                                    flexDirection: "column",
                                                                    transition: "all 0.3s ease",
                                                                    border: "1px solid #e0e0e0",
                                                                    "&:hover": {
                                                                        transform: "translateY(-4px)",
                                                                        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)"
                                                                    },
                                                                    opacity: outOfStock ? 0.6 : 1
                                                                }}
                                                            >
                                                                <CardContent sx={{ display: "flex", flexDirection: "column", gap: 1, flex: 1, pb: 1 }}>
                                                                    <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1 }}>
                                                                        <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.3, flex: 1 }}>
                                                                            {p.name}
                                                                        </Typography>
                                                                        <Chip
                                                                            label={outOfStock ? "Out" : formatQuantity(stockQty, p.unit)}
                                                                            size="small"
                                                                            color={outOfStock ? "default" : stockQty <= 5 ? "warning" : "success"}
                                                                            variant={outOfStock ? "outlined" : "filled"}
                                                                            sx={{ fontWeight: 700, flexShrink: 0 }}
                                                                        />
                                                                    </Box>
                                                                    <Typography variant="caption" sx={{ color: "#999" }}>
                                                                        {p.barcode || "No barcode"} - {unitMeta.label}
                                                                    </Typography>
                                                                    <Typography
                                                                        variant="h6"
                                                                        sx={{
                                                                            color: "#2e7d32",
                                                                            fontWeight: 700,
                                                                            mt: "auto"
                                                                        }}
                                                                    >
                                                                        {formatRate(p.price, p.unit)}
                                                                    </Typography>
                                                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
                                                                        <TextField
                                                                            size="small"
                                                                            type="number"
                                                                            label="Sale qty"
                                                                            value={selectedQuantity}
                                                                            onChange={(e) => {
                                                                                setProductQuantities((current) => ({
                                                                                    ...current,
                                                                                    [p._id]: e.target.value
                                                                                }));
                                                                            }}
                                                                            inputProps={{
                                                                                step: getQuantityStep(p.unit),
                                                                                min: getQuantityStep(p.unit)
                                                                            }}
                                                                            sx={{ flex: 1 }}
                                                                        />
                                                                        <Typography variant="body2" sx={{ width: 36, color: "#666", fontWeight: 700 }}>
                                                                            {unitMeta.shortLabel}
                                                                        </Typography>
                                                                    </Box>
                                                                    <Button
                                                                        variant="contained"
                                                                        size="small"
                                                                        onClick={() => addToCart(p, selectedQuantity)}
                                                                        disabled={outOfStock}
                                                                        fullWidth
                                                                        startIcon={<Add />}
                                                                        sx={{
                                                                            mt: 1,
                                                                            backgroundColor: "#1976d2",
                                                                            "&:hover": { backgroundColor: "#1565c0" },
                                                                            textTransform: "none",
                                                                            fontWeight: 600
                                                                        }}
                                                                    >
                                                                        Add
                                                                    </Button>
                                                                </CardContent>
                                                            </Card>
                                                        </Grid>
                                                    );
                                                })}
                                            </Grid>
                                        )}
                                    </Box>
                                </Paper>
                            </Grid>

                            {/* Cart & Billing Section - Right Pane */}
                            <Grid item xs={12} md={5} lg={4}>
                                <Paper
                                    sx={{
                                        borderRadius: 2,
                                        overflow: "hidden",
                                        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
                                        display: "flex",
                                        flexDirection: "column",
                                        height: { xs: "auto", md: "calc(100vh - 180px)" }
                                    }}
                                >
                                    {/* Cart Header */}
                                    <Box
                                        sx={{
                                            px: { xs: 1.5, sm: 2 },
                                            py: 1.5,
                                            borderBottom: "1px solid #e0e0e0",
                                            backgroundColor: "#fafafa"
                                        }}
                                    >
                                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
                                            <Typography variant="h6" sx={{ display: "flex", alignItems: "center", gap: 1, fontWeight: 700 }}>
                                                <ShoppingCart fontSize="small" />
                                                Billing
                                            </Typography>
                                            <Chip
                                                label={`${cart.length} item${cart.length !== 1 ? "s" : ""}`}
                                                size="small"
                                                sx={{ fontWeight: 700 }}
                                            />
                                        </Box>
                                    </Box>

                                    {/* Cart Items */}
                                    <Box sx={{ p: { xs: 1.5, sm: 2 }, overflow: "auto", flex: 1, minHeight: { xs: "200px", sm: "250px" } }}>
                                        {cart.length === 0 ? (
                                            <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
                                                Cart is empty
                                            </Typography>
                                        ) : (
                                            <List sx={{ p: 0 }}>
                                                {cart.map((item, index) => (
                                                    <ListItem
                                                        key={item._id}
                                                        divider={index < cart.length - 1}
                                                        sx={{
                                                            px: 0,
                                                            py: 1.5,
                                                            alignItems: "flex-start",
                                                            flexDirection: "column"
                                                        }}
                                                    >
                                                        <Box sx={{ width: "100%", mb: 1 }}>
                                                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 1, mb: 0.5 }}>
                                                                <Typography variant="subtitle2" sx={{ fontWeight: 700, flex: 1 }}>
                                                                    {item.name}
                                                                </Typography>
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => removeFromCart(item._id)}
                                                                    sx={{ p: 0.5 }}
                                                                >
                                                                    <Delete fontSize="small" color="error" />
                                                                </IconButton>
                                                            </Box>
                                                            <Typography variant="caption" sx={{ color: "#999" }}>
                                                                {formatRate(item.price, item.unit)}
                                                            </Typography>
                                                        </Box>
                                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, width: "100%" }}>
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => updateQuantity(item._id, -getQuantityStep(item.unit))}
                                                                sx={{ p: 0.5 }}
                                                            >
                                                                <Remove fontSize="small" />
                                                            </IconButton>
                                                            <TextField
                                                                size="small"
                                                                type="number"
                                                                value={item.quantity}
                                                                onChange={(e) => {
                                                                    const newQty = normalizeQuantityInput(e.target.value, item.unit);
                                                                    if (newQty && newQty <= Number(item.stockQuantity || 0)) {
                                                                        setCart(cart.map(c => c._id === item._id ? { ...c, quantity: newQty } : c));
                                                                    } else if (newQty) {
                                                                        alert(`Only ${formatQuantity(item.stockQuantity, item.unit)} available for ${item.name}`);
                                                                    }
                                                                }}
                                                                inputProps={{ step: getQuantityStep(item.unit), min: getQuantityStep(item.unit) }}
                                                                sx={{ width: 80, textAlign: "center" }}
                                                            />
                                                            <Typography variant="caption" sx={{ minWidth: 28, color: "#666" }}>
                                                                {getUnitMeta(item.unit).shortLabel}
                                                            </Typography>
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => updateQuantity(item._id, getQuantityStep(item.unit))}
                                                                sx={{ p: 0.5 }}
                                                            >
                                                                <Add fontSize="small" />
                                                            </IconButton>
                                                            <Typography
                                                                variant="body2"
                                                                sx={{ ml: "auto", fontWeight: 700, color: "#2e7d32" }}
                                                            >
                                                                Rs.{(item.price * item.quantity).toFixed(2)}
                                                            </Typography>
                                                        </Box>
                                                    </ListItem>
                                                ))}
                                            </List>
                                        )}
                                    </Box>

                                    {/* Barcode Section - Always Visible */}
                                    <Box
                                        sx={{
                                            px: { xs: 1.5, sm: 2 },
                                            py: 1.5,
                                            borderBottom: "1px solid #e0e0e0",
                                            backgroundColor: "#f5f5f5"
                                        }}
                                    >
                                        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                                            🔍 Add by Barcode
                                        </Typography>
                                        <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
                                            <TextField
                                                fullWidth
                                                placeholder="Scan or enter barcode..."
                                                value={barcode}
                                                onChange={(e) => setBarcode(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && scanBarcode()}
                                                size="small"
                                            />
                                            <TextField
                                                type="number"
                                                placeholder="Qty"
                                                value={barcodeQuantity}
                                                onChange={(e) => setBarcodeQuantity(e.target.value)}
                                                size="small"
                                                inputProps={{ step: "0.01", min: "0.01" }}
                                                sx={{ width: 70 }}
                                            />
                                        </Box>
                                        <Box sx={{ display: "flex", gap: 1 }}>
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                fullWidth
                                                onClick={scanBarcode}
                                                sx={{ textTransform: "none" }}
                                            >
                                                Add
                                            </Button>
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                fullWidth
                                                startIcon={<QrCodeScanner />}
                                                onClick={() => {
                                                    setLastScannedCode("");
                                                    setShowScanner(true);
                                                }}
                                                sx={{ textTransform: "none" }}
                                            >
                                                Scan
                                            </Button>
                                        </Box>
                                    </Box>

                                    <Divider />

                                    {/* Total & Checkout */}
                                    <Box sx={{ p: { xs: 1.5, sm: 2 } }}>
                                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                                            <Typography variant="body2" sx={{ color: "#999" }}>
                                                Total Amount:
                                            </Typography>
                                            <Typography
                                                variant="h5"
                                                sx={{
                                                    fontWeight: 700,
                                                    color: "#2e7d32",
                                                    fontSize: { xs: "1.5rem", sm: "1.75rem" }
                                                }}
                                            >
                                                ₹{total.toFixed(2)}
                                            </Typography>
                                        </Box>

                                        <Button
                                            variant="contained"
                                            color="primary"
                                            fullWidth
                                            onClick={checkout}
                                            disabled={checkoutLoading || cart.length === 0}
                                            sx={{
                                                py: 1.5,
                                                fontSize: "1rem",
                                                fontWeight: 700,
                                                backgroundColor: "#1976d2",
                                                "&:hover": { backgroundColor: "#1565c0" }
                                            }}
                                        >
                                            {checkoutLoading ? (
                                                <>
                                                    <CircularProgress size={20} sx={{ mr: 1, color: "white" }} />
                                                    Processing…
                                                </>
                                            ) : (
                                                "🎯 Checkout"
                                            )}
                                        </Button>
                                    </Box>
                                </Paper>
                            </Grid>
                        </Grid>
                    </Box>
                </Box>
            )}

            {showScanner && <BarcodeScanner onScan={handleScan} onClose={() => setShowScanner(false)} />}
        </>
    );
}

export default POS;
