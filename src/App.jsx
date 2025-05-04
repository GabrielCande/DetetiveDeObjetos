import { useState, useEffect, useRef } from 'react';
import WebcamViewer from './WebCamViewer';
import { getShuffledMissions } from './missions';
import './App.css';

function App() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [detectionResult, setDetectionResult] = useState(null);
  const [model, setModel] = useState(null);
  const [status, setStatus] = useState('Carregando modelo...');
  const [missionsList, setMissionsList] = useState([]);
  const [currentMissionIndex, setCurrentMissionIndex] = useState(0);
  
  // Refs
  const webcamRef = useRef(null);
  const detectionLoopId = useRef(null);

  // Initialize missions
  useEffect(() => {
    const initializeMissions = () => {
      const shuffledMissions = getShuffledMissions();
      setMissionsList(shuffledMissions);
      setStatus(shuffledMissions[0] ? "Carregando Modelo..." : 'Sem missões disponíveis');
    };
    initializeMissions();
  }, []);

  // Current mission
  const currentMission = missionsList[currentMissionIndex];

  // Load TensorFlow model
  useEffect(() => {
    const loadModel = async () => {
      try {
        if (!window.tf || !window.cocoSsd) {
          await Promise.all([
            loadScript('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs'),
            loadScript('https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd')
          ]);
        }

        const model = await window.cocoSsd.load();
        setModel(model);
        setStatus(currentMission ? `Procure por: ${currentMission.label}` : "Carregando Modelo...");

      } catch (err) {
        console.error('Erro ao carregar modelo:', err);
        setStatus('Erro ao carregar o modelo de IA');
      }
    };

    const loadScript = (src) => new Promise(resolve => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      document.head.appendChild(script);
    });

    loadModel();
  }, [currentMission]);

  // Detection logic
  useEffect(() => {
    let isActive = true;

    const runDetection = async () => {
      if (!model || !webcamRef.current || !currentMission) return;

      const videoElement = webcamRef.current;
      
      const detectFrame = async () => {
        if (!isActive) return;

        try {
          const predictions = await model.detect(videoElement);
          const target = predictions.find(p => p.class === currentMission.category);

          if (target) {
            setDetectionResult({
              confidence: Math.round(target.score * 100),
              mission: currentMission
            });
            setStatus(`${currentMission.label} encontrado!`);
            cancelAnimationFrame(detectionLoopId.current);
          } else {
            detectionLoopId.current = requestAnimationFrame(detectFrame);
          }
        } catch (error) {
          console.error('Erro na detecção:', error);
          detectionLoopId.current = requestAnimationFrame(detectFrame);
        }
      };

      detectionLoopId.current = requestAnimationFrame(detectFrame);
    };

    if (webcamRef.current?.readyState === HTMLMediaElement.HAVE_ENOUGH_DATA) {
      runDetection();
    } else {
      webcamRef.current?.addEventListener('loadeddata', runDetection);
    }

    return () => {
      isActive = false;
      cancelAnimationFrame(detectionLoopId.current);
      webcamRef.current?.removeEventListener('loadeddata', runDetection);
    };
  }, [model, currentMission]);

  // Mission control
  const nextMission = () => {
    if (currentMissionIndex < missionsList.length - 1) {
      setCurrentMissionIndex(prev => prev + 1);
      setDetectionResult(null);
      setStatus(`Procure por: ${missionsList[currentMissionIndex + 1].label}`);
      cancelAnimationFrame(detectionLoopId.current);
    }
  };

  // UI helpers
  const missionProgress = missionsList.length > 0 
    ? `${currentMissionIndex + 1}/${missionsList.length}`
    : '0/0';

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <nav className={`fixed-header shadow-lg py-4 ${isScrolled ? 'scrolled' : ''}`}>
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-2xl font-bold text-center">Detetive de Objetos</h1>
        </div>
      </nav>

      <main className="main-content container flex-1 pt-16 pb-16">
        <div className="grid-container flex gap-4">
          <div className="w-1/3 bg-gray-100 rounded-lg shadow-md p-4 flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-600 mb-4 text-lg">🔍 Missão {missionProgress}</p>
              
              {detectionResult ? (
                <div>
                  <p className="text-green-600 font-bold text-xl mb-2">
                    {detectionResult.mission.label} encontrado!
                  </p>
                  <p>Confiança: {detectionResult.confidence}%</p>
                  {currentMissionIndex < missionsList.length - 1 ? (
                    <button
                      onClick={nextMission}
                      className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
                    >
                      Próxima Missão →
                    </button>
                  ) : (
                    <p className="mt-4 text-green-600 font-bold">🎉 Missões concluídas!</p>
                  )}
                </div>
              ) : (
                <div>
                  <p className="text-sm text-gray-500">{status}</p>
                </div>
              )}
            </div>
          </div>

          <div className="w-2/3 rounded-lg shadow-md overflow-hidden aspect-video">
            <WebcamViewer ref={webcamRef} />
          </div>
        </div>
      </main>

      <footer className="fixed-footer text-center">
        <div className="max-w-6xl mx-auto px-4">
          <p>&copy; {new Date().getFullYear()} Detetive de Objetos</p>
        </div>
      </footer>
    </div>
  );
}

export default App;