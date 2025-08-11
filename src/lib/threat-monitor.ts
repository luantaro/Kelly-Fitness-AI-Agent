import { adminDb } from "./firebase-admin";

/**
 * 🔍 Real-time Threat Monitoring System
 * Detects, logs, and responds to security threats in real-time
 */

export interface ThreatEvent {
  id?: string;
  type:
    | "authentication_failure"
    | "rate_limit_exceeded"
    | "suspicious_request"
    | "admin_access_attempt"
    | "data_breach_attempt"
    | "bot_activity"
    | "custom";
  severity: "low" | "medium" | "high" | "critical";
  timestamp: string;
  ip: string;
  userAgent?: string;
  userId?: string;
  email?: string;
  description: string;
  metadata: Record<string, any>;
  response?: "logged" | "blocked" | "alerted" | "banned";
}

export interface ThreatRule {
  id: string;
  name: string;
  enabled: boolean;
  conditions: Array<{
    field: string;
    operator: "equals" | "contains" | "greater_than" | "less_than" | "regex";
    value: any;
  }>;
  action: "log" | "block" | "alert" | "ban_ip";
  severity: ThreatEvent["severity"];
  description: string;
}

/**
 * 🔍 Threat Detection Engine
 */
export class ThreatMonitor {
  private static instance: ThreatMonitor;
  private rules: ThreatRule[] = [];
  private alertThresholds = {
    high_frequency_requests: 100, // requests per minute
    failed_logins: 5, // failed attempts
    admin_attempts: 3, // unauthorized admin attempts
    suspicious_patterns: 10, // pattern matches per hour
  };

  static getInstance(): ThreatMonitor {
    if (!ThreatMonitor.instance) {
      ThreatMonitor.instance = new ThreatMonitor();
    }
    return ThreatMonitor.instance;
  }

  constructor() {
    this.initializeDefaultRules();
  }

  private initializeDefaultRules() {
    this.rules = [
      {
        id: "multiple_failed_logins",
        name: "Multiple Failed Login Attempts",
        enabled: true,
        conditions: [
          {
            field: "type",
            operator: "equals",
            value: "authentication_failure",
          },
          { field: "count_last_5min", operator: "greater_than", value: 5 },
        ],
        action: "ban_ip",
        severity: "high",
        description: "Detected multiple failed login attempts from same IP",
      },
      {
        id: "admin_brute_force",
        name: "Admin Panel Brute Force",
        enabled: true,
        conditions: [
          { field: "path", operator: "contains", value: "/admin" },
          { field: "response_status", operator: "equals", value: 403 },
          { field: "count_last_10min", operator: "greater_than", value: 3 },
        ],
        action: "ban_ip",
        severity: "critical",
        description: "Potential admin panel brute force attack",
      },
      {
        id: "sql_injection_attempt",
        name: "SQL Injection Attempt",
        enabled: true,
        conditions: [
          {
            field: "request_content",
            operator: "regex",
            value:
              /\b(union|select|insert|update|delete|drop)\b.*\b(from|where|table)\b/i,
          },
        ],
        action: "block",
        severity: "high",
        description: "Potential SQL injection attempt detected",
      },
      {
        id: "xss_attempt",
        name: "XSS Attempt",
        enabled: true,
        conditions: [
          {
            field: "request_content",
            operator: "regex",
            value: /<script[^>]*>.*?<\/script>|javascript:|on\w+\s*=/gi,
          },
        ],
        action: "block",
        severity: "medium",
        description: "Potential XSS attack detected",
      },
      {
        id: "suspicious_user_agent",
        name: "Suspicious User Agent",
        enabled: true,
        conditions: [
          {
            field: "user_agent",
            operator: "regex",
            value: /(sqlmap|nikto|nmap|masscan|zgrab|curl\/7\.0)/i,
          },
        ],
        action: "block",
        severity: "medium",
        description: "Request from suspicious/automated tool",
      },
    ];
  }

