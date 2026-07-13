import { NextResponse } from "next/server";

const TABLE_NAME = "New images for portal";
const MAX_IMAGE_SIZE = 4.9 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);

function requiredText(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function optionalText(formData: FormData, key: string): string | undefined {
  const value = requiredText(formData, key);
  return value || undefined;
}

function getAirtableConfig() {
  const token =
    process.env.AIRTABLE_API_KEY ??
    process.env.AIRTABLE_TOKEN ??
    process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN;
  const baseId =
    process.env.AIRTABLE_IMAGE_SUBMISSIONS_BASE_ID ??
    process.env.AIRTABLE_BASE_ID;
  const tableName =
    process.env.AIRTABLE_IMAGE_SUBMISSIONS_TABLE_ID ??
    process.env.AIRTABLE_IMAGE_SUBMISSIONS_TABLE_NAME ??
    TABLE_NAME;

  if (!token || !baseId) {
    throw new Error("Airtable is not configured for image submissions.");
  }

  return { token, baseId, tableName };
}

async function airtableRequest({
  token,
  baseId,
  tableName,
  body,
}: {
  token: string;
  baseId: string;
  tableName: string;
  body: unknown;
}) {
  const response = await fetch(
    `https://api.airtable.com/v0/${encodeURIComponent(baseId)}/${encodeURIComponent(tableName)}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
  );

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      data?.error?.message ??
      data?.error?.type ??
      "Airtable request failed.";
    throw new Error(message);
  }

  return data;
}

async function uploadAirtableAttachment({
  token,
  baseId,
  recordId,
  fieldName,
  body,
}: {
  token: string;
  baseId: string;
  recordId: string;
  fieldName: string;
  body: unknown;
}) {
  const response = await fetch(
    `https://content.airtable.com/v0/${encodeURIComponent(baseId)}/${encodeURIComponent(recordId)}/${encodeURIComponent(fieldName)}/uploadAttachment`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
  );

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      data?.error?.message ??
      data?.error?.type ??
      "Airtable attachment upload failed.";
    throw new Error(message);
  }

  return data;
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") ?? "";
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        { error: "Multipart form data is required." },
        { status: 400 },
      );
    }

    const formData = await request.formData();
    const image = formData.get("primaryBottleImage");

    if (!(image instanceof File)) {
      return NextResponse.json({ error: "Image is required." }, { status: 400 });
    }

    if (!ALLOWED_IMAGE_TYPES.has(image.type)) {
      return NextResponse.json(
        { error: "Please upload a PNG, JPG, or WEBP image." },
        { status: 400 },
      );
    }

    if (image.size > MAX_IMAGE_SIZE) {
      return NextResponse.json(
        { error: "Image must be 4.9 MB or less." },
        { status: 400 },
      );
    }

    const { token, baseId, tableName } = getAirtableConfig();
    const permissionConfirmed = formData.get("permissionConfirmed") === "on";

    if (!permissionConfirmed) {
      return NextResponse.json(
        { error: "Image permission confirmation is required." },
        { status: 400 },
      );
    }

    const fields = {
      "Olive oil name": requiredText(formData, "oilName"),
      "Company name": optionalText(formData, "producerName"),
      Email: requiredText(formData, "contactEmail"),
    };

    if (!fields["Olive oil name"] || !fields.Email) {
      return NextResponse.json(
        { error: "Missing required submission details." },
        { status: 400 },
      );
    }

    const created = await airtableRequest({
      token,
      baseId,
      tableName,
      body: { fields, typecast: true },
    });

    const recordId = created?.id;
    if (!recordId) {
      throw new Error("Airtable did not return a record ID.");
    }

    const arrayBuffer = await image.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    await uploadAirtableAttachment({
      token,
      baseId,
      recordId,
      fieldName: "Attachments",
      body: {
        contentType: image.type,
        file: base64,
        filename: image.name,
      },
    });

    return NextResponse.json({ ok: true, id: recordId });
  } catch (error) {
    console.error("Bottle image submission failed:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not submit image.",
      },
      { status: 500 },
    );
  }
}
