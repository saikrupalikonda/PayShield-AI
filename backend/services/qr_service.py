import urllib.parse
from typing import Dict, Any, List
from backend.schemas import StructuredUPIQR


class QRService:
    @staticmethod
    def parse_upi_payload(payload: str) -> StructuredUPIQR:
        clean_payload = (payload or "").strip()
        
        if not clean_payload.startswith("upi://pay"):
            # Check if raw string is just a UPI ID
            if "@" in clean_payload and " " not in clean_payload:
                return StructuredUPIQR(
                    raw_payload=clean_payload,
                    is_valid_upi=True,
                    pa=clean_payload,
                    pn=clean_payload.split("@")[0],
                    anomaly_flags=[]
                )
            return StructuredUPIQR(
                raw_payload=clean_payload,
                is_valid_upi=False,
                anomaly_flags=["Non-standard UPI QR payload. Expected 'upi://pay' scheme."]
            )

        try:
            parsed = urllib.parse.urlparse(clean_payload)
            params = urllib.parse.parse_qs(parsed.query)

            pa = params.get("pa", [None])[0]
            pn = params.get("pn", [None])[0]
            am = params.get("am", [None])[0]
            cu = params.get("cu", ["INR"])[0]
            tn = params.get("tn", [None])[0]
            mc = params.get("mc", [None])[0]
            tr = params.get("tr", [None])[0]
            url = params.get("url", [None])[0]

            anomalies: List[str] = []
            if not pa:
                anomalies.append("Missing Payee Address ('pa') in UPI QR specification.")
            
            if am is not None:
                try:
                    val = float(am)
                    if val > 10000:
                        anomalies.append(f"High pre-set transfer amount detected in QR: ₹{val:,.2f}")
                    if val > 0:
                        anomalies.append("Pre-set amount embedded in QR. Scanning will AUTHORIZE A DEBIT, never a credit to your account.")
                except ValueError:
                    anomalies.append("Malformed amount parameter in QR.")

            if url:
                anomalies.append(f"External web redirection URL embedded in QR payload: {url}")

            return StructuredUPIQR(
                raw_payload=clean_payload,
                is_valid_upi=pa is not None,
                pa=pa,
                pn=pn,
                am=am,
                cu=cu,
                tn=tn,
                mc=mc,
                tr=tr,
                url=url,
                anomaly_flags=anomalies
            )
        except Exception as e:
            return StructuredUPIQR(
                raw_payload=clean_payload,
                is_valid_upi=False,
                anomaly_flags=[f"Error decoding UPI parameters: {str(e)}"]
            )


qr_service = QRService()
