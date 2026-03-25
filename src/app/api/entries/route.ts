import { NextResponse } from "next/server";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import { dynamo } from "@/lib/dynamo";

export async function GET() {
    const result = await dynamo.send(new ScanCommand({
        TableName: "journal_entries",
    }));

    const entries = (result.Items ?? []).map((item) => ({
        date: item.date as string,
        title: item.title as string ?? "",
        cover: item.images?.[0] ?? null,
    }));

    return NextResponse.json({ entries });
}
