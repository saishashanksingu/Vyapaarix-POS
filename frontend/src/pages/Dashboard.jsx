import { useEffect, useState } from "react";
import API from "../services/api";
import { formatQuantity } from "../utils/units";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from "chart.js";
import { Bar } from "react-chartjs-2";
import {
    Typography,
    Card,
    CardContent,
    Box,
    List,
    ListItem,
    ListItemText,
    Chip,
    Alert
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { TrendingUp, ShoppingCart, WarningAmber, Star } from "@mui/icons-material";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

function Dashboard() {
    const [summary, setSummary] = useState({});
    const [topProducts, setTopProducts] = useState([]);
    const [dailySales, setDailySales] = useState([]);
    const [lowStock, setLowStock] = useState([]);
    const [monthlySales, setMonthlySales] = useState([]);
    const [error, setError] = useState("");

    async function loadSummary() {
        try {
            const res = await API.get("/analytics/summary");
            setSummary(res.data);
        } catch (error) {
            console.error("Failed to load summary:", error);
            setError("Failed to load summary");
        }
    }

    async function loadTopProducts() {
        try {
            const res = await API.get("/analytics/top-products");
            setTopProducts(res.data);
        } catch (error) {
            console.error("Failed to load top products:", error);
        }
    }

    async function loadDailySales() {
        try {
            const res = await API.get("/analytics/daily-report");
            setDailySales(res.data);
        } catch (error) {
            console.error("Failed to load daily sales:", error);
        }
    }

    async function loadLowStock() {
        try {
            const res = await API.get("/products/low-stock");
            setLowStock(res.data);
        } catch (error) {
            console.error("Failed to load low stock:", error);
        }
    }

    async function loadMonthlySales() {
        try {
            const res = await API.get("/analytics/monthly-sales");
            setMonthlySales(res.data);
        } catch (error) {
            console.error("Failed to load monthly sales:", error);
        }
    }

    useEffect(() => {
        loadSummary();
        loadTopProducts();
        loadDailySales();
        loadLowStock();
        loadMonthlySales();
    }, []);

    const chartData = {
        labels: dailySales.map((d) => d._id),
        datasets: [
            {
                label: "Daily Revenue",
                data: dailySales.map((d) => d.totalRevenue),
                backgroundColor: "rgba(25, 118, 210, 0.7)",
                borderColor: "rgba(25, 118, 210, 1)",
                borderRadius: 8,
                borderSkipped: false,
            },
        ],
    };

    const monthNames = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    const sortedMonthlySales = [...monthlySales].sort((a, b) => Number(a._id) - Number(b._id));

    const monthlyChartData = {
        labels: sortedMonthlySales.map(s => monthNames[(Number(s._id) || 1) - 1] || `Month ${s._id}`),
        datasets: [
            {
                label: "Sales (₹)",
                data: sortedMonthlySales.map(s => s.totalSales),
                backgroundColor: "rgba(75, 192, 192, 0.7)",
                borderColor: "rgba(75, 192, 192, 1)",
                borderRadius: 8,
                borderSkipped: false,
            }
        ]
    };

    // Reusable StatCard component for summary metrics
    const StatCard = ({ title, value, icon: Icon, color, prefix = "" }) => (
        <Card
            sx={{
                height: "100%",
                background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
                border: `1px solid ${color}30`,
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
                transition: "all 0.3s ease",
                "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 8px 30px rgba(0, 0, 0, 0.12)",
                },
            }}
        >
            <CardContent sx={{ pb: 3 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                    <Box>
                        <Typography
                            variant="body2"
                            sx={{
                                color: "#666",
                                fontWeight: 500,
                                mb: 1,
                                fontSize: { xs: "0.875rem", sm: "1rem" }
                            }}
                        >
                            {title}
                        </Typography>
                        <Typography
                            variant="h4"
                            sx={{
                                fontWeight: 700,
                                color: color,
                                fontSize: { xs: "1.75rem", sm: "2.125rem" }
                            }}
                        >
                            {prefix}{value || 0}
                        </Typography>
                    </Box>
                    <Icon sx={{ fontSize: { xs: 32, sm: 40 }, color, opacity: 0.8 }} />
                </Box>
            </CardContent>
        </Card>
    );

    return (
        <Box sx={{ backgroundColor: "#f8f9fa", minHeight: "100vh", py: { xs: 2, sm: 3, md: 4 }, width: "100%" }}>
            <Box sx={{ width: "100%", maxWidth: "1400px", px: { xs: 1, sm: 2, md: 3 }, mx: "auto" }}>
                {/* Header */}
                <Box sx={{ mb: { xs: 3, md: 4 } }}>
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 700,
                            color: "#1a1a1a",
                            mb: 1,
                            fontSize: { xs: "1.75rem", sm: "2rem", md: "2.5rem" }
                        }}
                    >
                        📊 Admin Dashboard
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#999" }}>
                        Welcome back! Here's your business overview.
                    </Typography>
                </Box>

                {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

                {/* KPI Cards - Summary Metrics */}
                <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }} sx={{ mb: { xs: 3, md: 4 } }}>
                    <Grid item xs={12} sm={6} md={6} lg={3}>
                        <StatCard
                            title="Total Sales"
                            value={summary.totalSales || 0}
                            icon={ShoppingCart}
                            color="#1976d2"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={6} lg={3}>
                        <StatCard
                            title="Total Revenue"
                            value={summary.totalRevenue || 0}
                            icon={TrendingUp}
                            color="#2e7d32"
                            prefix="₹"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={6} lg={3}>
                        <StatCard
                            title="Low Stock Items"
                            value={lowStock.length || 0}
                            icon={WarningAmber}
                            color="#f57c00"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={6} lg={3}>
                        <StatCard
                            title="Top Products"
                            value={topProducts.length || 0}
                            icon={Star}
                            color="#d32f2f"
                        />
                    </Grid>
                </Grid>

                {/* Charts Section */}
                <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }} sx={{ mb: { xs: 3, md: 4 } }}>
                    {/* Daily Sales Chart */}
                    <Grid item xs={12} lg={6}>
                        <Card
                            sx={{
                                height: "100%",
                                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
                                transition: "all 0.3s ease",
                                "&:hover": {
                                    boxShadow: "0 8px 30px rgba(0, 0, 0, 0.12)",
                                }
                            }}
                        >
                            <CardContent sx={{ pb: 2 }}>
                                <Typography
                                    variant="h6"
                                    gutterBottom
                                    sx={{
                                        fontWeight: 700,
                                        mb: 3,
                                        fontSize: { xs: "1rem", sm: "1.1rem" }
                                    }}
                                >
                                    📈 Daily Sales Revenue
                                </Typography>
                                <Box sx={{ minHeight: { xs: "250px", sm: "300px" }, position: "relative" }}>
                                    <Bar
                                        data={chartData}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            scales: {
                                                y: {
                                                    beginAtZero: true,
                                                    grid: { color: "rgba(0,0,0,0.05)" }
                                                },
                                                x: {
                                                    grid: { display: false }
                                                }
                                            },
                                            plugins: {
                                                legend: {
                                                    display: true,
                                                    position: "bottom"
                                                }
                                            }
                                        }}
                                    />
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Monthly Sales Chart */}
                    <Grid item xs={12} lg={6}>
                        <Card
                            sx={{
                                height: "100%",
                                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
                                transition: "all 0.3s ease",
                                "&:hover": {
                                    boxShadow: "0 8px 30px rgba(0, 0, 0, 0.12)",
                                }
                            }}
                        >
                            <CardContent sx={{ pb: 2 }}>
                                <Typography
                                    variant="h6"
                                    gutterBottom
                                    sx={{
                                        fontWeight: 700,
                                        mb: 3,
                                        fontSize: { xs: "1rem", sm: "1.1rem" }
                                    }}
                                >
                                    📊 Monthly Sales Trends
                                </Typography>
                                <Box sx={{ minHeight: { xs: "250px", sm: "300px" }, position: "relative" }}>
                                    <Bar
                                        data={monthlyChartData}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            scales: {
                                                y: {
                                                    beginAtZero: true,
                                                    grid: { color: "rgba(0,0,0,0.05)" }
                                                },
                                                x: {
                                                    grid: { display: false }
                                                }
                                            },
                                            plugins: {
                                                legend: {
                                                    display: true,
                                                    position: "bottom"
                                                }
                                            }
                                        }}
                                    />
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Bottom Section: Top Products & Low Stock Alerts */}
                <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }}>
                    {/* Top Selling Products */}
                    <Grid item xs={12} md={6}>
                        <Card
                            sx={{
                                height: "100%",
                                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
                                transition: "all 0.3s ease",
                                "&:hover": {
                                    boxShadow: "0 8px 30px rgba(0, 0, 0, 0.12)",
                                }
                            }}
                        >
                            <CardContent>
                                <Typography
                                    variant="h6"
                                    gutterBottom
                                    sx={{
                                        fontWeight: 700,
                                        mb: 2,
                                        fontSize: { xs: "1rem", sm: "1.1rem" }
                                    }}
                                >
                                    ⭐ Top Selling Products
                                </Typography>
                                {topProducts.length === 0 ? (
                                    <Typography variant="body2" sx={{ color: "#999" }}>
                                        No sales data yet
                                    </Typography>
                                ) : (
                                    <List sx={{ p: 0 }}>
                                        {topProducts.map((p, index) => (
                                            <ListItem
                                                key={index}
                                                sx={{
                                                    px: 0,
                                                    py: 1.5,
                                                    borderBottom: "1px solid #eee",
                                                    "&:last-child": { borderBottom: "none" }
                                                }}
                                            >
                                                <ListItemText
                                                    primary={
                                                        <Typography sx={{ fontWeight: 600, color: "#1a1a1a" }}>
                                                            {p.name || p._id}
                                                        </Typography>
                                                    }
                                                    secondary={
                                                        <Typography variant="caption" sx={{ color: "#999" }}>
                                                            Sold quantity
                                                        </Typography>
                                                    }
                                                />
                                                <Chip
                                                    label={`${formatQuantity(p.totalSold, p.unit)} sold`}
                                                    color="primary"
                                                    size="small"
                                                    sx={{
                                                        fontWeight: 700,
                                                        backgroundColor: "#e3f2fd",
                                                        color: "#1976d2"
                                                    }}
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Low Stock Alerts */}
                    <Grid item xs={12} md={6}>
                        <Card
                            sx={{
                                height: "100%",
                                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
                                transition: "all 0.3s ease",
                                "&:hover": {
                                    boxShadow: "0 8px 30px rgba(0, 0, 0, 0.12)",
                                }
                            }}
                        >
                            <CardContent>
                                <Typography
                                    variant="h6"
                                    gutterBottom
                                    sx={{
                                        fontWeight: 700,
                                        mb: 2,
                                        fontSize: { xs: "1rem", sm: "1.1rem" }
                                    }}
                                >
                                    ⚠️ Low Stock Alerts
                                </Typography>
                                {lowStock.length === 0 ? (
                                    <Alert severity="success">
                                        ✓ All products are in healthy stock levels
                                    </Alert>
                                ) : (
                                    <List sx={{ p: 0 }}>
                                        {lowStock.map((p) => (
                                            <ListItem
                                                key={p._id}
                                                sx={{
                                                    px: 0,
                                                    py: 1.5,
                                                    borderBottom: "1px solid #ffebee",
                                                    "&:last-child": { borderBottom: "none" },
                                                    backgroundColor: "#fffbfe"
                                                }}
                                            >
                                                <ListItemText
                                                    primary={
                                                        <Typography sx={{ fontWeight: 600, color: "#1a1a1a" }}>
                                                            {p.name}
                                                        </Typography>
                                                    }
                                                    secondary={
                                                        <Typography variant="caption" sx={{ color: "#999" }}>
                                                            Quantity remaining
                                                        </Typography>
                                                    }
                                                />
                                                <Chip
                                                    label={`${formatQuantity(p.stockQuantity, p.unit)} left`}
                                                    color="warning"
                                                    size="small"
                                                    sx={{
                                                        fontWeight: 700,
                                                        backgroundColor: "#fff3e0",
                                                        color: "#f57c00"
                                                    }}
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
}

export default Dashboard;
