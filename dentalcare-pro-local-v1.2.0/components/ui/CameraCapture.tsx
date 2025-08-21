'use client'

import { useState, useRef, useCallback } from 'react'
import { Camera, Upload, X, RotateCcw, Check } from 'lucide-react'

interface CameraCaptureProps {
  onPhotoCapture: (photoDataUrl: string) => void
  onClose: () => void
  currentPhoto?: string
}

export function CameraCapture({ onPhotoCapture, onClose, currentPhoto }: CameraCaptureProps) {
  const [mode, setMode] = useState<'select' | 'camera' | 'upload'>('select')
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const startCamera = useCallback(async () => {
    try {
      setError(null)
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        } 
      })
      
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
      setMode('camera')
    } catch (err) {
      setError('Não foi possível acessar a câmera. Verifique as permissões.')
      console.error('Erro ao acessar câmera:', err)
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
  }, [stream])

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext('2d')
      
      if (context) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        context.drawImage(video, 0, 0)
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
        setCapturedPhoto(dataUrl)
      }
    }
  }, [])

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string
        setCapturedPhoto(dataUrl)
        setMode('upload')
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const confirmPhoto = useCallback(() => {
    if (capturedPhoto) {
      onPhotoCapture(capturedPhoto)
      stopCamera()
      onClose()
    }
  }, [capturedPhoto, onPhotoCapture, stopCamera, onClose])

  const retakePhoto = useCallback(() => {
    setCapturedPhoto(null)
    if (mode === 'upload') {
      setMode('select')
    }
  }, [mode])

  const handleClose = useCallback(() => {
    stopCamera()
    onClose()
  }, [stopCamera, onClose])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            {mode === 'select' ? 'Alterar Foto de Perfil' : 
             mode === 'camera' ? 'Capturar Foto' : 'Upload de Foto'}
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {mode === 'select' && (
            <div className="space-y-4">
              {/* Foto atual */}
              {currentPhoto && (
                <div className="text-center">
                  <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden bg-gray-100">
                    <img 
                      src={currentPhoto} 
                      alt="Foto atual" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-sm text-gray-600 mb-4">Foto atual</p>
                </div>
              )}

              {/* Opções */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={startCamera}
                  className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                >
                  <Camera size={32} className="text-gray-400 mb-2" />
                  <span className="text-sm font-medium text-gray-700">Usar Câmera</span>
                  <span className="text-xs text-gray-500 mt-1">Capturar nova foto</span>
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                >
                  <Upload size={32} className="text-gray-400 mb-2" />
                  <span className="text-sm font-medium text-gray-700">Fazer Upload</span>
                  <span className="text-xs text-gray-500 mt-1">Selecionar arquivo</span>
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
            </div>
          )}

          {mode === 'camera' && !capturedPhoto && (
            <div className="space-y-4">
              <div className="relative bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-80 object-cover"
                />
                <div className="absolute inset-0 border-2 border-white/20 rounded-lg pointer-events-none" />
              </div>
              
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => {
                    stopCamera()
                    setMode('select')
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={capturePhoto}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Camera size={20} />
                  Capturar
                </button>
              </div>
            </div>
          )}

          {(capturedPhoto || mode === 'upload') && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-64 h-64 mx-auto rounded-lg overflow-hidden bg-gray-100">
                  <img 
                    src={capturedPhoto || ''} 
                    alt="Foto capturada" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              
              <div className="flex justify-center gap-4">
                <button
                  onClick={retakePhoto}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <RotateCcw size={16} />
                  {mode === 'camera' ? 'Capturar Novamente' : 'Escolher Outra'}
                </button>
                <button
                  onClick={confirmPhoto}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <Check size={16} />
                  Confirmar Foto
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Canvas oculto para captura */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  )
}