  /**
   * 🔍 Log threat event
   */
  async logThreat(event: Omit<ThreatEvent, "timestamp">): Promise<string> {
    try {
      const threatEvent: ThreatEvent = {
        ...event,
        timestamp: new Date().toISOString(),
      };

      // Store in Firestore
      const docRef = await adminDb
        .collection("securityThreats")
        .add(threatEvent);

      console.warn(`🚨 Threat detected: ${event.type} - ${event.description}`);

      // Check if this triggers any response rules
      await this.processRules(threatEvent);

      return docRef.id;
    } catch (error) {
      console.error("Error logging threat:", error);
      throw error;
    }
  }

  /**
   * 🔍 Process threat rules and take actions
   */
  private async processRules(event: ThreatEvent) {
    try {
      for (const rule of this.rules.filter((r) => r.enabled)) {
        if (await this.evaluateRule(rule, event)) {
          console.warn(
            `🎯 Rule triggered: ${rule.name} - Taking action: ${rule.action}`
          );
          await this.executeAction(rule, event);
        }
      }
    } catch (error) {
      console.error("Error processing threat rules:", error);
    }
  }

  /**
   * 🔍 Evaluate if a rule matches current event
   */
  private async evaluateRule(
    rule: ThreatRule,
    event: ThreatEvent
  ): Promise<boolean> {
    try {
      for (const condition of rule.conditions) {
        const fieldValue = this.getFieldValue(event, condition.field);

        switch (condition.operator) {
          case "equals":
            if (fieldValue !== condition.value) return false;
            break;
          case "contains":
            if (!String(fieldValue).includes(condition.value)) return false;
            break;
          case "greater_than":
            if (Number(fieldValue) <= condition.value) return false;
            break;
          case "less_than":
            if (Number(fieldValue) >= condition.value) return false;
            break;
          case "regex":
            if (!condition.value.test(String(fieldValue))) return false;
            break;
        }
      }
      return true;
    } catch (error) {
      console.error("Error evaluating rule:", error);
      return false;
    }
  }

  /**
   * 🔍 Get field value from event or calculate dynamic values
   */
  private getFieldValue(event: ThreatEvent, field: string): any {
    // Handle direct field access
    if (field in event) {
      return (event as any)[field];
    }

    // Handle dynamic calculations
    if (field.startsWith("count_last_")) {
      const timeWindow = field.replace("count_last_", "");
      const minutes = this.parseTimeWindow(timeWindow);
      return this.getEventCountInWindow(event.ip, event.type, minutes);
    }

    // Handle nested metadata
    if (field.includes(".")) {
      const parts = field.split(".");
      let value = event;
      for (const part of parts) {
        value = (value as any)[part];
        if (value === undefined) break;
      }
      return value;
    }

    return event.metadata[field];
  }

  /**
   * 🔍 Parse time window string to minutes
   */
  private parseTimeWindow(timeWindow: string): number {
    const match = timeWindow.match(/(\d+)(min|hour|day)/);
    if (!match) return 5; // default 5 minutes

    const [, amount, unit] = match;
    const multiplier = unit === "min" ? 1 : unit === "hour" ? 60 : 1440;
    return parseInt(amount) * multiplier;
  }

  /**
   * 🔍 Get event count in time window
   */
  private async getEventCountInWindow(
    ip: string,
    type: string,
    minutes: number
  ): Promise<number> {
    try {
      const windowStart = new Date(Date.now() - minutes * 60 * 1000);

      const snapshot = await adminDb
        .collection("securityThreats")
        .where("ip", "==", ip)
        .where("type", "==", type)
        .where("timestamp", ">=", windowStart.toISOString())
        .get();

      return snapshot.size;
    } catch (error) {
      console.error("Error getting event count:", error);
      return 0;
    }
  }

  /**
   * 🔍 Execute action based on rule
   */
  private async executeAction(rule: ThreatRule, event: ThreatEvent) {
    try {
      switch (rule.action) {
        case "log":
          console.warn(`📝 Rule ${rule.name}: Event logged`);
          break;

        case "block":
          await this.blockIP(event.ip, rule.description, 3600); // 1 hour block
          break;

        case "ban_ip":
          await this.blockIP(event.ip, rule.description, 86400); // 24 hour ban
          break;

        case "alert":
          await this.sendAlert(rule, event);
          break;
      }

      // Log action taken
      await adminDb.collection("securityActions").add({
        ruleId: rule.id,
        ruleName: rule.name,
        action: rule.action,
        eventId: event.id,
        ip: event.ip,
        timestamp: new Date().toISOString(),
        metadata: { rule, event },
      });
    } catch (error) {
      console.error("Error executing action:", error);
    }
  }

