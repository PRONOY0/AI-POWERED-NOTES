import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const user_Id = req.headers.get("x-user-id");

    if (!user_Id) {
      return NextResponse.json(
        {
          message: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    const totalNotes = await prisma.note.count({
      where: {
        userId: user_Id,
      },
    });

    const recentlyEditedNotes = await prisma.note.findMany({
      where: {
        userId: user_Id,
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: 8,
      select: {
        id: true,
        title: true,
        updatedAt: true,
        tags: true,
      },
    });

    const aiUsageTotal = await prisma.note.aggregate({
      where: {
        userId: user_Id,
      },
      _sum: { aiUsageCount: true },
    });

    const notesWithAiSummary = await prisma.note.count({
      where: {
        userId: user_Id,
        NOT: {
          aiUsageCount: 0,
        },
      },
    });

    const allNotes = await prisma.note.findMany({
      where: {
        userId: user_Id,
      },
      select: {
        tags: true,
      },
    });

    const tagCount: Record<string, number> = {};

    allNotes.forEach((note) => {
      note.tags.forEach((tag) => {
        tagCount[tag] = (tagCount[tag] || 0) + 1;
      });
    });

    const mostUsedTags = Object.entries(tagCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag, count]) => ({ tag, count }));

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const weeklyNotes = await prisma.note.findMany({
      where: {
        userId: user_Id,
        createdAt: { gte: sevenDaysAgo },
      },
      select: {
        createdAt: true,
      },
    });

    const weeklyActivity: Record<string, number> = {};

    weeklyNotes.forEach((note) => {
      const day = note.createdAt.toISOString().split("T")[0];
      weeklyActivity[day] = (weeklyActivity[day] || 0) + 1;
    });

    return NextResponse.json(
      {
        message: "Insights fetched successfully",
        insights: {
          totalNotes,
          recentlyEditedNotes,
          mostUsedTags,
          aiStats: {
            totalAiGenerations: aiUsageTotal._sum.aiUsageCount ?? 0,
            notesWithSummary: notesWithAiSummary,
          },
          weeklyActivity,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ message }, { status: 500 });
  }
}
