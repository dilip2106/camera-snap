import { bootstrapCameraKit, createMediaStreamSource } from '@snap/camera-kit'
import { SNAP_CONFIG } from '../config/snapConfig'

export type SnapCameraResult = {
  session: Awaited<ReturnType<typeof createSession>>
  mediaStream: MediaStream
  lensError?: string
}

async function createSession(
  cameraKit: Awaited<ReturnType<typeof bootstrapCameraKit>>,
  canvas: HTMLCanvasElement,
  mediaStream: MediaStream,
  cameraType: 'user' | 'environment' = 'user'
) {
  const session = await cameraKit.createSession({ liveRenderTarget: canvas })
  await session.setSource(
    createMediaStreamSource(mediaStream, { cameraType })
  )
  await session.play()
  return session
}

export type CameraConstraints = {
  deviceId?: string
  facingMode?: 'user' | 'environment'
}

export async function initializeSnapCamera(
  canvas: HTMLCanvasElement,
  constraints?: CameraConstraints
): Promise<SnapCameraResult> {
  let cameraKit: Awaited<ReturnType<typeof bootstrapCameraKit>>
  try {
    cameraKit = await bootstrapCameraKit({
      apiToken: SNAP_CONFIG.apiToken,
    })
  } catch (err) {
    const originalMessage = err instanceof Error ? err.message : String(err)
    const origin =
      typeof window !== 'undefined' ? window.location.origin : 'unknown origin'
    const host =
      typeof window !== 'undefined' ? window.location.hostname : 'unknown host'
    const isLocalHost = host === 'localhost' || host === '127.0.0.1'
    const localHint = isLocalHost
      ? ` The current origin is ${origin}. Use a Staging token for local runs, or add this exact origin in Snap Platform Identifiers.`
      : ''

    throw new Error(
      `Failed to bootstrap Snap Camera Kit.${localHint} Verify your API token and allowed origin settings in Snap. Original error: ${originalMessage}`
    )
  }

  const videoConstraints: MediaTrackConstraints = {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    ...(constraints?.deviceId && { deviceId: { exact: constraints.deviceId } }),
    ...(constraints?.facingMode && { facingMode: constraints.facingMode }),
  }

  const mediaStream = await navigator.mediaDevices.getUserMedia({
    video: videoConstraints,
  })

  const cameraType = constraints?.facingMode ?? 'user'
  const session = await createSession(cameraKit, canvas, mediaStream, cameraType)

  let lensError: string | undefined
  try {
    // Use loadLensGroups to get all lenses from the group (works better for Web sample lenses)
    const { lenses } = await cameraKit.lensRepository.loadLensGroups([
      SNAP_CONFIG.lensGroupId,
    ])
    if (lenses.length > 0) {
      await session.applyLens(lenses[0])
    } else {
      lensError = 'No lenses found in this group. Add lenses in Lens Scheduler.'
    }
  } catch (err) {
    lensError = err instanceof Error ? err.message : String(err)
  }

  return { session, mediaStream, lensError }
}
