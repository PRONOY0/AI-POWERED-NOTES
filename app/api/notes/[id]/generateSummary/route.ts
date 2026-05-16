import { NextResponse } from "next/server";
import groq from "@/lib/groq";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
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

    const { id } = await params;

    const note = await prisma.note.findUnique({
      where: {
        id,
      },
    });

    if (!note) {
      return NextResponse.json(
        {
          message: "Note doesn't exist",
        },
        {
          status: 404,
        },
      );
    }

    const plainText = note.plainText;

    if (!plainText || plainText.trim() === "") {
      return NextResponse.json(
        { message: "Note has no content to summarise" },
        { status: 400 },
      );
    }

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are a helpful assistant. Analyse the given note and respond ONLY with a valid JSON object in this exact format:
          {
          "summary": "brief summary of the note",
          "action_items": ["item 1", "item 2"],
          "suggested_title": "a suitable title"
          }
          No extra text, no markdown, just the JSON.`,
        },
        {
          role: "user",
          content: note.plainText,
        },
      ],
      max_tokens: 500,
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(raw);

    const aiSummary = await prisma.aiSummary.upsert({
      where: { noteId: id },
      update: {
        summary: parsed.summary,
        actionItems: parsed.action_items,
        suggestedTitle: parsed.suggested_title,
      },
      create: {
        noteId: id,
        summary: parsed.summary,
        actionItems: parsed.action_items,
        suggestedTitle: parsed.suggested_title,
      },
    });

    await prisma.note.update({
      where: {
        id,
      },
      data: {
        aiUsageCount: { increment: 1 },
        aiGeneratedAt: new Date(),
      },
    });

    return NextResponse.json(
      {
        message: "Summary generated Successfully",
        aiSummary,
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
