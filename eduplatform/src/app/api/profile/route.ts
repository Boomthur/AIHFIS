import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    select: { id: true, name: true, email: true, role: true, bio: true, avatarUrl: true },
  });

  return NextResponse.json(profile);
}

export async function PUT(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const name = formData.get("name") as string;
    const bio = formData.get("bio") as string;
    const avatarFile = formData.get("avatar") as File | null;

    const updateData: Record<string, string> = {};
    if (name) updateData.name = name;
    if (bio !== null) updateData.bio = bio;

    if (avatarFile && avatarFile.size > 0) {
      const ext = avatarFile.name.split(".").pop() || "jpg";
      const filename = `${randomUUID()}.${ext}`;
      const uploadDir = join(process.cwd(), "public", "uploads", "avatars");
      await mkdir(uploadDir, { recursive: true });
      const bytes = await avatarFile.arrayBuffer();
      await writeFile(join(uploadDir, filename), Buffer.from(bytes));
      updateData.avatarUrl = `/uploads/avatars/${filename}`;
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
      select: { id: true, name: true, email: true, role: true, bio: true, avatarUrl: true },
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Erro ao atualizar perfil" }, { status: 500 });
  }
}
