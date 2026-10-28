'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Lock, Trash2, LogOut, ShieldCheck, Check, AlertCircle, Package } from 'lucide-react';
import { accountService } from '@/api/account';
import { useAuthStore } from '@/store/useAuthStore';
import { useThemeStore } from '@/store/useThemeStore';
import { translations } from '@/utils/translations';
import ShimmerBadge from '@/components/ui/ShimmerBadge';

export default function AccountPage() {
  const router = useRouter();
  const { user, isAuthenticated, isAdmin, updateUser, logout } = useAuthStore();
  const { language } = useThemeStore();
  const t = translations[language];

  // Profile Form
  const [displayName, setDisplayName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Password Form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [passSuccess, setPassSuccess] = useState(false);
  const [passError, setPassError] = useState<string | null>(null);

  // Delete Account Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (user) {
      setDisplayName(user.displayName || '');
      setPhoneNumber(user.phoneNumber || '');
    }
  }, [isAuthenticated, user, router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsUpdatingProfile(true);
      const updated = await accountService.updateProfile({ displayName, phoneNumber });
      updateUser(updated);
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch {
      alert('Failed to update profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsChangingPass(true);
      setPassError(null);
      await accountService.changePassword({ currentPassword, newPassword });
      setPassSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setTimeout(() => setPassSuccess(false), 3000);
    } catch (err: unknown) {
      setPassError(err instanceof Error ? err.message : 'Failed to change password. Verify current password.');
    } finally {
      setIsChangingPass(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) return;
    try {
      setIsDeleting(true);
      setDeleteError(null);
      await accountService.deleteAccount(deletePassword);
      logout();
      router.push('/');
    } catch (err: unknown) {
      setDeleteError(err instanceof Error ? err.message : 'Incorrect password');
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-10">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-6 border-b border-[var(--border-subtle)]">
        <div>
          <ShimmerBadge icon={<User className="w-3.5 h-3.5" />}>
            {t.account.title}
          </ShimmerBadge>
          <h1 className="font-serif text-3xl font-light text-[var(--text-primary)] mt-2">
            {t.account.greeting}, {user?.displayName}
          </h1>
          <p className="text-xs text-[var(--text-secondary)]">{user?.email}</p>
        </div>

        <div className="flex items-center gap-3 self-start flex-wrap">
          <Link
            href="/orders"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--accent-gold)] text-black font-bold text-xs shadow-md hover:brightness-105 transition-all"
          >
            <Package className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'سجل طلباتي (My Orders)' : 'My Orders'}</span>
          </Link>

          {isAdmin && (
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--bg-secondary)] border border-[var(--accent-gold)]/40 text-[var(--accent-gold)] font-bold text-xs shadow-sm hover:bg-[var(--accent-gold)]/10 transition-all"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>لوحة الإدارة (Admin)</span>
            </Link>
          )}

          <button
            onClick={() => {
              logout();
              router.push('/');
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 text-xs font-semibold transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{t.nav.logout}</span>
          </button>
        </div>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Personal Details Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-5 shadow-sm">
          <h2 className="font-serif text-xl font-light text-[var(--text-primary)] flex items-center gap-2">
            <User className="w-5 h-5 text-[var(--accent-gold)]" />
            <span>{t.account.tabs.profile}</span>
          </h2>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-[var(--text-secondary)] font-semibold mb-1">
                {t.auth.displayName}
              </label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] focus:border-[var(--accent-gold)] rounded-xl px-4 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[var(--text-secondary)] font-semibold mb-1">
                {t.auth.phone}
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] focus:border-[var(--accent-gold)] rounded-xl px-4 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none"
              />
            </div>

            {profileSuccess && (
              <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                <span>Profile updated successfully</span>
              </p>
            )}

            <button
              type="submit"
              disabled={isUpdatingProfile}
              className="w-full py-3 rounded-full bg-[var(--accent-gold)] text-black font-bold text-xs uppercase tracking-wider hover:bg-[var(--accent-bronze)] hover:text-white transition-colors"
            >
              {isUpdatingProfile ? 'Saving...' : t.account.updateProfile}
            </button>
          </form>
        </div>

        {/* Security / Password Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-5 shadow-sm">
          <h2 className="font-serif text-xl font-light text-[var(--text-primary)] flex items-center gap-2">
            <Lock className="w-5 h-5 text-[var(--accent-gold)]" />
            <span>{t.account.tabs.security}</span>
          </h2>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-[var(--text-secondary)] font-semibold mb-1">
                Current Password
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] focus:border-[var(--accent-gold)] rounded-xl px-4 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[var(--text-secondary)] font-semibold mb-1">
                New Password
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] focus:border-[var(--accent-gold)] rounded-xl px-4 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none"
              />
            </div>

            {passSuccess && (
              <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                <span>Password changed securely</span>
              </p>
            )}
            {passError && <p className="text-xs text-rose-400">{passError}</p>}

            <button
              type="submit"
              disabled={isChangingPass}
              className="w-full py-3 rounded-full border border-[var(--border-subtle)] text-[var(--text-primary)] hover:border-[var(--accent-gold)] hover:text-[var(--accent-gold)] font-bold text-xs uppercase tracking-wider transition-colors"
            >
              {isChangingPass ? 'Updating...' : t.account.changePassword}
            </button>
          </form>

          {/* Danger Zone */}
          <div className="pt-6 border-t border-rose-500/20">
            <button
              onClick={() => setDeleteModalOpen(true)}
              className="text-xs text-rose-400/80 hover:text-rose-400 flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t.account.deleteAccount}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="bg-[var(--bg-surface)] border border-rose-500/40 rounded-2xl p-6 sm:p-8 max-w-md w-full space-y-4">
            <h3 className="font-serif text-xl font-bold text-rose-400">
              Confirm Account Deletion
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              This action is permanent and will remove all your atelier order records. Please confirm your password to proceed.
            </p>
            <input
              type="password"
              placeholder="Enter current password..."
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl p-3 text-xs text-[var(--text-primary)] focus:outline-none"
            />
            {deleteError && <p className="text-xs text-rose-400">{deleteError}</p>}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="flex-1 py-2.5 rounded-full border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)]"
              >
                Cancel
              </button>
              <button
                disabled={isDeleting || !deletePassword}
                onClick={handleDeleteAccount}
                className="flex-1 py-2.5 rounded-full bg-rose-600 text-white font-bold text-xs uppercase tracking-wider disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