  /**
   * 🔍 Block IP address
   */
  private async blockIP(ip: string, reason: string, durationSeconds: number) {
    try {
      const expiresAt = new Date(Date.now() + durationSeconds * 1000);

      await adminDb.collection("blockedIPs").add({
        ip,
        reason,
        blockedAt: new Date().toISOString(),
        expiresAt: expiresAt.toISOString(),
        duration: durationSeconds,
        active: true,
      });

      console.warn(`🚫 IP blocked: ${ip} for ${durationSeconds}s - ${reason}`);
    } catch (error) {
      console.error("Error blocking IP:", error);
    }
  }

  /**
   * 🔍 Send security alert
   */
  private async sendAlert(rule: ThreatRule, event: ThreatEvent) {
    try {
      // Log alert (in production, you'd send to external alerting system)
      await adminDb.collection("securityAlerts").add({
        ruleId: rule.id,
        ruleName: rule.name,
        severity: rule.severity,
        event,
        timestamp: new Date().toISOString(),
        status: "sent",
      });

      console.error(`🚨 SECURITY ALERT: ${rule.name} - ${event.description}`);

      // In production: Send to Slack, email, PagerDuty, etc.
      // await this.sendToSlack(rule, event);
      // await this.sendEmail(rule, event);
    } catch (error) {
      console.error("Error sending alert:", error);
    }
  }

  /**
   * 🔍 Check if IP is blocked
   */
  async isIPBlocked(ip: string): Promise<boolean> {
    try {
      const snapshot = await adminDb
        .collection("blockedIPs")
        .where("ip", "==", ip)
        .where("active", "==", true)
        .where("expiresAt", ">", new Date().toISOString())
        .limit(1)
        .get();

      return !snapshot.empty;
    } catch (error) {
      console.error("Error checking IP block status:", error);
      return false;
    }
  }

  /**
   * 🔍 Get threat statistics
   */
  async getThreatStats(timeWindow: "hour" | "day" | "week" = "day") {
    try {
      const windowHours =
        timeWindow === "hour" ? 1 : timeWindow === "day" ? 24 : 168;
      const since = new Date(Date.now() - windowHours * 60 * 60 * 1000);

      const snapshot = await adminDb
        .collection("securityThreats")
        .where("timestamp", ">=", since.toISOString())
        .get();

      const threats = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return {
        total: threats.length,
        bySeverity: this.groupBy(threats, "severity"),
        byType: this.groupBy(threats, "type"),
        topIPs: this.getTopIPs(threats),
        timeline: this.getTimeline(threats, windowHours),
      };
    } catch (error) {
      console.error("Error getting threat stats:", error);
      return null;
    }
  }

  private groupBy(items: any[], key: string) {
    return items.reduce((groups, item) => {
      const group = item[key] || "unknown";
      groups[group] = (groups[group] || 0) + 1;
      return groups;
    }, {});
  }

  private getTopIPs(threats: any[], limit = 10) {
    const ipCounts = this.groupBy(threats, "ip");
    return Object.entries(ipCounts)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, limit)
      .map(([ip, count]) => ({ ip, count }));
  }

  private getTimeline(threats: any[], windowHours: number) {
    const buckets = Math.min(24, windowHours); // Max 24 buckets
    const bucketSize = windowHours / buckets;
    const timeline = new Array(buckets).fill(0);

    threats.forEach((threat) => {
      const age =
        (Date.now() - new Date(threat.timestamp).getTime()) / (1000 * 60 * 60);
      const bucketIndex = Math.floor(age / bucketSize);
      if (bucketIndex >= 0 && bucketIndex < buckets) {
        timeline[buckets - 1 - bucketIndex]++;
      }
    });

    return timeline;
  }
}

// Global threat monitor instance
export const threatMonitor = ThreatMonitor.getInstance();
