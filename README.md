SURGCT

Zero-install, 100% in-browser Surgical CT Diagnostic & AI Implant Analytics Suite

SURGCT is a browser-based surgical planning platform that converts
patient-specific CT/DICOM data into interactive 2D and 3D anatomical
views. It combines volumetric CT visualization, multi-planar
reconstruction, panoramic/curved planar reformation, implant planning,
nerve tracing, safety-clearance analysis, and AI-assisted diagnostics in
a single workflow.

The platform is designed around a privacy-first architecture: CT imaging
data can be processed directly on the patient's device without requiring
raw imaging data to be uploaded to a central server.

Problem

Modern surgical planning requires accurate, patient-specific anatomical
information from complex CT scans. Existing workflows can involve
fragmented, expensive, or technically complex imaging and planning
tools, making it difficult to move efficiently from raw CT data to an
actionable surgical plan.

SURGCT addresses this workflow by bringing CT visualization, anatomical
analysis, surgical planning, safety checks, and AI assistance into one
browser-based application.

Core Capabilities

DICOM / CT loading --- Load patient CT/DICOM studies directly in
the browser.

3D volumetric visualization --- Render CT volumes as interactive
3D anatomy.

MPR views --- Inspect axial, sagittal, and coronal
reconstructions.

Panoramic / CPR view --- Generate an unwrapped 2D representation
along a curved anatomical path.

Implant planning --- Position and orient patient-specific
implants virtually.

Nerve tracing --- Trace critical nerves and calculate their 3D
distance from a planned surgical path.

Safety clearance --- Provide real-time warnings when planned
implant trajectories approach critical structures.

AI-assisted diagnostics --- Analyze CT and planning information
to provide structured clinical insights.

Anatomical analysis --- Support tooth localization, bone-quality
classification, ridge-height measurements, and cortical-width
measurements.

Surgical guidance --- Generate structured planning and
drill-protocol recommendations from available planning data.

Client-side processing --- Keep raw CT pixel data on-device.

Browser-based deployment --- No specialized desktop installation
is required.

System Architecture

                    ┌──────────────────────────┐
                    │      React / Web UI      │
                    │ Surgical Planning Layer  │
                    └────────────┬─────────────┘
                                 │
                                 ▼
                    ┌──────────────────────────┐
                    │       DICOM / CT         │
                    │      Input Studies       │
                    └────────────┬─────────────┘
                                 │
                                 ▼
                    ┌──────────────────────────┐
                    │       Cornerstone3D      │
                    │ DICOM Loading & Decoding  │
                    └────────────┬─────────────┘
                                 │
                                 ▼
                    ┌──────────────────────────┐
                    │   3D Voxel / Scalar      │
                    │    Volume (HU values)     │
                    └────────────┬─────────────┘
                                 │
                    ┌────────────┴─────────────┐
                    ▼                          ▼
          ┌─────────────────┐        ┌──────────────────┐
          │    MPR / CPR    │        │  GPU Rendering   │
          │ Reconstruction  │        │ WebGL / WebGL2   │
          └─────────────────┘        └────────┬─────────┘
                                              │
                                              ▼
                                   ┌────────────────────┐
                                   │      vtk.js        │
                                   │ Volume Raymarching │
                                   └─────────┬──────────┘
                                             │
                                             ▼
                                   ┌────────────────────┐
                                   │ Transfer Functions │
                                   │ Color + Opacity    │
                                   └─────────┬──────────┘
                                             │
                                             ▼
                                   ┌────────────────────┐
                                   │ Interactive 3D CT  │
                                   └────────────────────┘

CT Data Pipeline

SURGCT treats the CT volume as volumetric data rather than first
converting the scan into a conventional polygon mesh.

1. DICOM Input

A CT study consists of a stack of DICOM slices containing the patient's
CT pixel/voxel information.

2. DICOM Processing with Cornerstone3D

Cornerstone3D handles the medical-imaging side of the pipeline:

Loading DICOM series

Decoding image data

Preparing image data for visualization

Converting the study into a usable 3D voxel representation

3. 3D Voxel / Scalar Volume

The processed CT is represented as a 3D scalar volume. Each voxel
contains a CT density value, generally represented using Hounsfield
Units (HU).

4. GPU Texture

The voxel volume is prepared as GPU-accessible texture data.

5. vtk.js + WebGL/WebGL2

vtk.js provides the volumetric visualization machinery, while
WebGL/WebGL2 executes the rendering work on the browser's GPU.

The rendering path is conceptually:

CT voxels
   ↓
GPU texture
   ↓
Rays through the volume
   ↓
Sample density values
   ↓
Apply color + opacity
   ↓
Accumulate samples
   ↓
Screen pixel

This is volumetric raymarching rather than conventional
polygon-based rendering.

GPU Volume Rendering

For each screen pixel, a ray is conceptually traced through the CT
volume. The GPU samples the volume along that ray and accumulates the
resulting density/color information to produce the visible 3D anatomy.

Transfer Functions

CT density values are not displayed directly.

SURGCT uses:

Color transfer functions to map density values to colors.

Opacity transfer functions to determine how visible different
density ranges are.

The interface supports different visual mappings such as:

Grayscale

Warm

Cool

Spectral

Inverted

This allows the same volumetric CT data to be visualized with different
density-to-color/opacity mappings.

2D Multi-Planar Reconstruction (MPR)

A CT scan is fundamentally a stack of 2D slices. SURGCT reconstructs and
displays the volume in three standard anatomical orientations:

View           Orientation

Axial      Top-to-bottom
Sagittal   Left-to-right
Coronal    Front-to-back

Together, these form Multi-Planar Reconstruction (MPR).

Why MPR?

While 3D rendering provides an overall spatial understanding of the
anatomy, MPR provides precise slice-level information for inspection and
measurement, including:

Lesion location

Bone thickness

Anatomical boundaries

Distance between structures

SURGCT implements MPR using Cornerstone3D + custom mathematics.

Panoramic View / Curved Planar Reformation

A standard CT slice is not always ideal for curved anatomical
structures.

For dental CT, an important example is the dental arch.

SURGCT supports Curved Planar Reformation (CPR):

User-defined control points
          ↓
    Cubic B-spline
          ↓
 Curved anatomical path
          ↓
 Sample CT volume along path
          ↓
   Unwrap into 2D
          ↓
   Panoramic view

A cubic B-spline is fitted through user-defined control points to
represent the anatomical curve. The CT volume is then sampled along that
curve to generate an unwrapped 2D representation.

The concept can also be generalized to other curved anatomical
structures.

Implant Planning

SURGCT provides a virtual implant-planning workflow in which clinicians
can:

Position a patient-specific implant.

Orient the implant in 3D.

Visualize the planned trajectory.

Evaluate its spatial relationship with surrounding anatomy.

Receive safety-clearance warnings before surgery.

This allows the planned procedure to be evaluated against
patient-specific anatomy before intervention.

Nerve Tracing & Safety Analysis

Critical nerves can be traced in the CT and panoramic views.

SURGCT calculates the 3D distance between the traced nerve and the
planned surgical path to identify potentially unsafe proximity.

CT Volume
    │
    ├── Nerve Trace
    │
    └── Planned Implant / Surgical Path
                  │
                  ▼
          3D Distance Calculation
                  │
                  ▼
        Safety-Clearance Check
                  │
                  ▼
       Real-Time Warning

The case study in the presentation focuses on the Inferior Alveolar
Nerve (IAN) and posterior mandibular implant planning.

AI-Assisted Diagnostics

SURGCT includes an AI-assisted diagnostic layer that analyzes CT and
surgical-planning information to provide structured clinical insights.

Anatomical Analysis

The presentation describes AI assistance for:

Tooth localization

Bone-quality classification

Ridge-height measurements

Cortical-width measurements

Surgical Guidance

The AI layer can generate structured recommendations related to:

Implant planning

Surgical drill protocols

Available planning information

The AI functions are intended as decision-support capabilities within
the planning workflow.

Privacy-First Data Architecture

SURGCT is designed so that sensitive CT imaging can remain on the
patient's device.

Data flow

DICOM Files
     ↓
Browser
     ↓
Cornerstone3D
     ↓
DICOM Decoding
     ↓
3D Voxel / Scalar Volume
     ↓
WebAssembly + Web Workers
     ↓
GPU Texture
     ↓
WebGL / WebGL2
     ↓
Visualization

The presentation describes the following privacy architecture:

Demo development can use synthetic/de-identified CT datasets.

DICOM slices are decoded and converted into calibrated voxel/scalar
data.

CT processing happens directly in the browser.

WebAssembly and Web Workers support client-side processing.

The processed volume is converted into GPU-ready texture data.

Raw CT pixel data does not need to be uploaded to a central server.

Performance Architecture

SURGCT uses browser-native technologies to keep volumetric processing
and visualization responsive.

Web Workers

