import { adminDb } from "./firebase-admin";

/**
 * 🔑 Enhanced API Key Rotation System
 * Manages automatic rotation, monitoring, and security of API keys
 */

export interface APIKeyInfo {
  id: string;
  name: string;
  service: "openai" | "stripe" | "firebase" | "custom";
  keyHash: string; // Hashed version for verification
  status: "active" | "rotating" | "deprecated" | "revoked";
  createdAt: string;
  lastUsed: string;
  expiresAt: string;
  rotationSchedule: "daily" | "weekly" | "monthly" | "manual";
  usageCount: number;
  maxUsage?: number;
  metadata: Record<string, any>;
}

export interface KeyUsageEvent {
  keyId: string;
  service: string;
  endpoint: string;
  timestamp: string;
  success: boolean;
  responseTime: number;
  errorCode?: string;
  ip: string;
  userAgent?: string;
}

/**
 * 🔑 API Key Manager
 */
export class APIKeyManager {
  private static instance: APIKeyManager;
  private rotationIntervals = new Map<string, NodeJS.Timeout>();

  static getInstance(): APIKeyManager {
    if (!APIKeyManager.instance) {
      APIKeyManager.instance = new APIKeyManager();
    }
    return APIKeyManager.instance;
  }

  constructor() {
    this.initializeRotationSchedules();
  }

  /**
   * 🔑 Initialize automatic rotation schedules
   */
  private async initializeRotationSchedules() {
    try {
      const snapshot = await adminDb
        .collection("apiKeys")
        .where("status", "==", "active")
        .where("rotationSchedule", "!=", "manual")
        .get();

      snapshot.docs.forEach((doc) => {
        const keyInfo = doc.data() as APIKeyInfo;
        this.scheduleRotation(keyInfo);
      });

      console.log(`🔄 Initialized ${snapshot.size} key rotation schedules`);
    } catch (error) {
      console.error("Error initializing rotation schedules:", error);
    }
  }

  /**
   * 🔑 Schedule automatic rotation for a key
   */
  private scheduleRotation(keyInfo: APIKeyInfo) {
    if (keyInfo.rotationSchedule === "manual") return;

    const intervals = {
      daily: 24 * 60 * 60 * 1000,
      weekly: 7 * 24 * 60 * 60 * 1000,
      monthly: 30 * 24 * 60 * 60 * 1000,
    };

    const interval = intervals[keyInfo.rotationSchedule];
    if (!interval) return;

    // Clear existing interval
    const existingInterval = this.rotationIntervals.get(keyInfo.id);
    if (existingInterval) {
      clearInterval(existingInterval);
    }

    // Set new interval
    const rotationInterval = setInterval(async () => {
      try {
        await this.rotateKey(keyInfo.id);
      } catch (error) {
        console.error(`Error rotating key ${keyInfo.id}:`, error);
      }
    }, interval);

    this.rotationIntervals.set(keyInfo.id, rotationInterval);
    console.log(
      `⏰ Scheduled ${keyInfo.rotationSchedule} rotation for key: ${keyInfo.name}`
    );
  }

  /**
   * 🔑 Register a new API key
   */
  async registerKey(keyData: {
    name: string;
    service: APIKeyInfo["service"];
    key: string;
    rotationSchedule?: APIKeyInfo["rotationSchedule"];
    maxUsage?: number;
    metadata?: Record<string, any>;
  }): Promise<string> {
    try {
      const keyHash = await this.hashKey(keyData.key);
      const now = new Date().toISOString();

      const keyInfo: Omit<APIKeyInfo, "id"> = {
        name: keyData.name,
        service: keyData.service,
        keyHash,
        status: "active",
        createdAt: now,
        lastUsed: now,
        expiresAt: this.calculateExpiration(
          keyData.rotationSchedule || "monthly"
        ),
        rotationSchedule: keyData.rotationSchedule || "monthly",
        usageCount: 0,
        maxUsage: keyData.maxUsage,
        metadata: keyData.metadata || {},
      };

      const docRef = await adminDb.collection("apiKeys").add(keyInfo);

      // Schedule rotation if not manual
      if (keyInfo.rotationSchedule !== "manual") {
        this.scheduleRotation({ ...keyInfo, id: docRef.id });
      }

      // Store encrypted key separately (in production, use proper key management)
      await this.storeEncryptedKey(docRef.id, keyData.key);

      console.log(
        `🔑 Registered new API key: ${keyData.name} (${keyData.service})`
      );
      return docRef.id;
    } catch (error) {
      console.error("Error registering API key:", error);
      throw error;
    }
  }

