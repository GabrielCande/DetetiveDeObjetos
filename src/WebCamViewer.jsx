import { useState, useEffect, useRef, forwardRef } from 'react';

const WebcamViewer = forwardRef((props, ref) => {
  const videoRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const enableStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: "user",
          }
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play();
          };
        }
      } catch (err) {
        setError(err);
        console.error("Error accessing webcam:", err);
      }
    };

    enableStream();

    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="webcam-container bg-gray-900 rounded-lg shadow-md relative">
      <video 
        ref={(node) => {
          videoRef.current = node;
          if (ref) ref.current = node;
        }}
        className="w-full h-full object-cover"
        autoPlay
        playsInline
        muted
      />
      {error && (
        <div className="text-white absolute inset-0 flex items-center justify-center bg-red-500/50">
          <p>Erro na câmera: {error.message}</p>
        </div>
      )}
    </div>
  );
});

export default WebcamViewer;