Heavy processing can be moved away from the main browser thread using
Web Workers, reducing UI blocking.

WebAssembly

WebAssembly is used as part of the client-side performance layer.

GPU Acceleration

WebGL/WebGL2 allows the browser to execute volumetric rendering
workloads on the GPU.

vtk.js

vtk.js provides the 3D visualization and volumetric rendering
foundation.

Technology Stack

Layer                   Technology

Frontend                React / Web UI
Medical Imaging         Cornerstone3D
3D Visualization        vtk.js
GPU Rendering           WebGL / WebGL2
Volume Representation   3D voxel / scalar texture
MPR                     Cornerstone3D + custom mathematics
Panoramic / CPR         Cubic B-spline + custom shader/math
3D Camera               VTK Active Camera
Rendering               Volumetric raymarching
Transfer Functions      vtk.js / WebGL shaders
Performance             WebAssembly + Web Workers

3D Interaction

The 3D viewport uses the VTK Active Camera for interactive spatial
control.

Supported camera operations include:

Orbit

Zoom

Rotation

Elevation

Azimuth

View control

This allows the clinician to inspect the rendered anatomy from different
spatial perspectives.

Example Clinical Case

High-Risk Posterior Mandibular Implant --- IAN Proximity

The presentation provides a case study involving a 58-year-old male
with a missing lower-right first molar:

Tooth: #46 (FDI) / #30 (Universal)

Bone height above IAN: 8.4 mm

Ridge width: 6.8 mm

Planned implant: 4.0 × 8.0 mm

Planned safety buffer: 2.0 mm

Clinical goal: implant placement without bone grafting

The case illustrates how CT measurements, nerve proximity, implant
trajectory, and safety clearance can be evaluated together inside the
SURGCT workflow.

Business Model

The presentation proposes a hybrid SaaS and per-procedure model:

Customer       Proposed Pricing

Clinic             ₹15K / month
Hospital           ₹50K / month
Enterprise      ₹10--25L / year

The proposed value proposition is based on:

One integrated surgical workflow

Browser-based accessibility

Reduced dependence on specialized hardware/software setups

Privacy-first client-side CT processing

Scalability across multiple surgical specialties

Workflow at a Glance

                    PATIENT CT / DICOM
                           │
                           ▼
                  ┌─────────────────┐
                  │  Cornerstone3D  │
                  │ Load + Decode   │
                  └────────┬────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │ 3D Voxel Volume │
                  │   HU / Scalars  │
                  └────────┬────────┘
                           │
             ┌─────────────┼─────────────┐
             │             │             │
             ▼             ▼             ▼
           MPR           CPR          3D Volume
        Axial/Sag/     Panoramic       vtk.js
         Coronal        / Curved       + WebGL
             │             │             │
             └─────────────┼─────────────┘
                           │
                           ▼
                  Anatomical Analysis
                           │
             ┌─────────────┼─────────────┐
             ▼             ▼             ▼
        Nerve Trace   Implant Plan    AI Analysis
             │             │             │
             └─────────────┼─────────────┘
                           ▼
                 Safety-Clearance Check
                           │
                           ▼
                 Surgical Planning Output

Key Differentiators

Zero-Install

SURGCT is designed as a browser-based application rather than a
traditional desktop imaging workflow.

Volumetric Rendering

The platform works directly with 3D voxel data and GPU volume rendering
rather than relying solely on polygon meshes.

Multi-View Analysis

3D volume rendering, MPR, and panoramic/CPR views are combined so
clinicians can move between spatial context and precise slice-level
analysis.

Integrated Planning

Implant positioning, nerve tracing, measurements, and safety checks are
part of the same workflow.

Privacy-First

The architecture keeps raw CT imaging on-device during client-side
processing.

AI-Assisted Workflow

AI capabilities are integrated with anatomical and surgical planning
information rather than being presented as an isolated chatbot.

Project Status

SURGCT is presented as a Vmedithon 2026 healthcare solution
concept/prototype demonstrating a browser-based surgical CT diagnostic
and planning workflow.

The presentation focuses on the architecture, visualization pipeline,
clinical workflow, AI-assisted analysis, implant planning, and proposed
business model.

Disclaimer

SURGCT is presented as a surgical planning and clinical decision-support
concept. Outputs such as measurements, safety warnings, AI-generated
insights, and planning recommendations should be treated as assistive
information and require appropriate clinical validation and professional
judgment before use in patient care.

Team

TVK

Vmedithon 2026 --- Healthcare Presentation
