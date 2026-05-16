import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ shareId: string }> },
) {
  try {
    const { shareId } = await params;

    const note = await prisma.note.findUnique({
      where: {
        shareId: shareId,
        isPublic: true,
      },
      include: {
        aiSummary: true,
      },
    });

    if (!note) {
      return NextResponse.json(
        {
          message: "Note not found",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json(
      {
        message: "Note fetched Successfully",
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
