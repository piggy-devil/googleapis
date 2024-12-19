import { Context } from "hono";
import { getDrive } from "../../lib/utils";

// Create Folder
export const handleCreateFolder = async (c: Context) => {
  const formData = await c.req.parseBody();

  const refreshToken = formData.refreshToken as string;
  const folderName = formData.folderName as string;

  if (!folderName || !refreshToken || typeof refreshToken !== "string") {
    return c.json(
      {
        success: false,
        message:
          "Missing required fields: folderName or refreshToken must be provided",
      },
      400
    );
  }

  const drive = getDrive(refreshToken);

  try {
    // Create the folder
    const response = await drive.files.create({
      requestBody: {
        name: folderName,
        mimeType: "application/vnd.google-apps.folder",
      },
      fields: "id, name",
      supportsAllDrives: true,
    });

    if (!response.data.id) {
      return c.json(
        {
          success: false,
          message: "Failed to get folder ID from Google Drive response",
        },
        { status: 400 }
      );
    }

    return c.json(
      {
        success: true,
        message: "Folder created successfully",
        folderId: response.data.id,
        // folderName: response.data.name!,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Folder created error:", error);
    return c.json(
      {
        success: false,
        message: "Folder created failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      500
    );
  }
};

// Delete Folder
export const handleDeleteFolder = async (c: Context) => {
  try {
    const formData = await c.req.parseBody();
    const refreshToken = formData.refreshToken as string;
    const folderId = formData.folderId as string;

    if (!folderId || !refreshToken || typeof refreshToken !== "string") {
      return c.json(
        {
          success: false,
          message:
            "Missing required fields: folderId or refreshToken must be provided",
        },
        400
      );
    }

    const drive = getDrive(refreshToken);

    await drive.files.delete({
      fileId: folderId as string,
      supportsAllDrives: true,
    });

    return c.json({ success: true, message: "Folder deleted successfully" });
  } catch (error) {
    console.error("Folder deleted error:", error);
    return c.json(
      {
        success: false,
        message: "Folder deleted failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      500
    );
  }
};
