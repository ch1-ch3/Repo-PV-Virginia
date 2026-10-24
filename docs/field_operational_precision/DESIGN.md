---
name: Field Operational Precision
colors:
  surface: '#FFFFFF'
  surface-dim: '#d0dbea'
  surface-bright: '#f7f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#edf4ff'
  surface-container: '#e4effe'
  surface-container-high: '#dee9f8'
  surface-container-highest: '#d8e4f2'
  on-surface: '#121d27'
  on-surface-variant: '#434652'
  inverse-surface: '#27313c'
  inverse-on-surface: '#e8f2ff'
  outline: '#747783'
  outline-variant: '#c3c6d3'
  surface-tint: '#325baf'
  primary: '#002b6d'
  on-primary: '#ffffff'
  primary-container: '#0e4194'
  on-primary-container: '#93b2ff'
  inverse-primary: '#b0c6ff'
  secondary: '#6f5d00'
  on-secondary: '#ffffff'
  secondary-container: '#fdde5c'
  on-secondary-container: '#746100'
  tertiary: '#551e00'
  on-tertiary: '#ffffff'
  tertiary-container: '#792e00'
  on-tertiary-container: '#ff9969'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d9e2ff'
  primary-fixed-dim: '#b0c6ff'
  on-primary-fixed: '#001945'
  on-primary-fixed-variant: '#114295'
  secondary-fixed: '#ffe165'
  secondary-fixed-dim: '#e2c545'
  on-secondary-fixed: '#221b00'
  on-secondary-fixed-variant: '#544600'
  tertiary-fixed: '#ffdbcc'
  tertiary-fixed-dim: '#ffb694'
  on-tertiary-fixed: '#351000'
  on-tertiary-fixed-variant: '#7b2f01'
  background: '#f7f9ff'
  on-background: '#121d27'
  surface-variant: '#d8e4f2'
  primary-pressed: '#0A3373'
  accent-yellow: '#FFD302'
  background-base: '#F1F1F1'
  success: '#627D47'
  alert: '#C0392B'
  tier-economica: '#8A949E'
  tier-media: '#B09613'
  tier-premium: '#0E4194'
  border-subtle: '#E2E5E8'
typography:
  display:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 34px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 22px
  body-md-medium:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '500'
    lineHeight: 22px
  caption:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  caption-medium:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
  micro-badge:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-mobile: 0.75rem
  margin: 1.5rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
---

# Design System: Visita con Plan (La Virginia)

## Brand Identity & Aesthetic
Plataforma web de productividad en campo para vendedores de La Virginia en Argentina. Interfaz limpia, técnica, funcional y de alto contraste ("field-ready"), pensada para uso ágil en escritorio y navegadores móviles en calle.

## Color Palette
- **Primary (La Virginia Blue)**: `#0E4194` (Barras de navegación, encabezados, botones primarios, enlaces activos)
- **Primary Pressed**: `#0A3373` (Estados hover y active de botones primarios)
- **Accent Yellow (Logo & Key Badges on Blue)**: `#FFD302` (Solo sobre fondo azul `#0E4194`, marcas y CTAs destacados sobre azul; NUNCA texto amarillo sobre blanco)
- **Secondary Gold**: `#B09613` (Badges de prioridad, categoría Media, "Ofrecer primero", notificaciones destacadas)
- **Text Dark**: `#4D5864` (Texto base, iconos secundarios, subtítulos y etiquetas de formulario)
- **Background**: `#F1F1F1` (Fondo general de la aplicación)
- **Surface**: `#FFFFFF` (Tarjetas, modales, tablas, drawers, inputs)
- **Success**: `#627D47` (Badges "Ya tiene", ítems de checklist completados, deltas positivos)
- **Alert**: `#C0392B` (Errores, conflictos, indicador de precio por encima de la mediana)

## Price-Tier Colors (Consistencia absoluta en mixes y chips)
- **Económica**: `#8A949E` (Gris medio)
- **Media**: `#B09613` (Dorado)
- **Premium**: `#0E4194` (Azul La Virginia)

## Typography
- **Font Family**: Inter, Roboto, sans-serif
- **Scale**:
  - Display: 28px / 34px, SemiBold
  - Title / H1: 22px / 28px, SemiBold
  - Section / H2: 18px / 24px, SemiBold
  - Body / Subtitle: 15px / 22px, Regular & Medium
  - Caption / Small: 13px / 18px, Regular
  - Micro / Badges: 11px / 14px, Bold Uppercase

## Components & Elevation
- **Cards**: Border radius 8px o 12px, background `#FFFFFF`, border `1px solid #E2E5E8`, shadow suave `0 1px 3px rgba(0,0,0,0.06)`.
- **Buttons**:
  - Primary: Background `#0E4194`, text `#FFFFFF` (o `#FFD302` en banners azules), padding 12px 20px, font-weight 600, radius 8px.
  - Secondary / Outline: Border `1.5px solid #0E4194`, text `#0E4194`, background `#FFFFFF`.
- **Mix Stacked Bar**: Altura 12px - 18px, esquinas redondeadas, división continua de porcentajes: Económica (`#8A949E`), Media (`#B09613`), Premium (`#0E4194`).
