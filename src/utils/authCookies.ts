import { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { cookies } from "next/headers";

const thirtyDaysInSeconds = 30 * 24 * 60 * 60;
const oneHourInSeconds = 60 * 60;

const commonCookieOptions: Omit<ResponseCookie, "name" | "value"> = {
  httpOnly: true,
  path: "/",
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
};

export async function setAuthCookies(
  accessToken: string,
  refreshToken: string
) {
  const cookieSetter = await cookies();

  cookieSetter.set("sb-access-token", accessToken, {
    ...commonCookieOptions,
    maxAge: oneHourInSeconds,
  });

  cookieSetter.set("sb-refresh-token", refreshToken, {
    ...commonCookieOptions,
    maxAge: thirtyDaysInSeconds,
  });
}

export async function clearAuthCookies() {
  const cookieClearer = await cookies();

  const clearOptions: Omit<ResponseCookie, "name" | "value"> & {
    maxAge: number;
  } = {
    ...commonCookieOptions,
    maxAge: 0,
  };
  cookieClearer.set("sb-access-token", "", clearOptions);
  cookieClearer.set("sb-refresh-token", "", clearOptions);
}

// This one IS async because reading cookies from the request can be async
export async function getAccessTokenFromCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get("sb-access-token");

  return tokenCookie?.value;
}

export async function getRefreshTokenFromCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get("sb-refresh-token");

  return tokenCookie?.value;
}
