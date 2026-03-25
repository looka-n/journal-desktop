import { NextResponse } from "next/server";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import { dynamo } from "@/lib/dynamo";

export async function GET() {
    const result = await dynamo.send(new ScanCommand({
        TableName: "journal_entries",
        ProjectionExpression: "#d",
        ExpressionAttributeNames: { "#d": "date" },
    }));

    const dates = (result.Items ?? []).map((item) => item.date as string);
    return NextResponse.json({ dates });
}
