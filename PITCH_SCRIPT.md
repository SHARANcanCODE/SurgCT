# 🏆 SURGCT — Hackathon Pitch & Live Demo Script for Judges

> **Comprehensive Judge Presentation, Technical Breakdown, and Step-by-Step UI Choreography**

---

## ⏱️ Presentation Timeline & Structure (5–7 Minutes Total)

| Section | Duration | Key Focus |
| :--- | :--- | :--- |
| **1. Hook & Clinical Problem** | 0:00 – 0:45 | Why traditional dental CT tools fail (slow, desktop-only, cloud privacy risks). |
| **2. Architecture & Landing Experience** | 0:45 – 1:30 | 100% Client-Side WebAssembly pipeline + Zero-Latency Ingestion. |
| **3. 2D MPR & Panoramic Reslicing (CPR)** | 1:30 – 2:45 | Synchronized Axial/Sagittal/Coronal + B-Spline Dental Arch Reconstruction. |
| **4. 3D Raycasting, Shaders & Camera Movement** | 2:45 – 4:00 | WebGL GPU volume raymarching, RGB/Opacity transfer functions, VTK camera controls. |
| **5. Guided Implant Surgery & Nerve Tracing** | 4:00 – 5:00 | Real-time Euclidean safety clearance alerts & 3D-printable STL drill guides. |
| **6. Gemini AI Clinical Diagnostics** | 5:00 – 6:00 | Native radiologist prompt engine: FDI tooth mapping, Misch bone density & protocols. |
| **7. Conclusion & Q&A Readiness** | 6:00 – 7:00 | Privacy (zero upload), sub-millimeter precision, and clinical impact. |

---

## 🎤 PART 1: The Hook & The Clinical Problem (0:00 – 0:45)

### 🖥️ **What to Show on Screen:**
- Start on the **SURGCT Landing Page** (`http://localhost:3340/`).
- Show the minimalist monochrome aesthetic, pointed edges, feature tags, and pre-loaded CT dataset card.

### 🗣️ **What to Say:**
> *"Good morning/afternoon, judges. Dental implantology requires sub-millimeter surgical accuracy. A single millimeter error when drilling into the jaw can permanently sever the Inferior Alveolar Nerve or puncture the maxillary sinus.*
> 
> *Today, clinicians face a dilemma: either they pay thousands of dollars for heavy, proprietary desktop software, or they use modern cloud viewers that force them to upload gigabytes of sensitive patient CT scans over the internet — creating severe HIPAA and patient privacy vulnerabilities.*
> 
> *We built **SURGCT** — a zero-install, 100% in-browser Surgical CT Diagnostic and AI Implant Analytics Suite. Everything you will see today — from multi-gigabyte volume reconstruction to 3D GPU raymarching, panoramic reslicing, nerve safety clearance, and AI diagnostics — runs entirely client-side with **zero server uploads**."*

---

## 🎤 PART 2: Architecture & Zero-Latency Ingestion (0:45 – 1:30)

### 🖥️ **What to Show on Screen:**
1. Point to the **"Load Demo Dataset"** card on the landing page (or drag-and-drop a DICOM folder).
2. Click **"Load Demo Dataset"** $\rightarrow$ the viewer opens instantly with 0 lag.

### 🗣️ **What to Say:**
> *"Let’s dive into how we built this. When a clinician drops a DICOM series or loads a CT volume, SURGCT does not send files to a server backend.*
> 
> *We engineered a custom WebAssembly decoding pipeline utilizing **Cornerstone3D** and multi-threaded web workers. It decodes uncompressed, JPEG-Lossless, and JPEG-2000 DICOM frames directly in client memory.*
> 
> *The raw Hounsfield Units (HU) are mapped into an isotropic 3D voxel buffer in under a second, ready for GPU-accelerated multi-planar and volume rendering."*

---

## 🎤 PART 3: 2D Multi-Planar Reconstruction (MPR) & Panoramic CPR (1:30 – 2:45)

