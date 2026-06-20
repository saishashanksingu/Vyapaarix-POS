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
        <Box sx={{ p: { xs: 1, md: 2 }, height: { xs: "650px", md: "calc(100vh - 280px)" }, minHeight: "550px", display: "flex", flexDirection: "column", maxWidth: "1100px", mx: "auto", width: "100%" }}>
            <Paper elevation={0} sx={{
                flexGrow: 1,
                display: "flex",
                flexDirection: "column",
                height: "100%",
                minHeight: 0,
                borderRadius: 4,
                overflow: "hidden",
                border: "1px solid rgba(15, 23, 42, 0.08)",
                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.03)",
                bgcolor: "white"
            }}>
                {/* Header */}
                <Box sx={{
                    px: 3,
                    py: 2,
                    borderBottom: "1px solid rgba(15, 23, 42, 0.06)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    bgcolor: "rgba(255, 255, 255, 0.8)",
                    backdropFilter: "blur(10px)"
                }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Avatar sx={{ bgcolor: "primary.main", color: "primary.contrastText", width: 40, height: 40 }}>
                            <SmartToy />
                        </Avatar>
                        <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#111827", lineHeight: 1.2 }}>
                                AI Copilot Assistant
                            </Typography>
                            <Typography variant="caption" sx={{ color: "#10b981", display: "flex", alignItems: "center", gap: 0.5, mt: 0.2 }}>
                                <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#10b981", display: "inline-block" }} /> Gemini 3.5 Flash Online
                            </Typography>
                        </Box>
                    </Box>
                    <Typography variant="caption" sx={{ color: "#6b7280", display: { xs: "none", sm: "block" }, fontWeight: 500 }}>
                        Read-Only MongoDB Analytics
                    </Typography>
                </Box>

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
                    {messages.length === 1 ? (
                        <Box sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            flexGrow: 1,
                            py: 4,
                            px: 2,
                            textAlign: "center"
                        }}>
                            <SmartToy sx={{ fontSize: 56, color: "primary.main", mb: 2, filter: "drop-shadow(0 4px 12px rgba(245, 158, 11, 0.2))" }} />
                            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, color: "#111827", letterSpacing: "-0.5px" }}>
                                Ask Vyapaarix Copilot
                            </Typography>
                            <Typography variant="body2" sx={{ color: "#6b7280", mb: 4, maxWidth: "550px", lineHeight: 1.6 }}>
                                Query your store data using plain English. AI translates your requests into live MongoDB aggregation pipelines and explains the results.
                            </Typography>
                            
                            <Grid container spacing={2} sx={{ maxWidth: "800px" }}>
                                {suggestions.map((s, idx) => {
                                    const Icon = s.icon;
                                    return (
                                        <Grid item xs={12} sm={6} key={idx}>
                                            <Card 
                                                onClick={() => handleSend(s.text)}
                                                sx={{
                                                    cursor: "pointer",
                                                    height: "100%",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    p: 2.5,
                                                    borderRadius: 4,
                                                    border: "1px solid rgba(15, 23, 42, 0.06)",
                                                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.01)",
                                                    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                                                    "&:hover": {
                                                        borderColor: "primary.main",
                                                        boxShadow: "0 12px 24px rgba(245, 158, 11, 0.08)",
                                                        transform: "translateY(-2px)"
                                                    }
                                                }}
                                            >
                                                <Box sx={{ mr: 2, p: 1.2, borderRadius: 3, bgcolor: `${s.color}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                    <Icon sx={{ color: s.color, fontSize: 20 }} />
                                                </Box>
                                                <Box sx={{ textAlign: "left" }}>
                                                    <Typography variant="body2" sx={{ fontWeight: 700, color: "#1f2937", lineHeight: 1.3 }}>
                                                        {s.text}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ color: "#8b949e", fontSize: "0.7rem" }}>
                                                        Ask Copilot
                                                    </Typography>
                                                </Box>
                                            </Card>
                                        </Grid>
                                    );
                                })}
                            </Grid>
                        </Box>
                    ) : (
                        messages.map((m, idx) => {
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
                        })
                    )}
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

                {/* Suggestions Pill Chips (Sticky above input box if message list has content) */}
                {messages.length > 1 && (
                    <Box sx={{
                        display: "flex",
                        gap: 1,
                        overflowX: "auto",
                        px: 3,
                        py: 1.5,
                        bgcolor: "white",
                        borderTop: "1px solid rgba(15, 23, 42, 0.04)",
                        "&::-webkit-scrollbar": { display: "none" },
                        msOverflowStyle: "none",
                        scrollbarWidth: "none"
                    }}>
                        {suggestions.map((s, idx) => (
                            <Button
                                key={idx}
                                size="small"
                                variant="outlined"
                                onClick={() => handleSend(s.text)}
                                disabled={loading}
                                sx={{
                                    borderRadius: 20,
                                    textTransform: "none",
                                    whiteSpace: "nowrap",
                                    borderColor: "rgba(15, 23, 42, 0.08)",
                                    color: "#4b5563",
                                    fontSize: "0.75rem",
                                    px: 2,
                                    "&:hover": {
                                        borderColor: "primary.main",
                                        bgcolor: "rgba(245, 158, 11, 0.05)"
                                    }
                                }}
                            >
                                {s.text}
                            </Button>
                        ))}
                    </Box>
                )}

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
        </Box>
    );
}

export default AICopilot;
