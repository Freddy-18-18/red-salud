/**
 * PII Filter Utility
 * Detects and anonymizes sensitive information before sending to LLM.
 */

export function sanitizePII(text: string): string {
    let sanitized = text;

    // 1. Emails
    sanitized = sanitized.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "[EMAIL]");

    // 2. Phone Numbers (Simple common formats)
    // Matches: +58 412... , 0424... , +1...
    sanitized = sanitized.replace(/(\+?\d{1,3}[\s-]?\d{3,4}[\s-]?\d{4})|(\d{10,11})/g, "[TELÉFONO]");

    // 3. Document IDs (Cedula/DNI - Simple numeric sequences of 7-9 digits)
    // Using a boundary to avoid matching years or general numbers
    sanitized = sanitized.replace(/\b\d{7,9}\b/g, "[DOCUMENTO]");

    return sanitized;
}
