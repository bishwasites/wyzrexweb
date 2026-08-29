import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { getSession } from "@/lib/session";
import { ALLOWED_UPLOAD_TYPES, MAX_UPLOAD_SIZE_BYTES } from "@/lib/blob";

// Issues short-lived client tokens so admin uploads go straight from the
// browser to Vercel Blob (@vercel/blob/client's upload()), bypassing this
// function's request-body size limit entirely for large video files.
export async function POST(request: Request): Promise<NextResponse> {
  // Belt-and-suspenders: middleware.ts already gates every /api/admin/* route.
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ALLOWED_UPLOAD_TYPES,
        addRandomSuffix: true,
        maximumSizeInBytes: MAX_UPLOAD_SIZE_BYTES,
      }),
      onUploadCompleted: async ({ blob }) => {
        console.log("[admin/upload] completed:", blob.url);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
