import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { randomUUID } from 'crypto'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 60

// Cloudflare R2 S3-compatible config
const R2_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || ''
const R2_ACCESS_KEY_ID = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || ''
const R2_SECRET_ACCESS_KEY = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || ''
const R2_ENDPOINT = process.env.CLOUDFLARE_R2_S3_API || ''
const R2_BUCKET = 'gridironiq-uploads'

const s3Client = new S3Client({
  region: 'auto',
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
})

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Only coaches and above can upload
  const role = (session.user as { role?: string }).role
  if (role === 'player') {
    return NextResponse.json({ error: 'Players cannot upload film' }, { status: 403 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideofile', 'video/webm']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type: ${file.type}. Allowed: MP4, MOV, AVI, WebM` },
        { status: 400 }
      )
    }

    // Max 500MB
    if (file.size > 500 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Max 500MB.' },
        { status: 400 }
      )
    }

    // Upload to R2
    const fileExtension = file.name.split('.').pop() || 'mp4'
    const key = `film/${randomUUID()}.${fileExtension}`
    const buffer = Buffer.from(await file.arrayBuffer())

    await s3Client.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
        Body: buffer,
        ContentType: file.type,
      })
    )

    // Build the public URL (R2 custom domain or Cloudflare CDN)
    const publicUrl = `${R2_ENDPOINT.replace('.cloudflarestorage.com', '')}/${R2_BUCKET}/${key}`

    return NextResponse.json({
      url: publicUrl,
      key,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      uploadedAt: new Date().toISOString(),
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[upload-video] error:', msg)
    return NextResponse.json(
      { error: msg },
      { status: 500 }
    )
  }
}
