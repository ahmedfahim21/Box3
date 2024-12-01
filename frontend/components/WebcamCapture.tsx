import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import axios from "axios";
import { Button } from "@/components/ui/button";

interface WebcamCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY
const PINATA_API_SECRET = process.env.NEXT_PUBLIC_PINATA_API_SECRET

const WebcamCaptureModal: React.FC<WebcamCaptureModalProps> = ({
  isOpen,
  onClose,
}) => {
  const webcamRef = useRef<Webcam>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);

  const capture = () => {
    if (webcamRef.current) {
      const image = webcamRef.current.getScreenshot();
      setImageSrc(image);
    }
  };

  const uploadToPinata = async () => {
    if (!imageSrc) {
      alert("Please capture an image first.");
      return;
    }

    try {
      setUploading(true);

      // Convert Base64 to Blob
      const base64Response = await fetch(imageSrc);
      const blob = await base64Response.blob();

      // Create FormData for Pinata
      const formData = new FormData();
      formData.append("file", blob, "image.jpg");

      // Pinata metadata
      const metadata = JSON.stringify({
        name: "Webcam Capture",
      });
      formData.append("pinataMetadata", metadata);

      const options = JSON.stringify({
        cidVersion: 1,
      });
      formData.append("pinataOptions", options);

      // Upload to Pinata
      const pinataResponse = await axios.post(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            pinata_api_key: PINATA_API_KEY,
            pinata_secret_api_key: PINATA_API_SECRET,
          },
        }
      );

      const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${pinataResponse.data.IpfsHash}`;
      alert(`Image uploaded to IPFS: ${ipfsUrl}`);
    } catch (error) {
      console.error("Error uploading to Pinata:", error);
      alert("Failed to upload image.");
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "8px",
          padding: "20px",
          maxWidth: "640px",
          width: "100%",
        }}
      >
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          width={640}
          height={480}
        />
        <div style={{ marginTop: "20px" }}>
          <Button onClick={capture} style={{ marginRight: "10px" }}>
            Capture
          </Button>
          <Button onClick={onClose}>Close</Button>
        </div>
        {imageSrc && (
          <div style={{ marginTop: "20px" }}>
            <h3>Captured Image:</h3>
            <img src={imageSrc} alt="Captured" style={{ width: "100%" }} />
            <Button
              onClick={uploadToPinata}
              style={{ marginTop: "10px" }}
              disabled={uploading}
            >
              {uploading ? "Uploading..." : "Upload to Pinata"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WebcamCaptureModal;
