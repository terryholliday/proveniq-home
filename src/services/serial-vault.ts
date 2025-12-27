/**
 * @file services/serial-vault.ts
 * @description PROVENIQ Home - Serial Number Vault
 * 
 * Secure storage and management of serial numbers:
 * - OCR extraction from receipts/labels
 * - Theft recovery database registration
 * - Product recall notifications
 * - Warranty claim support
 */

// ============================================
// TYPES
// ============================================

export interface SerialNumber {
  id: string;
  assetId: string;
  userId: string;
  serialNumber: string;
  serialType: 'manufacturer' | 'imei' | 'vin' | 'mac_address' | 'upc' | 'custom';
  
  // Metadata
  brand?: string;
  model?: string;
  category?: string;
  
  // Verification
  verified: boolean;
  verificationMethod?: 'ocr_receipt' | 'ocr_label' | 'manual' | 'api_lookup';
  verificationConfidence?: number;
  
  // Source info
  sourceImageUrl?: string;
  extractedAt?: string;
  
  // Theft recovery
  registeredForRecovery: boolean;
  recoveryRegistrationId?: string;
  
  // Recall status
  hasActiveRecall: boolean;
  recallInfo?: RecallInfo;
  
  createdAt: string;
  updatedAt: string;
}

export interface RecallInfo {
  recallId: string;
  issueDate: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  remedyAvailable: boolean;
  remedyDescription?: string;
  manufacturerContact?: string;
}

export interface OCRExtractionResult {
  success: boolean;
  serialNumbers: Array<{
    value: string;
    type: string;
    confidence: number;
    boundingBox?: { x: number; y: number; width: number; height: number };
  }>;
  rawText?: string;
  processingTimeMs: number;
}

export interface TheftReport {
  reportId: string;
  serialNumberId: string;
  serialNumber: string;
  reportedAt: string;
  policeReportNumber?: string;
  status: 'active' | 'recovered' | 'closed';
  description?: string;
}

// ============================================
// MOCK DATA
// ============================================

const KNOWN_RECALLS: Record<string, RecallInfo> = {
  'SAMSUNG-GALAXY': {
    recallId: 'CPSC-2024-001',
    issueDate: '2024-01-15',
    description: 'Battery overheating risk',
    severity: 'high',
    remedyAvailable: true,
    remedyDescription: 'Free battery replacement',
    manufacturerContact: '1-800-SAMSUNG',
  },
};

// ============================================
// IN-MEMORY STORES
// ============================================

const serials: Map<string, SerialNumber> = new Map();
const theftReports: Map<string, TheftReport> = new Map();

// ============================================
// SERIAL VAULT SERVICE
// ============================================

