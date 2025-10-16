import React from 'react';

interface UserAvatarProps {
  user: {
    firstName?: string;
    lastName?: string;
    username?: string;
    profilePhoto?: string;
  } | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export default function UserAvatar({ user, size = 'md', className = '' }: UserAvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-lg',
    lg: 'w-16 h-16 text-xl',
    xl: 'w-24 h-24 text-2xl'
  };

  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return (user.firstName.charAt(0) + user.lastName.charAt(0)).toUpperCase();
    }
    if (user?.firstName) {
      return user.firstName.charAt(0).toUpperCase();
    }
    if (user?.username) {
      return user.username.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const getDisplayName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user?.firstName) {
      return user.firstName;
    }
    if (user?.username) {
      return user.username;
    }
    return 'User';
  };

  if (user?.profilePhoto) {
    return (
      <div className={`${sizeClasses[size]} rounded-full overflow-hidden bg-emerald-100 flex items-center justify-center ${className}`}>
        <img
          src={user.profilePhoto}
          alt={getDisplayName()}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback to initials if image fails to load
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent) {
              parent.innerHTML = `<span class="text-emerald-600 font-semibold">${getInitials()}</span>`;
            }
          }}
        />
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} bg-emerald-100 rounded-full flex items-center justify-center ${className}`}>
      <span className="text-emerald-600 font-semibold">
        {getInitials()}
      </span>
    </div>
  );
}
