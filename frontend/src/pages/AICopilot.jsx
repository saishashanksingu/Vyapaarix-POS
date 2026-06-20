import { useState, useRef, useEffect } from "react";
import API from "../services/api";
import {
    Box,
    Typography,
    TextField,
    Button,
    Paper,
    CircularProgress,
    Avatar,
    Grid,
    Card,
    CardContent
} from "@mui/material";
import { Send, SmartToy, Person, Explore, TrendingUp, WarningAmber, PointOfSale, People } from "@mui/icons-material";

function AICopilot() {
    const [messages, setMessages] = useState([
        {
            sender: "ai",
            text: "Hello! I am your Vyapaarix AI Copilot. Ask me anything about your supermarket's sales performance, products, cashiers, or stock levels!"
        }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (textToSend) => {
        const queryText = textToSend || input;
        if (!queryText.trim()) return;

        setMessages((prev) => [...prev, { sender: "user", text: queryText }]);
        if (!textToSend) setInput("");
        setLoading(true);

        try {
            const res = await API.post("/analytics/assistant", { question: queryText });
            setMessages((prev) => [...prev, { sender: "ai", text: res.data.answer }]);
        } catch (error) {
            console.error("AI assistant error:", error);
            setMessages((prev) => [
                ...prev,
                {
                    sender: "ai",
                    text: `Error: ${error.response?.data?.message || "Failed to contact AI Copilot. Make sure GEMINI_API_KEY is configured."}`
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const suggestions = [
        { text: "Show total revenue and transactions", icon: PointOfSale, color: "#10b981" },
        { text: "List products running low on stock", icon: WarningAmber, color: "#f59e0b" },
        { text: "Compare cashier performance stats", icon: People, color: "#3b82f6" },
        { text: "Which products have high stock levels?", icon: TrendingUp, color: "#ec4899" }
    ];

    return (
        <Box sx={{ p: { xs: 1, md: 3 }, height: "calc(100vh - 200px)", display: "flex", flexDirection: "column" }}>
            {/* Header */}
            <Box sx={{ mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: "#111827", display: "flex", alignItems: "center", gap: 1 }}>
                    <SmartToy color="primary" /> AI Copilot Assistant
                </Typography>
                <Typography variant="body2" sx={{ color: "#6b7280", mt: 0.5 }}>
                    Query your store data using plain English. AI converts queries to live reports instantly.
                </Typography>
            </Box>

            <Grid container spacing={3} sx={{ flexGrow: 1, minHeight: 0 }}>
                {/* Suggestions Sidebar */}
                <Grid item xs={12} md={4} sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
                    <Card sx={{ height: "100%", display: "flex", flexDirection: "column", p: 1 }}>
                        <CardContent sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, display: "flex", alignItems: "center", gap: 1, color: "#111827" }}>
                                <Explore color="primary" /> Suggested Questions
                            </Typography>
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, flexGrow: 1 }}>
                                {suggestions.map((s, idx) => {
                                    const Icon = s.icon;
                                    return (
                                        <Button
                                            key={idx}
                                            variant="outlined"
                                            fullWidth
                                            onClick={() => handleSend(s.text)}
                                            disabled={loading}
                                            sx={{
                                                justifyContent: "flex-start",
                                                textAlign: "left",
                                                p: 2,
                                                borderRadius: 3,
                                                borderColor: "rgba(245, 158, 11, 0.2)",
                                                color: "#374151",
                                                "&:hover": {
                                                    borderColor: "primary.main",
                                                    backgroundColor: "rgba(245, 158, 11, 0.05)"
                                                }
                                            }}
                                        >
                                            <Icon sx={{ mr: 2, color: s.color }} />
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                {s.text}
                                            </Typography>
                                        </Button>
                                    );
                                })}
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Main Chat Box */}
                <Grid item xs={12} md={8} sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
                    <Paper sx={{
                        flexGrow: 1,
                        display: "flex",
                        flexDirection: "column",
                        minHeight: 0,
                        borderRadius: 4,
                        overflow: "hidden",
                        border: "1px solid rgba(15, 23, 42, 0.06)",
                        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.04)"
                    }}>
                        {/* Messages Board */}
                        <Box sx={{
                            flexGrow: 1,
                            overflowY: "auto",
                            p: 3,
                            backgroundColor: "#fafafb",
                            display: "flex",
                            flexDirection: "column",
                            gap: 2
                        }}>
                            {messages.map((m, idx) => {
                                const isAi = m.sender === "ai";
                                return (
                                    <Box
                                        key={idx}
                                        sx={{
                                            display: "flex",
                                            alignSelf: isAi ? "flex-start" : "flex-end",
                                            flexDirection: isAi ? "row" : "row-reverse",
                                            alignItems: "flex-start",
                                            gap: 1.5,
                                            maxWidth: "80%"
                                        }}
                                    >
                                        <Avatar sx={{
                                            bgcolor: isAi ? "primary.main" : "secondary.main",
                                            color: isAi ? "primary.contrastText" : "secondary.contrastText",
                                            width: 36,
                                            height: 36
                                        }}>
                                            {isAi ? <SmartToy fontSize="small" /> : <Person fontSize="small" />}
                                        </Avatar>
                                        <Box sx={{
                                            p: 2,
                                            borderRadius: isAi ? "0px 16px 16px 16px" : "16px 0px 16px 16px",
                                            bgcolor: isAi ? "white" : "primary.main",
                                            color: isAi ? "text.primary" : "primary.contrastText",
                                            border: isAi ? "1px solid rgba(15, 23, 42, 0.08)" : "none",
                                            boxShadow: isAi ? "0 4px 12px rgba(0,0,0,0.03)" : "0 4px 12px rgba(245, 158, 11, 0.2)",
                                            whiteSpace: "pre-line"
                                        }}>
                                            <Typography variant="body2" sx={{ lineHeight: 1.6, fontWeight: isAi ? 500 : 600 }}>
                                                {m.text}
                                            </Typography>
                                        </Box>
                                    </Box>
                                );
                            })}
                            {loading && (
                                <Box sx={{ display: "flex", alignSelf: "flex-start", gap: 1.5, alignItems: "center" }}>
                                    <Avatar sx={{ bgcolor: "primary.main", color: "primary.contrastText", width: 36, height: 36 }}>
                                        <SmartToy fontSize="small" />
                                    </Avatar>
                                    <Paper sx={{ p: 2, borderRadius: "0px 16px 16px 16px", border: "1px solid rgba(15, 23, 42, 0.08)", display: "flex", gap: 1, alignItems: "center" }}>
                                        <CircularProgress size={16} />
                                        <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                            Copilot is querying the database...
                                        </Typography>
                                    </Paper>
                                </Box>
                            )}
                            <div ref={messagesEndRef} />
                        </Box>

                        {/* Input Area */}
                        <Box sx={{ p: 2, borderTop: "1px solid rgba(15, 23, 42, 0.08)", display: "flex", gap: 1.5, alignItems: "center", bgcolor: "white" }}>
                            <TextField
                                fullWidth
                                variant="outlined"
                                placeholder="Ask AI: 'Compare cashier sales' or 'Which product is low on stock?'..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                                disabled={loading}
                                size="medium"
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        borderRadius: 3
                                    }
                                }}
                            />
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => handleSend()}
                                disabled={loading}
                                sx={{
                                    borderRadius: 3,
                                    height: 56,
                                    minWidth: 56,
                                    p: 0,
                                    boxShadow: "0 4px 12px rgba(245, 158, 11, 0.2)"
                                }}
                            >
                                <Send />
                            </Button>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}

export default AICopilot;
