import { useState, useEffect, useRef, forwardRef } from 'react';

/** Código responsável pela exibição da webcam */

const WebcamViewer = forwardRef((props, ref) => { /** Componente que exibe a webcam */
  const videoRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => { /** Efeito que garante que a webcam seja exibida assim que o componente for montado */
    const enableStream = async () => { /** Função que habilita o stream da webcam */
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: "user",
          } /** Define a câmera frontal como padrão */
        });
        
        if (videoRef.current) { /** Verifica se o videoRef atual é válido */
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play();
          };
        }
      } catch (err) { /** Caso ocorra algum erro ao acessar a webcam, ele é tratado aqui */
        setError(err);
        console.error("Error ao acessar webcam:", err);
      }
    };

    enableStream(); /** Chama a função que habilita o stream da webcam */

    return () => { /** Efeito de limpeza que para o stream da webcam quando o componente é desmontado */
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      } 
    };
  }, []);

  return ( /** Construção do elemento de vídeo que exibe a webcam */
    <div className=""> 
      <video className="webcam-container bg-gray-900 rounded-lg shadow-[4px_4px_0_0_rgba(0,0,0,0.3)] transition-all duration-300 hover:translate-y-[-4px] hover:shadow-[6px_6px_0_0_rgba(0,0,0,0.4)] border-4 border-[#B66E36] mt-10"
        ref={(node) => { /** Ref que armazena o elemento de vídeo */
          videoRef.current = node;
          if (ref) ref.current = node;
        }} 
        autoPlay 
        playsInline 
        muted
      />
      {error && ( /** Caso ocorra algum erro ao acessar a webcam, ele é exibido aqui */
        <div className="">
          <p>Erro na câmera: {error.message}</p>
        </div>
      )}
    </div>
  );
});

export default WebcamViewer;