class SerialVaultService {
  /**
   * Extract serial numbers from an image using OCR
   */
  async extractFromImage(imageUrl: string): Promise<OCRExtractionResult> {
    const startTime = Date.now();
    
    // Mock OCR extraction (in production: use Google Vision, AWS Textract, etc.)
    // Simulate finding serial numbers in image
    const mockSerials = [
      { value: 'SN-' + Math.random().toString(36).substr(2, 10).toUpperCase(), type: 'manufacturer', confidence: 92 },
    ];

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 100));

    return {
      success: true,
      serialNumbers: mockSerials,
      rawText: 'Mock OCR text extraction...',
      processingTimeMs: Date.now() - startTime,
    };
  }

  /**
   * Add a serial number to the vault
   */
  async addSerial(
    assetId: string,
    userId: string,
    serialNumber: string,
    options: {
      serialType?: SerialNumber['serialType'];
      brand?: string;
      model?: string;
      category?: string;
      verificationMethod?: SerialNumber['verificationMethod'];
      verificationConfidence?: number;
      sourceImageUrl?: string;
      registerForRecovery?: boolean;
    } = {}
  ): Promise<SerialNumber> {
    const id = `SER-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    // Check for recalls
    const recallInfo = this.checkForRecall(serialNumber, options.brand, options.model);

    const serial: SerialNumber = {
      id,
      assetId,
      userId,
      serialNumber: serialNumber.toUpperCase().trim(),
      serialType: options.serialType || 'manufacturer',
      brand: options.brand,
      model: options.model,
      category: options.category,
      verified: (options.verificationConfidence || 0) > 80,
      verificationMethod: options.verificationMethod,
      verificationConfidence: options.verificationConfidence,
      sourceImageUrl: options.sourceImageUrl,
      extractedAt: options.sourceImageUrl ? now : undefined,
      registeredForRecovery: options.registerForRecovery || false,
      recoveryRegistrationId: options.registerForRecovery 
        ? `REC-${Date.now().toString(36)}` 
        : undefined,
      hasActiveRecall: !!recallInfo,
      recallInfo,
      createdAt: now,
      updatedAt: now,
    };

    serials.set(id, serial);

    console.log(`[SerialVault] Added: ${serialNumber} for asset ${assetId}`);

    return serial;
  }

  /**
   * Get serial numbers for an asset
   */
  async getSerialsByAsset(assetId: string): Promise<SerialNumber[]> {
    return Array.from(serials.values()).filter(s => s.assetId === assetId);
  }

  /**
   * Get all serials for a user
   */
  async getUserSerials(userId: string): Promise<SerialNumber[]> {
    return Array.from(serials.values()).filter(s => s.userId === userId);
  }

  /**
   * Search for a serial number (for theft recovery)
   */
  async searchSerial(serialNumber: string): Promise<{
    found: boolean;
    serial?: SerialNumber;
    stolenReport?: TheftReport;
  }> {
    const normalized = serialNumber.toUpperCase().trim();
    
    // Search in vault
    const serial = Array.from(serials.values())
      .find(s => s.serialNumber === normalized);

    // Check if reported stolen
    const stolenReport = Array.from(theftReports.values())
      .find(r => r.serialNumber === normalized && r.status === 'active');

    return {
      found: !!serial || !!stolenReport,
      serial: serial || undefined,
      stolenReport: stolenReport || undefined,
    };
  }

  /**
   * Register a serial for theft recovery
   */
  async registerForRecovery(serialId: string): Promise<SerialNumber> {
    const serial = serials.get(serialId);
    if (!serial) {
      throw new Error('Serial number not found');
    }

    serial.registeredForRecovery = true;
    serial.recoveryRegistrationId = `REC-${Date.now().toString(36)}`;
    serial.updatedAt = new Date().toISOString();

    console.log(`[SerialVault] Registered for recovery: ${serial.serialNumber}`);

    return serial;
  }

  /**
   * Report an item as stolen
   */
  async reportStolen(
    serialId: string,
    policeReportNumber?: string,
    description?: string
  ): Promise<TheftReport> {
    const serial = serials.get(serialId);
    if (!serial) {
      throw new Error('Serial number not found');
    }

    const reportId = `THEFT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const report: TheftReport = {
      reportId,
      serialNumberId: serialId,
      serialNumber: serial.serialNumber,
      reportedAt: new Date().toISOString(),
      policeReportNumber,
      status: 'active',
      description,
    };

    theftReports.set(reportId, report);

    console.log(`[SerialVault] Theft reported: ${serial.serialNumber} (${reportId})`);

    return report;
  }

  /**
   * Mark stolen item as recovered
   */
  async markRecovered(reportId: string): Promise<TheftReport> {
    const report = theftReports.get(reportId);
    if (!report) {
      throw new Error('Theft report not found');
    }

    report.status = 'recovered';

    console.log(`[SerialVault] Item recovered: ${report.serialNumber}`);

    return report;
  }

  /**
   * Check for product recalls
   */
  checkForRecall(serialNumber: string, brand?: string, model?: string): RecallInfo | undefined {
    // Mock recall check (in production: query CPSC API, manufacturer APIs)
    const key = `${brand || ''}-${model || ''}`.toUpperCase();
    
    for (const [pattern, recall] of Object.entries(KNOWN_RECALLS)) {
      if (key.includes(pattern)) {
        return recall;
      }
    }

    return undefined;
  }

  /**
   * Check all user's serials for recalls
   */
  async checkUserRecalls(userId: string): Promise<Array<{ serial: SerialNumber; recall: RecallInfo }>> {
    const userSerials = await this.getUserSerials(userId);
    const results: Array<{ serial: SerialNumber; recall: RecallInfo }> = [];

    for (const serial of userSerials) {
      const recall = this.checkForRecall(serial.serialNumber, serial.brand, serial.model);
      if (recall) {
        serial.hasActiveRecall = true;
        serial.recallInfo = recall;
        results.push({ serial, recall });
      }
    }

    return results;
  }

  /**
   * Get vault statistics
   */
  async getStats(userId?: string): Promise<{
    totalSerials: number;
    verifiedSerials: number;
    registeredForRecovery: number;
    activeTheftReports: number;
    itemsWithRecalls: number;
  }> {
    let serialList = Array.from(serials.values());
    let reportList = Array.from(theftReports.values());

    if (userId) {
      serialList = serialList.filter(s => s.userId === userId);
      reportList = reportList.filter(r => {
        const serial = serials.get(r.serialNumberId);
        return serial?.userId === userId;
      });
    }

    return {
      totalSerials: serialList.length,
      verifiedSerials: serialList.filter(s => s.verified).length,
      registeredForRecovery: serialList.filter(s => s.registeredForRecovery).length,
      activeTheftReports: reportList.filter(r => r.status === 'active').length,
      itemsWithRecalls: serialList.filter(s => s.hasActiveRecall).length,
    };
  }

  /**
   * Generate warranty claim support document
   */
  async generateWarrantyClaim(serialId: string): Promise<{
    serialNumber: string;
    brand?: string;
    model?: string;
    verificationStatus: string;
    proofOfOwnership: string;
    registrationDate: string;
  }> {
    const serial = serials.get(serialId);
    if (!serial) {
      throw new Error('Serial number not found');
    }

    return {
      serialNumber: serial.serialNumber,
      brand: serial.brand,
      model: serial.model,
      verificationStatus: serial.verified ? 'VERIFIED' : 'UNVERIFIED',
      proofOfOwnership: `PROVENIQ-POO-${serial.id}`,
      registrationDate: serial.createdAt,
    };
  }
}

// Singleton
let service: SerialVaultService | null = null;

export function getSerialVaultService(): SerialVaultService {
  if (!service) {
    service = new SerialVaultService();
  }
  return service;
}
