'use client';

import { useRouter, useParams } from 'next/navigation';
import { useInvoices } from '../../context/InvoiceContext';
import { format } from 'date-fns';
import { Send, MessageSquare, Mail, Copy, Check, ArrowLeft, Printer, Download } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

// Enhanced color extraction functions
const extractDominantColor = async (imageUrl: string): Promise<ColorInfo> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        // Use smaller canvas for performance
        canvas.width = 100;
        canvas.height = 100;
        
        // Draw image
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Calculate average color
        let r = 0, g = 0, b = 0;
        let count = 0;
        
        for (let i = 0; i < data.length; i += 4) {
          const pixelR = data[i];
          const pixelG = data[i + 1];
          const pixelB = data[i + 2];
          const pixelA = data[i + 3];
          
          // Skip transparent pixels
          if (pixelA < 128) continue;
          
          // Skip extremely dark or light pixels (likely background)
          const brightness = (pixelR * 299 + pixelG * 587 + pixelB * 114) / 1000;
          if (brightness < 20 || brightness > 230) continue;
          
          r += pixelR;
          g += pixelG;
          b += pixelB;
          count++;
        }
        
        if (count === 0) {
          // Fallback to average of all pixels
          for (let i = 0; i < data.length; i += 4) {
            r += data[i];
            g += data[i + 1];
            b += data[i + 2];
            count++;
          }
        }
        
        const avgR = Math.round(r / count);
        const avgG = Math.round(g / count);
        const avgB = Math.round(b / count);
        
        // Convert to HSL for better color manipulation
        const hsl = rgbToHsl(avgR, avgG, avgB);
        
        // Adjust saturation for more vibrant colors (like Spotify)
        const adjustedHsl = {
          h: hsl.h,
          s: Math.min(100, hsl.s * 1.3), // Boost saturation
          l: Math.max(20, Math.min(80, hsl.l * 0.9)) // Slightly darken for better contrast
        };
        
        // Convert back to RGB
        const finalRgb = hslToRgb(adjustedHsl.h, adjustedHsl.s, adjustedHsl.l);
        
        const hex = rgbToHex(finalRgb.r, finalRgb.g, finalRgb.b);
        const isLight = isColorLight(finalRgb.r, finalRgb.g, finalRgb.b);
        
        resolve({
          color: hex,
          isLight,
          rgb: finalRgb,
          hsl: adjustedHsl
        });
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    img.src = imageUrl;
  });
};