  /**
   * 🔑 Get active API key for service
   */
  async getActiveKey(
    service: string,
    keyName?: string
  ): Promise<string | null> {
    try {
      let query = adminDb
        .collection("apiKeys")
        .where("service", "==", service)
        .where("status", "==", "active")
        .where("expiresAt", ">", new Date().toISOString());

      if (keyName) {
        query = query.where("name", "==", keyName);
      }

      const snapshot = await query.limit(1).get();

      if (snapshot.empty) {
        console.warn(`⚠️ No active API key found for service: ${service}`);
        return null;
      }

      const keyDoc = snapshot.docs[0];
      const keyInfo = keyDoc.data() as APIKeyInfo;

      // Check usage limits
      if (keyInfo.maxUsage && keyInfo.usageCount >= keyInfo.maxUsage) {
        console.warn(`⚠️ API key ${keyInfo.name} has reached usage limit`);
        await this.rotateKey(keyDoc.id);
        return null;
      }

      // Update last used
      await keyDoc.ref.update({
        lastUsed: new Date().toISOString(),
        usageCount: (keyInfo.usageCount || 0) + 1,
      });

      // Retrieve encrypted key
      const encryptedKey = await this.retrieveEncryptedKey(keyDoc.id);
      return encryptedKey;
    } catch (error) {
      console.error("Error getting active key:", error);
      return null;
    }
  }

  /**
   * 🔑 Rotate API key
   */
  async rotateKey(keyId: string): Promise<boolean> {
    try {
      console.log(`🔄 Starting rotation for key: ${keyId}`);

      const keyDoc = await adminDb.collection("apiKeys").doc(keyId).get();
      if (!keyDoc.exists) {
        throw new Error("Key not found");
      }

      const keyInfo = keyDoc.data() as APIKeyInfo;

      // Mark current key as rotating
      await keyDoc.ref.update({ status: "rotating" });

      // Generate new key (this would integrate with actual service APIs)
      const newKey = await this.generateNewKey(keyInfo.service, keyInfo.name);

      if (newKey) {
        // Create new key record
        const newKeyId = await this.registerKey({
          name: `${keyInfo.name}_rotated_${Date.now()}`,
          service: keyInfo.service,
          key: newKey,
          rotationSchedule: keyInfo.rotationSchedule,
          maxUsage: keyInfo.maxUsage,
          metadata: { ...keyInfo.metadata, rotatedFrom: keyId },
        });

        // Mark old key as deprecated
        await keyDoc.ref.update({
          status: "deprecated",
          rotatedTo: newKeyId,
          rotatedAt: new Date().toISOString(),
        });

        // Log rotation
        await adminDb.collection("keyRotationLogs").add({
          oldKeyId: keyId,
          newKeyId,
          service: keyInfo.service,
          timestamp: new Date().toISOString(),
          reason: "scheduled_rotation",
          success: true,
        });

        console.log(`✅ Successfully rotated key: ${keyInfo.name}`);
        return true;
      } else {
        // Revert status if rotation failed
        await keyDoc.ref.update({ status: "active" });
        console.error(`❌ Failed to rotate key: ${keyInfo.name}`);
        return false;
      }
    } catch (error) {
      console.error("Error rotating key:", error);
      return false;
    }
  }

  /**
   * 🔑 Log API key usage
   */
  async logUsage(
    keyId: string,
    usage: Omit<KeyUsageEvent, "keyId" | "timestamp">
  ): Promise<void> {
    try {
      const usageEvent: KeyUsageEvent = {
        ...usage,
        keyId,
        timestamp: new Date().toISOString(),
      };

      await adminDb.collection("keyUsage").add(usageEvent);

      // Check for suspicious usage patterns
      await this.analyzeUsagePattern(keyId, usageEvent);
    } catch (error) {
      console.error("Error logging key usage:", error);
    }
  }

  /**
   * 🔑 Analyze usage patterns for anomalies
   */
  private async analyzeUsagePattern(keyId: string, usage: KeyUsageEvent) {
    try {
      const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

      const recentUsage = await adminDb
        .collection("keyUsage")
        .where("keyId", "==", keyId)
        .where("timestamp", ">=", hourAgo)
        .get();

      const usageCount = recentUsage.size;
      const errorRate =
        recentUsage.docs.filter((doc) => !doc.data().success).length /
        usageCount;
      const uniqueIPs = new Set(recentUsage.docs.map((doc) => doc.data().ip))
        .size;

      // Detect anomalies
      const anomalies = [];

      if (usageCount > 1000) {
        // High usage
        anomalies.push("high_usage");
      }

      if (errorRate > 0.5) {
        // High error rate
        anomalies.push("high_error_rate");
      }

      if (uniqueIPs === 1 && usageCount > 100) {
        // Single IP with high usage
        anomalies.push("single_ip_abuse");
      }

      if (anomalies.length > 0) {
        console.warn(
          `🚨 API Key anomaly detected for ${keyId}: ${anomalies.join(", ")}`
        );

        // Log security event
        await adminDb.collection("securityThreats").add({
          type: "api_key_anomaly",
          severity: "medium",
          timestamp: new Date().toISOString(),
          ip: usage.ip,
          description: `API key usage anomaly: ${anomalies.join(", ")}`,
          metadata: { keyId, anomalies, usageCount, errorRate, uniqueIPs },
        });
      }
    } catch (error) {
      console.error("Error analyzing usage pattern:", error);
    }
  }