### 🖥️ **What to Show on Screen:**
1. Switch to the **2×2 Layout** using the top bar layout selector.
2. Click and drag the crosshairs in the **Axial** view $\rightarrow$ demonstrate synchronized slice updates in **Sagittal**, **Coronal**, and **3D** views simultaneously.
3. Use the Window/Level tool (Hotkey `W`) to adjust contrast.
4. Switch layout to **Panoramic (OPG2+1)**.
5. Drag the control points of the yellow dental arch curve on the axial slice $\rightarrow$ show the Panoramic unwrapped view and cross-sections updating dynamically in real time.

### 🗣️ **What to Say:**
> *"In our Multi-Planar Reconstruction (MPR) workspace, all orthogonal views — Axial, Sagittal, and Coronal — are mathematically locked in real-time. Moving crosshairs across one plane immediately re-slices the volumetric matrix across the others with linked Window/Level windowing.*
> 
> *### How We Built the Panoramic (OPG) Engine:
> Dental anatomy is curved along the jaw, so flat 2D slices alone are insufficient. We implemented a mathematical **Curved Planar Reformation (CPR)** engine:*
> 1. *We compute a continuous **cubic B-spline** through user-defined control points along the patient's dental arch.*
> 2. *Our shader evaluates the tangent and normal vectors at uniform arc-length intervals.*
> 3. *It extracts vertical voxel columns perpendicular to the curve and stitches them into an unwrapped panoramic radiograph, alongside perpendicular cross-sectional slices for measuring alveolar bone height and width."*

---

## 🎤 PART 4: 3D GPU Raycasting, Shaders & Camera Movement (2:45 – 4:00)

### 🖥️ **What to Show on Screen:**
1. Direct the judges to the **3D Viewport** (bottom-right panel or maximize 3D).
2. **Orbit & Rotate**: Click and drag across the 3D volume to smoothly rotate the skull/mandible in 3D space.
3. **Zoom Controls**: Click the **`+`**, **`−`**, and **`Reset`** buttons on the bottom control bar to demonstrate active camera zooming and orientation reset.
4. **Vertical Colormap Menu**:
   - Click the vertical **Colormap** dropdown.
   - Switch from **Grayscale** $\rightarrow$ **Warm** (red/amber heat map) $\rightarrow$ **Cool** $\rightarrow$ **Spectral** $\rightarrow$ **Inverted**.
   - Show how the bone structures, enamel, and cortical plates illuminate with different shader transfer functions.
5. **Quality**: Toggle **Low**, **Med**, and **High** sampling steps.
6. **3D Layers**: Toggle `Implant`, `Sleeve`, and `Axis` checkboxes.

### 🗣️ **What to Say:**
> *"Now, let's look at our **True-3D GPU Volume Rendering**. This is not a static 3D polygon mesh — it is live volumetric raymarching powered by **vtk.js** WebGL shaders.*
> 
> *### How We Achieved Movement & Camera Control:
> - **GPU Raymarching**: Rays are cast through the 3D scalar texture array. As each ray marches through voxel space, our custom piecewise scalar opacity and gradient opacity transfer functions accumulate color and density.*
> - **VTK Active Camera**: We hooked directly into the active VTK camera matrix. Clicking **`+`** and **`−`** dynamically scales the camera zoom factor and recalculates the near/far clipping planes, while pointer gestures modify the **Azimuth** and **Elevation** matrices with orthogonal view-up vector correction.*
> 
> *### Shader & Colormap Effects:
> - Look at our vertical colormap selector. When we select **Warm**, our shader binds an RGB color transfer function mapping low-density soft tissue to deep reds and high-density cortical bone to glowing amber-white.*
> - **Spectral** highlights subtle bone density variations, while **Grayscale** matches standard radiological density."*

---

## 🎤 PART 5: Guided Implant Surgery & Nerve Tracing (4:00 – 5:00)

### 🖥️ **What to Show on Screen:**
1. In the Panoramic View, click **`+ Implant`** $\rightarrow$ place an implant on the cross-section slice.
2. Click **`Nerve`** in the planning section $\rightarrow$ trace a few points along the mandibular canal on the panoramic radiograph.
3. Move the implant near the traced nerve $\rightarrow$ show the **Safety Clearance Warning** alert turn amber/red in real-time.
4. Show the 3D implant mesh, safety sleeve, and insertion axis appearing in the 3D viewport.

