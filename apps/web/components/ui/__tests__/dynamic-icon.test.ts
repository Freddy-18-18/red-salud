import { describe, it, expect } from "vitest";
import {
  AVAILABLE_ICONS,
  isValidIconName,
  getIconComponent,
} from "../dynamic-icon";

describe("DynamicIcon", () => {
  describe("AVAILABLE_ICONS", () => {
    it("should contain at least 60 icons", () => {
      expect(AVAILABLE_ICONS.length).toBeGreaterThanOrEqual(60);
    });

    it("should include all key medical icons", () => {
      const medicalIcons = [
        "Stethoscope",
        "Heart",
        "Brain",
        "Eye",
        "Bone",
        "Baby",
        "Scissors",
        "Pill",
        "Syringe",
        "FlaskConical",
        "Microscope",
      ];
      for (const icon of medicalIcons) {
        expect(AVAILABLE_ICONS).toContain(icon);
      }
    });

    it("should include all specialty identity icons", () => {
      const identityIcons = [
        "Activity",
        "BrainCircuit",
        "BrainCog",
        "Dna",
        "Droplet",
        "Droplets",
        "Dumbbell",
        "Ear",
        "Fingerprint",
        "Flame",
        "Flower2",
        "Focus",
        "Footprints",
        "Gauge",
        "GitBranch",
        "Glasses",
        "Hand",
        "HardHat",
        "HeartHandshake",
        "HeartPulse",
        "Moon",
        "Puzzle",
        "Radiation",
        "Radio",
        "Ribbon",
        "Scale",
        "ScanLine",
        "Shield",
        "ShieldAlert",
        "ShieldCheck",
        "Siren",
        "Skull",
        "SmilePlus",
        "Sparkle",
        "Sparkles",
        "Target",
        "Utensils",
        "Volume2",
        "Waves",
        "Wind",
        "Zap",
      ];
      for (const icon of identityIcons) {
        expect(AVAILABLE_ICONS).toContain(icon);
      }
    });

    it("should include module catalog icons", () => {
      const catalogIcons = [
        "AlertTriangle",
        "Box",
        "Calendar",
        "CheckSquare",
        "ClipboardList",
        "CreditCard",
        "DollarSign",
        "FileText",
        "MessageSquare",
        "Package",
        "Phone",
        "Receipt",
        "Search",
        "Settings",
        "TrendingUp",
        "Video",
      ];
      for (const icon of catalogIcons) {
        expect(AVAILABLE_ICONS).toContain(icon);
      }
    });
  });

  describe("isValidIconName", () => {
    it("should return true for valid icon names", () => {
      expect(isValidIconName("Heart")).toBe(true);
      expect(isValidIconName("Brain")).toBe(true);
      expect(isValidIconName("Stethoscope")).toBe(true);
    });

    it("should return false for invalid icon names", () => {
      expect(isValidIconName("NonExistentIcon")).toBe(false);
      expect(isValidIconName("")).toBe(false);
      expect(isValidIconName("heart")).toBe(false); // case sensitive
    });

    it("should handle aliases", () => {
      expect(isValidIconName("FileTemplate")).toBe(true);
      expect(isValidIconName("HandMetal")).toBe(true);
      expect(isValidIconName("Gum")).toBe(true);
    });
  });

  describe("getIconComponent", () => {
    it("should return a component for valid names", () => {
      const component = getIconComponent("Heart");
      expect(component).not.toBeNull();
      expect(typeof component).toBe("object"); // React forward ref
    });

    it("should return null for invalid names", () => {
      expect(getIconComponent("DoesNotExist")).toBeNull();
    });
  });
});