  /**
   * 🔑 Get key statistics
   */
  async getKeyStats(
    keyId: string,
    timeWindow: "hour" | "day" | "week" = "day"
  ) {
    try {
      const windowHours =
        timeWindow === "hour" ? 1 : timeWindow === "day" ? 24 : 168;
      const since = new Date(
        Date.now() - windowHours * 60 * 60 * 1000
      ).toISOString();

      const usageSnapshot = await adminDb
        .collection("keyUsage")
        .where("keyId", "==", keyId)
        .where("timestamp", ">=", since)
        .get();

      const usage = usageSnapshot.docs.map((doc) => doc.data());

      return {
        totalRequests: usage.length,
        successRate: usage.filter((u) => u.success).length / usage.length,
        avgResponseTime:
          usage.reduce((sum, u) => sum + u.responseTime, 0) / usage.length,
        uniqueIPs: new Set(usage.map((u) => u.ip)).size,
        topEndpoints: this.getTopEndpoints(usage),
        errorBreakdown: this.getErrorBreakdown(usage.filter((u) => !u.success)),
      };
    } catch (error) {
      console.error("Error getting key stats:", error);
      return null;
    }
  }

  // Helper methods
  private async hashKey(key: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(key);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  private calculateExpiration(
    schedule: APIKeyInfo["rotationSchedule"]
  ): string {
    const intervals = {
      daily: 24 * 60 * 60 * 1000,
      weekly: 7 * 24 * 60 * 60 * 1000,
      monthly: 30 * 24 * 60 * 60 * 1000,
      manual: 365 * 24 * 60 * 60 * 1000, // 1 year for manual
    };

    return new Date(Date.now() + intervals[schedule]).toISOString();
  }

  private async storeEncryptedKey(keyId: string, key: string): Promise<void> {
    // In production, use proper encryption/key management service
    // For now, we'll use base64 encoding (NOT SECURE - use AWS KMS, HashiCorp Vault, etc.)
    const encoded = Buffer.from(key).toString("base64");

    await adminDb.collection("encryptedKeys").doc(keyId).set({
      encryptedKey: encoded,
      createdAt: new Date().toISOString(),
    });
  }

  private async retrieveEncryptedKey(keyId: string): Promise<string | null> {
    try {
      const doc = await adminDb.collection("encryptedKeys").doc(keyId).get();
      if (!doc.exists) return null;

      const data = doc.data();
      // In production, decrypt properly
      return Buffer.from(data?.encryptedKey || "", "base64").toString();
    } catch (error) {
      console.error("Error retrieving encrypted key:", error);
      return null;
    }
  }

  private async generateNewKey(
    service: string,
    keyName: string
  ): Promise<string | null> {
    // In production, integrate with actual service APIs to generate new keys
    console.log(`🔄 Generating new ${service} key for ${keyName}`);

    // Mock new key generation (replace with real implementation)
    switch (service) {
      case "openai":
        // Call OpenAI API to generate new key
        return `sk-proj-mock-${Date.now()}-${Math.random()
          .toString(36)
          .substring(7)}`;
      case "stripe":
        // Call Stripe API to generate new key
        return `sk_test_mock_${Date.now()}_${Math.random()
          .toString(36)
          .substring(7)}`;
      default:
        return `mock_${service}_${Date.now()}_${Math.random()
          .toString(36)
          .substring(7)}`;
    }
  }

  private getTopEndpoints(usage: any[], limit = 5) {
    const endpointCounts = usage.reduce((counts, u) => {
      counts[u.endpoint] = (counts[u.endpoint] || 0) + 1;
      return counts;
    }, {});

    return Object.entries(endpointCounts)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, limit)
      .map(([endpoint, count]) => ({ endpoint, count }));
  }

  private getErrorBreakdown(errors: any[]) {
    return errors.reduce((breakdown, error) => {
      const code = error.errorCode || "unknown";
      breakdown[code] = (breakdown[code] || 0) + 1;
      return breakdown;
    }, {});
  }
}

// Global API key manager instance
export const apiKeyManager = APIKeyManager.getInstance();
