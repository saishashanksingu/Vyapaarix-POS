import { useMemo, useState } from "react";
import BarcodeScannerComponent from "react-qr-barcode-scanner";
import { Box, Button, Alert, Typography } from "@mui/material";

function BarcodeScanner({ onScan, onClose }) {
    const [data, setData] = useState("");
    const [cameraError, setCameraError] = useState("");
    const [stopStream, setStopStream] = useState(false);

    const helperText = useMemo(() => {
        if (cameraError) return cameraError;
        if (!data) return "Point the camera at a barcode";
        return `Scanned: ${data}`;
    }, [cameraError, data]);

    const handleClose = () => {
        setStopStream(true);
        // Stop webcam stream before unmounting scanner component
        setTimeout(() => onClose?.(), 0);
    };

    return (
        <Box>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Scan Barcode
            </Typography>

            {cameraError && <Alert severity="error" sx={{ mb: 1 }}>{cameraError}</Alert>}

            <BarcodeScannerComponent
                width="100%"
                height={280}
                delay={300}
                stopStream={stopStream}
                onError={(error) => {
                    const message = error?.name === "NotAllowedError"
                        ? "Camera permission denied. Please allow camera access."
                        : "Unable to access camera. Check camera availability and permissions.";
                    setCameraError(message);
                }}
                onUpdate={(_, result) => {
                    if (!result) return;
                    const scannedValue =
                        typeof result?.getText === "function" ? result.getText() : result?.text;
                    if (!scannedValue) return;
                    setData(scannedValue);
                    onScan(scannedValue);
                }}
            />

            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {helperText}
            </Typography>

            <Button variant="text" size="small" sx={{ mt: 1 }} onClick={handleClose}>
                Close Scanner
            </Button>
        </Box>
    );
}

export default BarcodeScanner;