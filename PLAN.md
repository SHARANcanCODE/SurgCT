# SURGCT — Architectural & Clinical Specifications

## 1. Objectives & Scope

**SURGCT** is a high-performance, web-based surgical dental CBCT DICOM viewer and AI implant planning suite.

### Key Capabilities
- **DICOM / CBCT Ingestion**: Fast client-side decoding (standard DICOM series, multi-frame, Morita, Galileos exports).
- **Multi-Planar Reconstruction (MPR)**: Orthogonal axial, sagittal, coronal views with continuous crosshair synchronization.
- **3D Volumetric Raycasting**: High-throughput GPU shader raycasting with preset transfer functions (Bone, Hard Tissue, Soft Tissue, MIP).
- **Panoramic & Cross-Sectional Reslicing (CPR)**: Interactive Bezier dental arch curve with orthogonal perpendicular slices.
- **Guided Surgery & Implant Vector Engine**: 3D implant positioning with nerve safety thresholds, Misch bone quality HU mapping, and STL drill-guide generation.
- **Gemini AI Diagnostics**: Clinical AI Assistant for automatic dentition localization, alveolar ridge dimension estimation, and radiologist summaries.
- **Reporting**: Multilingual PDF clinical exports and high-resolution imaging snapshots.

---

## 2. Technical Stack

| Layer | Technology |
|---|---|
| Frontend Framework | React 18 / 19 + TypeScript |
| Build Tool | Vite + TypeScript |
| Styling | Custom Surgical Theme + Tailwind CSS |
| DICOM Decoding | `@cornerstonejs/dicom-image-loader` + `dicom-parser` |
| 2D/3D Medical Rendering | `@cornerstonejs/core`, `@cornerstonejs/tools`, `@kitware/vtk.js` |
| 3D Constructive Solid Geometry | `manifold-3d` (WASM drill-guide synthesis) |
| AI Radiology Engine | Google Gemini Generative AI API |
