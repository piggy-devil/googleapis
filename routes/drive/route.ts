import { Context } from "hono";
import { PassThrough } from "stream";
import { getDrive } from "../../lib/utils";

const createBufferStreamFromFile = async (file: File): Promise<PassThrough> => {
  const arrayBuffer = await file.arrayBuffer(); // Convert file to array buffer
  const imageBuffer = Buffer.from(arrayBuffer); // Create a buffer from the array buffer
  const bufferStream = new PassThrough(); // Create a PassThrough stream and end it with the buffer content
  bufferStream.end(imageBuffer);

  return bufferStream;
};

export const handleCreateFile = async (c: Context) => {
  const formData = await c.req.parseBody();
  const file = formData.file as File;
  const refreshToken = formData.refreshToken as string;
  const defaultDriveId = formData.defaultDriveId as string;

  // Validate file
  if (!file || !(file instanceof File)) {
    return c.json(
      {
        success: false,
        message: "No file uploaded",
      },
      400
    );
  }

  const drive = getDrive(refreshToken);
  const bufferStream = await createBufferStreamFromFile(file);

  try {
    const response = await drive.files.create({
      requestBody: {
        name: file.name,
        mimeType: file.type,
        parents: defaultDriveId ? [defaultDriveId] : [],
      },
      media: {
        mimeType: file.type,
        body: bufferStream,
      },
      fields: "id",
      supportsAllDrives: true,
    });

    if (!response.data.id) {
      return c.json(
        {
          success: false,
          message: "Failed to get file ID from Google Drive response",
        },
        { status: 400 }
      );
    }

    // Set public permission
    await drive.permissions.create({
      fileId: response.data.id,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
    });

    return c.json(
      {
        success: true,
        message: "File uploaded successfully",
        fileId: response.data.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Upload error:", error);
    return c.json(
      {
        success: false,
        message: "Upload failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      500
    );
  }
};

// Delete File
export const handleDeleteFile = async (c: Context) => {
  try {
    const formData = await c.req.parseBody();
    const refreshToken = formData.refreshToken as string;
    const fileId = formData.fileId as string;

    const drive = getDrive(refreshToken);

    await drive.files.delete({ fileId: fileId as string });

    return c.json({ success: true, message: "File deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    return c.json(
      {
        success: false,
        message: "Delete failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      500
    );
  }
};
