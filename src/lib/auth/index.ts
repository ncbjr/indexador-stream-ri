import { db } from "@/lib/db";
import { compare, hash } from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || "fallback-secret-change-in-production"
);

export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
}

export async function hashPassword(password: string): Promise<string> {
  return hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return compare(password, hashedPassword);
}

export async function createSession(userId: string): Promise<string> {
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .setIssuedAt()
    .sign(JWT_SECRET);

  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await db.session.create({
    data: {
      sessionToken: token,
      userId,
      expires,
    },
  });

  return token;
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = payload.userId as string;

    const session = await db.session.findFirst({
      where: {
        sessionToken: token,
        expires: { gt: new Date() },
      },
      include: { user: true },
    });

    if (!session) return null;

    return {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
    };
  } catch {
    return null;
  }
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  if (token) {
    await db.session.deleteMany({
      where: { sessionToken: token },
    });
  }
}

export async function registerUser(
  email: string,
  password: string,
  name?: string
) {
  const existingUser = await db.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error("Email já cadastrado");
  }

  const passwordHash = await hashPassword(password);

  const user = await db.user.create({
    data: {
      email,
      passwordHash,
      name,
    },
  });

  return user;
}

export async function loginUser(email: string, password: string) {
  const user = await db.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error("Credenciais inválidas");
  }

  const isValid = await verifyPassword(password, user.passwordHash);

  if (!isValid) {
    throw new Error("Credenciais inválidas");
  }

  const token = await createSession(user.id);

  return { user, token };
}

