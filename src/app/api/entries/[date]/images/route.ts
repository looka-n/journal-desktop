import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "@/lib/s3";
import { dynamo } from "@/lib/dynamo";
import { GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ date: string }> }
) {
    const { date } = await params;

    const formData = await request.formData();
    const files = formData.getAll("images") as File[];

    const uploadedUrls: string[] = [];

    for (const file of files) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const key = `${date}/${Date.now()}-${file.name}`;

        await s3.send(new PutObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME!,
            Key: key,
            Body: buffer,
            ContentType: file.type,
        }));

        const url = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
        uploadedUrls.push(url);
    }

    // fetch existing images and append new ones
    const existing = await dynamo.send(new GetCommand({
        TableName: "journal_entries",
        Key: { date },
    }));

    const existingImages: string[] = existing.Item?.images ?? [];
    const allImages = [...existingImages, ...uploadedUrls];

    await dynamo.send(new UpdateCommand({
        TableName: "journal_entries",
        Key: { date },
        UpdateExpression: "SET images = :images",
        ExpressionAttributeValues: { ":images": allImages },
    }));

    return NextResponse.json({ urls: uploadedUrls });
}
