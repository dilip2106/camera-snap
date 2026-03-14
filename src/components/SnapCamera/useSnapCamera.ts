import { useEffect, useRef, useState } from 'react'
import {
  initializeSnapCamera,
  type SnapCameraResult,
  type CameraConstraints,
} from '../../services/snapCameraService'

const DESTROY_TIMEOUT_MS = 5000

export type CameraDevice = {
  deviceId: string
  label: string
  kind: string
}

export function useSnapCamera() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const resultRef = useRef<SnapCameraResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [stopping, setStopping] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [devices, setDevices] = useState<CameraDevice[]>([])
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null)
  const [cameraSupported, setCameraSupported] = useState<boolean | null>(null)
  const [cameraDenied, setCameraDenied] = useState(false)
  const [isCameraActive, setIsCameraActive] = useState(false)

  useEffect(() => {
    setCameraSupported(
      !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
    )
  }, [])

  const startCamera = async (constraints?: CameraConstraints) => {
    if (!canvasRef.current) return

    try {
      setError(null)
      setCameraDenied(false)
      setLoading(true)

      const result = await initializeSnapCamera(canvasRef.current, constraints)
      resultRef.current = result
      setIsCameraActive(true)
      if (result.lensError) setError(result.lensError)

      const videoDevices = await navigator.mediaDevices.enumerateDevices()
      const videoInputs = videoDevices
        .filter((d) => d.kind === 'videoinput')
        .map((d) => ({
          deviceId: d.deviceId,
          label: d.label || `Camera ${d.deviceId.slice(0, 8)}`,
          kind: d.kind,
        }))
      setDevices(videoInputs)
      if (videoInputs.length > 0 && !selectedDeviceId) {
        setSelectedDeviceId(videoInputs[0].deviceId)
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      setError(message)
      if (
        err instanceof DOMException &&
        (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError')
      ) {
        setCameraDenied(true)
      }
    } finally {
      setLoading(false)
    }
  }

  const switchCamera = async (deviceId: string) => {
    const result = resultRef.current
    if (!result || !canvasRef.current) return

    setSelectedDeviceId(deviceId)
    setLoading(true)
    setError(null)

    try {
      result.mediaStream.getTracks().forEach((t) => t.stop())
      await result.session.destroy()

      const newResult = await initializeSnapCamera(canvasRef.current, {
        deviceId,
      })
      resultRef.current = newResult
      setIsCameraActive(true)
      if (newResult.lensError) setError(newResult.lensError)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  const stopCamera = async () => {
    const result = resultRef.current
    if (!result) return

    setStopping(true)
    resultRef.current = null
    setIsCameraActive(false)

    result.mediaStream.getTracks().forEach((track) => track.stop())

    if (canvasRef.current) {
      const el = canvasRef.current
      const ctx = el.getContext('2d')
      if (ctx) {
        const w = Math.max(el.width, el.clientWidth || 640)
        const h = Math.max(el.height, el.clientHeight || 500)
        ctx.clearRect(0, 0, w, h)
      }
    }

    setError(null)

    try {
      await Promise.race([
        result.session.destroy(),
        new Promise<void>((_, reject) =>
          setTimeout(() => reject(new Error('Destroy timeout')), DESTROY_TIMEOUT_MS)
        ),
      ])
    } catch {
      // Timeout or destroy error
    } finally {
      setStopping(false)
    }
  }

  const captureSnapshot = () => {
    const canvas = canvasRef.current
    const result = resultRef.current
    if (!canvas || !result) return

    const outputCanvas = result.session.output?.live ?? canvas
    const dataUrl = outputCanvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.download = `snap-capture-${Date.now()}.png`
    link.href = dataUrl
    link.click()
  }

  useEffect(() => {
    return () => {
      const result = resultRef.current
      if (result) {
        result.mediaStream.getTracks().forEach((track) => track.stop())
        result.session.destroy().catch(() => {})
        resultRef.current = null
      }
    }
  }, [])

  return {
    canvasRef,
    startCamera,
    stopCamera,
    captureSnapshot,
    switchCamera,
    loading,
    stopping,
    error,
    devices,
    selectedDeviceId,
    cameraSupported,
    cameraDenied,
    isCameraActive,
  }
}
