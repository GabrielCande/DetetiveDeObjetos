import { useState, useEffect, useRef } from "react";
import WebcamViewer from "./WebCamViewer";
import { getShuffledMissions } from "./missions";
import AudioPlayer from "./AudioPlayer";
import "./App.css";

function App() {
  const [showStartScreen, setShowStartScreen] = useState(true);
  const [shouldRenderStartScreen, setShouldRenderStartScreen] = useState(true);
  const [showMainApp, setShowMainApp] = useState(false);

  const handleStart = () => {
    setShowStartScreen(false);
    setTimeout(() => {
      setShouldRenderStartScreen(false);
      setShowMainApp(true);
    }, 500);
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {shouldRenderStartScreen && (
        <div
          style={{ display: showStartScreen ? "flex" : "none" }}
          className="fixed inset-0 flex flex-col justify-center items-center h-screen bg-[#b66e363a] backdrop-blur-md rounded-xl text-center p-10 z-50 transition-opacity duration-500"
        >
          <h1 className="text-4xl font-bold mb-6 text-[#3B2A1D] [text-shadow:_3px_3px_0_rgba(0,0,0,0.3)] transition-all duration-300 hover:translate-y-[-6px]">
            Bem-vindo ao Detetive de Objetos!
          </h1>
          <div className="z-50 flex items-center gap-2">
            <img
              src={"/src/assets/logo.png"}
              className="w-50 h-50 object-contain transition-all duration-300 hover:translate-y-[-6px]"
            />
            <p className="text-xl mb-8 font-bold text-[#3B2A1D] [text-shadow:_2px_2px_0_rgba(0,0,0,0.3)] transition-all duration-300 hover:translate-y-[-6px] max-w-120 mt-5">
            Detetive de Objetos é um jogo interativo que usa a câmera do seu dispositivo e inteligência artificial para desafiar você a encontrar objetos no seu ambiente. A cada rodada, um item será exibido na tela, e sua missão é localizá-lo com a câmera até que o sistema o reconheça. Com atenção e agilidade, você avançará pelas missões enquanto o modelo de IA analisa as imagens em tempo real para identificar corretamente os objetos.
            </p>
          </div>
          <button
            onClick={handleStart}
            className="button flex items-center gap-2 font-bold transition-all duration-300 hover:translate-y-[-6px] text-[#eba118] [text-shadow:_2px_2px_0_rgba(0,0,0,0.3)]"
          >
            Começar o Jogo!
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="2em"
              height="2em"
            >
              <g
                fill="none"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                color="currentColor"
              >
                <path d="M6.6 11.923c5.073-9.454 11.39-9.563 13.913-8.436c1.127 2.524 1.018 8.84-8.436 13.913c-.098-.564-.643-2.04-2.04-3.437s-2.873-1.942-3.437-2.04" />
                <path d="M13.35 16.95c1.839.9 2.035 2.514 2.29 4.05c0 0 3.85-2.846 1.387-6.75M7.05 10.727C6.15 8.888 4.536 8.692 3 8.437c0 0 2.847-3.85 6.75-1.387m-3.732 7.862c-.512.511-1.382 1.996-.768 3.838c1.843.614 3.327-.256 3.84-.767M17.3 8.45a1.75 1.75 0 1 0-3.5 0a1.75 1.75 0 0 0 3.5 0" />
              </g>
            </svg>
          </button>
        </div>
      )}
      {showMainApp && <MainApp />}
    </div>
  );
}

