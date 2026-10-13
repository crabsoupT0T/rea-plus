/**
 * Evidence-first result model.
 * Every finding includes provenance, confidence, and limitations.
 */

export interface Evidence {
  id: string;
  type: string;
  summary: string;
  details: Record<string, unknown>;
  provenance: {
    tool: string;
    provider?: string;
    location?: string;
    timestamp: string;
  };
  confidence: 'high' | 'medium' | 'low' | 'unknown';
  limitations: string[];
}

export interface AnalysisResult {
  target: string;
  targetType: string;
  findings: Evidence[];
  unresolved: string[];
  warnings: string[];
}