// Generate Spotify-like gradient
const generateSpotifyGradient = (baseColor: string): SpotifyGradient => {
  const hex = baseColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  // Convert to HSL for better manipulation
  const hsl = rgbToHsl(r, g, b);
  
  // Create gradient stops similar to Spotify
  const gradientStops = [
    // Base color
    { color: `hsl(${hsl.h}, ${hsl.s}%, ${Math.max(10, hsl.l - 15)}%)`, position: 0 },
    { color: `hsl(${hsl.h}, ${Math.min(100, hsl.s + 10)}%, ${Math.max(15, hsl.l - 5)}%)`, position: 30 },
    { color: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`, position: 50 },
    { color: `hsl(${hsl.h}, ${Math.max(40, hsl.s - 10)}%, ${Math.min(90, hsl.l + 15)}%)`, position: 70 },
    { color: `hsl(${hsl.h}, ${Math.max(30, hsl.s - 20)}%, ${Math.min(95, hsl.l + 25)}%)`, position: 100 }
  ];
  
  // Generate CSS gradient string
  const gradientString = `linear-gradient(135deg, ${gradientStops.map(stop => `${stop.color} ${stop.position}%`).join(', ')})`;
  
  // Generate darker variant for hover effects
  const darkerHsl = {
    h: hsl.h,
    s: hsl.s,
    l: Math.max(5, hsl.l - 20)
  };
  const darkerColor = `hsl(${darkerHsl.h}, ${darkerHsl.s}%, ${darkerHsl.l}%)`;
  
  return {
    gradient: gradientString,
    darkerColor,
    baseColor: baseColor,
    gradientStops
  };
};

// Utility functions
const rgbToHex = (r: number, g: number, b: number): string => {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
};

const rgbToHsl = (r: number, g: number, b: number): HSL => {
  r /= 255;
  g /= 255;
  b /= 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    
    h /= 6;
  }
  
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
};

const hslToRgb = (h: number, s: number, l: number): RGB => {
  s /= 100;
  l /= 100;
  
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;
  
  let r = 0, g = 0, b = 0;
  
  if (h >= 0 && h < 60) {
    r = c; g = x; b = 0;
  } else if (h >= 60 && h < 120) {
    r = x; g = c; b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0; g = c; b = x;
  } else if (h >= 180 && h < 240) {
    r = 0; g = x; b = c;
  } else if (h >= 240 && h < 300) {
    r = x; g = 0; b = c;
  } else if (h >= 300 && h < 360) {
    r = c; g = 0; b = x;
  }
  
  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255)
  };
};

const isColorLight = (r: number, g: number, b: number): boolean => {
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6;
};

// Types
interface RGB {
  r: number;
  g: number;
  b: number;
}

interface HSL {
  h: number;
  s: number;
  l: number;
}

interface ColorInfo {
  color: string;
  isLight: boolean;
  rgb: RGB;
  hsl?: HSL;
}

interface SpotifyGradient {
  gradient: string;
  darkerColor: string;
  baseColor: string;
  gradientStops: Array<{ color: string; position: number }>;
}

export default function InvoicePreview() {
  const router = useRouter();
  const params = useParams();
  const { getInvoice, settings, getAccount, loading } = useInvoices();
  const invoice = getInvoice(params.id as string);
  const [copied, setCopied] = useState(false);
  const [accountCopied, setAccountCopied] = useState(false);
  const [spotifyGradient, setSpotifyGradient] = useState<SpotifyGradient | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isLoadingColor, setIsLoadingColor] = useState(true);
  const headerRef = useRef<HTMLDivElement>(null);
  
  const accountDetails = invoice?.accountId ? getAccount(invoice.accountId) : null;

  // Handle account number copy
  const handleCopyAccount = () => {
    if (accountDetails?.accountNumber) {
      navigator.clipboard.writeText(accountDetails.accountNumber);
      setAccountCopied(true);
      setTimeout(() => setAccountCopied(false), 2000);
    }
  };

  // Extract and apply Spotify-like gradient from logo
  useEffect(() => {
    const applyGradientFromLogo = async () => {
      setIsLoadingColor(true);
      
      if (!settings?.businessLogo) {
        // Default Spotify green gradient as fallback
        setSpotifyGradient({
          gradient: 'linear-gradient(135deg, #1db954 0%, #1ed760 30%, #1ed760 50%, #1fdf64 70%, #1ff167 100%)',
          darkerColor: '#1db954',
          baseColor: '#1ed760',
          gradientStops: [
            { color: '#1db954', position: 0 },
            { color: '#1ed760', position: 30 },
            { color: '#1ed760', position: 50 },
            { color: '#1fdf64', position: 70 },
            { color: '#1ff167', position: 100 }
          ]
        });
        setIsLoadingColor(false);
        return;
      }

      try {
        const colorInfo = await extractDominantColor(settings.businessLogo);
        const gradient = generateSpotifyGradient(colorInfo.color);
        setSpotifyGradient(gradient);
      } catch (error) {
        console.error('Failed to extract color:', error);
        // Spotify green fallback
        setSpotifyGradient({
          gradient: 'linear-gradient(135deg, #4a1d96 0%, #7c3aed 50%, #a78bfa 100%)',
          darkerColor: '#4a1d96',
          baseColor: '#7c3aed',
          gradientStops: [
            { color: '#4a1d96', position: 0 },
            { color: '#7c3aed', position: 50 },
            { color: '#a78bfa', position: 100 }
          ]
        });
      } finally {
        setIsLoadingColor(false);
      }
    };

    applyGradientFromLogo();
  }, [settings?.businessLogo]);

  // Mouse move effect for interactive gradient
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (headerRef.current) {
        const rect = headerRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        
        headerRef.current.style.setProperty('--mouse-x', `${x}%`);
        headerRef.current.style.setProperty('--mouse-y', `${y}%`);
      }
    };

    const header = headerRef.current;
    if (header) {
      header.addEventListener('mousemove', handleMouseMove);
      return () => header.removeEventListener('mousemove', handleMouseMove);
    }
  }, []);

  // Loading state
  if (loading || isLoadingColor) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground font-medium">Loading invoice...</p>
        </div>
      </div>
    );
  }

  // Invoice not found
  if (!invoice) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8 flex items-center justify-center">
        <div className="text-center px-4">
          <p className="text-base md:text-xl text-muted-foreground mb-4 md:mb-6 font-bold">Invoice not found</p>
          <button
            onClick={() => router.push('/invoices')}
            className="px-6 py-3 md:px-8 md:py-4 bg-primary text-white rounded-xl md:rounded-2xl font-black text-sm md:text-base hover:bg-primary/90 transition-all shadow-xl shadow-primary/25"
          >
            Back to Invoices
          </button>
        </div>
      </div>
    );
  }

  // Invoice link for sharing
  const invoiceLink = typeof window !== 'undefined' 
    ? `${window.location.origin}/invoice/${invoice.id}`
    : '';

  // Handle copy link
  const handleCopyLink = () => {
    navigator.clipboard.writeText(invoiceLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Handle WhatsApp sharing
  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      `Hello ${invoice.clientName},\n\nPlease find your invoice ${invoice.invoiceNumber} for ₦${(invoice.total || 0).toLocaleString('en-NG')}.\n\nView invoice: ${invoiceLink}`
    );
    window.open(`https://wa.me/${invoice.clientPhone?.replace(/\D/g, '')}?text=${message}`, '_blank');
  };

  // Handle SMS sharing
  const handleSMS = () => {
    const message = encodeURIComponent(
      `Invoice ${invoice.invoiceNumber}: ₦${(invoice.total || 0).toLocaleString('en-NG')}. Due: ${format(new Date(invoice.dueDate), 'MMM dd, yyyy')}. View: ${invoiceLink}`
    );
    window.open(`sms:${invoice.clientPhone}?body=${message}`, '_blank');
  };

  // Handle Email sharing
  const handleEmail = () => {
    const subject = encodeURIComponent(`Invoice ${invoice.invoiceNumber} from ${settings?.businessName || 'Your Business'}`);
    const body = encodeURIComponent(
      `Dear ${invoice.clientName},\n\nPlease find attached your invoice ${invoice.invoiceNumber}.\n\nTotal Amount: ₦${(invoice.total || 0).toLocaleString('en-NG')}\nDue Date: ${format(new Date(invoice.dueDate), 'MMMM dd, yyyy')}\n\nView invoice: ${invoiceLink}\n\nThank you for your business!`
    );
    window.open(`mailto:${invoice.clientEmail}?subject=${subject}&body=${body}`, '_blank');
  };

  // Apply the extracted color to action buttons dynamically
  const getButtonStyle = () => {
    if (!spotifyGradient) return {};
    
    return {
      background: spotifyGradient.gradient,
      borderColor: spotifyGradient.baseColor,
      boxShadow: `0 4px 20px ${spotifyGradient.baseColor}40`,
    };
  };

  return (
    <div className="min-h-screen bg-background p-3 md:p-8 transition-colors overflow-x-hidden">
      {/* CSS for interactive effects */}
      <style jsx global>{`
        .invoice-header {
          --mouse-x: 50%;
          --mouse-y: 50%;
          position: relative;
          overflow: hidden;
        }
        
        .invoice-header::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(
            circle at var(--mouse-x) var(--mouse-y),
            rgba(255, 255, 255, 0.1) 0%,
            rgba(255, 255, 255, 0.05) 25%,
            transparent 50%
          );
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
        }
        
        .invoice-header:hover::before {
          opacity: 1;
        }
        
        .logo-container {
          position: relative;
          overflow: hidden;
        }
        
        .logo-container::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            45deg,
            transparent 0%,
            rgba(255, 255, 255, 0.1) 50%,
            transparent 100%
          );
          transform: translateX(-100%);
          transition: transform 0.6s ease;
        }
        
        .logo-container:hover::after {
          transform: translateX(100%);
        }
      `}</style>

      <div className="max-w-4xl mx-auto w-full">
        {/* Header Actions with dynamic colors */}
        <div className="mb-4 md:mb-10 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 md:gap-2 text-muted-foreground hover:text-primary transition-colors font-bold group text-sm md:text-base"
            style={{
              color: spotifyGradient?.baseColor || '#7c3aed',
            }}
          >
            <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 group-hover:-translate-x-1 transition-transform" />
            Back
          </button>
          <div className="flex flex-wrap gap-2 md:gap-3">
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 md:gap-2 px-3 py-2 md:px-6 md:py-3 bg-card border rounded-lg md:rounded-xl font-bold text-xs md:text-sm transition-all hover:scale-105 active:scale-95"
              style={{
                borderColor: spotifyGradient ? `${spotifyGradient.baseColor}30` : '#7c3aed30',
                backgroundColor: spotifyGradient ? `${spotifyGradient.baseColor}08` : 'rgba(124, 58, 237, 0.08)',
                color: spotifyGradient?.baseColor || '#7c3aed',
              }}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 md:w-4 md:h-4 text-green-500" />
                  <span className="text-green-500 text-xs md:text-sm">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  <span className="hidden sm:inline">Link</span>
                </>
              )}
            </button>
            <button
              onClick={handleWhatsApp}
              className="flex items-center gap-1.5 md:gap-2 px-3 py-2 md:px-6 md:py-3 rounded-lg md:rounded-xl font-black text-[10px] md:text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
              style={{
                background: spotifyGradient?.gradient || 'linear-gradient(135deg, #1db954 0%, #1ed760 50%, #1fdf64 100%)',
                color: '#ffffff',
                boxShadow: `0 4px 20px ${spotifyGradient?.baseColor || '#1db954'}40`,
              }}
            >
              <MessageSquare className="w-3.5 h-3.5 md:w-4 md:h-4" />
              <span className="hidden sm:inline">WhatsApp</span>
              <span className="sm:hidden">WA</span>
            </button>
            <button
              onClick={handleSMS}
              className="flex items-center gap-1.5 md:gap-2 px-3 py-2 md:px-6 md:py-3 rounded-lg md:rounded-xl font-black text-[10px] md:text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg"
              style={getButtonStyle()}
            >
              <Send className="w-3.5 h-3.5 md:w-4 md:h-4" />
              <span className="hidden sm:inline">Share SMS</span>
              <span className="sm:hidden">SMS</span>
            </button>
            <div className="flex gap-1.5 md:gap-2">
              <button
                onClick={handleEmail}
                className="flex items-center justify-center p-2 md:p-3 rounded-lg md:rounded-xl hover:scale-105 transition-all"
                title="Send Email"
                style={{
                  backgroundColor: spotifyGradient ? `${spotifyGradient.baseColor}08` : 'rgba(124, 58, 237, 0.08)',
                  borderColor: spotifyGradient ? `${spotifyGradient.baseColor}30` : 'rgba(124, 58, 237, 0.3)',
                  borderWidth: '1px',
                  color: spotifyGradient?.baseColor || '#7c3aed',
                }}
              >
                <Mail className="w-4 h-4 md:w-5 md:h-5" />
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center justify-center p-2 md:p-3 rounded-lg md:rounded-xl hover:scale-105 transition-all"
                title="Print"
                style={{
                  backgroundColor: spotifyGradient ? `${spotifyGradient.baseColor}08` : 'rgba(124, 58, 237, 0.08)',
                  borderColor: spotifyGradient ? `${spotifyGradient.baseColor}30` : 'rgba(124, 58, 237, 0.3)',
                  borderWidth: '1px',
                  color: spotifyGradient?.baseColor || '#7c3aed',
                }}
              >
                <Printer className="w-4 h-4 md:w-5 md:h-5" />
              </button>
              <button
                className="flex items-center justify-center p-2 md:p-3 rounded-lg md:rounded-xl hover:scale-105 transition-all"
                title="Download PDF"
                style={{
                  backgroundColor: spotifyGradient ? `${spotifyGradient.baseColor}08` : 'rgba(124, 58, 237, 0.08)',
                  borderColor: spotifyGradient ? `${spotifyGradient.baseColor}30` : 'rgba(124, 58, 237, 0.3)',
                  borderWidth: '1px',
                  color: spotifyGradient?.baseColor || '#7c3aed',
                }}
              >
                <Download className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Invoice Preview */}
        <div className="bg-card rounded-2xl md:rounded-[2.5rem] shadow-2xl border border-border overflow-hidden">
          {/* Spotify-like Header with Dynamic Gradient */}
          <div 
            ref={headerRef}
            className="invoice-header p-4 md:p-12 relative overflow-hidden rounded-t-2xl md:rounded-t-[2.5rem] group transition-all duration-700"
            style={{
              background: spotifyGradient?.gradient || 'linear-gradient(135deg, #1db954 0%, #1ed760 50%, #1fdf64 100%)',
              position: 'relative',
              color: '#ffffff',
            }}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            {/* Subtle overlay texture */}
            <div 
              className="absolute inset-0 opacity-[0.02]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
              }}
            />
            
            {/* Shimmer effect */}
            <div 
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background: `radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255,255,255,0.15) 0%, transparent 70%)`,
              }}
            />
            
            <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-start md:justify-between md:gap-8">
              {/* Left: Logo and Business Name */}
              <div className="min-w-0 flex-1 flex items-start gap-4 md:gap-6">
                {/* Animated Logo Container */}
                {settings?.businessLogo ? (
                  <div className="flex-shrink-0 logo-container">
                    <div 
                      className="rounded-2xl md:rounded-3xl p-2 md:p-3 shadow-2xl transition-all duration-500 group-hover:scale-105 group-hover:rotate-3 group-hover:shadow-3xl"
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.12)',
                        backdropFilter: 'blur(20px) saturate(180%)',
                        boxShadow: `
                          0 20px 60px rgba(0,0,0,0.4),
                          inset 0 1px 0 rgba(255,255,255,0.2),
                          inset 0 -1px 0 rgba(0,0,0,0.1)
                        `,
                        border: '1px solid rgba(255,255,255,0.15)',
                      }}
                    >
                      <img
                        src={settings.businessLogo}
                        alt={settings.businessName || 'Business Logo'}
                        className="w-20 h-20 md:w-28 md:h-28 rounded-xl md:rounded-2xl object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          console.error('Logo failed to load');
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex-shrink-0 logo-container">
                    <div 
                      className="w-20 h-20 md:w-28 md:h-28 rounded-xl md:rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-500 group-hover:scale-105 group-hover:rotate-3"
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.12)',
                        backdropFilter: 'blur(20px) saturate(180%)',
                        boxShadow: `
                          0 20px 60px rgba(0,0,0,0.4),
                          inset 0 1px 0 rgba(255,255,255,0.2),
                          inset 0 -1px 0 rgba(0,0,0,0.1)
                        `,
                        border: '1px solid rgba(255,255,255,0.15)',
                      }}
                    >
                      <span className="text-3xl md:text-5xl font-black text-white">
                        {(settings?.businessName || 'B').charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                )}
                
                {/* Business Name and Tagline */}
                <div className="min-w-0 flex-1">
                  <h1 
                    className="text-xl md:text-5xl font-black mb-1 md:mb-3 tracking-tighter leading-tight text-white drop-shadow-lg transition-all duration-500 group-hover:tracking-tight"
                  >
                    {settings?.businessName || 'Your Business'}
                  </h1>
                  <p 
                    className="font-bold uppercase tracking-[0.25em] text-[10px] md:text-sm text-white/90 opacity-90 transition-all duration-500 group-hover:opacity-100"
                  >
                    Professional Service Invoice
                  </p>
                </div>
              </div>
              
              {/* Right: Invoice Number and Amount */}
              <div className="text-right md:text-right flex-shrink-0">
                {/* Invoice Number Badge */}
                <div 
                  className="inline-block px-3 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl mb-2 md:mb-3 backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                  style={{
                    backgroundColor: 'rgba(0,0,0,0.25)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                  }}
                >
                  <h2 
                    className="text-sm md:text-xl font-black tracking-widest text-white"
                  >
                    # {invoice.invoiceNumber}
                  </h2>
                </div>
                
                {/* Total Amount */}
                <div 
                  className="text-3xl md:text-6xl font-black tracking-tighter mt-2 md:mt-4 leading-none text-white drop-shadow-2xl transition-all duration-500 group-hover:tracking-tight"
                >
                  ₦{(invoice.total || 0).toLocaleString()}
                </div>
                
                {/* Status Badge */}
                <div 
                  className="inline-flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-5 md:py-2 backdrop-blur-xl rounded-full text-[9px] md:text-[11px] font-black uppercase tracking-widest border mt-3 md:mt-5 shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    borderColor: 'rgba(255,255,255,0.4)',
                    color: '#ffffff',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                  }}
                >
                  <span 
                    className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full animate-pulse"
                    style={{
                      backgroundColor: '#ffffff',
                      boxShadow: '0 0 10px #ffffff',
                    }}
                  />
                  <span className="hidden sm:inline">Status: </span>
                  <span className="capitalize">{invoice.status}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Invoice Details Container with dynamic accents */}
          <div className="p-6 md:p-12 bg-white dark:bg-card">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 mb-8 md:mb-12">
              {/* Left Column: Client and Bank Info */}
              <div className="space-y-4 md:space-y-8">
                {/* Client Information */}
                <div>
                  <h3 className="text-[9px] md:text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2 md:mb-3">Client Information</h3>
                  <div className="space-y-0.5 md:space-y-1">
                    <p className="text-base md:text-xl font-black text-foreground truncate">
                      {invoice.clientName}
                    </p>
                    <p className="text-muted-foreground font-medium text-xs md:text-sm truncate">
                      {invoice.clientEmail}
                    </p>
                    <p className="text-muted-foreground font-medium text-xs md:text-sm">
                      {invoice.clientPhone}
                    </p>
                  </div>
                </div>

                {/* Payment Account */}
                <div>
                  <h3 className="text-[9px] md:text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-3 md:mb-4">Payment Account</h3>
                  {accountDetails ? (
                    <div 
                      className="p-4 md:p-6 rounded-xl md:rounded-2xl border space-y-3 md:space-y-4 transition-all duration-300 hover:shadow-lg"
                      style={{
                        backgroundColor: spotifyGradient ? `${spotifyGradient.baseColor}08` : 'rgba(124, 58, 237, 0.05)',
                        borderColor: spotifyGradient ? `${spotifyGradient.baseColor}20` : 'rgba(124, 58, 237, 0.2)',
                      }}
                    >
                      <div>
                        <p className="text-[9px] md:text-[10px] font-bold text-muted-foreground uppercase mb-0.5 md:mb-1">Bank Name</p>
                        <p className="font-black text-base md:text-lg truncate" style={{ color: spotifyGradient?.baseColor || '#7c3aed' }}>
                          {accountDetails.bankName}
                        </p>
                      </div>
                      {accountDetails.accountName && (
                        <div>
                          <p className="text-[9px] md:text-[10px] font-bold text-muted-foreground uppercase mb-0.5 md:mb-1">
                            Account Name
                          </p>
                          <p className="font-bold text-foreground text-sm md:text-base truncate" title={accountDetails.accountName}>
                            {accountDetails.accountName}
                          </p>
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-3 md:gap-4">
                        <div className="col-span-2 md:col-span-1">
                          <p className="text-[9px] md:text-[10px] font-bold text-muted-foreground uppercase mb-0.5 md:mb-1">
                            Account No.
                          </p>
                          <div className="flex items-center gap-2">
                            <p className="font-black text-foreground font-mono tracking-tighter text-sm md:text-lg break-all flex-1">
                              {accountDetails.accountNumber}
                            </p>
                            <button
                              onClick={handleCopyAccount}
                              className="flex-shrink-0 p-1.5 md:p-2 rounded-lg hover:bg-primary/10 transition-colors group"
                              title="Copy account number"
                              style={{
                                color: spotifyGradient?.baseColor || '#7c3aed',
                              }}
                            >
                              {accountCopied ? (
                                <Check className="w-3.5 h-3.5 md:w-4 md:h-4 text-green-500" />
                              ) : (
                                <Copy className="w-3.5 h-3.5 md:w-4 md:h-4" />
                              )}
                            </button>
                          </div>
                        </div>
                        <div>
                          <p className="text-[9px] md:text-[10px] font-bold text-muted-foreground uppercase mb-0.5 md:mb-1">
                            Type
                          </p>
                          <p className="font-bold text-foreground text-xs md:text-sm">
                            {accountDetails.accountType || 'Current'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs md:text-sm font-bold text-yellow-500 italic">
                      No bank account details configured
                    </p>
                  )}
                </div>
              </div>

              {/* Right Column: Dates and Payment Info */}
              <div className="md:text-right space-y-4 md:space-y-8">
                <div>
                  <h3 className="text-[9px] md:text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-0.5 md:mb-1">Issue Date</h3>
                  <p className="font-bold text-foreground text-sm md:text-base">
                    {format(new Date(invoice.createdAt), 'MMMM dd, yyyy')}
                  </p>
                </div>
                <div>
                  <h3 className="text-[9px] md:text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-0.5 md:mb-1">Payment Deadline</h3>
                  <p className="font-black text-base md:text-xl" style={{ color: spotifyGradient?.baseColor || '#7c3aed' }}>
                    {format(new Date(invoice.dueDate), 'MMMM dd, yyyy')}
                  </p>
                </div>
                <div className="pt-3 md:pt-4 mt-3 md:mt-4 border-t border-border inline-block md:ml-auto">
                  <p className="text-[9px] md:text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-0.5 md:mb-1">Payment Method</p>
                  <p className="font-black text-foreground text-sm md:text-base">
                    Direct Bank Transfer
                  </p>
                </div>
              </div>
            </div>

            {/* Items Table with dynamic accents */}
            <div className="mb-8 md:mb-12">
              <h3 className="text-[9px] md:text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4 md:mb-6">Service Summary</h3>
              <div className="overflow-x-auto -mx-4 md:mx-0">
                <div className="inline-block min-w-full align-middle px-4 md:px-0">
                  <table className="w-full">
                    <thead>
                        <tr 
                          className="border-b-2"
                        >
                          <th className="py-3 md:py-5 text-left text-[9px] md:text-[10px] font-black text-muted-foreground uppercase tracking-widest">Description</th>
                          <th className="py-3 md:py-5 text-center text-[9px] md:text-[10px] font-black text-muted-foreground uppercase tracking-widest w-16 md:w-24">Qty</th>
                          <th className="py-3 md:py-5 text-right text-[9px] md:text-[10px] font-black text-muted-foreground uppercase tracking-widest w-24 md:w-32">Price</th>
                          <th className="py-3 md:py-5 text-right text-[9px] md:text-[10px] font-black text-muted-foreground uppercase tracking-widest w-24 md:w-32">Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {invoice.items.map((item) => {
                        const quantity = (item.quantity != null && !isNaN(item.quantity)) ? Number(item.quantity) : 0;
                        const price = (item.price != null && !isNaN(item.price)) ? Number(item.price) : 0;
                        const itemTotal = (item.total != null && !isNaN(item.total))
                          ? Number(item.total)
                          : (quantity * price);
                        const safeTotal = (!isNaN(itemTotal) && itemTotal >= 0) ? itemTotal : 0;
                        const safePrice = (!isNaN(price) && price >= 0) ? price : 0;
                        const safeQuantity = (!isNaN(quantity) && quantity >= 0) ? quantity : 0;

                        return (
                          <tr key={item.id} className="group hover:bg-muted/5 transition-colors">
                            <td className="py-4 md:py-6 pr-2 md:pr-4">
                              <p className="font-bold text-foreground text-xs md:text-base leading-relaxed break-words">
                                {item.description || ''}
                              </p>
                            </td>
                            <td className="py-4 md:py-6 text-center font-bold text-muted-foreground text-xs md:text-base">
                              {safeQuantity}
                            </td>
                            <td className="py-4 md:py-6 text-right font-bold text-muted-foreground text-xs md:text-base">
                              ₦{safePrice.toLocaleString('en-NG')}
                            </td>
                            <td className="py-4 md:py-6 text-right font-black text-foreground text-xs md:text-base">
                              ₦{safeTotal.toLocaleString('en-NG')}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Summary Section with dynamic colors */}
            <div className="flex justify-end pt-6 md:pt-10">
              <div 
                className="w-full md:w-96 p-6 md:p-8 rounded-2xl md:rounded-3xl space-y-3 md:space-y-5 border-2 transition-all duration-300 hover:shadow-xl"
                style={{
                  backgroundColor: spotifyGradient ? `${spotifyGradient.baseColor}08` : 'rgba(124, 58, 237, 0.05)',
                  borderColor: spotifyGradient ? `${spotifyGradient.baseColor}30` : 'rgba(124, 58, 237, 0.2)',
                  boxShadow: spotifyGradient ? `0 8px 32px ${spotifyGradient.baseColor}15` : '0 8px 32px rgba(124, 58, 237, 0.15)',
                }}
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-muted-foreground uppercase tracking-[0.15em] text-[10px] md:text-xs">
                    Subtotal
                  </span>
                  <span className="font-black text-foreground text-base md:text-lg">
                    ₦{(invoice.subtotal || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-muted-foreground uppercase tracking-[0.15em] text-[10px] md:text-xs">
                    VAT {invoice.subtotal > 0 ? `(${((invoice.vat / invoice.subtotal) * 100).toFixed(1)}%)` : ''}
                  </span>
                  <span className="font-black text-foreground text-base md:text-lg">
                    ₦{(invoice.vat || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-muted-foreground uppercase tracking-[0.15em] text-[10px] md:text-xs">
                    Tax Withheld {invoice.subtotal > 0 ? `(${((invoice.withholdingTax / invoice.subtotal) * 100).toFixed(1)}%)` : ''}
                  </span>
                  <span className="font-black text-red-500 text-base md:text-lg">
                    -₦{(invoice.withholdingTax || 0).toLocaleString()}
                  </span>
                </div>
                <div 
                  className="pt-5 md:pt-7 mt-4 md:mt-6 border-t-2"
                  style={{
                    borderColor: spotifyGradient ? `${spotifyGradient.baseColor}40` : 'rgba(124, 58, 237, 0.3)',
                  }}
                >
                  <div className="flex justify-between items-end">
                    <span 
                      className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] mb-1 md:mb-2"
                      style={{
                        color: spotifyGradient?.baseColor || '#7c3aed',
                      }}
                    >
                      Grand Total Due
                    </span>
                    <span 
                      className="text-3xl md:text-5xl font-black tracking-tighter"
                    >
                      ₦{(invoice.total || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer with dynamic color */}
        <div className="mt-6 md:mt-12 text-center pb-20 md:pb-8">
          <p className="text-muted-foreground font-medium text-xs md:text-sm">
            Generated with invoiceme
          </p>
        </div>
      </div>
    </div>
  );
}