function MainApp() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [detectionResult, setDetectionResult] = useState(null);
  const [model, setModel] = useState(null);
  const [status, setStatus] = useState("Carregando modelo...");
  const [missionsList, setMissionsList] = useState([]);
  const [currentMissionIndex, setCurrentMissionIndex] = useState(0);

  const webcamRef = useRef(null);
  const detectionLoopId = useRef(null);

  useEffect(() => {
    const initializeMissions = () => {
      const shuffledMissions = getShuffledMissions();
      setMissionsList(shuffledMissions);
      setStatus(
        shuffledMissions[0] ? "Carregando Modelo..." : "Sem missões disponíveis"
      );
    };
    initializeMissions();
  }, []);

  const currentMission = missionsList[currentMissionIndex];

  useEffect(() => {
    const loadModel = async () => {
      try {
        if (!window.tf || !window.cocoSsd) {
          await Promise.all([
            loadScript("https://cdn.jsdelivr.net/npm/@tensorflow/tfjs"),
            loadScript(
              "https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd"
            ),
          ]);
        }

        const model = await window.cocoSsd.load();
        setModel(model);
        setStatus(
          currentMission
            ? `Procure por: ${currentMission.label}`
            : ""
        );
      } catch (err) {
        console.error("Erro ao carregar modelo:", err);
        setStatus("Erro ao carregar o modelo de IA");
      }
    };

    const loadScript = (src) =>
      new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = src;
        script.onload = resolve;
        document.head.appendChild(script);
      });

    loadModel();
  }, [currentMission]);

  useEffect(() => {
    let isActive = true;

    const runDetection = async () => {
      if (!model || !webcamRef.current || !currentMission) return;

      const videoElement = webcamRef.current;

      const detectFrame = async () => {
        if (!isActive) return;

        try {
          const predictions = await model.detect(videoElement);
          const target = predictions.find(
            (p) => p.class === currentMission.category
          );

          if (target) {
            setDetectionResult({
              confidence: Math.round(target.score * 100),
              mission: currentMission,
            });
            setStatus(`${currentMission.label} encontrado!`);
            cancelAnimationFrame(detectionLoopId.current);
          } else {
            detectionLoopId.current = requestAnimationFrame(detectFrame);
          }
        } catch (error) {
          console.error("Erro na detecção:", error);
          detectionLoopId.current = requestAnimationFrame(detectFrame);
        }
      };

      detectionLoopId.current = requestAnimationFrame(detectFrame);
    };

    if (webcamRef.current?.readyState === HTMLMediaElement.HAVE_ENOUGH_DATA) {
      runDetection();
    } else {
      webcamRef.current?.addEventListener("loadeddata", runDetection);
    }

    return () => {
      isActive = false;
      cancelAnimationFrame(detectionLoopId.current);
      webcamRef.current?.removeEventListener("loadeddata", runDetection);
    };
  }, [model, currentMission]);

  const nextMission = () => {
    if (currentMissionIndex < missionsList.length - 1) {
      setCurrentMissionIndex((prev) => prev + 1);
      setDetectionResult(null);
      setStatus(`Procure por: ${missionsList[currentMissionIndex + 1].label}`);
      cancelAnimationFrame(detectionLoopId.current);
    }
  };

  const missionProgress =
    missionsList.length > 0
      ? `${currentMissionIndex + 1}/${missionsList.length}`
      : "0/0";

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <AudioPlayer />
      <nav className={`fixed-header ${isScrolled ? "scrolled" : ""}`}>
        <div className="">
          <h1 className="textPad font-bold [text-shadow:_3px_3px_0_rgba(0,0,0,0.4)] applyBlur">
            Detetive de Objetos
          </h1>
        </div>
      </nav>

      <main className="main-content">
        <div className="grid-container">
          <div className="">
            <div className="">
              {detectionResult ? (
                <div>
                  <p className="animate-pulse duration-200 text-xl font-bold [text-shadow:_3px_3px_0_rgba(0,0,0,0.3)] text-[#a1ee11] mt-30 applyBlur">
                    {detectionResult.mission.label} encontrada(o)!
                  </p>
                  <p className="font-extrabold [text-shadow:_2px_2px_0_rgba(0,0,0,0.3)] text-[#3B2A1D] mb-5 applyBlur">
                    Confiança: {detectionResult.confidence}%
                  </p>
                  {currentMissionIndex < missionsList.length - 1 ? (
                    <button
                      onClick={nextMission}
                      className="text-[#B66E36] font-black button transition-all duration-300 hover:translate-y-[-6px] [text-shadow:_3px_3px_0_rgba(0,0,0,0.3)] applyBlur"
                    >
                      Próxima Missão →
                    </button>
                  ) : (
                    <p className="animate-bounce duration-300 text-xl font-bold [text-shadow:_2px_2px_0_rgba(0,0,0,0.3)] text-[#ffbb00] mt-10">
                      Prabéns!!! Você Conseguiu Completar Todas as Missões!
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  {!model ? (
                    <div className="flex flex-col items-center">
                      <svg
                        className="animate-spin text-[#3B2A1D] mt-20 applyBlur"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        width="6em"
                        height="6em"
                      >
                        <path
                          fill="currentColor"
                          d="M12 2A10 10 0 1 0 22 12A10 10 0 0 0 12 2Zm0 18a8 8 0 1 1 8-8A8 8 0 0 1 12 20Z"
                          opacity=".5"
                        />
                        <path
                          fill="currentColor"
                          d="M20 12h2A10 10 0 0 0 12 2V4A8 8 0 0 1 20 12Z"
                        >
                          <animateTransform
                            attributeName="transform"
                            dur="1s"
                            from="0 12 12"
                            repeatCount="indefinite"
                            to="360 12 12"
                            type="rotate"
                          />
                        </path>
                      </svg>
                      <p className="text-2xl font-extrabold [text-shadow:_2px_2px_0_rgba(0,0,0,0.4)] text-[#3B2A1D] transition-all duration-300 hover:translate-y-[-4px] mt-10 applyBlur">
                        Carregando Jogo...
                      </p>
                    </div>
                  ) : (
                    <div className="w-full h-full overflow-hidden rounded-lg">
                      <img
                        src={currentMission?.image}
                        className="w-full h-full object-contain transition-all duration-300 hover:translate-y-[-6px] applyBlur"
                      />
                      <p className="text-2xl font-extrabold [text-shadow:_2px_2px_0_rgba(0,0,0,0.4)] text-[#3B2A1D] transition-all duration-300 hover:translate-y-[-4px] mr-10 applyBlur">
                        {status}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2">
              <svg
                className="text-[#ecd1ae] transition-all duration-300 hover:translate-y-[-4px] applyBlur rounded-2xl"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 512 512"
                width="4em"
                height="4em"
              >
                <path
                  fill="currentColor"
                  d="M227.4 34.7c-10.1 0-20.2.2-30.2.5l6.1 65.6l-61.1-62.5c-31.3 2.5-62.5 6.6-93.8 12.5l34.2 28.4l-48-.6c35.1 100.2 6.9 182.6-.3 292.1L130 476.5c10-1.3 19.9-2.4 29.6-3.3l21.5-42.2l18.6 28.8l41.5-33.5l.8 43c82.9-.2 157.7 9.1 235.7 7.9c-28.2-73-31.2-143.6-31.9-209.2l-33.3-19.1l32.7-33.9c-.4-21.3-1.3-42-3.6-61.9l-57.4.7l50.2-41.7c-3.8-15.5-9-30.4-16.1-44.7l-29.5-23.9C335 38 281.2 34.6 227.4 34.7m58.7 37c10.6 24.75 21.1 49.5 31.7 74.3c7.5-10.5 14.9-21 22.4-31.5c16 27.2 32 54.3 48 81.5l-16.2 9.5l-33.3-56.7l-42.5 59.4l-15.2-10.9l24-33.5l-21.9-51.5l-24.6 40.1l12 22.6l-16.5 8.8l-18.3-34.5l-24.8 58.2l-17.2-7.4l32.5-76.2l7.7-18c4.8 9.2 9.6 18.3 14.5 27.4c12.5-20.6 25.1-41.11 37.7-61.6M91.2 128c6.72 1.6 13.4 3.4 19.2 5.3c-2.1 5.9-4.1 11.8-6.2 17.6c-5.79-1.6-11.72-3.4-16.9-4.7c1.39-6 2.62-12.1 3.9-18.2m37.9 13.4c6.3 3.8 12 7.2 17 12.8L132.6 167c-4-3.7-8.6-7-12.8-9.4zm28.7 32.3c2.1 7.4 2.1 15.7 1.6 22.5l-18.5-2.4c.1-5.1.3-10-1-14.5zm-21.2 35.7l17.2 7.1c-3.3 6.6-5.1 12.7-8.6 17.8l-16.3-9c2.6-5.4 5.6-10.8 7.7-15.9m-16.5 34.1l17.7 6.1c-1.5 5.4-3 11.2-3.6 16.2l-18.6-2c1.3-7.5 2.1-14 4.5-20.3m207.8 17.4c8.5 1 14.6 3 21.7 7.1l-9.8 16c-4.1-2.8-9.4-3.8-13.5-4.5zm-21.2 1.5c1.1 6.1 2.5 12.2 3.9 18.3c-5.9 1.3-11.7 3.3-16.5 5.1l-6.8-17.4c6.7-2.4 13.5-4.7 19.4-6m-37.9 15.9l11 15.1c-5.6 4-11.8 7.8-16.8 10.6l-8.9-16.4c5.1-2.9 10.6-6.3 14.7-9.3M135.3 281c1.5 4.7 4.2 9.2 6.9 12.1l-13.8 12.6c-5.5-5.7-9.5-13.5-11.2-20.1zm230.3 3.3c3.5 6.4 6.8 12.7 8.7 19.1l-17.8 5.6c-2-5.4-4.3-10.8-6.8-14.8zm-127.4 10.9l6.9 17.3c-6.4 2.7-12.9 4.8-18.6 6.5l-5-18c5.9-1.6 11.3-3.8 16.7-5.8m-83.8 6.2c5.3 1.7 10.8 3.4 15.7 4.2c-1.2 6.1-2 12.3-2.8 18.5c-7-1-14.5-3.3-20.5-5.7zm50 3.5l2.8 18.5c-7.2 1.3-13.4 1.6-19.8 1.9l-.4-18.7c5.9-.2 11.6-.8 17.4-1.7m174.5 18c1 6.4 1.6 12.9 2.2 19.3l-18.7 1.5c-.4-6-.9-11.9-2-17.8zm-67.6 30.8c18.9 3.5 44.9 16.2 68.9 33.9c7.4-9.9 14.4-20.4 21.3-31.1l30.1 12.9c-4.7 12.3-15 25.6-28.6 37.2c17 16.2 30.9 34.5 37 53c-13.8-18.1-31.1-31.8-50.3-42.8c-23.4 15.8-52.7 25.9-79.6 20.4c22.9-4.4 40.6-16.6 55.8-32.6c-16.5-7.5-33.8-13.9-51.3-20.1z"
                />
              </svg>
              <p className="applyBlur text-xl font-bold [text-shadow:_2px_2px_0_rgba(0,0,0,0.3)] text-[#3B2A1D] transition-all duration-300 hover:translate-y-[-4px] rounded-2xl">
                Missão {missionProgress}
              </p>
            </div>
          </div>

          <div className="">
            <WebcamViewer ref={webcamRef} />
          </div>
        </div>
      </main>

      <footer className="fixed-footer">
        <div className="textPad [text-shadow:_2px_2px_0_rgba(0,0,0,0.3)]">
          <p>&copy; {new Date().getFullYear()} Detetive de Objetos</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
