import { Camera, Loader2 } from 'lucide-react';

function Avatar({ 
  user, 
  size = 'md', 
  editable = false, 
  onClick = null, 
  loading = false, 
  uploadProgress = 0 
}) {
  const imageUrl = user?.profileImage;

  // Resolve tailwind sizing classes
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-24 h-24 text-2xl',
  };

  const currentSizeClass = sizeClasses[size] || sizeClasses.md;

  return (
    <div 
      className={`relative rounded-full select-none shrink-0 overflow-hidden ${currentSizeClass} ${
        editable && !loading ? 'cursor-pointer group' : ''
      }`}
      onClick={editable && !loading && onClick ? onClick : undefined}
    >
      {/* 1. Image or Fallback Symbol */}
      {imageUrl ? (
        <img 
          src={imageUrl} 
          alt={user?.name || 'User Avatar'} 
          className="w-full h-full object-cover rounded-full transition duration-300 group-hover:scale-105"
        />
      ) : (
        <div 
          className="w-full h-full rounded-full bg-gradient-to-br from-gold-light to-gold flex items-center justify-center font-bold text-ink transition duration-300 group-hover:scale-105"
        >
          ₹
        </div>
      )}

      {/* 2. Editable Hover Overlay */}
      {editable && !loading && (
        <div className="absolute inset-0 bg-ink/70 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-1">
          <Camera size={size === 'lg' ? 20 : 14} className="text-gold" />
          {size === 'lg' && (
            <span className="text-[10px] text-cream font-semibold uppercase tracking-wider">Change</span>
          )}
        </div>
      )}

      {/* 3. Small Edit Camera Badge for 'lg' layout */}
      {editable && size === 'lg' && !loading && (
        <div className="absolute bottom-0 right-0 p-1.5 rounded-full bg-gold border border-charcoal text-ink shadow-md pointer-events-none">
          <Camera size={12} />
        </div>
      )}

      {/* 4. Loading state with Spinner */}
      {loading && (
        <div className="absolute inset-0 bg-ink/75 flex flex-col items-center justify-center gap-1 z-10">
          <Loader2 className="animate-spin text-gold" size={size === 'lg' ? 24 : 16} />
          {size === 'lg' && uploadProgress > 0 && (
            <span className="text-[9px] text-gold font-bold">{uploadProgress}%</span>
          )}
        </div>
      )}
    </div>
  );
}

export default Avatar;
