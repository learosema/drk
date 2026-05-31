# Rotkreuz- und Rothalbmondbewegung – Interaktive Präsentation

Eine interaktive Kartenanwendung für Jekyll/GitHub Pages, die die Arbeit des Deutschen Roten Kreuzes, des IKRK und lokaler Verbände auf drei Ebenen (global, national, lokal) darstellt.

**Live:** https://learosema.github.io/drk/

---

## Einen neuen Ort hinzufügen

1. Neue Markdown-Datei in `_panels/` anlegen, z. B. `_panels/meinort-de.md`
2. Front Matter ausfüllen (siehe unten)
3. Panelinhalt in Markdown schreiben
4. Fertig – Kartenmarker und Panel erscheinen automatisch beim nächsten Build

### Front Matter

```yaml
---
panel_id: meinort        # eindeutige ID (Buchstaben, Ziffern, Unterstriche)
lang: de                 # Sprache: de oder en
level: global            # Kartenebene: global | national | local
lat: 48.13               # Breitengrad
lng: 11.58               # Längengrad
hq: false                # true = größerer Marker (Hauptsitz)
badge: "GLOBAL · BEISPIEL"
title: "Titel des Panels"
subtitle: "Kurze Beschreibung · Weitere Info"
---
```

Für jede Sprache wird eine eigene Datei angelegt (z. B. `meinort-de.md` und `meinort-en.md`) mit demselben `panel_id`.

### Panelinhalt

Der Panelinhalt wird in Markdown geschrieben. Abschnittsüberschriften mit `###` werden automatisch als Abschnittsbezeichnungen gestylt.

```markdown
### Abschnittsüberschrift

Normaler Fließtext als Absatz.

> Ein Zitat erscheint als hervorgehobener Zitatblock.

| Spalte 1 | Spalte 2 | Spalte 3 |
|---|---|---|
| Zeile 1  | Wert     | Wert     |
```

---

## Komponenten-Includes

Für komplexe Elemente stehen Liquid-Includes in `_includes/panel/` zur Verfügung.

### Statistik-Kacheln

```liquid
{% include panel/stats.html
  n1="18.500" l1="Mitarbeitende weltweit"
  n2=">90"    l2="Länder mit Büros"
  n3="93,5%"  l3="Spenden direkt im Feld"
  n4="160+"   l4="Jahre im Einsatz" %}
```

Bis zu vier Kacheln (`n1`/`l1` … `n4`/`l4`). Nicht belegte Slots werden ausgelassen.

### Leistungseintrag (mit Icon)

```liquid
{% include panel/service.html
  icon="shield"
  color="blue"
  name="Schutz von Zivilpersonen"
  desc="Einfordern der Regeln des Krieges gegenüber allen Konfliktparteien." %}
```

**Verfügbare Icons:** `shield` · `users` · `person` · `activity` · `grid` · `home` · `truck` · `clock` · `water` · `leaf`

**Verfügbare Farben:** `red` · `blue` · `green`

### Tags

```liquid
{% include panel/tags.html
  tags="accent:Mobile Gesundheitsstationen|blue:Notfallteams|Psychosoziale Betreuung" %}
```

Einträge werden durch `|` getrennt. Optional kann mit `klasse:Text` eine CSS-Klasse vorangestellt werden (`accent`, `blue`, `green`).

### Video-CTA

Öffnet ein Video in einem modalen Dialog. Der Dialog wird über `<dialog>` realisiert; Schließen funktioniert ohne JavaScript via `<form method="dialog">`. Das Video pausiert automatisch beim Schließen.

```liquid
{% include panel/video-cta.html
  color="blue"
  title="IKRK im Einsatz"
  body="Einblick in die Arbeit unserer Teams vor Ort."
  src="/assets/videos/icrc-einsatz.mp4"
  poster="/assets/videos/icrc-einsatz-poster.jpg" %}
```

`poster` ist optional. `src` kann relativ oder absolut sein.

### Zielgruppen-Aufruf (CTA)

```liquid
{% include panel/cta.html
  color="blue"
  title="IKRK unterstützen"
  body="93,5 % jeder Spende kommen direkt im Feld an."
  url="icrc.org/de" %}
```

**Farben:** `red` · `blue` · `green`

### Grundsätze-Raster

```liquid
{% include panel/principles.html %}
```

Gibt das Raster der 7 Grundsätze aus – Sprache wird automatisch aus dem Front Matter (`lang`) des Panels übernommen.

---

## Kartenmarker

Die `MARKERS`-Konstante im JavaScript wird automatisch aus der `_panels/`-Sammlung generiert. Pro `panel_id` erscheint genau ein Marker; Koordinaten und Level kommen aus dem Front Matter.

Die drei Übersichts-Panels, die beim Wechsel der Kartenebene automatisch geöffnet werden, sind im JavaScript von `index.html` festgelegt:

```javascript
const overviewMap = { global: 'icrc', national: 'drk_berlin', local: 'hamburg' };
```

---

## Projektstruktur

```
_panels/          Panel-Inhalte als Markdown (eine Datei pro Ort und Sprache)
_includes/
  panel/          Komponenten-Includes (service, stats, tags, cta, principles)
  icon.html       SVG-Icon-Auswahl per name-Parameter
  markers.html    Generiert MARKERS-Array aus der _panels-Sammlung
  styles.html     Alle Styles (inline eingebunden)
  translations.html  i18n-Strings für die UI
index.html        Haupt-Template
_config.yml       Jekyll-Konfiguration
```
