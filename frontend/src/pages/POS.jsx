import { useEffect, useState } from "react";
import API from "../services/api";
import Receipt from "./Receipt";
import BarcodeScanner from "../components/BarcodeScanner";
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
  InputAdornment
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { Add, Remove, ShoppingCart, QrCodeScanner } from "@mui/icons-material";

function POS() {
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [saleId, setSaleId] = useState(null);
    const [barcode, setBarcode] = useState("");
    const [showScanner, setShowScanner] = useState(false);
    const [productQuery, setProductQuery] = useState("");
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [checkoutLoading, setCheckoutLoading] = useState(false);
    const [scanLookupLoading, setScanLookupLoading] = useState(false);
    const [lastScannedCode, setLastScannedCode] = useState("");

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

    const addToCart = (product) => {
        const existing = cart.find((item) => item._id === product._id);

        if (existing) {
            const updatedCart = cart.map((item) =>
                item._id === product._id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            );
            setCart(updatedCart);
        } else {
            setCart([...cart, { ...product, quantity: 1 }]);
        }
    };

    const updateQuantity = (productId, delta) => {
        const updatedCart = cart.map((item) => {
            if (item._id === productId) {
                const newQuantity = item.quantity + delta;
                return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
            }
            return item;
        }).filter(Boolean);
        setCart(updatedCart);
    };

    const total = cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    // checkout
    const checkout = async () => {
        try {
            setCheckoutLoading(true);
            const items = cart.map((item) => ({
                productId: item._id,
                quantity: item.quantity,
                price: item.price
            }));

            const res = await API.post("/sales", { items });

            if (res.data && res.data.sale && res.data.sale._id) {
                setSaleId(res.data.sale._id);
            }

            setCart([]);
            loadProducts();
        } catch (error) {
            console.error("Checkout failed:", error);
            alert("Checkout failed. Please try again.");
        } finally {
            setCheckoutLoading(false);
        }
    };

    const scanBarcode = async () => {
        if (!barcode.trim()) return;
        try {
            const res = await API.get(`/products/barcode/${barcode}`);
            addToCart(res.data);
            setBarcode("");
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
            addToCart(res.data);
            setShowScanner(false);
        } catch (error) {
            console.error("Scanner lookup failed:", error);
            alert("Product not found");
        } finally {
            setScanLookupLoading(false);
            // Allow rescanning the same code after a short delay
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
                <Box sx={{ flexGrow: 1, p: { xs: 1.5, sm: 2, md: 3 } }}>
                    <Typography variant="h4" gutterBottom>
                        Point of Sale
                    </Typography>

                    <Grid container spacing={3}>
                        {/* Products Section */}
                        <Grid size={{ xs: 12, md: 7, lg: 8 }}>
                            <Paper
                                variant="outlined"
                                sx={{
                                    borderRadius: 2,
                                    overflow: "hidden",
                                    bgcolor: "background.paper"
                                }}
                            >
                                <Box
                                    sx={{
                                        px: 2,
                                        py: 1.5,
                                        borderBottom: 1,
                                        borderColor: "divider",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        gap: 2,
                                        flexWrap: "wrap"
                                    }}
                                >
                                    <Typography variant="h6">Product Inventory</Typography>
                                    <TextField
                                        size="small"
                                        value={productQuery}
                                        onChange={(e) => setProductQuery(e.target.value)}
                                        placeholder="Search by name / barcode"
                                        sx={{ minWidth: { xs: "100%", sm: 320 } }}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <QrCodeScanner fontSize="small" />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </Box>

                                <Box sx={{ p: 2 }}>
                                    {loadingProducts ? (
                                        <Typography color="text.secondary">Loading products…</Typography>
                                    ) : filteredProducts.length === 0 ? (
                                        <Typography color="text.secondary">No matching products.</Typography>
                                    ) : (
                                        <Grid container spacing={2}>
                                            {filteredProducts.map((p) => {
                                                const stockQty = Number(p.stockQuantity ?? 0);
                                                const outOfStock = stockQty <= 0;
                                                return (
                                                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={p._id}>
                                                        <Card variant="outlined" sx={{ height: "100%" }}>
                                                            <CardContent sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                                                                <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1 }}>
                                                                    <Typography variant="h6" sx={{ lineHeight: 1.2 }}>
                                                                        {p.name}
                                                                    </Typography>
                                                                    <Chip
                                                                        label={outOfStock ? "Out of stock" : `${stockQty} in stock`}
                                                                        size="small"
                                                                        color={outOfStock ? "default" : stockQty <= 5 ? "warning" : "success"}
                                                                        variant={outOfStock ? "outlined" : "filled"}
                                                                    />
                                                                </Box>
                                                                <Typography variant="body2" color="text.secondary">
                                                                    Barcode: {p.barcode || "—"}
                                                                </Typography>
                                                                <Typography variant="body2" color="text.secondary">
                                                                    Price: ₹{p.price}
                                                                </Typography>
                                                                <Box sx={{ mt: "auto", pt: 1 }}>
                                                                    <Button
                                                                        variant="contained"
                                                                        size="small"
                                                                        onClick={() => addToCart(p)}
                                                                        disabled={outOfStock}
                                                                        fullWidth
                                                                        startIcon={<Add />}
                                                                    >
                                                                        Add to cart
                                                                    </Button>
                                                                </Box>
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

                        {/* Cart Section */}
                        <Grid size={{ xs: 12, md: 5, lg: 4 }}>
                            <Paper
                                variant="outlined"
                                sx={{
                                    borderRadius: 2,
                                    overflow: "hidden",
                                    bgcolor: "background.paper"
                                }}
                            >
                                <Box
                                    sx={{
                                        px: 2,
                                        py: 1.5,
                                        borderBottom: 1,
                                        borderColor: "divider",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        gap: 2,
                                        flexWrap: "wrap"
                                    }}
                                >
                                    <Typography variant="h6" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        <ShoppingCart fontSize="small" />
                                        Billing
                                    </Typography>
                                    <Chip label={`${cart.length} items`} size="small" />
                                </Box>

                                <Box sx={{ p: 2 }}>
                                    <List>
                                        {cart.map((item) => (
                                            <ListItem key={item._id} divider>
                                                <ListItemText
                                                    primary={item.name}
                                                    secondary={`₹${item.price} x ${item.quantity} = ₹${item.price * item.quantity}`}
                                                />
                                                <IconButton onClick={() => updateQuantity(item._id, -1)}>
                                                    <Remove />
                                                </IconButton>
                                                <Chip label={item.quantity} size="small" sx={{ mx: 1 }} />
                                                <IconButton onClick={() => updateQuantity(item._id, 1)}>
                                                    <Add />
                                                </IconButton>
                                            </ListItem>
                                        ))}
                                    </List>

                                    <Divider sx={{ my: 2 }} />

                                    <Typography variant="h6">
                                        Total: ₹{total.toFixed(2)}
                                    </Typography>

                                    {cart.length > 0 && (
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            fullWidth
                                            onClick={checkout}
                                            sx={{ mt: 2 }}
                                            disabled={checkoutLoading}
                                        >
                                            {checkoutLoading ? "Processing…" : "Checkout"}
                                        </Button>
                                    )}

                                    <Divider sx={{ my: 2 }} />

                                    <Typography variant="h6" gutterBottom>
                                        Barcode
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        label="Enter Barcode"
                                        value={barcode}
                                        onChange={(e) => setBarcode(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && scanBarcode()}
                                        sx={{ mb: 1 }}
                                    />
                                    <Button
                                        variant="outlined"
                                        onClick={scanBarcode}
                                        sx={{ mr: 1 }}
                                    >
                                        Add Product
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        startIcon={<QrCodeScanner />}
                                        onClick={() => {
                                            setLastScannedCode("");
                                            setShowScanner(true);
                                        }}
                                    >
                                        Scan
                                    </Button>

                                    {showScanner && (
                                        <Box sx={{ mt: 2 }}>
                                            <BarcodeScanner
                                                onScan={handleScan}
                                                onClose={() => setShowScanner(false)}
                                            />
                                        </Box>
                                    )}
                                </Box>
                            </Paper>
                        </Grid>
                    </Grid>
                </Box>
            )}
        </>
    );
}

export default POS;