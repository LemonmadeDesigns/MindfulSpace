import React, { useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import * as faceapi from 'face-api.js';
import { Camera, RefreshCw } from 'lucide-react';

interface Expression {
  happy: number;
  sad: number;
  angry: number;
  fearful: number;
  disgusted: number;
  surprised: number;
  neutral: number;
}

const MoodDetection = () => {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [expressions, setExpressions] = useState<Expression | null>(null);
  const [dominantMood, setDominantMood] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const loadModels = async () => {
      try {
        setIsModelLoading(true);
        const MODEL_URL = '/models';
        
        // Load the required face-api.js models
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
        ]);
        
        setIsModelLoading(false);
      } catch (err) {
        setError('Error loading face detection models. Please try again later.');
        setIsModelLoading(false);
      }
    };

    loadModels();
  }, []);

  const detectExpressions = async () => {
    if (!webcamRef.current || !canvasRef.current) return;

    const video = webcamRef.current.video;
    if (!video) return;

    const canvas = canvasRef.current;
    const displaySize = { width: video.videoWidth, height: video.videoHeight };
    faceapi.matchDimensions(canvas, displaySize);

    try {
      const detections = await faceapi
        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceExpressions();

      if (detections) {
        const resizedDetections = faceapi.resizeResults(detections, displaySize);
        
        // Clear the canvas and draw the new detections
        const ctx = canvas.getContext('2d');
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw face detection box
        faceapi.draw.drawDetections(canvas, [resizedDetections]);

        // Update expressions state
        setExpressions(detections.expressions);

        // Find the dominant mood
        const dominant = Object.entries(detections.expressions).reduce((a, b) => 
          a[1] > b[1] ? a : b
        );
        setDominantMood(dominant[0]);
      }
    } catch (err) {
      console.error('Error detecting expressions:', err);
    }
  };

  useEffect(() => {
    if (!isModelLoading) {
      const interval = setInterval(detectExpressions, 100);
      return () => clearInterval(interval);
    }
  }, [isModelLoading]);

  const getMoodMessage = () => {
    switch (dominantMood) {
      case 'happy':
        return "You're radiating positivity! Keep that wonderful smile going!";
      case 'sad':
        return "I notice you might be feeling down. Remember, it's okay to not be okay. Would you like to talk about it?";
      case 'angry':
        return "I sense some frustration. Taking deep breaths can help calm your mind.";
      case 'fearful':
        return "You seem anxious. Remember, you're stronger than you think.";
      case 'disgusted':
        return "Something bothering you? Let's focus on positive thoughts.";
      case 'surprised':
        return "You look amazed! What's caught your attention?";
      case 'neutral':
        return "You appear calm and centered. That's a great state of mind!";
      default:
        return "I'm here to understand how you're feeling.";
    }
  };

  const getMoodColor = () => {
    switch (dominantMood) {
      case 'happy':
        return 'bg-yellow-100 border-yellow-500 text-yellow-700';
      case 'sad':
        return 'bg-blue-100 border-blue-500 text-blue-700';
      case 'angry':
        return 'bg-red-100 border-red-500 text-red-700';
      case 'fearful':
        return 'bg-purple-100 border-purple-500 text-purple-700';
      case 'disgusted':
        return 'bg-green-100 border-green-500 text-green-700';
      case 'surprised':
        return 'bg-orange-100 border-orange-500 text-orange-700';
      case 'neutral':
        return 'bg-gray-100 border-gray-500 text-gray-700';
      default:
        return 'bg-purple-100 border-purple-500 text-purple-700';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Mood Detection</h1>
        <p className="text-gray-600">
          Let's understand how you're feeling today through facial expression analysis
        </p>
      </div>

      {error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      ) : isModelLoading ? (
        <div className="text-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading mood detection models...</p>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="relative w-full max-w-2xl mx-auto">
            <Webcam
              ref={webcamRef}
              mirrored
              className="w-full rounded-lg shadow-lg"
            />
            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0 w-full h-full"
            />
          </div>

          {dominantMood && (
            <div className={`p-6 rounded-lg border ${getMoodColor()}`}>
              <h2 className="text-xl font-semibold mb-2">
                Current Mood: {dominantMood.charAt(0).toUpperCase() + dominantMood.slice(1)}
              </h2>
              <p>{getMoodMessage()}</p>
            </div>
          )}

          {expressions && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Mood Analysis</h3>
              <div className="space-y-3">
                {Object.entries(expressions).map(([mood, value]) => (
                  <div key={mood} className="flex items-center">
                    <span className="w-24 text-gray-600 capitalize">{mood}:</span>
                    <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-600 transition-all duration-300"
                        style={{ width: `${value * 100}%` }}
                      />
                    </div>
                    <span className="w-16 text-right text-gray-600">
                      {(value * 100).toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MoodDetection;