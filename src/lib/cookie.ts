import { isBrowser } from '$/lib/client';

// GET COOKIE
export const getCookie = (name: string): string => {
  if (isBrowser) {
    // browser environment
    let cookieName: string = name + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca: string[] = decodedCookie.split(";");
    for (let i = 0; i < ca.length; i++) {
      let c: string = ca[i];
      while (c.charAt(0) == " ") {
        c = c.substring(1);
      }
      if (c.indexOf(cookieName) == 0) {
        return c.substring(cookieName.length, c.length);
      }
    }
  }
  return null;
};

// SET COOKIE
export const setCookie = (
  name: string,
  value: string,
  exphours: number = 10000,
  secure: boolean = true,
  path: string = "/",
): void => {
  if (isBrowser) {
    // browser environment
    const d: Date = new Date();
    d.setTime(d.getTime() + exphours * 60 * 60 * 1000);
    let cookie: string = `${name}=${value};expires=${d.toUTCString()};path=${path}`;
    if (secure) {
      document.cookie = `${cookie};secure`;
    } else {
      document.cookie = cookie;
    }
  }
};

// DELETE COOKIE
export const deleteCookie = (name: string, path: string = "/"): void => {
  if (isBrowser) {
    // browser environment
    document.cookie = `${name}=;path=${path}; Max-Age=-99999999;`;
  }
};

export const parseCookieHeader = (header: string): Record<string, string> => {
  const cookies = {};
  if (!!!header) return cookies;
  const arr = header.split(",").map((ck) => {
    const cookie = ck.trim().split(";")[0].split("=");
    cookies[cookie[0]] = cookie[1];
    return {
      [cookie[0]]: cookie[1],
    };
  });
  return cookies;
};
