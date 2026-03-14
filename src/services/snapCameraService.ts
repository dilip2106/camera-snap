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
  const cameraKit = await bootstrapCameraKit({
    apiToken: SNAP_CONFIG.apiToken,
  })

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
