// Request fingerprinting types for abuse prevention

export interface RequestFingerprint {
  ip: string;
  userAgent?: string;
  acceptLanguage?: string;
  acceptEncoding?: string;
  origin?: string;
  timestamp: number;
}

export interface FingerprintStats {
  uniqueIps: Set<string>;
  uniqueUserAgents: Set<string>;
  requestCount: number;
  firstSeen: number;
  lastSeen: number;
}
