import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { createNoteSchema } from "@/lib/notesValidation";

export async function GET(req: Request) {
  try {
    const user_Id = req.headers.get("x-user-id");

    if (!user_Id) {
      return NextResponse.json(
        {
          message: "no user id",
        },
        {
          status: 401,
        },
      );
    }

    const { searchParams } = new URL(req.url);
    const tag = searchParams.get("tag") || "";
    const q = searchParams.get("q") || "";
    const category = searchParams.get("category") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const notes = await prisma.note.findMany({
      where: {
        userId: user_Id,
        ...(q && {
          OR: [
            {
              title: { contains: q, mode: "insensitive" },
            },
            {
              plainText: { contains: q, mode: "insensitive" },
            },
          ],
        }),
        ...(tag && { tags: { has: tag } }),
        ...(category && {
          category: { equals: category, mode: "insensitive" },
        }),
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: limit,
      skip: skip,
    });

    const total = await prisma.note.count({
      where: {
        userId: user_Id,
        ...(q && {
          OR: [
            {
              title: { contains: q, mode: "insensitive" },
            },
            {
              plainText: { contains: q, mode: "insensitive" },
            },
          ],
        }),
        ...(tag && { tags: { has: tag } }),
        ...(category && {
          category: { equals: category, mode: "insensitive" },
        }),
      },
    });

    return NextResponse.json(
      {
        message: "Notes fetched Successfully",
        notes,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user_id = req.headers.get("x-user-id");

    if (!user_id) {
      return NextResponse.json(
        {
          message: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    const body = await req.json();

    const validation = createNoteSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { errors: validation.error.issues },
        { status: 400 },
      );
    }

    const note = await prisma.note.create({
      data: {
        userId: user_id,
        ...validation.data,
      },
    });

    return NextResponse.json(
      {
        message: "Notes created successfully",
        note,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ message }, { status: 500 });
  }
}
