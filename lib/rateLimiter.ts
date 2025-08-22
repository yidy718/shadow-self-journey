'use client';

interface RateLimitData {
  count: number;
  resetTime: number;
}

// Rate limiting: 5 insights per hour per user
const RATE_LIMIT = 5;
const RATE_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds

export const checkRateLimit = (userId: string = 'anonymous'): { allowed: boolean; remaining: number; resetTime: number } => {
  const key = `rateLimit_${userId}`;
  const now = Date.now();
  
  try {
    const stored = localStorage.getItem(key);
    let data: RateLimitData;
    
    if (stored) {
      data = JSON.parse(stored);
      
      // Reset if window has passed
      if (now > data.resetTime) {
        data = { count: 0, resetTime: now + RATE_WINDOW };
      }
    } else {
      data = { count: 0, resetTime: now + RATE_WINDOW };
    }
    
    if (data.count >= RATE_LIMIT) {
      return { 
        allowed: false, 
        remaining: 0, 
        resetTime: data.resetTime 
      };
    }
    
    // Increment count
    data.count++;
    localStorage.setItem(key, JSON.stringify(data));
    
    return { 
      allowed: true, 
      remaining: RATE_LIMIT - data.count, 
      resetTime: data.resetTime 
    };
    
  } catch (error) {
    console.error('Rate limit check failed:', error);
    // If localStorage fails, allow but with conservative limit
    return { allowed: true, remaining: 1, resetTime: now + RATE_WINDOW };
  }
};

export const getRemainingTime = (resetTime: number): string => {
  const now = Date.now();
  const remaining = Math.max(0, resetTime - now);
  
  if (remaining === 0) return '0 minutes';
  
  const minutes = Math.ceil(remaining / (60 * 1000));
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  
  const hours = Math.ceil(remaining / (60 * 60 * 1000));
  return `${hours} hour${hours !== 1 ? 's' : ''}`;
};