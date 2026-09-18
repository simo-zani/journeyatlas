import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ImagePlus, Loader2, Pencil, X } from 'lucide-react';
import { Modal } from '@/components/Modal';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Alert } from '@/components/Alert';
import { checkUsernameAvailable, updateProfile } from '@/lib/api';
import { compressImage } from '@/lib/image';
import { supabase } from '@/lib/supabase';

const USERNAME_PATTERN = /^[A-Za-z0-9_.-]+$/;

interface EditProfileModalProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  email: string;
  currentAvatarUrl: string | null;
  currentUsername: string | null;
  onSaved: (next: { avatarUrl: string | null; username: string }) => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  open,
  onClose,
  userId,
  email,
  currentAvatarUrl,
  currentUsername,
  onSaved,
}) => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const usernameInputRef = useRef<HTMLInputElement>(null);

  // Avatar + username
  const [preview, setPreview] = useState<string | null>(currentAvatarUrl);
  const [file, setFile] = useState<File | null>(null);
  const [avatarRemoved, setAvatarRemoved] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [username, setUsername] = useState(currentUsername ?? '');
  const [usernameEditing, setUsernameEditing] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  // Password
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // The modal mounts as soon as a user is logged in, well before the
  // profile finishes loading — so the useState initializers above only see
  // stale (null) values. Re-sync every time the modal is actually opened,
  // by which point the profile has had time to load.
  useEffect(() => {
    if (!open) return;
    setPreview(currentAvatarUrl);
    setFile(null);
    setAvatarRemoved(false);
    setUsername(currentUsername ?? '');
    setUsernameEditing(false);
    setProfileError(null);
    setShowPasswordFields(false);
    setNewPassword('');
    setConfirmNewPassword('');
    setPasswordError(null);
    setPasswordSuccess(false);
  }, [open, currentAvatarUrl, currentUsername]);

  const handleFileSelect = (selected: File | null) => {
    setProfileError(null);
    if (!selected) return;
    if (selected.size > 5 * 1024 * 1024) {
      setProfileError(t('trip.coverTooLarge'));
      return;
    }
    setFile(selected);
    setAvatarRemoved(false);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(selected);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files?.[0] ?? null);
  };

  const handleRemoveAvatar = () => {
    setFile(null);
    setPreview(null);
    setAvatarRemoved(true);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const resetPasswordSection = () => {
    setShowPasswordFields(false);
    setNewPassword('');
    setConfirmNewPassword('');
    setPasswordError(null);
    setPasswordSuccess(false);
  };

  const handleSaveProfile = async () => {
    setProfileError(null);
    const trimmedUsername = username.trim();

    if (!USERNAME_PATTERN.test(trimmedUsername)) {
      setProfileError(t('auth.errors.usernameInvalid'));
      return;
    }

    setSavingProfile(true);
    try {
      if (trimmedUsername.toLowerCase() !== (currentUsername ?? '').toLowerCase()) {
        const available = await checkUsernameAvailable(trimmedUsername);
        if (!available) {
          setProfileError(t('auth.errors.usernameTaken'));
          return;
        }
      }

      let nextAvatarUrl: string | null = currentAvatarUrl;

      if (file) {
        // Always re-encoded to at most 500KB — the avatar only ever shows up
        // small, so there is no point keeping the original resolution/size,
        // and the 5MB accept limit above is just what we'll take as input.
        const compressed = await compressImage(file);
        const path = `${userId}/avatar-${Date.now()}.jpg`;
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(path, compressed, { contentType: 'image/jpeg', upsert: true });
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from('avatars').getPublicUrl(path);
        nextAvatarUrl = data.publicUrl;
      } else if (avatarRemoved) {
        nextAvatarUrl = null;
      }

      await updateProfile(userId, { avatar_url: nextAvatarUrl, username: trimmedUsername });
      onSaved({ avatarUrl: nextAvatarUrl, username: trimmedUsername });
      onClose();
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordError(null);
    setPasswordSuccess(false);

    if (newPassword.length < 6) {
      setPasswordError(t('auth.errors.passwordTooShort'));
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordError(t('auth.errors.passwordMismatch'));
      return;
    }

    setChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setPasswordSuccess(true);
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={() => {
        resetPasswordSection();
        onClose();
      }}
      title={t('profile.title')}
      maxWidth="max-w-sm"
    >
      {showPasswordFields ? (
        <div className="space-y-4">
          <Input
            label={t('profile.newPassword')}
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
          />
          <Input
            label={t('profile.confirmNewPassword')}
            type="password"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            autoComplete="new-password"
          />

          {passwordError && <Alert type="error" message={passwordError} onClose={() => setPasswordError(null)} />}
          {passwordSuccess && <Alert type="success" message={t('profile.passwordUpdated')} />}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="tertiary" size="sm" onClick={resetPasswordSection}>
              {t('common.cancel')}
            </Button>
            <Button type="button" size="sm" onClick={handleChangePassword} disabled={changingPassword}>
              {changingPassword && <Loader2 className="w-4 h-4 animate-spin" />}
              {t('profile.updatePassword')}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          {preview ? (
            <div className="relative w-40 h-40">
              <img
                src={preview}
                alt=""
                className="w-40 h-40 rounded-full object-cover border border-slate-200 dark:border-white/10 shadow-inner"
              />
              <button
                type="button"
                onClick={handleRemoveAvatar}
                className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-black/70 hover:bg-black/90 text-white flex items-center justify-center transition-all cursor-pointer shadow-lg hover:scale-105 active:scale-95"
                title={t('common.remove')}
              >
                <X className="w-4 h-4" strokeWidth={2.5} />
              </button>
            </div>
          ) : (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`w-40 h-40 flex flex-col items-center justify-center gap-2 rounded-full border-2 border-dashed cursor-pointer transition-all duration-200 text-center p-4 ${
                isDragging
                  ? 'border-gold bg-gold/10 scale-[0.99]'
                  : 'border-slate-300 dark:border-white/15 hover:border-gold/70 hover:bg-slate-900/[0.02] dark:hover:bg-white/[0.02]'
              }`}
            >
              <ImagePlus className="w-14 h-14 text-gold" strokeWidth={1.5} />
              <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                {t('profile.dropPhoto')}
              </p>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)}
          />

          <p className="text-xs text-slate-500 dark:text-slate-400">{email}</p>

          {/* Minimal handle-style username: "@" is a static prefix, never part
              of the editable value. Read-only until the pencil is clicked —
              that's the only affordance that it can be changed at all. */}
          <div className="flex items-center gap-1 text-lg">
            <span className="italic text-slate-400 dark:text-slate-500">@</span>
            {usernameEditing ? (
              <input
                ref={usernameInputRef}
                value={username}
                onChange={(e) => setUsername(e.target.value.replace(/[^A-Za-z0-9_.-]/g, ''))}
                onBlur={() => setUsernameEditing(false)}
                autoFocus
                required
                autoComplete="username"
                aria-label={t('auth.username')}
                size={Math.max(username.length, 1)}
                className="italic font-semibold text-slate-900 dark:text-slate-100 bg-transparent border-b border-gold outline-none py-0.5"
              />
            ) : (
              <span className="italic font-semibold text-slate-900 dark:text-slate-100">{username}</span>
            )}
            <button
              type="button"
              onClick={() => {
                setUsernameEditing(true);
                requestAnimationFrame(() => usernameInputRef.current?.focus());
              }}
              className="p-1 rounded-lg text-slate-400 hover:text-gold hover:bg-gold/10 transition-colors cursor-pointer"
              title={t('auth.username')}
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="w-full space-y-3">
            {profileError && <Alert type="error" message={profileError} onClose={() => setProfileError(null)} />}

            <Button type="button" className="w-full" onClick={handleSaveProfile} disabled={savingProfile}>
              {savingProfile && <Loader2 className="w-4 h-4 animate-spin" />}
              {t('common.save')}
            </Button>
          </div>

          <div className="w-full pt-3 border-t border-slate-200/60 dark:border-white/5">
            <Button type="button" variant="tertiary" className="w-full" onClick={() => setShowPasswordFields(true)}>
              {t('profile.changePassword')}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};
