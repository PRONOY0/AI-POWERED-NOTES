import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  const exactPublic = ["/"];
  const prefixPublic = [
    "/api/auth/login",
    "/api/auth/signup",
    "/api/shared",
    "/shared",
    "/login",
    "/signup",
  ];

  if (
    exactPublic.includes(pathname) ||
    prefixPublic.some((route) => pathname.startsWith(route))
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get("token")?.value;

  console.log(token);

  if (!token) {
    return NextResponse.json(
      {
        message: "Unauthorized",
      },
      {
        status: 401,
      },
    );
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

    const { payload } = await jwtVerify(token, secret);

    const reqHeaders = new Headers(req.headers);

    reqHeaders.set("x-user-id", payload.id as string);
    reqHeaders.set("x-user-email", payload.email as string);

    return NextResponse.next({
      request: {
        headers: reqHeaders,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal Server Error";

    return NextResponse.json(
      {
        message,
      },
      {
        status: 401,
      },
    );
  }
}

export const config = {
  matcher: ["/((?!_next|favicon.ico).*)"],
};
