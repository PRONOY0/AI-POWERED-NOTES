import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

const schemaValidation = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Name must be at least 3 characters")
    .max(60, "Name cannot exceed 60 characters"),

  email: z.email("Invalid email address"),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password cannot exceed 100 characters"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const validation = schemaValidation.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          errors: validation.error.issues,
        },
        {
          status: 400,
        },
      );
    }

    const { name, email, password } = validation.data;

    const checkUserExist = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (checkUserExist) {
      return NextResponse.json(
        {
          message: "User already exists",
        },
        {
          status: 409,
        },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const saveUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    const payload = {
      id: saveUser.id,
      email: saveUser.email,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET as string, {
      expiresIn: "7d",
    });

    const response = NextResponse.json(
      {
        message: "Signup successful",
        user: {
          id: saveUser.id,
          name: saveUser.name,
          email: saveUser.email,
        },
      },
      {
        status: 201,
      },
    );

    response.cookies.set("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ message }, { status: 500 });
  }
}
