import { useState, useRef, useEffect } from 'react';
 
/** Código responsável pelo gerenciamento de audio */

const AudioPlayer = () => { /** Componente que realiza a execução do audio */ 
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => { /** Efeito que garante que o audio seja reproduzido automaticamente */
    const playAudio = async () => {
      try {
        audioRef.current.muted = false;
        await audioRef.current.play();
      } catch (err) {
        console.log('Autoplay bloqueado'); /** Caso o audio não seja reproduzido automaticamente, ele é mutado */
      }
    };
    playAudio(); /** Chama a função que reproduz o audio */
  }, []);

  const toggleMute = () => { /** Função que alterna entre mutar e desmutar o audio */
    audioRef.current.muted = !audioRef.current.muted;
    setIsMuted(!isMuted);
  };

  return ( /** Construção do botão de mutar/desmutar e o audio em si */
    <div className="textPad fixed bottom-4 right-4 z-50">
      <button className="MuteB hover:translate-y-[-3px] applyBlur" onClick={toggleMute}>
        {isMuted ? ( /** Se o audio estiver mutado, exibe o icone de som mutado */
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width='2em' height='2em'><path fill="currentColor" fill-rule="evenodd" d="m403.375 257.27l59.584 59.584l-30.167 30.166l-59.583-59.583l-59.584 59.583l-30.166-30.166l59.583-59.584l-59.583-59.583l30.166-30.166l59.584 59.583l59.583-59.583l30.167 30.166zM234.417 85.333l-110.854 87.23H42.667v170.666h81.02l110.73 85.458zM85.334 215.229h53.02l53.396-42.021v168.646l-53.52-41.292H85.333z"/></svg>
        ) : ( /** Se o audio não estiver mutado, exibe o icone de som normal */
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width='2em' height='2em'><path fill="currentColor" fill-rule="evenodd" d="m403.966 426.944l-33.285-26.63c74.193-81.075 74.193-205.015-.001-286.09l33.285-26.628c86.612 96.712 86.61 242.635.001 339.348M319.58 155.105l-33.324 26.659c39.795 42.568 39.794 108.444.001 151.012l33.324 26.658c52.205-58.22 52.205-146.109-.001-204.329m-85.163-69.772l-110.854 87.23H42.667v170.666h81.02l110.73 85.458zM85.334 215.229h53.02l53.396-42.021v168.646l-53.52-41.292H85.333z"/></svg>
        )}
      </button>

      <audio ref={audioRef} loop autoPlay muted={false}> 
        {/** Audio que será reproduzido */}
        <source src="/src/assets/audio/SiteSong.mp3" type="audio/mpeg" /> 
      </audio>
    </div>
  );
};

export default AudioPlayer;