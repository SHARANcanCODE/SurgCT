# 🩻 SURGCT — Surgical CBCT & AI Implant Analytics

[![License](https://img.shields.io/badge/license-MIT-cyan?style=for-the-badge)](LICENSE)
[![React](https://img.shields.io/badge/React-18%20%7C%2019-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![AI Powered](https://img.shields.io/badge/Gemini_AI-Diagnostics-8B5CF6?style=for-the-badge&logo=google)](https://ai.google.dev/)

**📖 [API reference](API.md)** — full component props, imperative ref, and `/core` exports. **Documentation:**

🇬🇧 [English](lang/README-en.md) · 🇩🇪 [Deutsch](lang/README-de.md) · 🇪🇸 [Español](lang/README-es.md) · 🇭🇺 [Magyar](lang/README-hu.md)

<p align="center">
  <img src="public/surgct-icon.svg" width="120" alt="SURGCT" />
</p>

**SURGCT** is a next-generation **surgical dental CBCT / CT DICOM viewer** and **AI-powered diagnostic suite** for **React + TypeScript**. Load several CTs at once and switch between them; MPR and true-**3D** views (with render presets, colormaps and a low/medium/high quality control), **panoramic (OPG)** reconstruction along the dental arch, perpendicular **cross-sections**, **guided implant planning** with nerve/sinus/neighbour **safety clearances** and **bone quality** (Misch D1–D5), a **printable drill-guide (STL)** export, **Gemini AI Dental Assistant** for automated metrics and tooth localization, and configurable **image (PNG/JPG)** and **PDF report** exports — all in a 4-language UI (EN/DE/ES/HU). Everything runs **locally in the browser — private with zero upload**. Built on [Cornerstone3D](https://www.cornerstonejs.org/), [vtk.js](https://kitware.github.io/vtk.js/), and Google Gemini AI.

---

## 📦 Features

- 🔬 **Multi-Planar Reconstruction (MPR)**: Axial, Sagittal, Coronal with real-time synchronized crosshairs and window/leveling.
- 🧊 **3D Volume Rendering**: GPU-accelerated raycasting with dental presets (Bone, Hard Tissue, Soft Tissue, MIP).
- 🦷 **Panoramic (OPG) Arch Reconstruction**: Interactive spline arch curve with perpendicular resliced cross-sections.
- 📐 **Guided Implant Surgery**: Virtual 3D implant placement with IAN nerve canal tracing, maxillary sinus clearance alerts, Misch bone density mapping, and STL drill-guide generation.
- 🤖 **Gemini AI Radiologist & Dental Assistant**: Hardcoded clinical prompt engine providing automated dentition mapping (FDI/Universal), alveolar bone width/height metrics, cortical thickness, and surgical protocols.
- 📑 **Comprehensive Reporting**: Multi-page PDF clinical implant reports and high-resolution snapshot exports.

---

## 🚀 Quick start

```tsx
import { DicomViewer } from "./src";
import "./src/index.css";

export function Planner() {
  return (
    <div style={{ height: "100vh" }}>
      <DicomViewer lang="en" />
    </div>
  );
}
```

## 📄 License

MIT License. Designed for clinical research, education, and surgical planning demonstration.
