import { NextRequest, NextResponse } from "next/server";
import { PutCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { dynamo } from "@/lib/dynamo";

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ date: string }> }
) {
    const { date } = await params;

    const result = await dynamo.send(new GetCommand({
        TableName: "journal_entries",
        Key: { date },
    }));

    return NextResponse.json({ content: result.Item?.content ?? "" });
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ date: string }> }
) {
    const { date } = await params;
    const { content } = await request.json();

    await dynamo.send(new PutCommand({
        TableName: "journal_entries",
        Item: { date, content },
    }));

    return NextResponse.json({ success: true });
}
