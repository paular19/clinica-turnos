"use client";
import { MessageCircle } from "lucide-react";

export default function WhatsappFloat() {
    return (
        <a
            href="https://wa.link/qks17s"
            target="_blank"
            rel="noopener noreferrer"
            style={{
                position: "fixed",
                bottom: "24px",
                right: "24px",
                width: "64px",
                height: "64px",
                backgroundColor: "#25D366",
                borderRadius: "50%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 9999999,
                boxShadow: "0 10px 25px rgba(0,0,0,0.25)",
            }}
        >
            <MessageCircle size={32} color="white" />
        </a>
    );
}
