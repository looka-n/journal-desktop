import { NextRequest, NextResponse } from "next/server";
import { PutCommand, GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
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
    return NextResponse.json({
        title: result.Item?.title ?? "",
        content: result.Item?.content ?? "",
        images: result.Item?.images ?? [],
        favorite: result.Item?.favorite ?? false,
    });
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ date: string }> }
) {
    const { date } = await params;
    const { title, content, images } = await request.json();
    await dynamo.send(new PutCommand({
        TableName: "journal_entries",
        Item: { date, title, content, images: images ?? [] },
    }));
    return NextResponse.json({ success: true });
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ date: string }> }
) {
    const { date } = await params;
    const { favorite } = await request.json();
    await dynamo.send(new UpdateCommand({
        TableName: "journal_entries",
        Key: { date },
        UpdateExpression: "SET favorite = :favorite",
        ExpressionAttributeValues: { ":favorite": favorite },
    }));
    return NextResponse.json({ success: true });
}
