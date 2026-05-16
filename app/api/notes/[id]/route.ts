import { updateNoteSchema } from "@/lib/notesValidation";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user_id = req.headers.get("x-user-id");
    const { id } = await params;

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

    const validation = updateNoteSchema.safeParse(body);

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

    await prisma.note.update({
      where: {
        userId: user_id,
        id: id,
      },
      data: {
        ...validation.data,
      },
    });

    return NextResponse.json(
      {
        message: "Updated Successfully",
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

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user_id = req.headers.get("x-user-id");
    const { id } = await params;

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

    const note = await prisma.note.findFirst({
      where: {
        userId: user_id,
        id: id,
      },
    });

    if (!note) {
      return NextResponse.json({ message: "Note not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        message: "Fetched Successfully",
        note,
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

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user_id = req.headers.get("x-user-id");
    const { id } = await params;

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

    await prisma.note.delete({
      where: {
        userId: user_id,
        id: id,
      },
    });

    return NextResponse.json(
      {
        message: "Deleted Successfully",
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
