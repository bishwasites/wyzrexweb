import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { getSession } from "@/lib/session";
import { ALLOWED_UPLOAD_TYPES, MAX_UPLOAD_SIZE_BYTES } from "@/lib/blob";

// Issues short-lived client tokens so admin uploads go straight from the
// browser to Vercel Blob (@vercel/blob/client's upload()), bypassing this
// function's request-body size limit entirely for large video files.
export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  // This route is hit twice per upload: once by the admin's own browser to
  // request a token ("blob.generate-client-token", carries the session
  // cookie), and once by Vercel Blob's servers, server-to-server, to confirm
  // the upload finished ("blob.upload-completed") — that second call carries
  // no cookie at all. Requiring a session unconditionally made every upload
  // hang: the browser's upload() call waits on this completion webhook to
  // succeed before resolving, but the webhook was getting bounced with 401
  // before handleUpload ever saw it, so progress stalled just short of 100%
  // and the form's hidden url field never got set. handleUpload() verifies
  // the completion callback is genuinely from Vercel itself (via the
  // deployment's BLOB_READ_WRITE_TOKEN), so it doesn't need our session
  // check too — only the token-issuing step, which is what actually gates
  // who can start an upload, does.
  if (body.type === "blob.generate-client-token") {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

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
