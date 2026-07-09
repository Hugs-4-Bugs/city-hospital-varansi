import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser, verifyPassword, hashPassword, validatePasswordStrength } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Current password and new password are required' },
        { status: 400 }
      );
    }

    // Fetch the user with password hash
    const user = await db.user.findUnique({
      where: { id: authUser.id },
      select: { id: true, passwordHash: true, authProvider: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Users who signed up via Google may not have a password
    if (!user.passwordHash) {
      return NextResponse.json(
        { error: 'No password set for this account. Please set up a password first.' },
        { status: 400 }
      );
    }

    // Verify current password
    const isValid = await verifyPassword(currentPassword, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 401 }
      );
    }

    // Validate new password strength
    const strengthCheck = validatePasswordStrength(newPassword);
    if (!strengthCheck.valid) {
      return NextResponse.json(
        { error: 'Password does not meet requirements', details: strengthCheck.errors },
        { status: 400 }
      );
    }

    // Hash and update
    const hashedPassword = await hashPassword(newPassword);
    await db.user.update({
      where: { id: authUser.id },
      data: { passwordHash: hashedPassword },
    });

    return NextResponse.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json(
      { error: 'Failed to change password' },
      { status: 500 }
    );
  }
}
