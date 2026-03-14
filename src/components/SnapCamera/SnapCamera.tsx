import { useSnapCamera } from './useSnapCamera'

export default function SnapCamera() {
  const {
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
  } = useSnapCamera()
  const busy = loading || stopping

  if (cameraSupported === false) {
    return (
      <div
        style={{
          padding: '1.5rem',
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: 8,
          color: '#991b1b',
        }}
      >
        <p style={{ margin: 0, fontWeight: 600 }}>Camera not supported</p>
        <p style={{ margin: '0.5rem 0 0', fontSize: '0.9rem' }}>
          Your browser or device does not support camera access. Try Chrome,
          Edge, or Safari on a device with a webcam.
        </p>
      </div>
    )
  }

  if (cameraDenied) {
    return (
      <div
        style={{
          padding: '1.5rem',
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: 8,
          color: '#991b1b',
        }}
      >
        <p style={{ margin: 0, fontWeight: 600 }}>Camera access denied</p>
        <p style={{ margin: '0.5rem 0 0', fontSize: '0.9rem' }}>
          Please allow camera access in your browser settings and refresh the
          page.
        </p>
        <button
          type="button"
          onClick={() => startCamera()}
          style={{ marginTop: '0.75rem', padding: '0.5rem 1rem' }}
        >
          Try again
        </button>
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
        <button onClick={() => startCamera()} disabled={busy}>
          {loading ? 'Starting…' : 'Open Camera'}
        </button>
        <button type="button" onClick={stopCamera} disabled={busy}>
          {stopping ? 'Stopping…' : 'Stop Camera'}
        </button>
        <button
          type="button"
          onClick={captureSnapshot}
          disabled={busy || !isCameraActive}
          title="Download snapshot"
        >
          Capture
        </button>

        {devices.length > 1 && isCameraActive && (
          <select
            value={selectedDeviceId ?? ''}
            onChange={(e) => switchCamera(e.target.value)}
            disabled={busy}
            style={{ padding: '0.35rem 0.5rem', minWidth: 140 }}
          >
            {devices.map((d) => (
              <option key={d.deviceId} value={d.deviceId}>
                {d.label}
              </option>
            ))}
          </select>
        )}
      </div>

      {error && <p style={{ color: 'red', margin: '0 0 0.5rem' }}>{error}</p>}

      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          maxWidth: 640,
          height: 500,
          display: 'block',
          background: '#111',
        }}
      />
    </div>
  )
}
