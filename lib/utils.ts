import { google } from "googleapis";
import { AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET } from "../configs";

const getOAuth2Client = (refreshToken: string) => {
  const oauth2Client = new google.auth.OAuth2(
    AUTH_GOOGLE_ID,
    AUTH_GOOGLE_SECRET
  );

  oauth2Client.setCredentials({ refresh_token: refreshToken });

  return oauth2Client;
};

export const getDrive = (refreshToken: string) => {
  const oauth2Client = getOAuth2Client(refreshToken as string);
  const drive = google.drive({ version: "v3", auth: oauth2Client });

  return drive;
};