### 🗣️ **What to Say:**
> *"For surgical execution, SURGCT provides a complete virtual implant planning CAD suite:*
> 
> *1. **Virtual 3D Implant Placement**: Surgeons can select standard implant dimensions (diameter and length) and adjust bucco-lingual and mesio-distal angulation.*
> *2. **Nerve Canal Tracing**: We trace the **Inferior Alveolar Nerve (IAN)** directly on the panoramic radiograph. SURGCT calculates 3D Euclidean distance vectors between the implant body and the nerve spline in real time, alerting the surgeon if the drill path breaches the 2.0 mm clinical safety threshold.*
> *3. **STL Drill Guide Export**: The system can execute client-side manifold boolean CSG operations to export a 3D-printable surgical drill guide in STL format."*

---

## 🎤 PART 6: Gemini AI Clinical Dental Diagnostic Assistant (5:00 – 6:00)

### 🖥️ **What to Show on Screen:**
1. Open the **SURGCT AI Assistant** panel (top-right AI button).
2. Click one of the quick prompt chips: e.g., *"Assess bone quality & implant site"* or *"Trace mandibular canal & nerve proximity"*.
3. Show the response streaming in with structured FDI tooth localization, Misch bone classification (D1–D4), cortical thickness, and surgical drill protocol.

### 🗣️ **What to Say:**
> *"To accelerate and assist the clinician's diagnostic workflow, we integrated **Gemini AI Diagnostics**.*
> 
> *Rather than a generic chatbot, SURGCT extracts real-time telemetry from the loaded dataset — voxel dimensions, current Window/Level, slice coordinates, Misch bone densities, and active implant coordinates — and injects them into a clinical synthesis prompt engine.*
> 
> *The AI delivers structured radiological reports including:*
> - *Automated FDI and Universal tooth localization.*
> - *Alveolar ridge height and cortical width measurements.*
> - *Misch bone density classification (D1 to D4).*
> - *Step-by-step surgical drill sequence recommendations."*

---

## 🎤 PART 7: Conclusion & Key Takeaways (6:00 – 6:30)

### 🗣️ **What to Say:**
> *"To conclude, SURGCT delivers:*
> 1. *🏎️ **Zero-Latency In-Browser Performance**: Complete 2D MPR and 3D raymarching with 0 backend servers.*
> 2. *🔒 **100% Patient Privacy**: Zero cloud data uploads.*
> 3. *🤖 **AI-Augmented Diagnostics**: Native Gemini-powered surgical metrics and radiological reports.*
> 4. *📐 **End-to-End Surgical Workflow**: From raw DICOM ingestion to 3D-printable STL drill guides.*
> 
> *Thank you, judges. We are now open for your questions!"*

---

## 💡 Top Judge Questions & Winning Answers (Cheat Sheet)

### Q1: "How is the 3D volume rendered smoothly in the browser without lagging?"
> **Answer:** *"We use Cornerstone3D's WebGL2 volume viewport and vtk.js raycasting pipeline. The DICOM slice stack is converted into a 3D scalar texture array on the GPU. Raymarching steps are computed entirely on the client graphics card with adaptive sampling quality (Low/Medium/High)."*

### Q2: "How does the Panoramic view work if the DICOM only contains axial slices?"
> **Answer:** *"We calculate a cubic B-spline through user-defined control points along the dental arch. The CPR (Curved Planar Reformation) algorithm evaluates the spline tangent at uniform arc-length steps, extracts vertical pixel columns perpendicular to the curve, and stitches them into a 2D panoramic image."*

### Q3: "How do you guarantee patient data privacy and HIPAA compliance?"
> **Answer:** *"All DICOM parsing, memory management, and 3D rendering occur strictly inside the browser sandbox using HTML5 File APIs and WebAssembly. No patient pixel data is transmitted across the network."*

### Q4: "How accurate is the nerve safety clearance calculation?"
> **Answer:** *"We compute 3D Euclidean distances between the cylinder segment of the implant body and the piecewise 3D spline of the traced nerve canal, providing immediate visual alerts when proximity falls below the 2.0 mm clinical safety threshold."*
