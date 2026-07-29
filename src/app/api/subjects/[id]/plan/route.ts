import { NextResponse } from "next/server";

interface RequestBody {
  target_days?: number;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = (await request.json()) as RequestBody;
    const { target_days } = body;

    return NextResponse.json({ success: true, id, target_days });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update plan" }, { status: 500 });
  }
}