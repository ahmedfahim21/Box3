import { Button } from "@/components/ui/button";
import React, { useRef, useState } from "react";
import Webcam from "react-webcam";

interface WebcamCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WebcamCaptureModal: React.FC<WebcamCaptureModalProps> = ({
  isOpen,
  onClose,
}) => {
  const webcamRef = useRef<Webcam>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  const capture = () => {
    if (webcamRef.current) {
      const image = webcamRef.current.getScreenshot();
      setImageSrc(image);
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
        <h2>Webcam Capture</h2>
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
          </div>
        )}
      </div>
    </div>
  );
};

export default WebcamCaptureModal;
