import { useEffect, useState } from "react";
import API from "../services/api";
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
                backgroundColor: "rgba(25, 118, 210, 0.6)",
            },
        ],
    };


    const monthNames = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    // Ensure months are sorted by month number before plotting
    const sortedMonthlySales = [...monthlySales].sort((a, b) => Number(a._id) - Number(b._id));

    // charts for monthly data analytics
    const monthlyChartData = {
        labels: sortedMonthlySales.map(s => monthNames[(Number(s._id) || 1) - 1] || `Month ${s._id}`),
        datasets: [
            {
                label: "Sales (Rs)",
                data: sortedMonthlySales.map(s => s.totalSales),
                backgroundColor: "rgba(75, 192, 192, 0.6)"
            }
        ]
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Admin Dashboard
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Grid container spacing={3}>
                {/* Summary Cards */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" color="primary">
                                Total Sales
                            </Typography>
                            <Typography variant="h4">
                                {summary.totalSales || 0}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" color="primary">
                                Total Revenue
                            </Typography>
                            <Typography variant="h4">
                                ₹{summary.totalRevenue || 0}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Daily Sales Chart */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Daily Sales Revenue
                            </Typography>
                            <Bar data={chartData} options={{ responsive: true, scales: { y: { beginAtZero: true } } }} />
                        </CardContent>
                    </Card>
                </Grid>

                {/* Monthly Sales Chart */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Monthly Sales
                            </Typography>
                            <Bar data={monthlyChartData} />
                        </CardContent>
                    </Card>
                </Grid>

                {/* Top Selling Products */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Top Selling Products
                            </Typography>
                            <List>
                                {topProducts.map((p, index) => (
                                    <ListItem key={index}>
                                        <ListItemText primary={p._id} />
                                        <Chip label={`Sold: ${p.totalSold}`} color="primary" size="small" />
                                    </ListItem>
                                ))}
                            </List>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Low Stock Alerts */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Low Stock Alerts
                            </Typography>
                            {lowStock.length === 0 ? (
                                <Typography>No low stock products</Typography>
                            ) : (
                                <List>
                                    {lowStock.map((p) => (
                                        <ListItem key={p._id}>
                                            <ListItemText primary={p.name} />
                                            <Chip
                                                label={`${p.stockQuantity} left`}
                                                color="warning"
                                                size="small"
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
    );
}

export default Dashboard;
