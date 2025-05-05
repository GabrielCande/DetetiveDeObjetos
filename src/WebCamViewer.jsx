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
        console.error("Error ao acessar webcam:", err);
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
    <div className="">
      <video className="webcam-container bg-gray-900 rounded-lg shadow-[4px_4px_0_0_rgba(0,0,0,0.3)] transition-all duration-300 hover:translate-y-[-4px] hover:shadow-[6px_6px_0_0_rgba(0,0,0,0.4)] border-4 border-[#B66E36] mt-10"
        ref={(node) => {
          videoRef.current = node;
          if (ref) ref.current = node;
        }}
        autoPlay
        playsInline
        muted
      />
      {error && (
        <div className="">
          <p>Erro na câmera: {error.message}</p>
        </div>
      )}
    </div>
  );
});

export default WebcamViewer;